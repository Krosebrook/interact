import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhook_url, payload } = await req.json();

    if (!webhook_url) {
      return Response.json({ error: 'Webhook URL is required' }, { status: 400 });
    }

    // Send data to Zapier webhook
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        triggered_by: user.email,
        triggered_at: new Date().toISOString()
      })
    });

    const result = await response.text();

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'zapier' });
      if (integrations.length > 0) {
        await base44.asServiceRole.entities.Integration.update(integrations[0].id, {
          last_used: new Date().toISOString(),
          usage_count: (integrations[0].usage_count || 0) + 1,
          status: 'active'
        });
      }
    } catch (e) {
      console.error('Failed to update integration stats:', e);
    }

    return Response.json({ 
      success: true, 
      status: response.status,
      response: result 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});