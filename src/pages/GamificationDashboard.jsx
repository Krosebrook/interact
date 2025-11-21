import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  ResponsiveContainer 
} from 'recharts';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Zap,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import { format, subDays, subMonths, isAfter, isBefore } from 'date-fns';

export default function GamificationDashboard() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [userSegment, setUserSegment] = useState('all');
  const [minLevel, setMinLevel] = useState(1);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: userPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ['redemptions'],
    queryFn: () => base44.entities.RewardRedemption.list('-created_date', 200)
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  // Date filtering logic
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case '3months':
        return { start: subMonths(now, 3), end: now };
      case '6months':
        return { start: subMonths(now, 6), end: now };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : subDays(now, 30),
          end: customEndDate ? new Date(customEndDate) : now
        };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange();

    // Filter user points by segment
    let filtered = userPoints.filter(up => {
      if (userSegment === 'active' && up.events_attended < 3) return false;
      if (userSegment === 'high-performers' && up.total_points < 500) return false;
      if (userSegment === 'new' && up.events_attended > 5) return false;
      if (up.level < minLevel) return false;
      return true;
    });

    // Filter redemptions by date
    const filteredRedemptions = redemptions.filter(r => {
      const date = new Date(r.created_date);
      return isAfter(date, start) && isBefore(date, end);
    });

    // Filter participations by date
    const filteredParticipations = participations.filter(p => {
      const date = new Date(p.created_date);
      return isAfter(date, start) && isBefore(date, end);
    });

    return {
      userPoints: filtered,
      redemptions: filteredRedemptions,
      participations: filteredParticipations
    };
  }, [userPoints, redemptions, participations, dateRange, customStartDate, customEndDate, userSegment, minLevel]);

  // Calculate metrics
  const totalUsers = filteredData.userPoints.length;
  const totalPoints = filteredData.userPoints.reduce((sum, up) => sum + up.total_points, 0);
  const avgPointsPerUser = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
  const totalBadgesEarned = filteredData.userPoints.reduce((sum, up) => sum + (up.badges_earned?.length || 0), 0);
  const totalRedemptions = filteredData.redemptions.length;
  const totalParticipations = filteredData.participations.length;

  // Leaderboard data
  const leaderboardData = filteredData.userPoints
    .slice(0, 10)
    .map((up, index) => {
      const user = users.find(u => u.email === up.user_email);
      return {
        rank: index + 1,
        name: user?.full_name || up.user_email,
        email: up.user_email,
        points: up.total_points,
        level: up.level,
        badges: up.badges_earned?.length || 0,
        events: up.events_attended,
        streak: up.streak_days
      };
    });

  // Badge distribution data
  const badgeDistribution = useMemo(() => {
    const distribution = {};
    filteredData.userPoints.forEach(up => {
      up.badges_earned?.forEach(badgeId => {
        const badge = badges.find(b => b.id === badgeId);
        if (badge) {
          const rarity = badge.rarity || 'common';
          distribution[rarity] = (distribution[rarity] || 0) + 1;
        }
      });
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredData.userPoints, badges]);

  // Redemption trends over time
  const redemptionTrends = useMemo(() => {
    const trends = {};
    filteredData.redemptions.forEach(r => {
      const date = format(new Date(r.created_date), 'MMM dd');
      trends[date] = (trends[date] || 0) + 1;
    });
    return Object.entries(trends).map(([date, count]) => ({ date, count }));
  }, [filteredData.redemptions]);

  // Points earned over time (based on participations)
  const pointsOverTime = useMemo(() => {
    const trends = {};
    filteredData.participations
      .filter(p => p.points_awarded)
      .forEach(p => {
        const date = format(new Date(p.created_date), 'MMM dd');
        trends[date] = (trends[date] || 0) + (p.activity_completed ? 10 : 0);
      });
    return Object.entries(trends).map(([date, points]) => ({ date, points }));
  }, [filteredData.participations]);

  // Level distribution
  const levelDistribution = useMemo(() => {
    const distribution = {};
    filteredData.userPoints.forEach(up => {
      const level = `Level ${up.level}`;
      distribution[level] = (distribution[level] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredData.userPoints]);

  const COLORS = ['#0A1C39', '#F47C20', '#4A6070', '#7A94A6', '#C46322', '#F5C16A'];

  if (!user || pointsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-int-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gamification Analytics</h1>
          <p className="text-slate-600">Track user engagement and reward trends</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-slate-500" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {dateRange === 'custom' && (
            <>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}
          <div>
            <Label>User Segment</Label>
            <Select value={userSegment} onValueChange={setUserSegment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active (3+ events)</SelectItem>
                <SelectItem value="high-performers">High Performers (500+ points)</SelectItem>
                <SelectItem value="new">New Users (≤5 events)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Min Level</Label>
            <Input
              type="number"
              min="1"
              value={minLevel}
              onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">In selected segment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPointsPerUser}</div>
            <p className="text-xs text-slate-500 mt-1">Per user</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBadgesEarned}</div>
            <p className="text-xs text-slate-500 mt-1">Badges earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRedemptions}</div>
            <p className="text-xs text-slate-500 mt-1">In date range</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="overflow-hidden border-2 border-int-navy">
        <CardHeader className="bg-gradient-to-r from-int-navy to-[#4A6070] text-white">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#F5C16A]" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                  user.rank === 1 ? 'bg-gradient-to-r from-[#F5C16A]/20 to-[#F47C20]/20 border-2 border-int-orange' :
                  user.rank === 2 ? 'bg-slate-100 border-2 border-[#7A94A6]' :
                  user.rank === 3 ? 'bg-slate-50 border-2 border-[#C46322]' :
                  'bg-slate-50 border border-slate-200 hover:border-int-orange'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                  user.rank === 1 ? 'bg-gradient-to-br from-[#F5C16A] to-int-orange text-white' :
                  user.rank === 2 ? 'bg-gradient-to-br from-[#7A94A6] to-[#4A6070] text-white' :
                  user.rank === 3 ? 'bg-gradient-to-br from-[#C46322] to-int-orange text-white' :
                  'bg-int-navy text-white'
                }`}>
                  {user.rank <= 3 ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    user.rank
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {user.name}
                    {user.rank === 1 && <span className="text-lg">👑</span>}
                  </div>
                  <div className="text-sm text-slate-600">{user.email}</div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-int-orange text-lg">{user.points}</div>
                    <div className="text-xs text-slate-500">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-int-navy text-lg">{user.level}</div>
                    <div className="text-xs text-slate-500">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-[#4A6070] text-lg">{user.badges}</div>
                    <div className="text-xs text-slate-500">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-int-orange text-lg">{user.streak}</div>
                    <div className="text-xs text-slate-500">Streak</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badge Distribution */}
        <Card className="border-2 border-int-orange/30 hover:border-int-orange transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-int-orange" />
              Badge Distribution by Rarity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={badgeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {badgeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0A1C39',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card className="border-2 border-int-navy/30 hover:border-int-navy transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-int-navy" />
              User Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#4C4C4C" />
                <YAxis stroke="#4C4C4C" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0A1C39',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                  cursor={{ fill: 'rgba(10, 28, 57, 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#0A1C39" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Redemption Trends */}
        <Card className="border-2 border-int-orange/30 hover:border-int-orange transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-int-orange" />
              Redemption Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={redemptionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#4C4C4C" />
                <YAxis stroke="#4C4C4C" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#F47C20',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#F47C20" 
                  strokeWidth={3}
                  dot={{ fill: '#F47C20', r: 5 }}
                  activeDot={{ r: 8, fill: '#C46322' }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Points Over Time */}
        <Card className="border-2 border-[#C46322]/30 hover:border-[#C46322] transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#C46322]" />
              Points Earned Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pointsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#4C4C4C" />
                <YAxis stroke="#4C4C4C" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#C46322',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#C46322" 
                  strokeWidth={3}
                  dot={{ fill: '#C46322', r: 5 }}
                  activeDot={{ r: 8, fill: '#F5C16A' }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-lg border-2 border-int-navy">
              <div className="text-3xl font-bold text-int-navy">{totalParticipations}</div>
              <div className="text-sm text-slate-600 mt-2">Total Participations</div>
              <div className="text-xs text-slate-500 mt-1">In selected date range</div>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg border-2 border-int-orange">
              <div className="text-3xl font-bold text-int-orange">
                {totalParticipations > 0 ? Math.round((totalParticipations / totalUsers) * 10) / 10 : 0}
              </div>
              <div className="text-sm text-slate-600 mt-2">Avg Participations/User</div>
              <div className="text-xs text-slate-500 mt-1">Higher is better</div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-[#4A6070]">
              <div className="text-3xl font-bold" style={{color: '#4A6070'}}>
                {userPoints.filter(up => up.streak_days > 0).length}
              </div>
              <div className="text-sm text-slate-600 mt-2">Users with Active Streaks</div>
              <div className="text-xs text-slate-500 mt-1">Consistency matters</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}