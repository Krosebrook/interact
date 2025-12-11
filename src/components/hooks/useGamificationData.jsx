/**
 * REFACTORED GAMIFICATION DATA HOOK
 * Production-grade with apiClient, RBAC, and performance optimization
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { usePermissions } from './usePermissions';
import { transformOutput } from '../lib/dataTransformers';

/**
 * Central hook for gamification-related data with security and performance
 */
export function useGamificationData(options = {}) {
  const { enabled = true, userEmail = null, limit = 100 } = options;
  const { canViewAllEmployees, filterSensitiveFields } = usePermissions();

  // User points with RBAC filtering
  const { data: userPoints = [], isLoading: pointsLoading, refetch: refetchPoints } = useQuery({
    queryKey: queryKeys.gamification.userPoints.list({ limit }),
    queryFn: async () => {
      const data = await apiClient.list('UserPoints', {
        sort: '-total_points',
        limit
      });
      
      // Filter based on permissions
      return canViewAllEmployees ? data : filterSensitiveFields(data);
    },
    enabled,
    staleTime: 30000
  });

  // Active badges
  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: queryKeys.gamification.badges.active,
    queryFn: () => apiClient.list('Badge', { 
      filters: { is_active: true } 
    }),
    enabled,
    staleTime: 60000
  });

  // Badge awards
  const { data: badgeAwards = [], isLoading: awardsLoading } = useQuery({
    queryKey: queryKeys.gamification.badgeAwards.list({ userEmail }),
    queryFn: () => userEmail
      ? apiClient.list('BadgeAward', { filters: { user_email: userEmail } })
      : apiClient.list('BadgeAward', { sort: '-created_date', limit: 500 }),
    enabled,
    staleTime: 30000
  });

  // Available rewards
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: queryKeys.gamification.rewards.available,
    queryFn: () => apiClient.list('Reward', { 
      filters: { is_available: true } 
    }),
    enabled,
    staleTime: 60000
  });

  // User redemptions
  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery({
    queryKey: queryKeys.gamification.redemptions.list({ userEmail }),
    queryFn: () => userEmail
      ? apiClient.list('RewardRedemption', { filters: { user_email: userEmail } })
      : [],
    enabled: !!userEmail,
    staleTime: 30000
  });

  // All redemptions (admin only)
  const { data: allRedemptions = [], isLoading: allRedemptionsLoading, refetch: refetchAllRedemptions } = useQuery({
    queryKey: queryKeys.gamification.redemptions.all,
    queryFn: () => apiClient.list('RewardRedemption', {
      sort: '-created_date',
      limit: 500
    }),
    enabled: canViewAllEmployees,
    staleTime: 30000
  });

  // All rewards (admin only)
  const { data: allRewards = [], isLoading: allRewardsLoading, refetch: refetchRewards } = useQuery({
    queryKey: queryKeys.gamification.rewards.all,
    queryFn: () => apiClient.list('Reward', {
      sort: '-created_date',
      limit: 200
    }),
    enabled: canViewAllEmployees,
    staleTime: 30000
  });

  // Memoized computed values
  const computed = useMemo(() => {
    // Current user's points
    const currentUserPoints = userEmail 
      ? userPoints.find(up => up.user_email === userEmail) 
      : null;

    // User's earned badges
    const userBadges = userEmail
      ? badgeAwards
          .filter(ba => ba.user_email === userEmail)
          .map(ba => {
            const badge = badges.find(b => b.id === ba.badge_id);
            return { ...ba, badge };
          })
      : [];

    // Leaderboard with ranks
    const leaderboard = [...userPoints]
      .sort((a, b) => b.total_points - a.total_points)
      .map((up, index) => ({ ...up, rank: index + 1 }));

    return {
      currentUserPoints,
      userBadges,
      leaderboard
    };
  }, [userPoints, badges, badgeAwards, userEmail]);

  return {
    userPoints,
    badges,
    badgeAwards,
    rewards,
    allRewards,
    redemptions,
    allRedemptions,
    ...computed,
    isLoading: pointsLoading || badgesLoading || awardsLoading || rewardsLoading || redemptionsLoading || allRedemptionsLoading || allRewardsLoading,
    refetchPoints,
    refetchRewards,
    refetchAllRedemptions
  };
}