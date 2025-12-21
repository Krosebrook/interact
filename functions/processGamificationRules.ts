/**
 * GAMIFICATION RULE PROCESSOR
 * Automatically evaluates and executes gamification rules
 * Triggered by various user actions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

// Helper: Check if user should skip due to frequency limit
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

// Helper: Evaluate rule conditions
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

// Helper: Filter records by time period
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

// Helper: Calculate point multipliers
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

// Helper: Award points to user
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

// Helper: Award badge to user
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

// Helper: Send notification
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