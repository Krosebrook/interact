import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodiumDisplay from '../components/leaderboard/PodiumDisplay';
import LeaderboardListItem from '../components/leaderboard/LeaderboardListItem';
import { useUserData } from '../components/hooks/useUserData';

export default function Leaderboards() {
  const { user } = useUserData(true);
  const [timeframe, setTimeframe] = useState('weekly');

  const { data: leaderboardData = [] } = useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async () => {
      const allPoints = await base44.entities.UserPoints.list('-total_points', 50);
      const profiles = await base44.entities.UserProfile.list();
      
      return allPoints.map((points, index) => {
        const profile = profiles.find(p => p.user_email === points.user_email);
        return {
          rank: index + 1,
          name: profile?.user_email?.split('@')[0] || 'User',
          points: points.total_points,
          avatar: profile?.avatar_url,
          department: profile?.department,
          online: Math.random() > 0.5,
          trend: Math.floor(Math.random() * 10) - 3
        };
      });
    }
  });

  const topThree = leaderboardData.slice(0, 3);
  const restOfList = leaderboardData.slice(3);
  const currentUserRank = leaderboardData.findIndex(u => u.name === user?.full_name?.split(' ')[0]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-sm text-slate-600 mt-1">See how you stack up</p>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex h-12 w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 p-1.5">
        <button
          onClick={() => setTimeframe('weekly')}
          className={`flex-1 h-full rounded-full text-sm font-bold transition-all ${
            timeframe === 'weekly' 
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTimeframe('monthly')}
          className={`flex-1 h-full rounded-full text-sm font-bold transition-all ${
            timeframe === 'monthly' 
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setTimeframe('alltime')}
          className={`flex-1 h-full rounded-full text-sm font-bold transition-all ${
            timeframe === 'alltime' 
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Podium Display */}
      <Card className="border-0 shadow-lg">
        <PodiumDisplay topThree={topThree} />
      </Card>

      {/* Rest of Leaderboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {restOfList.map((entry) => (
            <LeaderboardListItem
              key={entry.rank}
              rank={entry.rank}
              user={entry}
              points={entry.points}
              department={entry.department}
              trend={entry.trend}
            />
          ))}
        </CardContent>
      </Card>

      {/* Current User Position */}
      {currentUserRank >= 3 && (
        <Card className="border-2 border-primary shadow-lg bg-gradient-to-r from-primary to-blue-600 text-white sticky bottom-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">#{currentUserRank + 1}</span>
                <div>
                  <p className="font-bold">You</p>
                  <p className="text-xs text-white/80">Keep pushing! 🔥</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {leaderboardData[currentUserRank]?.points?.toLocaleString()}
                </p>
                <p className="text-xs text-white/80 uppercase tracking-wider">PTS</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}