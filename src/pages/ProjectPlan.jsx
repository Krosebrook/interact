import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const phaseIcons = {
  phase_1: Layers,
  phase_2: Gamepad2,
  phase_3: Sparkles,
  phase_4: FileText
};

const statusConfig = {
  planned: { color: 'bg-slate-100 text-slate-600', icon: Circle, label: 'Planned' },
  in_progress: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'In Progress' },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Completed' },
  blocked: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Blocked' }
};

export default function ProjectPlan() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const queryClient = useQueryClient();
  const [expandedPhases, setExpandedPhases] = React.useState({});

  const { data: phases, isLoading } = useQuery({
    queryKey: ['project-documentation'],
    queryFn: () => base44.entities.ProjectDocumentation.list(),
    enabled: !!user
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectDocumentation.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['project-documentation'])
  });

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const calculateProgress = (tasks) => {
    if (!tasks?.length) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const calculateSubtaskProgress = (subtasks) => {
    if (!subtasks?.length) return 0;
    const completed = subtasks.filter(s => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  if (userLoading || isLoading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const sortedPhases = [...(phases || [])].sort((a, b) => 
    a.phase.localeCompare(b.phase)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-int-navy mb-2">
              <span className="text-highlight">Project Development Plan</span>
            </h1>
            <p className="text-slate-600">
              Team Engage Platform - Full Feature Roadmap
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Overall Progress</p>
            <p className="text-2xl font-bold text-int-orange">
              {Math.round(sortedPhases.reduce((acc, p) => acc + calculateProgress(p.tasks), 0) / Math.max(sortedPhases.length, 1))}%
            </p>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {sortedPhases.map((phase) => {
          const PhaseIcon = phaseIcons[phase.phase] || FileText;
          const progress = calculateProgress(phase.tasks);
          const isExpanded = expandedPhases[phase.id];

          return (
            <div key={phase.id} className="glass-card-solid overflow-hidden">
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className={`p-3 rounded-xl bg-gradient-${phase.phase === 'phase_1' ? 'orange' : phase.phase === 'phase_2' ? 'purple' : 'navy'}`}>
                  <PhaseIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-bold text-int-navy">{phase.phase_name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge className={statusConfig[phase.status].color}>
                      {statusConfig[phase.status].label}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {phase.tasks?.length || 0} tasks
                    </span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-int-navy">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {/* Tasks */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  {phase.tasks?.map((task, idx) => {
                    const TaskStatus = statusConfig[task.status];
                    const subtaskProgress = calculateSubtaskProgress(task.subtasks);
                    
                    return (
                      <div 
                        key={task.task_id || idx}
                        className="bg-white rounded-lg p-4 border border-slate-100"
                      >
                        <div className="flex items-start gap-3">
                          <TaskStatus.icon className={`h-5 w-5 mt-0.5 ${
                            task.status === 'completed' ? 'text-emerald-600' :
                            task.status === 'in_progress' ? 'text-blue-600' :
                            'text-slate-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-slate-900">
                                {task.task_name}
                              </h3>
                              <Badge variant="outline" className={TaskStatus.color}>
                                {TaskStatus.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {task.description}
                            </p>
                            
                            {/* Subtasks */}
                            {task.subtasks?.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
                                  <span>{subtaskProgress}%</span>
                                </div>
                                <Progress value={subtaskProgress} className="h-1.5" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                                  {task.subtasks.map((subtask, sIdx) => (
                                    <div 
                                      key={sIdx}
                                      className={`flex items-center gap-2 text-xs ${
                                        subtask.completed ? 'text-emerald-600' : 'text-slate-500'
                                      }`}
                                    >
                                      {subtask.completed ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      ) : (
                                        <Circle className="h-3.5 w-3.5" />
                                      )}
                                      <span className={subtask.completed ? 'line-through' : ''}>
                                        {subtask.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Dependencies */}
                  {phase.dependencies?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        <span className="font-medium">Dependencies:</span> {phase.dependencies.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {phase.notes && (
                    <div className="pt-2 text-sm text-slate-600 italic">
                      {phase.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}