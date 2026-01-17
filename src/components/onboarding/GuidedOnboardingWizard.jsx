import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Zap, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const FLOW_TYPES = ['full_onboarding', 'quick_start'];

export default function GuidedOnboardingWizard({ onComplete }) {
  const [flowType, setFlowType] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});

  const { data: flow, isLoading: flowLoading } = useQuery({
    queryKey: ['onboarding-flow', flowType],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiOnboardingFlowEngine', {
        action: 'get_flow',
        flowType
      });
      return response.data;
    },
    enabled: !!flowType
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('aiOnboardingFlowEngine', {
        action: 'save_step',
        flowType,
        stepData: { stepIndex: currentStep, data }
      });
      return response.data;
    }
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiOnboardingFlowEngine', {
        action: 'complete_onboarding',
        flowType
      });
      return response.data;
    },
    onSuccess: () => onComplete?.()
  });

  const handleNextStep = async () => {
    await saveMutation.mutateAsync(stepData);
    if (currentStep < flow.flow.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeMutation.mutate();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // FLOW TYPE SELECTION
  if (!flowType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 flex items-center justify-center z-50"
      >
        <div className="max-w-2xl w-full mx-4 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">Welcome to INTeract</h1>
            <p className="text-slate-300">Let's get you set up to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FULL ONBOARDING */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setFlowType('full_onboarding')}
              className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Complete Setup</h3>
                  <p className="text-sm text-slate-600 mt-1">Best for new users</p>
                </div>
                <Badge className="bg-int-orange text-white">7 mins</Badge>
              </div>
              <p className="text-slate-600 mb-4">
                Personalize your experience with preferences, goals, and interests
              </p>
              <div className="flex items-center gap-2 text-int-orange font-medium">
                Get Started <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* QUICK START */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setFlowType('quick_start')}
              className="bg-gradient-to-br from-int-orange/20 to-int-navy/20 border-2 border-int-orange rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Quick Start</h3>
                  <p className="text-sm text-int-orange font-medium">⚡ Fastest path</p>
                </div>
                <Badge className="bg-int-navy text-white">2 mins</Badge>
              </div>
              <p className="text-slate-600 mb-4">
                Jump in now, complete setup later when relevant
              </p>
              <div className="flex items-center gap-2 text-int-navy font-medium">
                Skip to App <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // LOADING
  if (flowLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 flex items-center justify-center z-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-int-orange animate-spin mx-auto" />
          <p className="text-white">Loading setup...</p>
        </div>
      </div>
    );
  }

  const step = flow.flow[currentStep];
  const progress = ((currentStep + 1) / flow.flow.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 z-50 overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 py-12">
        {/* HEADER */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Step {currentStep + 1}</span>
            <span className="text-slate-400">of</span>
            <span>{flow.flow.length}</span>
          </div>
          <h1 className="text-3xl font-bold">{step.name}</h1>
          <p className="text-slate-600">{step.description}</p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 mt-2">~{step.estimatedTime} min</p>
        </div>

        {/* STEP CONTENT */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-6">
            <OnboardingStepContent 
              step={step} 
              stepData={stepData} 
              setStepData={setStepData}
            />
          </CardContent>
        </Card>

        {/* ACTIONS */}
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step.skippable && (
            <Button
              variant="ghost"
              onClick={() => handleNextStep()}
            >
              Skip
            </Button>
          )}

          <Button
            onClick={handleNextStep}
            disabled={saveMutation.isPending || completeMutation.isPending}
            className="bg-int-orange hover:bg-int-orange/90"
          >
            {currentStep === flow.flow.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// STEP CONTENT RENDERER
function OnboardingStepContent({ step, stepData, setStepData }) {
  const stepName = step.name.toLowerCase().replace(/\s+/g, '_');

  switch (stepName) {
    case 'welcome_&_role':
      return <RoleSelection stepData={stepData} setStepData={setStepData} />;
    case 'interest_areas':
      return <InterestSelection stepData={stepData} setStepData={setStepData} />;
    case 'engagement_style':
      return <EngagementStyle stepData={stepData} setStepData={setStepData} />;
    case 'communication_preferences':
      return <CommunicationPrefs stepData={stepData} setStepData={setStepData} />;
    case 'growth_goals':
      return <GrowthGoals stepData={stepData} setStepData={setStepData} />;
    case 'community_&_groups':
      return <CommunitySelection stepData={stepData} setStepData={setStepData} />;
    case 'review_&_confirm':
      return <ReviewStep stepData={stepData} />;
    case 'quick_setup':
      return <QuickSetup stepData={stepData} setStepData={setStepData} />;
    case 'you\'re_in!':
      return <SuccessScreen />;
    default:
      return <div>Step content</div>;
  }
}

// INDIVIDUAL STEP COMPONENTS
function RoleSelection({ stepData, setStepData }) {
  const roles = [
    { id: 'participant', label: 'Participant', desc: 'Attend events, engage' },
    { id: 'facilitator', label: 'Team Lead/Facilitator', desc: 'Organize & host' },
    { id: 'admin', label: 'HR/Admin', desc: 'Manage platform' }
  ];

  return (
    <div className="space-y-3">
      {roles.map(role => (
        <motion.div
          key={role.id}
          whileHover={{ scale: 1.02 }}
          onClick={() => setStepData({ ...stepData, role: role.id })}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            stepData.role === role.id
              ? 'border-int-orange bg-int-orange/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <h4 className="font-semibold">{role.label}</h4>
          <p className="text-sm text-slate-600">{role.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

function InterestSelection({ stepData, setStepData }) {
  const interests = [
    'Leadership', 'Technical Skills', 'Wellness', 'Networking',
    'Learning & Development', 'Company Culture', 'Innovation'
  ];

  const selected = stepData.interests || [];

  return (
    <div className="space-y-3">
      <p className="text-slate-600">Select all that apply</p>
      <div className="grid grid-cols-2 gap-2">
        {interests.map(interest => (
          <Button
            key={interest}
            variant={selected.includes(interest) ? 'default' : 'outline'}
            onClick={() => {
              const updated = selected.includes(interest)
                ? selected.filter(i => i !== interest)
                : [...selected, interest];
              setStepData({ ...stepData, interests: updated });
            }}
            className={selected.includes(interest) ? 'bg-int-orange' : ''}
          >
            {interest}
          </Button>
        ))}
      </div>
    </div>
  );
}

function EngagementStyle({ stepData, setStepData }) {
  const styles = [
    { id: 'learning', label: '📚 Learning', desc: 'Skill development & growth' },
    { id: 'networking', label: '🤝 Networking', desc: 'Connect with peers' },
    { id: 'competitive', label: '🏆 Competitive', desc: 'Leaderboards & challenges' },
    { id: 'wellness', label: '🧘 Wellness', desc: 'Balance & mindfulness' }
  ];

  return (
    <div className="space-y-3">
      {styles.map(style => (
        <motion.div
          key={style.id}
          whileHover={{ scale: 1.02 }}
          onClick={() => setStepData({ ...stepData, engagementStyle: style.id })}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            stepData.engagementStyle === style.id
              ? 'border-int-orange bg-int-orange/10'
              : 'border-slate-200'
          }`}
        >
          <h4 className="font-semibold">{style.label}</h4>
          <p className="text-sm text-slate-600">{style.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

function CommunicationPrefs({ stepData, setStepData }) {
  const channels = ['Email', 'Slack', 'Push Notifications', 'In-App Only'];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">How should we notify you?</p>
      {channels.map(channel => (
        <label key={channel} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={stepData.channels?.includes(channel) || false}
            onChange={(e) => {
              const updated = e.target.checked
                ? [...(stepData.channels || []), channel]
                : (stepData.channels || []).filter(c => c !== channel);
              setStepData({ ...stepData, channels: updated });
            }}
            className="w-4 h-4"
          />
          <span>{channel}</span>
        </label>
      ))}
    </div>
  );
}

function GrowthGoals({ stepData, setStepData }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">What's your main goal?</label>
        <select
          value={stepData.mainGoal || ''}
          onChange={(e) => setStepData({ ...stepData, mainGoal: e.target.value })}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Select...</option>
          <option value="skill_growth">Grow technical skills</option>
          <option value="leadership">Develop leadership</option>
          <option value="networking">Build network</option>
          <option value="wellness">Improve wellness</option>
          <option value="all">Well-rounded development</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Timeline</label>
        <select
          value={stepData.timeline || ''}
          onChange={(e) => setStepData({ ...stepData, timeline: e.target.value })}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Select...</option>
          <option value="3_months">Next 3 months</option>
          <option value="6_months">Next 6 months</option>
          <option value="1_year">Next year</option>
        </select>
      </div>
    </div>
  );
}

function CommunitySelection({ stepData, setStepData }) {
  const communities = ['Engineering', 'Product', 'Design', 'Sales', 'HR', 'Finance'];

  return (
    <div className="space-y-3">
      <p className="text-slate-600">Which teams interest you? (optional)</p>
      <div className="grid grid-cols-2 gap-2">
        {communities.map(community => (
          <Button
            key={community}
            variant={stepData.communities?.includes(community) ? 'default' : 'outline'}
            onClick={() => {
              const updated = stepData.communities?.includes(community)
                ? stepData.communities.filter(c => c !== community)
                : [...(stepData.communities || []), community];
              setStepData({ ...stepData, communities: updated });
            }}
            className={stepData.communities?.includes(community) ? 'bg-int-orange' : ''}
          >
            {community}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ stepData }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg space-y-3">
        <div>
          <p className="text-sm text-slate-600">Role</p>
          <p className="font-semibold capitalize">{stepData.role}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">Interests</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(stepData.interests || []).map(i => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600">Engagement Style</p>
          <p className="font-semibold capitalize">{stepData.engagementStyle}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">You can update these preferences anytime</p>
    </div>
  );
}

function QuickSetup({ stepData, setStepData }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600 mb-4">Just these essentials:</p>
      <div>
        <label className="block text-sm font-medium mb-2">Your Role</label>
        <select
          value={stepData.role || ''}
          onChange={(e) => setStepData({ ...stepData, role: e.target.value })}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Select...</option>
          <option value="participant">Participant</option>
          <option value="facilitator">Team Lead</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="text-center space-y-4 py-8">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold">You're All Set!</h2>
      <p className="text-slate-600">Let's get you engaging with the community</p>
    </div>
  );
}