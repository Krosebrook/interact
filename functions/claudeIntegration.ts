import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk';
import type {
  Base44Client,
  Integration,
  LLMMessage,
} from './lib/types.ts';
import { getErrorMessage } from './lib/types.ts';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// Available models - use latest/most capable by default
const MODELS: Record<string, string> = {
  opus: 'claude-sonnet-4-20250514',      // Most capable (note: claude-4-opus when available)
  sonnet: 'claude-sonnet-4-20250514',    // Claude 4 Sonnet - excellent balance
  haiku: 'claude-3-5-haiku-20241022',    // Fast/cheap option
  legacy_opus: 'claude-3-opus-20240229'  // Previous most capable
};

// Default to Claude 4 Sonnet for best balance of capability
const DEFAULT_MODEL = MODELS.sonnet;
const MAX_TOKENS = 8192;  // Max output tokens

type ClaudeAction = 'chat' | 'vision' | 'analyze_document' | 'extended_thinking' | 'tool_use';

interface ClaudeTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface ClaudeToolChoice {
  type: 'auto' | 'any' | 'tool';
  name?: string;
}

interface ClaudeRequestPayload {
  action?: ClaudeAction;
  prompt?: string;
  model?: string;
  messages?: LLMMessage[];
  system?: string;
  max_tokens?: number;
  temperature?: number;
  tools?: ClaudeTool[];
  tool_choice?: ClaudeToolChoice;
  metadata?: Record<string, unknown>;
  stop_sequences?: string[];
}

interface ClaudeToolUse {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface ClaudeUsage {
  input_tokens: number;
  output_tokens: number;
}

interface ClaudeResult {
  content: string;
  tool_use?: ClaudeToolUse | null;
  tool_uses?: ClaudeToolUse[];
  thinking?: string;
  stop_reason?: string;
  usage?: ClaudeUsage;
  model: string;
}

interface ContentBlock {
  type: 'text' | 'tool_use' | 'thinking';
  text?: string;
  thinking?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface ImageContent {
  type: 'image' | 'text';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

interface DocumentContent {
  type: 'document' | 'text';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const base44 = createClientFromRequest(req) as Base44Client;
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
    }: ClaudeRequestPayload = await req.json();

    let result: ClaudeResult;

    switch (action) {
      case 'chat': {
        const chatModel = model || DEFAULT_MODEL;

        const requestParams: Record<string, unknown> = {
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

        const response = await anthropic.messages.create(requestParams as Parameters<typeof anthropic.messages.create>[0]);

        // Extract content properly
        let content = '';
        let tool_use: ClaudeToolUse | null = null;

        for (const block of response.content as ContentBlock[]) {
          if (block.type === 'text') {
            content += block.text || '';
          } else if (block.type === 'tool_use') {
            tool_use = {
              id: block.id || '',
              name: block.name || '',
              input: block.input || {}
            };
          }
        }

        result = {
          content,
          tool_use,
          stop_reason: response.stop_reason,
          usage: response.usage as ClaudeUsage,
          model: chatModel
        };
        break;
      }

      case 'vision': {
        // Analyze image with Claude
        if (!prompt) {
          return Response.json({ error: 'prompt required' }, { status: 400 });
        }

        const imageContent: ImageContent[] = [];

        // Support multiple images
        const imageUrls = Array.isArray(messages?.[0]?.image_urls)
          ? messages[0].image_urls
          : messages?.[0]?.image_url ? [messages[0].image_url] : [];

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
          messages: [{ role: "user", content: imageContent as unknown as string }],
          system: system || "Analyze the image(s) carefully and provide detailed insights."
        });

        const visionContent = visionResponse.content[0] as ContentBlock;
        result = {
          content: visionContent.text || '',
          usage: visionResponse.usage as ClaudeUsage,
          model: model || DEFAULT_MODEL
        };
        break;
      }

      case 'analyze_document': {
        // PDF/document analysis
        if (!messages?.[0]?.image_url) {
          return Response.json({ error: 'document_url required' }, { status: 400 });
        }

        const docUrl = messages[0].image_url; // Using image_url field for document
        const docResponse = await fetch(docUrl);
        const docBuffer = await docResponse.arrayBuffer();
        const docBase64 = btoa(String.fromCharCode(...new Uint8Array(docBuffer)));
        const docMediaType = docResponse.headers.get('content-type') || 'application/pdf';

        const docContent: DocumentContent[] = [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: docMediaType,
              data: docBase64
            }
          },
          { type: "text", text: prompt || "Analyze this document thoroughly." }
        ];

        const docAnalysisResponse = await anthropic.messages.create({
          model: model || DEFAULT_MODEL,
          max_tokens,
          messages: [{
            role: "user",
            content: docContent as unknown as string
          }],
          system: system || "You are an expert document analyst. Provide comprehensive analysis."
        });

        const docContentBlock = docAnalysisResponse.content[0] as ContentBlock;
        result = {
          content: docContentBlock.text || '',
          usage: docAnalysisResponse.usage as ClaudeUsage,
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
          messages: messages as Parameters<typeof anthropic.messages.create>[0]['messages'] || [{ role: "user", content: prompt || '' }],
          system: system || "Think through this problem step by step, showing your reasoning process."
        } as Parameters<typeof anthropic.messages.create>[0]);

        let thinking = '';
        let answer = '';

        for (const block of thinkingResponse.content as ContentBlock[]) {
          if (block.type === 'thinking') {
            thinking = block.thinking || '';
          } else if (block.type === 'text') {
            answer = block.text || '';
          }
        }

        result = {
          thinking,
          content: answer,
          usage: thinkingResponse.usage as ClaudeUsage,
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
          tools: tools as Parameters<typeof anthropic.messages.create>[0]['tools'],
          tool_choice: tool_choice as Parameters<typeof anthropic.messages.create>[0]['tool_choice'] || { type: "auto" },
          messages: messages as Parameters<typeof anthropic.messages.create>[0]['messages'] || [{ role: "user", content: prompt || '' }],
          system: system || "Use the available tools to help answer the user's request."
        });

        const toolUses: ClaudeToolUse[] = [];
        let textContent = '';

        for (const block of toolResponse.content as ContentBlock[]) {
          if (block.type === 'tool_use') {
            toolUses.push({
              id: block.id || '',
              name: block.name || '',
              input: block.input || {}
            });
          } else if (block.type === 'text') {
            textContent += block.text || '';
          }
        }

        result = {
          content: textContent,
          tool_uses: toolUses,
          stop_reason: toolResponse.stop_reason,
          usage: toolResponse.usage as ClaudeUsage,
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
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'claude' }) as Integration[];
      if (integrations.length > 0) {
        await base44.asServiceRole.entities.Integration.update(integrations[0].id, {
          last_used: new Date().toISOString(),
          usage_count: (integrations[0].usage_count || 0) + 1,
          status: 'active'
        });
      }
    } catch (e: unknown) {
      console.error('Failed to update integration stats:', e);
    }

    return Response.json({ success: true, ...result });
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});
