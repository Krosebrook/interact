/**
 * TEAMS NOTIFICATION HOOK
 * Frontend hook for sending Teams notifications
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * @typedef {'announcement' | 'reminder' | 'recap'} NotificationType
 */

/**
 * @typedef {Object} SendNotificationParams
 * @property {string} eventId - Event ID
 * @property {NotificationType} notificationType - Type of notification
 * @property {string} [customMessage] - Optional custom message
 */

/**
 * Hook for sending Teams notifications
 * Uses the refactored V2 endpoint with standardized error handling
 */
export function useTeamsNotification() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('sendTeamsNotificationV2', params);
      
      // Check for API error response
      if (response.data?.error) {
        const error = new Error(response.data.error.message);
        error.code = response.data.error.code;
        error.details = response.data.error.details;
        throw error;
      }
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.skipped) {
        toast.info(data.message);
      } else {
        toast.success(`${variables.notificationType} sent to Teams!`);
      }
    },
    onError: (error) => {
      // Handle specific error codes
      switch (error.code) {
        case 'UNAUTHORIZED':
          toast.error('Please log in to send notifications');
          break;
        case 'FORBIDDEN':
          toast.error('You don\'t have permission to send notifications');
          break;
        case 'NOT_FOUND':
          toast.error('Event not found');
          break;
        case 'SERVICE_UNAVAILABLE':
          toast.error('Teams integration not configured');
          break;
        case 'VALIDATION_ERROR':
          const details = error.details 
            ? Object.values(error.details).join(', ')
            : error.message;
          toast.error(`Validation error: ${details}`);
          break;
        default:
          toast.error(error.message || 'Failed to send notification');
      }
    }
  });

  return {
    sendNotification: mutation.mutate,
    sendNotificationAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
}

/**
 * Convenience hooks for specific notification types
 */
export function useSendAnnouncement() {
  const { sendNotification, ...rest } = useTeamsNotification();
  
  return {
    sendAnnouncement: (eventId, customMessage) => 
      sendNotification({ eventId, notificationType: 'announcement', customMessage }),
    ...rest
  };
}

export function useSendReminder() {
  const { sendNotification, ...rest } = useTeamsNotification();
  
  return {
    sendReminder: (eventId, customMessage) => 
      sendNotification({ eventId, notificationType: 'reminder', customMessage }),
    ...rest
  };
}

export function useSendRecap() {
  const { sendNotification, ...rest } = useTeamsNotification();
  
  return {
    sendRecap: (eventId, customMessage) => 
      sendNotification({ eventId, notificationType: 'recap', customMessage }),
    ...rest
  };
}