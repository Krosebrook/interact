# INTeract Employee Engagement Platform - Complete System Architecture

## Executive Summary
INTeract is a comprehensive employee engagement platform built for remote-first companies (50-200 employees). The system combines gamification, learning management, social features, recognition, and analytics to create a cohesive employee experience.

**Technology Stack**:
- Frontend: React 18 + TailwindCSS + shadcn/ui
- Backend: Base44 BaaS (Backend-as-a-Service)
- Database: Entity-based (Base44 managed)
- Functions: Deno Deploy serverless
- AI: Integration with LLM providers (OpenAI, Anthropic)
- Auth: JWT-based with role-based access control

---

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Pages   │  │Components│  │  Hooks   │  │ Layouts │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │              │             │      │
│       └─────────────┴──────────────┴─────────────┘      │
│                          │                               │
│                    Base44 SDK                            │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│                  Base44 Backend (BaaS)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Entities  │  │ Functions  │  │Integrations│        │
│  │  (Data)    │  │  (Deno)    │  │  (AI/3rd)  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│         │               │                │               │
│         └───────────────┴────────────────┘               │
│                    Database Layer                        │
└──────────────────────────────────────────────────────────┘
```

### Component Organization

#### Frontend Structure
```
/pages                  # Top-level routes
  /Dashboard.jsx
  /LearningDashboard.jsx
  /GamificationAdmin.jsx
  /ParticipantPortal.jsx
  ...

/components
  /admin               # Admin-only components
    /gamification
    /UserManagementPanel.jsx
  /learning           # Learning features
    /GamifiedLearningDashboard.jsx
    /LearningPathCard.jsx
  /gamification       # Gamification widgets
  /social             # Recognition, teams, channels
  /common             # Shared UI components
  /hooks              # Custom React hooks
  /profile            # User profile features

/functions            # Backend serverless functions
  /learningPathAI.js
  /gamificationAI.js
  /aiContentGenerator.js

/entities             # Data model definitions (JSON schemas)
  /UserProfile.json
  /LearningPath.json
  /UserPoints.json
  ...
