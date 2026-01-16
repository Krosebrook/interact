/**
 * @fileoverview Gamification Rule Processor - Core Engine for Evaluating and Executing Gamification Rules
 *
 * This serverless function serves as the central rule processor for the gamification system.
 * It evaluates configurable rules triggered by user actions and awards points, badges,
 * and sends notifications based on rule conditions.
 *
 * ## Architecture Overview
 *
 * The rule processor follows a pipeline architecture:
 * 1. **Trigger Reception** - Receives trigger events with type, user, and metadata
 * 2. **Rule Matching** - Fetches active rules matching the trigger type
 * 3. **Limit Checking** - Verifies user hasn't exceeded rule frequency limits
 * 4. **Condition Evaluation** - Evaluates rule conditions against user data
 * 5. **Multiplier Calculation** - Applies bonus multipliers (weekend, tier-based)
 * 6. **Reward Distribution** - Awards points and badges
 * 7. **Notification** - Sends achievement notifications if configured
 *
 * ## Supported Trigger Types
 *
 * | Trigger Type | Description | Example Metadata |
 * |--------------|-------------|------------------|
 * | `event_attendance` | User attends an event | `{ event_id: "123" }` |
 * | `recognition_given` | User sends a recognition | `{ recipient: "email" }` |
 * | `recognition_received` | User receives recognition | `{ sender: "email" }` |
 * | `challenge_completed` | User completes a challenge | `{ challenge_id: "456" }` |
 * | `profile_updated` | User updates their profile | `{ fields: ["bio"] }` |
 * | `content_created` | User creates content | `{ content_type: "post" }` |
 *
 * ## Frequency Limits
 *
 * Rules can be configured with execution limits per user:
 * - `unlimited` - Rule can trigger unlimited times
 * - `once` - Rule triggers only once per user ever
 * - `daily` - Rule triggers once per 24-hour period
 * - `weekly` - Rule triggers once per 7-day period
 * - `monthly` - Rule triggers once per 30-day period
 *
 * ## API Endpoint
 *
 * **POST** `/functions/processGamificationRules`
 *
 * ### Request Body
 * ```json
 * {
 *   "trigger_type": "event_attendance",
 *   "user_email": "employee@company.com",
 *   "metadata": {
 *     "event_id": "123",
 *     "reference_id": "opt-ref",
 *     "count": 1
 *   }
 * }
 * ```
 *
 * ### Success Response (200)
 * ```json
 * {
 *   "success": true,
 *   "trigger": "event_attendance",
 *   "user": "employee@company.com",
 *   "awarded": [
 *     {
 *       "rule": "First Event Attendance",
 *       "points": 50,
 *       "badge": "badge_123",
 *       "execution_id": "exec_456"
 *     }
 *   ],
 *   "total_points": 50
 * }
 * ```
 *
 * ### Error Responses
 * - `401 Unauthorized` - User not authenticated
 * - `400 Bad Request` - Missing trigger_type or user_email
 * - `500 Internal Server Error` - Rule processing failed
 *
 * ## Database Entities Used
 *
 * - **GamificationRule** - Rule definitions with conditions and rewards
 * - **RuleExecution** - Audit log of rule executions per user
 * - **UserPoints** - User point totals (current and lifetime)
 * - **PointsLedger** - Transaction history of point changes
 * - **BadgeAward** - Badge awards to users
 * - **Badge** - Badge definitions
 * - **Notification** - User notifications
 * - **Participation** - Event participation records
 * - **Recognition** - Recognition records
 *
 * @module processGamificationRules
 * @author Interact Platform
 * @since 1.0.0
 *
 * @example
 * // Trigger rule processing for event attendance
 * const response = await fetch('/functions/processGamificationRules', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer <token>'
 *   },
 *   body: JSON.stringify({
 *     trigger_type: 'event_attendance',
 *     user_email: 'john.doe@company.com',
 *     metadata: { event_id: 'event_123' }
 *   })
 * });
 * const result = await response.json();
 * console.log(`Awarded ${result.total_points} points`);
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * @typedef {Object} TriggerConditions
 * @property {number} [threshold] - Minimum count required to trigger
 * @property {'daily'|'weekly'|'monthly'|'quarterly'|'all_time'} [time_period] - Period for counting
 * @property {'equals'|'greater_than'|'greater_than_or_equal'|'less_than'|'less_than_or_equal'} [comparison] - Comparison operator
 * @property {Object} [entity_filters] - Additional entity-specific filters
 */

