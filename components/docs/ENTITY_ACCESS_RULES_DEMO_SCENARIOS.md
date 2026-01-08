# Entity Access Rules Demo Scenarios

## How to Use This Document

Each scenario includes:
- **Role**: Which test user to use
- **Action**: What to attempt
- **Expected Result**: What should happen
- **Pass/Fail**: Check if result matches expectation

Test in **staging environment** with anonymized data before production.

---

## Scenario Group 1: Role Hierarchy Testing

### Scenario 1.1: Admin Full Access
**Role**: Admin  
**Entities**: All 73 entities

| Entity | Action | Expected Result | Pass/Fail |
|--------|--------|-----------------|-----------|
| Activity | Create | ✅ Allowed | [ ] |
| Activity | Read All | ✅ Allowed | [ ] |
| Activity | Update Any | ✅ Allowed | [ ] |
| Activity | Delete Any | ✅ Allowed | [ ] |
| UserProfile | Read All | ✅ Allowed | [ ] |
| SurveyResponse | Read (anonymized) | ✅ Allowed | [ ] |
| AuditLog | Read | ✅ Allowed | [ ] |
| Integration | Create | ✅ Allowed | [ ] |

**Expected**: Admin can perform all operations on all entities  
**If Failed**: Check that `role: "admin"` is properly set on test user

---

### Scenario 1.2: Facilitator Limited Access
**Role**: Facilitator (`user_type: "facilitator"`)  
**User**: test-facilitator@intinc.com

| Entity | Action | Expected Result | Pass/Fail |
|--------|--------|-----------------|-----------|
| Activity | Create | ✅ Allowed | [ ] |
| Activity | Update Own | ✅ Allowed | [ ] |
| Activity | Update Others' | ❌ Denied | [ ] |
| Event | Create | ✅ Allowed | [ ] |
| Event | Update Own | ✅ Allowed | [ ] |
| Participation | Read All | ✅ Allowed | [ ] |
| UserProfile | Read All | ❌ Denied | [ ] |
| GamificationConfig | Read | ❌ Denied | [ ] |
| Badge | Create | ❌ Denied | [ ] |

**Expected**: Facilitator can manage events/activities but not system config  
**If Failed**: Check `user_type: "facilitator"` is set and referenced in access rules

---

### Scenario 1.3: Participant Standard Access
**Role**: Participant (`user_type: "participant"`)  
**User**: test-participant@intinc.com

| Entity | Action | Expected Result | Pass/Fail |
|--------|--------|-----------------|-----------|
| Activity | Read All | ✅ Allowed | [ ] |
| Activity | Create | ❌ Denied | [ ] |
| Event | Read All | ✅ Allowed | [ ] |
| Event | Create | ❌ Denied | [ ] |
| Participation | Create (for self) | ✅ Allowed | [ ] |
| Participation | Read Own | ✅ Allowed | [ ] |
| Participation | Read Others' | ❌ Denied | [ ] |
| UserProfile | Read Own | ✅ Allowed | [ ] |
| UserProfile | Update Own | ✅ Allowed | [ ] |
| UserProfile | Read Others' | ❌ Denied | [ ] |

**Expected**: Participant can engage but not manage system  
**If Failed**: Verify `user_type: "participant"` and access rule conditions

---

## Scenario Group 2: HR/People Ops Access

### Scenario 2.1: HR Onboarding Workflow
**Role**: HR (`role: "hr"` - if implemented, otherwise Admin)  
**User**: test-hr@intinc.com

**Test Steps**:
1. **Create User Invitation**
   - Navigate to: `/settings` (or HR dashboard)
   - Click: "Invite New Employee"
   - Fill: new-hire@intinc.com, role: "user", user_type: "participant"
   - Submit invitation
   - **Expected**: ✅ UserInvitation created successfully

