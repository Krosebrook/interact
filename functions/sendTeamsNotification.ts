import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { validateTeamsWebhook, sanitizeForExternalNotification, checkRateLimit } from './lib/webhookValidation.js';
import { buildMagicLink } from './validateAppUrl.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { eventId, notificationType } = await req.json();

        // Get Teams config
        const configs = await base44.entities.TeamsConfig.list();
        if (configs.length === 0 || !configs[0].webhook_url) {
            return Response.json({ error: 'Teams webhook not configured' }, { status: 400 });
        }

        const config = configs[0];

        // Validate webhook URL to prevent SSRF attacks
        try {
            validateTeamsWebhook(config.webhook_url);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Rate limiting (10 notifications per minute)
        if (!checkRateLimit(`teams-notification-${user.email}`, 10, 60000)) {
            return Response.json({ error: 'Rate limit exceeded. Please wait before sending more notifications.' }, { status: 429 });
        }

        // Check if this notification type is enabled
        if (!config.notifications_enabled) {
            return Response.json({ message: 'Notifications disabled' }, { status: 200 });
        }

        if (notificationType === 'announcement' && !config.send_announcement) {
            return Response.json({ message: 'Announcements disabled' }, { status: 200 });
        }
        if (notificationType === 'reminder' && !config.send_reminder) {
            return Response.json({ message: 'Reminders disabled' }, { status: 200 });
        }
        if (notificationType === 'recap' && !config.send_recap) {
            return Response.json({ message: 'Recaps disabled' }, { status: 200 });
        }

        // Get event data
        const events = await base44.entities.Event.filter({ id: eventId });
        if (events.length === 0) {
            return Response.json({ error: 'Event not found' }, { status: 404 });
        }
        const event = events[0];

        // Get activity data
        const activities = await base44.entities.Activity.filter({ id: event.activity_id });
        const activity = activities[0];

        // Get participation data
        const participations = await base44.entities.Participation.filter({ event_id: eventId });

        // Count RSVPs (PII Protection: do not expose individual names)
        const yesRsvps = participations.filter(p => p.rsvp_status === 'yes');
        const rsvpCount = yesRsvps.length;

        // Generate appropriate card based on notification type
        let card;
        if (notificationType === 'announcement') {
            card = createAnnouncementCard(event, activity, config, rsvpCount);
        } else if (notificationType === 'reminder') {
            card = createReminderCard(event, activity, rsvpCount, config);
        } else if (notificationType === 'recap') {
            card = await createRecapCard(event, activity, participations, config);
        }

        // Send to Teams
        const response = await fetch(config.webhook_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(card)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Teams API error: ${errorText}`);
        }

        return Response.json({ 
            success: true, 
            message: `${notificationType} sent to Teams` 
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function createAnnouncementCard(event, activity, config, rsvpCount = 0) {
    const eventDate = new Date(event.scheduled_date);
    const magicLink = buildMagicLink(event.magic_link);

    const customMessage = config.announcement_template || 
        `🎉 **New Team Activity Scheduled!**\n\nJoin us for an exciting team engagement activity!`;

    return {
        type: "message",
        attachments: [{
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                type: "AdaptiveCard",
                version: "1.4",
                body: [
                    {
                        type: "TextBlock",
                        text: "🎉 New Team Activity!",
                        size: "Large",
                        weight: "Bolder",
                        color: "Accent"
                    },
                    ...(rsvpCount > 0 ? [{
                        type: "TextBlock",
                        text: `👥 ${rsvpCount} teammates already joined!`,
                        size: "Medium",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Small"
                    }] : []),
                    {
                        type: "ColumnSet",
                        columns: [
                            {
                                type: "Column",
                                width: "stretch",
                                items: [
                                    {
                                        type: "TextBlock",
                                        text: event.title,
                                        size: "ExtraLarge",
                                        weight: "Bolder",
                                        wrap: true
                                    },
                                    {
                                        type: "TextBlock",
                                        text: activity?.description || '',
                                        wrap: true,
                                        spacing: "Small",
                                        color: "Good"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "FactSet",
                        facts: [
                            {
                                title: "📅 Date:",
                                value: eventDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })
                            },
                            {
                                title: "🕐 Time:",
                                value: eventDate.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    timeZoneName: 'short'
                                })
                            },
                            {
                                title: "⏱️ Duration:",
                                value: activity?.duration || event.duration_minutes + ' min'
                            },
                            {
                                title: "🎯 Type:",
                                value: activity?.type || 'Activity'
                            }
                        ]
                    },
                    {
                        type: "TextBlock",
                        text: activity?.instructions || '',
                        wrap: true,
                        spacing: "Medium",
                        separator: true
                    }
                ],
                actions: [
                    {
                        type: "Action.OpenUrl",
                        title: "✅ RSVP & Join",
                        url: magicLink,
                        style: "positive"
                    }
                ]
            }
        }]
    };
}

function createReminderCard(event, activity, rsvpCount, config) {
    const eventDate = new Date(event.scheduled_date);
    const now = new Date();
    const hoursUntil = Math.round((eventDate - now) / (1000 * 60 * 60));
    const minutesUntil = Math.round((eventDate - now) / (1000 * 60));
    const timeString = hoursUntil >= 1 ? `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}` : `${minutesUntil} minutes`;
    const magicLink = buildMagicLink(event.magic_link);

    return {
        type: "message",
        attachments: [{
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                type: "AdaptiveCard",
                version: "1.4",
                body: [
                    {
                        type: "TextBlock",
                        text: "⏰ Event Starting Soon!",
                        size: "Large",
                        weight: "Bolder",
                        color: "Attention"
                    },
                    {
                        type: "TextBlock",
                        text: `**${event.title}** starts in ${timeString}!`,
                        size: "Large",
                        weight: "Bolder",
                        wrap: true
                    },
                    {
                        type: "TextBlock",
                        text: `👥 **${rsvpCount} teammates joining!**`,
                        weight: "Bolder",
                        wrap: true,
                        color: "Good",
                        spacing: "Medium"
                    },
                    {
                        type: "FactSet",
                        facts: [
                            {
                                title: "⏰ Starting:",
                                value: eventDate.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit'
                                })
                            },
                            {
                                title: "👥 RSVPs:",
                                value: rsvpCount.toString()
                            }
                        ]
                    }
                ],
                actions: [
                    {
                        type: "Action.OpenUrl",
                        title: "🚀 Join Now",
                        url: magicLink,
                        style: "positive"
                    }
                ]
            }
        }]
    };
}

async function createRecapCard(event, activity, participations, config) {
    const attended = participations.filter(p => p.attended);
    const withFeedback = participations.filter(p => p.engagement_score);
    const avgEngagement = withFeedback.length > 0
        ? (withFeedback.reduce((sum, p) => sum + p.engagement_score, 0) / withFeedback.length).toFixed(1)
        : 'N/A';

    // Anonymize feedback: show feedback count only, not participant names
    const topFeedbackCount = participations.filter(p => p.feedback && p.engagement_score >= 4).length;

    return {
        type: "message",
        attachments: [{
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                type: "AdaptiveCard",
                version: "1.4",
                body: [
                    {
                        type: "TextBlock",
                        text: "📊 Event Recap",
                        size: "Large",
                        weight: "Bolder",
                        color: "Good"
                    },
                    {
                        type: "TextBlock",
                        text: event.title,
                        size: "ExtraLarge",
                        weight: "Bolder",
                        wrap: true
                    },
                    {
                        type: "TextBlock",
                        text: "Thank you to everyone who participated! Here's how it went:",
                        wrap: true,
                        spacing: "Small"
                    },
                    {
                        type: "FactSet",
                        facts: [
                            {
                                title: "👥 Participants:",
                                value: attended.length.toString()
                            },
                            {
                                title: "⭐ Avg Rating:",
                                value: `${avgEngagement}/5.0`
                            },
                            {
                                title: "💬 Feedback:",
                                value: `${withFeedback.length} responses`
                            }
                        ]
                    },
                    ...(topFeedbackCount > 0 ? [{
                        type: "TextBlock",
                        text: `💭 **${topFeedbackCount} positive feedback responses received!**`,
                        weight: "Bolder",
                        spacing: "Medium",
                        separator: true
                    }] : []),
                    {
                        type: "TextBlock",
                        text: "🎉 See you at the next event!",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Medium"
                    }
                ]
            }
        }]
    };
}