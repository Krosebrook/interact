import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Manager or admin access required' }, { status: 403 });
    }

    const { team_id, goal_description, duration_days } = await req.json();

    // Fetch team data
    const [team, teamMembers, teamAnalytics, activities] = await Promise.all([
      team_id ? base44.asServiceRole.entities.Team.filter({ id: team_id }).then(r => r[0]) : Promise.resolve(null),
      team_id ? base44.asServiceRole.entities.TeamMembership.filter({ team_id }) : Promise.resolve([]),
      team_id ? base44.asServiceRole.entities.TeamAnalytics.filter({ team_id }) : Promise.resolve([]),
      base44.asServiceRole.entities.Activity.list()
    ]);

    const recentAnalytics = teamAnalytics[0] || {};

    const prompt = `Design a team challenge that drives engagement and achieves this goal:

GOAL: ${goal_description || 'Increase team collaboration and engagement'}
${team ? `TEAM: ${team.name} (${teamMembers.length} members)` : 'Company-wide challenge'}
${duration_days ? `DURATION: ${duration_days} days` : ''}

TEAM CONTEXT:
${recentAnalytics.avg_engagement_score ? `- Current engagement: ${recentAnalytics.avg_engagement_score}/100` : ''}
${recentAnalytics.total_points ? `- Total points this period: ${recentAnalytics.total_points}` : ''}

AVAILABLE ACTIVITIES:
${activities.slice(0, 15).map(a => `- ${a.title} (${a.activity_type})`).join('\n')}

Create a structured team challenge in JSON format:
{
  "challenge_name": "Engaging challenge name",
  "description": "Clear description of the challenge and its purpose",
  "challenge_type": "points|events|recognition|learning|wellness|custom",
  "duration_days": number,
  "target_metric": {
    "metric_type": "total_points|events_attended|recognitions_given|custom_count",
    "target_value": number,
    "description": "What to measure"
  },
  "milestones": [
    {
      "milestone_name": "name",
      "threshold": number,
      "reward_points": number,
      "description": "what achieving this unlocks"
    }
  ],
  "recommended_activities": [
    {
      "activity_name": "from available activities",
      "frequency": "daily|weekly|bi-weekly",
      "reason": "why this activity helps"
    }
  ],
  "team_incentives": {
    "individual_rewards": "what individuals get",
    "team_reward": "what the team gets if goal met",
    "bonus_multiplier": number
  },
  "engagement_tactics": ["tactic1", "tactic2"],
  "tracking_tips": ["how to monitor progress"],
  "celebration_ideas": ["how to celebrate wins"]
}`

    const aiChallenge = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          challenge_name: { type: "string" },
          description: { type: "string" },
          challenge_type: { type: "string" },
          duration_days: { type: "number" },
          target_metric: {
            type: "object",
            properties: {
              metric_type: { type: "string" },
              target_value: { type: "number" },
              description: { type: "string" }
            }
          },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                milestone_name: { type: "string" },
                threshold: { type: "number" },
                reward_points: { type: "number" },
                description: { type: "string" }
              }
            }
          },
          recommended_activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                activity_name: { type: "string" },
                frequency: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          team_incentives: {
            type: "object",
            properties: {
              individual_rewards: { type: "string" },
              team_reward: { type: "string" },
              bonus_multiplier: { type: "number" }
            }
          },
          engagement_tactics: { type: "array", items: { type: "string" } },
          tracking_tips: { type: "array", items: { type: "string" } },
          celebration_ideas: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      challenge: aiChallenge,
      team_context: {
        team_name: team?.name,
        member_count: teamMembers.length
      }
    });

  } catch (error) {
    console.error('Error generating team challenge:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});