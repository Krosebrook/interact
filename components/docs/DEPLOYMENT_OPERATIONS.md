# Deployment & Operations Guide

## Deployment Architecture

### Base44 Platform Deployment

**Platform**: Base44 BaaS (Backend-as-a-Service)
**Hosting**: Managed cloud infrastructure
**Regions**: Auto-selected based on user location
**CDN**: Global content delivery network

### Application Components

```
┌─────────────────────────────────────────────┐
│           Base44 Dashboard                   │
│  (Admin interface for deployment & config)   │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────┐                 ┌──────▼──────┐
│Frontend│                 │   Backend   │
│ (React)│                 │  (Functions)│
│        │                 │             │
│ • Pages│                 │ • Deno      │
│ • Comps│                 │ • Serverless│
│ • Assets                 │ • Hot Deploy│
└───┬────┘                 └──────┬──────┘
    │                             │
    └─────────┬───────────────────┘
              │
      ┌───────▼────────┐
      │   Entities DB   │
      │   (Managed)     │
      └────────────────┘
```

---

## Environment Setup

### Development Environment

**Requirements**:
- Node.js 18+ or 20+
- npm or yarn
- Base44 CLI (optional)
- Git

**Setup Steps**:
```bash
# 1. Clone project from Base44
# (via dashboard export or git if configured)

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev

# 4. Access at http://localhost:5173
```

**Local Development Features**:
- Hot reload on file changes
- React Fast Refresh
- Live preview in browser
- Console error reporting
- Network request inspection

### Staging Environment

**Purpose**: Pre-production testing
**Access**: Base44 staging URL
**Data**: Separate database from production
**Auth**: Same SSO providers, test accounts

**Deployment**:
```bash
# Via Base44 Dashboard:
1. Select "Deploy to Staging"
2. Choose branch/commit
3. Review changes
4. Click "Deploy"

# Automatic on push to staging branch (if configured)
```

### Production Environment

