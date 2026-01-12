import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Save, 
  ListChecks, 
  MessageSquare, 
  Lightbulb,
  Clock,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'team_building', label: 'Team Building' },
  { value: 'training', label: 'Training' },
  { value: 'social', label: 'Social Event' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'custom', label: 'Custom' }
];

const TIMING_OPTIONS = [
  { value: '1_week_before', label: '1 Week Before' },
  { value: '3_days_before', label: '3 Days Before' },
  { value: '1_day_before', label: '1 Day Before' },
  { value: '1_hour_before', label: '1 Hour Before' },
  { value: 'after_event', label: 'After Event' }
];

export default function EventTemplateEditor({ open, onOpenChange, template, onSaved }) {
  const queryClient = useQueryClient();
  const isEditing = !!template?.id;

  const getInitialFormData = (tmpl) => tmpl || {
    name: '',
    description: '',
    category: 'custom',
    icon: '📋',
    default_duration_minutes: 60,
    default_max_participants: null,
    description_draft: '',
    agenda: [],
    icebreakers: [],
    communication_schedule: [],
    preparation_checklist: [],
    materials_needed: [],
    facilitator_tips: [],
    is_active: true
  };

  const [formData, setFormData] = useState(getInitialFormData(template));

  // Reset form when template changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(template));
    }
  }, [open, template]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return base44.entities.EventTemplate.update(template.id, data);
      }
      return base44.entities.EventTemplate.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-templates']);
      toast.success(isEditing ? 'Template updated!' : 'Template created!');
      onSaved?.();
      onOpenChange(false);
    }
  });

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...(prev.agenda || []), { title: '', duration_minutes: 10, description: '' }]
    }));
  };

  const updateAgendaItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const addIcebreaker = () => {
    setFormData(prev => ({
      ...prev,
      icebreakers: [...(prev.icebreakers || []), { title: '', description: '', duration_minutes: 5 }]
    }));
  };

  const updateIcebreaker = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      icebreakers: prev.icebreakers.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeIcebreaker = (index) => {
    setFormData(prev => ({
      ...prev,
      icebreakers: prev.icebreakers.filter((_, i) => i !== index)
    }));
  };

  const addCommunication = () => {
    setFormData(prev => ({
      ...prev,
      communication_schedule: [...(prev.communication_schedule || []), {
        timing: '1_day_before',
        type: 'reminder',
        subject_template: '',
        body_template: ''
      }]
    }));
  };

  const updateCommunication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      communication_schedule: prev.communication_schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeCommunication = (index) => {
    setFormData(prev => ({
      ...prev,
      communication_schedule: prev.communication_schedule.filter((_, i) => i !== index)
    }));
  };

  const addChecklist = () => {
    setFormData(prev => ({
      ...prev,
      preparation_checklist: [...(prev.preparation_checklist || []), { task: '', days_before: 1 }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="eventtemplateeditor">
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Create Event Template'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="icebreakers">Icebreakers</TabsTrigger>
              <TabsTrigger value="comms">Communications</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Product Workshop"
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Icon</Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="📋"
                  />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={formData.default_duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_duration_minutes: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Max Participants</Label>
                  <Input
                    type="number"
                    value={formData.default_max_participants || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_max_participants: e.target.value ? parseInt(e.target.value) : null }))}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div>
                <Label>Short Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this template..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Event Description Draft</Label>
                <Textarea
                  value={formData.description_draft}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_draft: e.target.value }))}
                  placeholder="Pre-written event description that will be used when creating events..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Facilitator Tips</Label>
                <div className="space-y-2">
                  {(formData.facilitator_tips || []).map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={tip}
                        onChange={(e) => {
                          const tips = [...formData.facilitator_tips];
                          tips[i] = e.target.value;
                          setFormData(prev => ({ ...prev, facilitator_tips: tips }));
                        }}
                        placeholder="Tip for facilitators..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          facilitator_tips: prev.facilitator_tips.filter((_, idx) => idx !== i)
                        }));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      facilitator_tips: [...(prev.facilitator_tips || []), '']
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Tip
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Agenda */}
            <TabsContent value="agenda" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Agenda Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAgendaItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {(formData.agenda || []).map((item, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={item.title}
                          onChange={(e) => updateAgendaItem(i, 'title', e.target.value)}
                          placeholder="Agenda item title"
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={item.duration_minutes}
                            onChange={(e) => updateAgendaItem(i, 'duration_minutes', parseInt(e.target.value))}
                            className="w-24"
                            placeholder="Min"
                          />
                          <Input
                            value={item.description}
                            onChange={(e) => updateAgendaItem(i, 'description', e.target.value)}
                            placeholder="Description (optional)"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAgendaItem(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {(formData.agenda || []).length === 0 && (
                  <p className="text-center text-slate-500 py-4">No agenda items yet</p>
                )}
              </div>
            </TabsContent>

            {/* Icebreakers */}
            <TabsContent value="icebreakers" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Icebreaker Activities</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIcebreaker}>
                  <Plus className="h-4 w-4 mr-1" /> Add Icebreaker
                </Button>
              </div>
              
              <div className="space-y-3">
                {(formData.icebreakers || []).map((item, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={item.title}
                            onChange={(e) => updateIcebreaker(i, 'title', e.target.value)}
                            placeholder="Icebreaker name"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={item.duration_minutes}
                            onChange={(e) => updateIcebreaker(i, 'duration_minutes', parseInt(e.target.value))}
                            className="w-20"
                            placeholder="Min"
                          />
                        </div>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateIcebreaker(i, 'description', e.target.value)}
                          placeholder="Instructions for this icebreaker..."
                          rows={2}
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIcebreaker(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {(formData.icebreakers || []).length === 0 && (
                  <p className="text-center text-slate-500 py-4">No icebreakers added</p>
                )}
              </div>
            </TabsContent>

            {/* Communications */}
            <TabsContent value="comms" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Communication Schedule</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCommunication}>
                  <Plus className="h-4 w-4 mr-1" /> Add Message
                </Button>
              </div>
              
              <div className="space-y-3">
                {(formData.communication_schedule || []).map((item, i) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Select
                          value={item.timing}
                          onValueChange={(v) => updateCommunication(i, 'timing', v)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMING_OPTIONS.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={item.type}
                          onValueChange={(v) => updateCommunication(i, 'type', v)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="preparation">Preparation</SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="feedback_request">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCommunication(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={item.subject_template}
                        onChange={(e) => updateCommunication(i, 'subject_template', e.target.value)}
                        placeholder="Email subject template..."
                      />
                      <Textarea
                        value={item.body_template}
                        onChange={(e) => updateCommunication(i, 'body_template', e.target.value)}
                        placeholder="Message body template... Use {event_name}, {date}, {time} placeholders"
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
                {(formData.communication_schedule || []).length === 0 && (
                  <p className="text-center text-slate-500 py-4">No scheduled messages</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </form>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saveMutation.isLoading}>
            <Save className="h-4 w-4 mr-1" /> {isEditing ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}