2. **Create Onboarding Plan**
   - Navigate to: `/onboarding` (or create via API)
   - Create: UserOnboarding record for new-hire@intinc.com
   - Set: start_date, manager_email, assigned_buddy
   - **Expected**: ✅ UserOnboarding created successfully

3. **View Onboarding Progress**
   - Navigate to: `/onboarding` or `/new-employee-onboarding`
   - View: All active onboarding records
   - **Expected**: ✅ Can see all employees' onboarding status

4. **Attempt Admin Action**
   - Navigate to: `/integrations` (admin only)
   - **Expected**: ❌ Access denied (403) or UI hidden

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Create UserInvitation | ✅ Allowed | [ ] |
| Read UserOnboarding (all) | ✅ Allowed | [ ] |
| Update UserOnboarding | ✅ Allowed | [ ] |
| Read UserProfile (all) | ✅ Allowed | [ ] |
| Create Integration | ❌ Denied | [ ] |
| Update GamificationConfig | ❌ Denied | [ ] |

**If All Pass**: HR role is properly scoped  
**If Failed**: HR role may need additional permissions or restrictions

---

### Scenario 2.2: HR Survey Analysis
**Role**: HR  
**User**: test-hr@intinc.com

**Test Steps**:
1. **Create Pulse Survey**
   - Navigate to: `/surveys`
   - Create: New anonymous pulse survey
   - **Expected**: ✅ Survey created (or ❌ if admin-only)

2. **View Survey Responses**
   - Navigate to: `/surveys/{survey_id}/results`
   - View: Aggregated results (min 5 responses)
   - **Expected**: ✅ Can see anonymized aggregate data
   - **Expected**: ❌ Cannot see individual respondent emails

3. **Export Survey Data**
   - Click: "Export Results"
   - **Expected**: ✅ CSV download with aggregated data only

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Create Survey | ✅ or ❌ (depends on design) | [ ] |
| Read Survey Results (aggregated) | ✅ Allowed | [ ] |
| Read SurveyResponse (individual) | ❌ Denied | [ ] |
| Export anonymized data | ✅ Allowed | [ ] |

---

## Scenario Group 3: Team & Channel Security

### Scenario 3.1: Private Team Access
**Setup**:
- Create Team: "Engineering Team" (is_private: true)
- Create TeamMembership: test-participant@intinc.com is member
- Create TeamMembership: test-outsider@intinc.com is NOT member

**Test as Member**:
**Role**: Participant (member)  
**User**: test-participant@intinc.com

| Action | Expected Result | Pass/Fail |
|--------|--------|-----------|
| Read Team details | ✅ Allowed | [ ] |
| Read TeamMessage (all in team) | ✅ Allowed | [ ] |
| Create TeamMessage | ✅ Allowed | [ ] |
| Update own TeamMessage | ✅ Allowed | [ ] |
| Delete own TeamMessage | ✅ Allowed | [ ] |

**Test as Non-Member**:
**Role**: Participant (non-member)  
**User**: test-outsider@intinc.com

| Action | Expected Result | Pass/Fail |
|--------|--------|-----------|
| Read Team details | ❌ Denied (if private) | [ ] |
| Read TeamMessage | ❌ Denied | [ ] |
| Create TeamMessage | ❌ Denied | [ ] |

**Expected**: Team access is restricted to members  
**If Failed**: Check if TeamMembership validation is implemented

---

### Scenario 3.2: Channel Types Access
**Setup**:
- Create Channel: "Company Announcements" (type: announcement, public)
- Create Channel: "Engineering Sync" (type: private)
- Create Channel: "Random Chatter" (type: public)

**Test as Participant**:
**Role**: Participant  
**User**: test-participant@intinc.com

| Channel Type | Read | Write | Expected Read | Expected Write | Pass/Fail |
|--------------|------|-------|---------------|----------------|-----------|
| Announcement | Try | Try | ✅ Allowed | ❌ Denied | [ ] |
| Public | Try | Try | ✅ Allowed | ✅ Allowed | [ ] |
| Private (not member) | Try | Try | ❌ Denied | ❌ Denied | [ ] |
| Private (is member) | Try | Try | ✅ Allowed | ✅ Allowed | [ ] |

