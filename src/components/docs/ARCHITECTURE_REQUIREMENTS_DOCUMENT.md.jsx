# Architecture Requirements Document (ARD)
## INTeract Employee Engagement Platform

**Version:** 2.0  
**Last Updated:** 2026-01-22  
**Document Owner:** Engineering Team  
**Status:** Active

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Context](#2-system-context)
3. [Component Architecture](#3-component-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Integration Architecture](#5-integration-architecture)
6. [Security Architecture](#6-security-architecture)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Performance Architecture](#8-performance-architecture)
9. [Scalability Considerations](#9-scalability-considerations)
10. [Technical Decisions](#10-technical-decisions)

---

## 1. Architecture Overview

### 1.1 Architecture Style

**Serverless Microservices on Platform-as-a-Service (PaaS)**

**Rationale:**
- Automatic scaling for variable employee engagement patterns
- No server management overhead
- Pay-per-execution cost model
- Global edge deployment for low latency
- Built-in high availability

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Web SPA    │  │ Mobile PWA │  │ Slack Bot  │           │
│  │ (React)    │  │            │  │ (Webhook)  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS (TLS 1.3)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     CDN Layer                                │
│  • CloudFlare Global Edge Network                           │
│  • Static Asset Caching (24hr TTL)                          │
│  • DDoS Protection, WAF                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Base44 Platform (Backend)                       │
│  ┌──────────────────────────────────────────────┐          │
│  │  API Gateway (Base44 Router)                 │          │
│  │  • Rate Limiting (100 req/min per user)      │          │
│  │  • Request Validation                        │          │
│  │  • JWT Token Verification                    │          │
│  └──────────────────────────────────────────────┘          │
│                         │                                    │
│         ┌───────────────┼───────────────┐                  │
│         │               │               │                  │
│         ▼               ▼               ▼                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│  │ Auth     │   │ Entities │   │ Functions│              │
│  │ Service  │   │ (CRUD)   │   │ (Deno)   │              │
│  └──────────┘   └──────────┘   └──────────┘              │
│         │               │               │                  │
│         └───────────────┼───────────────┘                  │
│                         │                                    │
│                         ▼                                    │
│         ┌──────────────────────────────┐                   │
│         │  PostgreSQL Database         │                   │
│         │  • Connection Pool (max 100) │                   │
│         │  • Read Replicas (2)         │                   │
│         │  • Automated Backups (6hr)   │                   │
│         └──────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Real-Time Layer (WebSockets)                │          │
│  │  • Entity change subscriptions               │          │
│  │  • Live notifications                        │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Storage (S3-Compatible)                     │          │
│  │  • User uploads (max 10MB)                   │          │
│  │  • Badge images, event media                 │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │ OpenAI │  │ Slack  │  │ Google │  │Stripe  │          │
│  │ API    │  │ API    │  │ Cal    │  │        │          │
│  └────────┘  └────────┘  └────────┘  └────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Technology Stack

**Frontend:**
```yaml
Framework: React 18.2
Build Tool: Vite 5.x
Routing: react-router-dom 6.26
State: React Query 5.x (server state)
Styling: Tailwind CSS 3.x
UI Components: shadcn/ui (Radix UI primitives)
Animations: Framer Motion 11.x
Icons: Lucide React
Forms: React Hook Form + Zod validation
Charts: Recharts 2.x
```

**Backend (Base44 Platform):**
```yaml
Runtime: Deno Deploy (Serverless)
Language: JavaScript/TypeScript
Database: PostgreSQL 14 (managed)
ORM: Base44 Entities SDK (built-in)
Storage: S3-compatible object storage
Real-time: WebSocket subscriptions
Functions: Edge functions (auto-scaling)
```

**Infrastructure:**
```yaml
Hosting: Base44 Platform + CloudFlare CDN
DNS: CloudFlare
SSL: Automatic (Let's Encrypt)
Monitoring: Base44 built-in + custom analytics
Logging: Centralized (30-day retention)
Backups: Automated (6-hour intervals)
```

---

## 2. System Context

### 2.1 System Boundaries

**In Scope:**
- Employee engagement platform (recognition, surveys, events)
- User authentication via SSO
- Gamification system (points, badges, leaderboards)
- Team collaboration (channels, messaging)
- Analytics dashboards
- Mobile-responsive web interface
- Integration with Slack, Teams, Google Calendar

**Out of Scope:**
- HRIS system (employee master data)
- Performance management (formal reviews)
- Payroll processing
- Benefits administration
- Time tracking

### 2.2 External Actors

| Actor | Type | Interaction |
|-------|------|-------------|
| Employee | Human | Primary user, engages with platform |
| Team Lead | Human | Manages team, views analytics |
| HR Admin | Human | Configures platform, views company analytics |
| Slack | System | Receives notifications, sends commands |
| MS Teams | System | Receives notifications |
| Google Calendar | System | Event sync |
| SSO Provider | System | Authentication |
| OpenAI API | System | AI recommendations |
| Stripe | System | Payment processing for rewards |

### 2.3 Context Diagram

```
                    ┌──────────────┐
                    │   Employee   │
                    └──────┬───────┘
                           │
                           ▼
┌──────────┐        ┌──────────────┐        ┌──────────┐
│   SSO    │◄───────│   INTeract   │───────►│  Slack   │
│ Provider │        │   Platform   │        │   API    │
└──────────┘        └──────────────┘        └──────────┘
                           │
                 ┌─────────┼─────────┐
                 │                   │
                 ▼                   ▼
          ┌──────────┐        ┌──────────┐
          │  OpenAI  │        │  Stripe  │
          │   API    │        │          │
          └──────────┘        └──────────┘
```

---

## 3. Component Architecture

### 3.1 Frontend Architecture

**Component Hierarchy:**
```
App (Router)
├── Layout (Navigation, Header, Footer)
│   ├── Sidebar (Navigation Menu)
│   ├── Header (User Menu, Notifications)
│   └── Main Content (Page Router)
│
└── Pages
    ├── DawnHub (Daily Dashboard)
    │   ├── XPProgressRing
    │   ├── DailyQuestCard
    │   ├── StreakTracker
    │   └── RecentActivityFeed
    │
    ├── Recognition
    │   ├── RecognitionForm
    │   ├── RecognitionFeed
    │   └── RecognitionCard
    │
    ├── Events
    │   ├── EventCalendar
    │   ├── EventCard
    │   └── RSVPButton
    │
    └── Analytics (HR)
        ├── EngagementChart
        ├── DepartmentBreakdown
        └── TrendAnalysis
```

**State Management Strategy:**
```javascript
// Server State (React Query)
- User profile data
- Recognition feed
- Event list
- Leaderboard data
- Survey responses

// UI State (React useState/useReducer)
- Modal open/closed
- Form input values
- Filter selections
- Loading states

// Global State (Context API)
- Current user
- Theme preference
- Onboarding progress
- Notification count
```

**Routing Architecture:**
```javascript
// Public Routes (No Auth Required)
/splash              → Splash page
/landing             → Marketing landing page

// Protected Routes (Auth Required)
/                    → Redirect to /DawnHub
/DawnHub             → Daily dashboard
/Dashboard           → Personal dashboard
/Recognition         → Recognition feed + form
/Calendar            → Events calendar
/Teams               → Team channels
/Leaderboards        → Leaderboards
/RewardsStore        → Points redemption
/UserProfile         → User profile settings

// Role-Restricted Routes
/Analytics           → HR/Admin only
/GamificationAdmin   → Admin only
/FacilitatorDashboard → Facilitator/Admin only
```

### 3.2 Backend Architecture

**Function Categories:**
```
functions/
├── ai/                    # AI-powered features
│   ├── aiCoachingRecommendations.js
│   ├── aiOnboardingAssistant.js
│   └── aiEventPlanningAssistant.js
│
├── gamification/          # Points, badges, rewards
│   ├── awardPoints.js
│   ├── executeGamificationRules.js
│   └── calculateLeaderboard.js
│
├── integrations/          # External service integrations
│   ├── sendSlackNotification.js
│   ├── syncToGoogleCalendar.js
│   └── stripeWebhook.js
│
├── notifications/         # Email and push notifications
│   ├── sendRecognitionEmail.js
│   ├── sendEventReminder.js
│   └── sendSurveyInvitation.js
│
└── analytics/             # Data aggregation
    ├── generateEngagementReport.js
    └── exportAnalytics.js
```

**Function Execution Model:**
```javascript
// HTTP Handler Pattern
export default async function handler(req) {
  // 1. Initialize Base44 client
  const base44 = createClientFromRequest(req);
  
  // 2. Authenticate user
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 3. Check permissions
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 4. Parse request body
  const body = await req.json();
  
  // 5. Business logic
  const result = await processData(body);
  
  // 6. Return response
  return Response.json(result);
}
```

---

## 4. Data Architecture

### 4.1 Entity-Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    User     │◄───────►│UserProfile  │
│ (Built-in)  │  1:1    │             │
└──────┬──────┘         └─────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐         ┌─────────────┐
│Recognition  │         │ UserPoints  │
│             │         │             │
└─────────────┘         └─────────────┘
       │                       ▲
       │ N:1                   │ 1:1
       │                       │
       ▼                       │
┌─────────────┐         ┌─────────────┐
│CompanyValue │         │    User     │
│             │         │             │
└─────────────┘         └─────────────┘
                               │
                               │ N:M
                               │
                        ┌──────┴──────┐
                        │             │
                        ▼             ▼
                 ┌─────────────┐ ┌─────────────┐
                 │Participation│ │   Event     │
                 │             │ │             │
                 └─────────────┘ └─────────────┘
                        │             ▲
                        │             │ N:1
                        │             │
                        ▼             │
                 ┌─────────────┐ ┌─────────────┐
                 │  Feedback   │ │  Activity   │
                 │             │ │  (Template) │
                 └─────────────┘ └─────────────┘
```

### 4.2 Key Entities

**User (Built-in):**
```json
{
  "id": "uuid",
  "email": "string (unique)",
  "full_name": "string",
  "role": "admin | user",
  "created_date": "timestamp",
  "updated_date": "timestamp"
}
```

**UserProfile:**
```json
{
  "id": "uuid",
  "user_email": "string (FK to User)",
  "role": "string (job title)",
  "department": "enum",
  "manager_email": "string",
  "bio": "string",
  "skills": "array<object>",
  "engagement_metrics": {
    "total_events_attended": "number",
    "recognition_given": "number",
    "recognition_received": "number",
    "engagement_score": "number (0-100)"
  }
}
```

**Recognition:**
```json
{
  "id": "uuid",
  "recognizer_email": "string",
  "recipient_email": "string",
  "message": "string (20-500 chars)",
  "company_value": "string (optional)",
  "visibility": "public | private",
  "points_awarded": "number (default: 50)",
  "created_date": "timestamp"
}
```

**Event:**
```json
{
  "id": "uuid",
  "activity_id": "uuid (FK to Activity)",
  "title": "string",
  "scheduled_date": "timestamp",
  "duration_minutes": "number",
  "status": "enum",
  "event_format": "online | offline | hybrid",
  "max_participants": "number (optional)",
  "facilitator_email": "string",
  "points_awarded": "number (default: 10)"
}
```

### 4.3 Data Access Patterns

**Hot Path (High Frequency):**
```sql
-- User profile lookup (cached 5 min)
SELECT * FROM UserProfile WHERE user_email = ?;

-- Recognition feed (paginated)
SELECT * FROM Recognition 
WHERE visibility = 'public' 
ORDER BY created_date DESC 
LIMIT 20 OFFSET ?;

-- User points (cached 5 min)
SELECT points, level FROM UserPoints WHERE user_email = ?;
```

**Cold Path (Low Frequency):**
```sql
-- Analytics aggregation (cached 30 min)
SELECT department, AVG(engagement_score) 
FROM UserProfile 
GROUP BY department;

-- Historical event data
SELECT * FROM Event 
WHERE status = 'completed' 
AND scheduled_date < NOW() - INTERVAL '30 days';
```

### 4.4 Data Retention Policy

| Entity | Retention Period | Anonymization |
|--------|------------------|---------------|
| User | Account lifetime + 30 days | Email hashed after deletion |
| Recognition | Indefinite | N/A (public data) |
| Survey Responses | 1 year | Anonymized after 1 year |
| Events | 2 years | Participant list removed after 2 years |
| Audit Logs | 2 years | User identifiers hashed |
| Analytics Snapshots | Indefinite | Aggregated, no PII |

---

## 5. Integration Architecture

### 5.1 Integration Patterns

**Pattern 1: Webhook (Push)**
```
External Service → Webhook Endpoint → Validate → Process → Store
                                      ↓
                                   Signature
                                  Verification
```

**Pattern 2: API Call (Pull)**
```
Scheduled Function → API Client → External Service → Parse → Store
                                      ↓
                                   Rate Limit
                                   (Retry Logic)
```

**Pattern 3: Real-Time Subscription**
```
Client → WebSocket → Base44 → Entity Change → Push to Client
                               ↓
                          Filter by User
```

### 5.2 Slack Integration

**Architecture:**
```
INTeract → Slack API → Workspace
   ↓
Recognition
Posted
   ↓
Send Webhook
   ↓
Slack Channel
```

**Implementation:**
```javascript
// functions/sendSlackNotification.js
export default async function(req) {
  const { channel, message } = await req.json();
  
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SLACK_BOT_TOKEN')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ channel, text: message })
  });
  
  return Response.json({ success: response.ok });
}
```

### 5.3 Google Calendar Integration

**OAuth Flow:**
```
1. User clicks "Connect Google Calendar"
2. Redirect to Google OAuth consent
3. User approves calendar access
4. Google returns authorization code
5. Exchange code for access token
6. Store token (encrypted) in Base44
7. Use token for calendar API calls
```

**Event Sync:**
```javascript
// functions/syncToGoogleCalendar.js
export default async function(req) {
  const { eventId } = await req.json();
  
  // Get event details
  const event = await base44.entities.Event.get(eventId);
  
  // Get user's calendar token
  const token = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
  
  // Create calendar event
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: event.title,
      start: { dateTime: event.scheduled_date },
      end: { dateTime: addMinutes(event.scheduled_date, event.duration_minutes) }
    })
  });
  
  return Response.json({ calendarEventId: response.id });
}
```

### 5.4 AI Integration (OpenAI)

**Rate Limiting:**
```javascript
// Token bucket algorithm
const rateLimit = {
  capacity: 100,    // 100 requests
  refillRate: 10,   // per minute
  currentTokens: 100
};

