import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award, Target } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function TeamAnalytics() {
  const { user } = useAuth();

  // Fetch team data
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  // Fetch team memberships
  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ['team-memberships'],
    queryFn: () => base44.entities.TeamMembership.list()
  });

  // Fetch user points
  const { data: allPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list()
  });

  const isLoading = teamsLoading || membershipsLoading || pointsLoading;

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  // Calculate team analytics
  const teamAnalytics = teams.map(team => {
    const teamMembers = memberships.filter(m => m.team_id === team.id);
    const memberEmails = teamMembers.map(m => m.user_email);
    const teamPoints = allPoints.filter(p => memberEmails.includes(p.user_email));
    
    const totalPoints = teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
    const avgPoints = teamMembers.length > 0 ? totalPoints / teamMembers.length : 0;

    return {
      name: team.name,
      members: teamMembers.length,
      totalPoints,
      avgPoints: Math.round(avgPoints)
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-int-navy">Team Analytics</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-2xl font-bold">{memberships.length}</p>
            <p className="text-sm text-slate-600">Total Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Award className="h-8 w-8 text-int-orange mb-2" />
            <p className="text-2xl font-bold">
              {Math.round(allPoints.reduce((sum, p) => sum + (p.total_points || 0), 0) / (allPoints.length || 1))}
            </p>
            <p className="text-sm text-slate-600">Avg Points per User</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Chart */}
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

      {/* Team List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamAnalytics.map((team, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge className={idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-slate-300'}>
                    #{idx + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-sm text-slate-600">{team.members} members</p>
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
    </div>
  );
}