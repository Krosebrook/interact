import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, context } = await req.json();

    switch (action) {
      case 'find_matches': {
        const { match_type = 'peer_buddy', limit = 5 } = context;
        
        // Fetch user's profile and activity data
        const [userProfile, userPoints, allProfiles, allUserPoints] = await Promise.all([
          base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
          base44.asServiceRole.entities.UserPoints.filter({ user_email: user.email }).then(r => r[0]),
          base44.asServiceRole.entities.UserProfile.list(),
          base44.asServiceRole.entities.UserPoints.list()
        ]);

        // Filter out self and create candidate pool
        const candidates = allProfiles.filter(p => p.user_email !== user.email);
        
        const prompt = `You are an AI buddy matching expert for an employee engagement platform.

User Profile:
- Email: ${user.email}
- Skills/Interests: ${userProfile?.skill_interests?.join(', ') || 'None specified'}
- Expertise: ${userProfile?.expertise_areas?.join(', ') || 'None'}
- Learning Goals: ${userProfile?.learning_goals?.join(', ') || 'None'}
- Personality: ${JSON.stringify(userProfile?.personality_traits || {})}
- Points: ${userPoints?.total_points || 0}
- Tier: ${userPoints?.tier || 'bronze'}
- Preferred Learning Styles: ${userProfile?.preferred_learning_styles?.join(', ') || 'Not set'}

Match Type: ${match_type}
${match_type === 'mentor' ? '(User seeks someone MORE experienced)' : ''}
${match_type === 'mentee' ? '(User wants to MENTOR someone)' : ''}
${match_type === 'peer_buddy' ? '(User seeks someone at SIMILAR level)' : ''}

Candidate Pool (${candidates.length} people):
${candidates.slice(0, 20).map(c => {
  const points = allUserPoints.find(p => p.user_email === c.user_email);
  return `- ${c.user_email}: Skills: ${c.skill_interests?.slice(0,3).join(', ') || 'None'}, Expertise: ${c.expertise_areas?.slice(0,2).join(', ') || 'None'}, Tier: ${points?.tier || 'bronze'}, Points: ${points?.total_points || 0}`;
}).join('\n')}

Find the ${limit} BEST matches considering:
1. Skill overlap (for peer buddies) or complementary skills (for mentorship)
2. Similar learning styles and personality compatibility
3. For mentors: higher tier/experience level
4. For mentees: lower tier/less experienced but motivated
5. Shared interests and goals

Return matches with high compatibility scores (60-100).`;

        const matches = await base44.asServiceRole.integrations.Core.InvokeLLM({
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
                    match_reasoning: { type: "string" },
                    suggested_goals: { type: "array", items: { type: "string" } },
                    compatibility_factors: {
                      type: "object",
                      properties: {
                        skill_overlap: { type: "number" },
                        personality_fit: { type: "number" },
                        experience_level_match: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, matches: matches.matches });
      }

      case 'suggest_activities': {
        const { buddy_email } = context;
        
        const [userProfile, buddyProfile, buddyMatch] = await Promise.all([
          base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
          base44.asServiceRole.entities.UserProfile.filter({ user_email: buddy_email }).then(r => r[0]),
          base44.asServiceRole.entities.BuddyMatch.filter({ 
            user_email: user.email, 
            buddy_email: buddy_email 
          }).then(r => r[0])
        ]);

        const prompt = `Suggest collaborative activities for this buddy pair:

User 1: ${user.email}
- Skills: ${userProfile?.skill_interests?.join(', ') || 'None'}
- Goals: ${buddyMatch?.goals?.join(', ') || 'Connect and learn'}

User 2: ${buddy_email}
- Skills: ${buddyProfile?.skill_interests?.join(', ') || 'None'}

Match Type: ${buddyMatch?.match_type || 'peer_buddy'}
Interaction Count: ${buddyMatch?.interactions_count || 0}

Suggest 5-7 activities they can do together to strengthen their relationship:
- Knowledge sharing sessions
- Collaborative projects
- Skill workshops
- Challenges to complete together
- Social activities`;

        const activities = await base44.asServiceRole.integrations.Core.InvokeLLM({
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
                    activity_type: { 
                      type: "string",
                      enum: ["knowledge_share", "project", "workshop", "challenge", "social", "review"]
                    },
                    estimated_time: { type: "string" },
                    benefits: { type: "array", items: { type: "string" } },
                    points_reward: { type: "number" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, activities: activities.activities });
      }

      case 'analyze_compatibility': {
        const { buddy_email } = context;
        
        const [userProfile, buddyProfile, interactions] = await Promise.all([
          base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
          base44.asServiceRole.entities.UserProfile.filter({ user_email: buddy_email }).then(r => r[0]),
          base44.asServiceRole.entities.BuddyMatch.filter({
            $or: [
              { user_email: user.email, buddy_email: buddy_email },
              { user_email: buddy_email, buddy_email: user.email }
            ]
          })
        ]);

        const prompt = `Analyze compatibility between these two users:

User A: ${user.email}
- Skills: ${userProfile?.skill_interests?.join(', ') || 'None'}
- Expertise: ${userProfile?.expertise_areas?.join(', ') || 'None'}
- Personality: ${JSON.stringify(userProfile?.personality_traits || {})}
- Learning Style: ${userProfile?.preferred_learning_styles?.join(', ') || 'Not set'}

User B: ${buddy_email}
- Skills: ${buddyProfile?.skill_interests?.join(', ') || 'None'}
- Expertise: ${buddyProfile?.expertise_areas?.join(', ') || 'None'}
- Personality: ${JSON.stringify(buddyProfile?.personality_traits || {})}
- Learning Style: ${buddyProfile?.preferred_learning_styles?.join(', ') || 'Not set'}

Interactions: ${interactions.length}

Provide detailed compatibility analysis.`;

        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              overall_score: { type: "number" },
              strengths: { type: "array", items: { type: "string" } },
              potential_challenges: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              best_collaboration_areas: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ success: true, analysis });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Buddy Matching AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process buddy matching request' 
    }, { status: 500 });
  }
});