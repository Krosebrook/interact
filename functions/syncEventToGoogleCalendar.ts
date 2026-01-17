import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { event_id } = await req.json();

    if (!event_id) {
      return Response.json({ error: 'event_id is required' }, { status: 400 });
    }

    // Get event details
    const event = await base44.asServiceRole.entities.Event.get(event_id);
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get activity details
    const activity = await base44.asServiceRole.entities.Activity.get(event.activity_id);

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Calculate end time
    const startDate = new Date(event.scheduled_date);
    const endDate = new Date(startDate.getTime() + (event.duration_minutes || 60) * 60000);

    // Create calendar event
    const calendarEvent = {
      summary: event.title,
      description: `${activity?.description || ''}\n\nEvent Type: ${event.event_type}\n${event.meeting_link ? `\nJoin: ${event.meeting_link}` : ''}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
      location: event.location || (event.event_format === 'online' ? 'Online' : ''),
      conferenceData: event.meeting_link ? {
        entryPoints: [{
          entryPointType: 'video',
          uri: event.meeting_link,
          label: 'Join Meeting'
        }]
      } : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 }
        ]
      }
    };

    // Create event in Google Calendar
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(calendarEvent)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${error}`);
    }

    const gcalEvent = await response.json();

    // Update event with Google Calendar ID
    await base44.asServiceRole.entities.Event.update(event_id, {
      google_calendar_id: gcalEvent.id,
      google_calendar_link: gcalEvent.htmlLink
    });

    return Response.json({
      success: true,
      google_calendar_id: gcalEvent.id,
      google_calendar_link: gcalEvent.htmlLink
    });

  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return Response.json({ 
      error: error.message || 'Failed to sync to Google Calendar' 
    }, { status: 500 });
  }
});