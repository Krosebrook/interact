# Routing & Authentication Configuration
## INTeract Platform - Public vs Protected Routes

**Version:** 2.0  
**Last Updated:** 2026-01-23  
**Status:** Active

---

## Overview

The INTeract platform uses a **hybrid routing model**:
- **Public routes**: Accessible without authentication (Splash, Landing, Marketing pages)
- **Protected routes**: Require authentication (Dashboard, Profile, Admin, etc.)
- **Role-restricted routes**: Require specific roles (Admin, Facilitator)

---

## Route Classification

### Public Routes (No Auth Required)

```javascript
const PUBLIC_ROUTES = [
  '/Splash',           // Entry point
  '/Landing',          // Marketing landing page
  '/MarketingHome',    // Marketing home
  '/Product',          // Product page
  '/Blog',             // Blog listing
  '/CaseStudies',      // Case studies
  '/Whitepapers',      // Whitepapers
  '/Resources'         // Resources hub
];
```

**Implementation:**
- These routes render without any auth checks
- No AuthGuard or ProtectedRoute wrapper
- Users can access freely

---

### Protected Routes (Auth Required)

```javascript
const PROTECTED_ROUTES = [
  '/Dashboard',        // Main dashboard
  '/DawnHub',          // Daily dashboard
  '/Recognition',      // Recognition feed
  '/Calendar',         // Events calendar
  '/Teams',            // Team channels
  '/Leaderboards',     // Leaderboards
  '/UserProfile',      // User profile
  '/RewardsStore',     // Points store
  '/Surveys',          // Surveys
  '/Milestones',       // Milestones
  '/LearningDashboard', // Learning paths
  '/Channels',         // Team channels
  // ... all other app pages
];
```

**Implementation:**
```jsx
import ProtectedRoute from '@/components/common/ProtectedRoute';

<Route path="/Dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

### Role-Restricted Routes

**Admin Only:**
```javascript
const ADMIN_ONLY_ROUTES = [
  '/AdminHub',
  '/GamificationAdmin',
  '/ContentModerationAdmin',
  '/Analytics',
  '/AIAdminDashboard',
  '/FeedbackAdmin',
  '/RedemptionAdmin',
  '/AuditLog',
  '/IntegrationsHub'
];
```

**Implementation:**
```jsx
<Route path="/AdminHub" element={
  <ProtectedRoute requireAdmin={true}>
    <AdminHub />
  </ProtectedRoute>
} />
```

**Facilitator Access:**
```javascript
const FACILITATOR_ROUTES = [
  '/FacilitatorDashboard',
  '/EventTemplates',
  '/TeamLeaderDashboard'
];
```

**Implementation:**
```jsx
<Route path="/FacilitatorDashboard" element={
  <ProtectedRoute requireFacilitator={true}>
    <FacilitatorDashboard />
  </ProtectedRoute>
} />
```

---

## Authentication Flow

### 1. Initial App Load (Logged Out)

```
User opens app (/)
    ↓
Router checks route
    ↓
Is route public?
    ├─ YES → Render page (Splash)
    └─ NO → Check auth
              ↓
         Not authenticated
              ↓
         Redirect to login with returnTo
         (/auth/login?returnTo=%2FDashboard)
```

### 2. Splash → Landing Flow

```
User opens app
    ↓
Default route: /Splash (PUBLIC)
    ↓
Render Splash page
    ↓
Auto-redirect after 1.2s
    ↓
Navigate to /Landing (PUBLIC)
    ↓
Render Landing page
    ↓
User clicks "Start Free Trial"
    ↓
base44.auth.redirectToLogin()
    ↓
Redirect to SSO login
    ↓
After login → /Dashboard (or returnTo)
```

### 3. Direct Protected Route Access (Logged Out)

```
User opens /Dashboard directly
    ↓
ProtectedRoute wrapper checks auth
    ↓
base44.auth.me() throws (not authenticated)
    ↓
Capture current path: /Dashboard
    ↓
Encode as returnTo: %2FDashboard
    ↓
Redirect: /auth/login?returnTo=%2FDashboard
    ↓
User completes login
    ↓
