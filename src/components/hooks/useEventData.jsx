import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useEventData(options = {}) {
  const { limit = 100, enableParticipations = true } = options;

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', limit),
    staleTime: STALE_TIME
  });

  const { data: activities = [], isLoading: activitiesLoading, refetch: refetchActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
    staleTime: STALE_TIME
  });

  const { data: participations = [], isLoading: participationsLoading, refetch: refetchParticipations } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list(),
    enabled: enableParticipations,
    staleTime: STALE_TIME
  });

  const refetchAll = () => {
    refetchEvents();
    refetchActivities();
    if (enableParticipations) refetchParticipations();
  };

  return {
    events,
    activities,
    participations,
    isLoading: eventsLoading || activitiesLoading || (enableParticipations && participationsLoading),
    refetchAll
  };
}