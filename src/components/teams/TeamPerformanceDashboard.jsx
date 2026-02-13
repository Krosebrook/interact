import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Award, Target } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeamPerformanceDashboard({ teamId }) {
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => base44.entities.Team.filter({ id: teamId }).then(t => t[0]),
    enabled: !!teamId
  });

  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ['team-memberships', teamId],
    queryFn: () => base44.entities.TeamMembership.filter({ team_id: teamId }),
    enabled: !!teamId
  });

  const { data: allPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['team-points', teamId],
    queryFn: async () => {
      const members = await base44.entities.TeamMembership.filter({ team_id: teamId });
      const emails = members.map(m => m.user_email);
      const points = await base44.entities.UserPoints.list();
      return points.filter(p => emails.includes(p.user_email));
    },
    enabled: !!teamId
  });

  const isLoading = teamLoading || membershipsLoading || pointsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const totalPoints = allPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
  const avgPoints = memberships.length > 0 ? Math.round(totalPoints / memberships.length) : 0;

  const memberData = allPoints.map(p => ({
    name: p.user_email.split('@')[0],
    points: p.total_points || 0
  })).sort((a, b) => b.points - a.points).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-int-navy">{team?.name} Performance</h2>
        <p className="text-slate-600">Team analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{memberships.length}</p>
            <p className="text-sm text-slate-600">Team Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Award className="h-8 w-8 text-int-orange mb-2" />
            <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Total Points</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold">{avgPoints}</p>
            <p className="text-sm text-slate-600">Avg Points per Member</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="#D97230" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}