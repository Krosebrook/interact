# System Integration & Wiring Guide
## INTeract Platform - Data Flow & Integration Architecture

**Version:** 2.0  
**Last Updated:** 2026-01-22  
**Purpose:** Document how all system components connect and interact

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend-Backend Wiring](#frontend-backend-wiring)
3. [Entity Relationships](#entity-relationships)
4. [Integration Flows](#integration-flows)
5. [Event-Driven Architecture](#event-driven-architecture)
6. [Real-Time Data Flow](#real-time-data-flow)
7. [Authentication Flow](#authentication-flow)
8. [Notification Pipelines](#notification-pipelines)
9. [Scheduled Jobs](#scheduled-jobs)
10. [Troubleshooting](#troubleshooting)

---

## 1. System Overview

### 1.1 Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Pages      │  │ Components │  │ Hooks      │  │ Context  │ │
│  │ (Routes)   │  │ (UI)       │  │ (Logic)    │  │ (State)  │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬────┘ │
└────────┼───────────────┼───────────────┼───────────────┼───────┘
         │               │               │               │
         └───────────────┴───────────────┴───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Base44 SDK Client │
                    │  (Pre-initialized)│
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Auth Service  │  │ Entities CRUD  │  │  Functions API │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   PostgreSQL DB   │
                    │  (Entities Store) │
                    └───────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  External APIs │  │  WebSockets    │  │  File Storage  │
│  (OpenAI, etc) │  │  (Real-time)   │  │  (S3)          │
└────────────────┘  └────────────────┘  └────────────────┘
```

### 1.2 Data Flow Direction

**User Action → Frontend → Base44 → Database → Response**

```
User clicks "Give Recognition"
    ↓
RecognitionForm.jsx handles submit
    ↓
useMutation hook triggered
    ↓
base44.entities.Recognition.create(data)
    ↓
Base44 API Gateway validates request
    ↓
Database INSERT operation
    ↓
Entity-level permissions checked
    ↓
Record created, ID returned
    ↓
Optimistic UI update
    ↓
WebSocket broadcasts change
    ↓
Other users' feeds update in real-time
    ↓
Notification sent (email + in-app)
```

---

## 2. Frontend-Backend Wiring

### 2.1 SDK Initialization

**File:** `api/base44Client.js`
```javascript
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  apiUrl: import.meta.env.VITE_BASE44_API_URL,
});
```

**Usage in Components:**
```javascript
import { base44 } from '@/api/base44Client';

function MyComponent() {
  const { data } = useQuery({
    queryKey: ['entity'],
    queryFn: () => base44.entities.EntityName.list()
  });
}
```

### 2.2 Component → Entity Mapping

| Page/Component | Primary Entity | Related Entities |
|----------------|----------------|------------------|
| DawnHub | UserPoints | BadgeAward, Participation |
| Recognition | Recognition | User, UserProfile |
| Calendar | Event | Activity, Participation |
| Teams | Team | TeamMembership, TeamMessage |
| Leaderboards | UserPoints | User, UserProfile |
| Analytics | UserProfile | Recognition, Event, Participation |

### 2.3 Hook → Function Mapping

| Custom Hook | Purpose | Backend Function(s) |
|-------------|---------|---------------------|
| useUserData | Fetch user profile + points | None (direct entity read) |
| useEventData | Fetch events with filters | None (direct entity query) |
| useRecognitionData | Fetch recognition feed | None (direct entity query) |
| useLeaderboard | Fetch leaderboard data | calculateLeaderboard |
| useGamificationTrigger | Award points/badges | awardPoints, awardBadge |

---

## 3. Entity Relationships

### 3.1 Core Entity Graph

```
User (built-in)
  ├─ 1:1 → UserProfile
  ├─ 1:1 → UserPoints
  ├─ 1:N → Recognition (as recognizer)
  ├─ 1:N → Recognition (as recipient)
  ├─ N:M → Event (via Participation)
  ├─ N:M → Team (via TeamMembership)
  └─ 1:N → BadgeAward

UserProfile
  ├─ 1:1 → User
  └─ N:1 → User (manager relationship)

Recognition
  ├─ N:1 → User (recognizer)
  ├─ N:1 → User (recipient)
  └─ N:1 → CompanyValue (optional)

Event
  ├─ N:1 → Activity (template)
  ├─ N:1 → User (facilitator)
  └─ 1:N → Participation

Participation
  ├─ N:1 → Event
  ├─ N:1 → User
  └─ 1:1 → Feedback (optional)

Team
  ├─ 1:N → TeamMembership
  ├─ 1:N → TeamMessage
  └─ 1:N → TeamChallenge
```

### 3.2 Data Dependencies

**Recognition Creation:**
```javascript
// Dependencies that must exist:
1. Recognizer (User) - must be authenticated
2. Recipient (User) - must exist in User table
3. CompanyValue (optional) - if provided, must exist

// Auto-created/updated:
1. Recognition record
2. UserPoints (recipient +50 XP)
3. Notification (email + in-app)
4. Recognition feed update
```

**Event RSVP:**
```javascript
// Dependencies:
1. Event - must exist and be scheduled
2. User - must be authenticated
3. Participation - checked for duplicates

// Created/Updated:
1. Participation record (upsert)
2. Event.rsvp_count (increment/decrement)
3. Calendar sync (if enabled)
4. Email confirmation
```

---

## 4. Integration Flows

### 4.1 Slack Integration Flow

**Setup:**
```
1. User authorizes Slack app (OAuth)
2. Store workspace token in Base44
3. Configure notification channels
```

**Runtime Flow:**
```
Recognition Posted
    ↓
Recognition.create() success
    ↓
Trigger: afterCreate hook
    ↓
Call: sendSlackNotification function
    ↓
Format message with Slack blocks
    ↓
POST to Slack API (chat.postMessage)
    ↓
Store message_id for threading
```

**Code Implementation:**
```javascript
// Entity automation (triggered on Recognition create)
automation: {
  entity: 'Recognition',
  event: 'create',
  function: 'sendSlackNotification',
  condition: 'visibility === "public"'
}

// Function: sendSlackNotification
const blocks = [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `🎉 *${recognition.recognizer_name}* recognized *${recognition.recipient_name}*\n\n"${recognition.message}"`
    }
  },
  {
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `💎 Value: ${recognition.company_value}` }
    ]
  }
];

await fetch('https://slack.com/api/chat.postMessage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SLACK_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    channel: SLACK_CHANNEL,
    blocks
  })
});
```

### 4.2 Google Calendar Integration

**OAuth Setup:**
```
1. User clicks "Connect Google Calendar"
2. Redirect to Google OAuth
3. Scopes: calendar.events.owned
4. Store access token + refresh token
```

**Event Sync Flow:**
```
User RSVPs to Event
    ↓
