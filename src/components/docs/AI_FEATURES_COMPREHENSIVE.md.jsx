# AI Features Comprehensive Guide
**Version:** 2.0  
**Last Updated:** January 26, 2026

---

## 🤖 AI Systems Overview

### 1. AI Mentor Matching
**Function:** `functions/aiMentorMatcher.js`  
**Entity:** `MentorMatch`

**How it works:**
1. Analyzes mentee's profile (skills, interests, role, department)
2. Scans all potential mentors (experienced users with 5+ skills)
3. Uses AI to calculate compatibility scores (0-100)
4. Returns top 3 matches with reasoning and suggested goals

**Matching Criteria:**
- Skill overlap (weighted 40%)
- Department alignment (weighted 20%)
- Experience gap (weighted 25%)
- Interest similarity (weighted 15%)

**Usage:**
```javascript
// Trigger from frontend
const response = await base44.functions.invoke('aiMentorMatcher', {
  menteeEmail: user.email
});

// Returns top 3 matches with scores and goals
response.data.matches[0].match_score  // 85/100
response.data.matches[0].reasoning     // "Strong skill overlap in Python..."
```

---

### 2. Proactive Onboarding Tips
**Function:** `functions/proactiveOnboardingTips.js`  
**Component:** `components/ai/ProactiveOnboardingTips.jsx`

**How it works:**
1. Monitors user activity (profile completion, events, recognitions)
2. Calculates account age and engagement level
3. AI generates 3 personalized tips every 5 minutes
4. Shows as floating card in bottom-right corner

**Tip Categories:**
- **Next Action**: What to do next based on progress
- **Missing Opportunity**: Features they haven't explored
- **Motivation**: Celebrate progress and encourage continuation

**Features:**
- Auto-refreshes every 5 minutes
- Dismissible card
- Action buttons with direct links
- Priority action highlighted

---

### 3. Wellness-Engagement Correlation
**Function:** `functions/wellnessEngagementCorrelation.js`  
**Component:** `components/wellness/WellnessInsightsPanel.jsx`

**How it works:**
1. Aggregates wellness logs (steps, meditation, hydration)
2. Correlates with engagement metrics (events, recognitions, points)
3. AI analyzes patterns and calculates correlation strength
4. Provides HR recommendations and optimal challenge goals

**Insights Provided:**
- Correlation score (0-100%)
- Key patterns (e.g., "High step count correlates with 40% more event attendance")
- HR recommendations (e.g., "Promote walking meetings")
- Suggested challenge goals based on engagement data

**Example Output:**
```json
{
  "correlation_strength": "strong_positive",
  "correlation_score": 0.73,
  "key_insights": [
    "Employees logging 10k+ steps attend 2x more events",
    "Meditation practice correlates with higher recognition activity"
  ],
  "recommended_challenge_goals": {
    "steps_daily": 8500,
    "meditation_minutes": 15,
    "hydration_glasses": 7
  }
}
```

---

### 4. Churn Risk Prediction
**Function:** `functions/predictChurnRisk.js`  
**Entity:** `PredictiveInsight`

**How it works:**
1. Analyzes 30-day activity window
2. Compares to historical baseline
3. AI identifies concerning patterns
4. Generates risk score and actionable interventions

**Risk Indicators:**
- Declining event attendance
- Reduced recognition activity
- Stagnant points growth
- Missing streak days
- Low response to outreach

**Outputs:**
- Risk score (0-100)
- Risk level (low/medium/high/critical)
- Key indicators with severity
- Recommended HR interventions

---

## 🎯 AI Integration Patterns

### Pattern 1: Real-time Analysis
```javascript
// Onboarding tips refresh every 5 minutes
const { data: tips } = useQuery({
  queryKey: ['onboardingTips', userEmail],
  queryFn: () => base44.functions.invoke('proactiveOnboardingTips', { userEmail }),
  refetchInterval: 5 * 60 * 1000,
  staleTime: 5 * 60 * 1000
});
```

### Pattern 2: On-Demand Processing
```javascript
// Mentor matching triggered by user
const findMatches = async () => {
  const response = await base44.functions.invoke('aiMentorMatcher', {
    menteeEmail: user.email
  });
  
  // Results saved to database for review
  toast.success('Found your ideal mentors!');
};
```

### Pattern 3: Batch Analytics
```javascript
// Admin runs correlation analysis
const analyzeWellness = async () => {
  const response = await base44.functions.invoke('wellnessEngagementCorrelation', {
    lookbackDays: 30
  });
  
  // Display insights in dashboard
  setInsights(response.data.analysis);
};
```

---

## 🚀 Performance Considerations

### Caching Strategy
```javascript
// Expensive AI calls cached for 10+ minutes
const { data } = useQuery({
  queryKey: ['aiInsights'],
  queryFn: fetchAIInsights,
  staleTime: 10 * 60 * 1000,  // 10 min
  cacheTime: 30 * 60 * 1000   // 30 min
});
```

### Rate Limiting
```javascript
// Prevent excessive AI calls
- Mentor matching: Once per user
- Onboarding tips: Max every 5 min
- Wellness insights: Admin only, manual trigger
- Churn prediction: Daily batch job recommended
```

---

**Last Updated:** January 26, 2026  
**AI Provider:** Base44 Core.InvokeLLM  
**Total AI Functions:** 7