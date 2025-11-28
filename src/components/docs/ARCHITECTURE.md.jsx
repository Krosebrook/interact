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
├── pages/                      # Route pages (25+ pages)
│   ├── Dashboard.jsx           # Main admin dashboard
│   ├── Activities.jsx          # Activity library (15+ templates)
│   ├── Calendar.jsx            # Event calendar with scheduling
│   ├── EventTemplates.jsx      # 30+ pre-built templates
│   ├── EventWizard.jsx         # Step-by-step event creation
│   ├── Teams.jsx               # Team management
│   ├── TeamDashboard.jsx       # Team-specific view
│   ├── TeamCompetition.jsx     # Team vs team challenges
│   ├── Channels.jsx            # Team messaging
│   ├── GamificationDashboard.jsx # Points/badges/levels
│   ├── GamificationSettings.jsx  # Admin gamification config
│   ├── Gamification.jsx        # User leaderboard
│   ├── RewardsStore.jsx        # Redeem rewards
│   ├── SkillsDashboard.jsx     # Skill tracking
│   ├── Analytics.jsx           # HR analytics + AI insights
│   ├── FacilitatorDashboard.jsx # Facilitator overview
│   ├── FacilitatorView.jsx     # Live event facilitation
│   ├── ParticipantPortal.jsx   # User's events
│   ├── ParticipantEvent.jsx    # Event participation
│   ├── UserProfile.jsx         # User profile page
│   ├── AIEventPlanner.jsx      # AI-powered scheduling
│   ├── Integrations.jsx        # Integration configuration
│   ├── ProjectPlan.jsx         # Development tracking
│   └── Settings.jsx            # App settings
│
├── components/                 # Reusable components
│   ├── common/                 # Shared UI components
│   │   ├── LoadingSpinner.jsx
│   │   ├── EmptyState.jsx
│   │   ├── PageHeader.jsx
│   │   └── StatsGrid.jsx
│   │
│   ├── recognition/            # Recognition module
│   │   ├── RecognitionComposer.jsx
│   │   ├── RecognitionFeed.jsx
│   │   ├── RecognitionCard.jsx
│   │   └── ModerationQueue.jsx
│   │
│   ├── surveys/                # Survey module
│   │   ├── SurveyBuilder.jsx
│   │   ├── SurveyTaker.jsx
│   │   └── SurveyResults.jsx
│   │
│   ├── channels/               # Channel module
│   │   ├── ChannelList.jsx
│   │   ├── ChannelChat.jsx
│   │   └── CreateChannelDialog.jsx
│   │
│   ├── gamification/           # Gamification module
│   │   ├── PointsTracker.jsx
│   │   ├── BadgeShowcase.jsx
│   │   ├── Leaderboard.jsx
│   │   └── StreakTracker.jsx
│   │
│   ├── store/                  # Point store module
│   │   ├── PointStore.jsx
│   │   ├── StoreItemCard.jsx
│   │   ├── AvatarCustomizer.jsx
│   │   └── UserInventory.jsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useUserData.js
│   │   ├── useEventData.js
│   │   └── useGamificationData.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── soundEffects.js
│   │
│   └── docs/                   # Documentation
│       ├── PRD_MASTER.md
│       ├── API_REFERENCE.md
│       └── ARCHITECTURE.md
│
├── entities/                   # Data schemas
│   ├── Activity.json
│   ├── Event.json
│   ├── Recognition.json
│   ├── Survey.json
│   ├── Channel.json
│   └── UserPoints.json
│
├── functions/                  # Backend functions
│   ├── awardPoints.js
│   ├── createRecognition.js
│   ├── submitSurveyResponse.js
│   └── storeWebhook.js
│
├── agents/                     # AI agents
│   └── EventManagerAgent.json
│
├── Layout.js                   # App layout
└── globals.css                 # Global styles
```

### 2.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layout.js                                                       │
│  ├── Header                                                      │
│  │   ├── Logo                                                    │
│  │   ├── NotificationBell                                        │
│  │   └── UserMenu                                                │
│  │                                                               │
│  ├── Sidebar                                                     │
│  │   ├── Navigation                                              │
│  │   └── QuickActions                                            │
│  │                                                               │
│  └── Main Content (children)                                     │
│      │                                                           │
│      ├── Dashboard                                               │
│      │   ├── StatsGrid                                           │
│      │   ├── UpcomingEvents                                      │
│      │   ├── RecognitionFeed                                     │
│      │   └── QuickActions                                        │
│      │                                                           │
│      ├── Recognition                                             │
│      │   ├── RecognitionComposer (Modal)                        │
│      │   ├── RecognitionFeed                                     │
│      │   │   └── RecognitionCard                                │
│      │   └── ModerationQueue (Admin)                            │
│      │                                                           │
│      ├── Surveys                                                 │
│      │   ├── SurveyList                                          │
│      │   ├── SurveyBuilder (HR)                                 │
│      │   ├── SurveyTaker (Employee)                             │
│      │   └── SurveyResults (HR)                                 │
│      │                                                           │
│      └── Store                                                   │
│          ├── StoreHeader                                         │
│          ├── CategoryNav                                         │
│          ├── ItemGrid                                            │
│          │   └── StoreItemCard                                   │
│          ├── ItemDetail (Modal)                                  │
│          └── AvatarCustomizer                                    │
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
│  • Entity data (Recognition, Surveys, Events)                   │
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
│  │ ['recognitions']                  - All recognitions    │    │
│  │ ['recognitions', { status }]      - Filtered           │    │
│  │ ['user-points', email]            - User's points      │    │
│  │ ['channel-messages', channelId]   - Channel messages   │    │
│  │ ['survey-responses', surveyId]    - Survey data        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Cache Configuration:                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Static Data:    staleTime: 30min, cacheTime: 1hr       │    │
│  │ User Data:      staleTime: 30sec, cacheTime: 5min      │    │
│  │ Real-time:      refetchInterval: 5sec                   │    │
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
│  RECOGNITION                                                     │
│  ──────────────                                                  │
│  functions/createRecognition.js                                  │
│  • Validate input                                                │
│  • Run AI moderation                                             │
│  • Create recognition                                            │
│  • Award points (if approved)                                    │
│  • Send notifications                                            │
│                                                                  │
│  functions/moderateRecognition.js                                │
│  • Admin approval/rejection                                      │
│  • Update status                                                 │
│  • Trigger points award                                          │
│                                                                  │
│  SURVEYS                                                         │
│  ─────────                                                       │
│  functions/submitSurveyResponse.js                               │
│  • Verify invitation                                             │
│  • Sanitize for PII                                              │
│  • Store anonymous response                                      │
│  • Update invitation status                                      │
│  • Award points                                                  │
│                                                                  │
│  functions/getSurveyResults.js                                   │
│  • Check threshold                                               │
│  • Aggregate results                                             │
│  • Run sentiment analysis                                        │
│                                                                  │
│  GAMIFICATION                                                    │
│  ─────────────                                                   │
│  functions/awardPoints.js                                        │
│  • Add points to user                                            │
│  • Update history                                                │
│  • Check level up                                                │
│  • Check badge eligibility                                       │
│                                                                  │
│  functions/updateStreak.js                                       │
│  • Calculate streak                                              │
│  • Award streak badges                                           │
│                                                                  │
│  STORE                                                           │
│  ───────                                                         │
│  functions/purchaseWithPoints.js                                 │
│  • Validate balance                                              │
│  • Deduct points                                                 │
│  • Add to inventory                                              │
│                                                                  │
│  functions/createStoreCheckout.js                                │
│  • Create Stripe session                                         │
│  • Store transaction                                             │
│                                                                  │
│  functions/storeWebhook.js                                       │
│  • Handle Stripe events                                          │
│  • Complete purchase                                             │
│  • Add to inventory                                              │
│                                                                  │
│  NOTIFICATIONS                                                   │
│  ───────────────                                                 │
│  functions/slackNotifications.js                                 │
│  functions/teamsNotifications.js                                 │
│  functions/sendEmailNotification.js                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Function Template

```javascript
// Standard backend function structure
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // 1. Initialize SDK
    const base44 = createClientFromRequest(req);
    
    // 2. Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 3. Parse request
    const data = await req.json();
    
    // 4. Validate input
    if (!data.requiredField) {
      return Response.json({ error: 'Missing required field' }, { status: 400 });
    }
    
    // 5. Business logic
    const result = await performOperation(base44, user, data);
    
    // 6. Return response
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 4. Data Architecture