Participation.create()
    ↓
Check: user has calendar enabled
    ↓
Call: syncToGoogleCalendar(eventId, userEmail)
    ↓
Get access token from connector
    ↓
POST to Google Calendar API
    ↓
Store calendar_event_id in Participation
    ↓
Return calendar link to user
```

**Two-Way Sync:**
```javascript
// Polling approach (runs every hour)
async function syncCalendarUpdates() {
  const users = await base44.entities.User.filter({ calendar_sync: true });
  
  for (const user of users) {
    const token = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
    
    // Fetch events updated in last hour
    const calendarEvents = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?updatedMin=${oneHourAgo}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Compare with our events, update if changed
    for (const calEvent of calendarEvents) {
      const participation = await base44.entities.Participation.filter({
        calendar_event_id: calEvent.id
      });
      
      if (participation && participation.rsvp_status !== mapStatus(calEvent.status)) {
        await base44.entities.Participation.update(participation.id, {
          rsvp_status: mapStatus(calEvent.status)
        });
      }
    }
  }
}
```

### 4.3 AI Integration Flow

**Request Flow:**
```
User requests AI recommendation
    ↓
Frontend: base44.functions.invoke('aiCoachingRecommendations', params)
    ↓
Backend Function: aiCoachingRecommendations.js
    ↓
Gather context:
  - User's team data
  - Recent engagement metrics
  - Historical patterns
    ↓
