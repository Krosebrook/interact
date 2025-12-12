/**
 * QUERY PROVIDER
 * Centralized React Query configuration
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CACHE_TIMES, API_CONFIG } from '../../shared/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.DYNAMIC_DATA,
      cacheTime: CACHE_TIMES.DYNAMIC_DATA * 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: API_CONFIG.RETRY_DELAY,
    },
  },
});

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
export default QueryProvider;