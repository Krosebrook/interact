# ENTITY DEEP-DIVE AUDIT

**Date:** 2025-12-19  
**Scope:** All 45+ entity schemas - data structure, PII classification, security compliance  
**Methodology:** Line-by-line schema review, relationship mapping, PII tagging

---

## ENTITY CLASSIFICATION MATRIX

### TIER 1: USER & IDENTITY (CRITICAL PII)

#### User (Built-in - DO NOT MODIFY)
**PII Level:** 🔴 CRITICAL  
**Fields:** email, full_name, role, created_date  
**Security Rule:** Admin-only list, self/admin read  
**Issues:** None (managed by Base44)

#### UserProfile
**PII Level:** 🔴 CRITICAL  
**Schema Review:**
- ✅ Well-structured preferences system
- ✅ Privacy controls comprehensive
- ⚠️ **ISSUE:** `date_of_birth` needed for milestones (ADDED)
- ⚠️ **ISSUE:** `opt_out_milestones` needed (ADDED)

**PII Fields:**
- 🔴 **HR-Only:** `years_at_company`, `engagement_stats`, `previous_event_attendance`, `skill_levels`, `achievements`
- 🟡 **Conditional:** `location` (if show_location=true), `department` (if show_department=true)
- ✅ **Public:** `display_name`, `bio`, `avatar_url`, `job_title`

**Relationships:**
- Links to: User (via user_email)
- Referenced by: Multiple systems for preferences

**Security Recommendation:**
```javascript
// Base44 Rule Required
{
  "read": {
    "allow": ["self", "admin", "hr"],
    "filter_pii": {
      "non_hr_fields": ["years_at_company", "engagement_stats", "previous_event_attendance"]
    }
  }
}
```

#### UserPoints
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Comprehensive gamification tracking
- ✅ History tracking with source attribution
- ⚠️ **ISSUE:** `points_history` could grow unbounded
- 💡 **RECOMMENDATION:** Archive history >90 days to PointsLedger

**PII Fields:**
- 🟡 **Sensitive:** `engagement_score`, `participation_rate`, `rank`
- ✅ **Public:** `total_points`, `level`, `streak_days`

**Privacy Consideration:**
- Leaderboards must respect `privacy_settings.show_points`
- Rank should be hidden if user opts out

**Security Rule:**
```javascript
{
  "read": {
    "allow": ["self", "admin"],
    "public_fields": ["total_points", "level", "streak_days"]
  }
}
```

---

### TIER 2: EVENT MANAGEMENT

#### Event
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ **EXCELLENT:** Comprehensive event fields
- ✅ Event format (online/offline/hybrid) well-defined
- ✅ Recurrence patterns properly structured
- ✅ Type-specific fields clean architecture
- ⚠️ **ISSUE:** `facilitator_email` is PII

**PII Fields:**
- 🟡 **PII:** `facilitator_email`, `facilitator_name`
- 🔴 **SENSITIVE:** `magic_link` (must never be exposed to unauthorized users)

**Relationships:**
- Links to: Activity (via activity_id), EventSeries (via series_id)
- Referenced by: Participation, EventMedia, Poll, Announcement

**Security Rule:**
```javascript
{
  "create": { "allow": ["facilitator", "admin"] },
  "update": { 
    "allow": ["owner", "admin"],
    "owner_field": "facilitator_email"
  },
  "delete": { "allow": ["owner", "admin"] }
}
```

#### Participation
**PII Level:** 🔴 CRITICAL  
**Schema Review:**
- ✅ Tracks engagement comprehensively
- ⚠️ **SECURITY ISSUE:** `engagement_score` and `feedback` are highly sensitive
- ⚠️ **ISSUE:** Individual participation should not be listable by other participants

**PII Fields:**
- 🔴 **HR-Only:** `engagement_score`, `feedback`, `skill_self_rating`, `skills_gained`
- 🟡 **Event Owner:** `attended`, `rsvp_status`
- ✅ **Aggregate Only:** Count stats acceptable

**Security Rule (CRITICAL):**
```javascript
{
  "create": { "allow": ["authenticated"] },
  "read": { 
    "allow": ["self", "event_owner", "admin"],
    "aggregate_only_for_non_owners": true
  },
  "list": {
    "allow": ["event_owner", "admin"],
    "filter": { "participant_email": "current_user_email" } // Users only see own
  }
}
```

