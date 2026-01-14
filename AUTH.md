# Authentication & Authorization

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026

## Authentication

### Methods
- Email/Password
- SSO (Google, Microsoft) - Planned Q1 2026
- SAML 2.0 - Planned Q4 2026

### JWT Tokens
- Access tokens: 1 hour expiry
- Refresh tokens: 30 days expiry
- Secure HTTP-only cookies
- Token rotation on refresh

## Authorization (RBAC)

### Roles
- **Super Admin:** Full platform access
- **Admin:** Organization management
- **Facilitator:** Activity and team management
- **Participant:** Standard user

### Permission Matrix

| Action | Participant | Facilitator | Admin |
|--------|------------|-------------|-------|
| Join activity | ✅ | ✅ | ✅ |
| Create activity | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View analytics | ❌ | Team only | ✅ |
| Configure system | ❌ | ❌ | ✅ |

## Security Best Practices
- Never store passwords in plain text
- Use HTTPS only
- Implement rate limiting
- Log authentication events
- Support MFA

**Document Owner:** Security Team  
**Last Updated:** January 14, 2026
