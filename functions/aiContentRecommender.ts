import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { user_email } = await req.json();
    const targetEmail = user_email || user.email;

    // Fetch comprehensive user context
    const [profile, points, participations, challenges, learningResources, upcomingEvents, recentEvents, activities] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.filter({ user_email: targetEmail }).then(r => r[0]),
      base44.asServiceRole.entities.UserPoints.filter({ user_email: targetEmail }).then(r => r[0]),
      base44.asServiceRole.entities.Participation.filter({ user_email: targetEmail }, '-created_date', 50),
      base44.asServiceRole.entities.PersonalChallenge.filter({ created_by: targetEmail, status: 'active' }),
      base44.asServiceRole.entities.LearningResource.list(),
      base44.asServiceRole.entities.Event.list('-scheduled_date', 20),
      base44.asServiceRole.entities.Event.list('-created_date', 50),
      base44.asServiceRole.entities.Activity.list()
    ]);

    // Get skill gaps from coaching recommendations
    let skillGaps = [];
    try {
      const coachingResponse = await base44.asServiceRole.functions.invoke('aiCoachingRecommendations', {
        target_user_email: targetEmail,
        focus_area: 'skill development'
      });
      skillGaps = coachingResponse.data?.coaching?.skill_gaps || [];
    } catch (e) {
      console.log('Could not fetch coaching data:', e.message);
    }

    const attendedEventIds = participations.filter(p => p.attendance_status === 'attended').map(p => p.event_id);
    const attendedEvents = recentEvents.filter(e => attendedEventIds.includes(e.id));

    const prompt = `Analyze this user's profile and recommend personalized content to enhance their engagement and development:

USER CONTEXT:
- Role: ${user.role}
- User Type: ${profile?.job_title || 'Employee'}
- Department: ${profile?.department || 'Not specified'}
- Current Points: ${points?.total_points || 0}
- Engagement Streak: ${points?.current_streak || 0} days
- Events Attended: ${attendedEvents.length}

SKILLS & DEVELOPMENT:
${profile?.skills?.length > 0 ? `Current Skills: ${profile.skills.map(s => s.skill_name).join(', ')}` : 'No skills listed'}
${profile?.career_goals?.length > 0 ? `Career Goals: ${profile.career_goals.map(g => g.goal).join(', ')}` : 'No goals set'}
${skillGaps.length > 0 ? `Identified Skill Gaps: ${skillGaps.map(g => g.skill).join(', ')}` : ''}

ACTIVE CHALLENGES:
${challenges.map(c => `- ${c.challenge_name} (${c.challenge_type})`).join('\n') || 'None'}

RECENT ACTIVITY PATTERNS:
${attendedEvents.slice(0, 5).map(e => `- ${e.title} (${e.event_type})`).join('\n') || 'No recent events'}

AVAILABLE CONTENT:
Learning Resources (${learningResources.length}):
${learningResources.slice(0, 10).map(r => `- ${r.title} (${r.resource_type}): ${r.category}`).join('\n')}

Upcoming Events (${upcomingEvents.length}):
${upcomingEvents.filter(e => new Date(e.scheduled_date) > new Date()).slice(0, 10).map(e => `- ${e.title} (${e.event_type})`).join('\n')}

Activities (${activities.length}):
${activities.slice(0, 10).map(a => `- ${a.title} (${a.activity_type})`).join('\n')}

Provide personalized recommendations in JSON format:
{
  "learning_recommendations": [
    {
      "content_type": "learning_resource|event|activity|internal_document",
      "title": "content title",
      "description": "why this is recommended",
      "relevance_score": number (1-10),
      "match_reason": "skill gap|career goal|engagement pattern|challenge support",
      "estimated_time": "time to complete"
    }
  ],
  "event_recommendations": [
    {
      "event_title": "from available events",
      "why_attend": "personalized reason",
      "skill_development": "what skill this develops",
      "relevance_score": number (1-10)
    }
  ],
  "activity_recommendations": [
    {
      "activity_title": "from available activities",
      "benefit": "how this helps the user",
      "alignment": "what goal/gap this addresses",
      "relevance_score": number (1-10)
    }
  ],
  "personalized_message": "A brief, encouraging message about their journey and next steps"
}`;

    const aiRecommendations = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          learning_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                content_type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                relevance_score: { type: "number" },
                match_reason: { type: "string" },
                estimated_time: { type: "string" }
              }
            }
          },
          event_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_title: { type: "string" },
                why_attend: { type: "string" },
                skill_development: { type: "string" },
                relevance_score: { type: "number" }
              }
            }
          },
          activity_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                activity_title: { type: "string" },
                benefit: { type: "string" },
                alignment: { type: "string" },
                relevance_score: { type: "number" }
              }
            }
          },
          personalized_message: { type: "string" }
        }
      }
    });

    // Match recommendations to actual content
    const enhancedLearning = aiRecommendations.learning_recommendations?.map(rec => {
      const resource = learningResources.find(r => 
        r.title.toLowerCase().includes(rec.title.toLowerCase()) ||
        rec.title.toLowerCase().includes(r.title.toLowerCase())
      );
      return { ...rec, resource_object: resource, matched: !!resource };
    }) || [];

    const enhancedEvents = aiRecommendations.event_recommendations?.map(rec => {
      const event = upcomingEvents.find(e => 
        e.title.toLowerCase().includes(rec.event_title.toLowerCase()) ||
        rec.event_title.toLowerCase().includes(e.title.toLowerCase())
      );
      return { ...rec, event_object: event, matched: !!event };
    }) || [];

    const enhancedActivities = aiRecommendations.activity_recommendations?.map(rec => {
      const activity = activities.find(a => 
        a.title.toLowerCase().includes(rec.activity_title.toLowerCase()) ||
        rec.activity_title.toLowerCase().includes(a.title.toLowerCase())
      );
      return { ...rec, activity_object: activity, matched: !!activity };
    }) || [];

    return Response.json({
      success: true,
      recommendations: {
        learning: enhancedLearning,
        events: enhancedEvents,
        activities: enhancedActivities,
        message: aiRecommendations.personalized_message
      },
      user_context: {
        total_points: points?.total_points || 0,
        streak: points?.current_streak || 0,
        active_challenges: challenges.length
      }
    });

  } catch (error) {
    console.error('Error generating content recommendations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});