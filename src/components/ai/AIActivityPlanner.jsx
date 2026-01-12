import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, 
  Loader2, 
  Brain, 
  Users, 
  Target, 
  Clock, 
  CheckCircle,
  Lightbulb,
  Package,
  UserCheck,
  TrendingUp,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const OUTCOMES = [
  { value: 'team_building', label: 'Team Building', icon: '🤝', description: 'Strengthen team bonds and collaboration' },
  { value: 'skill_development', label: 'Skill Development', icon: '📚', description: 'Learn new skills or improve existing ones' },
  { value: 'innovation', label: 'Innovation & Creativity', icon: '💡', description: 'Spark creative thinking and new ideas' },
  { value: 'communication', label: 'Communication', icon: '💬', description: 'Improve team communication' },
  { value: 'problem_solving', label: 'Problem Solving', icon: '🧩', description: 'Enhance analytical thinking' },
  { value: 'stress_relief', label: 'Stress Relief', icon: '🧘', description: 'Reduce stress and boost morale' },
  { value: 'onboarding', label: 'Onboarding', icon: '👋', description: 'Welcome and integrate new team members' },
  { value: 'celebration', label: 'Celebration', icon: '🎉', description: 'Celebrate achievements and milestones' }
];

const CULTURE_TRAITS = [
  { value: 'fast_paced', label: 'Fast-Paced' },
  { value: 'collaborative', label: 'Collaborative' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'creative', label: 'Creative' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'casual', label: 'Casual & Fun' },
  { value: 'formal', label: 'Professional' },
  { value: 'remote_first', label: 'Remote-First' },
  { value: 'diverse', label: 'Diverse & Inclusive' }
];

