# Manual Test Checklist - Public Routes & Auth Flow
## INTeract Platform

**Version:** 1.0  
**Test Date:** ____________  
**Tester:** ____________  
**Environment:** Production / Staging

---

## Pre-Test Setup

- [ ] Clear browser cache and cookies
- [ ] Open browser in incognito/private mode
- [ ] Note app URL: ________________________
- [ ] Ensure you have test credentials ready

---

## Test Suite 1: Public Entry Flow

### TC-001: Splash Page Entry (Logged Out)

**Steps:**
1. Navigate to app root URL (e.g., `https://yourapp.com`)
2. Observe what loads first

**Expected:**
- [ ] Splash page appears (NOT login page)
- [ ] Splash shows INTeract logo and "Where Teams Thrive Together"
- [ ] Animated orbs visible in background
- [ ] Loading indicator visible at bottom
- [ ] No auth prompts or redirects

**Duration:** ~1.2 seconds

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

### TC-002: Auto-Navigate to Landing

**Steps:**
1. Continue from TC-001 (wait on Splash)
2. After ~1.2 seconds, observe navigation

**Expected:**
- [ ] Auto-redirect to `/Landing` page
- [ ] Landing page shows full marketing content
- [ ] Navigation bar visible with logo and menu
- [ ] Hero section with "Where Teams Thrive Together" headline
- [ ] Feature cards visible (Recognition, Surveys, Channels, etc.)
- [ ] Footer visible

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

### TC-003: Landing Page Interaction (No Auth)

**Steps:**
1. Scroll through Landing page
2. Click on navigation links (Features, Benefits, Pricing)
3. Do NOT click login buttons yet

