# Security Documentation

**Status**: PARTIAL - Requires Human Review  
**Last Updated**: 2025-12-30  
**Classification**: Internal - Engineering Team  

---

## 1. Threat Model

### 1.1 Assets
- **User Data**: Employee profiles, recognition posts, survey responses, learning progress
- **Authentication Tokens**: JWT sessions, OAuth tokens (Google, Slack, Teams integrations)
- **API Keys**: OpenAI, Anthropic, Stripe, Cloudinary, third-party services
- **Business Logic**: Gamification rules, points calculations, AI recommendation algorithms

### 1.2 Threat Actors
- **External Attackers**: Unauthorized access attempts, data exfiltration
- **Malicious Insiders**: Employees with legitimate access attempting privilege escalation
- **AI Prompt Injection**: Manipulated user inputs designed to extract secrets or bypass rules
- **Supply Chain**: Compromised npm packages or external integrations

### 1.3 Attack Vectors

#### High Priority
- **Prompt Injection**: User-controlled inputs (recognition messages, survey responses) fed to LLMs
  - Status: UNKNOWN - Mitigation strategy not yet documented
  - Action Required: Document input sanitization and prompt engineering safeguards

- **Session Hijacking**: JWT token theft or replay attacks
  - Status: PARTIAL - 8-hour timeout configured (see `components/hooks/useSessionTimeout.jsx`)
  - Action Required: Verify token refresh mechanism and revocation strategy

- **Data Exfiltration via AI**: LLM functions accidentally leaking PII or secrets
  - Status: UNKNOWN - No documented review process for AI function outputs
  - Action Required: Audit all functions in `functions/*AI*.js` for data leakage risks

#### Medium Priority
- **Cross-Site Scripting (XSS)**: Markdown in recognition posts, user bios
  - Status: UNKNOWN - Verify React's built-in escaping and `react-markdown` sanitization
  - Action Required: Review `components/social/RecognitionFeed.jsx` for XSS vectors

- **Insecure Direct Object References (IDOR)**: User accessing another user's profile or points
  - Status: PARTIAL - Entity-level permissions configured (see `entities/*.json`)
  - Action Required: Audit all `base44.entities.*` queries for RBAC enforcement

---

## 2. Authentication & Authorization

### 2.1 Authentication Flow
- **Provider**: Base44 platform (JWT-based)
- **Session Duration**: 8 hours (enforced by `useSessionTimeout` hook)
- **SSO Support**: 
  - Status: UNKNOWN - Azure AD, Google Workspace, Okta integration not verified
  - Action Required: Document SSO configuration and test SAML/OIDC flows

### 2.2 Role-Based Access Control (RBAC)

#### Roles
1. **Admin**: Full access (user management, gamification config, analytics)
2. **Facilitator**: Event creation, team management, recognition moderation
3. **Participant**: Self-service (own data, public content, team channels)

#### Permission Enforcement
- **Frontend**: `useUserData` hook checks `user.role` and `user.user_type`
- **Backend**: Functions use `base44.auth.me()` and role checks
- **Database**: Entity-level permissions in JSON schemas (see `entities/UserProfile.json`)

**Critical Gap**: 
- Status: UNKNOWN - Comprehensive RBAC audit not completed
- Action Required: Test privilege escalation scenarios (Participant → Admin)

---

## 3. Secrets Management

### 3.1 Current Secrets (Configured)
See `<existing_secrets>` section in platform context:
- OpenAI, Anthropic, Stripe, Google, Cloudinary, etc.

### 3.2 Storage
- **Method**: Base44 platform environment variables
- **Access**: Backend functions only (`Deno.env.get()`)
- **Rotation Policy**: 
  - Status: UNKNOWN - No documented rotation schedule
  - Action Required: Establish quarterly rotation for all API keys

### 3.3 Secrets in Code
- **Frontend**: NO secrets allowed (checked in CI via grep)
- **Backend**: Secrets accessed via environment variables only
- **Git History**: 
  - Status: UNKNOWN - Historical scans for committed secrets not performed
  - Action Required: Run `git-secrets` or `truffleHog` on full history

---

## 4. Prompt Injection Mitigation

### 4.1 Risk Areas
All functions in `functions/` that use `base44.integrations.Core.InvokeLLM`:
- `aiGamificationRuleOptimizer.js`
- `aiBuddyMatcher.js`
- `aiContentGenerator.js`
- `learningPathAI.js`
- `gamificationAI.js`
- `buddyMatchingAI.js`
- `newEmployeeOnboardingAI.js`

### 4.2 Current Mitigations
- **JSON Schema Constraints**: All LLM calls specify `response_json_schema` to constrain outputs
- **Input Validation**: 
  - Status: UNKNOWN - No centralized validation library verified
  - Action Required: Audit user-controlled inputs to LLM functions

### 4.3 Recommended Safeguards (NOT YET IMPLEMENTED)
1. **Prompt Templating**: Use parameterized prompts with clear role boundaries
2. **Output Sanitization**: Strip markdown/HTML from LLM responses before rendering
3. **Rate Limiting**: Throttle AI function calls per user (prevent abuse)
4. **Monitoring**: Log all LLM prompts and responses for anomaly detection

