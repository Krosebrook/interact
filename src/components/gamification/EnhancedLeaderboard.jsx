import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Crown,
  Zap,
  Users,
  Target,
  Flame
} from 'lucide-react';

const RANK_STYLES = {
  1: { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: Crown, color: 'text-yellow-600' },
  2: { bg: 'bg-gradient-to-r from-slate-300 to-slate-500', icon: Medal, color: 'text-slate-500' },
  3: { bg: 'bg-gradient-to-r from-amber-500 to-amber-700', icon: Medal, color: 'text-amber-600' }
};

export default function EnhancedLeaderboard({ timeframe = 'all_time' }) {
  const [view, setView] = useState('participants');

  const { data: userPoints = [], isLoading } = useQuery({
    queryKey: ['leaderboard-points', timeframe],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.list('-lifetime_points', 100);
      return points;
    }
  });

  const { data: events = [] } = useQuery({
    queryKey: ['leaderboard-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 200)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['leaderboard-users'],
    queryFn: () => base44.entities.User.list()
  });

  // Calculate facilitator stats
  const facilitatorStats = React.useMemo(() => {
    const stats = {};
    events.forEach(event => {
      if (event.facilitator_email && event.status === 'completed') {
        if (!stats[event.facilitator_email]) {
          stats[event.facilitator_email] = {
            email: event.facilitator_email,
            name: event.facilitator_name || event.facilitator_email,
            events_facilitated: 0,
            total_participants: 0,
            points: 0
          };
        }
        stats[event.facilitator_email].events_facilitated++;
        stats[event.facilitator_email].points += 50; // 50 points per facilitated event
      }
    });
    return Object.values(stats).sort((a, b) => b.points - a.points);
  }, [events]);

  // Team leaderboard
  const teamStats = React.useMemo(() => {
    const teams = {};
    userPoints.forEach(up => {
      if (up.team_name) {
        if (!teams[up.team_name]) {
          teams[up.team_name] = {
            name: up.team_name,
            total_points: 0,
            member_count: 0,
            avg_engagement: 0,
            engagement_sum: 0
          };
        }
        teams[up.team_name].total_points += up.lifetime_points || 0;
        teams[up.team_name].member_count++;
        if (up.engagement_score) {
          teams[up.team_name].engagement_sum += up.engagement_score;
        }
      }
    });
    
    return Object.values(teams)
      .map(t => ({
        ...t,
        avg_engagement: t.member_count > 0 ? Math.round(t.engagement_sum / t.member_count) : 0
      }))
      .sort((a, b) => b.total_points - a.total_points);
  }, [userPoints]);

  const getRankChange = (change) => {
    if (change > 0) return { icon: TrendingUp, color: 'text-green-500', text: `+${change}` };
    if (change < 0) return { icon: TrendingDown, color: 'text-red-500', text: `${change}` };
    return { icon: Minus, color: 'text-slate-400', text: '-' };
  };

  const renderParticipantRow = (userPoint, index) => {
    const rank = index + 1;
    const rankStyle = RANK_STYLES[rank];
    const rankChange = getRankChange(userPoint.rank_change || 0);
    const RankChangeIcon = rankChange.icon;
    const user = users.find(u => u.email === userPoint.user_email);

    return (
      <div data-b44-sync="true" data-feature="gamification" data-component="enhancedleaderboard"         key={userPoint.id}
        className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-slate-50 ${
          rank <= 3 ? 'bg-gradient-to-r from-slate-50 to-white' : ''
        }`}
      >
        {/* Rank */}
        <div className="w-12 text-center">
          {rank <= 3 ? (
            <div className={`w-10 h-10 rounded-full ${rankStyle.bg} flex items-center justify-center mx-auto`}>
              <rankStyle.icon className="h-5 w-5 text-white" />
            </div>
          ) : (
            <span className="text-xl font-bold text-slate-400">#{rank}</span>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={rank <= 3 ? rankStyle.bg : 'bg-slate-200'}>
              {user?.full_name?.charAt(0) || userPoint.user_email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.full_name || userPoint.user_email}</p>
            <div className="flex items-center gap-2">
              {userPoint.team_name && (
                <Badge variant="outline" className="text-xs">{userPoint.team_name}</Badge>
              )}
              {userPoint.streak_days > 0 && (
                <span className="text-xs text-orange-500 flex items-center gap-1">
                  <Flame className="h-3 w-3" /> {userPoint.streak_days} day streak
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-slate-500">Events</p>
            <p className="font-bold">{userPoint.events_attended || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">Level</p>
            <p className="font-bold">{userPoint.level || 1}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">Badges</p>
            <p className="font-bold">{userPoint.badges_earned?.length || 0}</p>
          </div>
        </div>

        {/* Points & Rank Change */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-int-navy">{userPoint.lifetime_points || 0}</p>
            <p className="text-xs text-slate-500">points</p>
          </div>
          <div className={`flex items-center gap-1 ${rankChange.color}`}>
            <RankChangeIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{rankChange.text}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFacilitatorRow = (facilitator, index) => {
    const rank = index + 1;
    const rankStyle = RANK_STYLES[rank];

    return (
      <div
        key={facilitator.email}
        className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-slate-50`}
      >
        <div className="w-12 text-center">
          {rank <= 3 ? (
            <div className={`w-10 h-10 rounded-full ${rankStyle.bg} flex items-center justify-center mx-auto`}>
              <rankStyle.icon className="h-5 w-5 text-white" />
            </div>
          ) : (
            <span className="text-xl font-bold text-slate-400">#{rank}</span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-200 text-purple-700">
              {facilitator.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{facilitator.name}</p>
            <Badge className="bg-purple-100 text-purple-700 text-xs">Facilitator</Badge>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-slate-500">Events Led</p>
            <p className="font-bold">{facilitator.events_facilitated}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">{facilitator.points}</p>
          <p className="text-xs text-slate-500">points</p>
        </div>
      </div>
    );
  };

  const renderTeamRow = (team, index) => {
    const rank = index + 1;
    const rankStyle = RANK_STYLES[rank];

    return (
      <div
        key={team.name}
        className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-slate-50`}
      >
        <div className="w-12 text-center">
          {rank <= 3 ? (
            <div className={`w-10 h-10 rounded-full ${rankStyle.bg} flex items-center justify-center mx-auto`}>
              <Trophy className="h-5 w-5 text-white" />
            </div>
          ) : (
            <span className="text-xl font-bold text-slate-400">#{rank}</span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-int-navy flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">{team.name}</p>
            <p className="text-sm text-slate-500">{team.member_count} members</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-slate-500">Avg Engagement</p>
            <p className="font-bold">{team.avg_engagement}%</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-int-orange">{team.total_points}</p>
          <p className="text-xs text-slate-500">team points</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-int-orange"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="participants" className="flex items-center gap-1">
              <Star className="h-4 w-4" /> Participants
            </TabsTrigger>
            <TabsTrigger value="facilitators" className="flex items-center gap-1">
              <Zap className="h-4 w-4" /> Facilitators
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="space-y-2">
            {userPoints.slice(0, 10).map((up, i) => renderParticipantRow(up, i))}
            {userPoints.length === 0 && (
              <p className="text-center text-slate-500 py-8">No participants yet</p>
            )}
          </TabsContent>

          <TabsContent value="facilitators" className="space-y-2">
            {facilitatorStats.slice(0, 10).map((f, i) => renderFacilitatorRow(f, i))}
            {facilitatorStats.length === 0 && (
              <p className="text-center text-slate-500 py-8">No facilitators yet</p>
            )}
          </TabsContent>

          <TabsContent value="teams" className="space-y-2">
            {teamStats.slice(0, 10).map((t, i) => renderTeamRow(t, i))}
            {teamStats.length === 0 && (
              <p className="text-center text-slate-500 py-8">No teams yet</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}