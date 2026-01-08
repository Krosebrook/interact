# AI Features Documentation

## Overview
This document details all AI-powered features in the Employee Engagement Platform, including gamification automation, team leader coaching, and new employee onboarding.

---

## 1. Automated Gamification System

### Purpose
Automatically awards points and badges based on configurable rules when users perform specific actions.

### Components

#### Backend Function: `processGamificationRules`
- **Triggers**: Event attendance, feedback submission, recognition, survey completion, profile completion, team joining
- **Processing**: Evaluates rules, checks limits, awards points/badges, creates ledger entries
- **Location**: `functions/processGamificationRules.js`

#### Frontend Hook: `useGamificationTrigger`
- **Purpose**: Trigger gamification processing from any component
- **Usage**:
```javascript
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';

const { trigger } = useGamificationTrigger();

await trigger('event_attendance', userEmail, {
  event_id: eventId,
  reference_id: eventId
});
```
- **Location**: `components/hooks/useGamificationTrigger.js`

### Integrated Components
All user actions now trigger gamification:
- ✅ Event attendance (`useEventAttendance`)
- ✅ Feedback submission (`FeedbackForm`)
- ✅ Recognition given/received (`RecognitionForm`)
- ✅ Survey completion (`SurveyForm`)
- ✅ Team joining (`useTeamActions`)
- ✅ Profile completion (`useProfileCompletion`)

### Configuration
Admins configure rules at: **Gamification Settings → Rules Admin**

---

## 2. Team Leader AI Assistant

### Purpose
Provides AI-powered insights and content generation for team leaders.

### Backend Function: `teamLeaderAIAssistant`
**Location**: `functions/teamLeaderAIAssistant.js`

**Actions**:
1. **analyze_performance**: Team health scoring and recommendations
2. **suggest_recognition**: Generate recognition message ideas
3. **suggest_challenge**: Create team challenge proposals
4. **draft_approval**: Draft responses for recognition approvals

**Input**:
```json
{
  "action": "analyze_performance",
  "team_id": "team_123",
  "context": { "context": "optional context string" }
}
```

**Output**: Structured JSON with insights and suggestions

### Frontend Component: `TeamLeaderAIAssistant`
**Location**: `components/teamLeader/TeamLeaderAIAssistant.jsx`

**Features**:
- 4 tabs: Insights, Recognition, Challenges, Approvals
- Copy-to-clipboard for AI suggestions
- Context-aware generation

### Security
- Validates team leader authorization
- Only accessible by team leader or admin
- Uses service role for data aggregation

---

## 3. Team Coaching Module

### Purpose
Proactively identifies at-risk and excelling team members with personalized coaching strategies.

### Backend Function: `teamCoachingAI`
**Location**: `functions/teamCoachingAI.js`

**Analysis Performed**:
1. **Engagement Trends**: 30-day activity analysis
2. **Risk Detection**: Identifies disengaging members
3. **Excellence Recognition**: Highlights high performers
4. **Skill Gap Analysis**: Maps team learning needs

**Output Structure**:
```json
{
  "team_summary": {
    "total_members": 10,
    "avg_points": 150,
    "at_risk_count": 2,
    "excelling_count": 3
  },
  "at_risk_members": [
    {
      "email": "user@example.com",
      "coaching": {
        "risk_level": "medium",
        "coaching_strategies": ["..."],
        "conversation_starters": ["..."],
        "immediate_actions": ["..."]
      }
    }
  ],
  "excelling_members": [...],
  "skill_gaps": {
    "top_gaps": [...],
    "recommendations": [...]
  }
}
```

### Frontend Component: `TeamCoachingModule`
**Location**: `components/teamLeader/TeamCoachingModule.jsx`

**Features**:
- At-risk member coaching strategies
- High performer leverage opportunities
- Skill gap recommendations with learning paths
- Expandable member cards

### Risk Levels
- **High**: <2 events/month, decreasing trend, no streak
- **Medium**: 2-3 events/month, stable trend
- **Low**: Active but needs attention

---

## 4. New Employee Onboarding AI

### Purpose
Generates personalized onboarding experiences for new hires.

### Backend Function: `newEmployeeOnboardingAI`
**Location**: `functions/newEmployeeOnboardingAI.js`

**Actions**:

#### 1. Generate Plan
```json
{
  "action": "generate_plan",
  "context": {
    "role": "facilitator",
    "department": "Engineering"
  }
}
```

**Returns**: 30-day onboarding plan with weekly breakdown

#### 2. Generate Introductions
```json
{
  "action": "generate_introductions",
  "context": {}
}
```

**Returns**: Personalized intro messages to key team members

#### 3. Suggest Tasks
```json
{
  "action": "suggest_tasks",
  "context": {}
}
```

**Returns**: Categorized first-week tasks

#### 4. Chatbot
```json
{
  "action": "chatbot",
  "context": { "question": "How do I join a team?" }
}
```

