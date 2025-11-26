import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  Users,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Settings,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  planned: { icon: Circle, color: 'bg-slate-100 text-slate-600', label: 'Planned' },
  in_progress: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
  blocked: { icon: AlertTriangle, color: 'bg-red-100 text-red-700', label: 'Blocked' }
};

const PHASE_ICONS = {
  phase_1: Layers,
  phase_2: Trophy,
  phase_3: Sparkles,
  phase_4: Target
};

export default function ProjectPlan() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const queryClient = useQueryClient();
  const [expandedPhases, setExpandedPhases] = useState(['phase_3']);
  const [activeView, setActiveView] = useState('phases');

  const { data: phases = [], isLoading } = useQuery({
    queryKey: ['project-documentation'],
    queryFn: () => base44.entities.ProjectDocumentation.list()
  });

  // Sort phases by phase number
  const sortedPhases = [...phases].sort((a, b) => {
    const aNum = parseInt(a.phase?.replace('phase_', '') || '0');
    const bNum = parseInt(b.phase?.replace('phase_', '') || '0');
    return aNum - bNum;
  });

  // Calculate overall progress
  const calculateProgress = (phase) => {
    if (!phase.tasks || phase.tasks.length === 0) return 0;
    const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / phase.tasks.length) * 100);
  };

  const calculateSubtaskProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(s => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const overallProgress = sortedPhases.length > 0
    ? Math.round(sortedPhases.reduce((sum, p) => sum + calculateProgress(p), 0) / sortedPhases.length)
    : 0;

  const completedPhases = sortedPhases.filter(p => p.status === 'completed').length;
  const totalTasks = sortedPhases.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
  const completedTasks = sortedPhases.reduce((sum, p) => 
    sum + (p.tasks?.filter(t => t.status === 'completed').length || 0), 0);

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  if (userLoading || isLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading project plan..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-int-navy/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-navy shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-int-navy font-display">
                  <span className="text-highlight-navy">Project Documentation</span>
                </h1>
                <p className="text-slate-600">Team Engage Platform Development Roadmap</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-purple text-white px-4 py-2">
                v3.0 - AI & Gamification
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-int-navy/10 to-blue-50 border-int-navy/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overall Progress</p>
                <p className="text-3xl font-bold text-int-navy">{overallProgress}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-navy shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <Progress value={overallProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Phases Complete</p>
                <p className="text-3xl font-bold text-emerald-600">{completedPhases}/{sortedPhases.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-wellness shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Tasks Complete</p>
                <p className="text-3xl font-bold text-purple-600">{completedTasks}/{totalTasks}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-purple shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-int-orange/10 to-amber-50 border-int-orange/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current Phase</p>
                <p className="text-xl font-bold text-int-orange">Phase 3</p>
                <p className="text-xs text-slate-500">AI & Gamification</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-orange shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase List */}
      <div className="space-y-4">
        {sortedPhases.map((phase, index) => {
          const isExpanded = expandedPhases.includes(phase.phase);
          const progress = calculateProgress(phase);
          const statusConfig = STATUS_CONFIG[phase.status] || STATUS_CONFIG.planned;
          const StatusIcon = statusConfig.icon;
          const PhaseIcon = PHASE_ICONS[phase.phase] || Layers;

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-2 transition-all ${
                phase.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' :
                phase.status === 'in_progress' ? 'border-blue-200 bg-blue-50/30' :
                'border-slate-200'
              }`}>
                {/* Phase Header */}
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => togglePhase(phase.phase)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-sm ${
                        phase.status === 'completed' ? 'bg-gradient-wellness' :
                        phase.status === 'in_progress' ? 'bg-gradient-icebreaker' :
                        'bg-slate-200'
                      }`}>
                        <PhaseIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            {phase.phase_name || phase.phase}
                          </h3>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {phase.tasks?.length || 0} tasks • {progress}% complete
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={progress} className="h-2" />
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                {isExpanded && phase.tasks && (
                  <div className="border-t border-slate-200 px-5 py-4 space-y-3">
                    {phase.tasks.map((task, taskIndex) => {
                      const taskStatus = STATUS_CONFIG[task.status] || STATUS_CONFIG.planned;
                      const TaskStatusIcon = taskStatus.icon;
                      const subtaskProgress = calculateSubtaskProgress(task);

                      return (
                        <div 
                          key={task.task_id}
                          className={`p-4 rounded-lg border ${
                            task.status === 'completed' ? 'bg-emerald-50/50 border-emerald-200' :
                            task.status === 'in_progress' ? 'bg-blue-50/50 border-blue-200' :
                            'bg-slate-50/50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <TaskStatusIcon className={`h-5 w-5 mt-0.5 ${
                                task.status === 'completed' ? 'text-emerald-600' :
                                task.status === 'in_progress' ? 'text-blue-600' :
                                'text-slate-400'
                              }`} />
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {task.task_id}: {task.task_name}
                                </h4>
                                <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                
                                {/* Subtasks */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="mt-3 space-y-1.5">
                                    {task.subtasks.map((subtask, stIndex) => (
                                      <div 
                                        key={stIndex}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        {subtask.completed ? (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                          <Circle className="h-4 w-4 text-slate-300" />
                                        )}
                                        <span className={subtask.completed ? 'text-slate-500 line-through' : 'text-slate-700'}>
                                          {subtask.name}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={taskStatus.color}>
                              {subtaskProgress}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })}

                    {/* Phase Notes */}
                    {phase.notes && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>Notes:</strong> {phase.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-int-navy" />
            Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Frontend</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  React 18 + TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  TailwindCSS + shadcn/ui
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Framer Motion Animations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  React Query State Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  PWA Support
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Backend</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Base44 Platform
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Entity-based Data Model
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Deno Backend Functions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  LLM Integration (OpenAI)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Real-time Notifications
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Integrations</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Microsoft Teams Webhooks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Email Notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Calendar Export (ICS)
                </li>
                <li className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-slate-300" />
                  Slack Integration
                </li>
                <li className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-slate-300" />
                  Google Calendar Sync
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}