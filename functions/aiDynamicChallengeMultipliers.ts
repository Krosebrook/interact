import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { challenge_id, team_id } = await req.json();

    // Fetch challenge and team data
    const [challenge, teamMembers, teamAnalytics, pastChallengeProgress] = await Promise.all([
      base44.asServiceRole.entities.TeamChallenge.filter({ id: challenge_id }).then(r => r[0]),
      base44.asServiceRole.entities.TeamMembership.filter({ team_id }),
      base44.asServiceRole.entities.TeamAnalytics.list(),
      base44.asServiceRole.entities.TeamChallengeProgress.filter({ challenge_id })
    ]);

    if (!challenge) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Fetch team member profiles for skill analysis
    const memberEmails = teamMembers.map(m => m.user_email);
    const memberProfiles = await Promise.all(
      memberEmails.map(email => 
        base44.asServiceRole.entities.UserProfile.filter({ user_email: email }).then(r => r[0])
      )
    );

    // Calculate team composition metrics
    const skillSet = new Set();
    memberProfiles.forEach(p => {
      p?.skills?.forEach(s => skillSet.add(s.skill_name));
    });
    const skillDiversityScore = skillSet.size / Math.max(memberEmails.length, 1);

    const averageTier = memberProfiles.reduce((acc, p) => {
      const tierMap = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
      return acc + (tierMap[p?.tier_badge] || 2);
    }, 0) / memberProfiles.length;

    const pastPerformance = teamAnalytics.find(ta => ta.team_id === team_id);
    const performanceTrend = pastPerformance?.engagement_trend || 'stable';

    const prompt = `
    Calculate dynamic multipliers for a team challenge based on team composition and real-time performance.
    Output individual multiplier factors and the final dynamic multiplier.

    CHALLENGE DATA:
    - Name: ${challenge.challenge_name}
    - Type: ${challenge.challenge_type}
    - Target Metric: ${challenge.target_metric?.metric_type || 'points'}

    TEAM COMPOSITION:
    - Team Size: ${memberEmails.length}
    - Skill Diversity Score: ${skillDiversityScore.toFixed(2)} (0-1, higher = more diverse)
    - Average Tier: ${averageTier.toFixed(2)} (1=bronze, 5=diamond)
    - Unique Skills Represented: ${skillSet.size}
    - Current Participants in Challenge: ${pastChallengeProgress.filter(p => p.current_value > 0).length}

    TEAM PERFORMANCE CONTEXT:
    - Recent Engagement Trend: ${performanceTrend}
    - Challenge Participation Rate: ${(pastChallengeProgress.filter(p => p.current_value > 0).length / memberEmails.length * 100).toFixed(2)}%

    Calculate multipliers for:
    1. Team Diversity Bonus: Higher diversity = higher multiplier (encourages mixed teams)
    2. Skill Gap Factor: If team lacks challenge-relevant skills, offer a slight boost
    3. Performance Momentum: Based on recent engagement trend
    4. Difficulty Adjustment: Challenge difficulty vs team capability
    5. Collaboration Bonus: If challenge emphasizes teamwork, higher multiplier

    Each factor should be a decimal (0.8 to 1.5 range).
    Final dynamic_multiplier = product of all factors, capped at 2.0.

    OUTPUT JSON SCHEMA:
    {
      "team_diversity_bonus": "number (0.8-1.5)",
      "skill_gap_factor": "number (0.8-1.5)",
      "performance_momentum": "number (0.8-1.5)",
      "difficulty_adjustment": "number (0.8-1.5)",
      "collaboration_bonus": "number (0.8-1.5)",
      "dynamic_multiplier": "number (final, capped at 2.0)",
      "explanation": "string (brief explanation of multiplier rationale)",
      "recalc_interval_hours": "number (when to next recalculate)"
    }
    `;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          team_diversity_bonus: { type: "number" },
          skill_gap_factor: { type: "number" },
          performance_momentum: { type: "number" },
          difficulty_adjustment: { type: "number" },
          collaboration_bonus: { type: "number" },
          dynamic_multiplier: { type: "number" },
          explanation: { type: "string" },
          recalc_interval_hours: { type: "number" }
        },
        required: ["dynamic_multiplier", "explanation"]
      }
    });

    // Store multiplier config
    const nextRecalcAt = new Date(Date.now() + (aiResponse.recalc_interval_hours || 24) * 60 * 60 * 1000);
    const multiplierConfig = await base44.asServiceRole.entities.ChallengeMultiplier.create({
      challenge_id,
      team_id,
      base_multiplier: 1.0,
      dynamic_multiplier: Math.min(aiResponse.dynamic_multiplier, 2.0),
      multiplier_factors: {
        team_diversity_bonus: aiResponse.team_diversity_bonus,
        skill_gap_factor: aiResponse.skill_gap_factor,
        performance_momentum: aiResponse.performance_momentum,
        difficulty_adjustment: aiResponse.difficulty_adjustment,
        collaboration_bonus: aiResponse.collaboration_bonus
      },
      team_composition_snapshot: {
        team_size: memberEmails.length,
        average_tier: averageTier.toFixed(2),
        skill_diversity_score: skillDiversityScore.toFixed(2),
        past_performance_trend: performanceTrend
      },
      calculated_at: new Date().toISOString(),
      next_recalc_at: nextRecalcAt.toISOString()
    });

    return Response.json({ success: true, multiplierConfig, explanation: aiResponse.explanation });

  } catch (error) {
    console.error('Error calculating dynamic multipliers:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});