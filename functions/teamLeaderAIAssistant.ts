import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, team_id, context } = await req.json();

    // Fetch team data
    const team = await base44.asServiceRole.entities.Team.filter({ id: team_id });
    if (!team.length) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify user is team leader
    if (team[0].leader_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Not authorized as team leader' }, { status: 403 });
    }

    // Fetch team members
    const memberships = await base44.asServiceRole.entities.TeamMembership.filter({
      team_id: team_id
    });

    // Fetch team member points
    const memberPoints = await base44.asServiceRole.entities.UserPoints.filter({
      team_id: team_id
    });

    // Fetch recent team activity
    const memberEmails = memberships.map(m => m.user_email);
    const recentRecognitions = await base44.asServiceRole.entities.Recognition.filter({});
    const teamRecognitions = recentRecognitions
      .filter(r => memberEmails.includes(r.sender_email) || memberEmails.includes(r.recipient_email))
      .slice(-20);

    const recentParticipations = await base44.asServiceRole.entities.Participation.filter({});
    const teamParticipations = recentParticipations
      .filter(p => memberEmails.includes(p.user_email))
      .slice(-30);

    // Build context for AI
    const teamContext = {
      team_name: team[0].team_name,
      member_count: memberships.length,
      total_points: team[0].total_points || 0,
      avg_points_per_member: memberships.length > 0 ? Math.round((team[0].total_points || 0) / memberships.length) : 0,
      recent_recognitions: teamRecognitions.length,
      recent_event_attendance: teamParticipations.filter(p => p.attendance_status === 'attended').length,
      top_performers: memberPoints
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .slice(0, 3)
        .map(p => ({ email: p.user_email, points: p.total_points })),
      engagement_trends: {
        low_engagement_members: memberPoints.filter(p => (p.total_points || 0) < 50).length,
        high_performers: memberPoints.filter(p => (p.total_points || 0) > 200).length
      }
    };

    let prompt = '';
    let responseSchema = null;

    switch (action) {
      case 'analyze_performance':
        prompt = `You are an AI assistant helping a team leader analyze their team's performance.

Team Data:
- Team Name: ${teamContext.team_name}
- Members: ${teamContext.member_count}
- Total Team Points: ${teamContext.total_points}
- Average Points per Member: ${teamContext.avg_points_per_member}
- Recent Recognitions: ${teamContext.recent_recognitions}
- Recent Event Attendance: ${teamContext.recent_event_attendance}
- Top 3 Performers: ${JSON.stringify(teamContext.top_performers)}
- Low Engagement Members: ${teamContext.engagement_trends.low_engagement_members}
- High Performers: ${teamContext.engagement_trends.high_performers}

Provide a comprehensive analysis with:
1. Overall team health assessment (score 1-10)
2. Key strengths (3-4 bullet points)
3. Areas for improvement (3-4 bullet points)
4. 3 specific actionable recommendations

Be concise, data-driven, and actionable.`;

        responseSchema = {
          type: "object",
          properties: {
            health_score: { type: "number" },
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        };
        break;

      case 'suggest_recognition':
        prompt = `You are an AI assistant helping a team leader write recognition messages.

Context: ${context?.context || 'General team recognition'}

Recent Team Activity:
- Recent recognitions given: ${teamContext.recent_recognitions}
- Event participation: ${teamContext.recent_event_attendance}
- Top performers: ${JSON.stringify(teamContext.top_performers)}

Generate 3 heartfelt, specific recognition message suggestions that:
- Are authentic and professional
- Mention specific contributions or behaviors
- Are 2-3 sentences each
- Feel personal, not generic

Each suggestion should have a title and message.`;

        responseSchema = {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  message: { type: "string" },
                  category: { 
                    type: "string",
                    enum: ["teamwork", "innovation", "leadership", "going_above", "customer_focus", "problem_solving", "mentorship", "culture_champion"]
                  }
                }
              }
            }
          }
        };
        break;

      case 'suggest_challenge':
        prompt = `You are an AI assistant helping a team leader create engaging team challenges.

Team Context:
- Team Size: ${teamContext.member_count}
- Current Engagement Level: ${teamContext.avg_points_per_member > 100 ? 'High' : teamContext.avg_points_per_member > 50 ? 'Medium' : 'Low'}
- Recent Activity: ${teamContext.recent_event_attendance} events attended
- Low Engagement Members: ${teamContext.engagement_trends.low_engagement_members}

Additional Context: ${context?.context || 'Create an engaging challenge for the team'}

Generate 3 creative team challenge ideas that:
- Are achievable and measurable
- Boost engagement and participation
- Are fun and team-oriented
- Have clear goals and timeframes

For each challenge provide: title, description, goal, duration, and expected impact.`;

        responseSchema = {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  goal: { type: "string" },
                  duration: { type: "string" },
                  challenge_type: { 
                    type: "string",
                    enum: ["points_race", "activity_count", "engagement", "custom"]
                  },
                  expected_impact: { type: "string" }
                }
              }
            }
          }
        };
        break;

      case 'draft_approval':
        prompt = `You are an AI assistant helping a team leader draft approval responses.

Recognition Details:
${context?.recognition_details || 'Recognition requiring approval'}

Team Context: ${teamContext.team_name} with ${teamContext.member_count} members

Draft a professional, warm approval message that:
- Acknowledges the recognition
- Reinforces positive behavior
- Is suitable for team visibility
- Is 2-3 sentences

Also provide suggestions for any additional notes the leader might want to add.`;

        responseSchema = {
          type: "object",
          properties: {
            approval_message: { type: "string" },
            additional_notes_suggestions: { type: "array", items: { type: "string" } },
            tone: { type: "string" }
          }
        };
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Call AI
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema
    });

    return Response.json({
      success: true,
      action,
      data: aiResponse,
      team_context: teamContext
    });

  } catch (error) {
    console.error('Team Leader AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate AI response' 
    }, { status: 500 });
  }
});