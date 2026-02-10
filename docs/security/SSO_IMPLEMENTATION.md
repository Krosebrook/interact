# Enterprise SSO & Identity Management Implementation Guide

**Feature:** Feature 7 - Enterprise SSO & Identity Management  
**Priority:** P0 (Critical)  
**Timeline:** Q1 2026 (3-4 weeks)  
**Status:** In Progress (January 12, 2026)  

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication Flows](#authentication-flows)
4. [Implementation](#implementation)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Business Value

Enterprise SSO enables:
- **Single Sign-On** for employees across all applications
- **Centralized identity management** through existing IdP
- **Automatic user provisioning** (Just-in-Time)
- **Enhanced security** with MFA and conditional access
- **Compliance** with enterprise security policies
- **Reduced password fatigue** and support tickets

### Supported Identity Providers

- **Azure Active Directory (Azure AD)** - Microsoft 365 / Entra ID
- **Okta** - Leading identity platform
- **Google Workspace** - Google SSO
- **Generic SAML 2.0** - Any SAML-compliant IdP
- **OAuth 2.0 / OpenID Connect** - Modern authentication

### Key Features

- ✅ SAML 2.0 authentication
- ✅ OAuth 2.0 / OpenID Connect
- ✅ Just-in-Time (JIT) user provisioning
- ✅ Automatic role mapping
- ✅ Multi-tenant support
- ✅ Session management
- ✅ Admin configuration UI
- ✅ Audit logging

---

## Architecture

### High-Level Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │────────>│   Interact   │────────>│  Identity   │
│             │         │  Application │         │  Provider   │
│             │<────────│              │<────────│  (Azure AD, │
└─────────────┘         └──────────────┘         │   Okta...)  │
                                                  └─────────────┘
```

### Components

1. **SSO Configuration Service** - Manage IdP settings
2. **Authentication Middleware** - Handle SSO flows
3. **User Provisioning Service** - Create/update users (JIT)
4. **Role Mapping Service** - Map IdP groups to app roles
5. **Session Manager** - Manage authenticated sessions
6. **Admin UI** - Configure SSO settings

### Data Model

**SSOConfiguration Entity:**
```javascript
{
  id: 'sso-config-123',
  organization_id: 'org-123',
  provider: 'azure_ad', // azure_ad, okta, google, saml, oidc
  enabled: true,
  
  // SAML 2.0 Configuration
  saml: {
    idp_entity_id: 'https://sts.windows.net/tenant-id/',
    idp_sso_url: 'https://login.microsoftonline.com/tenant-id/saml2',
    idp_certificate: '-----BEGIN CERTIFICATE-----...',
    sp_entity_id: 'https://interact.app/saml/metadata',
    sp_acs_url: 'https://interact.app/saml/acs',
    name_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
  },
  
  // OAuth 2.0 / OIDC Configuration
  oauth: {
    client_id: 'client-id',
    client_secret: 'encrypted-secret',
    authorization_endpoint: 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize',
    token_endpoint: 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token',
    userinfo_endpoint: 'https://graph.microsoft.com/v1.0/me',
    scope: 'openid profile email'
  },
  
  // User Provisioning
  provisioning: {
    enabled: true,
    auto_create_users: true,
    update_user_on_login: true,
    default_role: 'participant',
    email_attribute: 'email',
    name_attribute: 'displayName',
    groups_attribute: 'groups'
  },
  
  // Role Mapping
  role_mapping: [
    { idp_group: 'Interact-Admins', app_role: 'admin' },
    { idp_group: 'Interact-Facilitators', app_role: 'facilitator' },
    { idp_group: 'Interact-TeamLeaders', app_role: 'team_leader' }
  ],
  
  created_at: '2026-01-12T13:00:00Z',
  updated_at: '2026-01-12T13:00:00Z',
  created_by: 'admin@example.com'
}
```

**SSOSession Entity:**
```javascript
{
  id: 'session-123',
  user_email: 'user@example.com',
  organization_id: 'org-123',
  provider: 'azure_ad',
  session_token: 'encrypted-token',
  idp_session_id: 'idp-session-id',
  expires_at: '2026-01-12T21:00:00Z',
  created_at: '2026-01-12T13:00:00Z',
  last_activity: '2026-01-12T13:30:00Z'
}
```

---

## Authentication Flows

### SAML 2.0 Flow (SP-Initiated)

```
1. User clicks "Sign in with SSO"
2. App redirects to IdP with SAML Request
3. User authenticates at IdP
4. IdP redirects back with SAML Response
5. App validates SAML Response
6. App provisions user (if JIT enabled)
7. App creates session
8. User is redirected to dashboard
```

### OAuth 2.0 / OIDC Flow

```
1. User clicks "Sign in with Azure AD"
2. App redirects to authorization endpoint
3. User authenticates at IdP
4. IdP redirects back with authorization code
5. App exchanges code for access token
6. App fetches user info from IdP
7. App provisions user (if JIT enabled)
8. App creates session
9. User is redirected to dashboard
```

### IdP-Initiated SAML Flow

```
1. User clicks app tile in IdP portal
2. IdP sends SAML Response to App
3. App validates SAML Response
4. App provisions user (if JIT enabled)
5. App creates session
6. User lands on dashboard
```

---

## Implementation

### Phase 1: Azure AD Integration (Week 1)

**Backend Functions:**

```javascript
// functions/auth/azure-ad-auth.ts
export async function azureAdAuth({ action, data }) {
  switch (action) {
    case 'initiate':
      return initiateAzureAdLogin(data);
    case 'callback':
      return handleAzureAdCallback(data);
    case 'logout':
      return handleAzureAdLogout(data);
  }
}

async function initiateAzureAdLogin({ organization_id }) {
  const config = await getOrgSSOConfig(organization_id);
  const authUrl = buildAuthorizationUrl(config);
  return { redirect_url: authUrl };
}

async function handleAzureAdCallback({ code, state }) {
  // Exchange code for token
  const tokens = await exchangeCodeForToken(code);
  
  // Get user info
  const userInfo = await getUserInfo(tokens.access_token);
  
  // Provision user (JIT)
  const user = await provisionUser(userInfo);
  
  // Map roles
  const roles = await mapUserRoles(userInfo.groups, config.role_mapping);
  await updateUserRoles(user, roles);
  
  // Create session
  const session = await createSession(user, tokens);
  
  return { session_token: session.token, user };
}
```

**Frontend Components:**

```javascript
// src/components/auth/SSOLoginButton.jsx
export function SSOLoginButton({ provider }) {
  const handleSSOLogin = async () => {
    const orgId = getOrganizationId();
    const result = await base44.functions.invoke('azureAdAuth', {
      action: 'initiate',
      data: { organization_id: orgId }
    });
    window.location.href = result.data.redirect_url;
  };

  return (
    <Button onClick={handleSSOLogin}>
      Sign in with {provider}
    </Button>
  );
}
```

### Phase 2: Okta Integration (Week 2)

Similar implementation to Azure AD but using Okta APIs.

### Phase 3: Generic SAML 2.0 (Week 2-3)

Implement generic SAML 2.0 support for any IdP:

```javascript
// functions/auth/saml-auth.ts
import * as saml2 from 'saml2-js';

export async function samlAuth({ action, data }) {
  switch (action) {
    case 'metadata':
      return getSAMLMetadata();
    case 'login':
      return initiateSAMLLogin(data);
    case 'acs':
      return handleSAMLAssertion(data);
  }
}
```

### Phase 4: Admin Configuration UI (Week 3)

```javascript
// src/pages/SSOConfiguration.jsx
export function SSOConfiguration() {
  return (
    <div>
      <h1>SSO Configuration</h1>
      
      {/* Provider Selection */}
      <ProviderSelector />
      
      {/* Azure AD Config */}
      <AzureADConfigForm />
      
      {/* Okta Config */}
      <OktaConfigForm />
      
      {/* Generic SAML Config */}
      <SAMLConfigForm />
      
      {/* Role Mapping */}
      <RoleMappingTable />
      
      {/* Test Connection */}
      <TestSSOButton />
    </div>
  );
}
```

### Phase 5: Testing & Documentation (Week 4)

- Unit tests for all auth functions
- Integration tests with test IdPs
- E2E tests for complete auth flows
- Admin documentation
- User documentation

---

## Configuration

### Azure AD Setup

1. **Register Application in Azure Portal:**
   - Go to Azure AD → App Registrations
   - Click "New registration"
   - Name: "Interact Platform"
   - Redirect URI: `https://yourapp.com/auth/azure/callback`
   - Click "Register"

2. **Configure Authentication:**
   - Add platform: Web
   - Redirect URIs: Add callback URL
   - Enable ID tokens and access tokens

3. **Add API Permissions:**
   - Microsoft Graph → Delegated:
     - User.Read
     - email
     - openid
     - profile
     - Group.Read.All (for role mapping)

4. **Create Client Secret:**
   - Certificates & secrets → New client secret
   - Copy the secret value (shown only once)

5. **Copy Configuration Values:**
   - Application (client) ID
   - Directory (tenant) ID
   - Client secret

### Okta Setup

1. **Create Application in Okta Admin:**
   - Applications → Create App Integration
   - Sign-in method: SAML 2.0
   - App name: "Interact Platform"

2. **Configure SAML:**
   - Single sign-on URL: `https://yourapp.com/saml/acs`
   - Audience URI: `https://yourapp.com/saml/metadata`
   - Name ID format: EmailAddress
   - Application username: Email

3. **Attribute Statements:**
   - email: user.email
   - firstName: user.firstName
   - lastName: user.lastName
   - groups: user.groups (for role mapping)

4. **Copy Metadata:**
   - Download metadata XML or copy metadata URL

---

## Testing

### Unit Tests

```javascript
// functions/auth/__tests__/azure-ad-auth.test.ts
describe('Azure AD Authentication', () => {
  it('should generate valid authorization URL', () => {
    const url = buildAuthorizationUrl(mockConfig);
    expect(url).toContain('login.microsoftonline.com');
    expect(url).toContain('client_id=');
  });

  it('should exchange code for token', async () => {
    const tokens = await exchangeCodeForToken('test-code');
    expect(tokens).toHaveProperty('access_token');
    expect(tokens).toHaveProperty('id_token');
  });

  it('should provision user on first login', async () => {
    const user = await provisionUser(mockUserInfo);
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('participant');
  });
});
```

### Integration Tests

```javascript
// src/__tests__/integration/sso-flow.test.js
describe('SSO Authentication Flow', () => {
  it('should complete Azure AD login flow', async () => {
    // Initiate login
    const initResult = await initiateLogin('azure_ad');
    expect(initResult.redirect_url).toBeDefined();
    
    // Simulate callback
    const callbackResult = await handleCallback({
      code: 'test-code',
      state: initResult.state
    });
    
    expect(callbackResult.session_token).toBeDefined();
    expect(callbackResult.user).toBeDefined();
  });
});
```

---

## Security

### Best Practices

1. **Token Security:**
   - Store tokens encrypted at rest
   - Use secure, httpOnly cookies for session tokens
   - Implement token rotation
   - Set appropriate token expiration

2. **SAML Validation:**
   - Verify SAML assertion signature
   - Check NotBefore and NotOnOrAfter
   - Validate Audience restriction
   - Verify issuer matches configured IdP

3. **OAuth Security:**
   - Use PKCE for authorization code flow
   - Validate state parameter
   - Use secure redirect URIs
   - Implement CSRF protection

4. **Session Management:**
   - Implement session timeout (default: 8 hours)
   - Track last activity
   - Support single logout
   - Audit all authentication events

5. **Role Mapping:**
   - Validate group membership claims
   - Implement principle of least privilege
   - Audit role changes
   - Support role override for emergencies

---

## Troubleshooting

### Common Issues

**SAML Assertion Invalid:**
- Check certificate is not expired
- Verify clock synchronization (<5 min drift)
- Validate entity ID matches exactly
- Check ACS URL configuration

**OAuth Token Exchange Failed:**
- Verify client secret is correct
- Check redirect URI matches exactly
- Ensure all required scopes are granted
- Validate authorization code hasn't expired

**User Not Provisioned:**
- Check JIT provisioning is enabled
- Verify email attribute mapping
- Check for duplicate email addresses
- Review provisioning logs

**Role Mapping Not Working:**
- Verify group claims are included in token
- Check role mapping configuration
- Validate group names match exactly
- Review case sensitivity

---

## Roadmap

### Phase 1: Foundation (Week 1) ✅ Planned
- [x] Design SSO architecture
- [x] Create data models
- [x] Document authentication flows

### Phase 2: Azure AD (Week 2) ⏳ In Progress
- [ ] Implement Azure AD OAuth flow
- [ ] Add JIT user provisioning
- [ ] Implement role mapping
- [ ] Create configuration UI

### Phase 3: Additional Providers (Week 3) ⏳ Planned
- [ ] Implement Okta integration
- [ ] Implement Google Workspace SSO
- [ ] Add generic SAML 2.0 support

### Phase 4: Testing & Docs (Week 4) ⏳ Planned
- [ ] Write comprehensive tests
- [ ] Create admin documentation
- [ ] Create user guides
- [ ] Perform security audit

---

## References

- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/v2.0/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [Okta Developer Docs](https://developer.okta.com/docs/)

---

**Last Updated:** January 12, 2026  
**Status:** Design Phase Complete, Implementation Starting
