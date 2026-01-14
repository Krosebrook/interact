/**
 * Team Analytics Dashboard
 * Engagement metrics, contribution breakdown, inter-team comparisons
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Zap, Heart, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TeamAnalyticsDashboard() {
  const { user } = useUserData(true);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [period, setPeriod] = useState('current-month');

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams-list'],
    queryFn: () => base44.entities.Team.list(),
    staleTime: 10 * 60 * 1000
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['team-analytics', selectedTeam, period],
    queryFn: () => fetchTeamAnalytics(selectedTeam, period),
    enabled: !!selectedTeam,
    staleTime: 5 * 60 * 1000
  });

  if (teamsLoading) return <LoadingSpinner />;

  const currentTeam = selectedTeam || teams?.[0]?.id;
  if (!currentTeam) return <div>No teams found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Team Analytics</h1>
        <p className="text-slate-600 mt-1">Deep dive into team engagement and contribution patterns</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={currentTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teams?.map(team => (
              <SelectItem key={team.id} value={team.id}>
                {team.team_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="current-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {analyticsLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              icon={Users}
              title="Active Members"
              value={analytics?.active_members}
              total={analytics?.total_members}
            />
            <KPICard
              icon={Zap}
              title="Total Points"
              value={analytics?.total_points?.toLocaleString()}
              subtitle={`Avg ${analytics?.avg_points_per_member}/member`}
            />
            <KPICard
              icon={Heart}
              title="Recognitions"
              value={analytics?.total_recognitions}
              subtitle={`Given & received`}
            />
            <KPICard
              icon={TrendingUp}
              title="Engagement Score"
              value={`${analytics?.avg_engagement_score}%`}
              trend={analytics?.engagement_trend}
            />
          </div>

          {/* Charts */}
          <Tabs defaultValue="contribution" className="space-y-4">
            <TabsList>
              <TabsTrigger value="contribution">Member Contribution</TabsTrigger>
              <TabsTrigger value="breakdown">Activity Breakdown</TabsTrigger>
              <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
            </TabsList>

            {/* Contribution Breakdown */}
            <TabsContent value="contribution">
              <Card>
                <CardHeader>
                  <CardTitle>Points by Team Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics?.member_contribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="user_email"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="points_earned" fill="#D97230" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Breakdown */}
            <TabsContent value="breakdown">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Events', value: analytics?.total_events_attended || 0 },
                            { name: 'Challenges', value: analytics?.total_challenges_completed || 0 },
                            { name: 'Recognitions', value: analytics?.total_recognitions || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                        >
                          <Cell fill="#D97230" />
                          <Cell fill="#2DD4BF" />
                          <Cell fill="#F5C16A" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.member_contribution
                        ?.sort((a, b) => b.points_earned - a.points_earned)
                        ?.slice(0, 5)
                        ?.map((member, idx) => (
                          <div key={member.user_email} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-slate-400">#{idx + 1}</span>
                              <div>
                                <p className="font-medium text-slate-900">{member.user_email.split('@')[0]}</p>
                                <p className="text-xs text-slate-600">
                                  {member.recognitions_given} given • {member.recognitions_received} received
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-int-orange">{member.points_earned}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Team Comparison */}
            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Team vs Organization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={[
                        {
                          metric: 'Points/Member',
                          'Your Team': analytics?.avg_points_per_member,
                          'Org Average': analytics?.org_avg_points_per_member
                        },
                        {
                          metric: 'Engagement',
                          'Your Team': analytics?.avg_engagement_score,
                          'Org Average': analytics?.org_avg_engagement_score
                        },
                        {
                          metric: 'Active Rate',
                          'Your Team': (analytics?.active_members / analytics?.total_members) * 100,
                          'Org Average': analytics?.org_avg_active_rate
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Your Team" fill="#D97230" />
                      <Bar dataKey="Org Average" fill="#2DD4BF" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function KPICard({ icon: Icon, title, value, subtitle, total, trend }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
            {total && <p className="text-xs text-slate-600 mt-1">of {total} total</p>}
            {trend && <p className="text-xs text-green-600 mt-1">↗ {trend}</p>}
          </div>
          <Icon className="h-8 w-8 text-int-orange opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

async function fetchTeamAnalytics(teamId, period) {
  try {
    const response = await base44.functions.invoke('getTeamAnalytics', {
      team_id: teamId,
      period
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team analytics:', error);
    return {};
  }
}