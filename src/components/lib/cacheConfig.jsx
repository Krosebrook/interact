/**
 * CACHE CONFIGURATION
 * Centralized cache timing for React Query
 */

// Cache durations in milliseconds
export const CACHE_TIMES = {
  // Real-time data - refresh frequently
  realtime: 5 * 1000,        // 5 seconds
  
  // Short-lived data - user sessions, notifications
  short: 30 * 1000,          // 30 seconds
  
  // Medium-lived data - events, participations
  medium: 2 * 60 * 1000,     // 2 minutes
  
  // Long-lived data - activities, badges
  long: 10 * 60 * 1000,      // 10 minutes
  
  // Static data - rarely changes
  static: 30 * 60 * 1000,    // 30 minutes
  
  // Permanent - only changes on explicit action
  permanent: 60 * 60 * 1000, // 1 hour
};

/**
 * Pre-configured cache settings for different data types
 */
export const cachePresets = {
  // Events - moderate refresh rate
  events: {
    staleTime: CACHE_TIMES.medium,
    gcTime: CACHE_TIMES.long,
    refetchOnWindowFocus: true,
  },
  
  // Activities - rarely change
  activities: {
    staleTime: CACHE_TIMES.long,
    gcTime: CACHE_TIMES.static,
    refetchOnWindowFocus: false,
  },
  
  // Participations - moderate refresh
  participations: {
    staleTime: CACHE_TIMES.medium,
    gcTime: CACHE_TIMES.long,
    refetchOnWindowFocus: true,
  },
  
  // User data - short cache
  user: {
    staleTime: CACHE_TIMES.short,
    gcTime: CACHE_TIMES.medium,
    refetchOnWindowFocus: true,
  },
  
  // Leaderboard - moderate cache
  leaderboard: {
    staleTime: CACHE_TIMES.medium,
    gcTime: CACHE_TIMES.long,
    refetchOnWindowFocus: false,
  },
  
  // Badges - long cache (static definitions)
  badges: {
    staleTime: CACHE_TIMES.static,
    gcTime: CACHE_TIMES.permanent,
    refetchOnWindowFocus: false,
  },
  
  // Store items - long cache
  storeItems: {
    staleTime: CACHE_TIMES.long,
    gcTime: CACHE_TIMES.static,
    refetchOnWindowFocus: false,
  },
  
  // Real-time data
  realtime: {
    staleTime: CACHE_TIMES.realtime,
    gcTime: CACHE_TIMES.short,
    refetchOnWindowFocus: true,
    refetchInterval: CACHE_TIMES.realtime,
  },
  
  // Static content
  static: {
    staleTime: CACHE_TIMES.static,
    gcTime: CACHE_TIMES.permanent,
    refetchOnWindowFocus: false,
  },
};

/**
 * Get cache config for an entity type
 */
export function getCacheConfig(entityType) {
  return cachePresets[entityType] || cachePresets.events;
}