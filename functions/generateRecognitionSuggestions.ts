import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { recipientEmail, context, valueType } = await req.json();
    
    // Fetch recipient profile
    const [recipientProfile] = await base44.entities.UserProfile.filter({ 
      user_email: recipientEmail 
    });
    
    const companyValues = [
      "Innovation & Creativity",
      "Teamwork & Collaboration", 
      "Customer Focus",
      "Integrity & Transparency",
      "Continuous Learning",
      "Work-Life Balance"
    ];
    
    const prompt = `Generate 3 recognition message suggestions for a peer-to-peer recognition:

Recipient: ${recipientEmail}
Recipient Role: ${recipientProfile?.role || 'Team Member'}
Recipient Department: ${recipientProfile?.department || 'Not specified'}
Recognition Context: ${context || 'General appreciation'}
Company Value Being Recognized: ${valueType || 'Teamwork & Collaboration'}

Company Values: ${companyValues.join(', ')}

Requirements:
- Professional but warm and genuine
- Specific to the context provided
- Reference the company value being recognized
- 1-2 sentences each
- Suitable for public company recognition feed
- Encouraging and uplifting

Generate 3 different message options:`;
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                message: { type: "string" },
                tone: { type: "string" },
                suggested_points: { type: "number" }
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