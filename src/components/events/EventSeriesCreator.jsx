import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Layers, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  X,
  Loader2,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

const SERIES_TYPES = [
  { value: 'workshop', label: 'Workshop Series', icon: '🛠️' },
  { value: 'course', label: 'Course', icon: '📚' },
  { value: 'bootcamp', label: 'Bootcamp', icon: '🚀' },
  { value: 'program', label: 'Program', icon: '📋' },
  { value: 'challenge', label: 'Challenge', icon: '🏆' }
];

export default function EventSeriesCreator({ open, onOpenChange, onSeriesCreated }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    series_name: '',
    description: '',
    series_type: 'workshop',
    total_sessions: 4,
    session_frequency: 'weekly',
    start_date: '',
    session_duration_minutes: 60,
    max_participants: 20,
    learning_objectives: [''],
    prerequisites: ''
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const createSeriesMutation = useMutation({
    mutationFn: async (data) => {
      // Create the series
      const series = await base44.entities.EventSeries.create({
        ...data,
        learning_objectives: data.learning_objectives.filter(o => o.trim()),
        status: 'draft'
      });

      // Generate individual events for the series
      const eventIds = [];
      const startDate = new Date(data.start_date);
      
      for (let i = 0; i < data.total_sessions; i++) {
        let sessionDate;
        switch (data.session_frequency) {
          case 'daily':
            sessionDate = addDays(startDate, i);
            break;
          case 'weekly':
            sessionDate = addWeeks(startDate, i);
            break;
          case 'biweekly':
            sessionDate = addWeeks(startDate, i * 2);
            break;
          case 'monthly':
            sessionDate = addMonths(startDate, i);
            break;
          default:
            sessionDate = addWeeks(startDate, i);
        }

        const event = await base44.entities.Event.create({
          title: `${data.series_name} - Session ${i + 1}`,
          activity_id: data.activity_id || '',
          scheduled_date: sessionDate.toISOString(),
          duration_minutes: data.session_duration_minutes,
          max_participants: data.max_participants,
          status: 'scheduled',
          magic_link: `series-${series.id}-session-${i + 1}-${Date.now()}`,
          is_recurring: true,
          recurring_series_id: series.id,
          recurrence_pattern: {
            frequency: data.session_frequency,
            occurrence_number: i + 1,
            total_occurrences: data.total_sessions
          },
          points_awarded: data.points_per_session || 15
        });
        eventIds.push(event.id);
      }

      // Update series with event IDs
      await base44.entities.EventSeries.update(series.id, {
        event_ids: eventIds,
        end_date: eventIds.length > 0 ? 
          addWeeks(startDate, data.total_sessions - 1).toISOString() : 
          startDate.toISOString()
      });

      return series;
    },
    onSuccess: (series) => {
      queryClient.invalidateQueries(['event-series']);
      queryClient.invalidateQueries(['events']);
      toast.success('Event series created!');
      onSeriesCreated?.(series);
      onOpenChange(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      series_name: '',
      description: '',
      series_type: 'workshop',
      total_sessions: 4,
      session_frequency: 'weekly',
      start_date: '',
      session_duration_minutes: 60,
      max_participants: 20,
      learning_objectives: [''],
      prerequisites: ''
    });
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: [...prev.learning_objectives, '']
    }));
  };

  const updateObjective = (index, value) => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.map((obj, i) => 
        i === index ? value : obj
      )
    }));
  };

  const removeObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }));
  };

  const calculateEndDate = () => {
    if (!formData.start_date) return null;
    const start = new Date(formData.start_date);
    switch (formData.session_frequency) {
      case 'daily':
        return addDays(start, formData.total_sessions - 1);
      case 'weekly':
        return addWeeks(start, formData.total_sessions - 1);
      case 'biweekly':
        return addWeeks(start, (formData.total_sessions - 1) * 2);
      case 'monthly':
        return addMonths(start, formData.total_sessions - 1);
      default:
        return addWeeks(start, formData.total_sessions - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="eventseriescreator">
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-int-orange" />
            Create Event Series
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-int-orange text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-int-orange' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Series Name</Label>
              <Input
                value={formData.series_name}
                onChange={(e) => setFormData(prev => ({ ...prev, series_name: e.target.value }))}
                placeholder="e.g., Leadership Skills Workshop"
              />
            </div>

            <div>
              <Label>Series Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {SERIES_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData(prev => ({ ...prev, series_type: type.value }))}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.series_type === type.value
                        ? 'border-int-orange bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl mr-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What will participants learn and accomplish?"
                rows={3}
              />
            </div>

            <div>
              <Label>Base Activity (Optional)</Label>
              <Select
                value={formData.activity_id}
                onValueChange={(val) => setFormData(prev => ({ ...prev, activity_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity template" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map(activity => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number of Sessions</Label>
                <Input
                  type="number"
                  value={formData.total_sessions}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_sessions: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={52}
                />
              </div>
              <div>
                <Label>Session Frequency</Label>
                <Select
                  value={formData.session_frequency}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, session_frequency: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Session Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.session_duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, session_duration_minutes: parseInt(e.target.value) || 60 }))}
                  min={15}
                  step={15}
                />
              </div>
            </div>

            {formData.start_date && (
              <Card className="p-4 bg-slate-50">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Series Schedule:</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {formData.total_sessions} sessions, {formData.session_frequency}, starting {format(new Date(formData.start_date), 'PPP')}
                </p>
                {calculateEndDate() && (
                  <p className="text-sm text-slate-500">
                    Ending approximately {format(calculateEndDate(), 'PPP')}
                  </p>
                )}
              </Card>
            )}

            <div>
              <Label>Max Participants</Label>
              <Input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 20 }))}
                min={1}
              />
            </div>
          </div>
        )}

        {/* Step 3: Learning Objectives */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Objectives
              </Label>
              <p className="text-sm text-slate-500 mb-2">What will participants learn?</p>
              <div className="space-y-2">
                {formData.learning_objectives.map((obj, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={obj}
                      onChange={(e) => updateObjective(idx, e.target.value)}
                      placeholder={`Objective ${idx + 1}`}
                    />
                    {formData.learning_objectives.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeObjective(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addObjective} className="mt-2">
                <Plus className="h-4 w-4 mr-1" /> Add Objective
              </Button>
            </div>

            <div>
              <Label>Prerequisites (Optional)</Label>
              <Textarea
                value={formData.prerequisites}
                onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                placeholder="Any required knowledge or skills?"
                rows={2}
              />
            </div>

            {/* Summary */}
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <h4 className="font-semibold mb-2">Series Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-500" />
                  <span>{formData.series_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{formData.total_sessions} sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>{formData.session_duration_minutes} min each</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span>Max {formData.max_participants}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button 
              onClick={() => setStep(s => s + 1)} 
              className="flex-1 bg-int-orange hover:bg-[#C46322]"
              disabled={step === 1 && !formData.series_name}
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={() => createSeriesMutation.mutate(formData)}
              disabled={createSeriesMutation.isLoading || !formData.start_date}
              className="flex-1 bg-int-orange hover:bg-[#C46322]"
            >
              {createSeriesMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Layers className="h-4 w-4 mr-2" />
              )}
              Create Series
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}