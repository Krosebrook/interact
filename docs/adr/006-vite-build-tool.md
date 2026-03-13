# ADR 006: Use Vite as Build Tool

**Status:** Accepted  
**Date:** December 2024 (Reconstructed from audit)  
**Deciders:** Engineering Team  

## Context

A build tool and development server were needed for the React SPA. Options considered:
1. Vite 6
2. Webpack 5 / Create React App
3. Next.js (with SSR)
4. Parcel

## Decision

Use Vite 6 as the build tool and development server.

## Rationale

- Near-instant HMR (Hot Module Replacement) during development
- Native ESM in dev; Rollup-based optimized production build
- First-class React support via `@vitejs/plugin-react`
- `@base44/vite-plugin` integration for SDK aliases
- Much faster cold starts than Webpack
- Simple config (`vite.config.js` ~30 lines)

## Consequences

**Positive:**
- ✅ Sub-second dev server startup
- ✅ Automated code-splitting per page
- ✅ Rollup plugin ecosystem available
- ✅ Vercel Vite framework preset auto-detected

**Negative:**
- ⚠️ Rollup underlying engine inherits Rollup CVEs (e.g., path traversal GHSA-mw96-cpmx-2vgc in Rollup 4.0-4.58)
- ⚠️ SSR not available without switching to SvelteKit/Next.js adapter

## References

- `vite.config.js` (root)
- `vercel.json` → `"framework": "vite"`
- `package.json` → `"vite": "^6.1.0"`