### 4.1 Entity Relationships

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
│  │UserPoints│    │UserAvatar│    │UserPrefs │          │       │
│  │──────────│    │──────────│    │──────────│          │       │
│  │points    │    │equipped  │    │settings  │          │       │
│  │badges    │    │items     │    │          │          │       │
│  │level     │    │          │    │          │          │       │
│  └────┬─────┘    └────┬─────┘    └──────────┘          │       │
│       │               │                                  │       │
│       │               │ 1:N                              │       │
│       │               ▼                                  │       │
│       │         ┌──────────┐                            │       │
│       │         │ User     │                            │       │
│       │         │Inventory │                            │       │
│       │         │──────────│                            │       │
│       │         │item_id   │───────┐                    │       │
│       │         │equipped  │       │                    │       │
│       │         └──────────┘       │                    │       │
│       │                            │                    │       │
│       │ history                    │ N:1                │       │
│       │                            ▼                    │       │
│       │                      ┌──────────┐              │       │
│       │                      │StoreItem │              │       │
│       │                      │──────────│              │       │
│       │                      │name      │              │       │
│       │                      │pricing   │              │       │
│       │                      │rarity    │              │       │
│       │                      └──────────┘              │       │
│       │                                                 │       │
│       │     RECOGNITION                                 │       │
│       │     ═══════════                                 │       │
│       │                                                 │       │
│       │         ┌───────────────┐                      │       │
│       └────────►│  Recognition  │◄─────────────────────┘       │
│                 │───────────────│                               │
│                 │sender_email   │───────────────┐               │
│                 │recipient_email│───────────────┤               │
│                 │message        │               │               │
│                 │points_awarded │               │               │
│                 │status         │               │               │
│                 │tags[]         │───────┐       │               │
│                 └───────────────┘       │       │               │
│                                         │       │               │
│                                         │ N:M   │               │
│                                         ▼       │               │
│                                   ┌──────────┐  │               │
│                                   │Recog.Tag │  │               │
│                                   │──────────│  │               │
│                                   │name      │  │               │
│                                   │type      │  │               │
│                                   └──────────┘  │               │
│                                                 │               │
│     SURVEYS                                     │               │
│     ═══════                                     │               │
│                                                 │               │
│  ┌──────────┐    ┌──────────────┐              │               │
│  │  Survey  │───►│  Survey      │              │               │
│  │──────────│    │  Invitation  │──────────────┘               │
│  │title     │    │──────────────│                               │
│  │questions │    │user_email    │                               │
│  │settings  │    │status        │                               │
│  └────┬─────┘    └──────────────┘                               │
│       │                                                          │
│       │ 1:N (NO user link)                                      │
│       ▼                                                          │
│  ┌──────────────┐                                               │
│  │   Survey     │                                               │
│  │   Response   │  ⚠️ ANONYMOUS                                 │
│  │──────────────│                                               │
│  │survey_id     │                                               │
│  │answers[]     │                                               │
│  │❌ NO user_id │                                               │
│  └──────────────┘                                               │
│                                                                  │
│     CHANNELS                                                     │
│     ════════                                                     │
│                                                                  │
│  ┌──────────┐    ┌──────────────┐                               │
│  │ Channel  │───►│   Channel    │                               │
│  │──────────│    │   Message    │                               │
│  │name      │    │──────────────│                               │
│  │members[] │    │sender_email  │                               │
│  │type      │    │content       │                               │
│  └──────────┘    │reactions[]   │                               │
│                  └──────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Live Entity Data

