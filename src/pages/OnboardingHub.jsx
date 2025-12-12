/**
 * ONBOARDING HUB
 * Central page for tutorials, quests, and progress tracking
 */

import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { useOnboarding } from '../components/onboarding/OnboardingProvider';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OnboardingQuestSystem from '../components/onboarding/OnboardingQuestSystem';
import InteractiveTutorial, { TUTORIALS } from '../components/onboarding/InteractiveTutorial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Trophy, 
  PlayCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Target,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function OnboardingHub() {
  const { user, loading, isAdmin, isFacilitator } = useUserData(true);
  const { 
    progress, 
    isComplete,
    completedStepsCount,
    totalStepsCount,
    restartOnboarding,
    startOnboarding 
  } = useOnboarding();

  const [activeTutorial, setActiveTutorial] = useState(null);
  const [completedTutorials, setCompletedTutorials] = useState([]);

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const userRole = isAdmin || isFacilitator ? 'admin' : 'participant';

  const availableTutorials = Object.values(TUTORIALS);

  const handleTutorialComplete = (tutorialId) => {
    setCompletedTutorials([...completedTutorials, tutorialId]);
    setActiveTutorial(null);
  };

  const handleTutorialSkip = (tutorialId) => {
    setActiveTutorial(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-int-navy font-display">
                Onboarding Hub
              </h1>
              <p className="text-slate-600">
                Complete tutorials and quests to master INTeract
              </p>
            </div>
          </div>

          {isComplete ? (
            <div className="text-right">
              <Badge className="bg-emerald-500 text-white text-lg px-4 py-2 mb-2">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Onboarding Complete
              </Badge>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restartOnboarding}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart Tutorial
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round(progress)}%
              </div>
              <p className="text-sm text-slate-600 mb-2">
                {completedStepsCount} of {totalStepsCount} steps
              </p>
              <Button
                onClick={startOnboarding}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue Tutorial
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {completedStepsCount}/{totalStepsCount}
                  </div>
                  <p className="text-sm text-slate-600">Tutorial Steps</p>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <PlayCircle className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {completedTutorials.length}/{availableTutorials.length}
                  </div>
                  <p className="text-sm text-slate-600">Interactive Tutorials</p>
                </div>
              </div>
              <Progress 
                value={(completedTutorials.length / availableTutorials.length) * 100} 
                className="h-2" 
              />
            </div>

            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-8 w-8 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {isComplete ? '100' : Math.round(progress)}%
                  </div>
                  <p className="text-sm text-slate-600">Overall Progress</p>
                </div>
              </div>
              <Progress value={isComplete ? 100 : progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tutorial */}
      {activeTutorial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <InteractiveTutorial
            tutorialId={activeTutorial}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
          />
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="quests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quests" className="gap-2">
            <Trophy className="h-4 w-4" />
            Onboarding Quests
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Interactive Tutorials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quests">
          <OnboardingQuestSystem 
            userEmail={user?.email} 
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="tutorials">
          <div className="grid gap-4">
            {availableTutorials.map((tutorial, idx) => {
              const isCompleted = completedTutorials.includes(tutorial.id);
              return (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`hover:shadow-lg transition-all ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/50' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-white" />
                            ) : (
                              <PlayCircle className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-900 mb-1">
                              {tutorial.title}
                            </h3>
                            <p className="text-sm text-slate-600 mb-2">
                              {tutorial.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                {tutorial.duration}
                              </Badge>
                              <Badge variant="outline">
                                {tutorial.steps.length} steps
                              </Badge>
                              {isCompleted && (
                                <Badge className="bg-emerald-500 text-white">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => setActiveTutorial(tutorial.id)}
                          variant={isCompleted ? 'outline' : 'default'}
                          className={!isCompleted ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' : ''}
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Review
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start Tutorial
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}