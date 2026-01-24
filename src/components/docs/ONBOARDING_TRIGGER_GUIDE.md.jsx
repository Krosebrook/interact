# Onboarding System Trigger Guide
## INTeract Platform - New User Onboarding

**Version:** 1.0  
**Last Updated:** 2026-01-24  
**Status:** Active

---

## Overview

The INTeract platform features an AI-guided onboarding system that automatically triggers for new users after their first successful login. This guide documents how and when onboarding is triggered.

---

## Architecture

### Component Hierarchy

```
Layout (All Protected Pages)
  └─ OnboardingProvider (Conditional: user authenticated)
       ├─ OnboardingModal (AI-guided tutorial)
       ├─ OnboardingProgress (Progress indicator)
       └─ AIOnboardingAssistant (Contextual tips widget)
```

### Page Classification

**Public Pages (No Onboarding):**
- `/Splash`
- `/Landing`
- `/MarketingHome`
- `/Product`
- `/Blog`
- `/CaseStudies`
- `/Whitepapers`
- `/Resources`

**Protected Pages (Onboarding Enabled):**
- All other pages (Dashboard, Profile, Calendar, etc.)
- Onboarding components only render if `user` exists

---

## Trigger Conditions

### New User Detection

**Definition:** A user is considered "new" if their account was created within the last **10 minutes**.

```javascript
const userCreatedDate = new Date(user.created_date);
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
const isNewUser = userCreatedDate > tenMinutesAgo;
```

**Why 10 minutes?**
- Covers typical signup-to-first-login duration
- Prevents re-triggering for returning users
- Allows time for email verification flows

---

## Auto-Trigger Logic

### OnboardingProvider Auto-Start

**File:** `components/onboarding/OnboardingProvider.jsx`

```javascript
useEffect(() => {
  // 1. Wait for user data to load
  if (userLoading || !user) return;
  
  // 2. Skip if onboarding already completed
  if (localStorage.getItem(`onboarding_completed_${user.email}`)) return;
  
  // 3. Skip if user previously dismissed/skipped
  if (localStorage.getItem(`onboarding_skipped_${user.email}`)) return;
  
  // 4. Check if user is "new" (< 10 min old)
  const userCreatedDate = new Date(user.created_date);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const isNewUser = userCreatedDate > tenMinutesAgo;
  
  // 5. Auto-trigger for new users only
  if (isNewUser) {
    const timer = setTimeout(() => {
      setShowOnboarding(true);
      setTutorialMode(true);
    }, 1500); // Delay for smooth post-login transition
    
    return () => clearTimeout(timer);
  }
}, [user, userLoading]);
```

### AIOnboardingAssistant Auto-Show

**File:** `components/onboarding/AIOnboardingAssistant.jsx`

```javascript
useEffect(() => {
  if (!user) return;
  
  // Check if user has seen AI assistant before
  const hasSeenOnboarding = localStorage.getItem(`seen_ai_onboarding_${user.email}`);
  if (hasSeenOnboarding) {
    setDismissed(true);
    return;
  }
  
  // Auto-show for new users (< 10 min old)
  const userCreatedDate = new Date(user.created_date);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const isNewUser = userCreatedDate > tenMinutesAgo;
  
  if (!isNewUser) {
    setDismissed(true); // Hide for existing users
  }
}, [user]);
```

---

## Timing & Delays

### Post-Login Timeline

```
User completes SSO login
  ↓ (0 ms)
Redirect to protected page (e.g., /Dashboard)
  ↓ (0 ms)
ProtectedRoute checks auth, user loads
  ↓ (~200-500 ms)
Layout renders with OnboardingProvider
  ↓ (0 ms)
OnboardingProvider detects new user
  ↓ (1500 ms delay)
OnboardingModal appears
  ↓ (immediately)
AIOnboardingAssistant appears (bottom-right)
```

**Why 1500ms delay?**
- Allows dashboard UI to render smoothly
- Prevents jarring immediate popup
- Gives user a moment to orient themselves

---

## LocalStorage Keys

### Per-User Keys

All onboarding state is stored per user email to support multiple accounts:

```javascript
// Onboarding completed (user finished full tutorial)
localStorage.setItem(`onboarding_completed_${user.email}`, 'true');

// Onboarding skipped (user dismissed without completing)
localStorage.setItem(`onboarding_skipped_${user.email}`, 'true');

// AI Assistant seen (user dismissed AI guide widget)
localStorage.setItem(`seen_ai_onboarding_${user.email}`, 'true');
```

