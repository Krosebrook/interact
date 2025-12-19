import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Imports events from Google Calendar
 * Fetches user's calendar events and syncs them to the platform
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { start_date, end_date, calendar_id = 'primary' } = await req.json();

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Calendar not connected',
        requiresAuth: true 
      }, { status: 403 });
    }

    // Build query parameters
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      timeMin: start_date || new Date().toISOString(),
    });

    if (end_date) {
      params.append('timeMax', end_date);
    }

    // Fetch events from Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendar_id}/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch from Google Calendar');
    }

    const data = await response.json();
    const importedEvents = [];
    const skippedEvents = [];

    // Check which events already exist in our system
    const existingEvents = await base44.entities.Event.list();
    const existingCalendarIds = new Set(
      existingEvents
        .filter(e => e.google_calendar_id)
        .map(e => e.google_calendar_id)
    );

    for (const calEvent of data.items || []) {
      // Skip if already imported
      if (existingCalendarIds.has(calEvent.id)) {
        skippedEvents.push({
          title: calEvent.summary,
          reason: 'Already imported',
        });
        continue;
      }

      // Skip all-day events and events without start time
      if (!calEvent.start?.dateTime) {
        skippedEvents.push({
          title: calEvent.summary,
          reason: 'All-day event or no time specified',
        });
        continue;
      }

      // Create a generic activity for imported events
      const activity = await base44.asServiceRole.entities.Activity.create({
        title: calEvent.summary || 'Imported Event',
        description: calEvent.description || 'Imported from Google Calendar',
        instructions: calEvent.description || 'Event details from your calendar',
        type: 'other',
        duration: '15-30min',
        is_template: false,
      });

      // Calculate duration
      const startTime = new Date(calEvent.start.dateTime);
      const endTime = new Date(calEvent.end?.dateTime || startTime);
      const durationMinutes = Math.round((endTime - startTime) / 60000);

      // Create event in our system
      const newEvent = await base44.asServiceRole.entities.Event.create({
        activity_id: activity.id,
        title: calEvent.summary || 'Imported Event',
        event_type: 'other',
        scheduled_date: calEvent.start.dateTime,
        duration_minutes: durationMinutes > 0 ? durationMinutes : 60,
        status: 'scheduled',
        event_format: calEvent.location ? 'hybrid' : 'online',
        location: calEvent.location,
        meeting_link: calEvent.hangoutLink || calEvent.conferenceData?.entryPoints?.[0]?.uri,
        facilitator_email: user.email,
        facilitator_name: user.full_name,
        google_calendar_id: calEvent.id,
        google_calendar_link: calEvent.htmlLink,
        custom_instructions: 'Imported from Google Calendar',
      });

      importedEvents.push({
        id: newEvent.id,
        title: newEvent.title,
        date: newEvent.scheduled_date,
      });
    }

    return Response.json({
      success: true,
      imported: importedEvents.length,
      skipped: skippedEvents.length,
      events: importedEvents,
      skipped_details: skippedEvents,
      message: `Imported ${importedEvents.length} events, skipped ${skippedEvents.length}`,
    });

  } catch (error) {
    console.error('Google Calendar import error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to import from Google Calendar' 
    }, { status: 500 });
  }
});