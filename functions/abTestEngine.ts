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

    const { action } = await req.json();

    // GET ACTIVE TESTS FOR STATE
    if (action === 'get_active_tests_for_state') {
      const { lifecycleState } = await req.json();
      
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
      const { testId, userEmail, lifecycleState } = await req.json();

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
      const { assignmentId } = await req.json();

      await base44.asServiceRole.entities.ABTestAssignment.update(assignmentId, {
        intervention_shown: true,
        shown_at: new Date().toISOString()
      });

      return Response.json({ success: true });
    }

    // TRACK USER ACTION
    if (action === 'track_user_action') {
      const { assignmentId, actionType } = await req.json();

      await base44.asServiceRole.entities.ABTestAssignment.update(assignmentId, {
        user_action: actionType,
        action_at: new Date().toISOString()
      });

      return Response.json({ success: true });
    }

    // TRACK CONVERSION EVENT
    if (action === 'track_conversion_event') {
      const { assignmentId, eventType, eventValue = 0 } = await req.json();

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
      const { assignmentId } = await req.json();

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

    // ANALYZE TEST RESULTS
    if (action === 'analyze_test_results') {
      const { testId } = await req.json();

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
          conversion_rate: 0
        };
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
      });

      // Calculate averages
      Object.keys(variantResults).forEach(variantId => {
        const result = variantResults[variantId];
        if (result.total_assigned > 0) {
          result.avg_churn_risk_change = result.avg_churn_risk_change / result.total_assigned;
          result.avg_sessions_change = result.avg_sessions_change / result.total_assigned;
          result.conversion_rate = (result.clicked / result.intervention_shown) * 100;
        }
      });

      // Determine winner (based on primary metric)
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

      // Calculate statistical significance (simplified chi-square)
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
          improvement_percentage: improvement
        }
      });

      return Response.json({
        success: true,
        variant_results: variantResults,
        winning_variant: winningVariant,
        confidence_level: confidenceLevel,
        improvement_percentage: improvement,
        total_assignments: assignments.length
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