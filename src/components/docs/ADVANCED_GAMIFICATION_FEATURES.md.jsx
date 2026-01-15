# Advanced Gamification Features Documentation

## Overview
The gamification engine now supports three advanced capabilities:
1. **Custom User Challenges** - Users create personal goals
2. **Tiered Reward System** - Rewards unlock at higher tiers
3. **Team-Specific Rules** - Custom gamification logic per team

---

## 1. Custom User Challenges

### Feature Description
Users can create their own challenges with custom goals, timelines, and personal rewards.

### PersonalChallenge Entity
```json
{
  "challenge_name": "Master Networker",
  "description": "Connect with 10 new teammates",
  "created_by": "user@company.com",
  "challenge_type": "recognition|events|points|learning|wellness|custom",
  "target_metric": {
    "metric_type": "recognitions_given",
    "target_value": 10,
    "current_value": 3
  },
  "start_date": "2026-01-15",
  "end_date": "2026-02-15",
  "status": "active|completed|failed|abandoned",
  "self_reward": "Treat myself to coffee",
  "is_public": true,
  "participants": ["user2@company.com"],
  "difficulty": "easy|medium|hard|extreme"
}
```

### Challenge Types
| Type | Metric Tracked | Example Target |
|------|----------------|----------------|
| **Points** | total_points | Earn 500 points |
| **Events** | events_attended | Attend 5 events |
| **Recognition** | recognitions_given | Give 10 shoutouts |
| **Learning** | custom_count | Complete 3 courses |
| **Wellness** | custom_count | 7-day meditation streak |
| **Custom** | custom_count | Any user-defined goal |

### User Workflow
1. Click "Create Challenge" in Gamification Dashboard
2. Fill out CustomChallengeCreator form:
   - Challenge name and description
   - Type (points, events, recognition, etc)
   - Target value (e.g., 500 points)
   - Difficulty (easy → extreme)
   - Personal reward (optional)
   - Public/private visibility
3. Click "Create Challenge"
4. Challenge appears in MyCustomChallenges
5. Progress updates automatically
6. Complete or abandon as needed

### Public Challenges
- If `is_public: true`, other users can see and join
- Participants tracked in `participants` array
- Social pressure + accountability
- Team-wide visibility

### Progress Tracking
- **Automatic:** System tracks events_attended, recognitions_given, total_points
- **Manual:** For custom metrics, user updates current_value
- **Visual:** Progress bar shows completion percentage
- **Status:** Active → Completed (when target met) or Failed (deadline passed)

### Self-Rewards
Users set personal incentives:
- "Treat myself to coffee ☕"
- "Take Friday afternoon off"
- "Buy that book I've wanted"
- Motivational + fun

---

## 2. Tiered Reward System

### Tier Structure
```
Bronze:   0 - 499 lifetime points
Silver:   500 - 1,499 lifetime points
Gold:     1,500 - 2,999 lifetime points
Platinum: 3,000 - 4,999 lifetime points
Diamond:  5,000+ lifetime points
```

### StoreItem Tier Requirements
```json
{
  "item_name": "Executive Desk Plant",
  "points_cost": 800,
  "tier_requirement": "platinum",
  "points_threshold": 3000
}
```

**Logic:**
- Item ONLY visible if user tier ≥ required tier
- Alternative: `points_threshold` (min lifetime points)
- Locked items show 🔒 and "Unlocks at X points"

### Visual Hierarchy
**TieredRewardsDisplay Component:**

```
┌─────────────────────────────────────┐
│ 🥉 Bronze Tier          ✓ Unlocked │
├─────────────────────────────────────┤
│ [Item 1] [Item 2] [Item 3]          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🥈 Silver Tier          ✓ Unlocked │
├─────────────────────────────────────┤
│ [Item 4] [Item 5] [Item 6]          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🥇 Gold Tier    🔒 Unlocks at 1,500│
├─────────────────────────────────────┤
│ [Locked] [Locked] [Locked]          │
└─────────────────────────────────────┘
```

