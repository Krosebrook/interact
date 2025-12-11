/**
 * REFACTORED EVENT DATA HOOK
 * Production-grade with apiClient, error handling, RBAC, and optimistic updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { cachePresets } from '../lib/cacheConfig';
import { usePermissions } from './usePermissions';
import { transformOutput } from '../lib/dataTransformers';

/**
 * Central hook for event-related data with RBAC and security
 */
export function useEventData(options = {}) {
  const { 
    limit = 100, 
    enabled = true, 
    refetchInterval = null,
    includeParticipations = true 
  } = options;
  
  const queryClient = useQueryClient();
  const { canViewAllEmployees } = usePermissions();

  // Events with automatic retry and error handling
  const { 
    data: events = [], 
    isLoading: eventsLoading, 
    refetch: refetchEvents,
    error: eventsError 
  } = useQuery({
    queryKey: queryKeys.events.list({ limit }),
    queryFn: () => apiClient.list('Event', { 
      sort: '-scheduled_date', 
      limit 
    }),
    enabled,
    ...cachePresets.events,
    refetchInterval
  });

  // Activities with caching
  const { 
    data: activities = [], 
    isLoading: activitiesLoading,
    error: activitiesError 
  } = useQuery({
    queryKey: queryKeys.activities.all,
    queryFn: () => apiClient.list('Activity'),
    enabled,
    ...cachePresets.activities
  });

  // Participations with RBAC filtering
  const { 
    data: participations = [], 
    isLoading: participationsLoading,
    error: participationsError 
  } = useQuery({
    queryKey: queryKeys.participations.all,
    queryFn: async () => {
      const data = await apiClient.list('Participation', {
        sort: '-created_date',
        limit: 500
      });
      
      // Filter sensitive data based on permissions
      return transformOutput(data, {
        removeFields: canViewAllEmployees ? [] : ['participant_name', 'participant_email']
      });
    },
    enabled: enabled && includeParticipations,
    ...cachePresets.participations,
    refetchInterval
  });

  // Invalidate all event-related data
  const invalidateEventData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.participations.all });
  };

  return {
    events,
    activities,
    participations,
    isLoading: eventsLoading || activitiesLoading || (includeParticipations && participationsLoading),
    error: eventsError || activitiesError || participationsError,
    refetchEvents,
    invalidateEventData
  };
}