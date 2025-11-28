# API Reference

## Backend Functions

### Notifications

#### `slackNotifications`
Send messages to Slack via webhook.

**Usage:**
```javascript
import { base44 } from "@/api/base44Client";

await base44.functions.invoke('slackNotifications', {
  type: 'event_reminder', // or 'achievement', 'recognition'
  eventId: 'event-123',
  message: 'Custom message',
  channel: '#general'
});
```

**Types:**
- `event_reminder` - Event reminder notification
- `event_created` - New event announcement
- `achievement` - Badge/milestone unlocked
- `recognition` - Peer recognition

---

#### `teamsNotifications`
Send adaptive cards to MS Teams.

**Usage:**
```javascript
await base44.functions.invoke('teamsNotifications', {
  type: 'event_announcement',
  event: { title, scheduled_date, meeting_link },
  activity: { title, description, image_url }
});
```

---

#### `gamificationEmails`
Send gamification-related emails.

**Usage:**
```javascript
await base44.functions.invoke('gamificationEmails', {
  type: 'badge_earned',
  userEmail: 'user@example.com',
  badgeData: { badge_name, badge_icon, badge_description }
});
```

**Types:**
- `badge_earned` - New badge notification
- `level_up` - Level progression
- `weekly_summary` - Weekly engagement summary
- `streak_milestone` - Streak achievement

---

### Gamification

#### `awardPoints`
Award points to a user.

**Usage:**
```javascript
await base44.functions.invoke('awardPoints', {
  userEmail: 'user@example.com',
  points: 50,
  reason: 'Event attendance',
  source: 'attendance',
  eventId: 'event-123'
});
```

**Sources:**
- `attendance` - Event attendance
- `activity` - Activity completion
- `feedback` - Feedback submission
- `badge` - Badge bonus
- `challenge` - Challenge completion
- `bonus` - Manual bonus

---

#### `redeemReward`
Process a reward redemption.

**Usage:**
```javascript
const result = await base44.functions.invoke('redeemReward', {
  userEmail: 'user@example.com',
  rewardId: 'reward-123'
});
```

**Returns:**
```javascript
{
  success: true,
  redemption: { id, status, redeemed_at },
  remainingPoints: 450
}
```

---

### AI & Recommendations

#### `generateRecommendations`
Get AI-powered event recommendations.

**Usage:**
```javascript
const recommendations = await base44.functions.invoke('generateRecommendations', {
  userEmail: 'user@example.com',
  teamId: 'team-123',
  context: {
    recentEvents: [...],
    userPreferences: {...},
    teamSize: 20
  }
});
```

---

#### `openaiIntegration`
Direct OpenAI API access.

**Usage:**
```javascript
const response = await base44.functions.invoke('openaiIntegration', {
  prompt: 'Generate team building ideas',
  model: 'gpt-4o-mini',
  jsonSchema: { type: 'object', properties: {...} }
});
```

---

### Calendar

#### `googleCalendarSync`
Sync events to Google Calendar.

**Usage:**
```javascript
await base44.functions.invoke('googleCalendarSync', {
  action: 'create', // or 'update', 'delete'
  event: { title, scheduled_date, duration_minutes, meeting_link }
});
```

**Note:** Requires Google Calendar OAuth authorization.

---

## Entity SDK

### Basic Operations

```javascript
import { base44 } from "@/api/base44Client";

// List entities
const events = await base44.entities.Event.list('-scheduled_date', 50);

// Filter entities
const activeEvents = await base44.entities.Event.filter(
  { status: 'scheduled' },
  '-scheduled_date',
  20
);

// Create entity
const newEvent = await base44.entities.Event.create({
  title: 'Team Meeting',
  scheduled_date: '2024-12-01T10:00:00Z',
  activity_id: 'activity-123'
});

// Update entity
await base44.entities.Event.update(eventId, {
  status: 'completed'
});

// Delete entity
await base44.entities.Event.delete(eventId);

// Get schema
const schema = await base44.entities.Event.schema();
```

---

## Authentication SDK

```javascript
import { base44 } from "@/api/base44Client";

// Get current user
const user = await base44.auth.me();

// Check if authenticated
const isAuth = await base44.auth.isAuthenticated();

// Update current user
await base44.auth.updateMe({ preferences: {...} });

// Logout
base44.auth.logout('/');

// Redirect to login
base44.auth.redirectToLogin('/dashboard');
```

---

## Agent SDK

```javascript
import { base44 } from "@/api/base44Client";

// Create conversation
const conversation = await base44.agents.createConversation({
  agent_name: 'EventManagerAgent',
  metadata: { name: 'Planning Session' }
});

// Add message
await base44.agents.addMessage(conversation, {
  role: 'user',
  content: 'Suggest team building activities'
});

// Subscribe to updates
const unsubscribe = base44.agents.subscribeToConversation(
  conversationId,
  (data) => setMessages(data.messages)
);

// Get WhatsApp URL
const whatsappUrl = base44.agents.getWhatsAppConnectURL('EventManagerAgent');
```

---

## Integration SDK

```javascript
import { base44 } from "@/api/base44Client";

// Invoke LLM
const response = await base44.integrations.Core.InvokeLLM({
  prompt: 'Generate ideas',
  add_context_from_internet: true,
  response_json_schema: { type: 'object', properties: {...} }
});

// Upload file
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});

// Generate image
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: 'Team collaboration illustration'
});

// Send email
await base44.integrations.Core.SendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  body: '<html>...</html>'
});
``