/**
 * @typedef {Object} MultiplierRules
 * @property {number} [weekend_multiplier] - Multiplier applied on weekends (e.g., 1.5 for 50% bonus)
 * @property {Object.<string, number>} [tier_multipliers] - Multipliers by user tier (e.g., { "gold": 2, "silver": 1.5 })
 */

/**
 * @typedef {Object} NotificationSettings
 * @property {boolean} notify_on_award - Whether to send notification when rule triggers
 * @property {string} [notification_message] - Custom notification message template
 */

/**
 * @typedef {Object} GamificationRule
 * @property {string} id - Unique rule identifier
 * @property {string} rule_name - Human-readable rule name
 * @property {string} rule_type - Trigger type this rule responds to
 * @property {boolean} is_active - Whether rule is currently active
 * @property {number} [priority] - Execution priority (higher = first)
 * @property {'unlimited'|'once'|'daily'|'weekly'|'monthly'} [limit_per_user] - Frequency limit
 * @property {TriggerConditions} [trigger_conditions] - Conditions that must be met
 * @property {number} [points_reward] - Points to award when triggered
 * @property {string} [badge_id] - Badge to award when triggered
 * @property {MultiplierRules} [multiplier_rules] - Point multiplier configuration
 * @property {NotificationSettings} [notification_settings] - Notification configuration
 * @property {number} [times_triggered] - Total times this rule has triggered
 * @property {string} [last_triggered] - ISO timestamp of last trigger
 */

/**
 * @typedef {Object} RuleExecution
 * @property {string} id - Unique execution identifier
 * @property {string} rule_id - ID of the rule that was executed
 * @property {string} user_email - Email of user who triggered the rule
 * @property {string} created_date - ISO timestamp when execution occurred
 * @property {string} trigger_action - Description of the triggering action
 * @property {number} points_awarded - Points awarded in this execution
 * @property {string|null} badge_awarded - Badge ID awarded, or null
 * @property {number} multiplier_applied - Multiplier that was applied
 * @property {Object} [execution_metadata] - Additional context from trigger
 */

/**
 * @typedef {Object} AwardResult
 * @property {string} rule - Name of the rule that was triggered
 * @property {number} points - Points awarded (after multipliers)
 * @property {string|null} badge - Badge ID awarded, or null if no badge
 * @property {string} execution_id - ID of the execution record
 */

/**
 * @typedef {Object} ProcessingResult
 * @property {boolean} success - Whether processing completed successfully
 * @property {string} trigger - The trigger type that was processed
 * @property {string} user - Email of the user
 * @property {AwardResult[]} awarded - List of awards given
 * @property {number} total_points - Sum of all points awarded
 */

