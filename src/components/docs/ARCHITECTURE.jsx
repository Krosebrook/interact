# Architecture Document
## Employee Engagement Platform

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CLIENT LAYER                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Desktop   │  │   Mobile    │  │   Tablet    │                 │   │
│  │  │   Browser   │  │   Browser   │  │   Browser   │                 │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │   │
│  │         └─────────────────┼─────────────────┘                       │   │
│  └───────────────────────────┼─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      APPLICATION LAYER                               │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    REACT APPLICATION                         │   │   │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │   │   │
│  │  │  │   Pages   │ │Components │ │  Hooks    │ │  Utils    │   │   │   │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │   │   │
│  │  │                                                              │   │   │
│  │  │  State Management: TanStack Query + React State             │   │   │
│  │  │  Routing: React Router                                      │   │   │
│  │  │  Styling: Tailwind CSS + shadcn/ui                         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API LAYER                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    BASE44 SDK                                │   │   │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │   │   │
│  │  │  │  Entities │ │ Functions │ │   Auth    │ │Integrations│   │   │   │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      BACKEND LAYER                                   │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Backend   │  │   Base44    │  │   External  │                 │   │
│  │  │  Functions  │  │   Database  │  │    APIs     │                 │   │
│  │  │   (Deno)    │  │             │  │             │                 │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │   │
│  │         │                │                │                         │   │
│  │         └────────────────┼────────────────┘                         │   │
│  │                          │                                          │   │
│  │  ┌───────────────────────┴───────────────────────┐                 │   │
│  │  │              INTEGRATIONS                      │                 │   │
│  │  │  Slack | Teams | Stripe | OpenAI | Calendar  │                 │   │
│  │  └───────────────────────────────────────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Directory Structure

```
├── pages/                      # Route pages (28+ pages)
│   ├── Dashboard.jsx           # Main admin dashboard
│   ├── Activities.jsx          # Activity library (15+ templates)
│   ├── Calendar.jsx            # Event calendar with scheduling
│   ├── EventTemplates.jsx      # 30+ pre-built templates
│   ├── Teams.jsx               # Team management
│   ├── TeamDashboard.jsx       # Team-specific view
│   ├── TeamCompetition.jsx     # Team vs team challenges
│   ├── Channels.jsx            # Team messaging
│   ├── Recognition.jsx         # Peer recognition with moderation
│   ├── Leaderboards.jsx        # Multi-category leaderboards
│   ├── PublicProfile.jsx       # User public profiles
│   ├── GamificationDashboard.jsx # Points/badges/levels
│   ├── GamificationSettings.jsx  # Admin gamification config
│   ├── PointStore.jsx          # Avatar store with Stripe
│   ├── RewardsStore.jsx        # Redeem rewards
│   ├── SkillsDashboard.jsx     # Skill tracking
│   ├── Analytics.jsx           # HR analytics + AI insights
│   ├── FacilitatorDashboard.jsx # Facilitator overview
│   ├── ParticipantPortal.jsx   # User's events
│   ├── UserProfile.jsx         # User profile page
│   ├── AIEventPlanner.jsx      # AI-powered scheduling
│   ├── Integrations.jsx        # Integration configuration
│   ├── Settings.jsx            # App settings
│   └── Documentation.jsx       # In-app docs
│
├── components/                 # Reusable components
│   ├── common/                 # Shared UI components
│   │   ├── LoadingSpinner.jsx
│   │   ├── EmptyState.jsx
│   │   ├── PageHeader.jsx
│   │   ├── StatsGrid.jsx
│   │   ├── QuickActionCard.jsx
│   │   └── SkeletonGrid.jsx
│   │
│   ├── recognition/            # Recognition module
│   │   ├── RecognitionForm.jsx
│   │   ├── RecognitionCard.jsx
│   │   └── (moved to moderation/)
│   │
│   ├── moderation/             # Moderation module (refactored)
│   │   ├── hooks/
│   │   │   └── useModerationActions.js
│   │   ├── ModerationItem.jsx
│   │   └── ModerationQueue.jsx
│   │
│   ├── leaderboard/            # Leaderboard module (new)
│   │   ├── hooks/
│   │   │   └── useLeaderboard.js
│   │   ├── Leaderboard.jsx
│   │   ├── LeaderboardRow.jsx
│   │   ├── LeaderboardFilters.jsx
│   │   └── MyRankCard.jsx
│   │
│   ├── profile/                # Profile & Social module (new)
│   │   ├── hooks/
│   │   │   └── useSocialActions.js
│   │   ├── PublicProfileCard.jsx
│   │   └── UserProfileCard.jsx
│   │
│   ├── channels/               # Channel module
│   │   ├── ChannelList.jsx
│   │   ├── ChannelChat.jsx
│   │   ├── ChannelSettings.jsx
│   │   └── CreateChannelDialog.jsx
│   │
│   ├── gamification/           # Gamification module
│   │   ├── PointsTracker.jsx
│   │   ├── BadgeShowcase.jsx
│   │   ├── StreakTracker.jsx
│   │   └── ChallengeCard.jsx
│   │
│   ├── store/                  # Point store module (refactored)
│   │   ├── hooks/
│   │   │   ├── useStoreActions.js
│   │   │   └── useAvatarCustomization.js
│   │   ├── StoreItemCard.jsx
│   │   ├── StoreItemDetail.jsx
│   │   ├── AvatarCustomizer.jsx
│   │   ├── AvatarPreview.jsx
│   │   └── InventorySelector.jsx
│   │
│   ├── hooks/                  # Shared custom hooks
│   │   ├── useUserData.js
│   │   ├── useAuth.js
│   │   ├── useEventData.js
│   │   └── useGamificationData.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── eventUtils.js
│   │   └── soundEffects.js
│   │
│   └── docs/                   # Documentation
│       ├── PRD_MASTER.jsx
│       ├── API_REFERENCE.jsx
│       ├── FEATURE_SPECS.jsx
│       └── ARCHITECTURE.jsx
│
├── entities/                   # Data schemas (35+ entities)
│   ├── Activity.json
│   ├── Event.json
│   ├── Recognition.json
│   ├── Channel.json
│   ├── ChannelMessage.json
│   ├── UserPoints.json
│   ├── UserProfile.json
│   ├── UserFollow.json         # Social relationships
│   ├── UserAvatar.json
│   ├── UserInventory.json
│   ├── StoreItem.json
│   ├── StoreTransaction.json
│   ├── LeaderboardSnapshot.json
│   ├── Badge.json
│   ├── BadgeAward.json
│   ├── Team.json
│   └── ...
│
├── functions/                  # Backend functions (20+ functions)
│   ├── awardPoints.js          # Refactored with helpers
│   ├── purchaseWithPoints.js   # Refactored with validation
│   ├── createStoreCheckout.js
│   ├── storeWebhook.js
│   ├── sendTeamsNotification.js
│   └── ...
│
├── agents/                     # AI agents
│   ├── EventManagerAgent.json
│   └── FacilitatorAssistant.json
│
├── Layout.js                   # App layout with navigation
└── globals.css                 # Global styles & design tokens
```