**🔴 CRITICAL FIX NEEDED:**
Frontend code currently lists ALL participations for an event. This must be changed to only show aggregated stats to non-owners.

---

### TIER 3: GAMIFICATION

#### Badge
**PII Level:** ✅ PUBLIC  
**Schema Review:**
- ✅ **EXCELLENT:** Progressive badge tiers with parent_badge_id
- ✅ Award criteria well-structured
- ✅ Limited quantity support
- ✅ Seasonal badge support (valid_from/until)
- 📋 **RECOMMENDATION:** Add `celebration_template` for award notifications

**No PII** - Public entity

#### BadgeAward
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Tracks award provenance
- ⚠️ **ISSUE:** `user_name` duplicates User entity data
- ⚠️ **ISSUE:** `awarded_by_name` duplicates User entity data

**PII Fields:**
- 🟡 **User:** `user_email`, `user_name`
- 🟡 **Admin:** `awarded_by_email`, `awarded_by_name`

**Data Integrity Issue:**
Names are cached but could become stale if user updates profile.

**Recommendation:**
- Remove cached names, fetch from User entity on read
- OR: Add `user_display_name` sync mechanism

**Security Rule:**
```javascript
{
  "read": {
    "allow": ["self", "public_if_is_public"],
    "filter": {
      "is_public": true,
      "OR": { "user_email": "current_user" }
    }
  }
}
```

#### PointsLedger
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ **EXCELLENT:** Immutable audit trail
- ✅ Running balance tracking
- ✅ Transaction type enum comprehensive
- ✅ Reference tracking (type + id)

**Security Rule (IMMUTABLE):**
```javascript
{
  "create": { "allow": ["system", "admin"] },
  "update": { "allow": [] }, // Never allow updates
  "delete": { "allow": [] }, // Never allow deletes
  "read": { "allow": ["self", "admin"] }
}
```

#### PersonalChallenge
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ AI personalization support
- ✅ Progress tracking
- ⚠️ **ISSUE:** `personalization_context` could contain sensitive data

**Security Rule:**
```javascript
{
  "read": { "allow": ["self", "admin"] },
  "create": { "allow": ["self", "system"] }
}
```

---

### TIER 4: SOCIAL & COMMUNICATION

#### Recognition
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ **EXCELLENT:** Moderation workflow (pending → approved)
- ✅ AI flagging with confidence scores
- ✅ Visibility controls (public/team_only/private)
- ⚠️ **SECURITY ISSUE:** Default status should be 'pending' (FIXED in recent audit)

**PII Fields:**
- 🟡 **User Data:** `sender_email`, `recipient_email`, `sender_name`, `recipient_name`
- 🟢 **Content:** `message` (user-generated, moderate for appropriateness)

**Visibility Logic:**
- `public`: Show to all authenticated users
- `team_only`: Show only to users in same department/team
- `private`: Show only to sender, recipient, and admins

**Security Rule (CRITICAL):**
```javascript
{
  "create": {
    "allow": ["authenticated"],
    "auto_set": { "status": "pending" } // MUST default to pending
  },
  "read": {
    "allow": ["authenticated"],
    "filter": {
      "status": "approved",
      "visibility_check": "apply_visibility_rules"
    }
  },
  "update": {
    "allow": ["owner_for_message", "admin_for_status"],
    "owner_can_update": ["message", "visibility"],
    "admin_can_update": ["status", "is_featured", "moderation_notes"]
  }
}
```

**🔴 CURRENT ISSUE:**
Recognition entity schema shows `default: 'approved'` for status. This was identified and should be fixed to `default: 'pending'`.

#### Channel
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Visibility controls
- ✅ Admin management
- ⚠️ **MISSING:** `allowed_departments` field (recommended in audit)
- ⚠️ **MISSING:** `allowed_roles` field

**PII Fields:**
- 🟡 **Owners:** `owner_email`, `admin_emails`, `member_emails`

**Security Gaps:**
- No department-based filtering
- Private channels accessible by email list only (not department)

**Recommendation - Add Fields:**
```json
{
  "allowed_departments": {
    "type": "array",
    "items": { "type": "string" },
    "description": "Departments with access"
  },
  "allowed_roles": {
    "type": "array",
    "items": { "type": "string" },
    "description": "Roles with access"
  }
}
```