```

---

## Data Model (Entities)

### Core User & Profile

#### User (Built-in)
```json
{
  "id": "string (auto)",
  "email": "string (unique)",
  "full_name": "string",
  "role": "admin | user",
  "created_date": "datetime (auto)",
  "user_type": "admin | facilitator | participant (custom)"
}
```

**Security**: 
- Admins can view/edit all users
- Users can only view/edit themselves
- Built-in entity, cannot be modified

#### UserProfile
```json
{
  "user_email": "string (FK to User)",
  "status": "active | suspended | pending",
  "display_name": "string",
  "bio": "string",
  "avatar_url": "string",
  "department": "string",
  "location": "string",
  "job_title": "string",
  "years_at_company": "number",
  "skill_interests": ["string"],
  "skill_levels": [{"skill": "string", "level": "beginner|intermediate|advanced|expert"}],
  "expertise_areas": ["string"],
  "learning_goals": ["string"],
  "activity_preferences": {
    "preferred_types": ["icebreaker|creative|competitive|wellness|learning|social"],
    "avoid_types": ["..."],
    "preferred_duration": "5-15min|15-30min|30+min",
    "energy_preference": "low|medium|high"
  },
  "notification_preferences": {
    "enabled_channels": ["email", "teams", "slack", "in_app"],
    "event_reminders": "none|1h|24h|both",
    "recognition_notifications": true,
    "digest_frequency": "daily|weekly|never"
  },
  "privacy_settings": {
    "profile_visibility": "public|team_only|private",
    "show_activity_history": true,
    "show_badges": true
  }
}
```

**Permissions**: User can edit their own, admins can edit all

---

### Gamification System

#### UserPoints
```json
{
  "user_email": "string (FK)",
  "total_points": "number (default 0)",
  "points_this_month": "number",
  "lifetime_points": "number",
  "current_streak": "number",
  "longest_streak": "number",
  "tier": "bronze|silver|gold|platinum",
  "team_id": "string (optional)"
}
```

**Calculated Fields**:
- `tier`: Auto-assigned based on total_points thresholds
- `current_streak`: Days with consecutive activity

#### PointsLedger (Transaction Log)
```json
{
  "user_email": "string",
  "amount": "number (can be negative)",
  "transaction_type": "event_attendance|badge_earned|manual_adjustment|...",
  "reference_type": "Event|Badge|Challenge|...",
  "reference_id": "string",
  "description": "string",
  "balance_after": "number",
  "processed_by": "string (admin email for manual)",
  "created_date": "datetime (auto)"
}
```

**Audit Trail**: All point changes tracked here

#### Badge
```json
{
  "badge_name": "string",
  "description": "string",
  "icon_url": "string",
  "category": "participation|achievement|milestone|special|seasonal",
  "rarity": "common|rare|epic|legendary",
  "criteria": "string (how to earn)",
  "points_value": "number",
  "is_active": "boolean",
  "times_awarded": "number (counter)"
}
```

#### BadgeAward
```json
{
  "user_email": "string",
  "badge_id": "string (FK to Badge)",
  "awarded_date": "datetime",
  "awarded_by": "system|admin email",
  "reason": "string",
  "reference_id": "string (triggering event)"
}
```

**Unique Constraint**: user_email + badge_id (one badge per user)

#### GamificationRule
```json
{
  "rule_name": "string",
  "description": "string",
  "trigger_event": "event_attendance|recognition_sent|challenge_complete|...",
  "conditions": {
    "event_type": "string (optional filter)",
    "min_participants": "number"
  },
  "points_reward": "number",
  "badge_id": "string (optional)",
  "priority": "number (1-100)",
  "is_active": "boolean"
}
```

**Execution**: Rules evaluated in priority order when trigger fires

---

### Learning System

#### LearningPath
```json
{
  "title": "string",
  "description": "string",
  "target_skill": "string",
  "difficulty_level": "beginner|intermediate|advanced|expert",
  "estimated_duration": "string (e.g., '2 weeks')",
  "milestones": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "order": "number",
      "estimated_hours": "number"
    }
  ],
  "learning_outcomes": ["string"],
  "prerequisites": ["string"],
  "is_template": "boolean",
  "created_for": "string (user_email if personalized)",
  "ai_generated": "boolean",
  "points_reward": "number"
}
```

**Types**:
- Template paths: Available to all users
- Personalized paths: AI-generated for specific user

#### LearningModule
```json
{
  "learning_path_id": "string (FK)",
  "module_name": "string",
  "description": "string",
  "order": "number",
  "module_type": "video|reading|quiz|exercise|project|checkpoint",
  "content_url": "string",
  "estimated_time_minutes": "number",
  "points_reward": "number",
  "is_required": "boolean",
  "prerequisites": ["module_id"],
  "quiz_questions": [
    {
      "question": "string",
      "options": ["string"],
      "correct_answer": "number (index)",
      "explanation": "string"
    }
  ],
  "passing_score": "number (percentage)"
}
```

#### LearningPathProgress
```json
{
  "user_email": "string",
  "learning_path_id": "string",
  "status": "not_started|in_progress|completed|paused",
  "started_date": "datetime",
  "completed_date": "datetime",
  "milestones_completed": [{"milestone_id": "string", "completed_date": "datetime"}],
  "progress_percentage": "number",
  "time_spent_hours": "number",
  "ai_next_steps": ["string"]
}
```

#### ModuleCompletion
```json
{
  "user_email": "string",
  "module_id": "string",
  "learning_path_id": "string",
  "status": "not_started|in_progress|completed|failed",
  "started_date": "datetime",
  "completed_date": "datetime",
  "quiz_score": "number (percentage)",
  "quiz_attempts": "number",
  "time_spent_minutes": "number",
  "points_earned": "number"
}
```

---

### Activities & Events

#### Activity (Template)
```json
{
  "title": "string",
  "description": "string",
  "instructions": "string",
  "type": "icebreaker|creative|competitive|wellness|learning|social",
  "duration": "5-15min|15-30min|30+min",
  "capacity": "number (optional)",
  "materials_needed": "string",
  "image_url": "string",
  "skills_developed": ["string"],
  "skill_level": "beginner|intermediate|advanced",
  "learning_outcomes": ["string"],
  "is_template": "boolean",
  "created_by": "string (for custom activities)"
}
```

#### Event
```json
{
  "activity_id": "string (FK)",
  "title": "string",
  "event_type": "meeting|workshop|training|social|wellness|...",
  "scheduled_date": "datetime",
  "duration_minutes": "number",
  "status": "draft|scheduled|in_progress|completed|cancelled",
  "magic_link": "string (unique access URL)",
  "max_participants": "number",
  "event_format": "online|offline|hybrid",
  "location": "string",
  "meeting_link": "string",
  "facilitator_email": "string",
  "is_recurring": "boolean",
  "series_id": "string (for recurring events)",
  "points_awarded": "number",
  "registration_required": "boolean",
  "google_calendar_id": "string"
}
```

#### Participation
```json
{
  "event_id": "string",
  "user_email": "string",
  "rsvp_status": "yes|no|maybe|pending",
  "attendance_status": "attended|no_show|cancelled|pending",
  "check_in_time": "datetime",
  "engagement_score": "number (1-10)",
  "feedback": "string",
  "feedback_rating": "number (1-5)",
  "points_earned": "number"
}
```

---

### Social Features

#### Recognition
```json
{
  "sender_email": "string",
  "sender_name": "string",
  "recipient_email": "string",
  "recipient_name": "string",
  "message": "string",
  "category": "teamwork|innovation|leadership|going_above|...",
  "company_values": ["string"],
  "points_awarded": "number",
  "visibility": "public|private|team_only",
  "status": "pending|approved|flagged|rejected",
  "is_featured": "boolean",
  "ai_flag_reason": "string (if flagged)",
  "reactions": [{"emoji": "string", "user_email": "string"}],
  "image_url": "string (optional)"
}
```

**Moderation**: AI pre-screening, manual review queue for admins

#### Team
```json
{
  "team_name": "string",
  "description": "string",
  "team_type": "department|project|interest|social",
  "privacy": "public|private|invite_only",
  "leader_email": "string",
  "member_count": "number",
  "created_by": "string",
  "is_active": "boolean"
}
```

#### TeamMembership
```json
{
  "team_id": "string",
  "user_email": "string",
  "role": "member|moderator|leader",
  "joined_at": "datetime"
}
```

#### Channel
```json
{
  "channel_name": "string",
  "description": "string",
  "channel_type": "public|private|announcement",
  "created_by": "string",
  "member_count": "number",
  "team_id": "string (optional)",
  "is_archived": "boolean"
}
```

---

### Onboarding

#### UserOnboarding
```json
{
  "user_email": "string",
  "start_date": "datetime",
  "expected_completion_date": "datetime",
  "completion_date": "datetime",
  "status": "not_started|in_progress|completed|extended",
  "milestones_completed": [
    {
      "day": "number",
      "title": "string",
      "completed_date": "datetime"
    }
  ],
  "role": "string",
  "department": "string",
  "assigned_buddy": "string (email)",
  "manager_email": "string",
  "satisfaction_score": "number (1-10)"
}
```

#### BuddyMatch
```json
{
  "user_email": "string",
  "buddy_email": "string",
  "match_type": "peer_buddy|mentor|mentee",
  "status": "pending|accepted|active|completed|declined",
  "match_score": "number (AI confidence 0-100)",
  "shared_interests": ["string"],
  "match_reasoning": "string (AI explanation)",
  "goals": ["string"],
  "interactions_count": "number"
}
```

---

### Analytics & Admin

#### AuditLog
```json
{
  "action": "user_created|role_changed|data_exported|...",
  "actor_email": "string",
  "actor_role": "string",
  "target_email": "string",
  "entity_type": "string",
  "entity_id": "string",
  "changes": {
    "before": {},
    "after": {}
  },
  "metadata": {
    "ip": "string",
    "user_agent": "string"
  },
  "severity": "low|medium|high|critical"
}
```

#### Notification
```json
{
  "user_email": "string",
  "type": "event_reminder|recognition_received|badge_earned|...",
  "title": "string",
  "message": "string",
  "link": "string (deep link)",
  "is_read": "boolean",
  "read_at": "datetime",
  "priority": "low|normal|high"
}
```

---

## Backend Functions

### Learning AI (`learningPathAI.js`)

**Endpoints**:
1. `suggest_paths`: AI-driven learning path recommendations
   - Input: User profile, skills, goals
   - Output: 5-7 personalized path recommendations with relevance scores
   - Uses: User's skill_interests, learning_goals, completed paths

2. `generate_modules`: Create module curriculum for a learning path
   - Input: path_title, target_skill
   - Output: 5-8 structured modules with quizzes
   - Types: video, reading, quiz, exercise, project, checkpoint

3. `analyze_progress`: Personalized feedback on learning journey
   - Input: learning_path_id, user_email
   - Output: Progress assessment, strengths, next steps, motivation
   - Tracks: Module completions, quiz scores, time spent

4. `analyze_skill_gaps_with_micro`: Identify quick-win learning opportunities
   - Input: user_email
   - Output: 3-5 skill gaps addressable with micro-learning
   - Focus: 5-10 minute modules, immediately applicable

5. `generate_micro_modules`: Create bite-sized learning content
   - Input: skill_gap
   - Output: 3-4 micro-modules (5-10 min each)
   - Formats: video, exercise, article, interactive

**AI Model**: LLM with structured JSON output
**Auth**: Service role for cross-user data access
**Cache**: No caching (fresh recommendations each time)

### Gamification AI (`gamificationAI.js`)

**Endpoints**:
1. `adjust_challenge_difficulty`: Dynamic challenge balancing
   - Analyzes: Team performance over 30 days
   - Recommends: Difficulty, point multipliers, duration
   - Considers: Engagement rate, completion rate, skill diversity

2. `suggest_personal_badges`: Custom badge recommendations
   - Input: User activity history, profile, achievements
   - Output: 3-5 personalized badge ideas
   - Aligns: With user's role, skills, and contributions

3. `recommend_team_challenges`: Team-based event suggestions
   - Analyzes: Team metrics, event attendance, recognition patterns
   - Recommends: 3-5 challenges targeting team weaknesses
   - Promotes: Collaboration, skill development, engagement

**Auth**: Admin only
**Performance**: ~5-15 seconds per request
**Data Sources**: UserPoints, Participation, Recognition, Challenges

### AI Content Generator (`aiContentGenerator.js`)

**Endpoints**:
1. `generate_learning_path`: Complete learning path outline
   - Input: skill_gap, target_level, duration
   - Output: Title, description, 5-8 milestones, outcomes, prerequisites
   - Format: Ready to save as LearningPath entity

2. `generate_quiz`: Quiz question generation
   - Input: topic, question_count, difficulty
   - Output: Multiple-choice questions with explanations
   - Quality: Mix of conceptual, applied, scenario-based

3. `generate_video_script`: Micro-learning video scripts
   - Input: topic, duration, tone
   - Output: Hook, sectioned script with timestamps, visuals, CTA
   - Tones: professional, casual, energetic, storytelling

**Auth**: Admin only
**Rate Limit**: 10 requests/minute per admin
**Validation**: JSON schema enforcement on AI responses

### Onboarding AI (`newEmployeeOnboardingAI.js`)

**Endpoints**:
1. `generate_onboarding_plan`: 30-day personalized onboarding
   - Input: role, department, start_date
   - Output: Week-by-week milestones and activities
   - Adapts: To role level (entry, mid, senior)

2. `generate_introduction`: Team introduction script
   - Creates: Ice-breaker questions, team overview, first-week tips
   - Personalizes: Based on department and role

3. `generate_tasks`: Role-specific onboarding tasks
   - Output: Actionable tasks with timelines
   - Categories: Setup, training, relationships, projects

4. `generate_learning_resources`: Curated learning materials
   - Recommends: Internal docs, courses, tools, contacts
   - Prioritizes: Critical vs. optional

5. `generate_starter_projects`: First project suggestions
   - Creates: Low-risk, high-visibility starter projects
   - Aligns: With team needs and user skills

6. `generate_feedback`: Progress check-ins
   - Input: tasks_completed, satisfaction_score
   - Output: Encouraging feedback, suggestions, next focus areas

**Auth**: User can access their own, admins see all
**Cadence**: Reminders sent via scheduled function

### Buddy Matching AI (`buddyMatchingAI.js`)

**Endpoints**:
1. `find_buddy_matches`: Intelligent peer/mentor matching
   - Input: user_email, match_type
   - Output: 5-10 potential matches with compatibility scores
   - Factors: Skill overlap, goals alignment, personality traits

2. `suggest_interaction_activities`: Buddy relationship activities
   - Input: buddy_match_id
   - Output: Conversation starters, collaboration ideas, challenges
   - Adapts: To match type (peer vs mentor/mentee)

**Algorithm**: 
- Shared interests: 30% weight
- Complementary skills: 25%
- Department diversity: 20%
- Communication style: 15%
- Availability overlap: 10%

### Team Coaching AI (`teamCoachingAI.js`)

**Endpoints**:
1. `analyze_team_dynamics`: Team health assessment
   - Metrics: Engagement, collaboration, recognition patterns
   - Output: Strengths, areas for improvement, risk factors

2. `suggest_interventions`: Data-driven team interventions
   - Recommends: Activities, policies, or structural changes
   - Based on: Team performance trends

**Auth**: Team leaders and admins only
**Privacy**: Aggregated data, no individual call-outs

### Gamification Personalization AI (`gamificationPersonalizationAI.js`)

**Endpoints**:
1. `suggest_ai_customizations`: Personalized gamification tweaks
   - Input: User preferences, activity history
   - Output: Widget layouts, notification timing, challenge types
   - Goal: Maximize engagement without overwhelming

2. `optimize_dashboard`: User-specific dashboard recommendations
   - Suggests: Which widgets to show/hide
   - Based on: Usage patterns and goals

**Auth**: User-scoped (own data only)
**Update Frequency**: Weekly recommendations

---

## Security & Permissions

### Role Hierarchy
```
Admin (full access)
  └─ Can impersonate any role
  └─ Access all data, all functions
  └─ Manage users, rules, content

