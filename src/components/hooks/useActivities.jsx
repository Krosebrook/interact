/**
 * REFACTORED ACTIVITIES HOOK
 * Production-grade with optimistic updates, validation, and RBAC
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useOptimisticCreate } from '../lib/optimisticMutations';
import { queryKeys } from '../lib/queryKeys';
import { usePermissions } from './usePermissions';
import { transformInput } from '../lib/dataTransformers';
import { ValidationSchema } from '../lib/validation';

// Activity validation schema
const activitySchema = new ValidationSchema({
  title: { type: 'string', required: true, minLength: 3 },
  description: { type: 'string', required: true },
  type: { type: 'string', required: true, enum: ['icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'] },
  duration: { type: 'string', required: true, enum: ['5-15min', '15-30min', '30+min'] }
});

export function useActivities() {
  const queryClient = useQueryClient();
  const { isFacilitator, isAdmin } = usePermissions();

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: queryKeys.activities.all,
    queryFn: () => apiClient.list('Activity'),
    staleTime: 60000
  });

  // Create activity with optimistic update
  const createMutation = useOptimisticCreate({
    mutationFn: async (data) => {
      // Validate and transform input
      const validated = transformInput(data, activitySchema);
      return apiClient.create('Activity', validated);
    },
    queryKey: queryKeys.activities.all,
    successMessage: 'Activity created successfully',
    errorMessage: 'Failed to create activity'
  });

  // Duplicate activity
  const duplicateMutation = useOptimisticCreate({
    mutationFn: async (activity) => {
      const { id, created_date, updated_date, created_by, ...activityData } = activity;
      const duplicated = {
        ...activityData,
        title: `${activity.title} (Copy)`,
        is_template: false
      };
      return apiClient.create('Activity', duplicated);
    },
    queryKey: queryKeys.activities.all,
    successMessage: 'Activity duplicated',
    errorMessage: 'Failed to duplicate activity'
  });

  // Memoized helper functions
  const helpers = useMemo(() => ({
    getActivityById: (id) => activities.find(a => a.id === id),
    
    filterActivities: ({ search = '', type = 'all', duration = 'all' }) => {
      return activities.filter(activity => {
        const matchesSearch = !search || 
          activity.title?.toLowerCase().includes(search.toLowerCase()) ||
          activity.description?.toLowerCase().includes(search.toLowerCase());
        const matchesType = type === 'all' || activity.type === type;
        const matchesDuration = duration === 'all' || activity.duration === duration;
        return matchesSearch && matchesType && matchesDuration;
      });
    },
    
    canCreateActivity: isFacilitator || isAdmin
  }), [activities, isFacilitator, isAdmin]);

  return {
    activities,
    isLoading,
    createActivity: createMutation.mutate,
    duplicateActivity: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    ...helpers
  };
}