---

## User Flows

### Flow 1: Brand New User (Just Signed Up)

```
1. User clicks "Start Free Trial" on Landing page
2. SSO redirect to auth provider
3. User creates account (created_date = NOW)
4. Auth completes, redirect to /Dashboard
5. ProtectedRoute loads user data
6. OnboardingProvider detects: isNewUser = true
7. After 1.5s, OnboardingModal appears
8. AIOnboardingAssistant appears in bottom-right
9. User completes or skips tutorial
10. localStorage keys set to prevent re-showing
```

---

### Flow 2: Returning User (Logged Out, Logs Back In)

```
1. User navigates to /Dashboard (logged out)
2. ProtectedRoute redirects to login
3. User completes SSO login
4. Redirect back to /Dashboard
5. OnboardingProvider loads user data
6. Detects: created_date > 10 minutes ago → NOT new user
7. Detects: onboarding_completed_${email} exists
8. No onboarding shown ✅
```

---

### Flow 3: Manual Trigger (Help Button)

```
1. User clicks "Help" icon in header (OnboardingTrigger)
2. Dropdown menu appears
3. User clicks "Start AI-Guided Tutorial"
4. Calls startTutorial():
   - setTutorialMode(true)
   - setShowOnboarding(true)
5. OnboardingModal appears
6. User can replay tutorial anytime
```

---

## Component Responsibilities

### OnboardingProvider

**Responsibilities:**
- Detects new users
- Manages onboarding state (step progression, completion)
- Provides context to child components
- Auto-triggers for new users only

**Does NOT:**
- Render UI directly
- Make API calls
- Handle authentication

---

### OnboardingModal

**Responsibilities:**
- Renders AI-guided tutorial steps
- Shows spotlight highlights on UI elements
- Fetches AI-generated guidance via LLM
- Tracks step completion

**Triggers:**
- Auto: When `showOnboarding && tutorialMode` (new users)
- Manual: Via OnboardingTrigger help button

---

### AIOnboardingAssistant

**Responsibilities:**
- Shows contextual tips and next actions
- Fetches personalized recommendations via backend function
- Displays priority actions, quick wins, recommended features
- Tracks milestone completion

**Triggers:**
- Auto: For new users (< 10 min old)
- Persists: Until user clicks "Got It!" or dismisses

---

### OnboardingProgress

**Responsibilities:**
- Shows persistent progress bar for active tutorial
- Displays current step info
- Provides "Continue Tutorial" button

**Triggers:**
- Only when `isOnboardingActive && currentStep` exists

---

## Role-Based Onboarding

### Different Experiences by Role

**Admin Users:**
```javascript
const onboardingSteps = [
  { title: 'Dashboard Overview', target: '#dashboard' },
  { title: 'User Management', target: '#admin-panel' },
  { title: 'Analytics', target: '#analytics' },
  { title: 'Settings', target: '#settings' }
];
```

**Facilitator Users:**
```javascript
const onboardingSteps = [
  { title: 'Event Calendar', target: '#calendar' },
  { title: 'Activity Templates', target: '#templates' },
  { title: 'Team Insights', target: '#team-leader' }
];
```

**Participant Users:**
```javascript
const onboardingSteps = [
  { title: 'Your Events', target: '#my-events' },
  { title: 'Recognition', target: '#recognition' },
  { title: 'Leaderboards', target: '#leaderboards' },
  { title: 'Profile', target: '#profile' }
];
```

---

## Preventing Issues

### Issue: Onboarding Shows on Public Pages

**Symptom:** OnboardingModal appears on Landing page before login

**Root Cause:** Layout wraps public pages in OnboardingProvider

**Fix:**
```javascript
// Layout.jsx
const isPublicPage = ['Splash', 'Landing', ...].includes(currentPageName);

if (isPublicPage) {
  return <div>{children}</div>; // No OnboardingProvider
}

return (
  <OnboardingProvider>
    {/* Protected content */}
  </OnboardingProvider>
);
```

---

### Issue: Onboarding Re-Triggers on Refresh

**Symptom:** Every page refresh shows onboarding again

**Root Cause:** Not checking localStorage before triggering

**Fix:**
```javascript
if (localStorage.getItem(`onboarding_completed_${user.email}`)) return;
```

---

### Issue: Onboarding Shows for Old Users

**Symptom:** Users who signed up weeks ago see onboarding

**Root Cause:** `isNewUser` check missing or incorrect

