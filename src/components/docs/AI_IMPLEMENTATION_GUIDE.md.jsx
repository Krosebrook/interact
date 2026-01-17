# AI Implementation Guide
## Step-by-Step Implementation & Integration

**Last Updated:** 2026-01-17  
**Platform:** Intinc Employee Engagement Platform

---

## Quick Start

This guide provides practical implementation steps for all AI features in the Employee Engagement Platform.

---

## 1. AI Coaching Assistant

### Backend Setup

**File:** `functions/aiCoachingRecommendations.js`

#### Key Implementation Steps

1. **Fetch User Context:**
```javascript
const [profile, points, participations, recognitions, learningResources, badgeAwards] = 
  await Promise.all([
    base44.asServiceRole.entities.UserProfile.filter({ user_email: targetEmail }).then(r => r[0]),
    base44.asServiceRole.entities.UserPoints.filter({ user_email: targetEmail }).then(r => r[0]),
    // ... other queries
  ]);
```

2. **Build Comprehensive Prompt:**
```javascript
const prompt = `Analyze this user's profile and provide coaching recommendations:

USER CONTEXT:
- Skills: ${profile?.skills?.map(s => s.skill_name).join(', ')}
- Goals: ${profile?.career_goals?.map(g => g.goal).join(', ')}
- Events Attended: ${attendedEvents.length}

Identify skill gaps and suggest learning paths...`;
```

3. **Invoke AI with Structured Schema:**
```javascript
const aiCoaching = await base44.asServiceRole.integrations.Core.InvokeLLM({
  prompt,
  response_json_schema: {
    type: "object",
    properties: {
      skill_gaps: { ... },
      skill_development_opportunities: { ... }
    }
  }
});
```

4. **Match AI Recommendations to Real Resources:**
```javascript
const enhancedSkillDev = aiCoaching.skill_development_opportunities?.map(skill => {
  const matchedResources = learningResources.filter(r => 
    skill.matched_resources.some(title => 
      r.title.toLowerCase().includes(title.toLowerCase())
    )
  );
  return { ...skill, resource_objects: matchedResources };
});
```

### Frontend Integration

**Component:** `components/admin/AICoachingAssistant.js`

```javascript
const coachingMutation = useMutation({
  mutationFn: async () => {
    const response = await base44.functions.invoke('aiCoachingRecommendations', {
      target_user_email: selectedUser,
      focus_area: 'skill development'
    });
    return response.data;
  }
});
```

**User Profile Integration:** `components/profile/SkillGapAnalysis.js`

```javascript
const { data, isLoading } = useQuery({
  queryKey: ['skill-gaps', userEmail],
  queryFn: async () => {
    const response = await base44.functions.invoke('aiCoachingRecommendations', {
      target_user_email: userEmail
    });
    return response.data;
  }
});
```

---

## 2. Content Recommendation Engine

### Backend Setup

**File:** `functions/aiContentRecommender.js`

#### Implementation Flow

1. **Aggregate User Data:**
```javascript
const [profile, points, participations, challenges, learningResources, events, activities] = 
  await Promise.all([...]);
```

2. **Fetch Skill Gaps (Optional Enhancement):**
```javascript
try {
  const coachingResponse = await base44.asServiceRole.functions.invoke(
    'aiCoachingRecommendations', 
    { target_user_email: targetEmail }
  );
  skillGaps = coachingResponse.data?.coaching?.skill_gaps || [];
} catch (e) {
  // Gracefully continue without skill gaps
}
```

3. **Generate Multi-Type Recommendations:**
```javascript
const aiRecommendations = await base44.asServiceRole.integrations.Core.InvokeLLM({
  prompt: `Recommend personalized content for this user...`,
  response_json_schema: {
    type: "object",
    properties: {
      learning_recommendations: [...],
      event_recommendations: [...],
      activity_recommendations: [...]
    }
  }
});
```

4. **Match to Platform Content:**
```javascript
const enhancedLearning = aiRecommendations.learning_recommendations?.map(rec => {
  const resource = learningResources.find(r => 
    r.title.toLowerCase().includes(rec.title.toLowerCase())
  );
  return { ...rec, resource_object: resource, matched: !!resource };
});
```

### Frontend Integration

**Widget Component:** `components/ai/ContentRecommendationWidget.js`

```javascript
const { data, isLoading } = useQuery({
  queryKey: ['content-recommendations', userEmail],
  queryFn: async () => {
    const response = await base44.functions.invoke('aiContentRecommender', {
      user_email: userEmail
    });
    return response.data;
  },
  staleTime: 1000 * 60 * 30 // Cache for 30 minutes
});
```

