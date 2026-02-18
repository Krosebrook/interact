# Beta Testing User Guide

## Quick Start for Admins

### Inviting Beta Testers

1. **Navigate to Role Security**
   - Go to `/role-security` page (Admin only)
   - Click on "Invite Users" tab

2. **Choose Appropriate Role**
   ```
   Most beta testers → employee role
   Testing team features → team_lead role
   Testing content management → ops role
   Testing HR features → hr role
   Testing everything → admin role (use sparingly!)
   ```

3. **Enable Beta Tester Flag**
   - Check "Mark as Beta Tester"
   - Select access level: basic/advanced/full
   - Add personal welcome message (optional)

4. **Confirm and Send**
   - For elevated roles (admin/ops/hr), check confirmation box
   - Click "Send Invitation"
   - User receives email with setup link

## Role Selection Matrix

| Testing Scenario | Recommended Role | Access Level |
|-----------------|------------------|--------------|
| End-user experience | employee | basic |
| Event participation | employee | basic |
| Team management | team_lead | advanced |
| Content creation | ops | advanced |
| Analytics review | ops or hr | full |
| HR features | hr | full |
| System administration | admin | full |

## Beta Access Levels

### Basic
- Access to core features
- Can participate in events
- Can earn badges/points
- Limited analytics

### Advanced
- Everything in Basic
- Create content (if role allows)
- Team management (if role allows)
- Enhanced analytics

### Full
- Everything in Advanced
- All features enabled
- Complete analytics access
- Integration testing

## Security Reminders

### ✅ DO
- Use minimum required role for testing needs
- Mark all testers with is_beta_tester flag
- Document who has elevated access
- Remove/downgrade accounts after beta
- Use personal emails for accountability

### ❌ DON'T
- Don't assign admin "just in case"
- Don't share login credentials
- Don't leave test accounts active in production
- Don't skip the confirmation checkbox
- Don't use generic emails (test@company.com)

## Monitoring Beta Testers

### Tracking Features
```javascript
// Query all beta testers
const betaTesters = await base44.entities.User.filter({
  is_beta_tester: true,
  account_status: 'active'
});

// Check elevated access
const elevatedTesters = betaTesters.filter(u => 
  ['admin', 'ops', 'hr'].includes(u.role)
);
```

### Audit Log Review
All role assignments are logged:
- Who invited whom
- What role was assigned
- When the invitation was sent
- When the user accepted

Access audit logs at `/audit-log` (Admin only)

## Post-Beta Cleanup

### Converting Beta to Production Users
1. Update `is_beta_tester` to false
2. Adjust role if needed (many can stay as employee)
3. Remove `beta_access_level` field

### Removing Beta Accounts
1. Set `account_status` to 'suspended'
2. Document reason in admin notes
3. Archive after 30 days

## Common Scenarios

### Scenario 1: Testing Gamification
```
Role: employee
Beta Access: basic
Features: Can earn points, complete challenges, redeem rewards
```

### Scenario 2: Testing Event Management
```
Role: ops or facilitator
Beta Access: advanced
Features: Create events, manage participants, view analytics
```

### Scenario 3: Testing HR Dashboard
```
Role: hr
Beta Access: full
Features: View all analytics, employee data, sensitive reports
Note: Requires extra confirmation, use only for HR testers
```

### Scenario 4: Full Platform Testing
```
Role: admin
Beta Access: full
Features: Everything
Warning: Should be reserved for co-founders or senior leadership
```

## Troubleshooting

### Beta Tester Can't Access Feature
1. Check their role and beta_access_level
2. Verify feature is enabled for their access level
3. Check entity permissions for data access
4. Ensure they've logged out and back in after role change

### Invitation Not Received
1. Check spam folder
2. Verify email address spelling
3. Check UserInvitation entity for record
4. Resend invitation if needed

### Elevated Role Not Working
1. Confirm checkbox was checked during invitation
2. User must accept invitation and complete setup
3. Role takes effect immediately after acceptance
4. Check for typos in role name (must be lowercase)

## Beta Testing Checklist

### Pre-Launch
- [ ] Invited 5-10 employee-level testers
- [ ] Invited 2-3 team_lead testers
- [ ] Invited 1-2 ops testers (if needed)
- [ ] Invited 1 hr tester (if needed)
- [ ] Documented all elevated access grants
- [ ] Set calendar reminder for cleanup

### During Beta
- [ ] Monitor feedback channels
- [ ] Review analytics for usage patterns
- [ ] Check error logs for issues
- [ ] Iterate on reported bugs
- [ ] Track feature requests

### Post-Beta
- [ ] Convert active testers to regular users
- [ ] Remove/suspend inactive accounts
- [ ] Downgrade unnecessary elevated roles
- [ ] Clear beta_tester flags
- [ ] Archive testing documentation

## Support

For questions about role security or beta testing:
- Review `/role-security` page documentation
- Check `ROLE_SECURITY_SYSTEM.md` for technical details
- Contact system administrator