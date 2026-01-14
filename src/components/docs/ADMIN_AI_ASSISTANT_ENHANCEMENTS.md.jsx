# Admin AI Assistant Enhancements

## Overview
The AI Assistant for Admins now features three powerful capabilities:
1. **Challenge Generation** - Auto-create challenges based on engagement trends
2. **Personalized Nudges** - Identify at-risk users and suggest interventions
3. **Custom Reports** - Generate insights via natural language queries

## 1. Challenge Generation

### Feature
Automatically suggests and optionally schedules gamification challenges based on engagement data analysis.

**Function:** `functions/generateChallengesSuggestions.js`

### How It Works
1. Analyzes current engagement metrics
2. Detects engagement patterns (low events, recognition dips, etc)
3. Generates challenge suggestions
4. Optionally auto-creates challenges
5. Notifies admin via email

### Engagement Signals Analyzed
```
- Event attendance rate (target: 70%+)
- Recognition activity (target: 20+ per month)
- Average user points (target: 500+)
- Team participation rates
- Seasonal trends
```

### Auto-Generated Challenge Types

**Event Engagement Low:**
```
🎉 Event Attendee Challenge
"Attend 3 events this month"
150 points reward
Reasoning: Low event attendance detected
```

**Recognition Activity Low:**
```
❤️ Recognition Champion
"Give 5 recognitions this week"
100 points reward
Reasoning: Recognition activity below target
```

**Overall Engagement Low:**
```
⭐ Points Accumulator
"Earn 500 points this month"
Meta-challenge (points = goal)
Reasoning: Overall engagement lower than usual
```

**Seasonal Challenges:**
```
Q1: 🎯 New Year, New Skills - Complete learning module (100 pts)
Q2: ☀️ Summer Social - Attend a social event (75 pts)
Q4: 🎄 Year-End Recognition - Give 3 recognitions (125 pts)
```

### Usage

**Manual Generation (Review Before Scheduling):**
```javascript
const response = await base44.functions.invoke('generateChallengesSuggestions', {
  team_id: 'team_123',
  auto_schedule: false
});

// Admin reviews suggestions, then manually creates desired ones
```

**Auto-Schedule (Immediate):**
```javascript
const response = await base44.functions.invoke('generateChallengesSuggestions', {
  team_id: 'team_123',
  auto_schedule: true
});

// Suggestions immediately created as active challenges
```

### Response
```json
{
  "success": true,
  "suggestions_count": 4,
  "suggestions": [
    {
      "name": "🎉 Event Attendee",
      "description": "Attend 3 events this month",
      "points": 150,
      "reasoning": "Low event attendance detected"
    }
  ],
  "scheduled": true
}
```

## 2. Personalized User Nudges

### Feature
Predicts user churn risk and recommends targeted interventions.

**Function:** `functions/generatePersonalizedNudges.js`

### Churn Risk Calculation
Risk score (0-1.0) based on:
- **No recent activity** (+0.3) - No points in 30 days
- **Low participation** (+0.2) - Never attended events
- **No recognition** (+0.15) - Never gave recognition
- **Inactivity** (+0.3) - Last activity >30 days ago

**High Risk:** Score > 0.6

### Identified At-Risk Reasons
- "No points earned"
- "No activity in 30 days"
- "Never attended events"
- "Never gave recognition"

### Suggested Interventions

**At-Risk Reason:** No activity in 30 days
```
Intervention: Send personalized email inviting to upcoming event
Owner: HR/Admin
Timeline: Within 48 hours
```

**At-Risk Reason:** Never attended events
```
Intervention: Have team lead reach out with event recommendations
Owner: Team Lead
Timeline: This week
```

**At-Risk Reason:** Never gave recognition
```
Intervention: Encourage peer recognition through one-on-one check-in
Owner: Team Lead
Timeline: Flexible
```

**At-Risk Reason:** No points earned
```
Intervention: Schedule check-in to understand engagement needs
Owner: Manager
Timeline: Within 1 week
```

### Usage

```javascript
const response = await base44.functions.invoke('generatePersonalizedNudges', {
  // No params needed - analyzes all users
});
```

### Response
```json
{
  "success": true,
  "at_risk_count": 12,
  "nudges": [
    {
      "user_email": "sarah@company.com",
      "user_name": "Sarah Chen",
      "churn_risk_score": 0.72,
      "reason": "No activity in 30 days; Never attended events",
      "suggested_action": "Send personalized email inviting to upcoming event"
    }
  ]
}
```

### Admin Workflow
1. Run nudge analysis (weekly automated)
2. Review at-risk users
3. Delegate interventions to team leads
4. Track outreach success
5. Monitor if interventions helped (re-run analysis after 1 week)

## 3. Custom Report Generation

### Feature
Generate analytics reports using natural language queries.

**Function:** `functions/customReportGenerator.js` (coming soon)

### Planned Capabilities

