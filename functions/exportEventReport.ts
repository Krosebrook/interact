import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await req.json();

    // Fetch event data
    const events = await base44.asServiceRole.entities.Event.filter({ id: eventId });
    if (!events.length) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = events[0];

    // Fetch related data
    const activity = await base44.asServiceRole.entities.Activity.filter({ id: event.activity_id });
    const participations = await base44.asServiceRole.entities.Participation.filter({ event_id: eventId });
    const eventMedia = await base44.asServiceRole.entities.EventMedia.filter({ event_id: eventId });

    // Calculate metrics
    const totalParticipants = participations.length;
    const attended = participations.filter(p => p.attended).length;
    const attendanceRate = totalParticipants > 0 ? ((attended / totalParticipants) * 100).toFixed(1) : 0;
    
    const rsvpYes = participations.filter(p => p.rsvp_status === 'yes').length;
    const rsvpConversion = rsvpYes > 0 ? ((attended / rsvpYes) * 100).toFixed(1) : 0;
    
    const withFeedback = participations.filter(p => p.engagement_score);
    const avgEngagement = withFeedback.length > 0
      ? (withFeedback.reduce((sum, p) => sum + p.engagement_score, 0) / withFeedback.length).toFixed(1)
      : 'N/A';

    // Sentiment analysis of feedback
    const positiveFeedback = participations.filter(p => p.engagement_score >= 4).length;
    const neutralFeedback = participations.filter(p => p.engagement_score === 3).length;
    const negativeFeedback = participations.filter(p => p.engagement_score <= 2 && p.engagement_score > 0).length;

    // Top feedback quotes
    const topFeedback = participations
      .filter(p => p.feedback && p.engagement_score >= 4)
      .slice(0, 5)
      .map(p => ({ name: p.participant_name, feedback: p.feedback, score: p.engagement_score }));

    // Build comprehensive report
    const report = {
      event: {
        title: event.title,
        date: new Date(event.scheduled_date).toLocaleString(),
        activity_type: activity[0]?.type || 'N/A',
        duration: event.duration_minutes + ' minutes',
        status: event.status
      },
      participation: {
        total_participants: totalParticipants,
        attended: attended,
        attendance_rate: attendanceRate + '%',
        rsvp_yes: rsvpYes,
        rsvp_conversion: rsvpConversion + '%',
        no_shows: rsvpYes - attended
      },
      engagement: {
        average_score: avgEngagement + '/5.0',
        feedback_received: withFeedback.length,
        feedback_rate: totalParticipants > 0 ? ((withFeedback.length / totalParticipants) * 100).toFixed(1) + '%' : '0%',
        sentiment: {
          positive: positiveFeedback,
          neutral: neutralFeedback,
          negative: negativeFeedback
        }
      },
      media: {
        photos: eventMedia.filter(m => m.media_type === 'photo').length,
        videos: eventMedia.filter(m => m.media_type === 'video').length,
        total_uploads: eventMedia.length
      },
      top_feedback: topFeedback,
      participant_details: participations.map(p => ({
        name: p.participant_name,
        email: p.participant_email,
        rsvp: p.rsvp_status,
        attended: p.attended,
        engagement_score: p.engagement_score || 'N/A',
        feedback: p.feedback || 'No feedback'
      }))
    };

    return Response.json({
      success: true,
      report: report,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});