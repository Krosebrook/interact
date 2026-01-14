# Algorithms

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  
**Status:** Active Documentation  

---

## Overview

This document describes the key algorithms and computational approaches used throughout the Interact platform. These algorithms power core functionality including gamification mechanics, AI-powered recommendations, engagement scoring, and data processing.

---

## Table of Contents

1. [Gamification Algorithms](#gamification-algorithms)
2. [AI & Machine Learning](#ai--machine-learning)
3. [Scoring & Ranking](#scoring--ranking)
4. [Recommendation Engine](#recommendation-engine)
5. [Data Processing](#data-processing)
6. [Performance Optimization](#performance-optimization)

---

## Gamification Algorithms

### 1. Points Calculation

**Purpose:** Calculate points earned for user activities  
**Complexity:** O(1) per transaction  

```javascript
function calculatePoints(activity, context) {
  const basePoints = activity.basePoints || 0;
  const multiplier = getMultiplier(context);
  const bonus = getBonusPoints(activity, context);
  
  return Math.floor(basePoints * multiplier + bonus);
}

function getMultiplier(context) {
  // First completion bonus
  if (context.isFirstTime) return 1.5;
  
  // Streak bonus (up to 2x at 30 day streak)
  const streakBonus = Math.min(context.streakDays / 30, 1.0);
  
  // Team collaboration bonus
  const teamBonus = context.teamSize >= 5 ? 0.25 : 0;
  
  return 1.0 + streakBonus + teamBonus;
}

function getBonusPoints(activity, context) {
  let bonus = 0;
  
  // Early bird bonus (complete within first 24 hours)
  if (context.completedEarly) bonus += 50;
  
  // Quality bonus (for content submissions)
  if (activity.qualityScore >= 0.8) bonus += 100;
  
  // Perfect attendance bonus
  if (context.perfectAttendance) bonus += 25;
  
  return bonus;
}
```

### 2. Badge Award Logic

**Purpose:** Determine when users earn badges  
**Complexity:** O(n) where n is number of badge conditions  

```javascript
function evaluateBadgeAward(user, badge) {
  const conditions = badge.conditions || [];
  
  for (const condition of conditions) {
    if (!checkCondition(user, condition)) {
      return { awarded: false, progress: calculateProgress(user, conditions) };
    }
  }
  
  return { awarded: true, progress: 1.0 };
}

function checkCondition(user, condition) {
  switch (condition.type) {
    case 'points_threshold':
      return user.totalPoints >= condition.value;
    case 'activities_count':
      return user.activitiesCompleted >= condition.value;
    case 'streak_days':
      return user.currentStreak >= condition.value;
    case 'team_participation':
      return user.teamActivities >= condition.value;
    default:
      return false;
  }
}
```

### 3. Leaderboard Ranking

**Purpose:** Rank users on leaderboards with tie-breaking  
**Complexity:** O(n log n) for sorting  

```javascript
function calculateLeaderboard(users, period = 'week') {
  const scoredUsers = users.map(user => ({
    ...user,
    score: calculateLeaderboardScore(user, period),
    tiebreaker: user.lastActivityTimestamp
  }));
  
  // Sort by score (descending), then by timestamp (ascending)
  return scoredUsers.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tiebreaker - b.tiebreaker;
  }).map((user, index) => ({
    ...user,
    rank: index + 1,
    percentile: ((users.length - index) / users.length) * 100
  }));
}

function calculateLeaderboardScore(user, period) {
  const recentPoints = getRecentPoints(user, period);
  const activityBonus = user.activitiesCompleted * 10;
  const socialBonus = user.teamInteractions * 5;
  
  return recentPoints + activityBonus + socialBonus;
}
```

---

## AI & Machine Learning

### 1. Activity Recommendation

**Purpose:** Recommend activities to users based on preferences and behavior  
**Complexity:** O(n * m) where n = users, m = activities  

```javascript
function recommendActivities(user, activities, limit = 5) {
  const scoredActivities = activities.map(activity => ({
    activity,
    score: calculateRecommendationScore(user, activity)
  }));
  
  // Sort by score and apply diversity filter
  const ranked = scoredActivities.sort((a, b) => b.score - a.score);
  const diverse = applyDiversityFilter(ranked);
  
  return diverse.slice(0, limit).map(item => item.activity);
}

function calculateRecommendationScore(user, activity) {
  // Collaborative filtering score
  const cfScore = collaborativeFilteringScore(user, activity);
  
  // Content-based score
  const cbScore = contentBasedScore(user, activity);
  
  // Contextual factors
  const timeScore = timeRelevanceScore(activity);
  const popularityScore = activity.participantCount / 100;
  const noveltyScore = user.hasParticipated(activity.id) ? 0 : 0.3;
  
  // Weighted combination
  return (
    cfScore * 0.4 +
    cbScore * 0.3 +
    timeScore * 0.15 +
    popularityScore * 0.1 +
    noveltyScore * 0.05
  );
}

function collaborativeFilteringScore(user, activity) {
  // Find similar users based on activity history
  const similarUsers = findSimilarUsers(user, 20);
  
  // Count how many similar users participated
  const participationRate = similarUsers.filter(u => 
    u.activities.includes(activity.id)
  ).length / similarUsers.length;
  
  return participationRate;
}

function contentBasedScore(user, activity) {
  const userPreferences = user.preferences || {};
  const activityTags = activity.tags || [];
  
  // Calculate tag overlap
  const tagScore = activityTags.reduce((score, tag) => {
    return score + (userPreferences[tag] || 0);
  }, 0) / Math.max(activityTags.length, 1);
  
  return Math.min(tagScore, 1.0);
}
```

### 2. Skill Gap Analysis

**Purpose:** Identify skill gaps and learning opportunities  
**Complexity:** O(n * k) where n = skills, k = learning paths  

```javascript
function analyzeSkillGaps(user, targetRole) {
  const currentSkills = user.skills || [];
  const requiredSkills = targetRole.requiredSkills || [];
  
  const gaps = requiredSkills.map(skill => {
    const current = currentSkills.find(s => s.name === skill.name);
    const currentLevel = current?.level || 0;
    const requiredLevel = skill.level;
    
    return {
      skill: skill.name,
      currentLevel,
      requiredLevel,
      gap: Math.max(0, requiredLevel - currentLevel),
      priority: calculateSkillPriority(skill, targetRole)
    };
  }).filter(gap => gap.gap > 0);
  
  return gaps.sort((a, b) => b.priority - a.priority);
}

function calculateSkillPriority(skill, role) {
  const importance = skill.importance || 1.0;
  const demandScore = skill.marketDemand || 1.0;
  const roleRelevance = role.coreSkills.includes(skill.name) ? 1.5 : 1.0;
  
  return importance * demandScore * roleRelevance;
}
```

### 3. Buddy Matching Algorithm

**Purpose:** Match new employees with mentors/buddies  
**Complexity:** O(n²) with optimization to O(n log n)  

```javascript
function findBuddyMatches(newEmployee, potentialBuddies) {
  const scoredBuddies = potentialBuddies.map(buddy => ({
    buddy,
    score: calculateBuddyScore(newEmployee, buddy)
  }));
  
  return scoredBuddies
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.buddy);
}

function calculateBuddyScore(employee, buddy) {
  // Skill overlap (mentor should have relevant skills)
  const skillScore = calculateSkillOverlap(employee, buddy);
  
  // Department proximity (same or adjacent department)
  const deptScore = employee.department === buddy.department ? 1.0 : 0.5;
  
  // Availability (current mentee count)
  const availabilityScore = Math.max(0, 1 - (buddy.currentMentees / 3));
  
  // Personality compatibility
  const personalityScore = calculatePersonalityMatch(employee, buddy);
  
  // Tenure (experienced but not too senior)
  const tenureScore = calculateTenureScore(buddy.tenure);
  
  return (
    skillScore * 0.3 +
    deptScore * 0.2 +
    availabilityScore * 0.2 +
    personalityScore * 0.2 +
    tenureScore * 0.1
  );
}

function calculatePersonalityMatch(employee, buddy) {
  // Big Five personality trait matching
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  
  const similarity = traits.reduce((sum, trait) => {
    const diff = Math.abs(employee.personality[trait] - buddy.personality[trait]);
    return sum + (1 - diff);
  }, 0) / traits.length;
  
  return similarity;
}
```

---

## Scoring & Ranking

### 1. Engagement Score

**Purpose:** Calculate overall user engagement level  
**Complexity:** O(1)  

```javascript
function calculateEngagementScore(user, timeWindow = 30) {
  const metrics = getUserMetrics(user, timeWindow);
  
  // Activity participation (0-40 points)
  const activityScore = Math.min(metrics.activitiesCompleted * 2, 40);
  
  // Login frequency (0-20 points)
  const loginScore = Math.min(metrics.loginDays / timeWindow * 20, 20);
  
  // Social interaction (0-20 points)
  const socialScore = Math.min(metrics.interactions * 0.5, 20);
  
  // Content contribution (0-10 points)
  const contentScore = Math.min(metrics.contributions * 2, 10);
  
  // Learning progress (0-10 points)
  const learningScore = Math.min(metrics.learningHours * 1, 10);
  
  return Math.round(activityScore + loginScore + socialScore + contentScore + learningScore);
}
```

### 2. Team Performance Ranking

**Purpose:** Rank teams by overall performance  
**Complexity:** O(n) where n = teams  

```javascript
function rankTeams(teams) {
  return teams.map(team => ({
    team,
    score: calculateTeamScore(team),
    metrics: getTeamMetrics(team)
  })).sort((a, b) => b.score - a.score);
}

function calculateTeamScore(team) {
  const avgEngagement = team.members.reduce((sum, m) => 
    sum + calculateEngagementScore(m), 0
  ) / team.members.length;
  
  const collaborationScore = team.sharedActivities * 10;
  const achievementScore = team.completedChallenges * 50;
  const consistencyScore = team.consistencyMetric * 100;
  
  return avgEngagement + collaborationScore + achievementScore + consistencyScore;
}
```

---

## Recommendation Engine

### 1. Content Filtering

**Purpose:** Filter and rank content based on relevance  
**Complexity:** O(n log n)  

```javascript
function filterContent(user, content, filters = {}) {
  let filtered = content;
  
  // Apply hard filters
  if (filters.category) {
    filtered = filtered.filter(c => c.category === filters.category);
  }
  
  if (filters.minRating) {
    filtered = filtered.filter(c => c.rating >= filters.minRating);
  }
  
  // Apply soft filters (scoring)
  const scored = filtered.map(item => ({
    item,
    score: calculateContentScore(user, item, filters)
  }));
  
  return scored.sort((a, b) => b.score - a.score).map(s => s.item);
}

function calculateContentScore(user, content, filters) {
  const relevanceScore = calculateRelevance(user, content);
  const qualityScore = content.rating / 5.0;
  const freshnessScore = calculateFreshness(content.createdAt);
  const popularityScore = Math.log10(content.views + 1) / 4;
  
  return (
    relevanceScore * 0.4 +
    qualityScore * 0.3 +
    freshnessScore * 0.2 +
    popularityScore * 0.1
  );
}

function calculateFreshness(date) {
  const ageInDays = (Date.now() - date) / (1000 * 60 * 60 * 24);
  return Math.exp(-ageInDays / 30); // Exponential decay over 30 days
}
```

### 2. Diversity Filter

**Purpose:** Ensure recommendation diversity  
**Complexity:** O(n)  

```javascript
function applyDiversityFilter(rankedItems, categoryKey = 'category') {
  const result = [];
  const categoryCount = new Map();
  const maxPerCategory = 2;
  
  for (const item of rankedItems) {
    const category = item[categoryKey];
    const count = categoryCount.get(category) || 0;
    
    if (count < maxPerCategory) {
      result.push(item);
      categoryCount.set(category, count + 1);
    }
    
    if (result.length >= 10) break; // Limit total results
  }
  
  return result;
}
```

---

## Data Processing

### 1. Aggregation Pipeline

**Purpose:** Aggregate user activity data for analytics  
**Complexity:** O(n) where n = data points  

```javascript
function aggregateUserActivity(activities, groupBy = 'day') {
  const groups = new Map();
  
  for (const activity of activities) {
    const key = getGroupKey(activity.timestamp, groupBy);
    
    if (!groups.has(key)) {
      groups.set(key, {
        count: 0,
        points: 0,
        unique_users: new Set()
      });
    }
    
    const group = groups.get(key);
    group.count++;
    group.points += activity.points || 0;
    group.unique_users.add(activity.userId);
  }
  
  // Convert to array and calculate derived metrics
  return Array.from(groups.entries()).map(([key, data]) => ({
    period: key,
    count: data.count,
    points: data.points,
    unique_users: data.unique_users.size,
    avg_points: data.points / data.count
  }));
}

function getGroupKey(timestamp, groupBy) {
  const date = new Date(timestamp);
  
  switch (groupBy) {
    case 'hour':
      return `${date.toISOString().slice(0, 13)}:00`;
    case 'day':
      return date.toISOString().slice(0, 10);
    case 'week':
      return getWeekKey(date);
    case 'month':
      return date.toISOString().slice(0, 7);
    default:
      return date.toISOString().slice(0, 10);
  }
}
```

### 2. Trend Detection

**Purpose:** Detect trends in engagement metrics  
**Complexity:** O(n)  

```javascript
function detectTrend(dataPoints, metric) {
  if (dataPoints.length < 3) return { trend: 'insufficient_data' };
  
  const values = dataPoints.map(d => d[metric]);
  const timestamps = dataPoints.map(d => d.timestamp);
  
  // Calculate linear regression
  const { slope, r2 } = linearRegression(timestamps, values);
  
  // Determine trend direction
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const relativeSlope = slope / avgValue;
  
  let trend;
  if (Math.abs(relativeSlope) < 0.05) {
    trend = 'stable';
  } else if (relativeSlope > 0) {
    trend = relativeSlope > 0.15 ? 'increasing_fast' : 'increasing';
  } else {
    trend = relativeSlope < -0.15 ? 'decreasing_fast' : 'decreasing';
  }
  
  return {
    trend,
    slope,
    confidence: r2,
    change_percent: relativeSlope * 100
  };
}

function linearRegression(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R²
  const yMean = sumY / n;
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const r2 = 1 - (ssResidual / ssTotal);
  
  return { slope, intercept, r2 };
}
```

---

## Performance Optimization

### 1. Caching Strategy

**Purpose:** Cache expensive computations  
**Complexity:** O(1) lookup  

```javascript
class Cache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage
const recommendationCache = new Cache(600000); // 10 minutes

function getCachedRecommendations(userId) {
  const cached = recommendationCache.get(`recommendations:${userId}`);
  if (cached) return cached;
  
  const recommendations = generateRecommendations(userId);
  recommendationCache.set(`recommendations:${userId}`, recommendations);
  
  return recommendations;
}
```

### 2. Batch Processing

**Purpose:** Process large datasets efficiently  
**Complexity:** O(n) with better memory usage  

```javascript
async function* batchProcessor(items, batchSize = 100) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    yield await processBatch(batch);
  }
}

async function processBatch(items) {
  return Promise.all(items.map(item => processItem(item)));
}

// Usage
async function updateAllUsers(users) {
  for await (const results of batchProcessor(users, 50)) {
    console.log(`Processed ${results.length} users`);
  }
}
```

---

## Algorithm Selection Guidelines

### When to Use Which Algorithm

**Points Calculation:**
- Use simple calculation for real-time updates
- Pre-calculate complex bonuses for historical data

**Recommendations:**
- Use collaborative filtering for established users (>10 activities)
- Use content-based filtering for new users
- Combine both for best results

**Ranking:**
- Use simple sorting for small datasets (<1000 items)
- Use indexed database queries for large datasets
- Cache leaderboards and refresh periodically

**Data Processing:**
- Use streaming for real-time analytics
- Use batch processing for historical reports
- Use aggregation pipelines for complex metrics

---

## Performance Considerations

### Complexity Targets

- **Real-time operations:** O(1) or O(log n)
- **Background jobs:** O(n) or O(n log n)
- **Batch processing:** O(n²) acceptable with small n

### Optimization Strategies

1. **Caching:** Cache expensive computations
2. **Indexing:** Index frequently queried fields
3. **Pagination:** Limit result sets
4. **Lazy Loading:** Load data on demand
5. **Background Jobs:** Move heavy work off request path

---

## Related Documentation

- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization guide
- [CACHING.md](./CACHING.md) - Caching strategies
- [DATA-FLOW.md](./DATA-FLOW.md) - Data flow architecture
- [API-CONTRACTS.md](./API-CONTRACTS.md) - API specifications

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026  
**Next Review:** April 2026
