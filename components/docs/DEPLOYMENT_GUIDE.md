# INTeract - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

**Required Secrets** (Set in Base44 Dashboard → Settings → Environment Variables)
```bash
# AI Services
OPENAI_API_KEY=sk-...           # For activity generation
ANTHROPIC_API_KEY=sk-ant-...    # Alternative LLM

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...   # Production key
STRIPE_SIGNING_SECRET=whsec_... # Webhook verification

# Notifications
TEAMS_WEBHOOK_URL=https://...   # MS Teams incoming webhook

# Optional
CLOUDINARY_URL=cloudinary://... # Image optimization
HUBSPOT_PERSONAL_ACCESS_KEY=... # CRM sync
NOTION_API_KEY=...              # Documentation sync
```

**Auto-Populated** (No action needed)
- `BASE44_APP_ID` - Set automatically by platform

### 2. Owner Email Configuration

**File:** `components/lib/rbac/roles.js`

```javascript
export const OWNER_EMAILS = [
  'lisa@intinc.com',        // Primary owner
  'admin@edgewater.com'     // Secondary company
];
```

**Also update in:**
- `functions/lib/rbacMiddleware.js`
- `functions/inviteUser.js`
- `functions/manageUserRole.js`

### 3. Company Branding

**File:** `components/lib/constants/companyConfig.js`

```javascript
// Add your company
export const COMPANY_CONFIGS = {
  yourcompany: {
    id: 'yourcompany',
    name: 'YourCompany Engage',
    domain: 'yourcompany.com',
    brandColor: '#YOUR_HEX',
    // ... other settings
  }
};
```

### 4. Email Domain Validation

**File:** `components/lib/constants/index.js`

```javascript
// Update allowed domain
export const ALLOWED_EMAIL_DOMAIN = 'yourcompany.com';
```

**Also update in:**
- `functions/inviteUser.js` (line 35)
- `functions/lib/rbacMiddleware.js` (line 112)

---

## Initial Data Setup

### 1. Create First Admin User

**Option A: Manual via Base44 Dashboard**
1. Go to Dashboard → Users
2. Invite user with email matching OWNER_EMAILS
3. Set role: `admin`
4. User receives email, completes signup

**Option B: Via Entity Import**
```javascript
// Create user via Base44 dashboard → Entities → User → Add
{
  "email": "admin@intinc.com",
  "full_name": "Lisa Chen",
  "role": "admin",
  "user_type": null
}
```

### 2. Seed Activity Library

**Run once** (via Base44 dashboard or script)
```javascript
// Navigate to Activities page as admin
// Click "Import Templates" (future feature)
// Or manually create via Dashboard → Entities → Activity

// Sample activities already included in codebase
// See: components/templates/TemplateData.jsx
```

### 3. Initialize Gamification Config

```javascript
// Create via Dashboard → Entities → GamificationConfig
{
  "config_key": "default",
  "modules_enabled": {
    "badges": true,
    "challenges": true,
    "leaderboards": true,
    "points": true
  },
  "points_config": {
    "event_attendance": 10,
    "feedback_submitted": 5,
    "recognition_given": 3
  }
}
```

### 4. Create Achievement Tiers

```javascript
// Dashboard → Entities → AchievementTier
// Create tiers 1-10 (Bronze to Hall of Fame)
[
  { tier_name: "Newcomer", tier_level: 1, points_required: 0 },
  { tier_name: "Contributor", tier_level: 2, points_required: 100 },
  // ... up to level 10
]
```

---

## Microsoft Teams Integration

### Setup Incoming Webhook

