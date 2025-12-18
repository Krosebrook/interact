/**
 * ONBOARDING WIDGET
 * Dashboard widget to show onboarding progress and quick actions
 */

import React from 'react';
import { useOnboarding } from '../onboarding/OnboardingProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingWidget({ variant = 'card' }) {
  // All hooks must be called before any conditional returns
  const {
    isComplete,
    progress,
    onboardingState,
    steps,
    startOnboarding,
    currentStep
  } = useOnboarding();

  const completedCount = onboardingState?.completed_steps?.length || 0;
  const totalSteps = steps.length;
  const remainingSteps = totalSteps - completedCount;

  // Conditional rendering after all hooks - FIXED: moved to end
  if (onboardingState?.dismissed) return null;
  if (isComplete && variant === 'banner') return null;

  // Compact banner variant
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-int-orange to-int-gold p-4 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">
                Complete your onboarding ({progress}%)
              </p>
              <p className="text-white/80 text-sm">
                {remainingSteps} step{remainingSteps !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
          <Button
            onClick={startOnboarding}
            variant="secondary"
            className="bg-white hover:bg-white/90 text-int-orange"
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Card variant
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className={`h-2 ${isComplete ? 'bg-emerald-500' : 'bg-int-orange'}`} />
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            {isComplete ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Onboarding Complete
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-int-orange" />
                Getting Started
              </>
            )}
          </span>
          <Badge className={isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
            {progress}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isComplete ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-4">
              You've completed the onboarding tutorial! 🎉
            </p>
            <p className="text-xs text-slate-500">
              You can always restart it from the Tutorial menu.
            </p>
          </div>
        ) : (
          <>
            <Progress value={progress} className="h-3 mb-4" />
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {completedCount} of {totalSteps} steps done
                  </p>
                  <p className="text-xs text-slate-500">
                    You're making great progress!
                  </p>
                </div>
              </div>

              {currentStep && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs font-semibold text-slate-900 mb-1">Next:</p>
                  <p className="text-sm text-slate-700">{currentStep.title}</p>
                  {currentStep.estimatedTime && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {currentStep.estimatedTime}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={startOnboarding}
              className="w-full bg-int-orange hover:bg-int-orange/90"
            >
              Continue Tutorial
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function EventDiscoveryGuide() {
  const eventFeatures = [
    { label: 'Filter by interests', icon: '🎯' },
    { label: 'See who\'s attending', icon: '👥' },
    { label: 'Add to calendar', icon: '📅' },
    { label: 'RSVP in one click', icon: '✅' }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">
        Discover events tailored to your preferences and interests.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {eventFeatures.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center"
          >
            <div className="text-2xl mb-1">{feature.icon}</div>
            <p className="text-xs font-medium text-slate-700">{feature.label}</p>
          </motion.div>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">AI Recommendations</p>
              <p className="text-xs text-slate-600 mt-1">
                Based on your preferences, we'll suggest events you'll love
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RewardsStorePreview() {
  const sampleRewards = [
    { name: 'Coffee Gift Card', points: 500, icon: '☕' },
    { name: 'Extra PTO Day', points: 2000, icon: '🏖️' },
    { name: 'Team Lunch', points: 1500, icon: '🍕' },
    { name: 'Desk Plant', points: 300, icon: '🌱' }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">
        Redeem your hard-earned points for rewards you'll actually want!
      </p>

      <div className="grid grid-cols-2 gap-3">
        {sampleRewards.map((reward, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 text-center"
          >
            <div className="text-3xl mb-2">{reward.icon}</div>
            <p className="text-xs font-semibold text-slate-900 mb-1">{reward.name}</p>
            <Badge className="bg-amber-100 text-amber-700 text-xs">
              {reward.points} pts
            </Badge>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-slate-500 text-center">
        New rewards added regularly based on team feedback
      </p>
    </div>
  );
}