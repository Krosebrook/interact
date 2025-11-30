/**
 * REFACTORED LEADERBOARD HOOK
 * Optimized with profile map for O(1) lookups and memoized calculations
 */

import { useMemo } from 'react';
import { useLeaderboardData } from './useEntities';
import { calculateEngagementScore, getPercentile } from '../lib/utils';
import { LEADERBOARD_CATEGORIES, TIME_PERIODS } from '../lib/constants';

export { LEADERBOARD_CATEGORIES, TIME_PERIODS };

/**
 * Custom hook for leaderboard data with filtering and ranking
 * @param {string} category - points | events | badges | engagement
 * @param {string} period - daily | weekly | monthly | all_time
 * @param {string} currentUserEmail - Current user's email for "my rank"
 */
export function useLeaderboard(category = 'points', period = 'all_time', currentUserEmail) {
  const { allUserPoints, profileMap, isLoading } = useLeaderboardData();

  const leaderboardData = useMemo(() => {
    if (!allUserPoints.length) {
      return { rankings: [], myRank: null, nearby: [], totalParticipants: 0 };
    }

    // Calculate scores based on category
    const scoredUsers = allUserPoints.map(up => {
      // O(1) profile lookup using Map
      const profile = profileMap.get(up.user_email);
      
      let score = 0;
      switch (category) {
        case 'points':
          score = period === 'all_time' ? (up.lifetime_points || up.total_points || 0) :
                  period === 'monthly' ? (up.monthly_points || up.total_points || 0) :
                  period === 'weekly' ? (up.weekly_points || up.total_points || 0) :
                  (up.daily_points || 0);
          break;
        case 'events':
          score = up.events_attended || 0;
          break;
        case 'badges':
          score = up.badges_earned?.length || 0;
          break;
        case 'engagement':
          score = calculateEngagementScore(up);
          break;
        default:
          score = up.total_points || 0;
      }

      return {
        user_email: up.user_email,
        user_name: profile?.display_name || up.user_email?.split('@')[0] || 'User',
        avatar_url: profile?.avatar_url,
        score,
        level: up.level || 1,
        streak: up.streak_days || 0,
        badges_count: up.badges_earned?.length || 0
      };
    });

    // Filter out zero scores and sort
    const sorted = scoredUsers
      .filter(u => u.score > 0)
      .sort((a, b) => b.score - a.score);

    // Assign ranks with tie handling
    let currentRank = 1;
    const rankings = sorted.map((user, index) => {
      if (index > 0 && user.score < sorted[index - 1].score) {
        currentRank = index + 1;
      }
      return { ...user, rank: currentRank };
    });

    // Find current user
    const myIndex = rankings.findIndex(r => r.user_email === currentUserEmail);
    const myRank = myIndex >= 0 ? {
      ...rankings[myIndex],
      percentile: getPercentile(rankings[myIndex].rank, rankings.length)
    } : null;

    // Get nearby users (2 above, 2 below)
    let nearby = [];
    if (myIndex >= 0) {
      const start = Math.max(0, myIndex - 2);
      const end = Math.min(rankings.length, myIndex + 3);
      nearby = rankings.slice(start, end);
    }

    return {
      rankings: rankings.slice(0, 100), // Top 100
      myRank,
      nearby,
      totalParticipants: rankings.length
    };
  }, [allUserPoints, profileMap, category, period, currentUserEmail]);

  return {
    ...leaderboardData,
    isLoading,
    category,
    period
  };
}

export default useLeaderboard;