#### ChannelMessage
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Threading support (reply_to_id)
- ✅ Reactions and edits tracked
- ✅ Attachment support

**PII Fields:**
- 🟡 **User:** `sender_email`, `sender_name`
- 🟢 **Content:** `content` (user-generated)

**Security Rule:**
```javascript
{
  "read": {
    "allow": ["channel_members"],
    "require": "user is member of channel_id"
  },
  "create": {
    "allow": ["channel_members"]
  }
}
```

#### TeamMessage
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Simple message system
- ✅ Message types differentiated
- ⚠️ **ISSUE:** Duplicate of ChannelMessage functionality

**Recommendation:** Consider deprecating TeamMessage in favor of team-specific Channels

---

### TIER 5: SURVEYS & FEEDBACK

#### Survey (NEW)
**PII Level:** ✅ PUBLIC (metadata only)  
**Schema Review:**
- ✅ **EXCELLENT:** Comprehensive survey configuration
- ✅ Anonymization threshold enforced
- ✅ Recurrence support
- ✅ Target audience filtering
- ✅ Notification settings

**No Direct PII** - Public metadata

**Security Rule:**
```javascript
{
  "create": { "allow": ["admin"] },
  "read": {
    "allow": ["authenticated"],
    "filter": { "status": "active" } // Only show active surveys to participants
  },
  "update": { "allow": ["admin", "creator"] }
}
```

#### SurveyResponse (NEW)
**PII Level:** 🔴 CRITICAL (ANONYMIZED)  
**Schema Review:**
- ✅ **EXCELLENT:** Email hashing for anonymous surveys
- ✅ Demographic metadata separate from responses
- ✅ Completion tracking

**PII Fields:**
- 🔴 **HIGHLY SENSITIVE:** `respondent_email` (hashed if anonymous)
- 🔴 **SENSITIVE:** `responses` array (individual answers)
- 🟡 **METADATA:** `metadata.department`, `metadata.role` (aggregation only)

**CRITICAL Security Rule:**
```javascript
{
  "create": { "allow": ["authenticated"] },
  "read": { "allow": [] }, // NEVER allow individual read
  "list": { "allow": [] }, // NEVER allow list
  "aggregate": { 
    "allow": ["admin"],
    "require": "response_count >= survey.anonymization_threshold"
  }
}
```

**🔴 ENFORCEMENT:**
Backend function `aggregateSurveyResults.js` created to enforce. Frontend MUST NOT directly query SurveyResponse entity.

---

### TIER 6: TEAMS & COLLABORATION

#### Team
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Comprehensive team management
- ✅ Member roles within teams
- ✅ Join request workflow
- ⚠️ **ISSUE:** `member_roles` contains PII (email + join dates)

**PII Fields:**
- 🟡 **Team Data:** `team_leader_email`, `member_roles[].email`
- 🔴 **SENSITIVE:** `pending_requests[].email`

**Privacy Consideration:**
Team members can see other members (expected for collaboration).

**Security Rule:**
```javascript
{
  "read": {
    "allow": ["members", "admin"],
    "public_fields": ["team_name", "description", "member_count"]
  },
  "update": {
    "allow": ["leader", "admin"]
  }
}
```

#### TeamMembership
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Granular role permissions
- ✅ Points contribution tracking
- ⚠️ **REDUNDANCY:** Duplicates Team.member_roles

**Data Model Issue:**
`Team.member_roles` and `TeamMembership` serve same purpose. Consider consolidating.

**Recommendation:** Use TeamMembership as single source of truth, remove member_roles from Team.

#### TeamChallenge
**PII Level:** ✅ LOW  
**Schema Review:**
- ✅ Comprehensive challenge types
- ✅ Dynamic scoring system
- ✅ Winner tracking

**No Direct PII** - Team aggregates only

---

### TIER 7: ANALYTICS & INSIGHTS

#### AnalyticsSnapshot
**PII Level:** 🔴 CRITICAL  
**Schema Review:**
- ✅ Aggregated metrics (good)
- ⚠️ **PII ISSUE:** `facilitator_metrics` contains `facilitator_email` and performance data