Call: base44.integrations.Core.InvokeLLM({
  prompt: `Generate coaching tips for manager with:
    Team size: ${teamSize}
    Avg engagement: ${avgEngagement}
    Low performers: ${atRiskUsers.length}`,
  response_json_schema: {
    type: 'object',
    properties: {
      recommendations: { type: 'array', items: { type: 'string' } },
      priorities: { type: 'array', items: { type: 'string' } }
    }
  }
})
    ↓
OpenAI processes request
    ↓
Return structured JSON response
    ↓
Format and return to frontend
    ↓
Display in UI component
```

---

## 5. Event-Driven Architecture

### 5.1 Entity Change Events

**Subscription Pattern:**
```javascript
// Frontend component subscribes to entity changes
useEffect(() => {
  const unsubscribe = base44.entities.Recognition.subscribe((event) => {
    if (event.type === 'create') {
      // New recognition posted
      setRecognitions(prev => [event.data, ...prev]);
      
      // Show toast notification
      if (event.data.recipient_email === user.email) {
        toast.success(`You received recognition from ${event.data.recognizer_name}!`);
      }
    }
  });
  
  return () => unsubscribe();
}, [user.email]);
```

**Event Types:**
- `create`: New record inserted
- `update`: Record modified
- `delete`: Record removed

**Use Cases:**
1. **Live Feed Updates**: Recognition feed updates without refresh
2. **Leaderboard Updates**: Real-time rank changes
3. **Notification Badges**: Unread count updates
4. **Collaborative Editing**: Multiple users editing same form

### 5.2 Automation Triggers

**Entity Automations:**
```yaml
# Defined in Base44 dashboard or via API
Automation:
  name: "Award Points on Recognition"
  entity_name: "Recognition"
  event_types: ["create"]
  function_name: "awardPoints"
  function_args:
    userEmail: "{{event.data.recipient_email}}"
    points: 50
    reason: "Recognition received"
```

**Scheduled Automations:**
```yaml
Automation:
  name: "Daily Gamification Rules"
  schedule_type: "cron"
  cron_expression: "0 0 * * *"  # Daily at midnight UTC
  function_name: "executeGamificationRules"
```

---

## 6. Real-Time Data Flow

### 6.1 WebSocket Architecture

```
Client (Browser)
    ↓
