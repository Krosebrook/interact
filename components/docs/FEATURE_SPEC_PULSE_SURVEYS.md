# Pulse Surveys - Feature Specification
## Employee Engagement Platform - Intinc

---

## 1. Overview

### 1.1 Purpose
Pulse Surveys enable HR to gather anonymous, recurring feedback from employees. The system ensures true anonymity by never storing respondent identifiers and only displaying results after a minimum response threshold is met.

### 1.2 Key Principles
- **True Anonymity**: No user identifier stored with responses
- **Privacy First**: Minimum 5 responses before results shown
- **Ease of Use**: <2 minute completion time
- **Actionable Insights**: AI-powered sentiment analysis

---

## 2. Database Schema

### Entity: `Survey`
```json
{
  "name": "Survey",
  "properties": {
    "title": { "type": "string", "description": "Survey title" },
    "description": { "type": "string", "description": "Survey purpose/context" },
    "status": { 
      "type": "string", 
      "enum": ["draft", "scheduled", "active", "closed", "archived"],
      "default": "draft"
    },
    "survey_type": {
      "type": "string",
      "enum": ["pulse", "engagement", "onboarding", "exit", "event", "custom"],
      "default": "pulse"
    },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "order": { "type": "number" },
          "type": { 
            "type": "string", 
            "enum": ["rating", "nps", "text", "multiple_choice", "checkbox", "scale"] 
          },
          "text": { "type": "string" },
          "required": { "type": "boolean", "default": true },
          "options": { "type": "array", "items": { "type": "string" } },
          "scale_min": { "type": "number" },
          "scale_max": { "type": "number" },
          "scale_labels": { 
            "type": "object",
            "properties": {
              "min_label": { "type": "string" },
              "max_label": { "type": "string" }
            }
          }
        }
      }
    },
    "recurrence": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": false },
        "frequency": { "type": "string", "enum": ["weekly", "biweekly", "monthly", "quarterly"] },
        "day_of_week": { "type": "number", "description": "0-6 for Sun-Sat" },
        "next_send_date": { "type": "string", "format": "date-time" }
      }
    },
    "target_audience": {
      "type": "object",
      "properties": {
        "type": { "type": "string", "enum": ["all", "team", "department", "custom"] },
        "team_ids": { "type": "array", "items": { "type": "string" } },
        "exclude_emails": { "type": "array", "items": { "type": "string" } }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "min_responses_for_results": { "type": "number", "default": 5 },
        "allow_anonymous": { "type": "boolean", "default": true },
        "show_progress": { "type": "boolean", "default": false },
        "reminder_enabled": { "type": "boolean", "default": true },
        "reminder_days": { "type": "array", "items": { "type": "number" } }
      }
    },
    "deadline": { "type": "string", "format": "date-time" },
    "response_count": { "type": "number", "default": 0 },
    "completion_rate": { "type": "number", "default": 0 },
    "avg_completion_time_seconds": { "type": "number" }
  },
  "required": ["title", "questions"]
}
```

### Entity: `SurveyResponse`
```json
{
  "name": "SurveyResponse",
  "properties": {
    "survey_id": { "type": "string", "description": "Reference to Survey" },
    "answers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question_id": { "type": "string" },
          "value": { "type": "string" },
          "numeric_value": { "type": "number" },
          "selected_options": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "started_at": { "type": "string", "format": "date-time" },
    "completed_at": { "type": "string", "format": "date-time" },
    "completion_time_seconds": { "type": "number" },
    "device_type": { "type": "string", "enum": ["desktop", "mobile", "tablet"] }
  },
  "required": ["survey_id", "answers"]
}
```

**CRITICAL: No `respondent_email` or user identifier stored to ensure anonymity.**

### Entity: `SurveyInvitation`
```json
{
  "name": "SurveyInvitation",
  "properties": {
    "survey_id": { "type": "string" },
    "user_email": { "type": "string" },
    "status": { 
      "type": "string", 
      "enum": ["pending", "viewed", "completed", "expired"],
      "default": "pending"
    },
    "sent_at": { "type": "string", "format": "date-time" },
    "viewed_at": { "type": "string", "format": "date-time" },
    "completed_at": { "type": "string", "format": "date-time" },
    "reminder_count": { "type": "number", "default": 0 }
  }
}
```

**Note: SurveyInvitation tracks WHO was invited and if they completed, but NEVER links to specific SurveyResponse records.**

---

## 3. User Flows