### 2.2 Component Architecture Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                 COMPONENT ARCHITECTURE PATTERNS                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PATTERN 1: Custom Hooks for Logic Extraction                    │
│  ════════════════════════════════════════════                    │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ useLeaderboard   │    │ useSocialActions │                   │
│  │ ────────────────  │    │ ────────────────  │                   │
│  │ • Data fetching  │    │ • Follow/unfollow │                   │
│  │ • Rank calc      │    │ • Block user      │                   │
│  │ • Score compute  │    │ • Query cache     │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       ▼                                          │
│              ┌────────────────┐                                  │
│              │ UI Components  │                                  │
│              │ (Presentation) │                                  │
│              └────────────────┘                                  │
│                                                                  │
│  PATTERN 2: Modular Component Composition                        │
│  ═══════════════════════════════════════════                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AvatarCustomizer                      │    │
│  │  ┌─────────────────┐  ┌─────────────────┐              │    │
│  │  │  AvatarPreview  │  │InventorySelector│              │    │
│  │  │  └── Layers     │  │  └── SlotItems  │              │    │
│  │  └─────────────────┘  └─────────────────┘              │    │
│  │            ▲                    ▲                       │    │
│  │            │                    │                       │    │
│  │            └────────────────────┘                       │    │
│  │                      │                                  │    │
│  │         useAvatarCustomization (hook)                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  PATTERN 3: Feature-Based Module Organization                    │
│  ══════════════════════════════════════════════                  │
│                                                                  │
│  components/leaderboard/                                         │
│  ├── hooks/                    # Business logic                  │
│  │   └── useLeaderboard.js     # Data + computations            │
│  ├── Leaderboard.jsx           # Container component            │
│  ├── LeaderboardRow.jsx        # Presentation                   │
│  ├── LeaderboardFilters.jsx    # UI controls                    │
│  └── MyRankCard.jsx            # Specialized display            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TanStack Query (Server State)                                   │
│  ─────────────────────────────                                   │
│  • Entity data (Recognition, Surveys, Events, Leaderboards)     │
│  • Automatic caching and invalidation                           │
│  • Background refetching                                         │
│  • Optimistic updates                                            │
│                                                                  │
│  React State (UI State)                                          │
│  ──────────────────────                                          │
│  • Modal open/close                                              │
│  • Form inputs                                                   │
│  • Filter selections                                             │
│  • Local UI toggles                                              │
│                                                                  │
│  Query Key Structure:                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ['leaderboard-data']             - All user points      │    │
│  │ ['user-following', email]        - Following list       │    │
│  │ ['user-followers', email]        - Followers list       │    │
│  │ ['public-profile', email]        - Profile data         │    │
│  │ ['user-inventory', email]        - Store inventory      │    │
│  │ ['recognitions-flagged']         - Moderation queue     │    │
│  │ ['store-items']                  - Store catalog        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Cache Configuration:                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Static Data:    staleTime: 60000 (1 min)               │    │
│  │ User Data:      staleTime: 30000 (30 sec)              │    │
│  │ Real-time:      refetchInterval: 5000 (5 sec)          │    │
│  │ Leaderboard:    staleTime: 60000, refetchInterval: 5min │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture

