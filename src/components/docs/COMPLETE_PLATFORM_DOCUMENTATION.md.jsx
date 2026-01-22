# INTeract Employee Engagement Platform
## Complete Documentation v2.0

---

## Table of Contents

### For End Users
1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [User Guide](#3-user-guide)
4. [Feature Reference](#4-feature-reference)
5. [Troubleshooting](#5-troubleshooting)

### For Developers
6. [Architecture Overview](#6-architecture-overview)
7. [Development Setup](#7-development-setup)
8. [Codebase Structure](#8-codebase-structure)
9. [API Reference](#9-api-reference)
10. [Component Library](#10-component-library)
11. [State Management](#11-state-management)
12. [Testing Guide](#12-testing-guide)

### For Operators
13. [Deployment Guide](#13-deployment-guide)
14. [Infrastructure](#14-infrastructure)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [Security & Compliance](#16-security--compliance)
17. [Backup & Recovery](#17-backup--recovery)
18. [Incident Response](#18-incident-response)

### Appendices
19. [Changelog](#19-changelog)
20. [Style Guide](#20-style-guide)
21. [Glossary](#21-glossary)
22. [Contributing Guidelines](#22-contributing-guidelines)

---

# Part I: End User Documentation

## 1. Introduction

### 1.1 What is INTeract?

INTeract is a comprehensive employee engagement platform designed for remote-first organizations. Built specifically for Intinc (50-200 employees), it provides tools for:

- **Peer Recognition**: Celebrate achievements and build culture
- **Pulse Surveys**: Gather anonymous feedback on employee sentiment
- **Team Building**: Organize virtual events and activities
- **Wellness Programs**: Track health goals and challenges
- **Gamification**: Earn points, badges, and rewards for engagement
- **Analytics**: Measure and improve team health

### 1.2 Supported Platforms

| Platform | Minimum Version | Status |
|----------|----------------|--------|
| Web (Desktop) | Chrome 90+, Firefox 88+, Safari 14+ | ✅ Fully Supported |
| Web (Mobile) | iOS Safari 14+, Chrome Android 90+ | ✅ Fully Supported |
| Progressive Web App (PWA) | iOS 14+, Android 8+ | ✅ Beta |
| Slack Integration | Workspace API v2 | ✅ Supported |
| Microsoft Teams | Teams API v1 | ✅ Supported |

### 1.3 Key Features

#### For All Employees
- **Dawn Hub**: Personalized daily dashboard with XP, quests, and streaks
- **Recognition Feed**: Give and receive public shoutouts
- **Team Channels**: Collaborate with your department
- **Event Calendar**: RSVP to virtual events
- **Rewards Store**: Redeem points for perks
- **Learning Paths**: Skill development tracking

#### For Team Leaders
- **Team Analytics**: Monitor team engagement health
- **1:1 Scheduling**: Track coaching conversations
- **Recognition Insights**: See team morale trends
- **Challenge Management**: Create team competitions

#### For HR & Admins
- **Company Analytics**: Engagement metrics across departments
- **Survey Builder**: Create pulse surveys
- **User Management**: Invite and manage employees
- **Content Moderation**: Review flagged content
- **Gamification Config**: Adjust points, badges, rewards

---

## 2. Getting Started

### 2.1 Prerequisites

**For End Users:**
- Email address associated with your company domain
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (minimum 1 Mbps)

**Optional:**
- Slack account (for notifications)
- Microsoft Teams account (for notifications)
- Mobile device (iOS 14+ or Android 8+) for PWA

### 2.2 Account Setup

#### Step 1: Invitation
You'll receive an email invitation from your HR team:

```
Subject: Join INTeract - Your Employee Engagement Platform

Hi [Your Name],

You've been invited to join INTeract! Click the link below to set up your account:

[Set Up Account]

This link expires in 7 days.
```

#### Step 2: Initial Login
1. Click the invitation link
2. You'll be redirected to your company's SSO portal (Azure AD, Google, or Okta)
3. Sign in with your work credentials
4. Accept the terms of service

#### Step 3: Profile Setup
After first login, complete your profile:
- Upload a profile photo (optional)
- Set your department
- Add your role/title
- List skills and interests
- Set notification preferences

#### Step 4: First Run Checklist
- [ ] Complete your profile (80%+ completion recommended)
- [ ] Join at least one team channel
- [ ] Give recognition to a colleague
- [ ] RSVP to an upcoming event
- [ ] Complete the onboarding tutorial

### 2.3 Navigation Overview

#### Main Navigation (Left Sidebar)
```
┌─────────────────────┐
│ 🏠 Dawn Hub         │ Daily dashboard
│ 📊 Dashboard        │ Personal stats
│ 🎯 Activities       │ Events & challenges
│ 📅 Calendar         │ Event schedule
│ 👥 Teams            │ Team channels
│ 🎓 Learning         │ Learning paths
│ 🎁 Recognition      │ Give/receive kudos
│ 🏆 Leaderboards     │ Rankings
│ 🛍️ Rewards Store    │ Redeem points
│ 👤 My Profile       │ Settings
└─────────────────────┘
```

#### Top Navigation Bar
- **Search**: Find people, events, or content
- **Notifications**: Activity alerts (🔔)
- **Help**: Contextual assistance (❓)
- **Feedback**: Submit suggestions (💬)
- **User Menu**: Profile, settings, logout

---

## 3. User Guide

### 3.1 Dawn Hub (Daily Dashboard)

**Purpose**: Your personalized command center for daily engagement.

**Features:**

#### XP & Level System
```
┌────────────────────────────────┐
│ LVL 12 │ RANKED ELITE         │
│ ▓▓▓▓▓▓▓▓▓░░ 75%              │
│ 1,500 / 2,000 XP to Level 13  │
└────────────────────────────────┘
```

- **How XP Works**: Earn XP by attending events, giving recognition, completing surveys
- **Level Benefits**: Unlock badges, rewards, and special challenges
- **XP Calculation**: 
  - Event attendance: +100 XP
  - Recognition given: +50 XP
  - Survey completion: +75 XP
  - Daily login streak bonus: +10 XP/day

#### Daily Quest
```
┌────────────────────────────────┐
│ 🎯 DAILY QUEST                │
│ Maintain your streak!          │
│ Complete one more task         │
│ ▓▓▓▓▓░░░░░ 75%                │
│ Reward: +500 XP                │
└────────────────────────────────┘
```

- New quest generated daily at midnight (your timezone)
- Progress tracked automatically
- Bonus rewards for 7-day completion streak

#### Engagement Stats
| Metric | Description | How to Increase |
|--------|-------------|-----------------|
| **Badges** | Special achievements unlocked | Participate in diverse activities |
| **Quests** | Challenges completed | Check Dawn Hub daily |
| **Social** | Recognition interactions | Give kudos to colleagues |
| **Streak** | Consecutive activity days | Log in and engage daily |

### 3.2 Recognition System

#### Giving Recognition

**Step-by-Step:**
1. Click "🎁 Recognition" in sidebar
2. Click "Give Recognition" button
3. Fill out the form:
   ```
   To: [Search for colleague]
   Message: [What did they do great?]
   Value: [Select company value]
   Visibility: ○ Public  ○ Private
   ```
4. Click "Send Recognition"

**Best Practices:**
- Be specific: "Thanks for debugging the API issue" > "Great job!"
- Tag relevant company values (Innovation, Collaboration, etc.)
- Use public recognition to boost team morale
- Send weekly, not just during reviews

**Character Limits:**
- Minimum: 20 characters
- Maximum: 500 characters
- Emoji: ✅ Supported

#### Receiving Recognition
- Notifications: Email + in-app alert
- Visibility: Appears on your profile and company feed
- Points: +50 XP for each recognition received
- Privacy: Can hide from public feed in settings

### 3.3 Team Channels

#### Joining Channels
1. Navigate to "👥 Teams"
2. Browse available channels:
   ```
   📢 #general          1,234 members
   💻 #engineering      89 members
   🎨 #design           23 members
   🎉 #social           456 members
   ```
3. Click "Join Channel"

#### Channel Features
- **Messages**: Team discussions and announcements
- **Files**: Shared documents and resources
- **Polls**: Quick team decisions
- **Integrations**: Slack/Teams sync

**Channel Etiquette:**
- Keep conversations on-topic
- Use @mentions sparingly
- React with emoji instead of "+1" messages
- Check pinned messages for important info

### 3.4 Events & Activities

#### Finding Events
**Filter Options:**
```
Event Type:  [All ▼]
Date Range:  [Next 7 days ▼]
Format:      ☑ Online  ☑ Offline  ☑ Hybrid
Status:      ☑ Open  ☐ Full
```

**Event Types:**
| Type | Icon | Description | Typical Duration |
|------|------|-------------|------------------|
| Social | 🎉 | Team building, happy hours | 60 min |
| Wellness | 🧘 | Yoga, meditation, fitness | 30-45 min |
| Learning | 📚 | Workshops, training | 90 min |
| Competitive | 🏆 | Trivia, games, challenges | 45 min |

#### RSVP Process
1. Click event card
2. Review details (date, time, format, capacity)
3. Click RSVP button:
   - ✅ **Going**: Confirmed attendance
   - ❓ **Maybe**: Tentative
   - ❌ **Can't Go**: Decline
4. Add to calendar (Google Calendar integration)

**Event Notifications:**
- 24 hours before: Email reminder
- 1 hour before: In-app notification
- 5 minutes before: Desktop notification (if enabled)

### 3.5 Rewards Store

#### Browsing Rewards
```
┌──────────────────────────────┐
│ 🎧 Wireless Headphones       │
│ 2,500 points                 │
│ 📦 12 in stock               │
└──────────────────────────────┘
```

**Categories:**
- 🎁 Physical Goods (swag, electronics)
- ☕ Gift Cards (Amazon, Starbucks, etc.)
- 🕐 Time Off (extra PTO hours)
- 🎓 Learning Credits (course vouchers)
- 🌟 VIP Experiences (lunch with CEO, etc.)

#### Redemption Process
1. Navigate to "🛍️ Rewards Store"
2. Click reward to view details
3. Click "Redeem Now" (if enough points)
4. Confirm redemption in modal
5. Approval workflow:
   ```
   You → Manager Approval → HR Fulfillment → Delivery
   ```
6. Track status in "My Redemptions"

**Redemption Limits:**
- Max 5 active redemptions at once
- Approval SLA: 3 business days
- Physical delivery: 2-4 weeks
- Digital delivery: Instant

---

## 4. Feature Reference

### 4.1 Surveys & Feedback

#### Types of Surveys

**Pulse Surveys** (Weekly/Bi-weekly)
- 3-5 quick questions
- Anonymous by default
- Focus on current sentiment
- Example questions:
  ```
  1. How engaged did you feel this week? (1-5)
  2. Do you have the resources to do your job well? (Yes/No)
  3. What's one thing that would improve your week?
  ```

**Milestone Surveys** (Triggered)
- Sent at 30/60/90 days, 1 year, etc.
- Onboarding experience
- Career development feedback
- Example:
  ```
  30-Day Check-In
  - How is your onboarding going?
  - Do you feel welcomed by your team?
  - What support do you need?
  ```

**Campaign Surveys** (Ad-hoc)
- Event feedback
- Initiative evaluation
- Culture assessment

#### Privacy & Anonymity

| Survey Type | Default Privacy | Min Responses for Aggregation |
|-------------|-----------------|-------------------------------|
| Pulse | Anonymous | 5 |
| Milestone | Identified | N/A (individual) |
| Event Feedback | Anonymous | 3 |

**How Anonymity Works:**
- Your individual responses are never shown to managers
- Aggregate data only shown if ≥5 responses in cohort
- Free-text responses are redacted of identifying info
- IP addresses not logged

### 4.2 Learning Paths

#### Accessing Learning Content
1. Navigate to "🎓 Learning"
2. View assigned paths:
   ```
   📘 New Hire Onboarding        75% complete
   📗 Leadership Fundamentals     20% complete
   📕 React Development           Not started
   ```

#### Path Structure
```
Learning Path: Leadership Fundamentals
├── Module 1: Communication Basics
│   ├── Video: Active Listening (12 min)
│   ├── Article: Feedback Frameworks
│   └── Quiz: Communication Styles
├── Module 2: Team Dynamics
│   ├── Video: Building Trust (18 min)
│   └── Exercise: 1:1 Role Play
└── Module 3: Decision Making
    └── Case Study: Priority Conflicts
```

**Progress Tracking:**
- Automatic save on each activity
- Badge awarded on completion
- Certificate generated (PDF download)
- LinkedIn sharing option

### 4.3 Wellness Challenges

#### Challenge Types

**Individual Challenges**
- Step count (daily goal: 10,000 steps)
- Meditation minutes (weekly goal: 60 min)
- Water intake (daily goal: 8 glasses)
- Sleep hours (nightly goal: 7-9 hours)

**Team Challenges**
- Collective step count
- Healthy recipe sharing
- Workout video submissions
- Mindfulness group sessions

#### Tracking & Integration
```
Connect Your Devices:
□ Apple Health
□ Google Fit
□ Fitbit
□ Strava
□ Manual Entry
```

**Privacy Settings:**
- Share progress with team: ☑ Yes  ☐ No
- Show on leaderboard: ☑ Yes  ☐ No
- Public activity feed: ☐ Yes  ☑ No

---

## 5. Troubleshooting

### 5.1 Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Can't log in | SSO credentials expired | Contact IT to reset your work account |
| Missing notifications | Browser settings | Enable notifications in browser settings |
| Points not updating | Cache issue | Hard refresh (Ctrl+Shift+R) |
| Event RSVP fails | Event at capacity | Join waitlist or choose another event |
| Recognition not sending | Character limit | Keep message under 500 characters |
| Calendar sync broken | Permissions revoked | Re-authorize Google Calendar in Settings |

### 5.2 Browser Troubleshooting

#### Clear Cache & Cookies
**Chrome:**
1. Settings → Privacy & Security → Clear Browsing Data
2. Select "Cached images and files" and "Cookies"
3. Time range: "Last 24 hours"
4. Click "Clear data"

**Safari:**
1. Safari → Preferences → Privacy
2. Click "Manage Website Data"
3. Find app domain, click "Remove"

#### Disable Extensions
Some extensions can interfere with app functionality:
- Ad blockers may block analytics
- Privacy extensions may prevent SSO
- Script blockers may break interactive features

**Test in Incognito/Private Mode** to isolate extension issues.

### 5.3 Mobile Issues

| Issue | Fix |
|-------|-----|
| App won't install (PWA) | Use Safari on iOS, Chrome on Android |
| Touch targets too small | Update to latest app version (responsive UI) |
| Slow loading | Check cellular/WiFi signal strength |
| Push notifications not working | Enable in device Settings → Notifications |

### 5.4 Getting Help

**Self-Service:**
1. Click "❓ Help" in top navigation
2. Search knowledge base
3. View context-sensitive tips

**Contact Support:**
- **In-App**: Feedback button → "Report Issue"
- **Email**: support@intinc.com
- **Slack**: #intinc-support channel
- **Response Time**: < 24 hours business days

**Include in Support Requests:**
- Browser/device info
- Screenshot of issue
- Steps to reproduce
- Your user email

---

# Part II: Developer Documentation

## 6. Architecture Overview

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ React SPA    │  │ PWA Service  │  │ Mobile Web   │ │
│  │ (Desktop)    │  │ Worker       │  │ (Responsive) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                   ┌───────┴────────┐
                   │  CDN (Static)  │
                   └────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│              Base44 Platform (Backend)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ Auth       │  │ Database   │  │ Functions  │       │
│  │ (SSO)      │  │ (Entities) │  │ (Deno)     │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ Real-time  │  │ Storage    │  │ Integrations│      │
│  │ (WS)       │  │ (S3)       │  │ (APIs)     │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
                           │
                   ┌───────┴────────┐
                   │  External      │
                   │  Services      │
                   ├────────────────┤
                   │ • Slack API    │
                   │ • MS Teams     │
                   │ • Google Cal   │
                   │ • SendGrid     │
                   │ • Stripe       │
                   └────────────────┘
```

### 6.2 Technology Stack

**Frontend:**
```javascript
{
  "framework": "React 18.2",
  "routing": "react-router-dom 6.26",
  "styling": "Tailwind CSS 3.x",
  "state": "@tanstack/react-query 5.x",
  "ui": "shadcn/ui + Radix UI",
  "animations": "framer-motion 11.x",
  "icons": "lucide-react",
  "forms": "react-hook-form + zod",
  "charts": "recharts 2.x"
}
```

**Backend (Base44 Platform):**
```javascript
{
  "runtime": "Deno Deploy",
  "database": "PostgreSQL (managed)",
  "auth": "Built-in SSO (SAML, OAuth2)",
  "storage": "S3-compatible",
  "realtime": "WebSockets",
  "functions": "Serverless edge functions"
}
```

**Integrations:**
```javascript
{
  "ai": "OpenAI GPT-4, Claude, Perplexity",
  "communication": "Slack, MS Teams",
  "calendar": "Google Calendar",
  "payments": "Stripe",
  "email": "SendGrid",
  "analytics": "Custom (Base44)"
}
```

### 6.3 Design Patterns

#### Component Architecture
```
Atomic Design Pattern:
├── Atoms: Button, Input, Badge
├── Molecules: SearchBar, StatCard, UserAvatar
├── Organisms: Header, Sidebar, EventCard
├── Templates: DashboardLayout, FormLayout
└── Pages: DawnHub, Analytics, Recognition
```

#### State Management
- **Server State**: React Query (caching, optimistic updates)
- **UI State**: React useState/useReducer (local)
- **Global State**: Context API (user, theme, onboarding)
- **Form State**: React Hook Form (validation, submission)

#### Data Flow
```
User Action → Event Handler → API Call → React Query
                                            ↓
                                      Cache Update
                                            ↓
                                    UI Re-render (optimistic)
                                            ↓
                                    Server Response
                                            ↓
                              Confirm or Rollback Update
```

### 6.4 Security Architecture

**Authentication Flow:**
```
1. User visits app
2. Redirect to SSO provider (Azure AD/Google/Okta)
3. User authenticates with work credentials
4. SSO returns token + user profile
5. Base44 validates token, creates session
6. Client receives session cookie (httpOnly, secure)
7. Subsequent requests include session cookie
```

**Authorization (RBAC):**
```javascript
// User roles hierarchy
admin > facilitator > participant

// Permission checks
if (user.role === 'admin') {
  // Full access
} else if (user.user_type === 'facilitator') {
  // Team management access
} else {
  // Standard user access
}
```

**Data Protection:**
- All API endpoints require authentication
- Entity-level permissions enforced at database
- PII encrypted at rest (AES-256)
- In-transit encryption (TLS 1.3)
- Session timeout: 8 hours
- CSRF protection enabled

---

## 7. Development Setup

### 7.1 Prerequisites

**Required:**
```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0
```

**Recommended:**
```bash
VS Code >= 1.80
Chrome DevTools
React DevTools Extension
```

### 7.2 Local Development

#### Clone Repository
```bash
git clone https://github.com/intinc/interact-platform.git
cd interact-platform
```

#### Install Dependencies
```bash
npm install
```

#### Environment Setup
Create `.env.local`:
```bash
# Base44 Configuration
VITE_BASE44_APP_ID=your-app-id
VITE_BASE44_API_URL=https://api.base44.com

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_PWA=true

# Analytics (optional)
VITE_ANALYTICS_ID=
```

#### Start Development Server
```bash
npm run dev
```

App runs at `http://localhost:5173`

#### Development Workflow
```bash
# Run with type checking
npm run dev:typecheck

# Run with linting
npm run dev:lint

# Clear cache and restart
npm run dev:clean
```

### 7.3 Project Structure

```
interact-platform/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── common/                # Reusable components
│   ├── dashboard/             # Dashboard-specific
│   ├── onboarding/            # Onboarding flows
│   ├── gamification/          # Points, badges, etc.
│   └── docs/                  # Documentation
├── pages/                     # Route components
│   ├── DawnHub.js
│   ├── Dashboard.js
│   ├── Recognition.js
│   └── ...
├── entities/                  # Database schemas (JSON)
│   ├── UserProfile.json
│   ├── Recognition.json
│   └── ...
├── functions/                 # Backend functions (Deno)
│   ├── aiCoachingRecommendations.js
│   ├── gamificationEmails.js
│   └── ...
├── agents/                    # AI agents
│   ├── GamificationAssistant.json
│   └── ...
├── Layout.js                  # Main app layout
├── globals.css                # Global styles
├── tailwind.config.js         # Tailwind configuration
├── package.json               # Dependencies
└── vite.config.js             # Build configuration
```

### 7.4 Coding Standards

#### JavaScript/React
```javascript
// ✅ Good: Functional components with hooks
export default function DawnHub() {
  const { user, points } = useUserData(true);
  const [quest, setQuest] = useState(null);
  
  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Component content */}
    </div>
  );
}

// ❌ Bad: Class components
class DawnHub extends React.Component { ... }
```

#### Naming Conventions
```javascript
// Components: PascalCase
export default function UserProfile() {}

// Hooks: camelCase with 'use' prefix
export function useUserData() {}

// Constants: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

// Files: Match component name
UserProfile.jsx (not userProfile.jsx or user-profile.jsx)
```

#### Import Order
```javascript
// 1. React and core dependencies
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// 3. Internal utilities
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';

// 4. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 5. Icons
import { Trophy, Star } from 'lucide-react';
```

#### Component Structure
```javascript
export default function ComponentName({ prop1, prop2 }) {
  // 1. Hooks (in order: state, queries, mutations, effects)
  const [localState, setLocalState] = useState(null);
  const { data } = useQuery({ ... });
  const mutation = useMutation({ ... });
  useEffect(() => { ... }, []);
  
  // 2. Event handlers
  const handleClick = () => { ... };
  const handleSubmit = (e) => { ... };
  
  // 3. Computed values
  const isActive = data?.status === 'active';
  
  // 4. Render
  return ( ... );
}
```

---

## 8. Codebase Structure

### 8.1 Pages Architecture

**Routing:**
```javascript
// Pages are flat (no nested folders)
pages/
├── DawnHub.js          → /DawnHub
├── Dashboard.js        → /Dashboard
├── Recognition.js      → /Recognition
└── Analytics.js        → /Analytics

// Navigation via createPageUrl utility
import { createPageUrl } from './utils';
<Link to={createPageUrl('DawnHub')}>Go to Dawn Hub</Link>
```

**Page Template:**
```javascript
import { useUserData } from '../components/hooks/useUserData';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function PageName() {
  // 1. Authentication check
  const { user, loading } = useUserData(true); // redirects if not authenticated
  
  // 2. Data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['entityName'],
    queryFn: () => base44.entities.EntityName.list(),
  });
  
  // 3. Loading state
  if (loading || isLoading) return <LoadingSpinner />;
  
  // 4. Main render
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1>Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

### 8.2 Component Library

#### UI Components (`components/ui/`)
Auto-generated from shadcn/ui:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add card
```

**Available Components:**
- `Button`, `Input`, `Textarea`, `Select`
- `Dialog`, `Sheet`, `Popover`, `Dropdown Menu`
- `Card`, `Badge`, `Avatar`, `Separator`
- `Tabs`, `Accordion`, `Collapsible`
- `Toast`, `Alert`, `Progress`

#### Custom Components

**Common Components** (`components/common/`)
```javascript
// ErrorBoundary: Catch React errors
<ErrorBoundary>
  <ChildComponent />
</ErrorBoundary>

// LoadingSpinner: Standard loading indicator
<LoadingSpinner size="lg" />

// EmptyState: No data placeholder
<EmptyState
  icon={Inbox}
  title="No results"
  description="Try adjusting your filters"
/>
```

**Domain Components** (`components/[domain]/`)
```
components/
├── dashboard/         # Dashboard widgets
│   ├── StatsCard.jsx
│   ├── QuickActions.jsx
│   └── OnboardingWidget.jsx
├── gamification/      # Points, badges, rewards
│   ├── BadgeCard.jsx
│   ├── PointsTracker.jsx
│   └── Leaderboard.jsx
└── recognition/       # Recognition features
    ├── RecognitionCard.jsx
    └── RecognitionForm.jsx
```

### 8.3 Hooks Library

**Authentication & User:**
```javascript
// useUserData: Get current user + profile
const { user, points, profile, loading, refreshUserData } = useUserData(requireAuth);

// usePermissions: Check user permissions
const { canEdit, canDelete, canModerate } = usePermissions(user);
```

**Data Fetching:**
```javascript
// useEventData: Fetch events with filters
const { events, isLoading, refetch } = useEventData(filters);

// useRecognitionData: Fetch recognition feed
const { recognition, hasMore, loadMore } = useRecognitionData(userId);
```

**UI State:**
```javascript
// useSessionTimeout: Auto-logout after inactivity
useSessionTimeout(enabled);

// useLocalStorage: Persist state to localStorage
const [theme, setTheme] = useLocalStorage('theme', 'dark');
```

### 8.4 Styling System

**Tailwind Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'dawn-bg': '#0B0F19',
        'dawn-surface': '#151B2B',
        'dawn-orange': '#FF8A3D',
        // ... custom colors
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
    },
  },
};
```

**CSS Variables:**
```css
/* globals.css */
:root {
  /* Dark Theme (Dawn Hub) */
  --dawn-bg: #0B0F19;
  --dawn-surface: #151B2B;
  --dawn-orange: #FF8A3D;
  
  /* Gradients */
  --dawn-gradient-warm: linear-gradient(135deg, #FF8A3D 0%, #FFB86C 100%);
}

/* Utility classes */
.bg-dawn { background: var(--dawn-bg); }
.text-dawn { color: var(--dawn-text); }
```

**Responsive Design:**
```javascript
// Mobile-first approach
<div className="
  p-3           // mobile: 0.75rem padding
  sm:p-4        // tablet: 1rem padding
  md:p-6        // desktop: 1.5rem padding
  
  grid-cols-1   // mobile: 1 column
  sm:grid-cols-2  // tablet: 2 columns
  lg:grid-cols-4  // desktop: 4 columns
">
```

---

## 9. API Reference

### 9.1 Base44 SDK

**Initialization:**
```javascript
import { base44 } from '@/api/base44Client';
// Pre-initialized singleton, ready to use
```

**Authentication API:**
```javascript
// Get current user
const user = await base44.auth.me();
// Returns: { email, full_name, role, user_type }

// Check authentication status
const isAuth = await base44.auth.isAuthenticated();
// Returns: boolean

// Update current user profile
await base44.auth.updateMe({ department: 'Engineering' });

// Logout
base44.auth.logout(redirectUrl?);
```

**Entities API:**
```javascript
// List all records
const items = await base44.entities.EntityName.list(
  sortField = '-created_date',  // Sort descending by created_date
  limit = 50                     // Max 50 records
);

// Filter records
const filtered = await base44.entities.EntityName.filter(
  { status: 'active', user_email: user.email },
  sortField = '-updated_date',
  limit = 20
);

// Create record
const newItem = await base44.entities.EntityName.create({
  title: 'Example',
  status: 'active'
});

// Update record
await base44.entities.EntityName.update(itemId, {
  status: 'completed'
});

// Delete record
await base44.entities.EntityName.delete(itemId);

// Get schema
const schema = base44.entities.EntityName.schema();
```

**Real-Time Subscriptions:**
```javascript
// Subscribe to entity changes
const unsubscribe = base44.entities.EntityName.subscribe((event) => {
  console.log(event.type); // 'create', 'update', 'delete'
  console.log(event.data); // Updated record data
});

// Cleanup
useEffect(() => {
  const unsub = base44.entities.Recognition.subscribe(handleUpdate);
  return () => unsub();
}, []);
```

**Functions API:**
```javascript
// Invoke backend function
const response = await base44.functions.invoke('functionName', {
  param1: 'value',
  param2: 123
});

// Response structure: { data, status, headers }
console.log(response.data);
```

**Integrations API:**
```javascript
// Call Core integrations
const aiResponse = await base44.integrations.Core.InvokeLLM({
  prompt: 'Generate a motivational message',
  add_context_from_internet: false,
  response_json_schema: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  }
});

// Upload file
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// Send email
await base44.integrations.Core.SendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Welcome to INTeract!'
});
```

### 9.2 Entity Schemas

**UserProfile:**
```json
{
  "user_email": "string (required)",
  "role": "string",
  "department": "Engineering | Product | Marketing | Sales | HR | Operations | Finance | Customer Success | Design",
  "manager_email": "string",
  "location": "string",
  "start_date": "date",
  "bio": "string",
  "skills": [
    {
      "skill_name": "string",
      "proficiency": "beginner | intermediate | advanced | expert",
      "years_experience": "number"
    }
  ],
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
  "recognizer_email": "string (required)",
  "recognizer_name": "string (required)",
  "recipient_email": "string (required)",
  "recipient_name": "string (required)",
  "message": "string (required, 20-500 chars)",
  "company_value": "string (optional)",
  "visibility": "public | private",
  "points_awarded": "number (default: 50)"
}
```

**Event:**
```json
{
  "activity_id": "string (reference to Activity)",
  "title": "string (required)",
  "event_type": "meeting | workshop | training | social | wellness | presentation | other",
  "scheduled_date": "datetime (required)",
  "duration_minutes": "number",
  "status": "draft | scheduled | in_progress | completed | cancelled",
  "event_format": "online | offline | hybrid",
  "location": "string (required for offline/hybrid)",
  "max_participants": "number",
  "facilitator_email": "string",
  "points_awarded": "number (default: 10)"
}
```

**UserPoints:**
```json
{
  "user_email": "string (unique, required)",
  "points": "number (default: 0)",
  "level": "number (calculated)",
  "lifetime_points": "number",
  "points_spent": "number (default: 0)"
}
```

### 9.3 Backend Functions

**AI Functions:**
```javascript
// aiCoachingRecommendations
// Generates personalized coaching tips for managers
await base44.functions.invoke('aiCoachingRecommendations', {
  teamLeaderEmail: user.email,
  teamSize: 8,
  avgEngagement: 72
});
// Returns: { recommendations: string[], priorities: string[] }
```

```javascript
// aiOnboardingAssistant
// Provides contextual onboarding guidance
await base44.functions.invoke('aiOnboardingAssistant', {
  userEmail: user.email,
  currentStep: 'profile_setup',
  context: { role: 'engineer' }
});
// Returns: { tip: string, nextSteps: string[] }
```

**Gamification Functions:**
```javascript
// awardPoints
// Manually award points to user (admin only)
await base44.functions.invoke('awardPoints', {
  userEmail: 'employee@intinc.com',
  points: 100,
  reason: 'Exceptional project delivery'
});

// executeGamificationRules
// Process automated rule triggers (runs on schedule)
await base44.functions.invoke('executeGamificationRules', {
  ruleType: 'streak_bonus',
  userId: user.email
});
```

**Integration Functions:**
```javascript
// sendSlackEventNotification
// Send event reminder to Slack channel
await base44.functions.invoke('sendSlackEventNotification', {
  eventId: 'evt_123',
  channel: '#general',
  timeBeforeEvent: '1hour'
});

// syncToGoogleCalendar
// Sync event to Google Calendar
await base44.functions.invoke('syncToGoogleCalendar', {
  eventId: 'evt_123',
  userEmail: user.email
});
```

---

## 10. Component Library

### 10.1 Dashboard Components

**StatsCard:**
```javascript
import StatsCard from '@/components/dashboard/StatsCard';

<StatsCard
  title="Total Points"
  value={12500}
  icon={Trophy}
  trend={{ value: 15, direction: 'up' }}
  color="orange"
/>
```

**QuickActions:**
```javascript
import QuickActions from '@/components/dashboard/QuickActions';

<QuickActions
  actions={[
    { label: 'Give Recognition', icon: Gift, onClick: handleRecognition },
    { label: 'RSVP Event', icon: Calendar, onClick: handleRSVP }
  ]}
/>
```

### 10.2 Gamification Components

**BadgeCard:**
```javascript
import BadgeCard from '@/components/gamification/BadgeCard';

<BadgeCard
  badge={{
    name: 'First Week Complete',
    description: 'Completed your first week',
    icon_url: '/badges/first-week.png',
    earned_date: '2025-01-15'
  }}
  size="md"
  showDetails={true}
/>
```

**PointsTracker:**
```javascript
import PointsTracker from '@/components/gamification/PointsTracker';

<PointsTracker
  currentPoints={1500}
  levelThreshold={2000}
  currentLevel={12}
  animated={true}
/>
```

### 10.3 Form Components

**Form with Validation:**
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  message: z.string().min(20).max(500),
  recipient: z.string().email()
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { message: '', recipient: '' }
  });
  
  const onSubmit = (data) => {
    // Handle submission
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('message')} />
      {form.formState.errors.message && (
        <p className="text-red-500">{form.formState.errors.message.message}</p>
      )}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 11. State Management

### 11.1 React Query Configuration

**Setup:**
```javascript
// App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: true,
      retry: 3
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

**Query Pattern:**
```javascript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['recognition', userId],
  queryFn: () => base44.entities.Recognition.filter({ recipient_email: userId }),
  enabled: !!userId,
  staleTime: 2 * 60 * 1000  // Override default
});
```

**Mutation Pattern:**
```javascript
const mutation = useMutation({
  mutationFn: (data) => base44.entities.Recognition.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['recognition'] });
    toast.success('Recognition sent!');
  },
  onError: (error) => {
    toast.error('Failed to send recognition');
  }
});

// Usage
mutation.mutate({ recipient_email: 'user@example.com', message: 'Great job!' });
```

**Optimistic Updates:**
```javascript
const mutation = useMutation({
  mutationFn: (data) => base44.entities.UserPoints.update(userId, data),
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['points', userId] });
    
    // Snapshot current value
    const previous = queryClient.getQueryData(['points', userId]);
    
    // Optimistically update
    queryClient.setQueryData(['points', userId], (old) => ({
      ...old,
      points: old.points + newData.points
    }));
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['points', userId], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['points', userId] });
  }
});
```

---

## 12. Testing Guide

### 12.1 Testing Philosophy

**Testing Pyramid:**
```
        /\
       /E2E\        10% - End-to-end (Playwright)
      /------\
     /  Integ \      20% - Integration (React Testing Library)
    /----------\
   /    Unit    \    70% - Unit (Vitest)
  /--------------\
```

### 12.2 Unit Testing

**Setup (Vitest):**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js'
  }
});
```

**Component Test:**
```javascript
// StatsCard.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsCard from './StatsCard';

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Points" value={1000} />);
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });
  
  it('shows trend indicator', () => {
    render(<StatsCard value={1000} trend={{ value: 15, direction: 'up' }} />);
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });
});
```

**Hook Test:**
```javascript
// useUserData.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUserData } from './useUserData';

vi.mock('@/api/base44Client');

describe('useUserData', () => {
  it('fetches user data on mount', async () => {
    const { result } = renderHook(() => useUserData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeDefined();
  });
});
```

### 12.3 Integration Testing

**React Testing Library:**
```javascript
// RecognitionForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecognitionForm from './RecognitionForm';

describe('RecognitionForm', () => {
  it('submits recognition successfully', async () => {
    const onSubmit = vi.fn();
    render(<RecognitionForm onSubmit={onSubmit} />);
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Recipient'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Message'), 'Great work on the project!');
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        recipient: 'John Doe',
        message: 'Great work on the project!'
      });
    });
  });
  
  it('shows validation error for short message', async () => {
    render(<RecognitionForm />);
    
    await userEvent.type(screen.getByLabelText('Message'), 'Too short');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    expect(await screen.findByText(/minimum 20 characters/i)).toBeInTheDocument();
  });
});
```

### 12.4 E2E Testing

**Playwright Setup:**
```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } }
  ]
});
```

**E2E Test:**
```javascript
// e2e/recognition.spec.js
import { test, expect } from '@playwright/test';

