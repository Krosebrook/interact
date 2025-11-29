import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, TrendingDown, TrendingUp, Users, Brain, 
  CheckCircle, XCircle, Eye, RefreshCw, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle },
  high: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: TrendingDown },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle },
  low: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Eye }
};

const ALERT_TYPE_ICONS = {
  score_drop: TrendingDown,
  score_spike: TrendingUp,
  low_participation: Users,
  negative_trend: TrendingDown,
  outlier_responses: AlertTriangle,
  sentiment_shift: Brain,
  team_discrepancy: Users,
  engagement_decline: TrendingDown
};

export default function SurveyAnomalyDetector({ surveyId, responses = [] }) {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['survey-alerts', surveyId],
    queryFn: () => base44.entities.SurveyAnomalyAlert.filter({ survey_id: surveyId }, '-created_date'),
    enabled: !!surveyId
  });

  // Run AI analysis
  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      
      // Prepare data for analysis
      const responseData = responses.map(r => ({
        answers: r.answers,
        sentiment: r.sentiment_scores?.overall,
        completion_time: r.completion_time_seconds
      }));

      // Call AI for anomaly detection
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these survey responses for anomalies and engagement issues. 
        
Survey responses: ${JSON.stringify(responseData)}

Identify any of the following:
1. Significant score drops compared to typical patterns
2. Unusually low participation
3. Negative sentiment trends
4. Outlier responses that differ significantly from the norm
5. Team discrepancies if applicable
6. Engagement decline patterns

For each issue found, provide:
- Type of anomaly
- Severity (critical, high, medium, low)
- Description
- Recommended actions`,
        response_json_schema: {
          type: 'object',
          properties: {
            anomalies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  affected_metric: { type: 'string' },
                  current_value: { type: 'number' },
                  expected_value: { type: 'number' },
                  recommended_actions: { 
                    type: 'array', 
                    items: { 
                      type: 'object',
                      properties: {
                        action: { type: 'string' },
                        priority: { type: 'string' }
                      }
                    } 
                  }
                }
              }
            },
            overall_health: { type: 'string' },
            summary: { type: 'string' }
          }
        }
      });

      // Create alerts for detected anomalies
      for (const anomaly of analysis.anomalies || []) {
        await base44.entities.SurveyAnomalyAlert.create({
          survey_id: surveyId,
          alert_type: anomaly.type || 'outlier_responses',
          severity: anomaly.severity,
          title: anomaly.title,
          description: anomaly.description,
          affected_metric: anomaly.affected_metric,
          current_value: anomaly.current_value,
          expected_value: anomaly.expected_value,
          ai_analysis: analysis.summary,
          recommended_actions: anomaly.recommended_actions || [],
          status: 'new'
        });
      }

      return analysis;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['survey-alerts', surveyId]);
      setIsAnalyzing(false);
      if (data.anomalies?.length > 0) {
        toast.warning(`Found ${data.anomalies.length} potential issues`);
      } else {
        toast.success('No anomalies detected - everything looks healthy!');
      }
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error('Failed to run analysis');
    }
  });

  // Update alert status
  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, status, notes }) => {
      await base44.entities.SurveyAnomalyAlert.update(alertId, {
        status,
        resolution_notes: notes,
        acknowledged_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['survey-alerts', surveyId]);
      setSelectedAlert(null);
      setResolutionNotes('');
      toast.success('Alert updated');
    }
  });

  const newAlerts = alerts.filter(a => a.status === 'new');
  const acknowledgedAlerts = alerts.filter(a => a.status !== 'new');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-int-orange" />
            AI Anomaly Detection
          </h3>
          <p className="text-sm text-slate-500">
            Proactively identify engagement issues
          </p>
        </div>
        <Button
          onClick={() => runAnalysisMutation.mutate()}
          disabled={isAnalyzing || responses.length < 5}
          className="bg-int-orange hover:bg-[#C46322]"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {responses.length < 5 && (
        <Card className="bg-slate-50">
          <CardContent className="py-4 text-center text-slate-500">
            <p>Need at least 5 responses to run anomaly detection</p>
            <p className="text-sm">Current: {responses.length} responses</p>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {newAlerts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Alerts ({newAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3">
                {newAlerts.map(alert => {
                  const SeverityIcon = SEVERITY_CONFIG[alert.severity]?.icon || AlertTriangle;
                  const TypeIcon = ALERT_TYPE_ICONS[alert.alert_type] || AlertTriangle;
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${SEVERITY_CONFIG[alert.severity]?.color}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <TypeIcon className="h-5 w-5 mt-0.5" />
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <p className="text-sm opacity-80 mt-1">{alert.description}</p>
                            {alert.deviation_percentage && (
                              <Badge variant="outline" className="mt-2">
                                {alert.deviation_percentage > 0 ? '+' : ''}{alert.deviation_percentage.toFixed(1)}% deviation
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge className="capitalize">{alert.severity}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* No Alerts State */}
      {alerts.length === 0 && !isLoading && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800">All Clear!</h3>
            <p className="text-green-600 text-sm">No anomalies detected in your survey data</p>
          </CardContent>
        </Card>
      )}

      {/* Past Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Past Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {acknowledgedAlerts.slice(0, 5).map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    {alert.status === 'resolved' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : alert.status === 'dismissed' ? (
                      <XCircle className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-500" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <Badge variant="outline" className="capitalize">{alert.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {selectedAlert?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <Badge className={SEVERITY_CONFIG[selectedAlert.severity]?.color}>
                  {selectedAlert.severity} severity
                </Badge>
              </div>

              <p className="text-slate-600">{selectedAlert.description}</p>

              {selectedAlert.ai_analysis && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                    <Brain className="h-4 w-4" />
                    AI Analysis
                  </div>
                  <p className="text-sm text-purple-600">{selectedAlert.ai_analysis}</p>
                </div>
              )}

              {selectedAlert.recommended_actions?.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Recommended Actions:</div>
                  <ul className="space-y-1">
                    {selectedAlert.recommended_actions.map((action, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {action.priority}
                        </Badge>
                        {action.action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about how this was addressed..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => updateAlertMutation.mutate({
                    alertId: selectedAlert.id,
                    status: 'dismissed',
                    notes: resolutionNotes
                  })}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Dismiss
                </Button>
                <Button
                  onClick={() => updateAlertMutation.mutate({
                    alertId: selectedAlert.id,
                    status: 'resolved',
                    notes: resolutionNotes
                  })}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}