**Returns**: AI answer with suggested actions and resources

#### 5. Learning Resources
```json
{
  "action": "learning_resources",
  "context": { "interests": ["JavaScript", "Leadership"] }
}
```

**Returns**: Prioritized learning resources

### Frontend Page: `NewEmployeeOnboarding`
**Location**: `pages/NewEmployeeOnboarding.js`

**Features**:
- 4-tab interface (Plan, Team, Tasks, Learn)
- Progress tracking with task completion
- Sticky AI chatbot sidebar
- Auto-redirects if onboarding already completed

### Components

#### OnboardingChatbot
**Location**: `components/onboarding/OnboardingChatbot.jsx`
- Real-time Q&A with AI
- Suggested actions and resources
- Auto-scroll to latest message

#### OnboardingPlanDisplay
**Location**: `components/onboarding/OnboardingPlanDisplay.jsx`
- Week-by-week expandable plan
- Tasks, outcomes, resources, metrics per week

---

## Usage Examples

### Triggering Gamification from Event Check-in
```javascript
import { useEventAttendance } from '../events/useEventAttendance';

const { markAttendance } = useEventAttendance();

await markAttendance({
  participationId: 'p123',
  eventId: 'e456',
  userEmail: 'user@example.com',
  attended: true
});
// Automatically triggers: event_attendance rule
```

### Getting Team Coaching Insights
```javascript
import TeamCoachingModule from '../teamLeader/TeamCoachingModule';

<TeamCoachingModule team={myTeam} />
// Click "Generate Insights" to analyze team
```

### New Employee Onboarding Flow
1. New user logs in (first time)
2. Redirects to `NewEmployeeOnboarding` page
3. AI generates personalized plan automatically
4. User completes tasks, chats with AI
5. Gamification triggers on task completion

---

## Performance Considerations

### Caching Strategy
- Team analytics: 30s stale time
- Gamification rules: On-demand processing
- AI responses: Not cached (always fresh)

### Rate Limiting
- AI calls: Debounced to prevent spam
- Silent fail on gamification errors (UX preservation)

### Optimization
- Parallel data fetching where possible
- Service role for aggregations (avoid N+1 queries)
- Progressive loading (show cached data while fetching)

---

## Error Handling

### Gamification Triggers
- Silent fail (logs error, doesn't block user action)
- Toast notifications only on success

### AI Functions
- User-facing error messages
- Graceful degradation (show cached/manual options)
- Retry mechanisms for transient failures

### Team Leader Features
- Authorization checks (team leader or admin only)
- Fallback to manual entry if AI fails

---

## Security & Privacy

### RBAC Enforcement
- Team leaders: Can only access their team's data
- Admins: Full access to all teams
- Service role: Used only for aggregations, not mutations

### Data Access
- Member PII: Displayed only as email (no sensitive info)
- Survey responses: Already anonymized
- Recognition: Respects visibility settings

### API Authorization
All backend functions:
1. Authenticate user (`base44.auth.me()`)
2. Verify team leader role
3. Use service role only for reads

---

## Future Enhancements

### Potential Additions
- [ ] Multi-language support for AI responses
- [ ] Voice-based onboarding chatbot
- [ ] Predictive analytics for retention risk
- [ ] Automated coaching email drafts
- [ ] Integration with HRIS systems
- [ ] Slack/Teams bot for coaching reminders

### Monitoring Needs
- Track AI response quality (thumbs up/down)
- Monitor trigger success rates
- Measure coaching action follow-through

---

## Troubleshooting

### Gamification Not Triggering
1. Check rule is active in `GamificationRule` entity
2. Verify trigger_type matches rule configuration
3. Check user hasn't hit limit (daily/weekly/monthly)
4. Review console for silent errors

### AI Assistant Not Loading
1. Verify OpenAI API key is set
2. Check backend function deployed successfully
3. Test function endpoint directly from Dashboard → Code
4. Review network tab for 500 errors

### Team Coaching Shows No Data
1. Ensure team has at least 2 members
2. Check 30-day activity window (new teams may show empty)
3. Verify team_id is correct in request
4. Check service role permissions

---

## API Reference

### Gamification Trigger Types
- `event_attendance`
- `event_completion`
- `feedback_submitted`
- `recognition_given`
- `recognition_received`
- `skill_achievement`
- `streak_milestone`
- `challenge_completed`
- `survey_completed`
- `profile_completed`
- `team_join`
- `channel_participation`
- `milestone_celebrated`
- `points_threshold`
- `activity_completion`
- `first_time_action`
- `consecutive_actions`

### Team Leader AI Actions
- `analyze_performance`
- `suggest_recognition`
- `suggest_challenge`
- `draft_approval`

### Onboarding AI Actions
- `generate_plan`
- `generate_introductions`
- `suggest_tasks`
- `chatbot`
- `learning_resources`

---

Last Updated: 2025-12-21