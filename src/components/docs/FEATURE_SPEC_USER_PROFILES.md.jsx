# User Profile Feature Specification

## Overview
Comprehensive user profile system allowing employees to view their engagement history, manage preferences, and showcase contributions. Supports admin visibility for people analytics.

## User Stories

### All Users
- As a user, I want to view my upcoming and past events in one place
- As a user, I want to manage my notification preferences
- As a user, I want to see my contribution history (recognitions, feedback)
- As a user, I want to track my engagement statistics

### Admins
- As an admin, I want to view any user's profile to support them
- As an admin, I want to see engagement patterns for coaching opportunities

## Components

### Main Profile Page
**Location**: `pages/UserProfile.js`

**Tabs:**
1. **Events** - Upcoming & past event participation
2. **Contributions** - Recognitions given/received
3. **Settings** - Notification preferences (own profile only)

**Features:**
- Profile header with avatar, bio, job title
- Key statistics dashboard (points, events, recognitions, streak)
- Admin can view other profiles via `?email=user@example.com` param

### Notification Settings
**Location**: `components/profile/NotificationSettings.js`

**Sections:**
- **Notification Channels**: Email, Teams, Slack, In-app
- **Event Reminders**: None, 1h, 24h, Both
- **Notification Types**: Recognition, Surveys, Milestones, Wellness
- **Email Digest**: Daily, Weekly, Never
- **Quiet Hours**: Configurable time range

## Data Flow

### Profile Data
```javascript
// Fetches from UserProfile entity
{
  user_email: "user@example.com",
  display_name: "John Doe",
  bio: "...",
  avatar_url: "...",
  job_title: "Senior Developer",
  notification_preferences: { /* settings */ }
}
```

### Points Data
```javascript
// Fetches from UserPoints entity
{
  user_email: "user@example.com",
  total_points: 450,
  current_streak: 7,
  tier: "gold"
}
```

### Event Participation
```javascript
// Fetches from Participation entity + Event entity
{
  upcoming: [/* events with scheduled_date > now */],
  past: [/* events with scheduled_date < now */],
  attended_count: 25,
  avg_rating: 4.2
}
```

### Recognitions
```javascript
// Fetches from Recognition entity (filtered by status=approved)
{
  received: [/* recognitions where recipient_email = user */],
  given: [/* recognitions where sender_email = user */]
}
```

## User Flows

### Viewing Own Profile
1. User clicks profile icon → "My Profile"
2. Sees personal dashboard with stats
3. Browses tabs: Events, Contributions, Settings
4. Manages notification preferences
5. Reviews engagement history

### Admin Viewing User Profile
1. Admin navigates from Employee Directory
2. URL includes `?email=employee@example.com`
3. Views employee's public profile data
4. Sees engagement patterns
5. Cannot access Settings tab (privacy)

### Managing Notifications
1. User opens profile → Settings tab
2. Toggles notification channels
3. Sets event reminder preferences
4. Configures quiet hours
5. Saves preferences
6. Confirmation toast appears

## Permissions & Privacy

### Profile Visibility
- **Own profile**: Full access to all tabs
- **Admin viewing others**: Events + Contributions only
- **Regular users**: Cannot view other profiles (use Employee Directory for public data)

### Data Access
```javascript
// RBAC Rules
{
  read: {
    $or: [
      { user_email: "{{user.email}}" },  // Own profile
      { role: "admin" }                   // Admin access
    ]
  },
  write: {
    user_email: "{{user.email}}"         // Can only edit own
  }
}
```

### Notification Preferences
- Stored in `UserProfile.notification_preferences` object
- Default values provided for new users
- Changes take effect immediately

## Integration Points

### Event System
- Displays events from `Participation` + `Event` entities
- Shows RSVP status, attendance, feedback ratings

### Recognition System
- Pulls approved recognitions (status = 'approved')
- Displays both sent and received
- Shows category badges

### Gamification
- Integrates with `UserPoints` for statistics
- Shows current tier, streak, total points

### Notification Service
- Preferences control all notification channels
- Quiet hours respected by notification functions

## Statistics Calculated

### Engagement Summary
- **Events Attended**: Count of attendance_status = 'attended'
- **Feedback Given**: Count of participations with feedback_rating
- **Average Rating**: Mean of all feedback_ratings given
- **Recognition Count**: Total sent + received
- **Current Streak**: From UserPoints entity
- **Current Tier**: From UserPoints entity

## Mobile Responsiveness

All profile components are fully responsive:
- Stats grid: 4 columns → 2 columns → 1 column
- Event cards: Vertical stacking on mobile
- Settings: Full-width inputs on small screens
- Tabs: Scrollable horizontal on narrow viewports

## Accessibility

- All form controls properly labeled
- Focus management for dialogs
- Keyboard navigation support
- Screen reader friendly
- Color contrast meets WCAG AA

## Future Enhancements
- Customizable profile themes
- Skill endorsements from peers
- Career goals and development plans
- Mentorship matching
- Public profile pages (opt-in)
- Export personal data (GDPR)
- Profile badges and achievements showcase