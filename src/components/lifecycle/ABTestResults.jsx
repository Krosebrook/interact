import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Award, BarChart3, RefreshCcw, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BayesianAnalysisPanel from './analytics/BayesianAnalysisPanel';
import MVTInteractionPanel from './analytics/MVTInteractionPanel';
import AnomalyDetectionPanel from './analytics/AnomalyDetectionPanel';

export default function ABTestResults({ testId }) {
  const [analysisMethod, setAnalysisMethod] = useState('bayesian');

  const { data: results, refetch, isLoading } = useQuery({
    queryKey: ['ab-test-results', testId, analysisMethod],
    queryFn: async () => {
      const response = await base44.functions.invoke('abTestEngine', {
        action: 'analyze_test_results',
        testId,
        method: analysisMethod
      });
      return response.data;
    },
    staleTime: 30000
  });

  if (isLoading) return <div className="text-center py-8">Analyzing results...</div>;
  if (!results) return null;

  const variantEntries = Object.entries(results.variant_results || {});

  const getConfidenceBadge = (level) => {
    if (level >= 95) return <Badge className="bg-green-600 text-white">95%+ Confidence</Badge>;
    if (level >= 90) return <Badge className="bg-blue-600 text-white">90%+ Confidence</Badge>;
    return <Badge variant="outline">Low Confidence</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Analysis Method Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={analysisMethod} onValueChange={setAnalysisMethod}>
          <TabsList>
            <TabsTrigger value="bayesian" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Bayesian
            </TabsTrigger>
            <TabsTrigger value="frequentist" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Frequentist
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Test Results Summary
            </span>
            <Badge className="bg-purple-100 text-purple-800">
              {analysisMethod === 'bayesian' ? 'Bayesian Analysis' : 'Frequentist Analysis'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{results.total_assignments}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Winning Variant</p>
              <p className="text-lg font-semibold text-green-600">
                {variantEntries.find(([id]) => id === results.winning_variant)?.[1]?.variant_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Confidence</p>
              {getConfidenceBadge(results.confidence_level)}
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Improvement</p>
              <p className="text-2xl font-bold text-purple-600">
                {results.improvement_percentage > 0 ? '+' : ''}
                {results.improvement_percentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Anomalies</p>
              <p className={`text-2xl font-bold ${results.anomalies?.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {results.anomalies?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics Panels */}
      <div className="grid grid-cols-1 gap-4">
        <BayesianAnalysisPanel 
          bayesianData={results.bayesian_analysis} 
          winningVariant={results.winning_variant}
        />
        
        {results.mvt_analysis && (
          <MVTInteractionPanel mvtData={results.mvt_analysis} />
        )}
        
        <AnomalyDetectionPanel anomalies={results.anomalies} />
      </div>

      {/* Variant Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variantEntries.map(([variantId, data]) => {
          const isWinner = variantId === results.winning_variant;
          return (
            <Card key={variantId} className={isWinner ? 'border-2 border-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {data.variant_name}
                  {isWinner && (
                    <Badge className="bg-green-600 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Assigned</p>
                    <p className="text-xl font-bold text-slate-900">{data.total_assigned}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Shown</p>
                    <p className="text-xl font-bold text-slate-900">{data.intervention_shown}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-slate-600">Clicked</p>
                    <p className="text-xl font-bold text-blue-600">{data.clicked}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-slate-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">{data.completed}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-slate-600">Conversion Rate</p>
                    <p className="text-sm font-bold text-purple-600">{data.conversion_rate.toFixed(1)}%</p>
                  </div>
                  <Progress value={data.conversion_rate} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-600">Churn Risk Δ</p>
                    <p className={`font-semibold ${data.avg_churn_risk_change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.avg_churn_risk_change > 0 ? '+' : ''}{data.avg_churn_risk_change.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Sessions Δ</p>
                    <p className={`font-semibold ${data.avg_sessions_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.avg_sessions_change > 0 ? '+' : ''}{data.avg_sessions_change.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">State Transitions</p>
                    <p className="font-semibold text-slate-900">{data.state_transitions}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Dismissed</p>
                    <p className="font-semibold text-slate-900">{data.dismissed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}