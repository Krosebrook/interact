import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { leaderboardName, userEmail = null } = await req.json();

    // Get leaderboard config
    const configs = await base44.asServiceRole.entities.LeaderboardConfig.filter({
      leaderboard_name: leaderboardName
    });

    if (configs.length === 0) {
      return Response.json({ error: 'Leaderboard not found' }, { status: 404 });
    }

    const config = configs[0];

    // Get top performers and user's current position
    let leaderboardEntries = await base44.asServiceRole.entities.LeaderboardEntry.filter({
      leaderboard_name: leaderboardName
    });

    leaderboardEntries = leaderboardEntries.sort((a, b) => a.rank - b.rank);

    const userEntry = userEmail 
      ? leaderboardEntries.find(e => e.user_email === userEmail)
      : null;

    const topPerformers = leaderboardEntries.slice(0, 5);

    // Build context for AI
    const context = `
    Leaderboard: ${config.display_name}
    Description: ${config.description}
    
    Top Performers:
    ${topPerformers.map((p, i) => `${i + 1}. ${p.user_email} - Score: ${p.score} (${p.tier})`).join('\n')}
    
    ${userEntry ? `Current User (${userEmail}): Rank #${userEntry.rank} with score ${userEntry.score}` : ''}
    
    Generate 3 competitive and motivating challenge ideas for this leaderboard that:
    1. Would encourage users to improve engagement
    2. Consider the current gap between top and mid-tier performers
    3. Are achievable but challenging
    4. Could boost overall participation
    
    Also suggest a promotional message/announcement for the top performers.
    `;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: context,
      response_json_schema: {
        type: 'object',
        properties: {
          challenges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                duration_days: { type: 'number' },
                point_reward: { type: 'number' },
                difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
              }
            }
          },
          promotion_message: { type: 'string' },
          motivation_tips: { type: 'array', items: { type: 'string' } },
          suggested_incentives: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({
      success: true,
      leaderboard: leaderboardName,
      userRank: userEntry?.rank || null,
      userScore: userEntry?.score || null,
      suggestions: aiResponse,
      topPerformers: topPerformers.map(p => ({
        email: p.user_email,
        rank: p.rank,
        score: p.score,
        tier: p.tier
      }))
    });

  } catch (error) {
    console.error('Error generating leaderboard challenges:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});