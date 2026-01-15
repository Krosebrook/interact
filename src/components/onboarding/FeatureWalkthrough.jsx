import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * Feature walkthrough with step-by-step highlights
 * Points to specific UI elements and explains their purpose
 */
export default function FeatureWalkthrough({ steps, onComplete, featureName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      setIsActive(false);
      localStorage.setItem(`walkthrough-${featureName}`, 'completed');
      if (onComplete) onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDismiss = () => {
    setIsActive(false);
    localStorage.setItem(`walkthrough-${featureName}`, 'dismissed');
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 pointer-events-auto"
          onClick={handleDismiss}
        />

        {/* Spotlight on target element */}
        {step.target && (
          <Spotlight targetSelector={step.target} />
        )}

        {/* Walkthrough Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-auto"
        >
          <div className="glass-panel-solid mx-4 shadow-2xl border-2 border-int-orange/30">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <h3 className="font-bold text-lg text-slate-900">{step.title}</h3>
              </div>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">{step.description}</p>

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  aria-label="Go to previous step"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-slate-500"
                  aria-label="Close walkthrough"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep ? 'w-6 bg-int-orange' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Skip this walkthrough?')) {
                      handleDismiss();
                    }
                  }}
                >
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-int-orange hover:bg-int-orange/90"
                  aria-label={currentStep === steps.length - 1 ? 'Complete walkthrough' : 'Continue to next step'}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Spotlight({ targetSelector }) {
  const [rect, setRect] = useState(null);

  React.useEffect(() => {
    const element = document.querySelector(targetSelector);
    if (element) {
      const bounds = element.getBoundingClientRect();
      setRect(bounds);
    }
  }, [targetSelector]);

  if (!rect) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute pointer-events-none"
      style={{
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 20px rgba(217, 114, 48, 0.5)',
        borderRadius: 12,
        border: '3px solid #D97230',
        zIndex: 101
      }}
    />
  );
}