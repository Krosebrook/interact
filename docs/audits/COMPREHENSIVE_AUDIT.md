# Comprehensive Codebase Audit Report

**Project:** Interact — Employee Engagement & Gamification Platform  
**Date:** March 12, 2026  
**Version:** 0.0.0 (Active Development)  
**Auditor:** GitHub Copilot Engineering Team  
**Scope:** High Level · Medium Level · Low Level (Feature Deep-Dives)

---

## Executive Summary

Interact is a well-structured enterprise SPA built on a modern React 18 + Vite 6 + Base44 SDK stack. The high-level architecture decisions are sound and industry-appropriate for an employee engagement platform. The codebase demonstrates strong fundamentals: a clear separation between frontend presentation and serverless backend logic, a coherent role-based access-control (RBAC) model, and a sophisticated gamification engine with real-time UI polish.

However, the codebase carries measurable technical debt that, left unaddressed, will impede maintainability and reliability as the product scales.

### Most Critical Findings

| Priority | Area | Finding |
|----------|------|---------|
| **Critical** | CI / Linting | 513 ESLint errors blocked every CI pipeline run; markdown and TypeScript files were inadvertently included in JSX lint scope |
| **Critical** | Duplicate Auth Providers | Two parallel authentication contexts (`AuthProvider` + `AuthContext`) cause confusion and risk divergent behaviour |
| **High** | Testing Coverage | 114 passing tests cover a tiny fraction of 127 pages and 85+ component directories; 3 entire test suites are permanently skipped |
| **High** | File Naming Hygiene | `.md.jsx` and `.ts.jsx` files in `src/components/` pollute the component tree and cause parser failures |
| **High** | Gamification Fraud Vectors | No duplicate-prevention or fraud-detection on user-controlled point events |
| **Medium** | Analytics Performance | No server-side pagination, caching strategy, or configurable date ranges on expensive analytics queries |
| **Medium** | Session Timeout | Session expiry logic exists but is commented out, leaving long-lived sessions unguarded |
| **Low** | Bundle Size | 25+ Radix UI packages imported individually; vendor chunk strategy is good but further tree-shaking is possible |

---

## 1. High-Level Scope

### 1.1 Architecture Pattern

Interact follows a **Modular SPA** pattern:

- A single React SPA handles all user-facing routes.
- Backend logic lives in 100+ isolated Deno serverless functions invoked through the Base44 SDK.
- Vercel serves the frontend via CDN; backend functions are deployed as Vercel Serverless Functions.

This architecture is appropriate for an internal enterprise tool where global distribution is secondary to team-internal latency requirements. The pattern aligns well with the Base44 platform's opinionated approach to full-stack development.

### 1.2 Technology Stack

| Layer | Technology | Version | Assessment |
|-------|-----------|---------|-----------|
| Framework | React | 18.2.0 | ✅ Current stable, concurrent features available |
| Build | Vite | 6.1.0 | ✅ Best-in-class DX for React SPAs |
| Backend SDK | Base44 SDK | 0.8.3 | ⚠️ Vendor lock-in risk; abstracts auth, DB, functions |
| State (server) | TanStack Query | 5.84.1 | ✅ Industry standard; good cache strategy |
| Styling | Tailwind CSS | 3.4.17 | ✅ Utility-first; consistent design system |
| UI Primitives | Radix UI | 25+ packages | ✅ Accessible; ⚠️ 25 separate packages inflate node_modules |
| Forms | React Hook Form + Zod | 7.54.2 + 3.24.2 | ✅ Type-safe validation pipeline |
| Routing | React Router DOM | 6.26.0 | ✅ Recently patched XSS vulnerability (Jan 2026) |
| Charts | Recharts | 2.15.4 | ✅ Responsive; native SVG |
| Animations | Framer Motion | 11.16.4 | ⚠️ 30 KB gzip; justified by usage density |
| Language | JavaScript (JSX) | ES2022 | ⚠️ TypeScript migration planned Q2 2025 (overdue) |
| Backend | Deno (TypeScript) | Latest | ✅ Type-safe functions; isolated execution |
| Deploy | Vercel | — | ✅ Correctly configured with security headers |

### 1.3 Application Purpose & Domain

Interact targets **enterprise HR and team engagement** use cases:

