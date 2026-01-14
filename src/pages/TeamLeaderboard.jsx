/**
 * Team-Based Leaderboard
 * Compare team engagement and performance
 */

import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Users, Zap } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TeamLeaderboard() {
  const { user } = useUserData(true);
  const [timeframe, setTimeframe] = useState('month');

  const { data: teamStats, isLoading } = useQuery({
    queryKey: ['team-leaderboard', timeframe],
    queryFn: () => fetchTeamStats(timeframe),
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) return <LoadingSpinner />;

  const rankedTeams = teamStats?.sort((a, b) => b.total_points - a.total_points) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Team Leaderboard</h1>
        <p className="text-slate-600 mt-1">See how your team compares across the organization</p>
      </div>

      {/* Timeframe Selector */}
      <Tabs value={timeframe} onValueChange={setTimeframe}>
        <TabsList className="grid w-full grid-cols-3 max-w-xs">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rankedTeams.slice(0, 3).map((team, idx) => (
          <PodiumCard key={team.id} team={team} rank={idx + 1} />
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-int-orange" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankedTeams.map((team, idx) => (
              <TeamLeaderboardRow key={team.id} team={team} rank={idx + 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PodiumCard({ team, rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const bgColors = {
    1: 'from-yellow-50 to-amber-50 border-yellow-200',
    2: 'from-slate-50 to-gray-50 border-slate-200',
    3: 'from-orange-50 to-amber-50 border-orange-200'
  };

  return (
    <Card className={`bg-gradient-to-br ${bgColors[rank]}`}>
      <CardContent className="pt-6 text-center">
        <div className="text-4xl mb-2">{medals[rank]}</div>
        <p className="text-lg font-bold text-slate-900">{team.team_name}</p>
        <p className="text-sm text-slate-600">{team.member_count} members</p>
        <div className="mt-4 bg-white/50 p-3 rounded-lg">
          <p className="text-xs text-slate-600">Total Points</p>
          <p className="text-3xl font-bold text-int-orange">{team.total_points.toLocaleString()}</p>
        </div>
        <div className="mt-3 text-sm font-medium">
          {team.avg_engagement_score > 75 && (
            <span className="text-green-700">🔥 Hot team!</span>
          )}
          {team.engagement_trend === 'increasing' && (
            <span className="text-blue-700">📈 Growing fast</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamLeaderboardRow({ team, rank }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
      <div className="flex items-center gap-4 flex-1">
        <div className="text-2xl font-bold text-slate-400 w-8">#{rank}</div>
        <div>
          <p className="font-semibold text-slate-900">{team.team_name}</p>
          <div className="flex gap-2 mt-1 text-xs text-slate-600">
            <span>{team.member_count} members</span>
            <span>•</span>
            <span>{team.active_members} active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-600">Points</p>
          <p className="text-2xl font-bold text-int-orange">{team.total_points.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Avg Engagement</p>
          <p className="text-xl font-bold">{team.avg_engagement_score}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Trend</p>
          <TrendIcon trend={team.engagement_trend} />
        </div>
      </div>
    </div>
  );
}

function TrendIcon({ trend }) {
  const icons = {
    increasing: <span className="text-green-600 text-lg">📈</span>,
    stable: <span className="text-slate-600 text-lg">➡️</span>,
    decreasing: <span className="text-red-600 text-lg">📉</span>
  };
  return icons[trend] || icons.stable;
}

async function fetchTeamStats(timeframe) {
  try {
    const response = await base44.functions.invoke('getTeamLeaderboardStats', {
      timeframe
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team stats:', error);
    return [];
  }
}