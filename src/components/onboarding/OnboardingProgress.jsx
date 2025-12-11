/**
 * ONBOARDING PROGRESS INDICATOR
 * Persistent progress bar for active onboarding
 */

import React from 'react';
import { useOnboarding } from './OnboardingProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronRight, BookOpen } from 'lucide-react';

export default function OnboardingProgress() {
  const {
    isOnboardingActive,
    currentStep,
    progress,
    currentStepIndex,
    steps,
    dismissOnboarding,
    completeStep
  } = useOnboarding();

  // Don't show if onboarding isn't active or no current step
  if (!isOnboardingActive || !currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)]"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-int-orange flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Tutorial Active</p>
                <p className="text-xs text-slate-500">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismissOnboarding}
              className="h-6 w-6"
              aria-label="Close tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 mb-3" />

          {/* Current Step Info */}
          <div className="mb-4">
            <h4 className="font-medium text-slate-900 text-sm mb-1">
              {currentStep.title}
            </h4>
            <p className="text-xs text-slate-600">
              {currentStep.description}
            </p>
          </div>

          {/* Action */}
          <Button
            onClick={() => completeStep(currentStep.id)}
            className="w-full bg-int-orange hover:bg-int-orange/90 gap-2"
            size="sm"
          >
            Continue Tutorial
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}