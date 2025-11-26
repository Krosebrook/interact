import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Google Calendar Integration
 * Creates and manages calendar events for team activities
 */

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

/**
 * Generate ICS calendar file content
 */
function generateICSContent(event) {
  const startDate = new Date(event.scheduledDate);
  const endDate = new Date(startDate.getTime() + (event.durationMinutes * 60 * 1000));
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text) => {
    return (text || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };

  const uid = `${event.id}@teamengage.app`;
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Team Engage//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${escapeText(event.title)}
DESCRIPTION:${escapeText(event.description || '')}\\n\\nPoints: +${event.pointsAwarded || 10}\\nFacilitator: ${escapeText(event.facilitatorName || 'Team Engage')}
LOCATION:${escapeText(event.location || event.meetingLink || 'Online')}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Event starting in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

/**
 * Generate Google Calendar URL for adding event
 */
function generateGoogleCalendarUrl(event) {
  const startDate = new Date(event.scheduledDate);
  const endDate = new Date(startDate.getTime() + (event.durationMinutes * 60 * 1000));
  
  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: `${event.description || ''}\n\nPoints: +${event.pointsAwarded || 10}\nFacilitator: ${event.facilitatorName || 'Team Engage'}`,
    location: event.location || event.meetingLink || 'Online',
    sf: 'true'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL for adding event
 */
function generateOutlookCalendarUrl(event) {
  const startDate = new Date(event.scheduledDate);
  const endDate = new Date(startDate.getTime() + (event.durationMinutes * 60 * 1000));

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: `${event.description || ''}\n\nPoints: +${event.pointsAwarded || 10}`,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    location: event.location || event.meetingLink || 'Online'
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, event } = await req.json();

    switch (action) {
      case 'generateICS': {
        const icsContent = generateICSContent(event);
        return new Response(icsContent, {
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_')}.ics"`
          }
        });
      }

      case 'getCalendarUrls': {
        return Response.json({
          googleCalendarUrl: generateGoogleCalendarUrl(event),
          outlookCalendarUrl: generateOutlookCalendarUrl(event),
          icsDownloadUrl: `/api/googleCalendarSync?action=generateICS&eventId=${event.id}`
        });
      }

      case 'syncToGoogleCalendar': {
        // For full Google Calendar API integration, OAuth would be required
        // This provides the add-to-calendar URL as a simpler alternative
        return Response.json({
          success: true,
          calendarUrl: generateGoogleCalendarUrl(event),
          message: 'Use the provided URL to add this event to Google Calendar'
        });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});