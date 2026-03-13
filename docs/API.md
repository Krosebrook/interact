# API Reference — Interact Platform

**Last Updated:** March 2026  
**SDK:** Base44 SDK 0.8.3  
**Auth:** Token-based (Bearer JWT managed by Base44)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Entity CRUD Operations](#3-entity-crud-operations)
4. [Entity Reference](#4-entity-reference)
5. [Backend Functions Reference](#5-backend-functions-reference)
6. [Error Handling](#6-error-handling)

---

## 1. Overview

The Interact platform uses the **Base44 SDK** for all data operations. There is no custom REST API server — data access is abstracted through:

1. **Entity CRUD** — Direct database operations via `base44.entities.*`
2. **Serverless Functions** — Business logic invocations via `base44.functions.*`

All API communication is over HTTPS to the Base44 backend (`VITE_BASE44_BACKEND_URL`).

### Client Initialization

```js
// src/api/base44Client.js
import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

export const base44 = createClient({
  appId: appParams.appId,         // VITE_BASE44_APP_ID
  serverUrl: appParams.serverUrl, // VITE_BASE44_BACKEND_URL
  token: appParams.token,         // JWT from session/localStorage
  functionsVersion: appParams.functionsVersion,
  requiresAuth: false,            // App allows unauthenticated initial load
});
```

### Entity and Auth Exports

```js
// src/api/entities.js
import { base44 } from './base44Client';

export const Query = base44.entities.Query;
export const User  = base44.auth;
```

---

## 2. Authentication

### Login

```js
import { User } from '@/api/entities';

// Redirect to Base44 hosted login page
User.login();

// Get current authenticated user
const currentUser = await User.me();
```

### Logout

```js
await User.logout();
```

### Token Injection

The Base44 SDK automatically injects `Authorization: Bearer <token>` into all API requests. Token is persisted via `localStorage` by the SDK.

### Auth Context

```js
import { useAuth } from '@/lib/AuthContext';

const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
```

---

## 3. Entity CRUD Operations

All entities support the standard Base44 SDK CRUD interface.

### Standard Operations

```js
import { Query } from '@/api/entities';

// ── READ ───────────────────────────────────────────────

// Fetch all records
const activities = await Query.Activity.list();

// Filter records
const events = await Query.Event.filter({ status: 'active' });

// Filter with ordering
const leaderboard = await Query.UserPoints.filter(
  {},
  { orderBy: 'total_points', order: 'desc', limit: 10 }
);

// Get single record by ID
const activity = await Query.Activity.get('record_id');

// ── CREATE ─────────────────────────────────────────────

const newActivity = await Query.Activity.create({
  name: 'Team Trivia',
  type: 'game',
  description: 'Weekly team trivia session',
  duration: 60,
});

// ── UPDATE ─────────────────────────────────────────────

const updated = await Query.Event.update('record_id', {
  status: 'completed',
});

// ── DELETE ─────────────────────────────────────────────

await Query.Activity.delete('record_id');
```

### Usage with TanStack Query

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Query } from '@/api/entities';

// Read
export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => Query.Activity.list(),
    staleTime: 5 * 60 * 1000,
  });
};

