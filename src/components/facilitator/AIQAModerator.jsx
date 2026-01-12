import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIQAModerator({ eventId, eventTitle }) {
  const queryClient = useQueryClient();
  const [themes, setThemes] = useState([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ['event-messages', eventId],
    queryFn: () => base44.entities.EventMessage.filter({ event_id: eventId }),
    refetchInterval: 5000,
    enabled: !!eventId
  });

  const questions = messages.filter(m => m.message_type === 'question');

  const analyzeQuestionsMutation = useMutation({
    mutationFn: async () => {
      if (questions.length === 0) {
        return { themes: [], flagged: [] };
      }

      const questionTexts = questions.map(q => ({
        id: q.id,
        text: q.message,
        sender: q.sender_name
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these Q&A questions from an event called "${eventTitle}".

Questions:
${questionTexts.map((q, i) => `${i + 1}. [ID: ${q.id}] "${q.text}" - from ${q.sender}`).join('\n')}

Provide:
1. Common themes/topics being asked about (group similar questions)
2. Flag any potentially inappropriate, off-topic, or spam questions
3. Suggest which questions should be prioritized to answer

Be concise and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  question_count: { type: "number" },
                  sample_questions: { type: "array", items: { type: "string" } },
                  suggested_answer_points: { type: "array", items: { type: "string" } }
                }
              }
            },
            flagged_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_id: { type: "string" },
                  reason: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            },
            priority_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_id: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setThemes(data.themes || []);
      setFlaggedQuestions(data.flagged_questions || []);
      toast.success('Q&A analysis complete!');
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id) => base44.entities.EventMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-messages', eventId]);
      toast.success('Question removed');
    }
  });

  const markAnsweredMutation = useMutation({
    mutationFn: (id) => base44.entities.EventMessage.update(id, { is_answered: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-messages', eventId]);
    }
  });

  const getFlaggedQuestion = (id) => flaggedQuestions.find(f => f.question_id === id);

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="aiqamoderator">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Q&A Moderator
          </CardTitle>
          <Button
            onClick={() => analyzeQuestionsMutation.mutate()}
            disabled={analyzeQuestionsMutation.isLoading || questions.length === 0}
            size="sm"
          >
            {analyzeQuestionsMutation.isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Analyze Questions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">{questions.length}</p>
            <p className="text-xs text-purple-600">Total Questions</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">
              {questions.filter(q => q.is_answered).length}
            </p>
            <p className="text-xs text-green-600">Answered</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{flaggedQuestions.length}</p>
            <p className="text-xs text-red-600">Flagged</p>
          </div>
        </div>

        {/* Themes Summary */}
        {themes.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Common Themes ({themes.length})
            </h4>
            <div className="space-y-3">
              {themes.map((theme, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{theme.topic}</span>
                    <Badge variant="outline">{theme.question_count} questions</Badge>
                  </div>
                  {theme.suggested_answer_points?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">Suggested talking points:</p>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        {theme.suggested_answer_points.map((point, j) => (
                          <li key={j}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flagged Questions */}
        {flaggedQuestions.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Flagged Questions ({flaggedQuestions.length})
            </h4>
            <div className="space-y-2">
              {flaggedQuestions.map((flagged, i) => {
                const question = questions.find(q => q.id === flagged.question_id);
                if (!question) return null;
                return (
                  <div key={i} className="p-3 bg-white rounded-lg border border-red-200 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{question.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={
                          flagged.severity === 'high' ? 'bg-red-100 text-red-700' :
                          flagged.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {flagged.severity}
                        </Badge>
                        <span className="text-xs text-slate-500">{flagged.reason}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-600"
                        onClick={() => {
                          setFlaggedQuestions(prev => prev.filter(f => f.question_id !== flagged.question_id));
                        }}
                        title="Approve"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600"
                        onClick={() => deleteMessageMutation.mutate(question.id)}
                        title="Remove"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions List with AI badges */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            All Questions
          </h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {questions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No questions yet</p>
              ) : (
                questions.map(q => {
                  const flagged = getFlaggedQuestion(q.id);
                  return (
                    <div 
                      key={q.id}
                      className={`p-3 rounded-lg border ${
                        flagged ? 'bg-red-50 border-red-200' :
                        q.is_answered ? 'bg-green-50 border-green-200' :
                        'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">{q.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{q.sender_name}</span>
                            {q.is_answered && (
                              <Badge className="bg-green-100 text-green-700 text-xs">Answered</Badge>
                            )}
                            {flagged && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {flagged.severity}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!q.is_answered && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAnsweredMutation.mutate(q.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}