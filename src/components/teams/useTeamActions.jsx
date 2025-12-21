import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';

export function useTeamActions(user, userPoints, myTeam) {
  const queryClient = useQueryClient();
  const { trigger } = useGamificationTrigger();

  const invalidateTeamData = () => {
    queryClient.invalidateQueries(['teams']);
    queryClient.invalidateQueries(['user-points']);
  };

  const createTeamMutation = useMutation({
    mutationFn: async (data) => {
      const team = await base44.entities.Team.create({
        ...data,
        team_leader_email: user?.email,
        total_points: 0,
        member_count: 1
      });

      if (userPoints) {
        await base44.entities.UserPoints.update(userPoints.id, {
          team_id: team.id,
          team_name: team.team_name
        });
      }

      return team;
    },
    onSuccess: () => {
      invalidateTeamData();
      toast.success('Team created successfully! 🎉');
    }
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (team) => {
      if (team.member_count >= team.max_members) {
        throw new Error('Team is full');
      }

      if (userPoints) {
        await base44.entities.UserPoints.update(userPoints.id, {
          team_id: team.id,
          team_name: team.team_name
        });
      }

      await base44.entities.Team.update(team.id, {
        member_count: team.member_count + 1
      });
      
      return team;
    },
    onSuccess: async (team) => {
      invalidateTeamData();
      toast.success('Joined team successfully! 🎉');
      
      // Trigger gamification rule
      await trigger('team_join', user?.email, {
        team_id: team.id,
        team_name: team.team_name,
        reference_id: team.id
      });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      if (userPoints) {
        await base44.entities.UserPoints.update(userPoints.id, {
          team_id: null,
          team_name: null
        });
      }

      if (myTeam) {
        await base44.entities.Team.update(myTeam.id, {
          member_count: Math.max(0, myTeam.member_count - 1)
        });
      }
    },
    onSuccess: () => {
      invalidateTeamData();
      toast.success('Left team successfully');
    }
  });

  return {
    createTeam: createTeamMutation.mutate,
    joinTeam: joinTeamMutation.mutate,
    leaveTeam: leaveTeamMutation.mutate,
    isCreating: createTeamMutation.isPending,
    isJoining: joinTeamMutation.isPending,
    isLeaving: leaveTeamMutation.isPending
  };
}