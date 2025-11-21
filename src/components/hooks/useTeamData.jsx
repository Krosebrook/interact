import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Centralized hook for team-related data
 */
export function useTeamData(teamId = null) {
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points', 50)
  });

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({ id: teamId });
      return teams[0];
    },
    enabled: !!teamId
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => base44.entities.UserPoints.filter({ team_id: teamId }),
    enabled: !!teamId
  });

  const { data: teamMessages = [] } = useQuery({
    queryKey: ['team-messages', teamId],
    queryFn: () => base44.entities.TeamMessage.filter({ team_id: teamId }),
    enabled: !!teamId,
    refetchInterval: 5000
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date', 20)
  });

  return {
    teams,
    team,
    teamMembers,
    teamMessages,
    challenges
  };
}