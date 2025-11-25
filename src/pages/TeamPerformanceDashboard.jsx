import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar, 
  Zap,
  BarChart3,
  Trophy,
  Star,
  Activity
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TeamPerformanceDashboard() {
  const { user, loading } = useUserData(true, true);
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const [timeRange, setTimeRange] = useState('6months');

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-performance'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: events = [] } = useQuery({
    queryKey: ['team-perf-events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 500)
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['team-perf-participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 1000)
  });

  const { data: userPoints = [] } = useQuery({
    queryKey: ['team-perf-points'],
    queryFn: () => base44.entities.UserPoints.list()
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships-all'],
    queryFn: () => base44.entities.TeamMembership.list()
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['team-perf-activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  // Calculate team performance metrics
  const teamMetrics = React.useMemo(() => {
    const metrics = {};
    
    teams.forEach(team => {
      const teamMembers = memberships.filter(m => m.team_id === team.id && m.status === 'active');
      const memberEmails = teamMembers.map(m => m.user_email);
      
      // Get team participations
      const teamParticipations = participations.filter(p => 
        memberEmails.includes(p.participant_email)
      );
      
      // Get team user points
      const teamUserPoints = userPoints.filter(up => 
        memberEmails.includes(up.user_email)
      );
      
      const totalPoints = teamUserPoints.reduce((sum, up) => sum + (up.lifetime_points || 0), 0);
      const avgEngagement = teamParticipations.length > 0
        ? teamParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / teamParticipations.length
        : 0;
      
      const attendedCount = teamParticipations.filter(p => p.attended).length;
      const participationRate = teamParticipations.length > 0
        ? Math.round((attendedCount / teamParticipations.length) * 100)
        : 0;

      metrics[team.id] = {
        team,
        memberCount: teamMembers.length,
        totalPoints,
        avgPointsPerMember: teamMembers.length > 0 ? Math.round(totalPoints / teamMembers.length) : 0,
        avgEngagement: Math.round(avgEngagement * 10) / 10,
        participationRate,
        eventsAttended: attendedCount,
        feedbackSubmitted: teamParticipations.filter(p => p.feedback).length,
        activitiesCompleted: teamParticipations.filter(p => p.activity_completed).length,
        badges: teamUserPoints.reduce((sum, up) => sum + (up.badges_earned?.length || 0), 0)
      };
    });
    
    return metrics;
  }, [teams, memberships, participations, userPoints]);

  // Monthly trend data
  const monthlyTrend = React.useMemo(() => {
    const months = [];
    const monthCount = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    
    for (let i = monthCount - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      let monthParticipations = participations.filter(p => {
        const event = events.find(e => e.id === p.event_id);
        if (!event?.scheduled_date) return false;
        try {
          const eventDate = parseISO(event.scheduled_date);
          return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      // Filter by team if selected
      if (selectedTeamId !== 'all') {
        const teamMembers = memberships.filter(m => m.team_id === selectedTeamId);
        const memberEmails = teamMembers.map(m => m.user_email);
        monthParticipations = monthParticipations.filter(p => 
          memberEmails.includes(p.participant_email)
        );
      }
      
      const attended = monthParticipations.filter(p => p.attended).length;
      const avgEng = monthParticipations.length > 0
        ? monthParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / monthParticipations.length
        : 0;
      
      months.push({
        month: format(monthDate, 'MMM'),
        participations: monthParticipations.length,
        attended,
        participationRate: monthParticipations.length > 0 
          ? Math.round((attended / monthParticipations.length) * 100) 
          : 0,
        avgEngagement: Math.round(avgEng * 10) / 10,
        feedback: monthParticipations.filter(p => p.feedback).length
      });
    }
    
    return months;
  }, [participations, events, memberships, selectedTeamId, timeRange]);

  // Activity type breakdown
  const activityBreakdown = React.useMemo(() => {
    const breakdown = {};
    
    let relevantParticipations = participations;
    if (selectedTeamId !== 'all') {
      const teamMembers = memberships.filter(m => m.team_id === selectedTeamId);
      const memberEmails = teamMembers.map(m => m.user_email);
      relevantParticipations = participations.filter(p => 
        memberEmails.includes(p.participant_email)
      );
    }
    
    relevantParticipations.forEach(p => {
      const event = events.find(e => e.id === p.event_id);
      const activity = activities.find(a => a.id === event?.activity_id);
      const type = activity?.type || 'other';
      
      if (!breakdown[type]) {
        breakdown[type] = { type, count: 0, avgEngagement: 0, engagementSum: 0 };
      }
      breakdown[type].count++;
      if (p.engagement_score) {
        breakdown[type].engagementSum += p.engagement_score;
      }
    });
    
    return Object.values(breakdown).map(b => ({
      ...b,
      avgEngagement: b.count > 0 ? Math.round((b.engagementSum / b.count) * 10) / 10 : 0
    })).sort((a, b) => b.count - a.count);
  }, [participations, events, activities, memberships, selectedTeamId]);

  // Radar chart data for team comparison
  const radarData = React.useMemo(() => {
    const topTeams = Object.values(teamMetrics)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5);
    
    const metrics = ['Participation', 'Engagement', 'Points', 'Badges', 'Feedback'];
    
    return metrics.map(metric => {
      const dataPoint = { metric };
      topTeams.forEach(t => {
        let value = 0;
        switch (metric) {
          case 'Participation':
            value = t.participationRate;
            break;
          case 'Engagement':
            value = t.avgEngagement * 20; // Scale to 0-100
            break;
          case 'Points':
            value = Math.min(100, t.avgPointsPerMember / 10);
            break;
          case 'Badges':
            value = Math.min(100, t.badges * 10);
            break;
          case 'Feedback':
            value = Math.min(100, t.feedbackSubmitted * 5);
            break;
        }
        dataPoint[t.team.team_name] = value;
      });
      return dataPoint;
    });
  }, [teamMetrics]);

  const selectedMetrics = selectedTeamId === 'all' 
    ? null 
    : teamMetrics[selectedTeamId];

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-int-orange" />
            Team Performance Dashboard
          </h1>
          <p className="text-slate-600">Track team engagement, participation, and growth over time</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.team_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {selectedMetrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Users className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80">Members</p>
            <p className="text-2xl font-bold">{selectedMetrics.memberCount}</p>
          </Card>
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <Target className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80">Participation</p>
            <p className="text-2xl font-bold">{selectedMetrics.participationRate}%</p>
          </Card>
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <Activity className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80">Avg Engagement</p>
            <p className="text-2xl font-bold">{selectedMetrics.avgEngagement}/5</p>
          </Card>
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <Zap className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80">Total Points</p>
            <p className="text-2xl font-bold">{selectedMetrics.totalPoints}</p>
          </Card>
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <Award className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80">Badges Earned</p>
            <p className="text-2xl font-bold">{selectedMetrics.badges}</p>
          </Card>
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <Calendar className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80">Events Attended</p>
            <p className="text-2xl font-bold">{selectedMetrics.eventsAttended}</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-500">Total Teams</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-500">Avg Participation</p>
                <p className="text-2xl font-bold">
                  {Object.values(teamMetrics).length > 0
                    ? Math.round(Object.values(teamMetrics).reduce((s, m) => s + m.participationRate, 0) / Object.values(teamMetrics).length)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-slate-500">Total Points</p>
                <p className="text-2xl font-bold">
                  {Object.values(teamMetrics).reduce((s, m) => s + m.totalPoints, 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-slate-500">Total Badges</p>
                <p className="text-2xl font-bold">
                  {Object.values(teamMetrics).reduce((s, m) => s + m.badges, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {/* Participation Over Time */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Participation & Engagement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorParticipation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="participationRate" 
                    stroke="#6366f1" 
                    fill="url(#colorParticipation)"
                    name="Participation Rate %"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgEngagement" 
                    stroke="#10b981" 
                    fill="url(#colorEngagement)"
                    name="Avg Engagement"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Feedback Trend */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Feedback Submissions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="feedback" fill="#f97316" name="Feedback Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Activity Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="type" type="category" stroke="#64748b" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" name="Participations" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityBreakdown.slice(0, 6).map(activity => (
              <Card key={activity.type} className="p-4 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="capitalize">{activity.type}</Badge>
                  <span className="text-2xl font-bold">{activity.count}</span>
                </div>
                <p className="text-sm text-slate-500">participations</p>
                <div className="mt-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Avg engagement: {activity.avgEngagement}/5</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top 5 Teams Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" stroke="#64748b" />
                  <PolarRadiusAxis stroke="#64748b" />
                  {Object.values(teamMetrics)
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .slice(0, 5)
                    .map((t, i) => (
                      <Radar
                        key={t.team.id}
                        name={t.team.team_name}
                        dataKey={t.team.team_name}
                        stroke={['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6'][i]}
                        fill={['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6'][i]}
                        fillOpacity={0.2}
                      />
                    ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Team Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.values(teamMetrics)
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map((m, i) => (
                    <div
                      key={m.team.id}
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        i < 3 ? 'bg-gradient-to-r from-slate-50 to-white' : 'bg-white'
                      } border`}
                    >
                      <div className="w-10 text-center">
                        {i === 0 ? (
                          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center mx-auto">
                            <Trophy className="h-4 w-4 text-white" />
                          </div>
                        ) : i === 1 ? (
                          <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center mx-auto">
                            <span className="text-white font-bold">2</span>
                          </div>
                        ) : i === 2 ? (
                          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center mx-auto">
                            <span className="text-white font-bold">3</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-slate-400">#{i + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{m.team.team_name}</h4>
                        <p className="text-sm text-slate-500">{m.memberCount} members</p>
                      </div>
                      
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-slate-500">Participation</p>
                          <p className="font-bold">{m.participationRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500">Engagement</p>
                          <p className="font-bold">{m.avgEngagement}/5</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500">Badges</p>
                          <p className="font-bold">{m.badges}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-int-orange">{m.totalPoints}</p>
                        <p className="text-xs text-slate-500">points</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}