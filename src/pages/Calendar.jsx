import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useEventData } from '../components/hooks/useEventData';
import { useEventScheduling } from '../components/hooks/useEventScheduling';
import { filterUpcomingEvents, filterPastEvents } from '../components/utils/eventUtils';
import TimeSlotPollList from '../components/events/TimeSlotPollList';
import BookmarkedEventsList from '../components/events/BookmarkedEventsList';
import EventSeriesCreator from '../components/events/EventSeriesCreator';
import BulkEventScheduler from '../components/events/BulkEventScheduler';
import EventRescheduleDialog from '../components/events/EventRescheduleDialog';
import ScheduleEventDialog from '../components/events/ScheduleEventDialog';
import CreatePollDialog from '../components/events/CreatePollDialog';
import CalendarHeader from '../components/events/CalendarHeader';
import EventsList from '../components/events/EventsList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useEventActions } from '../components/events/useEventActions';
import { useTeamData } from '../components/hooks/useTeamData';
import GoogleCalendarActions from '../components/events/GoogleCalendarActions';
import { toast } from 'sonner';

export default function Calendar() {
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true, true);
  const { events, activities, participations, isLoading } = useEventData();
  const eventActions = useEventActions();
  const { teams } = useTeamData();

  // Dialog states
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [showSeriesCreator, setShowSeriesCreator] = useState(false);
  const [showBulkScheduler, setShowBulkScheduler] = useState(false);
  const [rescheduleEvent, setRescheduleEvent] = useState(null);

  // Use centralized scheduling hook
  const scheduling = useEventScheduling({
    onSuccess: () => setShowScheduleDialog(false)
  });

  // Check for pre-selected activity from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('activity');
    if (activityId) {
      scheduling.updateField('activity_id', activityId);
      setShowScheduleDialog(true);
    }
  }, []);

  // Poll creation mutation
  const createPollMutation = useMutation({
    mutationFn: async (pollData) => {
      return base44.entities.TimeSlotPoll.create({
        ...pollData,
        organizer_email: user.email,
        organizer_name: user.full_name,
        status: 'open',
        votes: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['time-slot-polls']);
      setShowPollDialog(false);
      toast.success('Time slot poll created! Share it with your team.');
    }
  });

  // Delete event mutation (soft delete)
  const deleteEventMutation = useMutation({
    mutationFn: (event) => base44.entities.Event.update(event.id, { 
      status: 'cancelled',
      cancellation_reason: 'Cancelled by organizer',
      cancelled_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const upcomingEvents = filterUpcomingEvents(events);
  const pastEvents = filterPastEvents(events);

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const refetchEvents = () => {
    queryClient.invalidateQueries(['events']);
  };

  return (
    <div className="space-y-8">
      {/* Google Calendar Integration */}
      <div className="glass-panel-solid">
        <GoogleCalendarActions onImportComplete={refetchEvents} />
      </div>

      <CalendarHeader
        onScheduleEvent={() => setShowScheduleDialog(true)}
        onCreatePoll={() => setShowPollDialog(true)}
        onCreateSeries={() => setShowSeriesCreator(true)}
        onBulkSchedule={() => setShowBulkScheduler(true)}
      />

      {/* Bookmarked Events */}
      <BookmarkedEventsList userEmail={user?.email} />

      {/* Active Polls Section */}
      <TimeSlotPollList 
        userEmail={user?.email}
        userName={user?.full_name}
        isAdmin={user?.role === 'admin'}
        onEventCreated={() => queryClient.invalidateQueries(['events'])}
      />

      {/* Upcoming Events */}
      <EventsList
        title="Upcoming Events"
        events={upcomingEvents}
        activities={activities}
        participations={participations}
        isLoading={isLoading}
        userEmail={user?.email}
        eventActions={{
          ...eventActions,
          onDelete: deleteEventMutation.mutate
        }}
        onReschedule={setRescheduleEvent}
        emptyTitle="No upcoming events"
        emptyDescription="Schedule your first event to get started"
        emptyActionLabel="Schedule Event"
        onEmptyAction={() => setShowScheduleDialog(true)}
      />

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <EventsList
          title="Past Events"
          events={pastEvents}
          activities={activities}
          participations={participations}
          maxItems={6}
          userEmail={user?.email}
          eventActions={eventActions}
          showReminder={false}
          showCancel={false}
        />
      )}

      {/* Schedule Event Dialog */}
      <ScheduleEventDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        activities={activities}
        formData={scheduling.formData}
        setFormData={scheduling.setFormData}
        recurrenceSettings={scheduling.recurrence}
        setRecurrenceSettings={scheduling.setRecurrence}
        onSubmit={(e) => scheduling.handleSubmit(e, activities)}
        isSubmitting={scheduling.isCreating}
      />

      {/* Create Poll Dialog */}
      <CreatePollDialog
        open={showPollDialog}
        onOpenChange={setShowPollDialog}
        activities={activities}
        onSubmit={(data) => createPollMutation.mutate(data)}
        isSubmitting={createPollMutation.isPending}
      />

      {/* Event Series Creator */}
      <EventSeriesCreator
        open={showSeriesCreator}
        onOpenChange={setShowSeriesCreator}
        onSeriesCreated={() => queryClient.invalidateQueries(['events'])}
      />

      {/* Bulk Event Scheduler */}
      <BulkEventScheduler
        open={showBulkScheduler}
        onOpenChange={setShowBulkScheduler}
        activities={activities}
        teams={teams}
        onScheduleComplete={() => queryClient.invalidateQueries(['events'])}
      />

      {/* Reschedule Dialog */}
      <EventRescheduleDialog
        open={!!rescheduleEvent}
        onOpenChange={(open) => !open && setRescheduleEvent(null)}
        event={rescheduleEvent}
        onRescheduleComplete={() => queryClient.invalidateQueries(['events'])}
      />
    </div>
  );
}