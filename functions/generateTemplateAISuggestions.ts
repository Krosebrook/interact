import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { template_id, context = {} } = await req.json();

    if (!template_id) {
      return Response.json({ error: 'template_id is required' }, { status: 400 });
    }

    // Get template details
    const template = await base44.asServiceRole.entities.EventTemplate.get(template_id);
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Get activity details
    const activity = await base44.asServiceRole.entities.Activity.get(template.activity_id);

    // Get recent successful events using this template
    const recentEvents = await base44.asServiceRole.entities.Event.filter({
      activity_id: template.activity_id,
      status: 'completed'
    }, '-created_date', 20);

    // Get participations for engagement data
    const eventIds = recentEvents.map(e => e.id);
    const participations = eventIds.length > 0 
      ? await base44.asServiceRole.entities.Participation.list('-created_date', 500)
      : [];

    // Calculate average metrics
    const metrics = recentEvents.map(event => {
      const eventParticipations = participations.filter(p => p.event_id === event.id);
      const attended = eventParticipations.filter(p => p.attendance_status === 'attended').length;
      const ratings = eventParticipations.filter(p => p.feedback_rating).map(p => p.feedback_rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

      return {
        duration: event.duration_minutes,
        attendance: attended,
        avgRating,
        maxParticipants: event.max_participants
      };
    });

    const avgDuration = metrics.length > 0 
      ? Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length)
      : template.duration_minutes;

    const avgAttendance = metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.attendance, 0) / metrics.length)
      : 15;

    const avgRating = metrics.length > 0
      ? (metrics.reduce((sum, m) => sum + m.avgRating, 0) / metrics.length).toFixed(1)
      : 0;

    // Build AI prompt
    const prompt = `You are an expert event planner analyzing historical data to suggest optimal event parameters.

Template: ${template.name}
Activity: ${activity?.title || 'Unknown'}
Activity Type: ${activity?.type || template.event_type}
Description: ${template.description || activity?.description || 'No description'}

Historical Performance (last ${recentEvents.length} events):
- Average duration: ${avgDuration} minutes
- Average attendance: ${avgAttendance} participants
- Average rating: ${avgRating}/5

Context from user:
${JSON.stringify(context, null, 2)}

Based on this data, suggest optimal event parameters. Provide:
1. Recommended duration (in minutes)
2. Recommended max participants
3. Best time of day (morning/midday/afternoon/evening)
4. Best days of week (array of day names)
5. Key tips for success (array of 3-5 brief tips)
6. Suggested facilitator characteristics

Return ONLY valid JSON matching this schema:
{
  "duration_minutes": number,
  "max_participants": number,
  "best_time_of_day": "morning" | "midday" | "afternoon" | "evening",
  "best_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "tips": ["tip1", "tip2", "tip3"],
  "facilitator_notes": "Brief guidance for facilitator",
  "reasoning": "Brief explanation of recommendations"
}`;

    // Call AI
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          duration_minutes: { type: "number" },
          max_participants: { type: "number" },
          best_time_of_day: { type: "string" },
          best_days: { type: "array", items: { type: "string" } },
          tips: { type: "array", items: { type: "string" } },
          facilitator_notes: { type: "string" },
          reasoning: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: aiResponse,
      historical_data: {
        events_analyzed: recentEvents.length,
        avg_duration: avgDuration,
        avg_attendance: avgAttendance,
        avg_rating: parseFloat(avgRating)
      }
    });

  } catch (error) {
    console.error('Error generating template suggestions:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate suggestions' 
    }, { status: 500 });
  }
});