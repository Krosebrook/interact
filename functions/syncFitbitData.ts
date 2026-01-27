import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get Fitbit access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('fitbit');
    
    // Fetch today's activity from Fitbit API
    const today = new Date().toISOString().split('T')[0];
    const activityResponse = await fetch(
      `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (!activityResponse.ok) {
      throw new Error('Failed to fetch Fitbit data');
    }
    
    const activityData = await activityResponse.json();
    const steps = activityData.summary.steps;
    
    // Find active step challenges for this user
    const challenges = await base44.asServiceRole.entities.WellnessChallenge.filter({
      status: 'active',
      challenge_type: 'steps'
    });
    
    const userGoals = await base44.asServiceRole.entities.WellnessGoal.filter({
      user_email: user.email,
      status: 'in_progress'
    });
    
    // Log the activity
    const log = await base44.asServiceRole.entities.WellnessLog.create({
      user_email: user.email,
      log_date: today,
      activity_type: 'steps',
      value: steps,
      unit: 'steps',
      source: 'fitbit'
    });
    
    // Update goal progress
    for (const goal of userGoals) {
      const challenge = challenges.find(c => c.id === goal.challenge_id);
      if (challenge && challenge.challenge_type === 'steps') {
        const newProgress = steps;
        const progressPercentage = Math.min((newProgress / goal.target_value) * 100, 100);
        
        const updates = {
          current_progress: newProgress,
          progress_percentage: progressPercentage
        };
        
        // Check if goal completed
        if (progressPercentage >= 100 && goal.status !== 'completed') {
          updates.status = 'completed';
          updates.completed_at = new Date().toISOString();
          
          // Award points
          await base44.asServiceRole.entities.UserPoints.filter({ user_email: user.email })
            .then(async (points) => {
              if (points[0]) {
                await base44.asServiceRole.entities.UserPoints.update(points[0].id, {
                  total_points: (points[0].total_points || 0) + challenge.points_reward
                });
              }
            });
        }
        
        await base44.asServiceRole.entities.WellnessGoal.update(goal.id, updates);
      }
    }
    
    return Response.json({
      success: true,
      steps,
      goalsUpdated: userGoals.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});