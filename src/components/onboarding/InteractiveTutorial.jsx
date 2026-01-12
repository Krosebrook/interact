import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Award,
  MessageSquare,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

// Export tutorial catalog for OnboardingHub
export const TUTORIALS = {
  profile: {
    id: 'profile',
    title: 'Setting Up Your Profile',
    description: 'Learn how to customize your profile and connect with teammates',
    duration: '3 min',
    steps: [
      {
        id: 'profile-1',
        title: 'Add Your Photo',
        description: 'Upload a profile picture to help teammates recognize you',
        icon: Users,
        target: '[data-tutorial="profile-photo"]'
      },
      {
        id: 'profile-2',
        title: 'Complete Your Bio',
        description: 'Share your interests, skills, and what you do',
        icon: MessageSquare,
        target: '[data-tutorial="profile-bio"]'
      },
      {
        id: 'profile-3',
        title: 'Set Preferences',
        description: 'Customize your notification and privacy settings',
        icon: Target,
        target: '[data-tutorial="profile-preferences"]'
      }
    ]
  },
  gamification: {
    id: 'gamification',
    title: 'Understanding Points & Badges',
    description: 'Learn how to earn rewards and level up',
    duration: '4 min',
    steps: [
      {
        id: 'gamification-1',
        title: 'Earning Points',
        description: 'Discover how you earn points through activities',
        icon: Sparkles
      },
      {
        id: 'gamification-2',
        title: 'Unlocking Badges',
        description: 'Learn about achievement badges and milestones',
        icon: Award
      },
      {
        id: 'gamification-3',
        title: 'Redeeming Rewards',
        description: 'Use your points in the rewards store',
        icon: Target
      }
    ]
  },
  teams: {
    id: 'teams',
    title: 'Joining & Managing Teams',
    description: 'Collaborate effectively with team features',
    duration: '5 min',
    steps: [
      {
        id: 'teams-1',
        title: 'Finding Teams',
        description: 'Browse and join teams relevant to you',
        icon: Users
      },
      {
        id: 'teams-2',
        title: 'Team Channels',
        description: 'Communicate in team-specific channels',
        icon: MessageSquare
      }
    ]
  }
};

const TUTORIAL_STEPS = {
  participant: [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your photo, bio, and interests to help teammates get to know you',
      icon: Users,
      interactive: {
        type: 'demo',
        component: 'ProfileSetup'
      }
    },
    {
      id: 'teams',
      title: 'Join Your Team',
      description: 'Find and join your department or project teams',
      icon: Users,
      interactive: {
        type: 'simulation',
        action: 'join_team'
      }
    },
    {
      id: 'events',
      title: 'Explore Events',
      description: 'Browse upcoming activities and RSVP to your first event',
      icon: Calendar,
      interactive: {
        type: 'demo',
        component: 'EventBrowser'
      }
    },
    {
      id: 'recognition',
      title: 'Give Recognition',
      description: 'Appreciate a colleague with a public shoutout',
      icon: MessageSquare,
      interactive: {
        type: 'simulation',
        action: 'give_recognition'
      }
    },
    {
      id: 'gamification',
      title: 'Earn Points & Badges',
      description: 'Learn how to earn points through activities and unlock achievements',
      icon: Award,
      interactive: {
        type: 'demo',
        component: 'GamificationIntro'
      }
    }
  ],
  facilitator: [
    {
      id: 'activities',
      title: 'Browse Activity Library',
      description: 'Explore 15+ pre-built activity templates for your events',
      icon: Sparkles,
      interactive: {
        type: 'demo',
        component: 'ActivityLibrary'
      }
    },
    {
      id: 'schedule',
      title: 'Schedule Your First Event',
      description: 'Create and schedule an engaging team activity',
      icon: Calendar,
      interactive: {
        type: 'simulation',
        action: 'schedule_event'
      }
    },
    {
      id: 'team',
      title: 'Set Up Your Team',
      description: 'Create or join teams to track engagement',
      icon: Users,
      interactive: {
        type: 'demo',
        component: 'TeamSetup'
      }
    },
    {
      id: 'analytics',
      title: 'Track Engagement',
      description: 'View analytics to measure team participation',
      icon: Target,
      interactive: {
        type: 'demo',
        component: 'AnalyticsOverview'
      }
    }
  ]
};

