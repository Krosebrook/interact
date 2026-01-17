import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch comprehensive data
    const [events, participations, templates, users, comments, recognitions, directMessages, userPoints] = await Promise.all([
      base44.asServiceRole.entities.Event.list('-created_date', 200),
      base44.asServiceRole.entities.Participation.list('-created_date', 1000),
      base44.asServiceRole.entities.EventTemplate.list(),
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Comment.list('-created_date', 500),
      base44.asServiceRole.entities.Recognition.list('-created_date', 500),
      base44.asServiceRole.entities.DirectMessage.list('-created_date', 500),
      base44.asServiceRole.entities.UserPoints.list()
    ]);

    // Event success analysis
    const completedEvents = events.filter(e => e.status === 'completed');
    const eventSuccessMetrics = completedEvents.map(event => {
      const eventParticipations = participations.filter(p => p.event_id === event.id);
      const attended = eventParticipations.filter(p => p.attendance_status === 'attended').length;
      const ratings = eventParticipations.filter(p => p.feedback_rating).map(p => p.feedback_rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      
      return {
        event_id: event.id,
        title: event.title,
        attendance_rate: attended / Math.max(eventParticipations.length, 1),
        avg_rating: avgRating,
        total_participants: eventParticipations.length
      };
    });

    // Template popularity
    const templateUsage = {};
    events.forEach(event => {
      if (event.template_id) {
        templateUsage[event.template_id] = (templateUsage[event.template_id] || 0) + 1;
      }
    });

    const templatePopularity = templates.map(t => ({
      id: t.id,
      name: t.name,
      usage_count: templateUsage[t.id] || 0,
      category: t.category
    })).sort((a, b) => b.usage_count - a.usage_count);

    // User engagement trends
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentParticipations = participations.filter(p => new Date(p.created_date) > last30Days);
    const recentComments = comments.filter(c => new Date(c.created_date) > last30Days);
    const recentMessages = directMessages.filter(m => new Date(m.created_date) > last30Days);

    const userEngagement = users.map(u => {
      const userParticipations = recentParticipations.filter(p => p.user_email === u.email);
      const userComments = recentComments.filter(c => c.author_email === u.email);
      const userMessages = recentMessages.filter(m => m.sender_email === u.email);
      const userPointsData = userPoints.find(up => up.user_email === u.email);

      return {
        email: u.email,
        name: u.full_name,
        events_attended: userParticipations.length,
        comments_posted: userComments.length,
        messages_sent: userMessages.length,
        total_points: userPointsData?.total_points || 0,
        engagement_score: (userParticipations.length * 3) + (userComments.length * 2) + userMessages.length
      };
    }).sort((a, b) => b.engagement_score - a.engagement_score);

    // Collaboration patterns
    const collaborationMetrics = {
      total_comments: comments.length,
      total_messages: directMessages.length,
      total_recognitions: recognitions.length,
      avg_comments_per_user: comments.length / Math.max(users.length, 1),
      most_collaborative_users: userEngagement.slice(0, 10).map(u => ({
        email: u.email,
        name: u.name,
        collaboration_score: u.comments_posted + u.messages_sent
      }))
    };

    // Build AI analysis prompt
    const prompt = `Analyze this employee engagement platform data and provide actionable insights:

EVENT SUCCESS METRICS:
- Total events: ${events.length}
- Completed: ${completedEvents.length}
- Average attendance rate: ${(eventSuccessMetrics.reduce((sum, e) => sum + e.attendance_rate, 0) / Math.max(eventSuccessMetrics.length, 1) * 100).toFixed(1)}%
- Average rating: ${(eventSuccessMetrics.reduce((sum, e) => sum + e.avg_rating, 0) / Math.max(eventSuccessMetrics.length, 1)).toFixed(2)}/5

TEMPLATE USAGE:
Top 3: ${templatePopularity.slice(0, 3).map(t => `${t.name} (${t.usage_count} uses)`).join(', ')}

USER ENGAGEMENT (Last 30 days):
- Active users: ${userEngagement.filter(u => u.engagement_score > 0).length}/${users.length}
- Total events attended: ${recentParticipations.length}
- Total comments: ${recentComments.length}
- Total messages: ${recentMessages.length}

COLLABORATION:
- Comments per user avg: ${collaborationMetrics.avg_comments_per_user.toFixed(1)}
- Total recognitions: ${recognitions.length}

Provide insights in JSON format:
{
  "retention_insights": {
    "at_risk_users_count": number,
    "low_engagement_threshold": number,
    "retention_rate_estimate": number (0-100),
    "churn_risk_factors": ["factor1", "factor2"]
  },
  "adoption_insights": {
    "adoption_rate": number (0-100),
    "most_adopted_features": ["feature1", "feature2"],
    "underutilized_features": ["feature1", "feature2"],
    "growth_trajectory": "accelerating|steady|declining"
  },
  "recommendations": [
    {
      "category": "retention|adoption|engagement",
      "priority": "high|medium|low",
      "action": "specific actionable recommendation",
      "expected_impact": "brief impact description"
    }
  ],
  "success_patterns": ["pattern1", "pattern2"],
  "areas_for_improvement": ["area1", "area2"]
}`;

    const aiInsights = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          retention_insights: {
            type: "object",
            properties: {
              at_risk_users_count: { type: "number" },
              low_engagement_threshold: { type: "number" },
              retention_rate_estimate: { type: "number" },
              churn_risk_factors: { type: "array", items: { type: "string" } }
            }
          },
          adoption_insights: {
            type: "object",
            properties: {
              adoption_rate: { type: "number" },
              most_adopted_features: { type: "array", items: { type: "string" } },
              underutilized_features: { type: "array", items: { type: "string" } },
              growth_trajectory: { type: "string" }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                priority: { type: "string" },
                action: { type: "string" },
                expected_impact: { type: "string" }
              }
            }
          },
          success_patterns: { type: "array", items: { type: "string" } },
          areas_for_improvement: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      analytics: {
        event_success: {
          total_events: events.length,
          completed_events: completedEvents.length,
          avg_attendance_rate: (eventSuccessMetrics.reduce((sum, e) => sum + e.attendance_rate, 0) / Math.max(eventSuccessMetrics.length, 1)) * 100,
          avg_rating: eventSuccessMetrics.reduce((sum, e) => sum + e.avg_rating, 0) / Math.max(eventSuccessMetrics.length, 1),
          top_performing_events: eventSuccessMetrics.slice(0, 5)
        },
        template_popularity: templatePopularity.slice(0, 10),
        user_engagement: {
          total_users: users.length,
          active_users_30d: userEngagement.filter(u => u.engagement_score > 0).length,
          top_engaged_users: userEngagement.slice(0, 10),
          avg_engagement_score: userEngagement.reduce((sum, u) => sum + u.engagement_score, 0) / Math.max(users.length, 1)
        },
        collaboration_patterns: collaborationMetrics,
        ai_insights: aiInsights
      }
    });

  } catch (error) {
    console.error('Error generating AI analytics:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});