import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, prompt, context } = await req.json();

    if (!type || !prompt) {
      return Response.json({ error: 'Missing type or prompt' }, { status: 400 });
    }

    // Build context-aware system prompts
    const systemPrompts = {
      recognition: `You are an expert at writing heartfelt, professional peer recognition messages for a remote-first tech company. 
      Generate 3 different recognition messages that are:
      - Specific and genuine (not generic)
      - Professional but warm
      - Highlight concrete contributions
      - 2-3 sentences each
      - Vary tone from casual to formal`,

      event: `You are an expert event planner for remote-first tech companies.
      Generate 3 different event descriptions that are:
      - Engaging and clear
      - Include objectives and activities
      - Specify duration and format (virtual/hybrid/in-person)
      - Professional yet inviting
      - 3-4 sentences each`,

      moderation: `You are a content moderation expert. Analyze the provided content and provide:
      1. Overall sentiment score (1-10)
      2. Potential policy violations (harassment, discrimination, spam)
      3. Recommended action (approve, flag for review, reject)
      4. Reasoning in 2-3 sentences
      Format as JSON with keys: sentiment, violations[], recommendation, reasoning`,

      learning: `You are a learning & development expert for tech professionals.
      Based on the learning goals provided, suggest 3 different learning paths that include:
      - Path name and duration estimate
      - 3-4 key skills to develop
      - Mix of resources (courses, books, projects)
      - Career impact statement`
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.recognition;

    // Add context to user prompt
    let enhancedPrompt = prompt;
    if (context.recipientName) {
      enhancedPrompt += `\nRecipient: ${context.recipientName}`;
    }
    if (context.activityType) {
      enhancedPrompt += `\nActivity type: ${context.activityType}`;
    }
    if (context.teamSize) {
      enhancedPrompt += `\nTeam size: ${context.teamSize}`;
    }

    // Call LLM
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: enhancedPrompt,
      add_context_from_internet: false,
      response_json_schema: type === 'moderation' ? {
        type: 'object',
        properties: {
          sentiment: { type: 'number' },
          violations: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' },
          reasoning: { type: 'string' }
        }
      } : null
    });

    let suggestions = [];

    if (type === 'moderation') {
      // Moderation returns structured data
      suggestions = [llmResponse];
    } else {
      // Parse multiple suggestions from text response
      const responseText = typeof llmResponse === 'string' ? llmResponse : llmResponse.text || '';
      
      // Split by common delimiters
      const lines = responseText.split(/\n\n+|\d+\.\s+/).filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 && !trimmed.startsWith('Here') && !trimmed.startsWith('Sure');
      });

      suggestions = lines.slice(0, 3).map(s => s.trim());

      // Fallback if parsing fails
      if (suggestions.length === 0) {
        suggestions = [responseText.trim()];
      }
    }

    return Response.json({
      suggestions,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI content generation error:', error);
    return Response.json({ 
      error: 'Failed to generate suggestions',
      details: error.message 
    }, { status: 500 });
  }
});