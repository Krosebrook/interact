import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download,
  RefreshCw,
  Loader2,
  Lightbulb,
  ListChecks,
  Quote,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIEventSummarizer({ eventId, eventTitle }) {
  const [summary, setSummary] = useState(null);
  const [customNotes, setCustomNotes] = useState('');

  const { data: messages = [] } = useQuery({
    queryKey: ['event-messages', eventId],
    queryFn: () => base44.entities.EventMessage.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => base44.entities.Participation.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ id: eventId });
      return events[0];
    },
    enabled: !!eventId
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const questions = messages.filter(m => m.message_type === 'question');
      const announcements = messages.filter(m => m.message_type === 'announcement');
      const discussions = messages.filter(m => m.message_type === 'chat');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive real-time summary for the event "${eventTitle}".

Event Details:
- Participants: ${participations.length} registered, ${participations.filter(p => p.attended).length} attended
- Duration: ${event?.duration_minutes || 60} minutes
- Format: ${event?.event_format || 'online'}

Activity during the event:
- Questions asked: ${questions.length}
- Announcements made: ${announcements.length}
- Chat messages: ${discussions.length}

Questions asked:
${questions.slice(0, 20).map(q => `- "${q.message}" (${q.is_answered ? 'answered' : 'pending'})`).join('\n') || 'No questions'}

Announcements:
${announcements.slice(0, 10).map(a => `- "${a.message}"`).join('\n') || 'No announcements'}

${customNotes ? `Facilitator notes:\n${customNotes}` : ''}

Generate:
1. Executive summary (2-3 sentences)
2. Key takeaways (bullet points)
3. Main discussion themes
4. Notable quotes or insights from questions
5. Action items or follow-ups needed
6. Engagement highlights`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_takeaways: { 
              type: "array", 
              items: { type: "string" } 
            },
            discussion_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  details: { type: "string" }
                }
              }
            },
            notable_insights: {
              type: "array",
              items: { type: "string" }
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            engagement_stats: {
              type: "object",
              properties: {
                participation_rate: { type: "string" },
                engagement_level: { type: "string" },
                highlights: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setSummary(data);
      toast.success('Summary generated!');
    }
  });

  const copyToClipboard = () => {
    if (!summary) return;
    
    const text = `
# ${eventTitle} - Event Summary

## Executive Summary
${summary.executive_summary}

## Key Takeaways
${summary.key_takeaways?.map(t => `• ${t}`).join('\n')}

## Discussion Themes
${summary.discussion_themes?.map(t => `**${t.theme}**: ${t.details}`).join('\n\n')}

## Action Items
${summary.action_items?.map(a => `• [${a.priority.toUpperCase()}] ${a.item}`).join('\n')}

## Engagement
${summary.engagement_stats?.highlights?.map(h => `• ${h}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard!');
  };

  const downloadSummary = () => {
    if (!summary) return;
    
    const content = `${eventTitle} - Event Summary\n${'='.repeat(50)}\n\nExecutive Summary:\n${summary.executive_summary}\n\nKey Takeaways:\n${summary.key_takeaways?.map(t => `• ${t}`).join('\n')}\n\nDiscussion Themes:\n${summary.discussion_themes?.map(t => `${t.theme}: ${t.details}`).join('\n\n')}\n\nAction Items:\n${summary.action_items?.map(a => `[${a.priority.toUpperCase()}] ${a.item}`).join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, '_')}_summary.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="aieventsummarizer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            AI Event Summarizer
          </CardTitle>
          <div className="flex gap-2">
            {summary && (
              <>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSummary}>
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </>
            )}
            <Button
              onClick={() => generateSummaryMutation.mutate()}
              disabled={generateSummaryMutation.isLoading}
              size="sm"
            >
              {generateSummaryMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : summary ? (
                <RefreshCw className="h-4 w-4 mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {summary ? 'Regenerate' : 'Generate Summary'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optional notes input */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Add your notes (optional) - AI will incorporate these
          </label>
          <Textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Key points discussed, decisions made, topics covered..."
            rows={3}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xl font-bold">{participations.length}</p>
            <p className="text-xs text-slate-500">Registered</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-700">
              {participations.filter(p => p.attended).length}
            </p>
            <p className="text-xs text-green-600">Attended</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xl font-bold text-purple-700">
              {messages.filter(m => m.message_type === 'question').length}
            </p>
            <p className="text-xs text-purple-600">Questions</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xl font-bold text-blue-700">{messages.length}</p>
            <p className="text-xs text-blue-600">Messages</p>
          </div>
        </div>

        {/* Generated Summary */}
        {summary && (
          <div className="space-y-4">
            {/* Executive Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Executive Summary
              </h4>
              <p className="text-slate-700">{summary.executive_summary}</p>
            </div>

            {/* Key Takeaways */}
            {summary.key_takeaways?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Key Takeaways
                </h4>
                <ul className="space-y-1">
                  {summary.key_takeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-600 mt-1">•</span>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Discussion Themes */}
            {summary.discussion_themes?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                  <Quote className="h-4 w-4" /> Discussion Themes
                </h4>
                <div className="space-y-2">
                  {summary.discussion_themes.map((theme, i) => (
                    <div key={i} className="p-2 bg-white rounded border border-purple-200">
                      <p className="font-medium text-sm">{theme.theme}</p>
                      <p className="text-xs text-slate-600">{theme.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {summary.action_items?.length > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Action Items
                </h4>
                <div className="space-y-2">
                  {summary.action_items.map((action, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge className={
                        action.priority === 'high' ? 'bg-red-100 text-red-700' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {action.priority}
                      </Badge>
                      <span className="text-sm">{action.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement */}
            {summary.engagement_stats && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Engagement Highlights</h4>
                <div className="flex gap-4 mb-2">
                  <Badge variant="outline">{summary.engagement_stats.participation_rate}</Badge>
                  <Badge variant="outline">{summary.engagement_stats.engagement_level}</Badge>
                </div>
                {summary.engagement_stats.highlights?.map((h, i) => (
                  <p key={i} className="text-sm text-slate-600">• {h}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {!summary && !generateSummaryMutation.isLoading && (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>Click "Generate Summary" to create an AI-powered event summary</p>
            <p className="text-sm">Include your notes above for more accurate results</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}