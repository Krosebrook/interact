import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id } = await req.json();

    // Fetch team
    const teams = await base44.asServiceRole.entities.Team.filter({ id: team_id });
    if (!teams.length) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }

    const team = teams[0];

    // Verify authorization
    if (team.leader_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Fetch team members and their data
    const memberships = await base44.asServiceRole.entities.TeamMembership.filter({ team_id });
    const memberEmails = memberships.map(m => m.user_email);

    // Fetch all member data in parallel
    const [memberPoints, memberProfiles, allParticipations, allRecognitions, allLedger] = await Promise.all([
      base44.asServiceRole.entities.UserPoints.filter({}),
      base44.asServiceRole.entities.UserProfile.filter({}),
      base44.asServiceRole.entities.Participation.filter({}),
      base44.asServiceRole.entities.Recognition.filter({ status: 'approved' }),
      base44.asServiceRole.entities.PointsLedger.filter({})
    ]);

    // Filter to team members
    const teamMemberPoints = memberPoints.filter(p => memberEmails.includes(p.user_email));
    const teamProfiles = memberProfiles.filter(p => memberEmails.includes(p.user_email));
    const teamParticipations = allParticipations.filter(p => memberEmails.includes(p.user_email));
    const teamRecognitions = allRecognitions.filter(r => 
      memberEmails.includes(r.sender_email) || memberEmails.includes(r.recipient_email)
    );
    const teamLedger = allLedger.filter(l => memberEmails.includes(l.user_email));

    // Analyze each member
    const memberAnalyses = memberEmails.map(email => {
      const points = teamMemberPoints.find(p => p.user_email === email);
      const profile = teamProfiles.find(p => p.user_email === email);
      const participations = teamParticipations.filter(p => p.user_email === email);
      const recognitionsReceived = teamRecognitions.filter(r => r.recipient_email === email);
      const recognitionsGiven = teamRecognitions.filter(r => r.sender_email === email);
      const ledgerEntries = teamLedger.filter(l => l.user_email === email);

      // Calculate metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentParticipations = participations.filter(p => 
        new Date(p.created_date) > thirtyDaysAgo && p.attendance_status === 'attended'
      );
      const recentRecognitions = recognitionsReceived.filter(r => 
        new Date(r.created_date) > thirtyDaysAgo
      );
      const recentLedger = ledgerEntries.filter(l => 
        new Date(l.created_date) > thirtyDaysAgo
      ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

      // Trend analysis
      const firstHalfLedger = recentLedger.slice(0, Math.floor(recentLedger.length / 2));
      const secondHalfLedger = recentLedger.slice(Math.floor(recentLedger.length / 2));
      const firstHalfPoints = firstHalfLedger.reduce((sum, l) => sum + l.amount, 0);
      const secondHalfPoints = secondHalfLedger.reduce((sum, l) => sum + l.amount, 0);
      const trend = secondHalfPoints > firstHalfPoints ? 'increasing' : 
                    secondHalfPoints < firstHalfPoints ? 'decreasing' : 'stable';

      // Skill gap analysis
      const interestedSkills = profile?.skill_interests || [];
      const currentSkills = profile?.skill_levels?.map(s => s.skill) || [];
      const skillGaps = interestedSkills.filter(skill => !currentSkills.includes(skill));

      return {
        email,
        total_points: points?.total_points || 0,
        current_streak: points?.current_streak || 0,
        recent_events: recentParticipations.length,
        recent_recognitions: recentRecognitions.length,
        recognitions_given: recognitionsGiven.length,
        trend,
        avg_engagement: participations.length > 0 
          ? Math.round(participations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / participations.length)
          : 0,
        skill_interests: interestedSkills,
        current_skills: currentSkills,
        skill_gaps: skillGaps,
        activity_preferences: profile?.activity_preferences?.preferred_types || [],
        last_activity: participations.length > 0 
          ? Math.max(...participations.map(p => new Date(p.created_date).getTime()))
          : null
      };
    });

    // Categorize members
    const avgPoints = memberAnalyses.reduce((sum, m) => sum + m.total_points, 0) / memberAnalyses.length;
    const atRiskMembers = memberAnalyses.filter(m => 
      (m.trend === 'decreasing' || m.recent_events < 2 || m.current_streak === 0) &&
      m.total_points < avgPoints * 0.7
    );
    const excellingMembers = memberAnalyses.filter(m => 
      m.trend === 'increasing' && m.total_points > avgPoints * 1.3 && m.recent_events >= 3
    );

    // Generate AI coaching insights
    const atRiskPromises = atRiskMembers.slice(0, 5).map(async (member) => {
      const prompt = `You are an AI coach helping a team leader with a team member who may be disengaging.

Member Data:
- Recent Events: ${member.recent_events} (last 30 days)
- Points Trend: ${member.trend}
- Current Streak: ${member.current_streak} days
- Recent Recognitions: ${member.recent_recognitions}
- Avg Engagement Score: ${member.avg_engagement}/10
- Days Since Last Activity: ${member.last_activity ? Math.round((Date.now() - member.last_activity) / (1000 * 60 * 60 * 24)) : 'Unknown'}

Provide:
1. Risk level (low/medium/high)
2. 3 specific coaching strategies (action-oriented, empathetic)
3. Suggested conversation starters (2-3)
4. Recommended immediate actions

Be empathetic, constructive, and focused on re-engagement.`;

      const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_level: { type: "string", enum: ["low", "medium", "high"] },
            coaching_strategies: { type: "array", items: { type: "string" } },
            conversation_starters: { type: "array", items: { type: "string" } },
            immediate_actions: { type: "array", items: { type: "string" } }
          }
        }
      });

      return { ...member, coaching: response };
    });

    const excellingPromises = excellingMembers.slice(0, 5).map(async (member) => {
      const prompt = `You are an AI coach helping a team leader recognize and leverage a high-performing team member.

Member Data:
- Recent Events: ${member.recent_events}
- Points Trend: ${member.trend}
- Total Points: ${member.total_points}
- Recent Recognitions: ${member.recent_recognitions}
- Recognitions Given: ${member.recognitions_given}

Provide:
1. Performance level (high/exceptional)
2. 3 ways to leverage their excellence (mentorship, leadership opportunities)
3. Recognition message suggestions (2)
4. Development opportunities to keep them engaged

Focus on growth, recognition, and preventing burnout.`;

      const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            performance_level: { type: "string", enum: ["high", "exceptional"] },
            leverage_opportunities: { type: "array", items: { type: "string" } },
            recognition_suggestions: { type: "array", items: { type: "string" } },
            development_opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });

      return { ...member, coaching: response };
    });

    // Skill gap analysis
    const allSkillGaps = memberAnalyses.flatMap(m => m.skill_gaps);
    const skillGapCounts = allSkillGaps.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

    const topSkillGaps = Object.entries(skillGapCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, affected_members: count }));

    // Generate skill development recommendations
    let skillRecommendations = [];
    if (topSkillGaps.length > 0) {
      const skillPrompt = `You are an AI coach analyzing skill gaps in a team.

Top Skill Gaps:
${topSkillGaps.map(g => `- ${g.skill}: ${g.affected_members} members interested`).join('\n')}

For each skill, provide:
1. 2-3 relevant learning activities that could be organized
2. External resource recommendations (courses, workshops)
3. Internal mentorship opportunities

Focus on practical, achievable learning paths.`;

      const skillResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: skillPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  activities: { type: "array", items: { type: "string" } },
                  resources: { type: "array", items: { type: "string" } },
                  mentorship_ideas: { type: "string" }
                }
              }
            }
          }
        }
      });

      skillRecommendations = skillResponse.recommendations;
    }

    const [atRiskCoaching, excellingCoaching] = await Promise.all([
      Promise.all(atRiskPromises),
      Promise.all(excellingPromises)
    ]);

    return Response.json({
      success: true,
      team_summary: {
        total_members: memberAnalyses.length,
        avg_points: Math.round(avgPoints),
        at_risk_count: atRiskMembers.length,
        excelling_count: excellingMembers.length
      },
      at_risk_members: atRiskCoaching,
      excelling_members: excellingCoaching,
      skill_gaps: {
        top_gaps: topSkillGaps,
        recommendations: skillRecommendations
      }
    });

  } catch (error) {
    console.error('Team Coaching AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate coaching insights' 
    }, { status: 500 });
  }
});