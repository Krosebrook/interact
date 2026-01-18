import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function CohortAnalysis({ data, cohortType, onCohortTypeChange }) {
  if (!data?.cohorts) return null;

  const cohortEntries = Object.entries(data.cohorts)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Cohort Analysis
          </CardTitle>
          <Select value={cohortType} onValueChange={onCohortTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="signup_week">By Week</SelectItem>
              <SelectItem value="signup_month">By Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-semibold text-slate-700">Cohort</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">Total</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">Activation %</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">Engagement %</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">Churn %</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">Power Users</th>
              </tr>
            </thead>
            <tbody>
              {cohortEntries.map(([cohortKey, stats]) => (
                <tr key={cohortKey} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">{cohortKey}</td>
                  <td className="text-right py-3 px-3 text-slate-700">{stats.total}</td>
                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-green-600 font-semibold">
                        {stats.activation_rate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-purple-600 font-semibold">
                        {stats.engagement_rate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-red-600 font-semibold">
                        {stats.churn_rate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-3 text-slate-700">{stats.power_user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}