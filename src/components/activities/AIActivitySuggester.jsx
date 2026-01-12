import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, Target, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIActivitySuggester({ open, onOpenChange, onSelect }) {
  const [inputs, setInputs] = useState({
    goals: '',
    audience: '',
    constraints: ''
  });
  const [suggestions, setSuggestions] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const prompt = `You are an expert team engagement consultant. Based on these requirements, suggest 3 specific activity types that would be most effective:

Event Goals: ${data.goals}
Target Audience: ${data.audience}
Constraints/Context: ${data.constraints || 'None'}

For each suggestion, provide:
1. Activity type (icebreaker, creative, competitive, wellness, learning, or social)
2. Why it's a good fit (2-3 sentences)
3. Expected outcomes
4. Engagement level (1-5)

Be specific and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activity_type: {
                    type: "string",
                    enum: ["icebreaker", "creative", "competitive", "wellness", "learning", "social"]
                  },
                  title: { type: "string" },
                  reasoning: { type: "string" },
                  expected_outcomes: { type: "string" },
                  engagement_level: { type: "number" }
                }
              }
            },
            overall_recommendation: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setSuggestions(data);
    },
    onError: () => {
      toast.error('Failed to generate suggestions');
    }
  });

  const handleGenerate = () => {
    if (!inputs.goals || !inputs.audience) {
      toast.error('Please provide goals and target audience');
      return;
    }
    generateMutation.mutate(inputs);
  };

  const handleClose = () => {
    setInputs({ goals: '', audience: '', constraints: '' });
    setSuggestions(null);
    onOpenChange(false);
  };

  return (
    <Dialog data-b44-sync="true" data-feature="activities" data-component="aiactivitysuggester" open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Activity Suggester
          </DialogTitle>
          <DialogDescription>
            Get personalized activity recommendations based on your goals and audience
          </DialogDescription>
        </DialogHeader>

        {!suggestions ? (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                What are your event goals?
              </Label>
              <Textarea
                placeholder="e.g., Build stronger team connections, improve communication, boost morale after a tough quarter..."
                value={inputs.goals}
                onChange={(e) => setInputs(prev => ({ ...prev, goals: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Describe your target audience
              </Label>
              <Textarea
                placeholder="e.g., Remote engineering team of 30, mix of introverts and extroverts, diverse backgrounds..."
                value={inputs.audience}
                onChange={(e) => setInputs(prev => ({ ...prev, audience: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-600" />
                Any constraints or special context? (Optional)
              </Label>
              <Textarea
                placeholder="e.g., 30-minute time limit, virtual only, need something low-energy..."
                value={inputs.constraints}
                onChange={(e) => setInputs(prev => ({ ...prev, constraints: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 text-lg"
            >
              {generateMutation.isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-1">AI Recommendation:</p>
              <p className="text-sm text-purple-700">{suggestions.overall_recommendation}</p>
            </Card>

            <div className="space-y-4">
              {suggestions.suggestions?.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 border-2 border-slate-200 hover:border-indigo-300 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600">{suggestion.activity_type}</Badge>
                        <h3 className="font-bold text-lg">{suggestion.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-6 rounded-full ${
                              idx < suggestion.engagement_level ? 'bg-yellow-400' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Why This Works:</h4>
                        <p className="text-slate-700 text-sm">{suggestion.reasoning}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Expected Outcomes:</h4>
                        <p className="text-slate-700 text-sm">{suggestion.expected_outcomes}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => onSelect(suggestion.activity_type)}
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Browse {suggestion.activity_type} Activities
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => setSuggestions(null)}
              variant="outline"
              className="w-full"
            >
              Try Different Inputs
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}