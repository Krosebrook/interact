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
      userPoints,
      completedChallenges,
      participations,
      learningProgress,
      recognitions,
      teamMemberships
    ] = await Promise.all([
      base44.entities.UserPoints.filter({ user_email: targetEmail }),
      base44.entities.PersonalChallenge.filter({ 
        user_email: targetEmail,
        status: 'completed'
      }),
      base44.entities.Participation.filter({ 
        user_email: targetEmail,
        attendance_status: 'attended'
      }),
      base44.entities.LearningPathProgress.filter({ user_email: targetEmail }),
      base44.entities.Recognition.filter({
        $or: [
          { from_user_email: targetEmail },
          { to_user_email: targetEmail }
        ]
      }),
      base44.entities.TeamMembership.filter({ user_email: targetEmail })
    ]);

    const userPointsData = userPoints[0] || { total_points: 0 };
    
    // Get company objectives (mock for now - could be stored in settings)
    const companyObjectives = [
      'Increase cross-team collaboration',
      'Boost learning and development engagement',
      'Improve recognition culture',
      'Enhance event participation'
    ];

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate personalized gamification challenges:

User Performance:
- Total Points: ${userPointsData.total_points}
- Completed Challenges: ${completedChallenges.length}
- Events Attended: ${participations.length}
- Learning Paths Active: ${learningProgress.length}
- Recognitions Given: ${recognitions.filter(r => r.from_user_email === targetEmail).length}
- Recognitions Received: ${recognitions.filter(r => r.to_user_email === targetEmail).length}
- Team Memberships: ${teamMemberships.length}

Company Objectives:
${companyObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Create 5 personalized challenges that:
1. Match user's current skill level
2. Align with company objectives
3. Push user slightly beyond comfort zone
4. Are achievable within 1-4 weeks
5. Provide meaningful rewards`,
      response_json_schema: {
        type: 'object',
        properties: {
          challenges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                difficulty: { type: 'string' },
                points_reward: { type: 'number' },
                duration_days: { type: 'number' },
                success_criteria: {
                  type: 'array',
                  items: { type: 'string' }
                },
                alignment_with_objectives: { type: 'string' },
                why_recommended: { type: 'string' }
              }
            }
          },
          engagement_forecast: { type: 'string' }
        }
      }
    });

    // Auto-create the top 2 challenges
    const topChallenges = response.challenges.slice(0, 2);
    await Promise.all(topChallenges.map(challenge =>
      base44.entities.PersonalChallenge.create({
        user_email: targetEmail,
        challenge_title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        points_reward: challenge.points_reward,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + challenge.duration_days * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        ai_generated: true
      })
    ));

    return Response.json({
      user_email: targetEmail,
      generated_date: new Date().toISOString(),
      auto_created_count: topChallenges.length,
      ...response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});