import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SegmentPredictions({ segmentId, segmentName }) {
  const { data, isLoading } = useQuery({
    queryKey: ['segment-predictions', segmentId],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiSegmentationEngine', {
        action: 'predict_segment_metrics',
        segmentId
      });
      return response.data;
    },
    enabled: !!segmentId,
    staleTime: 300000 // 5 minutes
  });

  if (!segmentId) return null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-600 mt-2">Generating predictions...</p>
        </CardContent>
      </Card>
    );
  }

  const predictions = data?.predictions;
  if (!predictions) return null;

  const chartData = [
    { days: 0, size: 0 },
    { days: 7, size: predictions.predicted_size['7_days'] },
    { days: 14, size: predictions.predicted_size['14_days'] },
    { days: 30, size: predictions.predicted_size['30_days'] }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">30-Day Predictions</CardTitle>
          <Badge variant="outline" className="text-xs">
            {predictions.confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-900">Predicted Growth</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              +{predictions.predicted_growth['30_days']}
            </p>
            <p className="text-xs text-green-700 mt-1">
              7d: +{predictions.predicted_growth['7_days']} • 
              14d: +{predictions.predicted_growth['14_days']}
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-red-900">Predicted Churn</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              -{predictions.predicted_churn['30_days']}
            </p>
            <p className="text-xs text-red-700 mt-1">
              7d: -{predictions.predicted_churn['7_days']} • 
              14d: -{predictions.predicted_churn['14_days']}
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Size Projection</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="days" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="size" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Impact Factors */}
        {predictions.factors && predictions.factors.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Impact Factors</p>
            <div className="space-y-2">
              {predictions.factors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <div className={`mt-0.5 ${
                    factor.impact === 'positive' ? 'text-green-600' :
                    factor.impact === 'negative' ? 'text-red-600' :
                    'text-slate-400'
                  }`}>
                    {factor.impact === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                     factor.impact === 'negative' ? <TrendingDown className="w-3 h-3" /> :
                     <AlertCircle className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">{factor.factor}</p>
                    <p className="text-slate-600">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {predictions.recommendations && predictions.recommendations.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Recommendations</p>
            <ul className="space-y-1">
              {predictions.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}