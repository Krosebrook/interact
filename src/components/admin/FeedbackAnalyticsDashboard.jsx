import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

export default function FeedbackAnalyticsDashboard() {
  const [selectedSource, setSelectedSource] = useState(null);
  const queryClient = useQueryClient();

  const { data: feedbackAnalyses, isLoading } = useQuery({
    queryKey: ['feedbackAnalyses'],
    queryFn: () => base44.asServiceRole.entities.FeedbackAnalysis.list()
  });

  const { data: sources } = useQuery({
    queryKey: ['feedbackSources'],
    queryFn: async () => {
      const [events, resources, challenges] = await Promise.all([
        base44.asServiceRole.entities.Event.list(),
        base44.asServiceRole.entities.LearningResource.list(),
        base44.asServiceRole.entities.TeamChallenge.list()
      ]);
      return [
        ...events.map(e => ({ type: 'event', id: e.id, title: e.title })),
        ...resources.map(r => ({ type: 'learning_resource', id: r.id, title: r.title })),
        ...challenges.map(c => ({ type: 'challenge', id: c.id, title: c.challenge_name }))
      ];
    }
  });

  const analyzeFeedbackMutation = useMutation({
    mutationFn: async (sourceId) => {
      const source = sources?.find(s => s.id === sourceId);
      const response = await base44.functions.invoke('aiAdvancedFeedbackAnalysis', {
        feedback_source_type: source.type,
        feedback_source_id: sourceId
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedbackAnalyses'] })
  });

  const selectedAnalysis = selectedSource
    ? feedbackAnalyses?.find(fa => fa.feedback_source_id === selectedSource)
    : null;

  const sentimentData = selectedAnalysis ? [
    { name: 'Positive', value: selectedAnalysis.sentiment_summary?.positive_percentage || 0 },
    { name: 'Neutral', value: selectedAnalysis.sentiment_summary?.neutral_percentage || 0 },
    { name: 'Negative', value: selectedAnalysis.sentiment_summary?.negative_percentage || 0 }
  ] : [];

  const COLORS = ['#10b981', '#94a3b8', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback Analytics</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Feedback Analyzed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {feedbackAnalyses?.reduce((acc, fa) => acc + (fa.total_feedback_count || 0), 0) || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Effectiveness Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {feedbackAnalyses?.length > 0
                    ? (feedbackAnalyses.reduce((acc, fa) => acc + (fa.overall_effectiveness_score || 0), 0) / feedbackAnalyses.length).toFixed(1)
                    : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Highly Positive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {feedbackAnalyses?.filter(fa => (fa.sentiment_summary?.positive_percentage || 0) > 70).length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {feedbackAnalyses?.filter(fa => (fa.sentiment_summary?.negative_percentage || 0) > 30).length || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Events/Resources</CardTitle>
                  <CardDescription>Select to analyze</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {sources?.map(source => (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source.id)}
                      className={`w-full text-left p-2 rounded transition-colors text-sm ${
                        selectedSource === source.id
                          ? 'bg-int-orange text-white'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-medium truncate">{source.title}</p>
                      <p className="text-xs">{source.type}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {selectedAnalysis ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedAnalysis.feedback_source_title}</CardTitle>
                      <CardDescription>
                        {selectedAnalysis.total_feedback_count} feedback entries analyzed
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Sentiment Breakdown</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={sentimentData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Overall Score: {selectedAnalysis.overall_effectiveness_score}/100</h4>
                        <div className="w-full bg-slate-200 rounded h-2">
                          <div
                            className="bg-int-orange h-2 rounded transition-all"
                            style={{ width: `${selectedAnalysis.overall_effectiveness_score}%` }}
                          />
                        </div>
                      </div>

                      {selectedAnalysis.feedback_themes?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Key Themes</h4>
                          <div className="space-y-2">
                            {selectedAnalysis.feedback_themes.map((theme, idx) => (
                              <div key={idx} className="flex items-start justify-between p-2 bg-slate-50 rounded">
                                <div>
                                  <p className="font-medium text-sm">{theme.theme_name}</p>
                                  <p className="text-xs text-slate-600">Mentioned {theme.frequency} times</p>
                                </div>
                                <Badge className={
                                  theme.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                  theme.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {theme.sentiment}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAnalysis.improvement_suggestions?.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                          <h4 className="font-medium text-sm mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Improvement Suggestions
                          </h4>
                          <ul className="text-sm space-y-1">
                            {selectedAnalysis.improvement_suggestions.map((sugg, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">→</span>
                                {sugg}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-600 text-center">Select a source to view detailed feedback analysis</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Content Effectiveness Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={feedbackAnalyses || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feedback_source_title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="overall_effectiveness_score" fill="#d97230" name="Effectiveness Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}