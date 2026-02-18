import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Loader2, 
  Download, 
  CheckCircle2, 
  TrendingUp,
  MessageSquare,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIEventSummarizer({ eventId, eventTitle }) {
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [feedbackHighlights, setFeedbackHighlights] = useState('');
  const [summary, setSummary] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateEventSummary', {
        event_id: eventId,
        discussion_notes: discussionNotes,
        feedback_highlights: feedbackHighlights
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setSummary(data.summary);
        toast.success('Event summary generated!');
      }
    },
    onError: () => toast.error('Failed to generate summary')
  });

  const handleDownload = () => {
    if (!summary) return;

    const text = `
EVENT SUMMARY: ${eventTitle || 'Event'}
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
${summary.executive_summary}

KEY DISCUSSION POINTS
${summary.key_discussion_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

ACTION ITEMS
${summary.action_items.map((item, i) => `${i + 1}. ${item.action} (Owner: ${item.owner}, Priority: ${item.priority}, Due: ${item.due_date_suggestion})`).join('\n')}

PARTICIPANT INSIGHTS
- Engagement Level: ${summary.participant_insights.engagement_level}
- Sentiment: ${summary.participant_insights.sentiment}
- Notable Contributions: ${summary.participant_insights.notable_contributions.join(', ')}

RECOMMENDATIONS FOR NEXT TIME
${summary.recommendations_for_next_time.map((r, i) => `${i + 1}. ${r}`).join('\n')}

FOLLOW-UP ACTIVITIES
${summary.follow_up_activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}

METRICS
- Attendance Rate: ${summary.metrics.attendance_rate}
- Satisfaction Score: ${summary.metrics.satisfaction_score}
- Engagement Quality: ${summary.metrics.engagement_quality}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-summary-${eventId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          AI Event Summarizer
        </CardTitle>
        <p className="text-sm text-slate-600">Generate a comprehensive post-event summary</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Discussion Notes (Optional)</Label>
          <Textarea
            value={discussionNotes}
            onChange={(e) => setDiscussionNotes(e.target.value)}
            placeholder="Key points discussed, important quotes, team insights..."
            rows={4}
          />
        </div>

        <div>
          <Label>Feedback Highlights (Optional)</Label>
          <Textarea
            value={feedbackHighlights}
            onChange={(e) => setFeedbackHighlights(e.target.value)}
            placeholder="Notable participant feedback, common themes, suggestions..."
            rows={3}
          />
        </div>

        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Event Data...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Summary
            </>
          )}
        </Button>

        {/* Summary Results */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mt-6"
          >
            {/* Executive Summary */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
              <CardContent className="p-4">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Executive Summary
                </h4>
                <p className="text-sm text-green-800">{summary.executive_summary}</p>
              </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-int-navy">{summary.metrics.attendance_rate}</div>
                  <div className="text-xs text-slate-600">Attendance</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-int-navy">{summary.metrics.satisfaction_score}</div>
                  <div className="text-xs text-slate-600">Satisfaction</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-int-navy capitalize">{summary.metrics.engagement_quality}</div>
                  <div className="text-xs text-slate-600">Engagement</div>
                </CardContent>
              </Card>
            </div>

            {/* Key Discussion Points */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Key Discussion Points
                </h4>
                <ul className="space-y-2">
                  {summary.key_discussion_points.map((point, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="font-bold text-blue-600 flex-shrink-0">{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-int-orange" />
                  Action Items
                </h4>
                <div className="space-y-2">
                  {summary.action_items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">{item.action}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.owner}</Badge>
                            <Badge className={
                              item.priority === 'high' ? 'bg-red-500 text-white' :
                              item.priority === 'medium' ? 'bg-yellow-500 text-white' :
                              'bg-green-500 text-white'
                            }>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{item.due_date_suggestion}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommendations for Next Time
                </h4>
                <ul className="space-y-1">
                  {summary.recommendations_for_next_time.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Follow-up Activities */}
            {summary.follow_up_activities?.length > 0 && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Suggested Follow-ups
                  </h4>
                  <ul className="space-y-1">
                    {summary.follow_up_activities.map((activity, idx) => (
                      <li key={idx} className="text-sm text-purple-800">• {activity}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Summary
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}