Parse returnTo parameter
    ↓
Navigate to /Dashboard
```

### 4. Already Logged In

```
User opens /Splash (logged in)
    ↓
Render Splash (still public, no redirect)
    ↓
Auto-navigate to /Landing
    ↓
User can click "Get Started"
    ↓
OR manually navigate to /Dashboard
```

---

## Component Implementation

### ProtectedRoute Component

**File:** `components/common/ProtectedRoute.jsx`

```jsx
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireFacilitator = false,
  requireParticipant = false
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        // Role-based redirects
        if (requireAdmin && currentUser.role !== 'admin') {
          window.location.href = '/Dashboard';
          return;
        }
        
        if (requireFacilitator && !['admin', 'facilitator'].includes(currentUser.role)) {
          window.location.href = '/ParticipantPortal';
          return;
        }
        
        if (requireParticipant && currentUser.role === 'admin') {
          window.location.href = '/Dashboard';
          return;
        }
        
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        // Redirect to login with return URL
        const returnTo = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        base44.auth.redirectToLogin(`?returnTo=${returnTo}`);
      }
    };

    checkAuth();
  }, [requireAdmin, requireFacilitator, requireParticipant]);

  if (loading || !user) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  return <>{children}</>;
}
```

### PublicRoute Component

**File:** `components/routing/PublicRoute.jsx`

```jsx
/**
 * PUBLIC ROUTE WRAPPER
 * Explicitly marks routes as public (no auth required)
 */
export default function PublicRoute({ children }) {
  return <>{children}</>;
}
```

---

## Usage Examples

### App Router Setup

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './components/routing/PublicRoute';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/Splash" element={
          <PublicRoute>
            <Splash />
          </PublicRoute>
        } />
        
        <Route path="/Landing" element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } />

        {/* Default route → Splash */}
        <Route path="/" element={<Navigate to="/Splash" replace />} />

        {/* Protected Routes */}
        <Route path="/Dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/DawnHub" element={
          <ProtectedRoute>
            <DawnHub />
          </ProtectedRoute>
        } />

        {/* Admin Only */}
        <Route path="/AdminHub" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminHub />
          </ProtectedRoute>
        } />

        {/* Facilitator Access */}
        <Route path="/FacilitatorDashboard" element={
          <ProtectedRoute requireFacilitator={true}>
            <FacilitatorDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Return URL Handling

### Post-Login Navigation

**Base44 Platform Behavior:**
When using `base44.auth.redirectToLogin()`, the platform handles:
1. Redirecting to SSO provider
2. Handling OAuth/SAML flow
3. Creating session cookie
4. Parsing `returnTo` query parameter
5. Redirecting to the returnTo URL (or default page)

**Custom Return URL:**
```javascript
// Redirect to login with specific return destination
const returnTo = '/Calendar?event=123';
base44.auth.redirectToLogin(encodeURIComponent(returnTo));
```

**Default Behavior:**
```javascript
// No returnTo specified → goes to platform default (usually /Dashboard)
base44.auth.redirectToLogin();
```

---

## Manual Verification Checklist

### Test Case 1: Fresh User (Logged Out)

**Steps:**
1. Open browser in incognito/private mode
2. Navigate to app root URL
3. ✅ Should see Splash page (not login)
4. ✅ After ~1.2 seconds, auto-navigate to Landing page
5. ✅ Landing page visible without login prompt
6. Click "Start Free Trial" button
7. ✅ Redirect to SSO login
8. Complete login
9. ✅ Redirected to Dashboard (default protected page)

---

### Test Case 2: Direct Protected Route (Logged Out)

**Steps:**
1. Open browser in incognito mode
2. Navigate directly to `/Dashboard`
3. ✅ Should redirect to login immediately (not render Dashboard)
4. ✅ URL should include `?returnTo=%2FDashboard`
5. Complete login
6. ✅ After auth, user lands on `/Dashboard` (not Splash)

---

### Test Case 3: Already Logged In

**Steps:**
1. User is already authenticated
2. Navigate to `/Splash`
3. ✅ Splash renders (public route, no redirect)
4. Auto-navigate to `/Landing`
5. ✅ Landing renders
6. Manually navigate to `/Dashboard`
7. ✅ Dashboard renders immediately (no login)

---

### Test Case 4: Role-Based Access

**Steps:**
1. Login as regular user (not admin)
2. Navigate to `/AdminHub`
3. ✅ ProtectedRoute detects insufficient permissions
4. ✅ Redirect to `/Dashboard` (safe landing)

**Steps:**
1. Login as admin
2. Navigate to `/AdminHub`
3. ✅ AdminHub renders (admin role verified)

---

### Test Case 5: Return URL Preservation

**Steps:**
1. Logged out, navigate to `/Calendar?event=abc123`
2. ✅ Redirect to login with `returnTo=%2FCalendar%3Fevent%3Dabc123`
3. Complete login
4. ✅ Navigate to `/Calendar?event=abc123` (query params preserved)

---

## Troubleshooting

### Issue: Infinite redirect loop

**Symptom:** Page keeps redirecting between login and protected route

**Causes:**
1. `base44.auth.me()` always throwing error
2. Session cookie not being set
3. Incorrect returnTo encoding

**Fix:**
```javascript
// Check session cookie in DevTools → Application → Cookies
// Should see: base44_session

