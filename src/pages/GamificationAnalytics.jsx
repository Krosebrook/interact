import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TierPerformanceChart from '@/components/analytics/TierPerformanceChart';
import RedemptionAnalytics from '@/components/analytics/RedemptionAnalytics';
import EngagementCorrelation from '@/components/analytics/EngagementCorrelation';
import { Trophy, TrendingUp, Gift, Users, BarChart3, Calendar } from 'lucide-react';

export default function GamificationAnalytics() {
  const { user, loading: userLoading } = useUserData(true, true);
  const [timeRange, setTimeRange] = useState('30d');

  const { data: allUserPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 1000),
  });

  const { data: allRedemptions, isLoading: redemptionsLoading } = useQuery({
    queryKey: ['all-redemptions-analytics'],
    queryFn: () => base44.entities.RewardRedemption.list('-created_date', 1000),
  });

  const { data: pointsLedger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['points-ledger', timeRange],
    queryFn: () => base44.entities.PointsLedger.list('-created_date', 5000),
  });

  const { data: allTiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['all-tiers'],
    queryFn: () => base44.entities.AchievementTier.filter({ is_active: true }, 'order'),
  });

  const { data: recognitions, isLoading: recognitionsLoading } = useQuery({
    queryKey: ['recognitions-analytics'],
    queryFn: () => base44.entities.Recognition.list('-created_date', 1000),
  });

  const isLoading = userLoading || pointsLoading || redemptionsLoading || ledgerLoading || tiersLoading || recognitionsLoading;

  if (isLoading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  // Calculate key metrics
  const totalUsers = allUserPoints?.length || 0;
  const totalPoints = allUserPoints?.reduce((sum, up) => sum + up.total_points, 0) || 0;
  const avgPointsPerUser = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
  const totalRedemptions = allRedemptions?.length || 0;
  const completedRedemptions = allRedemptions?.filter(r => r.status === 'fulfilled')?.length || 0;
  const redemptionRate = totalRedemptions > 0 ? Math.round((completedRedemptions / totalRedemptions) * 100) : 0;

  // Users by tier
  const usersByTier = {};
  allTiers?.forEach(tier => {
    usersByTier[tier.tier_name] = allUserPoints?.filter(up => up.current_tier_id === tier.id).length || 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gamification Analytics</h1>
        <p className="text-slate-600 mt-1">Advanced insights into engagement and rewards</p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Points Awarded</p>
                <p className="text-3xl font-bold text-slate-900">{totalPoints.toLocaleString()}</p>
              </div>
              <Trophy className="h-8 w-8 text-int-orange" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Points/User</p>
                <p className="text-3xl font-bold text-slate-900">{avgPointsPerUser}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Redemption Rate</p>
                <p className="text-3xl font-bold text-slate-900">{redemptionRate}%</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="tiers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tiers">
            <Trophy className="h-4 w-4 mr-2" />
            Tier Performance
          </TabsTrigger>
          <TabsTrigger value="redemptions">
            <Gift className="h-4 w-4 mr-2" />
            Redemption Analytics
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <BarChart3 className="h-4 w-4 mr-2" />
            Engagement Correlation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <TierPerformanceChart 
            usersByTier={usersByTier}
            allTiers={allTiers}
            allUserPoints={allUserPoints}
            pointsLedger={pointsLedger}
          />
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          <RedemptionAnalytics 
            redemptions={allRedemptions}
            userPoints={allUserPoints}
          />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <EngagementCorrelation 
            pointsLedger={pointsLedger}
            recognitions={recognitions}
            userPoints={allUserPoints}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}