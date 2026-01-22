# Backend Functions Reference
## INTeract Platform - Complete Function Documentation

**Version:** 2.0  
**Last Updated:** 2026-01-22  
**Total Functions:** 87

---

## Table of Contents

1. [Function Categories](#function-categories)
2. [AI Functions](#ai-functions)
3. [Gamification Functions](#gamification-functions)
4. [Integration Functions](#integration-functions)
5. [Notification Functions](#notification-functions)
6. [Analytics Functions](#analytics-functions)
7. [Automation Functions](#automation-functions)
8. [Function Patterns](#function-patterns)
9. [Error Handling](#error-handling)
10. [Testing Guide](#testing-guide)

---

## Function Categories

| Category | Count | Purpose |
|----------|-------|---------|
| AI | 22 | AI-powered recommendations and content generation |
| Gamification | 15 | Points, badges, levels, rewards |
| Integration | 12 | External service connections (Slack, Google, etc.) |
| Notification | 10 | Email, Slack, Teams notifications |
| Analytics | 8 | Data aggregation and reporting |
| Automation | 7 | Scheduled tasks and workflows |
| Onboarding | 6 | New hire onboarding assistance |
| Other | 7 | Miscellaneous utilities |

---

## AI Functions

### aiCoachingRecommendations

**Purpose:** Generate personalized coaching tips for managers based on team data.

**Authentication:** Required (manager or admin)

**Parameters:**
```javascript
{
  teamLeaderEmail: string,     // Manager's email
  teamSize: number,            // Number of direct reports
  avgEngagement: number        // Team avg engagement score (0-100)
}
```

**Returns:**
```javascript
{
  recommendations: string[],   // Array of coaching tips
  priorities: string[],        // Priority focus areas
  insights: {
    strengths: string[],
    concerns: string[]
  }
}
```

**Example:**
```javascript
const response = await base44.functions.invoke('aiCoachingRecommendations', {
  teamLeaderEmail: 'manager@intinc.com',
  teamSize: 8,
  avgEngagement: 72
});

// Response:
{
  recommendations: [
    "Schedule 1:1s with Sarah and John - they haven't received recognition in 3 weeks",
    "Consider a team wellness challenge - engagement drops on Fridays",
    "Recognition is down 40% from last month - model giving kudos publicly"
  ],
  priorities: ["One-on-ones", "Team morale", "Recognition"],
  insights: {
    strengths: ["High collaboration", "Strong technical skills"],
    concerns: ["Burnout risk for 2 members", "Low cross-team engagement"]
  }
}
```

**Error Codes:**
- `401`: User not authenticated
- `403`: User not a manager or admin
- `404`: Team not found

---

### aiOnboardingAssistant

**Purpose:** Provide contextual onboarding guidance for new employees.

**Authentication:** Required

**Parameters:**
```javascript
{
  userEmail: string,           // New hire's email
  currentStep: string,         // Current onboarding step
  context: object              // Additional context (role, department)
}
```

**Returns:**
```javascript
{
  tip: string,                 // AI-generated tip
  nextSteps: string[],         // Recommended next actions
  resources: string[]          // Links to helpful resources
}
```

**Example:**
```javascript
const response = await base44.functions.invoke('aiOnboardingAssistant', {
  userEmail: 'newHire@intinc.com',
  currentStep: 'profile_setup',
  context: { role: 'Software Engineer', department: 'Engineering' }
});

// Response:
{
  tip: "Complete your profile with your technical skills to get matched with the right mentor and learning paths",
  nextSteps: [
    "Add at least 3 skills to your profile",
    "Join the #engineering channel",
    "RSVP to Friday's team social"
  ],
  resources: [
    "/LearningDashboard",
    "/Teams",
    "/Calendar"
  ]
}
```

---

### aiEventPlanningAssistant

**Purpose:** Suggest event themes, activities, and optimal times based on team preferences.

**Authentication:** Required (facilitator or admin)

**Parameters:**
```javascript
{
  eventType: string,           // 'social' | 'wellness' | 'learning'
  teamSize: number,
  duration: number,            // Minutes
  preferences: string[]        // Past successful event types
}
```

**Returns:**
```javascript
{
  theme: string,
  activities: string[],
  suggestedTimes: string[],    // ISO 8601 format
  materials: string[]          // Required materials/prep
}
```

**Example:**
```javascript
const response = await base44.functions.invoke('aiEventPlanningAssistant', {
  eventType: 'social',
  teamSize: 25,
  duration: 45,
  preferences: ['trivia', 'games']
});

// Response:
{
  theme: "90s Nostalgia Trivia Night",
  activities: [
    "Team-based trivia with 5 rounds",
    "Music identification bonus round",
    "Meme creation challenge"
  ],
  suggestedTimes: [
    "2026-01-30T15:00:00Z",
    "2026-01-31T16:00:00Z"
  ],
  materials: [
    "Trivia questions (provided)",
    "Zoom breakout rooms",
    "Google Slides for scoreboard"
  ]
}
```

---

### aiContentRecommendations

**Purpose:** Recommend learning content based on user skills and goals.

**Authentication:** Required

**Parameters:**
```javascript
{
  userEmail: string,
  currentSkills: string[],
  careerGoals: string[]
}
```

**Returns:**
```javascript
{
  courses: Array<{
    title: string,
    provider: string,
    relevance: number,         // 0-100
    estimatedHours: number
  }>,
  learningPaths: string[]
}
```

---

### aiRecognitionDraft

**Purpose:** Generate recognition message suggestions.

**Authentication:** Required

**Parameters:**
```javascript
{
  recipientEmail: string,
  context: string,             // What they did
  tone: 'casual' | 'formal'
}
```

**Returns:**
```javascript
{
  suggestions: string[]        // 3-5 pre-written messages
}
```

**Example:**
```javascript
const response = await base44.functions.invoke('aiRecognitionDraft', {
  recipientEmail: 'developer@intinc.com',
  context: 'fixed critical bug in production',
  tone: 'casual'
});

// Response:
{
  suggestions: [
    "🔥 Props to you for jumping on that production bug so quickly! Your debugging skills saved the day.",
    "Thank you for the quick fix on the critical issue - your attention to detail is incredible!",
    "Huge shoutout for handling the production incident with such professionalism and speed!"
  ]
}
```

---

## Gamification Functions

### awardPoints

**Purpose:** Manually award points to a user (admin only).

**Authentication:** Required (admin)

**Parameters:**
```javascript
{
  userEmail: string,
  points: number,              // Can be negative for deductions
  reason: string,
  category: string             // 'bonus' | 'penalty' | 'adjustment'
}
```

**Returns:**
```javascript
{
  success: boolean,
  newBalance: number,
  newLevel: number
}
```

**Example:**
```javascript
const response = await base44.functions.invoke('awardPoints', {
  userEmail: 'employee@intinc.com',
  points: 500,
  reason: 'Exceptional Q4 performance',
  category: 'bonus'
});

// Response:
{
  success: true,
  newBalance: 15750,
  newLevel: 18
}
```

---

### executeGamificationRules

**Purpose:** Process automated gamification rules (runs on schedule).

**Authentication:** System (no user auth required)

**Parameters:**
```javascript
{
  ruleType: string,            // 'streak_bonus' | 'birthday' | 'anniversary'
  batchSize: number            // Optional, default 100
}
```

**Returns:**
```javascript
{
  processed: number,
  pointsAwarded: number,
  badgesUnlocked: number,
  errors: number
}
```

**Scheduled:** Daily at 12:00 AM UTC

**Example:**
```javascript
// Called by automation
const response = await base44.functions.invoke('executeGamificationRules', {
  ruleType: 'streak_bonus',
  batchSize: 500
});

// Response:
{
  processed: 487,
  pointsAwarded: 4870,        // 10 points per user
  badgesUnlocked: 23,         // "7-day streak" badges
  errors: 0
}
```

---

### calculateLeaderboard

**Purpose:** Aggregate and rank users for leaderboards.

**Authentication:** System or admin

**Parameters:**
```javascript
{
  leaderboardType: string,     // 'company' | 'department' | 'team'
  timeframe: string,           // 'week' | 'month' | 'alltime'
  department: string           // Required if type = 'department'
}
```

**Returns:**
```javascript
{
  rankings: Array<{
    rank: number,
    userEmail: string,
    userName: string,
    points: number,
    level: number,
    avatar: string
  }>,
  updatedAt: string
}
```

---

### awardBadge

**Purpose:** Award a badge to a user when criteria met.

**Authentication:** System or admin

**Parameters:**
```javascript
{
  userEmail: string,
  badgeId: string,
  earnedDate: string           // ISO 8601
}
```

**Returns:**
```javascript
{
  success: boolean,
  badgeDetails: object
}
```

---

### redeemReward

**Purpose:** Process reward redemption request.

**Authentication:** Required

**Parameters:**
```javascript
{
  userEmail: string,
  rewardId: string,
  quantity: number
}
```

**Returns:**
```javascript
{
  success: boolean,
  redemptionId: string,
  approvalRequired: boolean,
  newBalance: number
}
```

**Workflow:**
1. Verify user has enough points
2. Check reward availability
3. Create redemption record
4. Deduct points
5. Trigger approval workflow (if required)
6. Send notification

---

## Integration Functions

### sendSlackEventNotification

**Purpose:** Send event reminder to Slack channel.

**Authentication:** System or facilitator

**Parameters:**
```javascript
{
  eventId: string,
  channel: string,             // '#general' or channel ID
  timeBeforeEvent: string      // '1hour' | '24hours'
}
```

**Returns:**
```javascript
{
  success: boolean,
  messageId: string            // Slack message ID
}
```

**Example:**
```javascript
const response = await base44.functions.invoke('sendSlackEventNotification', {
  eventId: 'evt_abc123',
  channel: '#social-events',
  timeBeforeEvent: '1hour'
});

// Sends to Slack:
"🎉 Reminder: Trivia Night starts in 1 hour!
📅 Today at 3:00 PM
🔗 Join here: [Zoom Link]
✅ 23 people are coming!"
```

---

### syncToGoogleCalendar

**Purpose:** Sync event to user's Google Calendar.

**Authentication:** Required (requires Google Calendar connector)

**Parameters:**
```javascript
{
  eventId: string,
  userEmail: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  calendarEventId: string,     // Google Calendar event ID
  calendarLink: string
}
```

**Prerequisites:**
- User must have authorized Google Calendar connector
- App must have `googlecalendar` connector configured

---

### stripeWebhook

**Purpose:** Handle Stripe payment webhooks for reward purchases.

**Authentication:** Webhook signature verification

**Parameters:**
```javascript
// Sent by Stripe, not invoked directly
{
  type: string,                // 'checkout.session.completed'
  data: object
}
```

**Webhook Events:**
- `checkout.session.completed`: Reward purchased
- `charge.refunded`: Reward refunded

**Security:**
```javascript
// Signature verification
const signature = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEventAsync(
  body,
  signature,
  STRIPE_SIGNING_SECRET
);
```

---

### googleCalendarSync

**Purpose:** Bulk sync all upcoming events to Google Calendar.

**Authentication:** Required (admin)

**Parameters:**
```javascript
{
  syncFutureDays: number       // Sync events in next N days
}
```

**Returns:**
```javascript
{
  synced: number,
  failed: number,
  errors: string[]
}
```

---

## Notification Functions

### sendRecognitionEmail

**Purpose:** Send email notification when user receives recognition.

**Authentication:** System

**Parameters:**
```javascript
{
  recipientEmail: string,
  recognizerName: string,
  message: string,
  recognitionUrl: string       // Link to full post
}
```

**Returns:**
```javascript
{
  success: boolean,
  emailId: string              // SendGrid email ID
}
```

**Email Template:**
```html
Subject: You received recognition! 🎉

Hi [Name],

[RecognizerName] recognized you:

"[Message]"

View full recognition: [Link]

Keep up the great work!
```

---

### sendEventReminder

**Purpose:** Send automated event reminders.

**Authentication:** System

**Parameters:**
```javascript
{
  eventId: string,
  reminderType: '24hour' | '1hour' | '5min'
}
```

**Returns:**
```javascript
{
  sent: number,                // Number of emails sent
  failed: number
}
```

**Automation:** Triggered by `checkEventReminders` scheduled function

---

### sendSurveyInvitation

**Purpose:** Invite users to complete a pulse survey.

**Authentication:** System or HR admin

**Parameters:**
```javascript
{
  surveyId: string,
  targetUsers: string[],       // Array of emails
  dueDate: string
}
```

**Returns:**
```javascript
{
  sent: number,
  skipped: number,             // Already completed
  errors: number
}
```

---

### sendTeamsNotification

**Purpose:** Send notification to Microsoft Teams.

**Authentication:** System

**Parameters:**
```javascript
{
  userEmail: string,
  message: string,
  actionUrl: string            // Optional deep link
}
```

**Returns:**
```javascript
{
  success: boolean,
  activityId: string
}
```

---

## Analytics Functions

### generateEngagementReport

**Purpose:** Generate weekly engagement report for HR.

**Authentication:** Admin or HR role

**Parameters:**
```javascript
{
  startDate: string,           // ISO 8601
  endDate: string,
  department: string           // Optional filter
}
```

**Returns:**
```javascript
{
  summary: {
    dau: number,               // Daily active users
    wau: number,               // Weekly active users
    recognitionPosts: number,
    eventAttendance: number,
    surveyResponseRate: number
  },
  departmentBreakdown: Array<{
    department: string,
    engagementScore: number,
    trend: 'up' | 'down' | 'stable'
  }>,
  topRecognizers: Array<{
    userEmail: string,
    count: number
  }>,
  atRiskUsers: string[]        // Low engagement
}
```

---

### exportAnalytics

**Purpose:** Export analytics data to CSV.

**Authentication:** Admin

**Parameters:**
```javascript
{
  reportType: string,          // 'engagement' | 'recognition' | 'events'
  startDate: string,
  endDate: string,
  format: 'csv' | 'json'
}
```

**Returns:**
```javascript
{
  downloadUrl: string,         // Pre-signed S3 URL
  expiresIn: number,           // Seconds (3600)
  recordCount: number
}
```

---

### aggregateLeaderboardScores

**Purpose:** Pre-calculate leaderboard data for performance.

**Authentication:** System

**Parameters:**
```javascript
{
  timeframe: 'week' | 'month' | 'alltime'
}
```

**Returns:**
```javascript
{
  processed: number,
  cacheKey: string,
  ttl: number                  // Seconds
}
```

**Scheduled:** Hourly

---

## Automation Functions

### checkEventReminders

**Purpose:** Check for events needing reminders and trigger notifications.

**Authentication:** System

**Parameters:** None

**Returns:**
```javascript
{
  checked: number,             // Events checked
  reminders24h: number,        // Reminders sent (24hr)
  reminders1h: number,
  reminders5m: number
}
```

**Scheduled:** Every 5 minutes

**Logic:**
```javascript
const now = new Date();

// Find events needing 24hr reminder
const events24h = await base44.entities.Event.filter({
  scheduled_date: {
    $gte: now,
    $lte: addHours(now, 24)
  },
  reminder_24h_sent: false
});

// Send reminders and mark as sent
for (const event of events24h) {
  await sendEventReminder(event.id, '24hour');
  await base44.entities.Event.update(event.id, { reminder_24h_sent: true });
}
```

---

### processGamificationRules

**Purpose:** Execute all active gamification rules.

**Authentication:** System

**Parameters:** None

**Returns:**
```javascript
{
  rulesExecuted: number,
  pointsAwarded: number,
  badgesAwarded: number,
  errors: string[]
}
```

**Scheduled:** Daily at 00:00 UTC

---

### weeklyDigestEngine

**Purpose:** Generate personalized weekly digest emails.

**Authentication:** System

**Parameters:**
```javascript
{
  userEmail: string            // Or send to all users
}
```

**Returns:**
```javascript
{
  sent: number,
  content: {
    recognitionReceived: number,
    eventsAttended: number,
    pointsEarned: number,
    newBadges: string[],
    upcomingEvents: Array<object>
  }
}
```

**Scheduled:** Every Monday at 09:00 UTC

---

## Function Patterns

### Standard Function Structure

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export default async function handler(req) {
  try {
    // 1. Initialize Base44 client
    const base44 = createClientFromRequest(req);
    
    // 2. Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 3. Authorization check
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // 4. Parse request
    const { param1, param2 } = await req.json();
    
    // 5. Validate inputs
    if (!param1 || param1.length < 5) {
      return Response.json({ error: 'Invalid param1' }, { status: 400 });
    }
    
    // 6. Business logic
    const result = await processData(param1, param2);
    
    // 7. Return response
    return Response.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Function error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Service Role Pattern (Admin Operations)

```javascript
// Use service role for elevated permissions
const base44 = createClientFromRequest(req);

// Regular user operations
const userProfile = await base44.entities.UserProfile.get(userId);

// Admin operations (bypass user permissions)
const allProfiles = await base44.asServiceRole.entities.UserProfile.list();
```

### Rate Limiting Pattern

```javascript
const RATE_LIMIT = 100; // requests per minute
const rateLimitKey = `ratelimit:${user.email}`;

// Check rate limit (pseudo-code, actual implementation uses Redis)
const currentCount = await getRateLimitCount(rateLimitKey);
if (currentCount > RATE_LIMIT) {
  return Response.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}

await incrementRateLimitCount(rateLimitKey);
```

---

## Error Handling

### Standard Error Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | User not authenticated |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | External service down |

### Error Response Format

```javascript
{
  error: string,               // Human-readable message
  code: string,                // Error code (e.g., 'INVALID_INPUT')
  details: object,             // Additional context (optional)
  timestamp: string            // ISO 8601
}
```

### Retry Logic

```javascript
async function callExternalAPI(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      
      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      
      // Retry server errors (5xx)
      if (i === retries - 1) throw new Error('Max retries exceeded');
      
      // Exponential backoff
      await sleep(Math.pow(2, i) * 1000);
      
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

---

## Testing Guide

### Unit Testing Functions

```javascript
// test/functions/awardPoints.test.js
import { describe, it, expect, vi } from 'vitest';
import awardPoints from '../functions/awardPoints.js';

describe('awardPoints', () => {
  it('awards points to user', async () => {
    const req = createMockRequest({
      userEmail: 'test@intinc.com',
      points: 100,
      reason: 'Test'
    });
    
    const response = await awardPoints(req);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.newBalance).toBeGreaterThan(0);
  });
  
  it('rejects non-admin users', async () => {
    const req = createMockRequest({
      user: { role: 'user' },
      userEmail: 'test@intinc.com',
      points: 100
    });
    
    const response = await awardPoints(req);
    expect(response.status).toBe(403);
  });
});
```

### Integration Testing

```bash
# Test function with real payload
npm run test:function awardPoints '{
  "userEmail": "test@intinc.com",
  "points": 100,
  "reason": "Test"
}'
```

### Monitoring Functions

```javascript
// Add logging for observability
console.log('INFO: Function started', { functionName, user: user.email });
console.warn('WARN: Slow query detected', { query, duration });
console.error('ERROR: External API failed', { service, error });
```

---

**Document Maintenance:**

- Add new functions to appropriate category
- Update parameter/return schemas when changed
- Include real examples for complex functions
- Document breaking changes in CHANGELOG

**Next Review:** 2026-04-22