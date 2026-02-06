import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userEmail } = await req.json();
    
    // Fetch user's historical data
    const [userProfile, userPoints, participations, recognitions, wellnessGoals, badgeAwards] = await Promise.all([
      base44.entities.UserProfile.filter({ user_email: userEmail }).then(r => r[0]),
      base44.entities.UserPoints.filter({ user_email: userEmail }).then(r => r[0]),
      base44.entities.Participation.filter({ user_email: userEmail }),
      base44.entities.Recognition.filter({ 
        $or: [{ sender_email: userEmail }, { recipient_email: userEmail }]
      }),
      base44.entities.WellnessGoal.filter({ user_email: userEmail }),
      base44.entities.BadgeAward.filter({ user_email: userEmail })
    ]);
    
    // Fetch available options
    const [upcomingEvents, availableChallenges, activities] = await Promise.all([
      base44.entities.Event.filter({ 
        status: 'scheduled',
        scheduled_date: { $gte: new Date().toISOString() }
      }),
      base44.entities.TeamChallenge.filter({ status: 'active' }),
      base44.entities.Activity.list()
    ]);
    
    // Calculate user preferences
    const attendedEventTypes = participations
      .map(p => {
        const event = upcomingEvents.find(e => e.id === p.event_id);
        return event?.activity_type;
      })
      .filter(Boolean);
    
    const eventTypeFrequency = {};
    attendedEventTypes.forEach(type => {
      eventTypeFrequency[type] = (eventTypeFrequency[type] || 0) + 1;
    });
    
    const preferredTypes = Object.entries(eventTypeFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);
    
    // AI Analysis
    const analysisPrompt = `Generate personalized recommendations for a user based on their engagement data:

User Profile:
- Interests: ${userProfile?.interests?.join(', ') || 'Not set'}
- Hobbies: ${userProfile?.hobbies?.join(', ') || 'Not set'}
- Department: ${userProfile?.department || 'Unknown'}
- Total Points: ${userPoints?.total_points || 0}
- Tier: ${userPoints?.tier || 'bronze'}
- Badges: ${badgeAwards?.length || 0}

Historical Activity:
- Events Attended: ${participations.length}
- Preferred Event Types: ${preferredTypes.join(', ') || 'None yet'}
- Recognitions Given: ${recognitions.filter(r => r.sender_email === userEmail).length}
- Recognitions Received: ${recognitions.filter(r => r.recipient_email === userEmail).length}
- Wellness Goals: ${wellnessGoals.length} (${wellnessGoals.filter(w => w.status === 'completed').length} completed)

Available Options:
- Upcoming Events: ${upcomingEvents.length}
- Active Challenges: ${availableChallenges.length}

Provide:
1. Top 5 recommended events (with reasoning)
2. Top 3 recommended challenges (with reasoning)
3. Personalized goals to set
4. Areas to improve engagement`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_id: { type: "string" },
                reason: { type: "string" },
                match_score: { type: "number" }
              }
            }
          },
          recommended_challenges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                challenge_id: { type: "string" },
                reason: { type: "string" },
                match_score: { type: "number" }
              }
            }
          },
          suggested_goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                target_value: { type: "number" },
                reasoning: { type: "string" }
              }
            }
          },
          engagement_insights: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });
    
    // Enrich with actual data
    const enrichedEvents = recommendations.recommended_events?.map(rec => ({
      ...rec,
      event: upcomingEvents.find(e => e.id === rec.event_id)
    })).filter(r => r.event);
    
    const enrichedChallenges = recommendations.recommended_challenges?.map(rec => ({
      ...rec,
      challenge: availableChallenges.find(c => c.id === rec.challenge_id)
    })).filter(r => r.challenge);
    
    return Response.json({
      success: true,
      recommendations: {
        events: enrichedEvents,
        challenges: enrichedChallenges,
        goals: recommendations.suggested_goals,
        insights: recommendations.engagement_insights
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});