Facilitator (event organizers, team leads)
  └─ Create/manage events
  └─ View team analytics
  └─ Award recognition (not points/badges)
  └─ Access team data

Participant (employees)
  └─ View own data + public content
  └─ Participate in events
  └─ Access learning paths
  └─ Give/receive recognition
```

### Entity-Level Permissions (Examples)

**UserProfile**:
```javascript
read: { $or: [
  { user_email: "{{user.email}}" },
  { role: "admin" }
]}
write: { $or: [
  { user_email: "{{user.email}}" },
  { role: "admin" }
]}
```

**PointsLedger**:
```javascript
read: { $or: [
  { user_email: "{{user.email}}" },
  { role: "admin" }
]}
write: { role: "admin" }  // Only admins can create transactions
```

**Recognition**:
```javascript
read: { $or: [
  { visibility: "public", status: "approved" },
  { sender_email: "{{user.email}}" },
  { recipient_email: "{{user.email}}" },
  { role: "admin" }
]}
write: {}  // Anyone can create (subject to moderation)
```

### Function-Level Security

**Pattern**:
```javascript
const base44 = createClientFromRequest(req);
const user = await base44.auth.me();

if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

if (user.role !== 'admin') {
  return Response.json({ error: 'Admin required' }, { status: 403 });
}
```

**Service Role Usage**:
```javascript
// For cross-user operations (admin functions)
const data = await base44.asServiceRole.entities.UserPoints.list();
```

### Session Management
- **Timeout**: 8 hours of inactivity
- **Token**: JWT stored in httpOnly cookie
- **Refresh**: Automatic on activity
- **Logout**: Clears token, redirects to login

---

## Frontend Architecture

### State Management

**React Query** (primary):
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['user-points', userEmail],
  queryFn: () => base44.entities.UserPoints.filter({ user_email: userEmail }),
  staleTime: 30000  // 30 seconds
});
```

