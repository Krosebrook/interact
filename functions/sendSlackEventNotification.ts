import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, channel_id, message_type = 'announcement' } = await req.json();

    if (!event_id || !channel_id) {
      return Response.json({ error: 'event_id and channel_id are required' }, { status: 400 });
    }

    // Get event details
    const event = await base44.asServiceRole.entities.Event.get(event_id);
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get activity details
    const activity = await base44.asServiceRole.entities.Activity.get(event.activity_id);

    // Get Slack access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('slack');

    // Format date
    const eventDate = new Date(event.scheduled_date);
    const dateStr = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build message blocks
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: message_type === 'reminder' ? '⏰ Event Reminder' : '🎉 New Event Scheduled',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${event.title}*\n${activity?.description || ''}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*When:*\n${dateStr}`
          },
          {
            type: 'mrkdwn',
            text: `*Duration:*\n${event.duration_minutes || 60} minutes`
          }
        ]
      }
    ];

    // Add location/meeting link
    if (event.meeting_link) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Join:* <${event.meeting_link}|Click here to join>`
        }
      });
    } else if (event.location) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Location:* ${event.location}`
        }
      });
    }

    // Add magic link for participants
    if (event.magic_link) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Event Details:* <${event.magic_link}|View Event Page>`
        }
      });
    }

    // Send to Slack
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel_id,
        blocks,
        text: `${message_type === 'reminder' ? 'Reminder' : 'New event'}: ${event.title}`
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Slack API error: ${error}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Slack error: ${result.error}`);
    }

    return Response.json({
      success: true,
      message_ts: result.ts,
      channel: result.channel
    });

  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return Response.json({ 
      error: error.message || 'Failed to send Slack notification' 
    }, { status: 500 });
  }
});