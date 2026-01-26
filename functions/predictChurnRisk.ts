import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { userEmail, lookbackDays = 30 } = await req.json();
    
    // Fetch user activity data
    const [profile] = await base44.entities.UserProfile.filter({ user_email: userEmail });
    const [userPoints] = await base44.entities.UserPoints.filter({ user_email: userEmail });
    const participations = await base44.entities.Participation.filter({ user_email: userEmail });
    const recognitionsSent = await base44.entities.Recognition.filter({ sender_email: userEmail });
    const recognitionsReceived = await base44.entities.Recognition.filter({ recipient_email: userEmail });
    
    // Calculate activity metrics
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
    
    const recentParticipations = participations.filter(p => 
      new Date(p.created_date) > cutoffDate
    );
    const recentRecognitionsSent = recognitionsSent.filter(r => 
      new Date(r.created_date) > cutoffDate
    );
    const recentRecognitionsReceived = recognitionsReceived.filter(r => 
      new Date(r.created_date) > cutoffDate
    );
    
    // Use AI to analyze churn risk
    const analysisPrompt = `Analyze employee engagement data and predict churn risk:

User Activity (Last ${lookbackDays} days):
- Events attended: ${recentParticipations.length}
- Recognition sent: ${recentRecognitionsSent.length}
- Recognition received: ${recentRecognitionsReceived.length}
- Current points: ${userPoints?.total_points || 0}
- Current level: ${userPoints?.current_level || 1}
- Current streak: ${userPoints?.current_streak || 0}
- Last activity: ${userPoints?.last_activity_date || 'Never'}

Historical Activity:
- Total events: ${participations.length}
- Total recognition sent: ${recognitionsSent.length}
- Total recognition received: ${recognitionsReceived.length}

Assess churn risk (0-100 score) and provide actionable recommendations.`;
    
    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          risk_score: { type: "number" },
          risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
          key_indicators: {
            type: "array",
            items: {
              type: "object",
              properties: {
                indicator: { type: "string" },
                current_value: { type: "number" },
                threshold: { type: "number" },
                severity: { type: "string" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                expected_impact: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });
    
    // Save prediction to database
    await base44.asServiceRole.entities.PredictiveInsight.create({
      insight_type: 'churn_risk',
      user_email: userEmail,
      risk_score: prediction.risk_score,
      confidence: 0.85,
      key_indicators: prediction.key_indicators,
      recommendations: prediction.recommendations,
      generated_at: new Date().toISOString()
    });
    
    return Response.json({
      success: true,
      prediction
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});