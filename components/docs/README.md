# INTeract - Employee Engagement Platform

## Version 0.0.0 (In Development) | Last Updated: 2026-01-16

A comprehensive, AI-powered employee engagement platform designed for remote-first tech companies (50-200 employees).

---

## 📚 Documentation Hub

### 🚀 Getting Started
- [Quick Start Guide](./QUICK_START_GUIDE.md) - Get up and running with AI features
- [Changelog](./CHANGELOG.md) - What's new in v5.0.0

### 🤖 AI Features
- [AI Features Documentation](./AI_FEATURES_DOCUMENTATION.md) - Complete AI guide
- [Integration Status](./INTEGRATION_STATUS.md) - Integration checklist

### 📖 Reference
- [Architecture](./ARCHITECTURE.md) - System design
- [API Reference](./API_REFERENCE.md) - Developer guide
- [Feature Specs](./FEATURE_SPECS.md) - Detailed specifications

---

## Quick Start

### For Developers

```javascript
// Import hooks from barrel export
import { useUserData, useEventData, useGamificationData } from '../components/hooks';

// Import services from API layer
import { EventService, BadgeService, BackendFunctions } from '../components/lib/api';

// Import constants
import { POINTS_CONFIG, EVENT_TYPES, BADGE_RARITIES } from '../components/lib/constants';

// Import utilities
import { formatDate, calculateLevel, filterUpcomingEvents } from '../components/lib/utils';
```

### For Admins

1. **Dashboard** - Overview of all engagement metrics
2. **Gamification Settings** - Configure points, badges, challenges
3. **Advanced Analytics** - AI insights, A/B testing, performance metrics

---

## Architecture Overview

### Directory Structure

| Directory | Purpose |
|-----------|---------|
| \`components/lib/\` | Core utilities, API layer, constants |
| \`components/hooks/\` | Shared React hooks |
| \`components/common/\` | Reusable UI components |
| \`components/gamification/\` | Gamification features |
| \`components/analytics/gamification/\` | Advanced analytics |
| \`pages/\` | Page components (flat structure) |
| \`entities/\` | JSON schemas for data models |
| \`functions/\` | Backend serverless functions |
| \`agents/\` | AI agent configurations |

### Key Files

| File | Purpose |
|------|---------|
| \`components/lib/api.js\` | Centralized entity services |
| \`components/lib/constants.js\` | All configuration and enums |
| \`components/lib/utils.js\` | Pure utility functions |
| \`components/lib/queryKeys.js\` | React Query key factory |
| \`components/hooks/index.jsx\` | Barrel export for all hooks |

---

## Core Features

### 🎮 Gamification (v4.0)

- **Points System** - Configurable points per action
- **Badges** - Custom criteria, rarity tiers, categories
- **Achievement Tiers** - Bronze to Legend progression
- **Personal Challenges** - AI-generated, difficulty scaling
- **Team Challenges** - Collaborative goals
- **Leaderboards** - Tailored by user segment
- **Social Sharing** - Share achievements internally and externally

### 🤖 AI Features (v4.0)

- **Insights Generator** - Automated analytics summaries
- **Strategy Recommendations** - Based on A/B test results
- **Personalized Notifications** - AI-drafted messages
- **Badge Recommendations** - Based on user activity
- **Challenge Suggestions** - Dynamic difficulty

### 📊 Analytics (v4.0)

- **Engagement Trends** - Correlation analysis
- **Badge Distribution** - Most/least earned analysis
- **Challenge Performance** - By type and difficulty
- **Leaderboard Dynamics** - Progression and churn
- **A/B Testing Framework** - Test gamification elements

### 🎯 Events & Activities

- **Activity Library** - Templates with AI generation
- **Event Scheduling** - Single, recurring, series
- **Participant Management** - Registration, attendance
- **Facilitator Tools** - Live coaching, Q&A moderation

### 🏆 Recognition

- **Peer-to-Peer** - Public shoutouts with categories
- **AI Moderation** - Automatic content review
- **Company Values** - Tag recognitions to values
- **Visibility Controls** - Public, private, team-only

### 👥 Social

- **Teams** - Department and project teams
- **Channels** - Topic-based communication
- **Profiles** - Customizable with avatars
- **Following** - Connect with colleagues
- **Employee Directory** - Searchable directory with public profiles
- **Social Gamification** - Social sharing and community challenges

### 📚 Knowledge Hub

- **Knowledge Search** - AI-powered knowledge base search
- **Knowledge Indexer** - Automatic documentation indexing
- **Content Curation** - AI-curated learning content
- **Knowledge Base Rebuild** - Automated knowledge base updates

### 🎓 Learning & Development

- **Learning Paths** - Structured learning journeys
- **Learning Dashboard** - Track progress and achievements
- **AI Learning Recommendations** - Personalized course suggestions
- **Career Path Recommendations** - AI-powered career guidance
- **Mentor Matching** - AI-based mentor-mentee pairing
- **Buddy Matching** - Onboarding buddy assignment

### 🎯 Milestones & Skills

- **Milestone Detection** - Automated milestone recognition
- **Skills Dashboard** - Track and develop skills
- **Skill Development Tracking** - Progress analytics
- **Skills & Interests** - User profile enrichment

### 👶 Onboarding

- **New Employee Onboarding** - Comprehensive onboarding workflows
- **Onboarding Dashboard** - Track onboarding progress
- **Onboarding Hub** - Centralized onboarding resources
- **AI Onboarding Plans** - Personalized onboarding paths
- **Dynamic Onboarding** - Adaptive onboarding based on progress
- **Onboarding Reminders** - Automated check-ins

---

## Custom Hooks

### Authentication & User

```javascript
// Get current user with role-based routing
const { user, isAdmin, isFacilitator, loading } = useUserData(true);

