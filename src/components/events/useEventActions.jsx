import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Centralized hook for event actions (cancel, copy link, download calendar, notifications)
 * Used by Dashboard, Calendar, FacilitatorDashboard
 */
export function useEventActions() {
  const queryClient = useQueryClient();

  const cancelEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.Event.update(eventId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event cancelled');
    },
    onError: () => toast.error('Failed to cancel event')
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (eventId) => {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType: 'reminder'
      });
    },
    onSuccess: () => toast.success('Reminder sent to all participants!'),
    onError: () => toast.error('Failed to send reminder')
  });

  const sendRecapMutation = useMutation({
    mutationFn: async (eventId) => {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType: 'recap'
      });
    },
    onSuccess: () => toast.success('Recap sent!'),
    onError: () => toast.error('Failed to send recap')
  });

  const downloadCalendarMutation = useMutation({
    mutationFn: async (eventId) => {
      const response = await base44.functions.invoke('generateCalendarFile', { eventId });
      return response.data;
    },
    onSuccess: (data, variables) => {
      const blob = new Blob([data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Calendar file downloaded!');
    },
    onError: () => toast.error('Failed to download calendar file')
  });

  const handleCopyLink = (event) => {
    const link = event.magic_link 
      ? `${window.location.origin}/ParticipantEvent?link=${event.magic_link}`
      : `${window.location.origin}/ParticipantEvent?id=${event.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleDownloadCalendar = (event) => {
    downloadCalendarMutation.mutate(event.id);
  };

  const handleSendReminder = (event) => {
    sendReminderMutation.mutate(event.id);
  };

  const handleSendRecap = (event) => {
    sendRecapMutation.mutate(event.id);
  };

  const handleCancelEvent = (event) => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      cancelEventMutation.mutate(event.id);
    }
  };

  return {
    handleCopyLink,
    handleDownloadCalendar,
    handleSendReminder,
    handleSendRecap,
    handleCancelEvent,
    isLoading: cancelEventMutation.isPending || 
               sendReminderMutation.isPending || 
               sendRecapMutation.isPending || 
               downloadCalendarMutation.isPending
  };
}