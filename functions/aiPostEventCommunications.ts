import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event_id } = await req.json();

    if (!event_id) {
      return Response.json({ error: 'event_id required' }, { status: 400 });
    }

    // Fetch event details
    const [event, activity, participations] = await Promise.all([
      base44.asServiceRole.entities.Event.filter({ id: event_id }).then(r => r[0]),
      base44.asServiceRole.entities.Activity.list(),
      base44.asServiceRole.entities.Participation.filter({ event_id })
    ]);

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventActivity = activity.find(a => a.id === event.activity_id);
    const attendees = participations.filter(p => p.attendance_status === 'attended');
    
    // Calculate event metrics
    const feedbackRatings = participations.filter(p => p.feedback_rating).map(p => p.feedback_rating);
    const avgRating = feedbackRatings.length > 0 ? (feedbackRatings.reduce((a, b) => a + b, 0) / feedbackRatings.length).toFixed(1) : 'N/A';

    // Build AI prompt
    const prompt = `Generate personalized post-event communications for this completed event:

EVENT DETAILS:
- Title: ${event.title}
- Type: ${event.event_type}
- Activity: ${eventActivity?.title || 'N/A'}
- Duration: ${event.duration_minutes} minutes
- Format: ${event.event_format}
- Attendees: ${attendees.length}
- Average Rating: ${avgRating}/5

CUSTOM INSTRUCTIONS:
${event.custom_instructions || 'None'}

Generate comprehensive follow-up communications in JSON format:
{
  "summary_message": {
    "subject": "Email subject line",
    "body": "HTML-formatted event summary (2-3 paragraphs)",
    "highlights": ["highlight1", "highlight2"],
    "key_takeaways": ["takeaway1", "takeaway2"]
  },
  "thank_you_message": {
    "subject": "Thank you subject",
    "body": "Warm appreciation message"
  },
  "action_items": [
    {
      "item": "action to take",
      "owner": "who should do it",
      "deadline": "suggested timeframe",
      "priority": "high|medium|low"
    }
  ],
  "feedback_survey": {
    "subject": "Feedback request subject",
    "intro": "Survey introduction",
    "questions": [
      {
        "question": "survey question",
        "type": "rating|text|multiple_choice"
      }
    ]
  },
  "resource_recommendations": [
    {
      "title": "resource title",
      "description": "what it covers",
      "type": "article|video|tool|document",
      "relevance": "why it's helpful"
    }
  ],
  "next_steps": ["step1", "step2"],
  "related_events": ["suggested follow-up event or topic"]
}`;

    const aiCommunications = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary_message: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" },
              highlights: { type: "array", items: { type: "string" } },
              key_takeaways: { type: "array", items: { type: "string" } }
            }
          },
          thank_you_message: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          },
          action_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                owner: { type: "string" },
                deadline: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          feedback_survey: {
            type: "object",
            properties: {
              subject: { type: "string" },
              intro: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    type: { type: "string" }
                  }
                }
              }
            }
          },
          resource_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                type: { type: "string" },
                relevance: { type: "string" }
              }
            }
          },
          next_steps: { type: "array", items: { type: "string" } },
          related_events: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Send summary email to attendees
    const attendeeEmails = attendees.map(p => p.user_email);
    
    for (const email of attendeeEmails) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: aiCommunications.summary_message.subject,
        body: aiCommunications.summary_message.body
      });
    }

    // Send thank you to facilitator
    if (event.facilitator_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: event.facilitator_email,
        subject: aiCommunications.thank_you_message.subject,
        body: aiCommunications.thank_you_message.body
      });
    }

    return Response.json({
      success: true,
      communications: aiCommunications,
      emails_sent: attendeeEmails.length + (event.facilitator_email ? 1 : 0)
    });

  } catch (error) {
    console.error('Error generating post-event communications:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});