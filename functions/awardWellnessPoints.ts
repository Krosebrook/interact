import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();
    
    // Only award points on status change to 'completed'
    if (data.status === 'completed' && old_data?.status !== 'completed') {
      // Fetch the challenge to get point reward
      const challenge = await base44.asServiceRole.entities.WellnessChallenge.filter({ 
        id: data.challenge_id 
      }).then(r => r[0]);
      
      if (!challenge) {
        return Response.json({ error: 'Challenge not found' }, { status: 404 });
      }
      
      // Fetch user points
      const userPoints = await base44.asServiceRole.entities.UserPoints.filter({ 
        user_email: data.user_email 
      });
      
      if (userPoints.length > 0) {
        // Update existing points
        await base44.asServiceRole.entities.UserPoints.update(userPoints[0].id, {
          total_points: (userPoints[0].total_points || 0) + challenge.points_reward
        });
      } else {
        // Create new points record
        await base44.asServiceRole.entities.UserPoints.create({
          user_email: data.user_email,
          total_points: challenge.points_reward,
          current_level: 1
        });
      }
      
      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: data.user_email,
        type: 'wellness_milestone',
        title: 'Wellness Goal Completed! 🎉',
        message: `You earned ${challenge.points_reward} points for completing ${challenge.title}!`,
        read: false
      });
      
      // Check for streak milestones
      if (data.streak_days && [7, 14, 30].includes(data.streak_days)) {
        const bonusPoints = data.streak_days * 10;
        await base44.asServiceRole.entities.UserPoints.filter({ 
          user_email: data.user_email 
        }).then(async (points) => {
          if (points[0]) {
            await base44.asServiceRole.entities.UserPoints.update(points[0].id, {
              total_points: (points[0].total_points || 0) + bonusPoints
            });
          }
        });
        
        await base44.asServiceRole.entities.Notification.create({
          user_email: data.user_email,
          type: 'streak_milestone',
          title: `${data.streak_days}-Day Streak! 🔥`,
          message: `Amazing! ${bonusPoints} bonus points for your dedication!`,
          read: false
        });
      }
      
      return Response.json({ 
        success: true, 
        points_awarded: challenge.points_reward 
      });
    }
    
    return Response.json({ success: true, message: 'No points to award' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});