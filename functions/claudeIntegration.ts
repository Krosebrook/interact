import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// Available models - use latest/most capable by default
const MODELS = {
  opus: 'claude-sonnet-4-20250514',      // Most capable (note: claude-4-opus when available)
  sonnet: 'claude-sonnet-4-20250514',    // Claude 4 Sonnet - excellent balance
  haiku: 'claude-3-5-haiku-20241022',    // Fast/cheap option
  legacy_opus: 'claude-3-opus-20240229'  // Previous most capable
};

// Default to Claude 4 Sonnet for best balance of capability
const DEFAULT_MODEL = MODELS.sonnet;
const MAX_TOKENS = 8192;  // Max output tokens

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
      max_tokens = MAX_TOKENS,
      temperature = 1,
      tools,
      tool_choice,
      metadata,
      stop_sequences
    } = await req.json();

    let result;

    switch (action) {
      case 'chat': {
        const chatModel = model || DEFAULT_MODEL;
        
        const requestParams = {
          model: chatModel,
          max_tokens,
          temperature,
          messages: messages || [{ role: "user", content: prompt }]
        };

        // Add system prompt if provided
        if (system) {
          requestParams.system = system;
        }

        // Add tools if provided
        if (tools && tools.length > 0) {
          requestParams.tools = tools;
          if (tool_choice) {
            requestParams.tool_choice = tool_choice;
          }
        }

        // Add metadata if provided
        if (metadata) {
          requestParams.metadata = metadata;
        }

        // Add stop sequences if provided
        if (stop_sequences) {
          requestParams.stop_sequences = stop_sequences;
        }

        const response = await anthropic.messages.create(requestParams);

        // Extract content properly
        let content = '';
        let tool_use = null;
        
        for (const block of response.content) {
          if (block.type === 'text') {
            content += block.text;
          } else if (block.type === 'tool_use') {
            tool_use = {
              id: block.id,
              name: block.name,
              input: block.input
            };
          }
        }

        result = {
          content,
          tool_use,
          stop_reason: response.stop_reason,
          usage: response.usage,
          model: chatModel
        };
        break;
      }

      case 'vision': {
        // Analyze image with Claude
        if (!prompt) {
          return Response.json({ error: 'prompt required' }, { status: 400 });
        }

        const imageContent = [];
        
        // Support multiple images
        const imageUrls = Array.isArray(messages?.[0]?.image_urls) 
          ? messages[0].image_urls 
          : [messages?.[0]?.image_url];
        
        for (const imageUrl of imageUrls.filter(Boolean)) {
          // Fetch image and convert to base64
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
          const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          imageContent.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64
            }
          });
        }
        
        imageContent.push({ type: "text", text: prompt });

        const visionResponse = await anthropic.messages.create({
          model: model || DEFAULT_MODEL,
          max_tokens,
          messages: [{ role: "user", content: imageContent }],
          system: system || "Analyze the image(s) carefully and provide detailed insights."
        });

        result = {
          content: visionResponse.content[0].text,
          usage: visionResponse.usage,
          model: model || DEFAULT_MODEL
        };
        break;
      }

      case 'analyze_document': {
        // PDF/document analysis
        if (!messages?.[0]?.document_url) {
          return Response.json({ error: 'document_url required' }, { status: 400 });
        }

        const docResponse = await fetch(messages[0].document_url);
        const docBuffer = await docResponse.arrayBuffer();
        const docBase64 = btoa(String.fromCharCode(...new Uint8Array(docBuffer)));
        const docMediaType = docResponse.headers.get('content-type') || 'application/pdf';

        const docAnalysisResponse = await anthropic.messages.create({
          model: model || DEFAULT_MODEL,
          max_tokens,
          messages: [{
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: docMediaType,
                  data: docBase64
                }
              },
              { type: "text", text: prompt || "Analyze this document thoroughly." }
            ]
          }],
          system: system || "You are an expert document analyst. Provide comprehensive analysis."
        });

        result = {
          content: docAnalysisResponse.content[0].text,
          usage: docAnalysisResponse.usage,
          model: model || DEFAULT_MODEL
        };
        break;
      }

      case 'extended_thinking': {
        // Extended thinking mode for complex reasoning
        const thinkingResponse = await anthropic.messages.create({
          model: model || DEFAULT_MODEL,
          max_tokens: 16000,  // Larger for extended output
          thinking: {
            type: "enabled",
            budget_tokens: 10000  // Allow substantial thinking
          },
          messages: messages || [{ role: "user", content: prompt }],
          system: system || "Think through this problem step by step, showing your reasoning process."
        });

        let thinking = '';
        let answer = '';
        
        for (const block of thinkingResponse.content) {
          if (block.type === 'thinking') {
            thinking = block.thinking;
          } else if (block.type === 'text') {
            answer = block.text;
          }
        }

        result = {
          thinking,
          content: answer,
          usage: thinkingResponse.usage,
          model: model || DEFAULT_MODEL
        };
        break;
      }

      case 'tool_use': {
        // Explicit tool use mode
        if (!tools || tools.length === 0) {
          return Response.json({ error: 'tools array required for tool_use action' }, { status: 400 });
        }

        const toolResponse = await anthropic.messages.create({
          model: model || DEFAULT_MODEL,
          max_tokens,
          tools,
          tool_choice: tool_choice || { type: "auto" },
          messages: messages || [{ role: "user", content: prompt }],
          system: system || "Use the available tools to help answer the user's request."
        });

        const toolUses = [];
        let textContent = '';
        
        for (const block of toolResponse.content) {
          if (block.type === 'tool_use') {
            toolUses.push({
              id: block.id,
              name: block.name,
              input: block.input
            });
          } else if (block.type === 'text') {
            textContent += block.text;
          }
        }

        result = {
          content: textContent,
          tool_uses: toolUses,
          stop_reason: toolResponse.stop_reason,
          usage: toolResponse.usage,
          model: model || DEFAULT_MODEL
        };
        break;
      }

      default:
        return Response.json({ 
          error: 'Invalid action. Use: chat, vision, analyze_document, extended_thinking, tool_use' 
        }, { status: 400 });
    }

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

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});