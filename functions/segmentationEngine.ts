import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * User Segmentation Engine
 * Creates and manages custom user segments for targeted interventions
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action } = payload;

    // RECALCULATE SEGMENT
    if (action === 'recalculate_segment') {
      const { segmentId } = payload;
      
      const segments = await base44.asServiceRole.entities.UserSegment.filter({ id: segmentId });
      if (segments.length === 0) {
        return Response.json({ error: 'Segment not found' }, { status: 404 });
      }

      const segment = segments[0];
      const matchingUsers = await evaluateSegmentCriteria(base44, segment.criteria);

      await base44.asServiceRole.entities.UserSegment.update(segmentId, {
        user_count: matchingUsers.length,
        user_emails: matchingUsers.length < 1000 ? matchingUsers : [],
        last_calculated: new Date().toISOString()
      });

      return Response.json({
        success: true,
        user_count: matchingUsers.length,
        users_cached: matchingUsers.length < 1000
      });
    }

    // GET USERS IN SEGMENT
    if (action === 'get_segment_users') {
      const { segmentId } = payload;

      const segments = await base44.asServiceRole.entities.UserSegment.filter({ id: segmentId });
      if (segments.length === 0) {
        return Response.json({ error: 'Segment not found' }, { status: 404 });
      }

      const segment = segments[0];
      
      if (segment.user_emails && segment.user_emails.length > 0) {
        return Response.json({
          success: true,
          users: segment.user_emails,
          from_cache: true
        });
      }

      const matchingUsers = await evaluateSegmentCriteria(base44, segment.criteria);

      return Response.json({
        success: true,
        users: matchingUsers,
        from_cache: false
      });
    }

    // TRIGGER SEGMENT CAMPAIGN
    if (action === 'trigger_segment_campaign') {
      const { segmentId, campaignType, message, channel, subject } = payload;

      const segments = await base44.asServiceRole.entities.UserSegment.filter({ id: segmentId });
      if (segments.length === 0) {
        return Response.json({ error: 'Segment not found' }, { status: 404 });
      }

      const segment = segments[0];
      const targetUsers = await evaluateSegmentCriteria(base44, segment.criteria);

      let sentCount = 0;
      const errors = [];

      for (const userEmail of targetUsers) {
        try {
          if (channel === 'email') {
            await base44.integrations.Core.SendEmail({
              to: userEmail,
              subject: subject || `${campaignType}: ${segment.display_name}`,
              body: message
            });
            sentCount++;
          } else if (channel === 'notification') {
            await base44.asServiceRole.entities.Notification.create({
              user_email: userEmail,
              title: campaignType,
              message: message,
              type: 'campaign'
            });
            sentCount++;
          }
        } catch (error) {
          errors.push({ user: userEmail, error: error.message });
        }
      }

      return Response.json({
        success: true,
        target_users: targetUsers.length,
        sent_count: sentCount,
        errors: errors
      });
    }

    // RECALCULATE ALL DYNAMIC SEGMENTS
    if (action === 'recalculate_all_dynamic') {
      const dynamicSegments = await base44.asServiceRole.entities.UserSegment.filter({
        is_dynamic: true,
        is_active: true
      });

      const results = [];

      for (const segment of dynamicSegments) {
        try {
          const matchingUsers = await evaluateSegmentCriteria(base44, segment.criteria);

          await base44.asServiceRole.entities.UserSegment.update(segment.id, {
            user_count: matchingUsers.length,
            user_emails: matchingUsers.length < 1000 ? matchingUsers : [],
            last_calculated: new Date().toISOString()
          });

          results.push({
            segment_id: segment.id,
            segment_name: segment.segment_name,
            user_count: matchingUsers.length,
            success: true
          });
        } catch (error) {
          results.push({
            segment_id: segment.id,
            segment_name: segment.segment_name,
            success: false,
            error: error.message
          });
        }
      }

      return Response.json({
        success: true,
        segments_processed: results.length,
        results
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Segmentation Engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Evaluate complex segment criteria with AND/OR logic
async function evaluateSegmentCriteria(base44, criteria) {
  if (!criteria) return [];

  // Handle legacy simple criteria format
  if (criteria.lifecycle_states || criteria.churn_risk_min) {
    return await findMatchingUsersLegacy(base44, criteria);
  }

  // Handle new complex criteria format
  if (!criteria.conditions && !criteria.condition_groups) {
    return [];
  }

  const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();
  const users = await base44.asServiceRole.entities.User.list();
  const retentionStates = await base44.asServiceRole.entities.RetentionState.list();
  
  const matchingEmails = new Set();
  const logicOp = criteria.logic_operator || 'AND';

  // Evaluate root-level conditions
  const rootMatches = new Set();
  if (criteria.conditions && criteria.conditions.length > 0) {
    for (const lifecycle of lifecycleStates) {
      const user = users.find(u => u.email === lifecycle.user_email);
      const retention = retentionStates.find(r => r.user_email === lifecycle.user_email);
      
      const conditionResults = criteria.conditions.map(cond => 
        evaluateCondition(cond, lifecycle, user, retention)
      );

      const meetsRootCriteria = logicOp === 'AND'
        ? conditionResults.every(r => r)
        : conditionResults.some(r => r);

      if (meetsRootCriteria) {
        rootMatches.add(lifecycle.user_email);
      }
    }
  }

  // Evaluate condition groups
  const groupMatches = new Set();
  if (criteria.condition_groups && criteria.condition_groups.length > 0) {
    for (const group of criteria.condition_groups) {
      for (const lifecycle of lifecycleStates) {
        const user = users.find(u => u.email === lifecycle.user_email);
        const retention = retentionStates.find(r => r.user_email === lifecycle.user_email);
        
        const groupResults = group.conditions.map(cond =>
          evaluateCondition(cond, lifecycle, user, retention)
        );

        const meetsGroupCriteria = group.group_operator === 'AND'
          ? groupResults.every(r => r)
          : groupResults.some(r => r);

        if (meetsGroupCriteria) {
          groupMatches.add(lifecycle.user_email);
        }
      }
    }
  }

  if (rootMatches.size === 0 && groupMatches.size === 0) {
    return [];
  }

  if (rootMatches.size === 0) {
    return Array.from(groupMatches);
  }

  if (groupMatches.size === 0) {
    return Array.from(rootMatches);
  }

  if (logicOp === 'AND') {
    return Array.from(rootMatches).filter(email => groupMatches.has(email));
  } else {
    return Array.from(new Set([...rootMatches, ...groupMatches]));
  }
}

// Evaluate a single condition
function evaluateCondition(condition, lifecycle, user, retention) {
  const { field, operator, value } = condition;

  let fieldValue;
  
  switch (field) {
    case 'lifecycle_state':
      fieldValue = lifecycle.current_state;
      break;
    case 'churn_risk':
      fieldValue = lifecycle.churn_risk_score || 0;
      break;
    case 'days_in_state':
      const stateEntered = new Date(lifecycle.state_entered_at);
      fieldValue = Math.floor((new Date() - stateEntered) / (1000 * 60 * 60 * 24));
      break;
    case 'session_frequency':
      const weeklyData = retention?.weekly_engagement?.[retention.weekly_engagement.length - 1];
      fieldValue = weeklyData?.sessions || 0;
      break;
    case 'last_activity_days':
      const lastActivity = lifecycle.lifecycle_metrics?.last_meaningful_activity;
      fieldValue = lastActivity 
        ? Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24))
        : 999;
      break;
    case 'user_type':
      fieldValue = user?.user_type || 'participant';
      break;
    case 'points_balance':
      fieldValue = 0;
      break;
    case 'badges_earned':
      fieldValue = 0;
      break;
    default:
      return false;
  }

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    case 'less_than':
      return Number(fieldValue) < Number(value);
    case 'between':
      const [min, max] = Array.isArray(value) ? value : [value, value];
      return Number(fieldValue) >= Number(min) && Number(fieldValue) <= Number(max);
    case 'in':
      return Array.isArray(value) ? value.includes(fieldValue) : false;
    case 'not_in':
      return Array.isArray(value) ? !value.includes(fieldValue) : true;
    case 'contains':
      return String(fieldValue).includes(String(value));
    default:
      return false;
  }
}

