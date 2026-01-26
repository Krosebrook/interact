import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { taskType, taskId } = await req.json();
    
    // Points mapping for onboarding tasks
    const pointsMap = {
      'profile_setup': 100,
      'profile_picture': 50,
      'bio_completed': 50,
      'skills_added': 75,
      'first_recognition': 150,
      'first_event_registration': 100,
      'team_joined': 75,
      'onboarding_complete': 500
    };
    
    const pointsToAward = pointsMap[taskType] || 50;
    
    // Award points
    const [userPoints] = await base44.entities.UserPoints.filter({ user_email: user.email });
    
    const newTotal = (userPoints?.total_points || 0) + pointsToAward;
    const newLevel = Math.floor(newTotal / 100) + 1;
    
    if (userPoints) {
      await base44.entities.UserPoints.update(userPoints.id, {
        total_points: newTotal,
        current_level: newLevel,
        last_activity_date: new Date().toISOString()
      });
    } else {
      await base44.entities.UserPoints.create({
        user_email: user.email,
        total_points: pointsToAward,
        current_level: 1,
        current_streak: 1,
        last_activity_date: new Date().toISOString()
      });
    }
    
    // Check for onboarding badges
    const badgesEarned = [];
    
    if (taskType === 'onboarding_complete') {
      // Award "Quick Learner" badge
      const [quickLearnerBadge] = await base44.entities.Badge.filter({ 
        name: 'Quick Learner' 
      });
      
      if (quickLearnerBadge) {
        const existingAward = await base44.entities.BadgeAward.filter({
          user_email: user.email,
          badge_id: quickLearnerBadge.id
        });
        
        if (existingAward.length === 0) {
          await base44.entities.BadgeAward.create({
            user_email: user.email,
            badge_id: quickLearnerBadge.id,
            awarded_date: new Date().toISOString()
          });
          
          badgesEarned.push(quickLearnerBadge.name);
        }
      }
    }
    
    // Create notification
    await base44.entities.Notification.create({
      user_email: user.email,
      title: 'Onboarding Progress!',
      message: `You earned ${pointsToAward} points for completing ${taskType.replace(/_/g, ' ')}!`,
      type: 'gamification',
      link: '/dashboard'
    });
    
    return Response.json({
      success: true,
      pointsAwarded: pointsToAward,
      newTotal,
      newLevel,
      badgesEarned
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});