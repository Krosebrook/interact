import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, context = 'general' } = await req.json();
    const targetEmail = user_email || user.email;

    const [profile, learningProgress, recentActivity, teamMemberships] = await Promise.all([
      base44.entities.UserProfile.filter({ user_email: targetEmail }),
      base44.entities.LearningPathProgress.filter({ user_email: targetEmail }),
      base44.entities.AnalyticsEvent.filter({
        user_email: targetEmail,
        created_date: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
      }),
      base44.entities.TeamMembership.filter({ user_email: targetEmail })
    ]);

    const userProfile = profile[0] || {};
    const userRole = user.role === 'admin' ? 'admin' : user.user_type || 'participant';
    
    // Get team context
    const teams = await Promise.all(
      teamMemberships.map(m => 
        base44.entities.Team.filter({ id: m.team_id })
      )
    );
    const teamNames = teams.flat().map(t => t.team_name);

    // Analyze recent feature usage
    const featureUsage = {};
    recentActivity.forEach(e => {
      if (e.feature_name) {
        featureUsage[e.feature_name] = (featureUsage[e.feature_name] || 0) + 1;
      }
    });

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Curate personalized content for this user:

User Context:
- Role: ${userRole}
- Department: ${userProfile.department || 'Unknown'}
- Teams: ${teamNames.join(', ') || 'None'}
- Skills: ${JSON.stringify(userProfile.skill_levels || [])}
- Interests: ${JSON.stringify(userProfile.skill_interests || [])}
- Recent Activity: ${JSON.stringify(featureUsage)}
- Learning Progress: ${learningProgress.length} paths in progress

Content Context: ${context}

Curate:
1. Relevant documentation sections
2. Learning materials based on role and projects
3. Best practice guides
4. Tools and resources
5. Team-specific knowledge

Return content categorized by relevance and type.`,
      response_json_schema: {
        type: 'object',
        properties: {
          curated_content: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                content_type: { type: 'string' },
                relevance_score: { type: 'number' },
                tags: { type: 'array', items: { type: 'string' } },
                estimated_time: { type: 'string' },
                url: { type: 'string' }
              }
            }
          },
          quick_wins: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                time_to_complete: { type: 'string' }
              }
            }
          },
          recommended_searches: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json({
      user_email: targetEmail,
      context,
      generated_date: new Date().toISOString(),
      ...response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});