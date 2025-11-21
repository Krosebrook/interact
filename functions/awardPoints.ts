import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
    const newLevel = Math.floor(updates.total_points / 100) + 1;
    updates.level = newLevel;

    // Update user points
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, updates);

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

    // Check criteria
    const { type, threshold } = badge.award_criteria || {};
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
    }

    if (shouldAward) {
      earnedBadges.push(badge);
      // Update user with new badge
      const updatedBadges = [...(user.badges_earned || []), badge.id];
      await base44.asServiceRole.entities.UserPoints.update(userPointsId, {
        badges_earned: updatedBadges,
        total_points: stats.total_points + (badge.points_value || 0)
      });
    }
  }

  return earnedBadges;
}