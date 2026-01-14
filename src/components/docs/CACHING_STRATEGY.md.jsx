# Caching Strategy

**Objective:** Minimize API calls, reduce latency, provide better offline experience while keeping data fresh.

---

## Cache Layers

### 1. Query Cache (React Query)

**Purpose:** Store API responses in memory for fast retrieval.

**Configuration:**
```javascript
staleTime: 5 * 60 * 1000,    // 5 minutes before considered stale
gcTime: 10 * 60 * 1000,      // 10 minutes before garbage collected
refetchInterval: 5 * 60 * 1000 // Auto-refetch every 5 minutes
```

**Cache Keys:**
```javascript
// Hierarchical, predictable naming
['leaderboard', 'weekly']           // All weekly leaderboards
['leaderboard', 'weekly', 'jan14']  // Specific period
['user-points', 'alice@test.com']   // User points
['events', { status: 'upcoming' }]  // Events with filter
```

### 2. Browser Cache (Service Worker)

**Purpose:** Offline support and instant page load.

**Cached Assets:**
- HTML, CSS, JS bundles
- Images (avatars, badges)
- API responses (events, activities)

**Update Strategy:**
- Cache first for static assets
- Network first for data (check network, fallback to cache)
- Stale-while-revalidate for API responses

### 3. HTTP Cache Headers

**Purpose:** Browser-native caching.

**Implementation:**
```javascript
// API response headers
Cache-Control: max-age=300, stale-while-revalidate=600
// = Cache for 5 min, allow stale for 10 min while refetching
```

---

## Specific Cache Strategies

### Leaderboard Cache (5-min stale-while-revalidate)

```javascript
// components/hooks/useLeaderboardCache.js
useQuery({
  queryKey: ['leaderboard', type],
  queryFn: () => fetchLeaderboardData(type),
  staleTime: 5 * 60 * 1000,        // 5 minutes stale
  gcTime: 10 * 60 * 1000,          // 10 minutes garbage collect
  refetchInterval: 5 * 60 * 1000    // Auto-refetch every 5 min
});
```

**Why 5 minutes?**
- Users expect rank changes within 5-10 minutes
- Reduces API load significantly
- Stale-while-revalidate keeps UI responsive

### User Points Cache (30 seconds)

```javascript
useQuery({
  queryKey: ['user-points', email],
  staleTime: 30 * 1000,   // 30 seconds
  gcTime: 2 * 60 * 1000   // 2 minutes
});
```

**Why 30 seconds?**
- Points change frequently (events, recognition)
- Need relatively fresh data but not real-time
- Real-time subscription for live updates

### Events Cache (1 hour)

```javascript
useQuery({
  queryKey: ['events', { status: 'upcoming' }],
  staleTime: 60 * 60 * 1000,  // 1 hour
  gcTime: 2 * 60 * 60 * 1000  // 2 hours
});
```

**Why 1 hour?**
- Events don't change frequently
- Can afford to show slightly stale data
- Significant API savings

### User Profile Cache (2 minutes)

```javascript
useQuery({
  queryKey: ['user-profile', email],
  staleTime: 2 * 60 * 1000,   // 2 minutes
  gcTime: 5 * 60 * 1000       // 5 minutes
});
```

**Why 2 minutes?**
- Users edit profile occasionally
- Need to reflect changes quickly
- But not so aggressive as to cause API churn

---

## Prefetching Strategy

### Dashboard Prefetch (On Mount)

```javascript
// pages/Dashboard.js
useEffect(() => {
  const { prefetch: prefetchLeaderboards } = usePrefetchAllLeaderboards();
  
  // Prefetch all leaderboard types when page loads
  prefetchLeaderboards();
  
  // Prefetch user points
  queryClient.prefetchQuery({
    queryKey: ['user-points', user.email],
    queryFn: () => fetchUserPoints(user.email)
  });
  
  // Prefetch upcoming events
  queryClient.prefetchQuery({
    queryKey: ['events', { status: 'upcoming' }],
    queryFn: () => fetchUpcomingEvents()
  });
}, []);
```

**Benefits:**
- Data ready before user navigates
- Faster page transitions
- Better perceived performance

### Pagination Prefetch

```javascript
// Prefetch next page before user clicks
const handlePageChange = (nextPage) => {
  queryClient.prefetchQuery({
    queryKey: ['events', { page: nextPage }],
    queryFn: () => fetchEvents({ page: nextPage })
  });
  setCurrentPage(nextPage);
};
```

---

## Cache Invalidation

### Automatic Invalidation

```javascript
// When points awarded, invalidate leaderboard
const mutation = useMutation({
  mutationFn: awardPoints,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['leaderboard'],
      refetchType: 'active' // Only refetch visible queries
    });
  }
});
```

### Manual Invalidation

