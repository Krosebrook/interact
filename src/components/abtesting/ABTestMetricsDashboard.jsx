import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, TestTube, AlertTriangle } from 'lucide-react';

export default function ABTestMetricsDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['ab-test-metrics-dashboard'],
    queryFn: async () => {
      const tests = await base44.entities.ABTest.list('-created_date', 50);
      const assignments = await base44.entities.ABTestAssignment.list('-created_date', 500);
      
      const active = tests.filter(t => t.status === 'active');
      const completed = tests.filter(t => t.status === 'completed');
      
      const avgConversion = completed.length > 0
        ? completed.reduce((sum, t) => sum + (t.results_summary?.improvement_percentage || 0), 0) / completed.length
        : 0;

      return {
        active_tests: active.length,
        total_users_enrolled: assignments.length,
        avg_conversion_rate: avgConversion,
        total_anomalies: 0,
        test_performance: completed.slice(0, 5).map(t => ({
          name: t.test_name.substring(0, 20),
          conversion: t.results_summary?.improvement_percentage || 0
        })),
        assignment_trends: []
      };
    },
    refetchInterval: 30000
  });

  if (isLoading || !metrics) {
    return <div className="text-center py-8 text-slate-500">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TestTube className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-slate-600">Active Tests</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{metrics.active_tests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <p className="text-sm text-slate-600">Users Enrolled</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{metrics.total_users_enrolled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-slate-600">Avg Improvement</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{metrics.avg_conversion_rate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <p className="text-sm text-slate-600">Anomalies</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">{metrics.total_anomalies}</p>
          </CardContent>
        </Card>
      </div>

      {metrics.test_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.test_performance}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="conversion" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}