import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate personalized gamification nudges for a user
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's gamification data
    const [userPoints, badgeAwards, challengeParticipations, personalGoals, profile] = await Promise.all([
      base44.entities.UserPoints.filter({ user_email: user.email }).then(r => r[0]),
      base44.entities.BadgeAward.filter({ user_email: user.email }),
      base44.entities.ChallengeParticipation.filter({ user_email: user.email, status: 'active' }),
      base44.entities.PersonalGoal.filter({ user_email: user.email, status: 'active' }),
      base44.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0])
    ]);

    // Fetch available opportunities
    const [activeChallenges, availableBadges, upcomingEvents] = await Promise.all([
      base44.entities.Challenge.filter({ status: 'active' }),
      base44.entities.Badge.list(),
      base44.entities.Event.filter({ 
        status: 'scheduled',
        scheduled_date: { $gte: new Date().toISOString() }
      }, 'scheduled_date', 5)
    ]);

    // Calculate engagement metrics
    const pointsThisMonth = userPoints?.points_this_month || 0;
    const daysActive = userPoints?.activity_streak || 0;
    const nextLevel = (Math.floor((userPoints?.level || 1) / 10) + 1) * 10;
    const pointsToNextLevel = (nextLevel * 100) - (userPoints?.total_points || 0);

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are a motivational gamification coach creating personalized nudges.

USER PROFILE:
- Level: ${userPoints?.level || 1}
- Total Points: ${userPoints?.total_points || 0}
- Points to Next Level: ${pointsToNextLevel}
- Activity Streak: ${daysActive} days
- This Month: ${pointsThisMonth} points
- Badges Earned: ${badgeAwards.length}
- Active Challenges: ${challengeParticipations.length}
- Active Goals: ${personalGoals.length}

AVAILABLE OPPORTUNITIES:
- Open Challenges: ${activeChallenges.length}
- Upcoming Events: ${upcomingEvents.length}
- Unclaimed Badges: ${availableBadges.length - badgeAwards.length}

USER INTERESTS:
${profile?.interests?.length > 0 ? profile.interests.join(', ') : 'Not specified'}

Generate 5 personalized nudges in JSON format:
{
  "nudges": [
    {
      "message": "Short, motivational message (1-2 sentences)",
      "nudge_type": "level_progress|streak|challenge|badge|event|goal|social",
      "priority": "high|medium|low",
      "action_text": "Call to action button text",
      "action_url": "/page-name or createPageUrl('PageName')",
      "motivation_hook": "Why this matters to the user",
      "expected_points": number (estimated points from action),
      "expires_in_hours": number (24-168)
    }
  ]
}

Rules:
- Be encouraging and specific to user's progress
- Mix urgency with opportunity
- Reference their actual level/points/streak
- Include time-sensitive opportunities
- Keep tone positive and energetic
- Align with their interests if specified`;

    const responseSchema = {
      type: "object",
      properties: {
        nudges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              message: { type: "string" },
              nudge_type: { type: "string" },
              priority: { type: "string" },
              action_text: { type: "string" },
              action_url: { type: "string" },
              motivation_hook: { type: "string" },
              expected_points: { type: "number" },
              expires_in_hours: { type: "number" }
            }
          }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role,
      functionName: 'generateGamificationNudges',
      prompt,
      responseSchema,
      agentName: 'GamificationCoach'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    return Response.json({
      success: true,
      nudges: aiResult.data.nudges,
      user_context: {
        level: userPoints?.level || 1,
        points_to_next_level: pointsToNextLevel,
        streak: daysActive
      }
    });

  } catch (error) {
    console.error('Gamification nudges error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});