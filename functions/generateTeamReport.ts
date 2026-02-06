import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }
    
    const { teamId } = await req.json();
    
    // Fetch team data
    const [team] = await base44.asServiceRole.entities.Team.filter({ id: teamId });
    if (!team) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }
    
    const memberships = await base44.asServiceRole.entities.TeamMembership.filter({ team_id: teamId });
    const memberEmails = memberships.map(m => m.user_email);
    
    // Aggregate team metrics
    const allPoints = await base44.asServiceRole.entities.UserPoints.filter({});
    const teamPoints = allPoints.filter(p => memberEmails.includes(p.user_email));
    
    const allRecognitions = await base44.asServiceRole.entities.Recognition.filter({});
    const teamRecognitions = allRecognitions.filter(r => 
      memberEmails.includes(r.sender_email) || memberEmails.includes(r.recipient_email)
    );
    
    const allParticipations = await base44.asServiceRole.entities.Participation.filter({});
    const teamParticipations = allParticipations.filter(p => memberEmails.includes(p.user_email));
    
    const wellnessGoals = await base44.asServiceRole.entities.WellnessGoal.filter({});
    const teamWellness = wellnessGoals.filter(w => memberEmails.includes(w.user_email));
    
    // Calculate team metrics
    const totalPoints = teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
    const avgPointsPerMember = memberEmails.length > 0 ? totalPoints / memberEmails.length : 0;
    const totalBadges = teamPoints.reduce((sum, p) => sum + (p.badges_earned?.length || 0), 0);
    
    const activeMembers = teamPoints.filter(p => 
      p.last_activity_date && new Date(p.last_activity_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const wellnessCompletionRate = teamWellness.length > 0
      ? (teamWellness.filter(w => w.status === 'completed').length / teamWellness.length) * 100
      : 0;
    
    // AI analyzes team health and generates insights
    const analysisPrompt = `Analyze team performance and generate HR insights:

Team: ${team.name}
Members: ${memberEmails.length}
Active Members (7 days): ${activeMembers}

Engagement Metrics:
- Total Points: ${totalPoints}
- Avg Points/Member: ${Math.round(avgPointsPerMember)}
- Total Badges Earned: ${totalBadges}
- Recognitions: ${teamRecognitions.length}
- Event Participations: ${teamParticipations.length}
- Wellness Completion Rate: ${Math.round(wellnessCompletionRate)}%

Identify:
1. Team engagement level (low/medium/high)
2. Strengths (what's working well)
3. Concerns (potential issues)
4. HR intervention recommendations
5. Celebration opportunities (achievements to highlight)`;
    
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          engagement_level: {
            type: "string",
            enum: ["low", "medium", "high"]
          },
          engagement_score: { type: "number" },
          strengths: {
            type: "array",
            items: { type: "string" }
          },
          concerns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                severity: { type: "string" },
                affected_members: { type: "number" }
              }
            }
          },
          hr_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                expected_impact: { type: "string" }
              }
            }
          },
          celebrations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });
    
    const report = {
      team_id: teamId,
      team_name: team.name,
      member_count: memberEmails.length,
      metrics: {
        total_points: totalPoints,
        avg_points_per_member: Math.round(avgPointsPerMember),
        total_badges: totalBadges,
        active_members: activeMembers,
        activity_rate: memberEmails.length > 0 ? (activeMembers / memberEmails.length) * 100 : 0,
        recognitions: teamRecognitions.length,
        event_participations: teamParticipations.length,
        wellness_completion_rate: Math.round(wellnessCompletionRate)
      },
      top_performers: teamPoints
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .slice(0, 5)
        .map(p => ({
          email: p.user_email,
          points: p.total_points,
          level: p.current_level
        })),
      ai_insights: insights,
      generated_at: new Date().toISOString()
    };
    
    return Response.json({ success: true, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});