async function callOpenAI(prompt) {
  if (rateLimit.currentTokens < 1) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimit.currentTokens--;
  
  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: { ... }
  });
  
  return response;
}
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌──────┐                           ┌──────┐
│Client│                           │ SSO  │
└──┬───┘                           └──┬───┘
   │ 1. Access app                    │
   ├─────────────────────────────────►│
   │                                   │
   │ 2. Redirect to SSO                │
   │◄──────────────────────────────────┤
   │                                   │
   │ 3. User authenticates             │
   ├──────────────────────────────────►│
   │                                   │
   │ 4. SAML assertion / OAuth token   │
   │◄──────────────────────────────────┤
   │                                   │
   │ 5. Exchange for session           │
   ├─────────────────────────────────►┌┴───────┐
   │                                  │Base44  │
   │ 6. Session cookie (httpOnly)     │Platform│
   │◄─────────────────────────────────┤        │
   │                                  └────────┘
```

### 6.2 Authorization (RBAC)

**Role Hierarchy:**
```
admin
  ├── Full access to all features
  ├── User management
  ├── Gamification configuration
  └── Analytics (all departments)

facilitator
  ├── Team management
  ├── Event creation
  ├── Team analytics
  └── Recognition

participant
  ├── Profile management
  ├── Recognition (give/receive)
  ├── Event RSVP
  └── Survey participation
