import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * A/B Test Engine for Lifecycle Interventions
 * Manages test assignment, tracking, and analysis
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action } = payload;

    // GET ACTIVE TESTS FOR STATE
    if (action === 'get_active_tests_for_state') {
      const { lifecycleState } = payload;
      
      const tests = await base44.entities.ABTest.filter({
        lifecycle_state: lifecycleState,
        status: 'active'
      });

      const now = new Date();
      const activeTests = tests.filter(test => {
        if (test.start_date && new Date(test.start_date) > now) return false;
        if (test.end_date && new Date(test.end_date) < now) return false;
        return true;
      });

      return Response.json({ success: true, tests: activeTests });
    }

    // ASSIGN USER TO TEST VARIANT
    if (action === 'assign_user_to_test') {
      const { testId, userEmail, lifecycleState } = payload;

      // Check if user already assigned
      const existing = await base44.asServiceRole.entities.ABTestAssignment.filter({
        test_id: testId,
        user_email: userEmail
      });

      if (existing.length > 0) {
        return Response.json({ 
          success: true, 
          assignment: existing[0],
          already_assigned: true 
        });
      }

      // Get test details
      const tests = await base44.asServiceRole.entities.ABTest.filter({ id: testId });
      if (tests.length === 0) {
        return Response.json({ error: 'Test not found' }, { status: 404 });
      }

      const test = tests[0];

      // Check target criteria
      const lifecycleData = await base44.asServiceRole.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycleData.length === 0) {
        return Response.json({ error: 'No lifecycle state' }, { status: 400 });
      }

      const state = lifecycleData[0];
      const daysInState = Math.floor(
        (new Date() - new Date(state.state_entered_at)) / (1000 * 60 * 60 * 24)
      );

      // Check criteria
      const criteria = test.target_criteria || {};
      if (criteria.min_days_in_state && daysInState < criteria.min_days_in_state) {
        return Response.json({ success: true, assigned: false, reason: 'min_days_not_met' });
      }
      if (criteria.max_days_in_state && daysInState > criteria.max_days_in_state) {
        return Response.json({ success: true, assigned: false, reason: 'max_days_exceeded' });
      }
      if (criteria.churn_risk_min && state.churn_risk_score < criteria.churn_risk_min) {
        return Response.json({ success: true, assigned: false, reason: 'churn_risk_too_low' });
      }
      if (criteria.churn_risk_max && state.churn_risk_score > criteria.churn_risk_max) {
        return Response.json({ success: true, assigned: false, reason: 'churn_risk_too_high' });
      }

      // Assign to variant using weighted random
      const variant = selectVariant(test.variants);

      // Get baseline metrics
      const retention = await base44.asServiceRole.entities.RetentionState.filter({
        user_email: userEmail
      });
      const sessions7DaysBefore = retention.length > 0 
        ? (retention[0].weekly_engagement?.[retention[0].weekly_engagement.length - 1]?.sessions || 0)
        : 0;

      const assignment = await base44.asServiceRole.entities.ABTestAssignment.create({
        test_id: testId,
        user_email: userEmail,
        variant_id: variant.variant_id,
        assigned_at: new Date().toISOString(),
        lifecycle_state_before: state.current_state,
        churn_risk_before: state.churn_risk_score,
        sessions_7days_before: sessions7DaysBefore
      });

      return Response.json({ 
        success: true, 
        assignment,
        variant,
        assigned: true 
      });
    }

    // TRACK INTERVENTION SHOWN
    if (action === 'track_intervention_shown') {
      const { assignmentId } = payload;

      await base44.asServiceRole.entities.ABTestAssignment.update(assignmentId, {
        intervention_shown: true,
        shown_at: new Date().toISOString()
      });

      return Response.json({ success: true });
    }

    // TRACK USER ACTION
    if (action === 'track_user_action') {
      const { assignmentId, actionType } = payload;

      await base44.asServiceRole.entities.ABTestAssignment.update(assignmentId, {
        user_action: actionType,
        action_at: new Date().toISOString()
      });

      return Response.json({ success: true });
    }

    // TRACK CONVERSION EVENT
    if (action === 'track_conversion_event') {
      const { assignmentId, eventType, eventValue = 0 } = payload;

      const assignments = await base44.asServiceRole.entities.ABTestAssignment.filter({
        id: assignmentId
      });

      if (assignments.length === 0) {
        return Response.json({ error: 'Assignment not found' }, { status: 404 });
      }

      const assignment = assignments[0];
      const events = assignment.conversion_events || [];
      events.push({
        event_type: eventType,
        event_value: eventValue,
        occurred_at: new Date().toISOString()
      });

      await base44.asServiceRole.entities.ABTestAssignment.update(assignmentId, {
        conversion_events: events
      });

      return Response.json({ success: true });
    }

    // UPDATE POST-TEST METRICS
    if (action === 'update_post_test_metrics') {
      const { assignmentId } = payload;

      const assignments = await base44.asServiceRole.entities.ABTestAssignment.filter({
        id: assignmentId
      });

      if (assignments.length === 0) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      const assignment = assignments[0];

      // Get current lifecycle state
      const lifecycle = await base44.asServiceRole.entities.LifecycleState.filter({
        user_email: assignment.user_email
      });

      const retention = await base44.asServiceRole.entities.RetentionState.filter({
        user_email: assignment.user_email
      });

      const sessions7DaysAfter = retention.length > 0
        ? (retention[0].weekly_engagement?.[retention[0].weekly_engagement.length - 1]?.sessions || 0)
        : 0;

      await base44.asServiceRole.entities.ABTestAssignment.update(assignmentId, {
        lifecycle_state_after: lifecycle.length > 0 ? lifecycle[0].current_state : null,
        churn_risk_after: lifecycle.length > 0 ? lifecycle[0].churn_risk_score : null,
        sessions_7days_after: sessions7DaysAfter
      });

      return Response.json({ success: true });
    }

    // ANALYZE TEST RESULTS (Enhanced with Bayesian + MVT + Anomaly Detection)
    if (action === 'analyze_test_results') {
      const { testId, method = 'bayesian' } = payload;

      const assignments = await base44.asServiceRole.entities.ABTestAssignment.filter({
        test_id: testId
      });

      const tests = await base44.asServiceRole.entities.ABTest.filter({ id: testId });
      if (tests.length === 0) {
        return Response.json({ error: 'Test not found' }, { status: 404 });
      }

      const test = tests[0];
      const variants = test.variants || [];

      // Group by variant
      const variantResults = {};
      const timeSeriesData = {};
      
      variants.forEach(v => {
        variantResults[v.variant_id] = {
          variant_name: v.name,
          total_assigned: 0,
          intervention_shown: 0,
          clicked: 0,
          completed: 0,
          dismissed: 0,
          avg_churn_risk_change: 0,
          avg_sessions_change: 0,
          state_transitions: 0,
          conversion_rate: 0,
          conversions_by_day: []
        };
        timeSeriesData[v.variant_id] = [];
      });

      assignments.forEach(assignment => {
        const variantId = assignment.variant_id;
        if (!variantResults[variantId]) return;

        const result = variantResults[variantId];
        result.total_assigned++;

        if (assignment.intervention_shown) result.intervention_shown++;
        if (assignment.user_action === 'clicked') result.clicked++;
        if (assignment.user_action === 'completed') result.completed++;
        if (assignment.user_action === 'dismissed') result.dismissed++;

        if (assignment.churn_risk_before != null && assignment.churn_risk_after != null) {
          result.avg_churn_risk_change += (assignment.churn_risk_after - assignment.churn_risk_before);
        }

        if (assignment.sessions_7days_before != null && assignment.sessions_7days_after != null) {
          result.avg_sessions_change += (assignment.sessions_7days_after - assignment.sessions_7days_before);
        }

        if (assignment.lifecycle_state_before !== assignment.lifecycle_state_after) {
          result.state_transitions++;
        }

        // Track daily conversions for anomaly detection
        const day = assignment.assigned_at?.split('T')[0];
        if (day) {
          timeSeriesData[variantId].push({
            date: day,
            converted: assignment.user_action === 'clicked' ? 1 : 0,
            shown: assignment.intervention_shown ? 1 : 0
          });
        }
      });

      // Calculate averages and daily conversion rates
      Object.keys(variantResults).forEach(variantId => {
        const result = variantResults[variantId];
        if (result.total_assigned > 0) {
          result.avg_churn_risk_change = result.avg_churn_risk_change / result.total_assigned;
          result.avg_sessions_change = result.avg_sessions_change / result.total_assigned;
          result.conversion_rate = result.intervention_shown > 0 
            ? (result.clicked / result.intervention_shown) * 100 
            : 0;
        }

        // Aggregate daily stats
        const dailyStats = {};
        timeSeriesData[variantId].forEach(item => {
          if (!dailyStats[item.date]) {
            dailyStats[item.date] = { shown: 0, converted: 0 };
          }
          dailyStats[item.date].shown += item.shown;
          dailyStats[item.date].converted += item.converted;
        });

        result.conversions_by_day = Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          conversion_rate: stats.shown > 0 ? (stats.converted / stats.shown) * 100 : 0,
          shown: stats.shown
        })).sort((a, b) => a.date.localeCompare(b.date));
      });

      // Bayesian Analysis
      const bayesianResults = method === 'bayesian' 
        ? calculateBayesianStats(variantResults) 
        : null;

      // Multi-Variate Test (MVT) Interaction Effects
      const mvtResults = variants.length > 2 
        ? calculateMVTInteractionEffects(variantResults, assignments) 
        : null;

      // Anomaly Detection
      const anomalies = detectAnomalies(variantResults);

      // Traditional frequentist analysis
      const primaryMetric = test.success_metrics?.primary_metric || 'click_through_rate';
      let winningVariant = null;
      let bestScore = -Infinity;

      Object.entries(variantResults).forEach(([variantId, result]) => {
        let score = 0;
        if (primaryMetric === 'click_through_rate') score = result.conversion_rate;
        if (primaryMetric === 'action_completion') score = result.completed;
        if (primaryMetric === 'state_transition') score = result.state_transitions;
        if (primaryMetric === 'churn_reduction') score = -result.avg_churn_risk_change;
        if (primaryMetric === 'session_increase') score = result.avg_sessions_change;

        if (score > bestScore) {
          bestScore = score;
          winningVariant = variantId;
        }
      });

      const controlVariant = variants[0]?.variant_id;
      const confidenceLevel = calculateConfidence(
        variantResults[controlVariant],
        variantResults[winningVariant]
      );

      const improvement = controlVariant && winningVariant !== controlVariant
        ? ((variantResults[winningVariant].conversion_rate - variantResults[controlVariant].conversion_rate) / variantResults[controlVariant].conversion_rate) * 100
        : 0;

      // Update test with results
      await base44.asServiceRole.entities.ABTest.update(testId, {
        results_summary: {
          total_users_assigned: assignments.length,
          winning_variant: winningVariant,
          confidence_level: confidenceLevel,
          improvement_percentage: improvement,
          bayesian_probability: bayesianResults ? bayesianResults[winningVariant]?.probability_to_be_best : null,
          anomalies_detected: anomalies.length
        }
      });

      return Response.json({
        success: true,
        variant_results: variantResults,
        winning_variant: winningVariant,
        confidence_level: confidenceLevel,
        improvement_percentage: improvement,
        total_assignments: assignments.length,
        bayesian_analysis: bayesianResults,
        mvt_analysis: mvtResults,
        anomalies: anomalies,
        method
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('A/B Test Engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper: Select variant based on traffic allocation
function selectVariant(variants) {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const variant of variants) {
    cumulative += variant.traffic_allocation || 0;
    if (random <= cumulative) {
      return variant;
    }
  }

  return variants[0]; // Fallback to first variant
}

// Helper: Calculate confidence level (simplified)
function calculateConfidence(control, treatment) {
  if (!control || !treatment) return 0;
  if (control.total_assigned < 30 || treatment.total_assigned < 30) return 0;

  const p1 = control.clicked / control.intervention_shown || 0;
  const p2 = treatment.clicked / treatment.intervention_shown || 0;
  const n1 = control.intervention_shown;
  const n2 = treatment.intervention_shown;

  if (n1 === 0 || n2 === 0) return 0;

  const pooled = (control.clicked + treatment.clicked) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = Math.abs(p1 - p2) / se;

  // Convert z-score to confidence (simplified)
  if (z > 2.576) return 99; // 99% confidence
  if (z > 1.96) return 95; // 95% confidence
  if (z > 1.645) return 90; // 90% confidence
  return Math.round(z * 50); // Rough approximation
}

// Bayesian Statistics - Beta Distribution for conversion rates
function calculateBayesianStats(variantResults) {
  const bayesianResults = {};
  const variantIds = Object.keys(variantResults);
  
  // Prior: Beta(1, 1) - uniform prior
  const alpha_prior = 1;
  const beta_prior = 1;

  // Calculate posterior for each variant
  variantIds.forEach(variantId => {
    const result = variantResults[variantId];
    const successes = result.clicked;
    const failures = result.intervention_shown - result.clicked;
    
    // Posterior: Beta(alpha + successes, beta + failures)
    const alpha_post = alpha_prior + successes;
    const beta_post = beta_prior + failures;
    
    // Expected value (mean of Beta distribution)
    const expected_conversion = alpha_post / (alpha_post + beta_post);
    
    // 95% Credible Interval using approximate formula
    const variance = (alpha_post * beta_post) / (Math.pow(alpha_post + beta_post, 2) * (alpha_post + beta_post + 1));
    const stddev = Math.sqrt(variance);
    const credible_interval_low = Math.max(0, expected_conversion - 1.96 * stddev);
    const credible_interval_high = Math.min(1, expected_conversion + 1.96 * stddev);
    
    bayesianResults[variantId] = {
      variant_name: result.variant_name,
      expected_conversion: expected_conversion * 100,
      credible_interval: [credible_interval_low * 100, credible_interval_high * 100],
      alpha: alpha_post,
      beta: beta_post,
      sample_size: result.intervention_shown
    };
  });

  // Monte Carlo simulation to calculate probability of being best
  const simulations = 10000;
  const winCounts = {};
  variantIds.forEach(id => winCounts[id] = 0);

  for (let i = 0; i < simulations; i++) {
    const samples = {};
    variantIds.forEach(variantId => {
      const params = bayesianResults[variantId];
      // Beta random sample using simplified method
      samples[variantId] = betaRandom(params.alpha, params.beta);
    });

    // Find winner in this simulation
    let maxSample = -1;
    let winner = null;
    Object.entries(samples).forEach(([id, sample]) => {
      if (sample > maxSample) {
        maxSample = sample;
        winner = id;
      }
    });
    
    if (winner) winCounts[winner]++;
  }

  // Add probability to be best
  variantIds.forEach(variantId => {
    bayesianResults[variantId].probability_to_be_best = (winCounts[variantId] / simulations) * 100;
  });

  return bayesianResults;
}

// Beta random number generator (approximate using normal approximation for large n)
function betaRandom(alpha, beta) {
  if (alpha + beta < 50) {
    // Simple rejection sampling for small samples
    return Math.random(); // Simplified - would use better method in production
  }
  
  // Normal approximation for large samples
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const sample = normalRandom(mean, Math.sqrt(variance));
  return Math.max(0, Math.min(1, sample));
}

// Box-Muller transform for normal random
function normalRandom(mean, stddev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stddev;
}

// Multi-Variate Testing: Calculate interaction effects between variants
function calculateMVTInteractionEffects(variantResults, assignments) {
  const variantIds = Object.keys(variantResults);
  
  if (variantIds.length < 3) {
    return null; // Need at least 3 variants for meaningful MVT
  }

  const interactions = [];
  
  // Check for interaction effects by comparing combined performance
  for (let i = 0; i < variantIds.length; i++) {
    for (let j = i + 1; j < variantIds.length; j++) {
      const v1 = variantResults[variantIds[i]];
      const v2 = variantResults[variantIds[j]];
      
      // Expected additive effect
      const expectedEffect = (v1.conversion_rate + v2.conversion_rate) / 2;
      
      // Actual combined effect (users who saw both or similar patterns)
      const combinedConversions = (v1.clicked + v2.clicked);
      const combinedShown = (v1.intervention_shown + v2.intervention_shown);
      const actualEffect = combinedShown > 0 ? (combinedConversions / combinedShown) * 100 : 0;
      
      // Interaction effect (deviation from additivity)
      const interactionEffect = actualEffect - expectedEffect;
      
      interactions.push({
        variant_a: v1.variant_name,
        variant_b: v2.variant_name,
        expected_combined: expectedEffect,
        actual_combined: actualEffect,
        interaction_effect: interactionEffect,
        synergy: interactionEffect > 1 ? 'positive' : interactionEffect < -1 ? 'negative' : 'neutral'
      });
    }
  }
  
  return {
    interactions,
    has_significant_interactions: interactions.some(i => Math.abs(i.interaction_effect) > 5)
  };
}

// Anomaly Detection: Detect unexpected performance shifts
function detectAnomalies(variantResults) {
  const anomalies = [];
  
  Object.entries(variantResults).forEach(([variantId, result]) => {
    if (result.conversions_by_day.length < 3) return; // Need at least 3 days
    
    const rates = result.conversions_by_day.map(d => d.conversion_rate);
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
    const stddev = Math.sqrt(variance);
    
    // Detect outliers (> 3 standard deviations)
    result.conversions_by_day.forEach(day => {
      const zScore = Math.abs((day.conversion_rate - mean) / stddev);
      
      if (zScore > 3 && day.shown >= 10) { // Only flag if sufficient sample
        anomalies.push({
          variant_id: variantId,
          variant_name: result.variant_name,
          date: day.date,
          conversion_rate: day.conversion_rate,
          expected_rate: mean,
          z_score: zScore,
          severity: zScore > 4 ? 'critical' : 'warning',
          type: day.conversion_rate > mean ? 'spike' : 'drop',
          sample_size: day.shown
        });
      }
    });
    
    // Detect sustained trends (monotonic increase/decrease over 5+ days)
    if (rates.length >= 5) {
      const recent = rates.slice(-5);
      const increasing = recent.every((val, idx, arr) => idx === 0 || val >= arr[idx - 1]);
      const decreasing = recent.every((val, idx, arr) => idx === 0 || val <= arr[idx - 1]);
      
      if (increasing || decreasing) {
        const trendChange = ((recent[recent.length - 1] - recent[0]) / recent[0]) * 100;
        
        if (Math.abs(trendChange) > 20) { // 20% change over 5 days
          anomalies.push({
            variant_id: variantId,
            variant_name: result.variant_name,
            date: result.conversions_by_day[result.conversions_by_day.length - 1].date,
            type: increasing ? 'sustained_increase' : 'sustained_decrease',
            trend_change_pct: trendChange,
            severity: Math.abs(trendChange) > 50 ? 'critical' : 'warning',
            days: 5
          });
        }
      }
    }
  });
  
  return anomalies;
}