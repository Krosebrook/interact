import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, query, report_type } = await req.json();

    switch (action) {
      case 'generate_report':
        return await generateEngagementReport(base44, report_type);
      
      case 'system_health_check':
        return await systemHealthCheck(base44);
      
      case 'custom_query':
        return await handleCustomQuery(base44, query);
      
      case 'trend_analysis':
        return await longTermTrendAnalysis(base44);
      
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateEngagementReport(base44, reportType) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [users, events, onboarding, participations] = await Promise.all([
    base44.asServiceRole.entities.User.list(),
    base44.asServiceRole.entities.AnalyticsEvent.filter({
      created_date: { $gte: thirtyDaysAgo.toISOString() }
    }),
    base44.asServiceRole.entities.UserOnboarding.list(),
    base44.asServiceRole.entities.Participation.filter({
      created_date: { $gte: thirtyDaysAgo.toISOString() }
    })
  ]);

  const activeUsers = new Set(events.map(e => e.user_email)).size;
  const dau = activeUsers;
  const completedOnboarding = onboarding.filter(o => o.status === 'completed').length;
  const eventAttendance = participations.filter(p => p.attendance_status === 'attended').length;

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Generate a comprehensive engagement report with the following data:

Total Users: ${users.length}
Active Users (30d): ${activeUsers}
DAU Rate: ${((dau / users.length) * 100).toFixed(1)}%
Onboarding Completion: ${completedOnboarding}/${onboarding.length} (${((completedOnboarding / onboarding.length) * 100).toFixed(1)}%)
Event Attendance (30d): ${eventAttendance}

Provide:
1. Executive Summary
2. Key Findings
3. Engagement Trends
4. Areas of Concern
5. Actionable Recommendations`,
    response_json_schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        key_metrics: {
          type: 'object',
          properties: {
            engagement_score: { type: 'number' },
            trend: { type: 'string' }
          }
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              priority: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return Response.json({
    report_type: 'engagement',
    ...response,
    downloadable: true
  });
}

async function systemHealthCheck(base44) {
  const [users, events, integrations] = await Promise.all([
    base44.asServiceRole.entities.User.list(),
    base44.asServiceRole.entities.AnalyticsEvent.filter({
      event_type: 'feature_use',
      created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
    }),
    base44.asServiceRole.entities.Integration.list()
  ]);

  const issues = [];

  // Check for inactive users
  const recentActiveUsers = new Set(events.map(e => e.user_email));
  const inactiveCount = users.length - recentActiveUsers.size;
  if (inactiveCount > users.length * 0.3) {
    issues.push({
      type: 'user_engagement',
      severity: 'high',
      description: `${inactiveCount} users (${((inactiveCount / users.length) * 100).toFixed(1)}%) inactive in last 24h`
    });
  }

  // Check integration health
  const activeIntegrations = integrations.filter(i => i.is_enabled);
  if (activeIntegrations.length === 0) {
    issues.push({
      type: 'integrations',
      severity: 'medium',
      description: 'No active integrations configured'
    });
  }

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Analyze system health and provide recommendations:

Issues Found:
${JSON.stringify(issues, null, 2)}

Total Users: ${users.length}
Active (24h): ${recentActiveUsers.size}
Total Events (24h): ${events.length}

Provide analysis and recommendations.`,
    response_json_schema: {
      type: 'object',
      properties: {
        analysis: { type: 'string' },
        health_score: { type: 'number' },
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              priority: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return Response.json(response);
}

async function handleCustomQuery(base44, query) {
  // Check if query is about creating a role
  if (query.toLowerCase().includes('role') && (query.toLowerCase().includes('create') || query.toLowerCase().includes('permission'))) {
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Parse this role creation request and generate a CustomRole entity configuration:

Request: "${query}"

Generate a complete role configuration with:
- role_name
- role_key (lowercase, underscored)
- description
- permissions object with all relevant modules and actions`,
      response_json_schema: {
        type: 'object',
        properties: {
          role_config: {
            type: 'object',
            properties: {
              role_name: { type: 'string' },
              role_key: { type: 'string' },
              description: { type: 'string' },
              permissions: { type: 'object' }
            }
          },
          explanation: { type: 'string' }
        }
      }
    });

    return Response.json({
      content: response.explanation,
      role_config: response.role_config
    });
  }

  // General query
  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an AI assistant for an employee engagement platform administrator. Answer this query:

"${query}"

Provide helpful, actionable advice.`
  });

  return Response.json({ content: response });
}

async function longTermTrendAnalysis(base44) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [analyticsEvents, users, onboarding] = await Promise.all([
    base44.asServiceRole.entities.AnalyticsEvent.filter({
      created_date: { $gte: oneYearAgo.toISOString() }
    }),
    base44.asServiceRole.entities.User.list(),
    base44.asServiceRole.entities.UserOnboarding.list()
  ]);

  // Group by quarter
  const quarterlyData = {};
  analyticsEvents.forEach(event => {
    const date = new Date(event.created_date);
    const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    if (!quarterlyData[quarter]) {
      quarterlyData[quarter] = { events: 0, users: new Set() };
    }
    quarterlyData[quarter].events += 1;
    quarterlyData[quarter].users.add(event.user_email);
  });

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Analyze long-term trends (quarterly/annual):

User Adoption:
- Total Users: ${users.length}
- Onboarding Completion: ${onboarding.filter(o => o.status === 'completed').length}

Quarterly Engagement:
${Object.entries(quarterlyData).map(([q, data]) => `${q}: ${data.events} events, ${data.users.size} active users`).join('\n')}

Provide:
1. User adoption trends
2. Engagement pattern changes
3. Growth recommendations
4. Feature adoption insights
5. Retention metrics`,
    response_json_schema: {
      type: 'object',
      properties: {
        analysis: { type: 'string' },
        quarterly_trends: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              quarter: { type: 'string' },
              insight: { type: 'string' }
            }
          }
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              priority: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return Response.json({
    report_type: 'trend_analysis',
    ...response
  });
}