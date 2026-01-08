# Entity Access Rules Review Checklist

## Pre-Review Preparation

### Data Backup
- [ ] Export all entity data to backup storage
- [ ] Document current access patterns in production
- [ ] Create rollback plan with estimated recovery time
- [ ] Identify critical entities that cannot have downtime

### Environment Setup
- [ ] Set up staging environment with production-like data (anonymized)
- [ ] Create test user accounts for each role:
  - [ ] Admin user (full system access)
  - [ ] HR/People Ops user (employee management)
  - [ ] Facilitator user (event/activity management)
  - [ ] Participant user (standard employee)
  - [ ] Team Leader user (team management)

---

## 1. Role & User Type Consistency Review

### Current State Analysis
- [ ] Audit where `role` is used vs `user_type` across all 73 entities
- [ ] Document which fields exist on User entity vs UserProfile entity
- [ ] List all places where `user_type: "facilitator"` is referenced

### Questions to Answer
- [ ] **Q1**: Should `user_type` be a field on the core User entity or remain in UserProfile?
- [ ] **Q2**: How do we handle users who haven't completed profile setup (no user_type set)?
- [ ] **Q3**: Should we enforce `user_type` selection during onboarding?
- [ ] **Q4**: Can a user have multiple types (e.g., facilitator + team leader)?

### Proposed Solution
- [ ] Define canonical location for `user_type` (User entity recommended)
- [ ] Create migration script to ensure all users have `user_type` set
- [ ] Update access rules to consistently reference the correct field
- [ ] Document fallback behavior when `user_type` is missing

### Technical Implementation
- [ ] Update User entity schema to include `user_type` enum
- [ ] Add default `user_type` assignment during user creation
- [ ] Create validation to prevent null `user_type` after onboarding
- [ ] Update all 73 entity access rules to use consistent field reference

---

## 2. HR/People Ops Granularity

### Current Limitations
- [ ] List all entities currently restricted to `role: "admin"` only
- [ ] Identify which of these should be accessible to HR/People Ops
- [ ] Document HR-specific workflows that need access

### HR Access Requirements
**Should HR have access to?**
- [ ] UserOnboarding (create, read, update) - **YES**
- [ ] UserInvitation (create, read, delete) - **YES**
- [ ] AuditLog (read only for HR-related actions) - **PARTIAL**
- [ ] UserProfile (read, update for onboarding) - **YES**
- [ ] Milestone (create, read, update) - **YES**
- [ ] Survey (create, read, analyze) - **YES**
- [ ] SurveyResponse (read aggregated, not individual) - **YES**
- [ ] PointsLedger (read only) - **PARTIAL**
- [ ] Badge/BadgeAward (admin only) - **NO**
- [ ] GamificationConfig (admin only) - **NO**
- [ ] Integration (admin only) - **NO**

### Questions to Answer
- [ ] **Q1**: Should we create `user_type: "hr"` or `role: "hr"`?
- [ ] **Q2**: Should HR be a separate role or a user type?
- [ ] **Q3**: Can HR users also be facilitators or team leaders?
- [ ] **Q4**: What's the hierarchy: Admin > HR > Facilitator > Participant?

### Proposed Solution
**Option A: New User Type**
```json
{
  "user_type": "hr",
  "role": "user"
}
```
✅ Pros: Flexible, can combine with other types  
❌ Cons: More complex permission logic

**Option B: New Role**
```json
{
  "role": "hr",
  "user_type": "facilitator"
}
```
✅ Pros: Clear hierarchy, simpler permissions  
❌ Cons: Less flexible, can't be both HR and facilitator

**Recommended**: Option B - Create `role: "hr"` as middle tier
- Hierarchy: `admin` > `hr` > `user`
- HR can have any `user_type` (facilitator, participant, etc.)
- Access rules use `role: "hr"` for HR-specific permissions

### Implementation Plan
- [ ] Add `"hr"` to role enum in User entity
- [ ] Update access rules for 12-15 entities that need HR access
- [ ] Create HR dashboard page with permitted actions
- [ ] Document HR permission boundaries
- [ ] Test with real HR workflow scenarios

---

## 3. Team & Channel Messaging Security

### Current Implementation Analysis
- [ ] Review TeamMessage entity access rules
- [ ] Review ChannelMessage entity access rules
- [ ] Review TeamMembership entity access rules
- [ ] Document where membership validation happens (DB vs App layer)

### Current Rules Assessment

**TeamMessage**:
```json
"read": { "rules": {} },
"write": { "rules": {} }
```
⚠️ **Issue**: Any authenticated user can read/write any team message

**ChannelMessage**:
```json
"read": { "rules": {} },
"write": { "rules": {} }
```
⚠️ **Issue**: Any authenticated user can read/write any channel message