// Write
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => Query.Activity.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
};
```

---

## 4. Entity Reference

All 39 application entities with their fields and descriptions.

### Activity

**Description:** Team activities and events

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Activity name |
| `type` | string | Activity type (game, workshop, etc.) |
| `description` | string | Activity description |
| `duration` | number | Duration in minutes |
| `created_at` | datetime | Creation timestamp |

```js
Query.Activity.list()
Query.Activity.filter({ type: 'game' })
Query.Activity.create({ name, type, description, duration })
Query.Activity.update(id, { name })
Query.Activity.delete(id)
```

---

### ActivityPreference

**Description:** User activity preferences and favorites

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | User email |
| `activity_id` | string | Related activity ID |
| `preference_score` | number | Preference score (0–100) |

---

### ActivityModule

**Description:** Modular activity components

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Module name |
| `category` | string | Module category |
| `content` | object | Module content data |

---

### ActivityFavorite

**Description:** User favorited activities

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | User email |
| `activity_id` | string | Favorited activity ID |
| `created_at` | datetime | When favorited |

---

### Event

**Description:** Scheduled team events

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `activity_id` | string | Associated activity |
| `title` | string | Event title |
| `start_time` | datetime | Event start time |
| `end_time` | datetime | Event end time |
| `status` | string | `scheduled` \| `active` \| `completed` \| `cancelled` |
| `facilitator_email` | string | Facilitator email |

---

### Participation

**Description:** Event participation records

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `event_id` | string | Related event |
| `participant_email` | string | Participant email |
| `status` | string | `registered` \| `attended` \| `no_show` |
| `points_earned` | number | Points earned for attending |

---

### UserPoints

**Description:** User gamification points

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | User email |
| `total_points` | number | Cumulative points |
| `level` | number | Current level |
| `streak_days` | number | Current daily streak |

---

### Badge

**Description:** Achievement badges

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Badge name |
| `description` | string | Badge description |
| `icon` | string | Icon identifier or URL |
| `points_required` | number | Points required to earn |

---

### BadgeAward

**Description:** User badge awards

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Award recipient |
| `badge_id` | string | Awarded badge |
| `awarded_at` | datetime | Award timestamp |

---

### AIInsight

**Description:** AI-generated insights for facilitators

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `type` | string | Insight type |
| `title` | string | Insight title |
| `content` | string | Insight content |
| `priority` | string | `high` \| `medium` \| `low` |
| `status` | string | `new` \| `read` \| `dismissed` |

---

### AIRecommendation

**Description:** Personalized AI activity recommendations

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Target user |
| `recommendation_type` | string | Type of recommendation |
| `content` | object | Recommendation data |
| `confidence` | number | Confidence score (0–1) |

---

### AIGamificationSuggestion

**Description:** AI-powered gamification suggestions

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Target user |
| `suggestion_type` | string | Suggestion category |
| `details` | object | Suggestion details |

---

### Team

**Description:** Organization teams

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Team name |
| `description` | string | Team description |
| `created_at` | datetime | Creation timestamp |

---

### TeamMembership

**Description:** Team membership records

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `team_id` | string | Parent team |
| `user_email` | string | Member email |
| `role` | string | `member` \| `lead` \| `admin` |

---

### UserProfile

**Description:** User profile information

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `email` | string | User email (unique) |
| `display_name` | string | Display name |
| `avatar_url` | string | Avatar image URL |
| `bio` | string | User bio |

---

### UserOnboarding

**Description:** User onboarding progress tracking

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | User email |
| `status` | string | `pending` \| `in_progress` \| `completed` |
| `completed_steps` | array | List of completed step IDs |
| `progress` | number | Progress percentage (0–100) |

---

### Survey

**Description:** Pulse surveys and feedback

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `title` | string | Survey title |
| `questions` | array | Survey questions array |
| `status` | string | `draft` \| `active` \| `closed` |
| `created_at` | datetime | Creation timestamp |

---

### Recognition

**Description:** Peer recognition and kudos

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `from_email` | string | Recognizer email |
| `to_email` | string | Recipient email |
| `message` | string | Recognition message |
| `points_awarded` | number | Points awarded with recognition |

---

### Notification

**Description:** User notifications

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Recipient email |
| `type` | string | Notification type |
| `message` | string | Notification text |
| `read` | boolean | Read status |
| `created_at` | datetime | Creation timestamp |

---

### Channel

**Description:** Team communication channels

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Channel name |
| `description` | string | Channel description |
| `type` | string | `public` \| `private` \| `team` |

---

### ChannelMessage

**Description:** Channel messages

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `channel_id` | string | Parent channel |
| `author_email` | string | Message author |
| `content` | string | Message content |
| `created_at` | datetime | Message timestamp |

---

### StoreItem

**Description:** Point store items and rewards

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Item name |
| `description` | string | Item description |
| `points_cost` | number | Points required to purchase |
| `is_available` | boolean | Whether item is in stock |

---

### UserInventory

**Description:** User purchased items

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Owner email |
| `store_item_id` | string | Purchased item |
| `purchased_at` | datetime | Purchase timestamp |

---

### BuddyMatch

**Description:** AI-powered buddy matching

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | User email |
| `buddy_email` | string | Matched buddy email |
| `match_score` | number | Match score (0–1) |
| `status` | string | `pending` \| `accepted` \| `declined` |

---

### AnalyticsEvent

**Description:** Platform analytics events

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `event_type` | string | Event type (e.g., `page_view`, `activity_join`) |
| `user_email` | string | Acting user |
| `metadata` | object | Event-specific metadata |
| `timestamp` | datetime | Event timestamp |

---

### Announcement

**Description:** Platform announcements

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `title` | string | Announcement title |
| `content` | string | Announcement body |
| `priority` | string | `high` \| `medium` \| `low` |
| `created_at` | datetime | Creation timestamp |

---

### AuditLog

**Description:** System audit logs

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `action` | string | Action performed |
| `user_email` | string | Actor email |
| `details` | object | Action details |
| `timestamp` | datetime | Action timestamp |

---

### KnowledgeBase

**Description:** Learning resources and knowledge base articles

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `title` | string | Article title |
| `content` | string | Article content |
| `category` | string | Article category |
| `tags` | array | Search tags |

---

### LearningPathProgress

**Description:** User learning path progress

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Learner email |
| `path_id` | string | Learning path ID |
| `progress` | number | Progress percentage |
| `completed` | boolean | Completion status |

---

### SkillTracking

**Description:** User skill development tracking

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | User email |
| `skill_name` | string | Skill name |
| `level` | number | Skill level (1–5) |
| `last_practiced` | datetime | Last practice timestamp |

---

### PersonalChallenge

**Description:** Personal gamification challenges

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Challenge owner |
| `challenge_type` | string | Challenge category |
| `target` | number | Target value |
| `progress` | number | Current progress |
| `status` | string | `active` \| `completed` \| `failed` |

---

### AchievementTier

**Description:** Achievement tier definitions

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Tier name (Bronze, Silver, Gold, etc.) |
| `level` | number | Numeric level |
| `points_required` | number | Points to reach this tier |
| `benefits` | array | List of tier benefits |

---

### EventMessage

**Description:** Event-specific live messages (live Q&A, chat)

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `event_id` | string | Parent event |
| `author_email` | string | Message author |
| `message` | string | Message content |
| `created_at` | datetime | Message timestamp |

---

### BulkEventSchedule

**Description:** Bulk event scheduling records

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `created_by` | string | Creator email |
| `schedule_data` | object | Bulk schedule configuration |
| `status` | string | `pending` \| `processing` \| `completed` |

---

### CharitableDonation

**Description:** Charitable point donations

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Donor email |
| `charity_name` | string | Charity name |
| `points_donated` | number | Points donated |
| `created_at` | datetime | Donation timestamp |

---

### CharitableImpact

**Description:** Charitable impact tracking

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `charity_name` | string | Charity name |
| `total_points` | number | Total points received |
| `impact_description` | string | Impact narrative |

---

### UserAvatar

**Description:** User avatar customization

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Owner email |
| `avatar_data` | object | Avatar configuration JSON |
| `updated_at` | datetime | Last update timestamp |

---

### ModuleCompletion

**Description:** Learning module completion records

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `user_email` | string | Learner email |
| `module_id` | string | Completed module ID |
| `completed_at` | datetime | Completion timestamp |
| `score` | number | Module score (0–100) |

---

### TeamsConfig

**Description:** Microsoft Teams integration configuration

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `team_id` | string | MS Teams team identifier |
| `config_data` | object | Integration configuration |
| `enabled` | boolean | Whether integration is active |

---

## 5. Backend Functions Reference

Backend serverless functions are invoked via the Base44 SDK's functions interface. They run TypeScript on the Base44 serverless infrastructure.

### AI & LLM Functions

| Function | Description |
|---|---|
| `generatePersonalizedRecommendations` | AI activity recommendations based on user history |
| `aiEventPlanningAssistant` | AI-powered event planning suggestions |
| `aiCoachingRecommendations` | Personalized coaching nudges |
| `aiOnboardingAssistant` | AI-guided onboarding flow |
| `aiBuddyMatcher` | AI matching for buddy program |
| `aiGamificationRuleOptimizer` | Optimize gamification rules per cohort |
| `aiTeamChallengeGenerator` | Generate custom team challenges |
| `aiContentGenerator` | Generate learning content and quizzes |
| `aiChatbotAssistant` | In-app AI chatbot |
| `generateAIInsights` | Facilitator insights from event data |
| `analyzeBurnoutRisk` | Predict burnout risk from engagement signals |
| `predictChurnRisk` | Predict disengagement risk |

### Analytics Functions

| Function | Description |
|---|---|
| `aggregateAnalytics` | Aggregate platform-wide analytics |
| `advancedAnalytics` | Advanced cohort analytics |
| `lifecycleAnalytics` | Employee lifecycle stage analytics |
| `predictiveAnalytics` | Predictive engagement forecasting |
| `aggregateSurveyResults` | Aggregate survey response data |
| `aggregateLeaderboardScores` | Compute leaderboard rankings |
| `getTeamAnalytics` | Team-level performance analytics |
| `getTeamLeaderboardStats` | Team leaderboard statistics |
| `abTestEngine` / `abTestAIAnalyzer` | A/B testing framework |

### Gamification Functions

| Function | Description |
|---|---|
| `awardPoints` | Award points to a user |
| `detectMilestones` | Check and award milestone badges |
| `processGamificationRules` | Run gamification rule engine |
| `purchaseWithPoints` | Handle point store purchases |
| `redeemReward` | Process reward redemption |
| `awardBadgeForActivity` | Award badge on activity completion |
| `awardDynamicBadges` | AI-determined dynamic badge awards |
| `recordPointsTransaction` | Log a points transaction |

### Notification Functions

| Function | Description |
|---|---|
| `triggerPersonalizedNotifications` | Send personalized user notifications |
| `processReminders` | Process scheduled reminders |
| `weeklyDigestEngine` | Generate and send weekly digest emails |
| `sendGoalReminders` | Send goal progress reminder nudges |
| `recurringEventReminders` | Handle recurring event reminders |

### Integration Functions

| Function | Description |
|---|---|
| `slackNotifications` | Send notifications to Slack |
| `sendTeamsNotification` | Send Microsoft Teams notifications |
| `googleCalendarSync` | Sync events to Google Calendar |
| `sendCalendarInvite` | Send calendar invite emails |
| `hubspotIntegration` | Sync with HubSpot CRM |
| `notionIntegration` | Sync knowledge base with Notion |
| `zapierIntegration` | Zapier webhook handler |
| `syncFitbitData` | Import Fitbit wellness data |

### User Management Functions

| Function | Description |
|---|---|
| `inviteUser` | Send user invitation |
| `manageUserRole` | Update user role/permissions |
| `suspendUser` | Suspend a user account |
| `updateUserRole` | Assign user to RBAC role |
| `testRBACEnforcement` | Validate RBAC rules |

---

## 6. Error Handling

### Base44 SDK Errors

```js
try {
  const data = await Query.Activity.create(payload);
} catch (error) {
  if (error.status === 401) {
    // Token expired — SDK will attempt refresh
  } else if (error.status === 403) {
    // Insufficient permissions
  } else if (error.status === 422) {
    // Validation error — check error.details
  } else {
    // Generic error
    console.error('API error:', error.message);
  }
}
```

### TanStack Query Error States

```jsx
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['activities'],
  queryFn: () => Query.Activity.list(),
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});

if (isError) {
  return <ErrorMessage message={error.message} />;
}
```