**Local State** (useState):
- Form inputs
- UI toggles (modals, tabs)
- Temporary selections

**Context** (minimal):
- Onboarding state
- Global notifications

### Custom Hooks

#### useUserData
```javascript
const { 
  user, 
  loading, 
  userPoints, 
  profile,
  isAdmin,
  isFacilitator,
  logout 
} = useUserData(requireAuth, requireAdmin);
```

**Features**:
- Auto-redirects based on role
- Fetches user + profile + points
- Role checks (isAdmin, isFacilitator)
- Logout helper

#### useGamificationData
```javascript
const {
  userPoints,
  badges,
  challenges,
  leaderboard,
  refreshPoints
} = useGamificationData(userEmail);
```

**Features**:
- Consolidated gamification data
- Auto-refresh on point awards
- Optimistic updates

#### useEventData
```javascript
const {
  upcomingEvents,
  myEvents,
  participations,
  rsvp,
  checkIn
} = useEventData(userEmail);
```

### Component Patterns

**Container/Presenter**:
```javascript
// Container (data fetching)
function LearningDashboardContainer() {
  const { data, isLoading } = useQuery(...);
  if (isLoading) return <LoadingSpinner />;
  return <LearningDashboard data={data} />;
}

// Presenter (pure UI)
function LearningDashboard({ data }) {
  return <div>...</div>;
}
```

