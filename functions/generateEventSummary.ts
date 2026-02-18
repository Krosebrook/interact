import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered post-event summary generator
 * Analyzes discussion points, feedback, and generates actionable insights
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Unauthorized: Facilitator access required' }, { status: 403 });
    }

    const { event_id, discussion_notes, feedback_highlights } = await req.json();

    if (!event_id) {
      return Response.json({ error: 'event_id required' }, { status: 400 });
    }

    // Fetch comprehensive event data
    const [event, activity, participations, feedbacks] = await Promise.all([
      base44.entities.Event.filter({ id: event_id }).then(r => r[0]),
      base44.entities.Event.filter({ id: event_id }).then(async (events) => {
        if (events[0]?.activity_id) {
          return base44.entities.Activity.filter({ id: events[0].activity_id }).then(r => r[0]);
        }
        return null;
      }),
      base44.entities.Participation.filter({ event_id }),
      base44.entities.PostEventFeedback.filter({ event_id })
    ]);

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Calculate metrics
    const attendees = participations.filter(p => p.attendance_status === 'attended');
    const avgRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, f) => sum + (f.feedback_rating || 0), 0) / feedbacks.length 
      : 0;

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are an expert event facilitator creating a comprehensive post-event summary.

EVENT DETAILS:
- Title: ${event.title}
- Type: ${event.event_type}
- Activity: ${activity?.title || 'N/A'}
- Duration: ${event.duration_minutes} minutes
- Attendees: ${attendees.length} people
- Avg Rating: ${avgRating.toFixed(1)}/5

DISCUSSION NOTES:
${discussion_notes || 'No notes provided'}

PARTICIPANT FEEDBACK:
${feedbacks.map(f => `- ${f.feedback || 'No comment'} (Rating: ${f.feedback_rating}/5)`).join('\n')}

FEEDBACK HIGHLIGHTS:
${feedback_highlights || 'None provided'}

Generate a professional event summary in JSON format:
{
  "executive_summary": "2-3 sentence overview of the event",
  "key_discussion_points": [
    "Main point 1 with context",
    "Main point 2 with context",
    "Main point 3 with context"
  ],
  "action_items": [
    {
      "action": "Specific action item",
      "owner": "suggested owner or 'Team'",
      "priority": "high|medium|low",
      "due_date_suggestion": "timeframe"
    }
  ],
  "participant_insights": {
    "engagement_level": "high|medium|low",
    "sentiment": "positive|neutral|mixed",
    "notable_contributions": ["insight 1", "insight 2"]
  },
  "recommendations_for_next_time": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ],
  "follow_up_activities": [
    "Suggested next event or activity based on discussions"
  ],
  "metrics": {
    "attendance_rate": "${((attendees.length / participations.length) * 100).toFixed(0)}%",
    "satisfaction_score": "${avgRating.toFixed(1)}/5",
    "engagement_quality": "high|medium|low"
  }
}

Rules:
- Be specific and actionable
- Highlight wins and areas for improvement
- Focus on outcomes, not just activities
- Suggest concrete next steps`;

    const responseSchema = {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        key_discussion_points: { type: "array", items: { type: "string" } },
        action_items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string" },
              owner: { type: "string" },
              priority: { type: "string" },
              due_date_suggestion: { type: "string" }
            }
          }
        },
        participant_insights: {
          type: "object",
          properties: {
            engagement_level: { type: "string" },
            sentiment: { type: "string" },
            notable_contributions: { type: "array", items: { type: "string" } }
          }
        },
        recommendations_for_next_time: { type: "array", items: { type: "string" } },
        follow_up_activities: { type: "array", items: { type: "string" } },
        metrics: {
          type: "object",
          properties: {
            attendance_rate: { type: "string" },
            satisfaction_score: { type: "string" },
            engagement_quality: { type: "string" }
          }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role,
      functionName: 'generateEventSummary',
      prompt,
      responseSchema,
      agentName: 'EventFacilitator'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    return Response.json({
      success: true,
      summary: aiResult.data,
      event_details: {
        title: event.title,
        date: event.scheduled_date,
        attendees: attendees.length
      }
    });

  } catch (error) {
    console.error('Event summary error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});