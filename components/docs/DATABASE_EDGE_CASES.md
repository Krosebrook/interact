# DATABASE EDGE CASES & ERROR HANDLING
## INTeract Employee Engagement Platform
### Comprehensive Edge Case Analysis for All 73 Entities

**Last Updated:** 2025-12-29  
**Version:** 1.0.0

---

## TABLE OF CONTENTS

1. [User Management Edge Cases](#user-management-edge-cases)
2. [Event Management Edge Cases](#event-management-edge-cases)
3. [Gamification Edge Cases](#gamification-edge-cases)
4. [Recognition & Social Edge Cases](#recognition--social-edge-cases)
5. [Survey & Feedback Edge Cases](#survey--feedback-edge-cases)
6. [Data Integrity & Constraints](#data-integrity--constraints)
7. [Concurrency & Race Conditions](#concurrency--race-conditions)
8. [GDPR & Privacy Edge Cases](#gdpr--privacy-edge-cases)
9. [Integration Edge Cases](#integration-edge-cases)
10. [Performance & Scale Edge Cases](#performance--scale-edge-cases)

---

## USER MANAGEMENT EDGE CASES

### 1. User Account Lifecycle

#### User Deletion/Deactivation
**Scenario:** User is deleted or deactivated while having active data across the system.

**Impact Entities:**
- Recognition (sender/recipient)
- Event (facilitator)
- Participation
- TeamMembership
- PointsLedger
- BadgeAward
- UserPoints
- UserProfile
- UserOnboarding
- LearningPathProgress
- Notification
- All entities with `created_by` field

**Edge Cases:**
```
1. User deleted with pending recognitions
   - Keep recognition visible but mark sender as "Former Employee"
   - Recipient still receives points/badges
   
2. User deleted while facilitating active event
   - Event status unchanged
   - Display facilitator as "Former Employee"
   - Allow event to complete normally
   
3. User deleted with unredeemed points
   - Archive points in PointsLedger with status "forfeited"
   - No refund mechanism
   
4. User deleted with ongoing learning path
   - Mark progress as "archived"
   - Do not transfer progress
   
5. User deleted with team leadership role
   - Require explicit reassignment before deletion
   - Or auto-promote longest-tenured moderator
   
6. User deleted with pending survey responses
   - Responses remain anonymous
   - Aggregated data unchanged
```

**Handling Strategy:**
```javascript
// Before user deletion
async function handleUserDeletion(userEmail) {
  // 1. Check for active leadership roles
  const leaderships = await base44.entities.Team.filter({
    leader_email: userEmail
  });
  
  if (leaderships.length > 0) {
    throw new Error('User has active team leadership roles. Reassign before deletion.');
  }
  
  // 2. Check for scheduled events as facilitator
  const upcomingEvents = await base44.entities.Event.filter({
    facilitator_email: userEmail,
    status: { $in: ['scheduled', 'in_progress'] },
    scheduled_date: { $gte: new Date().toISOString() }
  });
  
  if (upcomingEvents.length > 0) {
    throw new Error('User has upcoming events. Reassign facilitator before deletion.');
  }
  
  // 3. Soft delete: Update status instead of hard delete
  await base44.entities.UserProfile.update(userProfileId, {
    status: 'suspended',
    deletion_requested_at: new Date().toISOString()
  });
  
  // 4. Log audit trail
  await base44.entities.AuditLog.create({
    action: 'user_suspended',
    actor_email: adminEmail,
    target_email: userEmail,
    severity: 'high'
  });
}
```

#### Duplicate User Creation
**Scenario:** Same email invited multiple times or user tries to register twice.

**Edge Cases:**
```
1. Email already exists
   - Check User entity first
   - Return error with clear message
   
2. Multiple pending invitations for same email
   - Cancel older invitations
   - Only keep most recent
   
3. User accepts invitation after account already exists
   - Merge invitation data with existing account
   - Update role if invitation role is higher
```

**Handling:**
```javascript
// Before creating invitation
async function createUserInvitation(email, role) {
  // Check if user already exists
  const existingUser = await base44.entities.User.filter({ email });
  if (existingUser.length > 0) {
    throw new Error('User already exists with this email');
  }
  
  // Cancel pending invitations
  const pendingInvitations = await base44.entities.UserInvitation.filter({
    email,
    status: 'pending'
  });
  
  for (const inv of pendingInvitations) {
    await base44.entities.UserInvitation.update(inv.id, {
      status: 'revoked'
    });
  }
  
  // Create new invitation
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  
  return await base44.entities.UserInvitation.create({
    email,
    invited_by: currentUser.email,
    role,
    token,
    expires_at: expiresAt.toISOString()
  });
}
```

#### Role Changes Mid-Session
**Scenario:** User's role changed while actively using the app.

**Edge Cases:**
```
1. Admin demoted to user while viewing admin dashboard
   - Session continues until next action
   - Next action returns 403 Forbidden
   - Force logout and redirect to login
   
2. User promoted to admin/facilitator
   - New permissions take effect on next token refresh
   - Show notification of role change
   - Offer tour of new features
   
3. Multiple role changes in quick succession
   - Only apply most recent role change
   - Audit log tracks all changes
```

**Handling:**
```javascript
// Middleware to check role on each request
async function checkUserRole(userEmail, requiredRole) {
  const user = await base44.auth.me();
  
  if (user.role !== requiredRole && user.user_type !== requiredRole) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
  }
  
  return user;
}
```

---

## EVENT MANAGEMENT EDGE CASES

### 2. Event Scheduling & Conflicts

#### Double Booking
**Scenario:** User tries to RSVP to overlapping events.

**Edge Cases:**
```
1. Two events same time, user accepts both
   - Allow soft conflict (show warning)
   - User decides priority
   - Track actual attendance separately
   
2. User facilitating multiple events simultaneously
   - Hard block: Prevent scheduling
   - Suggest alternative facilitator
   
3. Recurring event conflicts with one-time event
   - Show conflict warning
   - Allow override with confirmation
```

**Prevention:**
```javascript
async function checkEventConflicts(userEmail, newEventDate, duration) {
  const eventStart = new Date(newEventDate);
  const eventEnd = new Date(eventStart.getTime() + duration * 60000);
  
  const conflicts = await base44.entities.Participation.filter({
    user_email: userEmail,
    rsvp_status: 'yes'
  });
  
  for (const participation of conflicts) {
    const event = await base44.entities.Event.filter({ id: participation.event_id });
    const existingStart = new Date(event[0].scheduled_date);
    const existingEnd = new Date(existingStart.getTime() + event[0].duration_minutes * 60000);
    
    // Check overlap
    if (eventStart < existingEnd && eventEnd > existingStart) {
      return {
        hasConflict: true,
        conflictingEvent: event[0]
      };
    }
  }
  
  return { hasConflict: false };
}
```

#### Event Cancellation Cascade
**Scenario:** Event cancelled with active participants, recordings, media, etc.

**Edge Cases:**
```
1. Cancel event with 100+ participants
   - Send notifications in batches (max 50/batch)
   - Update all Participation records to 'cancelled'
   - Refund points if attendance already marked
   
2. Cancel recurring event series
   - Cancel only this instance OR entire series?
   - Clear UI prompt required
   - Update recurring_series_id for affected events
   
3. Cancel event with uploaded media/recordings
   - Keep media accessible for historical purposes
   - Mark event as cancelled but preserve content
   
4. Cancel event after it already started
   - Mark as 'cancelled' but preserve check-ins
   - Award partial points to attendees
```

**Cancellation Handler:**
```javascript
async function cancelEvent(eventId, reason, cancelSeries = false) {
  const event = await base44.entities.Event.filter({ id: eventId });
  
  if (!event.length) {
    throw new Error('Event not found');
  }
  
  // If recurring and cancelSeries = true
  if (cancelSeries && event[0].recurring_series_id) {
    const seriesEvents = await base44.entities.Event.filter({
      recurring_series_id: event[0].recurring_series_id,
      status: { $in: ['scheduled', 'draft'] }
    });
    
    for (const e of seriesEvents) {
      await cancelSingleEvent(e.id, reason);
    }
  } else {
    await cancelSingleEvent(eventId, reason);
  }
}

async function cancelSingleEvent(eventId, reason) {
  // Update event status
  await base44.entities.Event.update(eventId, {
    status: 'cancelled',
    reschedule_reason: reason
  });
  
  // Get participants
  const participants = await base44.entities.Participation.filter({
    event_id: eventId,
    rsvp_status: 'yes'
  });
  
  // Update participations
  for (const p of participants) {
    await base44.entities.Participation.update(p.id, {
      attendance_status: 'cancelled'
    });
    
    // Send notification
    await base44.entities.Notification.create({
      user_email: p.user_email,
      type: 'event_reminder',
      title: 'Event Cancelled',
      message: `The event has been cancelled. Reason: ${reason}`,
      priority: 'high'
    });
  }
  
  // Audit log
  await base44.entities.AuditLog.create({
    action: 'event_deleted',
    entity_type: 'Event',
    entity_id: eventId,
    metadata: { reason }
  });
}
```

#### Rescheduling with Participants
**Scenario:** Event rescheduled, but some participants can't make new time.

**Edge Cases:**
```
1. Reschedule with 50+ confirmed participants
   - Reset all RSVPs to 'pending'
   - Require re-confirmation
   - Track original vs new attendance
   
2. Reschedule multiple times
   - Store reschedule_history array
   - Show reschedule count to users
   - Flag excessive rescheduling to admin
   
3. Reschedule to conflicting time
   - Check facilitator availability
   - Check participant conflicts (warn only)
   
4. Reschedule past the event date
   - Prevent if status is 'completed'
   - Allow if status is 'scheduled'
```

**Reschedule Handler:**
```javascript
async function rescheduleEvent(eventId, newDate, reason) {
  const event = await base44.entities.Event.filter({ id: eventId });
  
  if (!event.length) {
    throw new Error('Event not found');
  }
  
  if (event[0].status === 'completed') {
    throw new Error('Cannot reschedule completed event');
  }
  
  // Store reschedule history
  const history = event[0].reschedule_history || [];
  history.push({
    old_date: event[0].scheduled_date,
    new_date: newDate,
    reason,
    rescheduled_at: new Date().toISOString()
  });
  
  // Update event
  await base44.entities.Event.update(eventId, {
    original_date: event[0].original_date || event[0].scheduled_date,
    scheduled_date: newDate,
    reschedule_reason: reason,
    reschedule_history: history,
    status: 'rescheduled'
  });
  
  // Reset RSVPs to pending
  const participants = await base44.entities.Participation.filter({
    event_id: eventId
  });
  
  for (const p of participants) {
    await base44.entities.Participation.update(p.id, {
      rsvp_status: 'pending'
    });
    
    // Notify
    await base44.entities.Notification.create({
      user_email: p.user_email,
      type: 'event_reminder',
      title: 'Event Rescheduled',
      message: `Event rescheduled to ${new Date(newDate).toLocaleDateString()}. Please confirm attendance.`,
      link: `/events/${eventId}`,
      priority: 'high'
    });
  }
}
```

### 3. Participation Edge Cases

#### Late Check-ins
**Scenario:** User checks in after event ended.

**Edge Cases:**
```
1. Check-in 1 hour after event end
   - Allow with warning
   - Award full points
   
2. Check-in 1 day after event
   - Allow with admin approval
   - Award partial points (50%)
   
3. Check-in for cancelled event
   - Block with error message
   
4. Multiple check-ins for same event
   - Only record first check-in
   - Ignore subsequent attempts
```

#### RSVP Changes Near Event Time
**Scenario:** User changes RSVP within 1 hour of event start.

**Edge Cases:**
```
1. Change 'yes' to 'no' 30 minutes before
   - Allow but mark as 'late_cancellation'
   - May affect future event invitations
   
2. Change 'no' to 'yes' when event is full
   - Add to waitlist
   - Notify if spot opens
   
3. Change RSVP for event in progress
   - Block changes once event started
   - Exception: Allow check-in from 'pending'
```

**RSVP Validation:**
```javascript
async function updateRSVP(participationId, newStatus) {
  const participation = await base44.entities.Participation.filter({ id: participationId });
  const event = await base44.entities.Event.filter({ id: participation[0].event_id });
  
  const eventStart = new Date(event[0].scheduled_date);
  const now = new Date();
  const hoursUntilEvent = (eventStart - now) / (1000 * 60 * 60);
  
  // Event already started
  if (hoursUntilEvent < 0 && event[0].status === 'in_progress') {
    if (newStatus === 'yes' && participation[0].rsvp_status === 'pending') {
      // Allow late check-in
      return await base44.entities.Participation.update(participationId, {
        rsvp_status: 'yes',
        check_in_time: now.toISOString()
      });
    } else {
      throw new Error('Cannot change RSVP for event in progress');
    }
  }
  
  // Late cancellation (within 1 hour)
  if (hoursUntilEvent < 1 && newStatus === 'no' && participation[0].rsvp_status === 'yes') {
    await base44.entities.Participation.update(participationId, {
      rsvp_status: 'no',
      attendance_status: 'late_cancellation'
    });
    
    // Notify facilitator
    await base44.entities.Notification.create({
      user_email: event[0].facilitator_email,
      type: 'event_reminder',
      title: 'Late Cancellation',
      message: `Participant cancelled within 1 hour of event start`,
      priority: 'high'
    });
    
    return;
  }
  
  // Check capacity
  if (newStatus === 'yes') {
    const confirmedCount = await base44.entities.Participation.filter({
      event_id: event[0].id,
      rsvp_status: 'yes'
    }).length;
    
    if (event[0].max_participants && confirmedCount >= event[0].max_participants) {
      if (event[0].waitlist_enabled) {
        return await base44.entities.Participation.update(participationId, {
          rsvp_status: 'waitlist'
        });
      } else {
        throw new Error('Event is full');
      }
    }
  }
  
  // Normal update
  await base44.entities.Participation.update(participationId, {
    rsvp_status: newStatus
  });
}
```

---

## GAMIFICATION EDGE CASES

### 4. Points & Transactions

#### Negative Point Balance
**Scenario:** User redeems reward, then points are deducted retroactively.

**Edge Cases:**
```
1. Retroactive point deduction causes negative balance
   - Allow negative balance temporarily
   - Flag for admin review
   - Show banner to user about negative balance
   
2. User redeems 1000 points, but only has 950 after recalculation
   - Reverse redemption
   - Refund reward
   - Notify user of error
   
3. Concurrent redemptions exceed available points
   - Use database transactions
   - First redemption succeeds, second fails
```

**Transaction Handler:**
```javascript
async function redeemReward(userEmail, rewardId) {
  // Get current points
  const userPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
  const reward = await base44.entities.Reward.filter({ id: rewardId });
  
  if (!userPoints.length || !reward.length) {
    throw new Error('User or reward not found');
  }
  
  // Check sufficient balance
  if (userPoints[0].total_points < reward[0].points_cost) {
    throw new Error('Insufficient points');
  }
  
  // Check stock
  if (reward[0].stock_quantity !== -1 && reward[0].stock_quantity <= 0) {
    throw new Error('Reward out of stock');
  }
  
  // Create redemption record FIRST (optimistic locking)
  const redemption = await base44.entities.RewardRedemption.create({
    reward_id: rewardId,
    user_email: userEmail,
    points_spent: reward[0].points_cost,
    status: 'pending'
  });
  
  try {
    // Deduct points
    const newBalance = userPoints[0].total_points - reward[0].points_cost;
    await base44.entities.UserPoints.update(userPoints[0].id, {
      total_points: newBalance
    });
    
    // Record in ledger
    await base44.entities.PointsLedger.create({
      user_email: userEmail,
      amount: -reward[0].points_cost,
      transaction_type: 'reward_redemption',
      reference_type: 'Reward',
      reference_id: rewardId,
      description: `Redeemed: ${reward[0].reward_name}`,
      balance_after: newBalance
    });
    
    // Update stock
    if (reward[0].stock_quantity !== -1) {
      await base44.entities.Reward.update(rewardId, {
        stock_quantity: reward[0].stock_quantity - 1
      });
    }
    
    // Approve redemption
    await base44.entities.RewardRedemption.update(redemption.id, {
      status: 'approved'
    });
    
    return { success: true, redemptionId: redemption.id };
    
  } catch (error) {
    // Rollback: Cancel redemption
    await base44.entities.RewardRedemption.update(redemption.id, {
      status: 'cancelled'
    });
    throw error;
  }
}
```

#### Duplicate Point Awards
**Scenario:** Same action triggers multiple point awards.

**Edge Cases:**
```
1. User attends event, multiple rules fire
   - Dedup by rule_id + trigger_action
   - Only award once per unique rule
   
2. Event attendance recorded twice (double check-in)
   - Check existing PointsLedger entries
   - Block if transaction already exists
   
3. Badge earned multiple times
   - Check BadgeAward table
   - Block duplicate badge awards (except repeatable badges)
```

**Deduplication:**
```javascript
async function awardPointsForAction(userEmail, actionType, referenceId) {
  // Check if already awarded
  const existing = await base44.entities.PointsLedger.filter({
    user_email: userEmail,
    transaction_type: actionType,
    reference_id: referenceId
  });
  
  if (existing.length > 0) {
    console.log('Points already awarded for this action');
    return { alreadyAwarded: true };
  }
  
  // Get applicable rules
  const rules = await base44.entities.GamificationRule.filter({
    rule_type: actionType,
    is_active: true
  });
  
  let totalPoints = 0;
  
  for (const rule of rules) {
    // Check if rule already executed for this user/action
    const ruleExecution = await base44.entities.RuleExecution.filter({
      rule_id: rule.id,
      user_email: userEmail,
      trigger_action: referenceId
    });
    
    if (ruleExecution.length > 0) {
      continue; // Skip already executed rule
    }
    
    // Award points
    const pointsToAward = rule.points_reward;
    totalPoints += pointsToAward;
    
    // Record execution
    await base44.entities.RuleExecution.create({
      rule_id: rule.id,
      user_email: userEmail,
      trigger_action: referenceId,
      points_awarded: pointsToAward
    });
  }
  
  // Update user points
  const userPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
  const newTotal = (userPoints[0]?.total_points || 0) + totalPoints;
  
  await base44.entities.UserPoints.update(userPoints[0].id, {
    total_points: newTotal
  });
  
  // Record in ledger
  await base44.entities.PointsLedger.create({
    user_email: userEmail,
    amount: totalPoints,
    transaction_type: actionType,
    reference_id: referenceId,
    balance_after: newTotal
  });
  
  return { success: true, pointsAwarded: totalPoints };
}
```

#### Streak Interruption
**Scenario:** User misses one day in long streak.

**Edge Cases:**
```
1. 30-day streak broken by 1 missed day
   - Reset to 0
   - Award "comeback" bonus if streak restarts within 3 days
   
2. System downtime causes missed streak
   - Admin override to preserve streak
   - Audit log records manual adjustment
   
3. Timezone issues cause false streak breaks
   - Store last_activity_date in UTC
   - Calculate streaks in user's timezone
```

---

## RECOGNITION & SOCIAL EDGE CASES

### 5. Recognition Moderation

#### Inappropriate Content Detection
**Scenario:** AI flags recognition as potentially inappropriate.

**Edge Cases:**
```
1. False positive (innocent message flagged)
   - Allow manual override by moderator
   - Learn from false positives
   
2. Borderline content (mild profanity)
   - Queue for human review
   - Set confidence threshold (>0.8 = auto-flag)
   
3. Recognition edited after approval
   - Re-run AI moderation on edit
   - Require re-approval if substantial changes
```

**Moderation Flow:**
```javascript
async function createRecognition(recognitionData) {
  // Create recognition as 'pending' if AI moderation enabled
  const recognition = await base44.entities.Recognition.create({
    ...recognitionData,
    status: 'pending' // Will be set to 'approved' if passes moderation
  });
  
  // Run AI moderation
  const moderationResult = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze this employee recognition message for inappropriate content:
    
    Message: "${recognitionData.message}"
    
    Check for:
    - Profanity or offensive language
    - Harassment or bullying
    - Discriminatory content
    - Inappropriate personal comments
    
    Return a confidence score (0-1) and reasoning.`,
    response_json_schema: {
      type: 'object',
      properties: {
        is_appropriate: { type: 'boolean' },
        confidence: { type: 'number' },
        flag_reason: { type: 'string' }
      }
    }
  });
  
  if (moderationResult.is_appropriate && moderationResult.confidence > 0.8) {
    // Auto-approve
    await base44.entities.Recognition.update(recognition.id, {
      status: 'approved'
    });
  } else {
    // Flag for review
    await base44.entities.Recognition.update(recognition.id, {
      status: 'flagged',
      ai_flag_reason: moderationResult.flag_reason,
      ai_flag_confidence: moderationResult.confidence
    });
    
    // Notify moderators
    const admins = await base44.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      await base44.entities.Notification.create({
        user_email: admin.email,
        type: 'system',
        title: 'Recognition Flagged for Review',
        message: `AI flagged a recognition message: ${moderationResult.flag_reason}`,
        link: `/admin/moderation/${recognition.id}`,
        priority: 'high'
      });
    }
  }
  
  return recognition;
}
```

#### Recognition to Deleted User
**Scenario:** User creates recognition for someone who no longer exists.

**Edge Cases:**
```
1. Recipient account deleted after recognition sent
   - Keep recognition visible
   - Display recipient as "Former Employee"
   - Points not awarded
   
2. Sender account deleted
   - Keep recognition visible
   - Display sender as "Former Employee"
   - Recipient still receives points
```

### 6. Milestone Celebrations

#### Duplicate Milestones
**Scenario:** Birthday or anniversary detected multiple times.

**Edge Cases:**
```
1. Milestone created manually and auto-generated
   - Dedup by user_email + milestone_type + milestone_date
   - Keep most recent
   
2. User birthdate changed in profile
   - Delete old birthday milestone
   - Create new one with correct date
   
3. Work anniversary recalculated (start date changed)
   - Update existing anniversary milestones
   - Preserve celebration history
```

#### Opt-Out Handling
**Scenario:** User opts out of milestone celebrations mid-month.

**Edge Cases:**
```
1. Opt-out after notification already sent
   - Cancel pending celebration
   - Mark milestone as 'opt_out'
   - No retroactive deletion of past celebrations
   
2. Opt-out, then opt back in
   - Resume celebrations for future milestones
   - Don't recreate missed celebrations
```

---

## SURVEY & FEEDBACK EDGE CASES

### 7. Survey Anonymity

#### Anonymity Threshold Not Met
**Scenario:** Survey has minimum 5 responses requirement, but only 3 received.

**Edge Cases:**
```
1. Survey closes with 4 responses
   - Hide all individual responses
   - Show only that survey is closed
   - Do not show aggregated results
   
2. Admin tries to view responses before threshold
   - Block access with clear message
   - Show count: "3/5 responses received"
   
3. User tries to change response after submission
   - Allow within 24 hours OR before survey closes
   - Update response_count if completion_status changes
```

**Anonymity Enforcement:**
```javascript
async function getSurveyResults(surveyId, requestingUser) {
  const survey = await base44.entities.Survey.filter({ id: surveyId });
  
  if (!survey.length) {
    throw new Error('Survey not found');
  }
  
  // Check if admin
  if (requestingUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  // Check anonymization threshold
  if (survey[0].is_anonymous && survey[0].response_count < survey[0].anonymization_threshold) {
    return {
      canViewResults: false,
      reason: 'Minimum responses not met for anonymity protection',
      responseCount: survey[0].response_count,
      thresholdRequired: survey[0].anonymization_threshold
    };
  }
  
  // Get responses
  const responses = await base44.entities.SurveyResponse.filter({
    survey_id: surveyId,
    completion_status: 'completed'
  });
  
  // If anonymous, strip identifying info
  if (survey[0].is_anonymous) {
    return {
      canViewResults: true,
      aggregatedData: aggregateResponses(responses),
      individualResponses: null // Do not return individual responses
    };
  }
  
  return {
    canViewResults: true,
    responses
  };
}
```

#### Survey Response Editing
**Scenario:** User wants to change response after submission.

**Edge Cases:**
```
1. Edit response for closed survey
   - Block with error
   
2. Edit response after results published
   - Allow edit
   - Recalculate aggregated results
   - Notify admin of change
   
3. Multiple edits in short time
   - Track edit count
   - Flag excessive editing (>5 edits)
```

---

## DATA INTEGRITY & CONSTRAINTS

### 8. Orphaned Records

#### Cascade Deletion Prevention
**Scenario:** Entity deleted but related records remain.

**Affected Entities:**
```
1. Activity deleted → Events referencing it
   - Prevent deletion if events exist
   - OR cascade delete all related events
   - Choice depends on business logic
   
2. Team deleted → TeamMembership records
   - Cascade delete all memberships
   - Notify former members
   
3. Badge deleted → BadgeAward records
   - Block deletion if badges awarded
   - Allow soft delete only
   
4. LearningPath deleted → LearningPathProgress
   - Archive progress records
   - Do not delete (historical data)
```

**Cascade Deletion Handler:**
```javascript
async function deleteActivitySafely(activityId) {
  // Check for related events
  const relatedEvents = await base44.entities.Event.filter({
    activity_id: activityId,
    status: { $in: ['scheduled', 'in_progress'] }
  });
  
  if (relatedEvents.length > 0) {
    throw new Error(
      `Cannot delete activity. ${relatedEvents.length} active events are using this activity. ` +
      `Cancel or complete events first.`
    );
  }
  
  // Check for completed events (historical data)
  const completedEvents = await base44.entities.Event.filter({
    activity_id: activityId,
    status: 'completed'
  });
  
  if (completedEvents.length > 0) {
    // Soft delete: Mark as inactive
    await base44.entities.Activity.update(activityId, {
      is_template: false,
      title: `[ARCHIVED] ${activity.title}`
    });
    
    return { deleted: false, archived: true, preservedEvents: completedEvents.length };
  }
  
  // Safe to delete
  await base44.entities.Activity.delete(activityId);
  return { deleted: true };
}
```

### 9. Data Consistency

#### Concurrent Updates
**Scenario:** Two users update same record simultaneously.

**Edge Cases:**
```
1. Two admins edit same event
   - Last write wins
   - Show warning if record modified since load
   - Optional: Implement optimistic locking with version field
   
2. User updates profile while admin changes role
   - Merge changes if non-conflicting fields
   - Admin role change takes precedence
   
3. Multiple team leaders invited to same team
   - First invitation accepted becomes leader
   - Others become members
```

---

## GDPR & PRIVACY EDGE CASES

### 10. Right to be Forgotten

#### Data Export Before Deletion
**Scenario:** User requests account deletion under GDPR.

**Implementation:**
```javascript
async function exportUserData(userEmail) {
  const userData = {
    profile: await base44.entities.UserProfile.filter({ user_email: userEmail }),
    points: await base44.entities.UserPoints.filter({ user_email: userEmail }),
    pointsHistory: await base44.entities.PointsLedger.filter({ user_email: userEmail }),
    badges: await base44.entities.BadgeAward.filter({ user_email: userEmail }),
    recognitionsSent: await base44.entities.Recognition.filter({ sender_email: userEmail }),
    recognitionsReceived: await base44.entities.Recognition.filter({ recipient_email: userEmail }),
    events: await base44.entities.Participation.filter({ user_email: userEmail }),
    surveys: await base44.entities.SurveyResponse.filter({ respondent_email: userEmail }),
    learningPaths: await base44.entities.LearningPathProgress.filter({ user_email: userEmail }),
    teams: await base44.entities.TeamMembership.filter({ user_email: userEmail })
  };
  
  return userData;
}

async function deleteUserDataGDPR(userEmail) {
  // 1. Export data first
  const exportedData = await exportUserData(userEmail);
  
  // 2. Anonymize survey responses
  const responses = await base44.entities.SurveyResponse.filter({ 
    respondent_email: userEmail 
  });
  
  for (const response of responses) {
    await base44.entities.SurveyResponse.update(response.id, {
      respondent_email: `deleted_${Date.now()}@anonymized.com`
    });
  }
  
  // 3. Delete personal data
  await base44.entities.UserProfile.delete(userProfileId);
  await base44.entities.UserPoints.delete(userPointsId);
  await base44.entities.UserPreferences.delete(userPreferencesId);
  
  // 4. Soft delete recognition (preserve for recipients)
  const sentRecognitions = await base44.entities.Recognition.filter({
    sender_email: userEmail
  });
  
  for (const recog of sentRecognitions) {
    await base44.entities.Recognition.update(recog.id, {
      sender_email: 'deleted@anonymized.com',
      sender_name: 'Former Employee'
    });
  }
  
  // 5. Audit log
  await base44.entities.AuditLog.create({
    action: 'user_deleted',
    actor_email: 'system',
    target_email: userEmail,
    severity: 'critical',
    metadata: { gdpr_request: true }
  });
  
  return { success: true, exportedData };
}
```

---

## INTEGRATION EDGE CASES

### 11. External System Failures

#### Google Calendar Sync Failure
**Scenario:** Calendar sync fails mid-operation.

**Edge Cases:**
```
1. Create event in app, sync to Google fails
   - Store google_calendar_id as null
   - Retry sync in background
   - Show warning to user
   
2. Update event in app, Google Calendar API down
   - Queue update for retry
   - Event remains updated in app
   - Background job retries every 5 minutes
   
3. Delete event in Google Calendar, webhook not received
   - Periodic reconciliation job (daily)
   - Detect orphaned events
   - Auto-mark as cancelled in app
```

#### Slack/Teams Notification Failure
**Scenario:** Notification webhook fails.

**Edge Cases:**
```
1. Webhook returns 500 error
   - Retry 3 times with exponential backoff
   - If still fails, fallback to email
   
2. Webhook times out
   - Mark notification as 'failed'
   - Admin dashboard shows failed notifications
   - Manual retry option
   
3. Webhook URL expired/revoked
   - Disable integration
   - Notify admin to reconfigure
```

---

## PERFORMANCE & SCALE EDGE CASES

### 12. Large Data Operations

#### Bulk Event Creation
**Scenario:** Create 100+ events at once.

**Edge Cases:**
```
1. Bulk create exceeds API rate limits
   - Batch operations (max 50 per batch)
   - Add delay between batches
   
2. Bulk create fails midway (network error)
   - Track which events created
   - Allow resume from last successful event
   
3. Bulk notifications overwhelming email server
   - Queue notifications
   - Send in batches of 50
   - Rate limit: 100 emails/minute max
```

**Implementation:**
```javascript
async function bulkCreateEvents(eventsData, batchSize = 50) {
  const results = {
    successful: [],
    failed: [],
    total: eventsData.length
  };
  
  // Process in batches
  for (let i = 0; i < eventsData.length; i += batchSize) {
    const batch = eventsData.slice(i, i + batchSize);
    
    try {
      const createdEvents = await Promise.all(
        batch.map(eventData => base44.entities.Event.create(eventData))
      );
      
      results.successful.push(...createdEvents);
      
      // Delay between batches to avoid rate limits
      if (i + batchSize < eventsData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      results.failed.push({
        batch: i / batchSize,
        error: error.message,
        events: batch
      });
    }
  }
  
  return results;
}
```

#### Leaderboard Calculation for 1000+ Users
**Scenario:** Calculate leaderboard with large user base.

**Edge Cases:**
```
1. Real-time calculation too slow
   - Cache leaderboard results
   - Update every 5 minutes
   - Show last_updated timestamp
   
2. Tie scores (multiple users with same points)
   - Sort by secondary criteria (streak, date joined)
   - Show tied users with same rank
   
3. User wants personalized ranking position
   - Pre-calculate top 100
   - Calculate user's position on-demand
```

---

## CRITICAL ERRORS & RECOVERY

### 13. System-Level Failures

#### Database Connection Lost Mid-Transaction
**Scenario:** Connection drops during multi-step operation.

**Recovery Strategy:**
```javascript
async function criticalOperation() {
  let transaction = null;
  
  try {
    // Start transaction
    transaction = await startTransaction();
    
    // Step 1: Deduct points
    await deductPoints(userId, amount, transaction);
    
    // Step 2: Award badge
    await awardBadge(userId, badgeId, transaction);
    
    // Step 3: Create notification
    await createNotification(userId, message, transaction);
    
    // Commit
    await transaction.commit();
    
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    
    // Log error
    console.error('Critical operation failed:', error);
    
    // Retry logic
    if (error.code === 'CONNECTION_LOST' && retryCount < 3) {
      await delay(1000);
      return await criticalOperation();
    }
    
    throw error;
  }
}
```

#### Corrupted Data Detected
**Scenario:** Data integrity check fails.

**Response:**
```
1. User points balance doesn't match ledger sum
   - Recalculate from PointsLedger
   - Update UserPoints with correct value
   - Log discrepancy in audit log
   
2. Event has participations but no activity
   - Orphaned data detected
   - Admin notification
   - Manual cleanup required
   
3. Recognition points awarded but no ledger entry
   - Create missing ledger entry
   - Flag for admin review
```

---

## VALIDATION RULES

### 14. Input Validation Edge Cases

#### File Uploads
```javascript
const FILE_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
};

function validateFileUpload(file) {
  // Size check
  if (file.size > FILE_VALIDATION.maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
  
  // Type check
  if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only images and PDFs allowed.');
  }
  
  // Extension check (security)
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!FILE_VALIDATION.allowedExtensions.includes(ext)) {
    throw new Error('Invalid file extension.');
  }
  
  // Additional security: Check magic bytes
  // (Implement actual magic byte validation)
  
  return true;
}
```

#### Email Validation
```javascript
function validateEmail(email) {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  // Company domain check (optional)
  const companyDomains = ['intinc.com', 'partner-company.com'];
  const domain = email.split('@')[1];
  
  if (!companyDomains.includes(domain)) {
    throw new Error('Email must be from company domain');
  }
  
  return true;
}
```

---

## MONITORING & ALERTING

### 15. Anomaly Detection

#### Unusual Activity Patterns
```javascript
async function detectAnomalies() {
  // 1. Excessive point awards
  const recentAwards = await base44.entities.PointsLedger.filter({
    created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
  });
  
  const totalAwarded = recentAwards.reduce((sum, t) => sum + t.amount, 0);
  
  if (totalAwarded > 10000) {
    await alertAdmins('High point award volume detected', {
      totalPoints: totalAwarded,
      transactionCount: recentAwards.length
    });
  }
  
  // 2. Failed login attempts
  // (Implement based on auth system)
  
  // 3. Rapid event cancellations
  const recentCancellations = await base44.entities.Event.filter({
    status: 'cancelled',
    updated_date: { $gte: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
  });
  
  if (recentCancellations.length > 10) {
    await alertAdmins('High event cancellation rate', {
      count: recentCancellations.length
    });
  }
}
```

---

## TESTING CHECKLIST

### 16. Edge Case Test Scenarios

```markdown
## User Management
- [ ] Delete user with active team leadership
- [ ] Delete user with upcoming events as facilitator
- [ ] Invite user with existing account
- [ ] Change user role mid-session
- [ ] Multiple role changes in quick succession

## Events
- [ ] Double book user for overlapping events
- [ ] Cancel event with 100+ participants
- [ ] Reschedule recurring event series
- [ ] Check-in after event ended
- [ ] RSVP when event is full

## Gamification
- [ ] Redeem reward with insufficient points
- [ ] Concurrent reward redemptions
- [ ] Negative point balance
- [ ] Duplicate point awards
- [ ] Streak interrupted by system downtime

## Recognition
- [ ] Recognition to deleted user
- [ ] AI moderation false positive
- [ ] Edit recognition after approval
- [ ] Recognition with inappropriate content

## Surveys
- [ ] View results before anonymity threshold met
- [ ] Edit response after survey closed
- [ ] Multiple responses from same user

## Data Integrity
- [ ] Delete activity with related events
- [ ] Concurrent updates to same record
- [ ] Orphaned records after cascade deletion

## Performance
- [ ] Bulk create 1000 events
- [ ] Leaderboard with 1000+ users
- [ ] 100 concurrent check-ins

## Security
- [ ] Access other user's private data
- [ ] Modify points via API manipulation
- [ ] Upload malicious file
- [ ] SQL injection in search fields
```

---

## CONCLUSION

This document covers comprehensive edge cases across all 73 entities in the INTeract Employee Engagement Platform. Each edge case includes:

1. **Scenario Description**: What can go wrong
2. **Impact Analysis**: Which entities are affected
3. **Handling Strategy**: Code examples for resolution
4. **Prevention**: How to avoid the edge case

**Best Practices:**
- Always validate input at API boundaries
- Use database transactions for multi-step operations
- Implement retry logic for external integrations
- Log all critical operations to AuditLog
- Monitor for anomalies and alert admins
- Test edge cases in staging before production
- Document all workarounds and manual interventions

**Last Updated:** 2025-12-29  
**Review Schedule:** Quarterly  
**Next Review:** 2025-03-29

---

**END OF EDGE CASES DOCUMENTATION**