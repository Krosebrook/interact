import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from '../../utils';

export function useEventActions() {
  const queryClient = useQueryClient();

  const cancelEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.Event.update(eventId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event cancelled');
    }
  });

  const handleCopyLink = (event) => {
    const link = `${window.location.origin}${createPageUrl('ParticipantEvent')}?event=${event.magic_link || event.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Magic link copied to clipboard!');
  };

  const handleDownloadCalendar = async (event) => {
    try {
      const response = await base44.functions.invoke('generateCalendarFile', {
        eventId: event.id
      });
      
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Calendar file downloaded!');
    } catch (error) {
      toast.error('Failed to generate calendar file');
    }
  };

  const handleSendTeamsNotification = async (eventId, notificationType) => {
    try {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType
      });
      
      const messages = {
        announcement: 'Announcement sent to Teams!',
        reminder: 'Reminder sent to Teams!',
        recap: 'Recap sent to Teams!'
      };
      
      toast.success(messages[notificationType] || 'Notification sent!');
    } catch (error) {
      toast.error(`Failed to send ${notificationType}`);
    }
  };

  const handleSendReminder = (event) => {
    return handleSendTeamsNotification(event.id, 'reminder');
  };

  const handleSendRecap = (event) => {
    return handleSendTeamsNotification(event.id, 'recap');
  };

  const handleCancelEvent = (event) => {
    cancelEventMutation.mutate(event.id);
  };

  return {
    handleCopyLink,
    handleDownloadCalendar,
    handleSendReminder,
    handleSendRecap,
    handleCancelEvent,
    cancelEventMutation
  };
}