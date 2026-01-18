# Integrations System Documentation

## Overview
The Integrations System implements a robust, production-ready pattern for external integrations with comprehensive safety guarantees.

## Architecture

### Outbox Pattern
All external side effects flow through the `IntegrationOutbox` entity, ensuring:
- **Idempotency**: SHA256-based deduplication prevents duplicate operations
- **Retries**: Exponential backoff with configurable max attempts
- **Observability**: Full audit trail of all operations
- **Rate Limiting**: Per-integration rate limits with 429 handling

### Components

#### 1. Entities
- **IntegrationOutbox**: Queue for all outbound operations
  - `idempotency_key`: Unique SHA256 hash
  - `status`: queued | sent | failed | dead_letter
  - `attempt_count`: Retry tracking
  - `next_attempt_at`: Exponential backoff scheduling
  
- **ReconcileRun**: Nightly reconciliation audit logs
  - Tracks drift detection and fixes
  - API call counts and rate limits
  - Success/failure metrics

- **IntegrationConfig**: Per-integration settings
  - Enable/disable toggle
  - Rate limit configuration
  - Custom settings JSON

#### 2. Core Functions

**enqueueOutbox(integration_id, operation, stable_resource_id, payload_json)**
- Calculates idempotency key from inputs
- Creates or returns existing outbox entry
- Never creates duplicates

**dispatchOutbox(batchSize=50)**
- Drains queued outbox items
- Enforces per-integration rate limits
- Handles retries with exponential backoff
- Respects Retry-After headers
- Moves to dead_letter after max attempts

#### 3. Reconciliation Functions
One function per integration (e.g., `reconcileGoogleSheets`, `reconcileSlack`):
- Re-enqueues stuck items (queued > 6 hours)
- Compares local logs with provider status
- Emits ReconcileRun metrics
- Runs nightly via cron automation

### Integrations

#### OAuth Connectors (App-Level)
- Google Sheets, Drive, Docs, Slides, Calendar
- Slack (user token integration)
- Notion, LinkedIn, TikTok

**Authorization**: Use Base44 connector system via UI

#### Manual Integrations (Secrets-Based)
- Resend (email), Twilio (SMS)
- OpenAI TTS, ElevenLabs
- Fal AI, BrightData
- X (Twitter), HubSpot, Monday.com, Zapier
- Custom API (generic template)

**Configuration**: Set secrets in Base44 Secrets panel

### Rate Limits
Per-integration defaults (enforced in dispatchOutbox):
```javascript
{
  google_sheets: { rps: 10, concurrency: 5 },
  slack: { rps: 1, concurrency: 1 },
  resend: { rps: 2, concurrency: 4 },
  twilio: { rps: 1, concurrency: 4 },
  // ... see dispatchOutbox.js for full list
}
```

### Automations

#### Nightly Reconciliation
- Scheduled: 02:00 America/Chicago
- One cron job per integration
- Lock-based (TTL: 7200s)
- Hard timeout: 6900s
- Max items per run: 3000 (lower for Slack)

#### Event-Driven Enqueue (Examples)
- Lead created/updated → Google Sheets sync
- Lead status → "Qualified" → Slack notification
- User created → Resend welcome email
- Alert created → Twilio SMS

## Admin UI
Navigate to `/IntegrationsAdmin` to view:
- Real-time outbox statistics (queued/sent/failed/dead_letter)
- Last reconciliation run status per integration
- Secrets health checklist
- Manual dispatch and reconcile triggers

## Setup Checklist

### 1. OAuth Connectors
Authorize in Base44 UI (Dashboard → Integrations):
- Google Sheets: `https://www.googleapis.com/auth/spreadsheets`
- Google Drive: `https://www.googleapis.com/auth/drive.file`
- Google Docs: `https://www.googleapis.com/auth/documents`
- Google Slides: `https://www.googleapis.com/auth/presentations`
- Google Calendar: `https://www.googleapis.com/auth/calendar.events`
- Slack: `chat:write`, `channels:read`, `users:read`
- Notion: `read`, `write`, `pages:read`, `databases:read`
- LinkedIn: `r_liteprofile`, `w_member_social`
- TikTok: `user.info.basic`, `video.list`

