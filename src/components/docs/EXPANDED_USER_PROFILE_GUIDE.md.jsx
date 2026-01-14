# Expanded User Profile System Documentation

## Overview
User profiles now include comprehensive career development features: skills & expertise, career goals, mentorship matching, personalized learning resources, and achievement highlights.

## Features

### 1. Skills & Expertise Section
**Display in profile:**
- Skill name
- Proficiency level (beginner, intermediate, advanced, expert)
- Endorsement count (peer recognition of skills)

**Database:**
```json
{
  "skills": [
    {
      "skill_name": "React",
      "proficiency": "advanced",
      "endorsed_count": 12
    },
    {
      "skill_name": "Product Strategy",
      "proficiency": "intermediate",
      "endorsed_count": 5
    }
  ]
}
```

**Users can:**
- Add/edit their skills
- Update proficiency level
- See endorsements from peers
- Get AI learning recommendations based on skills

### 2. Career Goals
**Structured goal tracking:**
- Goal description
- Target date
- Progress percentage (0-100%)
- Notes/milestones

**Example:**
```
Goal: "Become team lead"
Target: June 2026
Progress: 40%
Notes: "Completed leadership training, mentoring 2 juniors"
```

**Features:**
- Visual progress bar
- Auto-track milestones achieved
- Align learning resources to goals
- Export goal progress report

### 3. Mentorship Matching & Preferences

#### Preferences
Users can set:
```
{
  "open_to_mentoring": true/false,
  "mentoring_areas": ["Product Strategy", "Career Growth"],
  "open_to_being_mentored": true/false,
  "mentorship_interests": ["Leadership", "Public Speaking"],
  "preferred_mentorship_style": "formal_meetings|informal_chat|async_mentoring|mixed",
  "availability": "Fridays 2-3pm" or "Weekly 30 min call"
}
```

#### AI Matching
**Function:** `functions/matchMentorships.js`

**Compatibility Score Factors:**
- Skill overlap (40%) - Matching interests/expertise
- Department fit (15%) - Same team or cross-functional
- Career level (20%) - Mentor 1.5x+ experienced
- Style match (15%) - Mentorship approach alignment
- Location/timezone (10%) - Similar geography bonus

**Minimum Match Score:** 50/100

**Matching Flow:**
1. Run `matchMentorships()` weekly (automated)
2. System calculates compatibility for all pairs
3. Creates pending MentorshipMatch records
4. Notifies both mentor and mentee
5. Either party can accept/decline
6. Tracked mentorship progress (meetings, feedback)

#### Mentorship Entities

**MentorshipMatch:**
```json
{
  "mentor_email": "senior@company.com",
  "mentee_email": "junior@company.com",
  "status": "pending|active|completed|declined",
  "match_score": 78,
  "match_reason": "Has expertise in Product Strategy with 3+ more years experience",
  "mentorship_areas": ["Product Strategy", "Career Growth"],
  "meetings_planned": 12,
  "meetings_completed": 3,
  "mentee_feedback": { "rating": 5, "notes": "Great insights!" },
  "communication_log": [
    { "date": "2026-01-10", "type": "meeting", "summary": "Discussed OKR setting" }
  ]
}
```

### 4. AI Learning Resource Recommendations

**Function:** `functions/suggestLearningResources.js`

**LearningResource Entity:**
```json
{
  "title": "Advanced React Patterns",
  "description": "Master advanced React techniques",
  "resource_type": "course|article|video|book|tool|tutorial|webinar|podcast",
  "url": "https://...",
  "difficulty_level": "beginner|intermediate|advanced",
  "estimated_duration_minutes": 180,
  "provider": "Udemy",
  "tags": ["React", "Frontend", "Performance"],
  "recommended_for_roles": ["Frontend Engineer", "Full Stack"],
  "rating": 4.7,
  "certification_available": true
}
```

**Recommendation Algorithm:**
1. **Skill Gap Analysis** (40%) - Match to user skills + gap areas
2. **Career Goal Alignment** (30%) - Resources supporting stated goals
3. **Role Recommendations** (20%) - Curated for job title
4. **Difficulty Progression** (10%) - One step above current level
5. **Quality Signals** - Rating, popularity, views

**Example Recommendation Reason:**
- "Matches your Python & Data Science interests"
- "Supports your goal to become Data Lead"
- "Recommended for your Product Manager role"

**User Workflow:**
1. View personalized recommendations on profile
2. See match score (0-100%) and reason
3. Click to preview or start resource
4. Mark complete to track progress
5. Suggest new resources based on completions

