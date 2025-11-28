# Integration Guide
## Employee Engagement Platform

---

## 1. Integration Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        ┌─────────────────────┐                              │
│                        │  ENGAGEMENT PLATFORM │                              │
│                        │                     │                              │
│                        │  • Recognition      │                              │
│                        │  • Surveys          │                              │
│                        │  • Gamification     │                              │
│                        │  • Channels         │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                          │
│         ┌─────────────────────────┼─────────────────────────┐               │
│         │                         │                         │               │
│         ▼                         ▼                         ▼               │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐         │
│  │COMMUNICATION│          │  CALENDAR   │          │  PAYMENTS   │         │
│  │             │          │             │          │             │         │
│  │ • Slack     │          │ • Google    │          │ • Stripe    │         │
│  │ • MS Teams  │          │   Calendar  │          │             │         │
│  │ • Email     │          │             │          │             │         │
│  └─────────────┘          └─────────────┘          └─────────────┘         │
│         │                         │                         │               │
│         ▼                         ▼                         ▼               │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐         │
│  │   AI/ML     │          │   STORAGE   │          │ ANALYTICS   │         │
│  │             │          │             │          │             │         │
│  │ • OpenAI    │          │ • Cloudinary│          │ • Built-in  │         │
│  │ • Claude    │          │             │          │             │         │
│  │ • Perplexity│          │             │          │             │         │
│  └─────────────┘          └─────────────┘          └─────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Slack Integration

### 2.1 Setup

1. Create Slack App at https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Add Bot Token Scopes: `chat:write`, `users:read`
4. Install to workspace
5. Copy Bot Token and Webhook URL

### 2.2 Environment Variables

```
SLACK_BOT_TOKEN=xoxb-xxxx-xxxx-xxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
SLACK_SIGNING_SECRET=xxxx
```

### 2.3 Backend Function: Send Notification

```javascript
// functions/slackNotifications.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data } = await req.json();
    const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');

    let message;
    switch (type) {
      case 'recognition':
        message = {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🌟 *New Recognition!*\n\n*${data.sender}* recognized *${data.recipient}*`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `> ${data.message}`
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Category: ${data.category} | Points: +${data.points}`
                }
              ]
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '👏 View in App' },
                  url: `${data.appUrl}/Recognition`
                }
              ]
            }
          ]
        };
        break;

      case 'survey':
        message = {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `📊 *New Survey Available!*\n\n*${data.title}*\n${data.description}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📝 Take Survey' },
                  url: data.surveyUrl,
                  style: 'primary'
                }
              ]
            }
          ]
        };
        break;

      case 'badge':
        message = {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🏆 *Badge Earned!*\n\n*${data.user}* just earned the *${data.badge}* badge!`
              }
            }
          ]
        };
        break;

      default:
        message = { text: data.text };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### 2.4 Notification Events

| Event | Trigger | Channel |
|-------|---------|---------|
| Recognition received | After approval | DM to recipient |
| Survey available | Survey published | Company channel |
| Badge earned | Badge awarded | DM to recipient |
| Event reminder | 24h before | Event channel |
| Weekly digest | Monday 9am | Company channel |

---

## 3. Microsoft Teams Integration

### 3.1 Setup

1. Create Incoming Webhook in Teams channel
2. Copy webhook URL
3. Store in TeamsConfig entity or environment

### 3.2 Backend Function: Teams Notification

```javascript
// functions/teamsNotifications.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data, webhookUrl } = await req.json();

    // Get webhook from config if not provided
    let webhook = webhookUrl;
    if (!webhook) {
      const configs = await base44.entities.TeamsConfig.filter({ config_key: 'default' });
      webhook = configs[0]?.webhook_url;
    }

    if (!webhook) {
      return Response.json({ error: 'No Teams webhook configured' }, { status: 400 });
    }

    let card;
    switch (type) {
      case 'recognition':
        card = {
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          themeColor: 'D97230',
          summary: 'New Recognition',
          sections: [{
            activityTitle: '🌟 New Recognition!',
            activitySubtitle: `${data.sender} → ${data.recipient}`,
            activityImage: data.senderAvatar,
            facts: [
              { name: 'Message', value: data.message },
              { name: 'Category', value: data.category },
              { name: 'Points', value: `+${data.points}` }
            ],
            markdown: true
          }],
          potentialAction: [{
            '@type': 'OpenUri',
            name: 'View in App',
            targets: [{ os: 'default', uri: data.appUrl }]
          }]
        };
        break;

      case 'survey':
        card = {
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          themeColor: '14294D',
          summary: 'New Survey',
          sections: [{
            activityTitle: '📊 ' + data.title,
            text: data.description,
            facts: [
              { name: 'Due', value: data.deadline },
              { name: 'Est. Time', value: '2 minutes' }
            ]
          }],
          potentialAction: [{
            '@type': 'OpenUri',
            name: 'Take Survey',
            targets: [{ os: 'default', uri: data.surveyUrl }]
          }]
        };
        break;

      case 'event':
        card = {
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          themeColor: '10B981',
          summary: 'Event Reminder',
          sections: [{
            activityTitle: '📅 ' + data.title,
            facts: [
              { name: 'When', value: data.date },
              { name: 'Duration', value: data.duration },
              { name: 'Format', value: data.format }
            ]
          }],
          potentialAction: [
            {
              '@type': 'OpenUri',
              name: 'Join Event',
              targets: [{ os: 'default', uri: data.meetingLink }]
            },
            {
              '@type': 'OpenUri',
              name: 'View Details',
              targets: [{ os: 'default', uri: data.eventUrl }]
            }
          ]
        };
        break;

      default:
        card = {
          '@type': 'MessageCard',
          text: data.text
        };
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });

    if (!response.ok) {
      throw new Error(`Teams API error: ${response.status}`);
    }

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 4. Google Calendar Integration

