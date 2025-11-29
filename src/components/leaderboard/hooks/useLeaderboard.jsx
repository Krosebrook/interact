import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMemo } from 'react';

/**
 * Configuration for leaderboard categories
 */
export const LEADERBOARD_CATEGORIES = {
  points: { label: 'Points', field: 'total_points', icon: '🏆' },
  events: { label: 'Events Attended', field: 'events_attended', icon: '📅' },
  badges: { label: 'Badges Earned', field: 'badges_count', icon: '🎖️' },
  engagement: { label: 'Engagement Score', field: 'engagement_score', icon: '⚡' }
};

export const TIME_PERIODS = {
  daily: { label: 'Today', days: 1 },
  weekly: { label: 'This Week', days: 7 },
  monthly: { label: 'This Month', days: 30 },
  all_time: { label: 'All Time', days: null }
};

/**
 * Calculate engagement score from user stats
 */
export function calculateEngagementScore(userPoints) {
  if (!userPoints) return 0;
  
  const weights = {
    events_attended: 10,
    activities_completed: 15,
    feedback_submitted: 5,
    streak_days: 2,
    badges_earned: 20
  };
  
  return (
    (userPoints.events_attended || 0) * weights.events_attended +
    (userPoints.activities_completed || 0) * weights.activities_completed +
    (userPoints.feedback_submitted || 0) * weights.feedback_submitted +
    (userPoints.streak_days || 0) * weights.streak_days +
    (userPoints.badges_earned?.length || 0) * weights.badges_earned
  );
}

/**
 * Custom hook for leaderboard data with filtering and ranking
 */
export function useLeaderboard(category = 'points', period = 'all_time', currentUserEmail) {
  // Fetch all user points
  const { data: allUserPoints = [], isLoading } = useQuery({
    queryKey: ['leaderboard-data'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 500),
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 300000 // Refetch every 5 minutes
  });

  // Fetch user profiles for names
  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles-leaderboard'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 60000
  });

  // Process and rank users
  const leaderboardData = useMemo(() => {
    if (!allUserPoints.length) return { rankings: [], myRank: null, nearby: [] };

    // Calculate scores based on category
    const scoredUsers = allUserPoints.map(up => {
      const profile = profiles.find(p => p.user_email === up.user_email);
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

    // Sort by score descending
    const sorted = scoredUsers
      .filter(u => u.score > 0)
      .sort((a, b) => b.score - a.score);

    // Assign ranks (handle ties)
    let currentRank = 1;
    const rankings = sorted.map((user, index) => {
      if (index > 0 && user.score < sorted[index - 1].score) {
        currentRank = index + 1;
      }
      return { ...user, rank: currentRank };
    });

    // Find current user's rank
    const myIndex = rankings.findIndex(r => r.user_email === currentUserEmail);
    const myRank = myIndex >= 0 ? rankings[myIndex] : null;

    // Get nearby users (2 above and 2 below current user)
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
  }, [allUserPoints, profiles, category, period, currentUserEmail]);

  return {
    ...leaderboardData,
    isLoading,
    category,
    period
  };
}

export default useLeaderboard;