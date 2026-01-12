import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Calendar, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, addWeeks, addMonths, parseISO } from 'date-fns';

export default function BulkEventScheduler({ 
  open, 
  onOpenChange, 
  activities = [],
  teams = [],
  onScheduleComplete 
}) {
  const queryClient = useQueryClient();
  const [scheduleName, setScheduleName] = useState('');
  const [description, setDescription] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [autoInvite, setAutoInvite] = useState(false);
  const [sendReminders, setSendReminders] = useState(true);

  const addEvent = () => {
    setEvents([...events, {
      id: Date.now().toString(),
      activity_id: '',
      title: '',
      scheduled_date: '',
      duration_minutes: 60,
      facilitator_name: '',
      facilitator_email: ''
    }]);
  };

  const updateEvent = (id, field, value) => {
    setEvents(events.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const removeEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const duplicateEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      scheduled_date: event.scheduled_date 
        ? format(addDays(parseISO(event.scheduled_date), 7), "yyyy-MM-dd'T'HH:mm")
        : ''
    };
    setEvents([...events, newEvent]);
  };

  const generateRecurringEvents = (baseEvent, frequency, count) => {
    const newEvents = [];
    for (let i = 1; i < count; i++) {
      let nextDate;
      const baseDate = parseISO(baseEvent.scheduled_date);
      
      switch (frequency) {
        case 'daily':
          nextDate = addDays(baseDate, i);
          break;
        case 'weekly':
          nextDate = addWeeks(baseDate, i);
          break;
        case 'biweekly':
          nextDate = addWeeks(baseDate, i * 2);
          break;
        case 'monthly':
          nextDate = addMonths(baseDate, i);
          break;
        default:
          nextDate = addWeeks(baseDate, i);
      }

      newEvents.push({
        ...baseEvent,
        id: `${Date.now()}-${i}`,
        scheduled_date: format(nextDate, "yyyy-MM-dd'T'HH:mm")
      });
    }
    setEvents([...events, ...newEvents]);
  };

  const bulkScheduleMutation = useMutation({
    mutationFn: async () => {
      // Create bulk schedule record
      const schedule = await base44.entities.BulkEventSchedule.create({
        schedule_name: scheduleName,
        description,
        created_by_email: (await base44.auth.me()).email,
        events: events.map(e => ({
          activity_id: e.activity_id,
          title: e.title,
          scheduled_date: e.scheduled_date,
          status: 'pending'
        })),
        status: 'scheduled',
        total_events: events.length,
        target_teams: selectedTeams,
        schedule_config: {
          auto_invite: autoInvite,
          send_reminders: sendReminders
        }
      });

      // Create individual events
      const createdEvents = [];
      for (const event of events) {
        const activity = activities.find(a => a.id === event.activity_id);
        const magicLink = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newEvent = await base44.entities.Event.create({
          activity_id: event.activity_id,
          title: event.title || activity?.title || 'Untitled Event',
          scheduled_date: event.scheduled_date,
          duration_minutes: event.duration_minutes,
          facilitator_name: event.facilitator_name,
          facilitator_email: event.facilitator_email,
          magic_link: magicLink,
          status: 'scheduled',
          bulk_schedule_id: schedule.id,
          target_teams: selectedTeams
        });
        
        createdEvents.push(newEvent);
      }

      // Update bulk schedule with created event IDs
      await base44.entities.BulkEventSchedule.update(schedule.id, {
        events: createdEvents.map(e => ({
          event_id: e.id,
          activity_id: e.activity_id,
          title: e.title,
          scheduled_date: e.scheduled_date,
          status: 'scheduled'
        })),
        scheduled_events: createdEvents.length,
        status: 'scheduled'
      });

      return { schedule, events: createdEvents };
    },
    onSuccess: ({ events: createdEvents }) => {
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['bulk-schedules']);
      toast.success(`${createdEvents.length} events scheduled successfully!`);
      onOpenChange(false);
      resetForm();
      onScheduleComplete?.();
    },
    onError: (error) => {
      toast.error(`Failed to schedule events: ${error.message}`);
    }
  });

  const resetForm = () => {
    setScheduleName('');
    setDescription('');
    setEvents([]);
    setSelectedTeams([]);
    setAutoInvite(false);
    setSendReminders(true);
  };

  const validEvents = events.filter(e => e.activity_id && e.scheduled_date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="bulkeventscheduler">
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-int-orange" />
            Bulk Event Scheduler
          </DialogTitle>
          <DialogDescription>
            Schedule multiple events at once for your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Schedule Name</Label>
              <Input
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="e.g., Q1 Team Building Series"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
          </div>

          {/* Team Selection */}
          {teams.length > 0 && (
            <div>
              <Label className="mb-2 block">Target Teams (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                  <Badge
                    key={team.id}
                    variant={selectedTeams.includes(team.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTeams(prev => 
                        prev.includes(team.id) 
                          ? prev.filter(id => id !== team.id)
                          : [...prev, team.id]
                      );
                    }}
                  >
                    {team.team_avatar} {team.team_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-invite"
                checked={autoInvite}
                onCheckedChange={setAutoInvite}
              />
              <Label htmlFor="auto-invite" className="cursor-pointer">
                Auto-invite team members
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="send-reminders"
                checked={sendReminders}
                onCheckedChange={setSendReminders}
              />
              <Label htmlFor="send-reminders" className="cursor-pointer">
                Send reminders
              </Label>
            </div>
          </div>

          {/* Events List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Events ({events.length})</Label>
              <Button onClick={addEvent} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <Card key={event.id} className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-1 flex items-center justify-center h-10">
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                    
                    <div className="col-span-3">
                      <Select
                        value={event.activity_id}
                        onValueChange={(value) => {
                          const activity = activities.find(a => a.id === value);
                          updateEvent(event.id, 'activity_id', value);
                          if (activity && !event.title) {
                            updateEvent(event.id, 'title', activity.title);
                          }
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select activity" />
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

                    <div className="col-span-3">
                      <Input
                        type="datetime-local"
                        value={event.scheduled_date}
                        onChange={(e) => updateEvent(event.id, 'scheduled_date', e.target.value)}
                        className="h-10"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={event.duration_minutes}
                        onChange={(e) => updateEvent(event.id, 'duration_minutes', parseInt(e.target.value))}
                        placeholder="Duration (min)"
                        className="h-10"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        value={event.facilitator_name}
                        onChange={(e) => updateEvent(event.id, 'facilitator_name', e.target.value)}
                        placeholder="Facilitator"
                        className="h-10"
                      />
                    </div>

                    <div className="col-span-1 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => duplicateEvent(event)}
                        className="h-10 w-10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeEvent(event.id)}
                        className="h-10 w-10 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {events.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No events added yet. Click "Add Event" to start.</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary & Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              {validEvents.length < events.length && events.length > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {events.length - validEvents.length} event(s) incomplete
                  </span>
                </div>
              )}
              {validEvents.length > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">{validEvents.length} event(s) ready</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => bulkScheduleMutation.mutate()}
                disabled={validEvents.length === 0 || !scheduleName || bulkScheduleMutation.isLoading}
                className="bg-int-orange hover:bg-[#C46322] text-white"
              >
                {bulkScheduleMutation.isLoading ? 'Scheduling...' : `Schedule ${validEvents.length} Events`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}