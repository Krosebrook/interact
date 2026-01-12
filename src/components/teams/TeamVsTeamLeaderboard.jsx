import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Crown, 
  Medal,
  Zap,
  Flame,
  Award,
  Target,
  ChevronRight,
  Swords
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const RANK_STYLES = {
  1: { 
    bg: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50',
    border: 'border-amber-400 border-2',
    icon: Crown,
    iconColor: 'text-amber-500 fill-amber-500',
    badge: 'bg-gradient-to-r from-amber-400 to-yellow-500'
  },
  2: {
    bg: 'bg-gradient-to-r from-slate-50 to-gray-100',
    border: 'border-slate-400 border-2',
    icon: Medal,
    iconColor: 'text-slate-500',
    badge: 'bg-gradient-to-r from-slate-400 to-gray-500'
  },
  3: {
    bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
    border: 'border-amber-600 border-2',
    icon: Medal,
    iconColor: 'text-amber-700',
    badge: 'bg-gradient-to-r from-amber-600 to-orange-700'
  }
};

export default function TeamVsTeamLeaderboard({ userTeamId }) {
  const [timeframe, setTimeframe] = useState('all_time');

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points')
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships'],
    queryFn: () => base44.entities.TeamMembership.list()
  });

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => base44.entities.UserPoints.list()
  });

  // Calculate team stats
  const teamStats = teams.map((team, index) => {
    const teamMemberships = memberships.filter(m => m.team_id === team.id);
    const memberEmails = teamMemberships.map(m => m.user_email);
    const memberPoints = userPoints.filter(up => memberEmails.includes(up.user_email));
    
    const totalPoints = memberPoints.reduce((sum, up) => sum + (up.total_points || 0), 0);
    const avgPoints = memberPoints.length > 0 ? Math.round(totalPoints / memberPoints.length) : 0;
    const totalBadges = memberPoints.reduce((sum, up) => sum + (up.badges_earned?.length || 0), 0);
    const activeStreaks = memberPoints.filter(up => up.streak_days > 0).length;
    const eventsAttended = memberPoints.reduce((sum, up) => sum + (up.events_attended || 0), 0);

    return {
      ...team,
      rank: index + 1,
      memberCount: memberPoints.length,
      totalPoints,
      avgPoints,
      totalBadges,
      activeStreaks,
      eventsAttended,
      isUserTeam: team.id === userTeamId
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  // Re-rank after sorting
  teamStats.forEach((team, idx) => {
    team.rank = idx + 1;
  });

  const topTeam = teamStats[0];

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="teams" data-component="teamvsteamleaderboard">
      {/* Header */}
      <Card className="overflow-hidden border-2 border-int-navy/20">
        <div className="bg-gradient-to-r from-int-navy via-blue-800 to-int-navy p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <Swords className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Team vs Team Leaderboard</h2>
                <p className="text-white/70">Compete for glory and rewards</p>
              </div>
            </div>
            {topTeam && (
              <div className="text-right">
                <p className="text-sm text-white/70">Current Leader</p>
                <div className="flex items-center gap-2 mt-1">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <span className="text-xl font-bold">{topTeam.name}</span>
                </div>
                <p className="text-amber-300 font-semibold">
                  {topTeam.totalPoints.toLocaleString()} pts
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Timeframe Tabs */}
      <Tabs value={timeframe} onValueChange={setTimeframe}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="week" className="data-[state=active]:bg-gradient-orange data-[state=active]:text-white">
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" className="data-[state=active]:bg-gradient-orange data-[state=active]:text-white">
            This Month
          </TabsTrigger>
          <TabsTrigger value="all_time" className="data-[state=active]:bg-gradient-navy data-[state=active]:text-white">
            All Time
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Team Rankings */}
      <div className="space-y-3">
        <AnimatePresence>
          {teamStats.map((team, index) => {
            const rankStyle = RANK_STYLES[team.rank];
            const RankIcon = rankStyle?.icon || Trophy;
            const progressToFirst = topTeam ? (team.totalPoints / topTeam.totalPoints) * 100 : 0;

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`overflow-hidden transition-all hover:shadow-lg ${
                  team.isUserTeam 
                    ? 'ring-2 ring-int-orange ring-offset-2' 
                    : ''
                } ${rankStyle?.bg || ''} ${rankStyle?.border || 'border'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`flex items-center justify-center w-14 h-14 rounded-xl font-bold text-xl shadow-lg ${
                        rankStyle?.badge || 'bg-int-navy'
                      } text-white`}>
                        {team.rank <= 3 ? (
                          <RankIcon className={`h-7 w-7 ${team.rank === 1 ? 'fill-current' : ''}`} />
                        ) : (
                          team.rank
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color || '#D97230' }}
                          />
                          <h3 className="font-bold text-lg text-slate-900">{team.name}</h3>
                          {team.isUserTeam && (
                            <Badge className="bg-int-orange text-white">Your Team</Badge>
                          )}
                          {team.rank === 1 && (
                            <span className="text-xl">👑</span>
                          )}
                        </div>
                        
                        {/* Progress bar to first place */}
                        {team.rank > 1 && (
                          <div className="mb-2">
                            <Progress value={progressToFirst} className="h-1.5" />
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {team.memberCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {team.totalBadges}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {team.eventsAttended}
                          </span>
                          {team.activeStreaks > 0 && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <Flame className="h-4 w-4" />
                              {team.activeStreaks}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-2xl font-bold text-int-orange">
                          <Zap className="h-6 w-6" />
                          {team.totalPoints.toLocaleString()}
                        </div>
                        <span className="text-sm text-slate-500">
                          avg {team.avgPoints.toLocaleString()}/member
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {teams.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">No Teams Yet</h3>
            <p className="text-sm text-slate-500">Create teams to start competing!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}