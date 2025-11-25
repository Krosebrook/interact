import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
    
    if (!HUBSPOT_API_KEY) {
      return Response.json({ error: 'HubSpot API key not configured' }, { status: 500 });
    }

    const { action, object_type, object_id, properties, filters } = await req.json();

    const headers = {
      'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json'
    };

    let result;

    switch (action) {
      case 'get_contacts':
        const contactsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100', { headers });
        result = await contactsResponse.json();
        break;

      case 'create_contact':
        const createContactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers,
          body: JSON.stringify({ properties })
        });
        result = await createContactResponse.json();
        break;

      case 'update_contact':
        const updateContactResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${object_id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ properties })
        });
        result = await updateContactResponse.json();
        break;

      case 'get_companies':
        const companiesResponse = await fetch('https://api.hubapi.com/crm/v3/objects/companies?limit=100', { headers });
        result = await companiesResponse.json();
        break;

      case 'create_company':
        const createCompanyResponse = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
          method: 'POST',
          headers,
          body: JSON.stringify({ properties })
        });
        result = await createCompanyResponse.json();
        break;

      case 'get_deals':
        const dealsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=100', { headers });
        result = await dealsResponse.json();
        break;

      case 'create_deal':
        const createDealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
          method: 'POST',
          headers,
          body: JSON.stringify({ properties })
        });
        result = await createDealResponse.json();
        break;

      case 'search':
        const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/${object_type}/search`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ filterGroups: filters, limit: 100 })
        });
        result = await searchResponse.json();
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'hubspot' });
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