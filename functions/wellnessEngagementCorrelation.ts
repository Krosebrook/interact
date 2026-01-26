import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { lookbackDays = 30 } = await req.json();
    
    // Fetch wellness and engagement data
    const wellnessLogs = await base44.asServiceRole.entities.WellnessLog.filter({});
    const participations = await base44.asServiceRole.entities.Participation.filter({});
    const recognitions = await base44.asServiceRole.entities.Recognition.filter({});
    const userPoints = await base44.asServiceRole.entities.UserPoints.filter({});
    
    // Group by user
    const userWellnessActivity = wellnessLogs.reduce((acc, log) => {
      if (!acc[log.user_email]) {
        acc[log.user_email] = { logs: 0, totalValue: 0 };
      }
      acc[log.user_email].logs += 1;
      acc[log.user_email].totalValue += log.value;
      return acc;
    }, {});
    
    const userEngagement = participations.reduce((acc, p) => {
      if (!acc[p.user_email]) {
        acc[p.user_email] = { events: 0 };
      }
      acc[p.user_email].events += 1;
      return acc;
    }, {});
    
    recognitions.forEach(r => {
      if (!userEngagement[r.sender_email]) {
        userEngagement[r.sender_email] = { events: 0, recognitions: 0 };
      }
      userEngagement[r.sender_email].recognitions = (userEngagement[r.sender_email].recognitions || 0) + 1;
    });
    
    // Build correlation dataset
    const correlationData = Object.keys(userWellnessActivity).map(email => ({
      email,
      wellnessLogs: userWellnessActivity[email].logs,
      wellnessTotal: userWellnessActivity[email].totalValue,
      eventsAttended: userEngagement[email]?.events || 0,
      recognitionsSent: userEngagement[email]?.recognitions || 0,
      totalPoints: userPoints.find(p => p.user_email === email)?.total_points || 0
    }));
    
    // AI analysis
    const analysisPrompt = `Analyze correlation between wellness activity and employee engagement:

Dataset (${correlationData.length} employees):
${correlationData.slice(0, 10).map(d => `
- Email: ${d.email}
  Wellness logs: ${d.wellnessLogs}
  Wellness total: ${d.wellnessTotal}
  Events attended: ${d.eventsAttended}
  Recognitions sent: ${d.recognitionsSent}
  Total points: ${d.totalPoints}
`).join('\n')}

Analyze:
1. Correlation strength between wellness activity and engagement
2. Key patterns and insights
3. Recommendations for HR to improve both wellness and engagement
4. Suggested wellness challenge goals based on engagement data`;
    
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          correlation_strength: {
            type: "string",
            enum: ["strong_positive", "moderate_positive", "weak", "no_correlation"]
          },
          correlation_score: { type: "number" },
          key_insights: {
            type: "array",
            items: { type: "string" }
          },
          patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                expected_outcome: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          suggested_challenge_goals: {
            type: "object",
            properties: {
              steps_daily: { type: "number" },
              meditation_minutes: { type: "number" },
              hydration_glasses: { type: "number" }
            }
          }
        }
      }
    });
    
    return Response.json({
      success: true,
      analysis,
      sampleSize: correlationData.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});