**Status**: UNKNOWN - Implementation status unverified  
**Action Required**: DevSecOps review and implementation plan

---

## 5. Non-Human Identities (NHI)

### 5.1 Service Accounts
- **Base44 Service Role**: Used in backend functions via `base44.asServiceRole`
  - Scope: Full database access (admin-level operations)
  - Rotation: Managed by Base44 platform
  - Status: UNKNOWN - Audit trail for service role usage not documented

### 5.2 AI Agents
- **Documentation Authority Agent**: Limited write access to `docs/**`, `ADR/**`
  - Constraints: See `docs/AGENTS_DOCUMENTATION_AUTHORITY.md`
  - Kill-Switch: `DOC_AUTOMATION_ENABLED=false`

**Action Required**: Document all NHI accounts and their access scopes

---

## 6. Data Egress Controls

### 6.1 External Integrations
- **Slack/Teams Notifications**: Webhook URLs (user-configured)
  - Risk: Data exfiltration via webhook payload manipulation
  - Status: UNKNOWN - Payload sanitization not verified

- **Google Calendar Sync**: OAuth tokens stored per user
  - Risk: Over-permissioned scopes
  - Status: PARTIAL - Scopes documented in `components/events/GoogleCalendarActions.tsx`

### 6.2 AI Provider Data Sharing
- **OpenAI/Anthropic**: User data sent to external LLM APIs
  - Risk: PII leakage, model training on proprietary data
  - Status: UNKNOWN - Data Processing Agreement (DPA) not referenced
  - Action Required: Verify DPA with AI providers, document data retention policies

---

## 7. Patch Management

### 7.1 Dependency Updates
- **Frequency**: 
  - Status: UNKNOWN - No documented schedule
  - Action Required: Establish monthly dependency audit cadence

- **Vulnerability Scanning**: 
  - Status: UNKNOWN - GitHub Dependabot not confirmed active
  - Action Required: Enable Dependabot alerts and security updates

### 7.2 Critical Patches
- **SLA**: 
  - Status: UNKNOWN - No documented response time for critical CVEs
  - Action Required: Define 24-hour SLA for CVSS 9.0+ vulnerabilities

---

## 8. Incident Response

### 8.1 Incident Classification

| Severity | Definition | Examples | Response Time |
|----------|-----------|----------|---------------|
| **P0 - Critical** | Data breach, authentication bypass | Exposed API keys, SQL injection | Immediate (1 hour) |
| **P1 - High** | Service outage, privilege escalation | Function crash, RBAC bypass | 4 hours |
| **P2 - Medium** | Data integrity issue, performance degradation | Incorrect points calculation | 24 hours |
| **P3 - Low** | Minor bug, cosmetic issue | UI glitch | 1 week |

**Status**: UNKNOWN - Incident response playbook not documented  
**Action Required**: Create detailed runbooks for each severity level

### 8.2 Emergency Contacts
- **Security Lead**: [REDACTED - Add contact info]
- **Platform Owner**: [REDACTED - Add contact info]
- **On-Call Engineer**: [REDACTED - Add PagerDuty/OpsGenie integration]

---

## 9. Kill-Switch Procedures

### 9.1 Documentation Automation
- **Trigger**: Set `DOC_AUTOMATION_ENABLED=false` in GitHub repo settings
- **Effect**: Disables auto-commit of `llms-full.txt` in CI

### 9.2 AI Functions
- **Trigger**: 
  - Status: UNKNOWN - No documented kill-switch for AI functions
  - Action Required: Implement feature flag to disable all `*AI*.js` functions

### 9.3 Full System Shutdown
- **Trigger**: 
  - Status: UNKNOWN - Emergency shutdown procedure not documented
  - Action Required: Document steps to gracefully shut down Base44 app

---

## 10. Compliance & Auditing

### 10.1 Compliance Status
- **SOC2**: 
  - Status: UNKNOWN - No audit completed
  - Action Required: Engage third-party auditor if required by contracts

- **GDPR**: 
  - Status: UNKNOWN - Data residency and user consent flows not verified
  - Action Required: Document GDPR compliance measures if EU users present

### 10.2 Audit Logs
- **Location**: `entities/AuditLog.json`
- **Retention**: 
  - Status: UNKNOWN - Retention policy not defined
  - Action Required: Define 1-year minimum retention per best practices

---

## 11. Known Gaps (Requires Immediate Attention)

1. **Prompt Injection Safeguards**: No documented mitigation strategy
2. **Secrets Rotation**: No quarterly rotation schedule
3. **Incident Response Playbook**: Missing detailed procedures
4. **AI Kill-Switch**: No feature flag to disable AI functions
5. **RBAC Audit**: Privilege escalation scenarios not tested
6. **DPA with AI Providers**: Data Processing Agreements not verified

---

**Provenance**:
- Source: code + config (partial verification)
- Locator: `components/hooks/useSessionTimeout.jsx`, `entities/*.json`, `functions/*AI*.js`
- Confidence: MEDIUM (many UNKNOWN sections require human verification)
- Last Verified: 2025-12-30
- Verified By: DAA (automated scan) + Human Review Required