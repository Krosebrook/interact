/**
 * ONBOARDING CHECKLIST
 * Compact checklist widget showing onboarding progress
 */

import React from 'react';
import { useOnboarding } from './OnboardingProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingChecklist({ compact = false }) {
  const {
    steps,
    onboardingState,
    progress,
    isComplete,
    startOnboarding,
    restartOnboarding
  } = useOnboarding();

  const completedSteps = onboardingState?.completed_steps || [];
  const skippedSteps = onboardingState?.skipped_steps || [];

  if (compact) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-int-orange" />
              Getting Started
            </CardTitle>
            <Badge variant={isComplete ? 'default' : 'outline'} className="text-xs">
              {progress}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2 mb-3" />
          <p className="text-xs text-slate-600 mb-3">
            {isComplete 
              ? 'All done! You\'re ready to go.' 
              : `${steps.length - completedSteps.length} steps remaining`}
          </p>
          {!isComplete && (
            <Button
              size="sm"
              onClick={startOnboarding}
              className="w-full bg-int-orange hover:bg-int-orange/90"
            >
              Continue Tutorial
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-int-orange" />
            Onboarding Progress
          </span>
          <Badge className={isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
            {progress}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-3 mb-6" />

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isSkipped = skippedSteps.includes(step.id);
            const isCurrent = onboardingState?.current_step === step.id;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-int-orange/10 border border-int-orange/30' : 
                  isCompleted ? 'bg-emerald-50' :
                  'bg-slate-50'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Circle className={`h-5 w-5 ${isCurrent ? 'text-int-orange' : 'text-slate-300'}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {step.estimatedTime && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.estimatedTime}
                      </Badge>
                    )}
                    {isSkipped && (
                      <Badge variant="outline" className="text-xs text-slate-500">
                        Skipped
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {isComplete ? (
          <div className="mt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Onboarding Complete! 🎉</h3>
            <p className="text-sm text-slate-600 mb-4">
              You're ready to start engaging with your team.
            </p>
            <Button
              variant="outline"
              onClick={restartOnboarding}
              className="gap-2"
            >
              Restart Tutorial
            </Button>
          </div>
        ) : (
          <Button
            onClick={startOnboarding}
            className="w-full mt-6 bg-int-orange hover:bg-int-orange/90"
          >
            {completedSteps.length > 0 ? 'Continue Tutorial' : 'Start Tutorial'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon: Icon, label }) {
  return (
    <div className="p-3 rounded-lg bg-white border border-slate-200">
      <Icon className="h-5 w-5 text-int-orange mx-auto mb-1" />
      <p className="text-xs font-medium text-slate-700">{label}</p>
    </div>
  );
}

function GoalSelector() {
  const [goals, setGoals] = useState([]);

  const availableGoals = [
    'Connect with remote teammates',
    'Learn new skills',
    'Earn rewards and recognition',
    'Join wellness activities',
    'Network across departments',
    'Have fun at work'
  ];

  const toggleGoal = (goal) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="space-y-2">
      {availableGoals.map((goal, idx) => (
        <button
          key={idx}
          onClick={() => toggleGoal(goal)}
          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
            goals.includes(goal)
              ? 'border-int-orange bg-int-orange/5'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              goals.includes(goal)
                ? 'border-int-orange bg-int-orange'
                : 'border-slate-300'
            }`}>
              {goals.includes(goal) && (
                <CheckCircle2 className="h-3 w-3 text-white" />
              )}
            </div>
            <span className={`text-sm ${goals.includes(goal) ? 'text-int-navy font-medium' : 'text-slate-600'}`}>
              {goal}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}