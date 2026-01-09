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
| Leaderboards | ✅ Built | P1 | Gamification | Individual + team |
| Team Challenges | ✅ Built | P1 | Gamification | Head-to-head, league |
| Skill Tracking | ✅ Built | P1 | Skills | Progress, mentorship |
| Analytics Dashboard | ✅ Built | P1 | Analytics | HR insights, AI |
| Facilitator Tools | ✅ Built | P1 | Events | Live event management |
| AI Event Planner | ✅ Built | P1 | AI | Smart scheduling |
| Pulse Surveys | 📋 Spec'd | P0 | Surveys | Anonymous responses |
| Point Store | 📋 Spec'd | P1 | Store | Avatar customization |
| Stripe Integration | 🔧 Ready | P1 | Store | Keys configured |
| Peer Recognition | 📋 Spec'd | P0 | Recognition | Shoutouts, tags |
| Milestone Celebrations | ⏳ Planned | P2 | Celebrations | Birthdays, anniversaries |

---

## 2. Recognition System

### 2.1 Feature Description
Peer-to-peer recognition allowing employees to publicly acknowledge colleagues' contributions with optional point bonuses.

### 2.2 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| REC-01 | Employee | Give recognition to colleague | I can acknowledge their work |
| REC-02 | Employee | Add points to recognition | I can reward exceptional work |
| REC-03 | Employee | Tag skills/projects | Context is preserved |
| REC-04 | Employee | React to recognitions | I can show appreciation |
| REC-05 | Admin | Moderate recognitions | Quality is maintained |
| REC-06 | Admin | Feature recognitions | Best ones are highlighted |

### 2.3 Functional Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOGNITION WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER CREATES                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Validation  │───▶│ AI Filter   │───▶│ Status Set  │         │
│  │ - 20-500chr │    │ - Toxicity  │    │             │         │
│  │ - Recipient │    │ - PII       │    │ pending OR  │         │
│  │ - Points    │    │ - Spam      │    │ auto-approve│         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│                                               │                  │
│                      ┌────────────────────────┴───────┐         │
│                      │                                │         │
│                      ▼                                ▼         │
│               ┌─────────────┐                  ┌─────────────┐  │
│               │ MODERATION  │                  │  PUBLISHED  │  │
│               │    QUEUE    │                  │             │  │
│               │             │──── approve ────▶│ • Feed      │  │
│               │ Admin sees  │                  │ • Notify    │  │
│               │ flagged     │                  │ • Points    │  │
│               └─────────────┘                  └─────────────┘  │
│                     │                                           │
│                     │ reject                                    │
│                     ▼                                           │
│               ┌─────────────┐                                   │
│               │  REJECTED   │                                   │
│               │ Notify user │                                   │
│               └─────────────┘                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Data Model

See [FEATURE_SPEC_RECOGNITION.md](./FEATURE_SPEC_RECOGNITION.md) for complete schema.

### 2.5 UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| RecognitionComposer | Create recognition | Modal |
| RecognitionFeed | Display stream | Main page |
| RecognitionCard | Single item | Feed |
| ModerationQueue | Admin review | Admin page |
| RecognitionStats | Analytics | Dashboard |

### 2.6 Business Rules

| Rule | Description |
|------|-------------|
| Daily Limit | Max 5 recognitions per day |
| Point Pool | 50 points daily allowance |
| Self-Recognition | Not allowed |
| Min Message | 20 characters |
| Max Points | 25 per recognition |

---

## 3. Pulse Surveys

### 3.1 Feature Description
Anonymous, recurring surveys for HR to gather employee feedback with privacy-preserving response handling.

### 3.2 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| SRV-01 | HR | Create surveys | I can gather feedback |
| SRV-02 | HR | Schedule recurring surveys | Feedback is continuous |
| SRV-03 | HR | View aggregated results | I can identify trends |
| SRV-04 | Employee | Respond anonymously | I can be honest |
| SRV-05 | Employee | See my response was recorded | I trust the system |
| SRV-06 | HR | Set minimum threshold | Small groups stay anonymous |