/**
 * @typedef {Object} TriggerMetadata
 * @property {string} [reference_id] - Optional reference identifier for the trigger
 * @property {string} [event_id] - Event ID for event-related triggers
 * @property {string} [challenge_id] - Challenge ID for challenge triggers
 * @property {number} [count] - Count value for simple triggers
 * @property {Object} [additional] - Any additional context data
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trigger_type, user_email, metadata } = await req.json();

    if (!trigger_type || !user_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch active rules for this trigger type
    const rules = await base44.asServiceRole.entities.GamificationRule.filter({
      rule_type: trigger_type,
      is_active: true
    });

    if (!rules || rules.length === 0) {
      return Response.json({ 
        message: 'No active rules for this trigger',
        awarded: []
      });
    }

    // Sort by priority
    rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const awarded = [];
    const now = new Date();

    for (const rule of rules) {
      try {
        // Check if user has already earned this based on limit
        const recentExecutions = await base44.asServiceRole.entities.RuleExecution.filter({
          rule_id: rule.id,
          user_email
        });

        // Check limit constraints
        if (shouldSkipDueToLimit(rule, recentExecutions, now)) {
          continue;
        }

        // Evaluate trigger conditions
        const conditionsMet = await evaluateConditions(
          rule,
          user_email,
          metadata,
          base44
        );

        if (!conditionsMet) {
          continue;
        }

        // Calculate points with multipliers
        const multiplier = calculateMultiplier(rule, user, now);
        const pointsToAward = Math.round((rule.points_reward || 0) * multiplier);

        // Award points
        if (pointsToAward > 0) {
          await awardPoints(user_email, pointsToAward, rule, metadata, base44);
        }

        // Award badge if specified
        let badgeAwarded = null;
        if (rule.badge_id) {
          badgeAwarded = await awardBadge(user_email, rule.badge_id, rule, base44);
        }

        // Record execution
        const execution = await base44.asServiceRole.entities.RuleExecution.create({
          rule_id: rule.id,
          user_email,
          trigger_action: `${trigger_type}_${metadata?.reference_id || 'action'}`,
          points_awarded: pointsToAward,
          badge_awarded: badgeAwarded,
          multiplier_applied: multiplier,
          execution_metadata: metadata
        });

        // Update rule statistics
        await base44.asServiceRole.entities.GamificationRule.update(rule.id, {
          times_triggered: (rule.times_triggered || 0) + 1,
          last_triggered: now.toISOString()
        });

        // Send notification if configured
        if (rule.notification_settings?.notify_on_award) {
          await sendNotification(user_email, rule, pointsToAward, badgeAwarded, base44);
        }

        awarded.push({
          rule: rule.rule_name,
          points: pointsToAward,
          badge: badgeAwarded,
          execution_id: execution.id
        });

      } catch (ruleError) {
        console.error(`Error processing rule ${rule.id}:`, ruleError);
        // Continue with other rules
      }
    }

    return Response.json({
      success: true,
      trigger: trigger_type,
      user: user_email,
      awarded,
      total_points: awarded.reduce((sum, a) => sum + (a.points || 0), 0)
    });

  } catch (error) {
    console.error('Rule processing error:', error);
    return Response.json({ 
      error: 'Failed to process rules',
      details: error.message 
    }, { status: 500 });
  }
});

/**
 * Determines whether a rule execution should be skipped based on frequency limits.
 *
 * This function implements the frequency limiting logic that prevents users from
 * triggering the same rule more often than allowed. It supports multiple limit
 * types: unlimited, once-ever, daily, weekly, and monthly.
 *
 * ## Limit Types Explained
 *
 * | Limit Type | Behavior |
 * |------------|----------|
 * | `unlimited` | Never skip - rule can trigger every time |
 * | `once` | Skip if user has any prior executions |
 * | `daily` | Skip if executed within last 24 hours |
 * | `weekly` | Skip if executed within last 7 days |
 * | `monthly` | Skip if executed within last 30 days |
 *
 * ## Algorithm
 *
 * 1. If limit is "unlimited", immediately return false (don't skip)
 * 2. If limit is "once" and user has any executions, skip
 * 3. For time-based limits, calculate cutoff time and count recent executions
 * 4. If any execution exists after cutoff, skip
 *
 * @param {GamificationRule} rule - The rule being evaluated
 * @param {RuleExecution[]} executions - Array of the user's prior executions for this rule
 * @param {Date} now - Current timestamp for period calculations
 * @returns {boolean} True if execution should be skipped, false if rule can proceed
 *
 * @example
 * // Check if user can trigger a daily rule
 * const rule = { limit_per_user: 'daily' };
 * const executions = [{ created_date: '2024-01-15T10:00:00Z' }];
 * const now = new Date('2024-01-15T15:00:00Z'); // Same day
 * shouldSkipDueToLimit(rule, executions, now); // Returns true (already triggered today)
 *
 * @example
 * // Unlimited rules never skip
 * const rule = { limit_per_user: 'unlimited' };
 * shouldSkipDueToLimit(rule, [exec1, exec2, exec3], now); // Returns false
 *
 * @see {@link GamificationRule} for rule structure
 */
