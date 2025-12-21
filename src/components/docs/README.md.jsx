# INTeract - Employee Engagement Platform

## Version 5.0.0 | Last Updated: 2025-12-21

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

## Security

- **Authentication** - Base44 Auth with SSO support (Azure AD, Google, Okta)
- **Authorization** - Role-based access control (Admin, Facilitator, Participant)
- **Data Privacy** - PII hidden from non-HR roles, survey anonymization
- **File Uploads** - Max 10MB, image/pdf only
- **Sessions** - 8-hour timeout

---

## Changelog

### v4.0.0 (2025-12-02)

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