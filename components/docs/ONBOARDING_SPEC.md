# Onboarding System - Technical Specification

## Overview
Production-grade onboarding system with role-based flows, progress tracking, and accessibility compliance (WCAG 2.1 AA).

## Architecture

### Entities
- **UserOnboarding**: Tracks user progress, completion status, and preferences
  - Fields: user_email, user_role, current_step, completed_steps, completion_percentage, etc.

### Components

#### Core System
- **OnboardingProvider**: Context provider managing state and actions
- **OnboardingModal**: Main interactive modal with step navigation
- **OnboardingProgress**: Persistent floating progress indicator
- **OnboardingTrigger**: Header button to access tutorial
- **OnboardingChecklist**: Detailed progress checklist widget

#### Specialized
- **WelcomeWizard**: Initial quick-start wizard for first-time users
- **FeatureHighlight**: Spotlight specific UI elements with tooltips
- **OnboardingTooltip**: Contextual help tooltips
- **OnboardingWidget**: Dashboard widget showing progress

#### Content Components
- **AdminOnboardingSteps**: Admin-specific step content
- **ParticipantOnboardingSteps**: User-specific step content

### Configuration
- **onboardingConfig.js**: Role-based step definitions, validations, and content

## Onboarding Flows

### Administrator/Facilitator Flow (8 steps, ~40 min)
1. **Welcome**: Platform overview, role introduction
2. **Profile Setup**: Upload avatar, add bio
3. **Activity Library**: Browse and duplicate activities
4. **Schedule Event**: Create first event with AI assistance
5. **Gamification Setup**: Configure badges, points, challenges
6. **Teams Setup**: Create teams and channels
7. **Analytics Overview**: Understand engagement metrics
8. **RBAC Overview**: Learn permissions and privacy
9. **Completion**: Celebrate and provide next steps

### Participant Flow (8 steps, ~15 min)
1. **Welcome**: Platform introduction
2. **Profile Personalization**: Set activity preferences, AI creativity
3. **Notification Settings**: Configure channels and frequency
4. **Event Discovery**: Browse and RSVP to events
5. **Gamification Intro**: Learn points, badges, challenges
6. **Recognition**: Send first recognition
7. **Teams & Channels**: Join conversations
8. **Rewards Store**: Explore redemption options
9. **Completion**: Celebrate readiness

## Features

### Progress Tracking
- Percentage completion (0-100%)
- Step-by-step checklist
- Time spent tracking
- Completion dates

### User Actions
- **Start**: Initiate onboarding
- **Complete Step**: Mark step as done
- **Skip Step**: Skip optional steps
- **Previous**: Go back one step
- **Dismiss**: Close onboarding
- **Restart**: Reset and start over

### Accessibility
- ARIA labels and roles
- Keyboard navigation (Arrow keys, Escape)
- Focus management
- Screen reader announcements
- High contrast support
- Large touch targets (min 44x44px)

### Mobile Optimization
- Responsive layouts
- Touch-friendly interactions
- Swipe gestures for navigation
- Bottom-sheet modals on mobile
- Reduced content on small screens

### Personalization
- Role-based content
- Dynamic examples based on user preferences
- Skip completed actions automatically
- Resume from last position

## Integration Points

### Layout Integration
- OnboardingProvider wraps entire app
- OnboardingTrigger in header
- OnboardingProgress floating widget
- OnboardingModal global

### Dashboard Integration
- OnboardingWidget shows progress
- Quick actions link to relevant steps

### Page Integration
Add `data-onboarding` attributes to key elements:
```jsx
<div data-onboarding="profile-header">...</div>
<div data-onboarding="activity-filters">...</div>
<div data-onboarding="schedule-button">...</div>
```

## API Integration

### Query Keys
```javascript
queryKeys.onboarding.byEmail(email)
```

### Mutations
- Create onboarding state
- Update progress
- Mark step complete
- Dismiss onboarding

## Content Types

### Modal Content Types
1. **animated-intro**: Welcome animations with highlights
2. **feature-overview**: Grid of feature cards
3. **step-by-step**: Numbered instruction list
4. **guided-form**: Interactive form with validation
5. **interactive-tour**: UI element highlights
6. **dashboard-tour**: Analytics walkthrough
7. **completion-celebration**: Success screen with confetti

### Validation Types
- **check**: JavaScript condition to validate
- **message**: Error message if validation fails
- **optional**: Allow skipping if validation fails

## Performance Optimizations
- Lazy load onboarding components
- Memoize step calculations
- Local storage caching
- Debounced progress updates
- Minimize re-renders with context optimization

## Security Considerations
- User-scoped data only
- No sensitive data exposure
- Validate step permissions
- Rate limit progress updates

## Future Enhancements
- Video tutorials
- Interactive sandbox mode
- Peer mentoring matching
- Gamified onboarding (earn points)
- Multi-language support
- Voice guidance option
- AR/VR tours for advanced features