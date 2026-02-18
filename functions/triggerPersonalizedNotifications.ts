import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated notification trigger based on user activity patterns
 * Run as scheduled automation to send smart, personalized alerts
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin access (this should be triggered by automation)
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all active users
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Fetch relevant content
    const [upcomingEvents, activeChallenges, newRecognitions] = await Promise.all([
      base44.asServiceRole.entities.Event.filter({ 
        status: 'scheduled',
        scheduled_date: { $gte: new Date().toISOString() }
      }),
      base44.asServiceRole.entities.Challenge.filter({ status: 'active' }),
      base44.asServiceRole.entities.Recognition.filter({}, '-created_date', 10)
    ]);

    const notifications = [];

    // Process each user
    for (const targetUser of allUsers) {
      try {
        // Get user's engagement data
        const [participations, teamMemberships, userPrefs, profile] = await Promise.all([
          base44.asServiceRole.entities.Participation.filter({ user_email: targetUser.email }),
          base44.asServiceRole.entities.TeamMembership.filter({ user_email: targetUser.email }),
          base44.asServiceRole.entities.UserPreferences.filter({ user_email: targetUser.email }).then(r => r[0]),
          base44.asServiceRole.entities.UserProfile.filter({ user_email: targetUser.email }).then(r => r[0])
        ]);

        // Skip if user disabled notifications
        if (userPrefs?.notification_preferences === false) continue;

        // Calculate days since last activity
        const lastActivity = participations.length > 0 
          ? new Date(participations[0].created_date)
          : null;
        const daysSinceActivity = lastActivity 
          ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        // Trigger conditions
        const triggers = [];

        // 1. Re-engagement (inactive for 7+ days)
        if (daysSinceActivity >= 7) {
          triggers.push({
            type: 'reengagement',
            context: {
              title: 'We Miss You!',
              message: 'Your team has new activities waiting',
              action_url: createPageUrl('ParticipantHub'),
              days_inactive: daysSinceActivity
            }
          });
        }

        // 2. Upcoming events match user interests
        if (profile?.interests?.length > 0) {
          const relevantEvents = upcomingEvents.filter(event => {
            // Check if event tags/type matches user interests
            return profile.interests.some(interest => 
              event.title?.toLowerCase().includes(interest.toLowerCase()) ||
              event.description?.toLowerCase().includes(interest.toLowerCase())
            );
          });

          if (relevantEvents.length > 0) {
            triggers.push({
              type: 'interest_match',
              context: {
                title: 'Perfect Match!',
                message: `${relevantEvents[0].title} aligns with your interests`,
                action_url: createPageUrl('Calendar'),
                event_id: relevantEvents[0].id
              }
            });
          }
        }

        // 3. Team challenge opportunity
        if (teamMemberships.length > 0) {
          const teamIds = teamMemberships.map(tm => tm.team_id);
          const teamChallenges = activeChallenges.filter(ch => 
            ch.leaderboard_type === 'team' || ch.leaderboard_type === 'both'
          );

          if (teamChallenges.length > 0 && daysSinceActivity < 14) {
            triggers.push({
              type: 'team_opportunity',
              context: {
                title: 'Team Challenge Alert',
                message: 'Help your team climb the leaderboard!',
                action_url: createPageUrl('Challenges'),
                challenge_id: teamChallenges[0].id
              }
            });
          }
        }

        // 4. Unread recognitions
        const unreadRecognitions = newRecognitions.filter(r => 
          r.to_user === targetUser.email && !r.read
        );

        if (unreadRecognitions.length > 0) {
          triggers.push({
            type: 'recognition_received',
            context: {
              title: '🎉 Someone Recognized You!',
              message: 'Check out your new recognition',
              action_url: createPageUrl('Recognition')
            }
          });
        }

        // Create smart notifications for each trigger
        for (const trigger of triggers.slice(0, 2)) { // Max 2 notifications per user
          const notifResponse = await base44.asServiceRole.functions.invoke(
            'createSmartNotification',
            {
              user_email: targetUser.email,
              notification_type: trigger.type,
              context: trigger.context
            }
          );

          if (notifResponse.data.success) {
            notifications.push({
              user: targetUser.email,
              type: trigger.type,
              personalized: notifResponse.data.personalized
            });
          }
        }

      } catch (userError) {
        console.error(`Error processing user ${targetUser.email}:`, userError);
        // Continue with next user
      }
    }

    return Response.json({
      success: true,
      notifications_created: notifications.length,
      users_processed: allUsers.length,
      breakdown: notifications
    });

  } catch (error) {
    console.error('Notification trigger error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});