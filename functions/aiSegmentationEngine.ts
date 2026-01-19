import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const { action } = payload;

    switch (action) {
      case 'suggest_segments':
        return Response.json(await suggestSegments(base44, payload));
      
      case 'predict_segment_metrics':
        return Response.json(await predictSegmentMetrics(base44, payload));
      
      case 'identify_high_potential':
        return Response.json(await identifyHighPotentialSegments(base44, payload));
      
      case 'auto_trigger_campaigns':
        return Response.json(await autoTriggerCampaigns(base44, payload));
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('aiSegmentationEngine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function suggestSegments(base44, payload) {
  // Fetch lifecycle states, campaign performance, and behavioral data
  const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list('-updated_date', 100);
  const campaigns = await base44.asServiceRole.entities.InterventionDeliveryLog.list('-created_date', 200);
  const abTests = await base44.asServiceRole.entities.ABTest.filter({ status: 'completed' });

  // Aggregate insights
  const behaviorPatterns = analyzeBehaviorPatterns(lifecycleStates);
  const campaignPerformance = analyzeCampaignPerformance(campaigns);
  const testInsights = extractTestInsights(abTests);

  // Generate AI prompt
  const prompt = `Analyze user engagement data and suggest 3-5 high-value user segments for targeted campaigns.

Behavior Patterns:
- At-risk users: ${behaviorPatterns.at_risk_count} (avg churn risk: ${behaviorPatterns.avg_churn_risk}%)
- Dormant users: ${behaviorPatterns.dormant_count}
- Power users: ${behaviorPatterns.power_users_count}
- Recently activated: ${behaviorPatterns.activated_count}

Campaign Performance:
- Best performing channel: ${campaignPerformance.best_channel} (${campaignPerformance.best_channel_rate}% conversion)
- Low engagement segments: ${campaignPerformance.low_engagement_segments.join(', ')}
- High conversion timing: ${campaignPerformance.optimal_timing}

A/B Test Insights:
${testInsights.map(t => `- ${t.name}: ${t.winning_variant} won with ${t.improvement}% improvement`).join('\n')}

Provide segment suggestions in this JSON format:
{
  "suggestions": [
    {
      "segment_name": "string",
      "display_name": "string",
      "description": "string",
      "criteria": {
        "logic_operator": "AND",
        "conditions": [{"field": "lifecycle_state", "operator": "equals", "value": "at_risk"}]
      },
      "predicted_size": number,
      "confidence": number,
      "campaign_recommendations": {
        "channel": "email|notification|sms",
        "timing": "immediate|1h|1d|1w",
        "message_tone": "urgent|supportive|motivational"
      },
      "reasoning": "string"
    }
  ]
}`;

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              segment_name: { type: 'string' },
              display_name: { type: 'string' },
              description: { type: 'string' },
              criteria: { type: 'object' },
              predicted_size: { type: 'number' },
              confidence: { type: 'number' },
              campaign_recommendations: { type: 'object' },
              reasoning: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return {
    success: true,
    suggestions: response.suggestions || [],
    generated_at: new Date().toISOString()
  };
}

async function predictSegmentMetrics(base44, payload) {
  const { segmentId } = payload;
  
  const segment = await base44.asServiceRole.entities.UserSegment.get(segmentId);
  if (!segment) {
    return { error: 'Segment not found' };
  }

  // Fetch historical user count data (simulate with current data)
  const currentCount = segment.user_count || 0;
  
  // Get lifecycle state transitions for trend analysis
  const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list('-updated_date', 500);
  
  const stateChanges = lifecycleStates.filter(s => {
    const daysSinceUpdate = (Date.now() - new Date(s.updated_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 30; // Last 30 days
  });

  const prompt = `Predict segment growth and churn metrics for the next 30 days.

Segment: ${segment.display_name || segment.segment_name}
Current Size: ${currentCount} users
Criteria: ${JSON.stringify(segment.criteria)}

Recent User State Changes (last 30 days): ${stateChanges.length} transitions

Provide predictions in this JSON format:
{
  "predicted_growth": {
    "7_days": number,
    "14_days": number,
    "30_days": number
  },
  "predicted_churn": {
    "7_days": number,
    "14_days": number,
    "30_days": number
  },
  "predicted_size": {
    "7_days": number,
    "14_days": number,
    "30_days": number
  },
  "confidence": number,
  "factors": [
    {
      "factor": "string",
      "impact": "positive|negative|neutral",
      "description": "string"
    }
  ],
  "recommendations": ["string"]
}`;

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        predicted_growth: { type: 'object' },
        predicted_churn: { type: 'object' },
        predicted_size: { type: 'object' },
        confidence: { type: 'number' },
        factors: { type: 'array' },
        recommendations: { type: 'array' }
      }
    }
  });

  return {
    success: true,
    segment_id: segmentId,
    predictions: response,
    generated_at: new Date().toISOString()
  };
}