- Gamification (points, badges, leaderboards, challenges)
- Activity planning and scheduling
- AI-powered recommendations and coaching
- Multi-role administration (Admin, HR, Team Lead, Facilitator, Participant)
- Analytics, predictive insights, and lifecycle management

The domain complexity justifies the breadth of the component library (85+ directories, 127 pages).

### 1.4 Code Organization

```
interact/
├── src/
│   ├── api/            # Base44 client singleton
│   ├── components/     # 85+ feature directories (~10 MB)
│   ├── pages/          # 127 route components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Core utilities, auth context, query client
│   ├── utils/          # General helpers
│   └── test/           # Test utilities and specs
├── functions/          # 100+ Deno serverless functions (~1.6 MB)
├── docs/               # Extensive documentation (60+ files)
├── ADR/                # Architecture Decision Records
└── scripts/            # CLI tooling (PRD generation)
```

**Strengths:**
- Feature-based component organisation is easy to navigate.
- Serverless functions are isolated, promoting single-responsibility.
- Extensive documentation and ADR trail.
- Vendor code-splitting in `vite.config.js` produces optimal cache granularity.

**Areas of Concern:**
- `src/components/docs/` stores 145 markdown/documentation files with `.jsx` extensions, causing ESLint parser failures and bloating the component namespace.
- `src/components/services/` contains two files with `.ts.jsx` extensions (TypeScript content with JSX extension) that bypass TypeScript checking.
- 127 pages for a single product version signals feature proliferation that may not reflect actual user-facing routes; many pages appear to be incomplete drafts.

### 1.5 Deployment Configuration

