# Production Security & Event Ownership Verification

**Date:** January 14, 2026  
**Purpose:** Pre-launch validation of critical security controls

---

## Event Ownership Verification

### Current Implementation (syncToGoogleCalendar)

**Location:** `functions/syncToGoogleCalendar.js` (lines 8-30)

**Current Code:**
```javascript
const base44 = createClientFromRequest(req);
const user = await base44.auth.me();

// Verify user authorization to perform actions on specific events
const events = await base44.entities.Event.filter({ id: eventId });
```

**Issue:** No explicit ownership check - relies on Entity permissions.

### Required Verification (Pre-Launch)

#### Test Case 1: Unauthorized Sync Attempt
```javascript
// User A tries to sync Event created by User B
const userA = { email: 'user.a@company.com', role: 'user' };
const eventByUserB = {
  id: 'event-123',
  facilitator_email: 'user.b@company.com'
};

// Expected: 403 Forbidden
// Actual: ?
```

**Status:** 🔴 REQUIRES TESTING - No tests on record

**Fix Required:**
```javascript
// In syncToGoogleCalendar.js
if (user.role !== 'admin' && user.email !== event.facilitator_email) {
  return Response.json(
    { error: 'Unauthorized: You do not own this event' },
    { status: 403 }
  );
}
```

#### Test Case 2: Admin Override
```javascript
// Admin syncs Event created by User B
const admin = { email: 'admin@company.com', role: 'admin' };
const eventByUserB = {
  id: 'event-123',
  facilitator_email: 'user.b@company.com'
};

// Expected: 200 OK (admin privilege)
// Actual: ?
```

**Status:** 🔴 REQUIRES TESTING

#### Test Case 3: Participant Attempts to Sync
```javascript
// User participates but doesn't own event
const participant = { email: 'user.p@company.com', role: 'user' };
const eventByUserB = {
  id: 'event-123',
  facilitator_email: 'user.b@company.com'
};

// Expected: 403 Forbidden
// Actual: ?
```

**Status:** 🔴 REQUIRES TESTING

---

## Pre-Launch Validation Checklist

### 🔴 CRITICAL (Block launch if failing)

- [ ] **Event Ownership Enforcement**
  - Run Test Case 1: Non-owner sync attempt
  - Expected: 403 Forbidden
  - Command: `curl -X POST http://localhost:3000/functions/syncToGoogleCalendar -H "Authorization: Bearer user.a.token" -d '{"eventId":"event-by-b"}'`

- [ ] **Admin Override Functionality**
  - Run Test Case 2: Admin sync of other's event
  - Expected: 200 OK
  - Verify: Google Calendar updated

- [ ] **Participation Cascade on Cancellation**
  - Create event, add 3 participants, cancel event
  - Verify: All 3 participate records marked as 'cancelled'
  - Verify: 3 notifications created

- [ ] **Stripe Webhook Idempotency**
  - Send webhook with transaction_id='TX123'
  - Send identical webhook again
  - Expected: Second returns `{ warning: 'duplicate' }`
  - Check DB: Transaction status unchanged

- [ ] **APP_URL Enforcement**
  - Unset APP_URL environment variable
  - Call any endpoint using getAppUrl()
  - Expected: Throws error "APP_URL environment variable not set"

### 🟠 HIGH (Address before public users)

- [ ] **WCAG Accessibility**
  - Run WebAIM Contrast Checker on all pages
  - Verify: All text 4.5:1+ contrast
  - Test: Keyboard navigation on all pages
  - Test: Screen reader on 3 main pages

- [ ] **Slack SSRF Protection**
  - Send webhook URL: http://localhost:8000/webhook
  - Expected: Blocked with "SSRF: Webhook domain not whitelisted"
  - Send webhook URL: http://192.168.1.1/webhook
  - Expected: Blocked with "SSRF: Internal IP addresses not allowed"

- [ ] **Google Calendar Sync Limits**
  - Sync 500+ events at once
  - Monitor: API rate limits, DB performance
  - Expected: No timeouts, graceful backoff

- [ ] **Recognition Moderation**
  - Create new recognition post
  - Verify: Status = 'pending' (not 'approved')
  - Verify: Not visible to public until admin approves

---

## Production Environment Setup

### Environment Variables (REQUIRED)