WebSocket Connection (wss://)
    ↓
Base44 Real-Time Server
    ↓
Subscribe to Entity Changes
    ↓
PostgreSQL Listen/Notify
    ↓
Entity INSERT/UPDATE/DELETE
    ↓
Trigger Notification
    ↓
WebSocket Server Broadcasts
    ↓
All Subscribed Clients Receive Update
```

### 6.2 Subscription Scoping

**User-Scoped:**
```javascript
// Only receive events relevant to current user
base44.entities.Notification.subscribe((event) => {
  // Filter on server: WHERE user_email = current_user
});
```

**Global:**
```javascript
// Receive all recognition posts
base44.entities.Recognition.subscribe((event) => {
  if (event.data.visibility === 'public') {
    // Update feed
  }
});
```

### 6.3 Conflict Resolution

**Optimistic Updates:**
```javascript
const mutation = useMutation({
  mutationFn: updateUserProfile,
  onMutate: async (newData) => {
    // Optimistically update UI
    queryClient.setQueryData(['profile'], (old) => ({ ...old, ...newData }));
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['profile'], context.previousProfile);
    toast.error('Update failed, changes reverted');
  }
});
```

**Last-Write-Wins:**
```
User A updates field at T1 → Success
User B updates field at T2 → Success (overwrites A's change)
User A's UI updates via WebSocket with B's value
```

---

## 7. Authentication Flow

### 7.1 SSO Login Sequence

```
┌──────┐                 ┌─────┐                ┌────────┐
│Client│                 │Base44│               │SSO (Azure AD)│
└──┬───┘                 └──┬──┘                └───┬────┘
   │                        │                       │
   │ 1. Visit /login        │                       │
   ├───────────────────────►│                       │
   │                        │                       │
   │ 2. Redirect to SSO     │                       │
   │◄───────────────────────┤                       │
   │                        │                       │
   │ 3. User authenticates  │                       │
   ├────────────────────────┼──────────────────────►│
   │                        │                       │
   │ 4. SAML assertion      │                       │
   │◄───────────────────────┼───────────────────────┤
   │                        │                       │
   │ 5. Exchange for token  │                       │
   ├───────────────────────►│                       │
   │                        │                       │
   │ 6. Create session      │                       │
   │                        ├─ Set cookie (httpOnly)│
   │                        │                       │
   │ 7. Return session      │                       │
   │◄───────────────────────┤                       │
   │                        │                       │
   │ 8. Fetch user profile  │                       │
   ├───────────────────────►│                       │
   │                        │                       │
   │ 9. User data           │                       │
   │◄───────────────────────┤                       │
   │                        │                       │
   │ 10. Redirect to /DawnHub                       │
   │◄───────────────────────┤                       │
```

### 7.2 Session Management

**Session Cookie:**
```
Name: base44_session
Value: encrypted_token
Attributes:
  - HttpOnly: true (prevents XSS)
  - Secure: true (HTTPS only)
  - SameSite: Lax (CSRF protection)
  - MaxAge: 28800 (8 hours)
```

**Token Refresh:**
```javascript
// Automatic refresh before expiry
setInterval(() => {
  if (sessionExpiresIn < 5 * 60) { // 5 minutes
    base44.auth.refreshSession();
  }
}, 60 * 1000); // Check every minute
```

**Logout Flow:**
```
User clicks Logout
    ↓
base44.auth.logout()
    ↓
Clear session cookie
    ↓
Clear React Query cache
    ↓
Redirect to SSO logout URL
    ↓
SSO clears session
    ↓
Redirect to /landing
```

---

## 8. Notification Pipelines

### 8.1 Multi-Channel Notification Flow

```
Event Trigger (e.g., Recognition Created)
    ↓
┌─────────────────────────────────┐
│ Notification Decision Engine    │
│ - Check user preferences        │
│ - Determine channels            │
│ - Rate limit check              │
└────────┬────────────────────────┘
         │
    ┌────┴────┬─────────┬────────┐
    │         │         │        │
    ▼         ▼         ▼        ▼
┌───────┐ ┌──────┐ ┌──────┐ ┌────────┐
│Email  │ │Slack │ │Teams │ │In-App  │
│Queue  │ │API   │ │API   │ │WS      │
└───┬───┘ └──┬───┘ └──┬───┘ └───┬────┘
    │        │        │         │
    └────────┴────────┴─────────┘
              │
         User Receives
```

### 8.2 Notification Preferences

**User Settings:**
```javascript
{
  email: {
    recognition_received: true,
    event_reminder: true,
    survey_invitation: true,
    digest_weekly: true
  },
  slack: {
    recognition_received: true,
    event_reminder: false
  },
  in_app: {
    all: true  // Always show in-app
  }
}
```

**Channel Selection Logic:**
```javascript
async function sendNotification(userId, notificationType, data) {
  const prefs = await base44.entities.UserPreferences.get(userId);
  
  const channels = [];
  
  if (prefs.email[notificationType]) {
    channels.push(sendEmail(userId, data));
  }
  
  if (prefs.slack[notificationType]) {
    channels.push(sendSlack(userId, data));
  }
  
  // Always send in-app
  channels.push(createInAppNotification(userId, data));
  
  await Promise.all(channels);
}
```

---

## 9. Scheduled Jobs

### 9.1 Automation Schedule

| Function | Schedule | Purpose |
|----------|----------|---------|
| checkEventReminders | */5 * * * * (every 5 min) | Send event reminders |
| executeGamificationRules | 0 0 * * * (daily midnight) | Award streak bonuses, birthday badges |
| calculateLeaderboard | 0 * * * * (hourly) | Update leaderboard cache |
| weeklyDigestEngine | 0 9 * * 1 (Mon 9am) | Send weekly digest emails |
| aggregateAnalytics | 0 2 * * * (daily 2am) | Pre-calculate analytics |
| cleanupOldData | 0 3 * * 0 (Sun 3am) | Archive old events, surveys |

### 9.2 Job Orchestration

**Dependency Management:**
```
aggregateAnalytics
    ├─ Depends on: All users' daily data
    ├─ Runs: After midnight (all data for previous day)
    └─ Triggers: Email reports (if configured)

weeklyDigestEngine
    ├─ Depends on: aggregateAnalytics complete
    ├─ Runs: Monday 9am
    └─ Uses: Cached analytics from previous week
```

**Failure Handling:**
```javascript
async function robustScheduledFunction() {
  try {
    await executeTask();
  } catch (error) {
    console.error('Scheduled job failed:', error);
    
    // Log to error tracking
    await logError(error);
    
    // Retry after delay
    setTimeout(() => executeTask(), 5 * 60 * 1000); // 5 min
    
    // Alert on-call if critical
    if (isCritical) {
      await sendAlert(error);
    }
  }
}
```

---

## 10. Troubleshooting

### 10.1 Common Integration Issues

**Issue: Recognition not appearing in feed**

**Diagnosis:**
```
1. Check: Is recognition created? (DB query)
   SELECT * FROM Recognition WHERE id = ?;

2. Check: WebSocket connected?
   console.log('WS Status:', base44.realtime.status);

3. Check: User subscribed to entity?
   // Look for subscription in browser console

4. Check: Visibility setting
   // Ensure recognition.visibility = 'public'
```

**Resolution:**
```javascript
// Force refetch if subscription failed
queryClient.invalidateQueries(['recognition']);

// Or reconnect WebSocket
base44.realtime.reconnect();
```

---

**Issue: Points not updating after event attendance**

**Diagnosis:**
```
1. Check: Participation record created?
   SELECT * FROM Participation WHERE event_id = ? AND user_email = ?;

2. Check: Participation.attendance_status = 'attended'?

3. Check: Gamification automation running?
   // Look in Base44 dashboard → Automations

4. Check: UserPoints entity updated?
   SELECT * FROM UserPoints WHERE user_email = ?;
```

**Resolution:**
```javascript
// Manually trigger points award
await base44.functions.invoke('awardPoints', {
  userEmail: user.email,
  points: 10,
  reason: 'Event attendance (manual)'
});
```

---

**Issue: Calendar sync not working**

**Diagnosis:**
```
1. Check: User authorized Google Calendar?
   // Settings → Integrations → Google Calendar

2. Check: Connector access token valid?
   const token = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
   console.log('Token:', token);

3. Check: Function logs
   // Base44 Dashboard → Functions → syncToGoogleCalendar → Logs

4. Check: Google API quota
   // Google Cloud Console → API & Services → Quotas
```

**Resolution:**
```javascript
// Re-authorize connector
await base44.connectors.authorize('googlecalendar', {
  scopes: ['https://www.googleapis.com/auth/calendar.events']
});
```

---

### 10.2 Debugging Tools

**React Query DevTools:**
```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

**Base44 SDK Logging:**
```javascript
// Enable debug mode
base44.debug(true);

// All API calls logged to console
```

**Network Monitoring:**
```javascript
// Intercept all fetch requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args[0]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status);
  return response;
};
```

---

### 10.3 Health Checks

**Frontend Health:**
```javascript
// Check API connectivity
async function healthCheck() {
  const checks = {
    api: false,
    auth: false,
    realtime: false
  };
  
  try {
    const user = await base44.auth.me();
    checks.auth = !!user;
  } catch (e) {
    checks.auth = false;
  }
  
  try {
    await base44.entities.User.list();
    checks.api = true;
  } catch (e) {
    checks.api = false;
  }
  
  checks.realtime = base44.realtime.isConnected();
  
  return checks;
}
```

**Backend Health:**
```javascript
// functions/health.js
export default async function(req) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {}
  };
  
  // Check database
  try {
    await base44.entities.User.list();
    health.checks.database = 'ok';
  } catch (e) {
    health.checks.database = 'error';
    health.status = 'unhealthy';
  }
  
  // Check external APIs
  health.checks.openai = await pingOpenAI();
  health.checks.slack = await pingSlack();
  
  return Response.json(health);
}
```

---

**Document Maintenance:**
- Update diagrams when architecture changes
- Document new integrations as they're added
- Keep troubleshooting section current with known issues
- Review quarterly for accuracy

**Next Review:** 2026-04-22