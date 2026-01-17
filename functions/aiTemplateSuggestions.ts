import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { template_id, template_objective } = await req.json();

    if (!template_id && !template_objective) {
      return Response.json({ error: 'template_id or template_objective required' }, { status: 400 });
    }

    // Fetch template and context
    const [template, activities, events] = await Promise.all([
      template_id ? base44.asServiceRole.entities.EventTemplate.filter({ id: template_id }).then(r => r[0]) : Promise.resolve(null),
      base44.asServiceRole.entities.Activity.list(),
      base44.asServiceRole.entities.Event.list('-created_date', 100)
    ]);

    const objective = template_objective || template?.description || template?.name;

    const prompt = `Design a comprehensive event series structure based on this template/objective:

TEMPLATE/OBJECTIVE: ${objective}
${template ? `
TEMPLATE DETAILS:
- Name: ${template.name}
- Category: ${template.category}
- Duration: ${template.duration_minutes} minutes
- Format: ${template.event_format}
` : ''}

AVAILABLE ACTIVITIES:
${activities.slice(0, 20).map(a => `- ${a.title} (${a.activity_type}): ${a.description?.substring(0, 80)}`).join('\n')}

Provide event series suggestions in JSON format:
{
  "series_structure": {
    "total_sessions": number,
    "recommended_cadence": "weekly|bi-weekly|monthly",
    "duration_weeks": number
  },
  "follow_up_events": [
    {
      "session_number": number,
      "title": "event title",
      "objective": "what this session achieves",
      "suggested_activity": "activity name",
      "timing": "week X or days after previous",
      "build_on": "what from previous session this builds on"
    }
  ],
  "required_resources": [
    {
      "resource_type": "document|video|tool|materials",
      "description": "what's needed",
      "when_needed": "session number or timing",
      "source_suggestions": ["where to get it"]
    }
  ],
  "suggested_collaborators": [
    {
      "role": "facilitator|co-host|subject_expert",
      "skills_needed": ["skill1", "skill2"],
      "when_needed": "session number",
      "reason": "why needed"
    }
  ],
  "success_indicators": ["indicator1", "indicator2"],
  "participant_journey": "Describe the learning/engagement journey participants will experience"
}`;

    const aiSuggestions = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          series_structure: {
            type: "object",
            properties: {
              total_sessions: { type: "number" },
              recommended_cadence: { type: "string" },
              duration_weeks: { type: "number" }
            }
          },
          follow_up_events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                session_number: { type: "number" },
                title: { type: "string" },
                objective: { type: "string" },
                suggested_activity: { type: "string" },
                timing: { type: "string" },
                build_on: { type: "string" }
              }
            }
          },
          required_resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                resource_type: { type: "string" },
                description: { type: "string" },
                when_needed: { type: "string" },
                source_suggestions: { type: "array", items: { type: "string" } }
              }
            }
          },
          suggested_collaborators: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                skills_needed: { type: "array", items: { type: "string" } },
                when_needed: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          success_indicators: { type: "array", items: { type: "string" } },
          participant_journey: { type: "string" }
        }
      }
    });

    // Match activities to suggestions
    const enhancedEvents = aiSuggestions.follow_up_events?.map(evt => {
      const activity = activities.find(a =>
        a.title.toLowerCase().includes(evt.suggested_activity.toLowerCase()) ||
        evt.suggested_activity.toLowerCase().includes(a.title.toLowerCase())
      );
      return { ...evt, activity_id: activity?.id, activity_matched: !!activity };
    }) || [];

    return Response.json({
      success: true,
      suggestions: {
        ...aiSuggestions,
        follow_up_events: enhancedEvents
      },
      template_context: template ? {
        name: template.name,
        category: template.category
      } : null
    });

  } catch (error) {
    console.error('Error generating template suggestions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});