**Dashboard Placement:** Add to `pages/Dashboard.js`

```javascript
<ContentRecommendationWidget userEmail={user?.email} />
```

---

## 3. Team Challenge Generator

### Backend Setup

**File:** `functions/aiTeamChallengeGenerator.js`

#### Key Features

1. **Fetch Team Context:**
```javascript
const [team, teamMembers, teamAnalytics, activities] = await Promise.all([
  team_id ? base44.asServiceRole.entities.Team.filter({ id: team_id }) : null,
  team_id ? base44.asServiceRole.entities.TeamMembership.filter({ team_id }) : [],
  team_id ? base44.asServiceRole.entities.TeamAnalytics.filter({ team_id }) : [],
  base44.asServiceRole.entities.Activity.list()
]);
```

2. **Generate Challenge Structure:**
```javascript
const aiChallenge = await base44.asServiceRole.integrations.Core.InvokeLLM({
  prompt: `Design a team challenge...`,
  response_json_schema: {
    type: "object",
    properties: {
      challenge_name: { ... },
      milestones: { ... },
      team_incentives: { ... }
    }
  }
});
```

### Frontend Integration

**Component:** `components/teams/TeamChallengeCreator.js`

```javascript
const generateMutation = useMutation({
  mutationFn: async () => {
    const response = await base44.functions.invoke('aiTeamChallengeGenerator', {
      team_id: teamId,
      goal_description: goalDescription,
      duration_days: parseInt(durationDays)
    });
    return response.data;
  }
});

const createChallengeMutation = useMutation({
  mutationFn: async (challengeData) => {
    return await base44.entities.TeamChallenge.create(challengeData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
    toast.success('Team challenge created!');
  }
});
```

**Page:** `pages/TeamChallenges.js`

---

## 4. Challenge Leaderboards

### Backend Setup

**File:** `functions/getTeamChallengeLeaderboard.js`

#### Implementation

1. **Fetch Progress Data:**
```javascript
const [challenge, progressRecords, profiles] = await Promise.all([
  base44.asServiceRole.entities.TeamChallenge.filter({ id: challenge_id }),
  base44.asServiceRole.entities.TeamChallengeProgress.filter({ challenge_id }),
  base44.asServiceRole.entities.UserProfile.list()
]);
```

2. **Calculate Rankings:**
```javascript
const sortedProgress = progressRecords.sort((a, b) => 
  b.current_value - a.current_value
);

const leaderboard = sortedProgress.map((record, index) => {
  const completionPct = (record.current_value / challenge.target_metric.target_value) * 100;
  return {
    rank: index + 1,
    user_email: record.user_email,
    completion_percentage: Math.round(completionPct),
    points_earned: record.points_earned
  };
});
```

### Entity Setup

**File:** `entities/TeamChallengeProgress.json`

Tracks:
- `current_value`: Progress metric
- `milestones_achieved`: Array of milestone IDs
- `badges_earned`: Array of badge IDs
- `points_earned`: Total points with multiplier

---

## 5. Event Series Planner

### Backend Setup

**File 1:** `functions/aiTemplateSuggestions.js`

```javascript
const aiSuggestions = await base44.asServiceRole.integrations.Core.InvokeLLM({
  prompt: `Design a comprehensive event series...`,
  response_json_schema: {
    type: "object",
    properties: {
      series_structure: { ... },
      follow_up_events: { ... },
      required_resources: { ... },
      suggested_collaborators: { ... }
    }
  }
});
```

**File 2:** `functions/createDraftEventSeries.js`

```javascript
const seriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

for (const [index, session] of series_suggestions.follow_up_events.entries()) {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + (dayIncrement * index));

  const eventData = {
    title: session.title,
    scheduled_date: scheduledDate.toISOString(),
    series_id: seriesId,
    series_session_number: session.session_number,
    status: 'draft'
  };

  await base44.asServiceRole.entities.Event.create(eventData);
}
```

### Frontend Integration

**Component:** `components/templates/AITemplateSuggestions.js`

```javascript
const createSeriesMutation = useMutation({
  mutationFn: async () => {
    const response = await base44.functions.invoke('createDraftEventSeries', {
      template_id: template.id,
      series_suggestions: suggestions,
      base_event_data: { ... }
    });
    return response.data;
  },
  onSuccess: (data) => {
    toast.success(`Created ${data.events_created} draft events!`);
  }
});
```

---

## 6. Automation & Scheduled Updates

### Skill Pathway Updates