**Expected**: Channel access matches channel type  
**If Failed**: Check Channel and ChannelMessage access rules

---

## Scenario Group 4: PII Protection

### Scenario 4.1: User Profile Privacy
**Setup**:
- User A: test-usera@intinc.com (privacy_settings.profile_visibility: "team_only")
- User B: test-userb@intinc.com (not on same team)

**Test as User B**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read User A's UserProfile | ❌ Denied | [ ] |
| Read User A's public info (name, avatar) | ✅ Allowed | [ ] |
| Read User A's activity history | ❌ Denied | [ ] |
| Read User A's badges | ❌ Denied (if show_badges: false) | [ ] |

**Expected**: Privacy settings are enforced  
**If Failed**: Check if privacy_settings conditions are in access rules

---

### Scenario 4.2: Points & Transaction Privacy
**Setup**:
- User A: test-usera@intinc.com has PointsLedger transactions

**Test as Participant (not User A)**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read User A's UserPoints.total_points | ✅ Allowed (leaderboard) | [ ] |
| Read User A's PointsLedger transactions | ❌ Denied | [ ] |
| Read own PointsLedger | ✅ Allowed | [ ] |
| Update any PointsLedger | ❌ Denied | [ ] |

**Expected**: Users see own transactions only, admins see all  
**If Failed**: Check PointsLedger access rules

---

### Scenario 4.3: Survey Anonymity
**Setup**:
- Create Survey: "Weekly Pulse Survey"
- Submit 3 responses (test-user1, test-user2, test-user3)

**Test as Admin**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read Survey | ✅ Allowed | [ ] |
| Read SurveyResponse records | ✅ Allowed | [ ] |
| See respondent_email in responses | ❌ Should be null/anonymized | [ ] |
| View aggregate results | ✅ Allowed | [ ] |

**Test as Participant**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read Survey | ✅ Allowed | [ ] |
| Read own SurveyResponse | ✅ Allowed | [ ] |
| Read others' SurveyResponse | ❌ Denied | [ ] |
| View aggregate results (if >5 responses) | ✅ Allowed | [ ] |

**Expected**: Individual responses are anonymous  
**If Failed**: Check SurveyResponse access rules and anonymization logic

---

## Scenario Group 5: Gamification Security

### Scenario 5.1: Badge Award Integrity
**Setup**:
- Badge exists: "5 Events Attended" (criteria: 5 events)
- User A: test-usera@intinc.com has attended 5 events

**Test as Participant**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read all Badge definitions | ✅ Allowed | [ ] |
| Create BadgeAward for self | ❌ Denied | [ ] |
| Update BadgeAward | ❌ Denied | [ ] |
| Delete BadgeAward | ❌ Denied | [ ] |
| View all BadgeAwards | ✅ Allowed | [ ] |

**Test as Admin**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Create BadgeAward | ✅ Allowed | [ ] |
| Update BadgeAward | ✅ Allowed | [ ] |
| Delete BadgeAward | ✅ Allowed | [ ] |

**Expected**: Only admin/system can award badges  
**If Failed**: Check BadgeAward write permissions

---

### Scenario 5.2: Points Manipulation Prevention
**Setup**:
- User A: test-usera@intinc.com has 500 points

**Test as User A**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read own UserPoints | ✅ Allowed | [ ] |
| Update own UserPoints.total_points | ❌ Denied | [ ] |
| Create PointsLedger entry for self | ❌ Denied | [ ] |

**Test as Admin**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Update UserPoints.total_points | ✅ Allowed | [ ] |
| Create PointsLedger entry | ✅ Allowed | [ ] |
| Read all PointsLedger | ✅ Allowed | [ ] |

**Expected**: Users cannot manipulate their own points  
**If Failed**: Check UserPoints and PointsLedger write permissions

