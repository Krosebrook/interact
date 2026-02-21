# Vercel Production-Readiness Audit — Krosebrook Repositories

**Date:** February 2026  
**Scope:** Public repositories under the `Krosebrook` GitHub organization assessed for Vercel deployment readiness.

---

## Summary Table

| Repository | Framework | Vercel-Ready | Blockers |
|---|---|---|---|
| **interact** | Vite + React 18 | ✅ **Yes** (after fixes in this PR) | ~~SPA fallback rewrite missing~~, ~~wrong env vars in vercel.json~~ |
| continuum | Next.js 16 | ✅ **Yes** | Needs env vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `UPSTASH_*`, `RESEND_API_KEY`); `.env.example` recommended |
| flashfusion-ide | Vite + React 19 | ⚠️ **Partial** | No `start` script (not needed for SPA); no SPA fallback rewrite / `vercel.json`; missing `package-lock.json` (no lockfile visible) |
| fusion-ai | Vite + React 18 (Base44) | ⚠️ **Partial** | No `vercel.json`, no `.env.example`, no SPA fallback rewrite |
| enterprise-ai-app-generator | Vite + React 18 (Base44) | ⚠️ **Partial** | No `vercel.json`, no `.env.example`, no SPA fallback rewrite; Stripe env vars undocumented |
| archdesigner | Vite + React 18 (Base44) | ⚠️ **Partial** | No `vercel.json`, no SPA fallback rewrite |
| Enterpriseprofilebuilder | Vite + React 18 | ⚠️ **Partial** | Wildcard `"*"` version pins are unstable; no lockfile visible; Supabase/Anthropic env vars undocumented; no `vercel.json` |
| Flashfusionwebsitev20 | Vite + React 18 | ⚠️ **Partial** | Wildcard version pins; private `@flashfusion/*` scoped packages (install will fail without registry config); no `vercel.json` |
| source-of-truth-monorepo | Turborepo (pnpm) | ⚠️ **Partial** | Monorepo — needs `vercel.json` with `rootDirectory` per app; requires `pnpm-lock.yaml`; Node ≥ 22 (set `engines` or `.nvmrc`) |
| turborepo-flashfusion | PowerShell / mixed | ❌ **No** | No web app entry-point at repo root; PowerShell scripts only |
| RoseyRecords | Jupyter Notebook | ❌ **No** | Python/Jupyter — not a web app; not deployable on Vercel |
| flashfusion-discord | Unknown / bot | ❌ **No** | Discord bot — not a web app |

> Repositories not listed (e.g., `top-20-dashboards`, `continuum`-variants, `DevChat`, `CulinaryQ`, etc.) follow the same Vite + React or Next.js patterns as above. The same rules apply.

---

## Detailed Findings

### ✅ `Krosebrook/interact` — **Production-Ready** (fixes applied in this PR)

| Property | Value |
|---|---|
| Framework | Vite 6 + React 18 (SPA) |
| Package manager | npm (`package-lock.json` present) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 (pinned via `.nvmrc` and CI) |

**Required environment variables:**

| Variable | Required | Description |
|---|---|---|
| `VITE_BASE44_APP_ID` | ✅ Required | Base44 application identifier |
| `VITE_BASE44_BACKEND_URL` | ✅ Required | Base44 backend service URL |
| `VITE_BASE44_API_URL` | Optional | Base44 API URL (falls back to backend URL) |
| `VITE_COMPANY_ID` | Optional | Company identifier |
| `VITE_ENABLE_ANALYTICS` | Optional | Feature flag for analytics |
| `VITE_GOOGLE_ANALYTICS_ID` | Optional | Google Analytics tracking ID |

**Fixes applied (this PR):**

1. **SPA fallback rewrite** — Added `{"source": "/(.*)", "destination": "/index.html"}` to `vercel.json` so React Router handles all client-side routes. Without this, any direct URL access to a non-root path (e.g., `/Dashboard`) returns a 404.
2. **Corrected `build.env` variable names** — Replaced incorrect `VITE_BASE44_PROJECT_ID` and `VITE_API_URL` with the actual variable names used by the code (`VITE_BASE44_APP_ID`, `VITE_BASE44_BACKEND_URL`).
3. **Removed invalid redirect** — Removed `/login` → `/auth/login` redirect; no such route exists in the app.
4. **Removed unused `env.NODE_VERSION`** — Vercel uses `.nvmrc` / `engines` for Node version pinning; the `env.NODE_VERSION` key has no effect.
5. **Added `.nvmrc`** — Pins Node.js 20 for consistent builds on Vercel, local development, and CI.

