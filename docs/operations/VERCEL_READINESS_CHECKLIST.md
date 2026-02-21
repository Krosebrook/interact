# Vercel Production Readiness Checklist

A reusable checklist for auditing any Krosebrook repository before deploying to Vercel.

---

## 1. App-Type Detection

- [ ] Identify the app type:
  - **Vercel Web App** – Static site / SPA (React, Vue, Svelte, Vite, Next.js, etc.)
  - **Vercel Functions / API** – Serverless API routes only (no frontend build)
  - **Monorepo** – Multiple apps/packages in one repo (requires `vercel.json` root config)
  - **N/A** – Not a Vercel-deployable project
- [ ] Document the detected framework (Vite, Next.js, CRA, Nuxt, etc.)

---

## 2. Build & Deploy Validation

- [ ] `npm run build` (or equivalent) completes without errors locally
- [ ] Build output directory exists (`dist/`, `.next/`, `out/`, etc.)
- [ ] No hard-coded `localhost` or development URLs in production code
- [ ] Framework auto-detected by Vercel **or** explicitly set in `vercel.json`

---

## 3. Package Manager & Lockfile

- [ ] A lockfile is present (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`)
- [ ] Lockfile is committed to version control (not in `.gitignore`)
- [ ] Install command matches the lockfile (e.g., `npm ci` for `package-lock.json`)
- [ ] No duplicate lockfiles (only one package manager's lockfile)

---

## 4. package.json Scripts

- [ ] `build` script is present and produces the expected output
- [ ] `dev` / `start` script is present for local development
- [ ] Scripts use relative paths and are portable (no machine-specific paths)

---

## 5. Node.js Version

- [ ] `.nvmrc` file present at repo root with the target Node version (e.g., `20`)
- [ ] **or** `engines.node` field in `package.json` (e.g., `"node": ">=20"`)
- [ ] Node version is consistent between local dev, CI, and Vercel
- [ ] Node version is actively supported (see [Node.js releases](https://nodejs.org/en/about/previous-releases))

---

## 6. vercel.json (only if needed)

> Add `vercel.json` only when the project requires: monorepo routing, custom rewrites/redirects,
> serverless function configuration, or overriding framework auto-detection.

- [ ] `"framework"` matches detected framework
- [ ] `"buildCommand"` matches `package.json` build script
- [ ] `"outputDirectory"` matches the actual build output folder
- [ ] `"installCommand"` matches the lockfile (use `npm ci` not `npm install`)
- [ ] SPA fallback rewrite present if using client-side routing:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- [ ] No no-op rewrites (e.g., `/api/:path*` → `/api/:path*`)
- [ ] `build.env` references correct environment variable names (no stale names)
- [ ] No `env.NODE_VERSION` (use `.nvmrc` or `engines` instead)
- [ ] Security headers configured (`X-Content-Type-Options`, `X-Frame-Options`, etc.)

---

## 7. Environment Variables

- [ ] `.env.example` (or `.env.template`) exists and documents all variables
- [ ] All required `VITE_*` (or `NEXT_PUBLIC_*`) variables are listed
- [ ] No real secrets in `.env.example` (use placeholder values like `your_value_here`)
- [ ] `.env.local`, `.env.production`, etc., are in `.gitignore`
- [ ] Required env vars documented in README or deployment docs
- [ ] Vercel project settings include all required env vars for each environment (preview, production)

---

## 8. README – Deploy to Vercel Section

- [ ] One-click deploy button (Vercel deploy badge) or manual deploy instructions
- [ ] Build command documented
- [ ] Output directory documented
- [ ] Node.js version requirement documented
- [ ] Required environment variables table included
- [ ] Link to `.env.example` for local development setup

---

## 9. GitHub Actions CI

- [ ] CI workflow exists (`.github/workflows/`)
- [ ] CI runs on `push` to main and on pull requests
- [ ] CI steps include: install → lint → test → build (in that order)
- [ ] All `actions/*` steps use non-deprecated versions (v3 → v4 for artifact actions)
- [ ] Build step uses `npm ci` (not `npm install`) for reproducible installs
- [ ] CI passes on the default branch before deploying

---

## 10. Security

- [ ] `npm audit --audit-level=high` returns 0 high/critical vulnerabilities
- [ ] No secrets committed to the repository
- [ ] Security headers set in `vercel.json` or middleware
- [ ] Dependencies are up to date (no known CVEs)

---

## 11. SPA Routing (for SPAs only)

- [ ] All routes fall back to `index.html` (Vercel rewrite or framework config)
- [ ] 404 page configured (optional, improves UX)
- [ ] No hardcoded API base URLs that differ between environments

---

## 12. Final Sign-Off

- [ ] Production build tested locally with `npm run preview` (Vite) or equivalent
- [ ] Environment variables validated in a Vercel preview deployment
- [ ] No build warnings that indicate missing assets or broken imports
- [ ] Lighthouse / performance score acceptable for production (optional)

---

## Readiness Status Template

Use this in PR descriptions or deployment tickets:

```
### Vercel Readiness Report

**App Type:** Vercel Web App (React + Vite SPA)
**Detected Framework:** Vite
**Node Version:** 20.x

#### Blockers Fixed
- [ ] ...

#### Remaining Blockers
- [ ] ...

#### Notes
- ...
```
