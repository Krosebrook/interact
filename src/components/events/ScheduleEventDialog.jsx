/**
 * SCHEDULE EVENT DIALOG
 * Extracted dialog component for event scheduling
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import RecurrenceSettings from './RecurrenceSettings';
import TimeSlotSuggestions from './TimeSlotSuggestions';
import RichTextEventEditor from './RichTextEventEditor';
import EventTypeConditionalFields, { EVENT_TYPES } from './EventTypeConditionalFields';
import { toast } from 'sonner';

export default function ScheduleEventDialog({
  open,
  onOpenChange,
  activities = [],
  formData,
  setFormData,
  recurrenceSettings,
  setRecurrenceSettings,
  onSubmit,
  isSubmitting = false
}) {
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleActivitySelect = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    setFormData(prev => ({
      ...prev,
      activity_id: activityId,
      title: activity?.title || ''
    }));
  };

  const handleTimeSlotSelect = (slot) => {
    const now = new Date();
    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(slot.day);
    const daysUntil = (dayIndex - now.getDay() + 7) % 7 || 7;
    const suggestedDate = new Date(now);
    suggestedDate.setDate(now.getDate() + daysUntil);

    const hourMatch = slot.time.match(/(\d+)/);
    if (hourMatch) {
      suggestedDate.setHours(parseInt(hourMatch[1]), 0, 0, 0);
    }

    updateField('scheduled_date', suggestedDate.toISOString().slice(0, 16));
    toast.success(`Set to optimal time: ${slot.day} ${slot.time}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="scheduleeventdialog">
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Event</DialogTitle>
          <DialogDescription>
            Create a new team activity event
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <TimeSlotSuggestions onSelectTime={handleTimeSlotSelect} />

          <div>
            <Label>Select Activity</Label>
            <Select
              value={formData.activity_id}
              onValueChange={handleActivitySelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an activity..." />
              </SelectTrigger>
              <SelectContent>
                {activities.map(activity => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.title} ({activity.type} • {activity.duration})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Override activity title (optional)"
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <Select
                value={formData.event_type || 'other'}
                onValueChange={(value) => updateField('event_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPES).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Fields based on Event Type */}
          <EventTypeConditionalFields
            eventType={formData.event_type}
            typeSpecificFields={formData.type_specific_fields || {}}
            onChange={(fields) => updateField('type_specific_fields', fields)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => updateField('scheduled_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => updateField('duration_minutes', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Max Participants (optional)</Label>
            <Input
              type="number"
              value={formData.max_participants || ''}
              onChange={(e) => updateField('max_participants', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <Label>Meeting Link (optional)</Label>
            <Input
              type="url"
              value={formData.meeting_link}
              onChange={(e) => updateField('meeting_link', e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Facilitator Name (optional)</Label>
              <Input
                value={formData.facilitator_name}
                onChange={(e) => updateField('facilitator_name', e.target.value)}
                placeholder="Who's running this?"
              />
            </div>
            <div>
              <Label>Facilitator Email (optional)</Label>
              <Input
                type="email"
                value={formData.facilitator_email}
                onChange={(e) => updateField('facilitator_email', e.target.value)}
                placeholder="facilitator@example.com"
              />
            </div>
          </div>

          <RecurrenceSettings
            recurrenceData={recurrenceSettings}
            onChange={setRecurrenceSettings}
          />

          <RichTextEventEditor
            label="Event Details & Instructions"
            value={formData.custom_instructions}
            onChange={(value) => updateField('custom_instructions', value)}
            placeholder="Add event details, instructions, what to bring, agenda, etc..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}