**PII Fields:**
- 🔴 **HR-Only:** `facilitator_metrics[].facilitator_email` + performance scores
- 🔴 **TEAM DATA:** `team_metrics` (sensitive if small teams <5 people)

**Security Rule (HR-ONLY):**
```javascript
{
  "read": { "allow": ["admin", "hr"] },
  "create": { "allow": ["system"] }
}
```

**🔴 CRITICAL:**
This entity contains employee performance metrics. MUST be HR-restricted at database level.

#### LeaderboardSnapshot
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Periodic snapshots for historical trends
- ✅ Multi-category support
- ⚠️ **ISSUE:** `rankings[].user_email` is PII

**Privacy Consideration:**
Users who opt out of leaderboards (`privacy_settings.show_on_leaderboard: false`) should not appear in snapshots.

**Recommendation:**
Filter users with `show_on_leaderboard: false` before creating snapshot.

#### SkillTracking
**PII Level:** 🔴 CRITICAL  
**Schema Review:**
- ✅ Comprehensive skill growth tracking
- ✅ Mentorship linking
- ✅ Verification system
- ⚠️ **PII:** `growth_history` contains event IDs (could be used to track individual activity)

**PII Fields:**
- 🔴 **SENSITIVE:** `proficiency_score`, `growth_history`, `events_contributed`
- 🔴 **HR-ONLY:** All skill data (employee development data)
- 🟡 **Mentorship:** `mentor_email`, `mentee_emails`

**Security Rule (HR-ONLY):**
```javascript
{
  "read": { "allow": ["self", "admin", "hr"] },
  "update": { "allow": ["self", "facilitator", "admin"] }
}
```

---

### TIER 8: REWARDS & STORE

#### StoreItem
**PII Level:** ✅ PUBLIC  
**Schema Review:**
- ✅ Dual currency (points + Stripe)
- ✅ Rarity system
- ✅ Power-up effects configuration
- ✅ Seasonal items (valid_from/until)

**No PII** - Public catalog

#### UserInventory
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Tracks item ownership
- ✅ Equipment slots
- ✅ Acquisition tracking
- ⚠️ **ISSUE:** Cached fields (item_name, item_category) could become stale

**PII Fields:**
- 🟡 **User:** `user_email`
- 🟡 **Transaction:** `transaction_id` (links to financial data if Stripe)

**Security Rule:**
```javascript
{
  "read": { "allow": ["self", "admin"] },
  "create": { "allow": ["system"] } // Only via purchase flow
}
```

#### Reward
**PII Level:** ✅ PUBLIC  
**Schema Review:**
- ✅ Similar to StoreItem (consider merging?)

**Recommendation:** Evaluate if Reward and StoreItem should be consolidated.

#### RewardRedemption
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Redemption workflow (pending → fulfilled)
- ✅ Admin fulfillment notes
- ⚠️ **ISSUE:** `user_name` cached (stale data risk)

**PII Fields:**
- 🟡 **User:** `user_email`, `user_name`
- 🟡 **Notes:** `redemption_notes` (may contain personal info)

**Security Rule:**
```javascript
{
  "create": { "allow": ["authenticated"] },
  "read": { "allow": ["self", "admin"] },
  "update": { "allow": ["admin"] } // Only admin can fulfill
}
```

---

### TIER 9: MILESTONES & CELEBRATIONS

#### Milestone (NEW)
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Comprehensive milestone types
- ✅ Opt-out support
- ✅ Reaction and comment system
- ✅ Visibility controls

**PII Fields:**
- 🟡 **User:** `user_email`
- 🟡 **Reactions:** `reactions[].user_email`
- 🟡 **Comments:** `comments[].user_email`, `comments[].user_name`

**Privacy:**
- Respects `opt_out` flag
- Visibility controls (public/team_only/private)

**Security Rule:**
```javascript
{
  "create": { "allow": ["system"] }, // Only scheduled job
  "read": {
    "allow": ["authenticated"],
    "filter": {
      "visibility": "apply_visibility_rules",
      "opt_out": false
    }
  },
  "update": {
    "allow": ["admin"], // Only admin can update reactions/comments via mutations
    "fields": ["reactions", "comments", "celebration_status"]
  }
}
```

---

### TIER 10: MISCELLANEOUS ENTITIES

