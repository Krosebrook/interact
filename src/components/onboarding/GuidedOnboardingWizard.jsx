import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const ONBOARDING_FLOWS = {
  participant: [
    {
      id: 'welcome',
      title: 'Welcome to INTeract! 👋',
      description: 'Let\'s get you started with the platform',
      content: 'INTeract helps you stay connected with your remote team through activities, recognition, and engagement.',
      action: null
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself',
      content: 'Add your bio, interests, and skills to help teammates get to know you better.',
      action: { type: 'navigate', path: 'UserProfile' }
    },
    {
      id: 'browse_events',
      title: 'Explore Upcoming Events',
      description: 'See what\'s happening',
      content: 'Check out team events, activities, and workshops. RSVP to your first event!',
      action: { type: 'navigate', path: 'ParticipantPortal' }
    },
    {
      id: 'join_channel',
      title: 'Join Team Channels',
      description: 'Connect with your team',
      content: 'Find your team\'s channel and say hello to your colleagues.',
      action: { type: 'navigate', path: 'Channels' }
    },
    {
      id: 'give_recognition',
      title: 'Give Your First Recognition',
      description: 'Appreciate a teammate',
      content: 'Recognize someone who helped you or inspired you. It feels great!',
      action: { type: 'navigate', path: 'Recognition' }
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🎉',
      description: 'Onboarding complete',
      content: 'You\'re ready to engage with your team. Keep exploring and earning points!',
      action: null
    }
  ],
  facilitator: [
    {
      id: 'welcome',
      title: 'Welcome, Facilitator! 🌟',
      description: 'Let\'s set up your facilitation toolkit',
      content: 'As a facilitator, you\'ll create and lead engaging activities for your team.',
      action: null
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Set up your facilitator profile',
      content: 'Add your expertise and interests to help participants connect with you.',
      action: { type: 'navigate', path: 'UserProfile' }
    },
    {
      id: 'explore_activities',
      title: 'Browse Activity Library',
      description: 'Discover activity templates',
      content: 'Explore 15+ pre-built activities you can use for events.',
      action: { type: 'navigate', path: 'Activities' }
    },
    {
      id: 'create_event',
      title: 'Schedule Your First Event',
      description: 'Create an event',
      content: 'Pick an activity and schedule your first team event.',
      action: { type: 'navigate', path: 'Calendar' }
    },
    {
      id: 'team_setup',
      title: 'Set Up Your Team',
      description: 'Organize your team',
      content: 'Create or join your team to start tracking engagement.',
      action: { type: 'navigate', path: 'Teams' }
    },
    {
      id: 'complete',
      title: 'Ready to Facilitate! 🚀',
      description: 'Onboarding complete',
      content: 'You\'re equipped to create engaging experiences for your team!',
      action: null
    }
  ],
  admin: [
    {
      id: 'welcome',
      title: 'Welcome, Admin! 🛡️',
      description: 'Let\'s configure your platform',
      content: 'You have full control to customize INTeract for your organization.',
      action: null
    },
    {
      id: 'invite_users',
      title: 'Invite Team Members',
      description: 'Build your team',
      content: 'Invite employees to join the platform and assign roles.',
      action: { type: 'navigate', path: 'Settings' }
    },
    {
      id: 'setup_gamification',
      title: 'Configure Gamification',
      description: 'Set up points and badges',
      content: 'Customize points, badges, and rewards to match your culture.',
      action: { type: 'navigate', path: 'GamificationSettings' }
    },
    {
      id: 'create_activities',
      title: 'Create Custom Activities',
      description: 'Build your activity library',
      content: 'Add company-specific activities beyond the default templates.',
      action: { type: 'navigate', path: 'Activities' }
    },
    {
      id: 'integrations',
      title: 'Set Up Integrations',
      description: 'Connect your tools',
      content: 'Integrate with Slack, Teams, or Google Calendar for seamless workflows.',
      action: { type: 'navigate', path: 'Integrations' }
    },
    {
      id: 'complete',
      title: 'Platform Ready! 🎯',
      description: 'Onboarding complete',
      content: 'Your platform is configured. Monitor analytics to track engagement!',
      action: null
    }
  ]
};