function shouldSkipDueToLimit(rule, executions, now) {
  if (rule.limit_per_user === 'unlimited') return false;
  if (rule.limit_per_user === 'once' && executions.length > 0) return true;

  const limitPeriods = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000
  };

  const periodMs = limitPeriods[rule.limit_per_user];
  if (!periodMs) return false;

  const cutoff = new Date(now.getTime() - periodMs);
  const recentCount = executions.filter(e => 
    new Date(e.created_date) > cutoff
  ).length;

  return recentCount > 0;
}

/**
 * Evaluates whether a rule's trigger conditions are met for a given user.
 *
 * This function is the core condition evaluator that determines if a user's
 * activity meets the rule's threshold requirements. It queries relevant
 * database entities based on the rule type and compares counts against
 * configured thresholds.
 *
 * ## Evaluation Flow
 *
 * ```
 * ┌─────────────────────┐
 * │ Check if conditions │
 * │ exist (no = true)   │
 * └─────────┬───────────┘
 *           │
 * ┌─────────▼───────────┐
 * │ Check if threshold  │
 * │ exists (no = true)  │
 * └─────────┬───────────┘
 *           │
 * ┌─────────▼───────────┐
 * │ Query relevant      │
 * │ entity by rule_type │
 * └─────────┬───────────┘
 *           │
 * ┌─────────▼───────────┐
 * │ Filter by time      │
 * │ period              │
 * └─────────┬───────────┘
 *           │
 * ┌─────────▼───────────┐
 * │ Compare count to    │
 * │ threshold           │
 * └─────────────────────┘
 * ```
 *
 * ## Supported Rule Types and Their Queries
 *
 * | Rule Type | Entity Queried | Filter Criteria |
 * |-----------|----------------|-----------------|
 * | `event_attendance` | Participation | user_email, status='attended' |
 * | `recognition_given` | Recognition | sender_email, status='approved' |
 * | `recognition_received` | Recognition | recipient_email, status='approved' |
 * | (default) | N/A | Uses metadata.count or 1 |
 *
 * ## Comparison Operators
 *
 * | Operator | Description |
 * |----------|-------------|
 * | `equals` | count === threshold |
 * | `greater_than` | count > threshold |
 * | `greater_than_or_equal` | count >= threshold (default) |
 * | `less_than` | count < threshold |
 * | `less_than_or_equal` | count <= threshold |
 *
 * @async
 * @param {GamificationRule} rule - The rule containing trigger conditions
 * @param {string} userEmail - Email address of the user being evaluated
 * @param {TriggerMetadata} metadata - Metadata from the trigger event
 * @param {Object} base44 - Base44 SDK client instance for database queries
 * @returns {Promise<boolean>} True if conditions are met, false otherwise
 *
 * @example
 * // Evaluate a rule requiring 5+ event attendances this month
 * const rule = {
 *   rule_type: 'event_attendance',
 *   trigger_conditions: {
 *     threshold: 5,
 *     time_period: 'monthly',
 *     comparison: 'greater_than_or_equal'
 *   }
 * };
 * const met = await evaluateConditions(rule, 'user@company.com', {}, base44);
 *
 * @see {@link filterByTimePeriod} for time period filtering logic
 * @see {@link TriggerConditions} for condition structure
 */
