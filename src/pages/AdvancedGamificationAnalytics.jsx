import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, TrendingUp, Award, Target, Crown, FlaskConical, 
  Download, RefreshCw, Calendar
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EngagementTrendsChart from '../components/analytics/gamification/EngagementTrendsChart';
import BadgeDistributionAnalysis from '../components/analytics/gamification/BadgeDistributionAnalysis';
import ChallengePerformanceMetrics from '../components/analytics/gamification/ChallengePerformanceMetrics';
import LeaderboardDynamicsAnalysis from '../components/analytics/gamification/LeaderboardDynamicsAnalysis';
import ABTestingFramework from '../components/analytics/gamification/ABTestingFramework';

export default function AdvancedGamificationAnalytics() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const [timeRange, setTimeRange] = useState(30);

  // Fetch all required data
  const { data: userPoints = [], isLoading: pointsLoading, refetch: refetchPoints } = useQuery({
    queryKey: ['user-points-analytics'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 500),
    enabled: !!user
  });

  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['badges-analytics'],
    queryFn: () => base44.entities.Badge.list(),
    enabled: !!user
  });

  const { data: badgeAwards = [], isLoading: awardsLoading } = useQuery({
    queryKey: ['badge-awards-analytics'],
    queryFn: () => base44.entities.BadgeAward.list('-created_date', 1000),
    enabled: !!user
  });

  const { data: personalChallenges = [], isLoading: personalLoading } = useQuery({
    queryKey: ['personal-challenges-analytics'],
    queryFn: () => base44.entities.PersonalChallenge.list('-created_date', 500),
    enabled: !!user
  });

  const { data: teamChallenges = [], isLoading: teamLoading } = useQuery({
    queryKey: ['team-challenges-analytics'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date', 200),
    enabled: !!user
  });

  const { data: participations = [], isLoading: partLoading } = useQuery({
    queryKey: ['participations-analytics'],
    queryFn: () => base44.entities.Participation.list('-created_date', 1000),
    enabled: !!user
  });

  const { data: leaderboardSnapshots = [] } = useQuery({
    queryKey: ['leaderboard-snapshots'],
    queryFn: () => base44.entities.LeaderboardSnapshot.list('-created_date', 100),
    enabled: !!user
  });

  const isLoading = userLoading || pointsLoading || badgesLoading || awardsLoading || 
                    personalLoading || teamLoading || partLoading;

  const handleRefresh = () => {
    refetchPoints();
  };

  const handleExport = () => {
    // Generate CSV export
    const data = userPoints.map(up => ({
      email: up.user_email,
      total_points: up.total_points || 0,
      lifetime_points: up.lifetime_points || 0,
      level: up.level || 1,
      streak: up.streak_days || 0,
      events_attended: up.events_attended || 0,
      badges_earned: (up.badges_earned || []).length
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamification-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-int-navy flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-int-orange" />
            Advanced Gamification Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Deep insights into engagement, progression, and gamification performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Engagement</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="abtesting" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">A/B Tests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Loading engagement data..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <EngagementTrendsChart 
                userPoints={userPoints}
                participations={participations}
                challenges={personalChallenges}
                timeRange={timeRange}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Loading badge data..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <BadgeDistributionAnalysis 
                badges={badges}
                badgeAwards={badgeAwards}
                userPoints={userPoints}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Loading challenge data..." />
            </div>
          ) : (
            <ChallengePerformanceMetrics 
              personalChallenges={personalChallenges}
              teamChallenges={teamChallenges}
              userPoints={userPoints}
            />
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Loading leaderboard data..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <LeaderboardDynamicsAnalysis 
                userPoints={userPoints}
                leaderboardSnapshots={leaderboardSnapshots}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <ABTestingFramework />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}