### 3.3 Anonymity Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANONYMITY ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SURVEY INVITATION TRACKING                  │    │
│  │  ────────────────────────────────────────────────────── │    │
│  │  user_email: alex@intinc.com                            │    │
│  │  survey_id: survey_123                                  │    │
│  │  status: completed ✓                                    │    │
│  │  sent_at: 2025-11-01                                    │    │
│  │                                                          │    │
│  │  ⚠️ NO LINK to which response belongs to this user      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│                         🔒 WALL 🔒                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SURVEY RESPONSE DATA                        │    │
│  │  ────────────────────────────────────────────────────── │    │
│  │  survey_id: survey_123                                  │    │
│  │  answers: [{ q1: 4 }, { q2: "feedback..." }]           │    │
│  │  completed_at: [randomized timestamp]                   │    │
│  │                                                          │    │
│  │  ❌ NO user_email field                                  │    │
│  │  ❌ NO created_by tracking                               │    │
│  │  ✓ Only aggregates shown if responses >= 5              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Data Model

See [FEATURE_SPEC_PULSE_SURVEYS.md](./FEATURE_SPEC_PULSE_SURVEYS.md) for complete schema.

### 3.5 Question Types

| Type | Use Case | Config |
|------|----------|--------|
| rating | 1-5 star rating | scale_min, scale_max |
| nps | Net Promoter Score | 0-10 scale |
| text | Open feedback | max_length |
| multiple_choice | Single select | options array |
| checkbox | Multi-select | options array |
| scale | Likert scale | labels |

---

## 4. Team Channels

### 4.1 Feature Description
Real-time messaging channels for teams, projects, and interest groups.

### 4.2 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| CHN-01 | Employee | Create channel | Teams can communicate |
| CHN-02 | Employee | Send messages | I can share updates |
| CHN-03 | Employee | React to messages | Quick acknowledgment |
| CHN-04 | Admin | Manage members | Control access |
| CHN-05 | Employee | Search channels | I find relevant ones |

### 4.3 Channel Types

| Type | Icon | Use Case |
|------|------|----------|
| team | 👥 | Department communication |
| project | 📁 | Project-specific |
| interest | 💡 | Hobbies, social |
| announcement | 📢 | Company-wide updates |

### 4.4 Visibility Levels

| Level | Who Can See | Who Can Join |
|-------|-------------|--------------|
| public | Everyone | Anyone |
| private | Members only | Invite only |
| invite_only | Members only | Admin invite |

---

## 5. Gamification System

### 5.1 Feature Description
Points, badges, levels, and leaderboards to incentivize engagement.

### 5.2 Points Economy