### 2. Secrets (Set in Base44 Secrets)
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- `OPENAI_API_KEY` (already set)
- `ELEVENLABS_API_KEY` (already set)
- `FAL_API_KEY`
- `BRIGHTDATA_USERNAME`, `BRIGHTDATA_PASSWORD`
- `X_API_KEY`, `X_API_SECRET`
- `HUBSPOT_PRIVATE_APP_TOKEN` (or use existing HUBSPOT_PERSONAL_ACCESS_KEY)
- `MONDAY_API_TOKEN`
- `ZAPIER_WEBHOOK_URL`
- `CUSTOM_API_BASE_URL`, `CUSTOM_API_API_KEY_OR_TOKEN`

### 3. Create Automations
Run once (via Base44 dashboard or API):
- Nightly cron for each reconcile function
- Entity triggers for Lead, User, Alert

## Safety Guarantees

### 1. No Direct Provider Calls
- UI actions → enqueueOutbox only
- Automations → enqueueOutbox only
- Only dispatchOutbox calls providers

### 2. Idempotency
- SHA256 key prevents duplicates
- Safe to retry any operation

### 3. Observability
- Full audit trail in IntegrationOutbox
- ReconcileRun metrics for drift detection
- Dead letter queue for failed operations

### 4. Rate Limit Compliance
- Per-integration token buckets
- Exponential backoff on 429
- Retry-After header support

### 5. Drift Detection
- Nightly reconciliation re-enqueues stuck items
- Compares local logs with provider status
- Never makes direct provider writes during reconcile

## Smoke Tests

### Test 1: Enqueue Operations
```javascript
// Create test lead
const lead = await base44.entities.Lead.create({ ... });
// → Should create IntegrationOutbox entry for google_sheets

// Update lead status
await base44.entities.Lead.update(lead.id, { status: 'Qualified' });
// → Should create IntegrationOutbox entry for slack
```

### Test 2: Dispatch
```javascript
const result = await base44.functions.invoke('dispatchOutbox', {});
// → Should process queued items, mark as sent/failed
// → Should schedule retries with exponential backoff
```

### Test 3: Reconciliation
```javascript
const result = await base44.functions.invoke('reconcileGoogleSheets', {});
// → Should create ReconcileRun record
// → Should re-enqueue stuck items (> 6 hours old)
```

## Edge Cases Handled

### 1. Duplicate Prevention
- Idempotency key ensures no duplicates even if enqueueOutbox called multiple times

### 2. Stuck Items
- Reconciliation re-enqueues items stuck in queued > 6 hours
- Prevents silent failures

### 3. Provider Rate Limits
- Exponential backoff on 429
- Respects Retry-After headers
- Dead letter queue after max attempts

### 4. Provider Downtime
- Retries with backoff
- Failed items scheduled for future attempts
- Does not block other integrations

### 5. Large Payloads
- Payload stored as JSON string
- No size limits in database schema
- Consider compression for very large payloads

## Performance Optimizations

### 1. Caching
- IntegrationConfig cached per request
- Rate limit state in memory (per-integration)

### 2. Lazy Loading
- Outbox items fetched in batches (default 50)
- Reconciliation processes max 3000 items per run

### 3. Concurrency
- Per-integration concurrency limits
- Parallel processing within limits

## Monitoring & Alerts

### Key Metrics
- Outbox depth (queued items)
- Dead letter queue size
- Reconciliation success rate
- API call counts and 429 rates

### Recommended Alerts
- Dead letter queue > 100 items
- Reconciliation failures > 3 consecutive runs
- Outbox depth > 1000 items for > 1 hour
- 429 rate > 10% for any integration

## Future Enhancements

### Priority 1
- Webhook receivers for bidirectional sync
- Provider-specific reconciliation logic (not just stuck items)
- Dead letter queue retry UI

### Priority 2
- Grafana dashboard for metrics
- PagerDuty integration for alerts
- Custom integration builder UI

### Priority 3
- Per-user OAuth (not just app-level)
- Integration marketplace
- Cost tracking per integration

## References
- Outbox Pattern: https://microservices.io/patterns/data/transactional-outbox.html
- Idempotency: https://stripe.com/docs/api/idempotent_requests
- Rate Limiting: https://cloud.google.com/architecture/rate-limiting-strategies-techniques