import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate AI-powered discussion prompts for team events
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Unauthorized: Facilitator access required' }, { status: 403 });
    }

    const { event_id, event_type, discussion_topic, team_context } = await req.json();

    // Fetch event and participants
    let eventDetails = null;
    let participants = [];
    if (event_id) {
      [eventDetails, participants] = await Promise.all([
        base44.entities.Event.filter({ id: event_id }).then(r => r[0]),
        base44.entities.Participation.filter({ event_id })
      ]);
    }

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are a skilled facilitator creating discussion prompts for a team event.

EVENT CONTEXT:
- Type: ${event_type || eventDetails?.event_type || 'general'}
- Topic: ${discussion_topic || eventDetails?.title || 'Team discussion'}
- Participants: ${participants.length || 'unknown'} people
${team_context ? `- Team Context: ${team_context}` : ''}

Generate 8 thought-provoking discussion prompts in JSON format:
{
  "prompts": [
    {
      "prompt": "Open-ended question or statement",
      "purpose": "What this prompt aims to achieve",
      "follow_up_questions": ["deeper question 1", "deeper question 2"],
      "timing": "beginning|middle|end|anytime",
      "format": "open_discussion|breakout_groups|round_robin|silent_reflection",
      "expected_duration_minutes": number (5-20),
      "facilitator_tips": "How to guide the discussion"
    }
  ]
}

Rules:
- Mix reflective, creative, and strategic prompts
- Include both individual and group formats
- Provide follow-up questions for depth
- Consider psychological safety (no put-downs)
- Balance fun with meaningful conversation`;

    const responseSchema = {
      type: "object",
      properties: {
        prompts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              prompt: { type: "string" },
              purpose: { type: "string" },
              follow_up_questions: { type: "array", items: { type: "string" } },
              timing: { type: "string" },
              format: { type: "string" },
              expected_duration_minutes: { type: "number" },
              facilitator_tips: { type: "string" }
            }
          }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role,
      functionName: 'generateDiscussionPrompts',
      prompt,
      responseSchema,
      agentName: 'EventFacilitator'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    return Response.json({
      success: true,
      prompts: aiResult.data.prompts,
      context: {
        event_id,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Discussion prompts error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});