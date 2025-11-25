import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  Lightbulb, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  MessageSquare,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280'
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700'
};

export default function FeedbackAnalyzer({ events = [], participations = [] }) {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState('all');

  const { data: analyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ['feedback-analyses'],
    queryFn: () => base44.entities.FeedbackAnalysis.list('-created_date', 50)
  });

  // Get events with feedback
  const eventsWithFeedback = events.filter(event => {
    const eventParticipations = participations.filter(p => p.event_id === event.id && p.feedback);
    return eventParticipations.length > 0;
  });

  // Get feedback for selected event or all
  const relevantFeedback = selectedEventId === 'all'
    ? participations.filter(p => p.feedback)
    : participations.filter(p => p.event_id === selectedEventId && p.feedback);

  const analyzeFeedbackMutation = useMutation({
    mutationFn: async () => {
      const feedbackTexts = relevantFeedback.map(p => ({
        feedback: p.feedback,
        engagement_score: p.engagement_score,
        event_id: p.event_id
      }));

      if (feedbackTexts.length === 0) {
        throw new Error('No feedback to analyze');
      }

      const prompt = `You are an expert in analyzing user feedback and extracting actionable insights. Analyze the following event feedback:

FEEDBACK DATA:
${feedbackTexts.map((f, i) => `${i + 1}. "${f.feedback}" (Engagement: ${f.engagement_score || 'N/A'}/5)`).join('\n')}

Provide a comprehensive analysis including:
1. Sentiment classification for each piece of feedback
2. Recurring themes and patterns
3. Key keywords and their sentiment associations
4. Specific, actionable recommendations for improvement
5. Highlights to celebrate
6. Concerns to address

Be specific and practical in your recommendations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_breakdown: {
              type: "object",
              properties: {
                positive: { type: "number" },
                negative: { type: "number" },
                neutral: { type: "number" }
              }
            },
            themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  count: { type: "number" },
                  sentiment: { type: "string" },
                  sample_quotes: { type: "array", items: { type: "string" } }
                }
              }
            },
            keywords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  count: { type: "number" },
                  sentiment: { type: "string" }
                }
              }
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  category: { type: "string" },
                  based_on_feedback_count: { type: "number" }
                }
              }
            },
            highlights: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } },
            overall_sentiment_score: { type: "number" }
          }
        }
      });

      // Calculate percentages
      const total = (response.sentiment_breakdown?.positive || 0) + 
                    (response.sentiment_breakdown?.negative || 0) + 
                    (response.sentiment_breakdown?.neutral || 0);
      
      if (total > 0) {
        response.sentiment_breakdown.positive_percentage = Math.round((response.sentiment_breakdown.positive / total) * 100);
        response.sentiment_breakdown.negative_percentage = Math.round((response.sentiment_breakdown.negative / total) * 100);
        response.sentiment_breakdown.neutral_percentage = Math.round((response.sentiment_breakdown.neutral / total) * 100);
      }

      // Save analysis
      await base44.entities.FeedbackAnalysis.create({
        event_id: selectedEventId,
        analysis_date: new Date().toISOString(),
        total_feedback_count: relevantFeedback.length,
        ...response
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feedback-analyses']);
      toast.success('Feedback analysis complete!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to analyze feedback');
    }
  });

  // Get latest analysis for selected event
  const currentAnalysis = selectedEventId === 'all'
    ? analyses.find(a => a.event_id === 'all')
    : analyses.find(a => a.event_id === selectedEventId);

  const sentimentData = currentAnalysis?.sentiment_breakdown ? [
    { name: 'Positive', value: currentAnalysis.sentiment_breakdown.positive || 0, color: SENTIMENT_COLORS.positive },
    { name: 'Negative', value: currentAnalysis.sentiment_breakdown.negative || 0, color: SENTIMENT_COLORS.negative },
    { name: 'Neutral', value: currentAnalysis.sentiment_breakdown.neutral || 0, color: SENTIMENT_COLORS.neutral }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Feedback Analysis
          </h2>
          <p className="text-slate-600">Analyze feedback sentiment, themes, and get actionable insights</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select event..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {eventsWithFeedback.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title?.substring(0, 30)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => analyzeFeedbackMutation.mutate()}
            disabled={analyzeFeedbackMutation.isPending || relevantFeedback.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {analyzeFeedbackMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Analyze Feedback</>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-slate-500">Total Feedback</p>
              <p className="text-2xl font-bold">{relevantFeedback.length}</p>
            </div>
          </div>
        </Card>
        
        {currentAnalysis && (
          <>
            <Card className="p-4 border-0 shadow-lg bg-green-50">
              <div className="flex items-center gap-3">
                <ThumbsUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">Positive</p>
                  <p className="text-2xl font-bold text-green-700">
                    {currentAnalysis.sentiment_breakdown?.positive_percentage || 0}%
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-0 shadow-lg bg-red-50">
              <div className="flex items-center gap-3">
                <ThumbsDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-700">Negative</p>
                  <p className="text-2xl font-bold text-red-700">
                    {currentAnalysis.sentiment_breakdown?.negative_percentage || 0}%
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-0 shadow-lg">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-slate-500">Sentiment Score</p>
                  <p className="text-2xl font-bold">
                    {((currentAnalysis.overall_sentiment_score || 0) * 100).toFixed(0)}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {currentAnalysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {sentimentData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Themes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recurring Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentAnalysis.themes?.slice(0, 5).map((theme, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{theme.theme}</span>
                      <Badge className={
                        theme.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        theme.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {theme.sentiment}
                      </Badge>
                    </div>
                    <Progress value={(theme.count / relevantFeedback.length) * 100} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">{theme.count} mentions</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentAnalysis.action_items?.map((action, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{action.action}</p>
                      <Badge className={PRIORITY_COLORS[action.priority]}>
                        {action.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{action.category}</Badge>
                      <span className="text-xs text-slate-500">
                        Based on {action.based_on_feedback_count} feedback items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Highlights & Concerns */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Highlights & Concerns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-4 w-4" /> Highlights
                </h4>
                <ul className="space-y-1">
                  {currentAnalysis.highlights?.map((highlight, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" /> Concerns
                </h4>
                <ul className="space-y-1">
                  {currentAnalysis.concerns?.map((concern, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-red-500 mt-1">!</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentAnalysis.keywords?.map((kw, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className={`text-sm py-1.5 px-3 ${
                      kw.sentiment === 'positive' ? 'border-green-300 bg-green-50' :
                      kw.sentiment === 'negative' ? 'border-red-300 bg-red-50' :
                      'border-slate-300'
                    }`}
                  >
                    {kw.keyword} ({kw.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-lg">
          <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
          <p className="text-slate-500 mb-4">
            {relevantFeedback.length > 0
              ? `You have ${relevantFeedback.length} feedback items ready to analyze.`
              : 'Collect feedback from events to get AI-powered insights.'}
          </p>
          {relevantFeedback.length > 0 && (
            <Button
              onClick={() => analyzeFeedbackMutation.mutate()}
              disabled={analyzeFeedbackMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}