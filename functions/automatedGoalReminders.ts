import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin access
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all active personal challenges (goals)
    const challenges = await base44.asServiceRole.entities.PersonalChallenge.filter({ 
      status: 'in_progress' 
    });

    const reminders = [];

    for (const challenge of challenges) {
      const daysUntilDeadline = Math.ceil(
        (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
      );

      // Send reminder if deadline is approaching (7 days, 3 days, 1 day)
      if ([7, 3, 1].includes(daysUntilDeadline)) {
        const notification = await base44.asServiceRole.entities.Notification.create({
          user_email: challenge.user_email,
          title: '🎯 Goal Reminder',
          message: `Your goal "${challenge.title}" has ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''} remaining. Progress: ${challenge.progress || 0}%`,
          type: 'goal_reminder',
          reference_type: 'PersonalChallenge',
          reference_id: challenge.id,
          priority: daysUntilDeadline === 1 ? 'high' : 'medium'
        });
        reminders.push(notification);
      }
    }

    // Get all team challenges
    const teamChallenges = await base44.asServiceRole.entities.TeamChallenge.filter({ 
      status: 'active' 
    });

    for (const challenge of teamChallenges) {
      const daysUntilEnd = Math.ceil(
        (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if ([7, 3, 1].includes(daysUntilEnd)) {
        // Get team members
        const memberships = await base44.asServiceRole.entities.TeamMembership.filter({ 
          team_id: challenge.team_id 
        });

        for (const member of memberships) {
          const notification = await base44.asServiceRole.entities.Notification.create({
            user_email: member.user_email,
            title: '🏆 Team Challenge Reminder',
            message: `Team challenge "${challenge.title}" ends in ${daysUntilEnd} day${daysUntilEnd > 1 ? 's' : ''}!`,
            type: 'challenge_reminder',
            reference_type: 'TeamChallenge',
            reference_id: challenge.id,
            priority: 'medium'
          });
          reminders.push(notification);
        }
      }
    }

    return Response.json({
      success: true,
      reminders_sent: reminders.length,
      personal_goals_checked: challenges.length,
      team_challenges_checked: teamChallenges.length
    });

  } catch (error) {
    console.error('Goal reminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});