```

**Permission Matrix:**
```yaml
Entity: Recognition
  Create:
    - All roles
  Read:
    - Public: All roles
    - Private: recognizer OR recipient OR admin
  Update:
    - None (immutable)
  Delete:
    - recognizer OR admin (within 5 minutes)

Entity: Event
  Create:
    - admin, facilitator
  Read:
    - All roles
  Update:
    - facilitator (own events) OR admin
  Delete:
    - facilitator (own events, if no RSVPs) OR admin

Entity: Survey
  Create:
    - admin only
  Read:
    - All roles (individual surveys)
    - admin only (aggregated results)
  Update:
    - admin only
  Delete:
    - admin only
```

### 6.3 Data Encryption

**In Transit:**
- TLS 1.3 for all HTTPS traffic
- WebSocket Secure (WSS) for real-time
- Certificate pinning for mobile app

**At Rest:**
- Database: AES-256 encryption (managed by Base44)
- Storage: Server-side encryption (SSE-S3)
- Secrets: Encrypted with KMS
- Backups: Encrypted with separate key

### 6.4 Input Validation

**Frontend Validation:**
```javascript
// Zod schema
const recognitionSchema = z.object({
  recipient: z.string().email(),
  message: z.string().min(20).max(500),
  value: z.enum(['collaboration', 'innovation', 'customer-focus']),
  visibility: z.enum(['public', 'private'])
});
```

**Backend Validation:**
```javascript
// Backend function
export default async function(req) {
  const body = await req.json();
  
  // Validate inputs
  if (!body.message || body.message.length < 20) {
    return Response.json({ error: 'Message too short' }, { status: 400 });
  }
  
  // Sanitize HTML (prevent XSS)
  const sanitized = DOMPurify.sanitize(body.message);
  
  // Continue processing...
}
```

---

## 7. Deployment Architecture

### 7.1 Deployment Pipeline

```
┌────────────┐
│   GitHub   │
│ Repository │
└─────┬──────┘
      │
      │ git push
      ▼