```
┌─────────────────────────────────────────────────────────────────┐
│                    POINTS ECONOMY                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EARNING POINTS                     SPENDING POINTS             │
│  ══════════════                     ═══════════════             │
│                                                                  │
│  ┌─────────────────────┐           ┌─────────────────────┐     │
│  │ Event Attendance    │ +10       │ Store Items         │     │
│  │ Survey Completion   │ +10       │ • Avatar hats       │     │
│  │ Give Recognition    │ +5        │ • Glasses           │     │
│  │ Receive Recognition │ +10-35    │ • Backgrounds       │     │
│  │ Activity Completion │ +15       │ • Effects           │     │
│  │ Streak Bonus (7d)   │ +25       │                     │     │
│  │ Badge Earned        │ varies    │ Power-Ups           │     │
│  │ Team Challenge Win  │ +100      │ • 2X Points         │     │
│  └─────────────────────┘           │ • Visibility Boost  │     │
│                                     └─────────────────────┘     │
│                                                                  │
│  POINTS TRACKING                                                │
│  ════════════════                                               │
│  total_points:     All points ever earned (never decreases)    │
│  available_points: Points available to spend                   │
│  lifetime_points:  Same as total, for display                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Level Progression

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Newcomer |
| 2 | 100 | Explorer |
| 3 | 250 | Contributor |
| 4 | 500 | Connector |
| 5 | 1000 | Champion |
| 10 | 5000 | Ambassador |
| 15 | 15000 | Legend |
| 20 | 50000 | Icon |

### 5.4 Badge Categories

| Category | Examples | Criteria |
|----------|----------|----------|
| Engagement | First Event, Weekly Active | Attendance |
| Collaboration | Team Player, Mentor | Recognition |
| Innovation | Idea Champion, Pioneer | Contributions |
| Leadership | Rising Star, Community Builder | Impact |
| Special | Early Adopter, Anniversary | Time-based |

---

## 6. Point Store

### 6.1 Feature Description
Marketplace where employees can spend points on avatar customizations and power-ups, with optional premium purchases via Stripe.

### 6.2 Item Categories

| Category | Description | Price Range |
|----------|-------------|-------------|
| avatar_hat | Head accessories | 100-1000 pts |
| avatar_glasses | Eyewear | 50-500 pts |
| avatar_background | Profile backgrounds | 200-2000 pts |
| avatar_frame | Profile borders | 300-3000 pts |
| avatar_effect | Animated effects | 500-5000 pts |
| power_up | Temporary boosts | 100-500 pts |

### 6.3 Rarity System

| Rarity | Drop Rate | Point Multiplier |
|--------|-----------|------------------|
| Common | 50% | 1x |
| Uncommon | 25% | 1.5x |
| Rare | 15% | 2x |
| Epic | 8% | 3x |
| Legendary | 2% | 5x |

### 6.4 Stripe Integration

See [FEATURE_SPEC_POINT_STORE.md](./FEATURE_SPEC_POINT_STORE.md) for implementation details.

---

## 7. Analytics Dashboard

### 7.1 HR Metrics

| Metric | Calculation | Visualization |
|--------|-------------|---------------|
| DAU | Daily unique logins | Line chart |
| Recognition Rate | Recog/employee/week | Bar chart |
| Survey Response | Responses/invites | Percentage |
| Team Health | Recognition flow | Network graph |
| Sentiment Trend | Survey analysis | Line chart |

### 7.2 Individual Metrics

| Metric | Description |
|--------|-------------|
| Points Earned | This week/month/all-time |
| Recognition Given | Count and recipients |
| Recognition Received | Count and senders |
| Events Attended | Participation rate |
| Streak | Current and longest |

---

## 8. Integration Points

### 8.1 Slack

| Event | Slack Action |
|-------|--------------|
| Recognition received | DM to recipient |
| Survey available | Channel post |
| Badge earned | DM to recipient |
| Event reminder | Channel post |

### 8.2 Microsoft Teams

| Event | Teams Action |
|-------|--------------|
| Recognition received | Adaptive card DM |
| Survey available | Channel message |
| Event reminder | Calendar invite |

### 8.3 Google Calendar

| Event | Calendar Action |
|-------|-----------------|
| Event RSVP | Create calendar event |
| Event update | Update calendar event |
| Event cancel | Remove calendar event |

---

## 9. Security Features

### 9.1 Role-Based Access Control

| Role | Capabilities |
|------|--------------|
| admin | Full access, user management, analytics |
| hr | Survey management, analytics, moderation |
| manager | Team analytics, recognition approval |
| user | Standard features, own data |

### 9.2 Data Protection

| Data Type | Protection |
|-----------|------------|
| Survey responses | Anonymous, no user link |
| Recognition | Public by default, private option |
| Points/Badges | Public leaderboard, private history |
| Messages | Visible to channel members only |

---

## 10. Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| recognition.enabled | true | Master toggle |
| recognition.points | true | Points with recognition |
| recognition.moderation | hybrid | Moderation mode |
| surveys.enabled | true | Survey feature |
| surveys.anonymous | true | Force anonymity |
| surveys.min_threshold | 5 | Min responses for results |
| store.enabled | true | Point store |
| store.stripe | true | Real-money purchases (keys set) |
| gamification.badges | true | Badge system |
| gamification.leaderboard | true | Public leaderboard |
| gamification.streaks | true | Streak tracking |
| gamification.teams | true | Team competitions |
| channels.enabled | true | Team channels |
| channels.private | true | Private channels |
| events.recurring | true | Recurring events |
| events.templates | true | Event templates |
| ai.suggestions | true | AI recommendations |
| ai.sentiment | true | Sentiment analysis |

---

## 11. Activity Types (Live)

| Type | Icon | Color | Templates |
|------|------|-------|-----------|
| Icebreaker | 🎭 | Blue | Two Truths, Show & Tell |
| Creative | 🎨 | Purple | Caption Contest, Pictionary |
| Competitive | 🏆 | Amber | Trivia, Scavenger Hunt |
| Wellness | 🧘 | Green | Desk Yoga, Meditation |
| Learning | 📚 | Cyan | Training, Workshops |
| Social | 🎉 | Pink | Coffee Chat, Happy Hour |

---

## 12. Badge Rarities (Configured)

| Rarity | Color | Points Multiplier | Badges |
|--------|-------|-------------------|--------|
| Common | Gray | 1x | First Steps, Team Player |
| Uncommon | Green | 1.5x | Dedicated, Feedback Hero |
| Rare | Blue | 2x | Activity Master, Champion |
| Epic | Purple | 3x | Streak Master, Facilitator |
| Legendary | Gold | 5x | Early Adopter |

---

*Document Version: 2.0*
*Last Updated: 2025-11-28*
*Status: Active Development*