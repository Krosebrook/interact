# Configuration & Customization Guide

**Project:** Interact — Employee Engagement & Gamification Platform
**Last Updated:** March 8, 2026
**Version:** 1.0.0
**Audience:** Developers, DevOps

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [Local Development Setup](#3-local-development-setup)
4. [Vercel Environment Setup](#4-vercel-environment-setup)
5. [Feature Flags](#5-feature-flags)
6. [Third-Party Service Configuration](#6-third-party-service-configuration)
7. [Runtime Customization](#7-runtime-customization)
8. [Security Considerations](#8-security-considerations)

---

## 1. Overview

Interact uses a layered configuration approach:

1. **Build-time environment variables** — injected at `vite build` time via `VITE_` prefixed variables.
2. **Runtime serverless function variables** — available inside `functions/` via `Deno.env.get()`.
3. **Vercel project settings** — manage production and preview environment variables through the Vercel dashboard or `vercel.json`.
4. **Base44 app config** — defined in `base44.config.json` for SDK integration.

### Quick Reference

| Layer | Where defined | Prefix | Accessible in |
|---|---|---|---|
| Frontend build-time | `.env`, `.env.local`, Vercel dashboard | `VITE_` | `import.meta.env.VITE_*` |
| Backend (serverless) | Vercel dashboard, Deno runtime | _(none)_ | `Deno.env.get('KEY')` |
| Base44 SDK | `base44.config.json` | _(none)_ | SDK internally |

---

## 2. Environment Variables Reference

### 2.1 Required Variables

These variables **must** be set for the application to start.

| Variable | Layer | Description | Example |
|---|---|---|---|
| `VITE_BASE44_APP_ID` | Frontend | Base44 application identifier | `app_abc123xyz` |
| `VITE_BASE44_BACKEND_URL` | Frontend | Base44 backend API base URL | `https://api.base44.com` |

### 2.2 AI Service Variables (Required for AI features)

| Variable | Layer | Description | Example |
|---|---|---|---|
| `OPENAI_API_KEY` | Backend | OpenAI API key for GPT-4 features | `sk-...` |
| `ANTHROPIC_API_KEY` | Backend | Anthropic Claude API key | `sk-ant-...` |
| `GEMINI_API_KEY` | Backend | Google Gemini API key | `AIza...` |

### 2.3 Optional Variables

| Variable | Layer | Description | Default |
|---|---|---|---|
| `VITE_ENABLE_ANALYTICS` | Frontend | Enable/disable analytics tracking | `false` |
| `VITE_SENTRY_DSN` | Frontend | Sentry error monitoring DSN | _(none — disabled)_ |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary cloud name for media | _(none)_ |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key | _(none)_ |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret | _(none)_ |
| `SLACK_BOT_TOKEN` | Backend | Slack bot token for notifications | _(none)_ |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth client ID | _(none)_ |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth client secret | _(none)_ |

### 2.4 Variable Precedence

Vite loads environment files in this order (higher = higher precedence):

```
.env.local          > .env.[mode].local > .env.[mode] > .env
```

For example, in development mode:

```
.env.development.local > .env.local > .env.development > .env
```

`.env.local` is **never committed** to Git. Use it for secrets during local development.

---

## 3. Local Development Setup

### 3.1 Create your local environment file

```bash
cp .env.example .env.local
```

### 3.2 Populate `.env.local`

```dotenv
# Required — Base44 configuration
VITE_BASE44_APP_ID=your_app_id_here
VITE_BASE44_BACKEND_URL=https://api.base44.com

# Optional — AI services (only needed if testing AI features)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

# Optional — Media uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Security:** Never commit `.env.local` or any file containing real API keys. `.env.local` is in `.gitignore`.

### 3.3 Verify configuration

```bash
npm run dev
# Open http://localhost:5173
# Check browser console — no "missing env var" warnings
```

---

## 4. Vercel Environment Setup

### 4.1 Dashboard configuration

1. Go to [vercel.com](https://vercel.com) → your project → **Settings → Environment Variables**.
2. Add each variable with the appropriate **Environment** scope (Production, Preview, Development).

| Variable | Production | Preview | Development |
|---|---|---|---|
| `VITE_BASE44_APP_ID` | ✅ | ✅ | ✅ |
| `VITE_BASE44_BACKEND_URL` | ✅ | ✅ | ✅ |
| `OPENAI_API_KEY` | ✅ | ✅ | ❌ |
| `ANTHROPIC_API_KEY` | ✅ | ✅ | ❌ |

### 4.2 `vercel.json` reference syntax

`vercel.json` uses `@secret-name` references to pull variables from the Vercel secrets store (note: lowercase convention for secret names):

```json
{
  "build": {
    "env": {
      "VITE_BASE44_APP_ID": "@vite_base44_app_id",
      "VITE_BASE44_BACKEND_URL": "@vite_base44_backend_url"
    }
  }
}
```

### 4.3 SPA routing rewrite

The `vercel.json` must include the catch-all rewrite for React Router to work on deep links:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 5. Feature Flags

Feature flags allow enabling or disabling features without code changes. Currently implemented via environment variables; a dedicated feature-flag service is on the roadmap.

### Current feature flags

| Flag | Variable | Values | Default | Description |
|---|---|---|---|---|
| Analytics | `VITE_ENABLE_ANALYTICS` | `true`/`false` | `false` | Enable event tracking |
| AI Recommendations | `VITE_ENABLE_AI_RECOMMENDATIONS` | `true`/`false` | `false` | Show AI-powered suggestions |
| PWA Install Banner | `VITE_ENABLE_PWA` | `true`/`false` | `false` | Show PWA install prompt |

### Consuming feature flags in code

```js
// src/lib/feature-flags.js
export const flags = {
  analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  aiRecommendations: import.meta.env.VITE_ENABLE_AI_RECOMMENDATIONS === 'true',
  pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
};
```

```jsx
import { flags } from '@/lib/feature-flags';

const Dashboard = () => {
  return (
    <div>
      {flags.aiRecommendations && <AiRecommendationsPanel />}
    </div>
  );
};
```

---

## 6. Third-Party Service Configuration

### 6.1 Base44 SDK

Configured in `base44.config.json` at the repository root. The SDK reads `VITE_BASE44_APP_ID` and `VITE_BASE44_BACKEND_URL` via `src/lib/app-params.js`.

```js
// src/api/base44Client.js — do not modify the env var names
import { Base44Client } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

export const base44Client = new Base44Client({
  appId: appParams.appId,          // from VITE_BASE44_APP_ID
  serverUrl: appParams.serverUrl,  // from VITE_BASE44_BACKEND_URL
});
```

### 6.2 OpenAI

Used in `functions/openaiIntegration.ts`. Requires `OPENAI_API_KEY` as a backend-only environment variable (never expose in frontend).

### 6.3 Cloudinary

Used for media uploads. Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — all backend-only.

### 6.4 Google Calendar / Slack / Teams

See `docs/integrations/INTEGRATIONS.md` for per-integration configuration details.

---

## 7. Runtime Customization

### 7.1 Theme

The application supports light/dark mode via `next-themes`. Theme preference is stored in `localStorage` and defaults to the OS preference.

To override the default theme:

```jsx
// src/main.jsx or src/App.jsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider defaultTheme="light" attribute="class">
  <App />
</ThemeProvider>
```

### 7.2 Tailwind Configuration

Customize design tokens in `tailwind.config.js`. Do not override core tokens without a design review — they propagate to all Radix UI component styles.

### 7.3 Vite Configuration

Build customization options are in `vite.config.js`. Relevant sections:

- **`build.rollupOptions.output.manualChunks`** — Controls code splitting.
- **`server.proxy`** — Configure API proxy for local development.
- **`plugins`** — Add/remove Vite plugins.

---

## 8. Security Considerations

| Rule | Detail |
|---|---|
| Never put secrets in `VITE_` variables | Anything with `VITE_` prefix is bundled into the client JavaScript and is **publicly readable**. Use backend env vars for secrets. |
| Rotate keys on compromise | Follow the procedure in `docs/security/INCIDENT_RESPONSE.md`. |
| Scope Vercel env vars correctly | Use "Production only" scope for keys that should not be available in preview branches. |
| Audit third-party services | Verify each third-party service is GDPR-compliant. See `docs/security/DATA-PRIVACY.md`. |
| `.env.example` must stay current | Every new env var must be added to `.env.example` (with a placeholder value, never a real value). |
