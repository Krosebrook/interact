import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingDown, Users, Zap, Brain, Target } from 'lucide-react';
import StateDistributionChart from '../components/lifecycle/analytics/StateDistributionChart';
import ChurnTrendChart from '../components/lifecycle/analytics/ChurnTrendChart';
import InterventionMetrics from '../components/lifecycle/analytics/InterventionMetrics';
import ABTestSummary from '../components/lifecycle/analytics/ABTestSummary';
import CohortAnalysis from '../components/lifecycle/analytics/CohortAnalysis';
import PersonalizationDistribution from '../components/lifecycle/analytics/PersonalizationDistribution';
import ReportGenerator from '../components/lifecycle/analytics/ReportGenerator';

export default function LifecycleAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30');
  const [cohortType, setCohortType] = useState('signup_week');

  const { data: stateDistribution } = useQuery({
    queryKey: ['lifecycle-state-distribution'],
    queryFn: async () => {
      const response = await base44.functions.invoke('lifecycleAnalytics', {
        action: 'get_state_distribution'
      });
      return response.data;
    }
  });

  const { data: churnTrends } = useQuery({
    queryKey: ['lifecycle-churn-trends', timeRange],
    queryFn: async () => {
      const response = await base44.functions.invoke('lifecycleAnalytics', {
        action: 'get_churn_trends',
        days: parseInt(timeRange)
      });
      return response.data;
    }
  });

  const { data: interventionEffectiveness } = useQuery({
    queryKey: ['lifecycle-intervention-effectiveness'],
    queryFn: async () => {
      const response = await base44.functions.invoke('lifecycleAnalytics', {
        action: 'get_intervention_effectiveness'
      });
      return response.data;
    }
  });

  const { data: abtestSummary } = useQuery({
    queryKey: ['lifecycle-abtest-summary'],
    queryFn: async () => {
      const response = await base44.functions.invoke('lifecycleAnalytics', {
        action: 'get_abtest_summary'
      });
      return response.data;
    }
  });

  const { data: cohortAnalysis } = useQuery({
    queryKey: ['lifecycle-cohort-analysis', cohortType],
    queryFn: async () => {
      const response = await base44.functions.invoke('lifecycleAnalytics', {
        action: 'get_cohort_analysis',
        cohortType
      });
      return response.data;
    }
  });

  const { data: personalizationDist } = useQuery({
    queryKey: ['lifecycle-personalization-distribution'],
    queryFn: async () => {
      const response = await base44.functions.invoke('lifecycleAnalytics', {
        action: 'get_personalization_distribution'
      });
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Lifecycle Intelligence Analytics
          </h1>
          <p className="text-slate-600 mt-1">Comprehensive insights into user journey and engagement</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="60">Last 60 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stateDistribution?.total_users || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">At-Risk Users</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stateDistribution?.distribution?.at_risk || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stateDistribution?.percentages?.at_risk?.toFixed(1)}% of total
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Intervention CTR</p>
                <p className="text-3xl font-bold text-purple-600">
                  {interventionEffectiveness?.overall_conversion_rate?.toFixed(1) || 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active A/B Tests</p>
                <p className="text-3xl font-bold text-green-600">
                  {abtestSummary?.summary?.active_tests || 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State Distribution */}
      <StateDistributionChart data={stateDistribution} />

      {/* Churn Trends */}
      <ChurnTrendChart data={churnTrends} timeRange={timeRange} />

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Intervention Metrics */}
        <InterventionMetrics data={interventionEffectiveness} />

        {/* A/B Test Summary */}
        <ABTestSummary data={abtestSummary} />

        {/* Report Generator */}
        <ReportGenerator />
      </div>

      {/* Personalization Distribution */}
      <PersonalizationDistribution data={personalizationDist} />

      {/* Cohort Analysis */}
      <CohortAnalysis 
        data={cohortAnalysis} 
        cohortType={cohortType}
        onCohortTypeChange={setCohortType}
      />
    </div>
  );
}