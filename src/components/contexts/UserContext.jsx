/**
 * CENTRALIZED USER CONTEXT
 * Global state management for authentication, user data, and permissions
 * Ensures consistent user state across the entire application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authClient } from '../lib/apiClient';
import { logError } from '../lib/errors';

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

const UserContext = createContext(null);

// ============================================================================
// USER CONTEXT PROVIDER
// ============================================================================

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  
  /**
   * Load user data on mount
   */
  useEffect(() => {
    loadUser();
  }, []);
  
  /**
   * Load current user from authentication
   */
  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await authClient.me();
      setUser(currentUser);
    } catch (err) {
      setError(err);
      logError(err, { context: 'UserContext.loadUser' });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    await loadUser();
    
    // Invalidate user-related queries
    queryClient.invalidateQueries(['user-points']);
    queryClient.invalidateQueries(['user-profile']);
    queryClient.invalidateQueries(['user-preferences']);
  }, [queryClient]);
  
  /**
   * Update user data optimistically
   */
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);
  
  /**
   * Logout user
   */
  const logout = useCallback(async (redirectUrl) => {
    try {
      await authClient.logout(redirectUrl);
      setUser(null);
      queryClient.clear();
    } catch (err) {
      logError(err, { context: 'UserContext.logout' });
      throw err;
    }
  }, [queryClient]);
  
  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;
  
  /**
   * Derived user properties
   */
  const isAdmin = user?.role === 'admin';
  const isHR = user?.user_type === 'hr' || user?.role === 'hr';
  const isTeamLead = user?.user_type === 'team_lead';
  const isFacilitator = user?.user_type === 'facilitator' || isAdmin;
  const isParticipant = user?.user_type === 'participant';
  
  /**
   * Get user's display name
   */
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  
  /**
   * Get user's initials for avatars
   */
  const initials = user?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
  
  const value = {
    // User state
    user,
    loading,
    error,
    isAuthenticated,
    
    // User properties
    isAdmin,
    isHR,
    isTeamLead,
    isFacilitator,
    isParticipant,
    displayName,
    initials,
    userType: user?.user_type,
    userRole: user?.role,
    
    // Actions
    refreshUser,
    updateUser,
    logout,
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================================================
// HOOK TO USE USER CONTEXT
// ============================================================================

/**
 * Hook to access user context
 * @throws {Error} If used outside UserContextProvider
 */
export function useUser() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within UserContextProvider');
  }
  
  return context;
}

export default UserContext;