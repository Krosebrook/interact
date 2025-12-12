/**
 * INTERACTIVE TUTORIAL COMPONENT
 * Step-by-step guided tutorials for key features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  Video,
  MousePointer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Tutorial definitions for key features
export const TUTORIALS = {
  'event-creation': {
    id: 'event-creation',
    title: 'Creating Your First Event',
    description: 'Learn how to schedule engaging team activities',
    duration: '3 min',
    steps: [
      {
        title: 'Navigate to Calendar',
        description: 'Click on the Calendar icon in the sidebar',
        target: '[data-tutorial="calendar-nav"]',
        action: 'Click the Calendar button',
        tip: 'You can also use the quick "Schedule Event" button on the dashboard'
      },
      {
        title: 'Choose an Activity',
        description: 'Browse the activity library or use AI suggestions',
        target: '[data-tutorial="activity-selector"]',
        action: 'Select an activity you like',
        tip: 'Filter by type, duration, or energy level to find the perfect match'
      },
      {
        title: 'Set Date & Time',
        description: 'Pick when your event will happen',
        target: '[data-tutorial="date-picker"]',
        action: 'Choose a date and time',
        tip: 'Consider your team\'s time zones and availability'
      },
      {
        title: 'Invite Participants',
        description: 'Select who should attend',
        target: '[data-tutorial="participant-selector"]',
        action: 'Add team members',
        tip: 'You can invite entire teams or specific individuals'
      },
      {
        title: 'Configure Notifications',
        description: 'Set up event reminders',
        target: '[data-tutorial="notification-settings"]',
        action: 'Enable reminder options',
        tip: 'We recommend 24-hour and 1-hour reminders'
      },
      {
        title: 'Publish Event',
        description: 'Make your event live',
        target: '[data-tutorial="publish-button"]',
        action: 'Click Publish',
        tip: 'Participants will be notified immediately'
      }
    ]
  },
  'recognition': {
    id: 'recognition',
    title: 'Sending Recognition',
    description: 'Celebrate your teammates\' achievements',
    duration: '2 min',
    steps: [
      {
        title: 'Open Recognition Page',
        description: 'Navigate to the Recognition section',
        target: '[data-tutorial="recognition-nav"]',
        action: 'Click Recognition in sidebar',
        tip: 'Recognition boosts morale and team culture'
      },
      {
        title: 'Click Give Recognition',
        description: 'Start creating your recognition',
        target: '[data-tutorial="give-recognition-btn"]',
        action: 'Click the "Give Recognition" button',
        tip: 'Be specific about what you\'re recognizing'
      },
      {
        title: 'Select Recipient',
        description: 'Choose who you want to recognize',
        target: '[data-tutorial="recipient-selector"]',
        action: 'Search and select a teammate',
        tip: 'You can recognize multiple people at once'
      },
      {
        title: 'Choose Category',
        description: 'Pick what best describes their contribution',
        target: '[data-tutorial="category-selector"]',
        action: 'Select a recognition category',
        tip: 'Categories help track different types of contributions'
      },
      {
        title: 'Write Your Message',
        description: 'Add a personal note',
        target: '[data-tutorial="message-input"]',
        action: 'Write a heartfelt message',
        tip: 'Specific examples make recognition more meaningful'
      },
      {
        title: 'Set Visibility',
        description: 'Choose who can see this',
        target: '[data-tutorial="visibility-toggle"]',
        action: 'Select public or private',
        tip: 'Public recognition encourages a culture of appreciation'
      }
    ]
  },
  'challenge-participation': {
    id: 'challenge-participation',
    title: 'Accepting Challenges',
    description: 'Set personal goals and track progress',
    duration: '2 min',
    steps: [
      {
        title: 'View Available Challenges',
        description: 'See personalized challenges',
        target: '[data-tutorial="challenges-list"]',
        action: 'Browse challenges on your dashboard',
        tip: 'Challenges are tailored to your interests and role'
      },
      {
        title: 'Read Challenge Details',
        description: 'Understand what\'s required',
        target: '[data-tutorial="challenge-card"]',
        action: 'Click on a challenge to see details',
        tip: 'Check the difficulty and time commitment'
      },
      {
        title: 'Accept Challenge',
        description: 'Commit to the goal',
        target: '[data-tutorial="accept-challenge-btn"]',
        action: 'Click "Accept Challenge"',
        tip: 'You can accept multiple challenges at once'
      },
      {
        title: 'Track Your Progress',
        description: 'Monitor how you\'re doing',
        target: '[data-tutorial="progress-tracker"]',
        action: 'View your progress',
        tip: 'Check your profile to see all active challenges'
      },
      {
        title: 'Complete & Claim Rewards',
        description: 'Earn points and badges',
        target: '[data-tutorial="claim-reward-btn"]',
        action: 'Claim your reward when complete',
        tip: 'Rewards are added to your profile automatically'
      }
    ]
  }
};

export default function InteractiveTutorial({ tutorialId, onComplete, onSkip }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const tutorial = TUTORIALS[tutorialId];
  if (!tutorial) return null;

  const currentStep = tutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;
  const isLastStep = currentStepIndex === tutorial.steps.length - 1;

  const handleNext = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps([...completedSteps, currentStepIndex]);
    }

    if (isLastStep) {
      toast.success('Tutorial complete! 🎉');
      onComplete?.(tutorial.id);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    toast.info('Tutorial skipped');
    onSkip?.(tutorial.id);
  };

  // Auto-play mode
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 8000); // 8 seconds per step

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex]);

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{tutorial.title}</h3>
              <p className="text-sm text-slate-600">{tutorial.description}</p>
            </div>
          </div>
          <Badge variant="outline">
            {tutorial.duration}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">
              Step {currentStepIndex + 1} of {tutorial.steps.length}
            </span>
            <span className="text-slate-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-6"
          >
            <div className="bg-white rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {currentStepIndex + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-slate-900 mb-1">
                    {currentStep.title}
                  </h4>
                  <p className="text-slate-600 mb-3">
                    {currentStep.description}
                  </p>

                  {/* Action */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <MousePointer className="h-4 w-4" />
                      <span className="text-sm font-medium">{currentStep.action}</span>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{currentStep.tip}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <><Pause className="h-4 w-4 mr-1" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-1" /> Auto-play</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-slate-500"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip Tutorial
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}