---

## Scenario Group 6: Recognition System

### Scenario 6.1: Public Recognition
**Setup**:
- User A sends recognition to User B
- Visibility: "public"
- Status: "approved"

**Test as Any Authenticated User**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read recognition post | ✅ Allowed | [ ] |
| React to recognition | ✅ Allowed | [ ] |
| Comment on recognition | ✅ Allowed | [ ] |

**Expected**: Public approved recognition is visible to all  
**If Failed**: Check Recognition read rules for public visibility

---

### Scenario 6.2: Private Recognition
**Setup**:
- User A sends recognition to User B
- Visibility: "private"

**Test as User C (not sender or recipient)**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read recognition post | ❌ Denied | [ ] |
| View in feed | ❌ Not displayed | [ ] |

**Test as User B (recipient)**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read recognition post | ✅ Allowed | [ ] |
| View in notifications | ✅ Displayed | [ ] |

**Expected**: Private recognition only visible to sender/recipient  
**If Failed**: Check Recognition visibility conditions

---

### Scenario 6.3: Recognition Moderation
**Setup**:
- User A creates recognition with inappropriate content
- Status: "pending" (if AI flags it)

**Test as User A (sender)**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read own pending recognition | ✅ Allowed | [ ] |
| Update pending recognition | ✅ Allowed | [ ] |
| Update approved recognition | ❌ Denied | [ ] |

**Test as Admin**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read all recognitions (any status) | ✅ Allowed | [ ] |
| Update any recognition | ✅ Allowed | [ ] |
| Approve/reject recognition | ✅ Allowed | [ ] |

**Expected**: Admins can moderate, users can edit pending only  
**If Failed**: Check Recognition update rules with status conditions

---

## Scenario Group 7: Event Management

### Scenario 7.1: Facilitator Event Lifecycle
**Role**: Facilitator  
**User**: test-facilitator@intinc.com

**Test Steps**:
1. **Create Event**
   - Navigate to: `/calendar` or `/activities`
   - Click: "Schedule Event"
   - Fill: title, date, activity_id, facilitator_email (self)
   - Submit
   - **Expected**: ✅ Event created

2. **Update Own Event**
   - Navigate to: Event detail page
   - Click: "Edit Event"
   - Change: title, description
   - Submit
   - **Expected**: ✅ Event updated

3. **Try to Update Others' Event**
   - Navigate to: Event created by another facilitator
   - Try: Click "Edit Event"
   - **Expected**: ❌ Button hidden or update denied

4. **Delete Own Event**
   - Navigate to: Own event
   - Click: "Cancel Event"
   - Confirm
   - **Expected**: ✅ Event deleted (or status = cancelled)

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Create Event | ✅ Allowed | [ ] |
| Update own Event | ✅ Allowed | [ ] |
| Update others' Event | ❌ Denied | [ ] |
| Delete own Event | ✅ Allowed | [ ] |
| Delete others' Event | ❌ Denied | [ ] |

---

### Scenario 7.2: Participation Registration
**Role**: Participant  
**User**: test-participant@intinc.com

**Test Steps**:
1. **Register for Event**
   - Navigate to: Event detail page
   - Click: "Register" or "RSVP Yes"
   - **Expected**: ✅ Participation record created (rsvp_status: "yes")

2. **Update Own RSVP**
   - Change RSVP: "yes" → "no"
   - **Expected**: ✅ Participation updated

3. **Try to Update Others' RSVP**
   - Navigate to: Another user's participation
   - Try: Change their RSVP
   - **Expected**: ❌ Access denied

4. **Submit Feedback**
   - After event, click: "Submit Feedback"
   - Fill: feedback_rating, feedback text
   - **Expected**: ✅ Participation updated with feedback

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Create Participation (self) | ✅ Allowed | [ ] |
| Read own Participation | ✅ Allowed | [ ] |
| Update own Participation | ✅ Allowed | [ ] |
| Read others' Participation | ❌ Denied (unless facilitator/admin) | [ ] |
| Update others' Participation | ❌ Denied | [ ] |

