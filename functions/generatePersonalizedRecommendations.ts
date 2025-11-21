import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Personalized Gamification Recommendations Engine
 * Analyzes user behavior and generates AI-powered recommendations for:
 * - Next best actions to earn points/badges
 * - Personalized activity recommendations
 * - Reward suggestions based on points and preferences
 * - Adaptive learning paths to level up
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's gamification data
    const userPointsRecords = await base44.entities.UserPoints.filter({ 
      user_email: user.email 
    });
    const userPoints = userPointsRecords[0];

    if (!userPoints) {
      return Response.json({ 
        error: 'User points record not found',
        recommendations: []
      }, { status: 404 });
    }

    // Fetch related data
    const [allBadges, allRewards, userParticipations, upcomingEvents, allActivities] = await Promise.all([
      base44.asServiceRole.entities.Badge.list(),
      base44.asServiceRole.entities.Reward.filter({ is_available: true }),
      base44.asServiceRole.entities.Participation.filter({ participant_email: user.email }),
      base44.asServiceRole.entities.Event.filter({ status: 'scheduled' }),
      base44.asServiceRole.entities.Activity.list()
    ]);

    // Calculate user's activity preferences
    const activityTypePreferences = {};
    userParticipations.forEach(p => {
      const event = upcomingEvents.find(e => e.id === p.event_id);
      if (event) {
        const activity = allActivities.find(a => a.id === event.activity_id);
        if (activity) {
          activityTypePreferences[activity.type] = (activityTypePreferences[activity.type] || 0) + 1;
        }
      }
    });

    const favoriteActivityType = Object.entries(activityTypePreferences)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'social';

    // Get redemption history
    const userRedemptions = await base44.asServiceRole.entities.RewardRedemption.filter({ 
      user_email: user.email 
    });

    // Prepare context for AI
    const context = {
      user: {
        name: user.full_name,
        email: user.email,
        total_points: userPoints.total_points,
        level: userPoints.level,
        events_attended: userPoints.events_attended,
        activities_completed: userPoints.activities_completed,
        feedback_submitted: userPoints.feedback_submitted,
        badges_earned: userPoints.badges_earned?.length || 0,
        streak_days: userPoints.streak_days,
        last_activity_date: userPoints.last_activity_date,
        favorite_activity_type: favoriteActivityType
      },
      available_badges: allBadges.map(b => ({
        id: b.id,
        name: b.badge_name,
        description: b.badge_description,
        criteria: b.award_criteria,
        rarity: b.rarity,
        points_value: b.points_value
      })),
      earned_badge_ids: userPoints.badges_earned || [],
      available_rewards: allRewards.slice(0, 20).map(r => ({
        id: r.id,
        name: r.reward_name,
        description: r.description,
        points_cost: r.points_cost,
        category: r.category,
        stock: r.stock_quantity
      })),
      redemption_history: userRedemptions.map(r => ({
        reward_name: r.reward_name,
        points_spent: r.points_spent,
        date: r.created_date
      })),
      upcoming_events: upcomingEvents.slice(0, 10).map(e => {
        const activity = allActivities.find(a => a.id === e.activity_id);
        return {
          id: e.id,
          title: e.title,
          type: activity?.type,
          date: e.scheduled_date,
          points_awarded: e.points_awarded || 10
        };
      })
    };

    // Generate AI recommendations
    const prompt = `You are an expert gamification coach. Analyze this user's profile and generate personalized recommendations.

USER PROFILE:
- Name: ${context.user.name}
- Points: ${context.user.total_points}
- Level: ${context.user.level}
- Events Attended: ${context.user.events_attended}
- Badges Earned: ${context.user.badges_earned}
- Current Streak: ${context.user.streak_days} days
- Favorite Activity Type: ${context.user.favorite_activity_type}
- Last Active: ${context.user.last_activity_date || 'Recently'}

AVAILABLE BADGES (${allBadges.length} total):
${context.available_badges.slice(0, 5).map(b => `- ${b.name}: ${b.description} (${b.rarity})`).join('\n')}

UPCOMING EVENTS (${upcomingEvents.length} total):
${context.upcoming_events.slice(0, 5).map(e => `- ${e.title} (${e.type}) on ${e.date}`).join('\n')}

AVAILABLE REWARDS:
${context.available_rewards.slice(0, 5).map(r => `- ${r.name}: ${r.points_cost} points (${r.category})`).join('\n')}

Generate 4-6 highly personalized recommendations covering:
1. Next best action for points/badges (be specific!)
2. Activity recommendations matching their interests
3. Reward suggestions they can afford or save for
4. Level-up strategy with clear milestones

Each recommendation should:
- Have a catchy title
- Include specific, actionable advice
- Reference actual data (points needed, events available, etc.)
- Use motivational language
- Have a priority level (high/medium/low)
- Include an emoji that fits the recommendation type`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                action_type: { 
                  type: "string",
                  enum: ["earn_points", "earn_badge", "redeem_reward", "level_up", "attend_event", "maintain_streak"]
                },
                priority: { 
                  type: "string",
                  enum: ["high", "medium", "low"]
                },
                emoji: { type: "string" },
                points_impact: { type: "number" },
                estimated_effort: { type: "string" }
              }
            }
          },
          motivational_message: { type: "string" },
          next_milestone: {
            type: "object",
            properties: {
              description: { type: "string" },
              points_needed: { type: "number" },
              estimated_time: { type: "string" }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      user_context: {
        name: context.user.name,
        points: context.user.total_points,
        level: context.user.level,
        badges: context.user.badges_earned
      },
      recommendations: aiResponse.recommendations,
      motivational_message: aiResponse.motivational_message,
      next_milestone: aiResponse.next_milestone,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recommendation generation error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate recommendations',
      details: error.toString()
    }, { status: 500 });
  }
});