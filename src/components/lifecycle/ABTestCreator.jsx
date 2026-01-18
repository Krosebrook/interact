import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Beaker } from 'lucide-react';

export default function ABTestCreator({ onTestCreated }) {
  const queryClient = useQueryClient();
  const [testData, setTestData] = useState({
    test_name: '',
    description: '',
    intervention_id: '',
    lifecycle_state: 'at_risk',
    status: 'draft',
    sample_size_target: 100,
    variants: [
      { variant_id: 'control', name: 'Control', message: '', surface: 'banner', timing_delay_hours: 0, traffic_allocation: 50 },
      { variant_id: 'treatment_a', name: 'Treatment A', message: '', surface: 'banner', timing_delay_hours: 0, traffic_allocation: 50 }
    ],
    target_criteria: {
      min_days_in_state: 1,
      max_days_in_state: 30
    },
    success_metrics: {
      primary_metric: 'click_through_rate',
      secondary_metrics: ['action_completion', 'state_transition']
    }
  });

  const createTestMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ABTest.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ab-tests']);
      if (onTestCreated) onTestCreated();
    }
  });

  const addVariant = () => {
    const newVariant = {
      variant_id: `treatment_${String.fromCharCode(65 + testData.variants.length - 1)}`.toLowerCase(),
      name: `Treatment ${String.fromCharCode(65 + testData.variants.length - 1)}`,
      message: '',
      surface: 'banner',
      timing_delay_hours: 0,
      traffic_allocation: 0
    };
    setTestData({
      ...testData,
      variants: [...testData.variants, newVariant]
    });
  };

  const updateVariant = (index, field, value) => {
    const updated = [...testData.variants];
    updated[index][field] = value;
    setTestData({ ...testData, variants: updated });
  };

  const removeVariant = (index) => {
    const updated = testData.variants.filter((_, i) => i !== index);
    setTestData({ ...testData, variants: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTestMutation.mutate(testData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-purple-600" />
          Create A/B Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Test Name</Label>
              <Input
                value={testData.test_name}
                onChange={(e) => setTestData({ ...testData, test_name: e.target.value })}
                placeholder="e.g., at_risk_messaging_v1"
                required
              />
            </div>
            <div>
              <Label>Lifecycle State</Label>
              <Select
                value={testData.lifecycle_state}
                onValueChange={(value) => setTestData({ ...testData, lifecycle_state: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="at_risk">At-Risk</SelectItem>
                  <SelectItem value="dormant">Dormant</SelectItem>
                  <SelectItem value="returning">Returning</SelectItem>
                  <SelectItem value="engaged">Engaged</SelectItem>
                  <SelectItem value="power_user">Power User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              placeholder="What are you testing?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Primary Metric</Label>
              <Select
                value={testData.success_metrics.primary_metric}
                onValueChange={(value) => setTestData({
                  ...testData,
                  success_metrics: { ...testData.success_metrics, primary_metric: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="click_through_rate">Click-Through Rate</SelectItem>
                  <SelectItem value="action_completion">Action Completion</SelectItem>
                  <SelectItem value="state_transition">State Transition</SelectItem>
                  <SelectItem value="churn_reduction">Churn Reduction</SelectItem>
                  <SelectItem value="session_increase">Session Increase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sample Size Target</Label>
              <Input
                type="number"
                value={testData.sample_size_target}
                onChange={(e) => setTestData({ ...testData, sample_size_target: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Min Days in State</Label>
              <Input
                type="number"
                value={testData.target_criteria.min_days_in_state}
                onChange={(e) => setTestData({
                  ...testData,
                  target_criteria: { ...testData.target_criteria, min_days_in_state: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Variants</Label>
              <Button type="button" size="sm" variant="outline" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </div>

            {testData.variants.map((variant, idx) => (
              <Card key={idx} className="bg-slate-50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                      className="w-48"
                      placeholder="Variant name"
                    />
                    {idx > 1 && (
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeVariant(idx)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={variant.message}
                    onChange={(e) => updateVariant(idx, 'message', e.target.value)}
                    placeholder="Intervention message"
                    rows={2}
                    className="mb-2"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={variant.surface}
                      onValueChange={(value) => updateVariant(idx, 'surface', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="toast">Toast</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="modal_on_login">Modal on Login</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={variant.timing_delay_hours}
                      onChange={(e) => updateVariant(idx, 'timing_delay_hours', parseInt(e.target.value))}
                      placeholder="Delay (hrs)"
                    />
                    <Input
                      type="number"
                      value={variant.traffic_allocation}
                      onChange={(e) => updateVariant(idx, 'traffic_allocation', parseInt(e.target.value))}
                      placeholder="Traffic %"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={createTestMutation.isLoading}>
              {createTestMutation.isLoading ? 'Creating...' : 'Create Test'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}