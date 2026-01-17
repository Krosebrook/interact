# Changelog

All notable changes to the INTeract Employee Engagement Platform.

## [Unreleased]

### Added - 2026-01-17

#### Event Templates System
- **Save as Template**: Users can save successful events as reusable templates
- **AI Parameter Suggestions**: Machine learning analyzes historical event data to suggest optimal parameters (duration, timing, participant count)
- **Template Library**: Browse, search, and filter templates with usage statistics
- **Admin Template Management**: Create pre-defined templates, feature recommended ones, track usage
- **Smart Prefill**: Templates automatically populate event creation forms
- **Components**:
  - `SaveAsTemplateDialog.js` - Save event as template
  - `TemplateSelector.js` - Browse and apply templates
  - `pages/EventTemplates.js` - Admin template management
  - `functions/generateTemplateAISuggestions.js` - AI-powered recommendations

#### Enhanced User Profiles
- **Comprehensive Profile View**: Users can view upcoming/past events, contributions, and stats
- **Admin Profile Access**: Admins can view any user's profile for coaching support
- **Event History**: Track all event participation with RSVP status and attendance
- **Contribution Showcase**: Display recognitions given and received
- **Engagement Analytics**: Personal statistics dashboard (points, streak, tier, ratings)
- **Notification Management**: Full control over notification channels and preferences
- **Components**:
  - Refactored `pages/UserProfile.js` - Main profile page
  - Enhanced `NotificationSettings.js` - Comprehensive notification controls
  - Added `ProfileContributionSummary.js` - Engagement metrics widget

### Technical Improvements
- Refactored profile page for better component organization
- Added reusable contribution summary component
- Improved data fetching with React Query
- Enhanced mobile responsiveness for profile views
- Better permission handling for admin vs. user profile access

### Documentation
- Added `FEATURE_SPEC_EVENT_TEMPLATES.md` - Complete template system specification
- Added `FEATURE_SPEC_USER_PROFILES.md` - User profile feature documentation
- Updated API reference with new backend functions
- Documented AI suggestion algorithm and data requirements

---

## [Previous Releases]

### Core Platform Features
- Event scheduling and management
- Peer recognition system
- Gamification with points, badges, and tiers
- Team competitions and challenges
- Pulse surveys with anonymization
- Analytics dashboards
- Real-time notifications
- AI-powered event suggestions
- Google Calendar integration
- Slack/Teams notifications
- Learning paths and skill tracking
- Onboarding system
- Content moderation
- RBAC security model