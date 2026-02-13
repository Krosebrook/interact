import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function TeamAnalyticsDashboard() {
  const { user } = useAuth();

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ['team-memberships'],
    queryFn: () => base44.entities.TeamMembership.list()
  });

  const { data: allPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list()
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.list()
  });

  const isLoading = teamsLoading || membershipsLoading || pointsLoading || challengesLoading;

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  // Calculate team analytics
  const teamAnalytics = teams.map(team => {
    const teamMembers = memberships.filter(m => m.team_id === team.id);
    const memberEmails = teamMembers.map(m => m.user_email);
    const teamPoints = allPoints.filter(p => memberEmails.includes(p.user_email));
    const teamChallenges = challenges.filter(c => c.team_id === team.id);
    
    const totalPoints = teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
    const avgPoints = teamMembers.length > 0 ? totalPoints / teamMembers.length : 0;
    const activeMembers = teamPoints.filter(p => p.points_this_month > 0).length;

    return {
      id: team.id,
      name: team.name,
      members: teamMembers.length,
      totalPoints,
      avgPoints: Math.round(avgPoints),
      activeMembers,
      activeChallenges: teamChallenges.filter(c => c.status === 'active').length,
      completionRate: teamChallenges.length > 0 
        ? Math.round((teamChallenges.filter(c => c.status === 'completed').length / teamChallenges.length) * 100)
        : 0
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const totalMembers = memberships.length;
  const avgPointsPerUser = totalMembers > 0 
    ? Math.round(allPoints.reduce((sum, p) => sum + (p.total_points || 0), 0) / totalMembers)
    : 0;

  const COLORS = ['#D97230', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Team Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Comprehensive team performance insights</p>
        </div>
        <Badge className="bg-int-orange text-white">{teams.length} Teams Active</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{teams.length}</p>
            <p className="text-sm text-slate-600">Total Teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold">{totalMembers}</p>
            <p className="text-sm text-slate-600">Team Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Award className="h-8 w-8 text-int-orange mb-2" />
            <p className="text-2xl font-bold">{avgPointsPerUser}</p>
            <p className="text-sm text-slate-600">Avg Points/User</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Target className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{challenges.filter(c => c.status === 'active').length}</p>
            <p className="text-sm text-slate-600">Active Challenges</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Team Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalPoints" fill="#D97230" name="Total Points" />
                  <Bar dataKey="avgPoints" fill="#8B5CF6" name="Avg Points" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Team Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Size Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={teamAnalytics}
                      dataKey="members"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {teamAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Members by Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={teamAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activeMembers" fill="#10B981" name="Active This Month" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Team Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Team Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamAnalytics.map((team, idx) => (
                  <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge className={
                        idx === 0 ? 'bg-amber-500' : 
                        idx === 1 ? 'bg-slate-400' : 
                        idx === 2 ? 'bg-amber-700' : 
                        'bg-slate-300'
                      }>
                        #{idx + 1}
                      </Badge>
                      <div>
                        <p className="font-semibold">{team.name}</p>
                        <p className="text-sm text-slate-600">{team.members} members • {team.activeMembers} active</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-int-orange">{team.totalPoints.toLocaleString()}</p>
                      <p className="text-xs text-slate-600">{team.avgPoints} avg per member</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completionRate" fill="#8B5CF6" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}