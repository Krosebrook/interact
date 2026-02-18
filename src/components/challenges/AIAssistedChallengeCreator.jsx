import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  Users,
  Zap,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistedChallengeCreator({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1: Input, 2: AI Suggestions, 3: Customize
  const [challengeGoal, setChallengeGoal] = useState('');
  const [challengeType, setChallengeType] = useState('skill');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [formData, setFormData] = useState(null);

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateChallengeSuggestions', {
        challenge_goal: challengeGoal,
        challenge_type: challengeType
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setAiSuggestions(data.suggestions);
        
        // Pre-populate form with AI suggestions
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + data.suggestions.duration.days);
        
        setFormData({
          title: data.suggestions.recommended_title,
          description: data.suggestions.recommended_description,
          challenge_type: challengeType,
          difficulty: data.suggestions.difficulty,
          target_metric: {
            metric_name: data.suggestions.target_metric.metric_name,
            target_value: data.suggestions.target_metric.target_value,
            unit: data.suggestions.target_metric.unit
          },
          points_reward: data.suggestions.points_reward.amount,
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          requirements: data.suggestions.recommended_requirements || [],
          leaderboard_enabled: data.suggestions.leaderboard_config.enabled,
          leaderboard_type: data.suggestions.leaderboard_config.type,
          is_recurring: data.suggestions.recurring_recommendation.should_recur,
          recurrence_pattern: data.suggestions.recurring_recommendation.should_recur ? {
            frequency: data.suggestions.recurring_recommendation.frequency,
            interval: 1
          } : null,
          ai_generated: true,
          ai_suggestions: data.suggestions
        });
        
        setStep(2);
      } else {
        toast.error('Failed to generate suggestions');
      }
    },
    onError: () => {
      toast.error('Error generating AI suggestions');
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Challenge.create({
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      onOpenChange(false);
      resetWizard();
      toast.success('🎉 Challenge created with AI recommendations!');
    },
    onError: () => toast.error('Failed to create challenge')
  });

  const resetWizard = () => {
    setStep(1);
    setChallengeGoal('');
    setChallengeType('skill');
    setAiSuggestions(null);
    setFormData(null);
  };

  const handleGenerate = () => {
    if (!challengeGoal.trim()) {
      toast.error('Please describe your challenge goal');
      return;
    }
    generateSuggestionsMutation.mutate();
  };

  const handleAcceptSuggestions = () => {
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-int-orange to-purple-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            AI-Assisted Challenge Creator
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Input */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-slate-700">
                <Sparkles className="h-4 w-4 inline mr-1 text-purple-500" />
                Describe your challenge goal, and our AI will analyze past successful challenges to recommend 
                optimal parameters like duration, rewards, and target metrics.
              </p>
            </div>

            <div>
              <Label>What's your challenge goal?</Label>
              <Textarea
                value={challengeGoal}
                onChange={(e) => setChallengeGoal(e.target.value)}
                placeholder="e.g., Improve team collaboration skills, Increase wellness activities, Master new technical skills..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Challenge Type</Label>
              <Select value={challengeType} onValueChange={setChallengeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skill">Skill-Based</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="contribution">Contribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!challengeGoal.trim() || generateSuggestionsMutation.isPending}
              className="w-full bg-gradient-to-r from-int-orange to-purple-500 hover:opacity-90"
              size="lg"
            >
              {generateSuggestionsMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Past Challenges...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Step 2: AI Suggestions */}
        {step === 2 && aiSuggestions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-1">
                ✨ AI Recommendations Ready!
              </p>
              <p className="text-xs text-green-700">
                Based on analysis of {aiSuggestions.metadata?.based_on_challenges || 'past'} successful challenges
              </p>
            </div>

            {/* Title & Description */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-int-navy mb-2">{aiSuggestions.recommended_title}</h3>
                <p className="text-sm text-slate-600">{aiSuggestions.recommended_description}</p>
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4">
                  <Calendar className="h-5 w-5 text-int-orange mb-2" />
                  <div className="text-2xl font-bold text-int-navy">{aiSuggestions.duration.days} days</div>
                  <div className="text-xs text-slate-600">Duration</div>
                  <p className="text-xs text-slate-500 mt-1">{aiSuggestions.duration.reasoning}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Target className="h-5 w-5 text-purple-500 mb-2" />
                  <div className="text-2xl font-bold text-int-navy">
                    {aiSuggestions.target_metric.target_value} {aiSuggestions.target_metric.unit}
                  </div>
                  <div className="text-xs text-slate-600">Target</div>
                  <p className="text-xs text-slate-500 mt-1">{aiSuggestions.target_metric.reasoning}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Award className="h-5 w-5 text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold text-int-navy">{aiSuggestions.points_reward.amount}</div>
                  <div className="text-xs text-slate-600">Points Reward</div>
                  <p className="text-xs text-slate-500 mt-1">{aiSuggestions.points_reward.reasoning}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Users className="h-5 w-5 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-int-navy">{aiSuggestions.estimated_participation.percentage}%</div>
                  <div className="text-xs text-slate-600">Est. Participation</div>
                  <p className="text-xs text-slate-500 mt-1">~{aiSuggestions.estimated_participation.count} people</p>
                </CardContent>
              </Card>
            </div>

            {/* Success Factors */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Success Factors
                </h4>
                <ul className="space-y-1">
                  {aiSuggestions.success_factors.map((factor, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <Zap className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            {aiSuggestions.recommended_requirements?.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Recommended Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.recommended_requirements.map((req, idx) => (
                      <Badge key={idx} variant="secondary">{req}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-bold text-blue-900 mb-2">💡 Tips for Success</h4>
                <ul className="space-y-1">
                  {aiSuggestions.tips_for_success.map((tip, idx) => (
                    <li key={idx} className="text-sm text-blue-800">{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={resetWizard}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button variant="outline" onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button 
                onClick={handleAcceptSuggestions}
                className="bg-int-orange hover:bg-[#C46322]"
              >
                Accept & Customize
              </Button>
            </DialogFooter>
          </motion.div>
        )}

        {/* Step 3: Customize */}
        {step === 3 && formData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24))}
                    onChange={(e) => {
                      const days = parseInt(e.target.value);
                      const endDate = new Date(formData.start_date);
                      endDate.setDate(endDate.getDate() + days);
                      setFormData({...formData, end_date: endDate.toISOString().split('T')[0]});
                    }}
                    min="1"
                  />
                </div>

                <div>
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={formData.target_metric.target_value}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_metric: {...formData.target_metric, target_value: parseInt(e.target.value)}
                    })}
                  />
                </div>

                <div>
                  <Label>Points Reward</Label>
                  <Input
                    type="number"
                    value={formData.points_reward}
                    onChange={(e) => setFormData({...formData, points_reward: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="leaderboard"
                    checked={formData.leaderboard_enabled}
                    onCheckedChange={(checked) => setFormData({...formData, leaderboard_enabled: checked})}
                  />
                  <Label htmlFor="leaderboard" className="cursor-pointer">Enable Leaderboard</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({...formData, is_recurring: checked})}
                  />
                  <Label htmlFor="recurring" className="cursor-pointer">Recurring Challenge</Label>
                </div>
              </div>

              {formData.is_recurring && formData.recurrence_pattern && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Repeat Every</Label>
                    <Select 
                      value={formData.recurrence_pattern.frequency} 
                      onValueChange={(value) => setFormData({
                        ...formData,
                        recurrence_pattern: {...formData.recurrence_pattern, frequency: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back to Suggestions
                </Button>
                <Button 
                  type="submit" 
                  className="bg-int-orange hover:bg-[#C46322]"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Challenge'}
                </Button>
              </DialogFooter>
            </form>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}