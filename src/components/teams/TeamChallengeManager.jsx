import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Users, TrendingUp, Clock, CheckCircle, Flame } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function TeamChallengeManager({ userEmail, userTeamId }) {
  const [activeTab, setActiveTab] = useState('active');
  const queryClient = useQueryClient();

  // Fetch team challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date')
  });

  // Fetch team data for leaderboards
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  // Fetch user points for all teams
  const { data: allUserPoints } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list()
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const activeChallenges = challenges?.filter(c => c.status === 'active') || [];
  const upcomingChallenges = challenges?.filter(c => c.status === 'upcoming') || [];
  const completedChallenges = challenges?.filter(c => c.status === 'completed') || [];

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="teams" data-component="teamchallengemanager">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-600" />
                Team Challenges
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Compete with other teams and achieve collaborative goals
              </p>
            </div>
            <Flame className="h-12 w-12 text-amber-600 opacity-20" />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No active challenges</p>
              </CardContent>
            </Card>
          ) : (
            activeChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                teams={teams}
                allUserPoints={allUserPoints}
                userTeamId={userTeamId}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No upcoming challenges</p>
              </CardContent>
            </Card>
          ) : (
            upcomingChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                teams={teams}
                allUserPoints={allUserPoints}
                userTeamId={userTeamId}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No completed challenges yet</p>
              </CardContent>
            </Card>
          ) : (
            completedChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                teams={teams}
                allUserPoints={allUserPoints}
                userTeamId={userTeamId}
                isCompleted
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChallengeCard({ challenge, teams, allUserPoints, userTeamId, isCompleted = false }) {
  // Calculate team standings
  const teamStandings = (challenge.participating_teams || []).map(teamId => {
    const team = teams?.find(t => t.id === teamId);
    const teamPoints = allUserPoints?.filter(p => p.team_id === teamId) || [];
    
    let score = 0;
    if (challenge.challenge_type === 'points_race') {
      score = teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
    } else if (challenge.challenge_type === 'activity_count') {
      score = teamPoints.reduce((sum, p) => sum + (p.current_streak || 0), 0);
    }

    return {
      teamId,
      teamName: team?.team_name || 'Unknown Team',
      score,
      memberCount: team?.member_count || 0,
      isUserTeam: teamId === userTeamId
    };
  }).sort((a, b) => b.score - a.score);

  const userTeamStanding = teamStandings.find(t => t.isUserTeam);
  const userTeamRank = teamStandings.findIndex(t => t.isUserTeam) + 1;
  const daysLeft = challenge.end_date 
    ? Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className={userTeamStanding ? 'border-2 border-int-orange' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              {userTeamStanding && (
                <Badge className="bg-int-orange">Your Team Competing</Badge>
              )}
            </div>
            <p className="text-sm text-slate-600">{challenge.description}</p>
          </div>
          <Badge variant="outline" className="capitalize">
            {challenge.challenge_type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline */}
        {!isCompleted && daysLeft !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Ending today'}
            </span>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Team Standings</p>
            {userTeamStanding && (
              <Badge variant="outline">
                Your Rank: #{userTeamRank} / {teamStandings.length}
              </Badge>
            )}
          </div>

          {teamStandings.slice(0, 5).map((team, index) => (
            <div
              key={team.teamId}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                team.isUserTeam ? 'bg-orange-50 border-int-orange' : 'bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-slate-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm">{team.teamName}</p>
                  <p className="text-xs text-slate-500">{team.memberCount} members</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-int-orange">{team.score}</p>
                <p className="text-xs text-slate-500">
                  {challenge.challenge_type === 'points_race' ? 'points' : 'activities'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Prize */}
        {challenge.prize_description && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-900">Prize</p>
            </div>
            <p className="text-sm text-amber-800">{challenge.prize_description}</p>
          </div>
        )}

        {/* Winner (for completed challenges) */}
        {isCompleted && challenge.winner_team_id && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-600" />
              <p className="font-semibold text-emerald-900">
                Winner: {teams?.find(t => t.id === challenge.winner_team_id)?.team_name}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}