#### Poll
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ⚠️ **ISSUE:** `responses` uses email as key (exposes who voted for what)

**Security Gap:**
Poll responses should be anonymous or aggregated only.

**Recommendation:**
```json
{
  "responses": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "user_email": { "type": "string" },
        "selected_option": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" }
      }
    }
  },
  "show_individual_votes": {
    "type": "boolean",
    "default": false,
    "description": "Whether to show who voted for what (privacy)"
  }
}
```

#### Notification
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Type-based notifications
- ✅ Action URL for deep linking
- ✅ Read status tracking

**PII Fields:**
- 🟡 **User:** `user_email`
- ✅ **Content:** Notification text (not sensitive)

**Security Rule:**
```javascript
{
  "read": { "allow": ["self", "admin"] },
  "create": { "allow": ["system", "admin"] }
}
```

#### EventMedia
**PII Level:** 🟡 MEDIUM  
**Schema Review:**
- ✅ Photo/video upload tracking
- ✅ Like system
- ⚠️ **ISSUE:** `likes[]` contains user emails

**PII Fields:**
- 🟡 **Uploader:** `uploaded_by_email`, `uploaded_by_name`
- 🟡 **Engagement:** `likes[]` (user emails)

**Privacy Consideration:**
Event media should only be visible to event participants (or public if event is public).

**Security Rule:**
```javascript
{
  "read": {
    "allow": ["event_participants", "admin"],
    "require": "user attended event_id OR event is public"
  }
}
```

---

## PII CLASSIFICATION SUMMARY

### 🔴 CRITICAL PII (HR-Only Access)
**Entities:**
- UserProfile (engagement_stats, years_at_company, previous_event_attendance)
- Participation (engagement_score, feedback, skill_self_rating)
- AnalyticsSnapshot (facilitator_metrics with performance data)
- SkillTracking (all fields - employee development data)
- SurveyResponse (individual responses - NEVER expose)

**Security Requirement:** Database-level restrictions + backend validation

### 🟡 MEDIUM PII (User-Scoped)
**Entities:**
- UserPoints (own only)
- PointsLedger (own only)
- PersonalChallenge (own only)
- BadgeAward (own only, unless is_public=true)
- UserInventory (own only)
- RewardRedemption (own only)
- Notification (own only)

**Security Requirement:** User-scoped queries enforced

### ✅ LOW PII (Aggregates/Public)
**Entities:**
- Activity (public templates)
- Badge (public definitions)
- Reward/StoreItem (public catalog)
- GamificationConfig (public settings)
- Team (public metadata, members see member list)

**Security Requirement:** Public read access OK

---

## RELATIONSHIP INTEGRITY AUDIT

### Primary Relationships
```
User (email) 
  ↓
  ├─ UserProfile (user_email)
  ├─ UserPoints (user_email)
  ├─ PointsLedger (user_email)
  ├─ BadgeAward (user_email)
  ├─ PersonalChallenge (user_email)
  ├─ SkillTracking (user_email)
  ├─ Milestone (user_email)
  └─ SurveyResponse (respondent_email - hashed if anonymous)

Activity (id)
  ↓
  └─ Event (activity_id)
      ↓
      ├─ Participation (event_id)
      ├─ EventMedia (event_id)
      ├─ Poll (event_id)
      └─ Announcement (event_id)

Team (id)
  ↓
  ├─ TeamMembership (team_id)
  ├─ TeamMessage (team_id)
  └─ TeamChallenge (participating_teams[].team_id)

Badge (id)
  ↓
  └─ BadgeAward (badge_id)

Channel (id)
  ↓
  └─ ChannelMessage (channel_id)
```

### Orphan Risk Analysis
- ✅ All entities have proper parent references
- ⚠️ **CASCADING DELETES NOT DEFINED**

