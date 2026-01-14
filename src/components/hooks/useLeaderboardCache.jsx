/**
 * Leaderboard Caching Hook
 * 5-minute stale-while-revalidate strategy with prefetch
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const LEADERBOARD_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const LEADERBOARD_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export function useLeaderboardCache(type = 'weekly', period = null, options = {}) {
  const queryClient = useQueryClient();

  // Prefetch next period's leaderboard (if pagination)
  const prefetchNextPage = async (nextPeriod) => {
    await queryClient.prefetchQuery({
      queryKey: ['leaderboard', type, nextPeriod],
      queryFn: () => fetchLeaderboardData(type, nextPeriod),
      staleTime: LEADERBOARD_STALE_TIME
    });
  };

  // Main query with caching strategy
  const query = useQuery({
    queryKey: ['leaderboard', type, period],
    queryFn: () => fetchLeaderboardData(type, period),
    staleTime: LEADERBOARD_STALE_TIME,
    gcTime: LEADERBOARD_CACHE_TIME,
    refetchInterval: LEADERBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    ...options
  });

  return {
    ...query,
    prefetchNextPage
  };
}

/**
 * Fetch leaderboard with caching headers
 */
async function fetchLeaderboardData(type, period) {
  try {
    const snapshots = await base44.entities.LeaderboardSnapshot.filter({
      snapshot_type: type,
      ...(period && { period_start: period })
    });

    // Calculate ranks and aggregate stats
    const ranked = snapshots
      .sort((a, b) => b.points - a.points)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        percentile: Math.round(((snapshots.length - index) / snapshots.length) * 100)
      }));

    return {
      snapshots: ranked,
      totalParticipants: ranked.length,
      topThree: ranked.slice(0, 3),
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[LEADERBOARD_CACHE] Fetch failed:', error);
    throw error;
  }
}

/**
 * Prefetch all leaderboard types on mount
 */
export function usePrefetchAllLeaderboards() {
  const queryClient = useQueryClient();

  const prefetch = async () => {
    const types = ['weekly', 'monthly', 'quarterly'];
    
    await Promise.all(
      types.map(type =>
        queryClient.prefetchQuery({
          queryKey: ['leaderboard', type],
          queryFn: () => fetchLeaderboardData(type),
          staleTime: LEADERBOARD_STALE_TIME
        })
      )
    );
  };

  return { prefetch };
}

/**
 * Get leaderboard from cache if available
 */
export function getLeaderboardFromCache(queryClient, type, period) {
  return queryClient.getQueryData(['leaderboard', type, period]);
}

/**
 * Invalidate leaderboard when points change
 */
export function invalidateLeaderboardCache(queryClient) {
  queryClient.invalidateQueries({ 
    queryKey: ['leaderboard'],
    refetchType: 'active' // Only refetch active queries
  });
}

/**
 * Subscribe to real-time leaderboard updates
 */
export function useLeaderboardSubscription(type = 'weekly') {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    // Subscribe to leaderboard changes
    const unsubscribe = base44.entities.LeaderboardSnapshot.subscribe((event) => {
      if (event.type === 'update' && event.data.snapshot_type === type) {
        // Optimistically update cache
        const oldData = queryClient.getQueryData(['leaderboard', type]);
        if (oldData) {
          const updated = oldData.snapshots.map(s =>
            s.id === event.data.id ? event.data : s
          );
          queryClient.setQueryData(['leaderboard', type], {
            ...oldData,
            snapshots: updated
          });
        }
      }
    });

    return unsubscribe;
  }, [type, queryClient]);
}