test.describe('Recognition Flow', () => {
  test('user can send recognition', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.click('text=Login');
    // ... SSO flow
    
    // Navigate to recognition
    await page.click('text=Recognition');
    await page.click('text=Give Recognition');
    
    // Fill form
    await page.fill('[name="recipient"]', 'colleague@intinc.com');
    await page.fill('[name="message"]', 'Amazing work on the Q1 project!');
    
    // Submit
    await page.click('button:has-text("Send")');
    
    // Verify success
    await expect(page.locator('text=Recognition sent!')).toBeVisible();
  });
});
```

### 12.5 Running Tests

```bash
# Unit + Integration tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# E2E tests
npm run test:e2e

# E2E in headed mode
npm run test:e2e -- --headed

# Specific test file
npm test -- StatsCard.test.jsx
```

---

# Part III: Operations Documentation

## 13. Deployment Guide

### 13.1 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         DNS (CloudFlare)                 │
│  intinc-engage.com                       │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         CDN (CloudFlare)                 │
│  Global edge caching                     │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│    Base44 Platform (Hosting)             │
│  - Frontend: Static SPA                  │
│  - Backend: Serverless functions         │
│  - Database: PostgreSQL (managed)        │
│  - Storage: S3-compatible                │
└─────────────────────────────────────────┘
```