### 3.1 Function Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND FUNCTIONS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GAMIFICATION (Refactored)                                       │
│  ─────────────────────────                                       │
│  functions/awardPoints.js                                        │
│  ├── POINTS_CONFIG object                                        │
│  ├── Helper: checkDuplicateAward()                              │
│  ├── Helper: getOrCreateUserPoints()                            │
│  ├── Helper: calculatePointsUpdate()                            │
│  ├── Helper: updateTeamPoints()                                 │
│  ├── Helper: checkAndAwardBadges()                              │
│  └── Main: Deno.serve handler                                   │
│                                                                  │
│  STORE (Refactored)                                              │
│  ─────────────────                                               │
│  functions/purchaseWithPoints.js                                 │
│  ├── Helper: validateItem()                                      │
│  ├── Helper: validateUserPoints()                               │
│  ├── Helper: isConsumable()                                     │
│  ├── Helper: processPurchase()                                  │
│  ├── Helper: activatePowerUp()                                  │
│  └── Main: Deno.serve handler                                   │
│                                                                  │
│  functions/createStoreCheckout.js                                │
│  functions/storeWebhook.js                                       │
│                                                                  │
│  RECOGNITION                                                     │
│  ──────────────                                                  │
│  • AI moderation via InvokeLLM                                  │
│  • Status workflow (pending → approved/rejected)                │
│  • Points award on approval                                     │
│                                                                  │
│  NOTIFICATIONS                                                   │
│  ───────────────                                                 │
│  functions/slackNotifications.js                                 │
│  functions/teamsNotifications.js                                 │
│  functions/sendEmailNotification.js                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Backend Function Template (Updated)

