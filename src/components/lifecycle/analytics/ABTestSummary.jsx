import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ABTestSummary({ data }) {
  if (!data?.summary) return null;

  const { summary } = data;
  const stateEntries = Object.entries(summary.by_state || {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-green-600" />
          A/B Testing Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
          <div>
            <p className="text-xs text-slate-600 mb-1">Total Tests</p>
            <p className="text-2xl font-bold text-slate-900">{summary.total_tests}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{summary.active_tests}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-slate-600">{summary.completed_tests}</p>
          </div>
        </div>

        {summary.completed_tests > 0 && (
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Avg Improvement</p>
              <p className="text-xl font-bold text-purple-600">
                +{summary.avg_improvement.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Avg Confidence</p>
              <p className="text-xl font-bold text-blue-600">
                {summary.avg_confidence.toFixed(0)}%
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-slate-900 mb-3">Tests by Lifecycle State</p>
          <div className="space-y-2">
            {stateEntries.map(([state, stats]) => (
              <div key={state} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 capitalize">
                  {state.replace(/_/g, ' ')}
                </span>
                <div className="flex gap-2">
                  <Badge variant="outline">{stats.count} total</Badge>
                  {stats.active > 0 && (
                    <Badge className="bg-green-600 text-white">{stats.active} active</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}