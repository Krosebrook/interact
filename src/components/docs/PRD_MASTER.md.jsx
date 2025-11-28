# Employee Engagement Platform - Master PRD

## 1. Executive Summary

**Product Name:** Team Engage (Employee Engagement Platform)
**Company:** Intinc (Remote-First Tech Company, 50-200 employees)
**Target Users:** Remote Employees, Team Leads, HR/People Ops

### Vision
Create a vibrant, intuitive platform that empowers employees to connect, grow, and thrive through gamified engagement, AI-powered suggestions, and seamless integrations.

---

## 2. Architecture Overview

### 2.1 Technology Stack
- **Frontend:** React 18, TailwindCSS, shadcn/ui, Framer Motion
- **State Management:** TanStack Query (React Query)
- **Backend:** Base44 Platform (Entities, Functions, Agents)
- **Integrations:** Slack, MS Teams, Google Calendar, Stripe, Email

### 2.2 File Structure
```
├── entities/           # JSON Schema definitions
├── pages/              # Top-level route components
├── components/
│   ├── common/         # Shared UI components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions & constants
│   ├── gamification/   # Points, badges, leaderboards
│   ├── events/         # Event management
│   ├── teams/          # Team features
│   ├── ai/             # AI-powered features
│   ├── analytics/      # Dashboards & charts
│   ├── facilitator/    # Facilitator tools
│   ├── participant/    # Participant views
│   ├── profile/        # User profiles
│   ├── settings/       # Configuration panels
│   ├── notifications/  # Notification components
│   ├── templates/      # Event templates data
│   ├── docs/           # Documentation
│   └── pwa/            # PWA components
├── functions/          # Backend functions (Deno)
├── agents/             # AI Agent configurations
└── Layout.js           # App shell layout
```

### 2.3 Core Entities
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| `User` | Built-in user management | email, full_name, role |
| `Activity` | Activity templates | title, type, duration, instructions |
| `Event` | Scheduled events | activity_id, scheduled_date, status |
| `Participation` | User event attendance | event_id, participant_email, attended |
| `UserPoints` | Gamification points | user_email, total_points, level |
| `Badge` | Achievement definitions | badge_name, award_criteria, rarity |
| `BadgeAward` | User badge awards | user_email, badge_id |
| `Team` | Team groupings | name, description, members |
| `TeamChallenge` | Team competitions | title, metric_type, participating_teams |
| `Reward` | Redeemable rewards | reward_name, points_cost, category |
| `EventTemplate` | Pre-built event templates | name, category, agenda, game_config |

---

## 3. Feature Modules

### 3.1 Core Features (Phase 1 - Complete)
- [x] Event scheduling & calendar
- [x] Activity library with templates
- [x] Participant RSVP & attendance
- [x] Facilitator dashboard
- [x] Basic gamification (points, badges)

### 3.2 Gamification System (Phase 2 - Complete)
- [x] Points tracking & history
- [x] Level progression with XP
- [x] Badge system with rarities
- [x] Leaderboards (individual & team)
- [x] Streak tracking
- [x] Team challenges

### 3.3 AI & Analytics (Phase 3 - Complete)
- [x] AI event suggestions
- [x] Feedback analysis
- [x] Skill tracking & trends
- [x] HR analytics dashboard
- [x] Engagement metrics

### 3.4 Enhanced Engagement (Phase 4 - In Progress)
- [x] 30 production-ready event templates
- [x] Sound effects system
- [x] PWA support
- [ ] Point store for avatar power-ups
- [ ] Peer-to-peer recognition
- [ ] Pulse surveys

### 3.5 Integrations (Phase 5 - Planned)
- [x] Slack notifications (webhook configured)
- [x] MS Teams notifications (webhook configured)
- [ ] Google Calendar sync (OAuth pending)
- [x] Email notifications (built-in)
- [x] Stripe integration (API key configured)

---

## 4. API & Backend Functions

### 4.1 Active Backend Functions
| Function | Purpose | Status |
|----------|---------|--------|
| `slackNotifications` | Send Slack webhook messages | ✅ Ready |
| `teamsNotifications` | Send MS Teams adaptive cards | ✅ Ready |
| `googleCalendarSync` | Sync events to Google Calendar | ⚠️ Needs OAuth |
| `gamificationEmails` | Send engagement emails | ✅ Ready |
| `awardPoints` | Award points to users | ✅ Ready |
| `generateRecommendations` | AI event suggestions | ✅ Ready |
| `redeemReward` | Process reward redemptions | ✅ Ready |
| `openaiIntegration` | OpenAI API wrapper | ✅ Ready |
| `claudeIntegration` | Claude API wrapper | ✅ Ready |