┌────────────┐
│   GitHub   │
│  Actions   │
│    CI/CD   │
└─────┬──────┘
      │
      ├─ npm install
      ├─ npm run lint
      ├─ npm test
      ├─ npm run build
      │
      ▼
┌────────────┐
│   Build    │
│  Artifacts │
│   (dist/)  │
└─────┬──────┘
      │
      │ base44 deploy
      ▼
┌────────────┐
│   Base44   │
│  Platform  │
└─────┬──────┘
      │
      ├─ Deploy frontend (CDN)
      ├─ Deploy functions (Edge)
      └─ Run migrations (DB)
      
      ▼
┌────────────┐
│ Production │
│   Live     │
└────────────┘
```

### 7.2 Environment Strategy

| Environment | Purpose | URL | Data |
|-------------|---------|-----|------|
| Development | Local dev | localhost:5173 | Mock data |
| Staging | Pre-prod testing | staging.intinc-engage.com | Sanitized prod data |
| Production | Live app | intinc-engage.com | Real data |

### 7.3 Blue-Green Deployment

```
┌─────────────────────────────────────────┐
│            Load Balancer                 │
└───────┬─────────────────────┬───────────┘
        │                     │
        │                     │
┌───────▼────────┐   ┌────────▼──────────┐
│  Blue (v1.9)   │   │  Green (v2.0)     │
│  ┌──────────┐  │   │  ┌──────────┐     │
│  │ Frontend │  │   │  │ Frontend │     │
│  └──────────┘  │   │  └──────────┘     │
│  ┌──────────┐  │   │  ┌──────────┐     │
│  │ Functions│  │   │  │ Functions│     │
│  └──────────┘  │   │  └──────────┘     │
└────────────────┘   └───────────────────┘
     ▲ 100% traffic        ▲ 0% traffic
     │                     │
     │ After validation:   │
     │ Switch to 0%        │ Switch to 100%
