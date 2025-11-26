import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Swords, 
  Trophy, 
  Users, 
  Plus, 
  TrendingUp,
  Flame,
  Award,
  Target,
  Zap,
  Crown,
  Calendar
} from 'lucide-react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatCard } from '../components/common/StatsGrid';
import TeamVsTeamLeaderboard from '../components/teams/TeamVsTeamLeaderboard';
import TeamChallengeCard from '../components/teams/TeamChallengeCard';
import CreateTeamChallengeDialog from '../components/teams/CreateTeamChallengeDialog';
import { toast } from 'sonner';

export default function TeamCompetition() {
  const { user, loading: userLoading, isAdmin } = useUserData(true);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's team
  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships', user?.email],
    queryFn: () => base44.entities.TeamMembership.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const userTeamId = memberships[0]?.team_id;

  // Fetch teams
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points')
  });

  // Fetch team challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date')
  });

  const userTeam = teams.find(t => t.id === userTeamId);

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      if (!userTeamId || !userTeam) {
        throw new Error('You must be part of a team to join challenges');
      }

      const updatedTeams = [
        ...(challenge.participating_teams || []),
        {
          team_id: userTeamId,
          team_name: userTeam.name,
          current_score: 0,
          rank: 0
        }
      ];

      return base44.entities.TeamChallenge.update(challenge.id, {
        participating_teams: updatedTeams
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast.success('Your team has joined the challenge!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to join challenge');
    }
  });

  // Calculate stats
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const userTeamWins = completedChallenges.filter(c => c.winner_team_id === userTeamId).length;
  const userTeamRank = teams.findIndex(t => t.id === userTeamId) + 1;

  if (userLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading competition data..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-amber-500/5 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
              <Swords className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-int-navy font-display">
                <span className="text-highlight">Team Competition</span>
              </h1>
              <p className="text-slate-600">Compete with your team, earn glory and rewards</p>
              {userTeam && (
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: userTeam.color || '#D97230' }}
                  />
                  <span className="font-semibold">{userTeam.name}</span>
                  {userTeamRank > 0 && (
                    <Badge variant="outline">Rank #{userTeamRank}</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white shadow-lg press-effect"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Challenges" 
          value={activeChallenges.length} 
          subtitle="Ongoing competitions"
          icon={Swords} 
          color="competitive" 
          delay={0}
        />
        <StatCard 
          title="Total Teams" 
          value={teams.length} 
          subtitle="Competing for glory"
          icon={Users} 
          color="navy" 
          delay={0.1}
        />
        <StatCard 
          title="Your Team Wins" 
          value={userTeamWins} 
          subtitle="Challenges won"
          icon={Trophy} 
          color="orange" 
          delay={0.2}
        />
        <StatCard 
          title="Completed" 
          value={completedChallenges.length} 
          subtitle="Past challenges"
          icon={Award} 
          color="purple" 
          delay={0.3}
        />
      </div>

      {/* No Team Warning */}
      {!userTeam && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">You're not part of a team yet</p>
              <p className="text-sm text-amber-600">Join a team to participate in challenges and compete for rewards!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-navy data-[state=active]:text-white">
            <Trophy className="h-4 w-4 mr-2" />
            Team Leaderboard
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-gradient-competitive data-[state=active]:text-white">
            <Swords className="h-4 w-4 mr-2" />
            Active Challenges
            {activeChallenges.length > 0 && (
              <Badge className="ml-2 bg-white/20">{activeChallenges.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white">
            <Award className="h-4 w-4 mr-2" />
            Past Challenges
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-6">
          <TeamVsTeamLeaderboard userTeamId={userTeamId} />
        </TabsContent>

        {/* Active Challenges Tab */}
        <TabsContent value="active" className="mt-6">
          {activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map((challenge, idx) => (
                <TeamChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  userTeamId={userTeamId}
                  onJoin={(c) => joinChallengeMutation.mutate(c)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Swords className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">No Active Challenges</h3>
                <p className="text-sm text-slate-500 mb-4">Check back later for new competitions</p>
                {isAdmin && (
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-orange text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Challenge
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Challenges Tab */}
        <TabsContent value="completed" className="mt-6">
          {completedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedChallenges.map((challenge) => (
                <TeamChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  userTeamId={userTeamId}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">No Completed Challenges Yet</h3>
                <p className="text-sm text-slate-500">Completed challenges will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Challenge Dialog */}
      <CreateTeamChallengeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}