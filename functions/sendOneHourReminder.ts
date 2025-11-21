import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 120 * 60 * 1000);

    // Get events starting in 1-2 hours
    const allEvents = await base44.asServiceRole.entities.Event.list('-scheduled_date', 500);
    
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.scheduled_date);
      return event.status === 'scheduled' && 
             eventDate > oneHourFromNow && 
             eventDate <= twoHoursFromNow;
    });

    const notificationsCreated = [];

    for (const event of upcomingEvents) {
      const participations = await base44.asServiceRole.entities.Participation.filter({ 
        event_id: event.id 
      });

      const activity = await base44.asServiceRole.entities.Activity.filter({ id: event.activity_id });
      const activityTitle = activity[0]?.title || event.title;

      // Get participant names for social proof
      const yesRsvps = participations.filter(p => p.rsvp_status === 'yes');
      const participantNames = yesRsvps.map(p => p.participant_name.split(' ')[0]);
      const topNames = participantNames.slice(0, 3).join(', ');

      for (const participation of participations) {
        const prefs = await base44.asServiceRole.entities.UserPreferences.filter({ 
          user_email: participation.participant_email 
        });
        
        const shouldNotify = !prefs[0] || prefs[0].notification_preferences?.event_reminders !== false;

        if (shouldNotify && participation.rsvp_status === 'yes') {
          // Check if 1-hour notification already sent
          const existingNotifications = await base44.asServiceRole.entities.Notification.filter({
            user_email: participation.participant_email,
            event_id: event.id,
            type: 'event_reminder'
          });

          const hasOneHourReminder = existingNotifications.some(n => 
            n.message && n.message.includes('hour')
          );

          if (!hasOneHourReminder) {
            const socialProof = yesRsvps.length > 1 
              ? `\n\n👥 Joining with: ${topNames}${yesRsvps.length > 3 ? ` +${yesRsvps.length - 3} more` : ''}`
              : '';

            const notification = await base44.asServiceRole.entities.Notification.create({
              user_email: participation.participant_email,
              type: 'event_reminder',
              title: 'Event Starting in 1 Hour! ⏰',
              message: `"${activityTitle}" starts at ${new Date(event.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${socialProof}`,
              event_id: event.id,
              icon: '⏰',
              action_url: `/ParticipantEvent?event=${event.magic_link}`
            });
            notificationsCreated.push(notification);
          }
        }
      }
    }

    return Response.json({ 
      success: true,
      events_checked: upcomingEvents.length,
      notifications_sent: notificationsCreated.length
    });
  } catch (error) {
    console.error('Error sending 1-hour reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});