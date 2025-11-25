import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function useActivities() {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      toast.success('Activity created!');
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: (activity) => {
      const { id, created_date, updated_date, created_by, ...activityData } = activity;
      return base44.entities.Activity.create({
        ...activityData,
        title: `${activity.title} (Copy)`,
        is_template: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      toast.success('Activity duplicated!');
    }
  });

  const getActivityById = (id) => activities.find(a => a.id === id);

  const filterActivities = ({ search = '', type = 'all', duration = 'all' }) => {
    return activities.filter(activity => {
      const matchesSearch = !search || 
        activity.title?.toLowerCase().includes(search.toLowerCase()) ||
        activity.description?.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === 'all' || activity.type === type;
      const matchesDuration = duration === 'all' || activity.duration === duration;
      return matchesSearch && matchesType && matchesDuration;
    });
  };

  return {
    activities,
    isLoading,
    createActivity: createMutation.mutate,
    duplicateActivity: duplicateMutation.mutate,
    getActivityById,
    filterActivities
  };
}