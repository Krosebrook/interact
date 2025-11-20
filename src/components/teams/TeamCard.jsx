import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Trophy, UserPlus, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TeamCard({ team, rank, userStats, currentUserEmail }) {
  const queryClient = useQueryClient();
  const isMember = team.members?.includes(currentUserEmail);
  const isCaptain = team.captain_email === currentUserEmail;

  const joinTeamMutation = useMutation({
    mutationFn: async () => {
      const updatedMembers = [...(team.members || []), currentUserEmail];
      return base44.entities.Team.update(team.id, { members: updatedMembers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      toast.success('Joined team! 🎉');
    }
  });

  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      const updatedMembers = team.members.filter(email => email !== currentUserEmail);
      return base44.entities.Team.update(team.id, { members: updatedMembers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      toast.success('Left team');
    }
  });

  const rankColors = {
    1: 'from-yellow-400 to-orange-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-500 to-amber-600'
  };

  const teamMembers = (team.members || [])
    .map(email => {
      const stats = userStats.find(stat => stat.user_email === email);
      return stats || { user_email: email, user_name: email.split('@')[0], total_points: 0 };
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Card className={`p-6 hover:shadow-lg transition-all ${
        isMember ? 'ring-2 ring-indigo-500' : ''
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: team.color + '30' }}
            >
              {team.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{team.team_name}</h3>
                {rank <= 3 && (
                  <Trophy className={`h-5 w-5 bg-gradient-to-br ${rankColors[rank]} bg-clip-text text-transparent`} />
                )}
              </div>
              <p className="text-sm text-slate-600">{team.description}</p>
            </div>
          </div>
          {rank <= 3 && (
            <Badge className={`bg-gradient-to-r ${rankColors[rank]} text-white border-0`}>
              #{rank}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <div className="text-2xl font-bold text-slate-900">{team.total_points}</div>
            <div className="text-xs text-slate-600">Team Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{team.members?.length || 0}</div>
            <div className="text-xs text-slate-600">Members</div>
          </div>
        </div>

        {/* Members Preview */}
        {teamMembers.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Users className="h-4 w-4" />
              <span>Team Members</span>
            </div>
            <div className="space-y-1">
              {teamMembers.slice(0, 3).map((member, idx) => (
                <div key={member.user_email || idx} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {member.user_email === team.captain_email && (
                      <Crown className="h-3 w-3 text-yellow-600" />
                    )}
                    {member.user_name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {member.total_points} pts
                  </Badge>
                </div>
              ))}
              {teamMembers.length > 3 && (
                <p className="text-xs text-slate-500 pl-5">
                  +{teamMembers.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {!isMember && (
          <Button
            onClick={() => joinTeamMutation.mutate()}
            size="sm"
            className="w-full"
            variant="outline"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join Team
          </Button>
        )}
        {isMember && !isCaptain && (
          <Button
            onClick={() => leaveTeamMutation.mutate()}
            size="sm"
            className="w-full"
            variant="ghost"
          >
            Leave Team
          </Button>
        )}
      </Card>
    </motion.div>
  );
}