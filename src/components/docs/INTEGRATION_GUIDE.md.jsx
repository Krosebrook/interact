# Integration Guide

## 1. Slack Integration

### Setup
1. Create a Slack App at https://api.slack.com/apps
2. Add an Incoming Webhook
3. Copy the Webhook URL
4. Set `SLACK_WEBHOOK_URL` secret in Base44 dashboard

### Webhook Configuration
```
Settings → Secrets → Add Secret
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXX
```

### Message Types

#### Event Announcement
```javascript
await base44.functions.invoke('slackNotifications', {
  type: 'event_created',
  event: {
    title: 'Team Trivia',
    scheduled_date: '2024-12-01T14:00:00Z',
    duration_minutes: 45,
    meeting_link: 'https://zoom.us/j/123'
  },
  activity: {
    title: 'Trivia Game',
    description: 'Test your knowledge!'
  }
});
```

#### Achievement Notification
```javascript
await base44.functions.invoke('slackNotifications', {
  type: 'achievement',
  userEmail: 'user@example.com',
  achievement: {
    type: 'badge',
    name: 'Team Player',
    description: 'Attended 10 events'
  }
});
```

---

## 2. Microsoft Teams Integration

### Setup
1. Create an Incoming Webhook connector in Teams channel
2. Copy the Webhook URL
3. Set `TEAMS_WEBHOOK_URL` secret in Base44 dashboard

### Adaptive Cards
Teams notifications use Adaptive Cards for rich formatting.

#### Event Card
```javascript
await base44.functions.invoke('teamsNotifications', {
  type: 'event_announcement',
  event: {
    title: 'Sprint Retrospective',
    scheduled_date: '2024-12-01T15:00:00Z',
    meeting_link: 'https://teams.microsoft.com/l/meetup-join/...'
  }
});
```

---

## 3. Google Calendar Integration

### Setup (OAuth Required)
1. Enable Google Calendar app connector
2. Request authorization with required scopes:
   - `https://www.googleapis.com/auth/calendar.events`

### Authorization Flow
```javascript
// Request OAuth authorization (agent will handle this)
await request_oauth_authorization({
  integration_type: 'googlecalendar',
  reason: 'To sync events to your Google Calendar',
  scopes: ['https://www.googleapis.com/auth/calendar.events']
});
```

### Sync Events
```javascript
// Backend function usage
await base44.functions.invoke('googleCalendarSync', {
  action: 'create',
  event: {
    title: 'Team Meeting',
    scheduled_date: '2024-12-01T10:00:00Z',
    duration_minutes: 60,
    description: 'Weekly sync',
    meeting_link: 'https://meet.google.com/...'
  }
});
```

---

## 4. Stripe Integration

### Current Setup
- API Key: ✅ Configured (`STRIPE_SECRET_KEY`)
- Webhook Secret: ✅ Configured (`STRIPE_SIGNING_SECRET`)

### Product Configuration
Existing product: **FlashFusion Subscription**
- Monthly metered pricing at $29/month
- 7-day trial available

### Checkout Session
```javascript
// Backend function: createStripeCheckout
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const session = await stripe.checkout.sessions.create({
  mode: 'payment', // or 'subscription'
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Avatar Power-Up' },
      unit_amount: 500 // $5.00
    },
    quantity: 1
  }],
  success_url: 'https://yourapp.base44.app/payment-success',
  cancel_url: 'https://yourapp.base44.app/payment-cancel',
  metadata: {
    user_email: user.email,
    item_id: 'power-up-123'
  }
});
```

### Webhook Handler
```javascript
// Backend function: stripeWebhook
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const sig = req.headers.get('stripe-signature');
const body = await req.text();

const event = await stripe.webhooks.constructEventAsync(
  body,
  sig,
  Deno.env.get('STRIPE_SIGNING_SECRET')
);

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  // Award item to user
  await grantPurchase(session.metadata);
}
```

---

## 5. Email Notifications

### Built-in Email Service
Uses Base44's built-in `SendEmail` integration.

```javascript
import { base44 } from '@/api/base44Client';

await base44.integrations.Core.SendEmail({
  to: 'user@example.com',
  subject: '🎉 You earned a new badge!',
  body: `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Congratulations!</h1>
        <p>You've earned the <strong>Team Player</strong> badge!</p>
      </body>
    </html>
  `
});
```

### Email Types
| Type | Trigger | Template |
|------|---------|----------|
| Welcome | User signup | Welcome + quick start |
| Event Reminder | 24h before event | Event details + join link |
| Badge Earned | Badge award | Badge info + collection link |
| Level Up | Level progression | New level + benefits |
| Weekly Digest | Weekly cron | Activity summary |

---

## 6. OpenAI Integration

### Setup
Secret `OPENAI_API_KEY` is configured.

### Direct API Usage
```javascript
await base44.functions.invoke('openaiIntegration', {
  prompt: 'Suggest 3 team building activities for a remote team of 20',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  jsonSchema: {
    type: 'object',
    properties: {
      activities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            duration: { type: 'string' }
          }
        }
      }
    }
  }
});
```

### Built-in LLM Integration
```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: 'Analyze this feedback and extract key themes',
  add_context_from_internet: false,
  response_json_schema: {
    type: 'object',
    properties: {
      themes: { type: 'array', items: { type: 'string' } },
      sentiment: { type: 'string' }
    }
  }
});
```

---

## 7. Webhook Best Practices

### Security
- Always validate signatures for payment webhooks
- Use HTTPS endpoints only
- Implement idempotency for retry handling

### Error Handling
```javascript
Deno.serve(async (req) => {
  try {
    // Process webhook
    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
});
```

### Retry Logic
- Return 2xx for successful processing
- Return 4xx/5xx to trigger retry
- Log all webhook events for debugging

---

## 8. Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| OpenAI | 60 RPM | Varies by tier |
| Slack Webhooks | 1/sec | Per channel |
| Teams Webhooks | 4/sec | Per connector |
| Stripe API | 100/sec | Read: 25/sec |
| Base44 Entities | 1000/min | Per entity type |

---

## 9. Environment Variables Summary

| Variable | Service | Required |
|----------|---------|----------|
| `OPENAI_API_KEY` | AI Features | ✅ |
| `ANTHROPIC_API_KEY` | Claude AI | Optional |
| `STRIPE_SECRET_KEY` | Payments | ✅ |
| `STRIPE_SIGNING_SECRET` | Webhooks | ✅ |
| `SLACK_WEBHOOK_URL` | Slack | Optional |
| `TEAMS_WEBHOOK_URL` | Teams | Optional |
| `GOOGLE_API_KEY` | Calendar | Optional |
| `PERPLEXITY_API_KEY` | Search | Optional |