// Check permissions
const { canManageEvents, canModerate, canAccessAdmin } = usePermissions();
```

### Data Fetching

```javascript
// Events with activities and participations
const { events, activities, participations, isLoading } = useEventData();

// Gamification data
const { userPoints, badges, challenges, leaderboard } = useGamificationData();

// Leaderboard with O(1) lookup
const { rankings, myRank, nearby, stats } = useLeaderboard({ category: 'points', period: 'monthly' });
```

### Actions & Mutations

```javascript
// Event scheduling
const { scheduleEvent, isScheduling } = useEventScheduling();

// Store purchases
const { purchaseItem, isPurchasing } = useStoreActions();
```

---

## Backend Functions

### Gamification

```javascript
// Award points (called via BackendFunctions.awardPoints)
await base44.functions.invoke('awardPoints', {
  user_email: 'user@example.com',
  amount: 10,
  reason: 'Event attendance',
  source: 'attendance',
  event_id: 'event123'
});
```

### AI Integrations

```javascript
// OpenAI
await base44.functions.invoke('openaiIntegration', {
  action: 'chat',
  messages: [{ role: 'user', content: 'Generate activity ideas' }]
});

// Claude
await base44.functions.invoke('claudeIntegration', {
  action: 'vision',
  prompt: 'Analyze this image',
  image_url: 'https://...'
});

