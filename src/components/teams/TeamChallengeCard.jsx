import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Calendar, Target, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TeamChallengeCard({ challenge, teams, myTeam }) {
  const queryClient = useQueryClient();
  const isParticipating = challenge.participating_teams?.includes(myTeam?.id);

  const joinChallengeMutation = useMutation({
    mutationFn: async () => {
      const updatedTeams = [...(challenge.participating_teams || []), myTeam.id];
      return base44.entities.TeamChallenge.update(challenge.id, {
        participating_teams: updatedTeams
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      toast.success('Team joined challenge! 🏆');
    }
  });

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const goalTypeIcons = {
    points: Trophy,
    events: Calendar,
    activities: Target,
    custom: Flag
  };

  const GoalIcon = goalTypeIcons[challenge.goal_type] || Trophy;

  // Calculate progress for participating teams
  const teamProgress = teams
    .filter(t => challenge.participating_teams?.includes(t.id))
    .map(team => ({
      team,
      progress: challenge.goal_type === 'points' 
        ? (team.total_points / challenge.goal_value) * 100
        : 0
    }))
    .sort((a, b) => b.progress - a.progress);

  const daysRemaining = Math.ceil(
    (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={`p-6 ${
        challenge.status === 'active' 
          ? 'border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' 
          : ''
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <GoalIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{challenge.title}</h3>
              <p className="text-sm text-slate-600">{challenge.description}</p>
            </div>
          </div>
          <Badge className={statusColors[challenge.status]}>
            {challenge.status}
          </Badge>
        </div>

        {/* Goal */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Goal</span>
            {daysRemaining > 0 && challenge.status === 'active' && (
              <span className="text-xs text-orange-600">
                {daysRemaining} days left
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {challenge.goal_value} {challenge.goal_type}
          </div>
          <div className="text-xs text-slate-600">
            Ends {format(new Date(challenge.end_date), 'MMM d, yyyy')}
          </div>
        </div>

        {/* Prize */}
        {challenge.prize && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-900">Prize:</span>
              <span className="text-sm text-yellow-700">{challenge.prize}</span>
            </div>
          </div>
        )}

        {/* Team Progress */}
        {teamProgress.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Team Progress</h4>
            <div className="space-y-2">
              {teamProgress.slice(0, 3).map(({ team, progress }, index) => (
                <div key={team.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{team.avatar}</span>
                      <span className="font-medium">{team.team_name}</span>
                      {index === 0 && progress >= 100 && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </span>
                    <span className="text-slate-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        index === 0 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participating Teams */}
        <div className="text-sm text-slate-600 mb-4">
          {challenge.participating_teams?.length || 0} teams participating
        </div>

        {/* Actions */}
        {myTeam && !isParticipating && challenge.status === 'active' && (
          <Button
            onClick={() => joinChallengeMutation.mutate()}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            Join Challenge
          </Button>
        )}
        {isParticipating && (
          <Badge className="w-full justify-center py-2 bg-green-100 text-green-700">
            Your team is participating
          </Badge>
        )}
      </Card>
    </motion.div>
  );
}