**Recommendation:**
Document cascade behavior for entity deletions:
- Deleting Event → Archive Participation, EventMedia (don't delete for history)
- Deleting Team → Archive TeamMembership (don't delete)
- Deleting User → **NEVER DELETE** (soft delete via status=suspended)

---

## DATA INTEGRITY ISSUES

### 1. Cached Names Create Staleness
**Affected Entities:**
- BadgeAward (`user_name`, `awarded_by_name`)
- RewardRedemption (`user_name`)
- TeamMessage (`sender_name`)
- ChannelMessage (`sender_name`)
- Recognition (`sender_name`, `recipient_name`)

**Issue:** If user updates full_name, cached names don't update.

**Solutions:**
A. **Remove cached names** - Fetch from User entity on read (slower but accurate)
B. **Sync mechanism** - Update all cached names when User updates (complex)
C. **Accept staleness** - Document as known limitation (simplest)

**Recommendation:** Option A for new entities, Option C with documentation for existing.

### 2. Unbounded Array Growth
**Affected Entities:**
- UserPoints (`points_history`) - Could grow to thousands of entries
- UserProfile (`previous_event_attendance`) - Could grow unbounded
- SkillTracking (`growth_history`) - Could grow unbounded

**Impact:** Query performance degradation, storage bloat

**Solution:**
- Limit array size (e.g., last 50 items only)
- Archive older items to separate entities (PointsLedger already exists for this)

**Recommendation:**
```javascript
// In code that updates these arrays:
const MAX_HISTORY_ITEMS = 50;
const updatedHistory = [...existingHistory, newItem].slice(-MAX_HISTORY_ITEMS);
```

### 3. Team.member_roles vs TeamMembership Redundancy
**Issue:** Same data stored in two places

**Recommendation:** Use TeamMembership as single source of truth, remove member_roles from Team.

---

## CONSISTENCY AUDIT

### ✅ NAMING CONVENTIONS
- **Consistent** email field naming: `user_email`, `sender_email`, `recipient_email`
- **Consistent** ID references: `event_id`, `activity_id`, `team_id`, `badge_id`
- **Consistent** enum casing: lowercase with underscores

### ✅ TYPE DEFINITIONS
- **Consistent** date formats: `date-time` for timestamps, `date` for dates
- **Consistent** boolean defaults: Explicitly set in schema
- **Consistent** array defaults: Empty arrays `[]` where appropriate

### ⚠️ INCONSISTENCIES FOUND

1. **Date Field Naming:**
   - Some use `created_date` (built-in)
   - Some use `awarded_date`, `joined_date`, `completed_date`
   - **Recommendation:** Standardize on `{action}_date`

2. **Status Enum Values:**
   - Event: draft, scheduled, in_progress, completed, cancelled
   - Recognition: pending, approved, flagged, rejected
   - TeamChallenge: draft, active, completed, cancelled
   - **Inconsistent:** Mix of workflow statuses
   - **Recommendation:** Standardize status enums across similar entities

3. **Points Field Naming:**
   - UserPoints: `total_points`, `available_points`, `lifetime_points`
   - Team: `total_points`
   - PointsLedger: `amount`
   - **Recommendation:** Use `points` suffix consistently

---

## MISSING ENTITIES (Identified from Code)

### 1. EventSeries
**Referenced in:** Event entity (`series_id`)  
**Status:** Not found in entities/  
**Action:** Verify if intentionally removed or needs creation

### 2. UserRole, UserRoleAssignment
**Referenced in:** RBAC documentation  
**Status:** May not be needed if using User.role field  
**Action:** Clarify RBAC implementation

### 3. AIInsight
**Referenced in:** Analytics components  
**Status:** Not found  
**Action:** Create if AI insights feature is implemented

---

## SECURITY RULE IMPLEMENTATION PRIORITY

### 🔴 P0: CRITICAL (BEFORE LAUNCH)
1. **SurveyResponse** - Aggregate-only access
2. **Participation** - Event owner + self only
3. **AnalyticsSnapshot** - HR-only
4. **SkillTracking** - Self + HR only
5. **User** - Admin-only list (Base44 built-in)

### 🟡 P1: HIGH (LAUNCH WEEK)
6. **Recognition** - Moderation enforcement
7. **Channel** - Member-only access
8. **TeamMessage** - Team member-only
9. **ChannelMessage** - Channel member-only
10. **EventMedia** - Event participant-only

### 📋 P2: MEDIUM (POST-LAUNCH)
11. **Notification** - Self-only
12. **UserInventory** - Self-only
13. **RewardRedemption** - Self + admin
14. **BadgeAward** - Respect is_public flag
15. **LeaderboardSnapshot** - Respect opt-out

---

## SCHEMA ENHANCEMENT RECOMMENDATIONS

### High Priority
1. **Add to Channel:**
   ```json
   {
     "allowed_departments": ["array of strings"],
     "allowed_roles": ["array of strings"]
   }
   ```

2. **Fix Recognition default status:**
   ```json
   {
     "status": {
       "default": "pending"  // NOT "approved"
     }
   }
   ```

3. **Add to Poll:**
   ```json
   {
     "anonymous_voting": {
       "type": "boolean",
       "default": true
     }
   }
   ```

### Medium Priority
4. **Add array size limits to:**
   - UserPoints.points_history (max 50)
   - UserProfile.previous_event_attendance (max 100)
   - SkillTracking.growth_history (max 50)

5. **Add to UserProfile:**
   - Already added: `date_of_birth`, `opt_out_milestones`

6. **Add to Event:**
   ```json
   {
     "requires_admin_approval": {
       "type": "boolean",
       "default": false
     }
   }
   ```

---

## GDPR COMPLIANCE CHECK

### Right to Access
- ✅ User can access own data via profile pages
- 🟡 **MISSING:** Data export function for all user entities
- **Action:** Create `exportUserData` function (already exists - verify scope)

### Right to Deletion
- ⚠️ **ISSUE:** No soft-delete mechanism for User
- **Recommendation:** Add `User.status = 'deleted'` (if Base44 allows User entity modification)
- **Action:** Document data retention policy

### Right to Rectification
- ✅ Users can update own profiles
- ✅ Users can update own preferences

### Data Minimization
- ✅ Only collecting necessary data
- ⚠️ **ISSUE:** Some cached names create redundancy

### Purpose Limitation
- ✅ Survey anonymization enforces limitation
- ✅ HR data access restricted

---

## FINAL ENTITY SCORECARD

| Entity | Schema Quality | PII Handling | Security Rules | Relationship Integrity | Grade |
|--------|----------------|--------------|----------------|------------------------|-------|
| User | ✅ N/A (Base44) | 🔴 Critical | ✅ Built-in | ✅ Root | A |
| UserProfile | ✅ Excellent | 🔴 Critical | ⚠️ Needs config | ✅ Clean | B+ |
| Event | ✅ Excellent | 🟡 Medium | ⚠️ Needs config | ✅ Clean | A- |
| Participation | ✅ Good | 🔴 Critical | 🔴 Missing | ✅ Clean | C+ |
| Recognition | ✅ Excellent | 🟡 Medium | ⚠️ Needs fix | ✅ Clean | B |
| Survey | ✅ Excellent | ✅ None | ✅ Documented | ✅ Clean | A |
| SurveyResponse | ✅ Excellent | 🔴 Critical | ✅ Enforced | ✅ Clean | A |
| Milestone | ✅ Excellent | 🟡 Medium | ✅ Documented | ✅ Clean | A- |
| Badge | ✅ Excellent | ✅ None | ✅ Public | ✅ Clean | A |
| UserPoints | ✅ Good | 🟡 Medium | ⚠️ Needs config | ⚠️ Unbounded arrays | B |
| Team | ✅ Good | 🟡 Medium | ⚠️ Needs config | ⚠️ Redundancy | B- |
| Channel | ✅ Good | 🟡 Medium | 🔴 Missing dept filter | ✅ Clean | B- |
| AnalyticsSnapshot | ✅ Excellent | 🔴 Critical | 🔴 HR-only not enforced | ✅ Clean | C+ |
| SkillTracking | ✅ Excellent | 🔴 Critical | 🔴 Not enforced | ✅ Clean | C+ |

**Overall Entity Architecture:** B+ (Excellent with critical security gaps)

---

## CRITICAL ACTIONS REQUIRED

### Before Launch (Blocking):
1. 🔴 Configure Base44 entity security rules (all entities above)
2. 🔴 Fix Recognition.status default to 'pending'
3. 🔴 Fix Participation access control (event owner + self only)
4. 🔴 Enforce AnalyticsSnapshot HR-only access
5. 🔴 Enforce SkillTracking privacy

### High Priority:
6. Add Channel department filtering
7. Implement Poll vote anonymization
8. Document cascade delete behavior
9. Implement array size limits
10. Resolve Team/TeamMembership redundancy

---

**End of Entity Deep-Dive Audit**