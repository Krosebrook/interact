import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function can be called via cron job or manually
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get all scheduled events in the next 24 hours
    const allEvents = await base44.asServiceRole.entities.Event.list('-scheduled_date', 500);
    
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.scheduled_date);
      return event.status === 'scheduled' && 
             eventDate > now && 
             eventDate <= oneDayFromNow;
    });

    const notificationsCreated = [];

    // For each upcoming event, create notifications for participants
    for (const event of upcomingEvents) {
      const participations = await base44.asServiceRole.entities.Participation.filter({ 
        event_id: event.id 
      });

      const activity = await base44.asServiceRole.entities.Activity.filter({ id: event.activity_id });
      const activityTitle = activity[0]?.title || event.title;

      for (const participation of participations) {
        // Check if user has notification preferences enabled
        const prefs = await base44.asServiceRole.entities.UserPreferences.filter({ 
          user_email: participation.participant_email 
        });
        
        const shouldNotify = !prefs[0] || prefs[0].notification_preferences?.event_reminders !== false;

        if (shouldNotify && participation.rsvp_status === 'yes') {
          // Check if notification already exists
          const existingNotifications = await base44.asServiceRole.entities.Notification.filter({
            user_email: participation.participant_email,
            event_id: event.id,
            type: 'event_reminder'
          });

          if (existingNotifications.length === 0) {
            const notification = await base44.asServiceRole.entities.Notification.create({
              user_email: participation.participant_email,
              type: 'event_reminder',
              title: 'Upcoming Event Reminder',
              message: `"${activityTitle}" starts tomorrow at ${new Date(event.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              event_id: event.id,
              icon: '📅',
              action_url: `/ParticipantPortal`
            });
            notificationsCreated.push(notification);
          }
        }
      }
    }

    return Response.json({ 
      success: true,
      events_checked: upcomingEvents.length,
      notifications_created: notificationsCreated.length
    });
  } catch (error) {
    console.error('Error checking event reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});