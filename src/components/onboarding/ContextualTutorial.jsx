import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TUTORIAL_DEFINITIONS = {
  first_event: {
    name: 'Creating Your First Event',
    description: 'Learn how to discover and attend events',
    steps: [
      { element: 'nav-calendar', text: '📅 Click Calendar to find events', position: 'bottom' },
      { element: 'event-card', text: 'Browse upcoming events here', position: 'right' },
      { element: 'rsvp-button', text: 'Click RSVP to reserve your spot', position: 'left' },
      { element: 'event-reminder', text: 'You\'ll get a reminder before it starts', position: 'bottom' }
    ]
  },
  recognition: {
    name: 'Giving Recognition',
    description: 'Celebrate your teammates',
    steps: [
      { element: 'nav-recognition', text: '⭐ Open Recognition', position: 'bottom' },
      { element: 'recipient-field', text: 'Select who to recognize', position: 'right' },
      { element: 'message-input', text: 'Share why they\'re awesome', position: 'top' },
      { element: 'submit-btn', text: 'Post to celebrate!', position: 'left' }
    ]
  },
  teams: {
    name: 'Joining Teams',
    description: 'Connect with your colleagues',
    steps: [
      { element: 'nav-teams', text: '👥 Click Teams', position: 'bottom' },
      { element: 'team-cards', text: 'Browse available teams', position: 'top' },
      { element: 'join-btn', text: 'Join teams you\'re interested in', position: 'left' }
    ]
  }
};

export default function ContextualTutorial({ featureName, onComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const tutorial = TUTORIAL_DEFINITIONS[featureName];

  const { data: progress } = useQuery({
    queryKey: ['tutorial-progress', featureName],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.GuidedTutorial.filter({
        user_email: user.email,
        tutorial_name: featureName
      });
      return results[0];
    }
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const existing = await base44.entities.GuidedTutorial.filter({
        user_email: user.email,
        tutorial_name: featureName
      });

      if (existing.length > 0) {
        await base44.entities.GuidedTutorial.update(existing[0].id, {
          status: 'completed',
          completed_at: new Date().toISOString()
        });
      }

      onComplete?.();
      setIsActive(false);
    }
  });

  // Auto-trigger tutorial on feature first access
  useEffect(() => {
    if (!progress && !localStorage.getItem(`tutorial_${featureName}_dismissed`)) {
      setIsActive(true);
    }
  }, [progress, featureName]);

  if (!tutorial) return null;
  if (!isActive) return null;

  const step = tutorial.steps[currentStep];
  const progress_pct = ((currentStep + 1) / tutorial.steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setIsActive(false)}
      >
        {/* SPOTLIGHT OVERLAY */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Highlight target element */}
          <div
            id={`tutorial-spotlight-${step.element}`}
            className={cn(
              'absolute border-2 border-int-orange rounded-xl shadow-lg shadow-int-orange/50',
              'transition-all duration-300'
            )}
            style={{
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(217, 114, 48, 0.8)'
            }}
          />
        </div>

        {/* TUTORIAL CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'absolute bg-white rounded-lg shadow-2xl p-6 z-50 max-w-sm',
            step.position === 'bottom' && 'bottom-24 left-1/2 -translate-x-1/2',
            step.position === 'top' && 'top-24 left-1/2 -translate-x-1/2',
            step.position === 'left' && 'left-6 top-1/2 -translate-y-1/2',
            step.position === 'right' && 'right-6 top-1/2 -translate-y-1/2'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={() => {
              setIsActive(false);
              localStorage.setItem(`tutorial_${featureName}_dismissed`, 'true');
            }}
            className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>

          {/* CONTENT */}
          <div className="space-y-4 pr-6">
            <div>
              <h3 className="font-bold text-slate-900">{tutorial.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{step.text}</p>
            </div>

            {/* PROGRESS */}
            <div className="space-y-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress_pct}%` }}
                  className="h-full bg-int-orange"
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Step {currentStep + 1} of {tutorial.steps.length}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (currentStep > 0) setCurrentStep(currentStep - 1);
                }}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {currentStep === tutorial.steps.length - 1 ? (
                <Button
                  size="sm"
                  className="flex-1 bg-int-orange hover:bg-int-orange/90"
                  onClick={() => completeMutation.mutate()}
                >
                  Got It!
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1 bg-int-orange hover:bg-int-orange/90"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Can resume later
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}