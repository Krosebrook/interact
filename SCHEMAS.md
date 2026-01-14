# Schemas

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

This document defines data schemas, types, and validation rules used throughout the Interact platform.

---

## Core Data Schemas

### User Schema

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'facilitator' | 'participant';
  profile: {
    avatar?: string;
    bio?: string;
    department?: string;
    location?: string;
    timezone?: string;
  };
  gamification: {
    points: number;
    level: number;
    badges: Badge[];
    streak: number;
  };
  preferences: {
    notifications: boolean;
    emailDigest: 'daily' | 'weekly' | 'none';
    activityCategories: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}
```

### Activity Schema

```typescript
interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'team_building' | 'wellness' | 'learning' | 'social' | 'volunteer';
  type: 'event' | 'challenge' | 'task';
  points: number;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  schedule: {
    startDate: Date;
    endDate?: Date;
    recurring?: RecurrenceRule;
  };
  location?: {
    type: 'physical' | 'virtual' | 'hybrid';
    address?: string;
    meetingLink?: string;
  };
  capacity?: number;
  participants: string[]; // user IDs
  facilitators: string[]; // user IDs
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Badge Schema

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: BadgeCriteria[];
  rarity: number; // 0-1
  createdAt: Date;
}

interface BadgeCriteria {
  type: 'points_threshold' | 'activities_count' | 'streak_days' | 'custom';
  value: number;
  operator: '>=' | '>' | '==' | '<' | '<=';
}
```

### Challenge Schema

```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'competition';
  rules: ChallengeRule[];
  rewards: Reward[];
  startDate: Date;
  endDate: Date;
  participants: Participant[];
  status: 'upcoming' | 'active' | 'completed';
}
```

### Learning Path Schema

```typescript
interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  modules: Module[];
  prerequisites?: string[]; // learning path IDs
  skills: Skill[];
}

interface Module {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  content: string | ContentReference;
  duration: number; // minutes
  points: number;
  order: number;
}
```

---

## Validation Schemas (Zod)

### Activity Creation

```typescript
import { z } from 'zod';

export const createActivitySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(['team_building', 'wellness', 'learning', 'social', 'volunteer']),
  points: z.number().int().min(0).max(1000),
  startDate: z.date().min(new Date()),
  capacity: z.number().int().positive().optional(),
  location: z.object({
    type: z.enum(['physical', 'virtual', 'hybrid']),
    address: z.string().optional(),
    meetingLink: z.string().url().optional(),
  }).optional(),
});
```

### User Registration

```typescript
export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  name: z.string().min(2).max(50),
  department: z.string().optional(),
});
```

---

## API Schemas

### Request Schemas

```typescript
// POST /api/activities
interface CreateActivityRequest {
  activity: Partial<Activity>;
}

// GET /api/activities?category=wellness&status=active
interface ListActivitiesRequest {
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}
```

### Response Schemas

```typescript
// Standard success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    totalPages?: number;
    totalCount?: number;
  };
}

// Standard error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## Database Schemas

See [components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md](./components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md) for complete Base44 entity schemas.

---

## Event Schemas

### Activity Events

```typescript
interface ActivityCreatedEvent {
  type: 'activity.created';
  activityId: string;
  createdBy: string;
  timestamp: Date;
}

interface ActivityJoinedEvent {
  type: 'activity.joined';
  activityId: string;
  userId: string;
  timestamp: Date;
}
```

### Gamification Events

```typescript
interface PointsEarnedEvent {
  type: 'points.earned';
  userId: string;
  points: number;
  source: 'activity' | 'challenge' | 'bonus';
  sourceId: string;
  timestamp: Date;
}

interface BadgeAwardedEvent {
  type: 'badge.awarded';
  userId: string;
  badgeId: string;
  timestamp: Date;
}
```

---

## Related Documentation

- [API-CONTRACTS.md](./API-CONTRACTS.md) - API specifications
- [DATA-FLOW.md](./DATA-FLOW.md) - Data flow patterns
- [components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md](./components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md) - Database schema

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
