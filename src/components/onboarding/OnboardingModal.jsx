/**
 * ONBOARDING MODAL
 * Main interactive onboarding UI component with accessibility
 */

import React, { useEffect, useState } from 'react';
import { useOnboarding } from './OnboardingProvider';
import DynamicOnboardingAdjuster from './DynamicOnboardingAdjuster';
import { useStepValidation } from './useStepValidation';
import { usePermissions } from '../hooks/usePermissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Target,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  Gift,
  AlertCircle } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { BadgeAwardSimulation, PointsIncrementAnimation } from './GamificationSimulation';
import { OnboardingSpotlight } from './OnboardingSpotlight';

const STEP_ICONS = {
  welcome: Sparkles,
  profile: Users,
  activity: Target,
  event: Calendar,
  gamification: Award,
  team: Users,
  analytics: BarChart3,
  recognition: MessageSquare,
  rewards: Gift,
  complete: CheckCircle2,
  dashboard: BarChart3
};

function StepContent({ step }) {
  const { content } = step;
  
  // Render custom component if specified
  if (content?.type === 'custom-component' && content.component) {
    const Component = content.component;
    return <Component />;
  }

  // Render different content types
  if (content.type === 'animated-intro') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-6">🎉</div>
        <div className="space-y-3">
          {content.highlights.map((highlight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-lg text-slate-700"
            >
              {highlight}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (content.type === 'feature-overview') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {content.features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center mb-3">
              <span className="text-white text-lg">{feature.icon === 'Trophy' ? '🏆' : '⭐'}</span>
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
            <p className="text-sm text-slate-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  if (content.type === 'step-by-step') {
    return (
      <div className="space-y-3">
        {content.steps.map((stepText, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
          >
            <div className="w-6 h-6 rounded-full bg-int-orange text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
              {idx + 1}
            </div>
            <p className="text-slate-700">{stepText}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  if (content.type === 'completion-celebration') {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="h-10 w-10 text-white" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-4">Achievements Unlocked!</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {content.achievements.map((achievement, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-200"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-sm text-slate-700">{achievement}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-2">Next Steps</h4>
          <ul className="text-left text-sm text-slate-600 space-y-1">
            {content.nextSteps?.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Default rendering
  return (
    <div className="prose prose-slate max-w-none">
      <p className="text-slate-600">
        Follow the guided steps to complete this section of your onboarding.
      </p>
    </div>
  );
}

export default function OnboardingModal() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const navigate = useNavigate();
  const { user } = usePermissions();
  const {
    isOnboardingActive,
    currentStep,
    currentStepIndex,
    steps,
    progress,
    totalTime,
    completeStep,
    skipStep,
    previousStep,
    dismissOnboarding
  } = useOnboarding();

  const { isValid, validationMessage } = useStepValidation(user, currentStep);
  const [showBadge, setShowBadge] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);

  // SINGLE useEffect for keyboard navigation - CONSOLIDATED
  useEffect(() => {
    if (!isOnboardingActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dismissOnboarding();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        previousStep();
      }

      // Announce step changes to screen readers
      const announcement = document.getElementById('onboarding-announcement');
      if (announcement && currentStep) {
        announcement.textContent = `${currentStep.title}. ${currentStep.description}`;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingActive, currentStepIndex, currentStep, dismissOnboarding, previousStep]);

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  if (!isOnboardingActive || !currentStep) return null;

  const handleNext = async () => {
    // Show gamification feedback for milestone steps
    if (currentStep.id.includes('gamification') || currentStep.id.includes('complete')) {
      setShowBadge(true);
      setTimeout(() => setShowBadge(false), 3000);
    } else {
      setShowPoints(true);
      setTimeout(() => setShowPoints(false), 2000);
    }

    await completeStep(currentStep.id);
  };

  const handleSkip = async () => {
    await skipStep(currentStep.id);
  };

  const handleAction = (action) => {
    if (action.type === 'navigate') {
      navigate(createPageUrl(action.target.replace('/', '')));
      // Show spotlight on target page
      if (currentStep.target) {
        setTimeout(() => setShowSpotlight(true), 500);
      } else {
        handleNext();
      }
    } else if (action.type === 'next') {
      handleNext();
    } else if (action.type === 'restart') {
      // Handle restart in parent
    }
  };

  const Icon = STEP_ICONS[currentStep.id.split('-')[1]] || Sparkles;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <>
      {/* Screen reader announcements */}
      <div
        id="onboarding-announcement"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Gamification feedback */}
      <BadgeAwardSimulation show={showBadge} badgeName="Tutorial Master" />
      <PointsIncrementAnimation show={showPoints} points={10} reason="Tutorial Progress" />

      {/* Cross-page spotlight */}
      <OnboardingSpotlight
        targetSelector={currentStep?.target}
        title={currentStep?.title}
        description={currentStep?.description}
        placement={currentStep?.placement}
        isVisible={showSpotlight}
        onNext={() => {
          setShowSpotlight(false);
          handleNext();
        }}
        onDismiss={() => setShowSpotlight(false)}
      />

      <Dialog open={isOnboardingActive} onOpenChange={(open) => !open && dismissOnboarding()}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          aria-labelledby="onboarding-title"
          aria-describedby="onboarding-description"
        >
        {/* Header with Progress */}
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{currentStep.estimatedTime}</span>
              <span className="mx-1">•</span>
              <span>{totalTime} total</span>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-4" />

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center flex-shrink-0">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle id="onboarding-title" className="text-2xl font-bold text-int-navy mb-2">
                {currentStep.title}
              </DialogTitle>
              <DialogDescription id="onboarding-description" className="text-slate-600">
                {currentStep.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="py-6"
          >
            <StepContent step={currentStep} />
          </motion.div>
        </AnimatePresence>

        {/* Validation Warning */}
        {validationMessage && !isValid && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="ghost"
                onClick={previousStep}
                className="gap-2"
                aria-label="Go to previous step"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={dismissOnboarding}
              className="text-slate-500 hover:text-slate-700"
              aria-label="Skip entire tutorial"
            >
              Skip Tutorial
            </Button>
          </div>

          <div className="flex gap-2">
            {/* Show Skip button only for optional steps */}
            {currentStep.validation?.optional && !isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-slate-500"
                aria-label="Skip this step"
              >
                Skip This Step
              </Button>
            )}

            {!currentStep.actions || currentStep.actions.length === 0 ? (
              <Button
                onClick={handleNext}
                className="bg-int-orange hover:bg-int-orange/90 gap-2"
                disabled={!isValid && !currentStep.validation?.optional}
                aria-label={isLastStep ? 'Complete tutorial' : 'Continue to next step'}
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Complete Tutorial
                  </>
                ) : (
                  <>
                    {currentStep.validation?.optional && !isValid ? 'Continue Anyway' : 'Next Step'}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              currentStep.actions.map((action, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleAction(action)}
                  variant={idx === 0 ? 'default' : 'outline'}
                  className={idx === 0 ? 'bg-int-orange hover:bg-int-orange/90 gap-1' : ''}
                  disabled={!isValid && !currentStep.validation?.optional && idx === 0}
                  aria-label={action.label}
                >
                  {action.label}
                  {idx === 0 && action.type === 'next' && <ChevronRight className="h-4 w-4" />}
                  {action.type === 'restart' && <ChevronRight className="h-4 w-4" />}
                </Button>
              ))
            )}
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}