### 13.2 Build Process

**Production Build:**
```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Output: dist/ folder
```

**Build Configuration:**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', 'framer-motion'],
          'query': ['@tanstack/react-query']
        }
      }
    }
  }
});
```

### 13.3 Environment Configuration

**Production Environment Variables:**
```bash
# Base44 Platform
VITE_BASE44_APP_ID=prod-app-id
VITE_BASE44_API_URL=https://api.base44.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_DARK_MODE_DEFAULT=false

# External Services
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_ANALYTICS_ID=G-...
```

### 13.4 Deployment Pipeline

**CI/CD with GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_BASE44_APP_ID: ${{ secrets.APP_ID }}
      
      - name: Deploy to Base44
        run: npx base44 deploy
        env:
          BASE44_TOKEN: ${{ secrets.BASE44_TOKEN }}
      
      - name: Notify Slack
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
          -d '{"text":"✅ Deployed to production"}'
```

### 13.5 Rollback Procedure

**Immediate Rollback:**
```bash
# Via Base44 CLI
base44 deployments list
# Output: Shows last 10 deployments with IDs

base44 rollback <deployment-id>
# Rolls back to specified deployment

# Verify
curl https://intinc-engage.com/health
```

**Manual Rollback:**
1. Navigate to Base44 dashboard
2. Go to "Deployments" tab
3. Find previous stable deployment
4. Click "Rollback to this version"
5. Confirm rollback
6. Monitor health checks