1. Open Microsoft Teams
2. Navigate to target channel (e.g., #general)
3. Click "..." → Connectors → Incoming Webhook
4. Name: "INTeract Notifications"
5. Upload logo (optional)
6. Copy webhook URL
7. Paste in Base44 secrets: `TEAMS_WEBHOOK_URL`

### Test Webhook
```javascript
// Navigate to Settings → Microsoft Teams tab
// Click "Send Test Notification"
// Check Teams channel for message
```

---

## Domain & SSL Configuration

### Custom Domain Setup
1. Purchase domain (e.g., interact.intinc.com)
2. Add CNAME record:
   ```
   interact.intinc.com → your-app.base44.app
   ```
3. Configure in Base44 Dashboard → Settings → Domain
4. SSL auto-provisioned (Let's Encrypt)

### Subdomain Structure
```
interact.intinc.com        # Main app
api.interact.intinc.com    # API endpoints (Base44 handles)
docs.interact.intinc.com   # Documentation (optional)
```

---

## Database Migrations

### Schema Changes
**Base44 handles migrations automatically** when you update entity files.

**Breaking changes** (require data migration):
1. Backup data first (export CSV)
2. Update entity JSON schema
3. Deploy change
4. Run data migration script (if needed)

**Example: Adding required field**
```javascript
// Before deploy, set default value
{
  "new_field": {
    "type": "string",
    "default": "default_value"  // Prevents null errors
  }
}
```

---

## Performance Optimization

### 1. Image Optimization (Cloudinary)
```javascript
// Replace direct URLs with Cloudinary transforms
const optimizedUrl = `https://res.cloudinary.com/your-cloud/image/upload/w_400,q_auto,f_auto/${imageId}`;

// Benefits:
// - Auto WebP conversion
// - Responsive sizes
// - CDN delivery
// - 60% faster load times
```

### 2. Code Splitting
```javascript
// Already implemented for:
// - Analytics page (charts)
// - Gamification (advanced features)
// - Admin tools (user management)

// Add more as needed:
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### 3. Database Indexing
**Base44 auto-indexes:**
- Primary keys (id)
- Foreign keys (user_email, event_id)
- created_date (DESC)

**Manual indexes** (if query slow):
- Contact Base44 support for custom indexes

---

## Monitoring & Alerts

### Error Tracking
**Built-in via Base44:**
- Frontend errors logged automatically
- Backend errors in function logs
- View: Dashboard → Monitoring → Errors

**Custom error tracking:**
```javascript
// Add to ErrorBoundary
componentDidCatch(error, errorInfo) {
  // Log to external service (Sentry, DataDog)
  trackError(error, errorInfo);
}
```

### Performance Monitoring
```javascript
// React Query DevTools (development only)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Uptime Monitoring
**Recommended services:**
- UptimeRobot (free tier)
- Pingdom
- StatusCake

**Monitor endpoints:**
- `https://your-app.base44.app/` (homepage)
- `https://your-app.base44.app/api/health` (health check)

---

## Backup & Recovery

### Automated Backups
**Base44 handles:**
- Daily database backups (7-day retention)
- Point-in-time recovery (up to 7 days back)
- Automatic failover (99.9% uptime SLA)

### Manual Backup
```javascript
// Export all data via Settings → Export
// Format: JSON (full backup)
// Includes:
// - All users
// - All events
// - All points transactions
// - All audit logs
```

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective):** 1 hour
2. **RPO (Recovery Point Objective):** 24 hours (daily backups)
3. **Procedure:**
   - Contact Base44 support
   - Request rollback to specific timestamp
   - Verify data integrity
   - Notify users of any data loss

---

## Compliance & Governance

### GDPR Compliance
- User data export (Settings → Privacy)
- Right to deletion (contact admin)
- Cookie consent (Base44 handles)
- Data processing agreement (Base44)

### SOC 2 / ISO 27001
- Base44 infrastructure is certified
- Annual audits required
- Access logs reviewed quarterly

### Data Retention
- **User data:** Retained while account active
- **Audit logs:** 5-year retention (compliance)
- **Points ledger:** Permanent (immutable)
- **Event data:** 2-year retention (archivable)

---

## Scaling Considerations

### Current Capacity
- **Users:** Up to 10,000 per app
- **Events:** Unlimited
- **Storage:** 100GB included

### Scaling Triggers
- **500+ active users:** Upgrade to Pro plan
- **10,000+ events/month:** Contact Base44 for enterprise
- **Custom integrations:** Enterprise plan required

### Multi-Tenancy
```javascript
// Support multiple companies in one instance
const company = getCurrentCompany(user);

// Or deploy separate instances per company
// - interact-intinc.base44.app
// - interact-edgewater.base44.app
```

---

## Rollback Procedure

### Code Rollback
**Base44 maintains version history**
1. Go to Dashboard → Deployments
2. View deployment history
3. Click "Rollback to v1.2.3"
4. Confirm
5. App reverts in <60 seconds

### Data Rollback
**Database restore** (use with caution)
1. Contact Base44 support
2. Provide target timestamp
3. Estimated restore time: 15-30 minutes
4. All data after timestamp will be lost

---

## Post-Deployment Validation

### Smoke Tests (30 minutes)
```
✓ Homepage loads
✓ Login works (test with 3 different users)
✓ Create event (admin)
✓ RSVP to event (participant)
✓ Send Teams notification
✓ Upload image
✓ Export analytics
✓ Give recognition
✓ Check audit log
```

### User Acceptance Testing (UAT)
**Stakeholders:** HR lead, 2 facilitators, 5 participants

**Test scenarios:**
1. End-to-end event flow (create → attend → feedback)
2. Onboarding new user
3. Gamification (earn badge)
4. Mobile responsiveness (iPhone, Android)
5. Accessibility (screen reader, keyboard-only)

---

## Troubleshooting

### Common Issues

**"Rendered more hooks than previous render"**
```
Cause: Conditional hook calls
Fix: Ensure all hooks called before any returns
Check: Pages with useUserData + conditional rendering
```

**"Failed to fetch user data"**
```
Cause: Auth token expired or invalid
Fix: Clear localStorage, re-login
Prevent: Implement token refresh
```

**"Teams notifications not sending"**
```
Cause: Invalid webhook URL or Teams connector disabled
Fix: Verify TEAMS_WEBHOOK_URL in secrets
Test: Send test message from Settings
```

**"Points not updating after event"**
```
Cause: Missing participation record or function error
Fix: Check function logs for recordPointsTransaction errors
Verify: Participation.attended = true
```

### Debug Mode
```javascript
// Enable in development
localStorage.setItem('debug', 'true');

// Shows:
// - React Query cache
// - RBAC decisions
// - API call logs
```

---

## Support Contacts

**Base44 Platform:** support@base44.io  
**Technical Issues:** GitHub Issues  
**Feature Requests:** Product board  
**Security:** security@base44.io

---

## Release Notes Template

```markdown
## v2.1.0 - 2025-12-20

### New Features
- Bulk user import via CSV
- Audit log with advanced filters
- Multi-company branding support

### Improvements
- 40% faster page load times
- Mobile gesture support
- Enhanced accessibility

### Bug Fixes
- Fixed hooks rendering error in Settings
- Corrected RBAC permission checks
- Improved error messages

### Migration Guide
- No breaking changes
- Owner emails must be configured in roles.js
```

---

Deployment complete! Monitor for 24 hours and gather user feedback.