import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '../../utils';

/**
 * Full user data hook with profile, points, and role-based routing
 * Production-grade with security, error handling, and performance optimization
 * 
 * @param {boolean} requireAuth - Redirect to login if not authenticated
 * @param {boolean} requireAdmin - Redirect if not admin
 * @param {boolean} requireFacilitator - Redirect if not facilitator (or admin)
 * @param {boolean} requireParticipant - Redirect if not participant
 * @returns {Object} User data and helpers
 */
export function useUserData(
  requireAuth = true, 
  requireAdmin = false,
  requireFacilitator = false,
  requireParticipant = false
) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const redirectInitiated = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    const loadUser = async () => {
      try {
        setError(null);
        const currentUser = await base44.auth.me();
        if (!isMounted || abortController.signal.aborted) return;
        
        // Validate user object
        if (!currentUser?.email) {
          throw new Error('Invalid user data received');
        }
        
        setUser(currentUser);
        
        const isAdmin = currentUser.role === 'admin';
        const isFacilitator = currentUser.user_type === 'facilitator';
        const isParticipant = currentUser.user_type === 'participant';
        const hasNoUserType = !currentUser.user_type && !isAdmin;
        
        // If non-admin user has no user_type, redirect to role selection
        if (hasNoUserType && !requireAdmin && !redirectInitiated.current) {
          redirectInitiated.current = true;
          window.location.href = createPageUrl('RoleSelection');
          return;
        }
        
        // Admin-only pages
        if (requireAdmin && !isAdmin && !redirectInitiated.current) {
          redirectInitiated.current = true;
          // Non-admins go to their appropriate dashboard
          if (isFacilitator) {
            window.location.href = createPageUrl('FacilitatorDashboard');
          } else if (isParticipant) {
            window.location.href = createPageUrl('ParticipantPortal');
          } else {
            window.location.href = createPageUrl('RoleSelection');
          }
          return;
        }
        
        // Facilitator-only pages (admins can also access)
        if (requireFacilitator && !isAdmin && !isFacilitator && !redirectInitiated.current) {
          redirectInitiated.current = true;
          if (isParticipant) {
            window.location.href = createPageUrl('ParticipantPortal');
          } else {
            window.location.href = createPageUrl('RoleSelection');
          }
          return;
        }
        
        // Participant-only pages
        if (requireParticipant && !isParticipant && !redirectInitiated.current) {
          redirectInitiated.current = true;
          if (isAdmin) {
            window.location.href = createPageUrl('Dashboard');
          } else if (isFacilitator) {
            window.location.href = createPageUrl('FacilitatorDashboard');
          } else {
            window.location.href = createPageUrl('RoleSelection');
          }
          return;
        }
        
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load user data');
          if (requireAuth && !redirectInitiated.current) {
            redirectInitiated.current = true;
            base44.auth.redirectToLogin();
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadUser();
    return () => { 
      isMounted = false;
      abortController.abort();
    };
  }, [requireAuth, requireAdmin, requireFacilitator, requireParticipant]);

  // Fetch user points
  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user?.email });
      return points[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 30000
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 30000
  });

  // Refresh user data
  const refreshUserData = useCallback(() => {
    if (user?.email) {
      queryClient.invalidateQueries(['user-points', user.email]);
      queryClient.invalidateQueries(['user-profile', user.email]);
    }
  }, [queryClient, user?.email]);

  // Logout helper with cleanup
  const logout = useCallback((redirectUrl) => {
    // Clear all React Query cache to prevent refetch during logout
    queryClient.clear();
    // Clear user state immediately
    setUser(null);
    setLoading(false);
    // Perform logout
    base44.auth.logout(redirectUrl);
  }, [queryClient]);

  return {
    user,
    loading,
    error,
    userPoints,
    profile,
    isAdmin: user?.role === 'admin',
    isFacilitator: user?.user_type === 'facilitator' || user?.role === 'admin',
    isParticipant: user?.user_type === 'participant',
    userType: user?.user_type,
    isRedirecting: redirectInitiated.current,
    logout,
    refreshUserData,
    // Helper flags
    isAuthenticated: !!user,
    hasProfile: !!profile,
    hasPoints: !!userPoints
  };
}