export default function AIActivityPlanner({ open, onOpenChange, onActivityCreated }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  
  const [planInputs, setPlanInputs] = useState({
    desired_outcomes: [],
    team_size: 10,
    duration_preference: '15-30min',
    energy_level: 'medium',
    culture_traits: [],
    use_past_data: true,
    exclude_recent: true,
    special_requirements: '',
    suggested_facilitator: ''
  });

  // Fetch past participation data for AI context
  const { data: participations = [] } = useQuery({
    queryKey: ['all-participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 200),
    enabled: open && planInputs.use_past_data
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
    enabled: open
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: open && planInputs.use_past_data
  });

  const { data: users = [] } = useQuery({
    queryKey: ['facilitator-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: open
  });

  // Analyze past data for AI context
  const getParticipationInsights = () => {
    if (!planInputs.use_past_data || participations.length === 0) return null;

    const activityEngagement = {};
    participations.forEach(p => {
      if (!activityEngagement[p.event_id]) {
        activityEngagement[p.event_id] = { total: 0, engaged: 0, scores: [] };
      }
      activityEngagement[p.event_id].total++;
      if (p.attended) activityEngagement[p.event_id].engaged++;
      if (p.engagement_score) activityEngagement[p.event_id].scores.push(p.engagement_score);
    });

    // Get preference patterns from profiles
    const preferencePatterns = {};
    userProfiles.forEach(profile => {
      if (profile.activity_preferences?.preferred_types) {
        profile.activity_preferences.preferred_types.forEach(type => {
          preferencePatterns[type] = (preferencePatterns[type] || 0) + 1;
        });
      }
    });

    // Find top performing activity types
    const typePerformance = {};
    activities.forEach(activity => {
      if (!typePerformance[activity.type]) {
        typePerformance[activity.type] = { count: 0, avgEngagement: 0, scores: [] };
      }
      typePerformance[activity.type].count++;
    });

    return {
      totalParticipations: participations.length,
      preferredTypes: Object.entries(preferencePatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type),
      recentActivities: planInputs.exclude_recent 
        ? activities.slice(0, 10).map(a => a.title)
        : []
    };
  };

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const insights = getParticipationInsights();
      
      const prompt = `You are an expert organizational psychologist and team engagement specialist. Create a detailed, innovative activity plan based on:

REQUIREMENTS:
- Desired Outcomes: ${planInputs.desired_outcomes.join(', ')}
- Team Size: ${planInputs.team_size} people
- Duration: ${planInputs.duration_preference}
- Energy Level: ${planInputs.energy_level}
- Company Culture: ${planInputs.culture_traits.join(', ') || 'Not specified'}
- Special Requirements: ${planInputs.special_requirements || 'None'}
${planInputs.suggested_facilitator ? `- Preferred Facilitator: ${planInputs.suggested_facilitator}` : ''}

${insights ? `
HISTORICAL INSIGHTS (use to personalize):
- Team prefers these activity types: ${insights.preferredTypes.join(', ') || 'No clear preference'}
- Total past participations analyzed: ${insights.totalParticipations}
${insights.recentActivities.length > 0 ? `- Avoid these recently done activities: ${insights.recentActivities.join(', ')}` : ''}
` : ''}

Create a UNIQUE, engaging activity that:
1. Directly addresses the desired outcomes
2. Is appropriate for the team size and duration
3. Matches the energy level and culture
4. Has clear, actionable instructions
5. Includes specific facilitation guidance
6. Can be done virtually/remotely

Be creative - don't suggest generic activities. Think outside the box!`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Catchy, memorable activity title" },
            tagline: { type: "string", description: "One-line description that sells the activity" },
            description: { type: "string", description: "2-3 sentence overview" },
            objectives: { 
              type: "array", 
              items: { type: "string" },
              description: "3-5 specific learning/engagement objectives"
            },
            duration_breakdown: {
              type: "object",
              properties: {
                intro: { type: "number", description: "Minutes for introduction" },
                main_activity: { type: "number", description: "Minutes for main activity" },
                debrief: { type: "number", description: "Minutes for wrap-up/debrief" }
              }
            },
            step_by_step_instructions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  duration_minutes: { type: "number" },
                  facilitator_notes: { type: "string" }
                }
              }
            },
            materials_needed: {
              type: "array",
              items: { type: "string" }
            },
            facilitator_guide: {
              type: "object",
              properties: {
                preparation_checklist: { type: "array", items: { type: "string" } },
                tips_for_success: { type: "array", items: { type: "string" } },
                common_pitfalls: { type: "array", items: { type: "string" } },
                energy_boosters: { type: "array", items: { type: "string" } }
              }
            },
            expected_outcomes: {
              type: "array",
              items: { type: "string" }
            },
            adaptations: {
              type: "object",
              properties: {
                smaller_team: { type: "string" },
                larger_team: { type: "string" },
                shorter_time: { type: "string" },
                higher_energy: { type: "string" }
              }
            },
            suggested_follow_up: { type: "string" },
            activity_type: {
              type: "string",
              enum: ["icebreaker", "creative", "competitive", "wellness", "learning", "social"]
            },
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
      setGeneratedPlan(data);
      setStep(3);
    },
    onError: () => {
      toast.error('Failed to generate activity plan. Please try again.');
    }
  });

  const createActivityMutation = useMutation({
    mutationFn: async () => {
      const instructionsText = generatedPlan.step_by_step_instructions
        .map(step => `${step.step_number}. ${step.title}\n${step.description}\n(${step.duration_minutes} min) - Facilitator: ${step.facilitator_notes}`)
        .join('\n\n');

      const activity = await base44.entities.Activity.create({
        title: generatedPlan.title,
        description: generatedPlan.description,
        instructions: instructionsText,
        type: generatedPlan.activity_type,
        duration: planInputs.duration_preference,
        materials_needed: generatedPlan.materials_needed?.join(', ') || 'None',
        interaction_type: generatedPlan.interaction_type,
        is_template: false,
        popularity_score: 0,
        // Store extended data
        extended_data: {
          tagline: generatedPlan.tagline,
          objectives: generatedPlan.objectives,
          duration_breakdown: generatedPlan.duration_breakdown,
          facilitator_guide: generatedPlan.facilitator_guide,
          expected_outcomes: generatedPlan.expected_outcomes,
          adaptations: generatedPlan.adaptations,
          suggested_follow_up: generatedPlan.suggested_follow_up,
          generated_from: planInputs
        }
      });

      return activity;
    },
    onSuccess: (activity) => {
      queryClient.invalidateQueries(['activities']);
      toast.success('Activity plan added to library!');
      if (onActivityCreated) onActivityCreated(activity);
      handleClose();
    }
  });

  const handleClose = () => {
    setStep(1);
    setPlanInputs({
      desired_outcomes: [],
      team_size: 10,
      duration_preference: '15-30min',
      energy_level: 'medium',
      culture_traits: [],
      use_past_data: true,
      exclude_recent: true,
      special_requirements: '',
      suggested_facilitator: ''
    });
    setGeneratedPlan(null);
    onOpenChange(false);
  };

  const toggleOutcome = (outcome) => {
    setPlanInputs(prev => ({
      ...prev,
      desired_outcomes: prev.desired_outcomes.includes(outcome)
        ? prev.desired_outcomes.filter(o => o !== outcome)
        : [...prev.desired_outcomes, outcome]
    }));
  };

  const toggleCultureTrait = (trait) => {
    setPlanInputs(prev => ({
      ...prev,
      culture_traits: prev.culture_traits.includes(trait)
        ? prev.culture_traits.filter(t => t !== trait)
        : [...prev.culture_traits, trait]
    }));
  };

  return (
    <Dialog data-b44-sync="true" data-feature="ai" data-component="aiactivityplanner" open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Activity Planner
          </DialogTitle>
          <DialogDescription>
            Generate detailed, personalized activity plans based on your team's needs
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-purple-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Outcomes & Preferences */}
        {step === 1 && (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                What outcomes do you want to achieve?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {OUTCOMES.map(outcome => (
                  <button
                    key={outcome.value}
                    type="button"
                    onClick={() => toggleOutcome(outcome.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      planInputs.desired_outcomes.includes(outcome.value)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{outcome.icon}</span>
                    <span className="font-medium text-sm">{outcome.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Team Size
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[planInputs.team_size]}
                    onValueChange={([value]) => setPlanInputs(prev => ({ ...prev, team_size: value }))}
                    min={2}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium">{planInputs.team_size}</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Duration
                </Label>
                <Select
                  value={planInputs.duration_preference}
                  onValueChange={(value) => setPlanInputs(prev => ({ ...prev, duration_preference: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-15min">5-15 minutes (Quick)</SelectItem>
                    <SelectItem value="15-30min">15-30 minutes (Standard)</SelectItem>
                    <SelectItem value="30+min">30+ minutes (Extended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3">Energy Level</Label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map(level => (
                  <Button
                    key={level}
                    type="button"
                    variant={planInputs.energy_level === level ? 'default' : 'outline'}
                    onClick={() => setPlanInputs(prev => ({ ...prev, energy_level: level }))}
                    className="flex-1"
                  >
                    {level === 'low' && '😌 Low'}
                    {level === 'medium' && '😊 Medium'}
                    {level === 'high' && '🔥 High'}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={planInputs.desired_outcomes.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Context & Personalization */}
        {step === 2 && (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-semibold mb-3">Company Culture (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {CULTURE_TRAITS.map(trait => (
                  <Badge
                    key={trait.value}
                    variant={planInputs.culture_traits.includes(trait.value) ? 'default' : 'outline'}
                    className="cursor-pointer py-1.5 px-3"
                    onClick={() => toggleCultureTrait(trait.value)}
                  >
                    {trait.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Personalization
              </h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Use past participation data</p>
                  <p className="text-xs text-slate-500">AI will analyze team preferences from history</p>
                </div>
                <Switch
                  checked={planInputs.use_past_data}
                  onCheckedChange={(checked) => setPlanInputs(prev => ({ ...prev, use_past_data: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Exclude recent activities</p>
                  <p className="text-xs text-slate-500">Avoid suggesting activities done recently</p>
                </div>
                <Switch
                  checked={planInputs.exclude_recent}
                  onCheckedChange={(checked) => setPlanInputs(prev => ({ ...prev, exclude_recent: checked }))}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-600" />
                Suggested Facilitator (optional)
              </Label>
              <Select
                value={planInputs.suggested_facilitator}
                onValueChange={(value) => setPlanInputs(prev => ({ ...prev, suggested_facilitator: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a facilitator..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No preference</SelectItem>
                  {users.filter(u => u.role === 'admin').map(user => (
                    <SelectItem key={user.email} value={user.full_name}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3">Special Requirements or Context</Label>
              <Textarea
                placeholder="e.g., 'We have team members in multiple time zones', 'Some team members are introverted', 'We just finished a stressful project'"
                value={planInputs.special_requirements}
                onChange={(e) => setPlanInputs(prev => ({ ...prev, special_requirements: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => generatePlanMutation.mutate()}
                disabled={generatePlanMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {generatePlanMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Activity Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review Generated Plan */}
        {step === 3 && generatedPlan && (
          <div className="space-y-6 py-4">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2 bg-purple-600">{generatedPlan.activity_type}</Badge>
                    <CardTitle className="text-2xl">{generatedPlan.title}</CardTitle>
                    <p className="text-purple-700 italic mt-1">{generatedPlan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{planInputs.duration_preference}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">{generatedPlan.description}</p>

                <Tabs defaultValue="instructions" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="facilitator">Facilitator Guide</TabsTrigger>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="instructions" className="mt-4 space-y-3">
                    {generatedPlan.step_by_step_instructions?.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                          {step.step_number}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{step.title}</span>
                            <Badge variant="outline" className="text-xs">{step.duration_minutes} min</Badge>
                          </div>
                          <p className="text-sm text-slate-600">{step.description}</p>
                          {step.facilitator_notes && (
                            <p className="text-xs text-purple-600 mt-1 italic">
                              💡 {step.facilitator_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="facilitator" className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Preparation Checklist
                      </h4>
                      <ul className="space-y-1">
                        {generatedPlan.facilitator_guide?.preparation_checklist?.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        Tips for Success
                      </h4>
                      <ul className="space-y-1">
                        {generatedPlan.facilitator_guide?.tips_for_success?.map((tip, i) => (
                          <li key={i} className="text-sm text-slate-600">• {tip}</li>
                        ))}
                      </ul>
                    </div>

                    {generatedPlan.facilitator_guide?.energy_boosters?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">⚡ Energy Boosters</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedPlan.facilitator_guide.energy_boosters.map((booster, i) => (
                            <Badge key={i} variant="outline">{booster}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="materials" className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5 text-slate-500" />
                      <span className="font-semibold">Materials Needed</span>
                    </div>
                    {generatedPlan.materials_needed?.length > 0 ? (
                      <ul className="grid grid-cols-2 gap-2">
                        {generatedPlan.materials_needed.map((material, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm bg-white p-2 rounded">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500">No special materials needed!</p>
                    )}
                  </TabsContent>

                  <TabsContent value="outcomes" className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">🎯 Objectives</h4>
                      <ul className="space-y-1">
                        {generatedPlan.objectives?.map((obj, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-purple-500" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">✅ Expected Outcomes</h4>
                      <ul className="space-y-1">
                        {generatedPlan.expected_outcomes?.map((outcome, i) => (
                          <li key={i} className="text-sm text-slate-600">• {outcome}</li>
                        ))}
                      </ul>
                    </div>

                    {generatedPlan.suggested_follow_up && (
                      <div className="bg-white p-3 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4" />
                          Suggested Follow-up
                        </h4>
                        <p className="text-sm text-slate-600">{generatedPlan.suggested_follow_up}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedPlan(null);
                  generatePlanMutation.mutate();
                }}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={() => createActivityMutation.mutate()}
                disabled={createActivityMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {createActivityMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
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