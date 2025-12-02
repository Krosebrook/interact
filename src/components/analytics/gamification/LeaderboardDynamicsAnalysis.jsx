import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Crown, AlertTriangle, Activity, UserMinus, UserPlus } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

export default function LeaderboardDynamicsAnalysis({ 
  userPoints = [], 
  leaderboardSnapshots = [] 
}) {
  const analysis = useMemo(() => {
    // Current rankings
    const sortedUsers = [...userPoints]
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .map((user, idx) => ({ ...user, currentRank: idx + 1 }));

    // Tier distribution
    const tierDistribution = {
      top10: sortedUsers.slice(0, Math.ceil(sortedUsers.length * 0.1)).length,
      top25: sortedUsers.slice(0, Math.ceil(sortedUsers.length * 0.25)).length,
      middle50: sortedUsers.slice(Math.ceil(sortedUsers.length * 0.25), Math.ceil(sortedUsers.length * 0.75)).length,
      bottom25: sortedUsers.slice(Math.ceil(sortedUsers.length * 0.75)).length
    };

    // Activity analysis
    const now = new Date();
    const activeUsers = sortedUsers.filter(u => {
      if (!u.last_activity_date) return false;
      return differenceInDays(now, new Date(u.last_activity_date)) <= 7;
    });

    const dormantUsers = sortedUsers.filter(u => {
      if (!u.last_activity_date) return true;
      return differenceInDays(now, new Date(u.last_activity_date)) > 30;
    });

    const atRiskUsers = sortedUsers.filter(u => {
      if (!u.last_activity_date) return false;
      const daysSince = differenceInDays(now, new Date(u.last_activity_date));
      return daysSince > 7 && daysSince <= 30;
    });

    // Rank changes (simulated from points history)
    const rankChanges = sortedUsers.map(user => {
      const weeklyChange = user.weekly_points || 0;
      const monthlyChange = user.monthly_points || 0;
      return {
        user_email: user.user_email,
        user_name: user.user_name || user.user_email?.split('@')[0],
        currentRank: user.currentRank,
        points: user.total_points || 0,
        weeklyPoints: weeklyChange,
        monthlyPoints: monthlyChange,
        velocity: weeklyChange > 0 ? 'rising' : weeklyChange < 0 ? 'falling' : 'stable',
        streak: user.streak_days || 0
      };
    });

    // Top movers
    const topRisers = [...rankChanges].sort((a, b) => b.weeklyPoints - a.weeklyPoints).slice(0, 5);
    const biggestFallers = [...rankChanges].filter(u => u.weeklyPoints === 0 && u.points > 0).slice(0, 5);

    // Points distribution
    const pointsRanges = [
      { range: '0-100', min: 0, max: 100, count: 0 },
      { range: '101-500', min: 101, max: 500, count: 0 },
      { range: '501-1000', min: 501, max: 1000, count: 0 },
      { range: '1001-2500', min: 1001, max: 2500, count: 0 },
      { range: '2500+', min: 2501, max: Infinity, count: 0 }
    ];

    sortedUsers.forEach(u => {
      const points = u.total_points || 0;
      const range = pointsRanges.find(r => points >= r.min && points <= r.max);
      if (range) range.count++;
    });

    // Engagement segments
    const segments = {
      champions: sortedUsers.filter(u => (u.engagement_score || 0) >= 80).length,
      engaged: sortedUsers.filter(u => (u.engagement_score || 0) >= 50 && (u.engagement_score || 0) < 80).length,
      casual: sortedUsers.filter(u => (u.engagement_score || 0) >= 20 && (u.engagement_score || 0) < 50).length,
      inactive: sortedUsers.filter(u => (u.engagement_score || 0) < 20).length
    };

    return {
      totalUsers: sortedUsers.length,
      activeUsers: activeUsers.length,
      dormantUsers: dormantUsers.length,
      atRiskUsers: atRiskUsers.length,
      tierDistribution,
      topRisers,
      biggestFallers,
      pointsRanges,
      segments,
      avgPoints: sortedUsers.length > 0 
        ? Math.round(sortedUsers.reduce((sum, u) => sum + (u.total_points || 0), 0) / sortedUsers.length)
        : 0,
      medianPoints: sortedUsers.length > 0
        ? sortedUsers[Math.floor(sortedUsers.length / 2)]?.total_points || 0
        : 0,
      topUserPoints: sortedUsers[0]?.total_points || 0
    };
  }, [userPoints]);

  const segmentData = [
    { name: 'Champions', value: analysis.segments.champions, color: '#D97230' },
    { name: 'Engaged', value: analysis.segments.engaged, color: '#10B981' },
    { name: 'Casual', value: analysis.segments.casual, color: '#F59E0B' },
    { name: 'Inactive', value: analysis.segments.inactive, color: '#EF4444' }
  ];

  const healthScore = useMemo(() => {
    const activeRatio = analysis.totalUsers > 0 ? analysis.activeUsers / analysis.totalUsers : 0;
    const churnRisk = analysis.totalUsers > 0 ? analysis.atRiskUsers / analysis.totalUsers : 0;
    const engagementRatio = analysis.totalUsers > 0 
      ? (analysis.segments.champions + analysis.segments.engaged) / analysis.totalUsers 
      : 0;
    
    return Math.round((activeRatio * 40 + (1 - churnRisk) * 30 + engagementRatio * 30) * 100);
  }, [analysis]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-int-orange" />
            Leaderboard Dynamics
          </div>
          <Badge className={`${healthScore >= 70 ? 'bg-emerald-100 text-emerald-700' : healthScore >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            Health Score: {healthScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3">
            <Users className="h-4 w-4 text-blue-600 mb-1" />
            <p className="text-2xl font-bold text-blue-600">{analysis.totalUsers}</p>
            <p className="text-xs text-slate-500">Total Users</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3">
            <UserPlus className="h-4 w-4 text-emerald-600 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">{analysis.activeUsers}</p>
            <p className="text-xs text-slate-500">Active (7d)</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-600">{analysis.atRiskUsers}</p>
            <p className="text-xs text-slate-500">At Risk</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-3">
            <UserMinus className="h-4 w-4 text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-500">{analysis.dormantUsers}</p>
            <p className="text-xs text-slate-500">Dormant (30d+)</p>
          </div>
          <div className="bg-gradient-to-br from-int-orange/10 to-amber-50 rounded-lg p-3">
            <Activity className="h-4 w-4 text-int-orange mb-1" />
            <p className="text-2xl font-bold text-int-orange">{analysis.avgPoints}</p>
            <p className="text-xs text-slate-500">Avg Points</p>
          </div>
        </div>

        <Tabs defaultValue="progression" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="progression">User Progression</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="movers">Top Movers</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="progression">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-1">Top User</p>
                  <p className="text-2xl font-bold text-int-navy">{analysis.topUserPoints.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">points</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-1">Median</p>
                  <p className="text-2xl font-bold text-slate-700">{analysis.medianPoints.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">points</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-1">Gap</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(analysis.topUserPoints - analysis.medianPoints).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">top vs median</p>
                </div>
              </div>
              
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.pointsRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Users" fill="#D97230" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="segments">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                {segmentData.map(seg => (
                  <div key={seg.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="flex-1 font-medium">{seg.name}</span>
                    <span className="text-lg font-bold" style={{ color: seg.color }}>{seg.value}</span>
                    <span className="text-sm text-slate-500">
                      ({analysis.totalUsers > 0 ? ((seg.value / analysis.totalUsers) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-3">Segment Definitions</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><strong className="text-int-orange">Champions:</strong> 80%+ engagement score</li>
                  <li><strong className="text-emerald-600">Engaged:</strong> 50-79% engagement score</li>
                  <li><strong className="text-amber-600">Casual:</strong> 20-49% engagement score</li>
                  <li><strong className="text-red-500">Inactive:</strong> Below 20% engagement</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="movers">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Top Risers (This Week)
                </h4>
                <div className="space-y-2">
                  {analysis.topRisers.map((user, idx) => (
                    <div key={user.user_email} className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg">
                      <span className="w-6 text-center font-bold text-emerald-600">#{idx + 1}</span>
                      <span className="flex-1 font-medium">{user.user_name}</span>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        +{user.weeklyPoints} pts
                      </Badge>
                    </div>
                  ))}
                  {analysis.topRisers.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No activity this week</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Needs Re-engagement
                </h4>
                <div className="space-y-2">
                  {analysis.biggestFallers.map((user, idx) => (
                    <div key={user.user_email} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                      <span className="w-6 text-center font-bold text-red-500">#{user.currentRank}</span>
                      <span className="flex-1 font-medium">{user.user_name}</span>
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {user.points} pts (inactive)
                      </Badge>
                    </div>
                  ))}
                  {analysis.biggestFallers.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">All users are active!</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-yellow-50 rounded-lg text-center border-2 border-yellow-200">
                  <Crown className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                  <p className="text-lg font-bold">{analysis.tierDistribution.top10}</p>
                  <p className="text-xs text-slate-500">Top 10%</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-center">
                  <p className="text-lg font-bold">{analysis.tierDistribution.top25}</p>
                  <p className="text-xs text-slate-500">Top 25%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-lg font-bold">{analysis.tierDistribution.middle50}</p>
                  <p className="text-xs text-slate-500">Middle 50%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-lg font-bold">{analysis.tierDistribution.bottom25}</p>
                  <p className="text-xs text-slate-500">Bottom 25%</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800">💡 Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {analysis.atRiskUsers > analysis.totalUsers * 0.2 && (
                    <li>• High at-risk users ({analysis.atRiskUsers}) - consider re-engagement campaigns</li>
                  )}
                  {analysis.segments.inactive > analysis.segments.champions && (
                    <li>• More inactive than champions - review challenge difficulty</li>
                  )}
                  {analysis.topUserPoints > analysis.avgPoints * 10 && (
                    <li>• Large gap between top and average - add catch-up mechanics</li>
                  )}
                  {analysis.activeUsers < analysis.totalUsers * 0.3 && (
                    <li>• Low active user rate - boost notifications and incentives</li>
                  )}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}