// Gemini
await base44.functions.invoke('geminiIntegration', {
  action: 'thinking',
  prompt: 'Complex reasoning task'
});
```

### Complete Functions Reference

The platform includes **110+ backend functions** organized into the following categories:

**Gamification (8 functions):**
- `awardPoints` - Award points to users
- `recordPointsTransaction` - Track points history
- `executeGamificationRules` - Process gamification logic
- `processGamificationRules` - Execute rule engine
- `generateChallengeSuggestions` - Create challenge ideas
- `leaderboardRealtime` - Real-time leaderboard updates
- `getTeamLeaderboardStats` - Team rankings
- `redeemReward` - Process reward redemptions

**AI Features (20+ functions):**
- `aiAdminAssistant` - Admin automation
- `aiContentGenerator` - Generate content
- `aiContentRecommendations` - Personalized suggestions
- `aiPersonalizedChallenges` - Custom challenges
- `aiOnboardingPlanGenerator` - Onboarding workflows
- `aiCareerPathRecommendations` - Career guidance
- `aiMentorMatcher` - Match mentors
- `aiBuddyMatcher` - Buddy system
- `aiKnowledgeSearch` - Search knowledge base
- `aiKnowledgeIndexer` - Index documents
- `aiTeamStructureOptimizer` - Optimize teams
- `teamLeaderAIAssistant` - Team leader support
- `gamificationAI` - Gamification optimization
- `learningPathAI` - Learning recommendations

**Notifications (10+ functions):**
- `sendTeamsNotification` - Microsoft Teams alerts
- `slackNotifications` - Slack integration
- `teamsNotifications` - Teams messaging
- `createNotification` - Create notifications
- `automatedTeamCheckIn` - Team check-ins
- `automatedGoalReminders` - Goal reminders
- `sendGoalReminders` - Send reminders
- `checkEventReminders` - Event notifications
- `sendOneHourReminder` - Pre-event reminders

**Events & Calendar (8 functions):**
- `checkEventReminders` - Event reminder system
- `handleEventCancellation` - Cancel events
- `importFromGoogleCalendar` - Google Calendar import
- `syncToGoogleCalendar` - Sync to Google
- `googleCalendarSync` - Two-way sync
- `exportEventReport` - Export reports
- `generateCalendarFile` - Generate .ics files

**Analytics (8 functions):**
- `advancedAnalytics` - Advanced metrics
- `aggregateAnalytics` - Aggregate data
- `getEngagementNudges` - Engagement insights
- `getTeamAnalytics` - Team metrics
- `exportAnalyticsReport` - Export reports
- `exportEventReport` - Event analytics
- `exportUserData` - User data export
- `aiPredictiveHealthAnalysis` - Predictive analytics

**Onboarding (5 functions):**
- `checkOnboardingReminders` - Onboarding follow-ups
- `adjustOnboardingDynamically` - Adaptive onboarding
- `aiOnboardingPlanGenerator` - AI-powered plans
- `newEmployeeOnboardingAI` - New hire support

**Integrations (11+ functions):**
- `cloudflareIntegration` - Cloudflare services
- `cloudinaryIntegration` - Media management
- `elevenlabsIntegration` - Text-to-speech
- `googleMapsIntegration` - Location services
- `hubspotIntegration` - CRM integration
- `notionIntegration` - Notion sync
- `perplexityIntegration` - AI search
- `vercelIntegration` - Deployment
- `zapierIntegration` - Workflow automation

**Store & Commerce (3 functions):**
- `createStoreCheckout` - Checkout process
- `purchaseWithPoints` - Points redemption
- `storeWebhook` - Stripe webhook handler

**User Management (2 functions):**
- `inviteUser` - Invite users
- `manageUserRole` - Role management

**Middleware & Libraries:**
- `lib/middleware` - Function middleware
- `lib/rbacMiddleware` - Permission checks
- `lib/types` - Type definitions
- `lib/webhookValidation` - Webhook security

---

## Styling System

### Brand Colors

| Variable | Hex | Usage |
|----------|-----|-------|
| \`--int-navy\` | #14294D | Primary dark |
| \`--int-orange\` | #D97230 | Primary accent |
| \`--int-gold\` | #F5C16A | Secondary accent |
| \`--int-teal\` | #2DD4BF | Success states |

### CSS Classes

```css
/* Gradients */
.bg-gradient-orange { background: linear-gradient(135deg, #D97230, #C46322); }
.bg-gradient-navy { background: linear-gradient(135deg, #14294D, #1e3a6d); }

/* Glass effects */
.glass-panel { backdrop-filter: blur(14px); }
.glass-card { background: rgba(255, 255, 255, 0.9); }

/* Animations */
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-slide-up { animation: slideUp 0.4s ease-out; }
.hover-lift { transition: transform 0.2s; }
.hover-lift:hover { transform: translateY(-4px); }
```

---

## Best Practices

### Code Organization

1. **Small Components** - Keep under 50 lines when possible
2. **Extract Hooks** - Complex logic goes into custom hooks
3. **Barrel Exports** - Use index.js for clean imports
4. **Consistent Naming** - PascalCase for components, camelCase for hooks

### Performance

5. **Query Keys** - Use centralized queryKeys for consistent caching
6. **Cache Presets** - Apply appropriate cache timing per data type
7. **Memoization** - useMemo for expensive calculations
8. **Parallel Queries** - Batch independent data fetching

### Quality

9. **Error Handling** - Let errors bubble up (no silent catches)
10. **Loading States** - Always show loading indicators
11. **Mobile First** - Design for mobile, enhance for desktop
12. **Accessibility** - WCAG 2.1 AA compliance minimum

---

## Testing

### Current Status

⚠️ **Test Coverage: 0%** (Target: 80%)

The testing infrastructure is fully configured, but test implementation is in progress:

**Infrastructure (✅ Complete):**
- Vitest 4.0.17 configured with jsdom environment
- React Testing Library 16.3.1 installed
- Coverage reporting (v8 provider, HTML/LCOV)
- Mock setups for browser APIs (matchMedia, IntersectionObserver, ResizeObserver)
- Test scripts: `npm run test`, `npm run test:ui`, `npm run test:coverage`

**Current Tests (6 frontend files):**
- `src/lib/utils.test.js` - Utility functions (9 test cases)
- `src/lib/app-params.test.js` - URL parameters
- `src/lib/imageUtils.test.js` - Image utilities
- `src/hooks/use-mobile.test.js` - Mobile detection
- `src/utils/index.test.js` - General utilities
- `src/test/utils/sample.test.js` - Sample tests

**Backend Tests (4 function tests):**
- `functions/tests/eventOwnership.test.ts`
- `functions/tests/gamification.test.ts`
- `functions/tests/stripeWebhook.test.ts`
- `functions/tests/surveyAnonymization.test.ts`

**Next Steps:**
1. Achieve 30% coverage (Q1 2026)
2. Add component tests for critical paths
3. Add integration tests for user flows
4. Implement E2E tests with Playwright
5. Reach 80% coverage target (Q2-Q3 2026)

See [TESTING.md](/TESTING.md) for complete testing guidelines and best practices.

---

## Security

- **Authentication** - Base44 Auth with SSO support (Azure AD, Google, Okta)
- **Authorization** - Role-based access control (Admin, Facilitator, Participant)
- **Data Privacy** - PII hidden from non-HR roles, survey anonymization
- **File Uploads** - Max 10MB, image/pdf only
- **Sessions** - 8-hour timeout

---

## Changelog

### v0.0.0 (In Development - 2026-01-16)

- Added AI Insights Generator for analytics
- Added personalized notification drafting
- Added dynamic challenge difficulty scaling
- Added personalized badge recommendations
- Added tailored leaderboard formats
- Added achievement tier system
- Added personal challenges
- Added social sharing
- Added A/B testing framework
- Added admin customization panel
- Added advanced analytics dashboards
- Comprehensive codebase refactor

### v3.0.0 (2025-11-30)

- Created centralized API layer
- Created centralized constants
- Refactored hooks architecture
- Added full AI integrations (OpenAI, Claude, Gemini)