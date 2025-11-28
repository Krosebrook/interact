# API Reference
## Employee Engagement Platform

---

## 1. Overview

### 1.1 Base Configuration

```javascript
// Frontend SDK Usage
import { base44 } from '@/api/base44Client';

// Backend Function Setup
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
const base44 = createClientFromRequest(req);
```

### 1.2 Authentication

All API calls require authentication. The Base44 SDK handles this automatically.

```javascript
// Check authentication
const user = await base44.auth.me();

// Logout
base44.auth.logout(redirectUrl);

// Redirect to login
base44.auth.redirectToLogin(nextUrl);

// Check if authenticated
const isAuth = await base44.auth.isAuthenticated();
```

### 1.3 Response Format

All entity operations return:
- **Single item**: Object with entity properties
- **List**: Array of objects
- **Create/Update**: Created/updated object
- **Delete**: void

---

## 2. Platform Statistics (Live Data)

| Entity | Records | Description |
|--------|---------|-------------|
| Activity | 15+ | Activity templates |
| Event | Active | Scheduled events |
| Badge | 10 | Achievement badges |
| EventTemplate | 30+ | Pre-built templates |
| Channel | Dynamic | Team messaging |
| Team | Dynamic | Organization structure |
| UserPoints | Per-user | Gamification data |

---

## 3. Entity APIs

### 3.1 User Entity (Built-in)

```javascript
// List all users (admin only)
const users = await base44.entities.User.list();

// Filter users
const admins = await base44.entities.User.filter({ role: 'admin' });

// Get current user
const me = await base44.auth.me();

// Update current user
await base44.auth.updateMe({ custom_field: 'value' });
```

**User Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| email | string | User email |
| full_name | string | Display name |
| role | string | 'admin' or 'user' |
| created_date | datetime | Registration date |

---

### 2.2 Recognition API

```javascript
// Create recognition
const recognition = await base44.entities.Recognition.create({
  recipient_emails: ['alex@intinc.com'],
  recipient_names: ['Alex Johnson'],
  message: 'Great work on the product launch!',
  category: 'teamwork',
  tags: ['product-launch', 'Q4'],
  points_awarded: 25,
  visibility: 'public'
});

// List all approved recognitions
const feed = await base44.entities.Recognition.filter(
  { status: 'approved' },
  '-created_date',
  50
);

// Get recognition by ID
const item = await base44.entities.Recognition.filter({ id: recognitionId });

// Update recognition (moderation)
await base44.entities.Recognition.update(id, {
  status: 'approved',
  moderation: {
    reviewed_by: 'admin@intinc.com',
    reviewed_at: new Date().toISOString()
  }
});

// Add reaction
const current = recognition.reactions || [];
await base44.entities.Recognition.update(id, {
  reactions: [...current, { emoji: '👍', user_emails: [user.email] }]
});

// Delete recognition
await base44.entities.Recognition.delete(id);
```

**Recognition Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sender_email | string | auto | Sender's email |
| sender_name | string | no | Sender display name |
| recipient_emails | array | yes | Recipients |
| recipient_names | array | no | Recipient names |
| message | string | yes | Recognition text (20-500 chars) |
| category | enum | no | teamwork, innovation, leadership, etc. |
| tags | array | no | Skill/project tags |
| points_awarded | number | no | Bonus points (0-25) |
| visibility | enum | no | public, team_only, private |
| status | enum | no | pending, approved, rejected, flagged |
| reactions | array | no | Emoji reactions |
| comments | array | no | Comment thread |
| featured | boolean | no | Featured recognition |

---

### 2.3 Survey API

```javascript
// Create survey
const survey = await base44.entities.Survey.create({
  title: 'Weekly Pulse Check',
  description: 'Quick check on team sentiment',
  survey_type: 'pulse',
  questions: [
    {
      id: 'q1',
      order: 1,
      type: 'rating',
      text: 'How are you feeling this week?',
      required: true,
      scale_min: 1,
      scale_max: 5
    },
    {
      id: 'q2',
      order: 2,
      type: 'text',
      text: 'Any feedback for leadership?',
      required: false
    }
  ],
  settings: {
    min_responses_for_results: 5,
    allow_anonymous: true,
    reminder_enabled: true
  },
  target_audience: {
    type: 'all'
  }
});

// List active surveys
const surveys = await base44.entities.Survey.filter(
  { status: 'active' },
  '-created_date'
);

// Get survey results (threshold check in backend)
const responses = await base44.entities.SurveyResponse.filter(
  { survey_id: surveyId }
);

// Close survey
await base44.entities.Survey.update(id, { status: 'closed' });
```

