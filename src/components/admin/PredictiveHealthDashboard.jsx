import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Activity, Calendar, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../common/LoadingSpinner';

export default function PredictiveHealthDashboard() {
  const [timeframe, setTimeframe] = useState('quarterly');

  const healthMutation = useMutation({
    mutationFn: async (tf) => {
      const result = await base44.functions.invoke('aiPredictiveHealthAnalysis', { timeframe: tf });
      return result.data || result;
    },
    onError: (error) => toast.error(error.message)
  });

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['predictive-health', timeframe],
    queryFn: () => healthMutation.mutateAsync(timeframe),
    enabled: false
  });

  const handleAnalyze = () => {
    healthMutation.mutate(timeframe);
  };

  return (
    <Card data-b44-sync="true" data-feature="admin" data-component="predictivehealthdashboard">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Predictive System Health
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
            <Button 
              onClick={handleAnalyze}
              disabled={healthMutation.isPending}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${healthMutation.isPending ? 'animate-spin' : ''}`} />
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {healthMutation.isPending && <LoadingSpinner message="Analyzing system health..." />}
        
        {healthData && (
          <div className="space-y-6">
            {/* Health Score */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">System Health Score</h4>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{healthData.health_score}/100</p>
                </div>
                <Badge className={`text-sm ${
                  healthData.health_score >= 80 ? 'bg-green-600' :
                  healthData.health_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {healthData.health_score >= 80 ? 'Healthy' :
                   healthData.health_score >= 60 ? 'At Risk' : 'Critical'}
                </Badge>
              </div>
            </div>

            {/* Trend Analysis */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{healthData.trend_analysis}</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-600">Avg Activity</div>
                    <div className="text-lg font-semibold">{healthData.current_metrics?.avg_weekly_activity}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-600">Recent Activity</div>
                    <div className="text-lg font-semibold">{healthData.current_metrics?.recent_weekly_activity}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-600">Trend</div>
                    <div className={`text-lg font-semibold capitalize ${
                      healthData.current_metrics?.trend === 'increasing' ? 'text-green-600' :
                      healthData.current_metrics?.trend === 'decreasing' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {healthData.current_metrics?.trend}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predicted Issues */}
            {healthData.predicted_issues && healthData.predicted_issues.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Predicted Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthData.predicted_issues.map((issue, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-slate-900">{issue.issue}</h5>
                        <Badge variant="outline" className="text-xs">
                          {issue.timeframe}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          issue.likelihood === 'high' ? 'bg-red-100 text-red-700' :
                          issue.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {issue.likelihood} likelihood
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          issue.impact === 'high' ? 'bg-red-100 text-red-700' :
                          issue.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {issue.impact} impact
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Troubleshooting Steps */}
            {healthData.troubleshooting_steps && healthData.troubleshooting_steps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Automated Troubleshooting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthData.troubleshooting_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-slate-900 text-sm">{step.step}</h5>
                        <p className="text-sm text-slate-600 mt-1">{step.action}</p>
                        <p className="text-xs text-blue-600 mt-1">Expected: {step.expected_outcome}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Proactive Recommendations */}
            {healthData.proactive_recommendations && healthData.proactive_recommendations.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-base">Proactive Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthData.proactive_recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-slate-900">{rec.title}</h5>
                        <Badge className={`text-xs ${
                          rec.urgency === 'high' ? 'bg-red-600' :
                          rec.urgency === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        }`}>
                          {rec.urgency} urgency
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                      <p className="text-xs text-green-700">Impact: {rec.estimated_impact}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}