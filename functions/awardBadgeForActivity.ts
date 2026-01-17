import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Awards badges based on user activity milestones
 * Called by various triggers (event attendance, comments, templates)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { user_email, activity_type, context } = await req.json();

    if (!user_email || !activity_type) {
      return Response.json({ error: 'user_email and activity_type required' }, { status: 400 });
    }

    // Get all user's activities
    const [participations, comments, recognitions, userPoints] = await Promise.all([
      base44.asServiceRole.entities.Participation.filter({ user_email, attendance_status: 'attended' }),
      base44.asServiceRole.entities.Comment.filter({ author_email: user_email }),
      base44.asServiceRole.entities.Recognition.filter({ sender_email: user_email }),
      base44.asServiceRole.entities.UserPoints.filter({ user_email })
    ]);

    const points = userPoints[0] || { total_points: 0, lifetime_points: 0 };
    const newBadges = [];

    // Badge criteria definitions
    const badgeCriteria = {
      // Event participation badges
      'first_event': { check: () => participations.length === 1, name: 'First Event', icon: '🎉', tier: 'bronze' },
      'event_enthusiast': { check: () => participations.length === 10, name: 'Event Enthusiast', icon: '⭐', tier: 'silver' },
      'event_champion': { check: () => participations.length === 50, name: 'Event Champion', icon: '🏆', tier: 'gold' },
      
      // Collaboration badges
      'first_comment': { check: () => comments.length === 1, name: 'First Comment', icon: '💬', tier: 'bronze' },
      'collaborator': { check: () => comments.length === 25, name: 'Collaborator', icon: '🤝', tier: 'silver' },
      'community_builder': { check: () => comments.length === 100, name: 'Community Builder', icon: '🌟', tier: 'gold' },
      
      // Recognition badges
      'first_recognition': { check: () => recognitions.length === 1, name: 'Recognition Starter', icon: '👏', tier: 'bronze' },
      'appreciation_champion': { check: () => recognitions.length === 20, name: 'Appreciation Champion', icon: '💝', tier: 'silver' },
      
      // Points-based badges
      'rising_star': { check: () => points.lifetime_points >= 100, name: 'Rising Star', icon: '✨', tier: 'bronze' },
      'high_performer': { check: () => points.lifetime_points >= 500, name: 'High Performer', icon: '🚀', tier: 'silver' },
      'legend': { check: () => points.lifetime_points >= 1000, name: 'Legend', icon: '👑', tier: 'gold' },
      
      // Special badges
      'early_adopter': { check: () => context?.early_user === true, name: 'Early Adopter', icon: '🌱', tier: 'platinum' }
    };

    // Check which badges should be awarded
    const existingBadges = await base44.asServiceRole.entities.BadgeAward.filter({ user_email });
    const existingBadgeIds = existingBadges.map(b => b.badge_id);

    for (const [badgeId, criteria] of Object.entries(badgeCriteria)) {
      if (!existingBadgeIds.includes(badgeId) && criteria.check()) {
        // Award the badge
        await base44.asServiceRole.entities.BadgeAward.create({
          user_email,
          badge_id: badgeId,
          badge_name: criteria.name,
          badge_icon: criteria.icon,
          tier: criteria.tier,
          earned_date: new Date().toISOString(),
          context: context || {}
        });
        newBadges.push(criteria.name);

        // Award bonus points
        const bonusPoints = criteria.tier === 'bronze' ? 10 : criteria.tier === 'silver' ? 25 : criteria.tier === 'gold' ? 50 : 100;
        if (points.id) {
          await base44.asServiceRole.entities.UserPoints.update(points.id, {
            total_points: points.total_points + bonusPoints,
            lifetime_points: points.lifetime_points + bonusPoints
          });
        }
      }
    }

    // Calculate tier based on total badges and points
    const allUserBadges = await base44.asServiceRole.entities.BadgeAward.filter({ user_email });
    const tier = calculateTier(allUserBadges.length, points.lifetime_points, participations.length);

    return Response.json({
      success: true,
      badges_awarded: newBadges,
      total_badges: allUserBadges.length,
      tier,
      points_earned: newBadges.length * 10
    });

  } catch (error) {
    console.error('Error awarding badges:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateTier(badgeCount, lifetimePoints, eventsAttended) {
  const score = badgeCount * 10 + lifetimePoints * 0.5 + eventsAttended * 5;
  
  if (score >= 500) return 'platinum';
  if (score >= 250) return 'gold';
  if (score >= 100) return 'silver';
  return 'bronze';
}