import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Available models - use latest/most capable by default
const MODELS = {
  chat: 'gpt-4o',           // Latest GPT-4o - most capable
  reasoning: 'o1',          // o1 reasoning model
  mini: 'gpt-4o-mini',      // Fast/cheap option
  embedding: 'text-embedding-3-large',  // Best embeddings
  image: 'gpt-image-1',     // Latest image model (or dall-e-3)
  tts: 'tts-1-hd',          // High definition TTS
  stt: 'whisper-1'          // Speech to text
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action, 
      prompt, 
      model, 
      messages, 
      options = {},
      system,
      json_schema,
      tools,
      tool_choice
    } = await req.json();

    let result;

    switch (action) {
      case 'chat': {
        const chatModel = model || MODELS.chat;
        
        const requestParams = {
          model: chatModel,
          messages: messages || [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ],
          ...options
        };

        // Add JSON mode if schema provided
        if (json_schema) {
          requestParams.response_format = {
            type: "json_schema",
            json_schema: {
              name: "response",
              schema: json_schema,
              strict: true
            }
          };
        }

        // Add tools/functions if provided
        if (tools) {
          requestParams.tools = tools;
          if (tool_choice) requestParams.tool_choice = tool_choice;
        }

        const chatResponse = await openai.chat.completions.create(requestParams);
        
        result = {
          content: chatResponse.choices[0].message.content,
          tool_calls: chatResponse.choices[0].message.tool_calls,
          finish_reason: chatResponse.choices[0].finish_reason,
          usage: chatResponse.usage,
          model: chatModel
        };
        break;
      }

      case 'reasoning': {
        // o1 model for complex reasoning tasks
        const reasoningModel = model || MODELS.reasoning;
        
        const response = await openai.chat.completions.create({
          model: reasoningModel,
          messages: messages || [{ role: "user", content: prompt }],
          ...options
        });
        
        result = {
          content: response.choices[0].message.content,
          usage: response.usage,
          model: reasoningModel
        };
        break;
      }

      case 'embedding': {
        const embeddingModel = model || MODELS.embedding;
        const embeddingResponse = await openai.embeddings.create({
          model: embeddingModel,
          input: prompt,
          dimensions: options.dimensions || 3072  // Max for large model
        });
        result = { 
          embedding: embeddingResponse.data[0].embedding,
          model: embeddingModel,
          usage: embeddingResponse.usage
        };
        break;
      }

      case 'image': {
        const imageModel = options.model || 'dall-e-3';  // gpt-image-1 not widely available yet
        const imageResponse = await openai.images.generate({
          model: imageModel,
          prompt,
          n: options.n || 1,
          size: options.size || "1024x1024",
          quality: options.quality || "hd",  // hd quality by default
          style: options.style || "natural"
        });
        result = { 
          image_url: imageResponse.data[0].url,
          revised_prompt: imageResponse.data[0].revised_prompt,
          model: imageModel
        };
        break;
      }

      case 'vision': {
        // Analyze image with GPT-4o
        const visionResponse = await openai.chat.completions.create({
          model: MODELS.chat,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: options.image_url, detail: options.detail || "high" } }
              ]
            }
          ],
          max_tokens: options.max_tokens || 4096
        });
        result = {
          content: visionResponse.choices[0].message.content,
          usage: visionResponse.usage
        };
        break;
      }

      case 'tts': {
        const ttsResponse = await openai.audio.speech.create({
          model: options.hd ? "tts-1-hd" : "tts-1",
          voice: options.voice || "nova",  // nova, alloy, echo, fable, onyx, shimmer
          input: prompt,
          speed: options.speed || 1.0
        });
        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        result = { 
          audio_base64: audioBase64,
          format: "mp3",
          model: options.hd ? "tts-1-hd" : "tts-1"
        };
        break;
      }

      case 'transcribe': {
        // Speech to text - requires file_url
        if (!options.file_url) {
          return Response.json({ error: 'file_url required for transcription' }, { status: 400 });
        }
        
        // Fetch the audio file
        const audioResponse = await fetch(options.file_url);
        const audioBlob = await audioResponse.blob();
        const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });
        
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: MODELS.stt,
          language: options.language,
          response_format: options.format || "json"
        });
        
        result = {
          text: transcription.text,
          model: MODELS.stt
        };
        break;
      }

      case 'moderation': {
        const moderationResponse = await openai.moderations.create({
          input: prompt,
          model: "omni-moderation-latest"
        });
        result = {
          flagged: moderationResponse.results[0].flagged,
          categories: moderationResponse.results[0].categories,
          category_scores: moderationResponse.results[0].category_scores
        };
        break;
      }

      default:
        return Response.json({ error: 'Invalid action. Use: chat, reasoning, embedding, image, vision, tts, transcribe, moderation' }, { status: 400 });
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