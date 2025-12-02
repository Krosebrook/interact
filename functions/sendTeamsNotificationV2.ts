/**
 * SEND TEAMS NOTIFICATION (V2 - Refactored)
 * Uses middleware for auth, validation, and error handling
 */

import {
  createHandler,
  validatePayload,
  successResponse,
  ApiException,
  parseJsonBody
} from './lib/middleware.js';
import { API_ERROR_CODES, NOTIFICATION_TYPES } from './lib/types.js';

// Validation schema for request payload
const payloadSchema = {
  eventId: {
    required: true,
    type: 'string',
    minLength: 1
  },
  notificationType: {
    required: true,
    type: 'string',
    enum: Object.values(NOTIFICATION_TYPES)
  },
  customMessage: {
    required: false,
    type: 'string',
    maxLength: 1000
  }
};

// Handler implementation
async function handleSendTeamsNotification(req, { user, base44 }) {
  // Parse and validate payload
  const body = await parseJsonBody(req);
  const payload = validatePayload(body, payloadSchema);
  const { eventId, notificationType, customMessage } = payload;

  // Get Teams configuration
  const configs = await base44.entities.TeamsConfig.list();
  if (configs.length === 0 || !configs[0].webhook_url) {
    throw new ApiException(
      API_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Teams webhook not configured. Please configure Teams integration in Settings.',
      400
    );
  }

  const config = configs[0];

  // Check if notifications are enabled
  if (!config.notifications_enabled) {
    return successResponse({ 
      success: true, 
      message: 'Notifications are disabled',
      skipped: true 
    });
  }

  // Check specific notification type setting
  const typeSettings = {
    [NOTIFICATION_TYPES.ANNOUNCEMENT]: config.send_announcement,
    [NOTIFICATION_TYPES.REMINDER]: config.send_reminder,
    [NOTIFICATION_TYPES.RECAP]: config.send_recap
  };

  if (!typeSettings[notificationType]) {
    return successResponse({ 
      success: true, 
      message: `${notificationType} notifications are disabled`,
      skipped: true 
    });
  }

  // Get event data
  const events = await base44.entities.Event.filter({ id: eventId });
  if (events.length === 0) {
    throw new ApiException(
      API_ERROR_CODES.NOT_FOUND,
      `Event with ID '${eventId}' not found`,
      404
    );
  }
  const event = events[0];

  // Get activity data
  const activities = await base44.entities.Activity.filter({ id: event.activity_id });
  const activity = activities[0] || null;

  // Get participation data
  const participations = await base44.entities.Participation.filter({ event_id: eventId });
  const yesRsvps = participations.filter(p => p.rsvp_status === 'yes');
  const rsvpCount = yesRsvps.length;
  const participantNames = yesRsvps.map(p => p.participant_name?.split(' ')[0] || 'Unknown');

  // Generate adaptive card based on notification type
  const card = generateCard(notificationType, {
    event,
    activity,
    config,
    rsvpCount,
    participantNames,
    participations,
    customMessage
  });

  // Send to Teams
  const response = await fetch(config.webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiException(
      API_ERROR_CODES.SERVICE_UNAVAILABLE,
      `Teams API error: ${errorText}`,
      502
    );
  }

  return successResponse({
    success: true,
    message: `${notificationType} sent to Teams`,
    eventId,
    notificationType
  });
}

// Card generation functions
function generateCard(type, data) {
  switch (type) {
    case NOTIFICATION_TYPES.ANNOUNCEMENT:
      return createAnnouncementCard(data);
    case NOTIFICATION_TYPES.REMINDER:
      return createReminderCard(data);
    case NOTIFICATION_TYPES.RECAP:
      return createRecapCard(data);
    default:
      return createAnnouncementCard(data);
  }
}

function createAnnouncementCard({ event, activity, config, rsvpCount }) {
  const eventDate = new Date(event.scheduled_date);
  const appUrl = Deno.env.get('APP_URL') || 'https://app.base44.com';
  const magicLink = `${appUrl}/ParticipantEvent?event=${event.magic_link}`;

  return {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          {
            type: 'TextBlock',
            text: '🎉 New Team Activity!',
            size: 'Large',
            weight: 'Bolder',
            color: 'Accent'
          },
          ...(rsvpCount > 0 ? [{
            type: 'TextBlock',
            text: `👥 ${rsvpCount} teammates already joined!`,
            size: 'Medium',
            weight: 'Bolder',
            color: 'Good',
            spacing: 'Small'
          }] : []),
          {
            type: 'TextBlock',
            text: event.title,
            size: 'ExtraLarge',
            weight: 'Bolder',
            wrap: true
          },
          {
            type: 'TextBlock',
            text: activity?.description || '',
            wrap: true,
            spacing: 'Small',
            color: 'Good'
          },
          {
            type: 'FactSet',
            facts: [
              {
                title: '📅 Date:',
                value: eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              },
              {
                title: '🕐 Time:',
                value: eventDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })
              },
              {
                title: '⏱️ Duration:',
                value: activity?.duration || `${event.duration_minutes} min`
              },
              {
                title: '🎯 Type:',
                value: activity?.type || 'Activity'
              }
            ]
          }
        ],
        actions: [{
          type: 'Action.OpenUrl',
          title: '✅ RSVP & Join',
          url: magicLink,
          style: 'positive'
        }]
      }
    }]
  };
}