**Channel**:
```json
"read": {
  "rules": {
    "$or": [
      { "channel_type": "public" },
      { "channel_type": "announcement" },
      { "role": "admin" }
    ]
  }
}
```
⚠️ **Issue**: Private channels bypass read rules

### Questions to Answer
- [ ] **Q1**: Should channel membership be enforced at database level or application level?
- [ ] **Q2**: How do we check if user is a channel member in access rules?
- [ ] **Q3**: Should we add `member_emails` array to Channel entity?
- [ ] **Q4**: Performance impact of membership checks on every message read?

### Proposed Solutions

**Option A: Application-Level Enforcement** (Current)
- Access rules remain open `{}`
- Frontend/backend code checks membership before displaying
- Faster database queries
- Less secure (can be bypassed with direct API calls)

**Option B: Database-Level Enforcement** (Recommended)
- Add `ChannelMembership` entity
- Message access rules check membership
- Slower queries but more secure
- Cannot be bypassed

**Option C: Hybrid Approach**
- Public channels: open rules
- Private channels: strict membership checks
- Conditional rules based on `channel_type`

### Recommended Implementation
```json
// ChannelMembership entity (NEW)
{
  "channel_id": "string",
  "user_email": "string",
  "role": "member|moderator|owner"
}

// ChannelMessage access rules (UPDATED)
{
  "read": {
    "rules": {
      "$or": [
        { "role": "admin" },
        { "channel.channel_type": "public" },
        { "channel.channel_type": "announcement" },
        // Check if user is member (requires join query)
        { "channel.members": { "$contains": "{{user.email}}" } }
      ]
    }
  }
}
```

### Implementation Steps
- [ ] Create `ChannelMembership` entity
- [ ] Migrate existing channel participation to memberships
- [ ] Update `ChannelMessage` access rules with membership checks
- [ ] Update `TeamMessage` access rules with membership checks
- [ ] Add UI for channel member management
- [ ] Test performance with large channels (500+ members)

---

## 4. PII & Sensitive Data Management

### PII Data Audit
**High-Risk Entities** (contain PII):
- [ ] User (built-in) - email, name
- [ ] UserProfile - bio, location, department, job_title
- [ ] UserOnboarding - start_date, manager, buddy
- [ ] Milestone - birthday, anniversary
- [ ] SurveyResponse - potentially identifiable responses
- [ ] AuditLog - user actions, IP addresses
- [ ] PointsLedger - financial-like transactions
- [ ] Recognition - can reveal sensitive workplace info

**Future Considerations**:
- [ ] What if we add salary data? (HR only)
- [ ] What if we add performance reviews? (Manager + HR only)
- [ ] What if we add health/wellness data? (User only)
- [ ] What if we add emergency contacts? (HR only)

### Current PII Protection Assessment

| Entity | PII Level | Current Protection | Adequate? |
|--------|-----------|-------------------|-----------|
| UserProfile | High | User + Admin only | ✅ Yes |
| UserOnboarding | Medium | User + Manager + HR + Admin | ✅ Yes |
| SurveyResponse | High | Admin only (anonymous) | ✅ Yes |
| Milestone | Low | Public if celebrated | ⚠️ Review |
| Recognition | Medium | Public unless private | ✅ Yes |
| AuditLog | High | Admin only | ✅ Yes |
| PointsLedger | Medium | User + Admin | ✅ Yes |

### Questions to Answer
- [ ] **Q1**: Should Milestone birthdays be visible to everyone by default?
- [ ] **Q2**: Should Recognition posts reveal sender/recipient relationship graphs?
- [ ] **Q3**: How do we handle GDPR "right to be forgotten" requests?
- [ ] **Q4**: Should we implement data retention policies (auto-delete old data)?

### Compliance Checklist
- [ ] **GDPR Compliance**:
  - [ ] User can export their own data
  - [ ] User can request data deletion
  - [ ] Consent tracking for data collection
  - [ ] Data minimization (only collect necessary data)
  - [ ] Pseudonymization where possible

- [ ] **WCAG 2.1 AA**:
  - [ ] Access rules don't create accessibility barriers
  - [ ] Error messages are clear and actionable
  - [ ] All user flows are keyboard-navigable

- [ ] **SOC 2 / Security**:
  - [ ] Audit logs capture all sensitive data access
  - [ ] Admin actions are logged
  - [ ] Failed access attempts are monitored
  - [ ] Encryption at rest and in transit

### Recommended Actions
- [ ] Add `data_classification` field to entity schemas (public, internal, confidential, restricted)
- [ ] Implement automated PII detection in new entities
- [ ] Create data export function for GDPR compliance
- [ ] Document data retention policy (e.g., delete SurveyResponse after 2 years)
- [ ] Add consent tracking entity

---

## 5. Testing & Validation

