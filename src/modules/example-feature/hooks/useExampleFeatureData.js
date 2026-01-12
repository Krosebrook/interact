import { useQuery } from '@tanstack/react-query';
import { exampleFeatureService } from '../services/exampleFeatureService';

/**
 * Custom hook for fetching example feature data
 * 
 * Follows the standard TanStack Query pattern used throughout the application.
 * Implements proper caching, error handling, and refetch logic.
 * 
 * @hook
 * @param {Object} options - Query options
 * @param {number} options.staleTime - Time in ms before data becomes stale
 * @param {boolean} options.enabled - Whether query should run
 * @returns {Object} Query result with data, isLoading, error, and refetch
 * 
 * @example
 * const { data, isLoading, error, refetch } = useExampleFeatureData();
 */
export function useExampleFeatureData(options = {}) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    ...restOptions
  } = options;

  return useQuery({
    queryKey: ['example-feature-data'],
    queryFn: async () => {
      const result = await exampleFeatureService.fetchData();
      return result;
    },
    staleTime,
    enabled,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...restOptions
  });
}

/**
 * Custom hook for fetching feature item by ID
 * 
 * @hook
 * @param {string} itemId - The item ID to fetch
 * @param {Object} options - Query options
 * @returns {Object} Query result
 * 
 * @example
 * const { data: item } = useExampleFeatureItem('item-123');
 */
export function useExampleFeatureItem(itemId, options = {}) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    enabled = !!itemId,
    ...restOptions
  } = options;

  return useQuery({
    queryKey: ['example-feature-item', itemId],
    queryFn: async () => {
      if (!itemId) throw new Error('Item ID is required');
      return await exampleFeatureService.fetchItemById(itemId);
    },
    enabled,
    staleTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...restOptions
  });
}