**Compound Components**:
```javascript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

---

## Data Flow Examples

### Points Award Flow
```
1. User completes action (e.g., attends event)
2. Backend function evaluates GamificationRules
3. Matching rules execute:
   - Create PointsLedger entry
   - Update UserPoints.total_points
   - Check tier threshold → update tier
   - Award badge if criteria met
   - Create Notification
4. Frontend invalidates queries:
   - ['user-points', email]
   - ['user-badges', email]
5. UI updates with new points/badges
6. Confetti animation plays
```

### Learning Path Enrollment Flow
```
1. User clicks "Enroll" on LearningPathCard
2. Create LearningPathProgress record:
   - user_email
   - learning_path_id
   - status: 'in_progress'
   - started_date: now()
3. Fetch LearningModules for path
4. Create ModuleCompletion records (status: 'not_started')
5. Redirect to LearningPath detail page
6. Show first module
```

### Recognition Flow
```
1. User fills RecognitionForm:
   - Select recipient
   - Choose category
   - Write message
   - Select visibility
2. Create Recognition entity (status: 'pending')
3. AI moderation check:
   - Scan for inappropriate content
   - Flag if confidence > 0.8
4. If clean → status: 'approved', visible immediately
5. If flagged → admin review queue
6. On approval:
   - Award points to recipient
   - Create notification
   - Show in feeds (based on visibility)
