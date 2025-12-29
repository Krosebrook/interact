import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Brain, Trophy, TrendingUp, Target, Sparkles, Zap } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import AILearningRecommendations from './AILearningRecommendations';
import LearningPathCard from './LearningPathCard';
import MyLearningProgress from './MyLearningProgress';
import SkillGapMicroLearning from './SkillGapMicroLearning';

export default function GamifiedLearningDashboard({ userEmail }) {
  const [activeTab, setActiveTab] = useState('explore');

  // Fetch all learning paths
  const { data: allPaths, isLoading: loadingPaths } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => base44.entities.LearningPath.list()
  });

  // Fetch user's enrolled paths
  const { data: myProgress } = useQuery({
    queryKey: ['my-learning-progress', userEmail],
    queryFn: () => base44.entities.LearningPathProgress.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Fetch user points for gamification stats
  const { data: userPoints } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0];
    },
    enabled: !!userEmail
  });

  if (loadingPaths) {
    return <LoadingSpinner message="Loading learning paths..." />;
  }

  const enrolledPathIds = myProgress?.map(p => p.learning_path_id) || [];
  const availablePaths = allPaths?.filter(p => !enrolledPathIds.includes(p.id)) || [];
  const inProgressPaths = myProgress?.filter(p => p.status === 'in_progress') || [];
  const completedPaths = myProgress?.filter(p => p.status === 'completed') || [];

  const totalPointsFromLearning = myProgress?.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-int-navy">{inProgressPaths.length}</p>
                <p className="text-xs text-slate-600">Active Paths</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-700">{completedPaths.length}</p>
                <p className="text-xs text-slate-600">Completed</p>
              </div>
              <Trophy className="h-8 w-8 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{Math.round(totalPointsFromLearning)}</p>
                <p className="text-xs text-slate-600">Learning Points</p>
              </div>
              <Target className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-700">{userPoints?.tier || 'Bronze'}</p>
                <p className="text-xs text-slate-600">Current Tier</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explore" className="gap-2">
            <Brain className="h-4 w-4" />
            Explore
          </TabsTrigger>
          <TabsTrigger value="my-learning" className="gap-2">
            <BookOpen className="h-4 w-4" />
            My Learning ({inProgressPaths.length})
          </TabsTrigger>
          <TabsTrigger value="ai-suggestions" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="quick-wins" className="gap-2">
            <Zap className="h-4 w-4" />
            Quick Wins
          </TabsTrigger>
        </TabsList>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Available Learning Paths</h3>
            <Badge variant="outline">{availablePaths.length} paths</Badge>
          </div>
          
          {availablePaths.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">All paths enrolled!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availablePaths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  userEmail={userEmail}
                  isEnrolled={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Learning Tab */}
        <TabsContent value="my-learning" className="space-y-4 mt-6">
          <MyLearningProgress
            userEmail={userEmail}
            progress={myProgress}
            allPaths={allPaths}
          />
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai-suggestions" className="mt-6">
          <AILearningRecommendations
            userEmail={userEmail}
            availablePaths={availablePaths}
          />
        </TabsContent>

        {/* Quick Wins Tab */}
        <TabsContent value="quick-wins" className="mt-6">
          <SkillGapMicroLearning userEmail={userEmail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}