```

---

## 8. Performance Architecture

### 8.1 Caching Strategy

**Multi-Layer Caching:**
```
Request
  │
  ├─► Browser Cache (1 day)
  │   └─ Static assets (JS, CSS, images)
  │
  ├─► CDN Cache (24 hours)
  │   └─ HTML, fonts, media
  │
  ├─► React Query Cache (5 min)
  │   └─ API responses
  │
  └─► Database Query Cache (1 min)
      └─ Frequently accessed data
```

**Cache Invalidation:**
```javascript
// Optimistic update on mutation
const mutation = useMutation({
  mutationFn: createRecognition,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['recognition']);
    
    // Optimistically update cache
    queryClient.setQueryData(['recognition'], (old) => [...old, newData]);
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['recognition'], context.previous);
  },
  onSettled: () => {
    // Refetch to sync with server
    queryClient.invalidateQueries(['recognition']);
  }
});
```

### 8.2 Database Optimization

**Indexing Strategy:**
```sql
-- User lookup (most frequent)
CREATE INDEX idx_user_email ON UserProfile(user_email);

-- Recognition feed (sorted by date)
CREATE INDEX idx_recognition_date ON Recognition(created_date DESC);

-- Event calendar (date range queries)
CREATE INDEX idx_event_date ON Event(scheduled_date);

