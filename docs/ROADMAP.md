# Technical Roadmap — Interact Platform

**Framework:** WSJF (Weighted Shortest Job First)  
**WSJF Score = (Business Value + Time Criticality + Risk Reduction) / Job Size**  
**Last Updated:** January 2026

---

## WSJF Scoring Key

| Score Range | Priority Label |
|---|---|
| 8–10 | 🔴 Critical — Fix immediately |
| 5–7 | 🟠 High — This sprint |
| 3–4 | 🟡 Medium — This quarter |
| 1–2 | 🟢 Low — Backlog |

---

## Tier 1 — Fix Now (WSJF 8–10)

These items represent active security vulnerabilities or critical quality blockers. They should be addressed before any new feature work.

### 1.1 Resolve Critical npm Vulnerabilities — WSJF: 10

| Attribute | Score |
|---|---|
| Business Value | 3 |
| Time Criticality | 3 |
| Risk Reduction | 3 |
| Job Size | 1 |
| **WSJF** | **9.0** |

**Vulnerabilities to fix:**

| Package | Severity | CVE / Issue | Fix |
|---|---|---|---|
| `jspdf <=4.1.0` | High | PDF object injection, DoS, arbitrary JS exec | Upgrade to `jspdf >= 4.2.0` |
| `quill 2.0.3` | High | XSS via HTML export | Upgrade or replace with sanitized alternative |
| `axios 1.0.0–1.13.4` | High | DoS via `__proto__` key | Upgrade to `axios >= 1.8.2` |
| `rollup 4.0.0–4.58.0` | High | Arbitrary file write via path traversal | Upgrade Vite (transitive) to get safe rollup |
| `flatted <3.4.0` | High | Unbounded recursion DoS | Upgrade flatted |
| `minimatch <=3.1.3` | High | ReDoS | Upgrade minimatch |
| `dompurify 3.1.3–3.3.1` | Moderate | XSS bypass | Upgrade to `dompurify >= 3.3.2` |
| `ajv <6.14.0` | Moderate | ReDoS | Upgrade ajv |

```bash
# Audit current state
npm audit

# Attempt auto-fix
npm audit fix

# Force upgrade specific packages
npm install jspdf@latest axios@latest dompurify@latest
```

**Acceptance Criteria:** `npm audit` reports 0 high or critical vulnerabilities.

---

### 1.2 Fix 513 ESLint Errors (Unused Imports) — WSJF: 8

| Attribute | Score |
|---|---|
| Business Value | 2 |
| Time Criticality | 2 |
| Risk Reduction | 2 |
| Job Size | 0.75 |
| **WSJF** | **8.0** |

513 ESLint errors are masking real code quality issues. The vast majority are unused import/variable errors.

```bash
# Auto-fix most unused imports
npm run lint:fix

# Verify
npm run lint
```

**Acceptance Criteria:** ESLint error count reduced to < 50 (manual review items only).

---

### 1.3 Resolve or Promote 31 Skipped Tests — WSJF: 8

| Attribute | Score |
|---|---|
| Business Value | 2 |
| Time Criticality | 2 |
| Risk Reduction | 2 |
| Job Size | 0.75 |
| **WSJF** | **8.0** |

31 tests are currently skipped (`skip`/`todo`). Each skipped test is either:
- Blocked (needs investigation)
- Stale (feature removed)
- Deferred (feature not yet implemented)

```bash
npm run test:run  # Review skipped test output
```

**Acceptance Criteria:** All 31 skipped tests either passing, intentionally `.todo()`, or removed with documented reason.

---

## Tier 2 — This Sprint (WSJF 5–7)

### 2.1 Add Content-Security-Policy Header — WSJF: 7

| Attribute | Score |
|---|---|
| Business Value | 2 |
| Time Criticality | 2 |
| Risk Reduction | 3 |
| Job Size | 1 |
| **WSJF** | **7.0** |

The `vercel.json` security headers are missing **Content-Security-Policy (CSP)**. This is one of the most impactful XSS mitigations available.

```json
// Add to vercel.json headers:
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.base44.com; img-src 'self' data: https://res.cloudinary.com; style-src 'self' 'unsafe-inline';"
}
```

**Note:** Start with `Content-Security-Policy-Report-Only` in non-breaking mode before enforcing.

**Acceptance Criteria:** CSP header present in all HTTP responses; no legitimate functionality broken.

---

### 2.2 Begin TypeScript Migration — WSJF: 6

| Attribute | Score |
|---|---|
| Business Value | 3 |
| Time Criticality | 1 |
| Risk Reduction | 2 |
| Job Size | 1 |
| **WSJF** | **6.0** |

TypeScript migration is planned for Q2 2025. Foundation is already in place (`tsconfig.json`, `@types/*` packages installed).

**Phase 1 (this sprint):**
1. Migrate `src/lib/` utilities to `.ts`
2. Migrate `src/api/` to `.ts`
3. Migrate `src/hooks/` to `.ts`
4. Type-check via `npm run typecheck`

**Acceptance Criteria:** `src/lib/`, `src/api/`, and `src/hooks/` converted to TypeScript with no `any` types.

---

### 2.3 Increase Test Coverage to 30% — WSJF: 5

