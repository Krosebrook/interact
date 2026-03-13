# Database Documentation — Interact Platform

**Database:** Base44 Managed Database  
**Access:** Base44 SDK (`Query.*` entity operations)  
**Entity Count:** 39  
**Schema Source:** `src/models/schema.json`  
**Last Updated:** March 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Summary](#2-entity-summary)
3. [Entity Definitions](#3-entity-definitions)
4. [Entity Relationships](#4-entity-relationships)
5. [Access Patterns](#5-access-patterns)

---

## 1. Overview

All application data is stored in the **Base44 managed database**, a fully managed cloud database accessible exclusively via the Base44 SDK. There is no direct SQL access.

### Key Properties

- **No migrations required:** Schema changes are applied via the Base44 SDK
- **Access method:** `Query.<EntityName>.<operation>()`
- **Auth enforcement:** Entity-level read/write rules enforced by Base44
- **Timestamps:** Base44 automatically manages `created_at` / `updated_at` for all records

---

## 2. Entity Summary

| # | Entity | Domain | Description |
|---|---|---|---|
| 1 | Activity | Activities | Team activities catalog |
| 2 | ActivityPreference | Activities | User preference scores per activity |
| 3 | ActivityModule | Activities | Reusable activity building blocks |
| 4 | ActivityFavorite | Activities | User-favorited activities |
| 5 | Event | Events | Scheduled team events |
| 6 | Participation | Events | Event attendance records |
| 7 | EventMessage | Events | Live event chat/Q&A messages |
| 8 | BulkEventSchedule | Events | Bulk scheduling records |
| 9 | UserPoints | Gamification | Points, levels, streaks |
| 10 | Badge | Gamification | Badge definitions |
| 11 | BadgeAward | Gamification | User badge award records |
| 12 | PersonalChallenge | Gamification | Individual challenges |
| 13 | AchievementTier | Gamification | Tier definitions (Bronze → Diamond) |
| 14 | StoreItem | Gamification | Rewards store catalog |
| 15 | UserInventory | Gamification | User purchased items |
| 16 | AIInsight | AI | Facilitator AI insights |
| 17 | AIRecommendation | AI | Personalized user recommendations |
| 18 | AIGamificationSuggestion | AI | AI-suggested gamification actions |
| 19 | Team | Teams | Organization teams |
| 20 | TeamMembership | Teams | Team member/role records |
| 21 | TeamsConfig | Teams | Microsoft Teams integration config |
| 22 | UserProfile | Users | User profile data |
| 23 | UserOnboarding | Users | Onboarding progress |
| 24 | UserAvatar | Users | Avatar customization |
| 25 | Channel | Social | Communication channels |
| 26 | ChannelMessage | Social | Channel messages |
| 27 | Recognition | Social | Peer kudos and recognition |
| 28 | Notification | Social | User notification inbox |
| 29 | Announcement | Social | Platform-wide announcements |
| 30 | AnalyticsEvent | Analytics | Platform usage events |
| 31 | AuditLog | Analytics | Security / admin audit trail |
| 32 | KnowledgeBase | Knowledge | Articles and resources |
| 33 | LearningPathProgress | Knowledge | Learning path tracking |
| 34 | SkillTracking | Knowledge | Skill development progress |
| 35 | ModuleCompletion | Knowledge | Module completion records |
| 36 | Survey | Surveys | Pulse surveys |
| 37 | CharitableDonation | Charity | Point donation records |
| 38 | CharitableImpact | Charity | Charity impact aggregates |
| 39 | BuddyMatch | Onboarding | AI buddy matching |

---

## 3. Entity Definitions

### Activities Domain

#### Activity
**Description:** Catalog of team activities that can be scheduled as events.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `name` | string | Activity display name |
| `type` | string | Category: `game`, `workshop`, `icebreaker`, `team-building`, etc. |
| `description` | string | Full activity description |
| `duration` | number | Expected duration in minutes |
| `created_at` | datetime | Auto-set on creation |

**Used by:** Event (linked via `activity_id`), ActivityPreference, ActivityFavorite

---

#### ActivityPreference
**Description:** Stores a user's computed preference score for a given activity, used by the AI recommendation engine.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | User identifier |
| `activity_id` | string | FK → Activity.id |
| `preference_score` | number | Score 0–100 (higher = stronger preference) |

---

#### ActivityModule
**Description:** Reusable building blocks that compose into activities. Enables modular activity design.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `name` | string | Module name |
| `category` | string | Module category |
| `content` | object | Structured module content (JSON) |

---

#### ActivityFavorite
**Description:** Records when a user marks an activity as a favorite for quick access.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | User identifier |
| `activity_id` | string | FK → Activity.id |
| `created_at` | datetime | When the activity was favorited |

---

### Events Domain

#### Event
**Description:** A scheduled instance of an activity. The core scheduling entity.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `activity_id` | string | FK → Activity.id |
| `title` | string | Event display title |
| `start_time` | datetime | Event start (ISO 8601) |
| `end_time` | datetime | Event end (ISO 8601) |
| `status` | string | `scheduled` \| `active` \| `completed` \| `cancelled` |
| `facilitator_email` | string | Assigned facilitator |

**Indexes (recommended):** `status`, `start_time`, `facilitator_email`

---

#### Participation
**Description:** Tracks each user's participation in an event, including attendance status and points earned.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `event_id` | string | FK → Event.id |
| `participant_email` | string | Participant identifier |
| `status` | string | `registered` \| `attended` \| `no_show` \| `cancelled` |
| `points_earned` | number | Points awarded for attendance |

**Note:** One record per (event_id, participant_email) pair.

---

#### EventMessage
**Description:** Real-time messages sent during a live event (live Q&A, chat).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `event_id` | string | FK → Event.id |
| `author_email` | string | Message sender |
| `message` | string | Message text |
| `created_at` | datetime | Send timestamp |

---

#### BulkEventSchedule
**Description:** Records a bulk scheduling operation, allowing admins to create multiple events at once.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `created_by` | string | Creator email |
| `schedule_data` | object | JSON configuration for bulk creation |
| `status` | string | `pending` \| `processing` \| `completed` \| `failed` |

---

### Gamification Domain

#### UserPoints
**Description:** Central gamification record for each user — tracks total points, level, and engagement streaks.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | User identifier (unique per user) |
| `total_points` | number | Cumulative lifetime points |
| `level` | number | Current gamification level (1–N) |
| `streak_days` | number | Consecutive days of engagement |

**Note:** One record per user. Updated atomically via `awardPoints` function.

---

#### Badge
**Description:** Badge definition catalog — defines what badges are available and how to earn them.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `name` | string | Badge name |
| `description` | string | Earning criteria description |
| `icon` | string | Icon identifier or URL |
| `points_required` | number | Points threshold to auto-award (0 = manual only) |

---

#### BadgeAward
**Description:** Records that a specific user has been awarded a specific badge.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Award recipient |
| `badge_id` | string | FK → Badge.id |
| `awarded_at` | datetime | When the badge was awarded |

---

#### PersonalChallenge
**Description:** Individual user challenges generated by the AI or self-set.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Challenge owner |
| `challenge_type` | string | Type: `streak`, `attendance`, `recognition`, `learning`, etc. |
| `target` | number | Target value to complete the challenge |
| `progress` | number | Current progress toward target |
| `status` | string | `active` \| `completed` \| `failed` \| `abandoned` |

---

#### AchievementTier
**Description:** Defines the tier system (Bronze, Silver, Gold, Platinum, Diamond) with point thresholds and benefits.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `name` | string | Tier name (e.g., "Gold") |
| `level` | number | Numeric rank (1 = lowest) |
| `points_required` | number | Minimum points to reach this tier |
| `benefits` | array | List of perks for this tier |

---

#### StoreItem
**Description:** Items available in the point rewards store.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `name` | string | Item name |
| `description` | string | Item description |
| `points_cost` | number | Points required to purchase |
| `is_available` | boolean | Whether currently in stock |

---

#### UserInventory
**Description:** Tracks items a user has purchased from the rewards store.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Item owner |
| `store_item_id` | string | FK → StoreItem.id |
| `purchased_at` | datetime | Purchase timestamp |

---

### AI Domain

#### AIInsight
**Description:** AI-generated insights surfaced to facilitators — e.g., "Team engagement dropped 20% this week."

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `type` | string | Insight type: `burnout_risk`, `engagement_drop`, `top_performer`, etc. |
| `title` | string | Short insight headline |
| `content` | string | Full insight explanation |
| `priority` | string | `high` \| `medium` \| `low` |
| `status` | string | `new` \| `read` \| `dismissed` |

---

#### AIRecommendation
**Description:** Personalized activity recommendations generated by the AI engine for individual users.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Target user |
| `recommendation_type` | string | Type: `activity`, `event`, `learning`, `challenge` |
| `content` | object | Recommendation payload (JSON) |
| `confidence` | number | AI confidence score 0.0–1.0 |

---

#### AIGamificationSuggestion
**Description:** AI-suggested gamification actions to keep users engaged.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Target user |
| `suggestion_type` | string | Suggestion category |
| `details` | object | Suggestion details (JSON) |

---

### Teams Domain

#### Team
**Description:** An organizational team grouping users together.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `name` | string | Team name |
| `description` | string | Team description |
| `created_at` | datetime | Creation timestamp |

---

#### TeamMembership
**Description:** Links users to teams with their assigned role.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `team_id` | string | FK → Team.id |
| `user_email` | string | Member identifier |
| `role` | string | `member` \| `lead` \| `admin` |

**Note:** A user can be a member of multiple teams. One record per (team_id, user_email) pair.

---

#### TeamsConfig
**Description:** Per-team Microsoft Teams integration configuration.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `team_id` | string | FK → Team.id |
| `config_data` | object | MS Teams webhook URL, channel IDs, etc. |
| `enabled` | boolean | Integration active flag |

---

### Users Domain

#### UserProfile
**Description:** Extended user profile information beyond the Base44 auth user.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `email` | string | User email (unique, matches auth user) |
| `display_name` | string | User's preferred display name |
| `avatar_url` | string | Cloudinary avatar URL |
| `bio` | string | User bio |

---

#### UserOnboarding
**Description:** Tracks a user's progress through the onboarding journey.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | User identifier |
| `status` | string | `pending` \| `in_progress` \| `completed` |
| `completed_steps` | array | List of step IDs completed |
| `progress` | number | Percentage complete (0–100) |

---

#### UserAvatar
**Description:** Stores avatar customization data (separate from profile avatar_url for avatar builder features).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Owner identifier |
| `avatar_data` | object | Avatar builder configuration (JSON) |
| `updated_at` | datetime | Last customization timestamp |

---

### Social Domain

#### Channel
**Description:** A communication channel (similar to Slack channels) within the platform.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `name` | string | Channel name (e.g., `#general`) |
| `description` | string | Channel purpose |
| `type` | string | `public` \| `private` \| `team` \| `direct` |

---

#### ChannelMessage
**Description:** A message posted in a channel.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `channel_id` | string | FK → Channel.id |
| `author_email` | string | Message author |
| `content` | string | Message text (may include markdown) |
| `created_at` | datetime | Send timestamp |

---

#### Recognition
**Description:** A peer recognition (kudos) record — one employee recognizing another.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `from_email` | string | Recognizer email |
| `to_email` | string | Recipient email |
| `message` | string | Recognition message |
| `points_awarded` | number | Points awarded to recipient |

---

#### Notification
**Description:** In-app notification inbox for each user.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Recipient |
| `type` | string | Notification type: `badge`, `points`, `event`, `recognition`, etc. |
| `message` | string | Notification text |
| `read` | boolean | Read status (false = unread) |
| `created_at` | datetime | Creation timestamp |

---

#### Announcement
**Description:** Platform-wide announcements from admins.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `title` | string | Announcement headline |
| `content` | string | Full announcement body |
| `priority` | string | `high` \| `medium` \| `low` |
| `created_at` | datetime | Publication timestamp |

---

### Analytics Domain

#### AnalyticsEvent
**Description:** Immutable event stream for platform usage analytics. Every meaningful user action generates a record.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `event_type` | string | Event type: `page_view`, `activity_join`, `badge_earned`, etc. |
| `user_email` | string | Acting user |
| `metadata` | object | Event-specific payload (JSON) |
| `timestamp` | datetime | Event timestamp (high precision) |

**Note:** This table can grow large. Implement retention policy (e.g., archive after 12 months).

---

#### AuditLog
**Description:** Security-focused audit trail for administrative and sensitive actions.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `action` | string | Action identifier: `user_suspended`, `role_changed`, `points_awarded`, etc. |
| `user_email` | string | Actor (who performed the action) |
| `details` | object | Action details including target, before/after state |
| `timestamp` | datetime | Action timestamp |

**Note:** AuditLog records should be immutable (no updates/deletes).

---

### Knowledge Domain

#### KnowledgeBase
**Description:** Articles, guides, and resources in the organization's knowledge hub.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `title` | string | Article title |
| `content` | string | Full article content (markdown supported) |
| `category` | string | Content category |
| `tags` | array | Search/filter tags |

---

#### LearningPathProgress
**Description:** Tracks a user's progress through a structured learning path.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Learner identifier |
| `path_id` | string | Learning path identifier |
| `progress` | number | Percentage complete (0–100) |
| `completed` | boolean | Completion flag |

---

#### SkillTracking
**Description:** Tracks a user's development of specific skills over time.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | User identifier |
| `skill_name` | string | Skill name (e.g., "Public Speaking", "Python") |
| `level` | number | Skill level 1–5 |
| `last_practiced` | datetime | Last activity timestamp for this skill |

---

#### ModuleCompletion
**Description:** Records when a user completes a specific learning module.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Learner identifier |
| `module_id` | string | FK → ActivityModule.id |
| `completed_at` | datetime | Completion timestamp |
| `score` | number | Module assessment score 0–100 |

---

### Surveys Domain

#### Survey
**Description:** Pulse survey definition including questions and status.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `title` | string | Survey title |
| `questions` | array | Array of question objects `{ text, type, options }` |
| `status` | string | `draft` \| `active` \| `closed` |
| `created_at` | datetime | Creation timestamp |

---

### Charity Domain

#### CharitableDonation
**Description:** Records a user donating their earned points to a charitable cause.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | Donor identifier |
| `charity_name` | string | Target charity |
| `points_donated` | number | Points donated |
| `created_at` | datetime | Donation timestamp |

---

#### CharitableImpact
**Description:** Aggregated charitable impact per charity — total points donated and real-world impact narrative.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `charity_name` | string | Charity identifier |
| `total_points` | number | Aggregate points donated to this charity |
| `impact_description` | string | Human-readable impact narrative |

---

### Onboarding Domain

#### BuddyMatch
**Description:** Records an AI-generated buddy pairing between a new hire and an existing employee.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated UUID |
| `user_email` | string | New hire email |
| `buddy_email` | string | Matched buddy email |
| `match_score` | number | AI compatibility score 0.0–1.0 |
| `status` | string | `pending` \| `accepted` \| `declined` \| `active` |

---

## 4. Entity Relationships

```
UserProfile (1) ──────── (N) TeamMembership ──── (N) Team
UserProfile (1) ──────── (1) UserPoints
UserProfile (1) ──────── (N) BadgeAward ──────── (N) Badge
UserProfile (1) ──────── (N) Participation ───── (N) Event ─── (1) Activity
UserProfile (1) ──────── (N) ActivityFavorite ── (N) Activity
UserProfile (1) ──────── (N) ActivityPreference  (N) Activity
UserProfile (1) ──────── (N) Recognition (as sender or receiver)
UserProfile (1) ──────── (1) UserOnboarding
UserProfile (1) ──────── (1) BuddyMatch (as user or buddy)
Event (1) ──────────────── (N) EventMessage
Event (1) ──────────────── (N) Participation
Channel (1) ────────────── (N) ChannelMessage
Team (1) ───────────────── (1) TeamsConfig
StoreItem (1) ──────────── (N) UserInventory
```

---

## 5. Access Patterns

### Most Common Queries

```js
// User engagement summary
const userPoints = await Query.UserPoints.filter({ user_email: email });
const userBadges = await Query.BadgeAward.filter({ user_email: email });
const userNotifications = await Query.Notification.filter({ user_email: email, read: false });

// Leaderboard (top 10 by points)
const top10 = await Query.UserPoints.filter({}, { orderBy: 'total_points', order: 'desc', limit: 10 });

// Upcoming events
const upcoming = await Query.Event.filter({ status: 'scheduled' }, { orderBy: 'start_time', order: 'asc' });

// Team members
const members = await Query.TeamMembership.filter({ team_id: teamId });

// Recent recognition feed
const kudos = await Query.Recognition.filter({}, { orderBy: 'created_at', order: 'desc', limit: 20 });
```

### High-Volume Entities (Monitor Size)

| Entity | Growth Rate | Retention Policy |
|---|---|---|
| `AnalyticsEvent` | High (every user action) | Archive after 12 months |
| `ChannelMessage` | Medium (active channels) | Archive after 24 months |
| `Notification` | Medium | Delete read notifications after 90 days |
| `AuditLog` | Low-Medium | Retain 7 years (compliance) |