async function evaluateConditions(rule, userEmail, metadata, base44) {
  const conditions = rule.trigger_conditions;
  if (!conditions) return true; // No conditions = always trigger

  const { threshold, time_period, comparison, entity_filters } = conditions;

  if (!threshold) return true;

  // Get relevant data based on trigger type
  let count = 0;
  
  switch (rule.rule_type) {
    case 'event_attendance':
      const participations = await base44.asServiceRole.entities.Participation.filter({
        user_email: userEmail,
        attendance_status: 'attended'
      });
      count = filterByTimePeriod(participations, time_period).length;
      break;
      
    case 'recognition_given':
      const recognitionsSent = await base44.asServiceRole.entities.Recognition.filter({
        sender_email: userEmail,
        status: 'approved'
      });
      count = filterByTimePeriod(recognitionsSent, time_period).length;
      break;
      
    case 'recognition_received':
      const recognitionsReceived = await base44.asServiceRole.entities.Recognition.filter({
        recipient_email: userEmail,
        status: 'approved'
      });
      count = filterByTimePeriod(recognitionsReceived, time_period).length;
      break;
      
    default:
      // For simple triggers, count from metadata
      count = metadata?.count || 1;
  }

  // Compare against threshold
  switch (comparison || 'greater_than_or_equal') {
    case 'equals':
      return count === threshold;
    case 'greater_than':
      return count > threshold;
    case 'greater_than_or_equal':
      return count >= threshold;
    case 'less_than':
      return count < threshold;
    case 'less_than_or_equal':
      return count <= threshold;
    default:
      return count >= threshold;
  }
}

/**
 * Filters an array of records to only include those within a specified time period.
 *
 * This utility function is used by condition evaluation to limit record counts
 * to a specific time window. It supports multiple period types and handles
 * edge cases like undefined periods or empty record arrays.
 *
 * ## Supported Time Periods
 *
 * | Period | Duration | Use Case |
 * |--------|----------|----------|
 * | `daily` | 24 hours | Daily login streaks, daily limits |
 * | `weekly` | 7 days | Weekly challenges, weekly caps |
 * | `monthly` | 30 days | Monthly milestones, monthly limits |
 * | `quarterly` | 90 days | Quarterly goals, seasonal events |
 * | `all_time` | No filter | Lifetime achievements |
 *
 * ## Implementation Details
 *
 * - Uses `created_date` field from records for comparison
 * - Calculates cutoff as: `now - periodMs`
 * - Returns all records where `created_date > cutoff`
 * - Returns original array if period is undefined or 'all_time'
 *
 * @param {Object[]} records - Array of records with `created_date` property
 * @param {string} [timePeriod] - Time period filter ('daily'|'weekly'|'monthly'|'quarterly'|'all_time')
 * @returns {Object[]} Filtered array containing only records within the time period
 *
 * @example
 * // Filter to get only this week's participations
 * const allParticipations = await getParticipations(userEmail);
 * const thisWeek = filterByTimePeriod(allParticipations, 'weekly');
 * console.log(`${thisWeek.length} participations this week`);
 *
 * @example
 * // All-time filter returns unchanged array
 * const records = [{ created_date: '2020-01-01' }, { created_date: '2024-01-01' }];
 * filterByTimePeriod(records, 'all_time'); // Returns both records
 *
 * @see {@link evaluateConditions} where this function is used
 */
function filterByTimePeriod(records, timePeriod) {
  if (!timePeriod || timePeriod === 'all_time') return records;

  const now = new Date();
  const periods = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    quarterly: 90 * 24 * 60 * 60 * 1000
  };

  const periodMs = periods[timePeriod];
  if (!periodMs) return records;

  const cutoff = new Date(now.getTime() - periodMs);
  return records.filter(r => new Date(r.created_date) > cutoff);
}

