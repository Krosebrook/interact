import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Clock, 
  Award,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';

export default function LearningPathCard({ path, progress, userEmail }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const { trigger } = useGamificationTrigger();

  const startPathMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.LearningPathProgress.create({
        user_email: userEmail,
        learning_path_id: path.id,
        status: 'in_progress',
        started_date: new Date().toISOString(),
        progress_percentage: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-progress']);
      toast.success('Learning path started!');
    }
  });

  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestoneId) => {
      const newCompleted = [
        ...(progress.milestones_completed || []),
        { milestone_id: milestoneId, completed_date: new Date().toISOString() }
      ];
      const progressPercent = (newCompleted.length / path.milestones.length) * 100;

      return await base44.entities.LearningPathProgress.update(progress.id, {
        milestones_completed: newCompleted,
        progress_percentage: progressPercent,
        last_activity_date: new Date().toISOString(),
        status: progressPercent === 100 ? 'completed' : 'in_progress',
        completed_date: progressPercent === 100 ? new Date().toISOString() : null
      });
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries(['learning-progress']);
      if (data.status === 'completed') {
        await trigger('activity_completion', userEmail, { 
          reference_id: path.id,
          points: path.points_reward || 100
        });
        toast.success(`🎉 Path completed! +${path.points_reward || 100} points`);
      } else {
        toast.success('Milestone completed!');
      }
    }
  });

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800'
  };

  const completedMilestoneIds = progress?.milestones_completed?.map(m => m.milestone_id) || [];
  const progressPercent = progress?.progress_percentage || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{path.title}</CardTitle>
            <p className="text-sm text-slate-600">{path.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={difficultyColors[path.difficulty_level]}>
                {path.difficulty_level}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {path.estimated_duration}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Award className="h-3 w-3" />
                {path.points_reward} pts
              </Badge>
            </div>
          </div>
          {!progress && (
            <Button
              onClick={() => startPathMutation.mutate()}
              disabled={startPathMutation.isPending}
              size="sm"
              className="bg-int-orange hover:bg-int-orange/90"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
        </div>
      </CardHeader>

      {progress && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <Button
              onClick={() => setExpanded(!expanded)}
              variant="ghost"
              size="sm"
              className="w-full justify-between"
            >
              <span>
                {completedMilestoneIds.length}/{path.milestones?.length || 0} Milestones
              </span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {expanded && (
              <div className="space-y-3 pt-2">
                {path.milestones?.sort((a, b) => a.order - b.order).map((milestone) => {
                  const isCompleted = completedMilestoneIds.includes(milestone.id);
                  const resources = path.resources?.filter(r => r.milestone_id === milestone.id) || [];

                  return (
                    <div key={milestone.id} className={`p-3 rounded-lg border ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => !isCompleted && completeMilestoneMutation.mutate(milestone.id)}
                          disabled={isCompleted || completeMilestoneMutation.isPending}
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-int-orange'
                          }`}
                        >
                          {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <h5 className={`font-medium text-sm ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {milestone.title}
                          </h5>
                          <p className="text-xs text-slate-600 mt-1">{milestone.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {milestone.estimated_hours}h
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {resources.length} resources
                            </Badge>
                          </div>
                          {resources.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {resources.map((resource, idx) => (
                                <div key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                                  <Circle className="h-2 w-2" />
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:text-int-orange">
                                    {resource.title}
                                  </a>
                                  <span className="text-slate-400">({resource.type})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}