### Progression Incentive
- Shows locked high-tier rewards
- "500 points to unlock Gold tier"
- Motivates continued engagement
- Creates aspiration + exclusivity

### Admin Configuration
When creating store items:
1. Set tier_requirement dropdown
2. OR set points_threshold (custom minimum)
3. Items auto-hide for users below tier

---

## 3. Team-Specific Gamification Rules

### Feature Description
Admins can create rules that apply ONLY to specific teams, enabling team-based point bonuses and custom logic.

### GamificationRule Scope
```json
{
  "rule_name": "Engineering Event Bonus",
  "scope": "team",
  "team_id": "team_engineering_123",
  "conditions": [
    {"entity": "Event", "field": "team_id", "operator": "equals", "value": "team_engineering_123"},
    {"entity": "Participation", "field": "attendance_status", "operator": "equals", "value": "attended"}
  ],
  "logic": "AND",
  "actions": {
    "award_points": 75
  }
}
```

**Scope Types:**
- `global` - Applies to all users
- `team` - Applies only to team members

### Use Cases

**Case 1: Team Event Attendance Bonus**
```
Rule: "Marketing Team Event Boost"
Conditions:
  - Event.team_id = marketing_team
  - Participation.attendance_status = attended
Actions:
  - Award 50 bonus points (on top of base event points)
  
Result: Marketing team members get 50 extra points for attending team events
```

**Case 2: Internal Recognition Multiplier**
```
Rule: "Engineering Peer Recognition"
Conditions:
  - Recognition.sender_email in engineering_team
  - Recognition.recipient_email in engineering_team
  - Recognition.status = approved
Actions:
  - Award 25 bonus points

Result: Engineering members get 25 extra points for recognizing teammates
```

**Case 3: Team Challenge Completion**
```
Rule: "Sales Team Challenge Winner"
Conditions:
  - TeamChallenge.team_id = sales_team
  - TeamChallenge.status = completed
Actions:
  - Award 200 points
  - Award badge: "sales_champion"

Result: Sales team members get badge + points for team challenges
```

### Admin Interface
**Component:** `TeamGamificationRules`

**Features:**
- Team selector dropdown
- View team-specific rules
- Quick rule templates:
  - Team Event Bonus
  - Internal Recognition Multiplier
  - Challenge Completion Reward
- Create custom team rules
- Enable/disable per team
- Track execution count per team

### Team Leaderboard Integration
- Team-specific rules counted in team analytics
- Team points = sum of all member points (including bonuses)
- Leaderboard shows teams with most active rules
- Engagement scoring factors in team rule participation

### Rule Template Library
```javascript
const TEAM_RULE_TEMPLATES = [
  {
    name: "Team Event Bonus",
    description: "Award +50 points for team events",
    conditions: [
      { entity: 'Event', field: 'team_id', operator: 'equals' },
      { entity: 'Participation', field: 'attendance_status', operator: 'equals', value: 'attended' }
    ],
    actions: { award_points: 50 }
  },
  {
    name: "Internal Recognition Multiplier",
    description: "2x points for team-internal recognition",
    conditions: [
      { entity: 'Recognition', field: 'status', operator: 'equals', value: 'approved' }
    ],
    actions: { award_points: 40 }
  },
  {
    name: "Team Learning Goal",
    description: "Bonus for completing learning modules",
    conditions: [
      { entity: 'ModuleCompletion', field: 'completed', operator: 'equals', value: true }
    ],
    actions: { award_points: 100 }
  }
];
```

---

## Integration Architecture

### Custom Challenges + Rule Engine
```
User creates custom challenge
    ↓
PersonalChallenge entity created
    ↓
[Optional] Create tracking rule
    ↓
Rule monitors user actions
    ↓
Updates challenge.current_value
    ↓
When target_value reached → Status: completed
    ↓
User celebrates + claims self-reward
```

