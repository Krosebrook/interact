import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Run as scheduled automation - check all users for nudge opportunities
    const allUsers = await base44.asServiceRole.entities.User.list();
    const nudgesSent = [];
    
    for (const user of allUsers) {
      const userEmail = user.email;
      
      // Fetch user activity
      const [userPoints, recentParticipations, personalGoals, recentRecognitions] = await Promise.all([
        base44.asServiceRole.entities.UserPoints.filter({ user_email: userEmail }).then(r => r[0]),
        base44.asServiceRole.entities.Participation.filter({ 
          user_email: userEmail,
          created_date: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
        }),
        base44.asServiceRole.entities.PersonalGoal.filter({ 
          user_email: userEmail,
          status: 'active'
        }),
        base44.asServiceRole.entities.Recognition.filter({
          sender_email: userEmail,
          created_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
        })
      ]);
      
      const nudges = [];
      
      // Nudge: No recent event participation
      if (recentParticipations.length === 0) {
        nudges.push({
          type: 'event_participation',
          title: '📅 Discover New Events',
          message: "You haven't attended an event recently. Check out what's happening this week!",
          action_url: '/Calendar',
          priority: 'medium'
        });
      }
      
      // Nudge: Goals near completion
      const nearCompletionGoals = personalGoals.filter(g => 
        g.progress_percentage >= 80 && g.progress_percentage < 100
      );
      
      if (nearCompletionGoals.length > 0) {
        nudges.push({
          type: 'goal_completion',
          title: '🎯 Almost There!',
          message: `You're ${nearCompletionGoals[0].progress_percentage}% done with "${nearCompletionGoals[0].title}". Finish strong!`,
          action_url: '/GamificationDashboard',
          priority: 'high'
        });
      }
      
      // Nudge: Haven't given recognition recently
      if (recentRecognitions.length === 0 && recentParticipations.length > 0) {
        nudges.push({
          type: 'give_recognition',
          title: '⭐ Spread the Love',
          message: 'Recognize a colleague who made an impact this week!',
          action_url: '/Recognition',
          priority: 'low'
        });
      }
      
      // Nudge: Tier advancement opportunity
      if (userPoints?.tier === 'bronze' && userPoints.total_points >= 400) {
        nudges.push({
          type: 'tier_advancement',
          title: '🥈 Silver Tier in Reach!',
          message: `Just ${500 - userPoints.total_points} more points to Silver tier. Keep engaging!`,
          action_url: '/GamificationDashboard',
          priority: 'high'
        });
      }
      
      // Send nudges as notifications
      for (const nudge of nudges) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: userEmail,
          type: nudge.type,
          title: nudge.title,
          message: nudge.message,
          action_url: nudge.action_url,
          read: false
        });
        
        nudgesSent.push({ userEmail, nudge: nudge.type });
      }
    }
    
    return Response.json({
      success: true,
      nudges_sent: nudgesSent.length,
      details: nudgesSent
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});