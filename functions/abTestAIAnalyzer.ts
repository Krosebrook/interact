import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, test_id } = await req.json();

    if (action === 'analyze_results' && test_id) {
      return await analyzeTestResults(base44, test_id);
    }

    if (action === 'predict_outcomes') {
      return await predictOutcomes(base44);
    }

    if (action === 'suggest_tests') {
      return await suggestNewTests(base44);
    }

    if (action === 'detect_anomalies') {
      return await detectAnomalies(base44);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function analyzeTestResults(base44, test_id) {
  const test = await base44.entities.ABTest.get(test_id);
  const assignments = await base44.entities.ABTestAssignment.filter({ test_id });

  const variantStats = {};
  test.variants.forEach(v => {
    const variantAssignments = assignments.filter(a => a.variant_id === v.variant_id);
    const conversions = variantAssignments.filter(a => a.user_action === 'completed' || a.conversion_events?.length > 0);
    
    variantStats[v.variant_id] = {
      name: v.name,
      total: variantAssignments.length,
      conversions: conversions.length,
      conversion_rate: variantAssignments.length > 0 ? (conversions.length / variantAssignments.length) : 0,
      clicks: variantAssignments.filter(a => a.user_action === 'clicked').length,
      dismissals: variantAssignments.filter(a => a.user_action === 'dismissed').length
    };
  });

  const prompt = `Analyze this A/B test and provide statistical insights:

Test: ${test.test_name}
Description: ${test.description}

Variant Results:
${Object.entries(variantStats).map(([id, stats]) => `
- ${stats.name} (${id}):
  - Users: ${stats.total}
  - Conversions: ${stats.conversions}
  - Conversion Rate: ${(stats.conversion_rate * 100).toFixed(2)}%
  - Clicks: ${stats.clicks}
  - Dismissals: ${stats.dismissals}
`).join('\n')}

Provide:
1. Winning variant (if statistically significant)
2. Confidence level (%)
3. Expected improvement over control
4. Statistical significance assessment
5. Recommendation (continue, stop, or needs more data)
6. Any anomalies detected

Respond in JSON format with: winner_variant_id, confidence_level, improvement_percentage, is_significant, recommendation, anomalies, reasoning`;

  const aiResponse = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        winner_variant_id: { type: "string" },
        confidence_level: { type: "number" },
        improvement_percentage: { type: "number" },
        is_significant: { type: "boolean" },
        recommendation: { type: "string" },
        anomalies: { type: "array", items: { type: "string" } },
        reasoning: { type: "string" }
      }
    }
  });

  return Response.json({
    test_id,
    variant_stats: variantStats,
    ai_analysis: aiResponse,
    timestamp: new Date().toISOString()
  });
}

async function predictOutcomes(base44) {
  const activeTests = await base44.entities.ABTest.filter({ status: 'active' });
  const predictions = [];

  for (const test of activeTests) {
    const assignments = await base44.entities.ABTestAssignment.filter({ test_id: test.id });
    
    if (assignments.length < 10) {
      predictions.push({
        test_id: test.id,
        test_name: test.test_name,
        prediction: 'insufficient_data',
        message: 'Need more data for prediction'
      });
      continue;
    }

    const variantData = {};
    test.variants.forEach(v => {
      const variantAssignments = assignments.filter(a => a.variant_id === v.variant_id);
      const conversions = variantAssignments.filter(a => a.user_action === 'completed' || a.conversion_events?.length > 0);
      variantData[v.variant_id] = {
        name: v.name,
        current_conversions: conversions.length,
        current_users: variantAssignments.length,
        current_rate: variantAssignments.length > 0 ? conversions.length / variantAssignments.length : 0
      };
    });

    const prompt = `Predict the outcome of this ongoing A/B test:

Test: ${test.test_name}
Target Sample Size: ${test.sample_size_target || 'not set'} per variant
Current Progress:
${Object.entries(variantData).map(([id, data]) => `
- ${data.name}: ${data.current_users} users, ${(data.current_rate * 100).toFixed(2)}% conversion
`).join('\n')}

Predict:
1. Likely winner
2. Projected final conversion rates
3. Days until statistical significance (if current trend continues)
4. Risk assessment

Respond in JSON format.`;

    const aiPrediction = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          likely_winner: { type: "string" },
          projected_rates: { type: "object" },
          days_to_significance: { type: "number" },
          risk_level: { type: "string" },
          confidence: { type: "number" }
        }
      }
    });

    predictions.push({
      test_id: test.id,
      test_name: test.test_name,
      current_data: variantData,
      prediction: aiPrediction
    });
  }

  return Response.json({ predictions });
}

