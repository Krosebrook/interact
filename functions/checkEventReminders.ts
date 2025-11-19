import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// This function should be called by a scheduled job (cron)
// Run every hour to check for events that need 24h reminders

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Get all scheduled events
        const events = await base44.asServiceRole.entities.Event.filter({ 
            status: 'scheduled' 
        });

        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        const eventsNeedingReminder = events.filter(event => {
            const eventDate = new Date(event.scheduled_date);
            // Check if event is between 24 and 25 hours away
            return eventDate > in24Hours && eventDate < in25Hours;
        });

        const results = [];

        for (const event of eventsNeedingReminder) {
            // Check if reminder already sent (you might want to add a flag to Event entity)
            // For now, we'll just send it
            
            try {
                const response = await base44.asServiceRole.functions.invoke(
                    'sendTeamsNotification',
                    {
                        eventId: event.id,
                        notificationType: 'reminder'
                    }
                );

                results.push({
                    eventId: event.id,
                    title: event.title,
                    status: 'sent',
                    response: response.data
                });
            } catch (error) {
                results.push({
                    eventId: event.id,
                    title: event.title,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            checked: events.length,
            reminders_sent: eventsNeedingReminder.length,
            results
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});