# Tutorial & Onboarding Audit

## ✅ Currently Implemented
- **Global Onboarding System** - Role-based tours for Admin and Participant
- **OnboardingProvider** - Context and state management
- **OnboardingModal** - Interactive step-by-step tutorial
- **OnboardingProgress** - Persistent progress indicator
- **OnboardingSpotlight** - Cross-page element highlighter
- **GamificationSimulation** - Badge/point animations during onboarding

## 🎯 Pages That NEED Tutorials

### High Priority (Complex Features)

#### 1. **Activities Page** (`pages/Activities.js`)
**Why:** Central hub with many features (filters, AI generation, favorites)
**Tutorial Needs:**
- How to filter activities by type, duration, energy
- Using AI activity generator
- Favoriting activities for quick access
- Duplicating/customizing activities
- Understanding activity metadata (capacity, materials)

#### 2. **Calendar Page** (`pages/Calendar.js`)
**Why:** Complex scheduling with multiple options
**Tutorial Needs:**
- Scheduling single events vs recurring series
- Using time slot polls for availability
- Bulk event scheduling
- Event templates and reuse
- Magic links for participant access

#### 3. **AI Event Planner** (`pages/AIEventPlanner.js`)
**Why:** AI-powered feature that needs explanation
**Tutorial Needs:**
- How AI analyzes team data
- Inputting context for better recommendations
- Understanding AI suggestions
- Scheduling from AI recommendations

#### 4. **Gamification Dashboard** (`pages/GamificationDashboard.js`)
**Why:** Multiple gamification concepts to understand
**Tutorial Needs:**
- Points vs Badges vs Challenges system
- How to earn each type of reward
- Leaderboard mechanics
- Tier progression
- Social sharing features

#### 5. **Analytics Page** (`pages/Analytics.js`)
**Why:** Data-heavy with multiple charts and metrics
**Tutorial Needs:**
- Understanding key engagement metrics
- Reading trend charts
- Filtering by date range
- Exporting reports
- Interpreting feedback sentiment

#### 6. **Team Competition** (`pages/TeamCompetition.js`)
**Why:** Complex team challenge system
**Tutorial Needs:**
- Creating team challenges
- Challenge types and rules
- Team leaderboard interpretation
- Challenge rewards distribution

### Medium Priority (Moderate Complexity)

#### 7. **Recognition Page** (`pages/Recognition.js`)
**Tutorial Needs:**
- Giving peer recognition
- Recognition categories
- Public vs private recognition
- Recognition feed filtering

#### 8. **Rewards Store** (`pages/RewardsStore.js` / `pages/PointStore.js`)
**Tutorial Needs:**
- Browsing available rewards
- Point costs and redemption
- Purchase confirmation
- Viewing transaction history

#### 9. **User Profile** (`pages/UserProfile.js`)
**Tutorial Needs:**
- Profile customization tabs
- Activity preferences setup
- Privacy settings
- Notification preferences
- Viewing badges and achievements

#### 10. **Teams Page** (`pages/Teams.js`)
**Tutorial Needs:**
- Creating a team
- Inviting members
- Team challenges
- Team leaderboard

#### 11. **Channels Page** (`pages/Channels.js`)
**Tutorial Needs:**
- Joining channels
- Channel types (public/private)
- Posting messages
- Channel moderation

#### 12. **Employee Directory** (`pages/EmployeeDirectory.js`)
**Tutorial Needs:**
- Searching for colleagues
- Viewing profile cards
- Understanding privacy badges
- Following/connecting with others

### Low Priority (Self-Explanatory or Simple)

#### 13. **Settings Page** (`pages/Settings.js`)
- Generally self-explanatory
- Could use contextual help tooltips

#### 14. **Leaderboards** (`pages/Leaderboards.js`)
- Simple display, but could explain filters

## 🔧 Implementation Recommendations

### 1. **Contextual Help System**
Create a reusable `<HelpTooltip>` component for inline help:
```jsx
<HelpTooltip 
  title="Activity Filters"
  description="Filter by type, duration, and energy level to find perfect activities"
  placement="bottom"
/>
```

### 2. **Feature Spotlights**
Add `data-feature-tour` attributes to key UI elements:
```jsx
<Button data-feature-tour="ai-activity-generator">
  Generate Activity
</Button>
```

### 3. **Progressive Disclosure**
- Show "What's New" badges on recently added features
- Highlight unused features after X days
- Celebrate first-time actions (first event, first recognition, etc.)

### 4. **Guided Workflows**
Implement step-by-step wizards for complex tasks:
- Event creation wizard (4-5 steps)
- Team setup wizard (3-4 steps)
- Gamification config wizard (5-6 steps)

### 5. **Interactive Demos**
For complex features, add "Try It" sandbox modes:
- AI Event Planner demo with sample data
- Gamification preview with sample points/badges
- Analytics dashboard with sample metrics

### 6. **Video Tutorials**
Consider short (30-60 second) video tutorials for:
- AI Activity Generator
- Event Scheduling Flow
- Recognition System
- Team Challenge Creation

## 📊 User Journey Tutorials

### First-Time Admin Journey
1. ✅ Welcome & Setup (implemented)
2. **Create First Activity** - Needs tutorial
3. **Schedule First Event** - Needs tutorial
4. **Configure Gamification** - Needs tutorial
5. **Invite First Team Members** - Needs tutorial
6. **View First Analytics** - Needs tutorial

### First-Time Participant Journey
1. ✅ Welcome & Personalization (implemented)
2. **Browse & RSVP to Event** - Needs tutorial
3. **Attend First Event** - Needs tutorial
4. **Give First Recognition** - Needs tutorial
5. **Check Progress & Rewards** - Needs tutorial
6. **Redeem First Reward** - Needs tutorial

## 🎨 Design Patterns to Follow

### Consistent Tutorial Structure
```javascript
{
  id: 'unique-tutorial-id',
  title: 'Clear, Action-Oriented Title',
  description: 'Benefits-focused description',
  target: '[data-tutorial="selector"]', // or null for modal
  placement: 'bottom', // top, right, left, center
  content: {
    type: 'step-by-step' | 'feature-overview' | 'demo',
    // type-specific content
  },
  actions: [
    { label: 'Try It', type: 'navigate', target: '/path' }
  ],
  validation: {
    check: 'condition',
    message: 'What to do next',
    optional: true // Don't block progression
  },
  estimatedTime: 'X min'
}
```

### Tutorial Triggers
1. **First Visit** - Auto-trigger on first page visit
2. **Feature Announcement** - Badge on new features
3. **Help Button** - Manual trigger from help menu
4. **Context Menu** - Right-click help on elements
5. **Empty States** - "Learn how" buttons in empty views

## 🚀 Implementation Priority

### Phase 1 (Critical)
- [ ] Activities page tutorial
- [ ] Calendar scheduling tutorial
- [ ] Contextual help tooltips system

### Phase 2 (Important)
- [ ] AI Event Planner walkthrough
- [ ] Gamification explainer
- [ ] Recognition flow tutorial

### Phase 3 (Nice to Have)
- [ ] Analytics dashboard guide
- [ ] Team Competition tutorial
- [ ] Advanced features tours

## 📝 Notes
- All tutorials should be **optional** and **skippable**
- Progress should be **persistent** across sessions
- Tutorials should be **restartable** from help menu
- Add **"What's New"** section for feature updates
- Consider **A/B testing** tutorial effectiveness