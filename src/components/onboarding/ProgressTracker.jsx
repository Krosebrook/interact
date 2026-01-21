import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

export default function ProgressTracker({ plan, tasks }) {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedMilestones = plan.key_milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = plan.key_milestones?.length || 0;

  const weeksSinceStart = Math.floor(
    (new Date() - new Date(plan.start_date)) / (1000 * 60 * 60 * 24 * 7)
  );

  const currentWeek = Math.max(1, Math.min(weeksSinceStart + 1, plan.duration_weeks));

  return (
    <div className="grid gap-4">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tasks Completed</span>
              <span className="text-2xl font-bold text-purple-600">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-xs text-slate-600 mt-1">{completionPercentage}% Complete</p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Week</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{currentWeek}/{plan.duration_weeks}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>Milestones</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{completedMilestones}/{totalMilestones}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-1">
                <Clock className="w-4 h-4" />
                <span>Status</span>
              </div>
              <Badge className={
                plan.status === 'completed' ? 'bg-green-600' :
                plan.status === 'active' ? 'bg-blue-600' :
                plan.status === 'paused' ? 'bg-yellow-600' : 'bg-slate-600'
              }>
                {plan.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Key Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.key_milestones?.map((milestone, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded ${
                  milestone.completed ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                <CheckCircle
                  className={`w-5 h-5 ${
                    milestone.completed ? 'text-green-600' : 'text-slate-400'
                  }`}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    milestone.completed ? 'text-green-900 line-through' : 'text-slate-900'
                  }`}>
                    {milestone.milestone}
                  </p>
                  <p className="text-xs text-slate-600">Week {milestone.week}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}