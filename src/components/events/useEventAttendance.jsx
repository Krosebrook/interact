import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';

/**
 * Hook for managing event attendance with automated gamification triggers
 */
export function useEventAttendance() {
  const queryClient = useQueryClient();
  const { trigger } = useGamificationTrigger();

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ participationId, eventId, userEmail, attended }) => {
      await base44.entities.Participation.update(participationId, {
        attendance_status: attended ? 'attended' : 'no_show',
        check_in_time: attended ? new Date().toISOString() : null
      });

      return { participationId, eventId, userEmail, attended };
    },
    onSuccess: async ({ eventId, userEmail, attended }) => {
      queryClient.invalidateQueries(['participations']);
      queryClient.invalidateQueries(['events']);

      if (attended) {
        toast.success('Attendance marked! 🎉');
        
        // Trigger gamification rules for attendance
        await trigger('event_attendance', userEmail, {
          event_id: eventId,
          reference_id: eventId
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to mark attendance: ' + error.message);
    }
  });

  const completeEventMutation = useMutation({
    mutationFn: async ({ eventId, userEmail, feedbackRating }) => {
      // Mark event as completed
      await base44.entities.Event.update(eventId, {
        status: 'completed'
      });

      return { eventId, userEmail, feedbackRating };
    },
    onSuccess: async ({ eventId, userEmail }) => {
      queryClient.invalidateQueries(['events']);

      // Trigger gamification rule for event completion
      await trigger('event_completion', userEmail, {
        event_id: eventId,
        reference_id: eventId
      });
    }
  });

  return {
    markAttendance: markAttendanceMutation.mutate,
    completeEvent: completeEventMutation.mutate,
    isMarkingAttendance: markAttendanceMutation.isPending,
    isCompletingEvent: completeEventMutation.isPending
  };
}