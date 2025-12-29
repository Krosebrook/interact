import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, CheckCircle, Award, Trophy, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModuleViewer from '../components/learning/ModuleViewer';
import { toast } from 'sonner';

export default function LearningPathPage() {
  const { user } = useUserData(true);
  const queryClient = useQueryClient();
  
  // Get path ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const pathId = urlParams.get('id');

  // Fetch learning path
  const { data: path, isLoading: loadingPath } = useQuery({
    queryKey: ['learning-path', pathId],
    queryFn: async () => {
      const paths = await base44.entities.LearningPath.filter({ id: pathId });
      return paths[0];
    },
    enabled: !!pathId
  });

  // Fetch modules for this path
  const { data: modules } = useQuery({
    queryKey: ['learning-modules', pathId],
    queryFn: () => base44.entities.LearningModule.filter({ learning_path_id: pathId }),
    enabled: !!pathId
  });

  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ['path-progress', pathId, user?.email],
    queryFn: async () => {
      const progs = await base44.entities.LearningPathProgress.filter({
        user_email: user?.email,
        learning_path_id: pathId
      });
      return progs[0];
    },
    enabled: !!pathId && !!user?.email
  });

  // Fetch module completions
  const { data: completions = [] } = useQuery({
    queryKey: ['module-completions', pathId, user?.email],
    queryFn: () => base44.entities.ModuleCompletion.filter({
      user_email: user?.email,
      learning_path_id: pathId
    }),
    enabled: !!pathId && !!user?.email
  });

  // AI progress analysis
  const { data: aiAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['learning-analysis', pathId, user?.email],
    queryFn: async () => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'analyze_progress',
        context: { learning_path_id: pathId }
      });
      return response.data.analysis;
    },
    enabled: false
  });

  const sortedModules = modules?.sort((a, b) => a.order - b.order) || [];
  const completedCount = completions.filter(c => c.status === 'completed').length;
  const totalModules = sortedModules.length;
  const progressPercentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  const handleModuleComplete = () => {
    queryClient.invalidateQueries(['module-completions']);
    queryClient.invalidateQueries(['path-progress']);
    
    // Check if all modules completed
    if (completedCount + 1 === totalModules) {
      toast.success('🎓 Learning Path Completed! Congratulations!');
    }
  };

  if (loadingPath) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading learning path..." />;
  }

  if (!path) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Learning path not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to={createPageUrl('LearningDashboard')}>
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning
        </Button>
      </Link>

      {/* Path Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{path.title}</CardTitle>
              <p className="text-slate-600 mb-3">{path.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge>{path.difficulty_level}</Badge>
                <Badge variant="outline">{path.target_skill}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {path.points_reward} points
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-semibold">{completedCount} / {totalModules} modules</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {completedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Progress Analysis
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchAnalysis()}
              >
                Analyze Progress
              </Button>
            </div>
          </CardHeader>
          {aiAnalysis && (
            <CardContent className="space-y-3">
              <p className="text-sm text-blue-900">{aiAnalysis.progress_assessment}</p>
              
              {aiAnalysis.strengths?.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">Strengths:</p>
                  <ul className="text-xs text-emerald-800 space-y-0.5">
                    {aiAnalysis.strengths.map((s, i) => (
                      <li key={i}>✓ {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis.next_steps?.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Next Steps:</p>
                  <ul className="text-xs text-blue-800 space-y-0.5">
                    {aiAnalysis.next_steps.map((s, i) => (
                      <li key={i}>→ {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-blue-800 italic">💪 {aiAnalysis.motivational_message}</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Learning Modules</h3>
        {sortedModules.map((module, idx) => {
          const isCompleted = completions.some(c => 
            c.module_id === module.id && c.status === 'completed'
          );
          const prerequisitesMet = module.prerequisites?.every(prereq => 
            completions.some(c => c.module_id === prereq && c.status === 'completed')
          ) ?? true;

          return (
            <div key={module.id} className="relative">
              {idx > 0 && (
                <div className="absolute left-6 -top-4 w-0.5 h-4 bg-slate-200" />
              )}
              <div className={!prerequisitesMet ? 'opacity-50 pointer-events-none' : ''}>
                <ModuleViewer
                  module={module}
                  userEmail={user?.email}
                  onComplete={handleModuleComplete}
                />
              </div>
              {!prerequisitesMet && (
                <Badge variant="outline" className="absolute top-4 right-4">
                  Locked
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Certificate */}
      {progressPercentage === 100 && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300">
          <CardContent className="py-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-emerald-800 mb-4">
              You've completed the {path.title} learning path!
            </p>
            <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-emerald-300">
              <Award className="h-5 w-5 text-amber-600" />
              <span className="font-bold text-lg text-emerald-900">
                +{path.points_reward} points earned
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}