### 5. User Highlights Feed
**UserHighlight Entity:**
```json
{
  "user_email": "john@company.com",
  "highlight_type": "recognition|achievement|milestone|skill_endorsement|project_completion|event_attendance|challenge_completed|mentorship",
  "title": "Completed Advanced Leadership Course",
  "description": "Finished coursework and certification",
  "related_entity_id": "learning_123",
  "date": "2026-01-14T10:00:00Z",
  "is_featured": true,
  "visibility": "public|team_only|private",
  "generated_by": "manual|system|ai"
}
```

**Highlight Types:**
| Type | Trigger | Example |
|------|---------|---------|
| **Recognition** | Peer recognition received | "Recognized for excellence in Q1 planning" |
| **Achievement** | Milestone reached | "Hit 1000 points!" |
| **Milestone** | Work anniversary, birthday | "1 year at INTeact!" |
| **Skill Endorsement** | Peer endorses skill | "Endorsed in Product Strategy" |
| **Project Completion** | Project shipped | "Led successful platform migration" |
| **Event Attendance** | Event attended | "Attended company summit" |
| **Challenge Completed** | Challenge won | "Won 'Recognition Master' challenge" |
| **Mentorship** | Mentorship match created | "Started mentoring Sarah on leadership" |

**Features:**
- Auto-generated from system events
- Manually added by user
- AI-suggested from achievements
- Featured highlights pinned to top
- Visibility controls (public/team/private)
- Engagement tracking (views, reactions, comments)

**Highlight Feed:**
- Shows 10 most recent
- Sorted by date (newest first)
- Filterable by type
- Shareable to Slack/email
- Privacy respected (hidden if private)

## Integration with Onboarding

**New Onboarding Milestones:**
- "Add Skills" → +30 points
- "Set Career Goals" → +40 points
- "Enable Mentorship" → +25 points

## Admin Dashboard Integration

### Mentor Matching Admin View
```
[Mentor Matching Dashboard]

Pending Matches: 12
Active Mentorships: 34
Completed: 8

Top Matches This Week:
- Sarah (78% match) ← Engineer wants to lead
- Mike (72% match) ← Product wants strategy
- Lee (69% match) ← Designer wants UX research

Actions:
[Run Matching Now] [View All Matches] [Feedback Reports]
```

### Learning Resource Management
```
[Learning Resource Admin]

Total Resources: 156
Internal: 12
Completion Rate: 34%

Top Recommended Resources:
- Advanced React: 89 recommendations
- Leadership Fundamentals: 76
- Public Speaking 101: 63

[Add Resource] [Import from Coursera] [Analytics]
```

## Privacy & Permissions

**Skills & Expertise:**
- User controls visibility
- Shows public by default
- Can limit to team-only

**Career Goals:**
- Default visibility: private (only user sees)
- User can share selectively

**Mentorship:**
- Mentor/mentee always see each other
- Matching reason visible to both
- Feedback private to participants

**Learning Resources:**
- All users see recommendations
- Progress private to user
- Can share completions

**Highlights:**
- Visibility controls enforced
- Public highlights searchable
- Team highlights visible to team
- Private hidden from others

## Best Practices

1. **Skills Management**
   - Update quarterly
   - Use standard skill names
   - Encourage peer endorsements

2. **Career Goals**
   - Set 2-3 goals per year
   - Break into quarterly milestones
   - Review monthly with manager

3. **Mentorship**
   - Schedule regular meetings
   - Document discussions
   - Provide mutual feedback
   - Celebrate completed matches

4. **Learning Path**
   - Complete 1-2 resources/month
   - Align to career goals
   - Share what you learned
   - Mentor others on new skills

5. **Highlights**
   - Share major wins publicly
   - Keep personal achievements visible
   - Celebrate team victories

## Metrics & Analytics

**Track:**
- Skills completions → Capability growth
- Goal progress → Career development
- Mentorship matches → Knowledge transfer
- Learning completions → Upskilling rate
- Highlights engagement → Recognition culture

**Admin Reports:**
- Top skills in organization
- Popular learning resources
- Mentorship success rate
- Goal achievement rate

## Future Enhancements
- [ ] Skill badging (micro-credentials)
- [ ] Learning paths (bundled courses)
- [ ] Cross-company mentor marketplace
- [ ] 360-degree feedback integration
- [ ] Career trajectory predictions
- [ ] Internal mobility matching