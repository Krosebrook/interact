import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Run as scheduled automation - send reminders for events starting in 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    const upcomingEvents = await base44.asServiceRole.entities.Event.filter({
      status: 'scheduled',
      scheduled_date: {
        $gte: new Date().toISOString(),
        $lte: tomorrow.toISOString()
      }
    });
    
    const remindersSent = [];
    
    for (const event of upcomingEvents) {
      // Get all participants who RSVP'd "going" or are registered
      const participants = await base44.asServiceRole.entities.Participation.filter({
        event_id: event.id,
        $or: [
          { status: 'going' },
          { status: 'registered' }
        ]
      });
      
      for (const participant of participants) {
        // Check if reminder already sent (prevent duplicates)
        const existingReminder = await base44.asServiceRole.entities.Notification.filter({
          user_email: participant.user_email,
          type: 'event_reminder_24h',
          created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
        });
        
        if (existingReminder.length > 0) continue;
        
        const eventDate = new Date(event.scheduled_date);
        const timeUntil = Math.round((eventDate - new Date()) / (1000 * 60 * 60));
        
        await base44.asServiceRole.entities.Notification.create({
          user_email: participant.user_email,
          type: 'event_reminder_24h',
          title: `📅 Event Tomorrow: ${event.title}`,
          message: `Your event "${event.title}" starts in ${timeUntil} hours! ${event.meeting_link ? 'Meeting link: ' + event.meeting_link : ''}`,
          action_url: '/Calendar',
          read: false
        });
        
        // Send email reminder
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: participant.user_email,
          subject: `Reminder: ${event.title} tomorrow`,
          body: `Hi there!

This is a friendly reminder that you're registered for:

${event.title}
${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}
${event.meeting_link ? '\nJoin here: ' + event.meeting_link : ''}

${event.custom_instructions || ''}

See you there!`
        });
        
        remindersSent.push({
          event: event.title,
          participant: participant.user_email
        });
      }
    }
    
    return Response.json({
      success: true,
      reminders_sent: remindersSent.length,
      events_processed: upcomingEvents.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});