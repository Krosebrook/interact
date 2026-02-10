# SSO Authentication Architecture

**Project:** Interact Platform  
**Date:** February 9, 2026  
**Status:** Design Phase  

---

## Architecture Overview

This document provides visual and technical architecture for Enterprise Single Sign-On (SSO) implementation supporting Azure AD, Okta, and generic SAML 2.0 providers.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTPS
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    Interact Frontend (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ Login Page │  │ SSO Button │  │ Callback   │                │
│  │            │  │            │  │ Handler    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ API Calls
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│              Interact Backend (Serverless Functions)             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Authentication Orchestrator                  │  │
│  │  - Route to appropriate provider                          │  │
│  │  - Handle callbacks                                       │  │
│  │  - Manage sessions                                        │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │                                                 │
│       ┌────────┴────────┬─────────────┬────────────┐           │
│       │                 │             │            │           │
│  ┌────▼─────┐  ┌───────▼──────┐  ┌───▼────────┐  │           │
│  │ Azure AD │  │    Okta      │  │   SAML     │  │           │
│  │ Provider │  │   Provider   │  │  Provider  │  │           │
│  └────┬─────┘  └───────┬──────┘  └───┬────────┘  │           │
│       │                │             │            │           │
│  ┌────▼────────────────▼─────────────▼────────┐  │           │
│  │         User Provisioning Service          │  │           │
│  │  - JIT user creation                       │  │           │
│  │  - Role mapping                            │  │           │
│  │  - Profile updates                         │  │           │
│  └────────────────┬───────────────────────────┘  │           │
│                   │                               │           │
│  ┌────────────────▼───────────────────────────┐  │           │
│  │         Session Management Service         │  │           │
│  │  - Create sessions                         │  │           │
│  │  - Validate tokens                         │  │           │
│  │  - Handle logout                           │  │           │
│  └────────────────────────────────────────────┘  │           │
│                                                   │           │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                     Identity Providers (IdPs)                    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Azure AD /  │  │     Okta     │  │  Generic     │          │
│  │   Entra ID   │  │              │  │  SAML 2.0    │          │
│  │              │  │              │  │  Provider    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow - Azure AD (OIDC)

```
┌────────┐                ┌─────────┐                ┌───────────┐
│ User   │                │ Interact│                │ Azure AD  │
└───┬────┘                └────┬────┘                └─────┬─────┘
    │                          │                           │
    │  1. Click "SSO Login"    │                           │
    ├─────────────────────────>│                           │
    │                          │                           │
    │  2. Redirect to Azure AD │                           │
    │<─────────────────────────┤                           │
    │   with auth request      │                           │
    │                          │                           │
    │  3. User authenticates   │                           │
    ├───────────────────────────────────────────────────>│
    │   (username + password   │                           │
    │    + MFA if required)    │                           │
    │                          │                           │
    │  4. Authorization code   │                           │
    │<──────────────────────────────────────────────────────┤
    │   redirect to callback   │                           │
    │                          │                           │
    │  5. Send code to backend │                           │
    ├─────────────────────────>│                           │
    │                          │                           │
    │                          │  6. Exchange code         │
    │                          │     for token             │
    │                          ├──────────────────────────>│
    │                          │                           │
    │                          │  7. Access token +        │
    │                          │     ID token              │
    │                          │<──────────────────────────┤
    │                          │                           │
    │                          │  8. Get user info         │
    │                          ├──────────────────────────>│
    │                          │                           │
    │                          │  9. User profile          │
    │                          │<──────────────────────────┤
    │                          │                           │
    │                          │  10. Provision user       │
    │                          │      (if not exists)      │
    │                          │  11. Map roles            │
    │                          │  12. Create session       │
    │                          │                           │
    │  13. Session token +     │                           │
    │      redirect to app     │                           │
    │<─────────────────────────┤                           │
    │                          │                           │
    │  14. Access dashboard    │                           │
    ├─────────────────────────>│                           │
    │                          │                           │
```

---

## Authentication Flow - SAML 2.0 (Okta)

```
┌────────┐                ┌─────────┐                ┌───────────┐
│ User   │                │ Interact│                │   Okta    │
│        │                │   (SP)  │                │   (IdP)   │
└───┬────┘                └────┬────┘                └─────┬─────┘
    │                          │                           │
    │  1. Click "SSO Login"    │                           │
    ├─────────────────────────>│                           │
    │                          │                           │
    │  2. Generate SAML        │                           │
    │     AuthnRequest         │                           │
    │                          │                           │
    │  3. Redirect to IdP      │                           │
    │<─────────────────────────┤                           │
    │   with SAML request      │                           │
    │                          │                           │
    │  4. User authenticates   │                           │
    ├───────────────────────────────────────────────────>│
    │   at IdP                 │                           │
    │                          │                           │
    │  5. SAML Response        │                           │
    │<──────────────────────────────────────────────────────┤
    │   POST to ACS URL        │                           │
    │                          │                           │
    │  6. POST SAML Response   │                           │
    ├─────────────────────────>│                           │
    │                          │                           │
    │                          │  7. Validate signature    │
    │                          │  8. Parse assertion       │
    │                          │  9. Extract attributes    │
    │                          │  10. Provision user       │
    │                          │  11. Map roles            │
    │                          │  12. Create session       │
    │                          │                           │
    │  13. Session token +     │                           │
    │      redirect to app     │                           │
    │<─────────────────────────┤                           │
    │                          │                           │
```

---

## Component Architecture

### 1. Authentication Providers (Adapters)

```typescript
/**
 * Pluggable provider architecture allows adding new IdPs easily
 */

interface IAuthProvider {
  // Provider identification
  getName(): string;
  
  // Initiate authentication flow
  initiate(config: SSOConfig, redirectUri: string): Promise<AuthInitResult>;
  
  // Handle callback from IdP
  callback(params: CallbackParams, config: SSOConfig): Promise<AuthResult>;
  
  // Single logout
  logout(session: Session, config: SSOConfig): Promise<void>;
  
  // Get metadata (for SAML)
  getMetadata?(config: SSOConfig): Promise<string>;
}

// Azure AD implementation (OIDC)
class AzureADProvider implements IAuthProvider {
  getName() { return 'azure_ad'; }
  
  async initiate(config: SSOConfig, redirectUri: string) {
    const authUrl = `${config.oauth.authorization_endpoint}?` +
      `client_id=${config.oauth.client_id}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${config.oauth.scope}&` +
      `state=${generateState()}`;
    
    return { redirect_url: authUrl };
  }
  
  async callback(params: CallbackParams, config: SSOConfig) {
    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForToken(params.code, config);
    
    // Get user info from Microsoft Graph
    const userInfo = await fetchUserInfo(tokens.access_token);
    
    return {
      email: userInfo.mail,
      name: userInfo.displayName,
      groups: userInfo.groups || [],
      idp_user_id: userInfo.id,
      tokens
    };
  }
}

// Okta implementation (SAML)
class OktaProvider implements IAuthProvider {
  getName() { return 'okta'; }
  
  async initiate(config: SSOConfig, redirectUri: string) {
    const samlRequest = buildSAMLRequest(config, redirectUri);
    const encoded = encodeBase64(deflate(samlRequest));
    const ssoUrl = `${config.saml.idp_sso_url}?SAMLRequest=${encoded}`;
    
    return { redirect_url: ssoUrl };
  }
  
  async callback(params: CallbackParams, config: SSOConfig) {
    // Parse and validate SAML response
    const assertion = await validateSAMLResponse(
      params.SAMLResponse,
      config.saml.idp_certificate
    );
    
    return {
      email: assertion.attributes.email,
      name: assertion.attributes.displayName,
      groups: assertion.attributes.groups || [],
      idp_user_id: assertion.nameID
    };
  }
}
```

### 2. User Provisioning Service

```typescript
/**
 * Just-in-Time (JIT) user provisioning
 * Creates or updates users on successful SSO authentication
 */

class UserProvisioningService {
  async provisionUser(
    authResult: AuthResult,
    config: SSOConfig
  ): Promise<User> {
    const { email, name, groups, idp_user_id } = authResult;
    
    // Check if user exists
    let user = await this.findUserByEmail(email);
    
    if (!user && config.provisioning.auto_create_users) {
      // Create new user
      user = await this.createUser({
        email,
        name,
        role: config.provisioning.default_role,
        organization_id: config.organization_id,
        idp_user_id,
        auth_provider: config.provider,
        created_via: 'sso'
      });
    } else if (user && config.provisioning.update_user_on_login) {
      // Update existing user
      user = await this.updateUser(user.id, {
        name,
        idp_user_id,
        last_login: new Date()
      });
    }
    
    if (!user) {
      throw new Error('User provisioning failed');
    }
    
    // Map roles from IdP groups
    const roles = await this.mapRoles(groups, config.role_mapping);
    if (roles.length > 0) {
      await this.updateUserRoles(user.id, roles);
    }
    
    return user;
  }
  
  private async mapRoles(
    idpGroups: string[],
    roleMapping: RoleMapping[]
  ): Promise<string[]> {
    const roles = new Set<string>();
    
    for (const mapping of roleMapping) {
      if (idpGroups.includes(mapping.idp_group)) {
        roles.add(mapping.app_role);
      }
    }
    
    return Array.from(roles);
  }
}
```

### 3. Session Management

```typescript
/**
 * Manages authenticated sessions with token refresh
 */

class SessionManager {
  async createSession(
    user: User,
    authResult: AuthResult,
    config: SSOConfig
  ): Promise<Session> {
    const session = {
      id: generateId(),
      user_id: user.id,
      user_email: user.email,
      organization_id: config.organization_id,
      provider: config.provider,
      idp_session_id: authResult.idp_session_id,
      access_token: encrypt(authResult.tokens?.access_token),
      refresh_token: encrypt(authResult.tokens?.refresh_token),
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      created_at: new Date(),
      last_activity: new Date()
    };
    
    await this.saveSession(session);
    
    return session;
  }
  
  async validateSession(sessionToken: string): Promise<Session | null> {
    const session = await this.findSession(sessionToken);
    
    if (!session) {
      return null;
    }
    
    // Check if expired
    if (new Date() > session.expires_at) {
      await this.deleteSession(session.id);
      return null;
    }
    
    // Check idle timeout (30 minutes)
    const idleTime = Date.now() - session.last_activity.getTime();
    if (idleTime > 30 * 60 * 1000) {
      await this.deleteSession(session.id);
      return null;
    }
    
    // Update last activity
    await this.updateLastActivity(session.id);
    
    return session;
  }
  
  async refreshSession(session: Session): Promise<Session> {
    // Refresh tokens with IdP if supported
    if (session.refresh_token) {
      const newTokens = await this.refreshTokens(
        decrypt(session.refresh_token),
        session.provider
      );
      
      session.access_token = encrypt(newTokens.access_token);
      session.expires_at = new Date(Date.now() + 8 * 60 * 60 * 1000);
    }
    
    await this.saveSession(session);
    return session;
  }
}
```

---

## Data Flow

### 1. Login Flow

```
User clicks SSO button
    ↓
Frontend calls /api/auth/sso/initiate
    ↓
Backend generates auth request (OIDC or SAML)
    ↓
User redirected to IdP
    ↓
User authenticates at IdP
    ↓
IdP redirects to /api/auth/sso/callback
    ↓
Backend validates response
    ↓
Backend provisions/updates user
    ↓
Backend creates session
    ↓
Frontend receives session token
    ↓
User redirected to dashboard
```

### 2. Authenticated Request Flow

```
Frontend makes API request
    ↓
Request includes session token (cookie or header)
    ↓
Auth middleware validates session
    ↓
Session valid? ──No──> Return 401 Unauthorized
    ↓
   Yes
    ↓
Load user from session
    ↓
Check user permissions
    ↓
Process request
    ↓
Return response
```

### 3. Logout Flow

```
User clicks logout
    ↓
Frontend calls /api/auth/logout
    ↓
Backend deletes session
    ↓
Backend calls IdP logout (if supported)
    ↓
Frontend redirects to login page
```

---

## Security Considerations

### 1. Token Security

- **Storage:** Session tokens stored in httpOnly, secure cookies
- **Encryption:** Access/refresh tokens encrypted at rest (AES-256)
- **Rotation:** Session tokens rotated on privilege change
- **Expiration:** 8-hour session, 30-minute idle timeout

### 2. SAML Validation

- **Signature:** Verify XML signature using IdP certificate
- **Timestamps:** Check NotBefore and NotOnOrAfter
- **Audience:** Validate Audience matches SP entity ID
- **Issuer:** Verify issuer matches IdP entity ID
- **Replay:** Prevent replay attacks using assertion ID cache

### 3. OIDC Security

- **State:** Use cryptographic state parameter (CSRF protection)
- **PKCE:** Implement PKCE for authorization code flow
- **Nonce:** Validate nonce in ID token
- **Token validation:** Verify signature, issuer, audience, expiration

### 4. General Security

- **TLS:** All communication over HTTPS
- **CSP:** Content Security Policy headers
- **CORS:** Strict CORS policy
- **Rate limiting:** Limit auth attempts
- **Audit logging:** Log all auth events
- **Secret management:** Use environment variables, never commit

---

## Configuration Example

### Azure AD Configuration

```json
{
  "provider": "azure_ad",
  "enabled": true,
  "oauth": {
    "client_id": "12345678-1234-1234-1234-123456789012",
    "client_secret": "***encrypted***",
    "tenant_id": "87654321-4321-4321-4321-210987654321",
    "authorization_endpoint": "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
    "token_endpoint": "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
    "userinfo_endpoint": "https://graph.microsoft.com/v1.0/me",
    "scope": "openid profile email User.Read"
  },
  "provisioning": {
    "enabled": true,
    "auto_create_users": true,
    "update_user_on_login": true,
    "default_role": "participant"
  },
  "role_mapping": [
    { "idp_group": "Interact-Admins", "app_role": "admin" },
    { "idp_group": "Interact-Facilitators", "app_role": "facilitator" }
  ]
}
```

### Okta SAML Configuration

```json
{
  "provider": "okta",
  "enabled": true,
  "saml": {
    "idp_entity_id": "http://www.okta.com/exk1234567890",
    "idp_sso_url": "https://example.okta.com/app/exk1234567890/sso/saml",
    "idp_certificate": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
    "sp_entity_id": "https://interact.app/saml/metadata",
    "sp_acs_url": "https://interact.app/saml/acs",
    "name_id_format": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
  },
  "provisioning": {
    "enabled": true,
    "auto_create_users": true,
    "update_user_on_login": true,
    "default_role": "participant",
    "email_attribute": "email",
    "name_attribute": "displayName",
    "groups_attribute": "groups"
  },
  "role_mapping": [
    { "idp_group": "Interact Admins", "app_role": "admin" },
    { "idp_group": "Interact Facilitators", "app_role": "facilitator" }
  ]
}
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Frontend (React SPA)                         │  │
│  │  - Login page                                        │  │
│  │  - SSO buttons                                       │  │
│  │  - Callback handler                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Vercel Serverless Functions                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/auth/sso/initiate                              │  │
│  │  /api/auth/sso/callback                              │  │
│  │  /api/auth/sso/logout                                │  │
│  │  /api/auth/sso/metadata (SAML)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Supabase (PostgreSQL)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                             │  │
│  │  - users                                             │  │
│  │  - sso_configurations                                │  │
│  │  - sso_sessions                                      │  │
│  │  - role_mappings                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

### Metrics to Track

1. **Authentication Success Rate**
   - Successful logins / Total login attempts
   - Target: >98%

2. **Authentication Latency**
   - Time from initiate to callback completion
   - Target: <3 seconds (p95)

3. **Provider Availability**
   - IdP uptime as measured by our system
   - Target: >99.9%

4. **JIT Provisioning Success Rate**
   - Successful user creations / Total attempts
   - Target: >99%

5. **Session Validity**
   - Valid sessions / Total session checks
   - Target: >95%

### Alerts

- Authentication failure rate >5% for 5 minutes
- Authentication latency >5 seconds for 10 requests
- IdP connection errors >10 in 5 minutes
- JIT provisioning failures >5 in 10 minutes

### Logs

All authentication events logged with:
- Timestamp
- User email
- Provider
- Action (initiate, callback, logout)
- Success/failure
- Error details (if failed)
- IP address
- User agent

---

## Testing Strategy

### Unit Tests

- Provider adapters (Azure AD, Okta, SAML)
- User provisioning logic
- Role mapping
- Session management
- Token encryption/decryption

### Integration Tests

- Complete authentication flows
- Error handling
- Timeout scenarios
- Invalid responses from IdP

### E2E Tests

- Login via Azure AD
- Login via Okta
- Role mapping works correctly
- Logout clears session
- Expired session redirects to login

### Manual Testing

- Test with real Azure AD tenant
- Test with real Okta organization
- Verify MFA flows
- Test conditional access policies
- Test group-based role mapping

---

## Rollout Plan

### Phase 1: Development (Weeks 1-2)
- Implement core infrastructure
- Azure AD provider
- User provisioning
- Session management

### Phase 2: Testing (Week 3)
- Unit tests
- Integration tests
- Staging environment testing
- Internal team testing

### Phase 3: Beta (Week 4)
- Enable for 1-2 pilot organizations
- Monitor closely
- Gather feedback
- Fix issues

### Phase 4: GA (Weeks 5-6)
- Enable for all new enterprise customers
- Migration guide for existing customers
- Documentation and support materials
- Production monitoring

---

## Related Documents

- [MIGRATION_STRATEGY.md](./MIGRATION_STRATEGY.md) - Overall migration strategy
- [SSO_IMPLEMENTATION.md](./SSO_IMPLEMENTATION.md) - Detailed implementation guide
- [SECURITY.md](./SECURITY.md) - Security policies and procedures
- [API Documentation](./docs/api/) - API endpoint documentation

---

**Document Owner:** Platform Architecture Team  
**Last Updated:** February 9, 2026  
**Next Review:** March 2026 (after Phase 2 complete)