**Fix:**
```javascript
const userCreatedDate = new Date(user.created_date);
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
const isNewUser = userCreatedDate > tenMinutesAgo;

if (!isNewUser) return; // Don't trigger for old accounts
```

---

## Manual Testing Checklist

### Test Case 1: New User Signup

**Steps:**
1. Create new test user account
2. Complete SSO login
3. Observe Dashboard load

**Expected:**
- [ ] After 1.5s, OnboardingModal appears
- [ ] AIOnboardingAssistant widget in bottom-right
- [ ] OnboardingProgress bar visible
- [ ] No errors in console

---

### Test Case 2: Returning User

**Steps:**
1. Log in with existing account (> 10 min old)
2. Navigate to Dashboard

**Expected:**
- [ ] No onboarding modal appears
- [ ] No AI assistant widget
- [ ] Normal dashboard view
- [ ] Help button available (manual trigger)

---

### Test Case 3: Public Page Access

**Steps:**
1. Log out completely
2. Navigate to `/Landing`
3. Scroll and interact

**Expected:**
- [ ] No onboarding components visible
- [ ] No modal overlays
- [ ] No AI assistant widget
- [ ] Landing page fully accessible

---

### Test Case 4: Manual Re-Trigger

**Steps:**
1. Logged in (onboarding already completed)
2. Click Help icon in header
3. Select "Start AI-Guided Tutorial"

**Expected:**
- [ ] OnboardingModal appears
- [ ] Tutorial starts from step 1
- [ ] Can complete or skip again
- [ ] No impact on original completion status

---

### Test Case 5: Multi-Account

**Steps:**
1. Complete onboarding with user A
2. Log out
3. Log in with user B (new account)

**Expected:**
- [ ] User B sees onboarding (new user)
- [ ] User A's completion doesn't affect User B
- [ ] Separate localStorage keys per email

---

## Debugging

### Check LocalStorage

```javascript
// In browser console
const userEmail = 'test@example.com';

// Check onboarding status
console.log('Completed:', localStorage.getItem(`onboarding_completed_${userEmail}`));
console.log('Skipped:', localStorage.getItem(`onboarding_skipped_${userEmail}`));
console.log('AI Seen:', localStorage.getItem(`seen_ai_onboarding_${userEmail}`));
```

### Force Re-Trigger Onboarding

```javascript
// Clear all onboarding flags for current user
const userEmail = 'test@example.com';
localStorage.removeItem(`onboarding_completed_${userEmail}`);
localStorage.removeItem(`onboarding_skipped_${userEmail}`);
localStorage.removeItem(`seen_ai_onboarding_${userEmail}`);

// Refresh page
window.location.reload();
```

### Check User Creation Date

```javascript
// In OnboardingProvider
console.log('User created:', new Date(user.created_date));
console.log('Is new user:', isNewUser);
console.log('Minutes since creation:', 
  (Date.now() - new Date(user.created_date).getTime()) / 1000 / 60
);
```

---

## API Integration

### Backend Function: aiOnboardingAssistant

**Endpoint:** `functions/aiOnboardingAssistant.js`

**Triggered By:** AIOnboardingAssistant component

**Purpose:**
- Analyzes user activity and profile
- Generates personalized onboarding recommendations
- Suggests priority actions, quick wins, features to explore

**Response:**
```json
{
  "guidance": {
    "welcome_message": "Welcome aboard! Let's get you started...",
    "priority_actions": [
      {
        "action": "Complete your profile",
        "reason": "Help teammates find and connect with you",
        "feature_path": "UserProfile",
        "cta_text": "Complete Profile",
        "estimated_time": "2 min"
      }
    ],
    "quick_wins": [
      "Send a positive comment on a coworker's recognition post",
      "Browse upcoming events to find team activities"
    ],
    "recommended_features": [
      { "feature_name": "Calendar", "icon": "calendar", "priority": "high" }
    ],
    "personalized_encouragement": "You're off to a great start! 🎉"
  },
  "user_context": {
    "completion_percentage": 15,
    "days_since_signup": 0,
    "milestones_completed": 1,
    "engagement_level": "new"
  }
}
```

---

## Future Enhancements

### Planned Features

1. **Progress Persistence**: Save tutorial progress across sessions
2. **Video Walkthroughs**: Embed video guides for complex features
3. **Interactive Demos**: Sandbox mode to practice actions
4. **Gamified Completion**: Award points/badges for finishing onboarding
5. **A/B Testing**: Test different onboarding flows for effectiveness

---

**Document Owner:** Engineering Team  
**Next Review:** 2026-04-24