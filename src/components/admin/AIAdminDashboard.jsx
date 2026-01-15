/**
 * AI-Powered Admin Dashboard
 * Proactive insights for engagement, challenges, and interventions
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingDown,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Send,
  RefreshCw,
  BarChart3,
  Target
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function AIAdminDashboard() {
  const { user } = useUserData(true, true); // Admin only
  const [activeTab, setActiveTab] = useState('insights');
  const [nlQuery, setNlQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch engagement alerts
  const { data: nudges, isLoading: nudgesLoading, refetch: refetchNudges } = useQuery({
    queryKey: ['ai-nudges'],
    queryFn: () => base44.functions.invoke('generatePersonalizedNudges').then(r => r.data),
    staleTime: 10 * 60 * 1000
  });

  // Fetch challenge suggestions
  const { data: challenges, isLoading: challengesLoading, refetch: refetchChallenges } = useQuery({
    queryKey: ['ai-challenges'],
    queryFn: () =>
      base44.functions.invoke('generateChallengesSuggestions', { auto_schedule: false }).then(r => r.data),
    staleTime: 10 * 60 * 1000
  });

  // Auto-schedule challenges mutation
  const scheduleAllMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('generateChallengesSuggestions', {
        auto_schedule: true,
        team_id: 'all'
      });
    },
    onSuccess: () => {
      toast.success('All challenges scheduled!');
      refetchChallenges();
    }
  });

  // Generate custom report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (query) => {
      return base44.integrations.Core.InvokeLLM({
        prompt: `You are an analytics assistant. Generate a data report based on this query: "${query}". Return structured data with tables, insights, and charts.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            summary: { type: 'string' },
            insights: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });
    },
    onSuccess: (data) => {
      toast.success('Report generated!');
    }
  });

  const isLoading = nudgesLoading || challengesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy flex items-center gap-3">
            <Brain className="h-8 w-8 text-int-orange" />
            AI Admin Intelligence
          </h1>
          <p className="text-slate-600 mt-1">Proactive insights and automated engagement management</p>
        </div>
        <Button
          onClick={() => {
            refetchNudges();
            refetchChallenges();
          }}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-2xl">
            <TabsTrigger value="insights">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Engagement Alerts
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Zap className="h-4 w-4 mr-2" />
              Challenge Generator
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Custom Reports
            </TabsTrigger>
          </TabsList>

          {/* Engagement Alerts */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="border-2 border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  At-Risk Users Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-red-600">{nudges?.at_risk_count || 0}</p>
                    <p className="text-sm text-slate-600">Users with churn risk > 60%</p>
                  </div>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Email Team Leads
                  </Button>
                </div>

                {nudges?.nudges?.length > 0 && (
                  <div className="space-y-3">
                    {nudges.nudges.slice(0, 5).map((nudge, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-lg border border-red-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-bold text-slate-900">{nudge.user_name}</p>
                              <Badge variant="destructive" className="text-xs">
                                {Math.round(nudge.churn_risk_score * 100)}% risk
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{nudge.reason}</p>
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                              <p className="text-blue-900">
                                <strong>Suggested:</strong> {nudge.suggested_action}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {nudges.nudges.length > 5 && (
                      <p className="text-sm text-slate-600 text-center">
                        + {nudges.nudges.length - 5} more at-risk users
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  Declining Team Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Run team analytics to identify teams with declining engagement trends.
                </p>
                <Button className="mt-3" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Team Analytics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenge Generator */}
          <TabsContent value="challenges" className="space-y-4">
            <Card className="border-2 border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  AI-Generated Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-amber-600">
                      {challenges?.suggestions_count || 0}
                    </p>
                    <p className="text-sm text-slate-600">Challenges ready to schedule</p>
                  </div>
                  <Button
                    onClick={() => scheduleAllMutation.mutate()}
                    disabled={scheduleAllMutation.isPending}
                    className="gap-2 bg-amber-500 hover:bg-amber-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Schedule All
                  </Button>
                </div>

                {challenges?.suggestions?.length > 0 && (
                  <div className="space-y-3">
                    {challenges.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-lg border border-amber-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg mb-1">
                              {suggestion.name}
                            </h4>
                            <p className="text-sm text-slate-700 mb-2">{suggestion.description}</p>
                            <div className="flex gap-2 mb-2">
                              <Badge className="bg-amber-100 text-amber-800">
                                {suggestion.points} points
                              </Badge>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-xs">
                              <p className="text-slate-600">
                                <strong>Why:</strong> {suggestion.reasoning}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Schedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Challenges are generated weekly based on engagement patterns. Click "Schedule All" to
                auto-create all suggested challenges.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Custom Reports */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Natural Language Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 'Show top 5 performing teams by points this quarter'"
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && nlQuery.trim()) {
                        generateReportMutation.mutate(nlQuery);
                      }
                    }}
                  />
                  <Button
                    onClick={() => generateReportMutation.mutate(nlQuery)}
                    disabled={generateReportMutation.isPending || !nlQuery.trim()}
                    className="gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Generate
                  </Button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold text-slate-900">Example Queries:</p>
                  {[
                    'Show top 5 performing teams by points this quarter',
                    'Which users have declining engagement trends?',
                    'What activities drive the most retention?',
                    'Compare team engagement by department',
                    'Show churn risk distribution across organization'
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNlQuery(example)}
                      className="block w-full text-left text-slate-600 hover:text-int-orange hover:bg-white px-2 py-1 rounded transition-colors"
                    >
                      • {example}
                    </button>
                  ))}
                </div>

                {generateReportMutation.data && (
                  <Card className="border-2 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {generateReportMutation.data.title || 'Report Generated'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-700">
                        {generateReportMutation.data.summary}
                      </p>
                      
                      {generateReportMutation.data.insights?.length > 0 && (
                        <div>
                          <p className="font-semibold text-slate-900 mb-2">Key Insights:</p>
                          <ul className="space-y-1 text-sm">
                            {generateReportMutation.data.insights.map((insight, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {generateReportMutation.data.recommendations?.length > 0 && (
                        <div>
                          <p className="font-semibold text-slate-900 mb-2">Recommendations:</p>
                          <ul className="space-y-1 text-sm">
                            {generateReportMutation.data.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-int-orange mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={AlertTriangle}
          title="At-Risk Users"
          value={nudges?.at_risk_count || 0}
          subtitle="High churn probability"
          color="red"
        />
        <StatCard
          icon={Zap}
          title="Challenges Ready"
          value={challenges?.suggestions_count || 0}
          subtitle="AI-generated this week"
          color="amber"
        />
        <StatCard
          icon={Users}
          title="Active Nudges"
          value={nudges?.nudges?.filter(n => n.churn_risk_score > 0.7).length || 0}
          subtitle="Critical interventions"
          color="orange"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, color }) {
  const colorClasses = {
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className="text-4xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}