/**
 * Calculates the cumulative point multiplier to apply to a rule's base points.
 *
 * This function implements the bonus multiplier system that rewards users with
 * extra points based on timing and user tier. Multipliers are multiplicative,
 * meaning multiple applicable multipliers compound together.
 *
 * ## Multiplier Types
 *
 * ### Weekend Multiplier
 * Applied when the trigger occurs on Saturday (day 6) or Sunday (day 0).
 * Encourages engagement during weekends when activity typically drops.
 *
 * ### Tier Multiplier
 * Applied based on the user's tier level. Higher-tier users earn bonus points
 * as a reward for their engagement level.
 *
 * ## Calculation Example
 *
 * ```
 * Base Points: 100
 * Weekend Multiplier: 1.5x (configured)
 * User Tier: "gold" with 2x multiplier
 *
 * Final Multiplier: 1 × 1.5 × 2 = 3.0
 * Points Awarded: 100 × 3.0 = 300
 * ```
 *
 * ## Rule Configuration Example
 *
 * ```json
 * {
 *   "multiplier_rules": {
 *     "weekend_multiplier": 1.5,
 *     "tier_multipliers": {
 *       "bronze": 1.0,
 *       "silver": 1.25,
 *       "gold": 1.5,
 *       "platinum": 2.0
 *     }
 *   }
 * }
 * ```
 *
 * @param {GamificationRule} rule - Rule containing multiplier configuration
 * @param {Object} user - User object with tier information
 * @param {string} [user.user_tier] - User's tier level (e.g., 'gold', 'silver')
 * @param {Date} now - Current timestamp for weekend detection
 * @returns {number} Cumulative multiplier value (minimum 1.0)
 *
 * @example
 * // Calculate multiplier for a gold-tier user on Saturday
 * const rule = {
 *   multiplier_rules: {
 *     weekend_multiplier: 1.5,
 *     tier_multipliers: { gold: 2.0 }
 *   }
 * };
 * const user = { user_tier: 'gold' };
 * const saturday = new Date('2024-01-20'); // Saturday
 * calculateMultiplier(rule, user, saturday); // Returns 3.0 (1.5 × 2.0)
 *
 * @example
 * // No multipliers configured returns base 1.0
 * calculateMultiplier({}, {}, new Date()); // Returns 1.0
 *
 * @see {@link MultiplierRules} for multiplier configuration structure
 */
function calculateMultiplier(rule, user, now) {
  let multiplier = 1;

  // Weekend multiplier
  const dayOfWeek = now.getDay();
  if ((dayOfWeek === 0 || dayOfWeek === 6) && rule.multiplier_rules?.weekend_multiplier) {
    multiplier *= rule.multiplier_rules.weekend_multiplier;
  }

  // User tier multiplier
  if (user.user_tier && rule.multiplier_rules?.tier_multipliers) {
    const tierMultiplier = rule.multiplier_rules.tier_multipliers[user.user_tier];
    if (tierMultiplier) {
      multiplier *= tierMultiplier;
    }
  }

  return multiplier;
}

/**
 * Awards points to a user and records the transaction in the points ledger.
 *
 * This function handles the complete points awarding workflow:
 * 1. Retrieves or creates the user's points record
 * 2. Updates both current (spendable) and lifetime points
 * 3. Creates an audit entry in the points ledger
 *
 * ## Database Operations
 *
 * ### UserPoints Entity
 * - `total_points`: Current spendable balance (increases with awards, decreases with redemptions)
 * - `lifetime_points`: Total points ever earned (only increases, used for tier calculations)
 * - `current_streak`: Daily activity streak count
 *
 * ### PointsLedger Entity
 * Creates a transaction record for audit and history:
 * - Links to the triggering rule
 * - Records balance after transaction
 * - Stores metadata for debugging/reporting
 *
 * ## Idempotency Note
 *
 * This function is NOT idempotent. Calling it multiple times with the same
 * parameters will award points multiple times. Idempotency is handled at the
 * rule execution level via RuleExecution records.
 *
 * ## Error Handling
 *
 * This function does not catch errors - they propagate to the caller.
 * The main handler catches per-rule errors to continue processing other rules.
 *
 * @async
 * @param {string} userEmail - Email address of the user to award points to
 * @param {number} points - Number of points to award (should be positive)
 * @param {GamificationRule} rule - The rule that triggered this award (for reference)
 * @param {TriggerMetadata} metadata - Additional context to store in ledger
 * @param {Object} base44 - Base44 SDK client instance
 * @returns {Promise<void>}
 *
 * @example
 * // Award 50 points for event attendance
 * await awardPoints(
 *   'john@company.com',
 *   50,
 *   { id: 'rule_123', rule_type: 'event_attendance', rule_name: 'Event Bonus' },
 *   { event_id: 'event_456' },
 *   base44
 * );
 *
 * @throws {Error} If database operations fail
 * @see {@link awardBadge} for badge awarding
 */
