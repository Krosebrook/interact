import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { queryKeys } from '../lib/queryKeys';
import { cachePresets } from '../lib/cacheConfig';

/**
 * Central hook for event-related data
 * Used by Dashboard, Calendar, FacilitatorDashboard, Analytics
 * 
 * @param {Object} options
 * @param {number} options.limit - Max events to fetch
 * @param {boolean} options.enabled - Enable/disable fetching
 * @param {number|null} options.refetchInterval - Auto-refetch interval
 * @param {boolean} options.includeParticipations - Include participation data
 */
export function useEventData(options = {}) {
  const { 
    limit = 100, 
    enabled = true, 
    refetchInterval = null,
    includeParticipations = true 
  } = options;
  
  const queryClient = useQueryClient();

  const { 
    data: events = [], 
    isLoading: eventsLoading, 
    refetch: refetchEvents,
    error: eventsError 
  } = useQuery({
    queryKey: queryKeys.events.list({ limit }),
    queryFn: () => base44.entities.Event.list('-scheduled_date', limit),
    enabled,
    ...cachePresets.events,
    refetchInterval
  });

  const { 
    data: activities = [], 
    isLoading: activitiesLoading,
    error: activitiesError 
  } = useQuery({
    queryKey: queryKeys.activities.all,
    queryFn: () => base44.entities.Activity.list(),
    enabled,
    ...cachePresets.activities
  });

  const { 
    data: participations = [], 
    isLoading: participationsLoading,
    error: participationsError 
  } = useQuery({
    queryKey: queryKeys.participations.all,
    queryFn: () => base44.entities.Participation.list('-created_date', 500),
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