### 4.1 Setup via OAuth

Use Base44 App Connectors for Google Calendar OAuth:

```javascript
// Request authorization
import { base44 } from '@/api/base44Client';

// In component
<a href={base44.agents.getWhatsAppConnectURL('googlecalendar')} target="_blank">
  Connect Google Calendar
</a>
```

### 4.2 Backend Function: Sync Event

```javascript
// functions/googleCalendarSync.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, eventData } = await req.json();

    // Get OAuth token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    const calendarId = 'primary';
    const baseUrl = 'https://www.googleapis.com/calendar/v3';

    switch (action) {
      case 'create': {
        const event = {
          summary: eventData.title,
          description: eventData.description,
          start: {
            dateTime: eventData.start,
            timeZone: 'UTC'
          },
          end: {
            dateTime: eventData.end,
            timeZone: 'UTC'
          },
          conferenceData: eventData.meetingLink ? {
            entryPoints: [{
              entryPointType: 'video',
              uri: eventData.meetingLink
            }]
          } : undefined,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 60 },
              { method: 'email', minutes: 1440 }
            ]
          }
        };

        const response = await fetch(`${baseUrl}/calendars/${calendarId}/events`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });

        const created = await response.json();
        return Response.json({ success: true, eventId: created.id });
      }

      case 'update': {
        const response = await fetch(
          `${baseUrl}/calendars/${calendarId}/events/${eventData.calendarEventId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              summary: eventData.title,
              start: { dateTime: eventData.start },
              end: { dateTime: eventData.end }
            })
          }
        );

        return Response.json({ success: response.ok });
      }

      case 'delete': {
        const response = await fetch(
          `${baseUrl}/calendars/${calendarId}/events/${eventData.calendarEventId}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        return Response.json({ success: response.ok });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 5. Stripe Integration

### 5.1 Setup

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard
3. Create webhook endpoint
4. Set environment variables:

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_SIGNING_SECRET=whsec_xxx
```

### 5.2 Backend Function: Create Checkout

```javascript
// functions/createStoreCheckout.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await req.json();

    // Get item from database
    const items = await base44.entities.StoreItem.filter({ id: itemId });
    const item = items[0];
    
    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    if (!item.pricing?.money_cost_cents) {
      return Response.json({ error: 'Item not available for purchase' }, { status: 400 });
    }

    // Create transaction record
    const transaction = await base44.asServiceRole.entities.StoreTransaction.create({
      user_email: user.email,
      item_id: itemId,
      item_name: item.name,
      transaction_type: 'stripe',
      money_spent_cents: item.pricing.money_cost_cents * quantity,
      quantity,
      status: 'pending'
    });

    // Create Stripe checkout
    const origin = req.headers.get('origin');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: item.image_url ? [item.image_url] : []
          },
          unit_amount: item.pricing.money_cost_cents
        },
        quantity
      }],
      success_url: `${origin}/PointStore?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/PointStore?canceled=true`,
      customer_email: user.email,
      metadata: {
        user_email: user.email,
        item_id: itemId,
        transaction_id: transaction.id
      }
    });

    // Update transaction with session ID
    await base44.asServiceRole.entities.StoreTransaction.update(transaction.id, {
      stripe_checkout_session_id: session.id
    });

    return Response.json({ checkoutUrl: session.url });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### 5.3 Backend Function: Webhook Handler

```javascript
// functions/storeWebhook.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Get raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_SIGNING_SECRET')
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { user_email, item_id, transaction_id } = session.metadata;

      // Update transaction
      await base44.asServiceRole.entities.StoreTransaction.update(transaction_id, {
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent
      });

      // Get item
      const items = await base44.asServiceRole.entities.StoreItem.filter({ id: item_id });
      const item = items[0];

      // Add to inventory
      await base44.asServiceRole.entities.UserInventory.create({
        user_email,
        item_id,
        item_name: item.name,
        item_category: item.category,
        acquisition_type: 'purchase',
        transaction_id,
        acquired_at: new Date().toISOString()
      });

      // Update purchase count
      await base44.asServiceRole.entities.StoreItem.update(item_id, {
        purchase_count: (item.purchase_count || 0) + 1
      });

      // Notify user
      await base44.asServiceRole.entities.Notification.create({
        user_email,
        title: 'Purchase Complete!',
        message: `${item.name} has been added to your inventory.`,
        type: 'success'
      });

      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      console.error('Payment failed:', intent.last_payment_error?.message);
      break;
    }
  }

  return Response.json({ received: true });
});
```

---

## 6. Email Integration (SendGrid/Built-in)

### 6.1 Using Built-in Email

```javascript
// Send email via Core integration
await base44.integrations.Core.SendEmail({
  to: 'alex@intinc.com',
  subject: 'You received recognition! 🌟',
  body: `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Great news!</h2>
        <p>${senderName} recognized you for ${category}.</p>
        <blockquote style="border-left: 4px solid #D97230; padding-left: 16px;">
          ${message}
        </blockquote>
        <p>You earned <strong>${points} points</strong>!</p>
        <a href="${appUrl}" style="background: #D97230; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View in App
        </a>
      </body>
    </html>
  `
});
```

### 6.2 Email Templates

| Template | Trigger | Content |
|----------|---------|---------|
| recognition_received | Recognition approved | Sender, message, points |
| survey_invitation | Survey published | Title, deadline, link |
| survey_reminder | 24h before deadline | Title, link |
| badge_earned | Badge awarded | Badge name, description |
| weekly_digest | Monday 9am | Week's highlights |
| event_reminder | 24h before | Event details, link |

---

## 7. AI Integrations

### 7.1 OpenAI (Sentiment Analysis)

```javascript
// Analyze survey feedback
const analysis = await base44.integrations.Core.InvokeLLM({
  prompt: `Analyze the following survey responses for sentiment and key themes:
    
${responses.map(r => r.text_answer).join('\n---\n')}

Provide:
1. Overall sentiment (positive/negative/neutral)
2. Top 3 themes
3. Key concerns
4. Highlights`,
  response_json_schema: {
    type: 'object',
    properties: {
      sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
      sentiment_score: { type: 'number' },
      themes: { type: 'array', items: { type: 'string' } },
      concerns: { type: 'array', items: { type: 'string' } },
      highlights: { type: 'array', items: { type: 'string' } }
    }
  }
});
```

### 7.2 Content Moderation

```javascript
// Check recognition for inappropriate content
const moderation = await base44.integrations.Core.InvokeLLM({
  prompt: `Review this workplace recognition message for appropriateness:

"${message}"

Check for:
1. Inappropriate language
2. Personal attacks
3. Confidential information
4. Off-topic content

Is this appropriate for a workplace recognition? Respond with JSON.`,
  response_json_schema: {
    type: 'object',
    properties: {
      is_appropriate: { type: 'boolean' },
      issues: { type: 'array', items: { type: 'string' } },
      confidence: { type: 'number' }
    }
  }
});
```

---

## 8. File Storage (Cloudinary)

### 8.1 Image Upload

```javascript
// Upload recognition attachment
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});

