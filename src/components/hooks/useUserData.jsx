import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * Centralized hook for user authentication and data
 * @param {boolean} requireAuth - Redirect to login if not authenticated
 * @param {boolean} requireAdmin - Redirect to login if not admin
 */
export function useUserData(requireAuth = true, requireAdmin = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (requireAdmin && currentUser.role !== 'admin') {
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        if (requireAuth) {
          base44.auth.redirectToLogin();
        }
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [requireAuth, requireAdmin]);

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0];
    },
    enabled: !!user
  });

  return {
    user,
    loading,
    userPoints: userPoints[0] || null,
    profile,
    isAdmin: user?.role === 'admin'
  };
}