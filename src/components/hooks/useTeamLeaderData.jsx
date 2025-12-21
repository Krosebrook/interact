import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Centralized hook for team leader data fetching
 * Reduces code duplication across team leader components
 */
export function useTeamLeaderData(userEmail) {
  // Fetch team where user is leader
  const { data: team, isLoading: teamLoading, error: teamError } = useQuery({
    queryKey: ['my-led-team', userEmail],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({
        leader_email: userEmail
      });
      return teams[0] || null;
    },
    enabled: !!userEmail,
    staleTime: 60000 // 1 minute
  });

  // Fetch team members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: async () => {
      const memberships = await base44.entities.TeamMembership.filter({
        team_id: team?.id
      });
      return memberships;
    },
    enabled: !!team?.id,
    staleTime: 30000
  });

  // Fetch team challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['team-challenges', team?.id],
    queryFn: async () => {
      const allChallenges = await base44.entities.TeamChallenge.filter({});
      return allChallenges.filter(c => 
        c.participating_teams?.includes(team?.id)
      );
    },
    enabled: !!team?.id,
    staleTime: 30000
  });

  // Fetch pending approvals
  const { data: pendingRecognitions = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ['pending-recognitions', team?.id, members],
    queryFn: async () => {
      if (!team?.id || !members.length) return [];
      
      const memberEmails = members.map(m => m.user_email);
      const allRecognitions = await base44.entities.Recognition.filter({
        status: 'pending'
      });
      
      return allRecognitions.filter(r => 
        memberEmails.includes(r.sender_email) || 
        memberEmails.includes(r.recipient_email)
      );
    },
    enabled: !!team?.id && members.length > 0,
    staleTime: 10000 // Refresh more frequently for approvals
  });

  const isLoading = teamLoading || membersLoading || challengesLoading || approvalsLoading;

  return {
    team,
    members,
    challenges,
    pendingRecognitions,
    isLoading,
    error: teamError,
    hasTeam: !!team,
    stats: {
      memberCount: members.length,
      activeChallenges: challenges.filter(c => c.status === 'active').length,
      completedChallenges: challenges.filter(c => c.status === 'completed').length,
      pendingApprovals: pendingRecognitions.length,
      totalPoints: team?.total_points || 0
    }
  };
}