import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Centralized hook for gamification-related data
 */
export function useGamificationData(userEmail = null) {
  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.list('-popularity_score', 100)
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: userEmail ? ['redemptions', userEmail] : ['all-redemptions'],
    queryFn: () => userEmail 
      ? base44.entities.RewardRedemption.filter({ user_email: userEmail })
      : base44.entities.RewardRedemption.list('-created_date', 100)
  });

  const { data: allUserPoints = [] } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  return {
    badges,
    rewards,
    redemptions,
    allUserPoints
  };
}