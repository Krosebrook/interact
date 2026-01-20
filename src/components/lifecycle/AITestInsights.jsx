import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

export default function AITestInsights({ testId }) {
  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['ai-test-analysis', testId],
    queryFn: async () => {
      const response = await base44.functions.invoke('abTestAIAnalyzer', {
        action: 'analyze_results',
        test_id: testId
      });
      return response.data;
    },
    enabled: !!testId,
    staleTime: 60000
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-slate-600">AI analyzing test results...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const { ai_analysis, variant_stats } = analysis;

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">AI Analysis</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Winner & Confidence */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-1">Winning Variant</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-purple-900">
                {variant_stats[ai_analysis.winner_variant_id]?.name || 'No clear winner'}
              </p>
              {ai_analysis.is_significant && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-1">Confidence Level</p>
            <p className="text-xl font-bold text-purple-900">{ai_analysis.confidence_level}%</p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-1">Improvement</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xl font-bold text-green-600">
                {ai_analysis.improvement_percentage?.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Statistical Significance */}
        <div className="flex items-center gap-2">
          <Badge className={ai_analysis.is_significant ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {ai_analysis.is_significant ? 'Statistically Significant' : 'Not Yet Significant'}
          </Badge>
          <Badge variant="outline">{ai_analysis.recommendation}</Badge>
        </div>

        {/* Reasoning */}
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <p className="text-sm font-medium text-slate-700 mb-2">Analysis</p>
          <p className="text-sm text-slate-600 leading-relaxed">{ai_analysis.reasoning}</p>
        </div>

        {/* Anomalies */}
        {ai_analysis.anomalies?.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <p className="text-sm font-medium text-orange-900">Anomalies Detected</p>
            </div>
            <ul className="space-y-1">
              {ai_analysis.anomalies.map((anomaly, idx) => (
                <li key={idx} className="text-sm text-orange-700">• {anomaly}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Variant Performance Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium text-slate-700">Variant</th>
                <th className="text-right p-3 font-medium text-slate-700">Users</th>
                <th className="text-right p-3 font-medium text-slate-700">Conversions</th>
                <th className="text-right p-3 font-medium text-slate-700">Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(variant_stats).map(([id, stats]) => (
                <tr key={id} className={id === ai_analysis.winner_variant_id ? 'bg-purple-50' : ''}>
                  <td className="p-3 font-medium">{stats.name}</td>
                  <td className="p-3 text-right">{stats.total}</td>
                  <td className="p-3 text-right">{stats.conversions}</td>
                  <td className="p-3 text-right font-medium text-purple-900">
                    {(stats.conversion_rate * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}