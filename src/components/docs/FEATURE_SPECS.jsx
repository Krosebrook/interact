# Feature Specifications
## Employee Engagement Platform

---

## 1. Feature Overview Matrix

| Feature | Status | Priority | Module | Details |
|---------|--------|----------|--------|---------|
| Activity Library | ✅ Built | P0 | Activities | 15+ templates, 6 types |
| Event Scheduling | ✅ Built | P0 | Events | Recurring, bulk, wizard |
| Event Templates | ✅ Built | P0 | Events | 30+ pre-built templates |
| Team Channels | ✅ Built | P0 | Channels | Public/private messaging |
| Channel Messaging | ✅ Built | P0 | Channels | Reactions, real-time |
| Points System | ✅ Built | P0 | Gamification | Earn/spend economy |
| Badges | ✅ Built | P1 | Gamification | 10 badges, 5 rarities |
| Leaderboards | ✅ Built | P0 | Gamification | Multi-category, time-based |
| Team Challenges | ✅ Built | P1 | Gamification | Head-to-head, league |
| Skill Tracking | ✅ Built | P1 | Skills | Progress, mentorship |
| Analytics Dashboard | ✅ Built | P1 | Analytics | HR insights, AI |
| Facilitator Tools | ✅ Built | P1 | Events | Live event management |
| AI Event Planner | ✅ Built | P1 | AI | Smart scheduling |
| Peer Recognition | ✅ Built | P0 | Recognition | AI suggestions, moderation |
| Moderation Tools | ✅ Built | P0 | Moderation | AI flagging, queue |
| Point Store | ✅ Built | P1 | Store | Avatar customization |
| Stripe Integration | ✅ Built | P1 | Store | Premium purchases |
| Social Features | ✅ Built | P1 | Social | Follow, block, profiles |
| Public Profiles | ✅ Built | P1 | Social | Stats, badges, privacy |
| Pulse Surveys | 📋 Spec'd | P0 | Surveys | Anonymous responses |
| Milestone Celebrations | ⏳ Planned | P2 | Celebrations | Birthdays, anniversaries |

---

## 2. Leaderboard System ✅ NEW

### 2.1 Feature Description
Multi-category leaderboard system with time-based filtering, engagement scoring, and social features.

### 2.2 Categories

| Category | Field | Scoring |
|----------|-------|---------|
| Points | total_points | Direct point count |
| Events | events_attended | Event attendance count |
| Badges | badges_earned.length | Number of badges |
| Engagement | calculated | Weighted composite score |

### 2.3 Engagement Score Formula

```javascript
engagement_score = 
  (events_attended × 10) +
  (activities_completed × 15) +
  (feedback_submitted × 5) +
  (streak_days × 2) +
  (badges_earned.length × 20)
```

### 2.4 Time Periods

| Period | Description | Data Source |
|--------|-------------|-------------|
| Daily | Today's activity | daily_points |
| Weekly | This week | weekly_points |
| Monthly | This month | monthly_points |
| All-Time | Lifetime | lifetime_points |

