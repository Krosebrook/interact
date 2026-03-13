# Security Documentation — Interact Platform

**Last Updated:** January 2026  
**Audit Date:** January 2026  
**Overall Security Posture:** ⚠️ Medium Risk (active vulnerabilities require remediation)

> For security incident reporting, see [SECURITY.md](../SECURITY.md) in the repository root.  
> For GDPR compliance tracking, see [docs/security/GDPR_CHECKLIST.md](security/GDPR_CHECKLIST.md).  
> For threat modeling, see [docs/security/THREAT-MODEL.md](security/THREAT-MODEL.md).

---

## Table of Contents

1. [Current Vulnerabilities](#1-current-vulnerabilities)
2. [Security Headers](#2-security-headers)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [OWASP Top 10 Mapping](#4-owasp-top-10-mapping)
5. [Secrets Management](#5-secrets-management)
6. [Input Validation & Sanitization](#6-input-validation--sanitization)
7. [Recommended Remediations](#7-recommended-remediations)

---

## 1. Current Vulnerabilities

### npm Audit Results (January 2026)

**Total:** 9 vulnerabilities (1 low, 2 moderate, 6 high)

> ⚠️ Run `npm audit` for the current state — this reflects the audit as of January 2026.

| # | Package | Severity | CVE / Issue | Impact | Fix |
|---|---|---|---|---|---|
| 1 | `jspdf <=4.1.0` | 🔴 HIGH | GHSA (multiple) | PDF object injection, DoS, arbitrary JS execution | Upgrade to `jspdf >= 4.2.0` |
| 2 | `quill 2.0.3` | 🔴 HIGH | GHSA-4pdm-h8vc-3x7c | XSS via HTML export — malicious content can execute JS | Upgrade `quill` or sanitize output |
| 3 | `axios 1.0.0–1.13.4` | 🔴 HIGH | GHSA-jr5f-v2jv-69x6 | Denial of Service via `__proto__` key in responses | Upgrade to `axios >= 1.8.2` |
| 4 | `rollup 4.0.0–4.58.0` | 🔴 HIGH | GHSA-gcx4-mw62-g8wm | Arbitrary file write via path traversal in build | Upgrade Vite 6 to latest (fixes transitive rollup) |
| 5 | `flatted <3.4.0` | 🔴 HIGH | GHSA (ReDoS) | Unbounded recursion causes Denial of Service | Upgrade flatted |
| 6 | `minimatch <=3.1.3` | 🔴 HIGH | CVE-2022-3517 | ReDoS via crafted glob pattern | Upgrade minimatch |
| 7 | `dompurify 3.1.3–3.3.1` | 🟠 MODERATE | GHSA-mmhx-hmjr-r674 | XSS bypass via namespace confusion | Upgrade to `dompurify >= 3.3.2` |
| 8 | `ajv <6.14.0` | 🟠 MODERATE | CVE-2020-15366 | ReDoS via malicious JSON schema | Upgrade ajv |
| 9 | *(low severity)* | 🟡 LOW | Various | Minimal exploitability | Monitor |

### Exploitability Assessment

| Vulnerability | Frontend Exploitable? | Notes |
|---|---|---|
| jspdf (arbitrary JS exec) | ✅ Yes | If user-supplied content is passed to jspdf without sanitization |
| quill XSS | ✅ Yes | If quill HTML output is rendered via `dangerouslySetInnerHTML` |
| axios DoS | ⚠️ Via backend | Requires attacker-controlled server response |
| rollup path traversal | ❌ Build-time only | Not exploitable in production runtime |
| dompurify XSS bypass | ✅ Yes | If dompurify is used as the only XSS guard |
| ajv ReDoS | ⚠️ Indirect | Via malformed JSON schemas in form validation |

---

## 2. Security Headers

### Current Headers (vercel.json)

| Header | Value | Status |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | ✅ Present |
| `X-Frame-Options` | `DENY` | ✅ Present |
| `X-XSS-Protection` | `1; mode=block` | ✅ Present (legacy) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ Present |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ Present |

### Missing Headers

| Header | Risk | Recommended Value |
|---|---|---|
| `Content-Security-Policy` | 🔴 HIGH — Primary XSS defense missing | See recommended CSP below |
| `Strict-Transport-Security` | 🟠 MEDIUM — HTTPS not enforced at browser level | `max-age=63072000; includeSubDomains; preload` |
| `Cross-Origin-Resource-Policy` | 🟡 LOW — Spectre-class attack vector | `same-origin` |
| `Cross-Origin-Opener-Policy` | 🟡 LOW — Cross-origin data access | `same-origin` |
| `Cross-Origin-Embedder-Policy` | 🟡 LOW — Required for SharedArrayBuffer | `require-corp` |

### Recommended CSP

Start with **report-only mode** to identify violations before enforcing:

```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://*.base44.com https://api.openai.com https://res.cloudinary.com; img-src 'self' data: https://res.cloudinary.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-ancestors 'none'; report-uri /api/csp-report"
}
```

After 1–2 weeks of monitoring, switch to `Content-Security-Policy` (enforcing).

### Header Implementation

```json
// Add to vercel.json headers array:
{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
},
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; ..."
},
{
  "key": "Cross-Origin-Resource-Policy",
  "value": "same-origin"
},
{
  "key": "Cross-Origin-Opener-Policy",
  "value": "same-origin"
}
```

---

## 3. Authentication & Authorization

### Authentication Architecture

- **Provider:** Base44 SDK managed authentication
- **Token type:** JWT (Bearer token)
- **Storage:** Base44 SDK manages token in `localStorage`
- **Refresh:** Handled transparently by Base44 SDK
- **Logout:** Clears token via `User.logout()`

### Authorization Model

- **RBAC:** Role-based access control via `TeamMembership.role` field
  - Roles: `member`, `lead`, `admin`
- **Page-level guards:** Pages check `useAuth().isAuthenticated` before rendering
- **Function-level guards:** Base44 serverless functions enforce role checks
- **RBAC testing:** `testRBACEnforcement.ts` function validates rules; `RBACTestChecklist` page

### Known Auth Gaps

| Gap | Risk | Status |
|---|---|---|
| No SSO / SAML / OIDC | Medium — enterprise customers expect SSO | Planned (see `docs/security/SSO_IMPLEMENTATION.md`) |
| JWT stored in localStorage | Low-Medium — XSS can steal token if CSP not in place | Mitigated by adding CSP |
| No MFA | Medium — single factor auth only | Not currently planned |
| Token expiry handling | Low — SDK handles it | Covered by Base44 SDK |

---

## 4. OWASP Top 10 Mapping

| OWASP Category | Status | Notes |
|---|---|---|
| **A01: Broken Access Control** | ⚠️ Partial | RBAC exists; needs SSO and server-side enforcement audit |
| **A02: Cryptographic Failures** | ✅ Managed | HTTPS enforced by Vercel; tokens handled by Base44 |
| **A03: Injection** | ✅ Good | Zod validation on all forms; Base44 SDK parameterizes queries |
| **A04: Insecure Design** | ⚠️ Partial | Auth design is sound; some RBAC gaps remain |
| **A05: Security Misconfiguration** | 🔴 Issue | Missing CSP and HSTS headers; 9 npm vulnerabilities |
| **A06: Vulnerable Components** | 🔴 Issue | 6 high-severity npm vulnerabilities (see Section 1) |
| **A07: Auth Failures** | ⚠️ Partial | No SSO, no MFA; localStorage token storage |
| **A08: Software Integrity Failures** | ✅ Good | `npm ci` in build; lockfile committed |
| **A09: Security Logging** | ✅ Good | AuditLog entity; `logError.ts` function |
| **A10: SSRF** | ✅ Low Risk | Serverless functions are the attack surface; Base44 manages |

---

## 5. Secrets Management

### Environment Variable Classification

| Variable | Classification | Location | Risk |
|---|---|---|---|
| `VITE_BASE44_APP_ID` | Public | Frontend bundle | No risk — designed to be public |
| `VITE_BASE44_BACKEND_URL` | Public | Frontend bundle | No risk — designed to be public |
| `OPENAI_API_KEY` | Secret | Backend functions only | High if exposed — rate/cost abuse |
| `ANTHROPIC_API_KEY` | Secret | Backend functions only | High if exposed |
| `STRIPE_SECRET_KEY` | Secret | Backend functions only | Critical if exposed — financial fraud |
| `TWILIO_AUTH_TOKEN` | Secret | Backend functions only | High if exposed — SMS abuse |

### Rules for Secrets

1. **Never** use `VITE_` prefix for secret values — they are bundled into the public JS
2. **Never** commit `.env` or `.env.local` to version control (`.gitignore` enforces this)
3. All backend secrets are stored in Base44's encrypted function environment
4. Rotate all secrets every 90 days minimum; immediately rotate any potentially exposed secret

### Vercel Secret Management

Frontend environment variables are stored in Vercel project settings as encrypted secrets:
- Dashboard → Project → Settings → Environment Variables
- Linked to Vercel secret store: `@vite_base44_app_id`, `@vite_base44_backend_url`

---

## 6. Input Validation & Sanitization

### Form Validation

All user-facing forms use **Zod schemas** validated by React Hook Form:

```js
const schema = z.object({
  email: z.string().email('Invalid email'),
  message: z.string().min(1).max(500),
  points: z.number().int().positive().max(10000),
});
```

### XSS Prevention

| Area | Mechanism | Status |
|---|---|---|
| React JSX rendering | React auto-escapes by default | ✅ Protected |
| Rich text (Quill editor) | `react-quill-new` + manual sanitization needed | ⚠️ Review required |
| PDF generation (jspdf) | No sanitization in current version | 🔴 Vulnerable (upgrade) |
| DOMPurify | Used for HTML sanitization | ⚠️ Outdated version |
| `dangerouslySetInnerHTML` | Audit usages for unsafe patterns | 🔴 Requires audit |

```bash
# Find all dangerouslySetInnerHTML usages
grep -r "dangerouslySetInnerHTML" src/ --include="*.jsx" --include="*.js"
```

### Content Moderation

The `ContentModerationAdmin` page and `moderateProposedEvents.ts` function provide admin-level content review for user-generated content.

---

## 7. Recommended Remediations

Prioritized by WSJF (see `docs/ROADMAP.md` for full scoring):

### Immediate (WSJF 10)

```bash
# 1. Upgrade vulnerable packages
npm install jspdf@latest axios@latest dompurify@latest
npm audit fix

# 2. Verify no breaking changes
npm run build && npm test
```

### This Sprint (WSJF 7)

```json
// Add to vercel.json — start with report-only CSP
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.base44.com; img-src 'self' data: https://res.cloudinary.com; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"
}
```

### This Quarter (WSJF 4)

```json
// Enforce CSP (after monitoring report-only for 2+ weeks)
{ "key": "Content-Security-Policy", "value": "..." },
// Add HSTS
{ "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
// Add CORP/COOP
{ "key": "Cross-Origin-Resource-Policy", "value": "same-origin" },
{ "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
```

### Backlog

- Implement SSO/SAML (see `docs/security/SSO_IMPLEMENTATION.md`)
- Complete GDPR compliance audit (see `docs/security/GDPR_CHECKLIST.md`)
- Add Sentry or similar for runtime error and security monitoring
- Audit all `dangerouslySetInnerHTML` usages
- Implement rate limiting on all public-facing functions
