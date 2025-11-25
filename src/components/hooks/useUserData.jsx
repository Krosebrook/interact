import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Centralized hook for user authentication and data
 */
export function useUserData(requireAuth = true, requireAdmin = false) {
  const { data: user, isLoading: loading, error } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      if (requireAdmin && currentUser.role !== 'admin') {
        base44.auth.redirectToLogin();
        return null;
      }
      return currentUser;
    },
    retry: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Redirect on auth error
  if (error && requireAuth) {
    base44.auth.redirectToLogin();
  }

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  return {
    user,
    loading,
    userPoints: userPoints[0] || null,
    userProfile,
    isAdmin: user?.role === 'admin'
  };
}