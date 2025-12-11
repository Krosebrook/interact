/**
 * OPTIMISTIC MUTATIONS WITH ROLLBACK
 * Production-grade optimistic UI updates with automatic rollback on failure
 * Ensures data consistency and provides seamless user experience
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logError } from './errors';

// ============================================================================
// OPTIMISTIC UPDATE HELPERS
// ============================================================================

/**
 * Create an optimistic mutation with automatic rollback
 */
export function useOptimisticMutation({
  mutationFn,
  queryKey,
  updateFn,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    
    // Before mutation: save snapshot and apply optimistic update
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot current data
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update cache
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return updateFn(old, variables);
      });
      
      // Return context with snapshot for rollback
      return { previousData };
    },
    
    // On success: invalidate to ensure sync with backend
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey });
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    
    // On error: rollback to previous state
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      logError(error, { 
        context: 'OptimisticMutation',
        variables 
      });
      
      const message = errorMessage || error.message || 'Operation failed';
      toast.error(message);
      
      if (onError) {
        onError(error, variables, context);
      }
    },
    
    // Always refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// ============================================================================
// SPECIALIZED OPTIMISTIC MUTATIONS
// ============================================================================

/**
 * Optimistic create mutation (add to list)
 */
export function useOptimisticCreate({
  mutationFn,
  queryKey,
  successMessage = 'Created successfully',
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, newItem) => {
      // Generate temporary ID for optimistic item
      const optimisticItem = {
        ...newItem,
        id: `temp_${Date.now()}`,
        _optimistic: true,
        created_date: new Date().toISOString(),
      };
      
      if (Array.isArray(oldData)) {
        return [optimisticItem, ...oldData];
      }
      
      return oldData;
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

/**
 * Optimistic update mutation (modify existing item)
 */
export function useOptimisticUpdate({
  mutationFn,
  queryKey,
  successMessage = 'Updated successfully',
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, { id, updates }) => {
      if (Array.isArray(oldData)) {
        return oldData.map(item => 
          item.id === id 
            ? { ...item, ...updates, _optimistic: true }
            : item
        );
      }
      
      if (oldData?.id === id) {
        return { ...oldData, ...updates, _optimistic: true };
      }
      
      return oldData;
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

/**
 * Optimistic delete mutation (remove from list)
 */
export function useOptimisticDelete({
  mutationFn,
  queryKey,
  successMessage = 'Deleted successfully',
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, itemId) => {
      if (Array.isArray(oldData)) {
        return oldData.filter(item => item.id !== itemId);
      }
      
      return oldData;
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

/**
 * Optimistic toggle mutation (boolean field)
 */
export function useOptimisticToggle({
  mutationFn,
  queryKey,
  field = 'is_active',
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, { id }) => {
      if (Array.isArray(oldData)) {
        return oldData.map(item => 
          item.id === id 
            ? { ...item, [field]: !item[field], _optimistic: true }
            : item
        );
      }
      
      if (oldData?.id === id) {
        return { ...oldData, [field]: !oldData[field], _optimistic: true };
      }
      
      return oldData;
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

/**
 * Optimistic reorder mutation (change list order)
 */
export function useOptimisticReorder({
  mutationFn,
  queryKey,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, { fromIndex, toIndex }) => {
      if (!Array.isArray(oldData)) return oldData;
      
      const newData = [...oldData];
      const [removed] = newData.splice(fromIndex, 1);
      newData.splice(toIndex, 0, removed);
      
      return newData.map((item, index) => ({
        ...item,
        display_order: index,
        _optimistic: true,
      }));
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

// ============================================================================
// BATCH OPTIMISTIC MUTATIONS
// ============================================================================

/**
 * Optimistic batch update (multiple items at once)
 */
export function useOptimisticBatchUpdate({
  mutationFn,
  queryKey,
  successMessage = 'Updated successfully',
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, { ids, updates }) => {
      if (!Array.isArray(oldData)) return oldData;
      
      const idSet = new Set(ids);
      return oldData.map(item => 
        idSet.has(item.id)
          ? { ...item, ...updates, _optimistic: true }
          : item
      );
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

/**
 * Optimistic batch delete (multiple items at once)
 */
export function useOptimisticBatchDelete({
  mutationFn,
  queryKey,
  successMessage = 'Deleted successfully',
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, ids) => {
      if (!Array.isArray(oldData)) return oldData;
      
      const idSet = new Set(ids);
      return oldData.filter(item => !idSet.has(item.id));
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

// ============================================================================
// COMPLEX OPTIMISTIC UPDATES
// ============================================================================

/**
 * Optimistic nested update (update nested object/array)
 */
export function useOptimisticNestedUpdate({
  mutationFn,
  queryKey,
  path,
  successMessage = 'Updated successfully',
  errorMessage,
  onSuccess,
  onError,
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    updateFn: (oldData, { id, nestedUpdates }) => {
      if (!Array.isArray(oldData)) return oldData;
      
      return oldData.map(item => {
        if (item.id !== id) return item;
        
        const updated = { ...item, _optimistic: true };
        let target = updated;
        const pathParts = path.split('.');
        
        // Navigate to nested property
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!target[pathParts[i]]) target[pathParts[i]] = {};
          target = target[pathParts[i]];
        }
        
        // Apply nested update
        const lastPart = pathParts[pathParts.length - 1];
        target[lastPart] = { ...target[lastPart], ...nestedUpdates };
        
        return updated;
      });
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const OptimisticMutations = {
  useOptimisticMutation,
  useOptimisticCreate,
  useOptimisticUpdate,
  useOptimisticDelete,
  useOptimisticToggle,
  useOptimisticReorder,
  useOptimisticBatchUpdate,
  useOptimisticBatchDelete,
  useOptimisticNestedUpdate,
};

export default OptimisticMutations;