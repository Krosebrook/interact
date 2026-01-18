import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SegmentBuilder({ onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [segmentData, setSegmentData] = useState({
    segment_name: '',
    description: '',
    criteria: {
      lifecycle_states: [],
      churn_risk_min: 0,
      churn_risk_max: 100,
      days_in_state_min: 0,
      days_in_state_max: 365,
      behavioral_data: {
        session_frequency_min: 0
      }
    }
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (data) => {
      const segment = await base44.entities.UserSegment.create(data);
      
      // Calculate initial user count
      await base44.functions.invoke('segmentationEngine', {
        action: 'calculate_segment',
        segment_id: segment.id
      });
      
      return segment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-segments'] });
      toast.success('Segment created successfully');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to create segment: ' + error.message);
    }
  });

  const toggleLifecycleState = (state) => {
    const current = segmentData.criteria.lifecycle_states || [];
    const updated = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    
    setSegmentData({
      ...segmentData,
      criteria: { ...segmentData.criteria, lifecycle_states: updated }
    });
  };

  const lifecycleStates = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { value: 'activated', label: 'Activated', color: 'bg-green-100 text-green-700' },
    { value: 'engaged', label: 'Engaged', color: 'bg-purple-100 text-purple-700' },
    { value: 'power_user', label: 'Power User', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'at_risk', label: 'At Risk', color: 'bg-orange-100 text-orange-700' },
    { value: 'dormant', label: 'Dormant', color: 'bg-red-100 text-red-700' },
    { value: 'returning', label: 'Returning', color: 'bg-teal-100 text-teal-700' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Create User Segment
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Segment Name</Label>
            <Input
              value={segmentData.segment_name}
              onChange={(e) => setSegmentData({ ...segmentData, segment_name: e.target.value })}
              placeholder="e.g., High-Risk Dormant Users"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={segmentData.description}
              onChange={(e) => setSegmentData({ ...segmentData, description: e.target.value })}
              placeholder="Describe this segment..."
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Lifecycle States</Label>
          <div className="flex flex-wrap gap-2">
            {lifecycleStates.map(state => (
              <button
                key={state.value}
                type="button"
                onClick={() => toggleLifecycleState(state.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  segmentData.criteria.lifecycle_states?.includes(state.value)
                    ? state.color + ' ring-2 ring-offset-2'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Churn Risk (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={segmentData.criteria.churn_risk_min}
              onChange={(e) => setSegmentData({
                ...segmentData,
                criteria: { ...segmentData.criteria, churn_risk_min: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div>
            <Label>Max Churn Risk (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={segmentData.criteria.churn_risk_max}
              onChange={(e) => setSegmentData({
                ...segmentData,
                criteria: { ...segmentData.criteria, churn_risk_max: parseInt(e.target.value) || 100 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Days in State</Label>
            <Input
              type="number"
              min="0"
              value={segmentData.criteria.days_in_state_min}
              onChange={(e) => setSegmentData({
                ...segmentData,
                criteria: { ...segmentData.criteria, days_in_state_min: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div>
            <Label>Max Days in State</Label>
            <Input
              type="number"
              min="0"
              value={segmentData.criteria.days_in_state_max}
              onChange={(e) => setSegmentData({
                ...segmentData,
                criteria: { ...segmentData.criteria, days_in_state_max: parseInt(e.target.value) || 365 }
              })}
            />
          </div>
        </div>

        <div>
          <Label>Min Sessions per Week</Label>
          <Input
            type="number"
            min="0"
            value={segmentData.criteria.behavioral_data.session_frequency_min}
            onChange={(e) => setSegmentData({
              ...segmentData,
              criteria: {
                ...segmentData.criteria,
                behavioral_data: {
                  ...segmentData.criteria.behavioral_data,
                  session_frequency_min: parseInt(e.target.value) || 0
                }
              }
            })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={() => createSegmentMutation.mutate(segmentData)}
            disabled={createSegmentMutation.isPending || !segmentData.segment_name}
          >
            <Save className="w-4 h-4 mr-2" />
            {createSegmentMutation.isPending ? 'Creating...' : 'Create Segment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}