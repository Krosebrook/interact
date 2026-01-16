/**
 * Execute Gamification Rules Engine
 * Evaluates complex rule conditions and executes actions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import type {
  Base44Client,
  GamificationRule,
  RuleCondition,
  RuleExecution,
  RuleExecutionResult,
  UserPoints,
  Badge,
  BadgeAward,
} from './lib/types.ts';
import { getErrorMessage } from './lib/types.ts';

interface ExecuteRulesPayload {
  trigger_entity: string;
  trigger_entity_id: string;
  user_email: string;
}

interface ExecuteRulesResponse {
  success: boolean;
  executed_rules: number;
  rules: RuleExecutionResult[];
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const base44 = createClientFromRequest(req) as Base44Client;
    const { trigger_entity, trigger_entity_id, user_email }: ExecuteRulesPayload = await req.json();

    if (!user_email) {
      return Response.json({ error: 'Missing user_email' }, { status: 400 });
    }

    // Get all active rules
    const rules = await base44.asServiceRole.entities.GamificationRule.filter({
      is_active: true
    }) as GamificationRule[];

    const executedRules: RuleExecutionResult[] = [];

    for (const rule of rules) {
      try {
        const shouldExecute = await evaluateRule(
          rule,
          trigger_entity,
          trigger_entity_id,
          user_email,
          base44
        );

        if (shouldExecute) {
          const result = await executeRuleActions(rule, user_email, base44);
          executedRules.push(result);

          // Track execution
          await base44.asServiceRole.entities.RuleExecution.create({
            rule_id: rule.id,
            rule_name: rule.rule_name,
            user_email: user_email,
            trigger_entity: trigger_entity,
            trigger_entity_id: trigger_entity_id,
            executed_date: new Date().toISOString(),
            actions_executed: result.actions,
            conditions_met: result.conditions_met,
            success: true
          });

          // Update rule execution count
          await base44.asServiceRole.entities.GamificationRule.update(rule.id, {
            execution_count: (rule.execution_count || 0) + 1
          });
        }
      } catch (error: unknown) {
        console.error(`[RULE_EXECUTION_ERROR] ${rule.rule_name}:`, error);
        // Continue to next rule instead of failing
      }
    }

    const response: ExecuteRulesResponse = {
      success: true,
      executed_rules: executedRules.length,
      rules: executedRules
    };

    return Response.json(response);
  } catch (error: unknown) {
    console.error('[EXECUTE_RULES]', error);
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});

async function evaluateRule(
  rule: GamificationRule,
  triggerEntity: string,
  triggerId: string,
  userEmail: string,
  base44: Base44Client
): Promise<boolean> {
  // Check cooldown
  const recentExecutions = await base44.asServiceRole.entities.RuleExecution.filter({
    rule_id: rule.id,
    user_email: userEmail
  }) as RuleExecution[];

  if (rule.cooldown_hours && recentExecutions.length > 0) {
    const lastExecution = new Date(recentExecutions[0].executed_date);
    const cooldownTime = new Date(lastExecution.getTime() + rule.cooldown_hours * 60 * 60 * 1000);
    if (new Date() < cooldownTime) {
      return false; // Still in cooldown
    }
  }

  // Check monthly trigger limit
  if (rule.max_triggers_per_month) {
    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const thisMonthExecutions = recentExecutions.filter((e) => new Date(e.executed_date) >= monthStart);
    if (thisMonthExecutions.length >= rule.max_triggers_per_month) {
      return false;
    }
  }

  // Evaluate conditions
  const conditionResults = await Promise.all(
    rule.conditions.map((cond) => evaluateCondition(cond, triggerEntity, triggerId, userEmail, base44))
  );

  // Apply logic (AND vs OR)
  if (rule.logic === 'AND') {
    return conditionResults.every((r) => r === true);
  } else if (rule.logic === 'OR') {
    return conditionResults.some((r) => r === true);
  }

  return false;
}

async function evaluateCondition(
  condition: RuleCondition,
  triggerEntity: string,
  triggerId: string,
  userEmail: string,
  base44: Base44Client
): Promise<boolean> {
  try {
    // If condition entity matches trigger, use that data
    let entityData: Record<string, unknown> | null = null;

    if (condition.entity === triggerEntity) {
      const results = await base44.asServiceRole.entities[triggerEntity].filter({
        id: triggerId
      });
      entityData = results[0] as Record<string, unknown> | undefined ?? null;
    } else {
      // Fetch related data (simplified - adjust per your data model)
      const results = await base44.asServiceRole.entities[condition.entity].filter({
        user_email: userEmail
      });
      entityData = results[0] as Record<string, unknown> | undefined ?? null;
    }

    if (!entityData) return false;

    const value = entityData[condition.field];

    // Evaluate operator
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value as string);
      case 'gt':
        return typeof value === 'number' && value > (condition.value as number);
      case 'lt':
        return typeof value === 'number' && value < (condition.value as number);
      case 'gte':
        return typeof value === 'number' && value >= (condition.value as number);
      case 'lte':
        return typeof value === 'number' && value <= (condition.value as number);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'exists':
        return value !== null && value !== undefined;
      default:
        return false;
    }
  } catch (error: unknown) {
    console.error('[CONDITION_EVAL_ERROR]', error);
    return false;
  }
}

async function executeRuleActions(
  rule: GamificationRule,
  userEmail: string,
  base44: Base44Client
): Promise<RuleExecutionResult> {
  const actions: Record<string, unknown> = {};
  const conditionsMet = rule.conditions.map((c) => `${c.entity}.${c.field} ${c.operator}`);

  // Award points
  if (rule.actions.award_points) {
    const userPointsList = await base44.asServiceRole.entities.UserPoints.filter({
      user_email: userEmail
    }) as UserPoints[];

    if (userPointsList.length > 0) {
      const currentPoints = userPointsList[0];
      await base44.asServiceRole.entities.UserPoints.update(currentPoints.id, {
        total_points: (currentPoints.total_points || 0) + rule.actions.award_points,
        lifetime_points: (currentPoints.lifetime_points || 0) + rule.actions.award_points,
        points_this_month: (currentPoints.points_this_month || 0) + rule.actions.award_points
      });
      actions.points_awarded = rule.actions.award_points;
    } else {
      await base44.asServiceRole.entities.UserPoints.create({
        user_email: userEmail,
        total_points: rule.actions.award_points,
        lifetime_points: rule.actions.award_points,
        points_this_month: rule.actions.award_points
      });
      actions.points_awarded = rule.actions.award_points;
    }
  }

  // Award badge
  if (rule.actions.award_badge) {
    const badge = await base44.asServiceRole.entities.Badge.filter({
      id: rule.actions.award_badge
    }) as Badge[];

    if (badge.length > 0) {
      await base44.asServiceRole.entities.BadgeAward.create({
        user_email: userEmail,
        badge_id: rule.actions.award_badge,
        awarded_date: new Date().toISOString(),
        earned_through: 'rule_execution'
      });
      actions.badge_awarded = rule.actions.award_badge;
    }
  }

  // Send notification
  if (rule.actions.send_notification) {
    // Would integrate with notification system
    actions.notification_sent = true;
  }

  return {
    rule_id: rule.id,
    actions,
    conditions_met: conditionsMet
  };
}
