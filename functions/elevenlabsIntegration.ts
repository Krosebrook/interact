import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, text, voice_id = "21m00Tcm4TlvDq8ikWAM", model_id = "eleven_monolingual_v1" } = await req.json();

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    let result;

    switch (action) {
      case 'text_to_speech':
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text,
            model_id,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        });
        
        if (!ttsResponse.ok) {
          throw new Error(`ElevenLabs API error: ${ttsResponse.status}`);
        }
        
        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        result = { audio_base64: audioBase64, content_type: 'audio/mpeg' };
        break;

      case 'list_voices':
        const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': ELEVENLABS_API_KEY }
        });
        result = await voicesResponse.json();
        break;

      case 'get_voice':
        const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${voice_id}`, {
          headers: { 'xi-api-key': ELEVENLABS_API_KEY }
        });
        result = await voiceResponse.json();
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'elevenlabs' });
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