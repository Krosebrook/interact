import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Lifecycle State Engine: Orchestrates user journey across all stages
 * Detects state transitions and coordinates interventions
 */

const LIFECYCLE_STATES = {
  new: {
    name: 'New User',
    description: 'Just signed up, onboarding in progress',
    entry_criteria: { days_since_signup: 0 },
    characteristics: ['completing_onboarding', 'exploring_platform']
  },
  activated: {
    name: 'Activated',
    description: 'Completed first meaningful action',
    entry_criteria: { first_meaningful_action: true },
    characteristics: ['initial_momentum', 'testing_features']
  },
  engaged: {
    name: 'Engaged',
    description: 'Regular active user, building habits',
    entry_criteria: { sessions_per_week: 2, weeks_active: 2 },
    characteristics: ['consistent_usage', 'habit_formation', 'feature_discovery']
  },
  power_user: {
    name: 'Power User',
    description: 'Advanced user, unlocked tiers, high value',
    entry_criteria: { unlocked_tiers: 1, sessions_per_week: 3 },
    characteristics: ['advanced_features', 'team_advocate', 'high_retention']
  },
  at_risk: {
    name: 'At-Risk',
    description: 'Declining engagement, needs intervention',
    entry_criteria: { engagement_drop: 0.4, days_without_activity: 7 },
    characteristics: ['declining_activity', 'abandoned_flows', 'ignored_nudges']
  },
  dormant: {
    name: 'Dormant',
    description: 'Inactive for 21+ days, needs reactivation',
    entry_criteria: { days_without_activity: 21 },
    characteristics: ['no_recent_sessions', 'cold_contact_eligible']
  },
  returning: {
    name: 'Returning',
    description: 'Dormant user re-engaged, context restoration',
    entry_criteria: { was_dormant: true, session_triggered: true },
    characteristics: ['re_entry', 'context_aware', 'momentum_building']
  }
};

