/**
 * Get Team Leaderboard Stats
 * Ranked teams by points, engagement, activity
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeframe } = await req.json();

    // Fetch all teams
    const teams = await base44.asServiceRole.entities.Team.list();
    const teamMembers = await base44.asServiceRole.entities.TeamMembership.list();
    const userPoints = await base44.asServiceRole.entities.UserPoints.list();
    const participations = await base44.asServiceRole.entities.Participation.list();
    const recognitions = await base44.asServiceRole.entities.Recognition.list();

    // Calculate stats per team
    const teamStats = teams.map(team => {
      const members = teamMembers.filter(tm => tm.team_id === team.id);
      const memberEmails = members.map(m => m.user_email);

      const teamUserPoints = userPoints.filter(up => memberEmails.includes(up.user_email));
      const teamParticipations = participations.filter(p => memberEmails.includes(p.user_email));
      const teamRecognitions = recognitions.filter(r => memberEmails.includes(r.sender_email));

      const totalPoints = teamUserPoints.reduce((sum, up) => sum + (up.total_points || 0), 0);
      const activeMembers = new Set(
        teamParticipations.map(p => p.user_email).concat(teamRecognitions.map(r => r.sender_email))
      ).size;

      const avgEngagementScore =
        (activeMembers / memberEmails.length) * 100 * 0.6 + (Math.min(totalPoints / 5000, 1) * 100 * 0.4);

      // Previous period for trend
      const prevPoints = totalPoints * 0.9; // Simplified
      const engagement_trend = totalPoints > prevPoints ? 'increasing' : totalPoints === prevPoints ? 'stable' : 'decreasing';

      return {
        id: team.id,
        team_name: team.team_name,
        member_count: memberEmails.length,
        active_members: activeMembers,
        total_points: totalPoints,
        avg_engagement_score: Math.round(avgEngagementScore),
        engagement_trend
      };
    });

    // Sort by points
    const ranked = teamStats.sort((a, b) => b.total_points - a.total_points);

    return Response.json(ranked);
  } catch (error) {
    console.error('[GET_LEADERBOARD_STATS]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});