---

## Scenario Group 8: Learning Paths

### Scenario 8.1: Template vs Personalized Access
**Setup**:
- LearningPath A: "JavaScript Basics" (is_template: true)
- LearningPath B: "User A's Python Journey" (is_template: false, created_for: test-usera@intinc.com)

**Test as User B (not User A)**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read LearningPath A (template) | ✅ Allowed | [ ] |
| Read LearningPath B (personalized) | ❌ Denied | [ ] |
| Start LearningPath A | ✅ Creates progress record | [ ] |

**Test as User A**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read LearningPath B | ✅ Allowed | [ ] |
| Update LearningPath B | ✅ Allowed | [ ] |
| Delete LearningPath B | ❌ Denied (admin only) | [ ] |

**Expected**: Templates are public, personalized paths are private  
**If Failed**: Check LearningPath read rules for is_template condition

---

### Scenario 8.2: Progress Tracking Privacy
**Setup**:
- User A: test-usera@intinc.com has LearningPathProgress records

**Test as User B**:
| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read User A's progress | ❌ Denied | [ ] |
| Read own progress | ✅ Allowed | [ ] |
| Update own progress | ✅ Allowed | [ ] |
| Update User A's progress | ❌ Denied | [ ] |

**Expected**: Learning progress is private  
**If Failed**: Check LearningPathProgress access rules

---

## Scenario Group 9: Edge Cases & Error Handling

### Scenario 9.1: User Without user_type
**Setup**:
- Create User: test-notype@intinc.com
- Do NOT set user_type field

**Test Steps**:
1. Login as test-notype@intinc.com
2. Try to access various pages
3. Check if redirected to RoleSelection page

**Expected**: User is redirected to set user_type  
**If Failed**: Implement user_type validation in useUserData hook

---

### Scenario 9.2: Expired Session
**Test Steps**:
1. Login as any user
2. Wait 8 hours (or manually expire session)
3. Try to perform any action
4. **Expected**: Redirected to login page
5. After login, redirected back to original page

---

### Scenario 9.3: Concurrent Update Conflict
**Test Steps**:
1. Admin A opens Event edit page
2. Admin B opens same Event edit page
3. Admin A saves changes
4. Admin B saves changes
5. **Expected**: Last write wins (or conflict resolution UI)

---

## Scenario Group 10: Performance Testing

### Scenario 10.1: Large Team Message Load
**Setup**:
- Create Team with 500 members
- Create 1000 TeamMessage records

**Test Steps**:
1. Open team chat
2. Scroll through messages
3. Measure load time

**Benchmarks**:
- Initial load: <2 seconds
- Infinite scroll: <500ms per batch
- No visible lag

**Pass/Fail**: [ ]

---

### Scenario 10.2: Leaderboard Query Performance
**Setup**:
- 200 users with UserPoints records

**Test Steps**:
1. Navigate to: `/leaderboards`
2. Load top 100 users
3. Measure query time

**Benchmarks**:
- Query time: <500ms
- Page render: <1 second

**Pass/Fail**: [ ]

---

## Summary Report Template

After completing all scenarios, fill out this summary:

### Overall Results
- **Total Scenarios**: 50+
- **Passed**: _____
- **Failed**: _____
- **Pass Rate**: _____%

### Critical Failures
List any failed scenarios that block deployment:
1. _____________________
2. _____________________
3. _____________________

### Recommended Actions
1. _____________________
2. _____________________
3. _____________________

### Sign-Off
- **Tested By**: _____________________
- **Date**: _____________________
- **Approval**: _____________________ (CTO/Tech Lead)

---

**Next Steps**:
- Address all critical failures
- Re-test failed scenarios
- Document any access rule changes
- Proceed to Phase 1 rollout (if 95%+ pass rate)