**URL**: https://[your-app].base44.app
**Custom Domain**: Configure via Base44 dashboard
**SSL**: Auto-provisioned (Let's Encrypt)
**CDN**: Enabled by default

**Deployment**:
```bash
# Via Base44 Dashboard:
1. Select "Deploy to Production"
2. Review staging changes
3. Approve deployment
4. Monitor rollout

# Zero-downtime deployment
# Automatic rollback on errors
```

---

## Deployment Process

### Pre-Deployment Checklist

**Code Quality**:
- [ ] All tests passing
- [ ] No console.error in production code
- [ ] Linting warnings resolved
- [ ] Code reviewed (if team)
- [ ] Breaking changes documented

**Data & Schema**:
- [ ] Entity migrations prepared
- [ ] Sample data for new entities
- [ ] Permissions verified
- [ ] Indexes added for new queries

**Functions**:
- [ ] All functions tested locally
- [ ] Error handling implemented
- [ ] Rate limiting considered
- [ ] Secrets configured

**UI/UX**:
- [ ] Responsive design verified
- [ ] Accessibility tested
- [ ] Loading states implemented
- [ ] Error messages user-friendly

**Performance**:
- [ ] Large queries optimized
- [ ] Images compressed
- [ ] Bundle size checked
- [ ] Lazy loading applied

### Deployment Steps

**1. Prepare Release**:
```bash
# Update version in package.json
npm version minor  # or patch, major

# Tag commit
git tag -a v1.2.0 -m "Release 1.2.0: AI Content Generator"
git push origin v1.2.0
```

**2. Deploy via Dashboard**:
- Navigate to Base44 Dashboard → Your App
- Click "Deploy"
- Select environment (Staging/Production)
- Review file changes
- Add deployment notes
- Click "Confirm Deploy"

**3. Monitor Deployment**:
```
Base44 Dashboard → Deployment Status:
├─ Files uploading... (30s)
├─ Building application... (1-2 min)
├─ Deploying functions... (30s)
├─ Running migrations... (if any)
└─ Deployment complete! ✓
```

**4. Post-Deployment Verification**:
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Key features functional
- [ ] No console errors
- [ ] Analytics tracking

**5. Rollback if Needed**:
```bash
# Via Dashboard: Deployments → Previous Version → Rollback
# Instant rollback to last stable version
```

---

## Secrets Management

### Setting Secrets

**Via Base44 Dashboard**:
```
Settings → Environment Variables → Add New
Name: OPENAI_API_KEY
Value: sk-...
Environment: Production (or All)
```

**Currently Configured**:
```
✓ OPENAI_API_KEY          (AI content generation)
✓ ANTHROPIC_API_KEY       (AI recommendations)
✓ STRIPE_SECRET_KEY       (Payment processing)
✓ STRIPE_SIGNING_SECRET   (Webhook validation)
✓ GOOGLE_API_KEY          (Calendar, Maps)
✓ CLOUDINARY_URL          (Image storage)
✓ NOTION_API_KEY          (Integrations)
✓ HUBSPOT_PERSONAL_ACCESS_KEY
✓ FIRECRAWL_API_KEY
✓ PERPLEXITY_API_KEY
```

**Auto-injected** (no need to set):
```
BASE44_APP_ID            (App identifier)
BASE44_SERVICE_ROLE_KEY  (Internal use)
```

### Accessing Secrets in Functions

```javascript
// Deno functions can access via Deno.env
const apiKey = Deno.env.get('OPENAI_API_KEY');

if (!apiKey) {
  return Response.json(
    { error: 'API key not configured' }, 
    { status: 500 }
  );
}
```

**Security Best Practices**:
- ✅ Never log secrets
- ✅ Never return secrets in API responses
- ✅ Use environment-specific secrets (dev vs prod)
- ✅ Rotate keys quarterly
- ❌ Never commit secrets to git
- ❌ Never hardcode in frontend code

---

## Monitoring & Logging

### Built-in Monitoring (Base44 Dashboard)

**Function Logs**:
```
Dashboard → Functions → [Function Name] → Logs

Shows:
- Execution time (ms)
- Memory usage
- Status code
- Error messages
- Timestamp
- Request payload (truncated)
```

**Error Tracking**:
```
Dashboard → Errors

Grouped by:
- Error type
- Function name
- Frequency
- Last occurrence
```

**Performance Metrics**:
```
Dashboard → Analytics

Tracks:
- Function execution counts
- Average response time
- Error rate
- Storage usage
- Bandwidth consumption
```

### Custom Logging

**Frontend (React)**:
```javascript
// Development only
if (import.meta.env.DEV) {
  console.log('User data:', user);
}

// Production error tracking
try {
  // ... operation
} catch (error) {
  console.error('Failed to load data:', error);
  toast.error('An error occurred. Please try again.');
}
```

**Backend (Functions)**:
```javascript
Deno.serve(async (req) => {
  console.log('Function invoked:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  
  try {
    // ... logic
    return Response.json({ success: true });
  } catch (error) {
    console.error('Function error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### Alerting

**Setup Alerts** (via Base44 Dashboard):
```
Settings → Alerts → Add New

Conditions:
- Error rate > 5% for 5 minutes
- Function execution time > 5 seconds
- Storage usage > 90%

Actions:
- Send email to: dev@company.com
- Webhook to: https://...
```

---

## Scaling Considerations

### Current Limits (Base44 Free Tier)

```
Function Executions:  100,000/month
Storage:              1 GB
Bandwidth:            10 GB/month
Concurrent Users:     Unlimited (auto-scales)
```

### Optimization Strategies

**1. Frontend Optimizations**:
```javascript
// Lazy load components
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));

// Memoize expensive calculations
const sortedData = useMemo(() => 
  data.sort((a, b) => b.points - a.points),
  [data]
);

// Debounce search
const debouncedSearch = useDebounce(searchTerm, 300);
```

**2. Backend Optimizations**:
```javascript
// Batch database queries
const [users, points, badges] = await Promise.all([
  base44.entities.User.list(),
  base44.entities.UserPoints.list(),
  base44.entities.BadgeAward.list()
]);

// Use indexes
const events = await base44.entities.Event.filter({
  status: 'scheduled',          // Indexed field
  scheduled_date: { $gte: now } // Indexed field
}, 'scheduled_date', 20);       // Limit results
```

**3. Caching Strategy**:
```javascript
// React Query with aggressive caching
const { data } = useQuery({
  queryKey: ['leaderboard'],
  queryFn: fetchLeaderboard,
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000  // 10 minutes
});
```

**4. Pagination**:
```javascript
// Frontend pagination
const [page, setPage] = useState(0);
const pageSize = 20;
const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);

