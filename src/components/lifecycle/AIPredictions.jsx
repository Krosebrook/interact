import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target, AlertCircle } from 'lucide-react';

export default function AIPredictions() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['ai-test-predictions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('abTestAIAnalyzer', {
        action: 'predict_outcomes'
      });
      return response.data.predictions;
    },
    refetchInterval: 300000,
    initialData: []
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading predictions...</div>;
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          AI Outcome Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.map((pred) => (
          <div key={pred.test_id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-slate-900">{pred.test_name}</h4>
                {pred.prediction === 'insufficient_data' ? (
                  <p className="text-sm text-slate-500 mt-1">{pred.message}</p>
                ) : (
                  <p className="text-sm text-slate-600 mt-1">
                    Likely winner: <span className="font-medium">{pred.prediction.likely_winner}</span>
                  </p>
                )}
              </div>
              {pred.prediction !== 'insufficient_data' && (
                <Badge className={
                  pred.prediction.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                  pred.prediction.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {pred.prediction.risk_level} risk
                </Badge>
              )}
            </div>

            {pred.prediction !== 'insufficient_data' && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-slate-500">Confidence</p>
                    <p className="font-medium">{pred.prediction.confidence}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">To Significance</p>
                    <p className="font-medium">{pred.prediction.days_to_significance} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-slate-500">Current Users</p>
                    <p className="font-medium">
                      {Object.values(pred.current_data).reduce((sum, v) => sum + v.current_users, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}