# Entity Relationships & Data Model

## Core Entity Relationships

```
User (Built-in)
  │
  ├──→ UserProfile (1:1)
  │      └─ Stores: preferences, skills, privacy settings
  │
  ├──→ UserPoints (1:1)
  │      ├─ Aggregates: total_points, tier, streak
  │      └─ References: team_id
  │
  ├──→ PointsLedger (1:many)
  │      └─ Transaction log: all point changes
  │
  ├──→ BadgeAward (many:many via join table)
  │      ├─ References: badge_id
  │      └─ One badge per user (enforced)
  │
  ├──→ LearningPathProgress (1:many)
  │      ├─ References: learning_path_id
  │      └─ Tracks: progress_percentage, status
  │
  ├──→ ModuleCompletion (1:many)
  │      ├─ References: module_id, learning_path_id
  │      └─ Tracks: quiz_score, time_spent
  │
  ├──→ Participation (1:many)
  │      ├─ References: event_id
  │      └─ Tracks: RSVP, attendance, feedback
  │
  ├──→ Recognition (as sender/recipient)
  │      ├─ sender_email → User
  │      └─ recipient_email → User
  │
  ├──→ TeamMembership (many:many with Team)
  │      ├─ References: team_id
  │      └─ Stores: role (member/moderator/leader)
  │
  ├──→ UserOnboarding (1:1 for new hires)
  │      ├─ Tracks: 30-day progress
  │      └─ References: assigned_buddy, manager_email
  │
  └──→ BuddyMatch (as user or buddy)
         ├─ user_email → User
         └─ buddy_email → User

Badge
  │
  └──→ BadgeAward (1:many)
         └─ Links: Badge to Users

LearningPath
  │
  ├──→ LearningModule (1:many)
  │      ├─ Ordered: by module.order
  │      └─ Contains: quiz_questions array
  │
  ├──→ LearningPathProgress (1:many)
  │      └─ One per enrolled user
  │
  └──→ ModuleCompletion (1:many)
         └─ One per user per module

Activity (Template)
  │
  └──→ Event (1:many)
         ├─ Instance of activity
         └──→ Participation (1:many)
                └─ One per attendee

Event
  │
  ├──→ Participation (1:many)
  │
  ├─ May belong to EventSeries
  │
  └─ May reference: google_calendar_id

Team
  │
  ├──→ TeamMembership (1:many)
  │      └─ Links: Users to Team
  │
  ├──→ Channel (1:many, optional)
  │      └─ Team-specific channels
  │
  └──→ TeamChallenge (1:many)
         └─ Challenges for this team

GamificationRule
  │
  └──→ RuleExecution (1:many)
         ├─ Logs: when rule fired
         └─ References: user_email, event_id

Notification
  │
  └─ References: user_email
  └─ Contains: link (deep link to entity)

AuditLog
  │
  └─ References: actor_email, target_email, entity_id
```

---

## Relationship Types

### One-to-One (1:1)
```
User ←→ UserProfile
User ←→ UserPoints
User ←→ UserOnboarding (for new hires)
```

### One-to-Many (1:many)
```
User → PointsLedger (user has many transactions)
User → LearningPathProgress (user enrolled in many paths)
User → Participation (user attends many events)
Badge → BadgeAward (badge awarded to many users)
LearningPath → LearningModule (path has many modules)
Activity → Event (activity used for many events)
Team → TeamMembership (team has many members)
```

### Many-to-Many (many:many)
```
User ←→ Badge (via BadgeAward join table)
User ←→ Team (via TeamMembership join table)
User ←→ LearningPath (via LearningPathProgress)
User ←→ Event (via Participation)
```

### Self-Referential
```
User ←→ User (via BuddyMatch)
  - user_email ← mentor/mentee → buddy_email
```

---

## Foreign Key Constraints

### Enforced by Entity Schema

**UserProfile**:
- `user_email` → User.email (required)

**UserPoints**:
- `user_email` → User.email (required)
- `team_id` → Team.id (optional)

**PointsLedger**:
- `user_email` → User.email (required)
- `reference_id` → Entity.id (polymorphic, optional)