**Survey Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | yes | Survey title |
| description | string | no | Survey purpose |
| status | enum | no | draft, scheduled, active, closed |
| survey_type | enum | no | pulse, engagement, exit, etc. |
| questions | array | yes | Question objects |
| recurrence | object | no | Scheduling config |
| target_audience | object | no | Who receives survey |
| settings | object | no | Min threshold, anonymity |
| deadline | datetime | no | Survey end date |
| response_count | number | auto | Total responses |

---

### 2.4 Survey Response API

```javascript
// Submit response (via backend function for anonymity)
await base44.functions.invoke('submitSurveyResponse', {
  surveyId: survey.id,
  answers: [
    { question_id: 'q1', numeric_value: 4 },
    { question_id: 'q2', value: 'More async communication please' }
  ]
});
```

**⚠️ IMPORTANT: Never create SurveyResponse directly from frontend to maintain anonymity.**

---

### 2.5 Channel API

```javascript
// Create channel
const channel = await base44.entities.Channel.create({
  name: 'engineering',
  description: 'Engineering team discussions',
  type: 'team',
  visibility: 'public',
  icon: '💻',
  owner_email: user.email,
  member_emails: [user.email],
  admin_emails: [user.email]
});

// List channels user can access
const channels = await base44.entities.Channel.filter(
  { is_archived: false },
  '-last_activity'
);

// Join channel
const members = [...channel.member_emails, user.email];
await base44.entities.Channel.update(id, {
  member_emails: members,
  member_count: members.length
});

// Leave channel
const members = channel.member_emails.filter(e => e !== user.email);
await base44.entities.Channel.update(id, {
  member_emails: members,
  member_count: members.length
});
```

**Channel Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Channel name |
| description | string | no | Channel purpose |
| type | enum | no | team, project, interest, announcement |
| visibility | enum | no | public, private, invite_only |
| icon | string | no | Emoji icon |
| owner_email | string | yes | Creator email |
| member_emails | array | no | Member list |
| admin_emails | array | no | Admin list |
| member_count | number | auto | Member count |
| is_archived | boolean | no | Archive status |

---

### 2.6 Channel Message API

```javascript
// Send message
const message = await base44.entities.ChannelMessage.create({
  channel_id: channel.id,
  sender_email: user.email,
  sender_name: user.full_name,
  content: 'Hello team!',
  message_type: 'text'
});

// Get channel messages
const messages = await base44.entities.ChannelMessage.filter(
  { channel_id: channelId },
  '-created_date',
  100
);

// Add reaction to message
const reactions = [...(message.reactions || [])];
const existing = reactions.find(r => r.emoji === '👍');
if (existing) {
  existing.user_emails.push(user.email);
} else {
  reactions.push({ emoji: '👍', user_emails: [user.email] });
}
await base44.entities.ChannelMessage.update(id, { reactions });

// Delete message
await base44.entities.ChannelMessage.delete(id);
```

---

### 2.7 UserPoints API

```javascript
// Get user points
const points = await base44.entities.UserPoints.filter(
  { user_email: user.email }
);

// Award points (via backend function)
await base44.functions.invoke('awardPoints', {
  user_email: 'alex@intinc.com',
  amount: 10,
  reason: 'Event attendance',
  source: 'attendance'
});

// Get leaderboard
const leaderboard = await base44.entities.UserPoints.list(
  '-total_points',
  20
);
```

**UserPoints Schema:**
| Field | Type | Description |
|-------|------|-------------|
| user_email | string | User identifier |
| total_points | number | All-time points |
| available_points | number | Spendable points |
| lifetime_points | number | Never decreases |
| level | number | Current level (1-20) |
| experience_points | number | XP in current level |
| streak_days | number | Consecutive active days |
| events_attended | number | Event count |
| badges_earned | array | Badge IDs |
| rank | number | Leaderboard position |

---

### 2.8 Badge API