export default function InteractiveTutorial({ open, onClose, userRole = 'participant' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  const steps = TUTORIAL_STEPS[userRole] || TUTORIAL_STEPS.participant;
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }
    
    if (currentStep === steps.length - 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success('Tutorial completed! 🎉');
      setTimeout(onClose, 2000);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (confirm('Are you sure you want to skip the tutorial?')) {
      onClose();
    }
  };

  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl">Getting Started Tutorial</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleSkip}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="py-6"
          >
            {/* Step Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-int-orange to-int-gold">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </div>

            {/* Interactive Content */}
            <div className="bg-slate-50 rounded-xl p-6 mb-6 min-h-[300px] flex items-center justify-center">
              {step.interactive.type === 'demo' && (
                <DemoComponent component={step.interactive.component} />
              )}
              {step.interactive.type === 'simulation' && (
                <SimulationComponent action={step.interactive.action} />
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-slate-600">
                    {getTipForStep(step.id, userRole)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            className="bg-int-orange hover:bg-int-orange/90"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Tutorial
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex justify-center gap-2 pt-4">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all ${
                idx <= currentStep ? 'w-8 bg-int-orange' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DemoComponent({ component }) {
  const demos = {
    ProfileSetup: (
      <div className="text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-int-orange to-int-gold mx-auto flex items-center justify-center text-white text-3xl font-bold">
          JD
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-white rounded w-2/3 mx-auto" />
          <div className="h-16 bg-white rounded w-full" />
        </div>
        <p className="text-sm text-slate-500">Example: Complete profile view</p>
      </div>
    ),
    ActivityLibrary: (
      <div className="grid grid-cols-3 gap-3">
        {['Icebreaker', 'Creative', 'Wellness'].map((type, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 text-center border-2 border-slate-200">
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-medium text-sm">{type}</p>
          </div>
        ))}
      </div>
    ),
    GamificationIntro: (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 flex items-center gap-4">
          <Award className="h-12 w-12 text-yellow-500" />
          <div>
            <p className="font-bold text-2xl text-int-orange">250</p>
            <p className="text-sm text-slate-600">Points Earned</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['🏆', '⭐', '🎖️'].map((emoji, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 text-center">
              <div className="text-3xl mb-1">{emoji}</div>
              <p className="text-xs text-slate-600">Badge {idx + 1}</p>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return demos[component] || <p>Interactive demo coming soon</p>;
}

function SimulationComponent({ action }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  };

  return (
    <div className="text-center space-y-4">
      <p className="text-slate-600 mb-4">Try clicking the button below to simulate this action</p>
      <Button
        onClick={handleClick}
        className="bg-int-orange hover:bg-int-orange/90"
        size="lg"
      >
        {action === 'join_team' && 'Join Team'}
        {action === 'give_recognition' && 'Give Recognition'}
        {action === 'schedule_event' && 'Schedule Event'}
      </Button>
      {clicked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-600 font-medium"
        >
          <CheckCircle2 className="h-6 w-6 mx-auto mb-2" />
          Action completed! ✓
        </motion.div>
      )}
    </div>
  );
}

function getTipForStep(stepId, userRole) {
  const tips = {
    profile: 'Adding a profile photo increases team connection by 3x!',
    teams: 'Join at least 2-3 teams to stay in the loop',
    events: 'Events with 5+ RSVPs have 90% attendance rates',
    recognition: 'Public recognition boosts morale and team culture',
    gamification: 'Top contributors earn exclusive rewards and badges',
    activities: 'Mix different activity types to keep engagement high',
    schedule: 'Schedule recurring events to build consistent engagement',
    team: 'Invite team members to maximize participation',
    analytics: 'Check analytics weekly to spot trends early'
  };

  return tips[stepId] || 'Keep exploring to discover more features!';
}