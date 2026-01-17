import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Habit Loop Engine: Powers the 30-day retention system
 * Three habit loops: Discovery, Insight, Social
 */

const HABIT_LOOPS = {
  discovery_loop: {
    name: 'Discovery Loop',
    description: 'Deal momentum through personalized recommendations',
    triggers: ['deal_saved', 'deal_viewed', 'deal_compared'],
    cadence: 'on_action',
    reward_signals: ['relevance_improved', 'saves_increased']
  },
  insight_loop: {
    name: 'Insight Loop',
    description: 'Portfolio intelligence through analytics',
    triggers: ['analytics_viewed', 'portfolio_goal_reviewed', 'benchmark_checked'],
    cadence: 'on_action',
    reward_signals: ['confidence_increased', 'alignment_improved']
  },
  social_loop: {
    name: 'Social Loop',
    description: 'Community value through expert connections',
    triggers: ['community_viewed', 'expert_followed', 'discussion_observed'],
    cadence: 'on_action',
    reward_signals: ['credibility_gained', 'insights_received']
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userEmail = user.email, loopName, triggerAction } = await req.json();

    // GET OR CREATE RETENTION STATE
    if (action === 'get_or_create_retention_state') {
      const existing = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (existing.length > 0) {
        return Response.json({ success: true, state: existing[0] });
      }

      // Create new retention state
      const day30 = new Date();
      day30.setDate(day30.getDate() + 30);

      const newState = await base44.entities.RetentionState.create({
        user_email: userEmail,
        assigned_habit_loops: ['discovery_loop', 'insight_loop', 'social_loop'],
        discovery_loop: { is_active: false, total_activations: 0 },
        insight_loop: { is_active: false, total_activations: 0 },
        social_loop: { is_active: false, total_activations: 0 },
        created_at: new Date().toISOString(),
        day_30_at: day30.toISOString()
      });

      return Response.json({ success: true, state: newState, created: true });
    }

    // TRIGGER HABIT LOOP
    if (action === 'trigger_loop') {
      const existing = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) {
        return Response.json({ error: 'No retention state' }, { status: 404 });
      }

      const state = existing[0];
      const loopData = state[loopName] || {};

      // Update loop metrics
      loopData.is_active = true;
      loopData.last_triggered = new Date().toISOString();
      loopData.total_activations = (loopData.total_activations || 0) + 1;

      await base44.entities.RetentionState.update(existing[0].id, {
        [loopName]: loopData
      });

      // Generate loop content
      const loopContent = generateLoopContent(loopName, state);

      return Response.json({
        success: true,
        loop: HABIT_LOOPS[loopName],
        content: loopContent
      });
    }

    // TRACK LOOP ACTION
    if (action === 'track_loop_action') {
      const { loopName, actionType, metadata } = await req.json();
      const existing = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) return Response.json({ error: 'No state' }, { status: 404 });

      const state = existing[0];
      const loopData = state[loopName] || {};

      // Increment relevant counters
      if (actionType === 'deal_saved') {
        loopData.deals_saved_from_loop = (loopData.deals_saved_from_loop || 0) + 1;
        loopData.momentum_streak = (loopData.momentum_streak || 0) + 1;
      } else if (actionType === 'portfolio_adjustment') {
        const insights = state.insight_loop || {};
        insights.portfolio_adjustments = (insights.portfolio_adjustments || 0) + 1;
      } else if (actionType === 'social_interaction') {
        const social = state.social_loop || {};
        social.social_interactions = (social.social_interactions || 0) + 1;
      }

      await base44.entities.RetentionState.update(existing[0].id, {
        [loopName]: loopData
      });

      return Response.json({ success: true, action: actionType });
    }

    // UPDATE WEEKLY ENGAGEMENT
    if (action === 'update_weekly_engagement') {
      const existing = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) return Response.json({ error: 'No state' }, { status: 404 });

      const state = existing[0];
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const weekly = state.weekly_engagement || [];
      const currentWeek = weekly.find(w => w.week_starting === weekStartStr);

      if (currentWeek) {
        currentWeek.sessions = (currentWeek.sessions || 0) + 1;
        currentWeek.last_session = new Date().toISOString();
        currentWeek.meaningful_actions = Math.max(currentWeek.meaningful_actions || 0);
      } else {
        weekly.push({
          week_starting: weekStartStr,
          sessions: 1,
          meaningful_actions: 0,
          last_session: new Date().toISOString(),
          streak_maintained: true
        });
      }

      // Keep last 4 weeks
      const recentWeeks = weekly.slice(-4);

      // Check if streak maintained
      const hasThisWeekSession = weekly[weekly.length - 1]?.sessions > 0;
      const streakCount = hasThisWeekSession ? (state.total_visit_streak || 0) + 1 : 0;

      await base44.entities.RetentionState.update(existing[0].id, {
        weekly_engagement: recentWeeks,
        current_week_streak: hasThisWeekSession ? (state.current_week_streak || 0) + 1 : 0,
        total_visit_streak: streakCount
      });

      return Response.json({
        success: true,
        week_sessions: currentWeek?.sessions || 1,
        total_streak: streakCount
      });
    }

    // CALCULATE RETENTION RISK
    if (action === 'calculate_retention_risk') {
      const existing = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) return Response.json({ risk: 50 });

      const state = existing[0];
      let riskScore = 100; // Start high

      // Reduce risk for active engagement
      if (state.total_visit_streak > 2) riskScore -= 30;
      if (state.discovery_loop?.deals_saved_from_loop > 0) riskScore -= 20;
      if (state.insight_loop?.portfolio_adjustments > 0) riskScore -= 20;
      if (state.social_loop?.social_interactions > 0) riskScore -= 15;
      if (state.current_week_streak > 0) riskScore -= 10;

      // Increase risk for inactivity
      const lastActivity = state.discovery_loop?.last_triggered || state.created_at;
      const daysSinceActivity = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity > 7) riskScore += 20;
      if (daysSinceActivity > 14) riskScore += 20;

      const finalRisk = Math.max(0, Math.min(100, riskScore));

      await base44.entities.RetentionState.update(existing[0].id, {
        retention_risk_score: finalRisk
      });

      return Response.json({
        success: true,
        risk_score: finalRisk,
        risk_level: finalRisk > 70 ? 'high' : finalRisk > 40 ? 'medium' : 'low'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Habit loop engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateLoopContent(loopName, state) {
  const templates = {
    discovery_loop: {
      title: 'New Deals Matching Your Criteria',
      description: 'We found 3 deals that align with your interests.',
      cta: 'View Deals'
    },
    insight_loop: {
      title: 'Your Portfolio Snapshot',
      description: 'You're on track. Here's what changed this week.',
      cta: 'View Insights'
    },
    social_loop: {
      title: 'Experts Worth Following',
      description: 'People discussing topics you care about.',
      cta: 'Browse Experts'
    }
  };

  return templates[loopName] || {};
}