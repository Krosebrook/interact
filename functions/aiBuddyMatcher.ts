import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, user_email, match_type, buddy_match_id } = await req.json();

    switch (action) {
      case 'find_matches':
        return await findBuddyMatches(base44, user_email || user.email, match_type);
      
      case 'suggest_activities':
        return await suggestActivities(base44, buddy_match_id);
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Buddy Matcher Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function findBuddyMatches(base44, userEmail, matchType) {
  // Fetch user profile and all other users
  const [userProfile, allProfiles, existingMatches] = await Promise.all([
    base44.entities.UserProfile.filter({ user_email: userEmail }).then(p => p[0]),
    base44.entities.UserProfile.list(),
    base44.entities.BuddyMatch.filter({
      $or: [
        { user_email: userEmail },
        { buddy_email: userEmail }
      ]
    })
  ]);

  if (!userProfile) {
    throw new Error('User profile not found');
  }

  // Filter out self and existing matches
  const existingEmails = new Set([
    userEmail,
    ...existingMatches.map(m => m.user_email),
    ...existingMatches.map(m => m.buddy_email)
  ]);

  const candidates = allProfiles.filter(p => !existingEmails.has(p.user_email));

  // Build AI prompt
  const prompt = `You are an expert at matching people for mentorship and buddy relationships in a workplace.

Target User Profile:
- Email: ${userProfile.user_email}
- Department: ${userProfile.department || 'Unknown'}
- Job Title: ${userProfile.job_title || 'Unknown'}
- Skills: ${userProfile.skill_interests?.join(', ') || 'None listed'}
- Expertise: ${userProfile.expertise_areas?.join(', ') || 'None listed'}
- Learning Goals: ${userProfile.learning_goals?.join(', ') || 'None listed'}
- Years at Company: ${userProfile.years_at_company || 0}

Match Type: ${matchType || 'peer_buddy'}

Available Candidates: ${candidates.length}

Analyze the candidates and return the top 5-10 matches based on:
- Complementary skills (they can learn from each other)
- Shared interests
- Department diversity (cross-pollination)
- Experience level compatibility
- Personality fit (if data available)

For each match, calculate:
- match_score: 0-100
- shared_interests: array of common interests
- reasoning: why this is a good match

Return JSON:
{
  "matches": [
    {
      "buddy_email": "email",
      "match_score": 85,
      "shared_interests": ["skill1", "skill2"],
      "complementary_skills": ["skill3", "skill4"],
      "reasoning": "detailed explanation"
    }
  ]
}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        matches: {
          type: "array",
          items: {
            type: "object",
            properties: {
              buddy_email: { type: "string" },
              match_score: { type: "number" },
              shared_interests: { type: "array", items: { type: "string" } },
              complementary_skills: { type: "array", items: { type: "string" } },
              reasoning: { type: "string" }
            }
          }
        }
      }
    }
  });

  // Enrich matches with candidate details
  const enrichedMatches = response.matches
    .map(match => {
      const candidate = candidates.find(c => c.user_email === match.buddy_email);
      return candidate ? { ...match, candidate } : null;
    })
    .filter(m => m !== null)
    .slice(0, 10);

  return Response.json({ matches: enrichedMatches });
}

async function suggestActivities(base44, buddyMatchId) {
  const match = await base44.entities.BuddyMatch.get(buddyMatchId);
  
  if (!match) {
    throw new Error('Buddy match not found');
  }

  const [userProfile, buddyProfile] = await Promise.all([
    base44.entities.UserProfile.filter({ user_email: match.user_email }).then(p => p[0]),
    base44.entities.UserProfile.filter({ user_email: match.buddy_email }).then(p => p[0])
  ]);

  const prompt = `Suggest 5-7 activities for a buddy/mentorship pair to do together.

User 1: ${userProfile.display_name || userProfile.user_email}
- Skills: ${userProfile.skill_interests?.join(', ')}
- Goals: ${userProfile.learning_goals?.join(', ')}

User 2: ${buddyProfile.display_name || buddyProfile.user_email}
- Skills: ${buddyProfile.skill_interests?.join(', ')}
- Goals: ${buddyProfile.learning_goals?.join(', ')}

Match Type: ${match.match_type}
Shared Interests: ${match.shared_interests?.join(', ')}
Goals: ${match.goals?.join(', ')}

Suggest activities that:
- Help build their relationship
- Support their learning goals
- Are practical and doable remotely
- Mix social and professional development

Return JSON:
{
  "activities": [
    {
      "title": "activity name",
      "description": "what to do",
      "duration": "30 min",
      "category": "social|learning|project|discussion",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        activities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              duration: { type: "string" },
              category: { type: "string" },
              difficulty: { type: "string" }
            }
          }
        }
      }
    }
  });

  return Response.json(response);
}