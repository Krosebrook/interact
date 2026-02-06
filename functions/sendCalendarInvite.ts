import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { eventId, recipientEmail } = await req.json();
    
    // Fetch event details
    const [event] = await base44.entities.Event.filter({ id: eventId });
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const [activity] = await base44.entities.Activity.filter({ id: event.activity_id });
    
    // Generate iCalendar format
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//INTeract//Event Calendar//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:${event.id}@interact.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${activity?.title || event.title}
DESCRIPTION:${event.description || activity?.description || ''}
LOCATION:${event.location || (event.is_virtual ? 'Virtual Event' : 'TBD')}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Event reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
    
    // Send email with calendar invite
    await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `Calendar Invite: ${activity?.title || event.title}`,
      body: `
        <h2>You're invited to ${activity?.title || event.title}</h2>
        <p><strong>When:</strong> ${startDate.toLocaleString()}</p>
        <p><strong>Where:</strong> ${event.location || (event.is_virtual ? 'Virtual Event' : 'TBD')}</p>
        ${event.meeting_link ? `<p><strong>Join Link:</strong> <a href="${event.meeting_link}">${event.meeting_link}</a></p>` : ''}
        <p>${event.description || activity?.description || ''}</p>
        <p>See you there! 🎉</p>
      `
    });
    
    return Response.json({ 
      success: true,
      message: 'Calendar invite sent'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});