```javascript
// List all badges
const badges = await base44.entities.Badge.filter({ is_active: true });

// Get user's badges
const userPoints = await base44.entities.UserPoints.filter(
  { user_email: user.email }
);
const earnedBadgeIds = userPoints[0]?.badges_earned || [];

// Award badge (via backend)
await base44.functions.invoke('awardBadge', {
  user_email: 'alex@intinc.com',
  badge_id: 'badge_123'
});
```

---

### 2.9 Store Item API

```javascript
// List store items
const items = await base44.entities.StoreItem.filter(
  { 'availability.is_available': true },
  'sort_order'
);

// Get item by ID
const item = await base44.entities.StoreItem.filter({ id: itemId });

// Purchase with points (via backend)
await base44.functions.invoke('purchaseWithPoints', {
  itemId: item.id,
  quantity: 1
});

// Purchase with Stripe (via backend)
const { checkoutUrl } = await base44.functions.invoke('createStoreCheckout', {
  itemId: item.id
});
window.location.href = checkoutUrl;
```

**StoreItem Schema:**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Item name |
| description | string | Item description |
| category | enum | avatar_hat, power_up, etc. |
| rarity | enum | common, rare, legendary |
| pricing.points_cost | number | Point price |
| pricing.money_cost_cents | number | USD cents |
| pricing.stripe_price_id | string | Stripe price ID |
| availability | object | Stock, dates |
| effects | object | Power-up effects |

---

### 2.10 User Inventory API

```javascript
// Get user's inventory
const inventory = await base44.entities.UserInventory.filter(
  { user_email: user.email }
);

// Equip item
await base44.entities.UserInventory.update(itemId, {
  is_equipped: true,
  equipped_slot: 'hat'
});

// Get equipped items
const equipped = await base44.entities.UserInventory.filter({
  user_email: user.email,
  is_equipped: true
});
```

---

### 2.11 Event API

```javascript
// Create event
const event = await base44.entities.Event.create({
  activity_id: activity.id,
  title: 'Team Trivia Night',
  scheduled_date: '2025-12-01T18:00:00Z',
  duration_minutes: 60,
  status: 'scheduled',
  event_format: 'online',
  meeting_link: 'https://zoom.us/...',
  max_participants: 30
});

// List upcoming events
const upcoming = await base44.entities.Event.filter(
  { status: 'scheduled' },
  'scheduled_date'
);

// RSVP to event
await base44.entities.Participation.create({
  event_id: event.id,
  participant_email: user.email,
  participant_name: user.full_name,
  rsvp_status: 'yes'
});

// Cancel event
await base44.entities.Event.update(id, { status: 'cancelled' });
```

---

### 2.12 Team API

```javascript
// Create team
const team = await base44.entities.Team.create({
  name: 'Engineering',
  description: 'Engineering department',
  team_type: 'department',
  lead_email: 'lead@intinc.com'
});

// Add member
await base44.entities.TeamMembership.create({
  team_id: team.id,
  user_email: 'member@intinc.com',
  role: 'member'
});

// Get team leaderboard
const teams = await base44.entities.Team.list('-total_points');
```

---

## 3. Backend Functions

### 3.1 Recognition Functions

```javascript
// functions/createRecognition.js
// Handles moderation, points award, notifications
await base44.functions.invoke('createRecognition', {
  recipient_emails: ['alex@intinc.com'],
  message: 'Great work!',
  category: 'teamwork',
  points_awarded: 25
});

// functions/moderateRecognition.js
await base44.functions.invoke('moderateRecognition', {
  recognition_id: 'rec_123',
  action: 'approve' // or 'reject'
});
```

### 3.2 Survey Functions

```javascript
// functions/submitSurveyResponse.js
// Ensures anonymity, validates invitation
await base44.functions.invoke('submitSurveyResponse', {
  surveyId: 'survey_123',
  answers: [{ question_id: 'q1', numeric_value: 4 }]
});

// functions/sendSurveyInvitations.js
await base44.functions.invoke('sendSurveyInvitations', {
  surveyId: 'survey_123'
});

// functions/getSurveyResults.js
// Checks threshold before returning
const results = await base44.functions.invoke('getSurveyResults', {
  surveyId: 'survey_123'
});
```

### 3.3 Gamification Functions

