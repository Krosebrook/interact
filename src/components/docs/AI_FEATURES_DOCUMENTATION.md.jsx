# AI Features Documentation
## Employee Engagement Platform - AI System Overview

**Last Updated:** 2026-01-17  
**Platform:** Intinc Employee Engagement Platform  
**Target Users:** Remote employees, Team Leads, HR/People Ops

---

## Table of Contents

1. [Overview](#overview)
2. [AI Coaching Assistant](#ai-coaching-assistant)
3. [Content Recommendation Engine](#content-recommendation-engine)
4. [Team Challenge Generator](#team-challenge-generator)
5. [Event Series Planner](#event-series-planner)
6. [Skill Development Pathways](#skill-development-pathways)
7. [Advanced Gamification](#advanced-gamification)
8. [Integration Points](#integration-points)
9. [Technical Architecture](#technical-architecture)

---

## Overview

The Employee Engagement Platform leverages AI to create personalized, data-driven experiences that enhance employee engagement, skill development, and team collaboration. All AI features are powered by the Base44 Core integration using `InvokeLLM` with structured JSON schemas.

### Core AI Capabilities

- **Personalized Coaching:** Identifies skill gaps and recommends development paths
- **Smart Content Curation:** Recommends relevant resources, events, and activities
- **Team Dynamics:** Generates collaborative challenges and suggests optimal team structures
- **Event Intelligence:** Plans multi-session event series with resource allocation
- **Adaptive Learning:** Continuously adjusts recommendations based on user progress

---

## AI Coaching Assistant

### Purpose
Provides personalized coaching recommendations for individual employees and teams, identifying skill gaps and suggesting targeted development opportunities.

### Backend Function
**File:** `functions/aiCoachingRecommendations.js`

### Key Features

#### Skill Gap Analysis
- Analyzes user profile, event participation, and collaboration patterns
- Identifies critical, moderate, and minor skill gaps
- Provides impact assessment for each gap
- Suggests step-by-step learning paths

#### Development Opportunities
- Maps current skill level to target level
- Estimates time to proficiency
- Matches learning resources from the platform database
- Suggests relevant internal events and workshops

### Data Inputs
```javascript
{
  target_user_email: string,
  focus_area?: string // Optional: 'skill development', 'engagement', 'wellness'
}
```

### AI Response Schema
```json
{
  "skill_gaps": [
    {
      "skill": "string",
      "gap_severity": "critical|moderate|minor",
      "impact": "string",
      "suggested_learning_path": "string"
    }
  ],
  "skill_development_opportunities": [
    {
      "skill": "string",
      "current_level": "beginner|intermediate|advanced",
      "target_level": "intermediate|advanced|expert",
      "suggested_path": "string",
      "estimated_time": "string",
      "matched_resources": ["resource titles"]
    }
  ],
  "recommended_activities": [...],
  "engagement_insights": {...}
}
```

### Frontend Components
- **`components/admin/AICoachingAssistant.js`**: Admin dashboard for viewing team coaching insights
- **`components/profile/SkillGapAnalysis.js`**: User-facing skill gap display with action items

### Usage
```javascript
import { base44 } from '@/api/base44Client';

const response = await base44.functions.invoke('aiCoachingRecommendations', {
  target_user_email: 'user@company.com',
  focus_area: 'skill development'
});

const { skill_gaps, skill_development_opportunities } = response.data.coaching;
```

---

## Content Recommendation Engine

### Purpose
Delivers personalized content recommendations based on user role, engagement patterns, skill gaps, and active challenges.

### Backend Function
**File:** `functions/aiContentRecommender.js`

### Key Features

#### Multi-Source Recommendations
- **Learning Resources:** Articles, courses, videos, tutorials
- **Upcoming Events:** Workshops, training sessions, team activities
- **Activities:** Practice exercises, collaborative tasks
- **Internal Documents:** Knowledge base articles (via KnowledgeBase entity)

#### Relevance Scoring
Each recommendation includes:
- Relevance score (1-10)
- Match reason (skill gap, career goal, engagement pattern, challenge support)
- Estimated time to complete
- Personalized explanation

### Data Inputs
```javascript
{
  user_email?: string // Optional, defaults to authenticated user
}
```

### AI Response Schema
```json
{
  "learning_recommendations": [
    {
      "content_type": "learning_resource|event|activity|internal_document",
      "title": "string",
      "description": "string",
      "relevance_score": number,
      "match_reason": "string",
      "estimated_time": "string"
    }
  ],
  "event_recommendations": [...],
  "activity_recommendations": [...],
  "personalized_message": "string"
}
```

### Frontend Component
**`components/ai/ContentRecommendationWidget.js`**

Displays top 6 recommendations sorted by relevance score, with visual indicators for:
- Content type (learning, event, activity)
- Relevance score with star rating
- Match reason badge
- Quick action buttons

### Integration Points
- **User Dashboard:** Primary placement for personalized recommendations
- **User Profile:** Secondary placement in "Contributions" tab
- **Manager Dashboard:** View recommendations for team members

---

## Team Challenge Generator

### Purpose
Creates AI-powered team challenges that drive engagement, collaboration, and skill development aligned with organizational goals.

### Backend Function
**File:** `functions/aiTeamChallengeGenerator.js`

### Key Features

#### Challenge Design
- Analyzes team context and historical engagement data
- Generates challenge structure with milestones
- Recommends activities and frequency
- Suggests points multipliers and incentives

#### AI-Generated Components
- **Challenge Name & Description:** Engaging, goal-aligned
- **Target Metrics:** Points, events attended, recognitions given, custom metrics
- **Milestones:** Progressive goals with point rewards
- **Recommended Activities:** Frequency-based activity suggestions
- **Team Incentives:** Individual and team-level rewards
- **Engagement Tactics:** Specific strategies to maintain momentum

### Data Inputs
```javascript
{
  team_id?: string,
  goal_description: string,
  duration_days: number
}
```

### AI Response Schema
```json
{
  "challenge_name": "string",
  "description": "string",
  "challenge_type": "points|events|recognition|learning|wellness|custom",
  "duration_days": number,
  "target_metric": {
    "metric_type": "string",
    "target_value": number,
    "description": "string"
  },
  "milestones": [
    {
      "milestone_name": "string",
      "threshold": number,
      "reward_points": number,
      "description": "string"
    }
  ],
  "recommended_activities": [...],
  "team_incentives": {...},
  "engagement_tactics": [...],
  "tracking_tips": [...],
  "celebration_ideas": [...]
}
```

### Frontend Component
**`components/teams/TeamChallengeCreator.js`**

### Related Entities
- **TeamChallenge:** Stores challenge configuration
- **TeamChallengeProgress:** Tracks individual/team progress
- **BadgeAward:** Awarded upon milestone completion

---

## Event Series Planner

### Purpose
Automates the creation of multi-session event series with AI-suggested follow-up events, resources, and collaborators.

### Backend Functions
1. **`functions/aiTemplateSuggestions.js`**: Generates series structure
2. **`functions/createDraftEventSeries.js`**: Creates draft events

### Key Features

#### Series Structure Generation
- Analyzes template/objective and historical event data
- Suggests total sessions, cadence, and duration
- Plans participant learning journey
- Identifies success indicators

#### Follow-Up Event Planning
- Generates session-by-session event titles and objectives
- Suggests activities for each session
- Calculates optimal timing and build-up sequence
- Pre-fills event details for automation

#### Resource & Collaborator Matching
- Identifies required resources (documents, videos, tools, materials)
- Suggests collaborators based on skills and expertise
- Matches internal subject matter experts
- Provides sourcing recommendations

### Data Inputs (aiTemplateSuggestions)
```javascript
{
  template_id?: string,
  template_objective: string
}
```

### AI Response Schema
```json
{
  "series_structure": {
    "total_sessions": number,
    "recommended_cadence": "weekly|bi-weekly|monthly",
    "duration_weeks": number
  },
  "follow_up_events": [
    {
      "session_number": number,
      "title": "string",
      "objective": "string",
      "suggested_activity": "string",
      "timing": "string",
      "build_on": "string"
    }
  ],
  "required_resources": [...],
  "suggested_collaborators": [
    {
      "role": "facilitator|co-host|subject_expert",
      "skills_needed": ["string"],
      "when_needed": "string",
      "reason": "string"
    }
  ],
  "success_indicators": [...],
  "participant_journey": "string"
}
```

### Automated Series Creation
**Function:** `createDraftEventSeries.js`

- Creates draft Event entities for each session
- Links events via `series_id`
- Schedules based on recommended cadence
- Assigns facilitators based on skill matching
- Pre-fills event details from AI suggestions

### Frontend Component
**`components/templates/AITemplateSuggestions.js`**

---

## Skill Development Pathways

### Purpose
Creates dynamic, personalized learning pathways that adapt based on user progress and newly identified needs.

### Implementation
Enhanced via `aiCoachingRecommendations` function with structured pathway output.

### Key Features

#### Sequenced Learning
- Step-by-step roadmap for each skill gap
- Mix of learning resources, events, and activities
- Progressive difficulty and skill building
- Estimated completion timelines

#### Adaptive Pathways
- Re-evaluated periodically via scheduled automation
- Adjusts based on:
  - Module completions (`ModuleCompletion` entity)
  - Event participation (`Participation` entity)
  - Challenge progress (`PersonalChallenge` entity)
  - Skill endorsements and assessments

### Data Structure
```json
{
  "skill_development_pathways": [
    {
      "skill": "string",
      "target_level": "intermediate|advanced|expert",
      "roadmap": [
        {
          "step_number": number,
          "type": "resource|event|activity",
          "title": "string",
          "description": "string",
          "estimated_time": "string",
          "prerequisites": ["string"]
        }
      ],
      "estimated_completion_time": "string",
      "progress_tracking": {
        "steps_completed": number,
        "completion_percentage": number
      }
    }
  ]
}
```

### Future Enhancement
Planned automation to periodically invoke `aiCoachingRecommendations` with progress data to dynamically update pathways.

---

## Advanced Gamification

### Purpose
Enhances team challenges with leaderboards, badges, and dynamic point multipliers to drive engagement and recognition.

### Core Components

#### Challenge Leaderboards
**Function:** `functions/getTeamChallengeLeaderboard.js`

Features:
- Real-time ranking of participants
- Progress visualization (completion percentage)
- Milestone achievement tracking
- Team vs. individual statistics

#### Milestone Badges
- Auto-awarded upon reaching challenge milestones
- Tracked via `TeamChallengeProgress.badges_earned`
- Displayed in user profiles and leaderboards

#### Points Multiplier System
- AI-suggested multipliers based on challenge difficulty
- Team-level vs. individual multipliers
- Applied automatically via gamification rules

### Entity: TeamChallengeProgress
**File:** `entities/TeamChallengeProgress.json`

Tracks:
- Current progress value
- Milestones achieved
- Points earned (with multiplier applied)
- Badges earned
- Leaderboard rank
- Last activity timestamp

---

## Integration Points

### User Dashboard
- Content Recommendation Widget
- Skill Gap Analysis summary
- Active challenges progress
- Personalized coaching insights

### Manager Dashboard
- Team skill gap overview
- Challenge creation and tracking
- Team member coaching recommendations
- Event series planning

### User Profile
- Detailed skill gap analysis
- Learning pathway roadmaps
- Challenge participation history
- Badge showcase

### Event Management
- AI template series suggestions
- Automated series creation
- Collaborator recommendations

---

## Technical Architecture

### Backend Functions (Deno)
All AI functions follow this pattern:

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  // Authentication check
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Fetch context data
  const [data1, data2] = await Promise.all([...]);
  
  // Build LLM prompt
  const prompt = `...context and instructions...`;
  
  // Invoke AI
  const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {...}
  });
  
  // Post-process and return
  return Response.json({ success: true, data: aiResponse });
});
```

### Frontend Components (React)
All AI components use React Query for data fetching:

```javascript
const { data, isLoading } = useQuery({
  queryKey: ['ai-feature', userEmail],
  queryFn: async () => {
    const response = await base44.functions.invoke('aiFunction', {...});
    return response.data;
  },
  staleTime: 1000 * 60 * 30 // 30 min cache
});
```

### AI Provider
- **Primary:** `base44.integrations.Core.InvokeLLM`
- **Fallback:** None (single provider for consistency)
- **Context Enhancement:** `add_context_from_internet: false` (uses internal data only)

### Data Flow
1. User action triggers frontend component
2. Component invokes backend function via Base44 SDK
3. Backend fetches relevant entities from database
4. Backend constructs structured prompt with context
5. AI generates JSON response matching schema
6. Backend post-processes (matching, enrichment)
7. Response returned to frontend
8. Component renders personalized UI

---

## Best Practices

### Prompt Engineering
- Provide comprehensive context (user data, available content, historical patterns)
- Use structured JSON schemas to ensure consistent outputs
- Include examples in prompts for complex structures
- Specify relevance scoring criteria

### Performance Optimization
- Cache AI responses with appropriate `staleTime`
- Use parallel queries (`Promise.all`) for data fetching
- Implement loading states and progressive disclosure
- Limit recommendations to top N results

### Data Privacy
- All functions verify user authentication
- Role-based access control enforced
- No PII exposed in AI prompts beyond necessary context
- Anonymize survey data before AI analysis

### Error Handling
- Graceful degradation if AI service unavailable
- Fallback to manual content discovery
- Log errors without exposing sensitive data
- User-friendly error messages

---

## Future Enhancements

1. **Multi-Modal AI:** Vision support for analyzing uploaded documents/images
2. **Predictive Analytics:** Forecast engagement trends and proactive interventions
3. **Natural Language Queries:** Chatbot interface for exploring content
4. **A/B Testing:** AI-suggested variants for gamification rules
5. **Sentiment Analysis:** Analyze feedback and comments for team health insights
6. **Automated Pathways:** Fully automated skill pathway updates based on progress
7. **Collaborative Filtering:** Enhanced recommendations based on similar user patterns

---

## Support & Troubleshooting

### Common Issues

**AI recommendations not appearing:**
- Verify user has sufficient activity history (min 3 events attended)
- Check authentication token validity
- Ensure `aiCoachingRecommendations` function deployed

**Low relevance scores:**
- Review user profile completeness (skills, goals, preferences)
- Increase diversity of learning resources in database
- Adjust AI prompt to weight recent activity more heavily

**Series creation fails:**
- Verify template has valid `activity_id`
- Check user has permissions to create events
- Ensure series suggestions include valid `follow_up_events`

### Admin Tools
- Audit Log: Track AI function invocations
- Analytics Dashboard: Monitor AI recommendation click-through rates
- User Feedback: Collect input on recommendation quality

---

**End of Documentation**