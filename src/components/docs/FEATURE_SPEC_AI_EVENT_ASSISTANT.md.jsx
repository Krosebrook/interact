# AI Event Planning Assistant

## Overview
Intelligent AI assistant that analyzes event goals and historical data to provide comprehensive event planning recommendations including optimal timing, activities, collaborators, and auto-generated content.

## Core Capabilities

### 1. Activity Recommendations
Suggests 3 most relevant activities based on:
- Event goal alignment
- Activity type matching
- Historical success rates
- Duration appropriateness

### 2. Optimal Time Scheduling
Analyzes patterns to suggest:
- Best days of week (based on attendance rates)
- Best times of day (based on engagement scores)
- Specific hour recommendations (24h format)
- Data-driven reasoning for each suggestion

### 3. Collaborator Matching
Identifies roles needed:
- Facilitator requirements
- Participant types
- Subject matter experts
- Skills/expertise needed

### 4. Content Generation
Auto-generates:
- Professional event descriptions (2-3 paragraphs)
- Engaging invitation messages
- Success tips based on historical data

## Technical Implementation

### Backend Function
**File**: `functions/aiEventPlanningAssistant.js`

**Input Schema**:
```json
{
  "event_goal": "Team bonding for remote developers",
  "team_id": "team_abc123", // optional
  "preferred_duration": 60, // optional
  "preferred_format": "online" // optional
}
```

**Output Schema**:
```json
{
  "success": true,
  "suggestions": {
    "recommended_activities": [
      {
        "activity_title": "Virtual Escape Room",
        "activity_type": "competitive",
        "reason": "Promotes team bonding through collaborative problem-solving",
        "estimated_duration": 60,
        "activity_id": "act_123",
        "activity_object": { /* full activity */ }
      }
    ],
    "optimal_times": [
      {
        "day_of_week": "Thursday",
        "time_of_day": "afternoon",
        "specific_hour": 14,
        "reason": "Historical data shows 85% attendance on Thu afternoons"
      }
    ],
    "suggested_collaborators": [
      {
        "role_type": "facilitator",
        "skills_needed": ["communication", "tech-savvy"],
        "reason": "Need someone to guide virtual activities"
      }
    ],
    "event_description": "Join us for an exciting virtual escape room...",
    "invitation_message": "Hey team! We're organizing a fun team bonding...",
    "success_tips": [
      "Send calendar invites 1 week in advance",
      "Test tech setup 15 minutes before",
      "Prepare icebreaker questions"
    ],
    "estimated_participants": 15,
    "recommended_duration": 60,
    "recommended_format": "online"
  },
  "metadata": {
    "events_analyzed": 47,
    "activities_available": 25,
    "team_size": 12
  }
}
```

### Data Analysis Process

1. **Historical Event Analysis**
   - Fetches last 50 completed events
   - Calculates attendance rates by day/time
   - Computes average ratings per activity type
   - Identifies high-performing patterns

2. **Activity Matching**
   - Semantic matching between goal and activity descriptions
   - Type-based filtering (icebreaker, wellness, competitive)
   - Duration compatibility check

3. **Time Optimization**
   - Groups events by day of week and hour
   - Calculates success metrics (attendance, ratings)
   - Ranks time slots by historical performance

4. **LLM Analysis**
   - Processes all data through advanced AI
   - Generates contextual recommendations
   - Creates human-readable descriptions
   - Provides actionable success tips

## Frontend Component
**File**: `components/ai/AIEventPlanningAssistant.js`

### Features
- Conversational input (event goal description)
- Team selection dropdown
- Format preference selection
- Expandable suggestion cards
- Copy-to-clipboard for descriptions
- One-click apply to event form

### User Flow
1. User clicks "AI Assistant" in event creation dialog
2. Describes event goal in natural language
3. (Optional) Selects target team and format
4. Clicks "Generate AI Suggestions"
5. Reviews recommendations with explanations
6. Copies descriptions or applies directly to form

## Integration Points

### Event Scheduling Dialog
- "AI Assistant" button in dialog header
- Toggleable assistant panel
- Suggestions auto-fill event form fields
- Works alongside template selector

### Calendar Page
- Quick access for event planners
- Historical data automatically used

## AI Prompt Engineering

### Prompt Structure
```
GOAL: [User's event objective]
CONTEXT: [Team, format, preferences]
HISTORICAL DATA: [Performance metrics]
TASK: Generate comprehensive suggestions
OUTPUT: Structured JSON with reasoning
```

### Key Prompt Elements
- Event goal (user input)
- Available activities catalog
- Historical performance data (top 5 time slots)
- Team context (if specified)
- Constraints (duration, format preferences)

### Quality Controls
- JSON schema validation
- Minimum data requirements (5 events)
- Fallback to defaults if insufficient data
- Reasoning explanations for transparency

## Success Metrics

### AI Accuracy
- % of suggested activities used
- % of suggested times selected
- User satisfaction ratings
- Time saved vs. manual planning

### Engagement Impact
- Events created with AI vs. without
- Attendance rates: AI-planned vs. manual
- Feedback scores comparison
- Adoption rate over time

## Mobile Experience

- Collapsible assistant panel
- Touch-friendly suggestion cards
- Swipe to dismiss/apply
- Responsive text sizing
- Optimized for one-handed use

## Accessibility

- Keyboard navigation through suggestions
- Screen reader announcements
- High contrast mode support
- Focus indicators on all interactive elements

## Performance

- Average response time: 3-5 seconds
- Caching: Activity list, historical metrics
- Debounced input to prevent spam
- Lazy loading for suggestion details

## Future Enhancements
- Multi-turn conversation (chat interface)
- Learn from user's event creation patterns
- Personalized suggestions per user
- Integration with external calendars for availability
- Suggest specific employees as facilitators
- Budget estimation for events
- Venue recommendations for offline events