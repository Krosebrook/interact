/**
 * REFACTORED TEAM DATA HOOK
 * Production-grade with apiClient, RBAC, and computed values
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { usePermissions } from './usePermissions';

/**
 * Central hook for team-related data with security and performance
 */
export function useTeamData(options = {}) {
  const { enabled = true, userEmail = null } = options;
  const { canViewAllEmployees } = usePermissions();

  // Teams
  const { data: teams = [], isLoading: teamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: () => apiClient.list('Team', {
      sort: '-created_date',
      limit: 100
    }),
    enabled,
    staleTime: 30000
  });

  // Team memberships
  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: queryKeys.teams.memberships.list({ userEmail }),
    queryFn: () => userEmail 
      ? apiClient.list('TeamMembership', { filters: { user_email: userEmail } })
      : apiClient.list('TeamMembership', { sort: '-created_date', limit: 500 }),
    enabled,
    staleTime: 30000
  });

  // Team invitations (user-specific)
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: queryKeys.teams.invitations.list({ userEmail }),
    queryFn: () => userEmail
      ? apiClient.list('TeamInvitation', { 
          filters: { invitee_email: userEmail, status: 'pending' } 
        })
      : [],
    enabled: !!userEmail,
    staleTime: 30000
  });

  // Active team challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: queryKeys.teams.challenges.active,
    queryFn: () => apiClient.list('TeamChallenge', {
      filters: { status: 'active' }
    }),
    enabled,
    staleTime: 60000
  });

  // Memoized computed values
  const computed = useMemo(() => {
    // User's active team membership
    const userTeamMembership = memberships.find(
      m => m.user_email === userEmail && m.status === 'active'
    );
    
    // User's team
    const userTeam = userTeamMembership 
      ? teams.find(t => t.id === userTeamMembership.team_id) 
      : null;
    
    // User's team members
    const teamMembers = userTeam
      ? memberships.filter(m => m.team_id === userTeam.id && m.status === 'active')
      : [];

    return {
      userTeam,
      userTeamMembership,
      teamMembers
    };
  }, [teams, memberships, userEmail]);

  return {
    teams,
    memberships,
    invitations,
    challenges,
    ...computed,
    isLoading: teamsLoading || membershipsLoading || invitationsLoading || challengesLoading,
    refetchTeams,
    canViewAllTeams: canViewAllEmployees
  };
}