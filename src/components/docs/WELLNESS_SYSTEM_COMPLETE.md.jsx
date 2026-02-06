# Complete Wellness System Documentation
**Version:** 2.0  
**Last Updated:** February 6, 2026

---

## 🏃 Wellness System Overview

### Core Components

#### 1. Fitbit Integration
**Function:** `functions/syncFitbitData.js`  
**Component:** `components/wellness/FitbitSyncButton.jsx`  
**OAuth:** Fitbit App Connector (activity, heartrate, profile, sleep scopes)

**Workflow:**
1. User authorizes Fitbit via OAuth
2. Click "Sync Now" in Wellness Dashboard
3. Function fetches today's activity from Fitbit API
4. Creates WellnessLog entry with source="fitbit"
5. Updates all active step-based WellnessGoals
6. Awards points if goals completed

**Data Synced:**
- Steps (daily total)
- Heart rate (future)
- Sleep data (future)
- Auto-updates goal progress

---

#### 2. Team Wellness Leaderboards
**Component:** `components/wellness/TeamWellnessLeaderboard.jsx`

**Features:**
- **Team Rankings**: Aggregated by average team progress
- **Individual Rankings**: Top 10 performers per challenge
- **Podium Display**: Gold/Silver/Bronze for top 3
- **Real-time Updates**: Reflects latest progress

**Calculation:**
```javascript
// Team scoring
teamScore = totalProgress / memberCount

// Individual scoring
individualScore = progress_percentage
```

**UI Elements:**
- Dual tabs (Teams vs Individual)
- Rank badges (1st = gold gradient, 2nd = silver, 3rd = bronze)
- Completion count
- Average progress percentage

---

#### 3. Automated Point Awards
**Function:** `functions/awardWellnessPoints.js`  
**Automation:** Entity trigger on WellnessGoal updates

**Awards:**
- **Goal Completion**: Challenge-defined points (50-200)
- **Streak Bonuses**:
  - 7-day streak: +70 points
  - 14-day streak: +140 points
  - 30-day streak: +300 points

**Notifications:**
- Completion: "You earned X points for completing [challenge]!"
- Streak: "30-Day Streak! 🔥 +300 bonus points!"

---

#### 4. Wellness Analytics
**Page:** `pages/WellnessAnalyticsReport.js`  
**Component:** `components/wellness/WellnessInsightsPanel.jsx`  
**Function:** `functions/wellnessEngagementCorrelation.js`

**Reports:**
1. **30-Day Activity Trends**: Line chart (steps, meditation, hydration)
2. **Engagement Correlation**: Bar chart comparing wellness vs. events/recognition
3. **AI Insights**: Correlation strength, patterns, HR recommendations
4. **Completion Metrics**: Total logs, active users, goal completion rate

**Correlation Analysis:**
- Aggregates wellness logs by user
- Correlates with engagement data (events, recognitions, points)
- AI determines correlation strength (strong/moderate/weak/none)
- Suggests optimal challenge goals based on engagement patterns

**Example Insight:**
```json
{
  "correlation_strength": "strong_positive",
  "correlation_score": 0.73,
  "key_insights": [
    "Employees logging 10k+ steps attend 2x more events",
    "Meditation practice correlates with 40% higher recognition activity"
  ],
  "recommendations": [
    {
      "action": "Promote walking meetings to boost both wellness and collaboration",
      "expected_outcome": "15% increase in event attendance",
      "priority": "high"
    }
  ],
  "suggested_challenge_goals": {
    "steps_daily": 8500,
    "meditation_minutes": 15,
    "hydration_glasses": 7
  }
}
```

---

## 🗂️ Data Entities

### WellnessChallenge
- Company-wide or team-based wellness initiatives
- Goal values, point rewards, duration
- Status: draft → active → completed

### WellnessGoal
- Individual user participation in challenges
- Progress tracking (current_progress, progress_percentage)
- Streak counting
- Permissions: User or admin only

### WellnessLog
- Daily activity entries
- Source tracking (manual, fitbit, apple_health, google_fit)
- Point awards logged

---

## 🎯 User Flows

### Join Wellness Challenge
1. User browses available challenges (WellnessDashboard)
2. Clicks "Join Challenge"
3. WellnessGoal created (status: in_progress)
4. User logs activity or syncs Fitbit
5. Progress auto-updates
6. On completion: Points awarded, notification sent

### Fitbit Sync Flow
1. Admin authorizes Fitbit connector (one-time)
2. User clicks "Sync Now" in dashboard
3. Function fetches Fitbit data via OAuth token
4. WellnessLog created
5. All active step goals updated
6. Points awarded if milestones reached

### Leaderboard Viewing
1. Navigate to WellnessDashboard
2. Scroll to leaderboard section
3. Toggle between Team and Individual tabs
4. See real-time rankings
5. Track position and competitors

---

## 🚀 Admin Tools

**Wellness Admin Panel** (`pages/WellnessAdmin.js`):
- Create challenges with AI ideas
- Activate/complete challenges
- View participant counts
- Access wellness analytics

**Analytics Report** (`pages/WellnessAnalyticsReport.js`):
- 30-day trends
- Correlation insights
- Team leaderboards for all challenges
- Export capabilities (future)

---

## 📱 Mobile Optimization

- Fitbit sync button: Touch-friendly, large tap target
- Leaderboard: Responsive grid, mobile-first design
- Charts: Responsive containers, horizontal scroll on mobile
- Bottom nav: Quick access to Wellness tab

---

## 🔮 Future Enhancements

- [ ] Apple Health integration
- [ ] Google Fit integration
- [ ] Automated Fitbit sync (daily cron)
- [ ] Team vs Team wellness competitions
- [ ] Wellness coaching AI agent
- [ ] Export wellness reports to PDF
- [ ] Integration with company health insurance

---

**Last Updated:** February 6, 2026  
**Status:** Production Ready  
**Dependencies:** Fitbit OAuth, Base44 Core.InvokeLLM