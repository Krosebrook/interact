import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function createNotificationForUser(base44, userEmail, type, title, message, metadata = {}) {
  try {
    // Check user notification preferences
    const prefs = await base44.asServiceRole.entities.UserPreferences.filter({ 
      user_email: userEmail 
    });
    
    const shouldNotify = !prefs[0] || prefs[0].notification_preferences?.[type] !== false;
    
    if (shouldNotify) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type,
        title,
        message,
        ...metadata
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participationId, actionType } = await req.json();

    // actionType: 'attendance', 'activity_completion', 'feedback'
    
    // Get participation record
    const participations = await base44.asServiceRole.entities.Participation.filter({ id: participationId });
    if (!participations.length) {
      return Response.json({ error: 'Participation not found' }, { status: 404 });
    }

    const participation = participations[0];

    // Check if points already awarded
    if (participation.points_awarded && actionType === 'attendance') {
      return Response.json({ message: 'Points already awarded for attendance' });
    }

    // Get or create user points record
    let userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter({ 
      user_email: participation.participant_email 
    });
    
    let userPoints = userPointsRecords[0];
    if (!userPoints) {
      userPoints = await base44.asServiceRole.entities.UserPoints.create({
        user_email: participation.participant_email,
        total_points: 0,
        events_attended: 0,
        activities_completed: 0,
        feedback_submitted: 0,
        badges_earned: [],
        level: 1,
        streak_days: 0
      });
    }

    // Award points based on action type
    let pointsToAward = 0;
    let updates = {};

    switch (actionType) {
      case 'attendance':
        pointsToAward = 10;
        updates = {
          events_attended: (userPoints.events_attended || 0) + 1,
          total_points: (userPoints.total_points || 0) + pointsToAward,
          last_activity_date: new Date().toISOString().split('T')[0]
        };
        await base44.asServiceRole.entities.Participation.update(participationId, {
          points_awarded: true
        });
        break;

      case 'activity_completion':
        if (participation.activity_completed) {
          return Response.json({ message: 'Points already awarded for activity' });
        }
        pointsToAward = 15;
        updates = {
          activities_completed: (userPoints.activities_completed || 0) + 1,
          total_points: (userPoints.total_points || 0) + pointsToAward
        };
        await base44.asServiceRole.entities.Participation.update(participationId, {
          activity_completed: true
        });
        break;

      case 'feedback':
        if (participation.feedback_submitted) {
          return Response.json({ message: 'Points already awarded for feedback' });
        }
        pointsToAward = 5;
        updates = {
          feedback_submitted: (userPoints.feedback_submitted || 0) + 1,
          total_points: (userPoints.total_points || 0) + pointsToAward
        };
        await base44.asServiceRole.entities.Participation.update(participationId, {
          feedback_submitted: true
        });
        break;

      default:
        return Response.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // Calculate level based on total points (every 100 points = 1 level)
    const oldLevel = userPoints.level || 1;
    const newLevel = Math.floor(updates.total_points / 100) + 1;
    updates.level = newLevel;

    // Update user points
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, updates);
    
    // Check for level up notification
    if (newLevel > oldLevel) {
      await createNotificationForUser(
        base44,
        participation.participant_email,
        'level_up_alerts',
        '🚀 Level Up!',
        `Awesome! You've reached Level ${newLevel}!`,
        {
          icon: '⬆️',
          action_url: '/Gamification'
        }
      );
    }

    // Check for badge awards
    const badges = await checkAndAwardBadges(base44, userPoints.id, updates);

    return Response.json({
      success: true,
      pointsAwarded: pointsToAward,
      newTotal: updates.total_points,
      newLevel: newLevel,
      badgesEarned: badges
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkAndAwardBadges(base44, userPointsId, stats) {
  const allBadges = await base44.asServiceRole.entities.Badge.list();
  const userPoints = await base44.asServiceRole.entities.UserPoints.filter({ id: userPointsId });
  const user = userPoints[0];
  
  const earnedBadges = [];

  for (const badge of allBadges) {
    // Skip if already earned
    if (user.badges_earned?.includes(badge.id)) continue;
    
    // Skip manual-award-only badges
    if (badge.is_manual_award) continue;

    // Check criteria
    const { type, threshold } = badge.award_criteria || {};
    if (!type || type === 'manual') continue;
    
    let shouldAward = false;

    switch (type) {
      case 'events_attended':
        shouldAward = stats.events_attended >= threshold;
        break;
      case 'feedback_submitted':
        shouldAward = stats.feedback_submitted >= threshold;
        break;
      case 'activities_completed':
        shouldAward = stats.activities_completed >= threshold;
        break;
      case 'points_total':
        shouldAward = stats.total_points >= threshold;
        break;
      case 'streak_days':
        shouldAward = stats.streak_days >= threshold;
        break;
      case 'media_uploads':
        shouldAward = (stats.media_uploads || 0) >= threshold;
        break;
      case 'peer_recognitions':
        shouldAward = (stats.peer_recognitions || 0) >= threshold;
        break;
    }

    if (shouldAward) {
      earnedBadges.push(badge);
      // Update user with new badge
      const updatedBadges = [...(user.badges_earned || []), badge.id];
      const newTotalPoints = stats.total_points + (badge.points_value || 0);
      await base44.asServiceRole.entities.UserPoints.update(userPointsId, {
        badges_earned: updatedBadges,
        total_points: newTotalPoints
      });
      
      // Update stats for next iteration
      stats.total_points = newTotalPoints;
      
      // Create badge award record
      await base44.asServiceRole.entities.BadgeAward.create({
        badge_id: badge.id,
        user_email: user.user_email,
        user_name: user.user_email,
        award_type: 'automatic',
        points_awarded: badge.points_value || 0
      });
      
      // Create notification for badge earned
      await createNotificationForUser(
        base44,
        user.user_email,
        'badge_alerts',
        '🎉 New Badge Earned!',
        `Congratulations! You've earned the "${badge.badge_name}" badge!`,
        {
          icon: badge.badge_icon,
          badge_id: badge.id,
          action_url: '/RewardsStore'
        }
      );
    }
  }

  return earnedBadges;
}