```javascript
// functions/awardPoints.js
await base44.functions.invoke('awardPoints', {
  user_email: 'alex@intinc.com',
  amount: 10,
  reason: 'Survey completion',
  source: 'survey'
});

// functions/checkBadgeEligibility.js
await base44.functions.invoke('checkBadgeEligibility', {
  user_email: 'alex@intinc.com'
});

// functions/updateStreak.js
await base44.functions.invoke('updateStreak', {
  user_email: 'alex@intinc.com'
});
```

### 3.4 Store Functions

```javascript
// functions/purchaseWithPoints.js
const result = await base44.functions.invoke('purchaseWithPoints', {
  itemId: 'item_123',
  quantity: 1
});

// functions/createStoreCheckout.js
const { checkoutUrl } = await base44.functions.invoke('createStoreCheckout', {
  itemId: 'item_123'
});

// functions/storeWebhook.js
// Handles Stripe webhook events
// POST /functions/storeWebhook
```

### 3.5 Notification Functions

```javascript
// functions/sendSlackNotification.js
await base44.functions.invoke('sendSlackNotification', {
  channel: '#general',
  message: 'New recognition posted!'
});

// functions/sendTeamsNotification.js
await base44.functions.invoke('sendTeamsNotification', {
  webhookUrl: 'https://...',
  message: 'New recognition!'
});

// functions/sendEmailNotification.js
await base44.functions.invoke('sendEmailNotification', {
  to: 'alex@intinc.com',
  subject: 'You received recognition!',
  body: '...'
});
```

---

## 4. Integration APIs

### 4.1 Core Integrations

```javascript
// LLM Integration
const response = await base44.integrations.Core.InvokeLLM({
  prompt: 'Analyze this survey feedback for sentiment',
  add_context_from_internet: false,
  response_json_schema: {
    type: 'object',
    properties: {
      sentiment: { type: 'string' },
      themes: { type: 'array', items: { type: 'string' } }
    }
  }
});

// File Upload
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});

// Send Email
await base44.integrations.Core.SendEmail({
  to: 'user@intinc.com',
  subject: 'Weekly Recognition Digest',
  body: '<html>...</html>'
});

// Generate Image
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: 'Celebration badge with confetti'
});
```

### 4.2 Stripe Integration

```javascript
// Create checkout session (backend only)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Premium Hat' },
      unit_amount: 499 // $4.99
    },
    quantity: 1
  }],
  success_url: `${origin}/PointStore?success=true`,
  cancel_url: `${origin}/PointStore?canceled=true`,
  customer_email: user.email
});
```

---

## 5. Query Patterns

### 5.1 Filtering

```javascript
// Exact match
await base44.entities.Recognition.filter({ status: 'approved' });

// Multiple conditions
await base44.entities.Recognition.filter({
  status: 'approved',
  visibility: 'public'
});

// Array contains
await base44.entities.Recognition.filter({
  recipient_emails: user.email
});
```

### 5.2 Sorting

```javascript
// Descending (newest first)
await base44.entities.Recognition.list('-created_date');

// Ascending (oldest first)
await base44.entities.Recognition.list('created_date');

// With limit
await base44.entities.Recognition.list('-created_date', 20);
```

### 5.3 Pagination

```javascript
// Using limit and offset pattern
const page1 = await base44.entities.Recognition.list('-created_date', 20);
// Note: Base44 doesn't have built-in offset, use created_date cursor
```

---

## 6. Error Handling

```javascript
// API calls may throw errors
try {
  const result = await base44.entities.Recognition.create(data);
} catch (error) {
  console.error('Create failed:', error.message);
}

// Backend functions return response object
const response = await base44.functions.invoke('myFunction', params);
if (response.data.error) {
  console.error(response.data.error);
}
```

---

## 7. Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Entity reads | 1000 | per minute |
| Entity writes | 100 | per minute |
| Function invocations | 100 | per minute |
| File uploads | 20 | per minute |

---

## 8. Webhooks

### 8.1 Stripe Webhook

```javascript
// functions/storeWebhook.js
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = await stripe.webhooks.constructEventAsync(
    body,
    signature,
    Deno.env.get('STRIPE_SIGNING_SECRET')
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful purchase
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }
  
  return Response.json({ received: true });
});
```

---

*Document Version: 1.0*
*Last Updated: 2025-11-28*