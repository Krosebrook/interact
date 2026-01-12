import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Zap,
  Award,
  Target,
  Trophy,
  Flame,
  Gift,
  Star,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  Calendar
} from 'lucide-react';
import { format, subDays, subMonths, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const CHART_COLORS = ['#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];

const RARITY_COLORS = {
  common: '#64748B',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B'
};

export default function GamificationAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.list()
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ['reward-redemptions'],
    queryFn: () => base44.entities.RewardRedemption.list('-created_date', 200)
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points')
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date')
  });

  // Calculate overview metrics
  const overviewMetrics = useMemo(() => {
    const totalPoints = userPoints.reduce((sum, up) => sum + (up.total_points || 0), 0);
    const totalBadges = userPoints.reduce((sum, up) => sum + (up.badges_earned?.length || 0), 0);
    const avgLevel = userPoints.length > 0 
      ? (userPoints.reduce((sum, up) => sum + (up.level || 1), 0) / userPoints.length).toFixed(1)
      : 0;
    const activeStreaks = userPoints.filter(up => up.streak_days > 0).length;
    const avgStreak = userPoints.length > 0
      ? (userPoints.reduce((sum, up) => sum + (up.streak_days || 0), 0) / userPoints.length).toFixed(1)
      : 0;
    const maxLevel = Math.max(...userPoints.map(up => up.level || 1), 0);

    // Calculate period comparisons (mock for now)
    const pointsChange = Math.floor(Math.random() * 30) - 10;
    const badgesChange = Math.floor(Math.random() * 10);
    const engagementChange = Math.floor(Math.random() * 20) - 5;

    return {
      totalPoints,
      totalBadges,
      avgLevel,
      maxLevel,
      activeStreaks,
      avgStreak,
      totalUsers: userPoints.length,
      pointsChange,
      badgesChange,
      engagementChange
    };
  }, [userPoints]);

  // Points distribution by level
  const levelDistribution = useMemo(() => {
    const dist = {};
    userPoints.forEach(up => {
      const level = up.level || 1;
      dist[level] = (dist[level] || 0) + 1;
    });
    return Object.entries(dist)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, count]) => ({ level: `Level ${level}`, count, fill: CHART_COLORS[Number(level) % CHART_COLORS.length] }));
  }, [userPoints]);

  // Badge rarity distribution
  const badgeRarityData = useMemo(() => {
    const dist = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    
    userPoints.forEach(up => {
      up.badges_earned?.forEach(badgeId => {
        const badge = badges.find(b => b.id === badgeId);
        if (badge) {
          dist[badge.rarity || 'common']++;
        }
      });
    });

    return Object.entries(dist)
      .filter(([_, count]) => count > 0)
      .map(([rarity, count]) => ({
        name: rarity.charAt(0).toUpperCase() + rarity.slice(1),
        value: count,
        fill: RARITY_COLORS[rarity]
      }));
  }, [userPoints, badges]);

  // Engagement metrics over time
  const engagementTrend = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      week: format(subDays(new Date(), (11 - i) * 7), 'MMM d'),
      points: Math.floor(Math.random() * 2000) + 500,
      badges: Math.floor(Math.random() * 20) + 5,
      activeUsers: Math.floor(Math.random() * 30) + 10
    }));
  }, []);

  // Streak distribution
  const streakDistribution = useMemo(() => {
    const dist = { '0': 0, '1-3': 0, '4-7': 0, '8-14': 0, '15-30': 0, '30+': 0 };
    
    userPoints.forEach(up => {
      const streak = up.streak_days || 0;
      if (streak === 0) dist['0']++;
      else if (streak <= 3) dist['1-3']++;
      else if (streak <= 7) dist['4-7']++;
      else if (streak <= 14) dist['8-14']++;
      else if (streak <= 30) dist['15-30']++;
      else dist['30+']++;
    });

    return Object.entries(dist).map(([range, count]) => ({
      range: `${range} days`,
      count
    }));
  }, [userPoints]);

  // Team performance
  const teamPerformance = useMemo(() => {
    return teams.slice(0, 8).map(team => ({
      name: team.name?.substring(0, 10) || 'Team',
      points: team.total_points || 0,
      challenges: challenges.filter(c => 
        c.participating_teams?.some(t => t.team_id === team.id)
      ).length
    }));
  }, [teams, challenges]);

  // Top badge earners
  const topBadgeEarners = useMemo(() => {
    return [...userPoints]
      .sort((a, b) => (b.badges_earned?.length || 0) - (a.badges_earned?.length || 0))
      .slice(0, 5)
      .map(up => ({
        email: up.user_email?.split('@')[0] || 'User',
        badges: up.badges_earned?.length || 0,
        points: up.total_points || 0
      }));
  }, [userPoints]);

  // Reward redemption stats
  const redemptionStats = useMemo(() => {
    const byCategory = {};
    redemptions.forEach(r => {
      const reward = rewards.find(rw => rw.id === r.reward_id);
      const category = reward?.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return Object.entries(byCategory).map(([category, count]) => ({
      name: category.replace('_', ' '),
      value: count
    }));
  }, [redemptions, rewards]);

  const TrendIndicator = ({ value, suffix = '' }) => {
    if (value > 0) {
      return (
        <span data-b44-sync="true" data-feature="gamification" data-component="gamificationanalyticsdashboard" className="flex items-center text-emerald-600 text-sm font-medium">
          <ArrowUp className="h-3 w-3 mr-1" />+{value}{suffix}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-500 text-sm font-medium">
          <ArrowDown className="h-3 w-3 mr-1" />{value}{suffix}
        </span>
      );
    }
    return (
      <span className="flex items-center text-slate-500 text-sm font-medium">
        <Minus className="h-3 w-3 mr-1" />0{suffix}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-int-orange/10 to-amber-50 border-int-orange/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Points</p>
                <p className="text-3xl font-bold text-int-orange">{overviewMetrics.totalPoints.toLocaleString()}</p>
                <TrendIndicator value={overviewMetrics.pointsChange} suffix="%" />
              </div>
              <div className="p-3 rounded-xl bg-gradient-orange shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Badges Earned</p>
                <p className="text-3xl font-bold text-purple-600">{overviewMetrics.totalBadges}</p>
                <TrendIndicator value={overviewMetrics.badgesChange} />
              </div>
              <div className="p-3 rounded-xl bg-gradient-purple shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Streaks</p>
                <p className="text-3xl font-bold text-emerald-600">{overviewMetrics.activeStreaks}</p>
                <span className="text-sm text-slate-500">Avg: {overviewMetrics.avgStreak} days</span>
              </div>
              <div className="p-3 rounded-xl bg-gradient-wellness shadow-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-int-navy/10 to-blue-50 border-int-navy/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg User Level</p>
                <p className="text-3xl font-bold text-int-navy">{overviewMetrics.avgLevel}</p>
                <span className="text-sm text-slate-500">Max: Level {overviewMetrics.maxLevel}</span>
              </div>
              <div className="p-3 rounded-xl bg-gradient-navy shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-orange data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="badges" className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-gradient-navy data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-wellness data-[state=active]:text-white">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trend */}
            <Card className="border-2 border-int-orange/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-int-orange" />
                  Engagement Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#D97230" />
                    <YAxis yAxisId="right" orientation="right" stroke="#14294D" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#14294D',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="points" 
                      stroke="#D97230" 
                      fill="#D97230" 
                      fillOpacity={0.2}
                      name="Points"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke="#14294D" 
                      strokeWidth={2}
                      dot={{ fill: '#14294D' }}
                      name="Active Users"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Level Distribution */}
            <Card className="border-2 border-int-navy/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-int-navy" />
                  User Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={levelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="level" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {levelDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Streak Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                Streak Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={streakDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="range" type="category" stroke="#64748b" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Badge Rarity Distribution */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Badge Rarity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={badgeRarityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {badgeRarityData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Badge Earners */}
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Top Badge Earners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topBadgeEarners.map((user, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-amber-400' :
                        idx === 1 ? 'bg-slate-400' :
                        idx === 2 ? 'bg-amber-600' :
                        'bg-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-purple-100 text-purple-700">
                        <Award className="h-3 w-3 mr-1" />
                        {user.badges}
                      </Badge>
                      <Badge className="bg-int-orange/10 text-int-orange">
                        <Zap className="h-3 w-3 mr-1" />
                        {user.points.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="mt-6 space-y-6">
          <Card className="border-2 border-int-navy/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-int-navy" />
                Team Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" fill="#14294D" name="Points" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="challenges" fill="#D97230" name="Challenges" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-600" />
                  Redemptions by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={redemptionStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {redemptionStats.map((entry, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reward Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="text-3xl font-bold text-emerald-600">{rewards.length}</div>
                    <div className="text-sm text-emerald-700">Available Rewards</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">{redemptions.length}</div>
                    <div className="text-sm text-purple-700">Total Redemptions</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-3xl font-bold text-amber-600">
                      {rewards.filter(r => r.is_available).length}
                    </div>
                    <div className="text-sm text-amber-700">In Stock</div>
                  </div>
                  <div className="p-4 bg-int-navy/10 rounded-xl border border-int-navy/20">
                    <div className="text-3xl font-bold text-int-navy">
                      {redemptions.filter(r => r.status === 'pending').length}
                    </div>
                    <div className="text-sm text-int-navy">Pending Fulfillment</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}