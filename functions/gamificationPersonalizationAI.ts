import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, context } = await req.json();

    // Fetch user data for personalization
    const [userProfile, userPoints, participations, badges] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
      base44.asServiceRole.entities.UserPoints.filter({ user_email: user.email }).then(r => r[0]),
      base44.asServiceRole.entities.Participation.filter({ user_email: user.email }),
      base44.asServiceRole.entities.Badge.list()
    ]);

    switch (action) {
      case 'suggest_customizations': {
        const prompt = `You are an AI personalization expert for an employee engagement platform.

User Activity Profile:
- Total Points: ${userPoints?.total_points || 0}
- Current Tier: ${userPoints?.tier || 'bronze'}
- Events Attended: ${participations.length}
- Badges Earned: ${userPoints?.badges_earned?.length || 0}
- Current Streak: ${userPoints?.current_streak || 0}
- Engagement Level: ${participations.length > 20 ? 'High' : participations.length > 10 ? 'Medium' : 'Low'}

Current Settings:
- Notification Preferences: ${JSON.stringify(userProfile?.notification_preferences || {})}
- Activity Preferences: ${JSON.stringify(userProfile?.activity_preferences || {})}

Based on their activity pattern, suggest:
1. Optimal notification settings (what to enable/disable)
2. Recommended dashboard widgets to display
3. Realistic personal goals (weekly points target, tier goal)
4. Flair/customization options that match their achievement level
5. Feature recommendations to boost engagement

Make suggestions specific, actionable, and personalized.`;

        const suggestions = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              notification_recommendations: {
                type: "object",
                properties: {
                  suggested_settings: { type: "object" },
                  reasoning: { type: "string" }
                }
              },
              widget_recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    widget_id: { type: "string" },
                    widget_name: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    reason: { type: "string" }
                  }
                }
              },
              goal_recommendations: {
                type: "object",
                properties: {
                  weekly_points_target: { type: "number" },
                  tier_goal: { type: "string" },
                  timeline: { type: "string" },
                  rationale: { type: "string" }
                }
              },
              flair_recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["border", "badge", "title", "effect"] },
                    name: { type: "string" },
                    unlock_criteria: { type: "string" },
                    is_unlocked: { type: "boolean" }
                  }
                }
              },
              engagement_boosters: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    feature: { type: "string" },
                    description: { type: "string" },
                    expected_impact: { type: "string" }
                  }
                }
              },
              personalized_message: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, suggestions });
      }

      case 'validate_goals': {
        const { weekly_points_target, tier_goal } = context;
        
        const prompt = `Validate and provide feedback on these gamification goals:

User Stats:
- Current Points: ${userPoints?.total_points || 0}
- Current Tier: ${userPoints?.tier || 'bronze'}
- Average Weekly Points: ${Math.round((userPoints?.total_points || 0) / 12)}
- Activity Level: ${participations.length > 20 ? 'High' : 'Medium'}

Proposed Goals:
- Weekly Points Target: ${weekly_points_target}
- Desired Tier: ${tier_goal}

Provide:
1. Feasibility assessment (realistic/ambitious/unrealistic)
2. Recommended adjustments if needed
3. Actionable steps to achieve goals
4. Timeline estimate`;

        const validation = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              feasibility: { type: "string", enum: ["realistic", "ambitious", "unrealistic"] },
              feedback: { type: "string" },
              adjusted_weekly_target: { type: "number" },
              adjusted_tier_goal: { type: "string" },
              action_steps: { type: "array", items: { type: "string" } },
              timeline: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, validation });
      }

      case 'recommend_flair': {
        const earnedBadges = badges.filter(b => userPoints?.badges_earned?.includes(b.id));
        
        const prompt = `Recommend profile flair customizations for this user:

Achievement Profile:
- Points: ${userPoints?.total_points || 0}
- Tier: ${userPoints?.tier || 'bronze'}
- Badges: ${earnedBadges.length}
- Streak: ${userPoints?.current_streak || 0} days
- Events: ${participations.length}

Suggest 5-8 unique flair options:
- Avatar borders (based on tier/achievements)
- Badge displays (showcase special badges)
- Profile titles (earned through milestones)
- Visual effects (for top performers)

Include both unlocked options and aspirational locked options.`;

        const flairOptions = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              flair_options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    type: { type: "string", enum: ["border", "badge_showcase", "title", "effect"] },
                    name: { type: "string" },
                    description: { type: "string" },
                    preview_url: { type: "string" },
                    is_unlocked: { type: "boolean" },
                    unlock_requirement: { type: "string" },
                    rarity: { type: "string", enum: ["common", "rare", "epic", "legendary"] }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, flair_options: flairOptions.flair_options });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Gamification Personalization AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process personalization request' 
    }, { status: 500 });
  }
});