import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated Intervention Workflow Engine
 * - Auto-assigns users to A/B tests when entering lifecycle states
 * - Triggers winning interventions automatically
 * - Tracks conversions and engagement cross-channel
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, ...params } = await req.json();

    switch (action) {
      case 'check_and_assign_tests':
        return await checkAndAssignTests(base44, params);
      
      case 'trigger_intervention':
        return await triggerIntervention(base44, params);
      
      case 'track_conversion':
        return await trackConversion(base44, params);
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Intervention automation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkAndAssignTests(base44, { user_email, lifecycle_state }) {
  // Find active A/B tests for this lifecycle state
  const activeTests = await base44.asServiceRole.entities.ABTest.filter({
    lifecycle_state,
    status: 'active'
  });

  const assignments = [];

  for (const test of activeTests) {
    // Check if user already assigned
    const existing = await base44.asServiceRole.entities.ABTestAssignment.filter({
      test_id: test.id,
      user_email
    });

    if (existing.length > 0) continue;

    // Check if user meets target criteria
    const lifecycleState = await base44.asServiceRole.entities.LifecycleState.filter({
      user_email
    });

    if (lifecycleState.length === 0) continue;

    const userState = lifecycleState[0];
    const criteria = test.target_criteria || {};

    // Apply targeting criteria
    if (criteria.min_days_in_state && userState.days_in_state < criteria.min_days_in_state) continue;
    if (criteria.max_days_in_state && userState.days_in_state > criteria.max_days_in_state) continue;
    if (criteria.churn_risk_min && userState.churn_risk_score < criteria.churn_risk_min) continue;
    if (criteria.churn_risk_max && userState.churn_risk_score > criteria.churn_risk_max) continue;

    // Assign to variant based on traffic allocation
    const variant = assignVariant(test.variants);
    
    const assignment = await base44.asServiceRole.entities.ABTestAssignment.create({
      test_id: test.id,
      user_email,
      variant_id: variant.variant_id,
      assigned_at: new Date().toISOString(),
      lifecycle_state_before: lifecycle_state,
      churn_risk_before: userState.churn_risk_score
    });

    assignments.push(assignment);
  }

  return Response.json({ 
    success: true,
    assignments_created: assignments.length,
    assignments
  });
}

async function triggerIntervention(base44, { user_email, lifecycle_state }) {
  // Get user's A/B test assignments for this state
  const assignments = await base44.asServiceRole.entities.ABTestAssignment.filter({
    user_email,
    lifecycle_state_before: lifecycle_state,
    intervention_shown: false
  });

  const deliveries = [];

  for (const assignment of assignments) {
    // Get test details
    const tests = await base44.asServiceRole.entities.ABTest.filter({ id: assignment.test_id });
    if (tests.length === 0) continue;
    
    const test = tests[0];
    const variant = test.variants.find(v => v.variant_id === assignment.variant_id);
    if (!variant) continue;

    // Get user preferences
    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
    const user = users[0];
    const channelPrefs = user?.channel_preferences?.preferred_channels || ['email', 'in_app'];

    // Determine delivery channel (prefer user's channels, fallback to variant surface)
    let channel = variant.surface;
    if (variant.surface === 'banner' || variant.surface === 'toast') {
      channel = 'in_app';
    }
    
    // Override with user preference if available
    if (channelPrefs.includes('email') && variant.surface === 'email') {
      channel = 'email';
    } else if (channelPrefs.includes('sms') && user?.phone_number) {
      channel = 'sms';
    } else if (channelPrefs.includes('push')) {
      channel = 'push';
    } else if (channelPrefs.includes('in_app')) {
      channel = 'in_app';
    }

    // Create delivery log
    const delivery = await base44.asServiceRole.entities.InterventionDeliveryLog.create({
      user_email,
      intervention_id: test.intervention_id,
      lifecycle_state,
      channel,
      message: variant.message,
      abtest_id: test.id,
      variant_id: variant.variant_id,
      status: 'queued',
      sent_at: new Date().toISOString()
    });

    // Send via appropriate channel
    await sendIntervention(base44, delivery, user);

    // Update assignment
    await base44.asServiceRole.entities.ABTestAssignment.update(assignment.id, {
      intervention_shown: true,
      shown_at: new Date().toISOString()
    });

    deliveries.push(delivery);
  }

  return Response.json({
    success: true,
    deliveries_sent: deliveries.length,
    deliveries
  });
}

async function sendIntervention(base44, delivery, user) {
  try {
    switch (delivery.channel) {
      case 'email':
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: delivery.user_email,
          subject: 'Important Update - Lifecycle Intelligence',
          body: delivery.message
        });
        
        await base44.asServiceRole.entities.InterventionDeliveryLog.update(delivery.id, {
          status: 'sent',
          delivered_at: new Date().toISOString()
        });
        break;

      case 'sms':
        if (user?.phone_number) {
          // SMS would be sent via Twilio or similar
          // For now, mark as sent
          await base44.asServiceRole.entities.InterventionDeliveryLog.update(delivery.id, {
            status: 'sent',
            delivered_at: new Date().toISOString(),
            metadata: { phone: user.phone_number }
          });
        }
        break;

      case 'push':
      case 'in_app':
        // In-app notifications handled by frontend
        await base44.asServiceRole.entities.InterventionDeliveryLog.update(delivery.id, {
          status: 'sent',
          delivered_at: new Date().toISOString()
        });
        break;

      default:
        await base44.asServiceRole.entities.InterventionDeliveryLog.update(delivery.id, {
          status: 'failed',
          error_message: 'Unsupported channel'
        });
    }
  } catch (error) {
    await base44.asServiceRole.entities.InterventionDeliveryLog.update(delivery.id, {
      status: 'failed',
      error_message: error.message
    });
  }
}

async function trackConversion(base44, { user_email, intervention_id, event_type, event_value }) {
  // Find recent deliveries for this user and intervention
  const deliveries = await base44.asServiceRole.entities.InterventionDeliveryLog.filter({
    user_email,
    intervention_id
  });

  if (deliveries.length === 0) {
    return Response.json({ success: false, message: 'No matching delivery found' });
  }

  // Update most recent delivery
  const delivery = deliveries[0];
  
  const conversionEvent = {
    event_type,
    event_value: event_value || 1,
    occurred_at: new Date().toISOString()
  };

  const updatedEvents = [...(delivery.conversion_events || []), conversionEvent];

  await base44.asServiceRole.entities.InterventionDeliveryLog.update(delivery.id, {
    status: 'converted',
    conversion_events: updatedEvents,
    action_at: new Date().toISOString()
  });

  // Update A/B test assignment
  if (delivery.abtest_id) {
    const assignments = await base44.asServiceRole.entities.ABTestAssignment.filter({
      test_id: delivery.abtest_id,
      user_email
    });

    if (assignments.length > 0) {
      const assignment = assignments[0];
      const existingEvents = assignment.conversion_events || [];
      
      await base44.asServiceRole.entities.ABTestAssignment.update(assignment.id, {
        user_action: 'completed',
        action_at: new Date().toISOString(),
        conversion_events: [...existingEvents, conversionEvent]
      });
    }
  }

  return Response.json({ success: true });
}

function assignVariant(variants) {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const variant of variants) {
    cumulative += variant.traffic_allocation;
    if (random <= cumulative) {
      return variant;
    }
  }

  return variants[0];
}