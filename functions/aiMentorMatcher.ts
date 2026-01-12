import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, skills_to_learn } = await req.json();
    const targetEmail = user_email || user.email;

    // Get user's profile
    const userProfile = await base44.entities.UserProfile.filter({ 
      user_email: targetEmail 
    });

    if (!userProfile[0]) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get all potential mentors (users with expertise)
    const allProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: { $ne: targetEmail }
    });

    const potentialMentors = allProfiles.filter(p => 
      p.expertise_areas && p.expertise_areas.length > 0
    );

    // Use AI to match mentors
    const matches = await base44.integrations.Core.InvokeLLM({
      prompt: `Match this user with the best internal mentors:

USER SEEKING MENTORSHIP:
Email: ${targetEmail}
Department: ${userProfile[0].department || 'N/A'}
Job Title: ${userProfile[0].job_title || 'N/A'}
Current Skills: ${userProfile[0].skill_levels?.map(s => `${s.skill} (${s.level})`).join(', ') || 'None'}
Skills to Learn: ${skills_to_learn?.join(', ') || userProfile[0].skill_interests?.join(', ') || 'General growth'}
Learning Goals: ${userProfile[0].learning_goals?.join(', ') || 'N/A'}

POTENTIAL MENTORS (${potentialMentors.length} available):
${potentialMentors.slice(0, 20).map(p => `
- ${p.user_email}
  Department: ${p.department || 'N/A'}
  Job Title: ${p.job_title || 'N/A'}
  Expertise: ${p.expertise_areas?.join(', ') || 'None'}
  Skills: ${p.skill_levels?.map(s => `${s.skill} (${s.level})`).join(', ') || 'None'}
`).join('\n')}

Find the top 5 best mentor matches considering:
1. Expertise alignment with learning goals
2. Department/role relevance
3. Skill level compatibility (mentor should be advanced in areas user wants to learn)

For each match provide:
- mentor_email
- match_score (0-100)
- matching_skills (array of overlapping skills)
- mentorship_areas (what they can teach)
- reasoning (why this is a good match)`,
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
                matching_skills: { type: "array", items: { type: "string" } },
                mentorship_areas: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      user_email: targetEmail,
      matches: matches.matches
    });

  } catch (error) {
    console.error('Mentor matching error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});