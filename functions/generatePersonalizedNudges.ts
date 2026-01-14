/**
 * Generate Personalized Nudges for At-Risk Users
 * Predicts churn and suggests interventions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all users and their engagement
    const allUsers = await base44.asServiceRole.entities.User.list();
    const userPoints = await base44.asServiceRole.entities.UserPoints.list();
    const participations = await base44.asServiceRole.entities.Participation.list();
    const recognitions = await base44.asServiceRole.entities.Recognition.list();

    const nudges = [];

    for (const u of allUsers.slice(0, 50)) {
      // Limit for performance
      const userPts = userPoints.find(up => up.user_email === u.email);
      const userParticipations = participations.filter(p => p.user_email === u.email);
      const userRecognitions = recognitions.filter(r => r.sender_email === u.email);

      // Calculate churn risk
      const churnRisk = calculateChurnRisk(userPts, userParticipations, userRecognitions);

      if (churnRisk.score > 0.6) {
        // High risk
        const intervention = suggestIntervention(churnRisk, u);
        nudges.push({
          user_email: u.email,
          user_name: u.full_name,
          churn_risk_score: churnRisk.score,
          reason: churnRisk.reason,
          suggested_action: intervention
        });
      }
    }

    // Send nudges to admins/team leads
    if (nudges.length > 0) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `⚠️ ${nudges.length} Users at Risk of Disengagement`,
        body: `Identified ${nudges.length} users showing low engagement:\n\n${nudges
          .slice(0, 5)
          .map(
            n =>
              `${n.user_name}: ${n.reason}\nSuggestion: ${n.suggested_action}`
          )
          .join('\n\n')}`
      });
    }

    return Response.json({
      success: true,
      at_risk_count: nudges.length,
      nudges
    });
  } catch (error) {
    console.error('[GENERATE_NUDGES]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateChurnRisk(userPoints, participations, recognitions) {
  let score = 0;
  const reasons = [];

  // No points in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (!userPoints || userPoints.total_points === 0) {
    score += 0.3;
    reasons.push('No points earned');
  }

  if (!userPoints || userPoints.last_activity_date && new Date(userPoints.last_activity_date) < thirtyDaysAgo) {
    score += 0.3;
    reasons.push('No activity in 30 days');
  }

  // Low participation
  if (!participations || participations.length === 0) {
    score += 0.2;
    reasons.push('Never attended events');
  }

  // No recognition given
  if (!recognitions || recognitions.length === 0) {
    score += 0.15;
    reasons.push('Never gave recognition');
  }

  return {
    score: Math.min(score, 1.0),
    reason: reasons.join('; ')
  };
}

function suggestIntervention(churnRisk, user) {
  if (churnRisk.reason.includes('No activity')) {
    return `Send personalized email inviting ${user.full_name} to an upcoming event`;
  } else if (churnRisk.reason.includes('Never attended')) {
    return `Have their team lead reach out with event recommendations`;
  } else if (churnRisk.reason.includes('Never gave recognition')) {
    return `Encourage peer recognition through one-on-one check-in`;
  }

  return 'Schedule a check-in conversation to understand needs';
}