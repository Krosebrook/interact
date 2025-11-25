import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Get all pending reminders that are due
    const allReminders = await base44.asServiceRole.entities.ReminderSchedule.list('-scheduled_for', 500);
    
    const dueReminders = allReminders.filter(reminder => {
      const scheduledTime = new Date(reminder.scheduled_for);
      return !reminder.is_sent && 
             scheduledTime <= fiveMinutesFromNow &&
             scheduledTime >= new Date(now.getTime() - 60 * 60 * 1000); // Within last hour
    });

    const processed = [];

    for (const reminder of dueReminders) {
      // Get event details
      let eventTitle = 'Event';
      let eventDate = null;

      if (reminder.event_id) {
        const events = await base44.asServiceRole.entities.Event.filter({ id: reminder.event_id });
        if (events[0]) {
          eventTitle = events[0].title;
          eventDate = events[0].scheduled_date;
        }
      } else if (reminder.series_id) {
        const series = await base44.asServiceRole.entities.EventSeries.filter({ id: reminder.series_id });
        if (series[0]) {
          eventTitle = series[0].series_name;
        }
      }

      // Get reminder timing label
      const timingLabels = {
        '1_week': '1 week',
        '3_days': '3 days',
        '1_day': 'tomorrow',
        '1_hour': '1 hour',
        '15_min': '15 minutes'
      };
      const timing = timingLabels[reminder.reminder_type] || 'soon';

      // Create in-app notification if channel includes in_app
      if (reminder.channels?.includes('in_app')) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: reminder.user_email,
          type: 'event_reminder',
          title: '⏰ Event Reminder',
          message: `"${eventTitle}" starts ${timing === 'tomorrow' ? 'tomorrow' : 'in ' + timing}!`,
          event_id: reminder.event_id,
          icon: '⏰',
          action_url: '/ParticipantPortal'
        });
      }

      // Send email if channel includes email
      if (reminder.channels?.includes('email')) {
        const formattedDate = eventDate 
          ? new Date(eventDate).toLocaleString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })
          : '';

        await base44.integrations.Core.SendEmail({
          to: reminder.user_email,
          subject: `Reminder: ${eventTitle} starts ${timing}`,
          body: `
            <h2>Event Reminder</h2>
            <p>This is a friendly reminder that <strong>${eventTitle}</strong> starts ${timing}.</p>
            ${eventDate ? `<p><strong>Date & Time:</strong> ${formattedDate}</p>` : ''}
            <p>Don't forget to join!</p>
          `
        });
      }

      // Mark reminder as sent
      await base44.asServiceRole.entities.ReminderSchedule.update(reminder.id, {
        is_sent: true,
        sent_at: new Date().toISOString()
      });

      processed.push(reminder.id);
    }

    return Response.json({
      success: true,
      reminders_checked: dueReminders.length,
      reminders_sent: processed.length,
      processed_ids: processed
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});