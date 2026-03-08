# Operational Runbook

**Project:** Interact — Employee Engagement & Gamification Platform
**Last Updated:** March 8, 2026
**Version:** 1.0.0
**Audience:** DevOps, Tech Lead, On-Call Engineers
**Classification:** Internal

---

## Table of Contents

1. [Service Overview](#1-service-overview)
2. [Environment Map](#2-environment-map)
3. [Health Checks](#3-health-checks)
4. [Deployment Procedure](#4-deployment-procedure)
5. [Rollback Procedure](#5-rollback-procedure)
6. [Incident Response](#6-incident-response)
7. [Alert Runbook](#7-alert-runbook)
8. [Routine Maintenance](#8-routine-maintenance)
9. [Escalation Matrix](#9-escalation-matrix)

---

## 1. Service Overview

| Property | Value |
|---|---|
| Application | Interact Employee Engagement Platform |
| Type | React SPA (single-page application) |
| Build tool | Vite 6 |
| Hosting | Vercel (Production + Preview) |
| Backend | Base44 SDK (serverless functions) |
| Repository | `github.com/Krosebrook/interact` |
| Default branch | `main` |
| Node.js version | 20 |

### Dependencies

| Service | Purpose | On Failure Impact |
|---|---|---|
| Vercel | Frontend hosting + function runtime | Full outage |
| Base44 API | Authentication, database, storage | Full outage |
| OpenAI API | AI recommendations, content generation | AI features degrade; core app unaffected |
| Anthropic API | AI content generation | AI features degrade; core app unaffected |
| Cloudinary | Media storage and delivery | Media upload/display fails; core app unaffected |
| Google Calendar | Calendar integration | Integration features degrade |
| Slack | Notification integration | Notifications fail; core app unaffected |

---

## 2. Environment Map

| Environment | URL | Branch | Purpose |
|---|---|---|---|
| Production | `https://<your-domain>.vercel.app` | `main` | Live user traffic |
| Preview | Auto-generated per PR | PR branch | PR review and QA |
| Development | `http://localhost:5173` | Local | Developer machines |

> Replace `<your-domain>` with the actual Vercel project URL.

---

## 3. Health Checks

### 3.1 Frontend health check

```bash
# 1. Check the production URL responds with HTTP 200
curl -s -o /dev/null -w "%{http_code}" https://<your-domain>.vercel.app

# Expected: 200
```

### 3.2 Base44 backend check

```bash
# Check Base44 health endpoint (if available)
curl -s https://api.base44.com/health
```

### 3.3 Vercel deployment check

1. Go to [vercel.com](https://vercel.com) → your project → **Deployments**.
2. Verify the latest `main` deployment has status **Ready**.
3. Check the deployment log for any build errors.

### 3.4 CI pipeline check

1. Go to **GitHub → Actions** for the `interact` repository.
2. Verify the latest `ci.yml` run on `main` is **green**.
3. If failing, see [Alert Runbook — CI Failure](#71-ci-pipeline-failure).

---

## 4. Deployment Procedure

### 4.1 Automatic deployment (normal flow)

Vercel automatically deploys when commits are pushed to `main`. No manual action is needed.

```
Developer pushes to main
   ↓
GitHub Actions CI runs (lint + build + test)
   ↓
CI passes → Vercel webhook triggers build
   ↓
Vercel builds the app (npm run build)
   ↓
Vercel deploys to production
   ↓
Verify health check passes
```

### 4.2 Manual deployment

If you need to force a redeployment (e.g., to pick up a changed environment variable):

1. Go to [vercel.com](https://vercel.com) → your project → **Deployments**.
2. Find the latest successful deployment.
3. Click the **⋯** menu → **Redeploy**.
4. Confirm. Wait 2–5 minutes for completion.
5. Run the health check procedure.

### 4.3 Environment variable changes

After changing a Vercel environment variable:

1. The change does **not** take effect until the next deployment.
2. Trigger a manual redeploy (see 4.2) or push a new commit.

---

## 5. Rollback Procedure

### 5.1 Instant rollback (< 2 minutes)

Vercel keeps all previous successful deployments available for instant promotion.

1. Go to [vercel.com](https://vercel.com) → your project → **Deployments**.
2. Find the last known-good deployment (green status, prior to the current one).
3. Click **⋯** → **Promote to Production**.
4. Confirm. The previous version is live within ~30 seconds.
5. Run the health check procedure.
6. Open a GitHub issue to track the regression.

### 5.2 Code rollback (via git revert)

Use this when the rollback must persist and/or CI needs to re-run:

```bash
# Identify the commit to revert
git log --oneline -10

# Revert the breaking commit(s)
git revert <commit-sha>

# Or revert a merge commit
git revert -m 1 <merge-commit-sha>

# Push to main — CI runs; Vercel auto-deploys
git push origin main
```

### 5.3 Rollback decision criteria

| Severity | Action | Timeline |
|---|---|---|
| Site is down (5xx errors) | Immediate Vercel rollback | Within 5 minutes |
| Core feature broken (login, main dashboard) | Vercel rollback | Within 15 minutes |
| Minor feature broken | Hotfix branch | Within 2 hours |
| Visual/cosmetic regression | Normal fix PR | Next business day |

---

## 6. Incident Response

### 6.1 Severity levels

| Level | Description | Response Time |
|---|---|---|
| P0 — Critical | Site is down or unusable for all users | Immediate (< 15 min) |
| P1 — High | Core feature broken for most users | < 1 hour |
| P2 — Medium | Important feature broken for some users | < 4 hours |
| P3 — Low | Minor issue or cosmetic problem | < 48 hours |

### 6.2 Incident response steps

**P0/P1 Incident:**

1. **Acknowledge** — Assign an incident commander (Tech Lead or senior DevOps).
2. **Assess** — Identify the scope: is it total outage or feature degradation?
3. **Communicate** — Notify stakeholders via the agreed channel (Slack `#incidents` or email).
4. **Mitigate** — Roll back if available (see Section 5). Otherwise, apply a hotfix.
5. **Monitor** — Watch health checks and error rates for 30 minutes post-mitigation.
6. **Resolve** — Confirm the issue is resolved; update status page if applicable.
7. **Post-mortem** — Within 48 hours, document: timeline, root cause, resolution, and prevention steps. File in `docs/audits/`.

### 6.3 Communication template

```
[INCIDENT] <Brief description>

Severity: P0 / P1 / P2
Start Time: YYYY-MM-DD HH:MM UTC
Status: Investigating / Mitigating / Resolved

Impact: <What is affected and how many users>

Current Actions:
- <Action 1>
- <Action 2>

Next Update: <Time>

IC: <Name>
```

---

## 7. Alert Runbook

### 7.1 CI Pipeline Failure

**Symptom:** GitHub Actions `ci.yml` fails on `main`.

**Triage steps:**

1. Go to **GitHub → Actions → ci.yml** → click the failed run.
2. Expand each job to find the first failure.
3. Common causes:
   - **Lint error:** Run `npm run lint` locally and fix.
   - **Build error:** Run `npm run build` locally; check for missing env vars or broken imports.
   - **Test failure:** Run `npm run test:run` locally; fix the failing test.
   - **Type error:** Run `npm run typecheck` locally.
4. Push a fix. If it is a transient infrastructure issue, re-run the workflow.

### 7.2 Vercel Build Failure

**Symptom:** Vercel build fails; deployment does not go live.

**Triage steps:**

1. Go to [vercel.com](https://vercel.com) → Deployments → click the failed deployment → view build log.
2. Common causes:
   - **Missing environment variable:** Check that all `VITE_*` vars are configured in Vercel dashboard.
   - **Build command error:** Run `npm run build` locally with the same Node.js version (20).
   - **Out-of-memory:** Check bundle size; consider adding `--max-old-space-size=4096` to build command.
3. Fix and redeploy.

### 7.3 Application Error Spike

**Symptom:** Increased 5xx errors or JavaScript errors in monitoring.

**Triage steps:**

1. Check Vercel Functions logs for server-side errors.
2. Check browser console errors (via Sentry if configured, or by reproducing manually).
3. Identify the release that introduced the error (compare deployment timestamps with error start time).
4. Roll back if the error is widespread (see Section 5).

### 7.4 Slow Page Load

**Symptom:** Time-to-interactive > 5 seconds in production.

**Triage steps:**

1. Run Lighthouse on the production URL: `npx lighthouse <url> --view`
2. Check bundle size: `npm run build` produces a size report.
3. Common causes:
   - Large third-party library loaded synchronously → add code splitting.
   - Images not optimized → use WebP, add `loading="lazy"`.
   - Too many API calls on initial load → prefetch or cache with TanStack Query.

---

## 8. Routine Maintenance

### 8.1 Weekly

- [ ] Check GitHub Actions for any recurring CI failures.
- [ ] Review Vercel deployment history for anomalies.
- [ ] Run `npm audit` to check for new vulnerabilities.

### 8.2 Monthly

- [ ] Update dependencies: `npm outdated` → review and update non-breaking upgrades.
- [ ] Review documentation for staleness (check "Last Updated" dates).
- [ ] Review open GitHub issues for P2/P3 items that should be addressed.
- [ ] Verify all environment variables in Vercel are still accurate and no unused vars remain.

### 8.3 Quarterly

- [ ] Full security audit: `npm audit`, OWASP checklist review, secret scanning.
- [ ] Full documentation audit (see `docs/planning/DOCUMENTATION_STRATEGY.md`).
- [ ] Review and update this runbook.
- [ ] Test the rollback procedure in a preview environment.
- [ ] Review access control: remove access for team members who have left.

---

## 9. Escalation Matrix

| Situation | First Contact | Escalate To |
|---|---|---|
| Site outage (P0) | On-call DevOps | Tech Lead → Product Owner → CTO |
| Security incident | Tech Lead | Security Officer → CTO |
| Data breach / privacy issue | Tech Lead | Legal/Compliance → CTO |
| CI persistently broken | Developer who broke it | Tech Lead |
| Vendor outage (Vercel, Base44) | DevOps | Tech Lead; open vendor support ticket |

### Vendor Support Contacts

| Vendor | Support URL |
|---|---|
| Vercel | https://vercel.com/support |
| Base44 | Contact via Base44 dashboard |
| OpenAI | https://help.openai.com |
| Cloudinary | https://support.cloudinary.com |