```javascript
// User manually refreshes
const handleRefresh = () => {
  queryClient.invalidateQueries(['leaderboard', 'weekly']);
};
```

### Smart Invalidation

```javascript
// Only invalidate affected data
const mutation = useMutation({
  mutationFn: updateUserProfile,
  onSuccess: (updatedUser) => {
    // Update specific cached entry instead of all
    queryClient.setQueryData(
      ['user-profile', updatedUser.email],
      updatedUser
    );
  }
});
```

---

## Cache Scenarios

### Scenario 1: User Receives Recognition

```
1. User A gives recognition to User B
2. Recognition created (mutate)
3. User B's points +5 (update UserPoints)
4. Leaderboard snapshot updated via subscription
5. Cache invalidation:
   - Invalidate ['user-points', 'userB@test.com']
   - Invalidate ['leaderboard'] (trigger refetch via subscription)
```

### Scenario 2: User Joins Challenge

```
1. User clicks "Join Challenge"
2. Participation record created
3. User's points +5 immediately
4. Cache updates:
   - Optimistically update ['user-points', email]
   - Update ['challenges', { status: 'active' }]
   - Subscription broadcasts leaderboard change
```

### Scenario 3: Network Offline

```
1. User loses connection
2. Service Worker serves cached data
3. Pending mutations queued locally
4. User sees "Offline" indicator
5. Connection restored
6. Queued mutations sent
7. Caches invalidated, data synced
```

---

## Monitoring Cache Health

### Metrics to Track

```javascript
// Log cache hit/miss ratio
const cacheMetrics = {
  hits: 0,
  misses: 0,
  get ratio() {
    return (this.hits / (this.hits + this.misses) * 100).toFixed(2) + '%';
  }
};

// Hook to measure
useQuery({
  onSuccess: () => {
    // Check if came from cache
    const wasInCache = !query.isFetching;
    if (wasInCache) cacheMetrics.hits++;
    else cacheMetrics.misses++;
  }
});
```

### Cache Size

```javascript
// Monitor memory usage
const cacheState = queryClient.getQueryCache();
const cacheSize = cacheState.getAll().length;
console.log(`Cached queries: ${cacheSize}`);
```

---

## Cache Debugging

### React Query DevTools

```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In app
<ReactQueryDevtools initialIsOpen={false} />
```

**Features:**
- See all cached queries
- View cache timestamps
- Manually refetch/invalidate
- See query history

### Manual Cache Inspection

```javascript
// View all cached data
const allQueries = queryClient.getQueryCache().getAll();
console.table(allQueries.map(q => ({
  key: JSON.stringify(q.queryKey),
  state: q.state.status,
  data: q.state.data,
  stale: q.isStale()
})));
```

---

## Best Practices

### ✅ DO

- **Use query keys consistently:** Same structure, predictable naming
- **Set appropriate staleTime:** Consider use case (events: 1h, points: 30s)
- **Prefetch on navigation:** Load data before user needs it
- **Smart invalidation:** Invalidate only affected caches
- **Monitor cache health:** Track hit/miss ratios
- **Test offline:** Verify Service Worker caching works
- **Use subscriptions:** For real-time, supplement cache with subscriptions

### ❌ DON'T

- **Cache sensitive data:** Don't cache PII, passwords, tokens
- **Cache forever:** Set reasonable `gcTime`
- **Over-invalidate:** Don't invalidate entire app on one change
- **Rely only on cache:** Always have network fallback
- **Forget cleanup:** Clear cache on logout
- **Cache user preferences:** These should be real-time
- **Cache security rules:** Always verify on backend

---

## Cache Busting

### Version-based

```javascript
// Append version hash to assets
<script src="/app.bundle.abc123.js"></script>
// If app updates, hash changes, cache busted automatically
```

### Time-based

```javascript
// Add timestamp to cache key if needed
queryKey: ['events', { bust: Date.now() }]
```

### Explicit Clear

```javascript
// On logout, clear all caches
const handleLogout = () => {
  queryClient.clear();
  auth.logout();
};
```

---

## Testing Cache

```javascript
test('caches leaderboard for 5 minutes', async () => {
  const { result } = renderHook(() => useLeaderboardCache('weekly'));
  
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  const firstData = result.current.data;
  
  // Mock time advancement
  jest.useFakeTimers();
  jest.advanceTimersByTime(3 * 60 * 1000); // 3 minutes
  
  // Should still be cached (not stale)
  expect(result.current.data).toBe(firstData);
  
  jest.advanceTimersByTime(2 * 60 * 1000); // 5+ minutes
  
  // Should refetch now (stale)
  await waitFor(() => expect(result.current.isFetching).toBe(true));
});
```

---

## Resources

- **React Query Docs:** https://tanstack.com/query/latest
- **Cache Best Practices:** https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching
- **Service Worker API:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

**Last Updated:** January 14, 2026  
**Owner:** Engineering Team