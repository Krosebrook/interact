import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

/**
 * Advanced caching hook with stale-while-revalidate + prefetch
 * Optimizes performance for critical data paths
 */
export function useCaching() {
  const queryClient = useQueryClient();
  const prefetchQueue = useRef(new Map());

  // Prefetch events (anticipate navigation)
  const prefetchEvents = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey: ['events'],
      queryFn: () => base44.entities.Event.list('-scheduled_date', 50),
      staleTime: 30000 // 30 seconds
    });
  }, [queryClient]);

  // Prefetch activities for event creation
  const prefetchActivities = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey: ['activities'],
      queryFn: () => base44.entities.Activity.list('-updated_date', 100),
      staleTime: 60000 // 1 minute
    });
  }, [queryClient]);

  // Prefetch user profile (on sidebar hover)
  const prefetchUserProfile = useCallback(async (email) => {
    if (prefetchQueue.current.has(email)) return;
    prefetchQueue.current.set(email, true);

    await queryClient.prefetchQuery({
      queryKey: ['user-profile', email],
      queryFn: () => 
        base44.entities.UserProfile.filter({ user_email: email }).then(p => p[0]),
      staleTime: 120000 // 2 minutes
    });
  }, [queryClient]);

  // Batch invalidations to avoid multiple re-renders
  const invalidateMultiple = useCallback((keys) => {
    queryClient.invalidateQueries({ 
      queryKey: keys[0],
      refetchType: 'stale'
    });
    
    if (keys.length > 1) {
      keys.slice(1).forEach(key => {
        queryClient.setQueriesData({ queryKey: key }, (old) => old);
      });
    }
  }, [queryClient]);

  return {
    prefetchEvents,
    prefetchActivities,
    prefetchUserProfile,
    invalidateMultiple
  };
}