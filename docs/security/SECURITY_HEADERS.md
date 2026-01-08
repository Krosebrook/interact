# Security Headers Configuration

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Implementation  

---

## Overview

This document provides recommended security header configurations for the Interact platform. Security headers are HTTP response headers that instruct browsers on how to behave when handling the site's content, providing an additional layer of defense against common web vulnerabilities.

**Implementation Note:** These headers should be configured at the infrastructure level (Base44 SDK, CDN, or web server) rather than in the application code.

---

## Recommended Security Headers

### 1. Content-Security-Policy (CSP)

**Purpose:** Prevents Cross-Site Scripting (XSS) and other code injection attacks by controlling which resources can be loaded.

**Recommended Configuration:**

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.base44.io https://unpkg.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  media-src 'self' https:;
  object-src 'none';
  frame-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  connect-src 'self' https://api.base44.io https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com wss://api.base44.io;
  upgrade-insecure-requests;
  block-all-mixed-content;
```

**Breakdown:**
- `default-src 'self'`: Only load resources from same origin by default
- `script-src`: Allow scripts from self and trusted CDNs
  - `'unsafe-inline'`: Required for React inline event handlers (consider removing in future)
  - `'unsafe-eval'`: Required for some dependencies (evaluate if removable)
- `style-src`: Allow styles from self and Google Fonts
- `font-src`: Allow fonts from self, Google Fonts, and data URIs
- `img-src`: Allow images from any HTTPS source (for user uploads, external images)
- `connect-src`: Allow API connections to Base44 and AI services
- `frame-ancestors 'none'`: Prevent clickjacking
- `upgrade-insecure-requests`: Automatically upgrade HTTP to HTTPS

**Report-Only Mode (for testing):**
```http
Content-Security-Policy-Report-Only: [same directives]; report-uri https://your-reporting-endpoint.com/csp-report
```

**Action Items:**
- [ ] Test CSP in report-only mode
- [ ] Review CSP violations in browser console
- [ ] Adjust directives as needed
- [ ] Enable enforcement mode
- [ ] Setup CSP violation reporting endpoint

### 2. X-Content-Type-Options

**Purpose:** Prevents MIME type sniffing, which can lead to security vulnerabilities.

```http
X-Content-Type-Options: nosniff
```

**Impact:** Forces browsers to respect the `Content-Type` header, preventing execution of scripts disguised as other file types.

**Implementation:** Apply to all responses.

### 3. X-Frame-Options

**Purpose:** Prevents clickjacking attacks by controlling whether the site can be embedded in iframes.

```http
X-Frame-Options: DENY
```

**Alternatives:**
- `DENY`: Cannot be framed at all (recommended)
- `SAMEORIGIN`: Can only be framed by same origin
- Consider using CSP `frame-ancestors` instead (more flexible)

**Implementation:** Apply to all HTML responses.

### 4. Strict-Transport-Security (HSTS)

**Purpose:** Forces browsers to only connect via HTTPS, preventing protocol downgrade attacks.

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Breakdown:**
- `max-age=31536000`: Enforce HTTPS for 1 year (365 days)
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser HSTS preload list

**Caution:**
- Only enable after confirming HTTPS is working on all subdomains
- `preload` requires submission to https://hstspreload.org/
- Very difficult to undo once preloaded

**Implementation:** Apply to all HTTPS responses.

### 5. Referrer-Policy

**Purpose:** Controls how much referrer information is sent with requests.

```http
Referrer-Policy: strict-origin-when-cross-origin
```

**Options:**
- `no-referrer`: Never send referrer
- `no-referrer-when-downgrade`: Don't send on HTTPS → HTTP
- `origin`: Only send origin, not full URL
- `strict-origin`: Send origin only on same-protocol
- `strict-origin-when-cross-origin`: Full URL for same-origin, origin only for cross-origin (recommended)

**Implementation:** Apply to all responses.

### 6. Permissions-Policy

**Purpose:** Controls which browser features and APIs can be used (formerly Feature-Policy).

```http
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
```

**Breakdown:**
- `()`: Disables feature for all origins
- `(self)`: Enables for same origin only
- `(self "https://example.com")`: Enables for specific origins

**Customize based on needs:**
```http
Permissions-Policy: 
  geolocation=(self),
  microphone=(),
  camera=(self "https://meet.krosebrook.com"),
  payment=(),
  usb=(),
  interest-cohort=()
