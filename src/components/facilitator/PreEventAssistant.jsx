import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  MessageCircle, 
  Lightbulb, 
  AlertTriangle, 
  Trophy,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PreEventAssistant({ eventId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['facilitator-guide', eventId, 'pre_event'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateFacilitatorGuide', {
        eventId,
        guideType: 'pre_event'
      });
      return response.data.guide;
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="p-6 border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="preeventassistant">
        <div className="flex items-center gap-3 text-indigo-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>AI is preparing your facilitation guide...</span>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-indigo-900">AI Facilitator Assistant</h3>
          <Badge className="bg-indigo-600">Pre-Event Guide</Badge>
        </div>
        <p className="text-sm text-indigo-700">
          Your personalized preparation guide powered by AI
        </p>
      </Card>

      {/* Checklist */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <h4 className="font-bold text-lg">Pre-Event Checklist</h4>
        </div>
        <ul className="space-y-2">
          {data.checklist?.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
            >
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </motion.li>
          ))}
        </ul>
      </Card>

      {/* Icebreakers */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h4 className="font-bold text-lg">Icebreaker Questions</h4>
        </div>
        <div className="space-y-3">
          {data.icebreakers?.map((question, i) => (
            <div
              key={i}
              className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg"
            >
              <p className="text-blue-900 font-medium">"{question}"</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Discussion Prompts */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <h4 className="font-bold text-lg">Discussion Prompts</h4>
        </div>
        <div className="space-y-2">
          {data.discussion_prompts?.map((prompt, i) => (
            <div key={i} className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-yellow-900">{prompt}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Pitfalls */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <h4 className="font-bold text-lg">Common Pitfalls to Avoid</h4>
        </div>
        <ul className="space-y-2">
          {data.pitfalls?.map((pitfall, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">⚠️</span>
              <span className="text-slate-700">{pitfall}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Success Tips */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-purple-600" />
          <h4 className="font-bold text-lg">Success Tips</h4>
        </div>
        <div className="space-y-2">
          {data.success_tips?.map((tip, i) => (
            <div key={i} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-900">💡 {tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}