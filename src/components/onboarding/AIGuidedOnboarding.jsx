import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIGuidedOnboarding({ 
  steps = [], 
  onComplete, 
  onSkip,
  tutorialName = 'onboarding'
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [aiGuidance, setAiGuidance] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ensure steps is always an array
  const validSteps = Array.isArray(steps) && steps.length > 0 ? steps : [];
  const step = validSteps[currentStep];

  useEffect(() => {
    if (step) {
      fetchAIGuidance();
    }
  }, [currentStep]);

  const fetchAIGuidance = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('generateOnboardingTip', {
        step_title: step.title,
        step_description: step.description
      });
      setAiGuidance(response.data?.tip || 'Take your time and explore this step!');
    } catch (error) {
      setAiGuidance('Take your time and explore this step!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < validSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipAll = () => {
    toast.info('You can restart the tutorial anytime from Help');
    onSkip?.();
  };

  if (!step) return null;

  return (
    <>
      {/* Focus Box Spotlight Overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          style={{ pointerEvents: 'none' }}
        >
          {/* Spotlight cutout effect */}
          {step.targetElement && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute border-4 border-[var(--orb-accent)] rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-auto"
              style={{
                top: step.targetElement.top,
                left: step.targetElement.left,
                width: step.targetElement.width,
                height: step.targetElement.height,
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Guidance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-[var(--orb-accent)]/30 w-[calc(100%-2rem)] sm:w-full max-w-md mx-4 sm:mx-0"
        style={{
          top: step.cardPosition?.top || '50%',
          left: step.cardPosition?.left || '50%',
          transform: step.cardPosition ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[var(--orb-accent)] to-[var(--sunrise-glow)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {currentStep + 1}
                  </span>
                </div>
                <span className="text-xs text-[var(--slate)] whitespace-nowrap">
                  Step {currentStep + 1} of {validSteps.length}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--ink)] break-words">{step.title}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipAll}
              className="text-[var(--slate)] hover:text-[var(--ink)] flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-[var(--slate)] leading-relaxed mb-4">
            {step.description}
          </p>

          {/* AI Guidance */}
          <div className="bg-gradient-to-br from-[var(--orb-accent)]/5 to-[var(--sunrise-glow)]/5 rounded-lg p-3 sm:p-4 border border-[var(--orb-accent)]/20 mb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[var(--orb-accent)] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--orb-accent)] mb-1">
                  AI Tip
                </p>
                {isLoading ? (
                  <div className="h-4 w-3/4 bg-slate-200 animate-pulse rounded" />
                ) : (
                  <p className="text-sm text-[var(--ink)] leading-relaxed">
                    {aiGuidance}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Button (if step has specific action) */}
          {step.actionButton && (
            <Button
              onClick={step.actionButton.onClick}
              className="w-full mb-4 bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90"
            >
              {step.actionButton.label}
            </Button>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2 order-2 sm:order-1 w-full sm:w-auto min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sm:inline">Previous</span>
          </Button>

          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
            <Button
              variant="ghost"
              onClick={handleSkipAll}
              className="gap-2 text-[var(--slate)] w-full sm:w-auto min-h-[44px]"
            >
              <SkipForward className="w-4 h-4" />
              Skip Tutorial
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90 gap-2 w-full sm:w-auto min-h-[44px]"
            >
              {currentStep === validSteps.length - 1 ? 'Complete' : 'Next'}
              {currentStep < validSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="h-1 bg-slate-100">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--orb-accent)] to-[var(--sunrise-glow)]"
            initial={{ width: 0 }}
            animate={{ width: `${validSteps.length > 0 ? ((currentStep + 1) / validSteps.length) * 100 : 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </>
  );
}