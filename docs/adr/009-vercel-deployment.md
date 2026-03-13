# ADR 009: Deploy Frontend on Vercel

**Status:** Accepted  
**Date:** December 2024 (Reconstructed from audit)  
**Deciders:** Engineering Team  

## Context

A hosting platform was needed for the React SPA. Options considered:
1. Vercel
2. Netlify
3. AWS Amplify / CloudFront + S3
4. Cloudflare Pages

## Decision

Deploy the frontend on Vercel using the Vite framework preset.

## Rationale

- First-class Vite support with zero-config detection
- Global CDN edge network (iad1 region primary)
- Preview deployments per PR
- Built-in environment variable management (`@vite_base44_app_id`, `@vite_base44_backend_url` secret references)
- SPA catch-all rewrite (`"source": "/(.*)", "destination": "/index.html"`) for React Router
- Security headers configured declaratively in `vercel.json`

## Configuration (`vercel.json`)

- **Framework:** Vite
- **Build:** `npm run build` → `dist/`
- **Region:** iad1 (US East)
- **Headers:** X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Missing Headers:** Content-Security-Policy, Strict-Transport-Security, CORP/COOP

## Consequences

**Positive:**
- ✅ Zero-downtime deployments
- ✅ Automatic HTTPS
- ✅ Environment secrets managed outside codebase
- ✅ SPA routing works correctly

**Negative:**
- ⚠️ Missing CSP and HSTS headers (tracked in `docs/SECURITY.md` as High findings)
- ⚠️ No server-side rendering capability in current setup

## References

- `vercel.json`
- `docs/operations/VERCEL_AUDIT.md`
- `docs/operations/VERCEL_READINESS_CHECKLIST.md`
