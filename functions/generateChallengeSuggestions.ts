import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered challenge suggestion generator
 * Analyzes past successful challenges and provides smart recommendations
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Unauthorized: Admin or Facilitator required' }, { status: 403 });
    }

    const { challenge_goal, challenge_type, target_audience } = await req.json();

    if (!challenge_goal) {
      return Response.json({ error: 'challenge_goal required' }, { status: 400 });
    }

    // Fetch historical challenge data
    const [pastChallenges, participations, allUsers] = await Promise.all([
      base44.asServiceRole.entities.Challenge.filter({ status: 'completed' }),
      base44.asServiceRole.entities.ChallengeParticipation.list('-created_date', 500),
      base44.asServiceRole.entities.User.list()
    ]);

    // Calculate success metrics for past challenges
    const challengeMetrics = pastChallenges.map(ch => {
      const chParticipations = participations.filter(p => p.challenge_id === ch.id);
      const completionRate = ch.participation_count > 0 
        ? (ch.completion_count / ch.participation_count) * 100 
        : 0;
      const duration = new Date(ch.end_date) - new Date(ch.start_date);
      const daysLength = Math.ceil(duration / (1000 * 60 * 60 * 24));
      
      return {
        type: ch.challenge_type,
        difficulty: ch.difficulty,
        duration_days: daysLength,
        points_reward: ch.points_reward,
        participation_count: ch.participation_count,
        completion_rate: completionRate,
        target_value: ch.target_metric?.target_value
      };
    });

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are an expert employee engagement strategist analyzing challenge performance data.

CHALLENGE GOAL: "${challenge_goal}"
${challenge_type ? `TYPE: ${challenge_type}` : ''}
${target_audience ? `AUDIENCE: ${target_audience}` : ''}

HISTORICAL PERFORMANCE DATA:
${JSON.stringify(challengeMetrics.slice(0, 20), null, 2)}

COMPANY CONTEXT:
- Total Employees: ${allUsers.length}
- Past Challenges: ${pastChallenges.length}
- Avg Completion Rate: ${challengeMetrics.length > 0 ? (challengeMetrics.reduce((sum, m) => sum + m.completion_rate, 0) / challengeMetrics.length).toFixed(1) : 0}%

Based on successful past challenges, provide SPECIFIC recommendations in JSON format:
{
  "recommended_title": "Catchy, motivating title",
  "recommended_description": "Clear 2-3 sentence description",
  "duration": {
    "days": number (7-90 days),
    "reasoning": "Why this duration works"
  },
  "target_metric": {
    "metric_name": "specific metric to track",
    "target_value": number,
    "unit": "points/events/hours/etc",
    "reasoning": "Why this target is achievable yet challenging"
  },
  "points_reward": {
    "amount": number (50-1000),
    "reasoning": "Based on effort and historical rewards"
  },
  "difficulty": "beginner|intermediate|advanced",
  "recommended_requirements": ["req1", "req2", "req3"],
  "leaderboard_config": {
    "enabled": true,
    "type": "individual|team|both",
    "reasoning": "Why this leaderboard type fits"
  },
  "recurring_recommendation": {
    "should_recur": true/false,
    "frequency": "weekly|monthly|quarterly",
    "reasoning": "When recurring makes sense"
  },
  "success_factors": [
    "Key factor 1 from past data",
    "Key factor 2 from past data"
  ],
  "estimated_participation": {
    "percentage": number (5-70%),
    "count": number,
    "reasoning": "Based on similar past challenges"
  },
  "tips_for_success": [
    "Actionable tip 1",
    "Actionable tip 2"
  ]
}`;

    const responseSchema = {
      type: "object",
      properties: {
        recommended_title: { type: "string" },
        recommended_description: { type: "string" },
        duration: {
          type: "object",
          properties: {
            days: { type: "number" },
            reasoning: { type: "string" }
          }
        },
        target_metric: {
          type: "object",
          properties: {
            metric_name: { type: "string" },
            target_value: { type: "number" },
            unit: { type: "string" },
            reasoning: { type: "string" }
          }
        },
        points_reward: {
          type: "object",
          properties: {
            amount: { type: "number" },
            reasoning: { type: "string" }
          }
        },
        difficulty: { type: "string" },
        recommended_requirements: {
          type: "array",
          items: { type: "string" }
        },
        leaderboard_config: {
          type: "object",
          properties: {
            enabled: { type: "boolean" },
            type: { type: "string" },
            reasoning: { type: "string" }
          }
        },
        recurring_recommendation: {
          type: "object",
          properties: {
            should_recur: { type: "boolean" },
            frequency: { type: "string" },
            reasoning: { type: "string" }
          }
        },
        success_factors: {
          type: "array",
          items: { type: "string" }
        },
        estimated_participation: {
          type: "object",
          properties: {
            percentage: { type: "number" },
            count: { type: "number" },
            reasoning: { type: "string" }
          }
        },
        tips_for_success: {
          type: "array",
          items: { type: "string" }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role,
      functionName: 'generateChallengeSuggestions',
      prompt,
      responseSchema,
      agentName: 'ChallengeOptimizer'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    return Response.json({
      success: true,
      suggestions: aiResult.data,
      metadata: {
        based_on_challenges: pastChallenges.length,
        company_size: allUsers.length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Challenge suggestions error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});