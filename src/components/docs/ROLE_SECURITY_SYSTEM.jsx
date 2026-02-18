# Role Security System Documentation

## Overview
The INTeract platform implements a robust Role-Based Access Control (RBAC) system to ensure secure access for different user types, from beta testers to full employees.

## Role Hierarchy

### System Roles (in order of privilege)
1. **admin** - Full system access (founders, C-suite)
2. **ops** - Operations team (content management, events, gamification)
3. **hr** - People Ops (employee data, analytics, sensitive HR info)
4. **team_lead** - Team managers (team management, team analytics)
5. **facilitator** - Event facilitators (create/manage events)
6. **employee** - Standard employees (default for most users)
7. **participant** - Event participants (lowest privilege)
8. **user** - Legacy role (deprecated, treat as employee)

## Role Assignment

### Inviting Users
Use the `SecureUserInvitation` component at `/role-security` page:

```javascript
// Backend: Invite with role
await base44.users.inviteUser("user@company.com", "employee");

// Frontend: Full invitation with metadata
<SecureUserInvitation />
```

### Elevated Role Safeguards
- Admin, ops, and hr roles require explicit confirmation checkbox
- Visual warnings displayed for elevated roles
- All invitations logged in AuditLog entity

## Entity-Level Permissions

### User Entity
```json
{
  "role": "admin|ops|hr|team_lead|employee|user",
  "user_type": "facilitator|participant",
  "permissions": ["manage_users", "view_analytics", ...],
  "is_beta_tester": false,
  "beta_access_level": "basic|advanced|full",
  "account_status": "active|suspended|pending"
}
```

### Permission Flags
- `manage_users` - Invite, suspend, manage accounts
- `view_analytics` - Access platform analytics
- `manage_content` - Create/edit activities, challenges
- `manage_events` - Create/manage events
- `manage_gamification` - Configure badges, rewards, points
- `view_all_profiles` - View all employee profiles
- `manage_integrations` - Configure external integrations
- `view_hr_data` - Access sensitive HR data
- `manage_teams` - Create/manage teams
- `moderate_content` - Moderate user content

### Default Permissions by Role

**Admin:**
- All permissions

**Ops:**
- view_analytics
- manage_content
- manage_events
- manage_gamification
- view_all_profiles
- moderate_content

**HR:**
- view_analytics
- view_all_profiles
- view_hr_data
- manage_users
- manage_teams

**Team Lead:**
- manage_events
- view_analytics
- manage_teams

**Employee/Participant:**
- No elevated permissions (can only manage own data)

## Route Access Control

### Admin-Only Routes
- All admin dashboards, analytics, system configuration
- User management, integrations, audit logs
- Defined in `components/auth/RouteConfig.jsx`

### Shared Routes
- Dashboard, Calendar, Recognition, Challenges
- Available to all authenticated users
- Role-specific content shown based on permissions

### Public Routes
- Landing, Product pages, Documentation
- No authentication required

## Beta Testing Best Practices

### Recommended Workflow
1. **Default to Employee Role**
   - Invite beta testers with `employee` role
   - Enable "Mark as Beta Tester" flag for tracking
   - Set beta_access_level: basic/advanced/full

2. **Grant Elevated Access Sparingly**
   ```javascript
   // Only when tester needs specific admin features
   base44.users.inviteUser("ops-tester@company.com", "ops");
   ```

3. **Monitor and Audit**
   - All role assignments logged in AuditLog
   - Review elevated access regularly
   - Revoke when testing complete

4. **Never Share Admin Credentials**
   - Each person gets their own account
   - Use appropriate role for their testing needs
   - Remove accounts after beta period

### Security Checklist
- [ ] No admin role assigned "just to be safe"
- [ ] Beta testers have minimum required permissions
- [ ] Elevated role assignments are confirmed
- [ ] Test accounts marked with is_beta_tester flag
- [ ] Plan to convert or remove beta accounts post-launch

## Implementation Files

### Core Files
- `entities/User.json` - User schema with roles
- `components/auth/AuthProvider.jsx` - Role resolution
- `components/auth/RouteConfig.jsx` - Route access rules
- `components/auth/RoleGate.jsx` - Route protection

### Admin Components
- `pages/RoleSecurity.jsx` - Main admin page
- `components/admin/RolePermissionMatrix.jsx` - Visual role matrix
- `components/admin/SecureUserInvitation.jsx` - Invitation form

## Security Features

### Built-in Protections
1. **Least Privilege by Default** - Routes denied unless explicitly allowed
2. **Confirmation Required** - Elevated roles need checkbox confirmation
3. **Visual Warnings** - Color-coded alerts for dangerous permissions
4. **Audit Logging** - All role changes logged
5. **Session Management** - 8-hour timeout, secure token handling

### Entity-Level Security
All entities have role-based read/write/update/delete rules:
```json
{
  "permissions": {
    "read": { "rules": {} },
    "write": { "rules": { "role": "admin" } }
  }
}
```

## Troubleshooting

### User Can't Access Expected Page
1. Check user's `role` field in User entity
2. Verify route is in appropriate ROUTE array in RouteConfig
3. Check AuthProvider's resolveRole function
4. Review entity permissions for data access issues

### Invitation Not Working
1. Verify inviter has admin role
2. Check email format is valid
3. Ensure role is spelled correctly (lowercase)
4. Check UserInvitation entity was created

### Elevated Role Not Taking Effect
1. User must log out and log back in
2. Check AuthProvider cache refresh
3. Verify role was saved to User entity
4. Check for typos in role name

## Future Enhancements
- Custom permission builder UI
- Role templates for common scenarios
- Time-limited role grants
- IP-based access restrictions
- MFA requirement for admin roles