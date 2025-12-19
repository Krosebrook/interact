import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Syncs an event to Google Calendar
 * Creates or updates a calendar event in the user's Google Calendar
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, action = 'create' } = await req.json();

    // Get event details
    const events = await base44.entities.Event.filter({ id: event_id });
    const event = events[0];
    
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify user owns event or is admin
    if (event.facilitator_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - you can only sync your own events' }, { status: 403 });
    }

    // Get activity details for description
    const activities = await base44.entities.Activity.filter({ id: event.activity_id });
    const activity = activities[0];

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Calendar not connected',
        requiresAuth: true 
      }, { status: 403 });
    }

    // Format event for Google Calendar
    const startDate = new Date(event.scheduled_date);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (event.duration_minutes || 60));

    const calendarEvent = {
      summary: event.title,
      description: `${activity?.description || ''}\n\n${event.custom_instructions || ''}\n\nMeeting Link: ${event.meeting_link || 'N/A'}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
      location: event.event_format === 'online' ? event.meeting_link : event.location,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    let response;
    
    if (action === 'create') {
      // Create new calendar event
      response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      });
    } else if (action === 'update' && event.google_calendar_id) {
      // Update existing calendar event
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.google_calendar_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        }
      );
    } else if (action === 'delete' && event.google_calendar_id) {
      // Delete calendar event
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.google_calendar_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      return Response.json({ 
        success: true,
        message: 'Event removed from Google Calendar' 
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to sync with Google Calendar');
    }

    const data = await response.json();

    // Update event with Google Calendar ID for future updates/deletes
    if (action === 'create' && data.id) {
      await base44.asServiceRole.entities.Event.update(event_id, {
        google_calendar_id: data.id,
        google_calendar_link: data.htmlLink,
      });
    }

    return Response.json({
      success: true,
      calendar_event_id: data.id,
      calendar_link: data.htmlLink,
      message: action === 'create' ? 'Event added to Google Calendar' : 'Event updated in Google Calendar',
    });

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to sync with Google Calendar' 
    }, { status: 500 });
  }
});