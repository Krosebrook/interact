import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get completed events
        const events = await base44.entities.Event.filter({ status: 'completed' });
        const participations = await base44.entities.Participation.list();

        // Analyze by day of week and time
        const timeSlotData = {};

        for (const event of events) {
            const eventDate = new Date(event.scheduled_date);
            const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
            const hour = eventDate.getHours();
            
            // Group into time slots
            let timeSlot;
            if (hour < 10) timeSlot = 'Morning (8-10am)';
            else if (hour < 12) timeSlot = 'Late Morning (10am-12pm)';
            else if (hour < 14) timeSlot = 'Lunch (12-2pm)';
            else if (hour < 16) timeSlot = 'Afternoon (2-4pm)';
            else if (hour < 18) timeSlot = 'Late Afternoon (4-6pm)';
            else timeSlot = 'Evening (6pm+)';

            const key = `${dayOfWeek}_${timeSlot}`;

            if (!timeSlotData[key]) {
                timeSlotData[key] = {
                    day: dayOfWeek,
                    time: timeSlot,
                    events: [],
                    total_participants: 0,
                    total_capacity: 0
                };
            }

            const eventParticipations = participations.filter(p => 
                p.event_id === event.id && p.attended
            );

            timeSlotData[key].events.push(event.id);
            timeSlotData[key].total_participants += eventParticipations.length;
            timeSlotData[key].total_capacity += 1; // Count number of events
        }

        // Calculate averages and sort by attendance
        const suggestions = Object.values(timeSlotData)
            .filter(slot => slot.events.length >= 2) // At least 2 events
            .map(slot => ({
                day: slot.day,
                time: slot.time,
                avg_attendance: Math.round((slot.total_participants / slot.events.length)),
                events_held: slot.events.length,
                confidence: slot.events.length >= 5 ? 'high' : 'medium'
            }))
            .sort((a, b) => b.avg_attendance - a.avg_attendance);

        return Response.json(suggestions);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});