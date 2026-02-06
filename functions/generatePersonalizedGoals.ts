import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userEmail } = await req.json();
    
    // Fetch comprehensive user data
    const [profile] = await base44.entities.UserProfile.filter({ user_email: userEmail });
    const [userPoints] = await base44.entities.UserPoints.filter({ user_email: userEmail });
    const personalChallenges = await base44.entities.PersonalChallenge.filter({ user_email: userEmail });
    const participations = await base44.entities.Participation.filter({ user_email: userEmail });
    const recognitions = await base44.entities.Recognition.filter({ sender_email: userEmail });
    const wellnessLogs = await base44.entities.WellnessLog.filter({ user_email: userEmail });
    
    // Calculate activity patterns
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = {
      challenges: personalChallenges.filter(c => new Date(c.created_date) > last30Days).length,
      events: participations.filter(p => new Date(p.created_date) > last30Days).length,
      recognitions: recognitions.filter(r => new Date(r.created_date) > last30Days).length,
      wellnessLogs: wellnessLogs.filter(w => new Date(w.created_date) > last30Days).length
    };
    
    const completedChallenges = personalChallenges.filter(c => c.status === 'completed');
    const avgChallengeProgress = personalChallenges.length > 0
      ? personalChallenges.reduce((sum, c) => sum + (c.progress || 0), 0) / personalChallenges.length
      : 0;
    
    // Get user's strongest areas
    const skillsCount = profile?.skills?.length || 0;
    const interestsCount = profile?.interests?.length || 0;
    
    const prompt = `Generate 5 personalized achievement goals for an employee:

User Profile:
- Role: ${profile?.role || 'Employee'}
- Department: ${profile?.department || 'Not specified'}
- Skills: ${skillsCount}
- Current Level: ${userPoints?.current_level || 1}
- Total Points: ${userPoints?.total_points || 0}

Activity History (Last 30 Days):
- Challenges attempted: ${recentActivity.challenges}
- Events attended: ${recentActivity.events}
- Recognitions sent: ${recentActivity.recognitions}
- Wellness logs: ${recentActivity.wellnessLogs}

Performance:
- Challenges completed: ${completedChallenges.length}
- Average challenge progress: ${Math.round(avgChallengeProgress)}%
- Current streak: ${userPoints?.current_streak || 0} days

Generate 5 SMART goals that are:
- Specific and measurable
- Achievable based on their history
- Relevant to their role/interests
- Time-bound (7, 14, or 30 days)
- Progressive (gradually increasing difficulty)

Include mix of: social goals, wellness goals, learning goals, contribution goals.`;
    
    const goals = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: {
                  type: "string",
                  enum: ["social", "wellness", "learning", "contribution", "engagement"]
                },
                target_value: { type: "number" },
                target_unit: { type: "string" },
                duration_days: { type: "number" },
                points_reward: { type: "number" },
                difficulty: {
                  type: "string",
                  enum: ["easy", "medium", "hard"]
                },
                reasoning: { type: "string" }
              }
            }
          },
          overall_recommendation: { type: "string" }
        }
      }
    });
    
    // Save goals as PersonalChallenge entities
    const createdGoals = [];
    for (const goal of goals.goals) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + goal.duration_days);
      
      const challenge = await base44.asServiceRole.entities.PersonalChallenge.create({
        user_email: userEmail,
        title: goal.title,
        description: goal.description,
        goal_type: goal.category,
        target_value: goal.target_value,
        points_reward: goal.points_reward,
        difficulty: goal.difficulty,
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'suggested',
        ai_generated: true
      });
      
      createdGoals.push(challenge);
    }
    
    return Response.json({
      success: true,
      goals: createdGoals,
      recommendation: goals.overall_recommendation
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});