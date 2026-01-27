import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function TeamWellnessLeaderboard({ challengeId }) {
  const { data: challenge } = useQuery({
    queryKey: ['wellnessChallenge', challengeId],
    queryFn: () => base44.entities.WellnessChallenge.filter({ id: challengeId }).then(r => r[0])
  });
  
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['teamWellnessLeaderboard', challengeId],
    queryFn: async () => {
      const goals = await base44.entities.WellnessGoal.filter({ challenge_id: challengeId });
      
      // Aggregate by team
      const teamStats = {};
      
      for (const goal of goals) {
        const memberships = await base44.entities.TeamMembership.filter({ 
          user_email: goal.user_email 
        });
        
        for (const membership of memberships) {
          if (!teamStats[membership.team_id]) {
            const team = await base44.entities.Team.filter({ id: membership.team_id }).then(r => r[0]);
            teamStats[membership.team_id] = {
              teamId: membership.team_id,
              teamName: team?.name || 'Unknown Team',
              totalProgress: 0,
              memberCount: 0,
              completedGoals: 0
            };
          }
          
          teamStats[membership.team_id].totalProgress += goal.progress_percentage || 0;
          teamStats[membership.team_id].memberCount += 1;
          if (goal.status === 'completed') {
            teamStats[membership.team_id].completedGoals += 1;
          }
        }
      }
      
      // Calculate averages and sort
      const teams = Object.values(teamStats).map(team => ({
        ...team,
        avgProgress: team.memberCount > 0 ? team.totalProgress / team.memberCount : 0
      })).sort((a, b) => b.avgProgress - a.avgProgress);
      
      return teams;
    },
    enabled: !!challengeId
  });
  
  const { data: individualLeaderboard } = useQuery({
    queryKey: ['individualWellnessLeaderboard', challengeId],
    queryFn: async () => {
      const goals = await base44.entities.WellnessGoal.filter({ challenge_id: challengeId });
      const profiles = await base44.entities.UserProfile.filter({});
      
      return goals
        .map(goal => ({
          ...goal,
          profile: profiles.find(p => p.user_email === goal.user_email)
        }))
        .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))
        .slice(0, 10);
    },
    enabled: !!challengeId
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  const getRankColor = (index) => {
    if (index === 0) return 'text-yellow-600';
    if (index === 1) return 'text-slate-400';
    if (index === 2) return 'text-amber-600';
    return 'text-slate-600';
  };
  
  const getRankBg = (index) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    if (index === 1) return 'bg-gradient-to-br from-slate-300 to-slate-400';
    if (index === 2) return 'bg-gradient-to-br from-amber-400 to-amber-600';
    return 'bg-slate-100';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-int-gold" />
          Wellness Leaderboard
        </CardTitle>
        <CardDescription>
          {challenge?.title || 'Challenge'} - Team & Individual Rankings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="teams">
          <TabsList className="w-full">
            <TabsTrigger value="teams" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex-1">
              <Award className="h-4 w-4 mr-2" />
              Individual
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="teams" className="space-y-3 mt-4">
            {leaderboard?.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No team data yet</p>
            ) : (
              leaderboard?.map((team, index) => (
                <div
                  key={team.teamId}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    index < 3 ? 'border-int-gold/30 bg-int-gold/5' : 'border-slate-200'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full ${getRankBg(index)} flex items-center justify-center font-bold text-white`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{team.teamName}</p>
                    <p className="text-sm text-slate-500">
                      {team.memberCount} members • {team.completedGoals} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-int-orange">
                      {Math.round(team.avgProgress)}%
                    </p>
                    <p className="text-xs text-slate-500">Avg Progress</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="individual" className="space-y-3 mt-4">
            {individualLeaderboard?.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No participants yet</p>
            ) : (
              individualLeaderboard?.map((goal, index) => (
                <div
                  key={goal.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    index < 3 ? 'border-int-gold/30 bg-int-gold/5' : 'border-slate-200'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full ${getRankBg(index)} flex items-center justify-center font-bold text-white text-sm`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{goal.user_email}</p>
                    {goal.status === 'completed' && (
                      <Badge className="text-xs bg-green-500 text-white mt-1">Completed</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-int-orange">
                      {Math.round(goal.progress_percentage || 0)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}