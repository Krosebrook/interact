import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Microsoft Teams Notifications Integration
 * Sends adaptive cards to Teams channels for events and announcements
 */

const TEAMS_WEBHOOK_URL = Deno.env.get("TEAMS_WEBHOOK_URL");

// Adaptive Card templates for different notification types
const TEMPLATES = {
  eventScheduled: (data) => ({
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "Container",
              style: "emphasis",
              items: [
                {
                  type: "TextBlock",
                  text: "📅 New Event Scheduled",
                  weight: "bolder",
                  size: "large",
                  color: "accent"
                }
              ]
            },
            {
              type: "Container",
              items: [
                {
                  type: "TextBlock",
                  text: data.eventTitle,
                  weight: "bolder",
                  size: "medium",
                  wrap: true
                },
                {
                  type: "TextBlock",
                  text: data.description,
                  wrap: true,
                  spacing: "small"
                }
              ]
            },
            {
              type: "FactSet",
              facts: [
                { title: "Date", value: data.eventDate },
                { title: "Time", value: data.eventTime },
                { title: "Duration", value: `${data.duration} minutes` },
                { title: "Format", value: data.format },
                { title: "Points", value: `+${data.pointsAwarded} pts` }
              ]
            },
            {
              type: "Container",
              style: "good",
              items: [
                {
                  type: "TextBlock",
                  text: `Facilitated by ${data.facilitatorName}`,
                  size: "small",
                  isSubtle: true
                }
              ]
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Event",
              url: data.eventUrl,
              style: "positive"
            },
            {
              type: "Action.OpenUrl",
              title: "Add to Calendar",
              url: data.calendarUrl
            }
          ]
        }
      }
    ]
  }),

  eventReminder: (data) => ({
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "Container",
              style: "attention",
              items: [
                {
                  type: "TextBlock",
                  text: `⏰ Event Starting ${data.timeUntil}`,
                  weight: "bolder",
                  size: "medium",
                  color: "attention"
                }
              ]
            },
            {
              type: "TextBlock",
              text: data.eventTitle,
              weight: "bolder",
              size: "large",
              wrap: true
            },
            {
              type: "FactSet",
              facts: [
                { title: "When", value: data.eventDate },
                { title: "Duration", value: `${data.duration} min` }
              ]
            },
            {
              type: "TextBlock",
              text: `🎯 Earn ${data.pointsAwarded} points for attending!`,
              color: "good",
              weight: "bolder"
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "Join Now",
              url: data.meetingLink || data.eventUrl,
              style: "positive"
            }
          ]
        }
      }
    ]
  }),

  eventRecap: (data) => ({
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "Container",
              style: "good",
              items: [
                {
                  type: "TextBlock",
                  text: "✅ Event Completed",
                  weight: "bolder",
                  size: "large",
                  color: "good"
                }
              ]
            },
            {
              type: "TextBlock",
              text: data.eventTitle,
              weight: "bolder",
              size: "medium",
              wrap: true
            },
            {
              type: "ColumnSet",
              columns: [
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "TextBlock",
                      text: data.attendeeCount.toString(),
                      size: "extraLarge",
                      weight: "bolder",
                      horizontalAlignment: "center"
                    },
                    {
                      type: "TextBlock",
                      text: "Attendees",
                      size: "small",
                      horizontalAlignment: "center",
                      isSubtle: true
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "TextBlock",
                      text: data.avgEngagement.toString(),
                      size: "extraLarge",
                      weight: "bolder",
                      horizontalAlignment: "center"
                    },
                    {
                      type: "TextBlock",
                      text: "Avg Rating",
                      size: "small",
                      horizontalAlignment: "center",
                      isSubtle: true
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "TextBlock",
                      text: data.totalPointsAwarded.toString(),
                      size: "extraLarge",
                      weight: "bolder",
                      horizontalAlignment: "center"
                    },
                    {
                      type: "TextBlock",
                      text: "Points Given",
                      size: "small",
                      horizontalAlignment: "center",
                      isSubtle: true
                    }
                  ]
                }
              ]
            },
            {
              type: "TextBlock",
              text: `Highlights: ${data.highlights || 'Great participation from everyone!'}`,
              wrap: true,
              spacing: "medium"
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Full Recap",
              url: data.recapUrl
            }
          ]
        }
      }
    ]
  }),

  challengeAnnouncement: (data) => ({
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "Container",
              style: "warning",
              items: [
                {
                  type: "TextBlock",
                  text: "⚔️ New Team Challenge!",
                  weight: "bolder",
                  size: "large"
                }
              ]
            },
            {
              type: "TextBlock",
              text: data.challengeName,
              weight: "bolder",
              size: "extraLarge",
              wrap: true
            },
            {
              type: "TextBlock",
              text: data.description,
              wrap: true
            },
            {
              type: "FactSet",
              facts: [
                { title: "Type", value: data.challengeType },
                { title: "Starts", value: data.startDate },
                { title: "Ends", value: data.endDate },
                { title: "Reward", value: `${data.pointsReward} points + ${data.badgeReward || 'Badge'}` }
              ]
            },
            {
              type: "TextBlock",
              text: `${data.teamCount} teams competing`,
              size: "small",
              isSubtle: true
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "Join Challenge",
              url: data.challengeUrl,
              style: "positive"
            }
          ]
        }
      }
    ]
  }),

  leaderboardUpdate: (data) => ({
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: "🏆 Weekly Leaderboard Update",
              weight: "bolder",
              size: "large"
            },
            {
              type: "Container",
              items: data.topUsers.slice(0, 5).map((user, index) => ({
                type: "ColumnSet",
                columns: [
                  {
                    type: "Column",
                    width: "auto",
                    items: [
                      {
                        type: "TextBlock",
                        text: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`,
                        weight: "bolder"
                      }
                    ]
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        text: user.name,
                        weight: index < 3 ? "bolder" : "default"
                      }
                    ]
                  },
                  {
                    type: "Column",
                    width: "auto",
                    items: [
                      {
                        type: "TextBlock",
                        text: `${user.points.toLocaleString()} pts`,
                        horizontalAlignment: "right"
                      }
                    ]
                  }
                ]
              }))
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Full Leaderboard",
              url: data.leaderboardUrl
            }
          ]
        }
      }
    ]
  })
};

async function sendTeamsMessage(webhookUrl, payload) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Teams webhook error: ${response.status} - ${errorText}`);
  }

  return { success: true };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data, webhookUrl } = await req.json();
    const targetWebhook = webhookUrl || TEAMS_WEBHOOK_URL;

    if (!targetWebhook) {
      return Response.json({ error: 'Teams webhook URL not configured' }, { status: 400 });
    }

    const templateFn = TEMPLATES[type];
    if (!templateFn) {
      return Response.json({ error: `Unknown notification type: ${type}` }, { status: 400 });
    }

    const payload = templateFn(data);
    const result = await sendTeamsMessage(targetWebhook, payload);

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});