**BadgeAward**:
- `user_email` → User.email (required)
- `badge_id` → Badge.id (required)
- Unique constraint: (user_email, badge_id)

**LearningPathProgress**:
- `user_email` → User.email (required)
- `learning_path_id` → LearningPath.id (required)
- Unique constraint: (user_email, learning_path_id)

**ModuleCompletion**:
- `user_email` → User.email (required)
- `module_id` → LearningModule.id (required)
- `learning_path_id` → LearningPath.id (required)
- Unique constraint: (user_email, module_id)

**LearningModule**:
- `learning_path_id` → LearningPath.id (required)
- `prerequisites` → [LearningModule.id] (array)

**Event**:
- `activity_id` → Activity.id (required)
- `facilitator_email` → User.email (optional)
- `series_id` → EventSeries.id (optional)

**Participation**:
- `event_id` → Event.id (required)
- `user_email` → User.email (required)
- Unique constraint: (event_id, user_email)

**Recognition**:
- `sender_email` → User.email (required)
- `recipient_email` → User.email (required)

**TeamMembership**:
- `team_id` → Team.id (required)
- `user_email` → User.email (required)
- Unique constraint: (team_id, user_email)

**BuddyMatch**:
- `user_email` → User.email (required)
- `buddy_email` → User.email (required)
- Unique constraint: (user_email, buddy_email)

**UserOnboarding**:
- `user_email` → User.email (required)
- `assigned_buddy` → User.email (optional)
- `manager_email` → User.email (optional)

---

## Cascade Behaviors

### On User Deletion
```
User deleted →
  ├─ UserProfile: CASCADE DELETE
  ├─ UserPoints: CASCADE DELETE
  ├─ PointsLedger: KEEP (audit trail) or CASCADE DELETE
  ├─ BadgeAward: CASCADE DELETE
  ├─ LearningPathProgress: CASCADE DELETE
  ├─ ModuleCompletion: CASCADE DELETE
  ├─ Participation: CASCADE DELETE
  ├─ Recognition: KEEP (show [Deleted User]) or CASCADE DELETE
  ├─ TeamMembership: CASCADE DELETE
  ├─ BuddyMatch: CASCADE DELETE
  └─ UserOnboarding: CASCADE DELETE
```

**Recommendation**: For audit compliance, KEEP with [Deleted User] placeholder for Recognition, AuditLog, PointsLedger.

### On Badge Deletion
```
Badge deleted →
  └─ BadgeAward: SET NULL badge_id or CASCADE DELETE
```

**Recommendation**: CASCADE DELETE (badge awards lose meaning without badge definition)

### On LearningPath Deletion
```
LearningPath deleted →
  ├─ LearningModule: CASCADE DELETE
  ├─ LearningPathProgress: CASCADE DELETE or SET learning_path_id = NULL
  └─ ModuleCompletion: CASCADE DELETE
```

**Recommendation**: SOFT DELETE (mark as archived) to preserve user progress history

### On Team Deletion
```
Team deleted →
  ├─ TeamMembership: CASCADE DELETE
  ├─ TeamChallenge: CASCADE DELETE or SET team_id = NULL
  └─ UserPoints.team_id: SET NULL
```

### On Event Deletion
```
Event deleted →
  └─ Participation: CASCADE DELETE or mark event as cancelled
```

**Recommendation**: SOFT DELETE (status = 'cancelled') to preserve attendance history

---

## Indexes for Performance

### Composite Indexes (Multi-column)

**High-priority**:
```sql
UserPoints: (user_email, total_points DESC)
PointsLedger: (user_email, created_date DESC)
BadgeAward: (user_email, awarded_date DESC)
LearningPathProgress: (user_email, status, created_date DESC)
ModuleCompletion: (user_email, learning_path_id, status)
Participation: (user_email, event_id)
Participation: (event_id, attendance_status)
Recognition: (recipient_email, created_date DESC)
Recognition: (status, visibility, created_date DESC)
TeamMembership: (team_id, user_email)
Event: (scheduled_date, status)
```