// Backend pagination
const users = await base44.entities.User.list(
  '-created_date',  // Sort
  20,               // Limit
  page * 20         // Skip
);
```

### Auto-Scaling

**Base44 Handles**:
- ✅ Traffic spikes (automatic)
- ✅ Database connections (pooled)
- ✅ Function instances (cold start optimization)
- ✅ CDN caching (global)

**You Handle**:
- ⚠️ Query optimization
- ⚠️ Bundle size reduction
- ⚠️ API rate limiting (if needed)

---

## Backup & Disaster Recovery

### Automatic Backups

**Schedule**:
- Daily: 3:00 AM UTC
- Retention: 30 days
- Scope: All entities + file storage

**Verification**:
```
Dashboard → Backups

Shows:
- Backup date/time
- Size
- Status (complete/failed)
- Restore button
```

### Manual Backup (Export)

```javascript
// Admin function to export all data
async function exportAllData() {
  const allData = {
    users: await base44.asServiceRole.entities.User.list(),
    profiles: await base44.asServiceRole.entities.UserProfile.list(),
    points: await base44.asServiceRole.entities.UserPoints.list(),
    badges: await base44.asServiceRole.entities.BadgeAward.list(),
    // ... all entities
  };
  
  return Response.json(allData);
}
```

**Download via Dashboard**:
```
Dashboard → Data → Export → Select Entities → Download JSON
```

### Restore Procedures

**Full Restore** (from backup):
```
1. Contact Base44 Support
2. Specify backup date
3. Confirm restore (overwrites current data)
4. Wait for restore (15-30 min)
5. Verify data integrity
```

**Partial Restore** (entity-level):
```
1. Export current data (safety)
2. Dashboard → Data → [Entity] → Import
3. Upload JSON file
4. Choose merge or replace
5. Verify import
```

**Point-in-Time Recovery**:
```
Available for: Last 7 days
Granularity: 5-minute intervals
Process: Contact Base44 Support with timestamp
```

---

## Performance Tuning

### Frontend Performance

**Bundle Analysis**:
```bash
# Check bundle size
npm run build
# Outputs: dist/assets/main.[hash].js (size)

# Analyze dependencies
npx vite-bundle-visualizer

# Large dependencies to lazy-load:
- recharts (~150KB)
- react-quill (~100KB)
- framer-motion (~80KB)
```

**Lazy Loading Routes**:
```javascript
const routes = [
  {
    path: '/admin',
    component: lazy(() => import('./pages/GamificationAdmin'))
  },
  {
    path: '/learning',
    component: lazy(() => import('./pages/LearningDashboard'))
  }
];
```

**Image Optimization**:
```javascript
// Use Cloudinary transformations
const imageUrl = `https://res.cloudinary.com/[cloud]/image/upload/w_400,q_auto,f_auto/[image].jpg`;

// Lazy load images
<img 
  loading="lazy" 
  src={imageUrl} 
  alt="..." 
/>
```

### Backend Performance

**Function Cold Start** (~200ms):
```javascript
// Keep functions warm
setInterval(() => {
  fetch('https://[app].base44.app/api/functions/healthCheck');
}, 5 * 60 * 1000);  // Every 5 minutes
```

**Database Query Optimization**:
```javascript
// Bad: Multiple queries
for (const user of users) {
  const points = await base44.entities.UserPoints.filter({ user_email: user.email });
}

// Good: Single query with join
const allPoints = await base44.entities.UserPoints.list();
const pointsMap = Object.fromEntries(allPoints.map(p => [p.user_email, p]));
```

**Caching Strategy**:
```javascript
// Cache expensive AI calls
const cacheKey = `ai_recommendations_${userId}`;
const cached = await cache.get(cacheKey);

if (cached) return cached;

