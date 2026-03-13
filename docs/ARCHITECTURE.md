# Architecture — Interact Employee Engagement Platform

**Version:** 0.0.0 (Active Development)  
**Last Updated:** March 2026  
**Stack:** React 18 + Vite 6 + Base44 SDK 0.8.3

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Authentication Flow](#4-authentication-flow)
5. [Data Layer](#5-data-layer)
6. [State Management](#6-state-management)
7. [Routing](#7-routing)
8. [Integration Map](#8-integration-map)
9. [Performance Strategy](#9-performance-strategy)
10. [Deployment Topology](#10-deployment-topology)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET / CDN                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
              ┌────────────▼───────────┐
              │      Vercel Edge       │
              │  (SPA + CDN + Headers) │
              └────────────┬───────────┘
                           │
              ┌────────────▼───────────┐
              │    React 18 SPA        │
              │  (Vite 6 build output) │
              │                        │
              │  ┌──────────────────┐  │
              │  │  React Router 6  │  │
              │  │  117 page routes │  │
              │  └────────┬─────────┘  │
              │           │            │
              │  ┌────────▼─────────┐  │
              │  │  TanStack Query  │  │
              │  │  (server state)  │  │
              │  └────────┬─────────┘  │
              │           │            │
              │  ┌────────▼─────────┐  │
              │  │  Base44 SDK      │  │
              │  │  (API client)    │  │
              │  └────────┬─────────┘  │
              └───────────┼────────────┘
                          │ HTTPS / JWT
              ┌───────────▼────────────┐
              │   Base44 Backend       │
              │   (Managed Cloud)      │
              │                        │
              │  ┌──────────────────┐  │
              │  │  ~200 Serverless │  │
              │  │  TypeScript fns  │  │
              │  └──────────────────┘  │
              │                        │
              │  ┌──────────────────┐  │
              │  │  Managed DB      │  │
              │  │  (~39 entities)  │  │
              │  └──────────────────┘  │
              └───────────┬────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐    ┌──────▼──────┐   ┌────▼────────┐
    │ OpenAI  │    │  Cloudinary │   │  3rd Party  │
    │ Claude  │    │  (media)    │   │ Integrations│
    │ Gemini  │    └─────────────┘   │ Slack/Teams │
    │Perplxty │                      │ Calendar    │
    └─────────┘                      │ Stripe/etc  │
                                     └─────────────┘
```

---

## 2. Frontend Architecture

### Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.2.0 |
| Build Tool | Vite | 6.1.0 |
| Routing | React Router DOM | 6.26.0 |
| Server State | TanStack Query | 5.84.1 |
| Styling | TailwindCSS | 3.4.17 |
| UI Primitives | Radix UI | various |
| Forms | React Hook Form | 7.54.2 |
| Validation | Zod | 3.24.2 |
| Animation | Framer Motion | 11.16.4 |
| Charts | Recharts | 2.15.4 |
| Icons | Lucide React | 0.475.0 |

### Directory Structure

```
src/
├── App.jsx                  # Root component — auth, router, providers
├── pages.config.js          # AUTO-GENERATED page registry (117 pages)
├── pages/                   # 117 route-level page components
├── components/
│   ├── ui/                  # Shadcn/Radix primitives (Button, Dialog, etc.)
│   ├── common/              # Shared components (ErrorBoundary, Layout, etc.)
│   ├── activities/          # Activity-related components
│   ├── gamification/        # Points, badges, leaderboards
│   ├── analytics/           # Charts, dashboards
│   ├── onboarding/          # Onboarding flows
│   ├── recognition/         # Kudos, peer recognition
│   ├── social/              # Channels, messaging
│   └── ...                  # 40+ categories
├── hooks/                   # Custom React hooks (useActivityData, etc.)
├── lib/
│   ├── AuthContext.jsx       # Auth context provider
│   ├── query-client.js       # TanStack Query configuration
│   ├── utils.js              # cn() and utility helpers
│   ├── app-params.js         # App configuration / env vars
│   ├── NavigationTracker.jsx # Analytics navigation tracking
│   └── VisualEditAgent.jsx   # Base44 visual editor integration
├── api/
│   ├── base44Client.js       # Base44 SDK client instance
│   └── entities.js           # Entity & auth exports
├── contexts/                 # Additional React Context providers
├── models/
│   └── schema.json           # Data model documentation
└── assets/                  # Static assets (images, fonts)
```

### Component Architecture

Components follow a three-tier pattern:

1. **Page Components** (`src/pages/`) — Route-level, data-fetching, layout orchestration
2. **Feature Components** (`src/components/<category>/`) — Domain-specific UI
3. **UI Primitives** (`src/components/ui/`) — Generic, accessible, unstyled-first Radix UI wrappers

```jsx
// Pattern: Page → Feature → UI Primitives
<Dashboard>                          // pages/Dashboard.jsx
  <ActivityCard activity={data}>     // components/activities/ActivityCard.jsx
    <Button variant="outline">       // components/ui/button.jsx (Radix)
      Join Activity
    </Button>
  </ActivityCard>
</Dashboard>
```

---

## 3. Backend Architecture

### Base44 Serverless Functions

The backend consists of **~200 TypeScript serverless functions** in the `functions/` directory. These are deployed and managed by Base44's infrastructure.

### Function Categories

| Category | Count | Examples |
|---|---|---|
| AI / LLM | ~60 | `aiEventPlanningAssistant`, `aiCoachingRecommendations`, `generatePersonalizedRecommendations` |
| Analytics | ~20 | `aggregateAnalytics`, `advancedAnalytics`, `lifecycleAnalytics`, `predictiveAnalytics` |
| Gamification | ~15 | `awardPoints`, `detectMilestones`, `processGamificationRules`, `purchaseWithPoints` |
| Integrations | ~20 | `slackNotifications`, `sendTeamsNotification`, `googleCalendarSync`, `hubspotIntegration` |
| Onboarding | ~12 | `aiOnboardingAssistant`, `newEmployeeOnboardingAI`, `awardOnboardingPoints` |
| Notifications | ~10 | `triggerPersonalizedNotifications`, `processReminders`, `weeklyDigestEngine` |
| User / Auth | ~8 | `inviteUser`, `manageUserRole`, `suspendUser`, `updateUserRole` |
| Events | ~10 | `handleEventCancellation`, `recurringEventReminders`, `summarizeEvent` |
| Other | ~45 | Testing, utilities, reporting, wellness, team management |

### Function Pattern

```typescript
// functions/awardPoints.ts (example pattern)
import { base44 } from './lib/base44';

export default async function handler(req, res) {
  const { user_email, points, reason } = req.body;
  
  // Validate input
  // Query/mutate entities via base44 SDK
  // Return result
}
```

---

## 4. Authentication Flow

```
User visits app
      │
      ▼
AuthProvider (AuthContext.jsx)
      │
      ├── Fetch app public settings
      │   GET /api/apps/public/prod/public-settings/by-id/{appId}
      │
      ├── Check appParams.token (from env/session)
      │
      ├─── [No token] ──→ navigateToLogin() → Base44 login page
      │
      └─── [Has token] ──→ checkUserAuth()
                               │
                    ┌──────────┴──────────┐
                    │                     │
              [user_not_registered]  [authenticated]
                    │                     │
             UserNotRegisteredError   setUser + render app
```

### Token Lifecycle

1. **Login:** User authenticates via Base44's hosted login UI
2. **Token Storage:** Base44 SDK manages token storage (typically `localStorage`)
3. **Token Usage:** Injected as `Authorization: Bearer <token>` header in all API calls
4. **Token Refresh:** Handled transparently by Base44 SDK
5. **Logout:** Clears token via `base44.auth.logout()`

### Auth Context API

```js
const { 
  user,                  // Current user object
  isAuthenticated,       // boolean
  isLoadingAuth,         // boolean (initial load)
  authError,             // { type: 'user_not_registered' | 'auth_required' }
  navigateToLogin,       // Function → redirect to Base44 login
} = useAuth();
```

---

## 5. Data Layer

### Base44 Managed Database

All application data is stored in Base44's managed database, accessed exclusively via the Base44 SDK. The frontend uses the `Query` entity export from `src/api/entities.js`.

### Entity Count: 39

The platform defines 39 data entities across these domains:

| Domain | Entities |
|---|---|
| Activities | Activity, ActivityPreference, ActivityModule, ActivityFavorite |
| Events | Event, Participation, EventMessage, BulkEventSchedule |
| Gamification | UserPoints, Badge, BadgeAward, PersonalChallenge, AchievementTier, StoreItem, UserInventory |
| AI | AIInsight, AIRecommendation, AIGamificationSuggestion |
| Teams | Team, TeamMembership, TeamsConfig |
| Users | UserProfile, UserOnboarding, UserAvatar |
| Social | Channel, ChannelMessage, Recognition, Notification, Announcement |
| Analytics | AnalyticsEvent, AuditLog |
| Knowledge | KnowledgeBase, LearningPathProgress, SkillTracking, ModuleCompletion |
| Surveys | Survey |
| Charity | CharitableDonation, CharitableImpact |
| Buddy | BuddyMatch |

### Entity Access Pattern

```js
import { Query } from '@/api/entities';

// Read (TanStack Query)
const { data } = useQuery({
  queryKey: ['activities'],
  queryFn: () => Query.Activity.filter({ status: 'active' })
});

// Write (TanStack Mutation)
const mutation = useMutation({
  mutationFn: (data) => Query.Activity.create(data),
});
```

---

## 6. State Management

### Three-Layer State Architecture

```
┌─────────────────────────────────────┐
│  Layer 1: Server State              │
│  TanStack Query 5.84.1              │
│  • Entity CRUD via Base44 SDK       │
│  • Caching, invalidation, sync      │
│  • Background refetch               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Layer 2: Global Client State       │
│  React Context API                  │
│  • AuthContext (user, auth status)  │
│  • Theme context (light/dark)       │
│  • App settings context             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Layer 3: Form / Local State        │
│  React Hook Form + useState         │
│  • Form validation via Zod          │
│  • Component-local UI state         │
└─────────────────────────────────────┘
```

---

## 7. Routing

### React Router 6 SPA

All 117 pages are registered in `src/pages.config.js` and mounted via React Router:

```jsx
// App.jsx — route generation pattern
<Routes>
  <Route path="/" element={<MainPage />} />
  {Object.entries(Pages).map(([path, Page]) => (
    <Route key={path} path={`/${path}`} element={<Page />} />
  ))}
  <Route path="*" element={<PageNotFound />} />
</Routes>
```

Routes follow the pattern `/{PageName}` (e.g., `/Dashboard`, `/Gamification`, `/Teams`).

### Vercel SPA Catch-All

`vercel.json` configures a catch-all rewrite so deep links work correctly:

```json
{ "source": "/(.*)", "destination": "/index.html" }
```

### Layout Wrapper

All pages are wrapped in the `Layout` component from `src/Layout.jsx`, providing the navigation shell, sidebar, and global UI chrome.

---

## 8. Integration Map

| Integration | Type | Functions | Purpose |
|---|---|---|---|
| **OpenAI GPT-4** | AI/LLM | `openaiIntegration.ts`, ~40 AI functions | Content generation, recommendations, coaching |
| **Anthropic Claude** | AI/LLM | Shared AI functions | Fallback LLM, document analysis |
| **Google Gemini** | AI/LLM | Shared AI functions | Multimodal AI features |
| **Perplexity** | AI/Search | `perplexityIntegration.ts` | Real-time search-augmented AI |
| **Cloudinary** | Media | Upload SDK | Avatar, image, media storage |
| **Slack** | Messaging | `slackNotifications.ts`, `reconcileSlack.ts` | Event notifications, nudges |
| **Microsoft Teams** | Messaging | `sendTeamsNotification.ts`, `teamsNotifications.ts` | Teams channel notifications |
| **Google Calendar** | Calendar | `googleCalendarSync.ts`, `syncEventToGoogleCalendar.ts` | Event sync, calendar invites |
| **Stripe** | Payments | `storeWebhook.ts`, `monetizationEngine.ts` | Rewards store, point purchases |
| **HubSpot** | CRM | `hubspotIntegration.ts` | Contact/lead sync |
| **Notion** | Docs | `notionIntegration.ts` | Knowledge base sync |
| **Zapier** | Automation | `zapierIntegration.ts` | Workflow automation |
| **Twilio** | SMS | `reconcileTwilio.ts` | SMS notifications |
| **Fitbit** | Wellness | `syncFitbitData.ts` | Wellness data sync |
| **Google Drive** | Storage | `googleDriveContentSearch.ts` | Document search |
| **Google Sheets** | Data | `reconcileGoogleSheets.ts` | Data export/import |
| **Resend** | Email | `reconcileResend.ts` | Transactional email |
| **Vercel** | Infra | `vercelIntegration.ts` | Deployment metadata |

---

## 9. Performance Strategy

### Build-Time Optimizations (Vite 6)

- **Code Splitting:** Each page is a separate JS chunk (dynamic imports via React Router)
- **Tree Shaking:** Unused exports are eliminated at build time
- **Asset Optimization:** Images, fonts, and static assets are content-hashed
- **Bundle Analysis:** `rollup-plugin-visualizer` is installed for bundle inspection

### Runtime Optimizations

- **Lazy Loading:** Pages are loaded on first navigation (`<Suspense>`)
- **TanStack Query Caching:** Server data is cached with configurable `staleTime`
- **React.memo:** Used on expensive list item components
- **Framer Motion:** Animations are GPU-accelerated

### Loading States

A global `PageLoadingFallback` spinner is displayed while page chunks are fetched:

```jsx
const PageLoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 
                    rounded-full animate-spin mx-auto mb-4"></div>
    <p className="text-sm text-slate-600">Loading...</p>
  </div>
);
```

---

## 10. Deployment Topology

```
Developer
    │
    ├── git push → GitHub
    │
    ▼
GitHub Actions (CI)
    │ npm ci → npm run lint → npm test → npm run build
    │
    ▼
Vercel (Production)
    │
    ├── Region: iad1 (US East)
    ├── Framework: Vite
    ├── Build: npm run build
    ├── Output: dist/
    ├── Install: npm ci
    └── Env vars:
          VITE_BASE44_APP_ID      → Vercel secret
          VITE_BASE44_BACKEND_URL → Vercel secret
```

### Environment Variables

| Variable | Where Used | Description |
|---|---|---|
| `VITE_BASE44_APP_ID` | Frontend | Base44 application identifier |
| `VITE_BASE44_BACKEND_URL` | Frontend | Base44 API base URL |
| `OPENAI_API_KEY` | Backend (functions) | OpenAI access |
| `ANTHROPIC_API_KEY` | Backend (functions) | Claude access |
| `GOOGLE_API_KEY` | Backend (functions) | Gemini + Google services |
| `SLACK_BOT_TOKEN` | Backend (functions) | Slack integration |
| `STRIPE_SECRET_KEY` | Backend (functions) | Payments |
| `TWILIO_*` | Backend (functions) | SMS |
| *(many others)* | Backend (functions) | Per-integration secrets |

> ⚠️ **Security Note:** Backend secrets never reach the browser. Only `VITE_*` prefixed variables are bundled into the frontend build. All `VITE_` values should be treated as public.

### Mobile (PWA / Capacitor)

Capacitor is installed as a dev dependency (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`), enabling compilation to Android. A `capacitor.config.ts` file is present. Full PWA/native deployment is planned for Q2 2025.
