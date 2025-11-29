import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Award points for user actions (attendance, activity completion, feedback)
 * Handles badge checks and team point updates
 */

// Points configuration
const POINTS_CONFIG = {
  attendance: { points: 10, field: 'events_attended', reason: 'Event attendance' },
  activity_completion: { points: 15, field: 'activities_completed', reason: 'Activity completed' },
  feedback: { points: 5, field: 'feedback_submitted', reason: 'Feedback submitted' },
  high_engagement: { points: 5, field: null, reason: 'High engagement bonus' }
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participationId, actionType } = await req.json();

    // Validate action type
    if (!POINTS_CONFIG[actionType]) {
      return Response.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // Get participation record
    const participations = await base44.asServiceRole.entities.Participation.filter({ id: participationId });
    if (!participations.length) {
      return Response.json({ error: 'Participation not found' }, { status: 404 });
    }
    const participation = participations[0];

    // Check for duplicate awards
    const duplicateCheck = checkDuplicateAward(participation, actionType);
    if (duplicateCheck.isDuplicate) {
      return Response.json({ message: duplicateCheck.message });
    }

    // Get or create user points
    const userPoints = await getOrCreateUserPoints(base44, participation.participant_email);

    // Calculate and apply points
    const { pointsToAward, updates } = calculatePointsUpdate(userPoints, participation, actionType);
    
    if (pointsToAward === 0) {
      return Response.json({ message: 'No points to award' });
    }

    // Update records
    await applyPointsUpdate(base44, participationId, userPoints.id, updates, actionType);

    // Update team points if applicable
    if (userPoints.team_id && pointsToAward > 0) {
      await updateTeamPoints(base44, userPoints.team_id, pointsToAward);
    }

    // Check for level up
    const oldLevel = userPoints.level || 1;
    const newLevel = Math.floor(updates.total_points / 100) + 1;
    updates.level = newLevel;

    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, updates);

    // Send level up notification
    if (newLevel > oldLevel) {
      await createNotification(base44, participation.participant_email, 'level_up_alerts',
        '🚀 Level Up!', `Awesome! You've reached Level ${newLevel}!`,
        { icon: '⬆️', action_url: '/Gamification' }
      );
    }

    // Check for badge awards
    const badges = await checkAndAwardBadges(base44, userPoints.id, updates);

    return Response.json({
      success: true,
      pointsAwarded: pointsToAward,
      newTotal: updates.total_points,
      newLevel,
      badgesEarned: badges
    });

  } catch (error) {
    console.error('Award points error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper functions
function checkDuplicateAward(participation, actionType) {
  const checks = {
    attendance: { field: 'points_awarded', message: 'Points already awarded for attendance' },
    activity_completion: { field: 'activity_completed', message: 'Points already awarded for activity' },
    feedback: { field: 'feedback_submitted', message: 'Points already awarded for feedback' }
  };
  
  const check = checks[actionType];
  if (check && participation[check.field]) {
    return { isDuplicate: true, message: check.message };
  }
  return { isDuplicate: false };
}

async function getOrCreateUserPoints(base44, userEmail) {
  const records = await base44.asServiceRole.entities.UserPoints.filter({ user_email: userEmail });
  
  if (records.length > 0) return records[0];
  
  return base44.asServiceRole.entities.UserPoints.create({
    user_email: userEmail,
    total_points: 0,
    available_points: 0,
    events_attended: 0,
    activities_completed: 0,
    feedback_submitted: 0,
    badges_earned: [],
    level: 1,
    streak_days: 0
  });
}

function calculatePointsUpdate(userPoints, participation, actionType) {
  const config = POINTS_CONFIG[actionType];
  let pointsToAward = config.points;
  
  // Special case for high engagement
  if (actionType === 'high_engagement' && participation.engagement_score < 4) {
    pointsToAward = 0;
  }

  const pointsHistory = userPoints.points_history || [];
  const updates = {
    total_points: (userPoints.total_points || 0) + pointsToAward,
    available_points: (userPoints.available_points || 0) + pointsToAward,
    lifetime_points: (userPoints.lifetime_points || 0) + pointsToAward,
    points_history: [...pointsHistory.slice(-49), {
      amount: pointsToAward,
      reason: config.reason,
      source: actionType,
      event_id: participation.event_id,
      timestamp: new Date().toISOString()
    }]
  };

  // Increment counter field if applicable
  if (config.field) {
    updates[config.field] = (userPoints[config.field] || 0) + 1;
  }

  if (actionType === 'attendance') {
    updates.last_activity_date = new Date().toISOString().split('T')[0];
  }

  return { pointsToAward, updates };
}

async function applyPointsUpdate(base44, participationId, userPointsId, updates, actionType) {
  // Update participation record to mark points awarded
  const participationUpdate = {};
  if (actionType === 'attendance') participationUpdate.points_awarded = true;
  if (actionType === 'activity_completion') participationUpdate.activity_completed = true;
  if (actionType === 'feedback') participationUpdate.feedback_submitted = true;
  
  if (Object.keys(participationUpdate).length > 0) {
    await base44.asServiceRole.entities.Participation.update(participationId, participationUpdate);
  }
}

async function updateTeamPoints(base44, teamId, pointsToAward) {
  try {
    const teams = await base44.asServiceRole.entities.Team.filter({ id: teamId });
    if (teams.length > 0) {
      const team = teams[0];
      await base44.asServiceRole.entities.Team.update(team.id, {
        total_points: (team.total_points || 0) + pointsToAward,
        'team_stats.weekly_points': (team.team_stats?.weekly_points || 0) + pointsToAward,
        'team_stats.monthly_points': (team.team_stats?.monthly_points || 0) + pointsToAward
      });
    }
  } catch (error) {
    console.error('Failed to update team points:', error);
  }
}

async function createNotification(base44, userEmail, type, title, message, metadata = {}) {
  try {
    const prefs = await base44.asServiceRole.entities.UserPreferences.filter({ user_email: userEmail });
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

async function checkAndAwardBadges(base44, userPointsId, stats) {
  const [allBadges, userPointsRecords] = await Promise.all([
    base44.asServiceRole.entities.Badge.list(),
    base44.asServiceRole.entities.UserPoints.filter({ id: userPointsId })
  ]);
  
  const userPoints = userPointsRecords[0];
  const earnedBadges = [];

  for (const badge of allBadges) {
    if (userPoints.badges_earned?.includes(badge.id)) continue;
    if (badge.is_manual_award) continue;
    
    const { type, threshold } = badge.award_criteria || {};
    if (!type || type === 'manual') continue;
    
    const shouldAward = checkBadgeCriteria(type, threshold, stats);
    
    if (shouldAward) {
      earnedBadges.push(badge);
      await awardBadge(base44, userPointsId, userPoints, badge, stats);
    }
  }

  return earnedBadges;
}

function checkBadgeCriteria(type, threshold, stats) {
  const criteriaMap = {
    events_attended: stats.events_attended,
    feedback_submitted: stats.feedback_submitted,
    activities_completed: stats.activities_completed,
    points_total: stats.total_points,
    streak_days: stats.streak_days,
    media_uploads: stats.media_uploads || 0,
    peer_recognitions: stats.peer_recognitions || 0
  };
  
  return criteriaMap[type] !== undefined && criteriaMap[type] >= threshold;
}

async function awardBadge(base44, userPointsId, userPoints, badge, stats) {
  const updatedBadges = [...(userPoints.badges_earned || []), badge.id];
  const newTotalPoints = stats.total_points + (badge.points_value || 0);
  
  await base44.asServiceRole.entities.UserPoints.update(userPointsId, {
    badges_earned: updatedBadges,
    total_points: newTotalPoints
  });
  
  stats.total_points = newTotalPoints;
  
  await base44.asServiceRole.entities.BadgeAward.create({
    badge_id: badge.id,
    user_email: userPoints.user_email,
    user_name: userPoints.user_email,
    award_type: 'automatic',
    points_awarded: badge.points_value || 0
  });
  
  await createNotification(base44, userPoints.user_email, 'badge_alerts',
    '🎉 New Badge Earned!',
    `Congratulations! You've earned the "${badge.badge_name}" badge!`,
    { icon: badge.badge_icon, badge_id: badge.id, action_url: '/RewardsStore' }
  );
}