/**
 * NOTIFICATIONS HOOK
 * Production-grade with real-time updates and optimistic actions
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useOptimisticUpdate, useOptimisticBatchUpdate } from '../lib/optimisticMutations';
import { queryKeys } from '../lib/queryKeys';

export function useNotifications(userEmail, options = {}) {
  const { enabled = true, includeRead = false } = options;

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.notifications.list({ userEmail, includeRead }),
    queryFn: () => apiClient.list('Notification', {
      filters: includeRead 
        ? { user_email: userEmail }
        : { user_email: userEmail, is_read: false },
      sort: '-created_date',
      limit: 100
    }),
    enabled: !!userEmail && enabled,
    staleTime: 10000, // Refetch every 10 seconds
    refetchInterval: 30000 // Auto-refetch every 30 seconds
  });

  // Mark notification as read (optimistic)
  const markReadMutation = useOptimisticUpdate({
    mutationFn: async ({ id }) => {
      return apiClient.update('Notification', id, { is_read: true });
    },
    queryKey: queryKeys.notifications.list({ userEmail, includeRead }),
    successMessage: null, // Silent
    errorMessage: 'Failed to mark as read'
  });

  // Mark all as read (optimistic batch)
  const markAllReadMutation = useOptimisticBatchUpdate({
    mutationFn: async ({ ids }) => {
      return apiClient.invoke('markAllNotificationsRead', { 
        user_email: userEmail 
      });
    },
    queryKey: queryKeys.notifications.list({ userEmail, includeRead }),
    successMessage: 'All notifications marked as read',
    errorMessage: 'Failed to mark all as read'
  });

  // Memoized computed values
  const computed = useMemo(() => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    const unreadCount = unreadNotifications.length;
    
    // Group by type
    const byType = notifications.reduce((acc, notif) => {
      const type = notif.notification_type || 'general';
      if (!acc[type]) acc[type] = [];
      acc[type].push(notif);
      return acc;
    }, {});

    // Recent notifications (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentNotifications = notifications.filter(
      n => new Date(n.created_date) > oneDayAgo
    );

    return {
      unreadNotifications,
      unreadCount,
      byType,
      recentNotifications
    };
  }, [notifications]);

  return {
    notifications,
    ...computed,
    isLoading,
    refetch,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: () => markAllReadMutation.mutate({
      ids: computed.unreadNotifications.map(n => n.id)
    }),
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending
  };
}