**Post-Rollback:**
- Update status page
- Notify team in Slack
- Create incident report
- Schedule post-mortem

---

## 14. Infrastructure

### 14.1 Base44 Platform

**Managed Services:**
- **Hosting**: Edge-optimized CDN
- **Compute**: Deno Deploy serverless functions
- **Database**: PostgreSQL 14 with automated backups
- **Storage**: S3-compatible object storage
- **Auth**: Built-in SSO with SAML/OAuth2
- **Real-time**: WebSocket connections

**Scaling:**
- Frontend: Auto-scales via CDN
- Functions: Auto-scales 0→∞ based on load
- Database: Vertical scaling with connection pooling
- Storage: Unlimited

### 14.2 External Dependencies

**Critical Services:**
| Service | Purpose | SLA | Fallback |
|---------|---------|-----|----------|
| OpenAI API | AI coaching, content generation | 99.9% | Cache responses, degrade gracefully |
| Stripe | Payment processing | 99.99% | Queue transactions, manual processing |
| SendGrid | Email delivery | 99.95% | Retry queue, SMS fallback |
| Slack API | Notifications | 99.9% | In-app only |
| Google Calendar | Event sync | 99.9% | Local calendar only |

**Health Checks:**
```javascript
// Ping external services every 5 minutes
const healthChecks = {
  openai: () => fetch('https://api.openai.com/health'),
  stripe: () => stripe.ping(),
  sendgrid: () => sendgrid.healthCheck()
};
```