async function suggestNewTests(base44) {
  const completedTests = await base44.entities.ABTest.filter({ status: 'completed' });
  const deliveryLogs = await base44.entities.InterventionDeliveryLog.list('-created_date', 200);
  
  const interventionStats = {};
  deliveryLogs.forEach(log => {
    if (!interventionStats[log.lifecycle_state]) {
      interventionStats[log.lifecycle_state] = {
        total: 0,
        converted: 0,
        dismissed: 0,
        channels: {}
      };
    }
    interventionStats[log.lifecycle_state].total++;
    if (log.status === 'converted') interventionStats[log.lifecycle_state].converted++;
    if (log.status === 'dismissed') interventionStats[log.lifecycle_state].dismissed++;
    
    if (!interventionStats[log.lifecycle_state].channels[log.channel]) {
      interventionStats[log.lifecycle_state].channels[log.channel] = 0;
    }
    interventionStats[log.lifecycle_state].channels[log.channel]++;
  });

  const prompt = `Based on this engagement data, suggest 3 high-impact A/B tests:

Past Test Results:
${completedTests.slice(0, 5).map(t => `
- ${t.test_name}: ${t.results_summary?.winning_variant || 'no winner'}, ${t.results_summary?.improvement_percentage || 0}% improvement
`).join('\n')}

Current Intervention Performance:
${Object.entries(interventionStats).map(([state, stats]) => `
${state}: ${stats.total} sent, ${stats.converted} converted (${((stats.converted/stats.total)*100).toFixed(1)}%)
Top channel: ${Object.entries(stats.channels).sort((a,b) => b[1]-a[1])[0]?.[0] || 'none'}
`).join('\n')}

Suggest A/B tests that could improve engagement. For each test provide:
1. Test name and description
2. Target lifecycle state
3. Variants to test (2-3)
4. Expected impact
5. Priority (high/medium/low)

Return as JSON array.`;

  const suggestions = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        suggested_tests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              test_name: { type: "string" },
              description: { type: "string" },
              lifecycle_state: { type: "string" },
              variants: { type: "array", items: { type: "object" } },
              expected_impact: { type: "string" },
              priority: { type: "string" },
              reasoning: { type: "string" }
            }
          }
        }
      }
    }
  });

  return Response.json(suggestions);
}

async function detectAnomalies(base44) {
  const activeTests = await base44.entities.ABTest.filter({ status: 'active' });
  const anomalies = [];

  for (const test of activeTests) {
    const assignments = await base44.entities.ABTestAssignment.filter({ test_id: test.id });
    
    const variantDistribution = {};
    test.variants.forEach(v => {
      variantDistribution[v.variant_id] = assignments.filter(a => a.variant_id === v.variant_id).length;
    });

    const issues = [];
    
    // Check variant distribution
    const expectedPerVariant = assignments.length / test.variants.length;
    Object.entries(variantDistribution).forEach(([id, count]) => {
      const deviation = Math.abs(count - expectedPerVariant) / expectedPerVariant;
      if (deviation > 0.3) {
        issues.push(`Uneven distribution: variant ${id} has ${((deviation * 100).toFixed(1))}% deviation`);
      }
    });

    // Check sample size
    if (test.sample_size_target && assignments.length < test.sample_size_target * 0.2) {
      issues.push(`Low enrollment: ${assignments.length} users vs target ${test.sample_size_target}`);
    }

    // Check conversion rates
    const conversionRates = test.variants.map(v => {
      const vAssignments = assignments.filter(a => a.variant_id === v.variant_id);
      const conversions = vAssignments.filter(a => a.user_action === 'completed' || a.conversion_events?.length > 0);
      return vAssignments.length > 0 ? conversions.length / vAssignments.length : 0;
    });

    if (conversionRates.every(r => r === 0)) {
      issues.push('No conversions in any variant - check intervention delivery');
    }

    if (conversionRates.some(r => r > 0.95)) {
      issues.push('Suspiciously high conversion rate detected - possible tracking issue');
    }

    if (issues.length > 0) {
      anomalies.push({
        test_id: test.id,
        test_name: test.test_name,
        issues,
        severity: issues.length > 2 ? 'high' : 'medium',
        recommendation: 'Review test configuration and data collection'
      });
    }
  }

  return Response.json({ anomalies, checked_tests: activeTests.length });
}