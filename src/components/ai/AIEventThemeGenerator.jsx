import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, 
  Loader2, 
  Target, 
  Users, 
  Clock, 
  Lightbulb,
  Calendar,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Palette,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ThemeCustomizer from './ThemeCustomizer';

const DESIRED_OUTCOMES = [
  { value: 'team_building', label: 'Team Building', icon: '🤝' },
  { value: 'skill_development', label: 'Skill Development', icon: '📚' },
  { value: 'morale_boost', label: 'Morale Boost', icon: '🎉' },
  { value: 'ice_breaking', label: 'Ice Breaking', icon: '🧊' },
  { value: 'creativity', label: 'Foster Creativity', icon: '🎨' },
  { value: 'communication', label: 'Improve Communication', icon: '💬' },
  { value: 'wellness', label: 'Wellness & Relaxation', icon: '🧘' },
  { value: 'celebration', label: 'Celebration & Recognition', icon: '🏆' },
];

const TEAM_CONTEXTS = [
  { value: 'remote', label: 'Fully Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export default function AIEventThemeGenerator({ open, onOpenChange, onThemeGenerated }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    teamSize: 15,
    desiredOutcomes: [],
    duration: '30',
    teamContext: 'remote',
    teamDescription: '',
    additionalContext: '',
    energyLevel: 3
  });
  const [generatedThemes, setGeneratedThemes] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);

  const generateThemesMutation = useMutation({
    mutationFn: async (data) => {
      const prompt = `You are an expert team engagement strategist specializing in creating memorable, impactful event themes. Based on the following team profile and requirements, generate 3 complete event themes that would resonate deeply with this specific team.

TEAM PROFILE:
- Team Size: ${data.teamSize} people
- Work Setup: ${data.teamContext}
- Team Description: ${data.teamDescription || 'General corporate team'}
- Desired Outcomes: ${data.desiredOutcomes.join(', ')}
- Available Duration: ${data.duration} minutes
- Preferred Energy Level: ${data.energyLevel}/5 (1=calm/reflective, 5=high-energy/competitive)
- Additional Context: ${data.additionalContext || 'None provided'}

For each theme, create a COMPLETE event package including:
1. A creative, memorable theme name that captures the essence
2. A compelling tagline (8-12 words)
3. A detailed event description (2-3 paragraphs) that explains the concept and what participants will experience
4. The primary activity type that fits best
5. 3-4 specific activities or segments that make up the event
6. Expected outcomes and benefits
7. Materials or preparation needed
8. Facilitator tips for running this successfully
9. A suggested icebreaker to kick things off
10. Energy arc (how energy should flow through the event)

Make themes creative, specific to the team context, and actionable. Avoid generic suggestions - make each theme feel unique and tailored.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme_name: { type: "string" },
                  tagline: { type: "string" },
                  description: { type: "string" },
                  activity_type: {
                    type: "string",
                    enum: ["icebreaker", "creative", "competitive", "wellness", "learning", "social"]
                  },
                  segments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        duration_minutes: { type: "number" },
                        description: { type: "string" }
                      }
                    }
                  },
                  expected_outcomes: {
                    type: "array",
                    items: { type: "string" }
                  },
                  materials_needed: { type: "string" },
                  facilitator_tips: { type: "string" },
                  icebreaker_suggestion: { type: "string" },
                  energy_arc: { type: "string" },
                  estimated_engagement: { type: "number" },
                  best_for: { type: "string" }
                }
              }
            },
            personalized_insight: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedThemes(data);
      setStep(3);
    },
    onError: () => {
      toast.error('Failed to generate themes. Please try again.');
    }
  });

  const createActivityMutation = useMutation({
    mutationFn: async (theme) => {
      const activity = await base44.entities.Activity.create({
        title: theme.theme_name,
        description: theme.description,
        instructions: `${theme.facilitator_tips}\n\nIcebreaker: ${theme.icebreaker_suggestion}\n\nEnergy Flow: ${theme.energy_arc}`,
        type: theme.activity_type,
        duration: `${inputs.duration}min`,
        materials_needed: theme.materials_needed,
        is_template: false,
        interaction_type: 'discussion'
      });
      return { activity, theme };
    },
    onSuccess: ({ activity, theme }) => {
      queryClient.invalidateQueries(['activities']);
      toast.success(`"${theme.theme_name}" added to your activity library!`);
      if (onThemeGenerated) {
        onThemeGenerated(activity, theme);
      }
      handleClose();
    }
  });

  const handleOutcomeToggle = (outcome) => {
    setInputs(prev => ({
      ...prev,
      desiredOutcomes: prev.desiredOutcomes.includes(outcome)
        ? prev.desiredOutcomes.filter(o => o !== outcome)
        : [...prev.desiredOutcomes, outcome]
    }));
  };

  const handleGenerate = () => {
    if (inputs.desiredOutcomes.length === 0) {
      toast.error('Please select at least one desired outcome');
      return;
    }
    setStep(2);
    generateThemesMutation.mutate(inputs);
  };

  const handleSelectTheme = (theme) => {
    setSelectedTheme(theme);
    setStep(4);
  };

  const handleSaveCustomizedTheme = (customizedTheme) => {
    createActivityMutation.mutate(customizedTheme);
  };

  const handleClose = () => {
    setStep(1);
    setInputs({
      teamSize: 15,
      desiredOutcomes: [],
      duration: '30',
      teamContext: 'remote',
      teamDescription: '',
      additionalContext: '',
      energyLevel: 3
    });
    setGeneratedThemes(null);
    setSelectedTheme(null);
    onOpenChange(false);
  };

  const handleRegenerate = () => {
    setStep(2);
    generateThemesMutation.mutate(inputs);
  };

  return (
    <Dialog data-b44-sync="true" data-feature="ai" data-component="aieventthemegenerator" open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Palette className="h-6 w-6 text-purple-600" />
            AI Event Theme Generator
          </DialogTitle>
          <DialogDescription>
            Generate complete, tailored event themes based on your team's unique needs
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-8 h-1 mx-1 ${step > s ? 'bg-purple-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Input Form */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              {/* Team Size */}
              <div>
                <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Team Size: {inputs.teamSize} people
                </Label>
                <Slider
                  value={[inputs.teamSize]}
                  onValueChange={([val]) => setInputs(prev => ({ ...prev, teamSize: val }))}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5</span>
                  <span>50</span>
                  <span>100+</span>
                </div>
              </div>

              {/* Desired Outcomes */}
              <div>
                <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  What do you want to achieve? (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DESIRED_OUTCOMES.map((outcome) => (
                    <button
                      key={outcome.value}
                      onClick={() => handleOutcomeToggle(outcome.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        inputs.desiredOutcomes.includes(outcome.value)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl mb-1 block">{outcome.icon}</span>
                      <span className="text-sm font-medium">{outcome.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration and Context Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    Duration
                  </Label>
                  <Select
                    value={inputs.duration}
                    onValueChange={(val) => setInputs(prev => ({ ...prev, duration: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes (Quick)</SelectItem>
                      <SelectItem value="30">30 minutes (Standard)</SelectItem>
                      <SelectItem value="45">45 minutes (Extended)</SelectItem>
                      <SelectItem value="60">60 minutes (Full Session)</SelectItem>
                      <SelectItem value="90">90+ minutes (Deep Dive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Team Setup
                  </Label>
                  <Select
                    value={inputs.teamContext}
                    onValueChange={(val) => setInputs(prev => ({ ...prev, teamContext: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_CONTEXTS.map((ctx) => (
                        <SelectItem key={ctx.value} value={ctx.value}>
                          {ctx.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  Preferred Energy Level: {['Very Calm', 'Calm', 'Balanced', 'Energetic', 'High Energy'][inputs.energyLevel - 1]}
                </Label>
                <Slider
                  value={[inputs.energyLevel]}
                  onValueChange={([val]) => setInputs(prev => ({ ...prev, energyLevel: val }))}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>🧘 Reflective</span>
                  <span>⚖️ Balanced</span>
                  <span>🔥 High Energy</span>
                </div>
              </div>

              {/* Team Description */}
              <div>
                <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Describe your team (optional)
                </Label>
                <Textarea
                  placeholder="e.g., Marketing team, mix of junior and senior members, recently merged two departments..."
                  value={inputs.teamDescription}
                  onChange={(e) => setInputs(prev => ({ ...prev, teamDescription: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Additional Context */}
              <div>
                <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Any special context? (optional)
                </Label>
                <Textarea
                  placeholder="e.g., End of quarter celebration, new team members joining, after a difficult project..."
                  value={inputs.additionalContext}
                  onChange={(e) => setInputs(prev => ({ ...prev, additionalContext: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={inputs.desiredOutcomes.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 text-lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Event Themes
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Generating */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-25" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Crafting Your Perfect Event Themes...
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Our AI is analyzing your team profile and creating tailored, engaging event concepts just for you.
              </p>
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && generatedThemes && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              {/* Personalized Insight */}
              {generatedThemes.personalized_insight && (
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-900 mb-1">AI Insight</p>
                      <p className="text-sm text-purple-700">{generatedThemes.personalized_insight}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Theme Cards */}
              <div className="space-y-6">
                {generatedThemes.themes?.map((theme, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-white/20 text-white border-0">
                            {theme.activity_type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-5 rounded-full ${
                                  idx < theme.estimated_engagement ? 'bg-yellow-400' : 'bg-white/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{theme.theme_name}</h3>
                        <p className="text-purple-100 text-sm italic">"{theme.tagline}"</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">About This Theme</h4>
                          <p className="text-slate-700 text-sm whitespace-pre-line">{theme.description}</p>
                        </div>

                        {/* Event Segments */}
                        {theme.segments && theme.segments.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Event Flow</h4>
                            <div className="space-y-2">
                              {theme.segments.map((segment, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm">{segment.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {segment.duration_minutes} min
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">{segment.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expected Outcomes */}
                        {theme.expected_outcomes && theme.expected_outcomes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">What You'll Achieve</h4>
                            <div className="flex flex-wrap gap-2">
                              {theme.expected_outcomes.map((outcome, idx) => (
                                <Badge key={idx} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  ✓ {outcome}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Best For */}
                        {theme.best_for && (
                          <div className="text-sm">
                            <span className="font-semibold text-slate-900">Best for: </span>
                            <span className="text-slate-600">{theme.best_for}</span>
                          </div>
                        )}

                        <Button
                          onClick={() => handleSelectTheme(theme)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Customize & Use
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="flex-1"
                  disabled={generateThemesMutation.isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Themes
                </Button>
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="flex-1"
                >
                  Adjust Inputs
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Customize Theme */}
          {step === 4 && selectedTheme && (
            <ThemeCustomizer
              theme={selectedTheme}
              inputs={inputs}
              onSave={handleSaveCustomizedTheme}
              onBack={() => {
                setSelectedTheme(null);
                setStep(3);
              }}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}