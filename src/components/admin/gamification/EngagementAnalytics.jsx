import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Award, Zap, Target, Trophy } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../common/LoadingSpinner';

export default function EngagementAnalytics() {
  // Fetch all necessary data
  const { data: userPoints, isLoading: loadingPoints } = useQuery({
    queryKey: ['analytics-user-points'],
    queryFn: () => base44.entities.UserPoints.list()
  });

  const { data: participations, isLoading: loadingParticipations } = useQuery({
    queryKey: ['analytics-participations'],
    queryFn: () => base44.entities.Participation.list()
  });

  const { data: badgeAwards, isLoading: loadingBadges } = useQuery({
    queryKey: ['analytics-badges'],
    queryFn: () => base44.entities.BadgeAward.list()
  });

  const { data: recognitions, isLoading: loadingRecognitions } = useQuery({
    queryKey: ['analytics-recognitions'],
    queryFn: () => base44.entities.Recognition.filter({ status: 'approved' })
  });

  const { data: challenges, isLoading: loadingChallenges } = useQuery({
    queryKey: ['analytics-challenges'],
    queryFn: () => base44.entities.PersonalChallenge.list()
  });

  // Calculate metrics - must be called before any early returns
  const metrics = useMemo(() => {
    const totalUsers = userPoints?.length || 0;
    const totalPoints = userPoints?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;
    const avgPoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
    
    const activeUsers = userPoints?.filter(p => (p.total_points || 0) > 0).length || 0;
    const engagementRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;

    const totalBadges = badgeAwards?.length || 0;
    const avgBadges = totalUsers > 0 ? (totalBadges / totalUsers).toFixed(1) : 0;

    const completedChallenges = challenges?.filter(c => c.status === 'completed').length || 0;
    const activeChallenges = challenges?.filter(c => c.status === 'in_progress').length || 0;

    // Tier distribution
    const tierCounts = {
      bronze: userPoints?.filter(p => p.tier === 'bronze').length || 0,
      silver: userPoints?.filter(p => p.tier === 'silver').length || 0,
      gold: userPoints?.filter(p => p.tier === 'gold').length || 0,
      platinum: userPoints?.filter(p => p.tier === 'platinum').length || 0
    };

    // Top performers
    const topPerformers = [...(userPoints || [])]
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 10);

    // Points over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const pointsTimeline = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        points: 0,
        badges: 0
      };
    });

    badgeAwards?.forEach(award => {
      const awardDate = new Date(award.awarded_date || award.created_date);
      if (awardDate > thirtyDaysAgo) {
        const dayIndex = Math.floor((new Date() - awardDate) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 30) {
          pointsTimeline[29 - dayIndex].badges++;
        }
      }
    });

    return {
      totalUsers,
      totalPoints,
      avgPoints,
      activeUsers,
      engagementRate,
      totalBadges,
      avgBadges,
      completedChallenges,
      activeChallenges,
      tierCounts,
      topPerformers,
      pointsTimeline
    };
  }, [userPoints, badgeAwards, challenges]);

  // Check loading state after all hooks are called
  if (loadingPoints || loadingParticipations || loadingBadges || loadingRecognitions || loadingChallenges) {
    return <LoadingSpinner />;
  }

  const COLORS = ['#f59e0b', '#94a3b8', '#eab308', '#a855f7'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-600 opacity-20" />
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                {metrics.engagementRate}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-int-navy">{metrics.activeUsers}</p>
            <p className="text-xs text-slate-600">Active Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-amber-600 opacity-20" />
            </div>
            <p className="text-2xl font-bold text-int-navy">{metrics.totalPoints.toLocaleString()}</p>
            <p className="text-xs text-slate-600">Total Points</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
            <p className="text-2xl font-bold text-int-navy">{metrics.totalBadges}</p>
            <p className="text-xs text-slate-600">Badges Awarded</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-emerald-600 opacity-20" />
            </div>
            <p className="text-2xl font-bold text-int-navy">{metrics.completedChallenges}</p>
            <p className="text-xs text-slate-600">Challenges Done</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
            <CardDescription>Current user tier breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Bronze', value: metrics.tierCounts.bronze },
                    { name: 'Silver', value: metrics.tierCounts.silver },
                    { name: 'Gold', value: metrics.tierCounts.gold },
                    { name: 'Platinum', value: metrics.tierCounts.platinum }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Badge Awards Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Badges Awarded (30 Days)</CardTitle>
            <CardDescription>Daily badge distribution trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.pointsTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="badges" stroke="#a855f7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            Top Performers
          </CardTitle>
          <CardDescription>Users with the most points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.topPerformers.map((performer, idx) => (
              <div key={performer.user_email} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                    idx === 1 ? 'bg-slate-100 text-slate-800' :
                    idx === 2 ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{performer.user_email}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Badge className="capitalize bg-slate-100 text-slate-700">
                        {performer.tier}
                      </Badge>
                      {performer.current_streak > 0 && (
                        <span>🔥 {performer.current_streak} day streak</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-int-orange">
                    {performer.total_points?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-600">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}