---

## 15. Monitoring & Observability

### 15.1 Logging

**Log Levels:**
```javascript
// In backend functions
console.log('INFO: User logged in', { userId: user.id });
console.warn('WARN: Rate limit approaching', { endpoint: '/api/points' });
console.error('ERROR: Failed to send email', { error: err.message });
```

**Log Aggregation:**
- Platform: Base44 built-in logging
- Retention: 30 days
- Search: Full-text search available
- Alerts: Configured for ERROR level

**Structured Logging:**
```javascript
const log = {
  timestamp: new Date().toISOString(),
  level: 'INFO',
  message: 'Recognition created',
  context: {
    userId: user.id,
    recipientId: recipient.id,
    points: 50
  }
};
console.log(JSON.stringify(log));
```

### 15.2 Metrics

**Key Performance Indicators:**

**System Metrics:**
```
- API Response Time: p50, p95, p99
- Error Rate: % of 5xx responses
- Database Query Time: Average, Max
- Function Cold Starts: Count per hour
```

**Business Metrics:**
```
- Daily Active Users (DAU)
- Recognition Posts per Day
- Event RSVPs per Week
- Survey Completion Rate
- Points Earned per User
- Redemption Conversion Rate
```

**Real-Time Dashboard:**
```javascript
// Custom metrics tracking
await base44.integrations.Analytics.track({
  event: 'recognition_sent',
  properties: {
    points: 50,
    recipient_department: 'Engineering'
  }
});
```

