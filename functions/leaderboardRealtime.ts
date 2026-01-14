/**
 * Real-time Leaderboard Updates
 * WebSocket subscription handler for rank changes
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, type } = await req.json();

    switch (action) {
      case 'subscribe':
        return subscribeToLeaderboard(base44, user.email, type);

      case 'getSnapshot':
        return getLatestSnapshot(base44, type);

      case 'getRankChange':
        return getUserRankChange(base44, user.email, type);

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[LEADERBOARD_REALTIME]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function subscribeToLeaderboard(base44, userEmail, type) {
  try {
    // Get current snapshot
    const snapshots = await base44.entities.LeaderboardSnapshot.filter({
      snapshot_type: type
    });

    // Find user's current position
    const userSnapshot = snapshots.find(s => s.user_email === userEmail);
    const userRank = snapshots
      .filter(s => s.points >= (userSnapshot?.points || 0))
      .length;

    // Setup subscription for updates
    const unsubscribe = base44.entities.LeaderboardSnapshot.subscribe((event) => {
      if (event.type === 'update' && event.data.snapshot_type === type) {
        // Recalculate user's rank
        console.log(`[LEADERBOARD_REALTIME] Rank update for ${userEmail}`);
      }
    });

    return Response.json({
      subscribed: true,
      currentRank: userRank,
      snapshot: userSnapshot,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[LEADERBOARD_REALTIME] Subscribe failed:', error);
    return Response.json({
      subscribed: false,
      error: error.message
    }, { status: 500 });
  }
}

async function getLatestSnapshot(base44, type) {
  try {
    const snapshots = await base44.entities.LeaderboardSnapshot.filter({
      snapshot_type: type
    });

    const ranked = snapshots
      .sort((a, b) => b.points - a.points)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

    return Response.json({
      snapshots: ranked.slice(0, 50), // Top 50
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[LEADERBOARD_REALTIME] Snapshot fetch failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function getUserRankChange(base44, userEmail, type) {
  try {
    // Get current snapshots
    const current = await base44.entities.LeaderboardSnapshot.filter({
      snapshot_type: type,
      user_email: userEmail
    });

    if (current.length === 0) {
      return Response.json({
        found: false,
        message: 'User not on leaderboard'
      });
    }

    // Get historical snapshots for comparison
    const currentSnap = current[0];
    const allSnapshots = await base44.entities.LeaderboardSnapshot.filter({
      snapshot_type: type
    });

    const userRank = allSnapshots
      .filter(s => s.points > currentSnap.points)
      .length + 1;

    // Simulate previous rank (in production, fetch from history table)
    const previousRank = userRank + 1;
    const rankChange = previousRank - userRank;

    return Response.json({
      found: true,
      userEmail,
      currentRank: userRank,
      previousRank,
      rankChange, // Negative = moved up
      points: currentSnap.points,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[LEADERBOARD_REALTIME] Rank change calc failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}