**Automation Setup:**

```javascript
// Via Base44 Dashboard or create_automation tool
{
  automation_type: "scheduled",
  name: "Weekly Skill Pathway Updates",
  function_name: "aiCoachingRecommendations",
  schedule_type: "cron",
  cron_expression: "0 2 * * 1", // Every Monday at 2 AM
  function_args: {
    batch_mode: true // Process all active users
  }
}
```

### Challenge Progress Tracking

**Entity Automation:**

```javascript
{
  automation_type: "entity",
  name: "Update Challenge Leaderboard on Progress",
  entity_name: "TeamChallengeProgress",
  event_types: ["update"],
  function_name: "getTeamChallengeLeaderboard"
}
```

---

## 7. Performance Optimization

### Caching Strategy

**Frontend (React Query):**
```javascript
useQuery({
  queryKey: ['ai-recommendations', userEmail],
  queryFn: fetchRecommendations,
  staleTime: 1000 * 60 * 30, // 30 minutes
  cacheTime: 1000 * 60 * 60  // 1 hour
});
```

**Backend (Deno):**
- Use `Promise.all()` for parallel queries
- Limit entity queries to necessary fields
- Cache frequently accessed data in memory (for duration of request)

### Load Optimization

**Lazy Loading:**
```javascript
// Only load AI widgets when visible
const { data } = useQuery({
  queryKey: ['content-recommendations', userEmail],
  queryFn: fetchRecommendations,
  enabled: isVisible && !!userEmail
});
```

**Pagination for Large Results:**
```javascript
const recommendations = aiResponse.all_recommendations
  .sort((a, b) => b.relevance_score - a.relevance_score)
  .slice(0, 6); // Top 6 only
```

---

## 8. Error Handling & Fallbacks

### Backend Error Handling

```javascript
try {
  const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({...});
  return Response.json({ success: true, data: aiResponse });
} catch (error) {
  console.error('AI invocation failed:', error);
  
  // Fallback to manual recommendations
  const fallbackRecommendations = generateFallbackRecommendations(user);
  
  return Response.json({ 
    success: false, 
    error: error.message,
    fallback_data: fallbackRecommendations
  }, { status: 500 });
}
```

### Frontend Error Handling

```javascript
const { data, error, isLoading } = useQuery({
  queryKey: ['ai-feature'],
  queryFn: fetchAIData,
  retry: 2,
  onError: (err) => {
    toast.error('Could not load AI recommendations');
  }
});

if (error) {
  return <EmptyState message="Recommendations unavailable. Please try again later." />;
}
```

---

## 9. Testing AI Features

### Backend Function Testing

```javascript
// Test with sample data
const testResponse = await base44.functions.invoke('aiCoachingRecommendations', {
  target_user_email: 'test@company.com',
  focus_area: 'skill development'
});

console.log('Skill Gaps:', testResponse.data.coaching.skill_gaps);
console.log('Recommendations:', testResponse.data.coaching.skill_development_opportunities);
```

### Frontend Component Testing

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import ContentRecommendationWidget from './ContentRecommendationWidget';

test('displays recommendations', async () => {
  render(<ContentRecommendationWidget userEmail="test@company.com" />);
  
  await waitFor(() => {
    expect(screen.getByText(/Personalized for You/i)).toBeInTheDocument();
  });
});
```

---

## 10. Deployment Checklist

- [ ] All backend functions deployed and tested
- [ ] Entity schemas created (`TeamChallengeProgress`, etc.)
- [ ] Frontend components integrated into pages
- [ ] React Query cache configured appropriately
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Analytics tracking for AI feature usage
- [ ] User feedback mechanism (optional)
- [ ] Documentation updated
- [ ] Admin training completed

---

## Common Pitfalls & Solutions

### Pitfall 1: AI Responses Too Generic

**Solution:** Provide more specific context in prompts. Include recent activity patterns, specific skill levels, and team dynamics.

### Pitfall 2: Recommendations Don't Match Platform Content

**Solution:** Implement robust matching logic with fuzzy search or similarity scoring. Consider pre-processing content titles for better matching.

### Pitfall 3: Slow Response Times

**Solution:** 
- Use parallel queries (`Promise.all`)
- Cache AI responses appropriately
- Limit data fetched to essential fields only
- Consider background processing for non-critical recommendations

### Pitfall 4: Users Don't Engage with Recommendations

**Solution:**
- Add relevance scoring and sort by score
- Display personalized messages explaining "why"
- Provide quick action buttons
- Track and iterate based on click-through rates

---

**End of Implementation Guide**