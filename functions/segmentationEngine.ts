import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * User Segmentation Engine
 * Creates and manages custom user segments for targeted interventions
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, ...params } = await req.json();

    switch (action) {
      case 'calculate_segment':
        return await calculateSegment(base44, params);
      
      case 'get_segment_users':
        return await getSegmentUsers(base44, params);
      
      case 'refresh_all_segments':
        return await refreshAllSegments(base44);
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Segmentation engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function calculateSegment(base44, { segment_id }) {
  const segments = await base44.asServiceRole.entities.UserSegment.filter({ id: segment_id });
  if (segments.length === 0) {
    return Response.json({ error: 'Segment not found' }, { status: 404 });
  }

  const segment = segments[0];
  const users = await findMatchingUsers(base44, segment.criteria);

  await base44.asServiceRole.entities.UserSegment.update(segment_id, {
    user_count: users.length,
    last_calculated: new Date().toISOString()
  });

  return Response.json({
    success: true,
    segment_name: segment.segment_name,
    user_count: users.length,
    sample_users: users.slice(0, 10).map(u => u.user_email)
  });
}

async function getSegmentUsers(base44, { segment_id }) {
  const segments = await base44.asServiceRole.entities.UserSegment.filter({ id: segment_id });
  if (segments.length === 0) {
    return Response.json({ error: 'Segment not found' }, { status: 404 });
  }

  const segment = segments[0];
  const users = await findMatchingUsers(base44, segment.criteria);

  return Response.json({
    success: true,
    users: users.map(u => ({
      email: u.user_email,
      lifecycle_state: u.lifecycle_state,
      churn_risk: u.churn_risk_score
    }))
  });
}

async function refreshAllSegments(base44) {
  const segments = await base44.asServiceRole.entities.UserSegment.filter({ is_active: true });
  
  const results = [];
  for (const segment of segments) {
    const users = await findMatchingUsers(base44, segment.criteria);
    
    await base44.asServiceRole.entities.UserSegment.update(segment.id, {
      user_count: users.length,
      last_calculated: new Date().toISOString()
    });

    results.push({
      segment_id: segment.id,
      segment_name: segment.segment_name,
      user_count: users.length
    });
  }

  return Response.json({ success: true, results });
}

async function findMatchingUsers(base44, criteria) {
  // Get all lifecycle states
  let lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();

  // Filter by lifecycle states
  if (criteria.lifecycle_states && criteria.lifecycle_states.length > 0) {
    lifecycleStates = lifecycleStates.filter(state => 
      criteria.lifecycle_states.includes(state.current_state)
    );
  }

  // Filter by churn risk
  if (criteria.churn_risk_min !== undefined) {
    lifecycleStates = lifecycleStates.filter(state => 
      state.churn_risk_score >= criteria.churn_risk_min
    );
  }
  if (criteria.churn_risk_max !== undefined) {
    lifecycleStates = lifecycleStates.filter(state => 
      state.churn_risk_score <= criteria.churn_risk_max
    );
  }

  // Filter by days in state
  if (criteria.days_in_state_min !== undefined || criteria.days_in_state_max !== undefined) {
    lifecycleStates = lifecycleStates.filter(state => {
      const daysInState = calculateDaysInState(state);
      if (criteria.days_in_state_min !== undefined && daysInState < criteria.days_in_state_min) return false;
      if (criteria.days_in_state_max !== undefined && daysInState > criteria.days_in_state_max) return false;
      return true;
    });
  }

  // Filter by A/B test participation
  if (criteria.abtest_participation && criteria.abtest_participation.length > 0) {
    const userEmails = lifecycleStates.map(s => s.user_email);
    const assignments = await base44.asServiceRole.entities.ABTestAssignment.list();
    
    const participatingUsers = new Set(
      assignments
        .filter(a => criteria.abtest_participation.includes(a.test_id))
        .map(a => a.user_email)
    );

    lifecycleStates = lifecycleStates.filter(state => 
      participatingUsers.has(state.user_email)
    );
  }

  // Filter by intervention history
  if (criteria.intervention_history) {
    const deliveries = await base44.asServiceRole.entities.InterventionDeliveryLog.list();
    const userStats = {};

    deliveries.forEach(d => {
      if (!userStats[d.user_email]) {
        userStats[d.user_email] = { received: 0, dismissed: 0, converted: 0 };
      }
      userStats[d.user_email].received++;
      if (d.status === 'dismissed') userStats[d.user_email].dismissed++;
      if (d.status === 'converted') userStats[d.user_email].converted++;
    });

    lifecycleStates = lifecycleStates.filter(state => {
      const stats = userStats[state.user_email] || { received: 0, dismissed: 0, converted: 0 };
      const conversionRate = stats.received > 0 ? (stats.converted / stats.received) * 100 : 0;

      if (criteria.intervention_history.received_count_min && stats.received < criteria.intervention_history.received_count_min) return false;
      if (criteria.intervention_history.dismissed_count_max && stats.dismissed > criteria.intervention_history.dismissed_count_max) return false;
      if (criteria.intervention_history.conversion_rate_min && conversionRate < criteria.intervention_history.conversion_rate_min) return false;

      return true;
    });
  }

  // Filter by behavioral data
  if (criteria.behavioral_data) {
    if (criteria.behavioral_data.session_frequency_min !== undefined) {
      const retentionStates = await base44.asServiceRole.entities.RetentionState.list();
      const highActivityUsers = new Set(
        retentionStates
          .filter(r => {
            const recentWeek = r.weekly_engagement?.[0];
            return recentWeek && recentWeek.sessions >= criteria.behavioral_data.session_frequency_min;
          })
          .map(r => r.user_email)
      );

      lifecycleStates = lifecycleStates.filter(state => 
        highActivityUsers.has(state.user_email)
      );
    }

    if (criteria.behavioral_data.last_activity_days_ago_max !== undefined) {
      lifecycleStates = lifecycleStates.filter(state => {
        const lastActivity = state.lifecycle_metrics?.last_meaningful_activity;
        if (!lastActivity) return false;
        
        const daysSinceActivity = (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);
        return daysSinceActivity <= criteria.behavioral_data.last_activity_days_ago_max;
      });
    }
  }

  return lifecycleStates;
}

function calculateDaysInState(state) {
  if (!state.state_entered_at) return 0;
  const entered = new Date(state.state_entered_at);
  const now = new Date();
  return Math.floor((now - entered) / (1000 * 60 * 60 * 24));
}