---

### ✅ `Krosebrook/continuum` — **Ready with env vars**

| Property | Value |
|---|---|
| Framework | Next.js 16 (App Router) |
| Package manager | npm |
| Build command | `next build` |
| Output directory | `.next` (Vercel auto-detects) |
| Node version | Not pinned — recommend adding `.nvmrc` with `20` |

**Blockers:**

- [ ] Set environment variables in Vercel dashboard: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`.
- [ ] Add `.env.example` documenting required vars.
- [ ] Add `.nvmrc`.

---

### ⚠️ `Krosebrook/flashfusion-ide` — **Partial**

| Property | Value |
|---|---|
| Framework | Vite 7 + React 19 |
| Package manager | npm |
| Build command | `tsc -b && vite build` |
| Output directory | `dist` |

**Blockers:**

- [ ] No `vercel.json` with SPA fallback rewrite — direct URL access to any path other than `/` will 404.
- [ ] App requires a running backend (Socket.IO / WebSocket) that Vercel Serverless cannot host natively. Consider Vercel's serverless WebSocket alternatives or deploy backend separately.
- [ ] No `.env.example`.

---

### ⚠️ `Krosebrook/fusion-ai` — **Partial**

| Property | Value |
|---|---|
| Framework | Vite + React 18 (Base44) |
| Package manager | npm |
| Build command | `npm run build` |
| Output directory | `dist` |

**Blockers:**

- [ ] No `vercel.json` — SPA fallback rewrite needed.
- [ ] No `.env.example` — `VITE_BASE44_APP_ID` and `VITE_BASE44_BACKEND_URL` undocumented.

**Recommended fix:** Copy `vercel.json` and `.env.example` from `interact` as a baseline.

---

### ⚠️ `Krosebrook/enterprise-ai-app-generator` — **Partial**

| Property | Value |
|---|---|
| Framework | Vite + React 18 (Base44) |
| Package manager | npm |
| Build command | `npm run build` |
| Output directory | `dist` |

**Blockers:**

- [ ] No `vercel.json` — SPA fallback rewrite needed.
- [ ] Stripe integration present but `VITE_STRIPE_PUBLISHABLE_KEY` not documented in env example.
- [ ] No `.env.example`.

---

### ⚠️ `Krosebrook/source-of-truth-monorepo` — **Partial (monorepo)**

| Property | Value |
|---|---|
| Framework | Turborepo (pnpm workspaces) |
| Package manager | pnpm 9 |
| Node requirement | ≥ 22 |

**Blockers:**

- [ ] Monorepo — Vercel requires a separate project per app. Set `rootDirectory` in each Vercel project's settings or in per-app `vercel.json`.
- [ ] Node ≥ 22 required; add `.nvmrc` with `22` at repo root.
- [ ] Verify `pnpm-lock.yaml` is committed.
- [ ] Per-app `vercel.json` may be needed if output dirs differ from Vercel defaults.

---

### ❌ Not Vercel-Deployable

| Repository | Reason |
|---|---|
| `turborepo-flashfusion` | PowerShell scripts only; no web app |
| `RoseyRecords` | Python/Jupyter Notebook project |
| `flashfusion-discord` | Discord bot — requires persistent process |

---

## Vercel Deployment Guide for `interact`

### Prerequisites

1. A [Vercel account](https://vercel.com/signup) linked to the `Krosebrook` GitHub organization.
2. A [Base44](https://base44.com) application with its App ID and backend URL.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKrosebrook%2Finteract)

### Manual Steps

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. From the repository root, run:
vercel

# 3. Follow prompts: link to project, confirm framework (Vite), build command, output dir.
```

### Required Environment Variables (Vercel Dashboard)

Set the following under **Project → Settings → Environment Variables**:

| Name | Example Value | Environment |
|---|---|---|
| `VITE_BASE44_APP_ID` | `app_xxxxxxxxxx` | Production, Preview, Development |
| `VITE_BASE44_BACKEND_URL` | `https://api.base44.com` | Production, Preview, Development |

### Vercel Secrets (for CI/CD via GitHub Actions)

Add the following to **GitHub → Settings → Secrets and Variables → Actions**:

| Secret | Purpose |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel organization/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID for `interact` |

### Local Preview

```bash
# Copy example env file
cp .env.example .env.local

# Fill in VITE_BASE44_APP_ID and VITE_BASE44_BACKEND_URL, then:
npm run dev

# Or preview the production build locally:
npm run build && npm run preview
```
