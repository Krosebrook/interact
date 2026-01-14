# Dynamic Gamification Rule Engine Documentation

## Overview
The rule engine allows admins to define complex gamification logic using AND/OR conditions. Rules can award points, badges, and trigger events based on user interactions.

## Core Concepts

### What is a Rule?
A rule = Conditions + Logic + Actions

```
IF (user attends event AND gives recognition)
THEN award 100 points + badge
```

### Condition
A single assertion about user behavior:
- Entity: Which object type to check (Event, Recognition, UserPoints)
- Field: Which property to evaluate
- Operator: How to evaluate (equals, contains, gt, lt, etc)
- Value: What to compare against

**Example:** `Event.event_type equals "training"`

### Logic
How to combine multiple conditions:
- **AND**: All conditions must be true
- **OR**: At least one condition must be true

### Action
What happens when rule triggers:
- Award points (fixed amount)
- Award badge (by ID)
- Send notification
- Trigger custom event

## Rule Builder Interface
**Page:** `pages/GamificationRuleBuilder.js`

**Features:**
- Create new rules with visual editor
- Edit existing rules
- Activate/deactivate rules
- Delete rules
- View execution history
- See rule stats (times triggered, cooldown remaining)

## Creating Rules

### Step 1: Basic Info
- **Rule Name**: Human-readable, e.g., "3-Day Streak + Recognition"
- **Description**: What the rule does and why
- **Rule Type**: Points | Badge | Event | Notification

### Step 2: Define Conditions
Add conditions one at a time:

```
Entity: Recognition
Field: status
Operator: equals
Value: approved
```

**Supported Operators:**
- `equals` - Exact match
- `contains` - String contains substring
- `gt` / `gte` - Greater than / greater or equal
- `lt` / `lte` - Less than / less or equal
- `in` - Value in array
- `exists` - Field has non-null value

### Step 3: Set Logic
Choose AND or OR to combine conditions

```
Condition A: User total_points >= 500
Condition B: User last_activity_date >= 7 days ago

Logic: AND (both must be true)
```

### Step 4: Define Actions
Choose what happens:

**Points Action:**
```
Award points: 100
```

**Badge Action:**
```
Award badge: "badge_streak_master"
```

### Step 5: Optional Settings
- **Cooldown (hours)**: Min time before same user can trigger again
- **Max per month**: Cap how many times per user per month

## Example Rules

### Rule 1: Recognition Streak
**Objective:** Reward consistent recognition
```
Rule Name: Recognition Master
Conditions:
  - Recognition.status = approved AND
  - User gave >= 5 recognitions this month

Actions:
  - Award 150 points
  - Award badge: "recognition_master"

Cooldown: 168 hours (1 week)
Max/Month: 1
```

### Rule 2: Team Event Attendee
**Objective:** Encourage event participation
```
Rule Name: Team Player
Conditions:
  - Event.event_type = team_building OR
  - Event.attendance_status = attended

Actions:
  - Award 75 points

Cooldown: 24 hours
```

### Rule 3: Complete Profile + Login Streak
**Objective:** New user engagement
```
Rule Name: New User Welcome
Conditions:
  - UserProfile.bio != null AND
  - UserProfile.avatar_url exists AND
  - User consecutive_logins >= 3

Actions:
  - Award 200 points
  - Award badge: "welcome_to_interact"

Cooldown: 0 (one-time per user via month limit)
Max/Month: 1
```

### Rule 4: Wellness Challenge
**Objective:** Encourage wellness participation
```
Rule Name: Wellness Warrior
Conditions:
  - Event.event_type = wellness OR
  - Activity.category = wellness

Actions:
  - Award 100 points
  - Send notification: "Great job taking care of yourself!"

Max/Month: 4
```

## Rule Execution Engine

**Function:** `functions/executeGamificationRules.js`

### How It Works
1. **Trigger**: When user action occurs (event attendance, recognition, etc)
2. **Fetch Rules**: Get all active rules from database
3. **Evaluate Conditions**: For each rule, check all conditions
4. **Apply Logic**: Use AND/OR to determine if rule should fire
5. **Check Cooldown**: Verify user isn't on cooldown
6. **Execute Actions**: Award points/badges
7. **Track Execution**: Log in RuleExecution entity

