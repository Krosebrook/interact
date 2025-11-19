import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

        // Generate appropriate card based on notification type
        let card;
        if (notificationType === 'announcement') {
            card = createAnnouncementCard(event, activity, config);
        } else if (notificationType === 'reminder') {
            card = createReminderCard(event, activity, participations.length, config);
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

function createAnnouncementCard(event, activity, config) {
    const eventDate = new Date(event.scheduled_date);
    const magicLink = `${Deno.env.get('APP_URL') || 'https://app.base44.com'}/ParticipantEvent?event=${event.magic_link}`;

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
    const magicLink = `${Deno.env.get('APP_URL') || 'https://app.base44.com'}/ParticipantEvent?event=${event.magic_link}`;

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
                        text: "⏰ Event Reminder",
                        size: "Large",
                        weight: "Bolder",
                        color: "Attention"
                    },
                    {
                        type: "TextBlock",
                        text: `**${event.title}** starts in ${hoursUntil} hours!`,
                        size: "Large",
                        weight: "Bolder",
                        wrap: true
                    },
                    {
                        type: "TextBlock",
                        text: `${rsvpCount} teammates have already signed up. Don't miss out!`,
                        wrap: true,
                        color: "Good"
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

    const topFeedback = participations
        .filter(p => p.feedback && p.engagement_score >= 4)
        .slice(0, 3)
        .map(p => `"${p.feedback}" - ${p.participant_name}`)
        .join('\n\n');

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
                    ...(topFeedback ? [{
                        type: "TextBlock",
                        text: "💭 **Top Feedback:**",
                        weight: "Bolder",
                        spacing: "Medium",
                        separator: true
                    },
                    {
                        type: "TextBlock",
                        text: topFeedback,
                        wrap: true,
                        isSubtle: true
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