export default function GuidedOnboardingWizard({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const queryClient = useQueryClient();

  const userRole = user?.role === 'admin' ? 'admin' : user?.user_type || 'participant';
  const steps = ONBOARDING_FLOWS[userRole] || ONBOARDING_FLOWS.participant;
  const { trackOnboardingStep } = useAnalytics();

  const { data: onboardingRecord } = useQuery({
    queryKey: ['user-onboarding', user?.email],
    queryFn: async () => {
      const records = await base44.entities.UserOnboarding.filter({
        user_email: user?.email
      });
      return records[0] || null;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (onboardingRecord?.milestones_completed) {
      const completed = onboardingRecord.milestones_completed.map(m => m.title);
      setCompletedSteps(completed);
      
      // Find the first incomplete step
      const firstIncomplete = steps.findIndex(s => !completed.includes(s.id));
      if (firstIncomplete !== -1) {
        setCurrentStep(firstIncomplete);
      }
    }
  }, [onboardingRecord, steps]);

  const markStepCompleteMutation = useMutation({
    mutationFn: async (stepId) => {
      if (!onboardingRecord) {
        // Create new onboarding record
        return await base44.entities.UserOnboarding.create({
          user_email: user.email,
          start_date: new Date().toISOString(),
          status: 'in_progress',
          role: userRole,
          milestones_completed: [{
            day: currentStep + 1,
            title: stepId,
            completed_date: new Date().toISOString()
          }]
        });
      } else {
        // Update existing record
        const updatedMilestones = [
          ...onboardingRecord.milestones_completed,
          {
            day: currentStep + 1,
            title: stepId,
            completed_date: new Date().toISOString()
          }
        ];
        
        return await base44.entities.UserOnboarding.update(onboardingRecord.id, {
          milestones_completed: updatedMilestones,
          tasks_completed: updatedMilestones.length,
          status: updatedMilestones.length >= steps.length ? 'completed' : 'in_progress'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-onboarding']);
      setCompletedSteps([...completedSteps, steps[currentStep].id]);
      
      // Track analytics
      trackOnboardingStep(steps[currentStep].id, currentStep + 1, steps.length);
      
      if (currentStep === steps.length - 1) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('🎉 Onboarding complete!');
        if (onComplete) onComplete();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  });

  const step = steps[currentStep];
  const progress = (completedSteps.length / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleAction = () => {
    if (step.action?.type === 'navigate') {
      window.location.href = `/pages/${step.action.path}`;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Getting Started</CardTitle>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Step */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
          <p className="text-slate-600 mb-4">{step.content}</p>
          
          <div className="flex gap-3">
            {step.action && (
              <Button onClick={handleAction} className="bg-purple-600 hover:bg-purple-700">
                <ChevronRight className="h-4 w-4 mr-2" />
                {step.action.type === 'navigate' ? 'Go to ' + step.action.path.replace(/([A-Z])/g, ' $1').trim() : 'Continue'}
              </Button>
            )}
            
            {!completedSteps.includes(step.id) && (
              <Button
                onClick={() => markStepCompleteMutation.mutate(step.id)}
                variant={step.action ? "outline" : "default"}
                disabled={markStepCompleteMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isLastStep ? 'Complete Onboarding' : 'Mark Complete & Continue'}
              </Button>
            )}
          </div>
        </div>

        {/* Step Progress List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Your Progress</h4>
          {steps.map((s, idx) => {
            const isCompleted = completedSteps.includes(s.id);
            const isCurrent = idx === currentStep;
            
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrent ? 'bg-purple-100 border border-purple-300' : 'bg-slate-50'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.description}</div>
                </div>
                {isCurrent && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Tip */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-medium text-slate-900 mb-1">Pro Tip</h5>
                <p className="text-sm text-slate-600">
                  {userRole === 'participant' && 'Completing your profile helps teammates connect with you faster!'}
                  {userRole === 'facilitator' && 'Try scheduling a simple icebreaker activity for your first event.'}
                  {userRole === 'admin' && 'Start with a small pilot group before rolling out to the entire organization.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}