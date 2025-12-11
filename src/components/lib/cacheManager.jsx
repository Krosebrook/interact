/**
 * CACHE MANAGEMENT SYSTEM
 * React Query cache utilities and invalidation strategies
 */

import { queryKeys, invalidationGroups } from './queryKeys';

// ============================================================================
// CACHE INVALIDATION STRATEGIES
// ============================================================================

export const CacheManager = {
  /**
   * Invalidate all event-related queries
   */
  invalidateEvents(queryClient, eventId = null) {
    const keys = [
      queryKeys.events.all,
      queryKeys.participations.all
    ];

    if (eventId) {
      keys.push(
        queryKeys.events.detail(eventId),
        queryKeys.participations.byEvent(eventId),
        queryKeys.media.byEvent(eventId)
      );
    }

    return Promise.all(keys.map(key => queryClient.invalidateQueries(key)));
  },

  /**
   * Invalidate gamification data for a user
   */
  invalidateGamification(queryClient, email) {
    const keys = [
      queryKeys.userPoints.byUser(email),
      queryKeys.badges.awards(email),
      queryKeys.leaderboard.all,
      queryKeys.user.profile(email)
    ];

    return Promise.all(keys.map(key => queryClient.invalidateQueries(key)));
  },

  /**
   * Invalidate team-related queries
   */
  invalidateTeam(queryClient, teamId) {
    const keys = [
      queryKeys.teams.all,
      queryKeys.teams.detail(teamId),
      queryKeys.teams.members(teamId),
      queryKeys.teams.challenges(teamId),
      queryKeys.leaderboard.teams('all')
    ];

    return Promise.all(keys.map(key => queryClient.invalidateQueries(key)));
  },

  /**
   * Invalidate user profile and related data
   */
  invalidateUserProfile(queryClient, email) {
    const keys = [
      queryKeys.user.profile(email),
      queryKeys.user.avatar(email),
      queryKeys.user.preferences(email),
      queryKeys.inventory.byUser(email)
    ];

    return Promise.all(keys.map(key => queryClient.invalidateQueries(key)));
  },

  /**
   * Invalidate store and inventory
   */
  invalidateStore(queryClient, email = null) {
    const keys = [queryKeys.storeItems.all];

    if (email) {
      keys.push(
        queryKeys.inventory.byUser(email),
        queryKeys.transactions.byUser(email)
      );
    }

    return Promise.all(keys.map(key => queryClient.invalidateQueries(key)));
  },

  /**
   * Invalidate recognition feed
   */
  invalidateRecognition(queryClient, email = null) {
    const keys = [
      queryKeys.recognition.all,
      queryKeys.recognition.featured()
    ];

    if (email) {
      keys.push(
        queryKeys.recognition.sent(email),
        queryKeys.recognition.received(email)
      );
    }

    return Promise.all(keys.map(key => queryClient.invalidateQueries(key)));
  },

  /**
   * Clear all caches (use sparingly)
   */
  clearAll(queryClient) {
    return queryClient.clear();
  }
};

// ============================================================================
// OPTIMISTIC UPDATE HELPERS
// ============================================================================

export const OptimisticUpdates = {
  /**
   * Optimistically update a list item
   */
  updateListItem(queryClient, queryKey, itemId, updateFn) {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old;
      return old.map(item => 
        item.id === itemId ? updateFn(item) : item
      );
    });
  },

  /**
   * Optimistically add item to list
   */
  addToList(queryClient, queryKey, newItem) {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return [newItem];
      return [...old, newItem];
    });
  },

  /**
   * Optimistically remove item from list
   */
  removeFromList(queryClient, queryKey, itemId) {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old;
      return old.filter(item => item.id !== itemId);
    });
  },

  /**
   * Optimistically increment counter
   */
  incrementCounter(queryClient, queryKey, field, amount = 1) {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        [field]: (old[field] || 0) + amount
      };
    });
  }
};

// ============================================================================
// CACHE PREFETCHING
// ============================================================================

export const CachePrefetch = {
  /**
   * Prefetch user data
   */
  async prefetchUser(queryClient, email, api) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.userPoints.byUser(email),
        queryFn: () => api.get('UserPoints', { user_email: email })
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.user.profile(email),
        queryFn: () => api.get('UserProfile', { user_email: email })
      })
    ]);
  },

  /**
   * Prefetch event details
   */
  async prefetchEvent(queryClient, eventId, api) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.events.detail(eventId),
        queryFn: () => api.get('Event', { id: eventId })
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.participations.byEvent(eventId),
        queryFn: () => api.get('Participation', { event_id: eventId })
      })
    ]);
  },

  /**
   * Prefetch leaderboard
   */
  async prefetchLeaderboard(queryClient, period, api) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.leaderboard.byPeriod(period, 'points'),
      queryFn: () => api.get('UserPoints', {}, { sort: '-total_points', limit: 50 })
    });
  }
};

// ============================================================================
// CACHE MONITORING
// ============================================================================

export const CacheMonitor = {
  /**
   * Get cache statistics
   */
  getStats(queryClient) {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.state.isInvalidated).length,
      fetchingQueries: queries.filter(q => q.state.isFetching).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cachedData: queries.reduce((acc, q) => acc + JSON.stringify(q.state.data || {}).length, 0)
    };
  },

  /**
   * Log cache state (development only)
   */
  logCacheState(queryClient) {
    if (process.env.NODE_ENV !== 'development') return;
    
    const stats = CacheMonitor.getStats(queryClient);
    console.log('📊 Cache Stats:', stats);
    
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    console.table(
      queries.map(q => ({
        key: JSON.stringify(q.queryKey),
        status: q.state.status,
        stale: q.state.isInvalidated,
        fetching: q.state.isFetching,
        dataUpdatedAt: new Date(q.state.dataUpdatedAt).toLocaleTimeString()
      }))
    );
  },

  /**
   * Remove stale queries
   */
  removeStaleQueries(queryClient, olderThanMs = 3600000) {
    const cache = queryClient.getQueryCache();
    const now = Date.now();
    
    cache.getAll().forEach(query => {
      const age = now - query.state.dataUpdatedAt;
      if (age > olderThanMs && query.state.isInvalidated) {
        cache.remove(query);
      }
    });
  }
};

export default CacheManager;