import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useEventData() {
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 100)
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: participations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list()
  });

  return {
    events,
    activities,
    participations,
    isLoading: eventsLoading || activitiesLoading || participationsLoading
  };
}