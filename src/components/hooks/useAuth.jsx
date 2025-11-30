/**
 * REFACTORED AUTH HOOK
 * Simplified authentication with better caching and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserService, UserPointsService, UserProfileService, QUERY_CONFIG } from '../lib/api';

/**
 * Core authentication hook - use this for auth state
 * For user data with points/profile, use useUserData instead
 */
export function useAuth(requireAuth = true) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadAuth = async () => {
      try {
        const currentUser = await UserService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          if (requireAuth) {
            UserService.redirectToLogin();
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadAuth();
    
    return () => { isMounted = false; };
  }, [requireAuth]);

  const logout = useCallback((redirectUrl) => {
    UserService.logout(redirectUrl);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    logout
  };
}

/**
 * Full user data hook with profile and points
 * Use useAuth for simple auth checks without extra queries
 * 
 * @param {boolean} requireAuth - Redirect to login if not authenticated
 * @param {boolean} requireAdmin - Redirect non-admins to participant portal
 * @param {boolean} requireParticipant - Redirect admins to admin dashboard
 */
export function useUserData(requireAuth = true, requireAdmin = false, requireParticipant = false) {
  const { user, loading: authLoading, isAdmin, logout } = useAuth(requireAuth);
  const queryClient = useQueryClient();

  // Role-based routing
  useEffect(() => {
    if (authLoading || !user) return;
    
    // Admin pages: redirect non-admins to participant portal
    if (requireAdmin && !isAdmin) {
      window.location.href = '/ParticipantPortal';
      return;
    }
    
    // Participant pages: redirect admins to admin dashboard
    if (requireParticipant && isAdmin) {
      window.location.href = '/Dashboard';
      return;
    }
  }, [authLoading, requireAdmin, requireParticipant, user, isAdmin]);

  // Fetch user points
  const { data: userPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: () => UserPointsService.getByEmail(user.email),
    enabled: !!user?.email,
    ...QUERY_CONFIG.user
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: () => UserProfileService.getByEmail(user.email),
    enabled: !!user?.email,
    ...QUERY_CONFIG.user
  });

  // Invalidate user data
  const refreshUserData = useCallback(() => {
    if (user?.email) {
      queryClient.invalidateQueries(['user-points', user.email]);
      queryClient.invalidateQueries(['user-profile', user.email]);
    }
  }, [queryClient, user?.email]);

  return {
    user,
    loading: authLoading || (user && (pointsLoading || profileLoading)),
    userPoints,
    profile,
    isAdmin,
    logout,
    refreshUserData
  };
}

export default useAuth;