Based on current platform data:

**Activities (15+ templates)**
- Two Truths and a Lie (Icebreaker, 15-30min)
- Virtual Coffee Chat (Social, 15-30min)
- Quick Desk Yoga (Wellness, 5-15min)
- Virtual Trivia Challenge (Competitive, 30+min)
- AI Training Class Activity Flow (Learning, 15-30min)

**Badges (10 configured)**
| Badge | Rarity | Points | Criteria |
|-------|--------|--------|----------|
| First Steps | Common | 10 | Attend 1 event |
| Team Player | Common | 25 | Attend 5 events |
| Dedicated Member | Uncommon | 50 | Attend 10 events |
| Feedback Hero | Uncommon | 30 | Submit 20 feedbacks |
| Activity Master | Rare | 50 | Complete 25 activities |
| Engagement Champion | Rare | 75 | 90%+ engagement |
| Streak Master | Epic | 100 | 30-day streak |
| Top Facilitator | Epic | 100 | Facilitate 10 events |
| Early Adopter | Legendary | 150 | First 50 users |
| Team Player (Collab) | Uncommon | 40 | 500 team points |

### 4.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW PATTERNS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  READ FLOW (Direct Entity Access)                                │
│  ════════════════════════════════                                │
│                                                                  │
│  Component ──► useQuery ──► base44.entities.X.filter() ──► UI   │
│                   │                                              │
│                   └── Automatic caching                          │
│                   └── Background refetch                         │
│                   └── Stale-while-revalidate                     │
│                                                                  │
│  WRITE FLOW (Via Backend Function)                               │
│  ═════════════════════════════════                               │
│                                                                  │
│  Component ──► useMutation ──► base44.functions.invoke()        │
│                   │                    │                         │
│                   │                    ▼                         │
│                   │            Backend Function                  │
│                   │                    │                         │
│                   │            ┌───────┴───────┐                 │
│                   │            │               │                 │
│                   │            ▼               ▼                 │
│                   │      Validation      Side Effects            │
│                   │            │          • Points               │
│                   │            │          • Notifications        │
│                   │            │          • Badges               │
│                   │            │                                 │
│                   │            ▼                                 │
│                   │      Entity Create/Update                    │
│                   │            │                                 │
│                   │            ▼                                 │
│                   └──── invalidateQueries() ──► Refetch ──► UI  │
│                                                                  │
│  REAL-TIME FLOW (Polling)                                        │
│  ════════════════════════                                        │
│                                                                  │
│  Component ──► useQuery({ refetchInterval: 5000 })              │
│                   │                                              │
│                   └── Every 5 seconds: fetch latest             │
│                   └── Update UI with new data                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User visits app                                              │
│         │                                                        │
│         ▼                                                        │
│  2. base44.auth.isAuthenticated() ────────┐                     │
│         │                                  │                     │
│         │ false                           │ true                 │
│         ▼                                  │                     │
│  3. base44.auth.redirectToLogin()          │                     │
│         │                                  │                     │
│         ▼                                  │                     │
│  4. SSO Provider                           │                     │
│     (Azure AD / Google / Okta)             │                     │
│         │                                  │                     │
│         ▼                                  │                     │
│  5. Redirect back with token               │                     │
│         │                                  │                     │
│         ▼                                  │                     │
│  6. base44.auth.me() ◄─────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  7. Return user object                                           │
│     { id, email, full_name, role }                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Authorization Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE-BASED ACCESS CONTROL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Resource              │ Admin │  HR  │ Manager │ User │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Recognition                                                     │
│    Create              │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    View All            │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Moderate            │   ✓   │  ✓   │    ✗    │  ✗   │        │
│    Delete Any          │   ✓   │  ✗   │    ✗    │  ✗   │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Surveys                                                         │
│    Create              │   ✓   │  ✓   │    ✗    │  ✗   │        │
│    Respond             │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    View Results        │   ✓   │  ✓   │ Team    │  ✗   │        │
│    View Raw Data       │   ✗   │  ✗   │    ✗    │  ✗   │ ⚠️    │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Analytics                                                       │
│    Company-wide        │   ✓   │  ✓   │    ✗    │  ✗   │        │
│    Team                │   ✓   │  ✓   │    ✓    │  ✗   │        │
│    Personal            │   ✓   │  ✓   │    ✓    │  ✓   │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Users                                                           │
│    List All            │   ✓   │  ✓   │ Team    │  ✗   │        │
│    Edit Roles          │   ✓   │  ✗   │    ✗    │  ✗   │        │
│    View PII            │   ✓   │  ✓   │    ✗    │  ✗   │        │
│  ──────────────────────┼───────┼──────┼─────────┼──────┤        │
│  Store                                                           │
│    Browse              │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Purchase            │   ✓   │  ✓   │    ✓    │  ✓   │        │
│    Manage Items        │   ✓   │  ✗   │    ✗    │  ✗   │        │
│                                                                  │
│  ⚠️ Raw survey data never accessible to maintain anonymity      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Performance Architecture

