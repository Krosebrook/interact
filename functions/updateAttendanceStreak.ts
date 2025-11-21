import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function createNotificationForUser(base44, userEmail, type, title, message, metadata = {}) {
  try {
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
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail, eventDate } = await req.json();

    // Get user points record
    const userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter({ 
      user_email: userEmail 
    });

    if (userPointsRecords.length === 0) {
      return Response.json({ error: 'User points record not found' }, { status: 404 });
    }

    const userPoints = userPointsRecords[0];
    const lastActivityDate = userPoints.last_activity_date ? new Date(userPoints.last_activity_date) : null;
    const currentEventDate = new Date(eventDate);
    
    let newStreakDays = userPoints.streak_days || 0;
    let streakBroken = false;

    if (!lastActivityDate) {
      // First activity
      newStreakDays = 1;
    } else {
      const daysDiff = Math.floor((currentEventDate - lastActivityDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, no change
        newStreakDays = userPoints.streak_days || 1;
      } else if (daysDiff === 1) {
        // Consecutive day - extend streak
        newStreakDays = (userPoints.streak_days || 0) + 1;
        
        // Award streak milestone badges
        if (newStreakDays === 3) {
          await createNotificationForUser(
            base44,
            userEmail,
            'badge_alerts',
            '🔥 3-Day Streak!',
            'You\'ve participated in events for 3 days in a row! Keep it up!',
            { icon: '🔥', action_url: '/Gamification' }
          );
        } else if (newStreakDays === 7) {
          await createNotificationForUser(
            base44,
            userEmail,
            'badge_alerts',
            '🔥 Week Streak!',
            'Amazing! 7 days of consistent participation!',
            { icon: '🔥', action_url: '/Gamification' }
          );
        } else if (newStreakDays === 30) {
          await createNotificationForUser(
            base44,
            userEmail,
            'badge_alerts',
            '🏆 Month Streak Champion!',
            'Incredible! 30 days of participation!',
            { icon: '🏆', action_url: '/Gamification' }
          );
        }
      } else {
        // Streak broken
        newStreakDays = 1;
        streakBroken = userPoints.streak_days > 3;
      }
    }

    // Update user points with new streak
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
      streak_days: newStreakDays,
      last_activity_date: currentEventDate.toISOString().split('T')[0]
    });

    return Response.json({
      success: true,
      streak_days: newStreakDays,
      streak_broken: streakBroken
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});