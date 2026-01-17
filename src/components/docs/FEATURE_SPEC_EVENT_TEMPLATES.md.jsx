# Event Templates Feature Specification

## Overview
Event templates allow users to save successful events as reusable templates with AI-powered parameter suggestions for future event creation.

## User Stories

### Facilitators
- As a facilitator, I want to save a successful event as a template so I can easily recreate similar events
- As a facilitator, I want AI to suggest optimal event parameters based on historical data
- As a facilitator, I want to browse and use templates created by other facilitators

### Admins
- As an admin, I want to create pre-defined event templates for common events
- As an admin, I want to feature recommended templates
- As an admin, I want to track template usage to identify popular event formats

## Components

### Frontend Components

#### `SaveAsTemplateDialog.js`
- Dialog for saving events as templates
- Captures template name, description, and visibility settings
- Preserves event configuration (duration, format, max participants)
- **Location**: `components/events/SaveAsTemplateDialog.js`

#### `TemplateSelector.js`
- Template browser with search and filtering
- AI suggestion integration
- Usage statistics display
- Tabs: All Templates, Popular, My Templates
- **Location**: `components/events/TemplateSelector.js`

#### `EventTemplates.js` (Admin Page)
- Full template management interface
- Create/edit/delete templates
- Feature templates for promotion
- Usage analytics
- **Location**: `pages/EventTemplates.js`

### Backend Functions

#### `generateTemplateAISuggestions.js`
AI-powered template parameter optimization based on historical performance.

**Input:**
```json
{
  "template_id": "string",
  "context": {
    "team_id": "string (optional)",
    "preferred_time": "string (optional)"
  }
}
```

**Output:**
```json
{
  "success": true,
  "suggestions": {
    "duration_minutes": 60,
    "max_participants": 20,
    "best_time_of_day": "morning",
    "best_days": ["tuesday", "thursday"],
    "tips": ["...", "..."],
    "facilitator_notes": "...",
    "reasoning": "..."
  },
  "historical_data": {
    "events_analyzed": 15,
    "avg_duration": 58,
    "avg_attendance": 18,
    "avg_rating": 4.3
  }
}
```

**Logic:**
1. Fetches template details
2. Retrieves last 20 completed events using same activity
3. Calculates performance metrics (attendance, ratings, engagement)
4. Uses LLM to analyze patterns and suggest optimal parameters
5. Returns data-driven recommendations

## Database Schema

### EventTemplate Entity
```json
{
  "name": "string",
  "description": "string",
  "activity_id": "string",
  "event_type": "string",
  "duration_minutes": "number",
  "event_format": "online|offline|hybrid",
  "location": "string",
  "max_participants": "number",
  "custom_instructions": "string",
  "meeting_link_pattern": "string",
  "is_public": "boolean",
  "is_featured": "boolean",
  "usage_count": "number",
  "created_by": "string"
}
```

## User Flows

### Creating Template from Event
1. User completes an event
2. Opens event menu → "Save as Template"
3. Enters template name and description
4. Sets visibility (public/private)
5. Template saved with event configuration

### Using Template for New Event
1. User clicks "Use Template" in event creation
2. Browses template library (search/filter)
3. Selects template
4. Clicks "Get AI Suggestions" (optional)
5. Reviews AI-recommended parameters
6. Applies template to prefill event form
7. Customizes as needed
8. Creates event

### Admin Template Management
1. Admin navigates to Event Templates page
2. Views all templates with usage statistics
3. Creates new template from scratch
4. Features high-quality templates
5. Edits/deletes templates as needed

## Integration Points

### Event Scheduling
- "Use Template" button in `ScheduleEventDialog`
- Template data prefills form fields
- AI suggestions applied automatically if generated

### Event Cards
- "Save as Template" action for completed events
- Appears in dropdown menu on `EventCalendarCard`

## Permissions

**Read Templates:**
- Public templates: All authenticated users
- Private templates: Creator + Admins

**Create Templates:**
- Admins and Facilitators only

**Edit/Delete Templates:**
- Creator + Admins

**Feature Templates:**
- Admins only

## AI Optimization

The AI suggestion engine analyzes:
- **Attendance rates** by duration, day, time
- **Feedback ratings** correlation with parameters
- **Engagement scores** based on participation quality
- **Seasonal patterns** if sufficient data

**Minimum data threshold:** 5 events for reliable suggestions

## Future Enhancements
- Template categories/tags
- Template ratings and reviews
- Community template sharing
- Multi-step event series templates
- Template versioning
- A/B testing different template parameters