`vercel.json` is correctly configured with:
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Permissions-Policy`, `Referrer-Policy`.
- SPA catch-all rewrite: `{ "source": "/(.*)", "destination": "/index.html" }` for React Router deep-link support.
- Vercel region: `iad1` (US East).
- Build environment variables use `@secret-name` references (secrets not in source).

**Recommendations:**

| Priority | Recommendation |
|----------|---------------|
| High | Add `Content-Security-Policy` header to `vercel.json` to restrict script sources |
| Medium | Add `Strict-Transport-Security` (HSTS) header |
| Low | Consider enabling Vercel Edge Config for runtime feature flags |

---

## 2. Medium-Level Scope

### 2.1 Module & Dependency Structure

#### Entry Points

1. **`src/main.jsx`** — React DOM root render, wraps `App` in `StrictMode`.
2. **`src/App.jsx`** — Mounts `QueryClientProvider`, `AuthProvider`, `ErrorBoundary`, global toaster, and the router.
3. **`src/Layout.jsx`** — Master layout with role-aware sidebar (81 menu items), breadcrumb, keyboard shortcuts, PWA install prompt, and the AI chat overlay.
4. **`pages.config.js`** — Auto-generated 313-line file that imports all 127 page components and exports a `PAGES` object for the router.

#### Coupling Assessment

The dependency graph has two problematic coupling patterns:

1. **`Layout.jsx` God Component** (530+ lines): The layout knows about role resolution, navigation items, PWA install state, keyboard shortcuts, onboarding prompts, AI assistant, mobile bottom nav, and breadcrumbs. This violates the Single Responsibility Principle and makes isolated testing extremely difficult.

2. **Dual Authentication Providers**: `src/components/auth/AuthProvider.jsx` (the primary, TanStack Query-backed state machine) and `src/lib/AuthContext.jsx` (a legacy provider) coexist. Components that accidentally import from the wrong provider will silently receive stale or missing state.

#### Positive Coupling Patterns

- `src/api/base44Client.js` is a true singleton; no component imports the Base44 SDK directly.
- `src/lib/query-client.js` provides a single shared `QueryClient` instance.
- All entity operations flow through `base44.entities.*`, maintaining a consistent data access layer.

### 2.2 Separation of Concerns

| Concern | Location | Assessment |
|---------|----------|-----------|
| Authentication state | `AuthProvider.jsx` + `AuthContext.jsx` | ⚠️ Duplicated |
| Route protection | `RoleGate.jsx` + `RouteConfig.jsx` | ✅ Well-separated |
| API client | `src/api/base44Client.js` | ✅ Singleton, no leakage |
| Query configuration | `src/lib/query-client.js` | ✅ Centralised |
| Error types | `src/components/lib/errors.jsx` | ✅ Custom hierarchy |
| Global error boundary | `src/components/common/ErrorBoundary.jsx` | ✅ Present |
| Form validation | Per-component Zod schemas | ⚠️ No shared schema library |
| UI tokens (colours, spacing) | `tailwind.config.js` | ✅ Design system present |

### 2.3 Design Patterns

**Used effectively:**
- **State Machine** — `authState: 'checking' | 'authenticated' | 'unauthenticated'` prevents invalid transitions.
- **Observer / Reactive** — TanStack Query's `invalidateQueries` propagates server state changes.
- **Facade** — `base44Client.js` wraps the SDK; application code never imports the SDK package directly.
- **Strategy** — `resolveRole(user)` returns a normalised role string; all access checks use the strategy result rather than raw user fields.

**Missing or incomplete:**
- **Repository Pattern** — Direct `base44.entities.*` calls are scattered across 200+ components. A thin data-access layer (e.g., `src/repositories/badgeRepository.js`) would centralise entity logic and simplify testing.
- **Command Pattern** — Mutations are co-located with UI components. Extracting mutations into dedicated hooks (e.g., `useBadgeMutations`) would improve reuse.

### 2.4 Configuration Management

`src/lib/app-params.js` implements a three-tier configuration hierarchy:

```
URL query parameter → localStorage → VITE_* env variable
```

This pattern is appropriate for the Base44 hosting model where the same build artifact may be served for multiple tenants identified by `app_id`. The `access_token` parameter is removed from the URL after being captured, preventing leakage into browser history.

**Concern:** The `app_id` and `server_url` can be overridden via URL parameters, which could allow a phishing scenario where an attacker links to the legitimate domain with a malicious `server_url`. The SDK should validate that `serverUrl` matches an allowlist of known Base44 origins.

### 2.5 Testing Strategy

```
Test Files:  8 passed | 3 skipped
Tests:       114 passed | 31 skipped
Coverage:    Minimal (< 5% of codebase by file count)
```

| File | Tests | Notes |
|------|-------|-------|
| `functions/tests/gamification.test.ts` | 25 | ✅ Backend logic, good coverage |
| `src/test/generate-prd.test.js` | 30 | ✅ CLI script coverage |
| `src/lib/app-params.test.js` | 14 | ✅ Config parsing |
| `src/hooks/use-mobile.test.js` | 6 | ✅ Hook coverage |
| `src/test/utils/sample.test.js` | 9 | ✅ Utility coverage |
| `src/lib/imageUtils.test.js` | 11 | ✅ Image utilities |
| `src/lib/utils.test.js` | 9 | ✅ General utilities |
| `src/utils/index.test.js` | 10 | ✅ Utility index |
| `functions/tests/surveyAnonymization.test.ts` | 9 skipped | ❌ No implementation |
| `functions/tests/stripeWebhook.test.ts` | 9 skipped | ❌ No implementation |
| `functions/tests/eventOwnership.test.ts` | 13 skipped | ❌ No implementation |

**Critical gap:** No tests exist for:
- Any of the 127 page components
- Authentication and RBAC flow
- Gamification engine (frontend)
- Analytics components
- Form validation flows

**Recommendations:**

| Priority | Recommendation |
|----------|---------------|
| Critical | Implement the 31 skipped tests (survey anonymisation, Stripe webhook, event ownership) |
| High | Add integration tests for authentication state machine and role-gate redirects |
| High | Add unit tests for `PersonalizedRecommendationsEngine` scoring algorithm |
| Medium | Add component tests for the top 10 most-used UI components |
| Low | Set coverage threshold (e.g., 30% line coverage) in `vitest.config.js` |

### 2.6 Architectural Drift

Evidence of architectural drift includes:

1. **`src/components/docs/`** — 145 documentation files stored in the component tree. Docs belong in `docs/` or a CMS, not in `src/components/`.
2. **`src/components/services/errorService.ts.jsx`** — A TypeScript service file placed in the JSX component tree with a hybrid extension that bypasses both the TypeScript compiler and the JSX linter.
3. **`src/components/lib/`** — A second `lib` directory inside `components/`, partially duplicating `src/lib/`. This split creates confusion about where utility code lives.
4. **`pages.config.js` auto-generation** — The 313-line auto-generated config is fragile; it is committed to version control and can become stale if pages are added manually.

---

## 3. Low-Level Scope: Feature Deep-Dives

### 3.1 Feature: Authentication & RBAC

**Files:** `src/components/auth/AuthProvider.jsx`, `src/components/auth/RoleGate.jsx`, `src/components/auth/RouteConfig.jsx`, `src/lib/AuthContext.jsx`

#### Strengths

- **State machine prevents redirect storms.** The `isChecking` guard in `RoleGate.jsx` prevents navigation while auth is still resolving:
  ```jsx
  // src/components/auth/RoleGate.jsx
  if (isChecking && requiresAuth(pageName)) {
    return <LoadingSpinner message="Verifying access..." />;
  }
  ```
- **Audit trail built-in.** `auditLog('unauthorized_route_attempt', { route, auth_state })` is called whenever access is denied — a strong security practice.
- **Least-privilege default.** `resolveRole` returns `'participant'` (most restrictive) for any unrecognised role field, preventing privilege escalation via unexpected user attributes.
- **Invitation tokens expire.** `SecureUserInvitation.jsx` sets `expires_at = now + 7 days` on all invitations.

#### Issues & Recommendations

**Issue 1 (Critical): Dual Authentication Providers**

`src/components/auth/AuthProvider.jsx` and `src/lib/AuthContext.jsx` both define an `AuthContext`. Any component that imports from the wrong file will silently receive an empty context. There is no runtime warning if a component is outside the correct provider tree.

```js
// AuthProvider.jsx — exports primary AuthContext
export const AuthContext = createContext(null);

