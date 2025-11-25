import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return Response.json({ error: 'Event ID required' }, { status: 400 });
    }

    // Fetch event data
    const events = await base44.entities.Event.filter({ id: eventId });
    const event = events[0];

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch related data in parallel
    const [messages, participations, activities] = await Promise.all([
      base44.entities.EventMessage.filter({ event_id: eventId }),
      base44.entities.Participation.filter({ event_id: eventId }),
      base44.entities.Activity.list()
    ]);

    const activity = activities.find(a => a.id === event.activity_id);

    // Calculate metrics
    const totalParticipants = participations.length;
    const attended = participations.filter(p => p.attended).length;
    const attendanceRate = totalParticipants > 0 ? Math.round((attended / totalParticipants) * 100) : 0;
    
    const engagementScores = participations
      .filter(p => p.engagement_score)
      .map(p => p.engagement_score);
    const avgEngagement = engagementScores.length > 0
      ? (engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length).toFixed(1)
      : 'N/A';

    // Categorize messages
    const questions = messages.filter(m => m.message_type === 'question');
    const answers = messages.filter(m => m.message_type === 'answer');
    const announcements = messages.filter(m => m.message_type === 'announcement');
    const discussions = messages.filter(m => m.message_type === 'chat');

    // Build context for AI
    const messageContext = messages
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .map(m => `[${m.message_type.toUpperCase()}] ${m.sender_name}: ${m.message}`)
      .join('\n');

    const participantFeedback = participations
      .filter(p => p.feedback)
      .map(p => `- ${p.participant_name}: ${p.feedback}`)
      .join('\n');

    const prompt = `Analyze this completed event and generate a comprehensive summary.

EVENT DETAILS:
- Title: ${event.title}
- Activity Type: ${activity?.type || 'General'}
- Date: ${event.scheduled_date}
- Duration: ${event.duration_minutes} minutes
- Attendance: ${attended}/${totalParticipants} (${attendanceRate}%)
- Average Engagement Score: ${avgEngagement}/10

QUESTIONS ASKED (${questions.length}):
${questions.map(q => `- ${q.sender_name}: ${q.message} ${q.is_answered ? '[ANSWERED]' : '[UNANSWERED]'}`).join('\n') || 'No questions recorded'}

DISCUSSION/CHAT LOG:
${messageContext || 'No discussion recorded'}

PARTICIPANT FEEDBACK:
${participantFeedback || 'No feedback submitted'}

Generate a JSON summary with:
1. executive_summary: 2-3 sentence overview of the event
2. key_topics: Array of main topics discussed
3. key_decisions: Array of decisions made (if any)
4. action_items: Array of {task, assignee (if mentioned), priority}
5. unanswered_questions: Array of questions that need follow-up
6. sentiment: overall, engagement_level, notable_feedback (each as strings)
7. recommendations: Array of suggestions for future events
8. highlights: Array of notable moments or achievements
9. metrics: {attendance_rate, engagement_score, questions_count, participation_quality}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_topics: { type: "array", items: { type: "string" } },
          key_decisions: { type: "array", items: { type: "string" } },
          action_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                assignee: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          unanswered_questions: { type: "array", items: { type: "string" } },
          sentiment: {
            type: "object",
            properties: {
              overall: { type: "string" },
              engagement_level: { type: "string" },
              notable_feedback: { type: "string" }
            }
          },
          recommendations: { type: "array", items: { type: "string" } },
          highlights: { type: "array", items: { type: "string" } },
          metrics: {
            type: "object",
            properties: {
              attendance_rate: { type: "string" },
              engagement_score: { type: "string" },
              questions_count: { type: "number" },
              participation_quality: { type: "string" }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        date: event.scheduled_date
      },
      summary: result
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});