### Flow Diagram
```
[User Action]
    ↓
[Get All Active Rules]
    ↓
[For Each Rule:]
    ├─ Evaluate Conditions
    ├─ Apply AND/OR Logic
    ├─ Check Cooldown
    ├─ Check Monthly Limit
    └─ IF all pass:
       ├─ Execute Actions
       ├─ Award Points
       ├─ Award Badge
       └─ Log Execution
    ↓
[Return Executed Rules]
```

## Execution History

**Entity:** `RuleExecution`

Tracks every rule firing:
```
{
  "rule_id": "rule_123",
  "rule_name": "Recognition Master",
  "user_email": "john@company.com",
  "executed_date": "2026-01-14T10:00:00Z",
  "actions_executed": {
    "points_awarded": 150,
    "badge_awarded": "recognition_master"
  },
  "conditions_met": [
    "Recognition.status = approved",
    "User gave 5+ recognitions"
  ],
  "success": true
}
```

**Useful for:**
- Debugging why rules fired
- Auditing gamification behavior
- Analytics on rule effectiveness
- User dispute resolution

## Advanced Patterns

### Pattern 1: Milestone with Cooldown
Prevent spam by setting cooldown:
```
Award 500 points for hitting 1000 total points
Cooldown: 7 days (don't reward multiple times same week)
```

### Pattern 2: Seasonal Limits
Cap quarterly rewards:
```
Award 100 points for event attendance
Max/Month: 4 (don't exceed 400 points/month from events)
```

### Pattern 3: Tiered Recognition
Multiple rules for different levels:
```
Rule A: 1-2 recognitions = 25 points
Rule B: 3-5 recognitions = 75 points
Rule C: 6+ recognitions = 150 points + badge
```

### Pattern 4: Cross-Condition Logic
Complex multi-entity rules:
```
(User.tier = bronze OR silver) AND
(Event.duration > 1 hour) AND
(User.attendance_rate < 50%)
→ Award 200 bonus points to encourage participation
```

## Best Practices

1. **Keep Conditions Simple**
   - 2-3 conditions per rule maximum
   - Break complex logic into multiple rules
   - Use OR for flexibility, AND for strictness

2. **Set Appropriate Cooldowns**
   - Recognition: 24-48 hours
   - Event attendance: 0 (can attend multiple)
   - Badge awards: 7 days (prevent burnout)

3. **Monitor Rule Effectiveness**
   - Check execution count monthly
   - See which conditions are most triggered
   - Retire unused rules

4. **Balance Point Economy**
   - Most rules: 50-150 points
   - Milestone rules: 200-300 points
   - Badges: usually 0 points (standalone)

5. **Document Intent**
   - Name should be action-oriented
   - Description explains business reason
   - Easy for future admins to understand

## Testing Rules

### Dry Run
Before enabling, test with:
1. Create rule with `is_active: false`
2. Run sample user data through rule engine
3. Verify conditions evaluate correctly
4. Check cooldown logic
5. Activate when confident

### Monitoring
After activation:
1. Check execution count daily
2. Review successful vs failed executions
3. Adjust thresholds if needed
4. Gather user feedback

## Troubleshooting

### Rule Not Firing
- Verify `is_active: true`
- Check condition logic (all conditions met?)
- Verify entity fields exist in data
- Check cooldown not blocking

### Too Many Triggers
- Increase cooldown
- Add additional AND conditions
- Lower max_triggers_per_month
- Refine condition operators

### Points Not Awarded
- Check UserPoints record exists
- Verify action.award_points > 0
- Check rule actually executed (see RuleExecution)
- Verify user hasn't hit monthly cap

## Performance Considerations

- Rules evaluated per-user per-action
- Large rule sets may impact responsiveness
- Recommend < 20 active rules
- Archive/delete unused rules regularly
- Index on rule_id and user_email for fast lookups

## Future Enhancements
- [ ] Rule templates (common patterns pre-built)
- [ ] A/B testing different rule versions
- [ ] Machine learning rule optimization
- [ ] Scheduled rule triggers (not event-based)
- [ ] Custom rule actions (webhooks, 3rd party integrations)