```bash
# CRITICAL - Block startup without these
APP_URL=https://interact.intinc.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_SIGNING_SECRET=whsec_live_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Important
GOOGLE_CALENDAR_API_KEY=...
SESSION_TIMEOUT=28800  # 8 hours in seconds

# Optional but recommended
ENVIRONMENT=production
LOG_LEVEL=info
SENTRY_DSN=https://...
```

### Database Initialization

```sql
-- Verify unique constraints exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_participation_event_user 
ON Participation(event_id, user_email);

-- Verify Entity permissions are enforced
-- (Platform-level, nothing to script)
```

### Secrets Validation

```javascript
// Before launch, verify all secrets are set
const requiredSecrets = [
  'APP_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_SIGNING_SECRET'
];

requiredSecrets.forEach(secret => {
  if (!Deno.env.get(secret)) {
    throw new Error(`CRITICAL: ${secret} not set in production`);
  }
});
```

---

## Security Test Suite

### Quick Validation Script

```bash
#!/bin/bash
# Test critical security controls before launch

# 1. Test APP_URL enforcement
echo "Testing APP_URL enforcement..."
curl -X GET https://app.base44.com/functions/validateAppUrl \
  -H "Authorization: Bearer $TEST_TOKEN" \
  | grep -q "APP_URL" && echo "✓ APP_URL check working"

# 2. Test Stripe webhook idempotency
echo "Testing Stripe webhook idempotency..."
WEBHOOK_PAYLOAD='{"id":"ch_123","type":"checkout.session.completed"}'
curl -X POST https://app.base44.com/functions/storeWebhook \
  -H "stripe-signature: t=1234567890,v1=..." \
  -d "$WEBHOOK_PAYLOAD" > response1.json

curl -X POST https://app.base44.com/functions/storeWebhook \
  -H "stripe-signature: t=1234567890,v1=..." \
  -d "$WEBHOOK_PAYLOAD" > response2.json

grep -q "duplicate" response2.json && echo "✓ Idempotency working"

# 3. Test SSRF protection
echo "Testing Slack SSRF protection..."
curl -X POST https://app.base44.com/functions/slackNotifications \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{"webhookUrl":"http://localhost:8000/webhook"}' \
  | grep -q "SSRF" && echo "✓ SSRF protection working"

# 4. Test event cancellation cascade
echo "Testing event cancellation cascade..."
# Create event, add participant, cancel
# Verify participation marked as cancelled
# (Manual test - complex to script)

echo ""
echo "Security validation complete!"
```

---

## Production Rollout Plan

### Phase 1: Pre-Launch (This Week)
- [ ] Run all security tests above
- [ ] Document any failures and fixes
- [ ] Get sign-off from security team

### Phase 2: Soft Launch (Next Week)
- [ ] Deploy to staging with production secrets
- [ ] Run 24-hour monitoring
- [ ] Test with 10 real users
- [ ] Collect feedback

### Phase 3: Full Launch
- [ ] Enable monitoring/alerting
- [ ] Set up incident response
- [ ] Deploy to production
- [ ] Monitor 24/7 for first week

---

## Known Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Race condition in event sync | HIGH | Idempotency check on webhook |
| SSRF via webhook URL | CRITICAL | Whitelist validation + IP blocking |
| Unauthorized event modifications | CRITICAL | Ownership + role checks |
| Cancelled event showing in calendar | HIGH | Cascade update of participations |
| PII exposure in Teams | CRITICAL | Aggregate counts only (anonymized) |
| Stripe replay attack | HIGH | Transaction state tracking |
| Recognition bypass | CRITICAL | Default status: pending (not approved) |
| Duplicate RSVPs | MEDIUM | Unique constraint on (event_id, user_email) |

---

## Post-Launch Monitoring

### Alerting (First 2 Weeks)

```
CRITICAL:
- Event sync failures (10+ per hour)
- 403 Forbidden responses (pattern change)
- Webhook processing errors

WARNING:
- Slow queries (>1s)
- High memory usage (>80%)
- API rate limit warnings
```

### Metrics to Track

```
- Event creation success rate (target: >99%)
- Google Calendar sync success rate (target: >95%)
- Average event cancellation time (target: <100ms)
- Webhook processing latency (target: <500ms)
```

---

**Prepared by:** Base44 Security Team  
**Last Updated:** January 14, 2026  
**Status:** ⏳ Awaiting pre-launch testing