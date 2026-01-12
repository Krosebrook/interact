import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();
    const targetEmail = user_email || user.email;

    const [
      profile,
      learningProgress,
      moduleCompletions,
      skillTracking,
      badges,
      userPoints
    ] = await Promise.all([
      base44.entities.UserProfile.filter({ user_email: targetEmail }),
      base44.entities.LearningPathProgress.filter({ user_email: targetEmail }),
      base44.entities.ModuleCompletion.filter({ user_email: targetEmail }),
      base44.entities.SkillTracking.filter({ user_email: targetEmail }),
      base44.entities.BadgeAward.filter({ user_email: targetEmail }),
      base44.entities.UserPoints.filter({ user_email: targetEmail })
    ]);

    const userProfile = profile[0] || {};
    const completedPaths = learningProgress.filter(p => p.status === 'completed');
    const currentSkills = userProfile.skill_levels || [];
    const interests = userProfile.skill_interests || [];

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate personalized career path recommendations:

User Profile:
- Current Role: ${userProfile.job_title || 'Not specified'}
- Department: ${userProfile.department || 'Not specified'}
- Skills: ${JSON.stringify(currentSkills)}
- Interests: ${JSON.stringify(interests)}
- Completed Learning Paths: ${completedPaths.length}
- Badges Earned: ${badges.length}
- Total Points: ${userPoints[0]?.total_points || 0}

Company Goals (Assumed):
- Digital transformation
- Leadership development
- Technical excellence
- Cross-functional collaboration

Suggest:
1. 3-5 career development paths aligned with company goals
2. Required skills to develop for each path
3. Recommended learning resources
4. Estimated timeline to achieve each path
5. Mentorship or networking recommendations`,
      response_json_schema: {
        type: 'object',
        properties: {
          career_paths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path_name: { type: 'string' },
                description: { type: 'string' },
                alignment_score: { type: 'number' },
                required_skills: { type: 'array', items: { type: 'string' } },
                skill_gaps: { type: 'array', items: { type: 'string' } },
                estimated_timeline: { type: 'string' },
                learning_resources: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      type: { type: 'string' },
                      priority: { type: 'string' }
                    }
                  }
                },
                milestones: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          immediate_actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                impact: { type: 'string' },
                effort: { type: 'string' }
              }
            }
          },
          mentorship_suggestions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json({
      user_email: targetEmail,
      generated_date: new Date().toISOString(),
      ...response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});