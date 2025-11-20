import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await req.json();

    // Get event and participation data
    const events = await base44.asServiceRole.entities.Event.filter({ id: eventId });
    const event = events[0];

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    const participations = await base44.asServiceRole.entities.Participation.filter({ 
      event_id: eventId 
    });

    const activities = await base44.asServiceRole.entities.Activity.filter({ 
      id: event.activity_id 
    });
    const activity = activities[0];

    // Calculate engagement metrics
    const totalParticipants = participations.length;
    const attendedCount = participations.filter(p => p.attended).length;
    const attendanceRate = totalParticipants > 0 ? (attendedCount / totalParticipants) * 100 : 0;

    const engagementScores = participations
      .map(p => p.engagement_score)
      .filter(s => s && s > 0);
    
    const avgEngagement = engagementScores.length > 0
      ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length
      : 0;

    const submissionsCount = participations.filter(p => p.submission?.content).length;
    const submissionRate = totalParticipants > 0 ? (submissionsCount / totalParticipants) * 100 : 0;

    // Analyze feedback sentiment
    const feedbacks = participations.map(p => p.feedback).filter(Boolean);
    const recentFeedback = feedbacks.slice(-5).join('. ');

    // Generate coaching tips
    const prompt = `You are an expert facilitation coach analyzing a live team event. Provide real-time coaching:

EVENT CONTEXT:
- Activity: ${activity?.title || 'Unknown'} (${activity?.type})
- Total Participants: ${totalParticipants}
- Current Attendance: ${attendanceRate.toFixed(0)}%
- Avg Engagement Score: ${avgEngagement.toFixed(1)}/5
- Submission Rate: ${submissionRate.toFixed(0)}%
- Recent Feedback: ${recentFeedback || 'None yet'}

TASK: Provide actionable coaching for the facilitator RIGHT NOW. Focus on:

1. IMMEDIATE ACTION (if needed) - What to do in the next 2 minutes
2. SENTIMENT ANALYSIS - Current mood/energy level (high/medium/low)
3. 3 SPECIFIC TIPS - Concrete actions to boost engagement
4. RED FLAGS - Any warning signs to watch for
5. ENCOURAGEMENT - Brief positive note

Be direct, specific, and actionable. This is live coaching.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          immediate_action: {
            type: "object",
            properties: {
              needed: { type: "boolean" },
              action: { type: "string" },
              urgency: { type: "string", enum: ["high", "medium", "low"] }
            }
          },
          sentiment: {
            type: "object",
            properties: {
              level: { type: "string", enum: ["high", "medium", "low"] },
              description: { type: "string" }
            }
          },
          tips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                action: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          red_flags: {
            type: "array",
            items: { type: "string" }
          },
          encouragement: { type: "string" }
        }
      }
    });

    return Response.json({
      coaching: response,
      metrics: {
        totalParticipants,
        attendanceRate,
        avgEngagement,
        submissionRate
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});