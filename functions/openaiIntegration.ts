import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, prompt, model = "gpt-4o-mini", messages, options = {} } = await req.json();

    let result;

    switch (action) {
      case 'chat':
        const chatResponse = await openai.chat.completions.create({
          model,
          messages: messages || [{ role: "user", content: prompt }],
          ...options
        });
        result = {
          content: chatResponse.choices[0].message.content,
          usage: chatResponse.usage
        };
        break;

      case 'embedding':
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: prompt,
        });
        result = { embedding: embeddingResponse.data[0].embedding };
        break;

      case 'image':
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: options.size || "1024x1024",
        });
        result = { image_url: imageResponse.data[0].url };
        break;

      case 'tts':
        const ttsResponse = await openai.audio.speech.create({
          model: "tts-1",
          voice: options.voice || "alloy",
          input: prompt,
        });
        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        result = { audio_base64: audioBase64 };
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'openai' });
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