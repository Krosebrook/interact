import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Award, Target, Activity } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function EngagementScoreWidget() {
  const { data } = useQuery({
    queryKey: ['engagement-overview'],
    queryFn: async () => {
      const states = await base44.entities.LifecycleState.list('-updated_date', 100);
      const avgScore = states.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / states.length;
      return { score: Math.round(avgScore) };
    },
    initialData: { score: 0 }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Avg Engagement Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-purple-600" />
          <p className="text-3xl font-bold text-purple-600">{data.score}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LifecycleDistributionWidget() {
  const { data } = useQuery({
    queryKey: ['lifecycle-distribution'],
    queryFn: async () => {
      const states = await base44.entities.LifecycleState.list();
      const distribution = states.reduce((acc, s) => {
        acc[s.lifecycle_state] = (acc[s.lifecycle_state] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    },
    initialData: []
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Lifecycle Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChurnRiskWidget() {
  const { data } = useQuery({
    queryKey: ['churn-risk'],
    queryFn: async () => {
      const states = await base44.entities.LifecycleState.list();
      const highRisk = states.filter(s => s.churn_risk > 0.6).length;
      return { count: highRisk, percentage: ((highRisk / states.length) * 100).toFixed(1) };
    },
    initialData: { count: 0, percentage: 0 }
  });

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-sm text-red-900">High Churn Risk</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-3xl font-bold text-red-600">{data.count}</p>
            <p className="text-xs text-slate-600">{data.percentage}% of users</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecognitionStatsWidget() {
  const { data } = useQuery({
    queryKey: ['recognition-stats'],
    queryFn: async () => {
      const recognition = await base44.entities.Recognition.list('-created_date', 100);
      return { total: recognition.length };
    },
    initialData: { total: 0 }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recognition Given</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-blue-600" />
          <p className="text-3xl font-bold text-blue-600">{data.total}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveTestsWidget() {
  const { data } = useQuery({
    queryKey: ['active-tests'],
    queryFn: async () => {
      const tests = await base44.entities.ABTest.filter({ status: 'active' });
      return { count: tests.length };
    },
    initialData: { count: 0 }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Active A/B Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-green-600" />
          <p className="text-3xl font-bold text-green-600">{data.count}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EngagementTrendWidget() {
  const { data } = useQuery({
    queryKey: ['engagement-trend'],
    queryFn: async () => {
      const participations = await base44.entities.Participation.list('-created_date', 200);
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });
      
      const trendData = last30Days.map(date => ({
        date: date.slice(5),
        count: participations.filter(p => p.created_date?.startsWith(date)).length
      }));
      
      return trendData;
    },
    initialData: []
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">30-Day Engagement Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const AVAILABLE_WIDGETS = {
  engagement_score: { component: EngagementScoreWidget, title: 'Engagement Score', size: 1 },
  lifecycle_dist: { component: LifecycleDistributionWidget, title: 'Lifecycle Distribution', size: 1 },
  churn_risk: { component: ChurnRiskWidget, title: 'Churn Risk', size: 1 },
  recognition: { component: RecognitionStatsWidget, title: 'Recognition', size: 1 },
  active_tests: { component: ActiveTestsWidget, title: 'Active Tests', size: 1 },
  engagement_trend: { component: EngagementTrendWidget, title: 'Engagement Trend', size: 2 }
};