import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { challengeId, userEmail } = await req.json();
    
    // Fetch user's challenge history and current progress
    const personalChallenges = await base44.entities.PersonalChallenge.filter({ 
      user_email: userEmail 
    });
    
    const [userPoints] = await base44.entities.UserPoints.filter({ user_email: userEmail });
    const participations = await base44.entities.Participation.filter({ user_email: userEmail });
    const recognitions = await base44.entities.Recognition.filter({ sender_email: userEmail });
    
    // Calculate engagement metrics
    const completedChallenges = personalChallenges.filter(c => c.status === 'completed').length;
    const totalChallenges = personalChallenges.length;
    const completionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0;
    const avgProgress = personalChallenges.length > 0 
      ? personalChallenges.reduce((sum, c) => sum + (c.progress || 0), 0) / personalChallenges.length 
      : 0;
    
    const last7Days = personalChallenges.filter(c => {
      const created = new Date(c.created_date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created > weekAgo;
    });
    
    const activityLevel = {
      recentChallenges: last7Days.length,
      totalPoints: userPoints?.total_points || 0,
      eventsAttended: participations.filter(p => p.status === 'attended').length,
      recognitionsSent: recognitions.length,
      currentStreak: userPoints?.current_streak || 0
    };
    
    // AI analyzes performance and suggests difficulty adjustment
    const analysisPrompt = `Analyze user's gamification performance and suggest difficulty adjustment:

User Metrics:
- Total challenges attempted: ${totalChallenges}
- Completed: ${completedChallenges}
- Completion rate: ${Math.round(completionRate * 100)}%
- Average progress: ${Math.round(avgProgress)}%
- Recent activity (7 days): ${activityLevel.recentChallenges} challenges
- Total points: ${activityLevel.totalPoints}
- Events attended: ${activityLevel.eventsAttended}
- Current streak: ${activityLevel.currentStreak} days

Based on this data, determine:
1. Current difficulty level (beginner/intermediate/advanced/expert)
2. Recommended difficulty adjustment (+1, 0, -1)
3. Reasoning for adjustment
4. Suggested challenge modifications (goal values, time limits)
5. Motivational message for the user`;
    
    const adjustment = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          current_difficulty: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced", "expert"]
          },
          adjustment: {
            type: "number",
            enum: [-1, 0, 1]
          },
          reasoning: { type: "string" },
          suggested_modifications: {
            type: "object",
            properties: {
              goal_multiplier: { type: "number" },
              time_extension_days: { type: "number" },
              bonus_points_multiplier: { type: "number" }
            }
          },
          motivational_message: { type: "string" },
          next_level_requirements: {
            type: "object",
            properties: {
              challenges_to_complete: { type: "number" },
              target_completion_rate: { type: "number" }
            }
          }
        }
      }
    });
    
    return Response.json({
      success: true,
      activityLevel,
      completionRate,
      ...adjustment
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});