### 15.3 Alerts

**Alert Configuration:**
```yaml
alerts:
  - name: High Error Rate
    condition: error_rate > 5% for 5 minutes
    severity: critical
    channels: [pagerduty, slack]
  
  - name: Slow API
    condition: p95_latency > 2s for 10 minutes
    severity: warning
    channels: [slack]
  
  - name: Database Connection Pool Exhausted
    condition: db_connections > 90% for 5 minutes
    severity: critical
    channels: [pagerduty, slack, email]
```

**On-Call Rotation:**
- Primary: Engineering Lead
- Secondary: DevOps Engineer
- Escalation: CTO (after 30 min)

---

## 16. Security & Compliance

### 16.1 Authentication & Authorization

**SSO Integration:**
```
Supported Providers:
- Azure Active Directory (SAML 2.0)
- Google Workspace (OAuth 2.0)
- Okta (SAML 2.0)
```

**Session Management:**
```javascript
Session Configuration:
- Duration: 8 hours
- Refresh: Sliding window
- Storage: httpOnly, secure cookies
- CSRF Protection: Enabled
```

**RBAC Implementation:**
```javascript
Role Hierarchy:
admin > facilitator > participant

Permissions Matrix:
┌─────────────────┬───────┬────────────┬─────────────┐
│ Resource        │ Admin │ Facilitator│ Participant │
├─────────────────┼───────┼────────────┼─────────────┤
│ User Management │  RWD  │     -      │      -      │
│ Team Analytics  │  RW   │     R      │      -      │
│ Recognition     │  RW   │     RW     │     RW      │
│ Events (Create) │  RW   │     RW     │      -      │
│ Events (RSVP)   │  RW   │     RW     │     RW      │
│ Surveys (View)  │  R    │     R      │     R       │
│ Survey Responses│  R*   │     -      │      -      │
└─────────────────┴───────┴────────────┴─────────────┘
* Aggregated only, min 5 responses
```

