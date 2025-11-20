import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { eventId, guideType } = await req.json();

        // Get event and activity data
        const events = await base44.entities.Event.filter({ id: eventId });
        if (events.length === 0) {
            return Response.json({ error: 'Event not found' }, { status: 404 });
        }
        const event = events[0];

        const activities = await base44.entities.Activity.filter({ id: event.activity_id });
        const activity = activities[0];

        const participations = await base44.entities.Participation.filter({ event_id: eventId });

        let prompt, schema;

        if (guideType === 'pre_event') {
            prompt = `You are an expert event facilitator. Generate a comprehensive pre-event checklist and preparation guide for this activity:

Activity: ${activity.title}
Type: ${activity.type}
Duration: ${activity.duration}
Description: ${activity.description}
Instructions: ${activity.instructions}
Expected Participants: ${event.max_participants || participations.length}

Provide:
1. Pre-event checklist (5-7 actionable items)
2. Icebreaker questions (3-5 questions) specific to this activity type
3. Discussion prompts (3-5 prompts) to keep conversation flowing
4. Common pitfalls to avoid
5. Success tips for this specific activity type

Be specific, practical, and actionable.`;

            schema = {
                type: "object",
                properties: {
                    checklist: {
                        type: "array",
                        items: { type: "string" }
                    },
                    icebreakers: {
                        type: "array",
                        items: { type: "string" }
                    },
                    discussion_prompts: {
                        type: "array",
                        items: { type: "string" }
                    },
                    pitfalls: {
                        type: "array",
                        items: { type: "string" }
                    },
                    success_tips: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            };
        } else if (guideType === 'real_time') {
            const currentParticipation = participations.length;
            const expectedParticipation = event.max_participants || participations.filter(p => p.rsvp_status === 'yes').length;

            prompt = `You are providing real-time facilitation tips during an ongoing event.

Activity: ${activity.title}
Type: ${activity.type}
Current Status: Event is live
Participants: ${currentParticipation} joined (expected: ${expectedParticipation})

Provide 5 real-time tips for the facilitator right now, such as:
- Engagement strategies
- How to handle low participation
- Timing reminders
- Energy boosters
- Inclusion tips

Be concise and immediately actionable.`;

            schema = {
                type: "object",
                properties: {
                    tips: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                priority: { type: "string", enum: ["high", "medium", "low"] }
                            }
                        }
                    },
                    sentiment_check: { type: "string" },
                    suggested_action: { type: "string" }
                }
            };
        } else if (guideType === 'post_event') {
            const attended = participations.filter(p => p.attended);
            const withFeedback = participations.filter(p => p.engagement_score);
            const avgEngagement = withFeedback.length > 0
                ? withFeedback.reduce((sum, p) => sum + p.engagement_score, 0) / withFeedback.length
                : 0;

            const feedbackComments = participations
                .filter(p => p.feedback)
                .map(p => p.feedback)
                .slice(0, 10);

            prompt = `Generate a comprehensive post-event recap summary.

Activity: ${activity.title}
Type: ${activity.type}
Participants: ${attended.length} attended (${participations.length} RSVPs)
Average Engagement: ${avgEngagement.toFixed(1)}/5
Feedback Received: ${withFeedback.length} responses

Sample Feedback:
${feedbackComments.join('\n- ')}

Create a professional recap including:
1. Executive summary (2-3 sentences)
2. Key highlights (3-5 bullet points)
3. Participation insights
4. What went well
5. Areas for improvement
6. Recommendations for next time

Be constructive, data-driven, and actionable.`;

            schema = {
                type: "object",
                properties: {
                    executive_summary: { type: "string" },
                    key_highlights: {
                        type: "array",
                        items: { type: "string" }
                    },
                    participation_insights: { type: "string" },
                    what_went_well: {
                        type: "array",
                        items: { type: "string" }
                    },
                    areas_for_improvement: {
                        type: "array",
                        items: { type: "string" }
                    },
                    recommendations: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            };
        }

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: schema
        });

        return Response.json({
            success: true,
            guide: response,
            event_id: eventId,
            guide_type: guideType
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});