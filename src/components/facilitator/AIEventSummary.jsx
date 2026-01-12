import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Lightbulb,
  Target,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Copy,
  Download,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const SentimentBadge = ({ sentiment }) => {
  const sentimentConfig = {
    positive: { color: 'bg-green-100 text-green-700', icon: ThumbsUp },
    negative: { color: 'bg-red-100 text-red-700', icon: ThumbsDown },
    neutral: { color: 'bg-slate-100 text-slate-700', icon: Target },
    mixed: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle }
  };
  
  const config = sentimentConfig[sentiment?.toLowerCase()] || sentimentConfig.neutral;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {sentiment}
    </Badge>
  );
};

const ActionItemCard = ({ item, index }) => (
  <motion.div
    data-b44-sync="true"
    data-feature="facilitator"
    data-component="aieventsummary"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-start gap-3 p-3 bg-white rounded-lg border shadow-sm"
  >
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
      item.priority === 'high' ? 'bg-red-100 text-red-700' :
      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
      'bg-green-100 text-green-700'
    }`}>
      {index + 1}
    </div>
    <div className="flex-1">
      <p className="font-medium text-slate-900">{item.task}</p>
      {item.assignee && (
        <p className="text-sm text-slate-500">Assigned to: {item.assignee}</p>
      )}
    </div>
    <Badge variant="outline" className="text-xs">
      {item.priority || 'normal'}
    </Badge>
  </motion.div>
);

export default function AIEventSummary({ event, onClose }) {
  const [summary, setSummary] = useState(null);

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('summarizeEvent', { 
        eventId: event.id 
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      toast.success('Event summary generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate summary: ' + error.message);
    }
  });

  const handleCopyToClipboard = () => {
    const text = `
Event Summary: ${event.title}
${summary.executive_summary}

Key Topics: ${summary.key_topics?.join(', ')}

Action Items:
${summary.action_items?.map((item, i) => `${i + 1}. ${item.task} (${item.priority})`).join('\n')}

Recommendations:
${summary.recommendations?.join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard!');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-summary-${event.id}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Summary exported!');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Event Summary
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!summary && !summarizeMutation.isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Generate AI Summary
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Analyze "{event.title}" to generate insights, action items, and recommendations.
              </p>
              <Button 
                onClick={() => summarizeMutation.mutate()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </div>
          )}

          {summarizeMutation.isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-slate-600">Analyzing event data...</p>
              <p className="text-sm text-slate-400 mt-2">This may take a few moments</p>
            </div>
          )}

          {summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>

              {/* Executive Summary */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-2">Executive Summary</h4>
                      <p className="text-slate-700 leading-relaxed">{summary.executive_summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{summary.metrics?.attendance_rate}</p>
                  <p className="text-xs text-slate-500">Attendance</p>
                </Card>
                <Card className="p-4 text-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{summary.metrics?.engagement_score}</p>
                  <p className="text-xs text-slate-500">Engagement</p>
                </Card>
                <Card className="p-4 text-center">
                  <MessageSquare className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{summary.metrics?.questions_count || 0}</p>
                  <p className="text-xs text-slate-500">Questions</p>
                </Card>
                <Card className="p-4 text-center">
                  <Target className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-lg font-bold">{summary.metrics?.participation_quality}</p>
                  <p className="text-xs text-slate-500">Quality</p>
                </Card>
              </div>

              {/* Tabs for Details */}
              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="recommendations">Tips</TabsTrigger>
                </TabsList>

                <TabsContent value="actions" className="space-y-3">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Action Items ({summary.action_items?.length || 0})
                  </h4>
                  {summary.action_items?.length > 0 ? (
                    <div className="space-y-2">
                      {summary.action_items.map((item, i) => (
                        <ActionItemCard key={i} item={item} index={i} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No action items identified</p>
                  )}

                  {summary.unanswered_questions?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        Unanswered Questions ({summary.unanswered_questions.length})
                      </h4>
                      <div className="space-y-2">
                        {summary.unanswered_questions.map((q, i) => (
                          <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-slate-700">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="topics" className="space-y-3">
                  <h4 className="font-medium text-slate-900">Key Topics Discussed</h4>
                  <div className="flex flex-wrap gap-2">
                    {summary.key_topics?.map((topic, i) => (
                      <Badge key={i} variant="outline" className="py-1.5 px-3">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {summary.key_decisions?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-slate-900 mb-3">Key Decisions Made</h4>
                      <div className="space-y-2">
                        {summary.key_decisions.map((decision, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            <p className="text-slate-700">{decision}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {summary.highlights?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-slate-900 mb-3">Highlights</h4>
                      <div className="space-y-2">
                        {summary.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                            <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                            <p className="text-slate-700">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sentiment" className="space-y-4">
                  <div className="grid gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Overall Sentiment</h4>
                        <SentimentBadge sentiment={summary.sentiment?.overall} />
                      </div>
                      <p className="text-sm text-slate-600">{summary.sentiment?.notable_feedback}</p>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Engagement Level</h4>
                        <Badge className="bg-blue-100 text-blue-700">
                          {summary.sentiment?.engagement_level}
                        </Badge>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-3">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    Recommendations for Future Events
                  </h4>
                  <div className="space-y-2">
                    {summary.recommendations?.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg"
                      >
                        <ChevronRight className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-slate-700">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Regenerate */}
              <div className="text-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => summarizeMutation.mutate()}
                  disabled={summarizeMutation.isLoading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Summary
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}