// Use in recognition
await base44.entities.Recognition.update(id, {
  attachments: [...existing, { url: file_url, type: 'image' }]
});
```

### 8.2 File Limits

| Constraint | Value |
|------------|-------|
| Max size | 10MB |
| Allowed types | image/*, application/pdf |
| Storage | Cloudinary CDN |

---

## 9. Webhook Events Summary

| Event | Endpoint | Payload |
|-------|----------|---------|
| Stripe checkout.completed | /functions/storeWebhook | Stripe session |
| Stripe payment.failed | /functions/storeWebhook | Stripe intent |

---

## 10. Environment Variables Reference

### 10.1 Configured Secrets (Active)

| Variable | Service | Status | Purpose |
|----------|---------|--------|---------|
| STRIPE_SECRET_KEY | Stripe | ✅ Set | Payment processing |
| STRIPE_SIGNING_SECRET | Stripe | ✅ Set | Webhook validation |
| OPENAI_API_KEY | OpenAI | ✅ Set | AI/LLM features |
| ANTHROPIC_API_KEY | Anthropic | ✅ Set | Claude AI |
| PERPLEXITY_API_KEY | Perplexity | ✅ Set | Search AI |
| CLOUDINARY_URL | Cloudinary | ✅ Set | File uploads |
| NOTION_API_KEY | Notion | ✅ Set | Documentation sync |
| HUBSPOT_PERSONAL_ACCESS_KEY | HubSpot | ✅ Set | CRM integration |
| GOOGLE_API_KEY | Google | ✅ Set | Maps, Calendar |
| VERCEL_TOKEN | Vercel | ✅ Set | Deployment |
| CLOUDFLARE_API_KEY | Cloudflare | ✅ Set | CDN/DNS |
| LINEAR_API_KEY | Linear | ✅ Set | Issue tracking |
| GITHUB_PERSONAL_ACCESS_TOKEN | GitHub | ✅ Set | Code integration |
| E2B_API_KEY | E2B | ✅ Set | Code execution |
| FIRECRAWL_API_KEY | Firecrawl | ✅ Set | Web scraping |

### 10.2 Stripe Product Configuration

| Product | Price ID | Amount | Type |
|---------|----------|--------|------|
| FlashFusion Subscription | price_1SMzwuAoyIkjw2kLSCowMTzC | $29/mo | Recurring (7-day trial) |
| FlashFusion Subscription | price_1SMzwuAoyIkjw2kLqebWycDw | $29/mo | Recurring (metered) |
| FlashFusion Subscription | price_1SMzwuAoyIkjw2kLaYrgyDQx | $79/mo | Recurring (metered) |
| FlashFusion Subscription | price_1SMzwuAoyIkjw2kLRl6YUZpZ | $0/mo | Free tier (metered) |

---

*Document Version: 1.0*
*Last Updated: 2025-11-28*