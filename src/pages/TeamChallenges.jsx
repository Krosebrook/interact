import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeamChallengeCreator from '../components/teams/TeamChallengeCreator';
import { Trophy, Plus, Target, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

export default function TeamChallenges() {
  const { user } = useUserData();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date', 50)
  });

  const isManager = user?.role === 'admin' || user?.user_type === 'facilitator';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy flex items-center gap-3">
            <Trophy className="h-8 w-8 text-int-orange" />
            Team Challenges
          </h1>
          <p className="text-slate-600 mt-1">Engage teams with collaborative goals and rewards</p>
        </div>
        {isManager && (
          <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-5 w-5 mr-2" />
            Create Challenge
          </Button>
        )}
      </div>

      {/* Active Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.filter(c => c.status === 'active').map(challenge => (
          <Card key={challenge.id} className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{challenge.challenge_name}</span>
                <Trophy className="h-5 w-5 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 mb-4">{challenge.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Target</div>
                  <div className="font-bold">{challenge.target_metric?.target_value}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Current</div>
                  <div className="font-bold">{challenge.target_metric?.current_value || 0}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                <Calendar className="h-3 w-3 inline mr-1" />
                Ends {moment(challenge.end_date).fromNow()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Team Challenge</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Select Team (Optional)</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="All Teams / Company-wide" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Teams</SelectItem>
                {teams?.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TeamChallengeCreator teamId={selectedTeam} />
        </DialogContent>
      </Dialog>
    </div>
  );
}