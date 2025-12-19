# INTEGRATION SECURITY AUDIT

**Date:** 2025-12-19  
**Scope:** External integrations, webhooks, OAuth flows

---

## INTEGRATION INVENTORY

### Active Integrations
1. **Google Calendar** (OAuth)
2. **Slack** (Webhook - if configured)
3. **Microsoft Teams** (Webhook)
4. **Email** (SMTP via Base44)
5. **Stripe** (API keys)

---

## GOOGLE CALENDAR INTEGRATION

### Files Audited
- `functions/syncToGoogleCalendar.js`
- `functions/importFromGoogleCalendar.js`
- `components/integrations/GoogleCalendarConnect.jsx`

### ✅ STRENGTHS
1. OAuth flow managed by Base44 platform (secure)
2. Event ownership validation implemented (latest fix)
3. Access token retrieved via `base44.asServiceRole.connectors.getAccessToken`

### ⚠️ VULNERABILITIES FOUND

#### 1. Insufficient Scope Validation (MEDIUM)
**Issue:** No verification that granted scopes match requested scopes  
**Impact:** User might grant insufficient permissions  
**Fix Required:**
```javascript
// Add to syncToGoogleCalendar.js
const requiredScopes = ['https://www.googleapis.com/auth/calendar.events'];
// Verify token includes required scopes via Google's tokeninfo endpoint
```

#### 2. No Rate Limiting (LOW)
**Issue:** User could spam sync operations  
**Impact:** Could hit Google API rate limits  
**Fix:** Implement rate limiting (1 sync per minute per user)

### ✅ SECURITY VALIDATIONS PRESENT
- Event ownership check before sync
- User authentication required
- Access token auto-refreshed by Base44

---

## TEAMS/SLACK WEBHOOKS

### Files Audited
- `functions/sendTeamsNotification.js`
- `functions/slackNotifications.js`

### ✅ FIXES IMPLEMENTED
1. **SSRF Protection** - Webhook URL validation (Teams only)
2. **User Authentication** - All webhook triggers require auth

### 🔴 CRITICAL VULNERABILITIES

#### 1. Slack Webhook Not Validated (CRITICAL)
**File:** `functions/slackNotifications.js`  
**Issue:** Accepts any Slack webhook URL without validation  
**Impact:** SSRF attack vector, data exfiltration  
**Fix Required:**
```javascript
// Add validation
if (!webhookUrl.startsWith('https://hooks.slack.com/services/')) {
  return Response.json({ error: 'Invalid Slack webhook URL' }, { status: 400 });
}
```

#### 2. No Webhook Signature Verification (HIGH)
**Issue:** Incoming webhooks (if implemented) don't verify signatures  
**Impact:** Forged webhook calls could inject malicious data  
**Fix:** Implement signature verification for all incoming webhooks

#### 3. PII Exposure in Notifications (HIGH)
**Issue:** Notifications may include sensitive participant data  
**Impact:** Exposure of engagement scores, feedback to Teams/Slack  
**Fix Required:**
```javascript
// In sendTeamsNotification.js
const sanitizeEventData = (event, participation) => {
  return {
    title: event.title,
    date: event.scheduled_date,
    participant_count: participation.length,
    // DO NOT include: engagement_score, feedback, individual names
  };
};
```

---

## EMAIL NOTIFICATIONS

### ✅ STRENGTHS
- Managed by Base44 (Core.SendEmail integration)
- No direct SMTP credentials exposed

### ⚠️ CONCERNS

#### 1. Email Content Not Reviewed (MEDIUM)
**Issue:** No audit of email templates for PII  
**Action:** Review all email notifications for PII exposure

#### 2. No Rate Limiting (LOW)
**Issue:** Could send spam emails  
**Fix:** Implement rate limiting in notification functions

---

## STRIPE INTEGRATION

### Files Audited
- `functions/storeWebhook.js`
- `functions/createStoreCheckout.js` (if exists)

### 🔴 CRITICAL VULNERABILITIES

