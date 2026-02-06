import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, keywords, activityType, duration } = await req.json();
    
    const prompt = `Generate an engaging event description for a company team-building event:

Event Title: ${title}
Activity Type: ${activityType || 'General'}
Duration: ${duration || 'Not specified'}
Keywords: ${keywords || 'None'}

Requirements:
- Professional yet friendly tone
- Highlight benefits (team bonding, skill development, fun)
- Include what participants will do
- End with an encouraging call-to-action
- Keep it 2-3 sentences
- Make it exciting and inclusive for remote employees

Generate the description:`;
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          benefits: {
            type: "array",
            items: { type: "string" }
          },
          suggested_tags: {
            type: "array",
            items: { type: "string" }
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