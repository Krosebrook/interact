# Caching Strategy

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026

## Overview

Caching strategies used across the Interact platform for performance optimization.

## Client-Side Caching

### TanStack Query Cache
```javascript
{
  cacheTime: 5 * 60 * 1000,  // 5 minutes
  staleTime: 1 * 60 * 1000,  // 1 minute
  refetchOnWindowFocus: true
}
```

### localStorage Cache
- Auth tokens
- User preferences
- Theme selection
- Draft content (auto-save)

## Server-Side Caching

### Base44 Cache
- Entity queries cached automatically
- Configurable TTL per entity type
- Automatic invalidation on updates

### Redis Cache (Planned)
- Session data
- Frequently accessed data
- Real-time leaderboards
- Analytics aggregations

## Cache Invalidation

### Strategies
- **Time-based:** Expire after TTL
- **Event-based:** Invalidate on data changes
- **Manual:** Explicit cache clear

### Invalidation Examples
```javascript
// After mutation
queryClient.invalidateQueries(['activities']);

// Specific query
queryClient.invalidateQueries(['activity', activityId]);

// All related queries
queryClient.invalidateQueries({ queryKey: ['activities'] });
```

## Performance Targets
- Cache hit rate: > 80%
- Average response time: < 200ms (cached)
- Cache miss penalty: < 1s

**Document Owner:** Performance Team  
**Last Updated:** January 14, 2026