const recommendations = await generateRecommendations(userId);
await cache.set(cacheKey, recommendations, 3600);  // 1 hour TTL
return recommendations;
```

---

## Troubleshooting Common Issues

### Deployment Failures

**Issue**: Build fails with "Module not found"
```
Solution:
1. Check import paths (case-sensitive)
2. Verify package.json dependencies
3. Clear node_modules and reinstall
4. Check for circular dependencies
```

**Issue**: Function deployment fails
```
Solution:
1. Check function syntax (Deno.serve wrapper)
2. Verify imports (use npm: or jsr: prefix)
3. Check for missing secrets
4. Review function logs for specific error
```

### Runtime Errors

**Issue**: "Unauthorized" on entity access
```
Solution:
1. Check entity permissions in schema
2. Verify user role (admin/facilitator/participant)
3. Ensure base44.auth.me() succeeds
4. Check frontend token is valid
```

**Issue**: Function timeout (30s limit)
```
Solution:
1. Optimize slow queries (add indexes)
2. Reduce AI token count (shorter prompts)
3. Split into multiple function calls
4. Use async/streaming responses
```

**Issue**: Out of memory
```
Solution:
1. Reduce data fetched in single query
2. Implement pagination
3. Stream large responses
4. Clear unused variables
```

### Data Issues

**Issue**: Stale data in UI
```
Solution:
1. Check React Query staleTime
2. Invalidate queries after mutations
3. Force refetch: queryClient.invalidateQueries([key])
```

**Issue**: Missing entity records
```
Solution:
1. Check permissions (read rules)
2. Verify entity created successfully
3. Check for soft deletes (status field)
4. Review AuditLog for deletions
```

---

## Maintenance Schedule

### Daily
- ✅ Monitor error rate
- ✅ Check function performance
- ✅ Review new user sign-ups

### Weekly
- ✅ Review AI content quality
- ✅ Check gamification balance
- ✅ Analyze engagement metrics
- ✅ Clear old notifications

### Monthly
- ✅ Audit user permissions
- ✅ Review and optimize queries
- ✅ Update dependencies
- ✅ Rotate API keys
- ✅ Review storage usage

### Quarterly
- ✅ Full backup verification
- ✅ Security audit
- ✅ Performance benchmarking
- ✅ User feedback review
- ✅ Feature prioritization

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

```
Dashboard → Deployments → [Previous Version] → Rollback
✓ Instant revert to last stable version
✓ All functions rolled back
✓ Frontend assets reverted
⚠️ Database changes NOT reverted (manual if needed)
```

### Partial Rollback (Function Only)

```
Dashboard → Functions → [Function Name] → Versions → [Select] → Deploy
✓ Rollback single function
✓ Keep other changes
```

### Database Rollback (Last Resort)

```
1. Assess impact (how many users affected?)
2. Export current data (safety)
3. Contact Base44 Support
4. Request restore to specific timestamp
5. Communicate downtime to users
6. Verify restore
7. Re-deploy compatible code
```

---

## Cost Optimization

### Current Usage Tracking

```
Dashboard → Usage

Monitor:
- Function executions (free: 100K/month)
- Storage (free: 1 GB)
- Bandwidth (free: 10 GB/month)
```

### Cost Reduction Strategies

**1. Reduce Function Calls**:
```javascript
// Bad: Call on every render
useEffect(() => {
  fetchData();
}, []);

// Good: Cache with React Query
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000  // Don't refetch for 5 min
});
```

**2. Optimize Storage**:
- Compress images before upload
- Delete unused files
- Use CDN URLs (external hosting)
- Archive old data

**3. Reduce Bandwidth**:
- Enable gzip compression (auto)
- Lazy load images
- Use CDN for assets
- Implement pagination

---

## Security Checklist

### Pre-Production
- [ ] All secrets in environment variables (not code)
- [ ] Entity permissions configured
- [ ] Admin functions require admin role
- [ ] User inputs sanitized
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS enforced (auto by Base44)
- [ ] CSP headers configured (if needed)

### Post-Production
- [ ] Monitor for unusual activity
- [ ] Review AuditLog regularly
- [ ] Test authentication flows
- [ ] Verify data access permissions
- [ ] Check for SQL injection (not applicable with Base44)
- [ ] Scan dependencies for vulnerabilities

---

## Support & Escalation

### Base44 Platform Issues

**Dashboard Issues**:
- Email: support@base44.com
- In-dashboard: Help → Contact Support
- Response time: < 24 hours

**Critical Outages**:
- Status page: status.base44.com
- Twitter: @base44status
- Emergency: Automatic failover

### Application Issues

**Bug Reports**:
- Include: Steps to reproduce, expected vs actual
- Attach: Console logs, screenshots
- Severity: Critical / High / Medium / Low

**Feature Requests**:
- Document: User story, use case
- Prioritize: Must-have / Nice-to-have
- Timeline: Next sprint / Backlog

---

## Conclusion

This comprehensive deployment and operations guide covers:
- ✅ Environment setup and deployment process
- ✅ Secrets management and security
- ✅ Monitoring, logging, and alerting
- ✅ Scaling and performance optimization
- ✅ Backup and disaster recovery
- ✅ Troubleshooting and rollback procedures
- ✅ Maintenance schedule and cost optimization

Use this guide for:
- Deploying new versions safely
- Troubleshooting production issues
- Optimizing performance and costs
- Planning maintenance windows
- Training new team members

**Last Updated**: 2025-12-29
**Version**: 1.0
**Next Review**: 2026-01-29