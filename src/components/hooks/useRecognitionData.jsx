/**
 * RECOGNITION DATA HOOK
 * Production-grade with RBAC, privacy controls, and optimistic updates
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useOptimisticCreate, useOptimisticUpdate } from '../lib/optimisticMutations';
import { queryKeys } from '../lib/queryKeys';
import { usePermissions } from './usePermissions';
import { transformRecognitionData, transformRecognitionInput } from '../lib/dataTransformers';

export function useRecognitionData(options = {}) {
  const { enabled = true, userEmail = null, limit = 100 } = options;
  const { user } = usePermissions();

  // Fetch recognitions with privacy filtering
  const { data: recognitions = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.recognition.list({ userEmail, limit }),
    queryFn: async () => {
      const data = await apiClient.list('Recognition', {
        sort: '-created_date',
        limit
      });
      
      // Apply privacy filtering
      return transformRecognitionData(data, user?.email);
    },
    enabled,
    staleTime: 30000
  });

  // Create recognition with optimistic update
  const createMutation = useOptimisticCreate({
    mutationFn: async (data) => {
      const validated = transformRecognitionInput(data);
      return apiClient.create('Recognition', validated);
    },
    queryKey: queryKeys.recognition.list({ userEmail, limit }),
    successMessage: 'Recognition posted!',
    errorMessage: 'Failed to post recognition'
  });

  // React to recognition
  const reactMutation = useOptimisticUpdate({
    mutationFn: async ({ recognitionId, reaction }) => {
      return apiClient.update('Recognition', recognitionId, {
        reactions: { [user?.email]: reaction }
      });
    },
    queryKey: queryKeys.recognition.list({ userEmail, limit }),
    successMessage: null, // Silent update
    errorMessage: 'Failed to react'
  });

  // Memoized filters
  const filtered = useMemo(() => {
    const userRecognitions = recognitions.filter(
      r => r.recipient_email === userEmail || r.created_by === userEmail
    );
    
    const receivedRecognitions = recognitions.filter(
      r => r.recipient_email === userEmail
    );
    
    const sentRecognitions = recognitions.filter(
      r => r.created_by === userEmail
    );
    
    const publicRecognitions = recognitions.filter(
      r => r.visibility === 'public'
    );

    return {
      userRecognitions,
      receivedRecognitions,
      sentRecognitions,
      publicRecognitions
    };
  }, [recognitions, userEmail]);

  return {
    recognitions,
    ...filtered,
    isLoading,
    refetch,
    createRecognition: createMutation.mutate,
    reactToRecognition: reactMutation.mutate,
    isCreating: createMutation.isPending,
    isReacting: reactMutation.isPending
  };
}