const STATE_TRANSITIONS = {
  new_to_activated: { requires: ['first_meaningful_action'] },
  activated_to_engaged: { requires: ['consistent_weekly_sessions'] },
  engaged_to_power_user: { requires: ['unlocked_capability_tier'] },
  engaged_to_at_risk: { requires: ['engagement_decline_40pct', 'no_activity_7days'] },
  at_risk_to_dormant: { requires: ['no_activity_21days'] },
  dormant_to_returning: { requires: ['re_entry_action'] },
  at_risk_to_engaged: { requires: ['activity_resumption'] },
  dormant_to_engaged: { requires: ['activity_resumption'] }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userEmail = user.email } = await req.json();

    // GET OR CREATE LIFECYCLE STATE
    if (action === 'get_or_create_state') {
      const existing = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (existing.length > 0) {
        return Response.json({ success: true, state: existing[0] });
      }

      const newState = await base44.entities.LifecycleState.create({
        user_email: userEmail,
        current_state: 'new',
        state_entered_at: new Date().toISOString(),
        state_history: [],
        created_at: new Date().toISOString()
      });

      return Response.json({ success: true, state: newState, created: true });
    }

    // DETECT STATE TRANSITION
    if (action === 'detect_state_transition') {
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) {
        return Response.json({ error: 'No lifecycle state' }, { status: 404 });
      }

      const state = lifecycle[0];
      const activation = await base44.entities.ActivationState.filter({
        user_email: userEmail
      });
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });
      const powerUser = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      // Gather signals
      const isActivated = activation.length > 0 && activation[0].is_activated;
      const hasActiveHabits = retention.length > 0 && retention[0].current_week_streak > 0;
      const weeklyVisits = retention.length > 0 ? retention[0].weekly_engagement?.length || 0 : 0;
      const unlockedTiers = powerUser.length > 0 ? powerUser[0].unlocked_tiers?.length || 0 : 0;
      const lastActivityDays = calculateDaysSinceActivity(retention.length > 0 ? retention[0] : null);
      const engagementTrend = calculateEngagementTrend(retention.length > 0 ? retention[0] : null);

      // Determine next state
      let nextState = state.current_state;

      if (state.current_state === 'new' && isActivated) {
        nextState = 'activated';
      } else if (state.current_state === 'activated' && weeklyVisits >= 2 && hasActiveHabits) {
        nextState = 'engaged';
      } else if (state.current_state === 'engaged' && unlockedTiers > 0) {
        nextState = 'power_user';
      } else if (state.current_state === 'engaged' && engagementTrend < -40 && lastActivityDays > 7) {
        nextState = 'at_risk';
      } else if (state.current_state === 'at_risk' && lastActivityDays > 21) {
        nextState = 'dormant';
      }

      // Handle returning users
      if (state.current_state === 'dormant' && lastActivityDays < 7) {
        nextState = 'returning';
      }

      // Transition if state changed
      if (nextState !== state.current_state) {
        const newHistory = [...(state.state_history || [])];
        newHistory.push({
          state: state.current_state,
          entered_at: state.state_entered_at,
          exited_at: new Date().toISOString(),
          duration_days: calculateDaysSince(new Date(state.state_entered_at))
        });

        await base44.entities.LifecycleState.update(lifecycle[0].id, {
          current_state: nextState,
          previous_state: state.current_state,
          state_entered_at: new Date().toISOString(),
          state_history: newHistory
        });

        return Response.json({
          success: true,
          transitioned: true,
          from: state.current_state,
          to: nextState
        });
      }

      return Response.json({ success: true, transitioned: false, current: state.current_state });
    }

    // CALCULATE CHURN RISK
    if (action === 'calculate_churn_risk') {
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) {
        return Response.json({ error: 'No state' }, { status: 404 });
      }

      const state = lifecycle[0];
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      let riskScore = 50; // Baseline

      if (retention.length > 0) {
        const retState = retention[0];
        const engagement = retState.current_week_streak || 0;
        const lastActivity = retState.discovery_loop?.last_triggered || retState.created_at;
        const inactivityDays = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));

        // Reduce risk for active users
        if (engagement >= 3) riskScore -= 30;
        if (engagement >= 1) riskScore -= 15;

        // Increase risk for inactivity
        if (inactivityDays > 7) riskScore += 20;
        if (inactivityDays > 14) riskScore += 20;
        if (inactivityDays > 21) riskScore += 15;
      }

      const riskSignals = {
        engagement_decline: Math.max(0, Math.min(100, (lifecycle[0].churn_signals?.engagement_decline || 0))),
        abandoned_flows: state.churn_signals?.abandoned_flows || 0,
        ignored_nudges: state.churn_signals?.ignored_nudges || 0,
        missed_habit_loops: state.churn_signals?.missed_habit_loops || 0,
        inactivity_days: calculateDaysSinceActivity(retention.length > 0 ? retention[0] : null)
      };

      const finalRisk = Math.max(0, Math.min(100, riskScore));

      await base44.entities.LifecycleState.update(lifecycle[0].id, {
        churn_risk_score: finalRisk,
        churn_signals: riskSignals
      });

      return Response.json({
        success: true,
        churn_risk_score: finalRisk,
        risk_level: finalRisk > 70 ? 'high' : finalRisk > 40 ? 'medium' : 'low',
        signals: riskSignals
      });
    }

    // SAVE CONTEXT SNAPSHOT
    if (action === 'save_context_snapshot') {
      const { deals = [], insights = [], communities = [] } = await req.json();
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) return Response.json({ success: true });

      await base44.entities.LifecycleState.update(lifecycle[0].id, {
        context_snapshots: {
          last_viewed_deals: deals,
          last_viewed_insights: insights,
          last_communities_joined: communities,
          saved_at: new Date().toISOString()
        }
      });

      return Response.json({ success: true });
    }

    // UPDATE PERSONALIZATION LEVEL
    if (action === 'update_personalization_level') {
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) return Response.json({ success: true });

      const state = lifecycle[0];
      const daysActive = calculateDaysSince(new Date(state.created_at));
      let newLevel = 'onboarding';

      if (daysActive > 30 && state.current_state === 'engaged') newLevel = 'learning';
      if (daysActive > 60 && state.current_state === 'engaged') newLevel = 'autonomous';
      if (state.current_state === 'power_user') newLevel = 'expert';

      await base44.entities.LifecycleState.update(lifecycle[0].id, {
        personalization_level: newLevel
      });

      return Response.json({ success: true, personalization_level: newLevel });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Lifecycle state engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateDaysSinceActivity(retentionState) {
  if (!retentionState) return 999;
  const lastActivity = retentionState.discovery_loop?.last_triggered || retentionState.created_at;
  return Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
}

function calculateEngagementTrend(retentionState) {
  if (!retentionState || !retentionState.weekly_engagement) return 0;
  const weekly = retentionState.weekly_engagement;
  if (weekly.length < 2) return 0;

  const recent = weekly[weekly.length - 1]?.sessions || 0;
  const previous = weekly[weekly.length - 2]?.sessions || 1;

  return ((recent - previous) / previous) * 100;
}

function calculateDaysSince(startDate) {
  return Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
}