### Pre-Deployment Testing
- [ ] Run all demo scenarios (see DEMO_SCENARIOS.md)
- [ ] Test each role against each entity (role matrix testing)
- [ ] Verify performance impact (query time before/after rules)
- [ ] Check error messages are user-friendly

### Performance Benchmarks
- [ ] Baseline query times (before access rules)
- [ ] Post-implementation query times
- [ ] Acceptable threshold: <20% performance degradation
- [ ] Plan optimization if threshold exceeded

### Error Handling
- [ ] Test access denied scenarios
- [ ] Verify error messages don't leak sensitive info
- [ ] Check frontend gracefully handles 403 errors
- [ ] Log all access denials for security monitoring

### User Acceptance Testing
- [ ] Admin user tests all admin workflows
- [ ] HR user tests onboarding workflow
- [ ] Facilitator user tests event creation workflow
- [ ] Participant user tests engagement workflows
- [ ] Team leader tests team management workflows

---

## 6. Rollout Plan

### Phase 1: Low-Risk Entities (Week 1)
**Target**: 20 entities with public read access
- [ ] Activity, Event, EventTemplate
- [ ] Badge, BadgeAward, AchievementTier
- [ ] Team (public), Channel (public)
- [ ] Announcement, Asset, Poll

**Success Criteria**:
- No user-reported access issues
- Query performance within threshold
- Zero production incidents

### Phase 2: Medium-Risk Entities (Week 2)
**Target**: 30 entities with conditional access
- [ ] Participation, Recognition
- [ ] UserPoints, PersonalChallenge
- [ ] Survey, Milestone
- [ ] TeamChallenge, Reward

**Success Criteria**:
- Users can access own data
- Admin/facilitator workflows function
- No unauthorized access detected

### Phase 3: High-Risk Entities (Week 3)
**Target**: 23 entities with strict access
- [ ] UserProfile, UserPreferences
- [ ] UserOnboarding, UserInvitation
- [ ] SurveyResponse, PointsLedger
- [ ] AuditLog, Integration

**Success Criteria**:
- PII remains protected
- HR workflows function
- Compliance requirements met

---

## 7. Post-Deployment Monitoring

### Week 1 Monitoring
- [ ] Monitor access denied errors (should be <1% of requests)
- [ ] Track support tickets related to permissions
- [ ] Review query performance metrics
- [ ] Check audit logs for anomalies

### Week 2-4 Monitoring
- [ ] Conduct security audit of access patterns
- [ ] Gather user feedback on permission issues
- [ ] Analyze if rules are too restrictive or too permissive
- [ ] Plan adjustments based on real usage

### Metrics to Track
- [ ] Failed access attempts per entity
- [ ] Most commonly accessed entities by role
- [ ] Average query time per entity
- [ ] User satisfaction with permissions (survey)

---

## 8. Documentation & Training

### Documentation Updates
- [ ] Update API documentation with permission requirements
- [ ] Create user guide: "Understanding Your Access Permissions"
- [ ] Document role hierarchy and capabilities
- [ ] Create troubleshooting guide for access issues

### Team Training
- [ ] Train admins on new HR role capabilities
- [ ] Train HR on their specific permissions
- [ ] Train facilitators on event/activity management
- [ ] Communicate changes to all employees

---

## 9. Rollback Plan

### Rollback Triggers
- [ ] >5% of users report access issues
- [ ] Critical workflow is blocked
- [ ] Performance degradation >30%
- [ ] Security vulnerability discovered

### Rollback Procedure
- [ ] Disable all access rules (revert to open access)
- [ ] Restore from backup if data corruption
- [ ] Communicate rollback to all users
- [ ] Root cause analysis within 24 hours
- [ ] Plan corrective actions before retry

---

## 10. Sign-Off Checklist

### Technical Review
- [ ] All 73 entities have documented access rules
- [ ] Access rules follow principle of least privilege
- [ ] No obvious security vulnerabilities
- [ ] Performance impact is acceptable
- [ ] Error handling is robust

### Business Review
- [ ] All user roles are clearly defined
- [ ] Workflows are not disrupted by rules
- [ ] HR can perform their duties
- [ ] Facilitators can manage events
- [ ] Participants can engage normally

### Compliance Review
- [ ] GDPR requirements met
- [ ] PII protection adequate
- [ ] Audit logging in place
- [ ] Data retention policy defined

### Final Approvals
- [ ] CTO/Tech Lead approval: ___________________
- [ ] HR Director approval: ___________________
- [ ] Security Officer approval: ___________________
- [ ] CEO/Product Owner approval: ___________________

---

**Review Scheduled For**: ___________________  
**Attendees**: ___________________  
**Duration**: 30-60 minutes  
**Location/Link**: ___________________

**Next Steps After Review**:
1. Address all flagged items
2. Finalize role hierarchy decision
3. Implement priority fixes
4. Schedule Phase 1 deployment