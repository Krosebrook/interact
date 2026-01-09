# INTeract - Complete User Flows Documentation

## Table of Contents
1. [Admin Flows](#admin-flows)
2. [Facilitator Flows](#facilitator-flows)
3. [Participant Flows](#participant-flows)
4. [Cross-Role Flows](#cross-role-flows)

---

## Admin Flows

### 1. Invite New Users (Bulk)
**Goal:** Onboard multiple employees at once

```
1. Navigate to Settings → Invitations tab
2. Click "Invite Users" button
3. Two options:
   a. Manual Entry:
      - Enter emails (one per line or comma-separated)
      - Select role (Admin, Facilitator, Employee)
      - Add optional welcome message
      - Click "Send Invitations"
   
   b. Bulk CSV Import:
      - Click "Download Template"
      - Fill CSV (email, role, message)
      - Upload CSV file
      - Review preview
      - Click "Import & Send Invitations"

4. System actions:
   - Validates email domain (@intinc.com only)
   - Creates UserInvitation records
   - Generates unique tokens
   - Sends invitation emails
   - Creates audit log entries

5. Success state:
   - Confirmation toast
   - Pending invitations list updated
   - Email notifications sent

**Edge cases:**
- Duplicate invitations → error message shown
- Invalid domain → filtered out, error summary
- Owner-only admin invites → permission check
```

### 2. Manage User Roles & Status
**Goal:** Change user permissions or suspend accounts

```
1. Navigate to Employee Directory
2. Search/filter for target user
3. Click "Manage" icon on user card
4. Modal opens with options:
   
   A. Change Role (Owner only):
      - Make Admin
      - Make Facilitator
      - Make Employee
      - Confirmation required
   
   B. Suspend/Activate:
      - Suspend User → requires reason (future)
      - Activate User → restores access
   
5. System actions:
   - Updates User.role or UserProfile.status
   - Creates AuditLog entry (severity: high)
   - Invalidates user sessions (if suspended)
   - Sends email notification to user

6. Success state:
   - User card updates in real-time
   - Audit log entry created
   - Toast confirmation

**RBAC:**
- Role changes: Owner only
- Suspend/activate: Owner + Admin
```

### 3. View Audit Log
**Goal:** Track all security-sensitive actions

```
1. Navigate to Audit Log page (Admin only)
2. View chronological list of actions
3. Filter options:
   - By severity (low, medium, high, critical)
   - By action type (role_changed, user_suspended, etc)
   - By user (search actor or target email)
   - By date range

4. Each entry shows:
   - Action performed
   - Who performed it (actor)
   - Who was affected (target)
   - Before/after changes (for updates)
   - Timestamp
   - Severity badge

5. Expandable details:
   - Full metadata JSON
   - IP address (if logged)
   - User agent

**Use cases:**
- Compliance audits
- Security incident investigation
- User access history review
```

### 4. Export User Data
**Goal:** Generate compliance reports or backup data

```
1. Navigate to Settings → Users tab (future) or Analytics
2. Click "Export Report" dropdown
3. Select format:
   - CSV (spreadsheet)
   - PDF (formatted report)
   - JSON (API-style)

4. Select data scope (Owner only for PII):
   - Basic info (email, name, role) - Admin
   - Analytics (points, attendance) - Admin
   - Sensitive (PII, privacy settings) - Owner

5. System actions:
   - Backend function fetches data
   - Applies RBAC filters
   - Generates file
   - Creates audit log (severity: critical if PII)
   - Downloads to browser

**GDPR compliance:**
- User consent tracked
- PII access logged
- 30-day retention for exports
```

### 5. Adjust User Points (Manual)
**Goal:** Award bonus points or apply penalties

```
1. Navigate to User Profile or Employee Directory
2. Open user's detailed view
3. Click "Adjust Points" (Admin only)
4. Modal appears:
   - Current balance displayed
   - Select type: Bonus or Penalty
   - Enter amount (positive integer)
   - Enter reason (required, max 200 chars)
   - Preview new balance

5. Submit:
   - Creates PointsLedger entry (immutable)
   - Updates UserPoints.total_points
   - Recalculates level
   - Creates audit log
   - Sends notification to user

6. User sees:
   - Notification: "You received X bonus points!"
   - Updated balance in profile
   - Transaction in points history

**Safeguards:**
- Reason required (audit trail)
- Cannot delete transactions (append-only)
- Negative balances allowed but flagged
```

---

## Facilitator Flows

### 1. Schedule Event from Activity Library
**Goal:** Plan a team activity using a template

```
1. Navigate to Activities page
2. Browse or search activities
3. Filters available:
   - Type (icebreaker, creative, wellness, etc)
   - Duration (5-15min, 15-30min, 30+min)
   - Capacity (small, medium, large groups)

4. Select activity card → details modal
5. Click "Schedule This Activity"
6. Redirected to Calendar page with activity pre-selected
7. Fill event details:
   - Date & time
   - Duration (defaults from activity)
   - Format (online, offline, hybrid)
   - Location (if offline/hybrid)
   - Max participants
   - Custom instructions
   - Facilitator assignment

8. Generate magic link (auto or custom)
9. Preview event card
10. Click "Schedule Event"

11. System actions:
    - Creates Event record
    - Generates magic link
    - Sends Teams notification (if configured)
    - Adds to facilitator's calendar
    - Creates reminder schedule

12. Success state:
    - Event appears in Calendar
    - Link copied to clipboard
    - Confirmation toast with share options
```

### 2. Facilitate Live Event
**Goal:** Run the event and track participation

```
1. Navigate to Facilitator View page (via event link)
2. Pre-event (15min before):
   - Checklist: materials, tech setup
   - Participant list (RSVPs)
   - Activity instructions visible
   - Timer ready

3. During event:
   - Mark attendance (checkboxes)
   - Track engagement (1-5 stars per participant)
   - Real-time participant count
   - Notes field for observations

4. Interactive features:
   - Live poll (optional)
   - Q&A section
   - Breakout rooms (virtual)
   - Media upload (photos/videos)

5. Post-event:
   - Mark event as "Completed"
   - Bulk actions:
     * Award points to attendees
     * Send thank-you message
     * Request feedback (survey link)
   - Generate recap (AI-powered summary)

6. System actions:
   - Updates Event.status = 'completed'
   - Creates Participation records
   - Awards points via PointsLedger
   - Sends recap notifications
   - Updates attendance streaks

**Tips for facilitators:**
- Use keyboard shortcuts (press "?" to view)
- Pre-load materials in browser tabs
- Test video/audio 5min before
```

### 3. View Team Analytics
**Goal:** Understand engagement trends

```
1. Navigate to Analytics page (Facilitator access)
2. Dashboard shows:
   - Total events facilitated
   - Average attendance rate
   - Average engagement score
   - Top-performing activities

3. Charts available:
   - Attendance over time (line chart)
   - Activity type breakdown (pie chart)
   - Engagement by department (bar chart)

4. Filters:
   - Date range (last 30d, 90d, all time)
   - Activity type
   - Event format (online/offline)

5. Export options:
   - Download chart as PNG
   - Export data as CSV
   - Share link to report

**Facilitator insights:**
- "Your most popular activity: Team Trivia"
- "Attendance peaks on Wednesdays at 2pm"
- "Wellness activities have 92% engagement"
```

---

## Participant Flows

### 1. Discover & RSVP to Events
**Goal:** Find upcoming activities and commit to attend

```
1. Navigate to Participant Portal
2. View upcoming events:
   - Card grid layout
   - Activity title, date, time
   - Participant count (X/Y registered)
   - RSVP button

3. Click event card → details expand:
   - Full description
   - Facilitator name
   - Location/link
   - What to bring/prepare

4. Click "RSVP" button:
   - Status changes to "Registered"
   - Confirmation modal:
     * Add to calendar (download .ics)
     * Set reminder (24h before)
   - Points preview: "Earn 10 pts by attending"

5. System actions:
   - Creates Participation record (rsvp_status = 'yes')
   - Sends confirmation email
   - Adds to user's calendar
   - Creates notification reminder

6. Follow-up:
   - 24h reminder notification
   - 1h reminder (optional)
   - Magic link sent day-of

**Edge cases:**
- Event full → "Join Waitlist" button
- Conflicting event → warning shown
- Already RSVP'd → "Change RSVP" option
```

### 2. Attend Event & Submit Feedback
**Goal:** Participate and share experience

```
1. Access event:
   - Via magic link (email)
   - Or from Participant Portal → "Join Event"

2. ParticipantEvent page loads:
   - Activity title & description
   - Facilitator instructions
   - Interactive elements (poll, quiz)
   - Media upload (if enabled)

3. During event:
   - Follow along with facilitator
   - Submit poll responses
   - Upload photos (optional)
   - Chat with participants (if enabled)

4. Post-event (auto-appears after scheduled end):
   - Feedback form:
     * Rating (1-5 stars)
     * What did you enjoy?
     * What could improve?
     * Would you recommend? (yes/no)
   - Submit button

5. System actions:
   - Updates Participation.attended = true
   - Saves feedback
   - Awards points (10 for attendance + 5 for feedback)
   - Updates engagement_score
   - Triggers level-up check

6. Success state:
   - Thank you message
   - Points notification: "+15 pts earned!"
   - Badge notification (if earned)
   - Prompt to share on social feed
```

### 3. Track Points & Level Progress
**Goal:** Monitor gamification achievements

```
1. Navigate to My Profile
2. Dashboard shows:
   - Current level (1-10 with visual progress bar)
   - Total points
   - Next level threshold
   - Current streak (days)

3. Sections:
   - Badges Earned (icon grid)
   - Recent Transactions (points history)
   - Leaderboard Rank (#X of Y)
   - Achievements Unlocked

4. Points History:
   - Chronological list
   - Transaction type (event, badge, bonus)
   - Amount (+/- points)
   - Balance after
   - Reference (linked to event/badge)

5. Level-up animation:
   - Confetti effect
   - Modal: "Congrats! You reached Level 5!"
   - New perks unlocked displayed
   - Share to feed option

**Motivation features:**
- Progress bars with percentage
- "You're 25 pts away from Level 6!"
- Weekly recap email
```

### 4. Give Recognition to Peers
**Goal:** Celebrate colleagues' contributions

```
1. Navigate to Recognition page
2. Click "Give Recognition"
3. Form appears:
   - Search colleague by name/email
   - Select recognition type:
     * Great Teammate
     * Innovative Thinker
     * Helpful Mentor
     * Problem Solver
     * Custom
   - Write message (required, 280 chars max)
   - Select visibility:
     * Public (company feed)
     * Team only
     * Private (recipient only)

4. Preview card:
   - Shows how it will appear
   - Emoji/icon based on type
   - Your name as sender

5. Submit:
   - Creates Recognition record
   - Sends notification to recipient
   - Awards points (3 to giver, 5 to recipient)
   - Posts to feed (if public)

6. Recipient sees:
   - Push notification
   - Email notification (if enabled)
   - Recognition card in profile
   - Points added to balance

**Best practices:**
- Be specific in message
- Recognize regularly (not just annually)
- Use various recognition types
```

---

## Cross-Role Flows

### 1. Company-Wide Announcements
**Actors:** Admin posts, All see

```
Admin:
1. Navigate to Dashboard or Channels
2. Click "Post Announcement"
3. Compose message:
   - Title (required)
   - Body (rich text, max 1000 chars)
   - Attachments (images, PDFs)
   - Priority (normal, urgent)
   - Target audience (all, specific departments)
4. Schedule or post immediately
5. Creates Announcement entity
6. Sends push notifications

All Users:
1. Notification bell lights up
2. Click to read announcement
3. Can react (like, acknowledge)
4. Comment (if enabled)
5. Mark as read

System:
- Tracks read status per user
- Sends follow-up if unread after 24h (urgent only)
```

### 2. Team Challenges (Gamification)
**Actors:** Admin creates, Teams compete, Participants earn

```
Admin:
1. Navigate to Gamification Settings
2. Click "Create Team Challenge"
3. Define challenge:
   - Title & description
   - Challenge type (attendance, feedback, recognition)
   - Target metric (e.g., 10 events attended)
   - Duration (start/end dates)
   - Rewards (points, badges)
   - Participating teams (all or selected)

Teams (auto-formed by department):
1. Challenge appears in Teams page
2. Real-time leaderboard shows team standings
3. Progress bars for each team
4. Individual contributions visible

Participants:
1. See challenge in dashboard widget
2. Actions contribute to team total
3. Notifications on team progress milestones
4. Celebration when team wins

System:
- Aggregates team points daily
- Updates leaderboard
- Awards prizes on completion
- Creates social feed posts
```

### 3. Wellness Check-Ins (Pulse Surveys)
**Actors:** Admin schedules, All respond, HR views aggregated

```
Admin:
1. Navigate to Analytics → Surveys (future)
2. Create pulse survey:
   - Frequency (weekly, bi-weekly, monthly)
   - Questions (mood scale, workload, satisfaction)
   - Anonymity (always on for compliance)
   - Minimum responses (5 before showing results)

All Users:
1. Notification: "Weekly check-in available"
2. Click link → 3-question survey
3. Questions:
   - How are you feeling this week? (1-5 emoji scale)
   - Workload level? (too little, right, too much)
   - Optional: What's going well/needs improvement?
4. Submit (30 seconds)

HR/Admin:
1. View aggregated results (only after 5+ responses)
2. Trends over time (line chart)
3. Red flags (sudden drops in mood)
4. Drill-down by department (no individual responses)
5. Export for leadership meetings

**Privacy:**
- Individual responses never shown
- IP addresses not logged
- Encourages honest feedback
```

---

## Mobile-Specific Flows

### Quick RSVP (Mobile-Optimized)
```
1. Notification: "Event tomorrow: Team Trivia"
2. Tap notification → opens app
3. Event details (mobile card)
4. Large "RSVP" button (thumb-friendly)
5. One-tap confirmation
6. "Added to calendar" success
```

### On-the-Go Points Check
```
1. Open app on mobile
2. Dashboard shows points prominently
3. Swipe left → leaderboard
4. Swipe right → badges
5. Tap profile → full history
```

---

## Accessibility Flows

### Screen Reader Navigation
```
1. Semantic HTML structure
2. ARIA labels on all interactive elements
3. Keyboard navigation (Tab, Enter, Escape)
4. Focus indicators visible
5. Alt text on all images
6. Transcripts for video content
```

### Reduced Motion Preferences
```
1. User sets reduced_motion in profile
2. Animations disabled:
   - No confetti on level-up
   - Fade transitions only
   - Static charts (no loading animations)
3. Functionality preserved
```

---

## Error Handling Flows

### Network Timeout
```
1. User action (e.g., RSVP)
2. Request hangs (10s+)
3. Loading spinner with "Taking longer than usual..."
4. Timeout after 30s
5. Error toast: "Connection lost. Retry?"
6. Retry button → repeats request
7. Offline mode indicator (if PWA)
```

### Permission Denied
```
1. User navigates to admin page (not admin)
2. useUserData hook checks role
3. Redirect to appropriate dashboard
4. Toast: "Access denied: Admin permission required"
5. No error logged (expected behavior)
```

---

## Integration Flows

### Microsoft Teams Notification
```
1. Event scheduled
2. Backend function calls Teams webhook
3. Adaptive card posted to channel
4. Card shows:
   - Event title
   - Date/time
   - RSVP button (deep link)
5. User clicks button → opens app
6. RSVP flow continues in app
```

### Google Calendar Sync
```
1. User clicks "Add to Calendar"
2. Backend generates .ics file
3. File includes:
   - Event details
   - Location/link
   - Organizer (facilitator)
   - Reminder (24h before)
4. User downloads/opens
5. Imports to Google Calendar
6. Automatic reminders sent by Google
```

---

This comprehensive flow documentation ensures all stakeholders understand user journeys and system behaviors.