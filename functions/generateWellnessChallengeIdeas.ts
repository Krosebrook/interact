import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { theme, duration, teamBased } = await req.json();
    
    // Get current challenges for context
    const existingChallenges = await base44.asServiceRole.entities.WellnessChallenge.filter({
      status: 'active'
    });
    
    const prompt = `Generate 3 unique wellness challenge ideas for a company:

Theme Preference: ${theme || 'Any'}
Duration: ${duration || '30 days'}
Team-Based: ${teamBased ? 'Yes' : 'No'}

Current Active Challenges (avoid duplicates):
${existingChallenges.map(c => `- ${c.title}`).join('\n') || 'None'}

Requirements:
- Inclusive for remote employees
- Measurable goals
- Engaging and motivating
- Appropriate for workplace wellness
- Include promotional copy to encourage participation
- Specify recommended point rewards (50-200 range)

Generate 3 different challenge ideas with:
1. Title
2. Description (2-3 sentences)
3. Goal type (steps, meditation, hydration, etc.)
4. Target value
5. Promotional copy
6. Recommended points reward`;
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          challenges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                challenge_type: { 
                  type: "string",
                  enum: ["steps", "meditation", "hydration", "sleep", "exercise"]
                },
                goal_value: { type: "number" },
                goal_unit: { type: "string" },
                promotional_copy: { type: "string" },
                points_reward: { type: "number" },
                benefits: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });
    
    return Response.json({
      success: true,
      ...response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});