import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Centralized hook for gamification-related data
 */
export function useGamificationData(userEmail = null) {
  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.list('-popularity_score', 100)
  });

  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery({
    queryKey: userEmail ? ['redemptions', userEmail] : ['all-redemptions'],
    queryFn: () => userEmail 
      ? base44.entities.RewardRedemption.filter({ user_email: userEmail })
      : base44.entities.RewardRedemption.list('-created_date', 100)
  });

  const { data: allUserPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  const { data: badgeAwards = [] } = useQuery({
    queryKey: userEmail ? ['badge-awards', userEmail] : ['badge-awards'],
    queryFn: () => userEmail
      ? base44.entities.BadgeAward.filter({ user_email: userEmail })
      : base44.entities.BadgeAward.list('-created_date', 50)
  });

  // Helper to get badges by category
  const getBadgesByCategory = (category) => badges.filter(b => b.category === category);
  
  // Helper to get user's earned badges
  const getUserBadges = (badgeIds = []) => badges.filter(b => badgeIds.includes(b.id));

  return {
    badges,
    rewards,
    redemptions,
    allUserPoints,
    badgeAwards,
    getBadgesByCategory,
    getUserBadges,
    isLoading: badgesLoading || rewardsLoading || redemptionsLoading || pointsLoading
  };
}