import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Calendar, 
  Award,
  Target,
  Zap
} from 'lucide-react';
import { format, subDays, subMonths, parseISO } from 'date-fns';

const COLORS = ['#0A1C39', '#F47C20', '#4A6070', '#7A94A6', '#C46322', '#F5C16A'];

export default function TeamAnalytics({ teamId }) {
  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({ id: teamId });
      return teams[0];
    },
    enabled: !!teamId
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships', teamId],
    queryFn: () => base44.entities.TeamMembership.filter({ team_id: teamId, status: 'active' }),
    enabled: !!teamId
  });

  const { data: memberPoints = [] } = useQuery({
    queryKey: ['team-member-points', teamId],
    queryFn: () => base44.entities.UserPoints.filter({ team_id: teamId }),
    enabled: !!teamId
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['team-participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500)
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 100)
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['team-challenges', teamId],
    queryFn: () => base44.entities.TeamChallenge.filter({ participating_teams: teamId }),
    enabled: !!teamId
  });

  // Calculate team stats
  const stats = useMemo(() => {
    const memberEmails = memberships.map(m => m.user_email);
    const teamParticipations = participations.filter(p => 
      memberEmails.includes(p.participant_email)
    );

    const totalPoints = memberPoints.reduce((sum, mp) => sum + (mp.total_points || 0), 0);
    const avgPoints = memberPoints.length > 0 ? Math.round(totalPoints / memberPoints.length) : 0;
    const totalEvents = new Set(teamParticipations.map(p => p.event_id)).size;
    const avgEngagement = teamParticipations.length > 0
      ? Math.round(teamParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / teamParticipations.length * 10) / 10
      : 0;
    
    const activeChallenges = challenges.filter(c => c.status === 'active').length;
    const completedChallenges = challenges.filter(c => 
      c.completed_teams?.includes(teamId)
    ).length;

    return {
      totalPoints,
      avgPoints,
      totalEvents,
      avgEngagement,
      activeChallenges,
      completedChallenges,
      memberCount: memberships.length
    };
  }, [memberships, memberPoints, participations, challenges, teamId]);

  // Member contribution data
  const memberContributions = useMemo(() => {
    return memberPoints
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 10)
      .map(mp => ({
        name: mp.user_email.split('@')[0],
        points: mp.total_points || 0,
        events: mp.events_attended || 0,
        badges: mp.badges_earned?.length || 0
      }));
  }, [memberPoints]);

  // Points over time (last 30 days)
  const pointsOverTime = useMemo(() => {
    const memberEmails = memberships.map(m => m.user_email);
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return { date: format(date, 'MMM dd'), points: 0 };
    });

    participations
      .filter(p => {
        if (!memberEmails.includes(p.participant_email)) return false;
        const pDate = new Date(p.created_date);
        return pDate >= subDays(new Date(), 30);
      })
      .forEach(p => {
        const dateStr = format(new Date(p.created_date), 'MMM dd');
        const dayData = last30Days.find(d => d.date === dateStr);
        if (dayData && p.points_awarded) {
          dayData.points += 10; // Approximate points per participation
        }
      });

    return last30Days;
  }, [participations, memberships]);

  // Activity type distribution
  const activityDistribution = useMemo(() => {
    const memberEmails = memberships.map(m => m.user_email);
    const typeCount = {};
    
    participations
      .filter(p => memberEmails.includes(p.participant_email))
      .forEach(p => {
        const event = events.find(e => e.id === p.event_id);
        if (event) {
          // Get activity type from event (simplified)
          const type = 'Event';
          typeCount[type] = (typeCount[type] || 0) + 1;
        }
      });

    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [participations, events, memberships]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    const roles = memberships.reduce((acc, m) => {
      const role = m.role || 'member';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(roles).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
      value 
    }));
  }, [memberships]);

  if (!team) return null;

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="teams" data-component="teamanalytics">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-int-orange">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-int-orange" />
              <div>
                <p className="text-2xl font-bold text-int-navy">{stats.totalPoints}</p>
                <p className="text-sm text-slate-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-int-navy" />
              <div>
                <p className="text-2xl font-bold text-int-navy">{stats.memberCount}</p>
                <p className="text-sm text-slate-600">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-[#4A6070]" />
              <div>
                <p className="text-2xl font-bold text-int-navy">{stats.totalEvents}</p>
                <p className="text-sm text-slate-600">Events Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-[#C46322]" />
              <div>
                <p className="text-2xl font-bold text-int-navy">{stats.completedChallenges}</p>
                <p className="text-sm text-slate-600">Challenges Won</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Contributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-int-orange" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberContributions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0A1C39',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="points" fill="#F47C20" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Points Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-int-navy" />
              Points Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pointsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0A1C39',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#F47C20" 
                  strokeWidth={2}
                  dot={{ fill: '#F47C20', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-int-navy" />
              Team Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-int-orange" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Avg Points/Member</span>
              <span className="font-bold text-int-navy">{stats.avgPoints}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Avg Engagement Score</span>
              <span className="font-bold text-int-navy">{stats.avgEngagement}/5</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Active Challenges</span>
              <span className="font-bold text-int-orange">{stats.activeChallenges}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-int-orange">
              <span className="text-slate-600">Team Rank</span>
              <Badge className="bg-int-orange text-white">#{team.rank || '—'}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}