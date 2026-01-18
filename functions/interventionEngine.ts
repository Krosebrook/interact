import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Intervention Engine: Delivers lifecycle-specific interventions
 * Respects user state and suppresses aggressive messaging for at-risk/dormant users
 */

const INTERVENTION_PLAYBOOKS = {
  at_risk: {
    name: 'At-Risk User Interventions',
    tone: 'supportive',
    interventions: [
      {
        id: 'at_risk_value_reminder',
        type: 'value_reminder',
        message: 'What changed since you were last active',
        content_type: 'deals_updated',
        surface: 'email',
        max_frequency_days: 7
      },
      {
        id: 'at_risk_relevance_reset',
        type: 'relevance_reset',
        message: 'Your deals feed refreshed based on current interests',
        content_type: 'personalized_deals',
        surface: 'banner',
        max_frequency_days: 3
      },
      {
        id: 'at_risk_simplified_prompt',
        type: 'simplified_engagement',
        message: 'One thing to explore today',
        content_type: 'single_action',
        surface: 'toast',
        max_frequency_days: 2
      }
    ]
  },
  dormant: {
    name: 'Dormant User Interventions',
    tone: 'respectful',
    interventions: [
      {
        id: 'dormant_high_signal_summary',
        type: 'summary',
        message: 'Top 3 things you missed',
        content_type: 'curated_summary',
        surface: 'email',
        max_frequency_days: 14
      },
      {
        id: 'dormant_optional_reentry',
        type: 'reentry_path',
        message: 'Welcome back, no pressure—catch up at your pace',
        content_type: 'context_restoration',
        surface: 'modal_on_login',
        max_frequency_days: 30
      }
    ]
  },
  returning: {
    name: 'Returning User Interventions',
    tone: 'welcoming',
    interventions: [
      {
        id: 'returning_context_restore',
        type: 'context_restoration',
        message: 'Picking up where you left off',
        content_type: 'saved_context',
        surface: 'banner',
        max_frequency_days: 1
      },
      {
        id: 'returning_resume_actions',
        type: 'resume_unfinished',
        message: 'You were exploring these...',
        content_type: 'previous_activities',
        surface: 'sidebar_panel',
        max_frequency_days: 1
      },
      {
        id: 'returning_gentle_momentum',
        type: 'momentum_builder',
        message: 'Keep up with the new insights since you left',
        content_type: 'weekly_digest',
        surface: 'email',
        max_frequency_days: 7
      }
    ]
  },
  engaged: {
    name: 'Engaged User Interventions',
    tone: 'enabling',
    interventions: [
      {
        id: 'engaged_feature_discovery',
        type: 'feature_discovery',
        message: 'New feature: advanced scenario modeling',
        content_type: 'feature_highlight',
        surface: 'in_app_toast',
        max_frequency_days: 7
      },
      {
        id: 'engaged_habit_reinforcement',
        type: 'habit_reinforcement',
        message: 'Your weekly digest is ready',
        content_type: 'weekly_summary',
        surface: 'email',
        max_frequency_days: 7
      }
    ]
  },
  power_user: {
    name: 'Power User Interventions',
    tone: 'partnership',
    interventions: [
      {
        id: 'power_user_advanced_features',
        type: 'advanced_capability',
        message: 'New advanced features for power users',
        content_type: 'feature_release',
        surface: 'in_app_notification',
        max_frequency_days: 14
      },
      {
        id: 'power_user_value_metrics',
        type: 'value_reinforcement',
        message: 'Here's the value you've created this month',
        content_type: 'value_metrics',
        surface: 'dashboard_card',
        max_frequency_days: 30
      }
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

    // GET INTERVENTIONS FOR CURRENT STATE
    if (action === 'get_active_interventions') {
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) {
        return Response.json({ interventions: [] });
      }

      const state = lifecycle[0];

      // Check for active A/B tests for this state
      const activeTests = await base44.asServiceRole.entities.ABTest.filter({
        lifecycle_state: state.current_state,
        status: 'active'
      });

      // If user is in an A/B test, return test variant intervention
      for (const test of activeTests) {
        const assignments = await base44.asServiceRole.entities.ABTestAssignment.filter({
          test_id: test.id,
          user_email: userEmail
        });

        if (assignments.length > 0) {
          const assignment = assignments[0];
          const variant = test.variants.find(v => v.variant_id === assignment.variant_id);

          if (variant && !assignment.intervention_shown) {
            // Return A/B test intervention
            return Response.json({
              success: true,
              state: state.current_state,
              interventions: [{
                id: `abtest_${test.id}_${variant.variant_id}`,
                type: 'ab_test_variant',
                message: variant.message,
                content_type: 'ab_test',
                surface: variant.surface,
                ab_test_id: test.id,
                ab_test_assignment_id: assignment.id,
                variant_id: variant.variant_id
              }],
              tone: 'enabling',
              is_ab_test: true
            });
          }
        }
      }

      // Standard intervention logic (no A/B test)
      const playbook = INTERVENTION_PLAYBOOKS[state.current_state];

      if (!playbook) {
        return Response.json({ interventions: [] });
      }

      const suppressedIds = state.suppressed_interventions || [];
      const activeInterventions = state.active_interventions || [];

      // Filter eligible interventions
      const eligibleInterventions = playbook.interventions.filter(intervention => {
        if (suppressedIds.includes(intervention.id)) return false;

        // Check frequency cooldown
        const lastShown = activeInterventions.find(a => a.intervention_id === intervention.id);
        if (lastShown && lastShown.shown) {
          const daysSinceShown = Math.floor(
            (new Date() - new Date(lastShown.triggered_at)) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceShown < intervention.max_frequency_days) return false;
        }

        return true;
      });

      return Response.json({
        success: true,
        state: state.current_state,
        playbook: playbook.name,
        interventions: eligibleInterventions,
        tone: playbook.tone,
        is_ab_test: false
      });
    }

    // RECORD INTERVENTION SHOWN
    if (action === 'record_intervention_shown') {
      const { intervention_id } = await req.json();
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) return Response.json({ success: true });

      const state = lifecycle[0];
      const interventions = state.active_interventions || [];

      const updated = interventions.map(i => i.intervention_id === intervention_id ? {
        ...i,
        shown: true
      } : i);

      // Add if not exists
      if (!interventions.find(i => i.intervention_id === intervention_id)) {
        updated.push({
          intervention_id,
          intervention_type: '',
          triggered_at: new Date().toISOString(),
          shown: true,
          dismissed: false,
          acted_on: false
        });
      }

      await base44.entities.LifecycleState.update(lifecycle[0].id, {
        active_interventions: updated
      });

      return Response.json({ success: true });
    }

    // DISMISS INTERVENTION
    if (action === 'dismiss_intervention') {
      const { intervention_id } = await req.json();
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) return Response.json({ success: true });

      const state = lifecycle[0];
      const suppressed = [...(state.suppressed_interventions || []), intervention_id];

      await base44.entities.LifecycleState.update(lifecycle[0].id, {
        suppressed_interventions: suppressed
      });

      return Response.json({ success: true });
    }

    // TRACK INTERVENTION ACTION
    if (action === 'track_intervention_action') {
      const { intervention_id, acted_on } = await req.json();
      const lifecycle = await base44.entities.LifecycleState.filter({
        user_email: userEmail
      });

      if (lifecycle.length === 0) return Response.json({ success: true });

      const state = lifecycle[0];
      const interventions = state.active_interventions || [];

      const updated = interventions.map(i => i.intervention_id === intervention_id ? {
        ...i,
        acted_on
      } : i);

      await base44.entities.LifecycleState.update(lifecycle[0].id, {
        active_interventions: updated
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Intervention engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});