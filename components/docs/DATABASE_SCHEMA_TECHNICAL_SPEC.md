# DATABASE SCHEMA TECHNICAL SPECIFICATION
## INTeract Employee Engagement Platform
### Complete Entity Reference - All 73 Tables

**Platform:** Base44 (NoSQL/Document Database)  
**Generated:** 2025-12-29  
**Version:** 1.0.0

---

## TABLE OF CONTENTS

1. [Built-in Entities](#built-in-entities)
2. [Core Engagement](#core-engagement)
3. [Event Management](#event-management)
4. [Gamification](#gamification)
5. [Learning & Development](#learning--development)
6. [User Management](#user-management)
7. [Communication](#communication)
8. [Analytics & Reporting](#analytics--reporting)
9. [Administration](#administration)
10. [System & Configuration](#system--configuration)

---

## BUILT-IN ENTITIES

### User (Built-in)
**Description:** Core user authentication and profile  
**Access Control:** Built-in security rules (admin-only for list/update/delete others)

```sql
CREATE TABLE User (
    -- Built-in fields (automatically included)
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Default fields
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    
    -- Custom fields (can be extended via entities/User.json)
    user_type ENUM('facilitator', 'participant'),
    -- Additional custom fields defined in entities/User.json
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_user_type (user_type)
);
```

**RBAC Rules:**
- Regular users can only view/update their own record
- Admins can list, update, and delete all users
- User creation handled by invitation system only

---

## CORE ENGAGEMENT

### 1. Recognition
**Description:** Peer-to-peer recognition and kudos system  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Recognition (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    -- Recognition Details
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    message TEXT NOT NULL,
    category ENUM(
        'teamwork', 
        'innovation', 
        'leadership', 
        'going_above', 
        'customer_focus', 
        'problem_solving', 
        'mentorship', 
        'culture_champion'
    ) NOT NULL,
    company_values JSON DEFAULT '[]',
    points_awarded INT DEFAULT 10,
    
    -- Visibility & Moderation
    visibility ENUM('public', 'private', 'team_only') DEFAULT 'public',
    is_featured BOOLEAN DEFAULT FALSE,
    featured_by VARCHAR(255),
    featured_at TIMESTAMP,
    status ENUM('pending', 'approved', 'flagged', 'rejected') DEFAULT 'approved',
    moderation_notes TEXT,
    moderated_by VARCHAR(255),
    moderated_at TIMESTAMP,
    
    -- AI Moderation
    ai_flag_reason TEXT,
    ai_flag_confidence DECIMAL(3,2),
    ai_suggested BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    reactions JSON DEFAULT '[]',
    comments_count INT DEFAULT 0,
    image_url VARCHAR(500),
    
    INDEX idx_sender (sender_email),
    INDEX idx_recipient (recipient_email),
    INDEX idx_status (status),
    INDEX idx_visibility (visibility),
    INDEX idx_featured (is_featured),
    FOREIGN KEY (sender_email) REFERENCES User(email),
    FOREIGN KEY (recipient_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: 
  - Public + approved: All users
  - Team-only + approved: Team members
  - Private: Sender OR recipient OR admin
  
WRITE: All authenticated users

UPDATE: Admin OR (sender + status=pending)

DELETE: Admin OR sender
```

---

### 2. Survey
**Description:** Pulse surveys, engagement surveys, feedback collection  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Survey (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    -- Survey Configuration
    title VARCHAR(500) NOT NULL,
    description TEXT,
    survey_type ENUM('pulse', 'engagement', 'wellness', 'feedback', 'custom') DEFAULT 'pulse',
    questions JSON NOT NULL COMMENT 'Array of question objects with id, question_text, question_type, options, required, scale_min, scale_max',
    
    -- Targeting
    target_audience ENUM('all_employees', 'specific_teams', 'specific_departments', 'specific_roles') DEFAULT 'all_employees',
    target_teams JSON COMMENT 'Array of team IDs',
    target_departments JSON COMMENT 'Array of department names',
    
    -- Privacy
    is_anonymous BOOLEAN DEFAULT TRUE,
    anonymization_threshold INT DEFAULT 5 COMMENT 'Min responses before showing results',
    
    -- Status & Scheduling
    status ENUM('draft', 'active', 'closed', 'archived') DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    recurrence JSON COMMENT 'Object with enabled, frequency, next_occurrence',
    
    -- Metrics
    response_count INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Notifications
    notification_settings JSON COMMENT 'Object with send_launch_notification, send_reminder, reminder_days, send_closing_notification',
    
    INDEX idx_status (status),
    INDEX idx_survey_type (survey_type),
    INDEX idx_created_by (created_by),
    INDEX idx_dates (start_date, end_date),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Active/closed surveys OR admin
WRITE: Admin only
```

---

### 3. SurveyResponse
**Description:** Individual survey responses (anonymized)  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE SurveyResponse (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    survey_id VARCHAR(255) NOT NULL,
    respondent_email VARCHAR(255) NOT NULL COMMENT 'Hashed for anonymous surveys',
    is_anonymous BOOLEAN DEFAULT TRUE,
    
    -- Response Data
    responses JSON NOT NULL COMMENT 'Array of {question_id, answer} objects',
    completion_status ENUM('started', 'completed') DEFAULT 'completed',
    time_taken_seconds INT,
    
    -- Demographic Segmentation (not shown with individual responses)
    metadata JSON COMMENT 'Object with department, team_id, role, tenure_bucket',
    
    INDEX idx_survey (survey_id),
    INDEX idx_respondent (respondent_email),
    INDEX idx_completion (completion_status),
    FOREIGN KEY (survey_id) REFERENCES Survey(id),
    FOREIGN KEY (respondent_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: All authenticated users
UPDATE: Respondent only
```

---

### 4. Milestone
**Description:** Birthday, work anniversary, and achievement celebrations  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Milestone (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    -- Milestone Details
    user_email VARCHAR(255) NOT NULL,
    milestone_type ENUM('birthday', 'work_anniversary', 'first_day', 'achievement', 'custom') NOT NULL,
    milestone_date DATE NOT NULL,
    milestone_year INT COMMENT 'For anniversaries: years of service',
    title VARCHAR(500),
    description TEXT,
    
    -- Celebration
    celebration_status ENUM('upcoming', 'celebrated', 'missed', 'opt_out') DEFAULT 'upcoming',
    celebration_message TEXT,
    celebrated_date TIMESTAMP,
    recognition_id VARCHAR(255) COMMENT 'Link to Recognition post if created',
    
    -- Notifications
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_channels JSON DEFAULT '["in_app", "email"]',
    
    -- Visibility
    visibility ENUM('public', 'team_only', 'private') DEFAULT 'public',
    opt_out BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    reactions JSON DEFAULT '[]' COMMENT 'Array of {user_email, emoji, timestamp}',
    comments JSON DEFAULT '[]' COMMENT 'Array of {user_email, user_name, message, timestamp}',
    
    INDEX idx_user (user_email),
    INDEX idx_type (milestone_type),
    INDEX idx_date (milestone_date),
    INDEX idx_status (celebration_status),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Public + celebrated OR owner OR admin
WRITE: Admin only
UPDATE: Admin OR owner
```

---

## EVENT MANAGEMENT

### 5. Activity
**Description:** Activity templates for events  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Activity (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    -- Activity Details
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    type ENUM(
        'icebreaker', 
        'creative', 
        'competitive', 
        'wellness', 
        'learning', 
        'social'
    ) NOT NULL,
    duration ENUM('5-15min', '15-30min', '30+min') NOT NULL,
    capacity INT COMMENT 'Max participants (optional)',
    materials_needed TEXT,
    image_url VARCHAR(500),
    
    -- Metadata
    popularity_score INT DEFAULT 0,
    is_template BOOLEAN DEFAULT TRUE,
    
    -- Interaction
    interaction_type ENUM(
        'poll', 
        'photo_upload', 
        'text_submission', 
        'quiz', 
        'discussion', 
        'whiteboard', 
        'breakout_rooms', 
        'multiplayer_game'
    ),
    
    -- Learning & Development
    skills_developed JSON DEFAULT '[]',
    skill_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    learning_outcomes JSON DEFAULT '[]',
    
    INDEX idx_type (type),
    INDEX idx_template (is_template),
    INDEX idx_creator (created_by),
    INDEX idx_popularity (popularity_score),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
UPDATE: Admin OR creator
DELETE: Admin OR creator
```

---

### 6. Event
**Description:** Scheduled events based on activities  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Event (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    -- Event Configuration
    activity_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    event_type ENUM(
        'meeting', 
        'workshop', 
        'training', 
        'social', 
        'wellness', 
        'presentation', 
        'brainstorm', 
        'other'
    ) DEFAULT 'other',
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INT,
    
    -- Status
    status ENUM(
        'draft', 
        'scheduled', 
        'in_progress', 
        'completed', 
        'cancelled', 
        'rescheduled'
    ) DEFAULT 'scheduled',
    
    -- Access
    magic_link VARCHAR(500),
    max_participants INT,
    custom_instructions TEXT,
    
    -- Location
    event_format ENUM('online', 'offline', 'hybrid') DEFAULT 'online',
    meeting_link VARCHAR(500),
    location VARCHAR(500),
    location_details JSON COMMENT 'Object with address, room, building, parking_info',
    
    -- Facilitation
    facilitator_name VARCHAR(255),
    facilitator_email VARCHAR(255),
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_series_id VARCHAR(255),
    recurrence_pattern JSON,
    
    -- Series
    series_id VARCHAR(255),
    series_session_number INT,
    
    -- Rescheduling
    original_date TIMESTAMP,
    reschedule_reason TEXT,
    reschedule_history JSON,
    
    -- Notifications
    notification_settings JSON,
    
    -- Gamification
    points_awarded INT DEFAULT 10,
    
    -- Targeting
    target_teams JSON DEFAULT '[]',
    bulk_schedule_id VARCHAR(255),
    
    -- Registration
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMP,
    waitlist_enabled BOOLEAN DEFAULT FALSE,
    waitlist_count INT DEFAULT 0,
    
    -- Integration
    google_calendar_id VARCHAR(255),
    google_calendar_link VARCHAR(500),
    
    -- Type-specific
    type_specific_fields JSON,
    
    INDEX idx_activity (activity_id),
    INDEX idx_status (status),
    INDEX idx_date (scheduled_date),
    INDEX idx_facilitator (facilitator_email),
    INDEX idx_series (series_id),
    INDEX idx_recurring (recurring_series_id),
    FOREIGN KEY (activity_id) REFERENCES Activity(id),
    FOREIGN KEY (facilitator_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
UPDATE: Admin OR facilitator_email
DELETE: Admin OR facilitator_email
```

---

### 7. Participation
**Description:** User participation in events  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Participation (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    
    -- RSVP
    rsvp_status ENUM('yes', 'no', 'maybe', 'pending') DEFAULT 'pending',
    
    -- Attendance
    attendance_status ENUM('attended', 'no_show', 'cancelled', 'pending') DEFAULT 'pending',
    check_in_time TIMESTAMP,
    
    -- Engagement
    engagement_score INT COMMENT 'Rating 1-10',
    
    -- Feedback
    feedback TEXT,
    feedback_rating INT COMMENT 'Rating 1-5',
    feedback_submitted_at TIMESTAMP,
    
    -- Gamification
    points_earned INT DEFAULT 0,
    
    INDEX idx_event (event_id),
    INDEX idx_user (user_email),
    INDEX idx_attendance (attendance_status),
    INDEX idx_rsvp (rsvp_status),
    UNIQUE KEY unique_participation (event_id, user_email),
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin OR facilitator
WRITE: All authenticated users
UPDATE: Owner OR admin OR facilitator
DELETE: Owner OR admin
```

---

### 8. EventSeries
**Description:** Multi-session event tracks  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE EventSeries (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    series_name VARCHAR(500) NOT NULL,
    description TEXT,
    total_sessions INT,
    completed_sessions INT DEFAULT 0,
    
    INDEX idx_creator (created_by),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
```

---

### 9. EventTemplate
**Description:** Reusable event templates  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE EventTemplate (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    template_name VARCHAR(500) NOT NULL,
    activity_id VARCHAR(255),
    template_data JSON,
    is_public BOOLEAN DEFAULT TRUE,
    
    INDEX idx_public (is_public),
    INDEX idx_activity (activity_id),
    FOREIGN KEY (activity_id) REFERENCES Activity(id),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Public OR creator OR admin
WRITE: Admin OR facilitator
UPDATE: Creator OR admin
```

---

### 10. EventBookmark
**Description:** User bookmarked events  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE EventBookmark (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    
    INDEX idx_event (event_id),
    INDEX idx_user (user_email),
    UNIQUE KEY unique_bookmark (event_id, user_email),
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner only
WRITE: Owner only
DELETE: Owner only
```

---

### 11. BulkEventSchedule
**Description:** Bulk event scheduling operations  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE BulkEventSchedule (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    schedule_name VARCHAR(500) NOT NULL,
    total_events INT,
    status ENUM('draft', 'scheduled', 'completed') DEFAULT 'draft',
    
    INDEX idx_status (status),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Admin OR facilitator
WRITE: Admin OR facilitator
```

---

### 12. TimeSlotPoll
**Description:** Polls for determining best event times  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE TimeSlotPoll (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    title VARCHAR(500) NOT NULL,
    activity_id VARCHAR(255),
    proposed_slots JSON NOT NULL,
    votes JSON DEFAULT '[]',
    status ENUM('active', 'closed', 'scheduled') DEFAULT 'active',
    
    INDEX idx_activity (activity_id),
    INDEX idx_status (status),
    FOREIGN KEY (activity_id) REFERENCES Activity(id),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
UPDATE: All users (for voting)
```

---

### 13. ReminderSchedule
**Description:** Event reminder scheduling  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE ReminderSchedule (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    reminder_type VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    
    INDEX idx_event (event_id),
    INDEX idx_scheduled (scheduled_time),
    INDEX idx_sent (sent),
    FOREIGN KEY (event_id) REFERENCES Event(id)
);
```

**RBAC Rules:**
```
READ: Admin OR facilitator
WRITE: Admin OR facilitator
```

---

### 14. RegistrationForm
**Description:** Custom registration forms for events  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE RegistrationForm (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    form_fields JSON NOT NULL,
    
    INDEX idx_event (event_id),
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
```

---

### 15. RegistrationSubmission
**Description:** User registration form responses  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE RegistrationSubmission (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    form_id VARCHAR(255) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    responses JSON NOT NULL,
    
    INDEX idx_form (form_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_email),
    FOREIGN KEY (form_id) REFERENCES RegistrationForm(id),
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin OR facilitator
WRITE: All authenticated users
```

---

### 16. EventPreparationTask
**Description:** Pre-event tasks for facilitators  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE EventPreparationTask (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    assigned_to VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE,
    
    INDEX idx_event (event_id),
    INDEX idx_assigned (assigned_to),
    INDEX idx_completed (completed),
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (assigned_to) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Assignee OR admin OR facilitator
WRITE: Admin OR facilitator
UPDATE: Assignee OR admin OR facilitator
```

---

### 17. EventRecording
**Description:** Event recording uploads  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE EventRecording (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    recording_url VARCHAR(500) NOT NULL,
    duration_minutes INT,
    uploaded_by VARCHAR(255),
    
    INDEX idx_event (event_id),
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (uploaded_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
```

---

### 18. EventMedia
**Description:** Photos and media from events  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE EventMedia (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(255),
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    caption TEXT,
    
    INDEX idx_event (event_id),
    INDEX idx_uploader (uploaded_by),
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (uploaded_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: All authenticated users
DELETE: Uploader OR admin
```

---

### 19. Poll
**Description:** Live polls during events  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Poll (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    question VARCHAR(500) NOT NULL,
    options JSON NOT NULL,
    votes JSON,
    related_event_id VARCHAR(255),
    status ENUM('active', 'closed') DEFAULT 'active',
    
    INDEX idx_event (related_event_id),
    INDEX idx_status (status),
    FOREIGN KEY (related_event_id) REFERENCES Event(id),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
UPDATE: Creator OR admin
```

---

## GAMIFICATION

### 20. Badge
**Description:** Achievement badges  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Badge (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    badge_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    category ENUM(
        'participation', 
        'achievement', 
        'milestone', 
        'special', 
        'seasonal'
    ) DEFAULT 'achievement',
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    criteria TEXT,
    points_value INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    times_awarded INT DEFAULT 0,
    
    INDEX idx_category (category),
    INDEX idx_rarity (rarity),
    INDEX idx_active (is_active)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 21. BadgeAward
**Description:** Badge awards to users  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE BadgeAward (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    badge_id VARCHAR(255) NOT NULL,
    awarded_date TIMESTAMP,
    awarded_by VARCHAR(255),
    reason TEXT,
    reference_id VARCHAR(255),
    
    INDEX idx_user (user_email),
    INDEX idx_badge (badge_id),
    INDEX idx_date (awarded_date),
    FOREIGN KEY (user_email) REFERENCES User(email),
    FOREIGN KEY (badge_id) REFERENCES Badge(id)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 22. UserPoints
**Description:** User gamification points  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserPoints (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL UNIQUE,
    total_points INT DEFAULT 0,
    points_this_month INT DEFAULT 0,
    points_last_month INT DEFAULT 0,
    lifetime_points INT DEFAULT 0,
    
    -- Streaks
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date TIMESTAMP,
    
    -- Tier
    tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    team_id VARCHAR(255),
    
    INDEX idx_user (user_email),
    INDEX idx_total_points (total_points),
    INDEX idx_tier (tier),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 23. PointsLedger
**Description:** Points transaction history  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE PointsLedger (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    amount INT NOT NULL,
    transaction_type ENUM(
        'event_attendance', 
        'activity_completion', 
        'feedback_submitted', 
        'badge_earned', 
        'challenge_completed', 
        'recognition_given', 
        'recognition_received', 
        'manual_adjustment', 
        'reward_redemption', 
        'bonus', 
        'penalty'
    ) NOT NULL,
    reference_type VARCHAR(255),
    reference_id VARCHAR(255),
    description TEXT,
    processed_by VARCHAR(255),
    balance_after INT,
    metadata JSON,
    
    INDEX idx_user (user_email),
    INDEX idx_type (transaction_type),
    INDEX idx_date (created_date),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 24. GamificationRule
**Description:** Automated gamification rules  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE GamificationRule (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    rule_name VARCHAR(500) NOT NULL,
    rule_type ENUM(
        'event_attendance', 
        'event_completion', 
        'feedback_submitted', 
        'recognition_given', 
        'recognition_received', 
        'skill_achievement', 
        'streak_milestone', 
        'challenge_completed', 
        'survey_completed', 
        'profile_completed', 
        'team_join', 
        'channel_participation', 
        'milestone_celebrated', 
        'points_threshold', 
        'activity_completion', 
        'first_time_action', 
        'consecutive_actions', 
        'referral_made'
    ) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Rewards
    points_reward INT DEFAULT 0,
    badge_id VARCHAR(255),
    
    -- Conditions
    trigger_conditions JSON COMMENT 'Object with threshold, time_period, comparison, entity_filters, requires_consecutive',
    
    -- Limits
    limit_per_user ENUM('once', 'daily', 'weekly', 'monthly', 'unlimited') DEFAULT 'unlimited',
    priority INT DEFAULT 0,
    
    -- Multipliers
    multiplier_rules JSON,
    
    -- Notifications
    notification_settings JSON,
    
    -- Analytics
    metadata JSON,
    times_triggered INT DEFAULT 0,
    last_triggered TIMESTAMP,
    
    INDEX idx_type (rule_type),
    INDEX idx_active (is_active),
    INDEX idx_priority (priority),
    FOREIGN KEY (badge_id) REFERENCES Badge(id)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 25. RuleExecution
**Description:** Gamification rule execution log  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE RuleExecution (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    rule_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    trigger_action VARCHAR(500),
    points_awarded INT,
    badge_awarded VARCHAR(255),
    multiplier_applied DECIMAL(5,2) DEFAULT 1.00,
    execution_metadata JSON,
    notification_sent BOOLEAN DEFAULT FALSE,
    
    INDEX idx_rule (rule_id),
    INDEX idx_user (user_email),
    INDEX idx_date (created_date),
    FOREIGN KEY (rule_id) REFERENCES GamificationRule(id),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: System (all authenticated)
```

---

### 26. AchievementTier
**Description:** Tier system for user progression  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE AchievementTier (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    tier_name VARCHAR(255) NOT NULL,
    tier_level INT NOT NULL,
    points_required INT NOT NULL,
    tier_icon VARCHAR(100),
    tier_color VARCHAR(50),
    perks JSON,
    badge_id VARCHAR(255),
    multiplier DECIMAL(5,2) DEFAULT 1.00,
    exclusive_rewards JSON,
    
    INDEX idx_level (tier_level),
    INDEX idx_points (points_required),
    FOREIGN KEY (badge_id) REFERENCES Badge(id)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin only
```

---

### 27. PersonalChallenge
**Description:** Individual user challenges  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE PersonalChallenge (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    challenge_type ENUM(
        'daily', 
        'weekly', 
        'milestone', 
        'streak', 
        'social', 
        'skill', 
        'exploration'
    ) DEFAULT 'weekly',
    difficulty ENUM('easy', 'medium', 'hard', 'epic') DEFAULT 'medium',
    
    -- Targets
    target_metric ENUM(
        'events_attended', 
        'feedback_submitted', 
        'recognitions_given', 
        'recognitions_received', 
        'streak_days', 
        'activities_completed', 
        'team_events', 
        'points_earned', 
        'badges_earned', 
        'connections_made'
    ) NOT NULL,
    target_value INT NOT NULL,
    current_progress INT DEFAULT 0,
    
    -- Rewards
    points_reward INT DEFAULT 50,
    badge_reward_id VARCHAR(255),
    
    -- Status
    status ENUM('active', 'completed', 'expired', 'abandoned') DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    completed_date TIMESTAMP,
    
    -- AI
    is_ai_generated BOOLEAN DEFAULT FALSE,
    personalization_context JSON,
    
    INDEX idx_user (user_email),
    INDEX idx_status (status),
    INDEX idx_type (challenge_type),
    FOREIGN KEY (user_email) REFERENCES User(email),
    FOREIGN KEY (badge_reward_id) REFERENCES Badge(id)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: Admin OR owner
```

---

### 28. TeamChallenge
**Description:** Team vs team challenges  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE TeamChallenge (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    challenge_type ENUM('points_race', 'activity_count', 'engagement', 'custom') DEFAULT 'points_race',
    participating_teams JSON DEFAULT '[]',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    winner_team_id VARCHAR(255),
    prize_description TEXT,
    
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
UPDATE: Admin OR creator
DELETE: Admin only
```

---

### 29. Reward
**Description:** Redeemable rewards  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Reward (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    reward_name VARCHAR(255) NOT NULL,
    description TEXT,
    points_cost INT NOT NULL,
    reward_type ENUM(
        'physical', 
        'digital', 
        'experience', 
        'time_off', 
        'perk', 
        'donation'
    ) NOT NULL,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT -1 COMMENT '-1 = unlimited',
    is_available BOOLEAN DEFAULT TRUE,
    tier_requirement VARCHAR(100),
    redemption_instructions TEXT,
    
    INDEX idx_available (is_available),
    INDEX idx_cost (points_cost),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Available OR admin
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 30. RewardRedemption
**Description:** Reward redemption transactions  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE RewardRedemption (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    reward_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    points_spent INT NOT NULL,
    status ENUM('pending', 'approved', 'fulfilled', 'cancelled') DEFAULT 'pending',
    fulfillment_notes TEXT,
    fulfilled_by VARCHAR(255),
    fulfilled_at TIMESTAMP,
    
    INDEX idx_reward (reward_id),
    INDEX idx_user (user_email),
    INDEX idx_status (status),
    FOREIGN KEY (reward_id) REFERENCES Reward(id),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: All authenticated users
UPDATE: Admin only
```

---

### 31. GamificationConfig
**Description:** Global gamification settings  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE GamificationConfig (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    config_key VARCHAR(255) DEFAULT 'default' UNIQUE,
    
    -- Module Toggles
    modules_enabled JSON COMMENT 'Object with badges, challenges, leaderboards, points, rewards, tiers, streaks, social_sharing',
    
    -- Theme
    theme JSON COMMENT 'Object with colors, badge_style, leaderboard_style, animations_enabled',
    
    -- Points Configuration
    points_config JSON COMMENT 'Object with default point values for actions',
    
    -- Difficulty
    difficulty_scaling JSON COMMENT 'Object with enabled, base_difficulty, auto_adjust, scaling_factor',
    
    -- Segmentation
    user_segments JSON,
    custom_badge_rules JSON,
    leaderboard_formats JSON,
    
    INDEX idx_config_key (config_key)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin only
```

---

### 32. GamificationABTest
**Description:** A/B testing for gamification elements  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE GamificationABTest (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    test_name VARCHAR(500) NOT NULL,
    test_description TEXT,
    element_type ENUM(
        'badge', 
        'challenge', 
        'points_multiplier', 
        'reward', 
        'leaderboard', 
        'notification', 
        'ui_element'
    ) NOT NULL,
    
    -- Variants
    variant_a JSON,
    variant_b JSON,
    
    -- Status
    status ENUM('draft', 'running', 'paused', 'completed', 'archived') DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Metrics
    target_metric ENUM(
        'engagement_rate', 
        'completion_rate', 
        'points_earned', 
        'retention', 
        'badge_claims', 
        'challenge_participation'
    ) NOT NULL,
    secondary_metrics JSON,
    sample_size_target INT,
    
    -- Results
    results JSON COMMENT 'Object with variant_a_users, variant_b_users, metrics, statistical_significance, winner, lift_percentage',
    user_assignments JSON,
    
    INDEX idx_status (status),
    INDEX idx_type (element_type)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 33. SocialShare
**Description:** Gamification achievements shared socially  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE SocialShare (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    share_type ENUM(
        'badge_earned', 
        'level_up', 
        'tier_achieved', 
        'challenge_completed', 
        'leaderboard_rank', 
        'streak_milestone', 
        'recognition_received'
    ) NOT NULL,
    reference_id VARCHAR(255),
    share_data JSON COMMENT 'Object with title, description, icon, value, image_url',
    platforms JSON DEFAULT '["internal"]',
    visibility ENUM('public', 'team_only', 'connections_only') DEFAULT 'public',
    
    -- Engagement
    reactions JSON COMMENT 'Object with likes, celebrates, inspired',
    reaction_users JSON,
    
    INDEX idx_user (user_email),
    INDEX idx_type (share_type),
    INDEX idx_visibility (visibility),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Public OR owner OR admin
WRITE: All authenticated users
UPDATE: Owner OR admin
```

---

### 34. StoreItem
**Description:** Point store items  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE StoreItem (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type ENUM('avatar_accessory', 'background', 'frame', 'emoji_pack') NOT NULL,
    price_points INT NOT NULL,
    stripe_price_id VARCHAR(255),
    preview_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    
    INDEX idx_type (item_type),
    INDEX idx_available (is_available)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin only
```

---

### 35. StoreTransaction
**Description:** Store purchase transactions  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE StoreTransaction (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    points_spent INT,
    stripe_session_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    
    INDEX idx_user (user_email),
    INDEX idx_item (item_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_email) REFERENCES User(email),
    FOREIGN KEY (item_id) REFERENCES StoreItem(id)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: All authenticated users
UPDATE: Admin only
```

---

### 36. UserAvatar
**Description:** User avatar customizations  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserAvatar (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL UNIQUE,
    avatar_config JSON,
    
    INDEX idx_user (user_email),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Owner only
UPDATE: Owner only
```

---

## LEARNING & DEVELOPMENT

### 37. LearningPath
**Description:** Structured learning paths  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE LearningPath (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    target_skill VARCHAR(255) NOT NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    estimated_duration VARCHAR(100),
    
    -- Structure
    milestones JSON DEFAULT '[]' COMMENT 'Array of milestone objects with id, title, description, order, estimated_hours',
    resources JSON DEFAULT '[]' COMMENT 'Array of resource objects with milestone_id, title, type, url, estimated_time, is_required',
    prerequisites JSON DEFAULT '[]',
    learning_outcomes JSON DEFAULT '[]',
    
    -- Type
    is_template BOOLEAN DEFAULT TRUE,
    created_for VARCHAR(255) COMMENT 'User email if personalized',
    ai_generated BOOLEAN DEFAULT FALSE,
    
    -- Rewards
    points_reward INT DEFAULT 100,
    
    INDEX idx_skill (target_skill),
    INDEX idx_difficulty (difficulty_level),
    INDEX idx_template (is_template),
    FOREIGN KEY (created_for) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Template OR created_for OR admin
WRITE: Admin OR facilitator
UPDATE: Admin OR created_for
DELETE: Admin only
```

---

### 38. LearningPathProgress
**Description:** User progress in learning paths  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE LearningPathProgress (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    learning_path_id VARCHAR(255) NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'paused') DEFAULT 'not_started',
    
    -- Dates
    started_date TIMESTAMP,
    completed_date TIMESTAMP,
    last_activity_date TIMESTAMP,
    
    -- Progress
    milestones_completed JSON DEFAULT '[]',
    resources_completed JSON DEFAULT '[]',
    progress_percentage INT DEFAULT 0,
    time_spent_hours INT DEFAULT 0,
    
    -- Notes
    notes TEXT,
    ai_next_steps JSON DEFAULT '[]',
    
    INDEX idx_user (user_email),
    INDEX idx_path (learning_path_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_progress (user_email, learning_path_id),
    FOREIGN KEY (user_email) REFERENCES User(email),
    FOREIGN KEY (learning_path_id) REFERENCES LearningPath(id)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: Owner only
UPDATE: Owner OR admin
DELETE: Owner OR admin
```

---

### 39. SkillTracking
**Description:** Individual skill development tracking  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE SkillTracking (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    current_level ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    activities_completed INT DEFAULT 0,
    last_practiced TIMESTAMP,
    
    INDEX idx_user (user_email),
    INDEX idx_skill (skill_name),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin
WRITE: Owner OR admin
```

---

## USER MANAGEMENT

### 40. UserProfile
**Description:** Extended user profile and preferences  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserProfile (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    
    -- Basic Profile
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    department VARCHAR(255),
    location VARCHAR(255),
    job_title VARCHAR(255),
    years_at_company INT,
    
    -- Activity Preferences
    activity_preferences JSON COMMENT 'Object with preferred_types, avoid_types, preferred_duration, energy_preference, group_size_preference, optimal_days, optimal_times, ai_creativity_level, custom_instructions',
    
    -- Notification Preferences
    notification_preferences JSON COMMENT 'Object with enabled_channels, event_reminders, recognition_notifications, survey_reminders, milestone_celebrations, wellness_reminders, recap_emails, digest_frequency, quiet_hours',
    
    -- Privacy Settings
    privacy_settings JSON COMMENT 'Object with profile_visibility, show_activity_history, show_badges, show_points, show_recognition, default_recognition_visibility, allow_mentions, show_location, show_department',
    
    -- Accessibility
    accessibility_settings JSON COMMENT 'Object with reduced_motion, high_contrast, font_size, screen_reader_optimized',
    
    -- Skills & Interests
    skill_interests JSON,
    skill_levels JSON,
    preferred_learning_styles JSON,
    expertise_areas JSON,
    learning_goals JSON,
    
    -- Personality
    personality_traits JSON COMMENT 'Object with introvert_extrovert, collaboration_style, communication_preference',
    languages_spoken JSON,
    
    -- History
    previous_event_attendance JSON,
    
    -- Stats
    engagement_stats JSON COMMENT 'Object with total_events_attended, total_activities_completed, average_engagement_score, favorite_activity_type, most_active_day, engagement_trend',
    
    -- Achievements
    achievements JSON,
    interests_tags JSON,
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    INDEX idx_user (user_email),
    INDEX idx_status (status),
    INDEX idx_department (department),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Admin OR owner (privacy-filtered for others)
WRITE: Admin OR owner
```

---

### 41. UserOnboarding
**Description:** New employee onboarding tracking  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserOnboarding (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    expected_completion_date TIMESTAMP,
    completion_date TIMESTAMP,
    status ENUM('not_started', 'in_progress', 'completed', 'extended') DEFAULT 'not_started',
    
    -- Progress
    milestones_completed JSON DEFAULT '[]',
    tasks_completed INT DEFAULT 0,
    total_tasks INT DEFAULT 0,
    
    -- Assignment
    role VARCHAR(255),
    department VARCHAR(255),
    assigned_buddy VARCHAR(255),
    manager_email VARCHAR(255),
    
    -- Feedback
    feedback_30_day TEXT,
    satisfaction_score INT COMMENT '1-10',
    
    -- Reminders
    last_reminder_sent TIMESTAMP,
    
    INDEX idx_user (user_email),
    INDEX idx_status (status),
    FOREIGN KEY (user_email) REFERENCES User(email),
    FOREIGN KEY (assigned_buddy) REFERENCES User(email),
    FOREIGN KEY (manager_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner OR admin OR manager OR buddy
WRITE: Admin only
UPDATE: Admin OR owner
```

---

### 42. UserInvitation
**Description:** User invitation tracking  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserInvitation (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    email VARCHAR(255) NOT NULL,
    invited_by VARCHAR(255) NOT NULL,
    role ENUM('admin', 'facilitator', 'participant') DEFAULT 'participant',
    status ENUM('pending', 'accepted', 'expired', 'revoked') DEFAULT 'pending',
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    message TEXT,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_token (token),
    FOREIGN KEY (invited_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 43. UserRole
**Description:** Custom role definitions  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserRole (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    role_name VARCHAR(255) NOT NULL,
    permissions JSON,
    description TEXT,
    
    INDEX idx_role_name (role_name)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 44. UserRoleAssignment
**Description:** User to role assignments  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserRoleAssignment (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    role_id VARCHAR(255) NOT NULL,
    assigned_by VARCHAR(255),
    
    INDEX idx_user (user_email),
    INDEX idx_role (role_id),
    FOREIGN KEY (user_email) REFERENCES User(email),
    FOREIGN KEY (role_id) REFERENCES UserRole(id)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 45. UserPreferences
**Description:** Generic user preferences storage  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE UserPreferences (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL UNIQUE,
    preferences JSON,
    
    INDEX idx_user (user_email),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner only
WRITE: Owner only
```

---

### 46. ActivityFavorite
**Description:** User favorited activities  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE ActivityFavorite (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    activity_id VARCHAR(255) NOT NULL,
    notes TEXT,
    
    INDEX idx_user (user_email),
    INDEX idx_activity (activity_id),
    UNIQUE KEY unique_favorite (user_email, activity_id),
    FOREIGN KEY (user_email) REFERENCES User(email),
    FOREIGN KEY (activity_id) REFERENCES Activity(id)
);
```

**RBAC Rules:**
```
READ: Owner only
WRITE: Owner only
DELETE: Owner only
```

---

## COMMUNICATION

### 47. Team
**Description:** Teams and departments  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Team (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    team_name VARCHAR(255) NOT NULL,
    description TEXT,
    team_type ENUM('department', 'project', 'interest', 'location') DEFAULT 'department',
    avatar_url VARCHAR(500),
    color VARCHAR(50),
    leader_email VARCHAR(255),
    member_count INT DEFAULT 0,
    total_points INT DEFAULT 0,
    badges_earned JSON DEFAULT '[]',
    is_private BOOLEAN DEFAULT FALSE,
    
    INDEX idx_leader (leader_email),
    INDEX idx_type (team_type),
    INDEX idx_private (is_private),
    FOREIGN KEY (leader_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Public OR admin
WRITE: Admin OR facilitator
UPDATE: Admin OR leader
DELETE: Admin only
```

---

### 48. TeamMembership
**Description:** Team member relationships  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE TeamMembership (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    team_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    role ENUM('member', 'moderator', 'leader') DEFAULT 'member',
    joined_at TIMESTAMP,
    
    INDEX idx_team (team_id),
    INDEX idx_user (user_email),
    UNIQUE KEY unique_membership (team_id, user_email),
    FOREIGN KEY (team_id) REFERENCES Team(id),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: All authenticated users
UPDATE: Admin OR owner
DELETE: Admin OR owner
```

---

### 49. TeamInvitation
**Description:** Team invitations  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE TeamInvitation (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    team_id VARCHAR(255) NOT NULL,
    invitee_email VARCHAR(255) NOT NULL,
    invited_by VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    
    INDEX idx_team (team_id),
    INDEX idx_invitee (invitee_email),
    INDEX idx_status (status),
    FOREIGN KEY (team_id) REFERENCES Team(id),
    FOREIGN KEY (invitee_email) REFERENCES User(email),
    FOREIGN KEY (invited_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Invitee OR inviter OR admin
WRITE: All authenticated users
UPDATE: Invitee OR admin
```

---

### 50. TeamMessage
**Description:** Team chat messages  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE TeamMessage (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    team_id VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    INDEX idx_team (team_id),
    INDEX idx_sender (sender_email),
    INDEX idx_date (created_date),
    FOREIGN KEY (team_id) REFERENCES Team(id),
    FOREIGN KEY (sender_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: All authenticated users
DELETE: Sender OR admin
```

---

### 51. Channel
**Description:** Communication channels  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Channel (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    channel_name VARCHAR(255) NOT NULL,
    description TEXT,
    channel_type ENUM('public', 'private', 'announcement') DEFAULT 'public',
    member_count INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    team_id VARCHAR(255),
    
    INDEX idx_type (channel_type),
    INDEX idx_archived (is_archived),
    INDEX idx_team (team_id),
    FOREIGN KEY (team_id) REFERENCES Team(id),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Public OR announcement OR admin
WRITE: Admin OR facilitator
UPDATE: Admin OR creator
DELETE: Admin OR creator
```

---

### 52. ChannelMessage
**Description:** Channel messages  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE ChannelMessage (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    channel_id VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    message TEXT NOT NULL,
    attachments JSON DEFAULT '[]',
    reactions JSON DEFAULT '[]',
    
    INDEX idx_channel (channel_id),
    INDEX idx_sender (sender_email),
    INDEX idx_date (created_date),
    FOREIGN KEY (channel_id) REFERENCES Channel(id),
    FOREIGN KEY (sender_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: All authenticated users
UPDATE: Sender only
DELETE: Sender OR admin
```

---

### 53. Notification
**Description:** In-app notifications  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Notification (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255) NOT NULL,
    type ENUM(
        'event_reminder', 
        'recognition_received', 
        'badge_earned', 
        'survey_invite', 
        'milestone_celebration', 
        'challenge_update', 
        'system'
    ) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    metadata JSON,
    
    INDEX idx_user (user_email),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_date (created_date),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Owner only
WRITE: Admin only
UPDATE: Owner only
DELETE: Owner only
```

---

### 54. Announcement
**Description:** Company-wide announcements  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Announcement (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    target_audience ENUM('all', 'team', 'department') DEFAULT 'all',
    is_pinned BOOLEAN DEFAULT FALSE,
    
    INDEX idx_priority (priority),
    INDEX idx_pinned (is_pinned),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
```

---

## ANALYTICS & REPORTING

### 55. AnalyticsSnapshot
**Description:** Point-in-time analytics data  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE AnalyticsSnapshot (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    snapshot_date DATE NOT NULL,
    metrics JSON NOT NULL,
    period_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
    
    INDEX idx_date (snapshot_date),
    INDEX idx_period (period_type)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 56. LeaderboardSnapshot
**Description:** Leaderboard historical data  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE LeaderboardSnapshot (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    snapshot_date DATE NOT NULL,
    leaderboard_type VARCHAR(255) NOT NULL,
    rankings JSON NOT NULL,
    
    INDEX idx_date (snapshot_date),
    INDEX idx_type (leaderboard_type)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin only
```

---

### 57. FeedbackAnalysis
**Description:** AI analysis of event feedback  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE FeedbackAnalysis (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255) NOT NULL,
    analysis_data JSON,
    sentiment_score DECIMAL(5,2),
    
    INDEX idx_event (event_id),
    FOREIGN KEY (event_id) REFERENCES Event(id)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 58. SkillTrendAnalysis
**Description:** Skill development trends  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE SkillTrendAnalysis (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    skill_name VARCHAR(255) NOT NULL,
    trend_data JSON,
    period VARCHAR(100),
    
    INDEX idx_skill (skill_name)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 59. AIInsight
**Description:** AI-generated insights  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE AIInsight (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    insight_type VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    generated_date TIMESTAMP,
    
    INDEX idx_type (insight_type),
    INDEX idx_date (generated_date)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 60. AIRecommendation
**Description:** AI activity recommendations  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE AIRecommendation (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    recommendation_type ENUM('rule_based', 'ai_generated', 'hybrid') NOT NULL,
    activity_id VARCHAR(255),
    custom_activity_data JSON,
    reasoning TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    context JSON COMMENT 'Object with recent_activities, engagement_metrics, date_context',
    status ENUM('pending', 'accepted', 'dismissed', 'modified') DEFAULT 'pending',
    lisa_feedback TEXT,
    
    INDEX idx_type (recommendation_type),
    INDEX idx_status (status),
    FOREIGN KEY (activity_id) REFERENCES Activity(id)
);
```

**RBAC Rules:**
```
READ: Admin OR facilitator
WRITE: Admin only
```

---

## ADMINISTRATION

### 61. AuditLog
**Description:** Security and compliance audit trail  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE AuditLog (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    action ENUM(
        'user_created', 
        'user_updated', 
        'user_suspended', 
        'user_activated', 
        'role_changed', 
        'invitation_sent', 
        'invitation_revoked', 
        'data_exported', 
        'settings_changed', 
        'event_created', 
        'event_deleted'
    ) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100),
    target_email VARCHAR(255),
    entity_type VARCHAR(255),
    entity_id VARCHAR(255),
    changes JSON COMMENT 'Object with before and after values',
    metadata JSON,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    
    INDEX idx_action (action),
    INDEX idx_actor (actor_email),
    INDEX idx_date (created_date),
    INDEX idx_severity (severity),
    FOREIGN KEY (actor_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
UPDATE: Admin only
DELETE: Admin only
```

---

### 62. Asset
**Description:** File uploads and media assets  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Asset (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    related_to VARCHAR(255),
    related_type ENUM('activity', 'event', 'participation'),
    
    INDEX idx_related (related_to, related_type),
    INDEX idx_creator (created_by)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: All authenticated users
DELETE: Creator OR admin
```

---

### 63. ProjectDocumentation
**Description:** Internal project documentation  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE ProjectDocumentation (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    title VARCHAR(500) NOT NULL,
    content TEXT,
    category VARCHAR(255),
    
    INDEX idx_category (category)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

## SYSTEM & CONFIGURATION

### 64. Integration
**Description:** Third-party integration configurations  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE Integration (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    integration_type VARCHAR(255) NOT NULL,
    config JSON,
    enabled BOOLEAN DEFAULT FALSE,
    
    INDEX idx_type (integration_type),
    INDEX idx_enabled (enabled)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 65. TeamsConfig
**Description:** Microsoft Teams integration settings  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE TeamsConfig (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    webhook_url VARCHAR(500),
    enabled BOOLEAN DEFAULT FALSE,
    notification_types JSON,
    
    INDEX idx_enabled (enabled)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 66. ActivityModule
**Description:** Activity module collections  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE ActivityModule (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    module_name VARCHAR(255) NOT NULL,
    description TEXT,
    activities JSON,
    
    INDEX idx_creator (created_by),
    FOREIGN KEY (created_by) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: All users
WRITE: Admin OR facilitator
```

---

### 67. EventManager
**Description:** AI event management metadata  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE EventManager (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    event_id VARCHAR(255),
    ai_data JSON,
    
    INDEX idx_event (event_id),
    FOREIGN KEY (event_id) REFERENCES Event(id)
);
```

**RBAC Rules:**
```
READ: Admin OR facilitator
WRITE: Admin only
```

---

### 68. RewardManager
**Description:** Reward management metadata  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE RewardManager (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    reward_id VARCHAR(255),
    management_data JSON,
    
    INDEX idx_reward (reward_id),
    FOREIGN KEY (reward_id) REFERENCES Reward(id)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

### 69. GamificationAssistant
**Description:** AI gamification assistant data  
**Primary Keys:** id, created_date, updated_date, created_by

```sql
CREATE TABLE GamificationAssistant (
    id VARCHAR(255) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    
    user_email VARCHAR(255),
    assistance_data JSON,
    
    INDEX idx_user (user_email),
    FOREIGN KEY (user_email) REFERENCES User(email)
);
```

**RBAC Rules:**
```
READ: Admin only
WRITE: Admin only
```

---

## ENTITY RELATIONSHIPS

### Primary Relationships

```
User (1) ──< (M) Recognition (sender/recipient)
User (1) ──< (M) UserProfile
User (1) ──< (M) UserPoints
User (1) ──< (M) UserOnboarding
User (1) ──< (M) BadgeAward
User (1) ──< (M) PointsLedger
User (1) ──< (M) Participation
User (1) ──< (M) TeamMembership
User (1) ──< (M) Milestone

Activity (1) ──< (M) Event
Event (1) ──< (M) Participation
Event (1) ──< (M) EventBookmark
Event (1) ──< (M) EventMedia
Event (1) ──< (M) EventRecording

Survey (1) ──< (M) SurveyResponse

LearningPath (1) ──< (M) LearningPathProgress

Team (1) ──< (M) TeamMembership
Team (1) ──< (M) TeamChallenge
Team (1) ──< (M) Channel

Badge (1) ──< (M) BadgeAward
Reward (1) ──< (M) RewardRedemption

GamificationRule (1) ──< (M) RuleExecution
```

---

## BUILT-IN FIELDS

**All entities automatically include:**

```sql
id VARCHAR(255) PRIMARY KEY
created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
created_by VARCHAR(255) NOT NULL  -- Email of creator
```

**Indexes automatically created on:**
- `id` (primary key)
- `created_date`
- `created_by`

---

## DATA TYPES MAPPING

**Base44 (NoSQL) → SQL Equivalent:**

| Base44 Type | SQL Type | Notes |
|-------------|----------|-------|
| string | VARCHAR(255) or TEXT | Length based on usage |
| number | INT or DECIMAL | Based on precision needs |
| boolean | BOOLEAN | TRUE/FALSE |
| array | JSON | Stored as JSON array |
| object | JSON | Stored as JSON object |
| date | DATE | YYYY-MM-DD |
| date-time | TIMESTAMP | Full datetime with timezone |
| enum | ENUM(...) | Fixed set of values |

---

## SECURITY NOTES

### 1. Row-Level Security (RBAC)
All entities enforce permissions at the database level through JSON-based rules that evaluate:
- `user.email` - Current authenticated user's email
- `user.role` - 'admin' or 'user'
- `user.user_type` - 'facilitator' or 'participant'

### 2. PII Protection
- **UserProfile**: Privacy settings control field visibility
- **SurveyResponse**: Anonymized with hashed emails
- **Recognition**: Visibility controls (public/private/team_only)

### 3. Admin-Only Access
Highly sensitive entities restricted to admin role:
- AuditLog
- UserInvitation
- UserRole
- GamificationConfig
- AnalyticsSnapshot

### 4. Self-Service Access
Users can only access their own:
- UserProfile
- UserPoints
- PointsLedger
- Notifications
- Bookmarks
- Preferences

---

## PERFORMANCE CONSIDERATIONS

### Indexes Created
- Primary keys: All `id` fields
- Foreign keys: All relationship fields
- Commonly queried fields: `status`, `type`, `user_email`, `event_id`, etc.
- Date fields: `created_date`, `scheduled_date`, `start_date`, `end_date`

### Composite Indexes
- `(event_id, user_email)` on Participation
- `(team_id, user_email)` on TeamMembership
- `(user_email, learning_path_id)` on LearningPathProgress

### JSON Field Usage
- Flexible schemas stored in JSON fields
- Not directly indexed but can be queried via JSON operators
- Examples: `preferences`, `metadata`, `trigger_conditions`

---

## COMPLIANCE & PRIVACY

### GDPR/CCPA Compliance
- **Right to Access**: All user data queryable via user_email
- **Right to Deletion**: Cascade rules on user deletion
- **Right to Export**: All entities filterable by user_email
- **Anonymization**: Survey responses use hashed emails
- **Consent**: Privacy settings in UserProfile

### Data Retention
- AuditLog: Permanent retention for compliance
- AnalyticsSnapshot: 2-year rolling window
- Notifications: 90-day retention
- Survey responses: Retained per survey settings

---

## APPENDIX

### Total Entity Count: 73 Tables

**By Category:**
- Built-in: 1
- Core Engagement: 4
- Event Management: 15
- Gamification: 16
- Learning & Development: 3
- User Management: 7
- Communication: 8
- Analytics: 6
- Administration: 3
- System & Configuration: 10

### Database Technology
- **Platform**: Base44 NoSQL/Document Database
- **Query Language**: JavaScript/TypeScript via Base44 SDK
- **Real-time**: Supported via subscriptions
- **Transactions**: Atomic operations on single documents

---

**END OF TECHNICAL SPECIFICATION**

*This document represents the complete database schema for the INTeract Employee Engagement Platform as of 2025-12-29. All 73 entities are documented with full field definitions, data types, relationships, indexes, and RBAC rules.*