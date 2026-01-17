import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { template_id, series_suggestions, base_event_data } = await req.json();

    if (!series_suggestions?.follow_up_events) {
      return Response.json({ error: 'Series suggestions required' }, { status: 400 });
    }

    // Generate unique series ID
    const seriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const createdEvents = [];
    const currentDate = new Date();

    // Parse cadence to determine day increments
    const cadenceMap = {
      'weekly': 7,
      'bi-weekly': 14,
      'monthly': 30
    };
    const dayIncrement = cadenceMap[series_suggestions.series_structure?.recommended_cadence] || 7;

    // Create draft events for each session
    for (const [index, session] of series_suggestions.follow_up_events.entries()) {
      // Calculate scheduled date
      const scheduledDate = new Date(currentDate);
      scheduledDate.setDate(scheduledDate.getDate() + (dayIncrement * index));
      scheduledDate.setHours(14, 0, 0, 0); // Default to 2 PM

      // Find collaborator if skills match
      let facilitatorEmail = user.email;
      if (session.suggested_collaborators?.length > 0) {
        const skillsNeeded = session.suggested_collaborators[0].skills_needed || [];
        // Try to match with users who have these skills
        const profiles = await base44.asServiceRole.entities.UserProfile.list();
        const matchedProfile = profiles.find(p => 
          p.skills?.some(skill => skillsNeeded.includes(skill.skill_name))
        );
        if (matchedProfile) {
          facilitatorEmail = matchedProfile.user_email;
        }
      }

      const eventData = {
        activity_id: session.activity_id || base_event_data?.activity_id,
        title: session.title,
        event_type: base_event_data?.event_type || 'workshop',
        scheduled_date: scheduledDate.toISOString(),
        duration_minutes: base_event_data?.duration_minutes || 60,
        status: 'draft',
        event_format: base_event_data?.event_format || 'online',
        facilitator_email: facilitatorEmail,
        facilitator_name: user.full_name,
        is_recurring: true,
        series_id: seriesId,
        series_session_number: session.session_number,
        custom_instructions: session.objective,
        max_participants: base_event_data?.max_participants || 50,
        target_teams: base_event_data?.target_teams || []
      };

      const createdEvent = await base44.asServiceRole.entities.Event.create(eventData);
      createdEvents.push(createdEvent);
    }

    // Create EventSeries entity if it doesn't exist
    try {
      await base44.asServiceRole.entities.EventSeries.create({
        series_id: seriesId,
        series_name: base_event_data?.title || 'Event Series',
        description: series_suggestions.participant_journey,
        total_sessions: series_suggestions.series_structure?.total_sessions,
        cadence: series_suggestions.series_structure?.recommended_cadence,
        created_by: user.email,
        template_id: template_id,
        status: 'draft'
      });
    } catch (e) {
      console.log('EventSeries entity may not exist, skipping:', e.message);
    }

    return Response.json({
      success: true,
      series_id: seriesId,
      events_created: createdEvents.length,
      events: createdEvents.map(e => ({
        id: e.id,
        title: e.title,
        session_number: e.series_session_number,
        scheduled_date: e.scheduled_date
      }))
    });

  } catch (error) {
    console.error('Error creating draft event series:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});