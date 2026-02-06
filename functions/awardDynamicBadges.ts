import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Runs as scheduled automation - check all users for badge eligibility
    const allUsers = await base44.asServiceRole.entities.UserPoints.list();
    const allRecognitions = await base44.asServiceRole.entities.Recognition.filter({ status: 'approved' });
    const allParticipations = await base44.asServiceRole.entities.Participation.filter({});
    const allWellnessGoals = await base44.asServiceRole.entities.WellnessGoal.filter({});
    const allBadgeAwards = await base44.asServiceRole.entities.BadgeAward.list();
    const badges = await base44.asServiceRole.entities.Badge.list();
    
    const badgesAwarded = [];
    
    for (const userPoints of allUsers) {
      const userEmail = userPoints.user_email;
      const userBadges = allBadgeAwards.filter(b => b.user_email === userEmail);
      
      // Top Recognizer Badge (20+ recognitions given)
      const recognitionsGiven = allRecognitions.filter(r => r.sender_email === userEmail).length;
      const hasTopRecognizer = userBadges.some(b => b.badge_name === 'Top Recognizer');
      
      if (recognitionsGiven >= 20 && !hasTopRecognizer) {
        const topRecognizerBadge = badges.find(b => b.badge_name === 'Top Recognizer');
        if (topRecognizerBadge) {
          await base44.asServiceRole.entities.BadgeAward.create({
            user_email: userEmail,
            badge_id: topRecognizerBadge.id,
            badge_name: 'Top Recognizer',
            badge_icon: '🏆',
            earned_date: new Date().toISOString(),
            awarded_by: 'system',
            reason: 'Awarded 20+ recognitions to colleagues'
          });
          badgesAwarded.push({ userEmail, badge: 'Top Recognizer' });
        }
      }
      
      // Event Enthusiast Badge (30+ events attended)
      const eventsAttended = allParticipations.filter(p => 
        p.user_email === userEmail && p.status === 'attended'
      ).length;
      const hasEventEnthusiast = userBadges.some(b => b.badge_name === 'Event Enthusiast');
      
      if (eventsAttended >= 30 && !hasEventEnthusiast) {
        const eventBadge = badges.find(b => b.badge_name === 'Event Enthusiast');
        if (eventBadge) {
          await base44.asServiceRole.entities.BadgeAward.create({
            user_email: userEmail,
            badge_id: eventBadge.id,
            badge_name: 'Event Enthusiast',
            badge_icon: '🎉',
            earned_date: new Date().toISOString(),
            awarded_by: 'system',
            reason: 'Attended 30+ events'
          });
          badgesAwarded.push({ userEmail, badge: 'Event Enthusiast' });
        }
      }
      
      // Wellness Champion Badge (10+ wellness goals completed)
      const wellnessCompleted = allWellnessGoals.filter(w => 
        w.user_email === userEmail && w.status === 'completed'
      ).length;
      const hasWellnessChampion = userBadges.some(b => b.badge_name === 'Wellness Champion');
      
      if (wellnessCompleted >= 10 && !hasWellnessChampion) {
        const wellnessBadge = badges.find(b => b.badge_name === 'Wellness Champion');
        if (wellnessBadge) {
          await base44.asServiceRole.entities.BadgeAward.create({
            user_email: userEmail,
            badge_id: wellnessBadge.id,
            badge_name: 'Wellness Champion',
            badge_icon: '💪',
            earned_date: new Date().toISOString(),
            awarded_by: 'system',
            reason: 'Completed 10+ wellness goals'
          });
          badgesAwarded.push({ userEmail, badge: 'Wellness Champion' });
        }
      }
      
      // Check tier advancement based on points + badges
      const totalBadges = userBadges.length;
      const totalPoints = userPoints.total_points || 0;
      let newTier = userPoints.tier || 'bronze';
      
      if (totalPoints >= 5000 && totalBadges >= 15) {
        newTier = 'platinum';
      } else if (totalPoints >= 2000 && totalBadges >= 8) {
        newTier = 'gold';
      } else if (totalPoints >= 500 && totalBadges >= 3) {
        newTier = 'silver';
      } else {
        newTier = 'bronze';
      }
      
      if (newTier !== userPoints.tier) {
        await base44.asServiceRole.entities.UserPoints.update(userPoints.id, { tier: newTier });
        
        // Send tier advancement notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: userEmail,
          type: 'tier_advancement',
          title: `🎉 Tier Advancement: ${newTier.toUpperCase()}!`,
          message: `Congratulations! You've reached ${newTier} tier with ${totalPoints} points and ${totalBadges} badges!`,
          read: false
        });
      }
    }
    
    return Response.json({
      success: true,
      badges_awarded: badgesAwarded.length,
      badgesAwarded
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});