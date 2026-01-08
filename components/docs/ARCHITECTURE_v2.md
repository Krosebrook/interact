# INTeract Platform - Production Architecture Documentation

## Executive Summary
INTeract is a production-grade employee engagement platform for remote-first companies (50-200 employees), built with React, Base44 BaaS, and enterprise-grade RBAC.

**Version:** 2.0.0  
**Last Updated:** 2025-12-17  
**Target Companies:** Intinc, Edgewater, and multi-tenant clients

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Authentication & Security](#authentication--security)
3. [Role-Based Access Control (RBAC)](#rbac)
4. [Data Model](#data-model)
5. [User Flows](#user-flows)
6. [Component Architecture](#component-architecture)
7. [Performance & Optimization](#performance--optimization)
8. [Integration Points](#integration-points)
9. [Deployment & Operations](#deployment--operations)

---

## System Architecture

### Tech Stack
```
Frontend:
  - React 18 (Hooks-based, functional components)
  - TanStack Query (server state management)
  - Tailwind CSS + Glassmorphism design system
  - Framer Motion (animations)
  - Lucide React (icons)

Backend:
  - Base44 BaaS (entities, functions, integrations)
  - Deno serverless functions
  - PostgreSQL (via Base44)

External Services:
  - Stripe (payments, subscriptions)
  - OpenAI / Anthropic (AI features)
  - Microsoft Teams / Slack (notifications)
  - Google Calendar (event sync)
```

### Architecture Layers

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                 │
│  (Pages, Components, UI Elements)            │
├─────────────────────────────────────────────┤
│         Business Logic Layer                 │
│  (Hooks, Utils, RBAC, Validation)           │
├─────────────────────────────────────────────┤
│          Data Access Layer                   │
│  (Base44 SDK, React Query, Cache)           │
├─────────────────────────────────────────────┤
│         Backend Services Layer               │
│  (Serverless Functions, Integrations)        │
├─────────────────────────────────────────────┤
│           Data Persistence                   │
│  (PostgreSQL via Base44, Audit Logs)         │
└─────────────────────────────────────────────┘
```

---

## Authentication & Security

### Authentication Flow
1. **SSO Integration** (Azure AD, Google Workspace, Okta)
2. **Invite-Only Provisioning** (no public signup)
3. **Domain Restriction** (@intinc.com, @edgewater.com)
4. **Session Management** (8-hour timeout)

### Security Features
- **JWT-based auth** via Base44
- **HTTPS-only** (enforced)
- **CSRF protection** (Base44 built-in)
- **Rate limiting** (function-level)
- **File upload validation** (10MB, images/PDF only)
- **Audit logging** (all admin actions)
- **Append-only ledger** (points transactions)

### Data Privacy (GDPR/CCPA Compliant)
```javascript
// Privacy settings per user
privacy_settings: {
  profile_visibility: 'team_only' | 'public' | 'private',
  show_activity_history: boolean,
  show_badges: boolean,
  show_points: boolean,
  show_recognition: boolean
}
```

---

## RBAC (Role-Based Access Control)

### Role Hierarchy
```
OWNER (Level 4) - Immutable superuser, defined by email
  └─ Full system access, role management, data export
  
ADMIN (Level 3) - Company administrators
  └─ User management, analytics, system config
  
FACILITATOR (Level 2) - Event organizers
  └─ Create/manage events, view team analytics
  
PARTICIPANT (Level 1) - Employees
  └─ Attend events, earn points, view own data
```

### Permission Matrix
```javascript
PERMISSIONS = {
  // User Management
  INVITE_USERS: [OWNER, ADMIN],
  MANAGE_ROLES: [OWNER],
  SUSPEND_USERS: [OWNER, ADMIN],
  VIEW_ALL_USERS: [OWNER, ADMIN],
  
  // Events
  CREATE_EVENTS: [OWNER, ADMIN, FACILITATOR],
  EDIT_ANY_EVENT: [OWNER, ADMIN],
  DELETE_EVENTS: [OWNER, ADMIN],
  
  // Analytics & Data
  VIEW_ANALYTICS: [OWNER, ADMIN, FACILITATOR],
  EXPORT_DATA: [OWNER, ADMIN],
  EXPORT_SENSITIVE_DATA: [OWNER], // PII only
  
  // Gamification
  MANAGE_BADGES: [OWNER, ADMIN],
  ADJUST_POINTS: [OWNER, ADMIN],
  
  // System
  CONFIGURE_SYSTEM: [OWNER],
  VIEW_AUDIT_LOG: [OWNER, ADMIN]
}
```

### Implementation Files
- `components/lib/rbac/roles.js` - Core RBAC logic
- `components/hooks/useRBACGuard.jsx` - Permission hooks
- `functions/lib/rbacMiddleware.js` - Backend enforcement

---

## Data Model

### Core Entities

#### User (Built-in)
```json
{
  "email": "string (PK)",
  "full_name": "string",
  "role": "admin | user",
  "user_type": "facilitator | participant",
  "created_date": "timestamp"
}
```

#### UserProfile
```json
{
  "user_email": "string (FK)",
  "status": "active | suspended | pending",
  "display_name": "string",
  "avatar_url": "string",
  "department": "string",
  "job_title": "string",
  "privacy_settings": "object",
  "notification_preferences": "object"
}
```

#### UserPoints
```json
{
  "user_email": "string (FK)",
  "total_points": "number",
  "lifetime_points": "number",
  "level": "number (1-10)",
  "streak_days": "number",
  "badges_earned": "array"
}
```

#### PointsLedger (Append-Only)
```json
{
  "user_email": "string (FK)",
  "amount": "number",
  "transaction_type": "enum",
  "reference_id": "string",
  "processed_by": "string",
  "balance_after": "number",
  "metadata": "object"
}
```

#### Event
```json
{
  "activity_id": "string (FK)",
  "title": "string",
  "scheduled_date": "timestamp",
  "status": "draft | scheduled | completed | cancelled",
  "facilitator_email": "string",
  "event_format": "online | offline | hybrid",
  "max_participants": "number"
}
```

#### AuditLog
```json
{
  "action": "enum (user_created, role_changed, etc)",
  "actor_email": "string",
  "target_email": "string",
  "changes": "object (before/after)",
  "severity": "low | medium | high | critical",
  "metadata": "object"
}
```

---

## User Flows

### Onboarding Flow
```
1. Admin sends invite → UserInvitation created
2. User receives email with magic link
3. User clicks link → SSO authentication
4. User selects role (if not pre-assigned)
5. Onboarding checklist appears
6. User completes profile setup
7. Points initialized, welcome notification
```

### Event Creation Flow
```
1. Browse Activities library
2. Select activity template
3. Customize details (date, participants)
4. Generate magic link
5. Send Teams/email notifications
6. Participants RSVP via link
7. Event occurs → attendance tracked
8. Post-event recap + points awarded
```

### Recognition Flow
```
1. User navigates to Recognition page
2. Selects colleague from directory
3. Writes recognition message
4. Chooses visibility (public/team/private)
5. Submits → notification sent
6. Points awarded to both parties
7. Appears in company feed
```

### Points & Leveling Flow
```
1. User completes action (event, feedback, etc)
2. Backend function records transaction
3. PointsLedger entry created (immutable)
4. UserPoints updated (running total)
5. Level recalculated (1-10 tiers)
6. Badge eligibility checked
7. Notification if level-up/badge earned
```

---

## Component Architecture

### Directory Structure
```
components/
├── admin/               # Admin-only components
│   ├── UserManagementPanel.jsx
│   ├── PointsAdjustment.jsx
│   └── BulkUserImport.jsx
├── analytics/           # Charts & metrics
├── common/              # Shared UI components
│   ├── LoadingSpinner.jsx
│   ├── EmptyState.jsx
│   └── StatsGrid.jsx
├── events/              # Event management
├── gamification/        # Badges, leaderboards
├── hooks/               # Custom React hooks
│   ├── useUserData.jsx
│   ├── useEventData.jsx
│   └── useRBACGuard.jsx
├── lib/                 # Core utilities
│   ├── rbac/            # RBAC logic
│   ├── constants/       # Global constants
│   └── utils/           # Helper functions
├── onboarding/          # Guided onboarding
└── profile/             # User profile management
```

### Key Hooks

#### useUserData
```javascript
// Fetches user, profile, points with RBAC routing
const {
  user,
  profile,
  userPoints,
  isAdmin,
  isFacilitator,
  logout
} = useUserData(requireAuth, requireAdmin);
```

#### useEventData
```javascript
// Centralized event data fetching
const {
  events,
  activities,
  participations,
  isLoading,
  refetchEvents
} = useEventData();
```

#### useRBACGuard
```javascript
// Permission checking with redirect
useRBACGuard(user, 'INVITE_USERS', 'Dashboard');

// Get all permissions
const permissions = useUserPermissions(user);
```

---

## Performance & Optimization

### Caching Strategy
```javascript
// React Query config
{
  staleTime: 30000,      // 30s for user data
  cacheTime: 300000,     // 5min cache retention
  refetchOnWindowFocus: false
}
```

### Code Splitting
- Lazy load admin pages (Dashboard, Settings)
- Separate bundles for Facilitator/Participant views
- Dynamic imports for heavy libraries (charts, PDF)

### Database Optimization
- Indexed queries (user_email, event_id, created_date)
- Pagination (default: 20, max: 100)
- Selective field fetching (no over-fetching)

### Image Optimization
- WebP format (Cloudinary integration)
- Lazy loading with intersection observer
- Responsive sizes (mobile/tablet/desktop)

---

## Integration Points

### Microsoft Teams
```javascript
// Send notification
await base44.functions.invoke('sendTeamsNotification', {
  eventId,
  notificationType: 'reminder'
});
```

### Google Calendar
```javascript
// Generate .ics file
await base44.functions.invoke('generateCalendarFile', {
  eventId
});
```

### AI (OpenAI/Anthropic)
```javascript
// Generate activity recommendations
await base44.integrations.Core.InvokeLLM({
  prompt: "Suggest team building activity...",
  response_json_schema: {...}
});
```

### Stripe
```javascript
// Create checkout session
await base44.functions.invoke('createCheckout', {
  priceId,
  userId,
  successUrl,
  cancelUrl
});
```

---

## Deployment & Operations

### Environment Variables
```
BASE44_APP_ID          # Auto-populated
OPENAI_API_KEY         # AI features
STRIPE_SECRET_KEY      # Payments
CLOUDINARY_URL         # Image hosting
TEAMS_WEBHOOK_URL      # Notifications
```

### Monitoring
- Error tracking (Base44 built-in)
- Audit log review (weekly)
- Performance metrics (React Query DevTools)

### Backup & Recovery
- Database backups (Base44 automated)
- Point-in-time recovery (7-day retention)
- Audit log immutability

### Multi-Tenancy Support
```javascript
// Company-specific branding
const COMPANY_CONFIG = {
  intinc: {
    name: 'INTeract',
    domain: 'intinc.com',
    brandColor: '#D97230'
  },
  edgewater: {
    name: 'Edgewater Engage',
    domain: 'edgewater.com',
    brandColor: '#0066CC'
  }
};
```

---

## Changelog

### v2.0.0 (2025-12-17)
- Production-ready RBAC system
- Audit logging & compliance
- Multi-company support
- Performance optimizations
- Comprehensive documentation

### v1.5.0 (2025-11)
- Gamification system
- AI recommendations
- Teams integration

### v1.0.0 (2025-10)
- Initial release
- Core event management
- User profiles

---

## Contributing

### Code Standards
- Functional components only (no class components)
- TypeScript (gradual migration in progress)
- ESLint + Prettier
- Accessibility (WCAG 2.1 AA minimum)

### PR Process
1. Branch from `main`
2. Run tests (`npm test`)
3. Update documentation
4. Submit PR with screenshots
5. Code review (2 approvals required)

---

## Support & Contact

**Technical Lead:** Base44 Development Team  
**Documentation:** This file + inline code comments  
**Issues:** GitHub Issues or Base44 support portal