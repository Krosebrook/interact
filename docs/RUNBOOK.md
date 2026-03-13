# Runbook — Interact Platform

**Audience:** Engineers, DevOps, On-call responders  
**Last Updated:** March 2026  
**Environment:** Vercel (frontend) + Base44 (backend)

---

## Table of Contents

1. [Service Overview](#1-service-overview)
2. [Deployment Procedures](#2-deployment-procedures)
3. [Rollback Procedures](#3-rollback-procedures)
4. [Environment Variables](#4-environment-variables)
5. [Incident Response](#5-incident-response)
6. [Common Issues & Fixes](#6-common-issues--fixes)
7. [Monitoring & Health Checks](#7-monitoring--health-checks)
8. [Maintenance Procedures](#8-maintenance-procedures)

---

## 1. Service Overview

| Component | Technology | Hosting | URL Pattern |
|---|---|---|---|
| Frontend SPA | React 18 + Vite 6 | Vercel | `https://*.vercel.app` |
| Backend API + DB | Base44 SDK 0.8.3 | Base44 Cloud | `VITE_BASE44_BACKEND_URL` |
| Media Storage | Cloudinary | Cloudinary CDN | `res.cloudinary.com` |
| Build & Deploy | GitHub → Vercel | GitHub Actions + Vercel | — |

### Critical Dependencies

| Service | Impact If Down | Fallback |
|---|---|---|
| Base44 Backend | App non-functional (no data) | None; show error state |
| Vercel CDN | App inaccessible | None; DNS-level |
| OpenAI API | AI features unavailable | Degrade gracefully (hide AI panels) |
| Cloudinary | Avatars/images broken | Fallback to initials avatar |
| Slack/Teams | Notifications not sent | Log and retry |

---

## 2. Deployment Procedures

### 2.1 Standard Deployment (Automatic)

All merges to `main` automatically trigger a Vercel deployment.

```
Developer → git push → GitHub → Vercel (auto-deploy)
```

**Deployment time:** ~2–4 minutes

### 2.2 Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy preview (staging)
vercel
```

### 2.3 Pre-Deployment Checklist

Before deploying to production:

- [ ] `npm run lint` passes with no new errors
- [ ] `npm test` passes (114+ tests, 0 failures)
- [ ] `npm run build` completes without errors
- [ ] Environment variables verified in Vercel dashboard
- [ ] Database migrations applied (if any schema changes)
- [ ] Feature flags configured for new features

```bash
# Full pre-deploy validation
npm ci && npm run lint && npm test && npm run build
```

### 2.4 Vercel Environment Configuration

Access via: Vercel Dashboard → Project → Settings → Environment Variables

| Variable | Environment | Description |
|---|---|---|
| `VITE_BASE44_APP_ID` | Production, Preview | Base44 app identifier |
| `VITE_BASE44_BACKEND_URL` | Production, Preview | Base44 API endpoint |

---

## 3. Rollback Procedures

### 3.1 Instant Rollback via Vercel

Vercel keeps all previous deployments available for instant promotion.

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last known-good deployment
3. Click **"Promote to Production"**

**Rollback time:** ~30 seconds

### 3.2 Git Rollback

```bash
# Find the last good commit
git log --oneline

# Revert the bad commit
git revert <bad-commit-sha>
git push origin main

# Or hard reset (use with caution)
git reset --hard <good-commit-sha>
git push --force-with-lease origin main
```

### 3.3 When to Roll Back

- Error rate > 5% on key pages (Dashboard, Events, Gamification)
- Authentication broken (users unable to log in)
- Data loss or corruption detected
- Security vulnerability actively exploited

---

## 4. Environment Variables

### 4.1 Frontend Variables (VITE_ prefix)

These are bundled into the JS build and are **public** — treat as non-secret.

| Variable | Description | Example |
|---|---|---|
| `VITE_BASE44_APP_ID` | Base44 application ID | `app_abc123` |
| `VITE_BASE44_BACKEND_URL` | Base44 API base URL | `https://api.base44.com` |

### 4.2 Backend Function Secrets

These are only accessible within Base44 serverless functions. Never expose to frontend.

| Variable | Used By | Description |
|---|---|---|
| `OPENAI_API_KEY` | AI functions | OpenAI GPT-4 access |
| `ANTHROPIC_API_KEY` | AI functions | Claude access |
| `GOOGLE_API_KEY` | Google integrations | Gemini + Calendar + Drive |
| `SLACK_BOT_TOKEN` | Slack functions | Slack workspace bot |
| `SLACK_SIGNING_SECRET` | Slack webhook | Webhook verification |
| `STRIPE_SECRET_KEY` | Store/payments | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Store webhook | Webhook verification |
| `TWILIO_ACCOUNT_SID` | SMS functions | Twilio account |
| `TWILIO_AUTH_TOKEN` | SMS functions | Twilio auth |
| `CLOUDINARY_API_KEY` | Media upload | Cloudinary access |
| `CLOUDINARY_API_SECRET` | Media upload | Cloudinary secret |
| `HUBSPOT_API_KEY` | HubSpot integration | CRM access |
| `NOTION_API_KEY` | Notion integration | Workspace access |

### 4.3 Rotating a Secret

1. Generate new secret in the external service dashboard
2. Update in Base44 function environment settings
3. Test the affected integration
4. Revoke the old secret in the external service

---

## 5. Incident Response

### 5.1 Severity Classification

| Severity | Definition | Response Time |
|---|---|---|
| **P0 — Critical** | App down, data loss, security breach | Immediate (< 15 min) |
| **P1 — High** | Major feature broken (auth, events, gamification) | < 1 hour |
| **P2 — Medium** | Non-critical feature broken, degraded performance | < 4 hours |
| **P3 — Low** | Minor UI issues, individual component errors | Next business day |

### 5.2 Incident Response Process

```
1. DETECT   → Monitor alerts, user reports, error tracking
     ↓
2. TRIAGE   → Assess severity (P0–P3), assign owner
     ↓
3. CONTAIN  → Roll back if P0/P1 to restore service
     ↓
4. DIAGNOSE → Investigate root cause via logs
     ↓
5. FIX      → Deploy patch or permanent fix
     ↓
6. VERIFY   → Confirm resolution via testing
     ↓
7. DOCUMENT → Write incident report, update runbook
```

### 5.3 P0 Response Checklist

```
□ Notify on-call lead (< 5 min)
□ Assess scope (which users, which regions, which features)
□ Roll back via Vercel if deployment-related (< 15 min)
□ Communicate status to stakeholders
□ Monitor error rates post-rollback
□ Root-cause investigation
□ Post-mortem within 48 hours
```

### 5.4 Security Incident

For security incidents (data breach, XSS exploitation, unauthorized access):

1. **Isolate:** Disable affected feature or suspend affected accounts
2. **Investigate:** Review `AuditLog` entity for suspicious activity
3. **Notify:** Follow `docs/security/INCIDENT_RESPONSE.md`
4. **Disclose:** See `docs/security/VULNERABILITY_DISCLOSURE.md`

---

## 6. Common Issues & Fixes

### 6.1 Authentication Broken (Users Can't Log In)

**Symptoms:** Users redirected to login loop, or `auth_required` error in console.

**Diagnosis:**
```bash
# Check Base44 backend status
curl -I https://${VITE_BASE44_BACKEND_URL}/health

# Check browser console for token errors
# Look for: "Failed to check app state"
```

**Fix:**
1. Verify `VITE_BASE44_APP_ID` and `VITE_BASE44_BACKEND_URL` are set correctly in Vercel
2. Check Base44 status page for backend incidents
3. Clear browser localStorage and retry

---

### 6.2 Build Fails in CI

**Symptoms:** Vercel deployment fails, `npm run build` exits non-zero.

**Common causes:**

```bash
# TypeScript errors
npm run typecheck

# Lint errors blocking build
npm run lint

# Missing environment variable
# Check vite.config.js for required VITE_ vars
```

**Fix:** Address the reported TypeScript or build error, then redeploy.

---

### 6.3 Tests Failing in CI

**Symptoms:** `npm test` fails; specific test names in output.

```bash
# Run tests locally with verbose output
npm run test:run -- --reporter=verbose

# Run a single failing test file
npx vitest run src/lib/utils.test.js
```

**Fix:** Address the failing test case. Do not skip tests to unblock CI.

---

### 6.4 High ESLint Error Count

**Symptoms:** `npm run lint` reports 800+ errors, masking real issues.

```bash
# Auto-fix unused imports (fixes most of the 513 errors)
npm run lint:fix

# Then review remaining errors manually
npm run lint
```

---

### 6.5 AI Feature Returns No Results

**Symptoms:** AI recommendations, coaching, or insights panels show empty state or error.

**Diagnosis:**
```bash
# Check if the AI function is returning errors
# Look in Base44 function logs for the specific function name
# e.g., generatePersonalizedRecommendations
```

**Common causes:**
- OpenAI/Anthropic API key expired or rate limited
- User has insufficient data for AI to generate recommendations
- Network timeout on long-running AI calls

**Fix:**
1. Verify API key validity in the AI service dashboard
2. Check rate limit quota
3. Ensure the user has sufficient activity history (≥ 3 events participated)

---

### 6.6 Point Store Purchase Fails

**Symptoms:** Users unable to purchase rewards; error in `purchaseWithPoints` function.

**Diagnosis:**
1. Check user's `UserPoints.total_points` >= `StoreItem.points_cost`
2. Check `StoreItem.is_available === true`
3. Check Stripe webhook logs if payment involved

---

## 7. Monitoring & Health Checks

### 7.1 Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|---|---|---|
| Page load time (LCP) | < 2.5s | > 4s |
| API response time (p95) | < 500ms | > 2s |
| Build success rate | 100% | Any failure |
| Test pass rate | 100% | Any failure |
| npm audit vulnerabilities | 0 high | Any high/critical |

### 7.2 Vercel Analytics

Vercel provides built-in:
- Web Vitals (LCP, FID, CLS)
- Deployment success/failure history
- Edge network latency

Access: Vercel Dashboard → Project → Analytics

### 7.3 Error Tracking

The app uses `ErrorBoundary` (React) to catch and display errors. For production monitoring, integrate an error tracking service (Sentry recommended):

```js
// Future: Add to src/main.jsx
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
```

---

## 8. Maintenance Procedures

### 8.1 Weekly

- [ ] Review `npm audit` output for new vulnerabilities
- [ ] Check Vercel deployment health
- [ ] Review failed background function runs (Base44 dashboard)

### 8.2 Monthly

- [ ] `npm outdated` — review available dependency updates
- [ ] Review and clean up unused feature flags
- [ ] Rotate any secrets approaching 90-day age
- [ ] Review AuditLog entity for anomalous activity

### 8.3 Quarterly

- [ ] Full dependency audit (`npm audit --audit-level=moderate`)
- [ ] Review RBAC roles and user assignments
- [ ] Performance audit via Lighthouse
- [ ] Review and update this runbook

### 8.4 Deleting Stale Data

```js
// Via Base44 admin dashboard or function:
// Delete AnalyticsEvents older than 1 year
// Archive completed Events older than 6 months
// Remove orphaned Participation records
```

### 8.5 Backup Procedures

Data is managed by Base44's infrastructure. Backups are Base44's responsibility per their SLA. For custom backup requirements:

1. Export entities via Base44 admin dashboard
2. Store exports in a separate secure location (e.g., Google Drive, S3)
3. Test restore procedure quarterly
