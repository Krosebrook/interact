import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import LeaderboardCard from '../components/gamification/LeaderboardCard';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import { Trophy, Search, Award, TrendingUp, Zap } from 'lucide-react';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const { data: allUserStats = [], isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => base44.entities.UserStats.list()
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  // Sort by total points
  const leaderboard = [...allUserStats]
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0));

  // Filter by search
  const filteredLeaderboard = leaderboard.filter(stat =>
    stat.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current user stats
  const currentUserStats = user 
    ? allUserStats.find(s => s.user_email === user.email)
    : null;

  const currentUserPosition = currentUserStats
    ? leaderboard.findIndex(s => s.user_email === currentUserStats.user_email) + 1
    : null;

  // Sort by different metrics
  const topByEvents = [...allUserStats]
    .sort((a, b) => (b.events_attended || 0) - (a.events_attended || 0))
    .slice(0, 10);

  const topByFeedback = [...allUserStats]
    .sort((a, b) => (b.feedback_count || 0) - (a.feedback_count || 0))
    .slice(0, 10);

  const topByStreak = [...allUserStats]
    .sort((a, b) => (b.best_streak || 0) - (a.best_streak || 0))
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-slate-600 mt-2">See how you stack up against your teammates!</p>
        </div>
      </div>

      {/* Current User Card */}
      {currentUserStats && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            Your Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl font-bold text-indigo-600">
                #{currentUserPosition}
              </div>
              <div className="text-sm text-slate-600 mt-1">Rank</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl font-bold text-slate-900">
                {currentUserStats.total_points}
              </div>
              <div className="text-sm text-slate-600 mt-1">Points</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl font-bold text-slate-900">
                {currentUserStats.events_attended}
              </div>
              <div className="text-sm text-slate-600 mt-1">Events</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-600">
                🔥 {currentUserStats.current_streak}
              </div>
              <div className="text-sm text-slate-600 mt-1">Streak</div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall">
            <Trophy className="h-4 w-4 mr-2" />
            Overall
          </TabsTrigger>
          <TabsTrigger value="events">
            <TrendingUp className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <Award className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
        </TabsList>

        {/* Overall Leaderboard */}
        <TabsContent value="overall" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeaderboard.slice(0, 50).map((stat, index) => (
                <LeaderboardCard
                  key={stat.id}
                  userStats={stat}
                  position={leaderboard.findIndex(s => s.id === stat.id) + 1}
                  isCurrentUser={user && stat.user_email === user.email}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events Leaderboard */}
        <TabsContent value="events" className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Most Active Participants</h3>
          {topByEvents.map((stat, index) => (
            <LeaderboardCard
              key={stat.id}
              userStats={stat}
              position={index + 1}
              isCurrentUser={user && stat.user_email === user.email}
            />
          ))}
        </TabsContent>

        {/* Feedback Leaderboard */}
        <TabsContent value="feedback" className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Top Feedback Contributors</h3>
          {topByFeedback.map((stat, index) => (
            <LeaderboardCard
              key={stat.id}
              userStats={stat}
              position={index + 1}
              isCurrentUser={user && stat.user_email === user.email}
            />
          ))}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allBadges.map(badge => {
                const earned = currentUserStats?.badges_earned?.includes(badge.badge_id);
                let progress = 0;
                
                if (!earned && currentUserStats) {
                  switch (badge.criteria_type) {
                    case 'events_attended':
                      progress = currentUserStats.events_attended / badge.criteria_value;
                      break;
                    case 'points_total':
                      progress = currentUserStats.total_points / badge.criteria_value;
                      break;
                    case 'feedback_count':
                      progress = currentUserStats.feedback_count / badge.criteria_value;
                      break;
                    case 'streak':
                      progress = currentUserStats.best_streak / badge.criteria_value;
                      break;
                  }
                }

                return (
                  <BadgeDisplay
                    key={badge.id}
                    badge={badge}
                    earned={earned}
                    progress={progress}
                  />
                );
              })}
            </div>
          </div>

          {currentUserStats?.badges_earned?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allBadges
                  .filter(badge => currentUserStats.badges_earned.includes(badge.badge_id))
                  .map(badge => (
                    <BadgeDisplay
                      key={badge.id}
                      badge={badge}
                      earned={true}
                    />
                  ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}