-- Leaderboard (frequent sorting)
CREATE INDEX idx_points ON UserPoints(points DESC);
```

**Query Optimization:**
```sql
-- Before: N+1 query problem
SELECT * FROM Event WHERE id = 1;
SELECT * FROM Participation WHERE event_id = 1;
SELECT * FROM Participation WHERE event_id = 2;
-- ... (100 queries)

-- After: Join with pagination
SELECT e.*, p.user_email, p.rsvp_status
FROM Event e
LEFT JOIN Participation p ON e.id = p.event_id
WHERE e.scheduled_date > NOW()
LIMIT 20;
```

### 8.3 Frontend Performance

**Code Splitting:**
```javascript
// Lazy load routes
const Analytics = lazy(() => import('./pages/Analytics'));
const GamificationAdmin = lazy(() => import('./pages/GamificationAdmin'));

// Route-based splitting
<Route path="/Analytics" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Analytics />
  </Suspense>
} />
```

**Image Optimization:**
```javascript
// Use WebP with fallback
<picture>
  <source srcSet="/badge.webp" type="image/webp" />
  <img src="/badge.png" alt="Badge" loading="lazy" />
</picture>

// Lazy load images below fold
<img src="/event.jpg" loading="lazy" />
```

**Bundle Size:**
```
Target: < 500KB initial bundle
  - vendor.js: 200KB (React, React Router, React Query)
  - ui.js: 150KB (Radix UI, Framer Motion)
  - app.js: 100KB (Application code)
  - styles.css: 50KB (Tailwind, purged)
```

---

## 9. Scalability Considerations

### 9.1 Horizontal Scaling

**Serverless Auto-Scaling:**
```
Concurrent Users:  1 → 10,000
Backend Functions: Auto-scale 0 → ∞
Database:          Connection pooling (max 100)
Storage:           Unlimited (S3)
```

**Read Replica Strategy:**
```
┌────────────┐
│   Writes   │
│  (Primary) │
└─────┬──────┘
      │
      ├─ Replicate ─────┐
      │                 │
      ▼                 ▼
