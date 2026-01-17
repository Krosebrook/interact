import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Power-User Detection Engine
 * Identifies users ready for advanced capabilities based on behavioral signals
 */

const POWER_USER_THRESHOLDS = {
  tier1_discovery: {
    name: 'Advanced Discovery',
    signals: {
      deal_momentum: {
        saved_deals: { min: 5, weight: 1 },
        deals_compared: { min: 3, weight: 0.8 },
        required_score: 0.7
      }
    },
    features: ['deal_comparisons', 'saved_collections', 'strategy_explanations']
  },
  tier2_intelligence: {
    name: 'Portfolio Intelligence',
    signals: {
      portfolio_engagement: {
        goals_viewed: { min: 2, weight: 1 },
        goals_adjusted: { min: 1, weight: 0.9 },
        analytics_sessions: { min: 3, weight: 0.8 },
        required_score: 0.6
      }
    },
    features: ['scenario_modeling', 'projections', 'goal_mapping']
  },
  tier3_network: {
    name: 'Network & Signal Amplification',
    signals: {
      community_engagement: {
        communities_joined: { min: 1, weight: 0.7 },
        experts_followed: { min: 2, weight: 1 },
        social_interactions: { min: 3, weight: 0.8 },
        required_score: 0.65
      }
    },
    features: ['expert_follows', 'signal_boosting', 'premium_communities']
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userEmail = user.email } = await req.json();

    // GET OR CREATE POWER USER STATE
    if (action === 'get_or_create_state') {
      const existing = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (existing.length > 0) {
        return Response.json({ success: true, state: existing[0] });
      }

      const newState = await base44.entities.PowerUserState.create({
        user_email: userEmail,
        power_user_tier: 'free',
        unlocked_tiers: [],
        created_at: new Date().toISOString()
      });

      return Response.json({ success: true, state: newState, created: true });
    }

    // DETECT POWER-USER SIGNALS
    if (action === 'detect_signals') {
      const existing = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) {
        return Response.json({ error: 'No power user state' }, { status: 404 });
      }

      const state = existing[0];
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (retention.length === 0) {
        return Response.json({ error: 'No retention data' }, { status: 404 });
      }

      const retState = retention[0];

      // Calculate signal strength for each tier
      const signals = {
        deal_momentum: calculateDealMomentum(retState),
        portfolio_engagement: calculatePortfolioEngagement(retState),
        community_engagement: calculateCommunityEngagement(retState)
      };

      // Update signal status
      state.signal_status = {
        deal_momentum: {
          deals_saved: retState.discovery_loop?.deals_saved_from_loop || 0,
          deals_compared: 0,
          signal_strength: signals.deal_momentum.score,
          threshold_met: signals.deal_momentum.threshold_met
        },
        portfolio_engagement: {
          goals_viewed: retState.insight_loop?.total_activations || 0,
          goals_adjusted: retState.insight_loop?.portfolio_adjustments || 0,
          analytics_sessions: 0,
          signal_strength: signals.portfolio_engagement.score,
          threshold_met: signals.portfolio_engagement.threshold_met
        },
        community_engagement: {
          communities_joined: retState.social_loop?.communities_joined || 0,
          experts_followed: retState.social_loop?.experts_followed || 0,
          social_interactions: retState.social_loop?.social_interactions || 0,
          signal_strength: signals.community_engagement.score,
          threshold_met: signals.community_engagement.threshold_met
        }
      };

      await base44.entities.PowerUserState.update(existing[0].id, {
        signal_status: state.signal_status
      });

      return Response.json({
        success: true,
        signals,
        state: state.signal_status
      });
    }

    // CHECK UNLOCK ELIGIBILITY
    if (action === 'check_unlock_eligibility') {
      const existing = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) {
        return Response.json({ error: 'No state' }, { status: 404 });
      }

      const state = existing[0];
      const eligibleTiers = [];
      const nextTier = null;

      // Check each tier
      if (state.signal_status?.deal_momentum?.threshold_met && !state.unlocked_tiers?.includes('tier1_discovery')) {
        eligibleTiers.push('tier1_discovery');
      }
      if (state.signal_status?.portfolio_engagement?.threshold_met && !state.unlocked_tiers?.includes('tier2_intelligence')) {
        eligibleTiers.push('tier2_intelligence');
      }
      if (state.signal_status?.community_engagement?.threshold_met && !state.unlocked_tiers?.includes('tier3_network')) {
        eligibleTiers.push('tier3_network');
      }

      return Response.json({
        success: true,
        eligible_tiers: eligibleTiers,
        state: {
          current_tier: state.power_user_tier,
          unlocked_tiers: state.unlocked_tiers
        }
      });
    }

    // UNLOCK TIER
    if (action === 'unlock_tier') {
      const { tier_name } = await req.json();
      const existing = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) {
        return Response.json({ error: 'No state' }, { status: 404 });
      }

      const state = existing[0];
      const newUnlocked = [...(state.unlocked_tiers || []), tier_name];

      const tierData = {
        unlocked_at: new Date().toISOString(),
        features_used: {}
      };

      await base44.entities.PowerUserState.update(existing[0].id, {
        power_user_tier: tier_name,
        unlocked_tiers: newUnlocked,
        [tier_name]: tierData
      });

      return Response.json({
        success: true,
        tier: tier_name,
        features: POWER_USER_THRESHOLDS[tier_name].features
      });
    }

    // CALCULATE TIER PROGRESS
    if (action === 'calculate_tier_progress') {
      const existing = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) {
        return Response.json({ error: 'No state' }, { status: 404 });
      }

      const state = existing[0];
      const signals = state.signal_status || {};

      const tierProgress = [
        {
          tier_name: 'tier1_discovery',
          progress_percentage: Math.min(
            (signals.deal_momentum?.signal_strength || 0) * 100,
            100
          ),
          signals_met: signals.deal_momentum?.threshold_met ? 1 : 0,
          signals_required: 1
        },
        {
          tier_name: 'tier2_intelligence',
          progress_percentage: Math.min(
            (signals.portfolio_engagement?.signal_strength || 0) * 100,
            100
          ),
          signals_met: signals.portfolio_engagement?.threshold_met ? 1 : 0,
          signals_required: 1
        },
        {
          tier_name: 'tier3_network',
          progress_percentage: Math.min(
            (signals.community_engagement?.signal_strength || 0) * 100,
            100
          ),
          signals_met: signals.community_engagement?.threshold_met ? 1 : 0,
          signals_required: 1
        }
      ];

      await base44.entities.PowerUserState.update(existing[0].id, {
        tier_progress: tierProgress
      });

      return Response.json({
        success: true,
        tier_progress: tierProgress
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Power user detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateDealMomentum(retentionState) {
  const savedDeals = retentionState.discovery_loop?.deals_saved_from_loop || 0;
  const compared = retentionState.discovery_loop?.momentum_streak || 0;

  const savedScore = Math.min(savedDeals / 5, 1);
  const compareScore = Math.min(compared / 3, 1);
  const combinedScore = (savedScore * 0.6 + compareScore * 0.4);

  return {
    score: combinedScore,
    threshold_met: combinedScore >= 0.7,
    details: { savedDeals, compared }
  };
}

function calculatePortfolioEngagement(retentionState) {
  const goalsViewed = retentionState.insight_loop?.total_activations || 0;
  const goalsAdjusted = retentionState.insight_loop?.portfolio_adjustments || 0;
  const analyticsSessions = goalsViewed; // Proxy

  const viewScore = Math.min(goalsViewed / 2, 1);
  const adjustScore = Math.min(goalsAdjusted / 1, 1);
  const analyticsScore = Math.min(analyticsSessions / 3, 1);

  const combinedScore = (viewScore * 0.4 + adjustScore * 0.45 + analyticsScore * 0.15);

  return {
    score: combinedScore,
    threshold_met: combinedScore >= 0.6,
    details: { goalsViewed, goalsAdjusted, analyticsSessions }
  };
}

function calculateCommunityEngagement(retentionState) {
  const communityJoined = retentionState.social_loop?.communities_joined || 0;
  const expertsFollowed = retentionState.social_loop?.experts_followed || 0;
  const socialInteractions = retentionState.social_loop?.social_interactions || 0;

  const communityScore = Math.min(communityJoined / 1, 1);
  const expertScore = Math.min(expertsFollowed / 2, 1);
  const interactionScore = Math.min(socialInteractions / 3, 1);

  const combinedScore = (communityScore * 0.25 + expertScore * 0.5 + interactionScore * 0.25);

  return {
    score: combinedScore,
    threshold_met: combinedScore >= 0.65,
    details: { communityJoined, expertsFollowed, socialInteractions }
  };
}