**Query Examples:**
```
"Show me team engagement by department for last 3 months"
↓
Generates department comparison chart + CSV export

"Who are our top 10 most engaged users and why?"
↓
Returns ranked list with engagement breakdown per user

"What activities drive the most retention?"
↓
Returns correlation analysis with visualizations

"Which teams improved the most this month?"
↓
Trend analysis with team rankings

"Show churn risk distribution across organization"
↓
Heatmap by department + severity breakdown
```

### Report Components
- Executive summary (1 paragraph)
- Key metrics (KPI cards)
- Visualizations (charts, heatmaps)
- Data tables (sortable, exportable)
- Actionable insights
- Recommended next steps

### Report Formats
- **Interactive Dashboard** (in-app view)
- **PDF Export** (email-friendly)
- **CSV Export** (data analysis)
- **Scheduled** (weekly/monthly email)

### Saved Templates
Admins can save custom queries as templates:
```
Template: "Monthly Engagement Snapshot"
Query: Team engagement by department + top users
Frequency: Every 1st of month
Recipients: exec@company.com, hr@company.com
```

## Integration with Existing Systems

### Challenge Generation → Team Analytics
- Auto-created challenges appear in TeamChallenge entity
- Tracked in team leaderboard
- Counted in team engagement scores

### Nudges → User Engagement
- At-risk users identified
- Intervention email sent automatically
- Can trigger rule engine if configured
- Tracked in admin audit log

### Custom Reports → Analytics Dashboard
- Reports accessible from Analytics page
- Embeddable as widgets
- Shareable via link or email
- Supports drill-down for details

## Admin Dashboard Integration

**Proposed Layout:**
```
[Admin AI Assistant Panel]

Recent Insights:
- 4 challenges auto-generated this week
- 12 users at churn risk (2 new this week)
- Team Engineering ↑ 23% engagement

Quick Actions:
[Generate Challenges] [Analyze User Risk] [Create Custom Report]

Latest Nudges:
↳ Sarah Chen (72% risk) - No activity 30 days - SEND EMAIL
↳ Mike Johnson (65% risk) - Never gave recognition - NOTIFY LEAD

Scheduled Reports:
↳ Monthly Engagement (Due: Feb 1) - 5 subscribers
↳ Department Trends (Weekly) - On schedule
```

## Email Notifications

### Challenge Suggestion Email
```
Subject: 🤖 AI Generated 4 Challenge Suggestions for Your Team

Hi [Admin Name],

Based on engagement trends, we suggest:

- 🎉 Event Attendee Challenge (150 pts): Low event attendance
  Low event attendance detected - encourage participation
  
- ❤️ Recognition Champion (100 pts): Recognition activity below target
  Recognition activity below target - foster team appreciation
  
- ⭐ Points Accumulator: Overall engagement lower than usual
  Overall engagement lower than usual - boost motivation

[View Details] [Auto-Schedule All] [Dismiss]

---
Next analysis: Tomorrow at 9am
```

### At-Risk User Email
```
Subject: ⚠️ 12 Users at Risk of Disengagement

Hi [Admin Name],

We've identified 12 users showing low engagement:

Top Concerns:
1. Sarah Chen (72% risk) - No activity in 30 days
   Suggestion: Send personalized email inviting to upcoming event
   
2. Mike Johnson (65% risk) - Never gave recognition
   Suggestion: Have team lead reach out with encouragement
   
3. Jessica Lee (63% risk) - No points earned
   Suggestion: Schedule check-in to understand needs

[See Full List] [Bulk Actions] [Disable Warnings]

---
Weekly analysis sent every Monday
```

## Configuration

### Enable/Disable Features
In Admin Settings:
```
AI Challenge Generation: [ON] - Run weekly analysis
AI Nudge System: [ON] - Analyze every Monday
AI Report Generator: [ON] - Available on demand

Email Notifications: [ON]
├─ Challenge suggestions: [ON]
├─ At-risk user alerts: [ON]
└─ Frequency: Weekly

Auto-Schedule Challenges: [OFF]
├─ Enable if you want full automation
└─ Requires manual review otherwise
```

### Thresholds
```
Churn Risk Threshold: 0.60 (adjust 0-1.0)
Event Attendance Target: 70%
Recognition Target: 20/month
Avg Points Target: 500/month
```

## Monitoring & Analytics

### What Gets Tracked
- How many challenges generated per month
- How many at-risk users identified
- Intervention success rate (did user re-engage?)
- Rule execution from generated rules
- Report generation frequency

### Success Metrics
- Churn prevention rate
- Challenge participation rates
- User re-engagement after nudge
- Overall engagement trend improvement

## Future Enhancements
- [ ] Predictive machine learning models
- [ ] Multi-language support for nudges
- [ ] Integration with Slack/Teams for nudges
- [ ] A/B testing intervention messages
- [ ] Sentiment analysis of user feedback
- [ ] Automated reward recommendations