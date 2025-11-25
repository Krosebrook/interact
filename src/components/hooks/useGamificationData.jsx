import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Central hook for gamification-related data
 * Used by GamificationDashboard, Leaderboard, RewardsStore, UserProfile
 */
export function useGamificationData(options = {}) {
  const { enabled = true, userEmail = null, limit = 100 } = options;

  const { data: userPoints = [], isLoading: pointsLoading, refetch: refetchPoints } = useQuery({
    queryKey: ['user-points', limit],
    queryFn: () => base44.entities.UserPoints.list('-total_points', limit),
    enabled,
    staleTime: 30000
  });

  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.filter({ is_active: true }),
    enabled,
    staleTime: 60000
  });

  const { data: badgeAwards = [], isLoading: awardsLoading } = useQuery({
    queryKey: ['badge-awards', userEmail],
    queryFn: () => userEmail
      ? base44.entities.BadgeAward.filter({ user_email: userEmail })
      : base44.entities.BadgeAward.list('-created_date', 500),
    enabled,
    staleTime: 30000
  });

  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.filter({ is_available: true }),
    enabled,
    staleTime: 60000
  });

  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery({
    queryKey: ['reward-redemptions', userEmail],
    queryFn: () => userEmail
      ? base44.entities.RewardRedemption.filter({ user_email: userEmail })
      : [],
    enabled: !!userEmail,
    staleTime: 30000
  });

  // All redemptions for admin view
  const { data: allRedemptions = [], isLoading: allRedemptionsLoading, refetch: refetchAllRedemptions } = useQuery({
    queryKey: ['all-redemptions'],
    queryFn: () => base44.entities.RewardRedemption.list('-created_date', 500),
    enabled,
    staleTime: 30000
  });

  // All rewards including unavailable (for admin)
  const { data: allRewards = [], isLoading: allRewardsLoading, refetch: refetchRewards } = useQuery({
    queryKey: ['all-rewards'],
    queryFn: () => base44.entities.Reward.list('-created_date', 200),
    enabled,
    staleTime: 30000
  });

  // Get current user's points
  const currentUserPoints = userEmail 
    ? userPoints.find(up => up.user_email === userEmail) 
    : null;

  // Get user's earned badges
  const userBadges = userEmail
    ? badgeAwards.filter(ba => ba.user_email === userEmail).map(ba => {
        const badge = badges.find(b => b.id === ba.badge_id);
        return { ...ba, badge };
      })
    : [];

  // Calculate leaderboard with ranks
  const leaderboard = userPoints
    .sort((a, b) => b.total_points - a.total_points)
    .map((up, index) => ({ ...up, rank: index + 1 }));

  return {
    userPoints,
    badges,
    badgeAwards,
    rewards,
    allRewards,
    redemptions,
    allRedemptions,
    currentUserPoints,
    userBadges,
    leaderboard,
    isLoading: pointsLoading || badgesLoading || awardsLoading || rewardsLoading || redemptionsLoading || allRedemptionsLoading || allRewardsLoading,
    refetchPoints,
    refetchRewards,
    refetchAllRedemptions
  };
}