```

**Implementation:** Apply to all HTML responses.

### 7. X-XSS-Protection (Legacy)

**Purpose:** Enables browser XSS filtering (legacy header, CSP is preferred).

```http
X-XSS-Protection: 1; mode=block
```

**Status:** Deprecated in modern browsers, but still used by older browsers.

**Options:**
- `0`: Disables filter
- `1`: Enables filter
- `1; mode=block`: Enables filter and blocks page if attack detected

**Note:** Modern CSP replaces this. Include for legacy browser support only.

### 8. Cross-Origin-Embedder-Policy (COEP)

**Purpose:** Prevents a document from loading cross-origin resources that don't grant permission.

```http
Cross-Origin-Embedder-Policy: require-corp
```

**Status:** Optional, may break some integrations. Test thoroughly.

### 9. Cross-Origin-Opener-Policy (COOP)

**Purpose:** Allows you to ensure a top-level document does not share a browsing context group with cross-origin documents.

```http
Cross-Origin-Opener-Policy: same-origin
```

**Status:** Optional, evaluate if needed for isolation.

### 10. Cross-Origin-Resource-Policy (CORP)

**Purpose:** Controls who can load the resource.

```http
Cross-Origin-Resource-Policy: same-origin
```

**Options:**
- `same-origin`: Only same origin can load
- `same-site`: Same site can load
- `cross-origin`: Anyone can load

**Apply selectively:** Use `cross-origin` for public assets, `same-origin` for sensitive resources.

---

## Implementation Methods

### Method 1: Base44 SDK Configuration

**If Base44 supports custom headers:**

```javascript
// In Base44 configuration
export default {
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': '[CSP directives]'
  }
}
```

**Action:** Consult Base44 documentation or support.

### Method 2: CDN/Reverse Proxy (Cloudflare, etc.)

**Cloudflare Workers example:**

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)
  
  // Add security headers
  newHeaders.set('X-Content-Type-Options', 'nosniff')
  newHeaders.set('X-Frame-Options', 'DENY')
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  newHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  newHeaders.set('Content-Security-Policy', '[CSP directives]')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

### Method 3: Vite Preview Server (Development Only)

**Note:** This only affects local preview, not production.

```javascript
// vite.config.js
export default defineConfig({
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
})
```

### Method 4: HTML Meta Tags (Limited Support)

**Some headers can be set via meta tags (not recommended):**

```html
<!-- In index.html - Limited effectiveness -->
<meta http-equiv="Content-Security-Policy" content="[CSP directives]">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

**Note:** HTTP headers are more reliable than meta tags. Use HTTP headers when possible.

---

## Testing Security Headers

### Online Tools

1. **SecurityHeaders.com**
   - URL: https://securityheaders.com/
   - Grades your headers A-F
   - Provides recommendations

2. **Mozilla Observatory**
   - URL: https://observatory.mozilla.org/
   - Comprehensive security scan
   - Includes headers, TLS, and more

3. **OWASP Secure Headers Project**
   - URL: https://owasp.org/www-project-secure-headers/
   - Header documentation and testing

### Browser DevTools

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click any request
4. View "Headers" section
5. Check "Response Headers"

**Firefox:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click any request
4. View "Response Headers"

### Automated Testing

**Using curl:**
```bash
curl -I https://your-domain.com

# Check specific header
curl -I https://your-domain.com | grep -i "content-security-policy"
```

**Using Node.js:**
```javascript
const https = require('https');

https.get('https://your-domain.com', (res) => {
  console.log('Security Headers:');
  console.log('CSP:', res.headers['content-security-policy']);
  console.log('X-Frame-Options:', res.headers['x-frame-options']);
  console.log('HSTS:', res.headers['strict-transport-security']);
});
```

---

## CSP Violation Reporting

### Setup Reporting Endpoint

**Option 1: Use a service**
- Report URI: https://report-uri.com/
- Sentry: Built-in CSP reporting
- Custom endpoint

