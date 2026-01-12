import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Award, 
  Medal, 
  Star,
  Flame,
  Calendar,
  Target,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { subDays, subMonths, isAfter } from 'date-fns';

const RANK_STYLES = {
  1: { 
    bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', 
    border: 'border-yellow-400',
    icon: '🥇' 
  },
  2: { 
    bg: 'bg-gradient-to-r from-gray-300 to-gray-500', 
    border: 'border-gray-400',
    icon: '🥈' 
  },
  3: { 
    bg: 'bg-gradient-to-r from-amber-400 to-amber-600', 
    border: 'border-amber-400',
    icon: '🥉' 
  }
};

export default function AdvancedLeaderboard({ currentUserEmail }) {
  const [view, setView] = useState('individual');
  const [timeRange, setTimeRange] = useState('all');
  const [metric, setMetric] = useState('points');

  const { data: userPoints = [], isLoading } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points', 50)
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  // Filter and sort data based on time range and metric
  const filteredLeaderboard = useMemo(() => {
    let data = [...userPoints];
    
    // Filter by time range
    if (timeRange !== 'all') {
      const cutoffDate = timeRange === 'week' 
        ? subDays(new Date(), 7)
        : timeRange === 'month' 
          ? subMonths(new Date(), 1)
          : subMonths(new Date(), 3);
      
      data = data.filter(up => {
        const lastActivity = up.last_activity_date ? new Date(up.last_activity_date) : null;
        return lastActivity && isAfter(lastActivity, cutoffDate);
      });
    }

    // Sort by selected metric
    switch (metric) {
      case 'points':
        data.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
        break;
      case 'events':
        data.sort((a, b) => (b.events_attended || 0) - (a.events_attended || 0));
        break;
      case 'streak':
        data.sort((a, b) => (b.streak_days || 0) - (a.streak_days || 0));
        break;
      case 'badges':
        data.sort((a, b) => (b.badges_earned?.length || 0) - (a.badges_earned?.length || 0));
        break;
      case 'engagement':
        data.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
        break;
    }

    return data.slice(0, 50);
  }, [userPoints, timeRange, metric]);

  // Calculate team leaderboard
  const teamLeaderboard = useMemo(() => {
    return teams
      .filter(t => t.is_active !== false)
      .sort((a, b) => {
        switch (metric) {
          case 'points':
            return (b.total_points || 0) - (a.total_points || 0);
          case 'events':
            return (b.team_stats?.events_attended || 0) - (a.team_stats?.events_attended || 0);
          default:
            return (b.total_points || 0) - (a.total_points || 0);
        }
      })
      .slice(0, 20);
  }, [teams, metric]);

  const getUser = (email) => users.find(u => u.email === email);
  
  const getRankChange = (userPoint) => {
    const change = userPoint.rank_change || 0;
    if (change > 0) return { icon: ChevronUp, color: 'text-green-500', text: `+${change}` };
    if (change < 0) return { icon: ChevronDown, color: 'text-red-500', text: `${change}` };
    return { icon: Minus, color: 'text-slate-400', text: '—' };
  };

  const getMetricValue = (userPoint) => {
    switch (metric) {
      case 'points': return userPoint.total_points || 0;
      case 'events': return userPoint.events_attended || 0;
      case 'streak': return userPoint.streak_days || 0;
      case 'badges': return userPoint.badges_earned?.length || 0;
      case 'engagement': return userPoint.engagement_score || 0;
      default: return userPoint.total_points || 0;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'points': return 'points';
      case 'events': return 'events';
      case 'streak': return 'day streak';
      case 'badges': return 'badges';
      case 'engagement': return '% engagement';
      default: return 'points';
    }
  };

  if (isLoading) {
    return (
      <div data-b44-sync="true" data-feature="gamification" data-component="advancedleaderboard" className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-int-orange"></div>
      </div>
    );
  }

  const currentUserRank = filteredLeaderboard.findIndex(up => up.user_email === currentUserEmail) + 1;

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-int-navy flex items-center gap-2">
            <Trophy className="h-6 w-6 text-int-orange" />
            Leaderboard
          </h2>
          <p className="text-slate-600">See who's leading the engagement challenge</p>
        </div>

        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Total Points</SelectItem>
              <SelectItem value="events">Events Attended</SelectItem>
              <SelectItem value="streak">Streak Days</SelectItem>
              <SelectItem value="badges">Badges Earned</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current User Position */}
      {currentUserEmail && currentUserRank > 0 && (
        <Card className="border-2 border-int-orange bg-gradient-to-r from-orange-50 to-white">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-int-orange text-white flex items-center justify-center font-bold text-lg">
                  #{currentUserRank}
                </div>
                <div>
                  <p className="font-semibold">Your Position</p>
                  <p className="text-sm text-slate-600">
                    {getMetricValue(filteredLeaderboard[currentUserRank - 1])} {getMetricLabel()}
                  </p>
                </div>
              </div>
              {currentUserRank <= 10 && (
                <Badge className="bg-int-orange text-white">Top 10!</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={view} onValueChange={setView}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="individual">
            <Award className="h-4 w-4 mr-2" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
        </TabsList>

        {/* Individual Leaderboard */}
        <TabsContent value="individual" className="mt-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 0, 2].map((podiumIndex) => {
              const user = filteredLeaderboard[podiumIndex];
              if (!user) return <div key={podiumIndex} />;
              const userData = getUser(user.user_email);
              const rankStyle = RANK_STYLES[podiumIndex + 1];
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: podiumIndex * 0.1 }}
                  className={`${podiumIndex === 0 ? 'order-2' : podiumIndex === 1 ? 'order-1' : 'order-3'}`}
                >
                  <Card className={`text-center p-4 border-2 ${rankStyle.border} ${
                    podiumIndex === 0 ? 'transform scale-105' : ''
                  }`}>
                    <div className="text-4xl mb-2">{rankStyle.icon}</div>
                    <div className={`w-16 h-16 mx-auto rounded-full ${rankStyle.bg} text-white flex items-center justify-center text-2xl font-bold mb-2`}>
                      {(userData?.full_name || user.user_email)[0].toUpperCase()}
                    </div>
                    <h4 className="font-semibold truncate">{userData?.full_name || user.user_email}</h4>
                    <p className="text-2xl font-bold text-int-orange">{getMetricValue(user)}</p>
                    <p className="text-xs text-slate-500">{getMetricLabel()}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Rest of Leaderboard */}
          <div className="space-y-2">
            {filteredLeaderboard.slice(3).map((userPoint, index) => {
              const userData = getUser(userPoint.user_email);
              const rankChange = getRankChange(userPoint);
              const RankIcon = rankChange.icon;
              const isCurrentUser = userPoint.user_email === currentUserEmail;
              
              return (
                <motion.div
                  key={userPoint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card className={`p-3 hover:shadow-md transition-all ${
                    isCurrentUser ? 'border-2 border-int-orange bg-orange-50' : ''
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {index + 4}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {userData?.full_name || userPoint.user_email}
                          </span>
                          {userPoint.streak_days >= 7 && (
                            <Flame className="h-4 w-4 text-orange-500" />
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>Level {userPoint.level || 1}</span>
                          {userPoint.badges_earned?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {userPoint.badges_earned.length}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <RankIcon className={`h-4 w-4 ${rankChange.color}`} />
                        <span className={`text-xs ${rankChange.color}`}>{rankChange.text}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-int-navy">
                          {getMetricValue(userPoint)}
                        </div>
                        <div className="text-xs text-slate-500">{getMetricLabel()}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Team Leaderboard */}
        <TabsContent value="team" className="mt-6 space-y-3">
          {teamLeaderboard.map((team, index) => {
            const rankStyle = RANK_STYLES[index + 1];
            
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 hover:shadow-lg transition-all ${
                  index < 3 ? `border-2 ${rankStyle?.border || ''}` : ''
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                      index < 3 ? rankStyle?.bg + ' text-white' : 'bg-slate-100'
                    }`}>
                      {index < 3 ? rankStyle?.icon : team.team_avatar || '👥'}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {team.team_name}
                        {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {team.member_count} members
                        </span>
                        {team.badges_earned?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {team.badges_earned.length} badges
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-int-orange">
                        {team.total_points || 0}
                      </div>
                      <div className="text-xs text-slate-500">total points</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {teamLeaderboard.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teams configured yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}