# Troubleshooting Guide

**Project:** Interact — Employee Engagement & Gamification Platform
**Last Updated:** March 8, 2026
**Version:** 1.0.0
**Audience:** Developers, QA, Support, DevOps

---

## Table of Contents

1. [Build Errors](#1-build-errors)
2. [Development Server Issues](#2-development-server-issues)
3. [Authentication Issues](#3-authentication-issues)
4. [API and Backend Errors](#4-api-and-backend-errors)
5. [Test Failures](#5-test-failures)
6. [Deployment Issues](#6-deployment-issues)
7. [Performance Issues](#7-performance-issues)
8. [Known Limitations](#8-known-limitations)
9. [Escalation](#9-escalation)

---

## 1. Build Errors

### 1.1 `npm install` fails with peer dependency conflicts

**Symptom:**
```
npm warn ERESOLVE overriding peer dependency
npm ERR! code ERESOLVE
```

**Resolution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

If the conflict persists:
```bash
npm install --legacy-peer-deps
```

---

### 1.2 Vite build fails: `Cannot find module`

**Symptom:**
```
[vite] error: Cannot find module '@/components/ui/button'
```

**Resolution:**
- Verify the file exists at the path (the `@/` alias maps to `src/`).
- Check for a typo in the import path or file name (imports are case-sensitive on Linux).
- Ensure `jsconfig.json` / `tsconfig.json` has the path alias configured:
  ```json
  { "paths": { "@/*": ["./src/*"] } }
  ```

---

### 1.3 Vite build fails: TypeScript type error

**Symptom:**
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

**Resolution:**
```bash
npm run typecheck   # Get full list of errors
```
Fix the type errors in order. Do not use `// @ts-ignore` unless there is a documented reason.

---

### 1.4 Build runs out of memory

**Symptom:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Resolution:**
```bash
# Increase Node.js heap size
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

If this is recurring, investigate bundle size: `npm run build -- --report` (if `rollup-plugin-visualizer` is enabled in `vite.config.js`).

---

### 1.5 ESLint errors blocking CI

**Symptom:**
```
/src/components/MyComponent.jsx
  5:3  error  React Hook "useState" is called conditionally  react-hooks/rules-of-hooks
```

**Resolution:**
- This is a **critical** error — do not disable the rule.
- Move the hook call to the top of the component, before any conditional return.
- See `docs/development/CODING_STANDARDS.md` Section 4 (React Hooks Rules).

---

## 2. Development Server Issues

### 2.1 `npm run dev` fails to start

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Resolution:**
```bash
# Find and kill the process using port 5173
lsof -i :5173
kill <PID>
# Or use a different port
npm run dev -- --port 3000
```

---

### 2.2 Hot Module Replacement (HMR) not working

**Symptom:** Changes are not reflected in the browser without a full reload.

**Resolution:**
- Ensure the file is inside `src/`.
- Try a full browser refresh (Ctrl+Shift+R).
- Restart the dev server (`Ctrl+C`, then `npm run dev`).
- Check the browser console for HMR websocket errors.

---

### 2.3 Blank page or white screen

**Symptom:** The application loads but shows only a blank white page.

**Resolution:**
1. Open browser DevTools → **Console** tab. Look for JavaScript errors.
2. Open **Network** tab — check if `index.html` and JS bundles load with HTTP 200.
3. Common causes:
   - Missing environment variable (`VITE_BASE44_APP_ID` or `VITE_BASE44_BACKEND_URL`).
   - A React rendering error caught by an error boundary — look for `Error:` in console.
   - React Router mismatch — the current URL does not match any route.

---

## 3. Authentication Issues

### 3.1 Login loop / redirects to login page repeatedly

**Symptom:** After logging in, the user is immediately redirected back to the login page.

**Resolution:**
- Clear browser `localStorage` and cookies, then retry.
- Verify `VITE_BASE44_APP_ID` matches the correct Base44 application.
- Check the browser's Network tab for a failed auth request (look for 401 or 403 responses).
- Check Base44 dashboard for the application's allowed origins — your `localhost:5173` or production URL must be listed.

---

### 3.2 `401 Unauthorized` on API requests

**Symptom:** API calls fail with a 401 status code after the user is logged in.

**Resolution:**
- The auth token may have expired. Refresh the page.
- Check if the Base44 session is still active in the Base44 dashboard.
- Verify the API client is sending the `Authorization` header.

---

### 3.3 SSO configuration not working

See `docs/security/SSO_IMPLEMENTATION.md` for SSO-specific troubleshooting steps.

---

## 4. API and Backend Errors

### 4.1 `CORS` errors in browser console

**Symptom:**
```
Access to fetch at 'https://api.base44.com/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Resolution:**
- Add `http://localhost:5173` to the allowed origins in the Base44 dashboard.
- For production, add the production domain.
- Do **not** add a `Access-Control-Allow-Origin: *` header to your functions — it bypasses auth.

---

### 4.2 Base44 function returns 500

**Symptom:** A serverless function call returns an HTTP 500 error.

**Resolution:**
1. Check the Vercel Functions logs:
   - Go to [vercel.com](https://vercel.com) → your project → **Functions** tab → click the function.
2. Reproduce locally if possible.
3. Common causes:
   - Missing environment variable in the Vercel project settings.
   - Unhandled exception in the function — add try/catch.
   - External service (OpenAI, Cloudinary) is down — check their status pages.

---

### 4.3 AI features return no results

**Symptom:** AI recommendation or content generation panels show no results or a generic error.

**Resolution:**
- Verify `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY` / `GEMINI_API_KEY`) is set in Vercel environment variables.
- Check the OpenAI/Anthropic status page for outages.
- Check Vercel function logs for rate-limit errors (`429 Too Many Requests`).
- AI features are non-critical and should degrade gracefully — verify the feature flag is toggled correctly.

---

## 5. Test Failures

### 5.1 Tests fail with `Cannot find module`

**Symptom:**
```
Error: Cannot find module '@/lib/utils'
```

**Resolution:**
- Ensure `vitest.config.js` has the path alias configured:
  ```js
  resolve: { alias: { '@': '/src' } }
  ```
- Run `npm install` to ensure all dev dependencies are installed.

---

### 5.2 Tests fail with `document is not defined`

**Symptom:**
```
ReferenceError: document is not defined
```

**Resolution:**
- Ensure `vitest.config.js` sets `environment: 'happy-dom'` or `environment: 'jsdom'`.
- Ensure the test file imports the setup file or that `setupFiles` is configured in `vitest.config.js`.

---

### 5.3 React Testing Library: element not found

**Symptom:**
```
TestingLibraryElementError: Unable to find an element with the text: 'Submit'
```

**Resolution:**
- Confirm the component renders the expected text. Add `screen.debug()` to see the rendered HTML.
- If the component requires providers (Query, Router, Context), use the `renderWithProviders` utility from `src/test/test-utils.jsx`.
- If text is behind a loading state, use `await screen.findByText('Submit')` (async query).

---

## 6. Deployment Issues

### 6.1 Vercel deploy fails

See `docs/operations/RUNBOOK.md` → Section 7.2 (Vercel Build Failure).

---

### 6.2 React Router deep links return 404 on Vercel

**Symptom:** Direct navigation to `/dashboard/activities` returns a 404 page on Vercel.

**Resolution:**
Ensure `vercel.json` contains the SPA catch-all rewrite:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 6.3 Environment variables missing after deploy

**Symptom:** Application works locally but fails in production with missing-env-var errors.

**Resolution:**
1. Go to Vercel → Settings → Environment Variables.
2. Add the missing variable with the **Production** scope.
3. Trigger a redeploy (see `docs/operations/RUNBOOK.md` → Section 4.2).

---

## 7. Performance Issues

### 7.1 Slow initial page load

**Symptoms:** Time-to-interactive > 3 seconds; Lighthouse performance score < 70.

**Resolution:**
- Ensure lazy loading is enabled for pages (React Router `lazy()` imports in `src/pages.config.js`).
- Check bundle size: run `npm run build` and inspect `dist/` sizes.
- Defer non-critical third-party scripts.
- Ensure images use WebP format and have `loading="lazy"` attribute.
- See `docs/development/PERFORMANCE.md` for a full optimization guide.

---

### 7.2 Excessive re-renders

**Symptom:** UI feels sluggish; React DevTools Profiler shows frequent re-renders.

**Resolution:**
- Check if Context value objects are recreated on every render — memoize them with `useMemo`.
- Wrap expensive pure components with `React.memo`.
- Check TanStack Query `staleTime` settings — very short stale times cause frequent refetches.

---

## 8. Known Limitations

| Limitation | Impact | Workaround / Planned Fix |
|---|---|---|
| E2E tests not yet implemented | Manual QA required for integration tests | Playwright E2E planned (see `FEATURE_ROADMAP.md`) |
| PWA offline support not implemented | Application requires internet connection | PWA roadmap item Q2 2026 |
| Mobile app (Capacitor) in beta | Mobile builds may have UI inconsistencies | Use browser on mobile for production use |
| `moment.js` present in dependencies | Large bundle size impact | Migration to `date-fns` planned; avoid adding new `moment` usage |
| Test coverage at ~30% | Some code paths not covered by tests | Coverage increase tracked in `docs/guides/TESTING.md` |
| AI recommendations require API keys | AI features unavailable without valid keys | Deploy without AI keys; features degrade gracefully |

---

## 9. Escalation

If you cannot resolve an issue using this guide:

1. Search existing [GitHub Issues](https://github.com/Krosebrook/interact/issues).
2. Check the [FAQ](./../../FAQ.md).
3. Ask in `#engineering` Slack channel.
4. If it is a production incident, follow `docs/operations/RUNBOOK.md` → Section 6 (Incident Response).
5. Open a GitHub Issue with:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment (OS, Node.js version, browser)
   - Relevant logs or error messages
