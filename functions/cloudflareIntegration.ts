import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const CLOUDFLARE_API_KEY = Deno.env.get("CLOUDFLARE_API_KEY");
    const CLOUDFLARE_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    
    if (!CLOUDFLARE_API_KEY) {
      return Response.json({ error: 'Cloudflare API key not configured' }, { status: 500 });
    }

    const { action, zone_id, record_id, data } = await req.json();

    const headers = {
      'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
      'Content-Type': 'application/json'
    };

    let result;

    switch (action) {
      case 'list_zones':
        const zonesResponse = await fetch('https://api.cloudflare.com/client/v4/zones', { headers });
        result = await zonesResponse.json();
        break;

      case 'get_zone':
        const zoneResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}`, { headers });
        result = await zoneResponse.json();
        break;

      case 'list_dns_records':
        const dnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`, { headers });
        result = await dnsResponse.json();
        break;

      case 'create_dns_record':
        const createDnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });
        result = await createDnsResponse.json();
        break;

      case 'update_dns_record':
        const updateDnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${record_id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data)
        });
        result = await updateDnsResponse.json();
        break;

      case 'delete_dns_record':
        const deleteDnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${record_id}`, {
          method: 'DELETE',
          headers
        });
        result = await deleteDnsResponse.json();
        break;

      case 'purge_cache':
        const purgeResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/purge_cache`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data || { purge_everything: true })
        });
        result = await purgeResponse.json();
        break;

      case 'get_analytics':
        const analyticsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/analytics/dashboard`, { headers });
        result = await analyticsResponse.json();
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'cloudflare' });
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

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});