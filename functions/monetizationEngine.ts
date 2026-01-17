import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Monetization Engine: Value-first, contextual upgrade moments
 * Only surfaces offers when users are actively engaged with relevant features
 */

const MONETIZATION_MOMENTS = {
  deal_comparison_limit: {
    name: 'deal_comparison_limit',
    tier: 'tier1_discovery',
    trigger: 'deal_comparisons_capped',
    message: 'Unlock unlimited deal comparisons to analyze full strategies',
    benefit_statement: 'Compare side-by-side with full financial details and strategic fit scoring.',
    stays_free: ['Save up to 5 deals', 'Basic deal viewing'],
    upgrades_to: ['Unlimited comparisons', '3D portfolio mapping', 'Strategy explanations'],
    context: 'user_about_to_exceed_free_limit',
    tone: 'partnership'
  },
  scenario_modeling: {
    name: 'scenario_modeling',
    tier: 'tier2_intelligence',
    trigger: 'analytics_deep_dive',
    message: 'Unlock scenario modeling to test your strategy',
    benefit_statement: 'Run what-if analyses to see how different deals impact your portfolio.',
    stays_free: ['View current portfolio', 'Basic analytics'],
    upgrades_to: ['Scenario modeling', 'Projections', 'Goal-to-deal mapping'],
    context: 'user_viewing_analytics',
    tone: 'enabling'
  },
  premium_community: {
    name: 'premium_community',
    tier: 'tier3_network',
    trigger: 'community_discovery',
    message: 'Unlock exclusive expert communities',
    benefit_statement: 'Access vetted deal flows and expert-only discussions.',
    stays_free: ['Public communities', 'Basic expert following'],
    upgrades_to: ['Private communities', 'Signal boosting', 'Exclusive deal flows'],
    context: 'user_exploring_communities',
    tone: 'exclusive'
  },
  batch_operations: {
    name: 'batch_operations',
    tier: 'tier1_discovery',
    trigger: 'user_managing_deals',
    message: 'Save time with batch deal operations',
    benefit_statement: 'Tag, move, or analyze multiple deals at once.',
    stays_free: ['Individual operations', 'Collections'],
    upgrades_to: ['Batch tagging', 'CSV import/export', 'API access'],
    context: 'user_has_10plus_saved_deals',
    tone: 'efficiency'
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

    // CHECK IF MONETIZATION MOMENT SHOULD TRIGGER
    if (action === 'check_moment_trigger') {
      const { context, tier } = await req.json();
      const powerUser = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (powerUser.length === 0) {
        return Response.json({ trigger: false });
      }

      const state = powerUser[0];
      const dismissed = state.dismissed_offers || [];

      // Find relevant monetization moments
      const relevantMoments = Object.values(MONETIZATION_MOMENTS).filter(
        moment => moment.tier === tier && !dismissed.includes(moment.name)
      );

      if (relevantMoments.length === 0) {
        return Response.json({ trigger: false });
      }

      const moment = relevantMoments[0];

      // Check if already shown recently
      const recentTrigger = state.monetization_triggers?.find(
        t => t.trigger_type === moment.name && 
        t.shown && 
        !t.dismissed &&
        new Date() - new Date(t.triggered_at) < 7 * 24 * 60 * 60 * 1000
      );

      if (recentTrigger) {
        return Response.json({ trigger: false, reason: 'Recently shown' });
      }

      return Response.json({
        trigger: true,
        moment
      });
    }

    // RECORD MONETIZATION TRIGGER
    if (action === 'record_trigger') {
      const { moment_name } = await req.json();
      const powerUser = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (powerUser.length === 0) return Response.json({ error: 'No state' }, { status: 404 });

      const state = powerUser[0];
      const triggers = state.monetization_triggers || [];
      triggers.push({
        trigger_id: `${moment_name}_${Date.now()}`,
        trigger_type: moment_name,
        triggered_at: new Date().toISOString(),
        shown: true,
        dismissed: false,
        converted: false
      });

      await base44.entities.PowerUserState.update(powerUser[0].id, {
        monetization_triggers: triggers
      });

      return Response.json({ success: true });
    }

    // DISMISS OFFER
    if (action === 'dismiss_offer') {
      const { moment_name } = await req.json();
      const powerUser = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (powerUser.length === 0) return Response.json({ success: true });

      const state = powerUser[0];
      const dismissed = [...(state.dismissed_offers || []), moment_name];
      const triggers = (state.monetization_triggers || []).map(t => ({
        ...t,
        dismissed: t.trigger_type === moment_name ? true : t.dismissed
      }));

      await base44.entities.PowerUserState.update(powerUser[0].id, {
        dismissed_offers: dismissed,
        monetization_triggers: triggers
      });

      return Response.json({ success: true });
    }

    // TRACK CONVERSION
    if (action === 'track_conversion') {
      const { moment_name, converted, value } = await req.json();
      const powerUser = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (powerUser.length === 0) return Response.json({ success: true });

      const state = powerUser[0];
      const triggers = (state.monetization_triggers || []).map(t => ({
        ...t,
        converted: t.trigger_type === moment_name ? converted : t.converted,
        conversion_value: t.trigger_type === moment_name ? value : t.conversion_value
      }));

      if (converted) {
        await base44.entities.PowerUserState.update(powerUser[0].id, {
          subscription_status: 'paying',
          monetization_triggers: triggers
        });
      }

      return Response.json({ success: true });
    }

    // GET VALUE METRICS
    if (action === 'calculate_value_metrics') {
      const powerUser = await base44.entities.PowerUserState.filter({
        user_email: userEmail
      });

      if (powerUser.length === 0) {
        return Response.json({ metrics: null });
      }

      const state = powerUser[0];
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (retention.length === 0) return Response.json({ metrics: null });

      const retState = retention[0];

      // Calculate value delivered
      const timeSaved = (retState.discovery_loop?.deals_saved_from_loop || 0) * 2; // ~2 hours per deal saved
      const dealsValue = (retState.discovery_loop?.deals_saved_from_loop || 0) * Math.random() * 5000000; // Random deal value
      const portfolioAccuracy = Math.min((retState.insight_loop?.portfolio_adjustments || 0) * 5, 100);
      const networkStrength = (retState.social_loop?.experts_followed || 0) * 3;

      const metrics = {
        time_saved_hours: Math.floor(timeSaved),
        deals_value_examined: Math.floor(dealsValue),
        portfolio_accuracy_improvement: Math.floor(portfolioAccuracy),
        network_strength: networkStrength,
        last_metric_update: new Date().toISOString()
      };

      await base44.entities.PowerUserState.update(powerUser[0].id, {
        value_metrics: metrics
      });

      return Response.json({
        success: true,
        metrics
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Monetization engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});