### 3.1 HR Admin Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    HR SURVEY MANAGEMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREATE SURVEY                                                │
│     ├── Select template or start blank                          │
│     ├── Add questions (drag-drop builder)                       │
│     ├── Configure anonymity settings                            │
│     ├── Set minimum response threshold (default: 5)             │
│     └── Preview survey                                          │
│                                                                  │
│  2. CONFIGURE AUDIENCE                                           │
│     ├── All employees                                           │
│     ├── Specific teams/departments                              │
│     └── Custom list (exclude certain roles)                     │
│                                                                  │
│  3. SCHEDULE                                                     │
│     ├── Send immediately                                        │
│     ├── Schedule for later                                      │
│     └── Set up recurrence (weekly/biweekly/monthly)            │
│                                                                  │
│  4. MONITOR                                                      │
│     ├── Track response rate (not WHO responded)                 │
│     ├── Send reminders to non-responders                        │
│     └── Close survey early if needed                            │
│                                                                  │
│  5. VIEW RESULTS (only if responses >= threshold)               │
│     ├── Aggregated statistics                                   │
│     ├── Sentiment analysis                                      │
│     ├── Trend comparison (vs previous surveys)                  │
│     └── Export reports (PDF/CSV)                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Employee Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE SURVEY EXPERIENCE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. RECEIVE INVITATION                                           │
│     ├── Email notification with survey link                     │
│     ├── In-app notification badge                               │
│     └── Slack/Teams notification (if integrated)                │
│                                                                  │
│  2. START SURVEY                                                 │
│     ├── See anonymity guarantee message                         │
│     ├── View estimated completion time                          │
│     └── Progress indicator (optional)                           │
│                                                                  │
│  3. ANSWER QUESTIONS                                             │
│     ├── One question at a time (mobile-friendly)                │
│     ├── Skip optional questions                                 │
│     ├── Save progress (linked to session, not identity)         │
│     └── Text responses sanitized for PII                        │
│                                                                  │
│  4. SUBMIT                                                       │
│     ├── Confirmation screen                                     │
│     ├── Thank you message                                       │
│     └── Points awarded (if gamification enabled)                │
│                                                                  │
│  5. VIEW RESULTS (optional, if HR enables)                      │
│     └── Only aggregated, anonymized results                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Privacy & Security

### 4.1 Anonymity Guarantees

| Layer | Implementation |
|-------|----------------|
| **Data Storage** | SurveyResponse has NO user identifier field |
| **Tracking Separation** | SurveyInvitation tracks completion status separately |
| **Minimum Threshold** | Results hidden until 5+ responses |
| **Text Sanitization** | AI scans text responses for PII before storage |
| **No Timestamps Correlation** | Response timestamps randomized within 1-hour window |
| **Session-Only Save** | Draft responses stored in browser only |

### 4.2 Additional Security

```javascript
// Backend function: submitSurveyResponse
const submitSurveyResponse = async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  const { surveyId, answers, sessionToken } = await req.json();

  // 1. Verify user was invited
  const invitation = await base44.entities.SurveyInvitation.filter({
    survey_id: surveyId,
    user_email: user.email
  });
  
  if (!invitation[0]) {
    return Response.json({ error: 'Not invited' }, { status: 403 });
  }

  // 2. Check if already completed (prevent duplicates)
  if (invitation[0].status === 'completed') {
    return Response.json({ error: 'Already submitted' }, { status: 400 });
  }

  // 3. Sanitize text responses for PII
  const sanitizedAnswers = await sanitizeForPII(answers);

  // 4. Store response WITHOUT user identifier
  await base44.asServiceRole.entities.SurveyResponse.create({
    survey_id: surveyId,
    answers: sanitizedAnswers,
    completed_at: randomizeTimestamp(new Date()),
    // NO user_email field!
  });

  // 5. Update invitation status (separate from response)
  await base44.asServiceRole.entities.SurveyInvitation.update(invitation[0].id, {
    status: 'completed',
    completed_at: new Date().toISOString()
  });

  // 6. Update survey response count
  const survey = await base44.entities.Survey.filter({ id: surveyId });
  await base44.asServiceRole.entities.Survey.update(surveyId, {
    response_count: (survey[0].response_count || 0) + 1
  });

  return Response.json({ success: true });
};
```

### 4.3 Results Access Control

```javascript
// Only show results if threshold met
const getSurveyResults = async (surveyId, user) => {
  // Verify HR role
  if (user.role !== 'admin' && !user.permissions?.hr_access) {
    throw new Error('Unauthorized');
  }

  const survey = await base44.entities.Survey.filter({ id: surveyId });
  const minResponses = survey[0].settings?.min_responses_for_results || 5;

  if (survey[0].response_count < minResponses) {
    return {
      status: 'threshold_not_met',
      current: survey[0].response_count,
      required: minResponses,
      message: `${minResponses - survey[0].response_count} more responses needed`
    };
  }

  // Aggregate and return results
  return aggregateResults(surveyId);
};
```

---

## 5. UI Components

```
components/surveys/
├── SurveyBuilder.jsx           # HR: Drag-drop question builder
├── SurveyQuestionEditor.jsx    # HR: Individual question config
├── SurveyPreview.jsx           # HR: Preview before sending
├── SurveyAudienceSelector.jsx  # HR: Target audience picker
├── SurveyScheduler.jsx         # HR: Timing and recurrence
├── SurveyResultsDashboard.jsx  # HR: Aggregated results view
├── SurveyTrendChart.jsx        # HR: Historical comparison
├── SurveyTaker.jsx             # Employee: Take survey
├── SurveyQuestion.jsx          # Employee: Individual question
├── SurveyProgress.jsx          # Employee: Progress indicator
├── SurveyThankYou.jsx          # Employee: Completion screen
└── SurveyList.jsx              # Both: List of surveys
```

---

## 6. Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `surveys.enabled` | Master toggle | true |
| `surveys.recurring` | Allow recurring surveys | true |
| `surveys.ai_analysis` | AI sentiment analysis | false |
| `surveys.pii_detection` | Auto-detect PII in text | true |
| `surveys.min_threshold` | Global minimum responses | 5 |
| `surveys.employee_results` | Show results to employees | false |

---

## 7. Integration Points

### 7.1 Notifications
- Email: Survey invitation, reminders
- Slack/Teams: Survey available notification
- In-app: Badge on navigation

### 7.2 Gamification
- Award points for survey completion
- Badge: "Feedback Champion" for consistent participation

### 7.3 Analytics
- Response rate trends
- Sentiment over time
- Department comparison (if >5 per dept)