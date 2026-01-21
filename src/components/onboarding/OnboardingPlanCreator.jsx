import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus } from 'lucide-react';

export default function OnboardingPlanCreator({ onCreated }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    new_hire_email: '',
    role: '',
    department: '',
    start_date: '',
    duration_weeks: 12,
    manager_email: ''
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateOnboardingPlan', formData);
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (planData) => {
      // Create the plan
      const plan = await base44.entities.OnboardingPlan.create({
        ...formData,
        status: 'draft',
        completion_percentage: 0,
        key_milestones: planData.key_milestones,
        team_introductions: planData.team_introductions
      });

      // Create all tasks
      const tasks = await Promise.all(
        planData.tasks.map(task =>
          base44.entities.OnboardingTask.create({
            plan_id: plan.id,
            ...task,
            completed: false
          })
        )
      );

      return { plan, tasks };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['onboarding-plans']);
      onCreated?.(data.plan);
    }
  });

  const handleGenerate = async () => {
    const aiPlan = await generateMutation.mutateAsync();
    await createMutation.mutateAsync(aiPlan);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-600" />
          Create Onboarding Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">New Hire Email</label>
            <Input
              type="email"
              value={formData.new_hire_email}
              onChange={(e) => setFormData({ ...formData, new_hire_email: e.target.value })}
              placeholder="newhire@company.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Manager Email</label>
            <Input
              type="email"
              value={formData.manager_email}
              onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
              placeholder="manager@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Role/Title</label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Software Engineer"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Department</label>
            <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Customer Success">Customer Success</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Duration (weeks)</label>
            <Input
              type="number"
              value={formData.duration_weeks}
              onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
              min={4}
              max={24}
            />
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={generateMutation.isPending || createMutation.isPending}
          className="w-full bg-gradient-orange"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {generateMutation.isPending || createMutation.isPending ? 'Generating...' : 'Generate AI-Powered Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}