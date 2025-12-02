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

  const upcomingEvents = filterUpcomingEvents(events);
  const pastEvents = filterPastEvents(events);

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Event Calendar" description="Schedule and manage your team activities">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBulkScheduler(true)}
                      >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Bulk Schedule
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowSeriesCreator(true)}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Create Series
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPollDialog(true)}
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Create Poll
                      </Button>
                      <Button
                        onClick={() => setShowScheduleDialog(true)}
                        className="bg-int-orange hover:bg-[#C46322] text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Event
                      </Button>
                    </div>
                  </PageHeader>

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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Upcoming Events</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No upcoming events"
            description="Schedule your first event to get started"
            actionLabel="Schedule Event"
            onAction={() => setShowScheduleDialog(true)}
          />
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
                                        onReschedule={setRescheduleEvent}
                                        userEmail={user?.email}
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
                userEmail={user?.email}
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

      {/* Create Poll Dialog */}
      <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Time Slot Poll</DialogTitle>
            <DialogDescription>
              Let participants vote on their preferred meeting time
            </DialogDescription>
          </DialogHeader>
          <TimeSlotPollCreator
            activities={activities}
            isSubmitting={createPollMutation.isLoading}
            onSubmit={(data) => createPollMutation.mutate(data)}
          />
        </DialogContent>
      </Dialog>

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