### Tiered Rewards + User Progression
```
User earns points
    ↓
UserPoints.lifetime_points increases
    ↓
Check tier thresholds (500, 1500, 3000, 5000)
    ↓
Tier upgraded (bronze → silver → gold → platinum → diamond)
    ↓
New tier rewards unlocked
    ↓
User receives notification
    ↓
Store refreshes with new items visible
```

### Team Rules + Team Analytics
```
Admin creates team rule
    ↓
GamificationRule (scope: team, team_id: X)
    ↓
Team member triggers condition
    ↓
Rule engine validates team membership
    ↓
Awards bonus points
    ↓
Updates team total points
    ↓
Team leaderboard recalculates
    ↓
Team rank updated
```

---

## Database Schema Updates

### StoreItem (Updated)
**New Fields:**
- `tier_requirement` - Min tier to unlock
- `points_threshold` - Alternative to tier (raw points)

### GamificationRule (Updated)
**New Fields:**
- `scope` - "global" or "team"
- `team_id` - Team reference if scope = team

### PersonalChallenge (New)
**Purpose:** User-created challenges
**Key Fields:** challenge_type, target_metric, status, is_public

---

## Admin Configuration

### Enable Custom Challenges
```
Settings → Gamification → Custom Challenges

[✓] Allow users to create challenges
[✓] Require admin approval for public challenges
[✓] Max active challenges per user: 5
[✓] Default challenge duration: 30 days
```

### Configure Tier Thresholds
```
Settings → Gamification → Tier System

Bronze:   0 points (default)
Silver:   [500] points
Gold:     [1500] points
Platinum: [3000] points
Diamond:  [5000] points

[Save Tier Configuration]
```

### Manage Team Rules
```
Gamification Admin → Team Rules Tab

1. Select team from dropdown
2. View existing team rules
3. Create new team rule or use template
4. Set conditions, actions, cooldowns
5. Activate rule
6. Monitor execution in analytics
```

---

## User Experience

### Creating a Custom Challenge
```
User: "I want to attend more events this month"
    ↓
Goes to Gamification Dashboard
    ↓
Clicks "Create Challenge"
    ↓
Fills form:
  Name: "Event Master February"
  Type: Events
  Target: 8 events
  Difficulty: Hard
  Reward: "Movie night 🍿"
  Public: Yes
    ↓
Challenge appears in active list
    ↓
Progress bar shows 2/8 completed
    ↓
Teammates see and join challenge
    ↓
User completes → Status: Completed
    ↓
Treats themselves to movie night 🎉
```

### Unlocking Tier Rewards
```
User: Currently Silver (750 lifetime points)
    ↓
Sees Gold tier rewards (locked 🔒)
    ↓
"Unlocks at 1,500 lifetime points"
    ↓
"750 points to go!"
    ↓
User grinds events + recognition
    ↓
Hits 1,500 points
    ↓
Notification: "🎉 Gold Tier Unlocked!"
    ↓
Store refreshes → Gold items now visible
    ↓
User redeems premium reward
```

### Team Rule Benefits
```
Engineering team has rule:
"Award +75 points for code review events"
    ↓
Team member attends code review session
    ↓
Base points: 10 (standard event)
Bonus points: 75 (team rule)
Total: 85 points
    ↓
Team leaderboard updates
    ↓
Engineering team moves up 2 ranks
```

---

## Analytics & Reporting

### Track Custom Challenges
- Total challenges created
- Completion rate
- Most popular challenge types
- Average difficulty chosen
- Public vs private ratio

### Monitor Tier Progression
- Users per tier (bronze, silver, gold, etc)
- Average time to tier upgrade
- Tier dropout rate (users stuck at tier)
- Most desired tier-locked rewards

### Team Rule Effectiveness
- Execution count per team
- Points awarded via team rules
- Team engagement correlation
- Most effective team rules

---

## Future Enhancements
- [ ] Challenge templates (pre-built goals)
- [ ] Team vs team custom challenges
- [ ] Dynamic tier thresholds (adjust per org)
- [ ] Seasonal tier bonuses (2x progress in Q4)
- [ ] Challenge sharing to social feed
- [ ] Leaderboard for custom challenge completions