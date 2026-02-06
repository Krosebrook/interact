import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Run as scheduled automation - check complex badge criteria
    const allUsers = await base44.asServiceRole.entities.User.list();
    const badges = await base44.asServiceRole.entities.Badge.list();
    const badgesAwarded = [];
    
    for (const user of allUsers) {
      const userEmail = user.email;
      const userBadges = await base44.asServiceRole.entities.BadgeAward.filter({ user_email: userEmail });
      
      // WELLNESS WARRIOR: Complete 3 wellness challenges in a month
      const recentWellnessGoals = await base44.asServiceRole.entities.WellnessGoal.filter({
        user_email: userEmail,
        status: 'completed',
        completed_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      });
      
      const hasWellnessWarrior = userBadges.some(b => b.badge_name === 'Wellness Warrior');
      if (recentWellnessGoals.length >= 3 && !hasWellnessWarrior) {
        const badge = badges.find(b => b.badge_name === 'Wellness Warrior');
        if (badge) {
          await base44.asServiceRole.entities.BadgeAward.create({
            user_email: userEmail,
            badge_id: badge.id,
            badge_name: 'Wellness Warrior',
            badge_icon: '💪',
            earned_date: new Date().toISOString(),
            awarded_by: 'system',
            reason: 'Completed 3 wellness challenges in 30 days'
          });
          badgesAwarded.push({ userEmail, badge: 'Wellness Warrior' });
        }
      }
      
      // SOCIAL BUTTERFLY: Attend 5 social events + give 10 recognitions
      const socialEvents = await base44.asServiceRole.entities.Participation.filter({
        user_email: userEmail,
        status: 'attended'
      });
      
      const socialEventCount = (await Promise.all(
        socialEvents.map(async (p) => {
          const event = await base44.asServiceRole.entities.Event.filter({ id: p.event_id }).then(r => r[0]);
          return event?.activity_type === 'social' ? 1 : 0;
        })
      )).reduce((sum, v) => sum + v, 0);
      
      const recognitionsGiven = await base44.asServiceRole.entities.Recognition.filter({
        sender_email: userEmail
      });
      
      const hasSocialButterfly = userBadges.some(b => b.badge_name === 'Social Butterfly');
      if (socialEventCount >= 5 && recognitionsGiven.length >= 10 && !hasSocialButterfly) {
        const badge = badges.find(b => b.badge_name === 'Social Butterfly');
        if (badge) {
          await base44.asServiceRole.entities.BadgeAward.create({
            user_email: userEmail,
            badge_id: badge.id,
            badge_name: 'Social Butterfly',
            badge_icon: '🦋',
            earned_date: new Date().toISOString(),
            awarded_by: 'system',
            reason: 'Attended 5+ social events and gave 10+ recognitions'
          });
          badgesAwarded.push({ userEmail, badge: 'Social Butterfly' });
        }
      }
      
      // EARLY ADOPTER: Complete onboarding + first event + first recognition within 7 days
      const userCreatedDate = new Date(user.created_date);
      const daysSinceJoined = (Date.now() - userCreatedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceJoined <= 7) {
        const firstEventAttended = socialEvents.length > 0;
        const firstRecognitionGiven = recognitionsGiven.length > 0;
        const hasEarlyAdopter = userBadges.some(b => b.badge_name === 'Early Adopter');
        
        if (firstEventAttended && firstRecognitionGiven && !hasEarlyAdopter) {
          const badge = badges.find(b => b.badge_name === 'Early Adopter');
          if (badge) {
            await base44.asServiceRole.entities.BadgeAward.create({
              user_email: userEmail,
              badge_id: badge.id,
              badge_name: 'Early Adopter',
              badge_icon: '🚀',
              earned_date: new Date().toISOString(),
              awarded_by: 'system',
              reason: 'Completed onboarding, attended event, and gave recognition within 7 days'
            });
            badgesAwarded.push({ userEmail, badge: 'Early Adopter' });
          }
        }
      }
      
      // ENGAGEMENT CHAMPION: Maintain 30-day streak
      const userPoints = await base44.asServiceRole.entities.UserPoints.filter({ user_email: userEmail }).then(r => r[0]);
      const hasEngagementChampion = userBadges.some(b => b.badge_name === 'Engagement Champion');
      
      if (userPoints?.current_streak >= 30 && !hasEngagementChampion) {
        const badge = badges.find(b => b.badge_name === 'Engagement Champion');
        if (badge) {
          await base44.asServiceRole.entities.BadgeAward.create({
            user_email: userEmail,
            badge_id: badge.id,
            badge_name: 'Engagement Champion',
            badge_icon: '🔥',
            earned_date: new Date().toISOString(),
            awarded_by: 'system',
            reason: 'Maintained 30-day engagement streak'
          });
          badgesAwarded.push({ userEmail, badge: 'Engagement Champion' });
        }
      }
    }
    
    return Response.json({
      success: true,
      badges_awarded: badgesAwarded.length,
      details: badgesAwarded
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});