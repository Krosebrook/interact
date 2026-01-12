import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, Wand2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityGenerator({ open, onOpenChange, onClose, onActivityCreated }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    team_mood: '',
    time_available: '15-30min',
    goals: [],
    additional_context: ''
  });
  const [generatedActivity, setGeneratedActivity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const goals = [
    { value: 'bonding', label: 'Team Bonding', emoji: '🤝' },
    { value: 'fun', label: 'Just for Fun', emoji: '🎉' },
    { value: 'learning', label: 'Skill Building', emoji: '📚' },
    { value: 'wellness', label: 'Wellness', emoji: '🧘' },
    { value: 'creativity', label: 'Creative Thinking', emoji: '🎨' },
    { value: 'competition', label: 'Friendly Competition', emoji: '🏆' }
  ];

  const toggleGoal = (goal) => {
    setInputs(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const generateMutation = useMutation({
    mutationFn: async (promptData) => {
      const prompt = `You are an expert team engagement facilitator. Generate a unique, engaging virtual team activity based on these requirements:

Team Mood: ${promptData.team_mood}
Time Available: ${promptData.time_available}
Goals: ${promptData.goals.join(', ')}
Additional Context: ${promptData.additional_context || 'None'}

Please create a complete activity with:
- Catchy, engaging title
- Brief description (2-3 sentences)
- Detailed step-by-step instructions
- Materials needed (if any)
- Tips for facilitation
- Expected outcomes

Make it practical for remote teams and achievable within the time limit.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            instructions: { type: "string" },
            materials_needed: { type: "string" },
            facilitation_tips: { type: "string" },
            expected_outcomes: { type: "string" },
            interaction_type: { 
              type: "string",
              enum: ["poll", "photo_upload", "text_submission", "quiz", "discussion"]
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedActivity(data);
      setStep(2);
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
      toast.error('Failed to generate activity. Please try again.');
    }
  });

  const createActivityMutation = useMutation({
    mutationFn: async (activityData) => {
      // Determine type based on goals
      let type = 'social';
      if (inputs.goals.includes('learning')) type = 'learning';
      else if (inputs.goals.includes('wellness')) type = 'wellness';
      else if (inputs.goals.includes('competition')) type = 'competitive';
      else if (inputs.goals.includes('creativity')) type = 'creative';
      else if (inputs.goals.includes('bonding')) type = 'icebreaker';

      const activity = await base44.entities.Activity.create({
        title: activityData.title,
        description: activityData.description,
        instructions: activityData.instructions,
        type,
        duration: inputs.time_available,
        materials_needed: activityData.materials_needed || 'None',
        interaction_type: activityData.interaction_type || 'text_submission',
        is_template: false,
        popularity_score: 0
      });

      // Save as AI recommendation
      await base44.entities.AIRecommendation.create({
        recommendation_type: 'ai_generated',
        activity_id: activity.id,
        reasoning: `AI-generated based on: ${inputs.team_mood}. Goals: ${inputs.goals.join(', ')}`,
        confidence_score: 0.85,
        status: 'accepted',
        context: {
          inputs: inputs,
          generated_data: activityData
        }
      });

      return activity;
    },
    onSuccess: (activity) => {
      queryClient.invalidateQueries(['activities']);
      queryClient.invalidateQueries(['ai-recommendations']);
      toast.success('Custom activity created! 🎉');
      if (onActivityCreated) onActivityCreated(activity);
      handleClose();
    }
  });

  const handleGenerate = () => {
    if (!inputs.team_mood || inputs.goals.length === 0) {
      toast.error('Please provide team mood and select at least one goal');
      return;
    }
    setIsGenerating(true);
    generateMutation.mutate(inputs);
  };

  const handleCreateActivity = () => {
    createActivityMutation.mutate(generatedActivity);
  };

  const handleClose = () => {
    setStep(1);
    setInputs({
      team_mood: '',
      time_available: '15-30min',
      goals: [],
      additional_context: ''
    });
    setGeneratedActivity(null);
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  return (
    <Dialog data-b44-sync="true" data-feature="ai" data-component="activitygenerator" open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Wand2 className="h-6 w-6 text-indigo-600" />
            AI Activity Generator
          </DialogTitle>
          <DialogDescription>
            Let AI create a custom activity tailored to your team's needs
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                What's the team mood right now?
              </Label>
              <Textarea
                placeholder="e.g., 'Team is tired from a busy sprint and needs something light and fun' or 'High energy, ready for a challenge'"
                value={inputs.team_mood}
                onChange={(e) => setInputs(prev => ({ ...prev, team_mood: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                How much time do you have?
              </Label>
              <Select
                value={inputs.time_available}
                onValueChange={(value) => setInputs(prev => ({ ...prev, time_available: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-15min">5-15 minutes</SelectItem>
                  <SelectItem value="15-30min">15-30 minutes</SelectItem>
                  <SelectItem value="30+min">30+ minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                What are your goals? (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {goals.map(goal => (
                  <Button
                    key={goal.value}
                    type="button"
                    variant={inputs.goals.includes(goal.value) ? 'default' : 'outline'}
                    onClick={() => toggleGoal(goal.value)}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <span className="text-sm">{goal.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                Any additional context? (Optional)
              </Label>
              <Textarea
                placeholder="e.g., 'Team loves trivia' or 'Avoid anything too physical' or 'We have a new team member'"
                value={inputs.additional_context}
                onChange={(e) => setInputs(prev => ({ ...prev, additional_context: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !inputs.team_mood || inputs.goals.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Activity
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {generatedActivity?.title}
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {inputs.time_available}
                    </Badge>
                    {inputs.goals.map(goal => (
                      <Badge key={goal} variant="outline">
                        {goals.find(g => g.value === goal)?.emoji} {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                  <p className="text-slate-700">{generatedActivity?.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Instructions</h4>
                  <p className="text-slate-700 whitespace-pre-wrap">{generatedActivity?.instructions}</p>
                </div>

                {generatedActivity?.materials_needed && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Materials Needed</h4>
                    <p className="text-slate-700">{generatedActivity.materials_needed}</p>
                  </div>
                )}

                {generatedActivity?.facilitation_tips && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">💡 Facilitation Tips</h4>
                    <p className="text-slate-700">{generatedActivity.facilitation_tips}</p>
                  </div>
                )}

                {generatedActivity?.expected_outcomes && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Expected Outcomes</h4>
                    <p className="text-slate-700">{generatedActivity.expected_outcomes}</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep(1);
                  setGeneratedActivity(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Generate Another
              </Button>
              <Button
                onClick={handleCreateActivity}
                disabled={createActivityMutation.isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {createActivityMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Add to Library
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}