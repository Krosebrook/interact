import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { menteeEmail } = await req.json();
    
    // Fetch mentee profile
    const [menteeProfile] = await base44.entities.UserProfile.filter({ user_email: menteeEmail });
    
    if (!menteeProfile) {
      return Response.json({ error: 'Mentee profile not found' }, { status: 404 });
    }
    
    // Fetch all potential mentors (experienced users)
    const allProfiles = await base44.asServiceRole.entities.UserProfile.filter({});
    const potentialMentors = allProfiles.filter(p => 
      p.user_email !== menteeEmail &&
      (p.skills?.length || 0) >= 5 &&
      new Date(p.start_date) < new Date(menteeProfile.start_date)
    );
    
    // Use AI to analyze best matches
    const analysisPrompt = `Analyze mentor-mentee compatibility for employee onboarding:

Mentee Profile:
- Email: ${menteeEmail}
- Role: ${menteeProfile.role || 'Not specified'}
- Department: ${menteeProfile.department || 'Not specified'}
- Skills: ${menteeProfile.skills?.map(s => s.skill_name).join(', ') || 'None listed'}
- Interests: ${menteeProfile.interests?.join(', ') || 'None listed'}
- Career aspirations: ${menteeProfile.career_aspirations || 'Not specified'}

Potential Mentors (${potentialMentors.length}):
${potentialMentors.slice(0, 10).map((p, i) => `
${i + 1}. ${p.user_email}
   Role: ${p.role || 'Unknown'}
   Department: ${p.department || 'Unknown'}
   Skills: ${p.skills?.map(s => s.skill_name).join(', ') || 'None'}
   Experience: ${p.career_history?.length || 0} positions
`).join('\n')}

Return the top 3 mentor matches with scores and reasoning.`;
    
    const matches = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                mentor_email: { type: "string" },
                match_score: { type: "number" },
                skill_overlap_score: { type: "number" },
                department_alignment: { type: "boolean" },
                reasoning: { type: "string" },
                suggested_goals: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });
    
    // Save top matches to database
    for (const match of matches.matches.slice(0, 3)) {
      const existing = await base44.entities.MentorMatch.filter({
        mentor_email: match.mentor_email,
        mentee_email: menteeEmail
      });
      
      if (existing.length === 0) {
        await base44.asServiceRole.entities.MentorMatch.create({
          mentor_email: match.mentor_email,
          mentee_email: menteeEmail,
          match_score: match.match_score,
          matching_criteria: {
            skill_overlap: match.skill_overlap_score,
            department_alignment: match.department_alignment
          },
          status: 'suggested',
          goals: match.suggested_goals?.map(g => ({ goal: g, progress: 0 })) || []
        });
      }
    }
    
    return Response.json({
      success: true,
      matches: matches.matches
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});