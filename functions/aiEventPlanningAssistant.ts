import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_goal, team_id, preferred_duration, preferred_format } = await req.json();

    if (!event_goal) {
      return Response.json({ error: 'event_goal is required' }, { status: 400 });
    }

    // Fetch historical event data
    const events = await base44.asServiceRole.entities.Event.filter({ status: 'completed' }, '-created_date', 50);
    const participations = await base44.asServiceRole.entities.Participation.list('-created_date', 500);
    const activities = await base44.asServiceRole.entities.Activity.list();
    const users = await base44.asServiceRole.entities.User.list();
    
    // Get team members if team specified
    let teamMembers = [];
    if (team_id) {
      const memberships = await base44.asServiceRole.entities.TeamMembership.filter({ team_id });
      teamMembers = memberships.map(m => m.user_email);
    }

    // Calculate engagement metrics
    const eventMetrics = events.map(event => {
      const eventParticipations = participations.filter(p => p.event_id === event.id);
      const attended = eventParticipations.filter(p => p.attendance_status === 'attended').length;
      const avgRating = eventParticipations.filter(p => p.feedback_rating).length > 0
        ? eventParticipations.reduce((sum, p) => sum + (p.feedback_rating || 0), 0) / eventParticipations.filter(p => p.feedback_rating).length
        : 0;

      return {
        ...event,
        attendance_rate: attended / (eventParticipations.length || 1),
        avg_rating: avgRating,
        day_of_week: new Date(event.scheduled_date).toLocaleDateString('en-US', { weekday: 'long' }),
        hour: new Date(event.scheduled_date).getHours()
      };
    });

    // Build comprehensive prompt
    const prompt = `You are an expert event planning assistant helping with employee engagement.

EVENT GOAL: ${event_goal}

CONTEXT:
- Preferred Duration: ${preferred_duration || 'not specified'}
- Preferred Format: ${preferred_format || 'not specified'}
- Team ID: ${team_id || 'company-wide'}
- Available Team Members: ${teamMembers.length || 'all employees'}

HISTORICAL DATA:
- Total completed events: ${events.length}
- Available activities: ${activities.map(a => `${a.title} (${a.type})`).join(', ')}
- Best performing times: ${eventMetrics.slice(0, 5).map(e => `${e.day_of_week} ${e.hour}:00 (rating: ${e.avg_rating.toFixed(1)})`).join(', ')}

TASK:
Based on the event goal and historical data, provide comprehensive event planning suggestions.

Return ONLY valid JSON with this exact structure:
{
  "recommended_activities": [
    {
      "activity_title": "string",
      "activity_type": "string",
      "reason": "why this fits the goal",
      "estimated_duration": number (minutes)
    }
  ],
  "optimal_times": [
    {
      "day_of_week": "string",
      "time_of_day": "morning|midday|afternoon",
      "specific_hour": number (24h format),
      "reason": "based on historical data"
    }
  ],
  "suggested_collaborators": [
    {
      "role_type": "facilitator|participant|expert",
      "skills_needed": ["skill1", "skill2"],
      "reason": "why this role is needed"
    }
  ],
  "event_description": "A compelling, professional event description (2-3 paragraphs)",
  "invitation_message": "A warm, engaging invitation message to send to participants",
  "success_tips": ["tip1", "tip2", "tip3"],
  "estimated_participants": number,
  "recommended_duration": number (minutes),
  "recommended_format": "online|offline|hybrid"
}`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                activity_title: { type: "string" },
                activity_type: { type: "string" },
                reason: { type: "string" },
                estimated_duration: { type: "number" }
              }
            }
          },
          optimal_times: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day_of_week: { type: "string" },
                time_of_day: { type: "string" },
                specific_hour: { type: "number" },
                reason: { type: "string" }
              }
            }
          },
          suggested_collaborators: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role_type: { type: "string" },
                skills_needed: { type: "array", items: { type: "string" } },
                reason: { type: "string" }
              }
            }
          },
          event_description: { type: "string" },
          invitation_message: { type: "string" },
          success_tips: { type: "array", items: { type: "string" } },
          estimated_participants: { type: "number" },
          recommended_duration: { type: "number" },
          recommended_format: { type: "string" }
        }
      }
    });

    // Match activities to actual activity IDs
    const matchedActivities = aiResponse.recommended_activities.map(rec => {
      const match = activities.find(a => 
        a.title.toLowerCase().includes(rec.activity_title.toLowerCase()) ||
        a.type === rec.activity_type
      );
      return {
        ...rec,
        activity_id: match?.id,
        activity_object: match
      };
    });

    return Response.json({
      success: true,
      suggestions: {
        ...aiResponse,
        recommended_activities: matchedActivities
      },
      metadata: {
        events_analyzed: events.length,
        activities_available: activities.length,
        team_size: teamMembers.length
      }
    });

  } catch (error) {
    console.error('Error in AI event planning:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate suggestions' 
    }, { status: 500 });
  }
});