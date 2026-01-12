import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target,
  ChevronRight,
  Sparkles,
  RefreshCw,
  CheckCircle,
  X,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const INSIGHT_ICONS = {
  engagement_pattern: TrendingUp,
  activity_recommendation: Lightbulb,
  team_strategy: Users,
  facilitator_tip: Target,
  trend_alert: Zap
};

const INSIGHT_COLORS = {
  engagement_pattern: 'bg-blue-100 text-blue-700 border-blue-200',
  activity_recommendation: 'bg-amber-100 text-amber-700 border-amber-200',
  team_strategy: 'bg-purple-100 text-purple-700 border-purple-200',
  facilitator_tip: 'bg-green-100 text-green-700 border-green-200',
  trend_alert: 'bg-red-100 text-red-700 border-red-200'
};

export default function AIInsightsPanel({ events = [], participations = [], activities = [], userEmail }) {
  const queryClient = useQueryClient();
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => base44.entities.AIInsight.filter({ status: 'new' }),
    staleTime: 60000
  });

  const updateInsightMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AIInsight.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['ai-insights'])
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      
      // Prepare analytics data for AI
      const eventsArr = events || [];
      const participationsArr = participations || [];
      const activitiesArr = activities || [];
      const analyticsData = {
        totalEvents: eventsArr.length,
        completedEvents: eventsArr.filter(e => e.status === 'completed').length,
        totalParticipations: participationsArr.length,
        avgEngagement: participationsArr.length > 0 
          ? (participationsArr.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / participationsArr.length).toFixed(2)
          : 0,
        activityTypes: [...new Set(activitiesArr.map(a => a.type).filter(Boolean))],
        recentTrends: eventsArr.slice(0, 20).map(e => ({
          status: e.status,
          type: activitiesArr.find(a => a.id === e.activity_id)?.type
        }))
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this team engagement platform data and provide 3 actionable insights:

Data:
- Total Events: ${analyticsData.totalEvents}
- Completed Events: ${analyticsData.completedEvents}
- Total Participations: ${analyticsData.totalParticipations}
- Average Engagement Score: ${analyticsData.avgEngagement}/5
- Activity Types Used: ${analyticsData.activityTypes.join(', ')}

Provide insights in these categories:
1. engagement_pattern - patterns in team engagement
2. activity_recommendation - what activities to try next
3. team_strategy - strategies to improve participation

For each insight provide: title, summary, detailed explanation, and 2 specific recommendations with priority and expected impact.`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  insight_type: { type: "string" },
                  title: { type: "string" },
                  summary: { type: "string" },
                  details: { type: "string" },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        priority: { type: "string" },
                        expected_impact: { type: "string" }
                      }
                    }
                  },
                  confidence_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Save insights to database
      for (const insight of response.insights) {
        await base44.entities.AIInsight.create({
          ...insight,
          target_type: 'global',
          status: 'new',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      return response.insights;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-insights']);
      toast.success('New AI insights generated!');
      setGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate insights');
      setGenerating(false);
    }
  });

  const handleAction = (insight) => {
    updateInsightMutation.mutate({ id: insight.id, status: 'actioned' });
    toast.success('Insight marked as actioned');
  };

  const handleDismiss = (insight) => {
    updateInsightMutation.mutate({ id: insight.id, status: 'dismissed' });
  };

  return (
    <Card data-b44-sync="true" data-feature="ai" data-component="aiinsightspanel" className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-int-orange" />
          AI Insights
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generating}
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate Insights
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading insights...</div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No new insights available</p>
            <p className="text-sm text-slate-400 mt-1">Click "Generate Insights" to analyze your data</p>
          </div>
        ) : (
          insights.slice(0, 5).map(insight => {
            const Icon = INSIGHT_ICONS[insight.insight_type] || Lightbulb;
            const colorClass = INSIGHT_COLORS[insight.insight_type] || INSIGHT_COLORS.activity_recommendation;
            const isExpanded = expandedInsight === insight.id;

            return (
              <div 
                key={insight.id} 
                className={`border rounded-lg p-4 transition-all ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      {insight.confidence_score && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{insight.summary}</p>
                    
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-slate-700">{insight.details}</p>
                        
                        {insight.recommendations?.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase">Recommendations</h5>
                            {insight.recommendations.map((rec, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm bg-white p-2 rounded border">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    rec.priority === 'high' ? 'border-red-300 text-red-600' :
                                    rec.priority === 'medium' ? 'border-amber-300 text-amber-600' :
                                    'border-green-300 text-green-600'
                                  }`}
                                >
                                  {rec.priority}
                                </Badge>
                                <div>
                                  <p className="font-medium">{rec.action}</p>
                                  <p className="text-xs text-slate-500">{rec.expected_impact}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => handleAction(insight)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Take Action
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDismiss(insight)}>
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                  >
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}