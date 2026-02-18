import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered badge and reward suggestions based on engagement patterns
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch engagement data
    const [badges, rewards, challenges, participations, recognitions, userPoints] = await Promise.all([
      base44.asServiceRole.entities.Badge.list(),
      base44.asServiceRole.entities.StoreItem.list(),
      base44.asServiceRole.entities.Challenge.filter({ status: 'active' }),
      base44.asServiceRole.entities.Participation.list('-created_date', 200),
      base44.asServiceRole.entities.Recognition.list('-created_date', 100),
      base44.asServiceRole.entities.UserPoints.list()
    ]);

    // Analyze trending activities
    const activityCounts = {};
    participations.forEach(p => {
      if (p.attendance_status === 'attended') {
        activityCounts[p.event_id] = (activityCounts[p.event_id] || 0) + 1;
      }
    });

    const trendingActivities = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    // Calculate engagement metrics
    const avgPointsPerUser = userPoints.length > 0 
      ? userPoints.reduce((sum, up) => sum + (up.total_points || 0), 0) / userPoints.length 
      : 0;

    const activeUsers = userPoints.filter(up => (up.total_points || 0) > 0).length;
    const totalUsers = userPoints.length;
    const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(1) : 0;

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are a gamification expert designing engaging badges and rewards.

CURRENT STATE:
- Existing Badges: ${badges.length} (Types: ${[...new Set(badges.map(b => b.badge_type))].join(', ')})
- Existing Rewards: ${rewards.length} (Categories: ${[...new Set(rewards.map(r => r.category))].join(', ')})
- Active Challenges: ${challenges.length}
- Engagement Rate: ${engagementRate}%
- Avg Points/User: ${avgPointsPerUser.toFixed(0)}
- Recent Activity Spike: ${trendingActivities.length > 0 ? 'High participation in recent events' : 'Low participation'}

ENGAGEMENT PATTERNS:
- Top recognition categories: ${[...new Set(recognitions.slice(0, 20).map(r => r.category))].join(', ')}
- Challenge completion: ${challenges.filter(c => c.completion_count > 0).length}/${challenges.length}

Generate 8 innovative gamification suggestions in JSON format:
{
  "badge_suggestions": [
    {
      "badge_name": "Creative badge name",
      "badge_type": "achievement|milestone|skill|contribution|social",
      "description": "What this badge recognizes",
      "criteria": "Clear requirements to earn it",
      "rarity": "common|uncommon|rare|legendary",
      "points_value": number (50-500),
      "icon_suggestion": "lucide-react icon name",
      "rationale": "Why this badge fills a gap"
    }
  ],
  "reward_suggestions": [
    {
      "reward_name": "Appealing reward name",
      "category": "time_off|experience|swag|gift_card|team_lunch|donation",
      "description": "What the reward offers",
      "points_cost": number (500-5000),
      "tier_requirement": "bronze|silver|gold|platinum|diamond|null",
      "popularity_prediction": "high|medium|low",
      "rationale": "Why this would motivate users"
    }
  ],
  "insights": {
    "engagement_gaps": ["gap 1", "gap 2"],
    "untapped_motivators": ["motivator 1", "motivator 2"],
    "recommended_priority": "Focus on X to boost engagement"
  }
}

Rules:
- Design badges that recognize diverse achievements
- Create rewards that appeal to different user types
- Consider remote work context
- Balance aspirational with achievable
- Include social/team-based options`;

    const responseSchema = {
      type: "object",
      properties: {
        badge_suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              badge_name: { type: "string" },
              badge_type: { type: "string" },
              description: { type: "string" },
              criteria: { type: "string" },
              rarity: { type: "string" },
              points_value: { type: "number" },
              icon_suggestion: { type: "string" },
              rationale: { type: "string" }
            }
          }
        },
        reward_suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              reward_name: { type: "string" },
              category: { type: "string" },
              description: { type: "string" },
              points_cost: { type: "number" },
              tier_requirement: { type: "string" },
              popularity_prediction: { type: "string" },
              rationale: { type: "string" }
            }
          }
        },
        insights: {
          type: "object",
          properties: {
            engagement_gaps: { type: "array", items: { type: "string" } },
            untapped_motivators: { type: "array", items: { type: "string" } },
            recommended_priority: { type: "string" }
          }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role,
      functionName: 'aiGamificationSuggestions',
      prompt,
      responseSchema,
      agentName: 'GamificationAdvisor'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    return Response.json({
      success: true,
      suggestions: aiResult.data,
      context: {
        engagement_rate: `${engagementRate}%`,
        avg_points: avgPointsPerUser.toFixed(0),
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Gamification suggestions error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});