import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const CATEGORY_ICONS = {
  administrative: AlertCircle,
  technical: Clock,
  social: CheckCircle,
  learning: BookOpen,
  milestone: CheckCircle
};

const CATEGORY_COLORS = {
  administrative: 'bg-blue-100 text-blue-800',
  technical: 'bg-purple-100 text-purple-800',
  social: 'bg-green-100 text-green-800',
  learning: 'bg-yellow-100 text-yellow-800',
  milestone: 'bg-orange-100 text-orange-800'
};

export default function TaskChecklist({ tasks, weekFilter, canEdit = true }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      await base44.entities.OnboardingTask.update(taskId, {
        completed,
        completed_date: completed ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding-tasks']);
      queryClient.invalidateQueries(['onboarding-plans']);
    }
  });

  const filteredTasks = weekFilter 
    ? tasks.filter(t => t.week_number === weekFilter)
    : tasks;

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.week_number]) acc[task.week_number] = [];
    acc[task.week_number].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).sort(([a], [b]) => a - b).map(([week, weekTasks]) => (
        <div key={week}>
          <h3 className="font-semibold text-slate-900 mb-3">Week {week}</h3>
          <div className="space-y-2">
            {weekTasks.map(task => {
              const Icon = CATEGORY_ICONS[task.category] || Clock;
              return (
                <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {canEdit && (
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => 
                            updateMutation.mutate({ taskId: task.id, completed: checked })
                          }
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className={`font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Badge className={CATEGORY_COLORS[task.category]}>
                              <Icon className="w-3 h-3 mr-1" />
                              {task.category}
                            </Badge>
                            {task.priority === 'high' && (
                              <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                            )}
                          </div>
                        </div>

                        {task.due_date && (
                          <p className="text-xs text-slate-500 mb-2">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}

                        {task.knowledge_base_articles?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-slate-700 mb-1">Related Resources:</p>
                            <div className="flex flex-wrap gap-2">
                              {task.knowledge_base_articles.map((articleId, idx) => (
                                <Link
                                  key={idx}
                                  to={`${createPageUrl('KnowledgeBase')}?article=${articleId}`}
                                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  View Article
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.assignee !== 'new_hire' && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Assigned to: {task.assignee}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}