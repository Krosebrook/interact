import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useEventData } from '../components/hooks/useEventData';
import { filterUpcomingEvents, filterPastEvents, getParticipationStats, getActivityForEvent } from '../components/utils/eventFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import EventCalendarCard from '../components/events/EventCalendarCard';
import RecurrenceSettings from '../components/events/RecurrenceSettings';
import TimeSlotSuggestions from '../components/events/TimeSlotSuggestions';
import RichTextEventEditor from '../components/events/RichTextEventEditor';
import { useEventActions } from '../components/events/useEventActions';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

export default function Calendar() {
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true, true);
  const { events, activities, participations, isLoading } = useEventData();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const eventActions = useEventActions();
  const [formData, setFormData] = useState({
    activity_id: '',
    title: '',
    scheduled_date: '',
    duration_minutes: 30,
    max_participants: null,
    custom_instructions: '',
    meeting_link: '',
    facilitator_name: '',
    facilitator_email: ''
  });
  const [recurrenceSettings, setRecurrenceSettings] = useState({
    enabled: false,
    frequency: 'weekly',
    occurrences: 4
  });

  useEffect(() => {
    // Check for pre-selected activity from URL
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('activity');
    if (activityId) {
      setFormData(prev => ({ ...prev, activity_id: activityId }));
      setShowScheduleDialog(true);
    }
  }, []);

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const events = [];
      const recurringSeriesId = recurrenceSettings.enabled 
        ? `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : null;

      const createSingleEvent = async (scheduleDate, occurrenceNum = 1, totalOccurrences = 1) => {
        const magicLink = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const event = await base44.entities.Event.create({
          ...data,
          scheduled_date: scheduleDate,
          magic_link: magicLink,
          status: 'scheduled',
          is_recurring: recurrenceSettings.enabled,
          recurring_series_id: recurringSeriesId,
          recurrence_pattern: recurrenceSettings.enabled ? {
            frequency: recurrenceSettings.frequency,
            occurrence_number: occurrenceNum,
            total_occurrences: totalOccurrences
          } : null
        });

        // Send Teams announcement
        try {
          await base44.functions.invoke('sendTeamsNotification', {
            eventId: event.id,
            notificationType: 'announcement'
          });
        } catch (error) {
          console.error('Failed to send Teams notification:', error);
        }

        return event;
      };

      if (recurrenceSettings.enabled) {
        const baseDate = new Date(data.scheduled_date);
        const occurrences = recurrenceSettings.occurrences || 4;

        for (let i = 0; i < occurrences; i++) {
          let nextDate;
          switch (recurrenceSettings.frequency) {
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

          const event = await createSingleEvent(
            nextDate.toISOString(),
            i + 1,
            occurrences
          );
          events.push(event);
        }
      } else {
        const event = await createSingleEvent(data.scheduled_date);
        events.push(event);
      }

      return events;
    },
    onSuccess: (events) => {
      queryClient.invalidateQueries(['events']);
      setShowScheduleDialog(false);
      setFormData({
        activity_id: '',
        title: '',
        scheduled_date: '',
        duration_minutes: 30,
        max_participants: null,
        custom_instructions: '',
        meeting_link: '',
        facilitator_name: '',
        facilitator_email: ''
      });
      setRecurrenceSettings({
        enabled: false,
        frequency: 'weekly',
        occurrences: 4
      });
      toast.success(
        recurrenceSettings.enabled 
          ? `${events.length} recurring events created! 🎉`
          : 'Event scheduled and Teams notified! 🎉'
      );
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedActivity = activities.find(a => a.id === formData.activity_id);
    createEventMutation.mutate({
      ...formData,
      title: formData.title || selectedActivity?.title || 'Untitled Event'
    });
  };

  const upcomingEvents = filterUpcomingEvents(events);
  const pastEvents = filterPastEvents(events);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Event Calendar</h1>
          <p className="text-slate-600">Schedule and manage your team activities</p>
        </div>
        <Button
          onClick={() => setShowScheduleDialog(true)}
          className="bg-int-orange hover:bg-[#C46322] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Upcoming Events</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No upcoming events</h3>
            <p className="text-slate-600 mb-4">Schedule your first event to get started</p>
            <Button onClick={() => setShowScheduleDialog(true)} className="bg-int-orange hover:bg-[#C46322] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => {
              const activity = activities.find(a => a.id === event.activity_id);
              return (
                <EventCalendarCard
                  key={event.id}
                  event={event}
                  activity={activity}
                  participantCount={getParticipationStats(event.id, participations).total}
                  onView={() => {}}
                  onCopyLink={eventActions.handleCopyLink}
                  onDownloadCalendar={eventActions.handleDownloadCalendar}
                  onSendReminder={eventActions.handleSendReminder}
                  onSendRecap={eventActions.handleSendRecap}
                  onCancel={eventActions.handleCancelEvent}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.slice(0, 6).map(event => (
              <EventCalendarCard
                key={event.id}
                event={event}
                activity={getActivityForEvent(event, activities)}
                participantCount={getParticipationStats(event.id, participations).total}
                onView={() => {}}
                onCopyLink={eventActions.handleCopyLink}
                onDownloadCalendar={eventActions.handleDownloadCalendar}
                onSendReminder={() => {}}
                onSendRecap={eventActions.handleSendRecap}
                onCancel={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Schedule Event Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
            <DialogDescription>
              Create a new team activity event
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TimeSlotSuggestions
              onSelectTime={(slot) => {
                // Auto-fill with suggested time
                const now = new Date();
                const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(slot.day);
                const daysUntil = (dayIndex - now.getDay() + 7) % 7 || 7;
                const suggestedDate = new Date(now);
                suggestedDate.setDate(now.getDate() + daysUntil);

                // Set to suggested hour (extract from time string)
                const hourMatch = slot.time.match(/(\d+)/);
                if (hourMatch) {
                  suggestedDate.setHours(parseInt(hourMatch[1]), 0, 0, 0);
                }

                setFormData(prev => ({
                  ...prev,
                  scheduled_date: suggestedDate.toISOString().slice(0, 16)
                }));
                toast.success(`Set to optimal time: ${slot.day} ${slot.time}`);
              }}
            />

            <div>
              <Label>Select Activity</Label>
              <Select
                value={formData.activity_id}
                onValueChange={(value) => {
                  const activity = activities.find(a => a.id === value);
                  setFormData(prev => ({
                    ...prev,
                    activity_id: value,
                    title: activity?.title || ''
                  }));
                }}
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

            <div>
              <Label>Event Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Override activity title (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Max Participants (optional)</Label>
              <Input
                type="number"
                value={formData.max_participants || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <Label>Meeting Link (optional)</Label>
              <Input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Facilitator Name (optional)</Label>
                <Input
                  value={formData.facilitator_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilitator_name: e.target.value }))}
                  placeholder="Who's running this?"
                />
              </div>
              <div>
                <Label>Facilitator Email (optional)</Label>
                <Input
                  type="email"
                  value={formData.facilitator_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilitator_email: e.target.value }))}
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
              onChange={(value) => setFormData(prev => ({ ...prev, custom_instructions: value }))}
              placeholder="Add event details, instructions, what to bring, agenda, etc..."
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-int-orange hover:bg-[#C46322] text-white">
                Schedule Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}