async function identifyHighPotentialSegments(base44, payload) {
  const segments = await base44.asServiceRole.entities.UserSegment.filter({ is_active: true });
  const campaigns = await base44.asServiceRole.entities.InterventionDeliveryLog.list('-created_date', 100);
  
  const segmentPerformance = segments.map(segment => {
    const segmentCampaigns = campaigns.filter(c => c.intervention_id?.includes(segment.segment_name));
    const conversionRate = segmentCampaigns.length > 0
      ? (segmentCampaigns.filter(c => c.status === 'converted').length / segmentCampaigns.length) * 100
      : 0;
    
    return {
      segment_id: segment.id,
      segment_name: segment.segment_name,
      display_name: segment.display_name,
      user_count: segment.user_count || 0,
      campaign_count: segmentCampaigns.length,
      conversion_rate: conversionRate
    };
  });

  const highPotential = segmentPerformance
    .filter(s => s.user_count > 10) // Minimum viable size
    .sort((a, b) => {
      // Score: (conversion_rate * user_count) / campaign_count
      const scoreA = a.campaign_count > 0 ? (a.conversion_rate * a.user_count) / a.campaign_count : 0;
      const scoreB = b.campaign_count > 0 ? (b.conversion_rate * b.user_count) / b.campaign_count : 0;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  return {
    success: true,
    high_potential_segments: highPotential.map(s => ({
      ...s,
      auto_campaign_eligible: s.conversion_rate > 15 || s.campaign_count === 0,
      reason: s.conversion_rate > 15 
        ? 'High historical conversion rate'
        : 'Untapped segment with significant size'
    }))
  };
}

async function autoTriggerCampaigns(base44, payload) {
  const { minConversionRate = 15, minSegmentSize = 20, dryRun = true } = payload;
  
  const highPotential = await identifyHighPotentialSegments(base44, {});
  
  const eligibleSegments = highPotential.high_potential_segments.filter(s => 
    s.auto_campaign_eligible && 
    s.user_count >= minSegmentSize &&
    (s.conversion_rate >= minConversionRate || s.campaign_count === 0)
  );

  if (dryRun) {
    return {
      success: true,
      dry_run: true,
      eligible_segments: eligibleSegments,
      message: `Found ${eligibleSegments.length} segments eligible for auto-campaigns`
    };
  }

  // Trigger campaigns for eligible segments
  const triggered = [];
  for (const segment of eligibleSegments) {
    try {
      const fullSegment = await base44.asServiceRole.entities.UserSegment.get(segment.segment_id);
      
      // Generate AI-optimized message
      const messagePrompt = `Create a personalized engagement message for segment: ${segment.display_name}.
Previous conversion rate: ${segment.conversion_rate}%. Keep it motivational and under 150 characters.`;
      
      const messageResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: messagePrompt
      });

      const result = await base44.asServiceRole.functions.invoke('segmentationEngine', {
        action: 'trigger_segment_campaign',
        segmentId: segment.segment_id,
        campaignType: 'ai_auto_triggered',
        channel: 'notification',
        message: messageResponse,
        metadata: {
          auto_triggered: true,
          conversion_rate: segment.conversion_rate,
          segment_size: segment.user_count
        }
      });

      triggered.push({
        segment_id: segment.segment_id,
        segment_name: segment.segment_name,
        result: result.data
      });

    } catch (error) {
      console.error(`Failed to trigger campaign for ${segment.segment_name}:`, error);
    }
  }

  return {
    success: true,
    triggered_campaigns: triggered,
    count: triggered.length
  };
}

// Helper functions
function analyzeBehaviorPatterns(lifecycleStates) {
  const states = lifecycleStates.reduce((acc, s) => {
    acc[s.lifecycle_state] = (acc[s.lifecycle_state] || 0) + 1;
    return acc;
  }, {});

  const atRiskUsers = lifecycleStates.filter(s => s.lifecycle_state === 'at_risk');
  const avgChurnRisk = atRiskUsers.length > 0
    ? atRiskUsers.reduce((sum, s) => sum + (s.churn_risk || 0), 0) / atRiskUsers.length
    : 0;

  return {
    at_risk_count: states.at_risk || 0,
    dormant_count: states.dormant || 0,
    power_users_count: states.power_user || 0,
    activated_count: states.activated || 0,
    avg_churn_risk: avgChurnRisk.toFixed(1)
  };
}

function analyzeCampaignPerformance(campaigns) {
  const byChannel = campaigns.reduce((acc, c) => {
    if (!acc[c.channel]) {
      acc[c.channel] = { total: 0, converted: 0 };
    }
    acc[c.channel].total++;
    if (c.status === 'converted') acc[c.channel].converted++;
    return acc;
  }, {});

  const channelRates = Object.entries(byChannel).map(([channel, stats]) => ({
    channel,
    rate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0
  }));

  const bestChannel = channelRates.sort((a, b) => b.rate - a.rate)[0] || { channel: 'email', rate: 0 };

  return {
    best_channel: bestChannel.channel,
    best_channel_rate: bestChannel.rate.toFixed(1),
    low_engagement_segments: ['returning_low_activity'],
    optimal_timing: 'morning (9-11am)'
  };
}

function extractTestInsights(abTests) {
  return abTests.slice(0, 3).map(test => ({
    name: test.test_name,
    winning_variant: test.results_summary?.winning_variant || 'unknown',
    improvement: test.results_summary?.improvement_percentage?.toFixed(1) || 0
  }));
}