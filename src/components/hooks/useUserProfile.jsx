import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { queryKeys } from '../lib/queryKeys';
import { cachePresets } from '../lib/cacheConfig';

/**
 * Hook for fetching and managing user profile data
 * Includes profile info, points, badges, and related gamification data
 * 
 * @param {string} userEmail - User's email address
 */
export function useUserProfile(userEmail) {
  const queryClient = useQueryClient();

  const { 
    data: profile, 
    isLoading: profileLoading, 
    refetch: refetchProfile 
  } = useQuery({
    queryKey: queryKeys.user.profile(userEmail),
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      return profiles[0] || { user_email: userEmail };
    },
    enabled: !!userEmail,
    ...cachePresets.user
  });

  const { 
    data: userPoints, 
    isLoading: pointsLoading 
  } = useQuery({
    queryKey: queryKeys.userPoints.byUser(userEmail),
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0] || null;
    },
    enabled: !!userEmail,
    ...cachePresets.user
  });

  const { 
    data: userAvatar 
  } = useQuery({
    queryKey: queryKeys.user.avatar(userEmail),
    queryFn: async () => {
      const avatars = await base44.entities.UserAvatar.filter({ user_email: userEmail });
      return avatars[0] || null;
    },
    enabled: !!userEmail,
    ...cachePresets.user
  });

  // Invalidate all user-related data
  const invalidateUserData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userEmail) });
    queryClient.invalidateQueries({ queryKey: queryKeys.userPoints.byUser(userEmail) });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.avatar(userEmail) });
  };

  return {
    profile,
    userPoints,
    userAvatar,
    isLoading: profileLoading || pointsLoading,
    refetchProfile,
    invalidateUserData
  };
}