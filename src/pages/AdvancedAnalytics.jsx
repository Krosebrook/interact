/**
 * Advanced Analytics Dashboard
 * Predictive scoring, cohort analysis, trends, custom reports
 */

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Target, Download, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PredictiveEngagementScoring from '../components/analytics/PredictiveEngagementScoring';
import CohortAnalysis from '../components/analytics/CohortAnalysis';
import TrendAnalysis from '../components/analytics/TrendAnalysis';
import CustomReportBuilder from '../components/analytics/CustomReportBuilder';

export default function AdvancedAnalytics() {
  const { user } = useUserData(true, true); // Admin only
  const [activeTab, setActiveTab] = useState('predictive');
  const [filters, setFilters] = useState({ dateRange: '30d', department: 'all' });

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => fetchAdvancedAnalytics(filters),
    staleTime: 10 * 60 * 1000
  });

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Advanced Analytics</h1>
          <p className="text-slate-600 mt-1">Deep insights into user engagement patterns</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Engagement Score"
          value={analyticsData?.engagement_score?.toFixed(1) || 0}
          unit="%"
          icon={TrendingUp}
          change={+5.2}
        />
        <KpiCard
          title="Active Users (7d)"
          value={analyticsData?.active_users_7d || 0}
          unit="users"
          icon={Users}
          change={+12}
        />
        <KpiCard
          title="Avg. Points/User"
          value={analyticsData?.avg_points || 0}
          unit="pts"
          icon={Target}
          change={+8.1}
        />
        <KpiCard
          title="Participation Rate"
          value={analyticsData?.participation_rate?.toFixed(1) || 0}
          unit="%"
          icon={Users}
          change={-2.3}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex gap-4">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="ops">Operations</option>
          </select>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictive">Predictive Scoring</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="predictive">
          <PredictiveEngagementScoring data={analyticsData} />
        </TabsContent>

        <TabsContent value="cohorts">
          <CohortAnalysis filters={filters} />
        </TabsContent>

        <TabsContent value="trends">
          <TrendAnalysis data={analyticsData} />
        </TabsContent>

        <TabsContent value="reports">
          <CustomReportBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ title, value, unit, icon: Icon, change }) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-3xl font-bold mt-2">
              {value} <span className="text-sm text-slate-500">{unit}</span>
            </p>
            <p className={`text-xs mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}% from last period
            </p>
          </div>
          <Icon className="h-8 w-8 text-int-orange/20" />
        </div>
      </CardContent>
    </Card>
  );
}

async function fetchAdvancedAnalytics(filters) {
  try {
    const response = await base44.functions.invoke('advancedAnalytics', { filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return null;
  }
}