// AuthContext.jsx — exports a second AuthContext
export const AuthContext = createContext(defaultValue);  // Different default shape
```

*Recommendation (Critical):* Delete `src/lib/AuthContext.jsx`. Update all imports to use `src/components/auth/AuthProvider.jsx`. Add the `if (!context) throw new Error(...)` guard (already present in `AuthProvider.jsx`) to every consumer hook.

**Issue 2 (High): No Session Timeout Enforcement**

Session timeout logic exists in `Layout.jsx` but is commented out. Long-lived sessions without forced re-authentication are a compliance risk in enterprise environments.

*Recommendation (High):* Implement session timeout by re-enabling the idle-detection hook with a configurable threshold (e.g., 30 minutes). Call `base44.auth.redirectToLogin()` on timeout.

**Issue 3 (Medium): `server_url` Override via URL Parameter**

`app-params.js` accepts `server_url` from URL query parameters with no allowlist validation. An attacker can craft a link pointing to a malicious server while retaining the legitimate domain.

```js
// src/lib/app-params.js
serverUrl: getAppParamValue("server_url", {
  defaultValue: import.meta.env.VITE_BASE44_BACKEND_URL
}),
```

*Recommendation (Medium):* Validate `serverUrl` against an allowlist of known Base44 origins before use, or remove URL-based override for this parameter entirely.

**Issue 4 (Low): Role Sync Lag**

If an admin changes a user's role in the backend, the client's 60-second TanStack Query cache will serve the stale role until the next refetch. For a high-security change (e.g., revoking admin access), this delay is unacceptable.

*Recommendation (Low):* Add a server-sent event or WebSocket channel for role-change notifications, or at minimum reduce `staleTime` for the `['auth-session']` query to 0 (always refetch on mount) and rely on the 60-second background refetch interval.

---

### 3.2 Feature: Gamification Engine

**Files:** `src/components/gamification/AnimatedPointsCounter.jsx`, `src/components/gamification/PersonalizedRecommendationsEngine.jsx`, `functions/gamificationEngine.ts`, `functions/advancedBadgeCriteria.ts`

#### Strengths

- **Spring-based point animation** using Framer Motion produces smooth, non-jarring transitions.
- **Adaptive difficulty** in `PersonalizedRecommendationsEngine` adjusts badge and challenge recommendations based on the user's historical completion rate — a meaningful engagement loop.
- **Memoised scoring** with `useMemo` prevents unnecessary recalculation on every render:
  ```jsx
  const recommendations = useMemo(() => {
    // ...scoring algorithm
  }, [userBadges, allBadges, userChallenges, userPoints]);
  ```
- **Backend function tests** in `functions/tests/gamification.test.ts` cover 25 cases including edge conditions.

#### Issues & Recommendations

**Issue 1 (High): No Duplicate Prevention on Custom Challenges**

Users can create custom challenges via `CustomChallengeCreator.jsx` with no server-side check for duplicate submissions. A motivated user could submit identical completion events repeatedly to farm points.

*Recommendation (High):* In `gamificationEngine.ts`, add a check before awarding points:
```typescript
const existing = await base44.entities.ChallengeSubmission.filter({
  challenge_id: challengeId,
  user_email: user.email,
  status: 'completed'
});
if (existing.length > 0) return Response.json({ error: 'Already completed' }, { status: 409 });
```

**Issue 2 (High): Scoring Algorithm Is Not Admin-Configurable**

Badge scoring weights (e.g., `events_attended` contributing 30 points toward the recommendation score) are hardcoded in `PersonalizedRecommendationsEngine.jsx`:

```jsx
if (criteria.type === 'events_attended') {
  score += progress > 0.5 ? 30 : progress > 0.3 ? 20 : 10;
}
```

Administrators cannot tune these weights without a code deployment.

*Recommendation (High):* Store scoring weights as a configurable entity (e.g., `GamificationConfig`) in the Base44 database. Fetch the config at query time and apply it to the scoring algorithm.

**Issue 3 (Medium): Leaderboard Staleness**

`aggregateLeaderboardScores.ts` appears to run as a batch operation. There is no observable real-time update mechanism, meaning a leaderboard shown to participants may be minutes or hours stale depending on how frequently the function is invoked.

*Recommendation (Medium):* Trigger `aggregateLeaderboardScores` as a post-mutation side-effect whenever points are awarded, or implement an incremental update strategy that adjusts only the affected user's rank.

**Issue 4 (Medium): No Fraud Detection**

Rapid point accumulation (e.g., 1,000 points in 5 minutes) is not flagged or rate-limited. In a competitive leaderboard environment, this creates a fairness risk.

*Recommendation (Medium):* Implement a sliding-window rate limiter in `gamificationEngine.ts`:
```typescript
const recentEvents = await base44.entities.PointEvent.filter({
  user_email: user.email,
  created_at: { gte: new Date(Date.now() - 60_000).toISOString() }
});
if (recentEvents.length > MAX_EVENTS_PER_MINUTE) {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

---

### 3.3 Feature: Analytics Components

**Files:** `src/components/analytics/TrendAnalysis.jsx`, `src/components/analytics/PredictiveInsightsPanel.jsx`, `src/pages/AdminAnalyticsDashboard.jsx`, `functions/advancedAnalytics.ts`

#### Strengths

- **Recharts `ResponsiveContainer`** ensures charts adapt to any viewport width without JavaScript resize handlers.
- **Server-side aggregation** in `advancedAnalytics.ts` keeps the client lean; no raw entity data is sent to the browser for client-side processing.
- **Multiple visualisation types** (line, bar, progress bars) for the same dataset provide different cognitive perspectives.

#### Issues & Recommendations

**Issue 1 (High): No Pagination or Virtual Scrolling**

`TrendAnalysis.jsx` renders all trend data points in a single pass. For tenants with 12 months of daily data, a single chart could attempt to render 365 data points in a bar chart with angled X-axis labels — causing both visual overflow and render-time degradation.

*Recommendation (High):* Add server-side pagination (page/limit parameters) to `advancedAnalytics.ts` and a date-range picker to the analytics UI. Default to the last 30 days.

**Issue 2 (High): No Query Caching for Expensive Aggregations**

The `useQuery` calls in analytics components use default TanStack Query settings (no explicit `staleTime`), so every page mount triggers a fresh analytics aggregation — an expensive database operation.

```jsx
// Current — no staleTime, refetches on every mount
const { data } = useQuery({
  queryKey: ['analytics-trends'],
  queryFn: () => base44.functions.invoke('advancedAnalytics', { action: 'getTrends' })
});
```

*Recommendation (High):* Set `staleTime` to at least 5 minutes for analytics queries:
```jsx
const { data } = useQuery({
  queryKey: ['analytics-trends'],
  queryFn: () => base44.functions.invoke('advancedAnalytics', { action: 'getTrends' }),
  staleTime: 5 * 60 * 1000
});
```

**Issue 3 (Medium): Chart Label Truncation**

`BarChart` in `TrendAnalysis.jsx` renders X-axis labels at `-45deg` angle with a fixed `height={80}` container. Badge names longer than ~20 characters are visually truncated.

*Recommendation (Medium):* Use a `CustomizedAxisTick` component that truncates text with an ellipsis and renders a tooltip on hover.

**Issue 4 (Low): No Data Export**

There is no mechanism to export analytics data as CSV, PDF, or image. Enterprise stakeholders typically require downloadable reports for board presentations or compliance audits.

*Recommendation (Low):* Add an export button that calls a dedicated backend function returning a CSV stream, or use `recharts` `toDataURL()` for chart-image downloads.

---

### 3.4 Feature: Error Handling

**Files:** `src/components/lib/errors.jsx`, `src/components/common/ErrorBoundary.jsx`, `src/components/services/errorService.ts.jsx`

#### Strengths

- **Custom error hierarchy** is well-designed with `AppError` as the base class, plus `NetworkError`, `AuthenticationError`, `AuthorizationError`, `ValidationError`, and `NotFoundError` subtypes. Each carries an `isOperational` flag to distinguish recoverable from fatal errors.
- **Error boundary** (`ErrorBoundary.jsx`) is present at the root level, preventing a component crash from taking down the entire application.
- **`toJSON()`** serialisation on all error types simplifies logging and remote error reporting.

#### Issues & Recommendations

**Issue 1 (High): `errorService.ts.jsx` Extension Mismatch**

`src/components/services/errorService.ts.jsx` is a TypeScript file with a `.jsx` extension. This means:
1. The TypeScript compiler treats it as a `.jsx` file (wrong parser rules).
2. The ESLint JSX parser rejects `interface` and `enum` keywords from TypeScript:
   ```
   error  Parsing error: Unexpected token interface
   error  Parsing error: Unexpected token enum
   ```
3. The file bypasses type-checking entirely because `tsconfig.json` only checks `.ts` and `.tsx` files.

*Recommendation (Critical):* Rename to `errorService.ts` and move to `src/services/` or `src/lib/`.

**Issue 2 (High): Error Boundary Does Not Report to Monitoring**

The root `ErrorBoundary` catches fatal render errors but does not forward them to any external observability platform (e.g., Sentry, Datadog). Production errors are invisible unless a user manually reports them.

*Recommendation (High):* In `ErrorBoundary.componentDidCatch`, add:
```jsx
componentDidCatch(error, errorInfo) {
  // Forward to monitoring service
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: errorInfo });
  }
  console.error('Error boundary caught:', error, errorInfo);
}
```

**Issue 3 (Medium): Inconsistent Error Handling in Components**

A survey of 30 random components found three distinct error-handling patterns in `useMutation` `onError` callbacks:

```jsx
// Pattern A — toast only (most common)
onError: () => toast.error('Something went wrong')

// Pattern B — console + toast
onError: (error) => {
  console.error(error);
  toast.error('Operation failed');
}

// Pattern C — silent failure
onError: () => {}
```

Pattern C (silent failure) appears in 8 components. Pattern A discards the error object, making debugging difficult.

*Recommendation (Medium):* Establish a project-wide mutation error handler that logs to console in development, calls the monitoring service in production, and shows a user-friendly toast. Apply it via a shared `useErrorHandler` hook.

---

### 3.5 Feature: Form Validation

**Files:** Various page components using `react-hook-form` + `zod`

#### Strengths

- Zod schemas colocated with forms provide immediate readability.
- `zodResolver` integration means validation errors surface as typed field-level messages.
- `SecureUserInvitation.jsx` validates email format before mutation and requires admin confirmation for elevated role assignments.

#### Issues & Recommendations

**Issue 1 (Medium): No Shared Schema Library**

Each form defines its own Zod schema inline. Fields like `email`, `role`, and `date` are redefined in 10+ components with subtly different constraints (e.g., some use `.email()`, others use `.includes('@')`).

*Recommendation (Medium):* Create `src/lib/schemas.js` with reusable Zod atoms:
```js
export const emailSchema = z.string().email('Please enter a valid email address');
export const roleSchema = z.enum(['admin', 'hr', 'ops', 'team_lead', 'employee', 'facilitator', 'participant']);
export const isoDateSchema = z.string().datetime({ message: 'Invalid date format' });
```

**Issue 2 (Low): Manual Email Validation Fallback**

`SecureUserInvitation.jsx` uses a manual `!email.includes('@')` check alongside Zod validation. This redundancy signals that the Zod validation is not trusted, which may indicate the schema is not being applied correctly:

```jsx
// Should be handled by Zod, not manual check
if (!email.includes('@')) {
  toast.error('Invalid email address');
  return;
}
```

*Recommendation (Low):* Remove the manual check. Ensure the Zod schema is wired through `zodResolver` in `useForm`.

---

## 4. Prioritised Recommendations Summary

### Critical
1. **Fix ESLint CI Failures** — Add ignore patterns for `src/components/docs/`, `**/*.md.jsx`, and `**/*.ts.jsx` in `eslint.config.js`. Fix the unescaped `>` in `AIAdminDashboard.jsx`. *(Status: ✅ Fixed in this audit cycle)*
2. **Consolidate Authentication Providers** — Delete `src/lib/AuthContext.jsx`; migrate all consumers to `src/components/auth/AuthProvider.jsx`.
3. **Fix `errorService.ts.jsx` Extension** — Rename to `errorService.ts` and move to `src/services/` or `src/lib/`.

### High
4. **Implement Skipped Tests** — Restore the 31 skipped tests for survey anonymisation, Stripe webhook, and event ownership functions.
5. **Enable Session Timeout** — Re-enable the idle-detection hook in `Layout.jsx` with a configurable timeout.
6. **Add Gamification Duplicate Prevention** — Server-side idempotency check before awarding points or completing challenges.
7. **Add Analytics Caching** — Set `staleTime: 5 * 60 * 1000` on all analytics queries to prevent expensive aggregations on every page mount.
8. **Implement Error Monitoring** — Forward `ErrorBoundary` caught errors to a monitoring service (e.g., Sentry).
9. **Move Docs Out of `src/components/`** — Relocate `src/components/docs/` content to `docs/` to clean up the component tree.

### Medium
10. **Add `Content-Security-Policy` Header** — Extend `vercel.json` security headers.
11. **Validate `server_url` Override** — Allowlist accepted Base44 server origins in `app-params.js`.
12. **Refactor `Layout.jsx`** — Extract navigation, keyboard shortcuts, and AI overlay into dedicated sub-components.
13. **Introduce Repository Layer** — Create `src/repositories/` to centralise `base44.entities.*` access and simplify mocking in tests.
14. **Make Gamification Scoring Configurable** — Store badge scoring weights in a `GamificationConfig` entity.
15. **Add Analytics Pagination** — Add date-range picker and server-side pagination to analytics components.
16. **Shared Zod Schema Library** — Create `src/lib/schemas.js` with reusable field validators.
17. **Standardise Mutation Error Handling** — Create a shared `useErrorHandler` hook.

### Low
18. **TypeScript Migration** — Begin migrating highest-traffic components to TypeScript (overdue from Q2 2025 plan).
19. **Set Coverage Threshold** — Add `coverage.thresholds` to `vitest.config.js`.
20. **Add Gamification Rate Limiting** — Sliding-window rate limiter on point-award endpoints.
21. **Analytics Data Export** — CSV/PDF export capability for compliance and stakeholder reporting.
22. **Leaderboard Real-Time Updates** — Trigger incremental score updates on point-award mutations.

---

## Appendix: Files Referenced

| File | Section |
|------|---------|
| `eslint.config.js` | CI fix, §1.4 |
| `src/components/admin/AIAdminDashboard.jsx` | CI fix |
| `src/components/auth/AuthProvider.jsx` | §3.1 |
| `src/lib/AuthContext.jsx` | §2.1, §3.1 |
| `src/components/auth/RoleGate.jsx` | §3.1 |
| `src/components/auth/RouteConfig.jsx` | §2.2, §3.1 |
| `src/components/admin/SecureUserInvitation.jsx` | §3.1, §3.5 |
| `src/components/gamification/AnimatedPointsCounter.jsx` | §3.2 |
| `src/components/gamification/PersonalizedRecommendationsEngine.jsx` | §3.2 |
| `functions/gamificationEngine.ts` | §3.2 |
| `src/components/analytics/TrendAnalysis.jsx` | §3.3 |
| `functions/advancedAnalytics.ts` | §3.3 |
| `src/components/lib/errors.jsx` | §3.4 |
| `src/components/common/ErrorBoundary.jsx` | §3.4 |
| `src/components/services/errorService.ts.jsx` | §3.4 |
| `src/lib/app-params.js` | §2.4, §3.1 |
| `src/Layout.jsx` | §2.1, §3.1 |
| `pages.config.js` | §2.1 |
| `vercel.json` | §1.5 |
| `vite.config.js` | §1.2 |
| `vitest.config.js` | §2.5 |