**Option 2: Self-hosted**
```javascript
// Example endpoint to receive CSP reports
app.post('/csp-report', (req, res) => {
  console.log('CSP Violation:', req.body);
  // Store in database or send to logging service
  res.status(204).send();
});
```

**CSP with reporting:**
```http
Content-Security-Policy: [directives]; report-uri https://your-domain.com/csp-report
```

**Modern alternative (report-to):**
```http
Report-To: {"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"https://your-domain.com/csp-report"}]}
Content-Security-Policy: [directives]; report-to csp-endpoint
```

---

## Migration Strategy

### Phase 1: Assessment (Week 1)
1. Review current headers (none currently)
2. Test headers in staging environment
3. Identify compatibility issues
4. Document required changes

### Phase 2: Report-Only (Week 2-3)
1. Deploy CSP in report-only mode
2. Monitor violation reports
3. Adjust directives as needed
4. Test on multiple browsers

### Phase 3: Enforcement (Week 4)
1. Enable all headers in production
2. Monitor for issues
3. Quick rollback plan ready
4. User communication if needed

### Phase 4: Hardening (Ongoing)
1. Remove `unsafe-inline` and `unsafe-eval` if possible
2. Implement nonces or hashes for inline scripts
3. Regular security header audits
4. Update as standards evolve

---

## Common Issues & Solutions

### Issue 1: CSP Blocks Inline Scripts

**Problem:** React uses inline event handlers, CSP blocks them.

**Solution:**
- Use `'unsafe-inline'` temporarily
- Implement nonce-based CSP (advanced)
- Refactor to addEventListener instead of inline handlers

### Issue 2: CSP Blocks Third-Party Resources

**Problem:** External images/scripts blocked by CSP.

**Solution:**
- Add specific domains to CSP whitelist
- Use img-src with wildcard carefully: `img-src 'self' https: data:`
- Review which external resources are truly necessary

### Issue 3: HSTS Breaks Subdomains

**Problem:** Some subdomains don't have HTTPS, HSTS breaks them.

**Solution:**
- Enable HTTPS on all subdomains before enabling HSTS
- Use `includeSubDomains` only when ready
- Don't use `preload` until confirmed working everywhere

### Issue 4: X-Frame-Options Conflicts with Embeds

**Problem:** Need to embed in partner sites, X-Frame-Options blocks.

**Solution:**
- Use CSP `frame-ancestors` instead (allows specific origins)
- Set to `SAMEORIGIN` if only need same-site embeds
- Create specific pages that allow framing

---

## Compliance & Standards

**OWASP Top 10:**
- A03:2021 – Injection (CSP helps prevent XSS)
- A05:2021 – Security Misconfiguration (headers are part of secure config)

**PCI DSS:**
- Requirement 6.5.7: XSS protection
- Security headers contribute to compliance

**GDPR:**
- Security headers are part of "appropriate technical measures"

---

## Resources

**Documentation:**
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
- OWASP Secure Headers: https://owasp.org/www-project-secure-headers/
- CSP Reference: https://content-security-policy.com/

**Tools:**
- Security Headers: https://securityheaders.com/
- CSP Evaluator: https://csp-evaluator.withgoogle.com/
- Mozilla Observatory: https://observatory.mozilla.org/

**Generators:**
- CSP Builder: https://report-uri.com/home/generate
- Header Generator: https://www.permissionspolicy.com/

---

## Checklist

**Implementation Checklist:**
- [ ] Review Base44 SDK header capabilities
- [ ] Configure CSP in report-only mode
- [ ] Test headers in staging environment
- [ ] Monitor CSP violation reports
- [ ] Adjust CSP directives based on reports
- [ ] Enable enforcement mode for CSP
- [ ] Add all recommended headers
- [ ] Test on multiple browsers
- [ ] Verify with securityheaders.com
- [ ] Document in deployment process
- [ ] Setup monitoring for header presence
- [ ] Regular audits (quarterly)

---

**Document Owner:** Engineering Lead  
**Review Frequency:** Quarterly or when standards change  
**Next Review:** April 7, 2026

**Approval:**
- [ ] Engineering Lead
- [ ] Security Team
- [ ] DevOps Team

**Version History:**
- 2026-01-07: v1.0 - Initial documentation
