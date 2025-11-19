import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const urlParams = new URL(req.url).searchParams;
        const eventId = urlParams.get('eventId');

        if (!eventId) {
            return Response.json({ error: 'eventId required' }, { status: 400 });
        }

        // Get event data
        const events = await base44.asServiceRole.entities.Event.filter({ id: eventId });
        if (events.length === 0) {
            return Response.json({ error: 'Event not found' }, { status: 404 });
        }
        const event = events[0];

        // Get activity data
        const activities = await base44.asServiceRole.entities.Activity.filter({ 
            id: event.activity_id 
        });
        const activity = activities[0];

        // Generate ICS file
        const icsContent = generateICS(event, activity);

        return new Response(icsContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="${sanitizeFilename(event.title)}.ics"`
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateICS(event, activity) {
    const startDate = new Date(event.scheduled_date);
    const durationMinutes = event.duration_minutes || 30;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const magicLink = `${Deno.env.get('APP_URL') || 'https://app.base44.com'}/ParticipantEvent?event=${event.magic_link}`;

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const now = new Date();
    const uid = `${event.id}@teamengagehub`;

    const description = [
        activity?.description || '',
        '',
        'Instructions:',
        activity?.instructions || '',
        '',
        `Join here: ${magicLink}`,
        '',
        activity?.materials_needed ? `Materials needed: ${activity.materials_needed}` : ''
    ].filter(Boolean).join('\\n');

    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Team Engage Hub//Event Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${escapeICS(event.title)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        `LOCATION:${escapeICS(event.meeting_link || 'Virtual - Check link in description')}`,
        `URL:${magicLink}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${escapeICS(event.title)} starts in 24 hours`,
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${escapeICS(event.title)} starts in 1 hour`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ];

    return icsLines.join('\r\n');
}

function escapeICS(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
}

function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);
}