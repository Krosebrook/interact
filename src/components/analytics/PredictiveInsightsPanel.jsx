import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Lightbulb, Target, Shield } from 'lucide-react';

export default function PredictiveInsightsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['predictive-insights'],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictiveAnalytics', {
        action: 'generate_insights'
      });
      return response.data;
    },
    refetchInterval: 600000,
    staleTime: 300000
  });

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center text-slate-500">Generating insights...</CardContent></Card>;
  }

  if (!data) return null;

  const { insights } = data;

  return (
    <div className="space-y-4">
      {/* Critical Alerts */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-5 h-5" />
            Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.critical_alerts.map((alert, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-red-600">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                    <Badge className={
                      alert.severity === 'critical' ? 'bg-red-600 text-white' :
                      alert.severity === 'high' ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-white'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{alert.description}</p>
                  <p className="text-xs text-slate-600">Affected: {alert.affected_count} employees</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {alert.urgency}
                </Badge>
              </div>
              <div className="bg-blue-50 rounded p-3 mt-3">
                <p className="text-sm font-medium text-blue-900 mb-1">Recommended Action:</p>
                <p className="text-sm text-blue-700">{alert.recommended_action}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Lightbulb className="w-5 h-5" />
            Growth Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.opportunities.map((opp, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">{opp.title}</h4>
              <p className="text-sm text-slate-700 mb-3">{opp.description}</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-600">Potential Impact</p>
                  <p className="font-medium text-green-600">{opp.potential_impact}</p>
                </div>
                <div>
                  <p className="text-slate-600">Effort Required</p>
                  <p className="font-medium">{opp.effort_required}</p>
                </div>
                <div>
                  <p className="text-slate-600">Timeline</p>
                  <p className="font-medium">{opp.timeline}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.strategic_recommendations.map((rec, idx) => (
            <div key={idx} className="border-l-4 border-purple-600 pl-4 py-2">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                    <Badge className={
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-900 font-medium mb-1">{rec.recommendation}</p>
                  <p className="text-xs text-slate-600">Expected: {rec.expected_outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Mitigation */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Risk Mitigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.risk_mitigation.map((risk, idx) => (
            <div key={idx} className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-slate-900">{risk.risk}</p>
                <Badge className={
                  risk.likelihood === 'high' ? 'bg-red-100 text-red-800' :
                  risk.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {risk.likelihood} likelihood
                </Badge>
              </div>
              <p className="text-sm text-slate-700">{risk.mitigation_strategy}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}