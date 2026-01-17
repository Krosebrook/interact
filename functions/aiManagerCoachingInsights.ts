import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin' && user?.user_type !== 'facilitator') {
      return Response.json({ error: 'Forbidden: Manager access required' }, { status: 403 });
    }

    const { target_user_email, manager_email } = await req.json();

    // Fetch comprehensive employee data
    const [profile, userPoints, participations, challenges, learningPaths, events, learningModules, recognitions] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.filter({ user_email: target_user_email }).then(r => r[0]),
      base44.asServiceRole.entities.UserPoints.filter({ user_email: target_user_email }).then(r => r[0]),
      base44.asServiceRole.entities.Participation.filter({ user_email: target_user_email }),
      base44.asServiceRole.entities.PersonalChallenge.filter({ created_by: target_user_email }),
      base44.asServiceRole.entities.LearningPath.filter({ user_email: target_user_email }),
      base44.asServiceRole.entities.Event.list(),
      base44.asServiceRole.entities.ModuleCompletion.filter({ user_email: target_user_email }),
      base44.asServiceRole.entities.Recognition.filter({ recipient_email: target_user_email })
    ]);

    const attendedEventsCount = participations.filter(p => p.attendance_status === 'attended').length;
    const totalEventsInvited = participations.length;
    const attendanceRate = totalEventsInvited > 0 ? (attendedEventsCount / totalEventsInvited * 100).toFixed(2) : 0;
    
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const totalChallenges = challenges.length;
    const challengeCompletionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges * 100).toFixed(2) : 0;

    const skillProgressPercentage = learningPaths.filter(lp => lp.current_status === 'completed').length / (learningPaths.length || 1) * 100;

    // Detect recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentParticipations = participations.filter(p => new Date(p.created_date) > sevenDaysAgo);
    const recentChallenges = challenges.filter(c => new Date(c.created_date) > sevenDaysAgo);

    const prompt = `
    Analyze the following employee performance data and generate comprehensive coaching insights for their manager.
    Focus on: challenge completion, resource engagement, skill development, activity patterns, and disengagement risk.
    Output a JSON object with coaching points, development plans, and disengagement alerts.

    EMPLOYEE DATA:
    - Name: ${profile?.display_name || target_user_email}
    - Email: ${target_user_email}
    - Job Title: ${profile?.job_title || 'N/A'}
    - Department: ${profile?.department || 'N/A'}
    - Skills: ${profile?.skills?.map(s => s.skill_name + ' (' + s.proficiency + ')').join(', ') || 'None listed'}
    - Career Goals: ${profile?.career_goals?.map(g => g.goal).join(', ') || 'None set'}

    PERFORMANCE METRICS:
    - Total Points: ${userPoints?.total_points || 0}
    - Event Attendance Rate: ${attendanceRate}% (${attendedEventsCount}/${totalEventsInvited})
    - Challenge Completion Rate: ${challengeCompletionRate}% (${completedChallenges}/${totalChallenges})
    - Learning Paths Progress: ${skillProgressPercentage.toFixed(2)}% (${learningPaths.filter(lp => lp.current_status === 'completed').length}/${learningPaths.length || 1} completed)
    - Learning Modules Completed: ${learningModules.length}
    - Recognitions Received: ${recognitions.length}

    ACTIVITY TREND (Last 7 days):
    - Recent Event Participations: ${recentParticipations.length}
    - Recent Challenges Started: ${recentChallenges.length}
    - Overall Activity: ${recentParticipations.length + recentChallenges.length > 0 ? 'Active' : 'Inactive'}

    DISENGAGEMENT RISK INDICATORS:
    ${attendanceRate < 30 ? '- Low event attendance' : ''}
    ${challengeCompletionRate < 30 ? '- Low challenge engagement' : ''}
    ${recentParticipations.length === 0 && recentChallenges.length === 0 ? '- No recent activity' : ''}
    ${learningPaths.filter(lp => lp.current_status === 'in_progress').length > 2 ? '- Multiple unfinished learning paths (may indicate overwhelm)' : ''}

    Generate coaching insights including:
    1. 3-5 specific coaching points for one-on-one meetings.
    2. A personalized development plan addressing identified gaps.
    3. Disengagement risk assessment based on activity patterns and performance.
    4. Recommended supportive actions.

    OUTPUT JSON SCHEMA:
    {
      "performance_summary": "string (2-3 sentence summary of employee status)",
      "coaching_points": [
        {
          "point": "string",
          "context": "string (why this matters)",
          "urgency": "high|medium|low",
          "suggested_action": "string (what manager should do)",
          "follow_up_timing": "string (e.g., within 1 week)"
        }
      ],
      "development_plan": {
        "focus_areas": ["string"],
        "short_term_goals": ["string (30-60 days)"],
        "long_term_goals": ["string (6+ months)"],
        "recommended_resources": ["string"],
        "success_metrics": ["string"],
        "timeline": "string"
      },
      "disengagement_analysis": {
        "risk_level": "none|low|medium|high",
        "key_indicators": ["string"],
        "root_causes": ["string (inferred)"],
        "intervention_steps": ["string"]
      },
      "manager_recommendations": ["string"]
    }
    `;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          performance_summary: { type: "string" },
          coaching_points: {
            type: "array",
            items: {
              type: "object",
              properties: {
                point: { type: "string" },
                context: { type: "string" },
                urgency: { type: "string" },
                suggested_action: { type: "string" },
                follow_up_timing: { type: "string" }
              }
            }
          },
          development_plan: {
            type: "object",
            properties: {
              focus_areas: { type: "array", items: { type: "string" } },
              short_term_goals: { type: "array", items: { type: "string" } },
              long_term_goals: { type: "array", items: { type: "string" } },
              recommended_resources: { type: "array", items: { type: "string" } },
              success_metrics: { type: "array", items: { type: "string" } },
              timeline: { type: "string" }
            }
          },
          disengagement_analysis: {
            type: "object",
            properties: {
              risk_level: { type: "string" },
              key_indicators: { type: "array", items: { type: "string" } },
              root_causes: { type: "array", items: { type: "string" } },
              intervention_steps: { type: "array", items: { type: "string" } }
            }
          },
          manager_recommendations: { type: "array", items: { type: "string" } }
        },
        required: ["performance_summary", "coaching_points", "development_plan", "disengagement_analysis"]
      }
    });

    // Create CoachingInsight records
    const coachingPointInsight = await base44.asServiceRole.entities.CoachingInsight.create({
      user_email: target_user_email,
      manager_email,
      insight_type: 'coaching_point',
      title: `Coaching Points for ${profile?.display_name || target_user_email}`,
      description: aiResponse.performance_summary,
      performance_metrics: {
        challenge_completion_rate: parseFloat(challengeCompletionRate),
        resource_engagement_score: (learningModules.length / Math.max(learningPaths.length, 1) * 100),
        skill_progress_percentage: skillProgressPercentage,
        event_attendance_rate: parseFloat(attendanceRate),
        activity_trend: recentParticipations.length + recentChallenges.length > 0 ? 'increasing' : 'decreasing'
      },
      recommended_coaching_points: aiResponse.coaching_points,
      disengagement_risk_level: aiResponse.disengagement_analysis.risk_level,
      disengagement_indicators: aiResponse.disengagement_analysis.key_indicators,
      generated_at: new Date().toISOString(),
      status: 'new'
    });

    const developmentPlanInsight = await base44.asServiceRole.entities.CoachingInsight.create({
      user_email: target_user_email,
      manager_email,
      insight_type: 'development_plan',
      title: `Development Plan for ${profile?.display_name || target_user_email}`,
      description: `Personalized 6-month development roadmap`,
      performance_metrics: {
        challenge_completion_rate: parseFloat(challengeCompletionRate),
        resource_engagement_score: (learningModules.length / Math.max(learningPaths.length, 1) * 100),
        skill_progress_percentage: skillProgressPercentage,
        event_attendance_rate: parseFloat(attendanceRate)
      },
      personalized_development_plan: aiResponse.development_plan,
      generated_at: new Date().toISOString(),
      status: 'new'
    });

    return Response.json({ success: true, coachingPointInsight, developmentPlanInsight, analysis: aiResponse });

  } catch (error) {
    console.error('Error generating coaching insights:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});