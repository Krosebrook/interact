import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Users, Zap } from 'lucide-react';

export default function TeamChallengeLeaderboard({ challengeId }) {
  const { data: challenge } = useQuery({
    queryKey: ['team-challenge', challengeId],
    queryFn: async () => {
      return await base44.entities.TeamChallenge.get(challengeId);
    },
    enabled: !!challengeId
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      return await base44.entities.Team.list();
    }
  });

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points-for-challenge'],
    queryFn: async () => {
      return await base44.entities.UserPoints.list();
    }
  });

  if (!challenge) return null;

  // Calculate team scores
  const teamScores = teams.map(team => {
    const teamMembers = userPoints.filter(up => up.team_id === team.id);
    const totalPoints = teamMembers.reduce((sum, up) => sum + (up.total_points || 0), 0);
    const avgPoints = teamMembers.length > 0 ? totalPoints / teamMembers.length : 0;
    
    return {
      team,
      totalPoints,
      avgPoints,
      memberCount: teamMembers.length
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <Card className="border-purple-200" data-b44-sync="true" data-feature="teams" data-component="teamchallengeleaderboard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-600" />
          Team Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamScores.slice(0, 10).map((score, index) => (
            <div
              key={score.team.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                index === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300' :
                index === 1 ? 'bg-slate-50 border-slate-300' :
                index === 2 ? 'bg-orange-50 border-orange-300' :
                'bg-white border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                index === 0 ? 'bg-amber-500 text-white' :
                index === 1 ? 'bg-slate-400 text-white' :
                index === 2 ? 'bg-orange-500 text-white' :
                'bg-slate-200 text-slate-600'
              }`}>
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{score.team.team_name}</h4>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {score.memberCount}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600">
                  Avg: {score.avgPoints.toFixed(0)} pts/member
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold text-purple-600">
                  <Zap className="h-5 w-5" />
                  {score.totalPoints.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">total points</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}