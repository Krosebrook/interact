import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FeatureUsageDashboard from '../components/analytics/FeatureUsageDashboard';
import CohortAnalysis from '../components/analytics/CohortAnalysis';
import OnboardingAnalytics from '../components/analytics/OnboardingAnalytics';
import AIFeatureAnalytics from '../components/analytics/AIFeatureAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Sparkles, UserCheck, TrendingUp, Clock } from 'lucide-react';

export default function RealTimeAnalytics() {
  const { user, loading } = useUserData(true, true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time stats - refreshes every 30 seconds
  const { data: realtimeStats } = useQuery({
    queryKey: ['realtime-analytics-stats'],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [recentEvents, allUsers, activeOnboarding] = await Promise.all([
        base44.entities.AnalyticsEvent.filter({
          created_date: { $gte: oneHourAgo.toISOString() }
        }),
        base44.entities.User.list('created_date', 500),
        base44.entities.UserOnboarding.filter({
          status: 'in_progress'
        })
      ]);

      const uniqueUsersLastHour = new Set(recentEvents.map(e => e.user_email)).size;
      const eventsLastHour = recentEvents.length;

      // Calculate DAU
      const dauEvents = await base44.entities.AnalyticsEvent.filter({
        created_date: { $gte: oneDayAgo.toISOString() }
      });
      const dau = new Set(dauEvents.map(e => e.user_email)).size;

      return {
        uniqueUsersLastHour,
        eventsLastHour,
        totalUsers: allUsers.length,
        dau,
        dauPercentage: ((dau / allUsers.length) * 100).toFixed(1),
        activeOnboarding: activeOnboarding.length
      };
    },
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds
    staleTime: 0
  });

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Real-Time Analytics Dashboard</h1>
              <p className="text-blue-100">
                Live monitoring of platform usage and user behavior
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Live
              </Badge>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  autoRefresh
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      {realtimeStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-700">{realtimeStats.uniqueUsersLastHour}</div>
              <div className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                Active Last Hour
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-700">{realtimeStats.eventsLastHour}</div>
              <div className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                <Activity className="h-3 w-3" />
                Events Last Hour
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-700">{realtimeStats.dau}</div>
              <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                Daily Active Users
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-700">{realtimeStats.dauPercentage}%</div>
              <div className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Engagement Rate
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-rose-700">{realtimeStats.totalUsers}</div>
              <div className="text-sm text-rose-600 flex items-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                Total Users
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-teal-700">{realtimeStats.activeOnboarding}</div>
              <div className="text-sm text-teal-600 flex items-center gap-1 mt-1">
                <UserCheck className="h-3 w-3" />
                In Onboarding
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">
            <Activity className="h-4 w-4 mr-2" />
            Feature Usage
          </TabsTrigger>
          <TabsTrigger value="cohorts">
            <Users className="h-4 w-4 mr-2" />
            Cohort Analysis
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <UserCheck className="h-4 w-4 mr-2" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-6">
          <FeatureUsageDashboard />
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <CohortAnalysis />
        </TabsContent>

        <TabsContent value="onboarding" className="mt-6">
          <OnboardingAnalytics />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIFeatureAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}