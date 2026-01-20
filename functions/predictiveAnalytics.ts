import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, segment_id, timeframe } = await req.json();

    if (action === 'predict_churn') {
      return await predictChurn(base44, segment_id);
    }

    if (action === 'forecast_growth') {
      return await forecastGrowth(base44, timeframe || 90);
    }

    if (action === 'generate_insights') {
      return await generateInsights(base44);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function predictChurn(base44, segment_id) {
  const lifecycleStates = await base44.entities.LifecycleState.list('-updated_date', 500);
  const users = await base44.entities.User.list();
  
  const segmentFilter = segment_id 
    ? lifecycleStates.filter(s => s.segment_id === segment_id)
    : lifecycleStates;

  const stateGroups = {};
  segmentFilter.forEach(state => {
    if (!stateGroups[state.lifecycle_state]) {
      stateGroups[state.lifecycle_state] = [];
    }
    stateGroups[state.lifecycle_state].push(state);
  });

  const prompt = `Analyze this employee lifecycle data and predict churn risk:

Total Employees: ${users.length}
Lifecycle State Distribution:
${Object.entries(stateGroups).map(([state, records]) => `
${state}: ${records.length} employees
- Avg Churn Risk: ${(records.reduce((sum, r) => sum + (r.churn_risk || 0), 0) / records.length).toFixed(2)}
- Avg Days in State: ${(records.reduce((sum, r) => sum + (r.days_in_state || 0), 0) / records.length).toFixed(0)}
`).join('\n')}

At-Risk Employees (churn_risk > 0.6):
${lifecycleStates.filter(s => s.churn_risk > 0.6).length}

Predict:
1. Expected churn rate for next 30/60/90 days by segment
2. High-risk employee count and characteristics
3. Early warning indicators
4. Recommended intervention priority

Respond in JSON format.`;

  const prediction = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        churn_predictions: {
          type: "object",
          properties: {
            next_30_days: { type: "number" },
            next_60_days: { type: "number" },
            next_90_days: { type: "number" }
          }
        },
        high_risk_segments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              segment: { type: "string" },
              count: { type: "number" },
              risk_level: { type: "string" },
              characteristics: { type: "array", items: { type: "string" } }
            }
          }
        },
        early_warning_indicators: {
          type: "array",
          items: { type: "string" }
        },
        intervention_priorities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              priority: { type: "string" },
              segment: { type: "string" },
              action: { type: "string" },
              expected_impact: { type: "string" }
            }
          }
        },
        confidence: { type: "number" }
      }
    }
  });

  return Response.json({
    segment_id,
    total_analyzed: segmentFilter.length,
    prediction,
    timestamp: new Date().toISOString()
  });
}

async function forecastGrowth(base44, days) {
  const lifecycleStates = await base44.entities.LifecycleState.list('-updated_date', 500);
  const users = await base44.entities.User.list();
  const participations = await base44.entities.Participation.list('-created_date', 200);

  const now = new Date();
  const last30Days = lifecycleStates.filter(s => {
    const created = new Date(s.created_date);
    return (now - created) / (1000 * 60 * 60 * 24) <= 30;
  });

  const engagementTrend = participations.filter(p => {
    const created = new Date(p.created_date);
    return (now - created) / (1000 * 60 * 60 * 24) <= 30;
  }).length;

  const stateTransitions = {};
  lifecycleStates.forEach(s => {
    const key = `${s.previous_state || 'new'}_to_${s.lifecycle_state}`;
    stateTransitions[key] = (stateTransitions[key] || 0) + 1;
  });

  const prompt = `Forecast employee engagement growth based on current trends:

Current Metrics:
- Total Employees: ${users.length}
- New in Last 30 Days: ${last30Days.length}
- Engagement Events (30d): ${engagementTrend}

State Distribution:
${Object.entries(lifecycleStates.reduce((acc, s) => {
  acc[s.lifecycle_state] = (acc[s.lifecycle_state] || 0) + 1;
  return acc;
}, {})).map(([state, count]) => `${state}: ${count}`).join('\n')}

Predict for next ${days} days:
1. Employee engagement growth rate
2. Expected state distribution
3. Projected active user count
4. Lifetime value trends
5. Key growth drivers

Respond in JSON format.`;

  const forecast = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        growth_forecast: {
          type: "object",
          properties: {
            engagement_growth_rate: { type: "number" },
            projected_active_users: { type: "number" },
            expected_state_distribution: { type: "object" },
            confidence_interval: {
              type: "object",
              properties: {
                lower: { type: "number" },
                upper: { type: "number" }
              }
            }
          }
        },
        ltv_trends: {
          type: "object",
          properties: {
            average_ltv: { type: "number" },
            trend: { type: "string" },
            top_contributors: { type: "array", items: { type: "string" } }
          }
        },
        key_drivers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              driver: { type: "string" },
              impact: { type: "string" },
              recommendation: { type: "string" }
            }
          }
        },
        risks: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });

  return Response.json({
    timeframe_days: days,
    current_baseline: {
      total_users: users.length,
      recent_growth: last30Days.length,
      engagement_events: engagementTrend
    },
    forecast,
    timestamp: new Date().toISOString()
  });
}

async function generateInsights(base44) {
  const lifecycleStates = await base44.entities.LifecycleState.list('-updated_date', 500);
  const interventions = await base44.entities.InterventionDeliveryLog.list('-created_date', 200);
  const abTests = await base44.entities.ABTest.filter({ status: 'completed' });

  const highRiskCount = lifecycleStates.filter(s => s.churn_risk > 0.6).length;
  const dormantCount = lifecycleStates.filter(s => s.lifecycle_state === 'dormant').length;
  const atRiskCount = lifecycleStates.filter(s => s.lifecycle_state === 'at_risk').length;

  const interventionSuccess = interventions.filter(i => i.status === 'converted').length / interventions.length;

  const prompt = `Generate actionable insights and alerts for HR leadership:

Current State:
- High Churn Risk Employees: ${highRiskCount}
- Dormant: ${dormantCount}
- At Risk: ${atRiskCount}
- Recent Interventions: ${interventions.length}
- Intervention Success Rate: ${(interventionSuccess * 100).toFixed(1)}%
- Completed A/B Tests: ${abTests.length}

Provide:
1. Top 3 critical alerts requiring immediate action
2. Top 3 opportunities to capitalize on
3. Strategic recommendations for next 30 days
4. Risk mitigation strategies

Respond in JSON format with specific, actionable insights.`;

  const insights = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        critical_alerts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              affected_count: { type: "number" },
              recommended_action: { type: "string" },
              urgency: { type: "string" }
            }
          }
        },
        opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              potential_impact: { type: "string" },
              effort_required: { type: "string" },
              timeline: { type: "string" }
            }
          }
        },
        strategic_recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              recommendation: { type: "string" },
              expected_outcome: { type: "string" },
              priority: { type: "string" }
            }
          }
        },
        risk_mitigation: {
          type: "array",
          items: {
            type: "object",
            properties: {
              risk: { type: "string" },
              likelihood: { type: "string" },
              mitigation_strategy: { type: "string" }
            }
          }
        }
      }
    }
  });

  return Response.json({
    insights,
    data_points_analyzed: lifecycleStates.length + interventions.length,
    timestamp: new Date().toISOString()
  });
}