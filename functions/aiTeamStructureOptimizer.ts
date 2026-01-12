import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [
      teams,
      teamMemberships,
      analyticsEvents,
      channelMessages,
      recognitions
    ] = await Promise.all([
      base44.asServiceRole.entities.Team.list(),
      base44.asServiceRole.entities.TeamMembership.list(),
      base44.asServiceRole.entities.AnalyticsEvent.filter({
        event_category: 'engagement',
        created_date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }
      }),
      base44.asServiceRole.entities.ChannelMessage.filter({
        created_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      }),
      base44.asServiceRole.entities.Recognition.filter({
        created_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      })
    ]);

    // Analyze team engagement patterns
    const teamEngagement = {};
    teams.forEach(team => {
      const members = teamMemberships.filter(m => m.team_id === team.id);
      const memberEmails = members.map(m => m.user_email);
      
      const teamActivity = analyticsEvents.filter(e => memberEmails.includes(e.user_email)).length;
      const teamMessages = channelMessages.filter(m => memberEmails.includes(m.author_email)).length;
      const teamRecognitions = recognitions.filter(r => memberEmails.includes(r.from_user_email)).length;
      
      teamEngagement[team.id] = {
        name: team.team_name,
        size: members.length,
        activity: teamActivity,
        messages: teamMessages,
        recognitions: teamRecognitions,
        avg_activity_per_member: members.length > 0 ? (teamActivity / members.length).toFixed(1) : 0
      };
    });

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze team structures and suggest optimizations:

Team Data:
${JSON.stringify(teamEngagement, null, 2)}

Provide:
1. Optimal team size recommendations
2. Communication cadence suggestions per team
3. Team rebalancing suggestions (if teams are too large/small)
4. Cross-team collaboration opportunities
5. Red flags for team health issues`,
      response_json_schema: {
        type: 'object',
        properties: {
          optimal_structures: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                team_id: { type: 'string' },
                current_size: { type: 'number' },
                recommended_size: { type: 'number' },
                reasoning: { type: 'string' }
              }
            }
          },
          communication_cadence: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                team_id: { type: 'string' },
                suggested_frequency: { type: 'string' },
                recommended_channels: { type: 'array', items: { type: 'string' } },
                reasoning: { type: 'string' }
              }
            }
          },
          collaboration_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                teams: { type: 'array', items: { type: 'string' } },
                initiative: { type: 'string' },
                expected_benefit: { type: 'string' }
              }
            }
          },
          health_alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                team_id: { type: 'string' },
                issue: { type: 'string' },
                severity: { type: 'string' },
                recommended_action: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});