import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, onboarding_id } = await req.json();

    // Get onboarding record and analytics
    const [onboarding, events] = await Promise.all([
      base44.entities.UserOnboarding.filter({ id: onboarding_id }),
      base44.entities.AnalyticsEvent.filter({
        user_email,
        event_type: 'onboarding_step_completed'
      })
    ]);

    if (!onboarding || onboarding.length === 0) {
      return Response.json({ error: 'Onboarding not found' }, { status: 404 });
    }

    const record = onboarding[0];
    const completedSteps = events?.filter(e => 
      e.created_date && new Date(e.created_date) > new Date(record.start_date)
    ).length || 0;

    // Get user's feature usage to understand their needs
    const featureEvents = await base44.entities.AnalyticsEvent.filter({
      user_email,
      event_type: 'feature_use'
    }).catch(() => []);

    const featureUsage = {};
    featureEvents.forEach(e => {
      featureUsage[e.feature_name] = (featureUsage[e.feature_name] || 0) + 1;
    });

    // Use AI to generate personalized recommendations
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `A user is struggling with onboarding. Adjust their journey:

User Role: ${user.role === 'admin' ? 'admin' : user.user_type}
Days Since Start: ${Math.floor((Date.now() - new Date(record.start_date).getTime()) / (1000 * 60 * 60 * 24))}
Steps Completed: ${completedSteps}
Feature Usage: ${JSON.stringify(featureUsage)}

Suggest:
1. Which tasks to prioritize or simplify
2. Additional support resources
3. Whether to skip advanced features for now`,
      response_json_schema: {
        type: 'object',
        properties: {
          adjusted_tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          message: { type: 'string' },
          support_resources: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    // Update onboarding record with adjusted tasks
    await base44.entities.UserOnboarding.update(onboarding_id, {
      ai_generated_tasks: response.adjusted_tasks,
      last_adjustment_date: new Date().toISOString()
    });

    // Create notification with support resources
    await base44.entities.Notification.create({
      user_email,
      type: 'system',
      title: 'Onboarding Plan Updated',
      message: response.message,
      priority: 'normal'
    });

    return Response.json({
      adjusted: true,
      message: response.message,
      new_tasks: response.adjusted_tasks
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});