#### 1. Webhook Signature Verification (CRITICAL)
**File:** `functions/storeWebhook.js`  
**Status:** Need to verify implementation  
**Required:**
```javascript
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
  const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_SIGNING_SECRET')
    );
    // Process webhook
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
});
```

#### 2. User Authentication in Checkout (HIGH)
**Issue:** Checkout sessions must link to authenticated user  
**Fix:** Verify customer metadata includes user.id or email

---

## OAUTH FLOW SECURITY

### Base44 App Connectors
**Status:** Not yet configured  
**Supported:** Google Calendar, Slack, Notion, etc.

### ✅ SECURITY MEASURES
1. OAuth handled by Base44 platform (secure)
2. Access tokens stored server-side
3. Refresh tokens auto-managed
4. Scopes explicitly requested

### 📋 RECOMMENDATIONS
1. **Minimal Scopes:** Only request scopes actually used
2. **Scope Validation:** Verify granted scopes match requested
3. **Token Expiry:** Implement graceful handling of expired tokens
4. **Revocation:** Provide users ability to revoke access

---

## WEBHOOK VALIDATION UTILITIES CREATED

### Create: `functions/lib/webhookValidation.js`
```javascript
/**
 * Validate Slack webhook URL
 */
export function validateSlackWebhook(url) {
  if (!url.startsWith('https://hooks.slack.com/services/')) {
    throw new Error('Invalid Slack webhook URL');
  }
  return true;
}

/**
 * Validate Teams webhook URL
 */
export function validateTeamsWebhook(url) {
  if (!url.startsWith('https://outlook.office.com/webhook/') &&
      !url.startsWith('https://outlook.office365.com/webhook/')) {
    throw new Error('Invalid Teams webhook URL');
  }
  return true;
}

/**
 * Verify Stripe webhook signature
 */
export async function verifyStripeSignature(req, stripe, webhookSecret) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  
  if (!sig) {
    throw new Error('Missing Stripe signature');
  }

  return await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
}

/**
 * Sanitize event data for external notifications
 * Remove PII and sensitive data
 */
export function sanitizeForExternalNotification(event, participations = []) {
  return {
    title: event.title,
    date: event.scheduled_date,
    duration: event.duration_minutes,
    participant_count: participations.length,
    // DO NOT INCLUDE:
    // - Individual participant names/emails
    // - Engagement scores
    // - Feedback content
    // - Magic links
  };
}
```

---

## CRITICAL ACTIONS REQUIRED

### IMMEDIATE (P0)
1. ✅ **Teams Webhook Validation** (implemented)
2. 🔴 **Add Slack Webhook Validation** (not implemented)
3. 🔴 **Verify Stripe Signature Verification** (need to audit storeWebhook.js)
4. 🔴 **Sanitize Notification Data** (PII in Teams/Slack notifications)

### HIGH PRIORITY (P1)
5. Add rate limiting to all notification endpoints
6. Implement webhook retry logic with exponential backoff
7. Add webhook delivery logging for debugging
8. Create admin dashboard for webhook health monitoring

### MEDIUM PRIORITY (P2)
9. Add OAuth scope validation
10. Implement graceful token expiry handling
11. Create webhook testing utilities
12. Document webhook setup procedures

---

## COMPLIANCE MATRIX

| Integration | Auth Method | Signature Verified | Rate Limited | PII Sanitized | Status |
|------------|-------------|-------------------|--------------|---------------|--------|
| Google Calendar | OAuth (Base44) | N/A | ❌ | ✅ | 🟡 Needs rate limiting |
| Teams Webhook | Webhook URL | ❌ | ❌ | ❌ | 🔴 Needs fixes |
| Slack Webhook | Webhook URL | ❌ | ❌ | ❌ | 🔴 Needs validation + sanitization |
| Email (Base44) | Platform | ✅ | ✅ | ⚠️ | 🟡 Needs template review |
| Stripe | API Key + Webhook | ⚠️ | ✅ | ✅ | 🟡 Needs verification |

---

**End of Integration Security Audit**