### 2.5 Features

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEADERBOARD FEATURES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MY RANK CARD                                                    │
│  ═══════════                                                     │
│  • Current rank (#X of Y)                                        │
│  • Percentile badge (Top X%)                                     │
│  • Nearby competitors (±2 ranks)                                 │
│  • Score in selected category                                    │
│                                                                  │
│  RANKING LIST                                                    │
│  ════════════                                                    │
│  • Top 100 users displayed                                       │
│  • Special styling for Top 3 (gold/silver/bronze)               │
│  • Current user highlighted                                      │
│  • Click to view profile                                         │
│  • Level badge on avatar                                         │
│  • Streak indicator                                              │
│                                                                  │
│  FILTERING                                                       │
│  ══════════                                                      │
│  • Category tabs (Points, Events, Badges, Engagement)           │
│  • Time period buttons                                           │
│  • "Following only" toggle                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Component Structure

| Component | Purpose |
|-----------|---------|
| useLeaderboard | Data fetching, ranking logic |
| Leaderboard | Main container |
| LeaderboardFilters | Category/period controls |
| LeaderboardRow | Individual user row |
| MyRankCard | Current user's position |

---

## 3. Social Features ✅ NEW

### 3.1 Feature Description
Follow/block system with public profiles enabling social leaderboard filtering.

### 3.2 Relationships

| Relationship | Status | Description |
|--------------|--------|-------------|
| Following | active | User follows another |
| Blocked | blocked | User blocked another |

### 3.3 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| SOC-01 | Employee | Follow colleagues | I can track their activity |
| SOC-02 | Employee | Block users | I can control my experience |
| SOC-03 | Employee | View public profiles | I can learn about colleagues |
| SOC-04 | Employee | Filter leaderboard | I see only people I follow |
| SOC-05 | Employee | Set profile privacy | I control my visibility |

### 3.4 Public Profile Features

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC PROFILE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HEADER                                                          │
│  • Avatar with level badge                                       │
│  • Display name                                                  │
│  • Bio                                                           │
│  • Join date                                                     │
│  • Follow/Block buttons                                          │
│                                                                  │
│  STATS GRID                                                      │
│  • Total points                                                  │
│  • Events attended                                               │
│  • Badges earned                                                 │
│  • Current streak                                                │
│                                                                  │
│  BADGES SHOWCASE                                                 │
│  • Recent badges (up to 5)                                       │
│  • "+X more" if additional                                       │
│                                                                  │
│  PRIVACY                                                         │
│  • Private profiles show lock icon                               │
│  • Stats hidden for private profiles                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Component Structure

| Component | Purpose |
|-----------|---------|
| useSocialActions | Follow/block mutations |
| PublicProfileCard | Profile display |
| PublicProfile (page) | Profile page wrapper |

---

## 4. Moderation Tools ✅ COMPLETE

### 4.1 Feature Description
AI-powered content moderation with admin review queue for user-generated content.

### 4.2 Moderation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODERATION WORKFLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CONTENT SUBMITTED                                               │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐                                                │
│  │ AI ANALYSIS │ (InvokeLLM)                                    │
│  │ ─────────── │                                                │
│  │ • Toxicity  │                                                │
│  │ • Spam      │                                                │
│  │ • Bias      │                                                │
│  │ • Quality   │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│    ┌────┴────┐                                                  │
│    ▼         ▼                                                  │
│  SAFE     FLAGGED                                               │
│    │         │                                                  │
│    ▼         ▼                                                  │
│ APPROVED  MODERATION QUEUE                                      │
│              │                                                  │
│         ┌────┴────┐                                            │
│         ▼         ▼                                            │
│      APPROVE   REJECT                                          │
│         │         │                                            │
│         ▼         ▼                                            │
│      PUBLISH   NOTIFY USER                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Flag Reasons

| Reason | Severity | Color |
|--------|----------|-------|
| Inappropriate | High | Red |
| Spam | Medium | Orange |
| Bias | Medium | Yellow |
| Low Quality | Low | Gray |
| Needs Review | Medium | Blue |

### 4.4 Admin Actions

| Action | Description |
|--------|-------------|
| Approve | Publish content |
| Reject | Remove with notification |
| AI Analyze | Run analysis on item |
| Bulk Scan | Scan recent content |

### 4.5 Component Structure (Refactored)

| Component | Purpose |
|-----------|---------|
| useModerationActions | Mutations, AI analysis |
| ModerationQueue | Main container with tabs |
| ModerationItem | Individual item card |
| FLAG_REASONS | Configuration constant |

---

## 5. Point Store ✅ COMPLETE

### 5.1 Feature Description
Marketplace for avatar customizations and power-ups with points or Stripe purchases.

### 5.2 Item Categories

| Category | Description | Price Range |
|----------|-------------|-------------|
| avatar_hat | Head accessories | 100-1000 pts |
| avatar_glasses | Eyewear | 50-500 pts |
| avatar_background | Profile backgrounds | 200-2000 pts |
| avatar_frame | Profile borders | 300-3000 pts |
| avatar_effect | Animated effects | 500-5000 pts |
| power_up | Temporary boosts | 100-500 pts |

### 5.3 Rarity System

| Rarity | Color | Border Style |
|--------|-------|--------------|
| Common | Slate | border-slate-300 |
| Uncommon | Green | border-green-400 |
| Rare | Blue | border-blue-400 |
| Epic | Purple | border-purple-400 |
| Legendary | Gold | border-amber-400 + ring |

### 5.4 Avatar Customization

```
┌─────────────────────────────────────────────────────────────────┐
│                    AVATAR LAYERS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LAYER 5: Effects (particle animations)                   │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  LAYER 4: Frame (border around avatar)              │ │  │
│  │  │  ┌───────────────────────────────────────────────┐ │ │  │
│  │  │  │  LAYER 3: Background (behind avatar)          │ │ │  │
│  │  │  │  ┌─────────────────────────────────────────┐ │ │ │  │
│  │  │  │  │  LAYER 2: Glasses (on face)             │ │ │ │  │
│  │  │  │  │  ┌───────────────────────────────────┐ │ │ │ │  │
│  │  │  │  │  │  LAYER 1: Hat (above head)        │ │ │ │ │  │
│  │  │  │  │  │  ┌─────────────────────────────┐ │ │ │ │ │  │
│  │  │  │  │  │  │  LAYER 0: Base Avatar       │ │ │ │ │ │  │
│  │  │  │  │  │  │  (User initial in circle)   │ │ │ │ │ │  │
│  │  │  │  │  │  └─────────────────────────────┘ │ │ │ │ │  │
│  │  │  │  │  └───────────────────────────────────┘ │ │ │ │  │
│  │  │  │  └─────────────────────────────────────────┘ │ │ │  │
│  │  │  └───────────────────────────────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Component Structure (Refactored)

| Component | Purpose |
|-----------|---------|
| useStoreActions | Purchase mutations |
| useAvatarCustomization | Equip logic, state |
| StoreItemCard | Item in grid |
| StoreItemDetail | Modal with details |
| AvatarCustomizer | Main customization UI |
| AvatarPreview | Avatar display |
| InventorySelector | Slot-based selection |

---

## 6. Recognition System ✅ COMPLETE

### 6.1 Features

| Feature | Description | Status |
|---------|-------------|--------|
| Give Recognition | Send to colleagues | ✅ |
| Category Selection | 8 categories | ✅ |
| AI Suggestions | Message generation | ✅ |
| Company Values | Tag with values | ✅ |
| Visibility Control | Public/private/team | ✅ |
| Reactions | Emoji reactions | ✅ |
| Moderation | AI + manual | ✅ |
| Featured | Admin highlight | ✅ |

### 6.2 Categories

| Category | Icon | Description |
|----------|------|-------------|
| Teamwork | 🤝 | Collaboration |
| Innovation | 💡 | New ideas |
| Leadership | 🎯 | Guidance |
| Going Above | 🚀 | Extra effort |
| Customer Focus | ❤️ | Client care |
| Problem Solving | 🧩 | Solutions |
| Mentorship | 🌱 | Teaching |
| Culture Champion | 🌟 | Values |

---

## 7. Gamification Points ✅ COMPLETE

### 7.1 Earning Points

| Action | Points | Source |
|--------|--------|--------|
| Event Attendance | +10 | attendance |
| Activity Completion | +15 | activity |
| Feedback Submission | +5 | feedback |
| High Engagement | +5 | bonus |
| Recognition Received | +10-35 | recognition |
| Badge Earned | varies | badge |

### 7.2 Backend Function (Refactored)

```javascript
// functions/awardPoints.js structure
POINTS_CONFIG = {
  attendance: { points: 10, field: 'events_attended' },
  activity_completion: { points: 15, field: 'activities_completed' },
  feedback: { points: 5, field: 'feedback_submitted' },
  high_engagement: { points: 5, field: null }
};

// Helper functions:
checkDuplicateAward()      // Prevent double awards
getOrCreateUserPoints()    // Initialize new users
calculatePointsUpdate()    // Compute new values
updateTeamPoints()         // Sync team totals
checkAndAwardBadges()      // Auto-badge logic
```

---

## 8. Team Channels ✅ COMPLETE

### 8.1 Channel Types

| Type | Icon | Use Case |
|------|------|----------|
| team | 👥 | Department communication |
| project | 📁 | Project-specific |
| interest | 💡 | Hobbies, social |
| announcement | 📢 | Company-wide updates |

### 8.2 Visibility Levels

| Level | Who Can See | Who Can Join |
|-------|-------------|--------------|
| public | Everyone | Anyone |
| private | Members only | Invite only |
| invite_only | Members only | Admin invite |

---

## 9. Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| recognition.enabled | true | Master toggle |
| recognition.moderation | true | AI moderation |
| leaderboard.enabled | true | Leaderboards |
| leaderboard.social_filter | true | Following filter |
| profiles.public | true | Public profiles |
| social.follow | true | Follow feature |
| social.block | true | Block feature |
| store.enabled | true | Point store |
| store.stripe | true | Real-money purchases |
| gamification.badges | true | Badge system |
| gamification.streaks | true | Streak tracking |
| gamification.teams | true | Team competitions |

---

*Document Version: 3.0*
*Last Updated: 2025-11-30*
*Status: Active Development*