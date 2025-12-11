/**
 * ONBOARDING TOOLTIP
 * Contextual tooltips for highlighting UI elements during onboarding
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingTooltip({ 
  isVisible,
  title,
  description,
  placement = 'bottom',
  target,
  onNext,
  onSkip,
  onDismiss,
  showProgress,
  currentStep,
  totalSteps
}) {
  if (!isVisible) return null;

  const placements = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white border-y-transparent border-l-transparent'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'absolute z-50 w-80 max-w-sm',
          placements[placement]
        )}
        role="tooltip"
        aria-live="polite"
      >
        {/* Arrow */}
        <div className={cn('absolute w-0 h-0 border-8', arrows[placement])} />

        {/* Tooltip Content */}
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-int-orange/10 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-int-orange" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
                {showProgress && (
                  <p className="text-xs text-slate-500">
                    Step {currentStep} of {totalSteps}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6"
              aria-label="Dismiss tooltip"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 mb-4">
            {description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-slate-500 hover:text-slate-700"
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={onNext}
              className="bg-int-orange hover:bg-int-orange/90 gap-1"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}