// Legacy format support
async function findMatchingUsersLegacy(base44, criteria) {
  let lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();

  if (criteria.lifecycle_states && criteria.lifecycle_states.length > 0) {
    lifecycleStates = lifecycleStates.filter(state => 
      criteria.lifecycle_states.includes(state.current_state)
    );
  }

  if (criteria.churn_risk_min !== undefined) {
    lifecycleStates = lifecycleStates.filter(state => 
      state.churn_risk_score >= criteria.churn_risk_min
    );
  }
  if (criteria.churn_risk_max !== undefined) {
    lifecycleStates = lifecycleStates.filter(state => 
      state.churn_risk_score <= criteria.churn_risk_max
    );
  }

  if (criteria.days_in_state_min !== undefined || criteria.days_in_state_max !== undefined) {
    lifecycleStates = lifecycleStates.filter(state => {
      const daysInState = calculateDaysInState(state);
      if (criteria.days_in_state_min !== undefined && daysInState < criteria.days_in_state_min) return false;
      if (criteria.days_in_state_max !== undefined && daysInState > criteria.days_in_state_max) return false;
      return true;
    });
  }

  return lifecycleStates.map(s => s.user_email);
}

function calculateDaysInState(state) {
  if (!state.state_entered_at) return 0;
  const entered = new Date(state.state_entered_at);
  const now = new Date();
  return Math.floor((now - entered) / (1000 * 60 * 60 * 24));
}