| Attribute | Score |
|---|---|
| Business Value | 2 |
| Time Criticality | 1 |
| Risk Reduction | 2 |
| Job Size | 1 |
| **WSJF** | **5.0** |

Current coverage is low. Target: **30% line coverage** across `src/lib/`, `src/hooks/`, and `src/components/`.

```bash
npm run test:coverage  # Generate coverage report
```

**Priority test targets:**
- All custom hooks in `src/hooks/`
- Utility functions in `src/lib/utils.js`
- Form validation schemas (Zod)
- Critical page components (Dashboard, Gamification, Activities)

**Acceptance Criteria:** `npm run test:coverage` reports ≥ 30% line coverage.

---

## Tier 3 — This Quarter (WSJF 3–4)

### 3.1 Add HSTS Header — WSJF: 4

```json
// Add to vercel.json headers:
{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
}
```

Enforces HTTPS at the browser level. Low effort, high security value.

**Acceptance Criteria:** HSTS header present with max-age ≥ 1 year.

---

### 3.2 PWA Implementation — WSJF: 4

| Attribute | Score |
|---|---|
| Business Value | 2 |
| Time Criticality | 1 |
| Risk Reduction | 1 |
| Job Size | 1 |
| **WSJF** | **4.0** |

Capacitor is already installed. Full PWA support requires:
1. Service worker (offline caching of shell + critical data)
2. `manifest.json` with icons and theme colors
3. Push notification integration
4. Vite PWA plugin (`vite-plugin-pwa`)

**Acceptance Criteria:** Lighthouse PWA score ≥ 90; app installable on Android Chrome.

---

### 3.3 Playwright E2E Test Suite — WSJF: 3

| Attribute | Score |
|---|---|
| Business Value | 2 |
| Time Criticality | 1 |
| Risk Reduction | 1 |
| Job Size | 1.5 |
| **WSJF** | **2.7** |

`npm run test:e2e` currently echoes a placeholder message. Implement Playwright E2E for:
- Login / logout flow
- Create and join an event (happy path)
- Award points flow
- Rewards store purchase

**Acceptance Criteria:** 10+ E2E scenarios passing in CI.

---

### 3.4 Add CORP / COOP Security Headers — WSJF: 3

```json
{ "key": "Cross-Origin-Resource-Policy", "value": "same-origin" },
{ "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
```

Defends against Spectre-class attacks and cross-origin data leaks.

---

## Tier 4 — Backlog (WSJF 1–2)

### 4.1 Full TypeScript Strict Mode — WSJF: 2

After initial TypeScript migration, enable `"strict": true` across the codebase and eliminate all remaining `any` types.

### 4.2 Bundle Size Optimization — WSJF: 2

Use `rollup-plugin-visualizer` (already installed) to audit bundle size and implement:
- Dynamic imports for heavy libraries (`three.js`, `jspdf`, `recharts`)
- Replace `moment.js` (deprecated, heavy) with `date-fns` (already a dependency)
- Audit and remove unused Radix UI packages

### 4.3 SSO / SAML Implementation — WSJF: 2

Enterprise customers require SSO. See `docs/security/SSO_IMPLEMENTATION.md` for the detailed implementation plan.

### 4.4 GDPR Compliance Audit — WSJF: 2

See `docs/security/GDPR_CHECKLIST.md`. Requires:
- Data deletion workflows
- Export functionality (DSAR)
- Cookie consent banner
- Data retention policies

### 4.5 Deprecate `moment.js` — WSJF: 1

`moment.js` is a deprecated library that significantly increases bundle size. Replace all usages with `date-fns` which is already a project dependency.

```bash
grep -r "from 'moment'" src/ --include="*.jsx" --include="*.js" | wc -l
```

---

## Summary Table

| ID | Item | Tier | WSJF | Owner | Status |
|---|---|---|---|---|---|
| 1.1 | Fix npm vulnerabilities (jspdf, quill, axios, rollup) | 1 | 10 | Dev | 🔴 Todo |
| 1.2 | Fix 513 ESLint errors | 1 | 8 | Dev | 🔴 Todo |
| 1.3 | Resolve 31 skipped tests | 1 | 8 | Dev | 🔴 Todo |
| 2.1 | Add Content-Security-Policy header | 2 | 7 | Dev | 🟠 Todo |
| 2.2 | Begin TypeScript migration | 2 | 6 | Dev | 🟠 Todo |
| 2.3 | Increase test coverage to 30% | 2 | 5 | Dev | 🟠 Todo |
| 3.1 | Add HSTS header | 3 | 4 | Dev | 🟡 Todo |
| 3.2 | PWA implementation | 3 | 4 | Dev | 🟡 Todo |
| 3.3 | Playwright E2E suite | 3 | 3 | Dev | 🟡 Todo |
| 3.4 | CORP / COOP headers | 3 | 3 | Dev | 🟡 Todo |
| 4.1 | TypeScript strict mode | 4 | 2 | Dev | 🟢 Backlog |
| 4.2 | Bundle size optimization | 4 | 2 | Dev | 🟢 Backlog |
| 4.3 | SSO / SAML | 4 | 2 | Dev | 🟢 Backlog |
| 4.4 | GDPR compliance audit | 4 | 2 | Dev | 🟢 Backlog |
| 4.5 | Replace moment.js with date-fns | 4 | 1 | Dev | 🟢 Backlog |