┌────────────┐    ┌────────────┐
│   Reads    │    │   Reads    │
│ (Replica 1)│    │ (Replica 2)│
└────────────┘    └────────────┘
```

### 9.2 Database Partitioning

**Sharding Strategy (Future):**
```
User Data:       Shard by user_email hash
Recognition:     Shard by created_date (time-series)
Events:          Shard by scheduled_date
Analytics:       Separate OLAP database
```

### 9.3 Rate Limiting

**Per-User Limits:**
```javascript
// API rate limits
const limits = {
  anonymous: 10,      // requests per minute
  authenticated: 100,
  admin: 1000
};

// Function-specific limits
const recognitionLimit = {
  maxPerDay: 50,      // max recognitions per user per day
  minInterval: 10     // seconds between recognitions
};
```

---

## 10. Technical Decisions

### 10.1 Architecture Decision Records (ADRs)

**ADR-001: Use React Query for Server State**

**Status:** Accepted  
**Date:** 2025-06-01

**Context:**
Need client-side state management for API data with caching, optimistic updates, and real-time sync.

**Decision:**
Use React Query instead of Redux or MobX.

**Rationale:**
- Built-in caching and background refetching
- Optimistic updates with automatic rollback
- Smaller bundle size than Redux
- Better TypeScript support

**Consequences:**
- Team needs to learn React Query patterns
- Migration from any existing Redux code
- Dependency on third-party library

---

**ADR-002: Serverless Backend on Base44**

**Status:** Accepted  
**Date:** 2025-05-15

**Context:**
Need to choose between traditional server (Node.js on AWS) vs. serverless (Base44 Platform).

**Decision:**
Use Base44 Platform with Deno Deploy functions.

**Rationale:**
- No server management overhead
- Automatic scaling for variable load
- Global edge deployment
- Built-in auth, database, storage

**Consequences:**
- Vendor lock-in to Base44
- Cold start latency (mitigated by edge functions)
- Limited control over infrastructure

---

**ADR-003: PostgreSQL over NoSQL**

**Status:** Accepted  
**Date:** 2025-05-10

**Context:**
Choose database: PostgreSQL (relational) vs. MongoDB (document).

**Decision:**
Use PostgreSQL.

**Rationale:**
- Complex relationships (users, events, recognition, teams)
- ACID compliance for financial transactions (rewards)
- Strong consistency needed for analytics
- Better tooling and expertise

**Consequences:**
- Schema migrations required
- Harder to scale horizontally (mitigated by read replicas)

---

**ADR-004: Tailwind CSS for Styling**

**Status:** Accepted  
**Date:** 2025-05-05

**Context:**
Choose styling approach: CSS-in-JS, Styled Components, or Tailwind.

**Decision:**
Use Tailwind CSS.

**Rationale:**
- Utility-first enables rapid prototyping
- Consistent design system
- Smaller bundle size (purged unused classes)
- Mobile-responsive utilities

**Consequences:**
- HTML classes can be verbose
- Learning curve for team
- Need to configure PurgeCSS properly

---

### 10.2 Open Technical Questions

| Question | Status | Owner | Target Date |
|----------|--------|-------|-------------|
| Should we implement GraphQL for flexible queries? | Under Review | Backend Lead | Q2 2026 |
| Move to Kubernetes for more control? | Deferred | DevOps | Q4 2026 |
| Add Redis for caching layer? | Investigating | Backend | Q3 2026 |
| Migrate to TypeScript? | Approved | Frontend | Q2 2026 |

---

**Document Approvals:**

- Engineering Lead: ✅ Approved
- CTO: ✅ Approved
- DevOps Lead: ✅ Approved
- Security Lead: ✅ Approved

**Next Review Date:** 2026-04-22