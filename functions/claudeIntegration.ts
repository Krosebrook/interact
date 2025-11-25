import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, model = "claude-3-5-sonnet-20241022", messages, system, max_tokens = 4096 } = await req.json();

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      system: system || "You are a helpful assistant.",
      messages: messages || [{ role: "user", content: prompt }]
    });

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'claude' });
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
      content: response.content[0].text,
      usage: response.usage
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});