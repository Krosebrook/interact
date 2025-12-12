/**
 * WELCOME WIZARD
 * Initial onboarding wizard for first-time users (alternative to modal)
 */

import React, { useState } from 'react';
import { useOnboarding } from './OnboardingProvider';
import { usePermissions } from '../hooks/usePermissions';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Users, 
  Calendar, 
  Trophy,
  Heart,
  Gift,
  ChevronRight,
  CheckCircle2,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { queryKeys } from '../lib/queryKeys';

export default function WelcomeWizard({ isOpen, onComplete }) {
  const [step, setStep] = useState(0);
  const { onboardingState, updateOnboardingMutation } = useOnboarding();

  const wizardSteps = [
    {
      title: 'Welcome to INTeract! 🎉',
      description: 'Your platform for team connection, growth, and fun',
      icon: Sparkles,
      color: 'from-int-orange to-int-gold',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-slate-600">
            INTeract brings your remote team together through engaging activities, 
            meaningful recognition, and exciting rewards.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <FeatureCard icon={Calendar} label="Team Events" />
            <FeatureCard icon={Trophy} label="Earn Rewards" />
            <FeatureCard icon={Heart} label="Recognition" />
            <FeatureCard icon={Users} label="Team Channels" />
          </div>
        </div>
      )
    },
    {
      title: 'What brings you here?',
      description: 'Help us personalize your experience',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 mb-4">
            Select all that apply (you can change this later):
          </p>
          <GoalSelector />
        </div>
      )
    },
    {
      title: 'You\'re all set!',
      description: 'Time to start exploring',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to dive in!</h3>
            <p className="text-slate-600">
              We've prepared some personalized recommendations just for you.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm font-semibold text-slate-900 mb-2">Quick Tips:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>✓ Check your portal weekly for new events</li>
              <li>✓ Give recognition to boost team morale</li>
              <li>✓ Complete challenges for bonus points</li>
              <li>✓ Redeem points in the Rewards Store</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentWizardStep = wizardSteps[step];
  const StepIcon = currentWizardStep.icon;
  const progressPercent = ((step + 1) / wizardSteps.length) * 100;

  const handleNext = () => {
    if (step < wizardSteps.length - 1) {
      setStep(step + 1);
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => onComplete(), 500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl"
        hideClose
        aria-labelledby="wizard-title"
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              Step {step + 1} of {wizardSteps.length}
            </Badge>
            <Progress value={progressPercent} className="w-32 h-1" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentWizardStep.color} flex items-center justify-center flex-shrink-0`}>
            <StepIcon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 id="wizard-title" className="text-2xl font-bold text-int-navy mb-1">
              {currentWizardStep.title}
            </h2>
            <p className="text-slate-600">
              {currentWizardStep.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {currentWizardStep.content}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            {step > 0 && 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            className="bg-int-orange hover:bg-int-orange/90 gap-2"
          >
            {step === wizardSteps.length - 1 ? 'Get Started' : 'Continue'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureCard({ icon: Icon, label }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
      <Icon className="h-6 w-6 text-int-orange mx-auto mb-2" />
      <p className="text-sm font-medium text-slate-700">{label}</p>
    </div>
  );
}

function GoalSelector() {
  const [selected, setSelected] = useState([]);
  const { user } = usePermissions();
  const queryClient = useQueryClient();

  // Map goals to activity types
  const goalToActivityMap = {
    connect: 'social',
    learn: 'learning',
    fun: 'icebreaker',
    wellness: 'wellness',
    recognition: 'social',
    rewards: 'competitive'
  };

  const goals = [
    { id: 'connect', label: 'Connect with teammates', icon: Users },
    { id: 'learn', label: 'Learn new skills', icon: Target },
    { id: 'fun', label: 'Have fun at work', icon: Sparkles },
    { id: 'wellness', label: 'Improve wellness', icon: Heart },
    { id: 'recognition', label: 'Get recognized', icon: Trophy },
    { id: 'rewards', label: 'Earn rewards', icon: Gift }
  ];

  const toggleGoal = async (goalId) => {
    const newSelected = selected.includes(goalId) 
      ? selected.filter(id => id !== goalId)
      : [...selected, goalId];
    
    setSelected(newSelected);

    // Update user profile with selected activity preferences
    if (user?.email) {
      try {
        const preferredTypes = [...new Set(newSelected.map(id => goalToActivityMap[id]))];
        
        // Get existing profiles
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        
        if (profiles.length > 0) {
          // Update existing profile
          await base44.entities.UserProfile.update(profiles[0].id, {
            activity_preferences: {
              preferred_types: preferredTypes,
              ai_creativity_level: 'balanced'
            }
          });
        } else {
          // Create new profile
          await base44.entities.UserProfile.create({
            user_email: user.email,
            activity_preferences: {
              preferred_types: preferredTypes,
              ai_creativity_level: 'balanced'
            }
          });
        }

        queryClient.invalidateQueries(queryKeys.profile.byEmail(user.email));
      } catch (error) {
        console.error('Failed to update preferences:', error);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {goals.map((goal) => {
        const Icon = goal.icon;
        const isSelected = selected.includes(goal.id);
        
        return (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              isSelected 
                ? 'border-int-orange bg-int-orange/5' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            )}
          >
            <Icon className={cn(
              'h-5 w-5 mb-2',
              isSelected ? 'text-int-orange' : 'text-slate-400'
            )} />
            <p className={cn(
              'text-sm font-medium',
              isSelected ? 'text-int-navy' : 'text-slate-600'
            )}>
              {goal.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}