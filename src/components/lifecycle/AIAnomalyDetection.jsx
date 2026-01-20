import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield } from 'lucide-react';

export default function AIAnomalyDetection() {
  const { data, isLoading } = useQuery({
    queryKey: ['ai-anomaly-detection'],
    queryFn: async () => {
      const response = await base44.functions.invoke('abTestAIAnalyzer', {
        action: 'detect_anomalies'
      });
      return response.data;
    },
    refetchInterval: 120000,
    initialData: { anomalies: [], checked_tests: 0 }
  });

  if (isLoading) return null;

  const { anomalies, checked_tests } = data;

  return (
    <Card className={anomalies.length > 0 ? 'border-orange-200' : 'border-green-200'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {anomalies.length > 0 ? (
            <>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Anomalies Detected</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 text-green-600" />
              <span>All Tests Healthy</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <p className="text-sm text-slate-600">
            All {checked_tests} active tests are running normally with no detected anomalies.
          </p>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div key={anomaly.test_id} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-orange-900">{anomaly.test_name}</h4>
                  <Badge className={
                    anomaly.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }>
                    {anomaly.severity} severity
                  </Badge>
                </div>
                <ul className="space-y-1 mb-3">
                  {anomaly.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-orange-700">• {issue}</li>
                  ))}
                </ul>
                <p className="text-sm text-orange-800">
                  <strong>Recommendation:</strong> {anomaly.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}