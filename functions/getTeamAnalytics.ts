/**
 * Get Team Analytics Data
 * Engagement metrics, contribution breakdown, comparisons
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { team_id, period } = await req.json();

    // Calculate date range
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case 'last-week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'current-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        break;
      case 'last-3-months':
        startDate.setMonth(today.getMonth() - 3);
        break;
    }

    // Fetch team members
    const teamMembers = await base44.asServiceRole.entities.TeamMembership.filter({
      team_id: team_id
    });

    const memberEmails = teamMembers.map(m => m.user_email);

    // Fetch events
    const events = await base44.asServiceRole.entities.Event.list();
    const participations = await base44.asServiceRole.entities.Participation.filter({
      user_email: { $in: memberEmails }
    });

    // Fetch recognitions
    const recognitions = await base44.asServiceRole.entities.Recognition.filter({
      sender_email: { $in: memberEmails }
    });

    // Fetch points
    const userPoints = await base44.asServiceRole.entities.UserPoints.filter({
      user_email: { $in: memberEmails }
    });

    // Calculate metrics
    const activeMembers = new Set(
      participations.map(p => p.user_email).concat(recognitions.map(r => r.sender_email))
    ).size;

    const totalPoints = userPoints.reduce((sum, up) => sum + (up.total_points || 0), 0);
    const avgPointsPerMember = totalPoints / memberEmails.length;
    const avgEngagementScore =
      (activeMembers / memberEmails.length) * 100 * 0.6 + // 60% based on activity
      (Math.min(totalPoints / 10000, 1) * 100 * 0.4); // 40% based on points

    // Member contribution
    const memberContribution = memberEmails.map(email => {
      const points = userPoints.find(up => up.user_email === email);
      const memberRecognitions = recognitions.filter(r => r.sender_email === email);
      const memberParticipations = participations.filter(p => p.user_email === email);

      return {
        user_email: email,
        points_earned: points?.total_points || 0,
        recognitions_given: memberRecognitions.length,
        recognitions_received: recognitions.filter(r => r.recipient_email === email).length,
        events_attended: memberParticipations.length,
        challenges_completed: 0, // Would need to fetch
        engagement_score:
          (memberParticipations.length / 10 + memberRecognitions.length / 5 + (points?.total_points || 0) / 1000) * 100
      };
    });

    // Trend
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(startDate.getMonth() - 1);
    const prevParticipations = participations.filter(p => new Date(p.check_in_date) < startDate);
    const engagement_trend = participations.length > prevParticipations.length ? 'increasing' : 'decreasing';

    return Response.json({
      success: true,
      team_id,
      total_members: memberEmails.length,
      active_members: activeMembers,
      total_points: totalPoints,
      total_recognitions: recognitions.length,
      total_events_attended: participations.length,
      avg_points_per_member: Math.round(avgPointsPerMember),
      avg_engagement_score: Math.round(avgEngagementScore),
      member_contribution: memberContribution,
      engagement_trend,
      org_avg_points_per_member: 500, // placeholder
      org_avg_engagement_score: 65, // placeholder
      org_avg_active_rate: 75 // placeholder
    });
  } catch (error) {
    console.error('[GET_TEAM_ANALYTICS]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});