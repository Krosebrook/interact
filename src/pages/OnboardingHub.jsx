/**
 * ONBOARDING HUB PAGE
 * Dedicated page for managing and viewing onboarding progress
 */

import React from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { useOnboarding } from '../components/onboarding/OnboardingProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function OnboardingHub() {
  const { user } = useUserData(true);
  const {
    onboardingState,
    isComplete,
    progress,
    steps,
    startOnboarding,
    restartOnboarding
  } = useOnboarding();

  const completedSteps = onboardingState?.completed_steps || [];
  const timeSpent = onboardingState?.total_time_spent || 0;
  const timeSpentMinutes = Math.floor(timeSpent / 60);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-int-navy mb-2 font-display">
              <span className="text-gradient-orange">Onboarding</span> Tutorial
            </h1>
            <p className="text-slate-600">
              Master INTeract with our interactive guided tour
            </p>
          </div>
          <Badge className={isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
            {isComplete ? 'Completed' : `${progress}% Complete`}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isComplete 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                    : 'bg-gradient-to-br from-int-orange to-int-gold'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{progress}%</span>
                  )}
                </div>
                
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {completedSteps.length}/{steps.length}
                </p>
                <p className="text-sm text-slate-500">Steps Completed</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <StatRow 
                  icon={<Clock className="h-4 w-4" />}
                  label="Time Spent"
                  value={`${timeSpentMinutes} min`}
                />
                <StatRow 
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Completion Rate"
                  value={`${progress}%`}
                />
                {onboardingState?.started_date && (
                  <StatRow 
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Started"
                    value={format(new Date(onboardingState.started_date), 'MMM d, yyyy')}
                  />
                )}
                {onboardingState?.completed_date && (
                  <StatRow 
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Completed"
                    value={format(new Date(onboardingState.completed_date), 'MMM d, yyyy')}
                  />
                )}
              </div>

              {isComplete && (
                <Button
                  onClick={restartOnboarding}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Restart Tutorial
                </Button>
              )}
            </CardContent>
          </Card>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                <CardContent className="pt-6 text-center">
                  <Award className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-900 mb-2">Tutorial Master!</h3>
                  <p className="text-sm text-slate-600">
                    You've completed the onboarding tutorial. You're ready to maximize your INTeract experience!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2">
          <OnboardingChecklist />
        </div>
      </div>

      {/* Tips & Resources */}
      {!isComplete && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-int-orange" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TipCard
                title="Take your time"
                description="There's no rush! Complete the tutorial at your own pace."
              />
              <TipCard
                title="Interactive learning"
                description="Click through the app as you follow along for hands-on experience."
              />
              <TipCard
                title="Skip if needed"
                description="Already familiar with a feature? Feel free to skip that step."
              />
              <TipCard
                title="Always accessible"
                description="Access this tutorial anytime from the Tutorial menu in the header."
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function TipCard({ title, description }) {
  return (
    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
      <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}