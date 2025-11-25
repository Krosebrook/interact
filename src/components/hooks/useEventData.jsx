import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Central hook for event-related data
 * Used by Dashboard, Calendar, FacilitatorDashboard, Analytics
 */
export function useEventData(options = {}) {
  const { limit = 100, enabled = true } = options;

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events', limit],
    queryFn: () => base44.entities.Event.list('-scheduled_date', limit),
    enabled,
    staleTime: 10000
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
    enabled,
    staleTime: 60000
  });

  const { data: participations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500),
    enabled,
    staleTime: 10000
  });

  return {
    events,
    activities,
    participations,
    isLoading: eventsLoading || activitiesLoading || participationsLoading
  };
}