### Single-column Indexes

**Frequently filtered**:
```sql
User: email (unique, primary)
UserPoints: tier
UserPoints: team_id
Badge: category, rarity
LearningPath: is_template, difficulty_level
Event: status, facilitator_email
Recognition: status, visibility
```

---

## Data Integrity Rules

### Validation Constraints

**UserPoints**:
- `total_points` >= 0
- `current_streak` >= 0
- `tier` ∈ {bronze, silver, gold, platinum}

**PointsLedger**:
- `amount` can be negative (for penalties)
- `balance_after` must match UserPoints.total_points after transaction

**BadgeAward**:
- Unique (user_email, badge_id) - one badge per user
- `awarded_date` <= NOW()

**LearningPathProgress**:
- `progress_percentage` ∈ [0, 100]
- `status` = 'completed' → progress_percentage = 100
- `completed_date` must be after `started_date`

**ModuleCompletion**:
- `quiz_score` ∈ [0, 100] or NULL
- `quiz_score` >= passing_score → status = 'completed'
- `status` = 'completed' → `completed_date` required

**Participation**:
- Unique (event_id, user_email) - one participation per user per event
- `check_in_time` must be within event timeframe
- `attendance_status` = 'attended' → `check_in_time` required

**Recognition**:
- `sender_email` != `recipient_email` (can't recognize yourself)
- `points_awarded` >= 0
- `status` = 'approved' required for visibility

**Event**:
- `scheduled_date` must be in future (at creation)
- `max_participants` >= current participant count
- `status` = 'completed' → `scheduled_date` in past

**Team**:
- `member_count` must match actual TeamMembership count

---

## Polymorphic Relationships

### PointsLedger.reference_type/reference_id
```
reference_type = "Event" → reference_id = Event.id
reference_type = "Badge" → reference_id = Badge.id
reference_type = "Challenge" → reference_id = PersonalChallenge.id
reference_type = "Module" → reference_id = LearningModule.id
reference_type = null → manual adjustment
```

**Query Pattern**:
```javascript
// Get all point transactions for a specific event
const transactions = await base44.entities.PointsLedger.filter({
  reference_type: 'Event',
  reference_id: eventId
});
```

---

## Denormalized Fields (Performance)

### Counter Caches

**Badge.times_awarded**:
- Updated: On BadgeAward creation
- Avoids: COUNT query on BadgeAward

**Team.member_count**:
- Updated: On TeamMembership create/delete
- Avoids: COUNT query on TeamMembership

**Channel.member_count**:
- Updated: On user join/leave
- Avoids: COUNT query

**Recognition.comments_count**:
- Updated: On comment creation (if comments implemented)
- Avoids: COUNT query

**UserPoints aggregates**:
- `total_points`: SUM of PointsLedger.amount
- `points_this_month`: SUM where created_date this month
- `lifetime_points`: Total ever earned (even if redeemed)

### Calculated on Read

**LearningPathProgress.progress_percentage**:
```javascript
progress = (milestones_completed.length / total_milestones) * 50 +
           (modules_completed / total_modules) * 50
```

**UserPoints.tier**:
```javascript
tier = total_points < 500 ? 'bronze' :
       total_points < 1500 ? 'silver' :
       total_points < 3000 ? 'gold' : 'platinum'
```

---

## Transaction Patterns

### Award Points with Badge
```javascript
// Atomic operation (all or nothing)
await base44.asServiceRole.withTransaction(async (tx) => {
  // 1. Create badge award
  await tx.entities.BadgeAward.create({
    user_email,
    badge_id,
    awarded_by: 'system'
  });
  
  // 2. Award points
  const badge = await tx.entities.Badge.get(badge_id);
  await tx.functions.invoke('recordPointsTransaction', {
    user_email,
    amount: badge.points_value,
    transaction_type: 'badge_earned',
    reference_type: 'Badge',
    reference_id: badge_id
  });
  
  // 3. Create notification
  await tx.entities.Notification.create({
    user_email,
    type: 'badge_earned',
    title: `You earned: ${badge.badge_name}!`,
    message: badge.description
  });
});
```

### Complete Learning Module
```javascript
await base44.asServiceRole.withTransaction(async (tx) => {
  // 1. Update module completion
  await tx.entities.ModuleCompletion.update(completionId, {
    status: 'completed',
    completed_date: new Date().toISOString(),
    quiz_score: score,
    points_earned: module.points_reward
  });
  
  // 2. Award points
  await tx.functions.invoke('recordPointsTransaction', {
    user_email,
    amount: module.points_reward,
    transaction_type: 'module_completed',
    reference_type: 'Module',
    reference_id: module.id
  });
  
  // 3. Update learning path progress
  const completions = await tx.entities.ModuleCompletion.filter({
    user_email,
    learning_path_id: module.learning_path_id,
    status: 'completed'
  });
  
  const progress = (completions.length / totalModules) * 100;
  await tx.entities.LearningPathProgress.update(progressId, {
    progress_percentage: progress,
    last_activity_date: new Date().toISOString()
  });
});
```

---

## Query Optimization Examples

### Efficient: Leaderboard Query
```javascript
// Top 10 users by points
const leaderboard = await base44.entities.UserPoints.list(
  '-total_points',  // Sort descending
  10                // Limit
);
```

### Efficient: User's Active Learning Paths
```javascript
const activePaths = await base44.entities.LearningPathProgress.filter({
  user_email: user.email,
  status: 'in_progress'
}, '-last_activity_date');
```

### Efficient: Upcoming Events for User
```javascript
const upcomingEvents = await base44.entities.Event.filter({
  status: 'scheduled',
  scheduled_date: { $gte: new Date().toISOString() }
}, 'scheduled_date', 20);
```

### Inefficient (avoid):
```javascript
// Don't fetch all then filter in JS
const allEvents = await base44.entities.Event.list();
const upcoming = allEvents.filter(e => 
  e.status === 'scheduled' && 
  new Date(e.scheduled_date) > new Date()
);
```

---

## Migration Considerations

### Adding New Entity
1. Create JSON schema in /entities
2. Define permissions in schema
3. Create sample data (optional)
4. Update relevant components
5. Add to documentation

### Adding Field to Existing Entity
1. Update JSON schema
2. Provide default value for existing records
3. Update UI components that display this field
4. Update backend functions if needed
5. Consider migration script for complex defaults

### Renaming Field
1. Add new field with data migration
2. Deprecate old field (mark as optional)
3. Update all code references
4. Remove old field after deploy + validation

---

## Data Retention Policies

### Keep Forever
- User (anonymize email after deletion request)
- PointsLedger (audit trail)
- AuditLog (compliance)

### Keep for 2 Years
- Participation (historical analytics)
- Recognition (company culture archive)
- ModuleCompletion (learning analytics)

### Keep for 90 Days
- Notification (after read)
- Session logs

### Delete Immediately
- Temporary tokens
- Password reset codes
- Email verification codes

---

## Backup & Recovery

### Automated Backups
- Frequency: Daily (3 AM UTC)
- Retention: 30 days rolling
- Storage: Base44 managed

### Point-in-Time Recovery
- Granularity: 5 minutes
- Window: Last 7 days
- Request via: Base44 support ticket

### Export Capabilities
```javascript
// Admin function to export all user data
const userData = {
  profile: await base44.entities.UserProfile.filter({ user_email }),
  points: await base44.entities.UserPoints.filter({ user_email }),
  ledger: await base44.entities.PointsLedger.filter({ user_email }),
  badges: await base44.entities.BadgeAward.filter({ user_email }),
  learning: await base44.entities.LearningPathProgress.filter({ user_email })
};

return Response.json(userData);
```

---

## Summary

This comprehensive entity relationship documentation provides:
- Complete data model overview
- Foreign key relationships
- Cascade behaviors
- Index strategies
- Data integrity rules
- Transaction patterns
- Query optimization
- Migration guidelines
- Retention policies

Use this as a reference for:
- Database design decisions
- Query optimization
- Feature development
- Data migration planning
- Troubleshooting data issues