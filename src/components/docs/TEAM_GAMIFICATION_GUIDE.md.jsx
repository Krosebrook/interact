# Team-Based Gamification Documentation

## Overview
Teams now compete on dynamic leaderboards with engagement tracking, contribution analytics, and inter-team comparisons. Admins can create team-specific challenges and view detailed team performance metrics.

## Features

### 1. Team Leaderboard
**Page:** `pages/TeamLeaderboard.js`

**Displays:**
- Top 3 teams (podium view with medals)
- Full rankings with metrics
- Timeframe selector (week, month, all-time)
- Engagement trends (increasing, stable, decreasing)

**Metrics per Team:**
- Total points accumulated
- Active member count
- Average engagement score (0-100%)
- Points per member
- Trend indicator

### 2. Team Analytics Dashboard
**Page:** `pages/TeamAnalyticsDashboard.js`

**Sections:**
- **KPI Cards**: Active members, total points, recognitions, engagement score
- **Member Contribution**: Points breakdown by individual
- **Activity Breakdown**: Distribution of events, challenges, recognitions
- **Top Contributors**: Ranked list with recognition stats
- **Team vs Organization**: Comparative analysis (points, engagement, active rate)

**Filters:**
- Team selector
- Time period (week, month, 3 months)

### 3. Team Challenges
Team-specific challenges can be created and managed:
- Points rewards
- Participation tracking
- Team-only leaderboards
- Auto-generated via AI based on engagement trends

### 4. Team Analytics Entity
**Database Schema:**
```
{
  "team_id": "required",
  "period": "YYYY-MM",
  "active_members": number,
  "total_points": number,
  "avg_engagement_score": 0-100,
  "member_contribution": [
    {
      "user_email": string,
      "points_earned": number,
      "recognitions_given": number,
      "recognitions_received": number,
      "engagement_score": number
    }
  ],
  "engagement_trend": "increasing|stable|decreasing"
}
```

## Team Competitions

### How Teams Compete
1. **Team Formation**: Users belong to teams via `TeamMembership`
2. **Point Accumulation**: All user points contribute to team total
3. **Metrics Tracked**: Events attended, recognitions given, challenges completed
4. **Dynamic Ranking**: Updated daily based on latest activity

### Recognition Dynamics
- Recognition points count toward both individual AND team score
- Recognitions given within team weighted slightly higher (team cohesion)
- Cross-team recognitions still count fully

### Engagement Score Calculation
```
Team Engagement = (active_members / total_members) × 60% + (total_points / org_avg) × 40%
```

## Backend Integration

### Get Team Leaderboard Stats
```javascript
POST /api/functions/getTeamLeaderboardStats
{
  "timeframe": "week|month|alltime"
}

Response:
[
  {
    "id": "team_123",
    "team_name": "Engineering",
    "member_count": 12,
    "active_members": 10,
    "total_points": 5000,
    "avg_engagement_score": 78,
    "engagement_trend": "increasing"
  },
  ...
]
```

### Get Team Analytics
```javascript
POST /api/functions/getTeamAnalytics
{
  "team_id": "team_123",
  "period": "current-month|last-month|last-3-months|last-week"
}

Response:
{
  "team_id": "team_123",
  "total_members": 12,
  "active_members": 10,
  "total_points": 5000,
  "avg_engagement_score": 78,
  "member_contribution": [...],
  "engagement_trend": "increasing"
}
```

## Admin Management

### Creating Team Challenges
1. Go to Gamification Dashboard
2. Create challenge with team scope
3. Define points, duration, description
4. Optionally auto-schedule via AI

### AI Challenge Generation
Automatically suggests challenges based on:
- Low event attendance patterns
- Recognition activity dips
- Overall engagement decline
- Seasonal opportunities

**Trigger:** Manual or scheduled weekly analysis

### Team Analytics Reports
Export team performance data:
- Member contributions
- Engagement trends
- Comparison metrics
- Historical tracking

## Rules & Scoring

### Points Multipliers
- Team member participates in event: +10 base points
- Team gives recognition: +20 points to giver + team bonus
- Team completes challenge: +100 base points × team participation rate

### Bonus Points
- All team members active in period: +5% team bonus
- Team reaches engagement milestone: +25 bonus points
- Inter-team cooperation: +50 bonus points

## Use Cases

### Case 1: Monthly Team Challenge
**Objective:** Increase cross-team collaboration
1. Admin creates challenge: "Recognize 3 teammates outside your team"
2. Points: 50 per recognition
3. Duration: 1 month
4. Display on team leaderboard with live counter

### Case 2: Engagement Turnaround
1. Admin runs churn risk analysis
2. System identifies 2 low-engagement teams
3. AI suggests team-building challenges
4. Challenges auto-created and scheduled
5. Team leads notified of improvement tactics

### Case 3: Competitive Season
1. Kick off 3-month "Team Olympics"
2. Weekly mini-challenges announced
3. Leaderboard updated daily
4. Top team gets special recognition
5. All teams above baseline get points

## Analytics Dashboard Integration

### What Team Leads See
- Their team's ranking
- Member contribution breakdown
- Performance vs last period
- Upcoming team challenges
- Quick action buttons

### What Admins See
- All team comparisons
- Drill-down to individual members
- Historical trends
- Intervention suggestions
- Bulk challenge management

## Mobile Experience
- Team leaderboard optimized for mobile
- Compact card layout for rankings
- Quick share team performance
- Real-time notifications on rank changes

## Future Enhancements
- [ ] Team sub-groups (divisions within teams)
- [ ] Inter-team tournaments
- [ ] Real-time leaderboard websocket updates
- [ ] Team custom avatars/colors
- [ ] Team mood check-ins
- [ ] Async collaboration challenges