import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamTournamentBracket() {
  const queryClient = useQueryClient();

  const { data: tournaments } = useQuery({
    queryKey: ['team-tournaments'],
    queryFn: () => base44.entities.TeamTournament.filter({ is_active: true })
  });

  const { data: teams } = useQuery({
    queryKey: ['teams-for-tournament'],
    queryFn: () => base44.entities.Team.list()
  });

  const activeTournament = tournaments?.[0];

  if (!activeTournament) return null;

  const participatingTeams = teams?.filter(t => 
    activeTournament.participating_teams?.includes(t.id)
  ) || [];

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="teamtournamentbracket" className="border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            {activeTournament.tournament_name}
          </CardTitle>
          <Badge className="bg-purple-600">
            Round {activeTournament.current_round}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 mb-4">{activeTournament.description}</p>
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium">Prize: {activeTournament.prize_points} points per team member</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {participatingTeams.map(team => (
              <div key={team.id} className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="font-medium text-slate-900">{team.name}</div>
                <div className="text-sm text-slate-600">{team.member_count || 0} members</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}