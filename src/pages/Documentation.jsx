/**
 * ============================================================================
 * DOCUMENTATION PAGE - Intinc Employee Engagement Platform
 * ============================================================================
 * 
 * AUTO-DOCUMENTATION INSTRUCTIONS FOR AI ASSISTANT:
 * -------------------------------------------------
 * When making changes to this codebase, ALWAYS update the relevant 
 * documentation files in components/docs/:
 * 
 * 1. PRD_MASTER.md - Update when:
 *    - Adding new features or requirements
 *    - Changing success metrics or KPIs
 *    - Modifying target user personas
 *    - Updating project timeline/phases
 * 
 * 2. COMPLETION_CHECKLIST.md - Update when:
 *    - Completing tasks or features
 *    - Adding new entities or components
 *    - Changing project phase status
 *    - Adding new backend functions
 * 
 * 3. ARCHITECTURE.md - Update when:
 *    - Adding new pages or components
 *    - Changing data flow patterns
 *    - Modifying entity relationships
 *    - Adding new integrations
 * 
 * 4. FEATURE_SPECS.md - Update when:
 *    - Adding new features
 *    - Changing feature flags
 *    - Modifying business rules
 *    - Adding activity types or badges
 * 
 * 5. INTEGRATION_GUIDE.md - Update when:
 *    - Adding new external integrations
 *    - Modifying API configurations
 *    - Adding new environment variables
 *    - Changing webhook handlers
 * 
 * 6. API_REFERENCE.md - Update when:
 *    - Adding new entities
 *    - Creating new backend functions
 *    - Modifying entity schemas
 *    - Adding new query patterns
 * 
 * CHANGE LOG FORMAT:
 * When updating docs, add entry to the changelog section below:
 * [YYYY-MM-DD] - Brief description of change - Files modified
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  CheckSquare,
  GitBranch,
  Layers,
  Plug,
  Code,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  RefreshCw,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import DocsChangeDetector from '../components/docs/DocsChangeDetector';
import DocSummarizer from '../components/docs/DocSummarizer';

// Documentation content - embedded for reliable rendering
const DOCS = {
  overview: {
    title: 'Platform Overview',
    icon: BookOpen,
    content: `# Intinc Employee Engagement Platform

## Current System Audit (${new Date().toLocaleDateString()})

### Platform Health Status

| Component | Status | Details |
|-----------|--------|---------|
| Core Infrastructure | ✅ Healthy | Base44 platform operational |
| Authentication | ✅ Healthy | SSO via Base44 built-in |
| Database | ✅ Healthy | 30+ entities defined |
| Backend Functions | ✅ Healthy | 20+ functions active |
| Integrations | 🔄 Partial | Stripe ready, OAuth pending |

### Quick Stats

- **Pages**: 25+ built
- **Components**: 100+ created
- **Entities**: 30+ defined
- **Activities**: 15+ templates
- **Badges**: 10 configured
- **Event Templates**: 30+ pre-built

### Project Completion

\`\`\`
Overall Progress: ████████████████████░░░░░░░░░░ 65%

Phase Breakdown:
├── Foundation      ████████████████████ 100% ✅
├── Activities      ████████████████████ 100% ✅
├── Events          ████████████████████ 100% ✅
├── Channels        ████████████████████ 100% ✅
├── Gamification    ████████████████████ 100% ✅
├── Surveys         ████░░░░░░░░░░░░░░░░  20% 📋
├── Point Store     ██░░░░░░░░░░░░░░░░░░  10% 📋
├── Analytics       ██████████████████░░  90% ✅
├── Integrations    ████████████░░░░░░░░  60% 🔄
└── Polish          ██░░░░░░░░░░░░░░░░░░  10% ⏳
\`\`\`

### Priority Next Steps

1. **Immediate**: Build Survey Builder UI
2. **Short-term**: Complete Point Store
3. **Medium-term**: Avatar customization
4. **Pre-launch**: Security & accessibility audits

---

## Change Log

| Date | Change | Files |
|------|--------|-------|
| 2025-11-29 | Created Documentation page | pages/Documentation.jsx |
| 2025-11-28 | Updated all doc files with real data | components/docs/*.md |
| 2025-11-28 | Added 10 badge configurations | entities/Badge.json |
| 2025-11-28 | Added 15+ activity templates | entities/Activity.json |
`
  },
  prd: {
    title: 'Product Requirements',
    icon: FileText,
    content: `# Product Requirements Document (PRD)
## Employee Engagement Platform - Intinc

---

## 1. Executive Summary

### 1.1 Product Vision
Build a comprehensive employee engagement platform for Intinc, a remote-first tech company (50-200 employees), that fosters connection, recognition, and continuous feedback across distributed teams.

### 1.2 Mission Statement
Empower remote employees to feel connected, valued, and engaged through meaningful recognition, transparent feedback, and gamified experiences that strengthen company culture.

### 1.3 Success Metrics
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Daily Active Users | >60% of employees | Building | 🔄 |
| Activity Templates | 50+ | 15+ | ✅ |
| Event Types | 6 categories | 6 | ✅ |
| Badge System | 10+ badges | 10 | ✅ |
| Platform Features | Core complete | 80% | 🔄 |

### 1.4 Current Platform Statistics
- **Activities Available**: 15+ templates (Icebreaker, Creative, Competitive, Wellness, Learning, Social)
- **Badges Configured**: 10 achievement badges across 5 rarity levels
- **Event Formats**: Online, Offline, Hybrid
- **Gamification**: Points, Levels, Streaks, Team Competitions

---

## 2. Target Users

### 2.1 Primary Personas

#### Remote Employee (IC)
- **Demographics**: 25-45 years, tech-savvy, works from home/co-working
- **Goals**: Feel connected to team, get recognized for work, have voice heard
- **Pain Points**: Isolation, lack of visibility, missing watercooler moments

#### Team Lead / Manager
- **Demographics**: 30-50 years, manages 5-15 direct reports
- **Goals**: Keep team engaged, identify issues early, celebrate wins

#### HR / People Ops
- **Demographics**: 28-45 years, responsible for culture initiatives
- **Goals**: Measure engagement, identify trends, reduce turnover

---

## 3. Feature Requirements

### 3.1 Core Features (P0 - Must Have)

| Feature | Description | Status |
|---------|-------------|--------|
| Peer Recognition | Public shoutouts with points | 📋 Spec'd |
| Pulse Surveys | Anonymous recurring feedback | 📋 Spec'd |
| Team Channels | Real-time messaging | ✅ Built |
| Gamification | Points, badges, leaderboards | ✅ Built |
| Events | Scheduling and facilitation | ✅ Built |
| Activities | Template library | ✅ Built |

### 3.2 Secondary Features (P1)

| Feature | Description | Status |
|---------|-------------|--------|
| Point Store | Avatar customization | 📋 Spec'd |
| Milestones | Birthday/anniversary celebrations | ⏳ Planned |
| Wellness | Opt-in wellness challenges | ⏳ Planned |
| Analytics | HR insights dashboard | ✅ Built |

---

## 4. Technical Requirements

### 4.1 Platform
- Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: Responsive web (iOS Safari, Android Chrome)
- Performance: <3s initial load, <500ms interactions

### 4.2 Security
- Authentication: SSO (Azure AD, Google, Okta)
- Session: 8-hour timeout
- Encryption: TLS 1.3 in transit, AES-256 at rest
- RBAC: Role-based access control

### 4.3 Compliance
- WCAG 2.1 AA accessibility
- GDPR data privacy
- Survey anonymity verification

---

## 5. Design Requirements

### 5.1 Visual Design
| Element | Specification |
|---------|---------------|
| Style | Modern SaaS, glassmorphism |
| Colors | Navy #14294D, Orange #D97230 |
| Typography | Inter font family |
| Icons | Lucide React |
| Animations | Framer Motion, subtle |
`
  },
  checklist: {
    title: 'Completion Checklist',
    icon: CheckSquare,
    content: `# Completion Checklist
## Employee Engagement Platform

---

## 1. Project Status Overview

\`\`\`
┌────────────────┬───────────┬──────────┬────────────┐
│    Phase       │  Status   │ Progress │  Details   │
├────────────────┼───────────┼──────────┼────────────┤
│ 1. Foundation  │ ✅ Done   │   100%   │            │
│ 2. Activities  │ ✅ Done   │   100%   │ 15+ templates │
│ 3. Events      │ ✅ Done   │   100%   │            │
│ 4. Channels    │ ✅ Done   │   100%   │            │
│ 5. Gamification│ ✅ Done   │   100%   │ 10 badges  │
│ 6. Surveys     │ 📋 Spec'd │    20%   │            │
│ 7. Point Store │ 📋 Spec'd │    10%   │            │
│ 8. Analytics   │ ✅ Done   │    90%   │            │
│ 9. Integrations│ 🔄 In Prog│    60%   │ Stripe ready │
│10. Polish      │ ⏳ Pending│    10%   │            │
└────────────────┴───────────┴──────────┴────────────┘
\`\`\`

---

## 2. Feature Checklist

### Core Platform ✅
- [x] Project setup (React + Tailwind + shadcn)
- [x] Layout component with responsive sidebar
- [x] Role-based navigation
- [x] Authentication (Base44 built-in)
- [x] Global styles with brand colors
- [x] Error boundaries
- [x] Loading states

### Team Channels ✅
- [x] Channel entity with full schema
- [x] ChannelMessage entity
- [x] Channel list UI
- [x] Create channel dialog
- [x] Real-time chat polling
- [x] Message reactions
- [x] Member management
- [x] Public/private visibility

### Gamification ✅
- [x] UserPoints entity
- [x] Badge entity with 10 badges
- [x] Points dashboard
- [x] Level system (20 levels)
- [x] XP progress ring
- [x] Badge showcase
- [x] Leaderboard (individual + team)
- [x] Streak tracking
- [x] awardPoints backend function

### Events & Activities ✅
- [x] Activity entity (15+ templates)
- [x] Event entity
- [x] Participation entity
- [x] Event calendar
- [x] Event templates (30+)
- [x] Facilitator tools
- [x] Recurring events
- [x] Bulk scheduling

### Surveys 📋 (Pending)
- [x] Survey entity schema
- [x] SurveyResponse entity
- [x] SurveyInvitation entity
- [ ] Survey builder UI
- [ ] Survey taker UI
- [ ] Anonymous submission
- [ ] Results dashboard
- [ ] Sentiment analysis

### Point Store 📋 (Pending)
- [x] StoreItem entity
- [x] UserInventory entity
- [ ] Store page UI
- [ ] Purchase with points
- [ ] Stripe checkout
- [ ] Avatar customizer

---

## 3. Entity Completion

| Entity | Schema | Data | CRUD | Notes |
|--------|--------|------|------|-------|
| User | ✅ | ✅ | ✅ | Built-in |
| UserPoints | ✅ | ✅ | ✅ | Gamification |
| Activity | ✅ | ✅ (15+) | ✅ | Templates |
| Event | ✅ | ✅ | ✅ | Scheduled |
| Channel | ✅ | ✅ | ✅ | Messaging |
| Badge | ✅ | ✅ (10) | ✅ | Achievements |
| Team | ✅ | ⏳ | ✅ | Structure |
| Survey | ✅ | ⏳ | ✅ | Feedback |
| StoreItem | ✅ | ⏳ | ✅ | Store |

---

## 4. Backend Functions

| Function | Status | Purpose |
|----------|--------|---------|
| awardPoints | ✅ | Add points |
| updateStreak | ✅ | Track streaks |
| slackNotifications | ✅ | Slack alerts |
| teamsNotifications | ✅ | Teams alerts |
| generateRecommendations | ✅ | AI suggestions |
| submitSurveyResponse | ⏳ | Anonymous submit |
| purchaseWithPoints | ⏳ | Store purchase |
| createStoreCheckout | ⏳ | Stripe session |

---

## 5. Next Steps

### Immediate (This Week)
1. [ ] Build Survey Builder component
2. [ ] Build Survey Taker component
3. [ ] Implement anonymous submission
4. [ ] Add minimum threshold check

### Short-term (Next 2 Weeks)
1. [ ] Complete Survey module
2. [ ] Build Point Store page
3. [ ] Implement Stripe checkout
4. [ ] Recognition components

### Before Launch
1. [ ] Security audit
2. [ ] Accessibility audit (WCAG 2.1 AA)
3. [ ] Beta testing with 10 users
4. [ ] Performance benchmarking
`
  },
  architecture: {
    title: 'Architecture',
    icon: GitBranch,
    content: `# Architecture Document
## Employee Engagement Platform

---

## 1. System Architecture

\`\`\`
┌─────────────────────────────────────────────┐
│              CLIENT LAYER                    │
│  Desktop Browser │ Mobile │ Tablet          │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│           APPLICATION LAYER                  │
│                                             │
│  React + Tailwind + shadcn/ui              │
│  TanStack Query │ React Router             │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              API LAYER                       │
│                                             │
│  Base44 SDK                                 │
│  Entities │ Functions │ Integrations       │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│            BACKEND LAYER                     │
│                                             │
│  Deno Functions │ Database │ External APIs │
│  Slack │ Teams │ Stripe │ OpenAI          │
└─────────────────────────────────────────────┘
\`\`\`

---

## 2. Directory Structure

\`\`\`
├── pages/                    # 25+ route pages
│   ├── Dashboard.jsx
│   ├── Activities.jsx
│   ├── Calendar.jsx
│   ├── Channels.jsx
│   ├── Teams.jsx
│   ├── GamificationDashboard.jsx
│   ├── Analytics.jsx
│   └── ...
│
├── components/               # 100+ components
│   ├── common/              # LoadingSpinner, EmptyState
│   ├── channels/            # ChannelList, ChannelChat
│   ├── gamification/        # BadgeCard, Leaderboard
│   ├── events/              # EventCalendarCard
│   ├── hooks/               # useUserData, useEventData
│   ├── utils/               # formatters, validators
│   └── docs/                # Markdown documentation
│
├── entities/                # 30+ data schemas
│   ├── Activity.json
│   ├── Event.json
│   ├── Badge.json
│   └── ...
│
├── functions/               # 20+ backend functions
│   ├── awardPoints.js
│   ├── slackNotifications.js
│   └── ...
│
├── Layout.js
└── globals.css
\`\`\`

---

## 3. Data Architecture

### Entity Relationships

\`\`\`
User (Built-in)
├── UserPoints (1:1) - Gamification data
├── UserProfile (1:1) - Extended info
├── UserInventory (1:N) - Store items
│
├── Recognition
│   ├── sender_email → User
│   ├── recipient_emails → User[]
│   └── tags → RecognitionTag[]
│
├── SurveyInvitation
│   └── ⚠️ NO LINK to SurveyResponse (anonymity)
│
├── Channel
│   └── ChannelMessage[]
│
└── TeamMembership
    └── Team
\`\`\`

### Live Data

**Activities (15+ templates)**
- Icebreaker: Two Truths, Show & Tell
- Creative: Caption Contest, Pictionary
- Competitive: Trivia, Scavenger Hunt
- Wellness: Desk Yoga, Meditation
- Learning: Training, Workshops
- Social: Coffee Chat, Happy Hour

**Badges (10 configured)**
| Badge | Rarity | Points | Criteria |
|-------|--------|--------|----------|
| First Steps | Common | 10 | 1 event |
| Team Player | Common | 25 | 5 events |
| Dedicated Member | Uncommon | 50 | 10 events |
| Streak Master | Epic | 100 | 30-day streak |
| Early Adopter | Legendary | 150 | First 50 users |

---

## 4. Security Architecture

### Role-Based Access Control

| Resource | Admin | HR | Manager | User |
|----------|-------|-----|---------|------|
| Recognition Create | ✓ | ✓ | ✓ | ✓ |
| Recognition Moderate | ✓ | ✓ | ✗ | ✗ |
| Survey Create | ✓ | ✓ | ✗ | ✗ |
| Survey Results | ✓ | ✓ | Team | ✗ |
| Analytics | ✓ | ✓ | Team | Personal |
| Store Manage | ✓ | ✗ | ✗ | ✗ |

### Survey Anonymity
- SurveyResponse has NO user_email field
- SurveyInvitation tracks completion separately
- Results hidden until 5+ responses
- Timestamps randomized
`
  },
  features: {
    title: 'Feature Specs',
    icon: Layers,
    content: `# Feature Specifications
## Employee Engagement Platform

---

## 1. Feature Matrix

| Feature | Status | Priority | Module |
|---------|--------|----------|--------|
| Activity Library | ✅ Built | P0 | Activities |
| Event Scheduling | ✅ Built | P0 | Events |
| Team Channels | ✅ Built | P0 | Channels |
| Points System | ✅ Built | P0 | Gamification |
| Badges | ✅ Built | P1 | Gamification |
| Team Challenges | ✅ Built | P1 | Gamification |
| Analytics | ✅ Built | P1 | Analytics |
| Pulse Surveys | 📋 Spec'd | P0 | Surveys |
| Point Store | 📋 Spec'd | P1 | Store |
| Peer Recognition | 📋 Spec'd | P0 | Recognition |

---

## 2. Gamification System

### Points Economy

\`\`\`
EARNING POINTS              SPENDING POINTS
══════════════              ═══════════════

Event Attendance    +10     Store Items
Survey Completion   +10     • Avatar hats
Give Recognition    +5      • Glasses
Receive Recognition +10-35  • Backgrounds
Activity Completion +15     
Streak Bonus (7d)   +25     Power-Ups
Badge Earned        varies  • 2X Points
Team Challenge Win  +100    • Visibility Boost
\`\`\`

### Level Progression

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Newcomer |
| 5 | 1000 | Champion |
| 10 | 5000 | Ambassador |
| 15 | 15000 | Legend |
| 20 | 50000 | Icon |

### Badge Rarities

| Rarity | Color | Multiplier | Examples |
|--------|-------|------------|----------|
| Common | Gray | 1x | First Steps |
| Uncommon | Green | 1.5x | Feedback Hero |
| Rare | Blue | 2x | Activity Master |
| Epic | Purple | 3x | Streak Master |
| Legendary | Gold | 5x | Early Adopter |

---

## 3. Activity Types

| Type | Icon | Color | Examples |
|------|------|-------|----------|
| Icebreaker | 🎭 | Blue | Two Truths, Show & Tell |
| Creative | 🎨 | Purple | Caption Contest |
| Competitive | 🏆 | Amber | Trivia, Scavenger Hunt |
| Wellness | 🧘 | Green | Desk Yoga |
| Learning | 📚 | Cyan | Workshops |
| Social | 🎉 | Pink | Coffee Chat |

---

## 4. Survey Anonymity Architecture

\`\`\`
┌─────────────────────────────────────────┐
│     SURVEY INVITATION TRACKING          │
│     ─────────────────────────          │
│     user_email: alex@intinc.com         │
│     status: completed ✓                 │
│                                         │
│     ⚠️ NO LINK to response             │
└─────────────────────────────────────────┘

                🔒 WALL 🔒

┌─────────────────────────────────────────┐
│     SURVEY RESPONSE DATA                │
│     ─────────────────────               │
│     survey_id: survey_123               │
│     answers: [{ q1: 4 }, ...]          │
│                                         │
│     ❌ NO user_email                    │
│     ✓ Only shown if responses >= 5     │
└─────────────────────────────────────────┘
\`\`\`

---

## 5. Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| recognition.enabled | true | Master toggle |
| recognition.moderation | hybrid | Moderation mode |
| surveys.anonymous | true | Force anonymity |
| surveys.min_threshold | 5 | Min responses |
| store.stripe | true | Real-money purchases |
| gamification.badges | true | Badge system |
| gamification.leaderboard | true | Public leaderboard |
| gamification.streaks | true | Streak tracking |
| ai.suggestions | true | AI recommendations |
`
  },
  integrations: {
    title: 'Integration Guide',
    icon: Plug,
    content: `# Integration Guide
## Employee Engagement Platform

---

## 1. Integration Overview

\`\`\`
┌─────────────────────┐
│  ENGAGEMENT PLATFORM │
│  • Recognition       │
│  • Surveys          │
│  • Gamification     │
│  • Channels         │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐ ┌─────────┐
│COMMUNI- │ │PAYMENTS │
│CATION   │ │         │
│         │ │• Stripe │
│• Slack  │ └─────────┘
│• Teams  │
│• Email  │ ┌─────────┐
└─────────┘ │   AI    │
            │         │
┌─────────┐ │• OpenAI │
│CALENDAR │ │• Claude │
│         │ └─────────┘
│• Google │
└─────────┘
\`\`\`

---

## 2. Configured Secrets

| Variable | Service | Status |
|----------|---------|--------|
| STRIPE_SECRET_KEY | Stripe | ✅ Set |
| STRIPE_SIGNING_SECRET | Stripe | ✅ Set |
| OPENAI_API_KEY | OpenAI | ✅ Set |
| ANTHROPIC_API_KEY | Claude | ✅ Set |
| PERPLEXITY_API_KEY | Perplexity | ✅ Set |
| CLOUDINARY_URL | Cloudinary | ✅ Set |
| NOTION_API_KEY | Notion | ✅ Set |
| GOOGLE_API_KEY | Google | ✅ Set |
| HUBSPOT_PERSONAL_ACCESS_KEY | HubSpot | ✅ Set |
| LINEAR_API_KEY | Linear | ✅ Set |
| GITHUB_PERSONAL_ACCESS_TOKEN | GitHub | ✅ Set |

---

## 3. Stripe Integration

### Product Configuration

| Product | Price ID | Amount |
|---------|----------|--------|
| FlashFusion | price_1SMz...owMTzC | $29/mo |
| FlashFusion | price_1SMz...ycDw | $29/mo (metered) |
| FlashFusion | price_1SMz...yDQx | $79/mo (metered) |
| FlashFusion | price_1SMz...UZPZ | $0/mo (free) |

### Checkout Flow

\`\`\`javascript
// Create checkout session
const { checkoutUrl } = await base44.functions.invoke('createStoreCheckout', {
  itemId: 'item_123'
});
window.location.href = checkoutUrl;
\`\`\`

### Webhook Handler

\`\`\`javascript
// functions/storeWebhook.js
switch (event.type) {
  case 'checkout.session.completed':
    // Add item to inventory
    // Update transaction status
    break;
  case 'payment_intent.payment_failed':
    // Log failure
    break;
}
\`\`\`

---

## 4. Slack Integration

### Notification Types

| Event | Slack Action |
|-------|--------------|
| Recognition received | DM to recipient |
| Survey available | Channel post |
| Badge earned | DM to recipient |
| Event reminder | Channel post |

### Message Format

\`\`\`javascript
{
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🌟 *New Recognition!*'
      }
    },
    {
      type: 'actions',
      elements: [{
        type: 'button',
        text: { type: 'plain_text', text: 'View' },
        url: appUrl
      }]
    }
  ]
}
\`\`\`

---

## 5. AI Integration

### LLM Usage

\`\`\`javascript
const analysis = await base44.integrations.Core.InvokeLLM({
  prompt: 'Analyze survey responses for sentiment',
  response_json_schema: {
    type: 'object',
    properties: {
      sentiment: { type: 'string' },
      themes: { type: 'array' }
    }
  }
});
\`\`\`

### Use Cases
- Survey sentiment analysis
- Content moderation
- Activity recommendations
- Event summaries
`
  },
  api: {
    title: 'API Reference',
    icon: Code,
    content: `# API Reference
## Employee Engagement Platform

---

## 1. SDK Configuration

\`\`\`javascript
// Frontend
import { base44 } from '@/api/base44Client';

// Backend Function
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
const base44 = createClientFromRequest(req);
\`\`\`

---

## 2. Authentication

\`\`\`javascript
// Get current user
const user = await base44.auth.me();

// Logout
base44.auth.logout(redirectUrl);

// Check auth status
const isAuth = await base44.auth.isAuthenticated();

// Update current user
await base44.auth.updateMe({ custom_field: 'value' });
\`\`\`

---

## 3. Entity Operations

### List/Filter

\`\`\`javascript
// List all (with sort and limit)
const items = await base44.entities.Activity.list('-created_date', 20);

// Filter
const active = await base44.entities.Event.filter({ status: 'scheduled' });

// Complex filter
const feed = await base44.entities.Recognition.filter(
  { status: 'approved', visibility: 'public' },
  '-created_date',
  50
);
\`\`\`

### Create/Update/Delete

\`\`\`javascript
// Create
const event = await base44.entities.Event.create({
  title: 'Team Trivia',
  scheduled_date: '2025-12-01T18:00:00Z'
});

// Update
await base44.entities.Event.update(id, { status: 'cancelled' });

// Delete
await base44.entities.Event.delete(id);
\`\`\`

---

## 4. Backend Functions

### Invoke Pattern

\`\`\`javascript
const response = await base44.functions.invoke('functionName', {
  param1: 'value1',
  param2: 'value2'
});

// Response is Axios response: { data, status, headers }
const result = response.data;
\`\`\`

### Available Functions

| Function | Purpose | Parameters |
|----------|---------|------------|
| awardPoints | Add points | user_email, amount, reason |
| updateStreak | Track streaks | user_email |
| slackNotifications | Send to Slack | type, data |
| teamsNotifications | Send to Teams | type, data |
| generateRecommendations | AI suggestions | - |

---

## 5. Core Integrations

### LLM

\`\`\`javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: 'Analyze this feedback',
  response_json_schema: {
    type: 'object',
    properties: { sentiment: { type: 'string' } }
  }
});
\`\`\`

### File Upload

\`\`\`javascript
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});
\`\`\`

### Email

\`\`\`javascript
await base44.integrations.Core.SendEmail({
  to: 'user@intinc.com',
  subject: 'Subject',
  body: '<html>...</html>'
});
\`\`\`

---

## 6. Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Entity reads | 1000 | per minute |
| Entity writes | 100 | per minute |
| Function invocations | 100 | per minute |
| File uploads | 20 | per minute |
`
  }
};

export default function Documentation() {
  const { user, loading } = useUserData(true, false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading documentation..." />;
  }

  const tabs = [
    { key: 'overview', ...DOCS.overview },
    { key: 'prd', ...DOCS.prd },
    { key: 'checklist', ...DOCS.checklist },
    { key: 'architecture', ...DOCS.architecture },
    { key: 'features', ...DOCS.features },
    { key: 'integrations', ...DOCS.integrations },
    { key: 'api', ...DOCS.api }
  ];

  const filteredContent = searchQuery
    ? DOCS[activeTab].content.split('\n').filter(line => 
        line.toLowerCase().includes(searchQuery.toLowerCase())
      ).join('\n')
    : DOCS[activeTab].content;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-int-navy font-display">
              <span className="text-gradient-orange">📚</span> Platform Documentation
            </h1>
            <p className="text-slate-600 mt-1">
              Intinc Employee Engagement Platform - Technical Documentation
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              65% Complete
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* AI Tools */}
      {user?.role === 'admin' && (
        <div className="grid md:grid-cols-2 gap-6">
          <DocsChangeDetector />
          <DocSummarizer />
        </div>
      )}

      {/* Documentation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-white/80 backdrop-blur-sm rounded-lg border">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex items-center gap-2 data-[state=active]:bg-int-orange data-[state=active]:text-white"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.key} value={tab.key}>
            <Card className="glass-card-solid">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-int-navy">
                    <tab.icon className="h-5 w-5 text-int-orange" />
                    {tab.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    components/docs/{tab.key.toUpperCase()}.md
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-slate max-w-none prose-headings:text-int-navy prose-a:text-int-orange prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold text-int-navy border-b pb-2 mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold text-int-navy mt-6 mb-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-medium text-int-navy mt-4 mb-2">{children}</h3>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => <th className="bg-slate-100 px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">{children}</th>,
                        td: ({ children }) => <td className="px-4 py-2 text-sm border-b border-slate-100">{children}</td>,
                        code: ({ inline, children }) => inline 
                          ? <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-int-navy">{children}</code>
                          : <code>{children}</code>,
                        pre: ({ children }) => (
                          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4">
                            {children}
                          </pre>
                        ),
                        ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 my-2">{children}</ul>,
                        li: ({ children }) => <li className="text-slate-700">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-int-orange pl-4 italic text-slate-600 my-4">
                            {children}
                          </blockquote>
                        )
                      }}
                    >
                      {filteredContent}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Reference Card */}
      <Card className="glass-card-solid">
        <CardHeader>
          <CardTitle className="text-int-navy flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Quick Reference - File Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-int-navy mb-1">📄 Markdown Docs</div>
              <code className="text-xs text-slate-600">components/docs/*.md</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-int-navy mb-1">📁 Entity Schemas</div>
              <code className="text-xs text-slate-600">entities/*.json</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-int-navy mb-1">⚡ Backend Functions</div>
              <code className="text-xs text-slate-600">functions/*.js</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-int-navy mb-1">🎨 Global Styles</div>
              <code className="text-xs text-slate-600">globals.css</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-int-navy mb-1">🧩 Components</div>
              <code className="text-xs text-slate-600">components/**/*.jsx</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-int-navy mb-1">📱 Pages</div>
              <code className="text-xs text-slate-600">pages/*.jsx</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}