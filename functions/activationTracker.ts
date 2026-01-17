import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Activation Tracker: Lightweight activity logging for FMV milestones
 * Triggered by core actions (view deal, save deal, join community, etc.)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, activityType, milestone } = await req.json();

    // LOG ACTIVITY (non-blocking)
    if (action === 'log_activity') {
      const existing = await base44.entities.ActivationState.filter({
        user_email: user.email
      });

      if (existing.length === 0) return Response.json({ success: true }); // Silently fail

      const state = existing[0];
      const activity = state.activity_summary || {};

      // Increment activity counter
      activity[activityType] = (activity[activityType] || 0) + 1;
      activity.last_activity_date = new Date().toISOString();

      await base44.entities.ActivationState.update(existing[0].id, {
        activity_summary: activity
      });

      return Response.json({ success: true });
    }

    // MILESTONE COMPLETION
    if (action === 'complete_milestone') {
      const existing = await base44.entities.ActivationState.filter({
        user_email: user.email
      });

      if (existing.length === 0) return Response.json({ success: true });

      const state = existing[0];
      const milestones = state.activation_milestones || {};
      milestones[milestone] = true;

      // Mark first meaningful action
      if (!milestones.first_meaningful_action && isMeaningfulMilestone(milestone)) {
        milestones.first_meaningful_action = milestone;
      }

      const isActivated = !!milestones.first_meaningful_action;

      await base44.entities.ActivationState.update(existing[0].id, {
        activation_milestones: milestones,
        is_activated: isActivated,
        activated_at: isActivated && !state.is_activated ? new Date().toISOString() : state.activated_at,
        days_to_activation: isActivated && !state.days_to_activation
          ? Math.floor((new Date() - new Date(state.created_at)) / (1000 * 60 * 60 * 24))
          : state.days_to_activation
      });

      return Response.json({ success: true, is_activated: isActivated });
    }

    // BULK IMPORT (admin only)
    if (action === 'bootstrap_activation_states') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      const allOnboarding = await base44.asServiceRole.entities.OnboardingFlow.filter({
        is_complete: true
      }, '-completion_date', 100);

      const created = [];
      for (const onboarding of allOnboarding) {
        const existing = await base44.entities.ActivationState.filter({
          user_email: onboarding.user_email
        });

        if (existing.length === 0) {
          const path = calculatePathFromOnboarding(onboarding);
          const state = await base44.entities.ActivationState.create({
            user_email: onboarding.user_email,
            onboarding_flow_type: onboarding.flow_type,
            assigned_activation_path: path,
            path_assignment_date: new Date().toISOString(),
            created_at: onboarding.completion_date
          });
          created.push(state);
        }
      }

      return Response.json({ success: true, created: created.length });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Activation tracker error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function isMeaningfulMilestone(milestone) {
  const meaningful = ['first_deal_saved', 'portfolio_goal_configured', 'first_community_interaction'];
  return meaningful.includes(milestone);
}

function calculatePathFromOnboarding(onboarding) {
  const stepData = onboarding.step_data || {};
  const skipped = onboarding.skipped_steps || [];

  let scores = {
    deal_first: stepData.step_1_industry_interests?.length ? 3 : 0,
    portfolio_first: stepData.step_4_portfolio_goals ? 3 : 0,
    community_first: stepData.step_2_engagement_style === 'networking' ? 3 : 0
  };

  if (!skipped.includes(1)) scores.deal_first += 2;
  if (!skipped.includes(4)) scores.portfolio_first += 2;
  if (!skipped.includes(5)) scores.community_first += 2;

  const max = Math.max(...Object.values(scores));
  return Object.keys(scores).find(k => scores[k] === max) || 'unassigned';
}