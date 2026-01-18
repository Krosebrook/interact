import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function InterventionMetrics({ data }) {
  if (!data) return null;

  const typeEntries = Object.entries(data.by_type || {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Intervention Effectiveness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
          <div>
            <p className="text-xs text-slate-600 mb-1">Total Shown</p>
            <p className="text-2xl font-bold text-slate-900">{data.total_interventions_shown}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Acted On</p>
            <p className="text-2xl font-bold text-green-600">{data.total_acted_on}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Dismissed</p>
            <p className="text-2xl font-bold text-red-600">{data.total_dismissed}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 mb-3">By Intervention Type</p>
          <div className="space-y-3">
            {typeEntries.map(([type, stats]) => (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700 capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-purple-600">
                    {stats.conversion_rate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={stats.conversion_rate} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>{stats.acted_on}/{stats.shown} conversions</span>
                  <span>{stats.dismissed} dismissed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}