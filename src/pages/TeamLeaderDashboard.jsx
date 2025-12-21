import React, { useState, useEffect } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { useTeamLeaderData } from '../components/hooks/useTeamLeaderData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Target, 
  BarChart3,
  CheckCircle,
  Clock,
  Plus,
  Sparkles
} from 'lucide-react';
import TeamChallengeManager from '../components/teamLeader/TeamChallengeManager';
import TeamAnalyticsDashboard from '../components/teamLeader/TeamAnalyticsDashboard';
import TeamApprovalQueue from '../components/teamLeader/TeamApprovalQueue';
import TeamLeaderAIAssistant from '../components/teamLeader/TeamLeaderAIAssistant';
import TeamCoachingModule from '../components/teamLeader/TeamCoachingModule';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TeamLeaderDashboard() {
  const { user } = useUserData(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Store team ID globally for AI functions
  useEffect(() => {
    if (myTeam?.id) {
      window.teamIdContext = myTeam.id;
    }
  }, [myTeam]);
  const { data: myTeam, isLoading: teamLoading } = useQuery({
    queryKey: ['my-led-team', user?.email],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({
        leader_email: user?.email
      });
      return teams[0] || null;
    },
    enabled: !!user?.email
  });

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', myTeam?.id],
    queryFn: async () => {
      const memberships = await base44.entities.TeamMembership.filter({
        team_id: myTeam?.id
      });
      return memberships;
    },
    enabled: !!myTeam?.id
  });

  // Fetch team challenges
  const { data: teamChallenges = [] } = useQuery({
    queryKey: ['team-challenges', myTeam?.id],
    queryFn: async () => {
      const challenges = await base44.entities.TeamChallenge.filter({});
      return challenges.filter(c => 
        c.participating_teams?.includes(myTeam?.id)
      );
    },
    enabled: !!myTeam?.id
  });

  // Fetch pending approvals
  const { data: pendingRecognitions = [] } = useQuery({
    queryKey: ['pending-recognitions', myTeam?.id],
    queryFn: async () => {
      if (!myTeam?.id || !teamMembers.length) return [];
      
      const memberEmails = teamMembers.map(m => m.user_email);
      const allRecognitions = await base44.entities.Recognition.filter({
        status: 'pending'
      });
      
      return allRecognitions.filter(r => 
        memberEmails.includes(r.sender_email) || 
        memberEmails.includes(r.recipient_email)
      );
    },
    enabled: !!myTeam?.id && teamMembers.length > 0
  });

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading your team..." />
      </div>
    );
  }

  if (!myTeam) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-int-navy mb-2">No Team Found</h2>
        <p className="text-slate-600 mb-6">
          You are not currently assigned as a team leader.
        </p>
        <p className="text-sm text-slate-500">
          Contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }



  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-int-navy">Team Leader Dashboard</h1>
            <p className="text-slate-600">{myTeam.team_name}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Team Members</p>
                <p className="text-2xl font-bold text-int-navy">{stats.memberCount}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Team Points</p>
                <p className="text-2xl font-bold text-int-orange">{stats.totalPoints}</p>
              </div>
              <Award className="h-8 w-8 text-int-orange" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Challenges</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.activeChallenges}</p>
              </div>
              <Target className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-purple-600">{stats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TeamLeaderAIAssistant team={myTeam} />
        <TeamCoachingModule team={myTeam} />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approvals
            {stats.pendingApprovals > 0 && (
              <Badge className="ml-2 bg-red-500">{stats.pendingApprovals}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TeamAnalyticsDashboard team={myTeam} members={teamMembers} />
        </TabsContent>

        <TabsContent value="challenges">
          <TeamChallengeManager team={myTeam} challenges={teamChallenges} />
        </TabsContent>

        <TabsContent value="approvals">
          <TeamApprovalQueue 
            team={myTeam} 
            pendingRecognitions={pendingRecognitions}
            teamMembers={teamMembers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}