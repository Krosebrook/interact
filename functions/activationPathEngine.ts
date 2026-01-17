import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ACTIVATION_PATHS = {
  deal_first: {
    name: 'Deal First',
    description: 'Guided deal discovery and saving',
    milestones: [
      'first_deal_viewed',
      'first_deal_saved'
    ],
    guidance: [
      { step: 1, element: 'deal_card', message: 'View a deal that matches your criteria', action: 'view_deal' },
      { step: 2, element: 'save_button', message: 'Save deals to build your watchlist', action: 'save_deal' },
      { step: 3, element: 'deal_insights', message: 'See why this deal matches you', action: 'view_insights' }
    ]
  },
  portfolio_first: {
    name: 'Portfolio First',
    description: 'Setup goals and track progress',
    milestones: [
      'portfolio_goal_configured'
    ],
    guidance: [
      { step: 1, element: 'goals_form', message: 'Configure your investment goals', action: 'setup_goals' },
      { step: 2, element: 'benchmark', message: 'See projected outcomes vs benchmarks', action: 'view_benchmark' },
      { step: 3, element: 'deal_alignment', message: 'Explore deals aligned with your goals', action: 'browse_deals' }
    ]
  },
  community_first: {
    name: 'Community First',
    description: 'Join communities and follow experts',
    milestones: [
      'first_community_interaction',
      'expert_followed'
    ],
    guidance: [
      { step: 1, element: 'community_cards', message: 'Browse communities in your interest areas', action: 'view_communities' },
      { step: 2, element: 'join_button', message: 'Join 1-2 communities to start', action: 'join_community' },
      { step: 3, element: 'expert_profiles', message: 'Follow experts sharing insights', action: 'follow_expert' }
    ]
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

    // GET ONBOARDING DATA
    if (action === 'get_onboarding_profile') {
      const onboarding = await base44.entities.OnboardingFlow.filter({
        user_email: userEmail
      });

      if (!onboarding.length) {
        return Response.json({ error: 'Onboarding not found' }, { status: 404 });
      }

      return Response.json({
        success: true,
        profile: onboarding[0]
      });
    }

    // ASSIGN ACTIVATION PATH
    if (action === 'assign_path') {
      const onboarding = await base44.entities.OnboardingFlow.filter({
        user_email: userEmail
      });

      if (!onboarding.length) {
        return Response.json({ error: 'No onboarding data' }, { status: 404 });
      }

      const profile = onboarding[0];
      const assignedPath = calculateActivationPath(profile);

      const existing = await base44.entities.ActivationState.filter({
        user_email: userEmail
      });

      const activationData = {
        user_email: userEmail,
        onboarding_flow_type: profile.flow_type,
        assigned_activation_path: assignedPath,
        path_assignment_date: new Date().toISOString(),
        created_at: existing.length > 0 ? existing[0].created_at : new Date().toISOString()
      };

      if (existing.length > 0) {
        await base44.entities.ActivationState.update(existing[0].id, activationData);
      } else {
        await base44.entities.ActivationState.create(activationData);
      }

      return Response.json({
        success: true,
        path: assignedPath,
        guidance: ACTIVATION_PATHS[assignedPath].guidance
      });
    }

    // TRACK MILESTONE COMPLETION
    if (action === 'track_milestone') {
      const { milestone } = await req.json();
      const existing = await base44.entities.ActivationState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) {
        return Response.json({ error: 'No activation state' }, { status: 404 });
      }

      const state = existing[0];
      const milestones = state.activation_milestones || {};
      milestones[milestone] = true;

      // Check if first FMV reached
      const firstMeaningful = !milestones.first_meaningful_action;
      if (firstMeaningful && (milestone === 'first_deal_saved' || milestone === 'portfolio_goal_configured' || milestone === 'first_community_interaction')) {
        milestones.first_meaningful_action = milestone;
      }

      const isActivated = milestones.first_meaningful_action ? true : false;

      await base44.entities.ActivationState.update(existing[0].id, {
        activation_milestones: milestones,
        is_activated: isActivated,
        activated_at: isActivated && !state.is_activated ? new Date().toISOString() : state.activated_at,
        days_to_activation: isActivated && !state.days_to_activation 
          ? calculateDaysToActivation(state.created_at)
          : state.days_to_activation
      });

      return Response.json({
        success: true,
        milestone,
        is_activated: isActivated
      });
    }

    // UPDATE ACTIVITY
    if (action === 'update_activity') {
      const { activityType, count = 1 } = await req.json();
      const existing = await base44.entities.ActivationState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) return Response.json({ error: 'No state' }, { status: 404 });

      const state = existing[0];
      const activity = state.activity_summary || {};
      activity[activityType] = (activity[activityType] || 0) + count;
      activity.last_activity_date = new Date().toISOString();

      const daysSinceSignup = Math.floor(
        (new Date() - new Date(state.created_at)) / (1000 * 60 * 60 * 24)
      );
      activity.days_since_signup = daysSinceSignup;

      await base44.entities.ActivationState.update(existing[0].id, {
        activity_summary: activity
      });

      return Response.json({ success: true, activity });
    }

    // GENERATE SMART NUDGES
    if (action === 'generate_nudges') {
      const existing = await base44.entities.ActivationState.filter({
        user_email: userEmail
      });

      if (existing.length === 0) {
        return Response.json({ nudges: [] });
      }

      const state = existing[0];
      const nudges = calculateSmartNudges(state);

      // Apply cooldown logic (max 1 nudge per 6 hours)
      const lastNudge = new Date(state.last_nudge_timestamp || 0);
      const now = new Date();
      const hoursSinceLastNudge = (now - lastNudge) / (1000 * 60 * 60);

      if (hoursSinceLastNudge < 6 && nudges.length > 0) {
        return Response.json({
          success: true,
          nudges: [],
          reason: 'Cooldown active'
        });
      }

      if (nudges.length > 0) {
        await base44.entities.ActivationState.update(existing[0].id, {
          active_guidance_elements: nudges.map(n => n.id),
          last_nudge_timestamp: new Date().toISOString()
        });
      }

      return Response.json({
        success: true,
        nudges,
        path: state.assigned_activation_path
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Activation engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateActivationPath(onboardingProfile) {
  const { step_data = {}, skipped_steps = [] } = onboardingProfile;

  // Score each path based on onboarding data
  let dealScore = 0;
  let portfolioScore = 0;
  let communityScore = 0;

  // Deal sourcing interest
  if (step_data.step_1_industry_interests?.length > 0) dealScore += 3;
  if (!skipped_steps.includes(1)) dealScore += 2;

  // Portfolio goals
  if (step_data.step_4_portfolio_goals) portfolioScore += 3;
  if (!skipped_steps.includes(4)) portfolioScore += 2;

  // Community/engagement style
  if (step_data.step_2_engagement_style === 'networking' || step_data.step_2_engagement_style === 'learning') {
    communityScore += 3;
  }
  if (step_data.step_5_community_interests?.length > 0) communityScore += 2;
  if (!skipped_steps.includes(5)) communityScore += 2;

  // Return highest-scoring path
  const scores = {
    deal_first: dealScore,
    portfolio_first: portfolioScore,
    community_first: communityScore
  };

  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

function calculateSmartNudges(activationState) {
  const nudges = [];
  const activity = activationState.activity_summary || {};
  const milestones = activationState.activation_milestones || {};
  const dismissed = activationState.dismissed_guidance || [];
  const daysSinceSignup = activity.days_since_signup || 0;

  // NUDGE 1: Inactivity
  if (daysSinceSignup > 3 && (!activity.last_activity_date || 
    (new Date() - new Date(activity.last_activity_date)) / (1000 * 60 * 60 * 24) > 2)) {
    nudges.push({
      id: 'nudge_inactivity',
      type: 'inactivity',
      message: `💡 Ready to explore? Let's find your first ${activationState.assigned_activation_path === 'deal_first' ? 'deal' : 'connection'}.`,
      action: 'resume_guided_tour',
      surface: 'banner',
      priority: 'high'
    });
  }

  // NUDGE 2: Browsing without saving (deal_first path)
  if (activationState.assigned_activation_path === 'deal_first' && 
      activity.deals_viewed > 3 && activity.deals_saved === 0 && 
      !dismissed.includes('nudge_save_deal')) {
    nudges.push({
      id: 'nudge_save_deal',
      type: 'behavior_pattern',
      message: '📌 Saw a deal you like? Save it to build your watchlist and improve recommendations.',
      action: 'save_deal',
      surface: 'toast',
      priority: 'medium'
    });
  }

  // NUDGE 3: Portfolio goals skipped (portfolio_first path)
  if (activationState.onboarding_flow_type === 'quick_start' && 
      !milestones.portfolio_goal_configured &&
      daysSinceSignup > 5 &&
      !dismissed.includes('nudge_portfolio_deferred')) {
    nudges.push({
      id: 'nudge_portfolio_deferred',
      type: 'deferred_setup',
      message: '🎯 Setting your goals unlocks smarter deal recommendations.',
      action: 'setup_portfolio_goals',
      surface: 'side_panel',
      priority: 'low'
    });
  }

  // NUDGE 4: Approaching day 7 without FMV
  if (daysSinceSignup >= 6 && daysSinceSignup <= 8 && !activationState.is_activated &&
      !dismissed.includes('nudge_fmv_checkin')) {
    nudges.push({
      id: 'nudge_fmv_checkin',
      type: 'milestone_reminder',
      message: '✨ Let's get you to your first key moment—you're almost there!',
      action: 'next_guidance_step',
      surface: 'modal',
      priority: 'high'
    });
  }

  // NUDGE 5: Community discovery (community_first path)
  if (activationState.assigned_activation_path === 'community_first' &&
      activity.communities_viewed === 0 &&
      daysSinceSignup > 2 &&
      !dismissed.includes('nudge_explore_communities')) {
    nudges.push({
      id: 'nudge_explore_communities',
      type: 'feature_discovery',
      message: '🤝 Discover communities where experts share investment insights.',
      action: 'browse_communities',
      surface: 'toast',
      priority: 'medium'
    });
  }

  return nudges.filter(n => !dismissed.includes(n.id));
}

function calculateDaysToActivation(createdAt) {
  return Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
}