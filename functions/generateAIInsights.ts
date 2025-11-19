import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch comprehensive data
        const events = await base44.entities.Event.list('-scheduled_date', 100);
        const activities = await base44.entities.Activity.list();
        const participations = await base44.entities.Participation.list();
        const preferences = await base44.entities.ActivityPreference.list();

        // Get company culture context
        const companyContext = preferences.length > 0 
            ? preferences[0].company_culture_notes || ''
            : '';

        // Prepare data summary for AI
        const completedEvents = events.filter(e => e.status === 'completed');
        const recentEvents = completedEvents
            .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
            .slice(0, 10);

        // Calculate engagement metrics
        const engagementData = recentEvents.map(event => {
            const activity = activities.find(a => a.id === event.activity_id);
            const eventParticipations = participations.filter(p => p.event_id === event.id);
            const attended = eventParticipations.filter(p => p.attended).length;
            const avgEngagement = eventParticipations.filter(p => p.engagement_score).length > 0
                ? eventParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / 
                  eventParticipations.filter(p => p.engagement_score).length
                : 0;
            const feedback = eventParticipations.filter(p => p.feedback).map(p => p.feedback);

            return {
                activity_title: activity?.title,
                activity_type: activity?.type,
                date: event.scheduled_date,
                attendance: attended,
                avg_engagement: avgEngagement.toFixed(1),
                feedback_samples: feedback.slice(0, 3)
            };
        });

        // Get all feedback comments
        const allFeedback = participations
            .filter(p => p.feedback && p.feedback.length > 10)
            .map(p => p.feedback)
            .slice(0, 20);

        // Construct AI prompt
        const prompt = `You are an expert team engagement consultant analyzing a remote team's activity participation data.

Company Culture Context: ${companyContext || 'Standard corporate remote team'}

Recent Event Data (last 10 events):
${JSON.stringify(engagementData, null, 2)}

Recent Feedback Comments:
${allFeedback.join('\n- ')}

Based on this data, provide:

1. PARTICIPATION PATTERNS: What trends do you see in attendance and engagement? What time patterns or activity types work best?

2. TEAM SENTIMENT: Based on feedback, what's the overall team mood and energy level?

3. RECOMMENDATIONS: Suggest 3 specific activities (be creative, don't just repeat what they've done) that would work well for this team based on:
   - Their engagement patterns
   - Feedback sentiment
   - Variety needs
   - Current season/time of year

4. SCHEDULING INSIGHTS: Based on the dates/times of high-engagement events, when should Lisa schedule activities for maximum participation?

5. RED FLAGS: Any concerning patterns or areas needing attention?

Be specific, actionable, and encouraging. Focus on data-driven insights.`;

        // Call LLM
        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    participation_patterns: { type: "string" },
                    team_sentiment: { type: "string" },
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                activity_concept: { type: "string" },
                                reasoning: { type: "string" },
                                best_timing: { type: "string" }
                            }
                        }
                    },
                    scheduling_insights: { type: "string" },
                    red_flags: { type: "string" }
                }
            }
        });

        // Save AI-generated recommendations
        for (const rec of aiResponse.recommendations.slice(0, 3)) {
            await base44.asServiceRole.entities.AIRecommendation.create({
                recommendation_type: 'ai_generated',
                custom_activity_data: {
                    title: rec.activity_concept,
                    reasoning: rec.reasoning,
                    best_timing: rec.best_timing
                },
                reasoning: rec.reasoning,
                confidence_score: 0.8,
                status: 'pending',
                context: {
                    ai_analysis: {
                        participation_patterns: aiResponse.participation_patterns,
                        team_sentiment: aiResponse.team_sentiment,
                        scheduling_insights: aiResponse.scheduling_insights
                    }
                }
            });
        }

        return Response.json({
            success: true,
            insights: aiResponse
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});