### 6.1 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: TanStack Query (Client)                               │
│  ────────────────────────────────                               │
│  • In-memory cache                                               │
│  • Configurable staleTime/cacheTime                             │
│  • Automatic garbage collection                                  │
│                                                                  │
│  Configuration by data type:                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Static (Store items, badges):                          │    │
│  │    staleTime: 30 minutes                                │    │
│  │    cacheTime: 60 minutes                                │    │
│  │                                                          │    │
│  │  User-specific (points, inventory):                     │    │
│  │    staleTime: 30 seconds                                │    │
│  │    cacheTime: 5 minutes                                 │    │
│  │                                                          │    │
│  │  Real-time (messages, feed):                            │    │
│  │    staleTime: 0                                         │    │
│  │    refetchInterval: 5000ms                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 2: Browser Storage                                        │
│  ────────────────────────                                        │
│  • localStorage for preferences                                  │
│  • sessionStorage for temporary state                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load | <3s | Time to interactive |
| Navigation | <500ms | Page transition |
| API Response | <200ms | Entity operations |
| Real-time Updates | <5s | Message delivery |
| Image Load | <1s | Lazy loaded |

---

## 7. Scalability Considerations

### 7.1 Current Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Users | 200 | Target company size |
| Recognitions/day | 1000 | 5 per user |
| Messages/channel | 10000 | Archived after |
| File uploads | 10MB | Per file |
| API calls | 1000/min | Per user |

### 7.2 Scaling Strategies

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALING APPROACH                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Current: Monolithic (Base44 Platform)                          │
│  ───────────────────────────────────                            │
│  • Single database                                               │
│  • Serverless functions                                          │
│  • CDN for static assets                                        │
│                                                                  │
│  Future Considerations:                                          │
│  ──────────────────────                                         │
│  • Message archiving (move old messages to cold storage)        │
│  • Recognition search (add search index)                        │
│  • Analytics aggregation (pre-compute dashboards)               │
│  • Image optimization (resize on upload)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Monitoring & Observability

### 8.1 Key Metrics

| Category | Metrics |
|----------|---------|
| Performance | Page load time, API latency, Error rate |
| Engagement | DAU, Recognition count, Survey response rate |
| Business | NPS, Retention, Points velocity |
| Technical | Function execution time, Database queries |

### 8.2 Error Handling

```javascript
// Global error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('UI Error:', error, errorInfo);
    // Report to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

*Document Version: 1.0*
*Last Updated: 2025-11-28*