```

---

## Key Features Deep Dive

### 1. Gamification System

**Tier Progression**:
- Bronze: 0-499 points
- Silver: 500-1499 points
- Gold: 1500-2999 points
- Platinum: 3000+ points

**Streak Tracking**:
- Daily activity required
- Activity = any of: event attendance, module completion, recognition sent
- Reset on missed day
- Longest streak saved separately

**Badge System**:
- 5 categories (participation, achievement, milestone, special, seasonal)
- 4 rarities (common, rare, epic, legendary)
- Custom criteria per badge
- One badge per user (enforced at DB level)
- Point value optional (0 = no points)

**Leaderboards**:
- Global: All users by total_points
- Monthly: points_this_month reset on 1st
- Team: Grouped by team_id
- Filtered: By department, tier, role

### 2. Learning Management

**Path Types**:
- **Template Paths**: Pre-built, available to all
- **Personalized Paths**: AI-generated for user's skill gaps
- **Custom Paths**: Admin-created for specific cohorts

**Module Progression**:
- Linear (complete in order) or flexible
- Prerequisites enforce dependencies
- Quiz modules require passing_score % to complete
- Time tracking per module

**Progress Calculation**:
```javascript
progress_percentage = (
  (milestones_completed.length / total_milestones) * 50 +
  (modules_completed / total_modules) * 50
)
```

**AI Features**:
- Path recommendations based on profile
- Skill gap analysis
- Next-step suggestions
- Completion predictions

### 3. Social Features

**Recognition**:
- Public: Visible to all (default)
- Team-only: Visible to shared teams
- Private: Only sender and recipient
- Moderation: AI + manual review
- Reactions: Emoji responses
- Featured: Admin-highlighted recognition

**Teams**:
- Departments, projects, interest groups
- Public (join freely), Private (invite only), Invite-only
- Team leaders moderate
- Team challenges (compete against other teams)
- Team analytics (engagement, top contributors)

**Channels**:
- Topic-based discussions
- Public (all can see), Private (members only), Announcement (read-only for most)
- Can be team-associated or standalone
- Message threading
- File sharing (images, PDFs)

### 4. Events & Activities

**Activity Templates**:
- 6 types (icebreaker, creative, competitive, wellness, learning, social)
- Facilitator can customize or create new
- Tagged with skills_developed
- Instructions + materials_needed

**Event Scheduling**:
- One-time or recurring (daily, weekly, monthly)
- RSVP system (yes/no/maybe)
- Registration with custom forms
- Capacity limits + waitlist
- Magic links (no auth required to view)

**Event Formats**:
- Online (video link required)
- Offline (location required)
- Hybrid (both)

**Check-in**:
- QR code or manual
- Points awarded on check-in
- Engagement score (facilitator rates 1-10)

**Feedback**:
- Post-event survey
- 1-5 star rating
- Open-ended comments
- AI analysis for sentiment/themes

### 5. Onboarding

**30-Day Journey**:
- Week 1: Setup, team intros, tools training
- Week 2: First tasks, shadow sessions
- Week 3: Independent work, buddy check-ins
- Week 4: First project, 30-day review

**AI Personalization**:
- Role-specific tasks
- Department-specific resources
- Manager vs individual contributor paths
- Learning style adaptations

**Buddy System**:
- AI-matched peers or mentors
- Suggested interaction activities
- Progress tracking (interaction count)
- Feedback loop (was match helpful?)

**Milestones**:
- Day 1: Welcome, account setup
- Day 3: First team meeting
- Day 7: Complete training modules
- Day 14: Deliver first contribution
- Day 30: Review meeting

---

## Integration Points

### External Services

**Email** (SendGrid/Base44 Core):
- Welcome emails
- Event reminders
- Recognition notifications
- Weekly digests

**Slack/Teams** (Webhooks):
- Event announcements
- Recognition posts
- Milestone celebrations
- Survey reminders

**Calendar** (Google Calendar API):
- Sync events to user calendars
- Import external events
- Recurring event management

**AI** (OpenAI/Anthropic):
- Content generation
- Recommendations
- Sentiment analysis
- Personalization

**Stripe** (Payments):
- Premium features (future)
- Reward redemptions (future)

### Webhook Handlers

**Pattern**:
```javascript
Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('X-Webhook-Signature');
  
  // Validate signature
  if (!validateSignature(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  // Process event
  // ...
  
  return Response.json({ received: true });
});
```

---

## Performance Optimizations

### Frontend
- React Query caching (30s-5min staleTime)
- Component lazy loading (React.lazy)
- Image optimization (Cloudinary)
- Debounced search inputs
- Virtualized lists (react-window) for 100+ items
- Memoized calculations (useMemo)

### Backend
- Entity indexing on frequently queried fields
- Batch operations (bulkCreate)
- Connection pooling
- Function warm-up (keep alive)

### Database
- Composite indexes (user_email + created_date)
- Denormalized counts (member_count, times_awarded)
- Scheduled aggregations for analytics

---

## Deployment & Operations

### Environment Variables (Secrets)
- OPENAI_API_KEY: AI content generation
- ANTHROPIC_API_KEY: AI recommendations
- STRIPE_SECRET_KEY: Payment processing
- GOOGLE_API_KEY: Calendar integration
- CLOUDINARY_URL: Image storage
- [App-specific secrets set via dashboard]

### Monitoring
- Error tracking: Base44 built-in
- Performance: Function execution times
- Usage: Query counts, storage size

### Backup & Recovery
- Automatic daily backups (Base44)
- Point-in-time recovery available
- Export data via admin function

### Scaling Considerations
- 50-200 users: Current architecture sufficient
- 200-500 users: Add caching layer (Redis)
- 500+ users: Consider database sharding

---

## Development Workflow

### Local Development
1. Clone project from Base44 dashboard
2. Run locally: `npm run dev`
3. Test against staging environment
4. Deploy via Base44 dashboard

### Code Organization
- Feature-based folders (learning/, gamification/, social/)
- Shared utilities in common/
- Hooks co-located with features
- Tests alongside components

### Testing Strategy
- Unit tests: Utility functions, calculations
- Integration tests: API flows, data mutations
- E2E tests: Critical user paths
- Manual QA: UI/UX, edge cases

---

## Future Enhancements

### Short-term (Next 3 months)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (cohort analysis)
- [ ] Rewards marketplace (redeem points)
- [ ] Video conferencing integration

### Mid-term (3-6 months)
- [ ] Multi-language support
- [ ] SSO with Azure AD/Okta
- [ ] Advanced AI personalization
- [ ] API for third-party integrations

### Long-term (6-12 months)
- [ ] White-label platform
- [ ] Enterprise features (multi-tenant)
- [ ] Advanced reporting (BI tools)
- [ ] Predictive analytics (churn risk)

---

## Troubleshooting Guide

### Common Issues

**User can't log in**:
- Check: Email registered?
- Check: User status = active?
- Check: Session timeout?

**Points not awarded**:
- Check: GamificationRule exists and is_active?
- Check: Rule conditions met?
- Check: PointsLedger for transaction?

**Learning module stuck**:
- Check: Prerequisites completed?
- Check: ModuleCompletion status?
- Check: Quiz passing score met?

**Event not showing**:
- Check: Event status = scheduled?
- Check: scheduled_date in future?
- Check: User has access (not private)?

---

## API Reference

See detailed API docs:
- `AI_CONTENT_GENERATOR_API.md`
- `GAMIFICATION_ADMIN_GUIDE.md`
- `EDGE_CASES_GAMIFICATION.md`

---

## Conclusion

This document provides a comprehensive overview of the INTeract platform architecture. For implementation details, refer to the codebase and inline comments. For questions, consult the development team or Base44 documentation.

**Last Updated**: 2025-12-29
**Version**: 1.0
**Maintainers**: Development Team