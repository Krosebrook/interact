import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'check_burnout_risk':
        return await checkBurnoutRisk(base44);
      
      case 'onboarding_intervention':
        return await onboardingIntervention(base44);
      
      case 'suggest_learning':
        return await suggestLearning(base44, data.user_email);
      
      case 'low_engagement_alert':
        return await lowEngagementAlert(base44);
      
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkBurnoutRisk(base44) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const events = await base44.asServiceRole.entities.AnalyticsEvent.filter({
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });

  const userActivity = {};
  events.forEach(e => {
    if (!userActivity[e.user_email]) {
      userActivity[e.user_email] = { count: 0, lastActive: e.created_date };
    }
    userActivity[e.user_email].count += 1;
    if (new Date(e.created_date) > new Date(userActivity[e.user_email].lastActive)) {
      userActivity[e.user_email].lastActive = e.created_date;
    }
  });

  const atRisk = [];
  for (const [email, activity] of Object.entries(userActivity)) {
    const daysSinceActive = (Date.now() - new Date(activity.lastActive)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive > 7 || activity.count < 5) {
      atRisk.push({
        email,
        risk_level: daysSinceActive > 14 ? 'high' : 'medium',
        days_inactive: Math.floor(daysSinceActive),
        activity_count: activity.count
      });
    }
  }

  // Send notifications to at-risk users
  await Promise.all(atRisk.map(user =>
    base44.asServiceRole.entities.Notification.create({
      user_email: user.email,
      type: 'system',
      title: 'Engagement Check-in',
      message: `We noticed you've been less active lately. Is everything okay? Your team is here to support you.`,
      priority: 'high'
    })
  ));

  return Response.json({ at_risk_count: atRisk.length, users: atRisk });
}

async function onboardingIntervention(base44) {
  const onboardingRecords = await base44.asServiceRole.entities.UserOnboarding.filter({
    status: 'in_progress'
  });

  const needsHelp = [];
  const now = Date.now();

  for (const record of onboardingRecords) {
    const startDate = new Date(record.start_date).getTime();
    const daysSinceStart = (now - startDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceStart > 7 && (record.tasks_completed || 0) < 3) {
      needsHelp.push({
        email: record.user_email,
        days_stuck: Math.floor(daysSinceStart),
        tasks_completed: record.tasks_completed || 0
      });
    }
  }

  // Send all notifications in parallel
  await Promise.all(needsHelp.map(user =>
    base44.asServiceRole.entities.Notification.create({
      user_email: user.email,
      type: 'system',
      title: 'Need help getting started?',
      message: 'Our team is here to help you complete your onboarding. Would you like a quick walkthrough?',
      priority: 'normal'
    })
  ));

  return Response.json({ intervention_count: needsHelp.length, users: needsHelp });
}

async function suggestLearning(base44, userEmail) {
  const user = await base44.asServiceRole.entities.User.filter({ email: userEmail });
  if (!user || user.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const userRole = user[0].role === 'admin' ? 'admin' : user[0].user_type;
  
  const events = await base44.asServiceRole.entities.AnalyticsEvent.filter({
    user_email: userEmail,
    event_category: 'engagement'
  });

  const featureUsage = {};
  events.forEach(e => {
    featureUsage[e.feature_name] = (featureUsage[e.feature_name] || 0) + 1;
  });

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Based on this user's activity, suggest 3 relevant learning paths.

Role: ${userRole}
Feature Usage: ${JSON.stringify(featureUsage)}

Suggest learning paths that help them grow in their role.`,
    response_json_schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              reason: { type: 'string' },
              priority: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return Response.json({ suggestions: response.suggestions });
}

async function lowEngagementAlert(base44) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const allUsers = await base44.asServiceRole.entities.User.list();
  const recentEvents = await base44.asServiceRole.entities.AnalyticsEvent.filter({
    created_date: { $gte: sevenDaysAgo.toISOString() }
  });

  const activeUsers = new Set(recentEvents.map(e => e.user_email));
  const inactive = allUsers.filter(u => !activeUsers.has(u.email));

  return Response.json({ inactive_count: inactive.length, inactive_users: inactive.map(u => u.email) });
}