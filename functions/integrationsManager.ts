import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import INTEGRATIONS_REGISTRY from './integrationsRegistry.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, integrationId, settings = {} } = await req.json();

    const integration = INTEGRATIONS_REGISTRY[integrationId];
    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    if (action === 'list') {
      return Response.json({
        success: true,
        integrations: Object.values(INTEGRATIONS_REGISTRY).map(i => ({
          ...i,
          scopes: undefined // Don't expose scopes in list
        }))
      });
    }

    if (action === 'get') {
      return Response.json({
        success: true,
        integration
      });
    }

    if (action === 'enable') {
      const existing = await base44.asServiceRole.entities.Integration.filter({
        integration_id: integrationId
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Integration.update(existing[0].id, {
          is_enabled: true,
          settings_json: JSON.stringify(settings)
        });
      } else {
        await base44.asServiceRole.entities.Integration.create({
          integration_id: integrationId,
          name: integration.name,
          category: integration.category,
          description: integration.description,
          is_enabled: true,
          authorization_type: integration.authType,
          api_key_name: integration.apiKeyEnv,
          settings_json: JSON.stringify(settings),
          status: 'pending'
        });
      }

      return Response.json({
        success: true,
        message: `${integration.name} enabled successfully`
      });
    }

    if (action === 'disable') {
      const existing = await base44.asServiceRole.entities.Integration.filter({
        integration_id: integrationId
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Integration.update(existing[0].id, {
          is_enabled: false,
          status: 'inactive'
        });
      }

      return Response.json({
        success: true,
        message: `${integration.name} disabled`
      });
    }

    if (action === 'test') {
      // Test integration connectivity
      const testResult = await testIntegration(integrationId, settings);
      
      const existing = await base44.asServiceRole.entities.Integration.filter({
        integration_id: integrationId
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Integration.update(existing[0].id, {
          last_tested: new Date().toISOString(),
          status: testResult.success ? 'active' : 'error',
          error_message: testResult.error || null
        });
      }

      return Response.json(testResult);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function testIntegration(integrationId, settings) {
  const integration = INTEGRATIONS_REGISTRY[integrationId];

  switch (integrationId) {
    case 'slack':
      try {
        const slackToken = Deno.env.get('SLACK_BOT_TOKEN');
        const response = await fetch('https://slack.com/api/auth.test', {
          headers: { 'Authorization': `Bearer ${slackToken}` }
        });
        const data = await response.json();
        return { success: data.ok, error: data.error };
      } catch (e) {
        return { success: false, error: e.message };
      }

    case 'sendgrid':
      try {
        const key = Deno.env.get('SENDGRID_API_KEY');
        const response = await fetch('https://api.sendgrid.com/v3/mail/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: 'test@example.com' })
        });
        return { success: response.ok, error: null };
      } catch (e) {
        return { success: false, error: e.message };
      }

    case 'twilio':
      try {
        const key = Deno.env.get('TWILIO_API_KEY');
        const response = await fetch('https://api.twilio.com/2010-04-01/Accounts.json', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        return { success: response.ok, error: null };
      } catch (e) {
        return { success: false, error: e.message };
      }

    case 'hubspot':
      try {
        const key = Deno.env.get('HUBSPOT_API_KEY');
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        return { success: response.ok, error: null };
      } catch (e) {
        return { success: false, error: e.message };
      }

    case 'stripe':
      try {
        const key = Deno.env.get('STRIPE_API_KEY');
        const response = await fetch('https://api.stripe.com/v1/account', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        return { success: response.ok, error: null };
      } catch (e) {
        return { success: false, error: e.message };
      }

    default:
      return { success: true, error: null };
  }
}