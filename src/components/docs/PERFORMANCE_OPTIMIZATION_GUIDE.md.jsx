# Performance Optimization Guide

**Date:** January 14, 2026  
**Target:** 95th percentile response time < 1.5s

---

## Caching Strategy

### Query Cache (React Query)
```javascript
// Default stale times
const STALE_TIMES = {
  events: 30000,        // 30s - frequently changes
  activities: 60000,    // 1min - stable
  userProfile: 120000,  // 2min - rarely changes
  leaderboards: 300000  // 5min - computed once/hour
};
```

### Implementation
```javascript
// events/useEventData.js
const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: () => base44.entities.Event.list('-scheduled_date', 50),
  staleTime: STALE_TIMES.events,
  refetchOnWindowFocus: false,
  refetchOnMount: 'stale' // Only if stale
});
```

---

## Lazy Loading

### Intersection Observer
```javascript
// components/hooks/useLazyLoading.js
const { ref, inView } = useInView({
  threshold: 0.1,
  triggerOnce: false
});

// Load image only when entering viewport
{inView && <img src={largeImage} />}
```

### Virtual Scrolling for Lists
```javascript
const { visibleItems, containerRef } = useVirtualScroll(
  allItems,
  itemHeight = 80,
  bufferSize = 5
);

// Only render 20 items instead of 1000+
return visibleItems.map(item => <ItemCard key={item.id} item={item} />);
```

---

## Code Splitting

### Route-Based Splitting
```javascript
// components/core/providers/AppProviders.jsx
const Dashboard = lazy(() => import('pages/Dashboard'));
const Calendar = lazy(() => import('pages/Calendar'));
const Analytics = lazy(() => import('pages/Analytics'));

// Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/calendar" element={<Calendar />} />
  </Routes>
</Suspense>
```

---

## Image Optimization

### Next-Gen Formats
```javascript
// Use WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

### Responsive Images
```javascript
<img
  src="image-medium.jpg"
  srcSet="image-small.jpg 480w, image-medium.jpg 768w, image-large.jpg 1200w"
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 80vw, 70vw"
  alt="Description"
  loading="lazy"
/>
```

---

## Database Query Optimization

### Prefetching
```javascript
// Anticipate user navigation
const { prefetchEvents } = useCaching();

// Prefetch on hover
<Link 
  to="/calendar" 
  onMouseEnter={() => prefetchEvents()}
>
  Calendar
</Link>
```

### Batching
```javascript
// Instead of 10 separate requests
const users = await Promise.all(
  userEmails.map(email => 
    base44.entities.UserProfile.filter({ user_email: email })
  )
);

// Use batch function
const profiles = await batchProcess(
  userEmails,
  email => base44.entities.UserProfile.filter({ user_email: email }),
  batchSize = 10,
  delayMs = 100
);
```

---

## Network Optimization

### Request Deduplication
```javascript
// React Query automatically deduplicates identical queries
// within the same render cycle
useQuery({ queryKey: ['events'], queryFn: getEvents });
useQuery({ queryKey: ['events'], queryFn: getEvents });
// Only 1 HTTP request made
```

### Compression
```javascript
// All responses use gzip compression (platform handles)
// No additional configuration needed
```

---

## Monitoring & Metrics

### Web Vitals
```javascript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

### Target Metrics
```
LCP: < 2.5s (good)
FID: < 100ms (good)
CLS: < 0.1 (good)
FCP: < 1.8s (good)
TTFB: < 600ms (good)
```

---

## Performance Checklist

- [ ] Images lazy-loaded (loading="lazy")
- [ ] Routes code-split with React.lazy()
- [ ] Large lists use virtual scrolling
- [ ] Query cache stale times optimized
- [ ] Unused dependencies removed
- [ ] Bundle size < 200KB (gzipped)
- [ ] Lighthouse score >= 90
- [ ] No network waterfalls
- [ ] Fonts preloaded (if custom)
- [ ] No render blocking JS/CSS

---

## Post-Launch Monitoring

### Critical Metrics
```
- Page load time (p95 < 2s)
- API response time (p95 < 500ms)
- Time to interactive (p95 < 3s)
- Error rate < 0.1%
```

### Dashboard
Monitor via:
- Sentry (errors)
- DataDog/New Relic (performance)
- Lighthouse CI (regressions)