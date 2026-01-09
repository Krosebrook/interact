import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function OnboardingAnalytics() {
  const { data: onboardingRecords } = useQuery({
    queryKey: ['onboarding-records-analytics'],
    queryFn: () => base44.entities.UserOnboarding.list('-start_date', 500)
  });

  const { data: onboardingEvents } = useQuery({
    queryKey: ['onboarding-events-analytics'],
    queryFn: () => base44.entities.AnalyticsEvent.filter({
      event_type: 'onboarding_step_completed'
    })
  });

  const analytics = useMemo(() => {
    if (!onboardingRecords || !onboardingEvents) return null;

    const total = onboardingRecords.length;
    const completed = onboardingRecords.filter(r => r.status === 'completed').length;
    const inProgress = onboardingRecords.filter(r => r.status === 'in_progress').length;
    const notStarted = onboardingRecords.filter(r => r.status === 'not_started').length;

    // Calculate average completion time
    const completedWithTime = onboardingRecords.filter(r => 
      r.status === 'completed' && r.start_date && r.completion_date
    );
    const avgCompletionDays = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, r) => {
          const days = (new Date(r.completion_date) - new Date(r.start_date)) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / completedWithTime.length
      : 0;

    // Identify drop-off points
    const stepCounts = {};
    onboardingEvents.forEach(event => {
      const stepName = event.event_data?.step_name || 'unknown';
      stepCounts[stepName] = (stepCounts[stepName] || 0) + 1;
    });

    const dropOffPoints = Object.entries(stepCounts)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([step, count]) => ({ step, count }));

    // Completion rate by role
    const byRole = {};
    onboardingRecords.forEach(r => {
      const role = r.role || 'unknown';
      if (!byRole[role]) {
        byRole[role] = { total: 0, completed: 0 };
      }
      byRole[role].total += 1;
      if (r.status === 'completed') byRole[role].completed += 1;
    });

    const roleCompletion = Object.entries(byRole).map(([role, data]) => ({
      role,
      completionRate: ((data.completed / data.total) * 100).toFixed(1),
      total: data.total
    }));

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: ((completed / total) * 100).toFixed(1),
      avgCompletionDays: avgCompletionDays.toFixed(1),
      dropOffPoints,
      roleCompletion
    };
  }, [onboardingRecords, onboardingEvents]);

  if (!analytics || analytics.total === 0) return null;

  const pieData = [
    { name: 'Completed', value: analytics.completed, color: '#10b981' },
    { name: 'In Progress', value: analytics.inProgress, color: '#f59e0b' },
    { name: 'Not Started', value: analytics.notStarted, color: '#94a3b8' }
  ];

  // Filter out empty pie slices
  const validPieData = pieData.filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-700">{analytics.completionRate}%</div>
                <div className="text-sm text-green-600">Completion Rate</div>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-700">{analytics.avgCompletionDays}</div>
                <div className="text-sm text-blue-600">Avg Days to Complete</div>
              </div>
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-700">{analytics.inProgress}</div>
                <div className="text-sm text-purple-600">In Progress</div>
              </div>
              <UserCheck className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-700">{analytics.dropOffPoints.length}</div>
                <div className="text-sm text-amber-600">Drop-off Points</div>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={validPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {validPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.roleCompletion.length > 0 ? analytics.roleCompletion.map(({ role, completionRate, total }) => (
              <div key={role}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium capitalize">{role}</span>
                  <span className="text-slate-600">{completionRate}% ({total} users)</span>
                </div>
                <Progress value={parseFloat(completionRate)} className="h-2" />
              </div>
            )) : <p className="text-sm text-slate-500">No role data available</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Top Drop-off Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.dropOffPoints.map((point, idx) => (
              <div key={point.step} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{idx + 1}</Badge>
                  <span className="font-medium text-slate-900">{point.step}</span>
                </div>
                <div className="text-sm text-slate-600">
                  {point.count} users abandoned here
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}