async function awardPoints(userEmail, points, rule, metadata, base44) {
  // Get or create user points record
  const userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter({
    user_email: userEmail
  });

  let userPoints = userPointsRecords[0];
  
  if (userPoints) {
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
      total_points: (userPoints.total_points || 0) + points,
      lifetime_points: (userPoints.lifetime_points || 0) + points
    });
  } else {
    userPoints = await base44.asServiceRole.entities.UserPoints.create({
      user_email: userEmail,
      total_points: points,
      lifetime_points: points,
      current_streak: 0
    });
  }

  // Create points ledger entry
  await base44.asServiceRole.entities.PointsLedger.create({
    user_email: userEmail,
    amount: points,
    transaction_type: rule.rule_type,
    reference_type: 'GamificationRule',
    reference_id: rule.id,
    description: rule.rule_name,
    balance_after: (userPoints.total_points || 0) + points,
    metadata
  });
}

/**
 * Awards a badge to a user if they don't already have it.
 *
 * This function implements idempotent badge awarding - if a user already
 * has the specified badge, no action is taken and null is returned.
 * This prevents duplicate badge awards.
 *
 * ## Award Process
 *
 * ```
 * ┌───────────────────┐
 * │ Check existing    │
 * │ badge awards      │
 * └─────────┬─────────┘
 *           │
 *     ┌─────▼─────┐
 *     │ Already   │──Yes──► Return null
 *     │ has badge?│
 *     └─────┬─────┘
 *           │ No
 * ┌─────────▼─────────┐
 * │ Create BadgeAward │
 * │ record            │
 * └─────────┬─────────┘
 *           │
 * ┌─────────▼─────────┐
 * │ Increment badge   │
 * │ awarded_count     │
 * └─────────┬─────────┘
 *           │
 *     Return badgeId
 * ```
 *
 * ## Database Operations
 *
 * ### BadgeAward Entity
 * - Records badge-to-user assignment
 * - `award_type`: 'automatic' (rule-triggered) vs 'manual' (admin-granted)
 * - `award_reason`: Human-readable reason (rule name)
 *
 * ### Badge Entity
 * - `awarded_count`: Running count of total awards for analytics
 *
 * ## Error Handling
 *
 * Errors are caught and logged but don't propagate - badge award failures
 * are non-critical and shouldn't block point awards or rule completion.
 *
 * @async
 * @param {string} userEmail - Email address of the user to award badge to
 * @param {string} badgeId - ID of the badge to award
 * @param {GamificationRule} rule - The rule that triggered this award
 * @param {Object} base44 - Base44 SDK client instance
 * @returns {Promise<string|null>} Badge ID if awarded, null if user already has badge or error occurred
 *
 * @example
 * // Award a badge and check result
 * const result = await awardBadge('john@company.com', 'badge_first_event', rule, base44);
 * if (result) {
 *   console.log(`Badge ${result} awarded!`);
 * } else {
 *   console.log('User already has this badge');
 * }
 *
 * @example
 * // Badge award in rule processing
 * if (rule.badge_id) {
 *   badgeAwarded = await awardBadge(user_email, rule.badge_id, rule, base44);
 * }
 *
 * @see {@link awardPoints} for point awarding
 */
