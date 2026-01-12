import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, subHours, subDays, subWeeks, subMinutes } from 'date-fns';

const REMINDER_OPTIONS = [
  { value: '1_week', label: '1 week before', minutes: 10080 },
  { value: '3_days', label: '3 days before', minutes: 4320 },
  { value: '1_day', label: '1 day before', minutes: 1440 },
  { value: '1_hour', label: '1 hour before', minutes: 60 },
  { value: '15_min', label: '15 minutes before', minutes: 15 }
];

const CHANNEL_OPTIONS = [
  { value: 'in_app', label: 'In-App', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'teams', label: 'Teams', icon: MessageSquare }
];

export default function ReminderPreferences({ eventId, seriesId, userEmail, eventDate }) {
  const queryClient = useQueryClient();
  const [selectedReminders, setSelectedReminders] = useState(['1_day']);
  const [selectedChannels, setSelectedChannels] = useState(['in_app']);

  const { data: existingReminders = [] } = useQuery({
    queryKey: ['reminders', eventId || seriesId, userEmail],
    queryFn: () => base44.entities.ReminderSchedule.filter({
      ...(eventId ? { event_id: eventId } : { series_id: seriesId }),
      user_email: userEmail
    }),
    enabled: !!userEmail
  });

  useEffect(() => {
    if (existingReminders.length > 0) {
      setSelectedReminders(existingReminders.map(r => r.reminder_type));
      const channels = existingReminders[0]?.channels || ['in_app'];
      setSelectedChannels(channels);
    }
  }, [existingReminders]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete existing reminders
      for (const reminder of existingReminders) {
        await base44.entities.ReminderSchedule.delete(reminder.id);
      }

      // Create new reminders
      const eventDateTime = new Date(eventDate);
      const newReminders = [];

      for (const reminderType of selectedReminders) {
        const reminderOption = REMINDER_OPTIONS.find(o => o.value === reminderType);
        if (reminderOption) {
          const scheduledFor = subMinutes(eventDateTime, reminderOption.minutes);
          
          // Only create if scheduled time is in the future
          if (scheduledFor > new Date()) {
            const reminder = await base44.entities.ReminderSchedule.create({
              event_id: eventId,
              series_id: seriesId,
              user_email: userEmail,
              reminder_type: reminderType,
              channels: selectedChannels,
              scheduled_for: scheduledFor.toISOString(),
              is_sent: false
            });
            newReminders.push(reminder);
          }
        }
      }

      return newReminders;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      toast.success('Reminder preferences saved!');
    }
  });

  const toggleReminder = (value) => {
    setSelectedReminders(prev => 
      prev.includes(value) 
        ? prev.filter(r => r !== value)
        : [...prev, value]
    );
  };

  const toggleChannel = (value) => {
    setSelectedChannels(prev => {
      const newChannels = prev.includes(value) 
        ? prev.filter(c => c !== value)
        : [...prev, value];
      // Ensure at least one channel is selected
      return newChannels.length > 0 ? newChannels : prev;
    });
  };

  return (
    <Card className="p-4" data-b44-sync="true" data-feature="events" data-component="reminderpreferences">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-int-orange" />
        <h3 className="font-semibold">Reminder Preferences</h3>
      </div>

      {/* Reminder Timing */}
      <div className="mb-4">
        <Label className="text-sm text-slate-600 mb-2 block">When to remind me</Label>
        <div className="space-y-2">
          {REMINDER_OPTIONS.map(option => {
            const isSelected = selectedReminders.includes(option.value);
            const scheduledTime = eventDate ? subMinutes(new Date(eventDate), option.minutes) : null;
            const isPast = scheduledTime && scheduledTime < new Date();

            return (
              <div 
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected && !isPast
                    ? 'border-int-orange bg-orange-50' 
                    : isPast 
                    ? 'border-slate-100 bg-slate-50 opacity-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => !isPast && toggleReminder(option.value)}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {scheduledTime && !isPast && (
                    <span className="text-xs text-slate-500">
                      {format(scheduledTime, 'MMM d, h:mm a')}
                    </span>
                  )}
                  {isPast && <Badge variant="outline" className="text-xs">Passed</Badge>}
                  <Switch 
                    checked={isSelected && !isPast}
                    disabled={isPast}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Channels */}
      <div className="mb-4">
        <Label className="text-sm text-slate-600 mb-2 block">How to notify me</Label>
        <div className="flex gap-2">
          {CHANNEL_OPTIONS.map(channel => {
            const Icon = channel.icon;
            const isSelected = selectedChannels.includes(channel.value);
            return (
              <button
                key={channel.value}
                onClick={() => toggleChannel(channel.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-int-orange bg-orange-50 text-int-orange'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{channel.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isLoading || selectedReminders.length === 0}
        className="w-full"
      >
        {saveMutation.isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Bell className="h-4 w-4 mr-2" />
        )}
        Save Preferences
      </Button>
    </Card>
  );
}