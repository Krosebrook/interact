import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await req.json();

    // Get event details
    const events = await base44.asServiceRole.entities.Event.filter({ id: eventId });
    if (!events.length) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = events[0];

    // Get activity for description
    const activities = await base44.asServiceRole.entities.Activity.filter({ id: event.activity_id });
    const activity = activities[0];

    // Build Google Calendar event
    const startDateTime = new Date(event.scheduled_date);
    const endDateTime = new Date(startDateTime.getTime() + (event.duration_minutes || 30) * 60000);

    const calendarEvent = {
      summary: event.title,
      description: activity?.description || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      },
      location: event.meeting_link || event.location || 'Virtual',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 }
        ]
      }
    };

    // Call Google Calendar API
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    
    if (!GOOGLE_API_KEY) {
      return Response.json({ 
        error: 'Google API key not configured',
        calendar_event: calendarEvent 
      }, { status: 400 });
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOOGLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarEvent)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${error}`);
    }

    const gcalEvent = await response.json();

    // Update event with Google Calendar ID
    await base44.asServiceRole.entities.Event.update(eventId, {
      google_calendar_id: gcalEvent.id,
      google_calendar_link: gcalEvent.htmlLink
    });

    return Response.json({
      success: true,
      calendar_event_id: gcalEvent.id,
      calendar_link: gcalEvent.htmlLink
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});