```javascript
// Standard backend function structure with helper pattern
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Configuration constants
const CONFIG = {
  // Centralized configuration
};

// Helper functions (pure, testable)
function validateInput(data) {
  // Validation logic
}

function processBusinessLogic(base44, user, data) {
  // Core business logic
}

// Main handler
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    // 1. Authenticate
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Parse and validate
    const data = await req.json();
    const validation = validateInput(data);
    if (validation.error) {
      return Response.json(validation, { status: 400 });
    }
    
    // 3. Process
    const result = await processBusinessLogic(base44, user, data);
    
    // 4. Return
    return Response.json(result);
    
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 4. Data Architecture

### 4.1 Entity Relationships (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐                                                     │
│  │  User   │ (Built-in)                                         │
│  │─────────│                                                     │
│  │ email   │◄───────────────────────────────────────────┐       │
│  │ name    │                                            │       │
│  │ role    │                                            │       │
│  └────┬────┘                                            │       │
│       │                                                  │       │
│       │ 1:1                                              │       │
│       ▼                                                  │       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │       │
│  │UserPoints│    │UserAvatar│    │UserProfile│          │       │
│  │──────────│    │──────────│    │──────────│          │       │
│  │points    │    │equipped  │    │display   │          │       │
│  │badges    │    │items     │    │bio       │          │       │
│  │level     │    │power_ups │    │visibility│          │       │
│  └──────────┘    └──────────┘    └──────────┘          │       │
│       │                                                  │       │
│       │                                                  │       │
│  SOCIAL LAYER (New)                                      │       │
│  ══════════════════                                      │       │
│                                                          │       │
│  ┌─────────────────┐                                     │       │
│  │   UserFollow    │                                     │       │
│  │─────────────────│                                     │       │
│  │follower_email   │─────────────────────────────────────┤       │
│  │following_email  │─────────────────────────────────────┘       │
│  │status (active/  │                                             │
│  │        blocked) │                                             │
│  └─────────────────┘                                             │
│                                                                  │
│  LEADERBOARDS                                                    │
│  ═════════════                                                   │
│                                                                  │
│  ┌─────────────────────┐                                         │
│  │ LeaderboardSnapshot │                                         │
│  │─────────────────────│                                         │
│  │ period (daily/      │                                         │
│  │   weekly/monthly)   │                                         │
│  │ category (points/   │                                         │
│  │   events/badges)    │                                         │
│  │ rankings[]          │                                         │
│  │ total_participants  │                                         │
│  └─────────────────────┘                                         │
│                                                                  │
│  STORE                                                           │
│  ═════                                                           │
│                                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │StoreItem │◄───│StoreTransact.│───▶│UserInventory │           │
│  │──────────│    │──────────────│    │──────────────│           │
│  │name      │    │points_spent  │    │item_id       │           │
│  │pricing   │    │money_spent   │    │is_equipped   │           │
│  │rarity    │    │status        │    │acquired_at   │           │
│  └──────────┘    └──────────────┘    └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Leaderboard Calculation (New)

```
┌─────────────────────────────────────────────────────────────────┐
│                 LEADERBOARD COMPUTATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CATEGORY SCORING                                                │
│  ────────────────                                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Points:     total_points (all-time) or period-specific  │    │
│  │ Events:     events_attended count                       │    │
│  │ Badges:     badges_earned.length                        │    │
│  │ Engagement: Weighted composite score                    │    │
│  │             = events × 10 + activities × 15            │    │
│  │             + feedback × 5 + streak × 2 + badges × 20  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  RANKING ALGORITHM                                               │
│  ─────────────────                                               │
│                                                                  │
│  1. Fetch all UserPoints records                                 │
│  2. Calculate score per user based on category                  │
│  3. Sort descending by score                                    │
│  4. Assign ranks (handle ties - same rank for same score)       │
│  5. Find current user's position                                │
│  6. Extract nearby competitors (±2 positions)                   │
│                                                                  │
│  CACHING STRATEGY                                                │
│  ────────────────                                                │
│                                                                  │
│  • Client-side: TanStack Query, staleTime: 60s                  │
│  • Future: LeaderboardSnapshot entity for pre-computed ranks    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Security Architecture

### 5.1 Authorization Matrix (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE-BASED ACCESS CONTROL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Resource              │ Admin │  HR  │ Manager │ User │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Recognition                                                     │
│    Create              │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Moderate            │   ✓   │  ✓   │    ✗    │  ✗   │        │
│    AI Scan             │   ✓   │  ✓   │    ✗    │  ✗   │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Leaderboards                                                    │
│    View All            │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Filter Following    │   ✓   │  ✓   │    ✓    │  ✓   │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Profiles                                                        │
│    View Public         │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    View Private        │   ✓   │  ✓   │    ✗    │ Own  │        │
│    Follow/Block        │   ✓   │  ✓   │    ✓    │  ✓   │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Store                                                           │
│    Browse              │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Purchase (Points)   │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Purchase (Stripe)   │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Manage Items        │   ✓   │  ✗   │    ✗    │  ✗   │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Analytics                                                       │
│    Company-wide        │   ✓   │  ✓   │    ✗    │  ✗   │        │
│    Personal Dashboard  │   ✓   │  ✓   │    ✓    │  ✓   │        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Performance Architecture

### 6.1 Optimization Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE PATTERNS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LEADERBOARD OPTIMIZATION                                        │
│  ─────────────────────────                                       │
│                                                                  │
│  Problem: Calculating ranks for 200+ users in real-time         │
│                                                                  │
│  Solution:                                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. useMemo for expensive computations                   │    │
│  │ 2. Limit to top 100 in UI (paginate if needed)         │    │
│  │ 3. staleTime: 60s to reduce API calls                  │    │
│  │ 4. Future: Pre-computed LeaderboardSnapshot entity     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  PROFILE LOOKUP OPTIMIZATION                                     │
│  ────────────────────────────                                    │
│                                                                  │
│  Problem: O(N*M) lookup when matching profiles to points        │
│                                                                  │
│  Solution:                                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Future: Convert profiles array to Map for O(1) lookup   │    │
│  │ const profileMap = new Map(profiles.map(p =>           │    │
│  │   [p.user_email, p]));                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  COMPONENT MEMOIZATION                                           │
│  ─────────────────────                                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • useCallback for event handlers passed as props       │    │
│  │ • useMemo for computed values                          │    │
│  │ • React.memo for pure presentation components          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Document Version: 2.0*
*Last Updated: 2025-11-30*