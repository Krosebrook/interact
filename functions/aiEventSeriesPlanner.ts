import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { series_objective, team_id, preferred_duration_weeks, session_count_preference } = await req.json();

    if (!series_objective) {
      return Response.json({ error: 'series_objective is required' }, { status: 400 });
    }

    // Fetch data for context
    const [activities, events, teams] = await Promise.all([
      base44.asServiceRole.entities.Activity.list(),
      base44.asServiceRole.entities.Event.list('-created_date', 100),
      base44.asServiceRole.entities.Team.list()
    ]);

    // Get team context
    let teamContext = '';
    if (team_id) {
      const team = teams.find(t => t.id === team_id);
      const memberships = await base44.asServiceRole.entities.TeamMembership.filter({ team_id });
      teamContext = `Team: ${team?.name}, Members: ${memberships.length}`;
    }

    // Build AI prompt for series planning
    const prompt = `Design a multi-part event series based on this objective:

OBJECTIVE: ${series_objective}
${teamContext ? `CONTEXT: ${teamContext}` : ''}
${preferred_duration_weeks ? `PREFERRED DURATION: ${preferred_duration_weeks} weeks` : ''}
${session_count_preference ? `PREFERRED SESSION COUNT: ${session_count_preference} sessions` : ''}

AVAILABLE ACTIVITIES:
${activities.slice(0, 20).map(a => `- ${a.title} (${a.activity_type}): ${a.description?.substring(0, 100)}`).join('\n')}

Design a cohesive event series with a clear learning journey. Return JSON:
{
  "series_name": "Compelling series name",
  "series_description": "2-3 paragraph overview of the series and its goals",
  "duration_weeks": number,
  "total_sessions": number,
  "cadence": "weekly|bi-weekly|monthly",
  "recommended_day": "monday|tuesday|wednesday|thursday|friday",
  "recommended_time": "morning|afternoon|evening",
  "overarching_goals": ["goal1", "goal2", "goal3"],
  "session_sequence": [
    {
      "session_number": 1,
      "title": "Session title",
      "objective": "What this session achieves",
      "suggested_activity": "Activity name from list",
      "duration_minutes": number,
      "week_number": number,
      "key_topics": ["topic1", "topic2"],
      "homework": "Optional pre/post-work"
    }
  ],
  "success_metrics": ["metric1", "metric2"],
  "materials_needed": ["material1", "material2"],
  "facilitator_guidance": "Tips for running this series",
  "participant_expectations": "What participants should expect"
}`;

    const aiSeries = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          series_name: { type: "string" },
          series_description: { type: "string" },
          duration_weeks: { type: "number" },
          total_sessions: { type: "number" },
          cadence: { type: "string" },
          recommended_day: { type: "string" },
          recommended_time: { type: "string" },
          overarching_goals: { type: "array", items: { type: "string" } },
          session_sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                session_number: { type: "number" },
                title: { type: "string" },
                objective: { type: "string" },
                suggested_activity: { type: "string" },
                duration_minutes: { type: "number" },
                week_number: { type: "number" },
                key_topics: { type: "array", items: { type: "string" } },
                homework: { type: "string" }
              }
            }
          },
          success_metrics: { type: "array", items: { type: "string" } },
          materials_needed: { type: "array", items: { type: "string" } },
          facilitator_guidance: { type: "string" },
          participant_expectations: { type: "string" }
        }
      }
    });

    // Match activities to sessions
    const enhancedSessions = aiSeries.session_sequence.map(session => {
      const activity = activities.find(a => 
        a.title.toLowerCase().includes(session.suggested_activity.toLowerCase()) ||
        session.suggested_activity.toLowerCase().includes(a.title.toLowerCase())
      );
      return {
        ...session,
        activity_id: activity?.id,
        activity_matched: !!activity,
        activity_details: activity
      };
    });

    return Response.json({
      success: true,
      series: {
        ...aiSeries,
        session_sequence: enhancedSessions
      }
    });

  } catch (error) {
    console.error('Error generating event series:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});