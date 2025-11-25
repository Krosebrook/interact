import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUserProfile(userEmail) {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', userEmail],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      return profiles[0] || { user_email: userEmail };
    },
    enabled: !!userEmail
  });

  const { data: userPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0];
    },
    enabled: !!userEmail
  });

  return {
    profile,
    userPoints,
    isLoading: profileLoading || pointsLoading,
    refetchProfile
  };
}