### 16.2 Data Protection

**Encryption:**
```
At Rest:  AES-256
In Transit: TLS 1.3
Backups:  Encrypted with separate keys
```

**PII Handling:**
```javascript
// Anonymization for analytics
function anonymizeUser(user) {
  return {
    id: hashUserId(user.id),
    department: user.department,
    // Remove: email, name, location, etc.
  };
}

// Survey responses
if (responseCount < 5) {
  return { error: 'Insufficient responses for anonymity' };
}
```

**Data Retention:**
```
User Data: Until account deletion + 30 days
Audit Logs: 2 years
Analytics: Aggregated, indefinite
Survey Responses: 1 year (anonymized)
```

### 16.3 OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| Injection | Parameterized queries, input validation |
| Broken Auth | SSO, MFA, session timeout |
| Sensitive Data Exposure | Encryption, minimal PII collection |
| XXE | JSON-only APIs, no XML parsing |
| Broken Access Control | RBAC enforcement at API level |
| Security Misconfiguration | Automated security scanning |
| XSS | Content Security Policy, output encoding |
| Insecure Deserialization | Avoid deserializing untrusted data |
| Using Components with Known Vulnerabilities | Dependabot alerts, weekly updates |
| Insufficient Logging | Centralized logging, audit trail |

### 16.4 Compliance

**GDPR Compliance:**
- Right to access: Export user data
- Right to erasure: Account deletion workflow
- Data portability: JSON export
- Consent management: Cookie banner, opt-ins

**SOC 2 Type II:**
- Annual audit
- Access controls documented
- Incident response plan
- Change management process

---

## 17. Backup & Recovery

### 17.1 Backup Strategy

**Database Backups:**
```
Frequency: Every 6 hours
Retention: 30 days
Location: Separate region (geo-redundant)
Encryption: AES-256
Test Restores: Weekly
```

**Application State:**
```
Config Files: Git version control
User Uploads: S3 with versioning enabled
Logs: Exported to long-term storage (1 year)
```

**Backup Verification:**
```bash
# Automated test restore every Sunday
#!/bin/bash
BACKUP_ID=$(base44 backups list --latest)
base44 backups restore $BACKUP_ID --test-env
base44 test-env smoke-test
base44 test-env destroy
```

### 17.2 Disaster Recovery

**Recovery Time Objective (RTO):** 2 hours  
**Recovery Point Objective (RPO):** 6 hours

**DR Plan:**
1. **Detection** (0-15 min)
   - Automated alerts trigger
   - On-call engineer investigates

2. **Assessment** (15-30 min)
   - Determine severity
   - Activate DR team

3. **Recovery** (30-120 min)
   - Restore from latest backup
   - Redirect DNS if needed
   - Verify functionality

4. **Communication** (ongoing)
   - Status page updates
   - Customer notifications
   - Stakeholder briefings

**Failover Procedure:**
```bash
# Manual failover
base44 failover --to-region us-west-2
base44 dns update --new-origin failover.base44.com
base44 health-check --verify
```

---

## 18. Incident Response

### 18.1 Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| P0 - Critical | Complete outage, data loss | Immediate | Page on-call, exec team |
| P1 - High | Partial outage, major feature down | 15 minutes | On-call engineer |
| P2 - Medium | Minor feature degradation | 1 hour | Ticket assignment |
| P3 - Low | Cosmetic issue, edge case | Next business day | Backlog |

### 18.2 Incident Workflow

**Detection:**
```
Automated Monitoring → Alert → PagerDuty → On-Call Engineer
```

**Response:**
1. **Acknowledge**: Confirm receipt in PagerDuty (< 5 min)
2. **Investigate**: Review logs, metrics, recent deploys
3. **Communicate**: Update status page
4. **Mitigate**: Apply hotfix or rollback
5. **Resolve**: Verify fix, close incident
6. **Post-Mortem**: Within 48 hours (P0/P1 only)

**Communication Template:**
```
Status: Investigating | Identified | Monitoring | Resolved
Affected: [Feature/Service]
Impact: [% of users affected]
ETA: [Expected resolution time]
Updates: Every 30 minutes

Example:
🔴 INVESTIGATING
We're experiencing issues with recognition posts.
Approximately 15% of users may see delays.
Next update: 2:30 PM EST
```

### 18.3 Post-Mortem Template

```markdown
# Incident Post-Mortem: [YYYY-MM-DD]

## Summary
[One-sentence description]

## Timeline
- 14:00 - Incident detected
- 14:05 - On-call paged
- 14:15 - Root cause identified
- 14:30 - Fix deployed
- 14:45 - Incident resolved

## Root Cause
[Technical explanation]

## Impact
- Users affected: 150 (15%)
- Duration: 45 minutes
- Data loss: None

## Resolution
[What fixed it]

## Action Items
- [ ] Add monitoring for X
- [ ] Improve error handling in Y
- [ ] Update runbook for Z

## Lessons Learned
[What went well, what didn't]
```

---

## 19. Changelog

### Version 2.0.0 (2026-01-22)

**Major Features:**
- 🌙 **Dawn Hub**: New dark-themed daily dashboard with XP/level system
- 🎯 **Daily Quests**: Automated quest generation and tracking
- 🔥 **Streak System**: Consecutive engagement rewards
- 📱 **Mobile Responsive**: Complete UI overhaul for mobile devices
- ♿ **Accessibility**: WCAG 2.1 AA compliance

