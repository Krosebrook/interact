import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Swords, 
  Trophy, 
  Users, 
  Clock, 
  Zap, 
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  Play,
  Crown
} from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';

const CHALLENGE_TYPE_CONFIG = {
  head_to_head: { icon: Swords, label: 'Head to Head', color: 'from-red-500 to-orange-500' },
  league: { icon: Trophy, label: 'League', color: 'from-purple-500 to-violet-600' },
  tournament: { icon: Award, label: 'Tournament', color: 'from-amber-500 to-yellow-500' },
  collaborative: { icon: Users, label: 'Collaborative', color: 'from-blue-500 to-cyan-500' },
  race: { icon: Target, label: 'Race', color: 'from-emerald-500 to-teal-500' }
};

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
};

export default function TeamChallengeCard({ 
  challenge, 
  userTeamId,
  onJoin,
  onViewDetails 
}) {
  const typeConfig = CHALLENGE_TYPE_CONFIG[challenge.challenge_type] || CHALLENGE_TYPE_CONFIG.head_to_head;
  const TypeIcon = typeConfig.icon;
  const statusConfig = STATUS_CONFIG[challenge.status] || STATUS_CONFIG.draft;

  const endDate = challenge.end_date ? new Date(challenge.end_date) : null;
  const daysRemaining = endDate ? differenceInDays(endDate, new Date()) : null;
  const hoursRemaining = endDate ? differenceInHours(endDate, new Date()) % 24 : null;
  const isUrgent = daysRemaining !== null && daysRemaining <= 2;

  const participatingTeams = challenge.participating_teams || [];
  const userTeamParticipating = participatingTeams.some(t => t.team_id === userTeamId);
  const userTeam = participatingTeams.find(t => t.team_id === userTeamId);
  
  // Sort teams by score
  const rankedTeams = [...participatingTeams].sort((a, b) => (b.current_score || 0) - (a.current_score || 0));
  const leadingTeam = rankedTeams[0];
  const maxScore = leadingTeam?.current_score || 0;

  const isCompleted = challenge.status === 'completed';
  const winnerTeam = participatingTeams.find(t => t.team_id === challenge.winner_team_id);

  return (
    <motion.div
      data-b44-sync="true"
      data-feature="teams"
      data-component="teamchallengecard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className={`overflow-hidden border-2 transition-all ${
        isCompleted ? 'border-blue-200' :
        userTeamParticipating ? 'border-int-orange' :
        isUrgent ? 'border-red-300' :
        'border-slate-200 hover:border-int-navy/50'
      }`}>
        {/* Type header */}
        <div className={`h-2 bg-gradient-to-r ${typeConfig.color}`} />

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.color} shadow-lg`}>
                <TypeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{challenge.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  <Badge variant="outline">{typeConfig.label}</Badge>
                </div>
              </div>
            </div>

            {/* Reward */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-int-orange font-bold text-lg">
                <Zap className="h-5 w-5" />
                {challenge.points_reward}
              </div>
              <span className="text-xs text-slate-500">winner reward</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {challenge.description}
          </p>

          {/* Winner Display (if completed) */}
          {isCompleted && winnerTeam && (
            <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-amber-800">Winner: {winnerTeam.team_name}</span>
                <span className="text-amber-600">({winnerTeam.current_score} pts)</span>
              </div>
            </div>
          )}

          {/* Participating Teams */}
          {participatingTeams.length > 0 && challenge.status === 'active' && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Team Standings</p>
              {rankedTeams.slice(0, 4).map((team, idx) => {
                const progress = maxScore > 0 ? (team.current_score / maxScore) * 100 : 0;
                const isLeading = idx === 0;
                const isUserTeam = team.team_id === userTeamId;

                return (
                  <div 
                    key={team.team_id} 
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isUserTeam ? 'bg-int-orange/10 border border-int-orange/30' : 'bg-slate-50'
                    }`}
                  >
                    <span className={`w-5 text-sm font-bold ${
                      idx === 0 ? 'text-amber-500' :
                      idx === 1 ? 'text-slate-400' :
                      idx === 2 ? 'text-amber-700' :
                      'text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{team.team_name}</span>
                        {isLeading && <Crown className="h-3 w-3 text-amber-500" />}
                        {isUserTeam && <Badge className="text-xs bg-int-orange text-white">You</Badge>}
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {team.current_score || 0}
                    </span>
                  </div>
                );
              })}
              {rankedTeams.length > 4 && (
                <p className="text-xs text-slate-500 text-center">
                  +{rankedTeams.length - 4} more teams
                </p>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {participatingTeams.length} teams
            </span>
            {daysRemaining !== null && challenge.status === 'active' && (
              <span className={`flex items-center gap-1 ${isUrgent ? 'text-red-600 font-semibold' : ''}`}>
                <Clock className="h-4 w-4" />
                {daysRemaining > 0 
                  ? `${daysRemaining}d ${hoursRemaining}h left`
                  : hoursRemaining > 0 
                    ? `${hoursRemaining}h left`
                    : 'Ending soon!'
                }
              </span>
            )}
            {challenge.target_value && (
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Target: {challenge.target_value}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {challenge.status === 'active' && !userTeamParticipating && userTeamId && (
              <Button 
                onClick={() => onJoin?.(challenge)}
                className="flex-1 bg-gradient-to-r from-int-orange to-amber-500 hover:opacity-90 text-white shadow-md press-effect"
              >
                <Swords className="h-4 w-4 mr-2" />
                Join Challenge
              </Button>
            )}
            {userTeamParticipating && challenge.status === 'active' && (
              <Button 
                variant="outline"
                className="flex-1 border-int-orange text-int-orange"
                onClick={() => onViewDetails?.(challenge)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Progress
              </Button>
            )}
            {isCompleted && (
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => onViewDetails?.(challenge)}
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Results
              </Button>
            )}
            {challenge.status === 'draft' && (
              <Button variant="outline" className="flex-1" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}