import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { leaderboardName, leaderboardFilter = '', timePeriod = 'all_time', limit = 100 } = await req.json();

    // Get leaderboard config
    const configs = await base44.asServiceRole.entities.LeaderboardConfig.filter({
      leaderboard_name: leaderboardName
    });

    if (configs.length === 0) {
      return Response.json({ error: 'Leaderboard not found' }, { status: 404 });
    }

    const config = configs[0];
    const scores = {};

    // Fetch data from each score source
    for (const source of config.score_source) {
      let data = [];

      switch (source.entity) {
        case 'UserPoints':
          data = await base44.asServiceRole.entities.UserPoints.list();
          for (const point of data) {
            scores[point.user_email] = (scores[point.user_email] || 0) + (point.points_awarded * (source.weight || 1));
          }
          break;

        case 'BadgeAward':
          data = await base44.asServiceRole.entities.BadgeAward.list();
          for (const award of data) {
            scores[award.user_email] = (scores[award.user_email] || 0) + (10 * (source.weight || 1));
          }
          break;

        case 'ChallengeMultiplier':
          if (leaderboardFilter) {
            data = await base44.asServiceRole.entities.ChallengeMultiplier.filter({
              challenge_id: leaderboardFilter
            });
          } else {
            data = await base44.asServiceRole.entities.ChallengeMultiplier.list();
          }
          for (const multiplier of data) {
            const teamMember = await base44.asServiceRole.entities.TeamMembership.filter({
              team_id: multiplier.team_id
            });
            for (const member of teamMember) {
              scores[member.user_email] = (scores[member.user_email] || 0) + 
                (multiplier.dynamic_multiplier * 5 * (source.weight || 1));
            }
          }
          break;

        case 'Recognition':
          data = await base44.asServiceRole.entities.Recognition.list();
          for (const recognition of data) {
            scores[recognition.recipient_email] = (scores[recognition.recipient_email] || 0) + (5 * (source.weight || 1));
          }
          break;

        case 'Event':
          data = await base44.asServiceRole.entities.Event.list();
          for (const event of data) {
            const participants = await base44.asServiceRole.entities.Participation.filter({
              event_id: event.id
            });
            for (const participant of participants) {
              scores[participant.user_email] = (scores[participant.user_email] || 0) + (3 * (source.weight || 1));
            }
          }
          break;
      }
    }

    // Convert to array and rank
    const scoredEntries = Object.entries(scores)
      .map(([email, score]) => ({ user_email: email, score }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        percentile: Math.round(((limit - index - 1) / limit) * 100)
      }));

    // Assign tiers
    const tierThresholds = config.tier_thresholds || {
      bronze: 100,
      silver: 250,
      gold: 500,
      platinum: 1000,
      diamond: 2000
    };

    const getTier = (score) => {
      if (score >= tierThresholds.diamond) return 'diamond';
      if (score >= tierThresholds.platinum) return 'platinum';
      if (score >= tierThresholds.gold) return 'gold';
      if (score >= tierThresholds.silver) return 'silver';
      if (score >= tierThresholds.bronze) return 'bronze';
      return 'bronze';
    };

    // Update leaderboard entries
    for (const entry of scoredEntries.slice(0, limit)) {
      const existing = await base44.asServiceRole.entities.LeaderboardEntry.filter({
        user_email: entry.user_email,
        leaderboard_name: leaderboardName,
        leaderboard_filter: leaderboardFilter,
        time_period: timePeriod
      });

      const entryData = {
        user_email: entry.user_email,
        leaderboard_name: leaderboardName,
        leaderboard_filter: leaderboardFilter,
        score: entry.score,
        rank: entry.rank,
        percentile: entry.percentile,
        tier: getTier(entry.score),
        time_period: timePeriod,
        last_updated: new Date().toISOString()
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.LeaderboardEntry.update(existing[0].id, entryData);
      } else {
        await base44.asServiceRole.entities.LeaderboardEntry.create(entryData);
      }
    }

    return Response.json({
      success: true,
      leaderboard: leaderboardName,
      entriesProcessed: scoredEntries.length,
      topEntries: scoredEntries.slice(0, 10)
    });

  } catch (error) {
    console.error('Error aggregating leaderboard scores:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});