**Improvements:**
- Enhanced real-time subscriptions for live updates
- Optimized gamification calculations
- Improved loading performance (-40% bundle size)
- Better error messaging

**Bug Fixes:**
- Fixed OnboardingWidget crash when steps array is undefined
- Resolved calendar sync issues with Google Calendar
- Fixed recognition feed pagination

**Breaking Changes:**
- `UserPoints.level` is now calculated, not stored
- Deprecated `user.gamification_tier` in favor of `user.level`

### Version 1.5.0 (2025-12-01)

**Features:**
- Team challenges with collective goals
- AI-powered event suggestions
- Rewards store v2 with approval workflow

### Version 1.0.0 (2025-06-01)

**Initial Release:**
- Core recognition system
- Pulse surveys
- Event management
- Team channels
- Basic gamification

---

## 20. Style Guide

### 20.1 Code Style

**JavaScript/React:**
```javascript
// ✅ Correct
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, [dependency]);
  
  const handleEvent = () => {
    // Handler logic
  };
  
  return (
    <div className="container">
      <h1>{prop1}</h1>
    </div>
  );
}

// ❌ Incorrect
function componentName(props) {
  return <div>{props.prop1}</div>
}
```

**CSS/Tailwind:**
```jsx
// ✅ Correct: Responsive, mobile-first
<div className="
  p-3 sm:p-4 md:p-6
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
  gap-3 sm:gap-4
">

// ❌ Incorrect: Desktop-first, no breakpoints
<div className="p-6 grid-cols-4 gap-4">
```

### 20.2 Documentation Style

**Headings:**
```markdown
# H1: Document Title (one per file)
## H2: Major Sections
### H3: Subsections
#### H4: Specific Topics (use sparingly)
```

**Code Blocks:**
````markdown
```javascript
// Always specify language
const example = 'value';
```
````

**Lists:**
```markdown
- Unordered lists for features, options
1. Ordered lists for steps, procedures
```

**Tables:**
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data     | Data     |
```

### 20.3 Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(recognition): add recognition templates

Allow users to select from pre-defined recognition templates
to speed up the recognition process.

Closes #123
```

```
fix(calendar): resolve Google Calendar sync issue

Fixed bug where events weren't syncing to Google Calendar
when user timezone was UTC-8 or earlier.

Fixes #456
```

### 20.4 Naming Conventions

**Components:**
```
PascalCase: UserProfile, StatsCard, EventList
```

**Files:**
```
Components: UserProfile.jsx (matches component name)
Hooks: useUserData.js (camelCase with 'use' prefix)
Utils: formatDate.js (camelCase)
Constants: constants.js (lowercase)
```

**Variables:**
```javascript
const camelCase = 'local variables';
const UPPER_SNAKE_CASE = 'constants';
const PascalCase = 'components, classes';
```

---

## 21. Glossary

**Base44**: Platform-as-a-Service for building web applications with built-in backend

**Dawn Hub**: Dark-themed daily dashboard featuring XP, quests, and streaks

**Entity**: Database table/collection in Base44 (e.g., User, Recognition, Event)

**Gamification**: System of points, badges, levels, and rewards to drive engagement

**RBAC**: Role-Based Access Control - permission system based on user roles

**PWA**: Progressive Web App - installable web application

**SSO**: Single Sign-On - authentication via company credentials

**XP**: Experience Points - earned through platform engagement

**Quest**: Daily challenge with specific completion criteria

**Streak**: Consecutive days of platform engagement

**Recognition**: Peer-to-peer appreciation post

**Pulse Survey**: Short, frequent employee sentiment survey

**Facilitator**: User role for team leaders and event organizers

**Redemption**: Process of exchanging points for rewards

---

## 22. Contributing Guidelines

### 22.1 Getting Started

**Prerequisites:**
- Node.js 18+
- Git proficiency
- React/TypeScript knowledge
- Familiarity with Tailwind CSS

**Setup:**
```bash
# Fork repository
gh repo fork intinc/interact-platform

# Clone your fork
git clone https://github.com/YOUR_USERNAME/interact-platform.git

# Create feature branch
git checkout -b feature/your-feature-name

# Install dependencies
npm install

# Start development
npm run dev
```

### 22.2 Development Workflow

1. **Create Issue**: Describe feature or bug
2. **Assign Yourself**: Claim the work
3. **Create Branch**: `feature/issue-123-description`
4. **Write Code**: Follow style guide
5. **Write Tests**: Aim for 80% coverage
6. **Commit Changes**: Use conventional commits
7. **Push Branch**: `git push origin feature/issue-123`
8. **Open PR**: Fill out PR template
9. **Address Reviews**: Make requested changes
10. **Merge**: Squash and merge to main

### 22.3 Pull Request Template

```markdown
## Description
[What does this PR do?]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally

## Related Issues
Closes #123
```

### 22.4 Code Review Guidelines

**As Author:**
- Keep PRs small (< 400 lines)
- Write clear description
- Respond to feedback promptly
- Don't take criticism personally

**As Reviewer:**
- Review within 24 hours
- Be constructive and specific
- Test the changes
- Approve only when confident

---

## Appendix A: Troubleshooting Decision Tree

```
Issue: App won't load
├─ Is the URL correct?
│  ├─ No → Fix URL
│  └─ Yes → Continue
├─ Is internet connected?
│  ├─ No → Check connection
│  └─ Yes → Continue
├─ Clear cache and reload
│  ├─ Fixed? → Done
│  └─ Not fixed → Continue
├─ Try incognito mode
│  ├─ Works? → Extension issue, disable extensions
│  └─ Still broken → Continue
├─ Check browser console for errors
│  ├─ API error? → Check Base44 status
│  ├─ Auth error? → Re-authenticate
│  └─ Other? → Contact support

Issue: Feature not working
├─ Feature visible?
│  ├─ No → Check permissions, contact admin
│  └─ Yes → Continue
├─ Error message shown?
│  ├─ Yes → Screenshot and report
│  └─ No → Continue
├─ Recent changes to account?
│  ├─ Yes → May need re-authentication
│  └─ No → Continue
├─ Works for others?
│  ├─ No → Platform issue, check status page
│  └─ Yes → Local issue, clear cache/restart
```

---

## Appendix B: Quick Reference

**Common Commands:**
```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run tests
npm run lint             # Check code quality

# Base44 CLI
base44 deploy            # Deploy to production
base44 logs              # View application logs
base44 backups list      # List available backups
base44 entities list     # List all entities
```

**Key URLs:**
```
Production:  https://intinc-engage.com
Staging:     https://staging-intinc-engage.com
Status Page: https://status.base44.com
Docs:        https://docs.base44.com
```

**Support Contacts:**
```
Engineering: engineering@intinc.com
HR/Admin:    hr@intinc.com
Support:     support@intinc.com
On-Call:     +1-XXX-XXX-XXXX
```

---

**Document Version:** 2.0  
**Last Updated:** 2026-01-22  
**Maintained By:** Engineering Team @ Intinc  
**License:** Proprietary & Confidential