import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Google Gemini API integration
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// Available models - use latest/most capable
const MODELS = {
  pro: 'gemini-2.0-flash',              // Latest Gemini 2.0 Flash - very capable
  flash: 'gemini-2.0-flash',            // Fast option
  thinking: 'gemini-2.0-flash-thinking-exp-01-21',  // Thinking model
  pro_latest: 'gemini-1.5-pro-latest',  // Gemini 1.5 Pro
  embedding: 'text-embedding-004'        // Latest embedding model
};

const DEFAULT_MODEL = MODELS.pro;

async function callGemini(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }
  
  return response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action = 'chat',
      prompt, 
      model,
      messages,
      system,
      temperature = 1,
      max_tokens,
      tools,
      safety_settings,
      generation_config = {}
    } = await req.json();

    let result;
    const selectedModel = model || DEFAULT_MODEL;

    switch (action) {
      case 'chat': {
        // Convert messages to Gemini format
        const contents = [];
        
        if (messages && messages.length > 0) {
          for (const msg of messages) {
            contents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            });
          }
        } else if (prompt) {
          contents.push({
            role: 'user',
            parts: [{ text: prompt }]
          });
        }

        const requestBody = {
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: max_tokens || 8192,
            ...generation_config
          }
        };

        // Add system instruction if provided
        if (system) {
          requestBody.systemInstruction = { parts: [{ text: system }] };
        }

        // Add safety settings if provided
        if (safety_settings) {
          requestBody.safetySettings = safety_settings;
        }

        // Add tools if provided
        if (tools && tools.length > 0) {
          requestBody.tools = [{ functionDeclarations: tools }];
        }

        const response = await callGemini(`/models/${selectedModel}:generateContent`, requestBody);
        
        const candidate = response.candidates?.[0];
        let content = '';
        let functionCalls = [];
        
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.text) content += part.text;
            if (part.functionCall) functionCalls.push(part.functionCall);
          }
        }

        result = {
          content,
          function_calls: functionCalls.length > 0 ? functionCalls : undefined,
          finish_reason: candidate?.finishReason,
          safety_ratings: candidate?.safetyRatings,
          usage: response.usageMetadata,
          model: selectedModel
        };
        break;
      }

      case 'vision': {
        // Analyze image with Gemini
        if (!prompt) {
          return Response.json({ error: 'prompt required' }, { status: 400 });
        }

        const parts = [];
        
        // Handle image(s)
        const imageUrls = messages?.[0]?.image_urls || (messages?.[0]?.image_url ? [messages[0].image_url] : []);
        
        for (const imageUrl of imageUrls) {
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
          const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          parts.push({
            inlineData: {
              mimeType,
              data: base64
            }
          });
        }
        
        parts.push({ text: prompt });

        const visionResponse = await callGemini(`/models/${selectedModel}:generateContent`, {
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature,
            maxOutputTokens: max_tokens || 8192
          },
          systemInstruction: system ? { parts: [{ text: system }] } : undefined
        });

        result = {
          content: visionResponse.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: visionResponse.usageMetadata,
          model: selectedModel
        };
        break;
      }

      case 'video': {
        // Analyze video with Gemini
        if (!messages?.[0]?.video_url) {
          return Response.json({ error: 'video_url required' }, { status: 400 });
        }

        const videoResponse = await fetch(messages[0].video_url);
        const videoBuffer = await videoResponse.arrayBuffer();
        const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(videoBuffer)));
        const videoMimeType = videoResponse.headers.get('content-type') || 'video/mp4';

        const videoAnalysisResponse = await callGemini(`/models/${selectedModel}:generateContent`, {
          contents: [{
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: videoMimeType,
                  data: videoBase64
                }
              },
              { text: prompt || "Analyze this video thoroughly." }
            ]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: max_tokens || 8192
          }
        });

        result = {
          content: videoAnalysisResponse.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: videoAnalysisResponse.usageMetadata,
          model: selectedModel
        };
        break;
      }

      case 'thinking': {
        // Use Gemini's thinking model for complex reasoning
        const thinkingModel = 'gemini-2.0-flash-thinking-exp-01-21';
        
        const thinkingResponse = await callGemini(`/models/${thinkingModel}:generateContent`, {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16384
          },
          systemInstruction: system ? { parts: [{ text: system }] } : {
            parts: [{ text: "Think through this problem step by step, showing your reasoning." }]
          }
        });

        result = {
          content: thinkingResponse.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: thinkingResponse.usageMetadata,
          model: thinkingModel
        };
        break;
      }

      case 'embedding': {
        const embeddingResponse = await callGemini(`/models/${MODELS.embedding}:embedContent`, {
          model: `models/${MODELS.embedding}`,
          content: {
            parts: [{ text: prompt }]
          }
        });

        result = {
          embedding: embeddingResponse.embedding?.values || [],
          model: MODELS.embedding
        };
        break;
      }

      case 'code': {
        // Code generation with Gemini
        const codeResponse = await callGemini(`/models/${selectedModel}:generateContent`, {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,  // Lower for code
            maxOutputTokens: max_tokens || 8192
          },
          systemInstruction: {
            parts: [{ 
              text: system || "You are an expert software engineer. Write clean, efficient, well-documented code." 
            }]
          }
        });

        result = {
          content: codeResponse.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: codeResponse.usageMetadata,
          model: selectedModel
        };
        break;
      }

      case 'function_calling': {
        // Explicit function calling
        if (!tools || tools.length === 0) {
          return Response.json({ error: 'tools array required for function_calling action' }, { status: 400 });
        }

        const fcResponse = await callGemini(`/models/${selectedModel}:generateContent`, {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          tools: [{ functionDeclarations: tools }],
          toolConfig: {
            functionCallingConfig: {
              mode: "AUTO"  // AUTO, ANY, or NONE
            }
          },
          generationConfig: {
            temperature,
            maxOutputTokens: max_tokens || 8192
          }
        });

        const fcCandidate = fcResponse.candidates?.[0];
        const functionCalls = [];
        let textContent = '';
        
        if (fcCandidate?.content?.parts) {
          for (const part of fcCandidate.content.parts) {
            if (part.functionCall) functionCalls.push(part.functionCall);
            if (part.text) textContent += part.text;
          }
        }

        result = {
          content: textContent,
          function_calls: functionCalls,
          finish_reason: fcCandidate?.finishReason,
          usage: fcResponse.usageMetadata,
          model: selectedModel
        };
        break;
      }

      case 'count_tokens': {
        const tokenResponse = await callGemini(`/models/${selectedModel}:countTokens`, {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        });

        result = {
          token_count: tokenResponse.totalTokens,
          model: selectedModel
        };
        break;
      }

      default:
        return Response.json({ 
          error: 'Invalid action. Use: chat, vision, video, thinking, embedding, code, function_calling, count_tokens' 
        }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'gemini' });
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