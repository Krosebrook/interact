import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Loader2, MessageCircle, Clock, Copy, CheckCircle2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const TIMING_COLORS = {
  beginning: 'bg-green-100 text-green-700',
  middle: 'bg-blue-100 text-blue-700',
  end: 'bg-purple-100 text-purple-700',
  anytime: 'bg-slate-100 text-slate-700'
};

export default function AIDiscussionPrompts({ eventId, eventType }) {
  const [discussionTopic, setDiscussionTopic] = useState('');
  const [prompts, setPrompts] = useState(null);
  const [expandedPrompt, setExpandedPrompt] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateDiscussionPrompts', {
        event_id: eventId,
        event_type: eventType,
        discussion_topic: discussionTopic
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setPrompts(data.prompts);
        toast.success('Discussion prompts ready!');
      }
    },
    onError: () => toast.error('Failed to generate prompts')
  });

  const handleCopy = (prompt, index) => {
    const text = `${prompt.prompt}\n\nPurpose: ${prompt.purpose}\n\nFollow-ups:\n${prompt.follow_up_questions.join('\n')}\n\nFacilitator Tips: ${prompt.facilitator_tips}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          AI Discussion Prompts
        </CardTitle>
        <p className="text-sm text-slate-600">Get conversation starters for your event</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Discussion Topic (Optional)</Label>
          <Input
            value={discussionTopic}
            onChange={(e) => setDiscussionTopic(e.target.value)}
            placeholder="e.g., Q1 planning, Team collaboration, Innovation ideas..."
          />
        </div>

        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Discussion Prompts
            </>
          )}
        </Button>

        {/* Prompt Results */}
        <AnimatePresence>
          {prompts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mt-6"
            >
              {prompts.map((prompt, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card 
                    className="hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setExpandedPrompt(expandedPrompt === idx ? null : idx)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                            <h4 className="font-bold text-slate-900">{prompt.prompt}</h4>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={TIMING_COLORS[prompt.timing]}>
                              {prompt.timing}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {prompt.expected_duration_minutes} min
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {prompt.format}
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-600 mb-3">{prompt.purpose}</p>

                          <AnimatePresence>
                            {expandedPrompt === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 mt-3 pt-3 border-t"
                              >
                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                  <p className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    Follow-up Questions:
                                  </p>
                                  <ul className="space-y-1">
                                    {prompt.follow_up_questions.map((q, i) => (
                                      <li key={i} className="text-xs text-purple-800">• {q}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                  <p className="text-xs font-semibold text-blue-900 mb-1">Facilitator Tips:</p>
                                  <p className="text-xs text-blue-800">{prompt.facilitator_tips}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(prompt, idx);
                          }}
                          className="flex-shrink-0"
                        >
                          {copiedIndex === idx ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!prompts && !generateMutation.isPending && (
          <div className="text-center py-8 text-slate-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click generate to get AI-powered discussion prompts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}