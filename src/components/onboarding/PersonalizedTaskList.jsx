import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, CheckCircle2, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedTaskList({ user }) {
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const queryClient = useQueryClient();

  const { data: onboardingRecord } = useQuery({
    queryKey: ['user-onboarding', user?.email],
    queryFn: async () => {
      const records = await base44.entities.UserOnboarding.filter({
        user_email: user?.email
      });
      return records[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: aiTasks, isLoading } = useQuery({
    queryKey: ['ai-onboarding-tasks', user?.email],
    queryFn: async () => {
      setGeneratingTasks(true);
      try {
        const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
          user_email: user.email,
          user_role: user.role === 'admin' ? 'admin' : user.user_type,
          action: 'generate_tasks'
        });
        return response.data.tasks || [];
      } finally {
        setGeneratingTasks(false);
      }
    },
    enabled: !!user?.email,
    staleTime: 3600000 // 1 hour
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      const currentTasks = onboardingRecord?.milestones_completed || [];
      
      if (completed) {
        // Add task
        const updatedTasks = [
          ...currentTasks,
          {
            day: currentTasks.length + 1,
            title: taskId,
            completed_date: new Date().toISOString()
          }
        ];
        
        if (onboardingRecord) {
          await base44.entities.UserOnboarding.update(onboardingRecord.id, {
            milestones_completed: updatedTasks,
            tasks_completed: updatedTasks.length
          });
        } else {
          await base44.entities.UserOnboarding.create({
            user_email: user.email,
            start_date: new Date().toISOString(),
            status: 'in_progress',
            milestones_completed: updatedTasks,
            tasks_completed: updatedTasks.length
          });
        }
      } else {
        // Remove task
        const updatedTasks = currentTasks.filter(t => t.title !== taskId);
        await base44.entities.UserOnboarding.update(onboardingRecord.id, {
          milestones_completed: updatedTasks,
          tasks_completed: updatedTasks.length
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-onboarding']);
      toast.success('Task updated');
    }
  });

  const completedTaskIds = onboardingRecord?.milestones_completed?.map(m => m.title) || [];
  const completedCount = aiTasks?.filter(t => completedTaskIds.includes(t.id)).length || 0;
  const totalTasks = aiTasks?.length || 0;
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-600" />
            Your Onboarding Tasks
          </CardTitle>
          <Badge variant="outline">
            {completedCount} / {totalTasks}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {generatingTasks && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Generating personalized tasks...
          </div>
        )}

        {aiTasks?.map(task => {
          const isCompleted = completedTaskIds.includes(task.id);
          
          return (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all ${
                isCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={(checked) =>
                    toggleTaskMutation.mutate({ taskId: task.id, completed: checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className={`font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.estimated_time}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                    {task.points && (
                      <Badge className="bg-amber-500 text-xs">
                        +{task.points} pts
                      </Badge>
                    )}
                  </div>

                  {isCompleted && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && totalTasks === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No tasks generated yet. Check back soon!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}