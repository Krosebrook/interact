import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Central hook for team-related data
 * Used by Teams page, Calendar, GamificationDashboard
 */
export function useTeamData(options = {}) {
  const { enabled = true, userEmail = null } = options;

  const { data: teams = [], isLoading: teamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-created_date', 100),
    enabled,
    staleTime: 30000
  });

  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ['team-memberships', userEmail],
    queryFn: () => userEmail 
      ? base44.entities.TeamMembership.filter({ user_email: userEmail })
      : base44.entities.TeamMembership.list('-created_date', 500),
    enabled,
    staleTime: 30000
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['team-invitations', userEmail],
    queryFn: () => userEmail
      ? base44.entities.TeamInvitation.filter({ invitee_email: userEmail, status: 'pending' })
      : [],
    enabled: !!userEmail,
    staleTime: 30000
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.filter({ status: 'active' }),
    enabled,
    staleTime: 60000
  });

  // Get user's team
  const userTeamMembership = memberships.find(m => m.user_email === userEmail && m.status === 'active');
  const userTeam = userTeamMembership ? teams.find(t => t.id === userTeamMembership.team_id) : null;

  return {
    teams,
    memberships,
    invitations,
    challenges,
    userTeam,
    userTeamMembership,
    isLoading: teamsLoading || membershipsLoading || invitationsLoading || challengesLoading,
    refetchTeams
  };
}