import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, model = "llama-3.1-sonar-small-128k-online" } = await req.json();

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("PERPLEXITY_API_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: query }],
        return_citations: true,
        return_images: false
      }),
    });

    const data = await response.json();

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'perplexity' });
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
      content: data.choices?.[0]?.message?.content,
      citations: data.citations || []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});