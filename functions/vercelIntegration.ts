import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const VERCEL_TOKEN = Deno.env.get("VERCEL_TOKEN");
    
    if (!VERCEL_TOKEN) {
      return Response.json({ error: 'Vercel token not configured' }, { status: 500 });
    }

    const { action, project_id, deployment_id, team_id, data } = await req.json();

    const headers = {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const teamQuery = team_id ? `?teamId=${team_id}` : '';
    let result;

    switch (action) {
      case 'list_projects':
        const projectsResponse = await fetch(`https://api.vercel.com/v9/projects${teamQuery}`, { headers });
        result = await projectsResponse.json();
        break;

      case 'get_project':
        const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${project_id}${teamQuery}`, { headers });
        result = await projectResponse.json();
        break;

      case 'list_deployments':
        const deploymentsUrl = project_id 
          ? `https://api.vercel.com/v6/deployments?projectId=${project_id}${team_id ? `&teamId=${team_id}` : ''}`
          : `https://api.vercel.com/v6/deployments${teamQuery}`;
        const deploymentsResponse = await fetch(deploymentsUrl, { headers });
        result = await deploymentsResponse.json();
        break;

      case 'get_deployment':
        const deploymentResponse = await fetch(`https://api.vercel.com/v13/deployments/${deployment_id}${teamQuery}`, { headers });
        result = await deploymentResponse.json();
        break;

      case 'create_deployment':
        const createResponse = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });
        result = await createResponse.json();
        break;

      case 'cancel_deployment':
        const cancelResponse = await fetch(`https://api.vercel.com/v12/deployments/${deployment_id}/cancel${teamQuery}`, {
          method: 'PATCH',
          headers
        });
        result = await cancelResponse.json();
        break;

      case 'list_domains':
        const domainsResponse = await fetch(`https://api.vercel.com/v5/domains${teamQuery}`, { headers });
        result = await domainsResponse.json();
        break;

      case 'get_domain':
        const { domain } = data;
        const domainResponse = await fetch(`https://api.vercel.com/v5/domains/${domain}${teamQuery}`, { headers });
        result = await domainResponse.json();
        break;

      case 'list_env_vars':
        const envResponse = await fetch(`https://api.vercel.com/v9/projects/${project_id}/env${teamQuery}`, { headers });
        result = await envResponse.json();
        break;

      case 'create_env_var':
        const createEnvResponse = await fetch(`https://api.vercel.com/v10/projects/${project_id}/env${teamQuery}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });
        result = await createEnvResponse.json();
        break;

      case 'get_user':
        const userResponse = await fetch('https://api.vercel.com/v2/user', { headers });
        result = await userResponse.json();
        break;

      case 'list_teams':
        const teamsResponse = await fetch('https://api.vercel.com/v2/teams', { headers });
        result = await teamsResponse.json();
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'vercel' });
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