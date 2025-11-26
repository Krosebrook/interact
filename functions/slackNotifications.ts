import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Slack Notifications Integration
 * Sends notifications to Slack channels for achievements, challenges, and events
 */

const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");

// Message templates for different notification types
const TEMPLATES = {
  achievement: (data) => ({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🏆 Achievement Unlocked!",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${data.userName}* just earned the *${data.badgeName}* badge!`
        },
        accessory: {
          type: "image",
          image_url: data.badgeIcon || "https://api.dicebear.com/7.x/shapes/svg?seed=badge",
          alt_text: "badge"
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${data.badgeDescription || 'Keep up the great work!'}`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `💪 Total badges: *${data.totalBadges}* | 🔥 Current streak: *${data.streak} days*`
        }
      }
    ]
  }),

  levelUp: (data) => ({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "⬆️ Level Up!",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🎉 *${data.userName}* has reached *Level ${data.newLevel}*!`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Total points: ${data.totalPoints.toLocaleString()} | Keep engaging to unlock more rewards!`
          }
        ]
      }
    ]
  }),

  challengeWon: (data) => ({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🏅 Challenge Victory!",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Team *${data.teamName}* has won the *${data.challengeName}* challenge!`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Final Score:*\n${data.score} points`
          },
          {
            type: "mrkdwn",
            text: `*Reward:*\n${data.pointsReward} bonus points`
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "🎊 Congratulations to all team members!"
          }
        ]
      }
    ]
  }),

  challengeStarted: (data) => ({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "⚔️ New Challenge Started!",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${data.challengeName}*\n${data.description}`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Type:*\n${data.challengeType}`
          },
          {
            type: "mrkdwn",
            text: `*Ends:*\n${data.endDate}`
          },
          {
            type: "mrkdwn",
            text: `*Reward:*\n${data.pointsReward} points`
          },
          {
            type: "mrkdwn",
            text: `*Teams:*\n${data.teamCount} participating`
          }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Challenge",
              emoji: true
            },
            url: data.challengeUrl,
            style: "primary"
          }
        ]
      }
    ]
  }),

  eventReminder: (data) => ({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📅 Event Reminder",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${data.eventTitle}* starts in *${data.timeUntil}*!`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*When:*\n${data.eventDate}`
          },
          {
            type: "mrkdwn",
            text: `*Duration:*\n${data.duration} minutes`
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🎯 Earn ${data.pointsAwarded} points for attending!`
          }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Join Event",
              emoji: true
            },
            url: data.eventUrl,
            style: "primary"
          }
        ]
      }
    ]
  }),

  weeklyDigest: (data) => ({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📊 Weekly Team Engage Digest",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Here's what happened this week on Team Engage:`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Events Completed:*\n${data.eventsCompleted}`
          },
          {
            type: "mrkdwn",
            text: `*Total Participants:*\n${data.totalParticipants}`
          },
          {
            type: "mrkdwn",
            text: `*Badges Earned:*\n${data.badgesEarned}`
          },
          {
            type: "mrkdwn",
            text: `*Points Awarded:*\n${data.pointsAwarded.toLocaleString()}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🏆 Top Performer:* ${data.topPerformer} (${data.topPerformerPoints} pts)`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📅 Upcoming Events:*\n${data.upcomingEvents.map(e => `• ${e.title} - ${e.date}`).join('\n') || 'No events scheduled'}`
        }
      }
    ]
  })
};

async function sendSlackMessage(webhookUrl, payload) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status}`);
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
    const targetWebhook = webhookUrl || SLACK_WEBHOOK_URL;

    if (!targetWebhook) {
      return Response.json({ error: 'Slack webhook URL not configured' }, { status: 400 });
    }

    const templateFn = TEMPLATES[type];
    if (!templateFn) {
      return Response.json({ error: `Unknown notification type: ${type}` }, { status: 400 });
    }

    const payload = templateFn(data);
    const result = await sendSlackMessage(targetWebhook, payload);

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});