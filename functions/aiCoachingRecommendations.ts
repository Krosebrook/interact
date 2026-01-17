import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Manager or admin access required' }, { status: 403 });
    }

    const { target_user_email, team_id, focus_area } = await req.json();

    // Fetch comprehensive data
    const [userProfile, userPoints, participations, recognitions, comments, teams, activities, events, learningResources, badgeAwards] = await Promise.all([
      target_user_email ? base44.asServiceRole.entities.UserProfile.filter({ user_email: target_user_email }) : Promise.resolve([]),
      target_user_email ? base44.asServiceRole.entities.UserPoints.filter({ user_email: target_user_email }) : Promise.resolve([]),
      target_user_email ? base44.asServiceRole.entities.Participation.filter({ user_email: target_user_email }) : Promise.resolve([]),
      base44.asServiceRole.entities.Recognition.list('-created_date', 100),
      target_user_email ? base44.asServiceRole.entities.Comment.filter({ author_email: target_user_email }) : Promise.resolve([]),
      base44.asServiceRole.entities.Team.list(),
      base44.asServiceRole.entities.Activity.list(),
      base44.asServiceRole.entities.Event.list('-created_date', 50),
      base44.asServiceRole.entities.LearningResource.list(),
      target_user_email ? base44.asServiceRole.entities.BadgeAward.filter({ user_email: target_user_email }) : Promise.resolve([])
    ]);

    const profile = userProfile[0];
    const points = userPoints[0] || { total_points: 0, tier: 'bronze' };

    // Calculate engagement metrics
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentParticipations = participations.filter(p => new Date(p.created_date) > last30Days);
    const attendedEvents = participations.filter(p => p.attendance_status === 'attended');
    const recentComments = comments.filter(c => new Date(c.created_date) > last30Days);
    const receivedRecognitions = recognitions.filter(r => r.recipient_email === target_user_email);
    const givenRecognitions = recognitions.filter(r => r.sender_email === target_user_email);

    // Build coaching prompt
    const prompt = `As an employee engagement coach, analyze this employee's data and provide personalized coaching recommendations:

EMPLOYEE PROFILE:
- Email: ${target_user_email || 'Team-wide analysis'}
- Tier: ${points.tier}
- Total Points: ${points.total_points}
- Current Streak: ${points.current_streak || 0} days
${profile ? `- Skills: ${profile.skills?.map(s => s.skill_name).join(', ') || 'None listed'}` : ''}
${profile ? `- Career Goals: ${profile.career_goals?.map(g => g.goal).join(', ') || 'None set'}` : ''}

ENGAGEMENT METRICS (Last 30 days):
- Events attended: ${recentParticipations.length}
- Comments posted: ${recentComments.length}
- Recognitions given: ${givenRecognitions.filter(r => new Date(r.created_date) > last30Days).length}
- Recognitions received: ${receivedRecognitions.filter(r => new Date(r.created_date) > last30Days).length}

LIFETIME METRICS:
- Total events attended: ${attendedEvents.length}
- Total recognitions given: ${givenRecognitions.length}
- Total recognitions received: ${receivedRecognitions.length}
- Badges earned: ${badgeAwards.length}

SKILLS & DEVELOPMENT:
${profile?.skills ? `Current Skills: ${profile.skills.map(s => `${s.skill_name} (${s.proficiency})`).join(', ')}` : 'No skills listed'}
${profile?.career_goals ? `Career Goals: ${profile.career_goals.map(g => g.goal).join(', ')}` : 'No goals set'}

AVAILABLE LEARNING RESOURCES:
${learningResources.slice(0, 10).map(r => `- ${r.title} (${r.resource_type}): ${r.category}`).join('\n')}

${focus_area ? `FOCUS AREA: ${focus_area}` : ''}

Provide coaching recommendations in JSON format:
{
  "engagement_status": "thriving|active|moderate|at_risk|disengaged",
  "risk_score": number (0-100, higher = more risk),
  "strengths": ["strength1", "strength2"],
  "areas_for_growth": ["area1", "area2"],
  "interventions": [
    {
      "priority": "immediate|high|medium|low",
      "action": "specific action for manager to take",
      "rationale": "why this matters",
      "expected_outcome": "what to expect"
    }
  ],
  "recommended_activities": [
    {
      "activity_name": "name",
      "reason": "why this activity fits",
      "expected_benefit": "how it helps"
    }
  ],
  "skill_gaps": [
    {
      "skill": "missing or weak skill",
      "gap_severity": "critical|moderate|minor",
      "impact": "how this gap affects performance",
      "suggested_learning_path": "step by step development plan"
    }
  ],
  "skill_development_opportunities": [
    {
      "skill": "skill name",
      "current_level": "beginner|intermediate|advanced",
      "target_level": "intermediate|advanced|expert",
      "suggested_path": "how to develop",
      "estimated_time": "timeframe to proficiency",
      "matched_resources": ["resource title from available resources"]
    }
  ],
  "quick_wins": ["easy win 1", "easy win 2"],
  "talking_points": ["conversation starter 1", "conversation starter 2"]
}`;

    const aiCoaching = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          engagement_status: { type: "string" },
          risk_score: { type: "number" },
          strengths: { type: "array", items: { type: "string" } },
          areas_for_growth: { type: "array", items: { type: "string" } },
          interventions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "string" },
                action: { type: "string" },
                rationale: { type: "string" },
                expected_outcome: { type: "string" }
              }
            }
          },
          recommended_activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                activity_name: { type: "string" },
                reason: { type: "string" },
                expected_benefit: { type: "string" }
              }
            }
          },
          skill_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                gap_severity: { type: "string" },
                impact: { type: "string" },
                suggested_learning_path: { type: "string" }
              }
            }
          },
          skill_development_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                current_level: { type: "string" },
                target_level: { type: "string" },
                suggested_path: { type: "string" },
                estimated_time: { type: "string" },
                matched_resources: { type: "array", items: { type: "string" } }
              }
            }
          },
          quick_wins: { type: "array", items: { type: "string" } },
          talking_points: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Match activities
    const matchedActivities = aiCoaching.recommended_activities?.map(rec => {
      const activity = activities.find(a => 
        a.title.toLowerCase().includes(rec.activity_name.toLowerCase()) ||
        rec.activity_name.toLowerCase().includes(a.title.toLowerCase())
      );
      return { ...rec, activity_id: activity?.id, matched: !!activity };
    }) || [];

    // Match learning resources
    const enhancedSkillDev = aiCoaching.skill_development_opportunities?.map(skill => {
      const matchedResources = skill.matched_resources?.map(resTitle => {
        return learningResources.find(r => 
          r.title.toLowerCase().includes(resTitle.toLowerCase()) ||
          resTitle.toLowerCase().includes(r.title.toLowerCase())
        );
      }).filter(Boolean) || [];
      
      return { ...skill, resource_objects: matchedResources };
    }) || [];

    return Response.json({
      success: true,
      coaching: {
        ...aiCoaching,
        recommended_activities: matchedActivities,
        skill_development_opportunities: enhancedSkillDev
      },
      employee_data: {
        email: target_user_email,
        tier: points.tier,
        total_points: points.total_points,
        events_attended: attendedEvents.length,
        engagement_score: (recentParticipations.length * 3) + (recentComments.length * 2) + (givenRecognitions.length)
      }
    });

  } catch (error) {
    console.error('Error generating coaching recommendations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});