// Check if auth.me() works in console
const user = await base44.auth.me();
console.log('User:', user);
```

---

### Issue: Landing page redirects to login

**Symptom:** Landing page shows login screen instead of marketing content

**Cause:** Landing page wrapped in ProtectedRoute or AuthGuard

**Fix:**
```jsx
// WRONG
<Route path="/Landing" element={
  <ProtectedRoute>
    <Landing />
  </ProtectedRoute>
} />

// CORRECT
<Route path="/Landing" element={
  <PublicRoute>
    <Landing />
  </PublicRoute>
} />

// OR (no wrapper needed)
<Route path="/Landing" element={<Landing />} />
```

---

### Issue: Return URL not working

**Symptom:** After login, user goes to Dashboard instead of intended page

**Cause:** returnTo not being parsed by Base44 platform

**Fix:**
```javascript
// Ensure returnTo is properly encoded
const returnTo = encodeURIComponent(window.location.pathname);

// Pass as query parameter (Base44 platform handles parsing)
base44.auth.redirectToLogin(`?returnTo=${returnTo}`);
```

---

## Security Considerations

### 1. Open Redirect Prevention

**Risk:** Malicious returnTo parameter could redirect to external site

**Mitigation:**
```javascript
// Base44 platform validates returnTo is same-origin
// Additional client-side check:
function safeReturnTo(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return '/Dashboard'; // Safe default
    }
    return parsed.pathname;
  } catch {
    return '/Dashboard';
  }
}
```

### 2. Session Timeout

**Configuration:**
- Timeout: 8 hours (configurable in Base44 platform)
- Warning: 5 minutes before expiry
- Auto-refresh: If user active

**Implementation:**
```javascript
// Already implemented in Layout via useSessionTimeout hook
import { useSessionTimeout } from './components/hooks/useSessionTimeout';

function Layout() {
  useSessionTimeout(true); // 8-hour timeout enabled
  // ...
}
```

### 3. CSRF Protection

**Mechanism:**
- Session cookies have `SameSite=Lax` attribute
- Base44 platform validates origin headers
- No additional CSRF tokens needed

---

## Migration Guide

### From Global Auth to Route-Based Auth

**Before (All routes protected):**
```jsx
function App() {
  return (
    <AuthGuard>
      <BrowserRouter>
        <Routes>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Landing" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AuthGuard>
  );
}
```

**After (Selective protection):**
```jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/Landing" element={<Landing />} />
        
        {/* Protected */}
        <Route path="/Dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Future Enhancements

### Planned Features

1. **Route Preloading**: Prefetch protected routes while user is on Landing
2. **Progressive Auth**: Allow partial access without full login (view-only mode)
3. **Remember Last Page**: Auto-return to last visited page on next login
4. **Guest Mode**: Limited read-only access for demos

---

**Document Owner:** Engineering Team  
**Next Review:** 2026-04-23