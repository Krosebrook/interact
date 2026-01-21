import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, TrendingUp } from 'lucide-react';
import OnboardingPlanCreator from '../components/onboarding/OnboardingPlanCreator';
import ProgressTracker from '../components/onboarding/ProgressTracker';
import TaskChecklist from '../components/onboarding/TaskChecklist';

export default function ManagerOnboardingDashboard() {
  const { user } = useUserData();
  const [showCreator, setShowCreator] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const { data: myPlans = [] } = useQuery({
    queryKey: ['manager-onboarding-plans', user?.email],
    queryFn: async () => {
      if (user?.role === 'admin') {
        return await base44.entities.OnboardingPlan.list('-created_date');
      }
      return await base44.entities.OnboardingPlan.filter({ manager_email: user.email });
    },
    enabled: !!user
  });

  const activePlans = myPlans.filter(p => p.status === 'active');
  const draftPlans = myPlans.filter(p => p.status === 'draft');

  const selectedPlan = myPlans.find(p => p.id === selectedPlanId);

  const { data: selectedTasks = [] } = useQuery({
    queryKey: ['plan-tasks', selectedPlanId],
    queryFn: async () => await base44.entities.OnboardingTask.filter({ plan_id: selectedPlanId }),
    enabled: !!selectedPlanId
  });

  if (showCreator) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setShowCreator(false)}>
          ← Back to Dashboard
        </Button>
        <OnboardingPlanCreator onCreated={(plan) => {
          setShowCreator(false);
          setSelectedPlanId(plan.id);
        }} />
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedPlanId(null)}>
            ← Back to All Plans
          </Button>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-900">{selectedPlan.role}</h2>
            <p className="text-sm text-slate-600">{selectedPlan.new_hire_email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskChecklist tasks={selectedTasks} canEdit={false} />
              </CardContent>
            </Card>
          </div>
          <div>
            <ProgressTracker plan={selectedPlan} tasks={selectedTasks} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-600" />
            Onboarding Management
          </h1>
          <p className="text-slate-600 mt-1">Track and manage new hire onboarding</p>
        </div>
        <Button onClick={() => setShowCreator(true)} className="bg-gradient-orange">
          <Plus className="w-4 h-4 mr-2" />
          New Onboarding Plan
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{activePlans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Draft Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{draftPlans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {activePlans.length > 0
                ? Math.round(activePlans.reduce((sum, p) => sum + p.completion_percentage, 0) / activePlans.length)
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Onboarding Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myPlans.map(plan => {
              const weeksSinceStart = Math.floor(
                (new Date() - new Date(plan.start_date)) / (1000 * 60 * 60 * 24 * 7)
              );
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{plan.new_hire_email}</h3>
                      <p className="text-sm text-slate-600">{plan.role} • {plan.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">Week {weeksSinceStart + 1}/{plan.duration_weeks}</p>
                      <p className="text-xs text-slate-500">Started {new Date(plan.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${plan.completion_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{plan.completion_percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}