**Expected:**
- [ ] All sections scroll smoothly
- [ ] Anchor links work (#features, #benefits, #pricing)
- [ ] Mobile menu toggle works (if on mobile)
- [ ] No auth prompts appear
- [ ] Can stay on Landing indefinitely

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

## Test Suite 2: Authentication Trigger

### TC-004: Login from Landing (CTA)

**Steps:**
1. On Landing page, click "Start Free Trial" hero button
2. Observe redirect

**Expected:**
- [ ] Redirect to SSO login page
- [ ] No errors in console
- [ ] Login page loads successfully

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

### TC-005: Login from Navigation

**Steps:**
1. Return to Landing (logged out)
2. Click "Sign In" button in top navigation
3. Observe redirect

**Expected:**
- [ ] Redirect to SSO login page
- [ ] Same behavior as TC-004

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

### TC-006: Complete Login Flow

**Steps:**
1. Trigger login (from TC-004 or TC-005)
2. Complete SSO authentication
3. Observe post-login landing page

**Expected:**
- [ ] After auth, redirect to `/Dashboard` or `/DawnHub`
- [ ] User sees authenticated dashboard
- [ ] User menu shows name and role
- [ ] Sidebar navigation accessible
- [ ] No errors in console

**Actual Result:**
```
☐ PASS  ☐ FAIL
Landed on: ___________________________________________
```

---

## Test Suite 3: Protected Routes (Direct Access)

### TC-007: Direct Dashboard Access (Logged Out)

**Steps:**
1. Log out (if logged in)
2. Navigate directly to `/Dashboard` in browser
3. Observe behavior

**Expected:**
- [ ] Immediate redirect to login (NOT Dashboard content)
- [ ] URL includes `returnTo` parameter
- [ ] Example: `/auth/login?returnTo=%2FDashboard`
- [ ] No flash of protected content

**Actual Result:**
```
☐ PASS  ☐ FAIL
URL after redirect: ___________________________________________
```

---

### TC-008: Return URL Preservation

**Steps:**
1. Continue from TC-007
2. Complete login process
3. Observe post-login destination

**Expected:**
- [ ] After login, navigate to `/Dashboard` (the returnTo URL)
- [ ] NOT redirected to Splash or Landing
- [ ] Dashboard fully functional

**Actual Result:**
```
☐ PASS  ☐ FAIL
Final URL: ___________________________________________
```

---

### TC-009: Protected Route with Query Params

**Steps:**
1. Log out
2. Navigate to `/Calendar?event=test123`
3. Complete login
4. Verify final URL

**Expected:**
- [ ] Redirect to login with encoded returnTo
- [ ] After login, URL is `/Calendar?event=test123`
- [ ] Query parameters preserved

**Actual Result:**
```
☐ PASS  ☐ FAIL
Final URL: ___________________________________________
```

---

## Test Suite 4: Role-Based Access

### TC-010: Admin Route (Non-Admin User)

**Steps:**
1. Login as regular user (NOT admin)
2. Navigate to `/AdminHub`
3. Observe redirect

**Expected:**
- [ ] ProtectedRoute checks role
- [ ] User redirected to `/Dashboard` (safe page)
- [ ] No error messages shown
- [ ] No flash of admin content

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

### TC-011: Admin Route (Admin User)

**Steps:**
1. Login as admin user
2. Navigate to `/AdminHub`
3. Observe page load

**Expected:**
- [ ] AdminHub renders successfully
- [ ] No redirects
- [ ] Admin functionality accessible

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

## Test Suite 5: Edge Cases

### TC-012: Already Logged In → Splash

**Steps:**
1. Log in successfully (on Dashboard)
2. Manually navigate to `/Splash`
3. Observe behavior

**Expected:**
- [ ] Splash page renders (public route)
- [ ] Auto-navigate to Landing after 1.2s
- [ ] Landing renders normally
- [ ] User still logged in (check user menu)

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

### TC-013: Already Logged In → Landing

**Steps:**
1. Logged in user navigates to `/Landing`
2. Observe page

**Expected:**
- [ ] Landing page renders normally
- [ ] Can access all sections
- [ ] Clicking "Start Free Trial" → already logged in
  - Option A: Navigate to Dashboard
  - Option B: Stay on Landing (no-op)

**Actual Result:**
```
☐ PASS  ☐ FAIL
Behavior: ___________________________________________
```

---

### TC-014: Session Timeout

**Steps:**
1. Log in successfully
2. Wait 8+ hours (or manually clear session cookie)
3. Try to navigate to protected route

**Expected:**
- [ ] Detect session expired
- [ ] Redirect to login with returnTo
- [ ] After re-login, return to intended page

**Actual Result:**
```
☐ PASS  ☐ FAIL
Notes: ___________________________________________
```

---

### TC-015: Logout from Protected Page

**Steps:**
1. Logged in, on `/Dashboard`
2. Click logout button
3. Observe destination

**Expected:**
- [ ] Session cleared
- [ ] Redirect to `/Landing` or `/Splash`
- [ ] Attempting to go back to `/Dashboard` → login required

**Actual Result:**
```
☐ PASS  ☐ FAIL
Landed on: ___________________________________________
```

---

## Test Suite 6: Mobile Responsiveness

### TC-016: Mobile Splash/Landing

**Steps:**
1. Open app on mobile device (or DevTools mobile view)
2. Go through Splash → Landing flow
3. Test interactions

**Expected:**
- [ ] Splash logo/text scales appropriately
- [ ] Landing hero text readable (no overflow)
- [ ] Mobile menu toggle works
- [ ] CTA buttons large enough (44x44px minimum)
- [ ] No horizontal scroll

**Actual Result:**
```
☐ PASS  ☐ FAIL
Device: ___________________________________________
```

---

## Test Suite 7: Browser Compatibility

### TC-017: Cross-Browser Test

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**For Each Browser:**
1. Run TC-001 through TC-006
2. Check console for errors
3. Verify animations work

**Results:**
```
Chrome:  ☐ PASS  ☐ FAIL
Firefox: ☐ PASS  ☐ FAIL
Safari:  ☐ PASS  ☐ FAIL
Edge:    ☐ PASS  ☐ FAIL
```

---

## Performance Checks

### TC-018: Splash Load Time

**Steps:**
1. Clear cache
2. Navigate to `/Splash`
3. Measure time to interactive

**Expected:**
- [ ] Splash visible < 1 second
- [ ] Animations smooth (60fps)
- [ ] No layout shifts

**Actual Load Time:** __________ ms

---

### TC-019: Landing Load Time

**Steps:**
1. Navigate to `/Landing`
2. Measure time to interactive (Chrome DevTools → Performance)

**Expected:**
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s

**Actual Metrics:**
```
FCP: __________ ms
LCP: __________ ms
TTI: __________ ms
```

---

## Accessibility Checks

### TC-020: Keyboard Navigation

**Steps:**
1. On Landing page (logged out)
2. Use only keyboard (Tab, Enter, Escape)
3. Navigate through all interactive elements

**Expected:**
- [ ] All buttons/links focusable
- [ ] Focus indicator visible (3px orange outline)
- [ ] Enter key activates buttons
- [ ] Tab order logical (top to bottom)

**Actual Result:**
```
☐ PASS  ☐ FAIL
Issues: ___________________________________________
```

---

### TC-021: Screen Reader Test

**Steps:**
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate Landing page
3. Trigger login flow

**Expected:**
- [ ] Page title announced
- [ ] Headings have proper hierarchy (H1, H2, H3)
- [ ] Images have alt text
- [ ] Buttons have descriptive labels
- [ ] Form inputs have labels

**Actual Result:**
```
☐ PASS  ☐ FAIL
Issues: ___________________________________________
```

---

## Security Checks

### TC-022: Auth Bypass Attempt

**Steps:**
1. Logged out, open DevTools
2. Try to call API directly: `base44.entities.User.list()`
3. Observe response

**Expected:**
- [ ] API call fails with 401 Unauthorized
- [ ] No user data returned
- [ ] No session token in cookies

**Actual Result:**
```
☐ PASS  ☐ FAIL
Response: ___________________________________________
```

---

### TC-023: Session Cookie Security

**Steps:**
1. Log in successfully
2. Open DevTools → Application → Cookies
3. Inspect `base44_session` cookie

**Expected:**
- [ ] Cookie exists
- [ ] HttpOnly = true
- [ ] Secure = true (if HTTPS)
- [ ] SameSite = Lax or Strict
- [ ] Expiry = 8 hours from login

**Actual Result:**
```
☐ PASS  ☐ FAIL
Cookie attributes: ___________________________________________
```

---

## Sign-Off

**Overall Test Result:**
```
☐ ALL TESTS PASSED - Ready for deployment
☐ MINOR ISSUES - Can deploy with caveats (list below)
☐ MAJOR ISSUES - Do NOT deploy (list blockers below)
```

**Issues Found:**
```
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________
```

**Tester Signature:** ________________________  
**Date:** ________________  
**Approved for Deploy:** ☐ YES  ☐ NO

---

**Next Test Cycle:** After next deployment