function createReminderCard({ event, activity, rsvpCount, participantNames }) {
  const eventDate = new Date(event.scheduled_date);
  const now = new Date();
  const hoursUntil = Math.round((eventDate - now) / (1000 * 60 * 60));
  const minutesUntil = Math.round((eventDate - now) / (1000 * 60));
  const timeString = hoursUntil >= 1 
    ? `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}` 
    : `${minutesUntil} minutes`;

  const appUrl = Deno.env.get('APP_URL') || 'https://app.base44.com';
  const magicLink = `${appUrl}/ParticipantEvent?event=${event.magic_link}`;

  const topParticipants = participantNames.slice(0, 5).join(', ');
  const moreCount = Math.max(0, rsvpCount - 5);

  return {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          {
            type: 'TextBlock',
            text: '⏰ Event Starting Soon!',
            size: 'Large',
            weight: 'Bolder',
            color: 'Attention'
          },
          {
            type: 'TextBlock',
            text: `**${event.title}** starts in ${timeString}!`,
            size: 'Large',
            weight: 'Bolder',
            wrap: true
          },
          {
            type: 'TextBlock',
            text: `👥 **${rsvpCount} teammates joining:**`,
            weight: 'Bolder',
            wrap: true,
            color: 'Good',
            spacing: 'Medium'
          },
          ...(topParticipants ? [{
            type: 'TextBlock',
            text: `${topParticipants}${moreCount > 0 ? ` and ${moreCount} more!` : ''}`,
            wrap: true,
            isSubtle: true
          }] : []),
          {
            type: 'FactSet',
            facts: [
              { title: '⏰ Starting:', value: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
              { title: '👥 RSVPs:', value: rsvpCount.toString() }
            ]
          }
        ],
        actions: [{
          type: 'Action.OpenUrl',
          title: '🚀 Join Now',
          url: magicLink,
          style: 'positive'
        }]
      }
    }]
  };
}

function createRecapCard({ event, participations }) {
  const attended = participations.filter(p => p.attended);
  const withFeedback = participations.filter(p => p.engagement_score);
  const avgEngagement = withFeedback.length > 0
    ? (withFeedback.reduce((sum, p) => sum + p.engagement_score, 0) / withFeedback.length).toFixed(1)
    : 'N/A';

  const topFeedback = participations
    .filter(p => p.feedback && p.engagement_score >= 4)
    .slice(0, 3)
    .map(p => `"${p.feedback}" - ${p.participant_name}`)
    .join('\n\n');

  return {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          {
            type: 'TextBlock',
            text: '📊 Event Recap',
            size: 'Large',
            weight: 'Bolder',
            color: 'Good'
          },
          {
            type: 'TextBlock',
            text: event.title,
            size: 'ExtraLarge',
            weight: 'Bolder',
            wrap: true
          },
          {
            type: 'TextBlock',
            text: 'Thank you to everyone who participated! Here\'s how it went:',
            wrap: true,
            spacing: 'Small'
          },
          {
            type: 'FactSet',
            facts: [
              { title: '👥 Participants:', value: attended.length.toString() },
              { title: '⭐ Avg Rating:', value: `${avgEngagement}/5.0` },
              { title: '💬 Feedback:', value: `${withFeedback.length} responses` }
            ]
          },
          ...(topFeedback ? [
            {
              type: 'TextBlock',
              text: '💭 **Top Feedback:**',
              weight: 'Bolder',
              spacing: 'Medium',
              separator: true
            },
            {
              type: 'TextBlock',
              text: topFeedback,
              wrap: true,
              isSubtle: true
            }
          ] : []),
          {
            type: 'TextBlock',
            text: '🎉 See you at the next event!',
            weight: 'Bolder',
            color: 'Good',
            spacing: 'Medium'
          }
        ]
      }
    }]
  };
}

// Export handler with middleware
export default Deno.serve(
  createHandler('sendTeamsNotificationV2', handleSendTeamsNotification, {
    requireAuth: true,
    roles: ['admin'],
    method: 'POST'
  })
);