### 4.2 Required Secrets (Set in Dashboard)
| Secret | Purpose | Status |
|--------|---------|--------|
| `OPENAI_API_KEY` | AI features | ✅ Set |
| `ANTHROPIC_API_KEY` | Claude AI | ✅ Set |
| `STRIPE_SECRET_KEY` | Payments | ✅ Set |
| `STRIPE_SIGNING_SECRET` | Webhooks | ✅ Set |
| `SLACK_WEBHOOK_URL` | Slack notifications | ⚠️ Need to set |
| `TEAMS_WEBHOOK_URL` | Teams notifications | ⚠️ Need to set |
| `GOOGLE_API_KEY` | Calendar sync | ✅ Set |

---

## 5. AI Agents

### 5.1 Configured Agents
| Agent | Purpose | Tools |
|-------|---------|-------|
| `EventManagerAgent` | Event planning assistance | Event, Activity, Participation CRUD |
| `GamificationAssistant` | Points & badges guidance | UserPoints, Badge read |
| `RewardsManagerAgent` | Reward management | Reward, RewardRedemption CRUD |
| `FacilitatorAssistant` | Live event facilitation | Event, Participation, Poll CRUD |

### 5.2 Planned Agents
| Agent | Purpose | Status |
|-------|---------|--------|
| `HRAnalyticsAgent` | HR insights & reports | Planned |
| `PersonalCoachAgent` | Individual engagement coaching | Planned |
| `RecognitionAgent` | Peer recognition management | Planned |

---

## 6. UI/UX Guidelines

### 6.1 Design System
- **Primary Colors:** Navy (#14294D), Orange (#D97230)
- **Accent Colors:** Gold (#F5C16A), Teal (#2DD4BF)
- **Typography:** Inter (display & body)
- **Icons:** Lucide React
- **Animations:** Framer Motion

### 6.2 Component Patterns
- Glass morphism for cards and panels
- Gradient headers for visual hierarchy
- Sound effects for key interactions
- Responsive grid layouts (mobile-first)
- Skeleton loading states

### 6.3 Accessibility
- WCAG 2.1 AA compliance minimum
- Large touch targets (44px+)
- Sufficient color contrast
- Keyboard navigation support
- Screen reader compatible

---

## 7. Security & Privacy

### 7.1 Authentication
- SSO support (Azure AD, Google Workspace, Okta)
- Session timeout: 8 hours
- Role-based access control (RBAC)

### 7.2 Data Privacy
- PII never exposed to non-HR roles
- Survey responses anonymized (min 5 responses)
- File uploads: max 10MB, image/PDF only
- All API endpoints require authentication

### 7.3 Roles & Permissions
| Role | Permissions |
|------|-------------|
| `admin` | Full access to all features |
| `organizer` | Create/manage events and activities |
| `team_lead` | Manage team, view team analytics |
| `facilitator` | Run events, access facilitator tools |
| `participant` | Join events, view own data |

---

## 8. Deliverables Checklist

### 8.1 Completed
- [x] Core event management system
- [x] Activity library with 30+ templates
- [x] Gamification engine (points, badges, levels)
- [x] Team management & challenges
- [x] AI-powered suggestions
- [x] Analytics dashboards
- [x] PWA support
- [x] Sound effects system
- [x] Responsive design

### 8.2 In Progress
- [ ] Point store for avatar power-ups
- [ ] Peer-to-peer recognition system
- [ ] Pulse survey functionality
- [ ] Milestone celebrations

### 8.3 Pending
- [ ] Google Calendar OAuth integration
- [ ] Stripe checkout for point store
- [ ] Wellness challenges module
- [ ] Advanced HR analytics

---

## 9. Testing & Quality

### 9.1 Component Testing
- UI components should render without errors
- Forms should validate inputs
- API calls should handle loading/error states

### 9.2 Integration Testing
- Backend functions should return expected data
- Webhook integrations should send correctly
- OAuth flows should complete successfully

---

## 10. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 2024 | Initial release - Core features |
| 1.1.0 | Nov 2024 | Gamification system |
| 1.2.0 | Nov 2024 | AI & Analytics |
| 1.3.0 | Nov 2024 | Templates & Sound effects |
| 1.4.0 | TBD | Point store & Recognition |