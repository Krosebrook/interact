import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered personalized content recommendation engine
 * Analyzes user profile, engagement history, and team context
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch comprehensive user context
    const [
      userProfile,
      userPoints,
      participations,
      teamMemberships,
      recentRecognitions,
      challenges,
      events,
      activities,
      learningPaths
    ] = await Promise.all([
      base44.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
      base44.entities.UserPoints.filter({ user_email: user.email }).then(r => r[0]),
      base44.entities.Participation.filter({ user_email: user.email }),
      base44.entities.TeamMembership.filter({ user_email: user.email }),
      base44.entities.Recognition.filter({ 
        $or: [{ from_user: user.email }, { to_user: user.email }] 
      }, '-created_date', 10),
      base44.entities.Challenge.filter({ status: 'active' }),
      base44.entities.Event.filter({ status: 'scheduled' }, '-scheduled_date', 20),
      base44.entities.Activity.list('-created_date', 30),
      base44.entities.LearningPath.list('-created_date', 10)
    ]);

    // Calculate engagement metrics
    const attendedEvents = participations.filter(p => p.attendance_status === 'attended').length;
    const totalRSVPs = participations.length;
    const engagementRate = totalRSVPs > 0 ? (attendedEvents / totalRSVPs) * 100 : 0;

    // Get team IDs
    const userTeamIds = teamMemberships.map(tm => tm.team_id);

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are a personalization engine for an employee engagement platform.

USER CONTEXT:
Role: ${user.role}
User Type: ${user.user_type || 'participant'}
Department: ${userProfile?.department || 'Not specified'}
Location: ${userProfile?.location || 'Not specified'}
Total Points: ${userPoints?.total_points || 0}
Engagement Rate: ${engagementRate.toFixed(1)}%
Teams: ${userTeamIds.length} team(s)
Recent Activity: ${participations.length} events, ${recentRecognitions.length} recognitions

USER INTERESTS & SKILLS:
Skills: ${userProfile?.skills?.map(s => s.skill_name).join(', ') || 'Not specified'}
Interests: ${userProfile?.interests?.join(', ') || 'Not specified'}
Hobbies: ${userProfile?.hobbies?.join(', ') || 'Not specified'}

AVAILABLE CONTENT:
- ${challenges.length} active challenges (types: ${[...new Set(challenges.map(c => c.challenge_type))].join(', ')})
- ${events.length} upcoming events (types: ${[...new Set(events.map(e => e.event_type))].join(', ')})
- ${activities.length} activities available
- ${learningPaths.length} learning paths

Provide PERSONALIZED recommendations in JSON format:
{
  "priority_recommendations": [
    {
      "type": "event|challenge|learning|activity",
      "id": "entity_id",
      "title": "content title",
      "reason": "Why this is perfect for this user (specific to their profile)",
      "relevance_score": 1-100,
      "tags": ["tag1", "tag2"]
    }
  ],
  "discovery_suggestions": [
    {
      "type": "event|challenge|learning|activity",
      "id": "entity_id",
      "title": "content title",
      "reason": "Why they should explore this",
      "tags": ["tag1", "tag2"]
    }
  ],
  "team_opportunities": [
    {
      "type": "team_event|team_challenge",
      "title": "content title",
      "reason": "Why their team would benefit",
      "call_to_action": "specific action"
    }
  ],
  "engagement_nudges": [
    {
      "message": "Friendly, personalized encouragement",
      "action_type": "attend_event|join_challenge|give_recognition|complete_profile",
      "urgency": "low|medium|high"
    }
  ],
  "learning_opportunities": [
    {
      "skill": "skill to develop",
      "reason": "Why this skill matters for their role/goals",
      "related_content": ["content type 1", "content type 2"]
    }
  ]
}

Rules:
- Top 5 priority recommendations only (highest relevance)
- Base suggestions on actual user data, not generic advice
- Consider role-specific needs (admin vs facilitator vs participant)
- Factor in engagement patterns (low engagement = easier entry points)
- Respect user's stated interests and skills`;

    const responseSchema = {
      type: "object",
      properties: {
        priority_recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              id: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
              relevance_score: { type: "number" },
              tags: { type: "array", items: { type: "string" } }
            }
          }
        },
        discovery_suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              id: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
              tags: { type: "array", items: { type: "string" } }
            }
          }
        },
        team_opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
              call_to_action: { type: "string" }
            }
          }
        },
        engagement_nudges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              message: { type: "string" },
              action_type: { type: "string" },
              urgency: { type: "string" }
            }
          }
        },
        learning_opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              skill: { type: "string" },
              reason: { type: "string" },
              related_content: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role,
      functionName: 'generatePersonalizedContent',
      prompt,
      responseSchema,
      agentName: 'PersonalizationEngine'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    // Enrich recommendations with actual entity data
    const enrichedRecommendations = {
      ...aiResult.data,
      user_context: {
        role: user.role,
        engagement_rate: engagementRate,
        total_points: userPoints?.total_points || 0,
        teams_count: userTeamIds.length
      },
      metadata: {
        generated_at: new Date().toISOString(),
        based_on_events: participations.length,
        available_content: {
          challenges: challenges.length,
          events: events.length,
          learning_paths: learningPaths.length
        }
      }
    };

    return Response.json({
      success: true,
      recommendations: enrichedRecommendations
    });

  } catch (error) {
    console.error('Personalized content error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});