import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Users, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ChurnPredictionPanel({ segmentId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['churn-prediction', segmentId],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictiveAnalytics', {
        action: 'predict_churn',
        segment_id: segmentId
      });
      return response.data;
    },
    staleTime: 300000
  });

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center text-slate-500">Loading predictions...</CardContent></Card>;
  }

  if (!data) return null;

  const { prediction, total_analyzed } = data;

  return (
    <div className="space-y-4">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Churn Risk Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Analyzed {total_analyzed} employees</span>
            <Badge className="bg-purple-100 text-purple-800">
              {prediction.confidence}% confidence
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">30 Days</p>
              <p className="text-2xl font-bold text-red-600">
                {prediction.churn_predictions.next_30_days}%
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">60 Days</p>
              <p className="text-2xl font-bold text-orange-600">
                {prediction.churn_predictions.next_60_days}%
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">90 Days</p>
              <p className="text-2xl font-bold text-yellow-600">
                {prediction.churn_predictions.next_90_days}%
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              High-Risk Segments
            </h4>
            <div className="space-y-2">
              {prediction.high_risk_segments.map((segment, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900">{segment.segment}</p>
                      <p className="text-sm text-slate-600">{segment.count} employees</p>
                    </div>
                    <Badge className={
                      segment.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                      segment.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {segment.risk_level}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {segment.characteristics.map((char, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Early Warning Indicators</h4>
            <ul className="space-y-1">
              {prediction.early_warning_indicators.map((indicator, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                  <TrendingDown className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-purple-600" />
            Intervention Priorities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {prediction.intervention_priorities.map((priority, idx) => (
            <div key={idx} className="border-l-4 border-purple-600 pl-4 py-2">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-slate-900">{priority.segment}</p>
                <Badge variant="outline">{priority.priority}</Badge>
              </div>
              <p className="text-sm text-slate-700 mb-1">{priority.action}</p>
              <p className="text-xs text-slate-600">Impact: {priority.expected_impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}