import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { timeframe = 'quarterly' } = await req.json();

    // Fetch historical data based on timeframe
    const daysBack = timeframe === 'quarterly' ? 90 : timeframe === 'annually' ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [
      analyticsEvents,
      onboardingRecords,
      participations,
      surveyResponses,
      userPoints
    ] = await Promise.all([
      base44.asServiceRole.entities.AnalyticsEvent.filter({
        created_date: { $gte: startDate.toISOString() }
      }),
      base44.asServiceRole.entities.UserOnboarding.list(),
      base44.asServiceRole.entities.Participation.filter({
        created_date: { $gte: startDate.toISOString() }
      }),
      base44.asServiceRole.entities.SurveyResponse.filter({
        created_date: { $gte: startDate.toISOString() }
      }),
      base44.asServiceRole.entities.UserPoints.list()
    ]);

    // Calculate engagement trends over time
    const engagementByWeek = {};
    analyticsEvents.forEach(event => {
      const week = new Date(event.created_date).toISOString().slice(0, 10);
      engagementByWeek[week] = (engagementByWeek[week] || 0) + 1;
    });

    // Detect anomalies and predict issues
    const weeks = Object.keys(engagementByWeek).sort();
    const values = weeks.map(w => engagementByWeek[w]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const recentAvg = values.slice(-4).reduce((a, b) => a + b, 0) / 4;
    
    const trendDirection = recentAvg > avg * 1.1 ? 'increasing' : recentAvg < avg * 0.9 ? 'decreasing' : 'stable';

    // AI-powered predictive analysis
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this ${timeframe} system health data and predict potential issues:

Engagement Trend: ${trendDirection}
Average Weekly Activity: ${avg.toFixed(0)}
Recent Weekly Activity: ${recentAvg.toFixed(0)}
Onboarding Completion: ${onboardingRecords.filter(o => o.status === 'completed').length}/${onboardingRecords.length}
Event Attendance Rate: ${participations.filter(p => p.attendance_status === 'attended').length}/${participations.length}
Survey Response Rate: ${surveyResponses.length} responses
Active Users with Points: ${userPoints.length}

Predict:
1. Potential issues in next 30-90 days
2. Root causes of declining engagement (if any)
3. Proactive actions to prevent problems
4. Recommended interventions with urgency levels`,
      response_json_schema: {
        type: 'object',
        properties: {
          health_score: { type: 'number' },
          trend_analysis: { type: 'string' },
          predicted_issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                likelihood: { type: 'string' },
                impact: { type: 'string' },
                timeframe: { type: 'string' }
              }
            }
          },
          troubleshooting_steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step: { type: 'string' },
                action: { type: 'string' },
                expected_outcome: { type: 'string' }
              }
            }
          },
          proactive_recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                urgency: { type: 'string' },
                estimated_impact: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      timeframe,
      analysis_date: new Date().toISOString(),
      current_metrics: {
        avg_weekly_activity: Math.round(avg),
        recent_weekly_activity: Math.round(recentAvg),
        trend: trendDirection
      },
      ...response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});