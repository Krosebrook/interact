import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, TrendingUp, Award, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [view, setView] = useState('individual');

  const { data: userPoints = [], isLoading } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 50)
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  // Calculate team leaderboard
  const teamLeaderboard = userPoints.reduce((acc, user) => {
    if (!user.team_name) return acc;
    if (!acc[user.team_name]) {
      acc[user.team_name] = {
        team_name: user.team_name,
        total_points: 0,
        members: 0
      };
    }
    acc[user.team_name].total_points += user.total_points || 0;
    acc[user.team_name].members += 1;
    return acc;
  }, {});

  const teamRankings = Object.values(teamLeaderboard)
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 10);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy data-b44-sync="true" data-feature="gamification" data-component="leaderboard" className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-slate-500 font-bold">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600';
    return 'bg-slate-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leaderboard</h2>
          <p className="text-slate-600">See who's leading the engagement challenge</p>
        </div>
        <TrendingUp className="h-8 w-8 text-indigo-600" />
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="individual" onClick={() => setView('individual')}>
            <Award className="h-4 w-4 mr-2" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="team" onClick={() => setView('team')}>
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-3 mt-6">
          {userPoints.slice(0, 20).map((user, index) => {
            const userData = allUsers.find(u => u.email === user.user_email);
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 hover:shadow-lg transition-all ${
                  index < 3 ? 'border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50' : ''
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)}`}>
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {userData?.full_name || user.user_email}
                      </h3>
                      <div className="flex gap-4 text-sm text-slate-600 mt-1">
                        <span>Level {user.level || 1}</span>
                        <span>•</span>
                        <span>{user.events_attended || 0} events</span>
                        {user.streak_days > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600">🔥 {user.streak_days} day streak</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {user.total_points || 0}
                      </div>
                      <div className="text-xs text-slate-500">points</div>
                    </div>
                    {user.badges_earned?.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        <Star className="h-3 w-3 mr-1" />
                        {user.badges_earned.length}
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="team" className="space-y-3 mt-6">
          {teamRankings.map((team, index) => (
            <motion.div
              key={team.team_name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-4 hover:shadow-lg transition-all ${
                index < 3 ? 'border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50' : ''
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)}`}>
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{team.team_name}</h3>
                    <div className="flex gap-2 text-sm text-slate-600 mt-1">
                      <Users className="h-4 w-4" />
                      <span>{team.members} members</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {team.total_points}
                    </div>
                    <div className="text-xs text-slate-500">total points</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {teamRankings.length === 0 && (
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