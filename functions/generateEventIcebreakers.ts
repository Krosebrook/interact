import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate AI-powered icebreakers tailored to event type and participants
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Unauthorized: Facilitator access required' }, { status: 403 });
    }

    const { event_id, event_type, participant_count, participant_roles } = await req.json();

    // Fetch event details if event_id provided
    let eventDetails = null;
    if (event_id) {
      eventDetails = await base44.entities.Event.filter({ id: event_id }).then(r => r[0]);
    }

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are an expert team facilitator generating engaging icebreaker activities.

EVENT CONTEXT:
- Type: ${event_type || eventDetails?.event_type || 'general'}
- Participants: ${participant_count || 'unknown'} people
- Roles: ${participant_roles?.join(', ') || 'mixed roles'}
${eventDetails ? `- Title: ${eventDetails.title}` : ''}

Generate 5 creative, engaging icebreakers in JSON format:
{
  "icebreakers": [
    {
      "title": "Catchy icebreaker name",
      "description": "Clear 2-3 sentence explanation",
      "duration_minutes": number (2-10),
      "format": "individual|pairs|small_groups|whole_group",
      "instructions": "Step-by-step facilitator guide",
      "expected_outcome": "What participants will gain",
      "energy_level": "low|medium|high",
      "best_for": ["use_case_1", "use_case_2"]
    }
  ]
}

Rules:
- Range from quick (2 min) to deeper (8-10 min)
- Mix formats (individual, pairs, groups)
- Vary energy levels
- Consider remote/hybrid format
- Make them actionable and clear`;

    const responseSchema = {
      type: "object",
      properties: {
        icebreakers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              duration_minutes: { type: "number" },
              format: { type: "string" },
              instructions: { type: "string" },
              expected_outcome: { type: "string" },
              energy_level: { type: "string" },
              best_for: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role,
      functionName: 'generateEventIcebreakers',
      prompt,
      responseSchema,
      agentName: 'EventFacilitator'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    return Response.json({
      success: true,
      icebreakers: aiResult.data.icebreakers,
      context: {
        event_type: event_type || eventDetails?.event_type,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Icebreaker generation error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});