async function awardBadge(userEmail, badgeId, rule, base44) {
  try {
    // Check if user already has this badge
    const existingAwards = await base44.asServiceRole.entities.BadgeAward.filter({
      user_email: userEmail,
      badge_id: badgeId
    });

    if (existingAwards.length > 0) {
      return null; // Already has badge
    }

    // Award the badge
    const award = await base44.asServiceRole.entities.BadgeAward.create({
      badge_id: badgeId,
      user_email: userEmail,
      award_type: 'automatic',
      award_reason: rule.rule_name
    });

    // Update badge award count
    const badge = await base44.asServiceRole.entities.Badge.get(badgeId);
    if (badge) {
      await base44.asServiceRole.entities.Badge.update(badgeId, {
        awarded_count: (badge.awarded_count || 0) + 1
      });
    }

    return badgeId;
  } catch (error) {
    console.error('Badge award error:', error);
    return null;
  }
}

/**
 * Sends an achievement notification to a user when a gamification rule triggers.
 *
 * This function creates an in-app notification to inform users of their
 * gamification achievements. Notifications appear in the user's notification
 * center and can link to their profile page for details.
 *
 * ## Notification Content
 *
 * - **Title**: Fixed "🎉 Achievement Unlocked!" (celebratory)
 * - **Message**: Custom message from rule config, or default template
 * - **Icon**: Trophy emoji (🏆)
 * - **Link**: User profile page where they can view their achievements
 *
 * ## Message Templates
 *
 * The default message format is:
 * ```
 * "You earned {points} points for {rule_name}!"
 * ```
 *
 * Custom messages can be configured per-rule in `notification_settings.notification_message`.
 * Custom messages do not support variable interpolation.
 *
 * ## Configuration
 *
 * Notifications are only sent if enabled in the rule:
 * ```json
 * {
 *   "notification_settings": {
 *     "notify_on_award": true,
 *     "notification_message": "Great job completing the challenge!"
 *   }
 * }
 * ```
 *
 * ## Error Handling
 *
 * Notification failures are caught and logged but don't propagate.
 * Notification delivery is considered non-critical - users shouldn't
 * lose points/badges because a notification failed to send.
 *
 * @async
 * @param {string} userEmail - Email address of the user to notify
 * @param {GamificationRule} rule - Rule that triggered the notification
 * @param {number} points - Points that were awarded (for message template)
 * @param {string|null} badge - Badge ID that was awarded, or null
 * @param {Object} base44 - Base44 SDK client instance
 * @returns {Promise<void>}
 *
 * @example
 * // Send notification for rule with custom message
 * const rule = {
 *   rule_name: 'Weekly Champion',
 *   notification_settings: {
 *     notify_on_award: true,
 *     notification_message: 'You are this week\'s champion! Keep it up!'
 *   }
 * };
 * await sendNotification('john@company.com', rule, 100, 'badge_champion', base44);
 *
 * @example
 * // Conditional notification based on rule settings
 * if (rule.notification_settings?.notify_on_award) {
 *   await sendNotification(user_email, rule, pointsToAward, badgeAwarded, base44);
 * }
 *
 * @see {@link NotificationSettings} for notification configuration
 */
async function sendNotification(userEmail, rule, points, badge, base44) {
  try {
    const message = rule.notification_settings?.notification_message || 
      `You earned ${points} points for ${rule.rule_name}!`;

    await base44.asServiceRole.entities.Notification.create({
      user_email: userEmail,
      title: '🎉 Achievement Unlocked!',
      message,
      type: 'achievement',
      icon: '🏆',
      action_url: '/UserProfile',
      priority: 'normal'
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
}