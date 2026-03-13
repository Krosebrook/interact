# Product Requirements Document (PRD)
## Interact — Enterprise Employee Engagement Platform

**Version:** 1.0.0  
**Status:** Active Development (Q1 2026)  
**Last Updated:** January 2026  

> This document captures the **current-state** product requirements reflecting what is implemented in the codebase. For planning-oriented PRD content, see `docs/planning/PRD.md`.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users & Personas](#2-target-users--personas)
3. [Core Features](#3-core-features)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Integration Requirements](#5-integration-requirements)
6. [Out of Scope (v1)](#6-out-of-scope-v1)

---

## 1. Product Overview

**Interact** is an enterprise-grade employee engagement platform that combines gamification, AI-powered personalization, and team activity management to improve workplace engagement, retention, and culture.

### Value Proposition

| Stakeholder | Value |
|---|---|
| **Employees** | Fun, rewarding, personalized work experience with clear recognition |
| **Team Leads** | Real-time visibility into team health; AI-assisted facilitation |
| **HR / Admins** | Data-driven engagement analytics; lifecycle management |
| **Facilitators** | AI tools to plan, run, and debrief team activities efficiently |

### Positioning

Interact competes in the employee engagement SaaS space (vs. Motivosity, Bonusly, Vantage Circle) with differentiators:
- **AI-first:** 60+ AI serverless functions for personalization at scale
- **Gamification-deep:** Full points → badges → leaderboards → rewards loop
- **All-in-one:** Activities + events + recognition + analytics + learning in one platform

---

## 2. Target Users & Personas

### Primary Personas

#### 1. Employee / Participant
- Wants to earn points, badges, and rewards for engagement
- Discovers activities, joins events, tracks personal progress
- Gives and receives peer recognition (kudos)
- Pages: Dashboard, Gamification, Activities, Recognition, RewardsStore, UserProfile, WellnessDashboard

#### 2. Team Leader / Manager
- Manages team performance and engagement
- Schedules and facilitates team activities
- Reviews team analytics and coaching insights
- Pages: TeamLeaderDashboard, TeamAnalytics, FacilitatorDashboard, TeamChallenges, TeamCompetition

#### 3. Facilitator
- Plans and runs events using AI tools
- Monitors live participation and sends nudges
- Generates post-event summaries and insights
- Pages: FacilitatorDashboard, FacilitatorView, FacilitatorAITools, AIEventPlanner

#### 4. HR / Admin
- Platform-wide configuration and user management
- Reviews aggregate analytics and engagement health
- Manages RBAC, content moderation, and compliance
- Pages: AdminHub, AdminDashboard, AdminAnalyticsDashboard, UserManagement, AuditLog, GamificationAdmin

#### 5. New Hire
- Completes structured onboarding journey
- Meets their buddy, explores platform, earns onboarding badges
- Pages: OnboardingWelcome, GamifiedOnboarding, NewHireOnboarding, OnboardingHub

---

## 3. Core Features

### 3.1 Gamification Engine ✅ Implemented

**Purpose:** Drive engagement through game mechanics — points, leveling, badges, challenges, leaderboards, and a rewards store.

**Requirements:**
- Users earn points for activities: joining events, completing modules, giving recognition, streaks
- Points accumulate toward levels (configurable thresholds)
- Badges awarded automatically on milestones and manually by admins
- Achievement tiers (Bronze, Silver, Gold, Platinum, Diamond) with associated benefits
- Personal challenges with progress tracking
- Team competitions and team-level leaderboards
- Rewards store: users spend points on items (digital and physical)
- Point donations to charities
- AI-optimized gamification rules that adapt to user behavior

**Entities:** UserPoints, Badge, BadgeAward, PersonalChallenge, AchievementTier, StoreItem, UserInventory, CharitableDonation, CharitableImpact

**Pages:** Gamification, GamificationDashboard, GamificationAdmin, GamificationSettings, GamificationRuleBuilder, Leaderboards, PointStore, RewardsStore, Milestones, Challenges, TeamChallenges, TeamCompetition

---

### 3.2 Activity Management ✅ Implemented

**Purpose:** Catalog and manage team activities that employees can participate in.

**Requirements:**
- Activity library with type, description, duration
- Modular activities that can be composed from building blocks
- User preferences and favorites
- Activity recommendations (AI-powered)
- Activity templates

**Entities:** Activity, ActivityPreference, ActivityModule, ActivityFavorite

**Pages:** Activities

---

### 3.3 Event System ✅ Implemented

**Purpose:** Schedule, run, and track team events linked to activities.

**Requirements:**
- Event creation wizard with templates
- Recurring event support (daily, weekly, monthly)
- Calendar integration (Google Calendar sync)
- Live event participation with real-time Q&A / chat
- Attendance tracking and no-show handling
- Facilitator guide generation (AI)
- Post-event summaries and icebreaker generation
- Bulk event scheduling
- One-hour-before email reminders

**Entities:** Event, Participation, EventMessage, BulkEventSchedule

**Pages:** Calendar, ParticipantEvent, ParticipantPortal, ParticipantHub, FacilitatorView

---

### 3.4 AI-Powered Features ✅ Implemented

**Purpose:** Deliver personalized, intelligent experiences at scale using GPT-4, Claude, and Gemini.

**Requirements:**
- Personalized activity recommendations based on history and preferences
- AI event planning assistant (optimal timing, format suggestions)
- AI coaching and nudges for individual employees
- AI-powered onboarding plans for new hires
- AI insights dashboard for facilitators (burnout risk, disengagement signals)
- Buddy matching via AI compatibility scoring
- AI-generated recognition drafts
- A/B testing of AI recommendations
- AI chatbot assistant (in-app)
- Predictive churn risk analysis

**Entities:** AIInsight, AIRecommendation, AIGamificationSuggestion, BuddyMatch

**Pages:** AIPersonalization, AIEnhancedCoaching, AIEventPlanner, AIAdminDashboard, FacilitatorAITools, PredictiveAnalytics, PredictiveAnalyticsDashboard

---

### 3.5 Team Management ✅ Implemented

**Purpose:** Organize employees into teams with roles and permissions.

**Requirements:**
- Create and manage teams
- Assign team leaders and members
- Role-based access control (RBAC) with role assignment
- Team-level analytics and dashboards
- Team automation (check-ins, reminders)
- Microsoft Teams integration configuration

**Entities:** Team, TeamMembership, TeamsConfig

**Pages:** Teams, TeamDashboard, TeamLeaderDashboard, TeamAnalytics, TeamAnalyticsDashboard, TeamAutomation, TeamAutomations, UserManagement, RoleManagement, RoleSecurity, RoleSelection, RoleSetup, UserRoleAssignment, RBACTestChecklist

---

### 3.6 Recognition System ✅ Implemented

**Purpose:** Enable peer-to-peer recognition to reinforce positive behaviors.

**Requirements:**
- Employees can send kudos with a message and optional points
- Recognition appears in a public feed
- AI-assisted recognition draft generation
- Admin moderation of recognition content
- Recognition analytics

**Entities:** Recognition

**Pages:** Recognition, RecognitionEngine, RecognitionFeed

---

### 3.7 Analytics & Reporting ✅ Implemented

**Purpose:** Provide multi-level analytics from individual to org-wide.

**Requirements:**
- Real-time engagement analytics dashboard
- Team analytics with trend lines
- Predictive analytics (churn risk, burnout, engagement forecast)
- Custom report builder
- Wellness-engagement correlation analysis
- A/B test analytics
- Lifecycle analytics (new hire → tenured → at-risk)
- Advanced reporting suite with export
- Custom analytics dashboards

**Pages:** Analytics, AnalyticsDashboard, AdminAnalyticsDashboard, AdvancedAnalytics, AdvancedGamificationAnalytics, AdvancedReportingSuite, CustomAnalytics, CustomReportBuilder, CustomizableAnalyticsDashboard, GamificationAnalytics, LifecycleAnalyticsDashboard, LifecycleIntelligenceDashboard, PredictiveAnalytics, PredictiveAnalyticsDashboard, RealTimeAnalytics, ReportBuilder, SegmentationDashboard, TeamAnalytics, TeamAnalyticsDashboard, TeamPerformanceDashboard, WellnessAnalyticsReport, ABTestingDashboard

---

### 3.8 Onboarding System ✅ Implemented

**Purpose:** Guide new hires through a structured, gamified onboarding journey.

**Requirements:**
- Multi-step onboarding wizard for new hires
- Manager-facing onboarding dashboard
- Gamified onboarding with points and badges
- AI-generated personalized onboarding plan
- Buddy matching and introduction
- 30/60/90-day milestone tracking
- Proactive AI tips and nudges during onboarding

**Entities:** UserOnboarding, BuddyMatch

**Pages:** OnboardingWelcome, OnboardingHub, OnboardingDashboard, GamifiedOnboarding, NewHireOnboarding, NewEmployeeOnboarding, ManagerOnboardingDashboard

---

### 3.9 Knowledge Base & Learning ✅ Implemented

**Purpose:** Centralize organizational knowledge and enable continuous learning.

**Requirements:**
- Knowledge base article creation and management
- Learning paths with progress tracking
- Skill tracking and skills matrix
- Module completion recording
- AI-powered knowledge indexing and search
- AI content gap analysis
- Learning path AI recommendations

**Entities:** KnowledgeBase, LearningPathProgress, SkillTracking, ModuleCompletion

**Pages:** KnowledgeBase, KnowledgeHub, LearningDashboard, LearningPath, SkillsDashboard, SkillsMatrix, MentorshipHub

---

### 3.10 Integrations Hub ✅ Implemented

**Purpose:** Connect Interact with the tools teams already use.

**Requirements:**
- Slack: event notifications, nudges, weekly digests
- Microsoft Teams: notifications, event alerts
- Google Calendar: two-way event sync
- Notion: knowledge base sync
- HubSpot: CRM contact sync
- Zapier: custom workflow automation
- Stripe: rewards store payments
- Fitbit: wellness data import
- Google Drive: document content search
- Google Sheets: data export/import

**Pages:** Integrations, IntegrationsAdmin, IntegrationsHub

---

### 3.11 Wellness Features ✅ Implemented

**Purpose:** Support employee wellbeing and correlate wellness with engagement.

**Requirements:**
- Wellness dashboard with self-reported data
- Fitbit data integration for activity tracking
- Wellness challenge ideas (AI-generated)
- Wellness-engagement correlation analysis
- Burnout risk detection (AI)
- Admin wellness analytics

**Pages:** WellnessDashboard, WellnessAdmin, WellnessAnalyticsReport

---

### 3.12 Social Features ✅ Implemented

**Purpose:** Enable team communication and social engagement within the platform.

**Requirements:**
- Team channels (public, private, team-scoped)
- Channel messaging
- Direct messaging
- Social gamification (social actions earn points)
- Social hub aggregating activity

**Entities:** Channel, ChannelMessage

**Pages:** Channels, SocialHub, SocialGamification

---

### 3.13 PWA Support 🔄 In Progress

**Purpose:** Mobile-first experience with offline support.

**Requirements:**
- Service worker for offline caching
- App manifest for installability
- Push notifications
- Capacitor build for Android

**Status:** Capacitor installed; PWA implementation pending (Q2 2025 roadmap)

---

## 4. Non-Functional Requirements

### Performance
- Initial page load: < 2 seconds on broadband
- Time to interactive: < 3 seconds
- API response time: < 500ms p95

### Reliability
- Uptime: 99.9% (Vercel SLA)
- Graceful error handling via `ErrorBoundary` on all pages
- Loading states for all async operations

### Security
- Token-based authentication (Base44)
- RBAC enforced at both UI and function level
- Input validation via Zod on all forms
- Security headers set in `vercel.json`
- No secrets in frontend bundle (VITE_ vars treated as public)

### Accessibility
- WCAG 2.1 AA target
- Keyboard navigation via Radix UI primitives
- Semantic HTML
- ARIA labels on interactive elements

### Scalability
- Serverless functions auto-scale with Base44 infrastructure
- TanStack Query caching reduces API load
- Vercel Edge CDN for static assets

---

## 5. Integration Requirements

See [docs/ARCHITECTURE.md#8-integration-map](ARCHITECTURE.md#8-integration-map) for the complete integration inventory.

All integrations are implemented as Base44 serverless functions and are activated per-organization via the Integrations Hub admin page.

---

## 6. Out of Scope (v1)

| Feature | Notes |
|---|---|
| SSO / SAML / OIDC | Not currently implemented; planned per `docs/security/SSO_IMPLEMENTATION.md` |
| Native iOS app | Capacitor Android only in current plan |
| Multi-tenant white-labeling | Single-tenant per Base44 app instance |
| On-premise deployment | Cloud-only (Vercel + Base44) |
| Custom domain email (DMARC) | Resend used for transactional; full DMARC not configured |
