# API Integration Guide
**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 12, 2026  
**Framework:** Base44 SDK 0.8.3

---

## Overview

This guide provides practical examples and best practices for integrating with the Base44 SDK in the Interact platform. Base44 is a serverless TypeScript framework that powers our backend functions and data management.

---

## Table of Contents

1. [Base44 SDK Basics](#base44-sdk-basics)
2. [Environment Setup](#environment-setup)
3. [Entity Management](#entity-management)
4. [Backend Functions](#backend-functions)
5. [Authentication](#authentication)
6. [Data Queries](#data-queries)
7. [Real-time Updates](#real-time-updates)
8. [File Storage](#file-storage)
9. [Third-party Integrations](#third-party-integrations)
10. [Error Handling](#error-handling)
11. [Best Practices](#best-practices)
12. [Common Patterns](#common-patterns)

---

## Base44 SDK Basics

### What is Base44?

Base44 is a serverless TypeScript framework that provides:
- **Entity System** - Type-safe data models
- **Functions** - Serverless backend logic
- **Authentication** - Built-in user management
- **Storage** - File and media management
- **Integrations** - Third-party service connectors

### Architecture Overview

```
Frontend (React)
    ↓
Base44 SDK (Client)
    ↓
Backend Functions (TypeScript)
    ↓
Base44 Entities (Database)
```

---

## Environment Setup

### Base44 Configuration

The Base44 configuration is in `base44.config.json`:

```json
{
  "name": "interact",
  "version": "0.8.3",
  "entities": {
    "User": "./entities/User.ts",
    "Activity": "./entities/Activity.ts",
    "Event": "./entities/Event.ts"
  },
  "functions": {
    "handler": "./functions"
  }
}
```

### Environment Variables

Create `.env.local` file:

```bash
# Base44
VITE_BASE44_API_KEY=your_api_key_here
VITE_BASE44_PROJECT_ID=your_project_id

# Third-party Services (if used)
VITE_OPENAI_API_KEY=your_openai_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

⚠️ **Security:** Never commit `.env.local` to version control

### Client Initialization

In your app, initialize Base44 client:

```javascript
// src/lib/base44Client.js
import { createClient } from '@base44/client';

export const base44 = createClient({
  apiKey: import.meta.env.VITE_BASE44_API_KEY,
  projectId: import.meta.env.VITE_BASE44_PROJECT_ID,
});
```

---

## Entity Management

### Defining Entities

Entities are defined in TypeScript (in `functions/entities/`):

```typescript
// functions/entities/Activity.ts
import { Entity } from '@base44/core';

export interface Activity extends Entity {
  title: string;
  description: string;
  points: number;
  category: string;
  facilitatorId: string;
  participants: string[];
  maxParticipants?: number;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### Creating Records

```javascript
// Create a new activity
const newActivity = await base44.entities.Activity.create({
  title: 'Team Lunch',
  description: 'Monthly team bonding lunch',
  points: 50,
  category: 'social',
  facilitatorId: currentUser.id,
  participants: [],
  maxParticipants: 20,
  startDate: new Date('2026-02-15T12:00:00'),
  endDate: new Date('2026-02-15T13:00:00'),
  status: 'scheduled',
});

console.log('Created activity:', newActivity.id);
```

### Reading Records

```javascript
// Get single activity by ID
const activity = await base44.entities.Activity.get('activity-id-123');

// Get all activities
const allActivities = await base44.entities.Activity.list();

// Filter activities
const upcomingActivities = await base44.entities.Activity.filter({
  status: 'scheduled',
  startDate: { $gte: new Date() },
});
```

### Updating Records

```javascript
// Update activity
const updated = await base44.entities.Activity.update('activity-id-123', {
  status: 'active',
  participants: [...activity.participants, userId],
});

// Partial update
await base44.entities.Activity.patch('activity-id-123', {
  participants: [...activity.participants, userId],
});
```

### Deleting Records

```javascript
// Soft delete (recommended)
await base44.entities.Activity.update('activity-id-123', {
  status: 'cancelled',
  deletedAt: new Date(),
});

// Hard delete
await base44.entities.Activity.delete('activity-id-123');
```

---

## Backend Functions

### Function Structure

Functions are in `functions/` directory:

```typescript
// functions/activities/joinActivity.ts
import { Context } from '@base44/core';

export default async function joinActivity(
  ctx: Context,
  activityId: string
) {
  // Authentication check
  if (!ctx.user) {
    throw new Error('Authentication required');
  }

  // Get activity
  const activity = await ctx.entities.Activity.get(activityId);
  
  if (!activity) {
    throw new Error('Activity not found');
  }

  // Check capacity
  if (activity.maxParticipants && 
      activity.participants.length >= activity.maxParticipants) {
    throw new Error('Activity is full');
  }

  // Add participant
  await ctx.entities.Activity.update(activityId, {
    participants: [...activity.participants, ctx.user.id],
  });

  // Award points
  await ctx.entities.Points.create({
    userId: ctx.user.id,
    activityId: activityId,
    amount: activity.points,
    type: 'participation',
  });

  return { success: true, activity };
}
```

### Calling Functions from Frontend

```javascript
// src/services/activityService.js
import { base44 } from '@/lib/base44Client';

export const activityService = {
  async joinActivity(activityId) {
    try {
      const result = await base44.functions.call('joinActivity', activityId);
      return result;
    } catch (error) {
      console.error('Failed to join activity:', error);
      throw error;
    }
  },
};
```

### Using with TanStack Query

```javascript
// src/hooks/useJoinActivity.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '@/services/activityService';

export const useJoinActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId) => activityService.joinActivity(activityId),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
    },
    onError: (error) => {
      console.error('Join activity failed:', error);
    },
  });
};
```

---

## Authentication

### User Registration

```javascript
// Register new user
const user = await base44.auth.register({
  email: 'user@example.com',
  password: 'securePassword123',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    role: 'participant',
  },
});
```

### User Login

```javascript
// Login
const session = await base44.auth.login({
  email: 'user@example.com',
  password: 'securePassword123',
});

// Store token
localStorage.setItem('auth_token', session.token);
```

### Get Current User

```javascript
// Get authenticated user
const currentUser = await base44.auth.getCurrentUser();

if (currentUser) {
  console.log('Logged in as:', currentUser.email);
} else {
  console.log('Not authenticated');
}
```

### Logout

```javascript
// Logout
await base44.auth.logout();
localStorage.removeItem('auth_token');
```

### Protected Routes

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

---

## Data Queries

### Basic Queries

```javascript
// Get all records
const activities = await base44.entities.Activity.list();

// Get with pagination
const activities = await base44.entities.Activity.list({
  limit: 20,
  offset: 0,
});

// Sort results
const activities = await base44.entities.Activity.list({
  orderBy: { startDate: 'asc' },
});
```

### Filtering

```javascript
// Simple filter
const myActivities = await base44.entities.Activity.filter({
  facilitatorId: userId,
});

// Multiple conditions (AND)
const upcoming = await base44.entities.Activity.filter({
  status: 'scheduled',
  startDate: { $gte: new Date() },
});

// OR conditions
const activeOrCompleted = await base44.entities.Activity.filter({
  $or: [
    { status: 'active' },
    { status: 'completed' },
  ],
});

// Range queries
const thisMonth = await base44.entities.Activity.filter({
  startDate: {
    $gte: new Date('2026-01-01'),
    $lt: new Date('2026-02-01'),
  },
});

// Array contains
const userActivities = await base44.entities.Activity.filter({
  participants: { $includes: userId },
});
```

### Complex Queries

```javascript
// Nested conditions
const results = await base44.entities.Activity.filter({
  status: { $in: ['scheduled', 'active'] },
  points: { $gte: 50 },
  $or: [
    { category: 'wellness' },
    { category: 'social' },
  ],
});

// Text search
const searched = await base44.entities.Activity.search({
  query: 'team building',
  fields: ['title', 'description'],
});
```

---

## Real-time Updates

### Subscribe to Changes

```javascript
// Subscribe to activity updates
const unsubscribe = base44.entities.Activity.subscribe(
  { id: activityId },
  (activity) => {
    console.log('Activity updated:', activity);
    // Update UI with new data
  }
);

// Cleanup
unsubscribe();
```

### React Hook for Real-time

```javascript
// src/hooks/useActivitySubscription.js
import { useEffect, useState } from 'react';
import { base44 } from '@/lib/base44Client';

export const useActivitySubscription = (activityId) => {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const unsubscribe = base44.entities.Activity.subscribe(
      { id: activityId },
      (updated) => {
        setActivity(updated);
      }
    );

    return () => unsubscribe();
  }, [activityId]);

  return activity;
};
```

---

## File Storage

### Upload Files

```javascript
// Upload image
const file = document.querySelector('input[type="file"]').files[0];

const uploaded = await base44.storage.upload({
  file,
  path: `activities/${activityId}/`,
  metadata: {
    activityId,
    uploadedBy: userId,
  },
});

console.log('File URL:', uploaded.url);
```

### Using Cloudinary (Current Setup)

```javascript
// src/lib/cloudinary.js
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'interact_uploads');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
};
```

---

## Third-party Integrations

### OpenAI Integration

```typescript
// functions/ai/generateActivityDescription.ts
import { Context } from '@base44/core';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function generateActivityDescription(
  ctx: Context,
  { title, category }: { title: string; category: string }
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates engaging activity descriptions.',
      },
      {
        role: 'user',
        content: `Generate a description for a ${category} activity titled "${title}".`,
      },
    ],
  });

  return completion.choices[0].message.content;
}
```

### Google Calendar Integration

```typescript
// functions/calendar/syncToGoogleCalendar.ts
import { Context } from '@base44/core';
import { google } from 'googleapis';

export default async function syncToGoogleCalendar(
  ctx: Context,
  activityId: string
) {
  const activity = await ctx.entities.Activity.get(activityId);
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: ctx.user.googleAccessToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: activity.title,
    description: activity.description,
    start: {
      dateTime: activity.startDate.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: activity.endDate.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data;
}
```

---

## Error Handling

### Frontend Error Handling

```javascript
// src/hooks/useActivities.js
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/base44Client';

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      try {
        const activities = await base44.entities.Activity.list();
        return activities;
      } catch (error) {
        if (error.code === 'UNAUTHORIZED') {
          // Redirect to login
          window.location.href = '/login';
        } else if (error.code === 'NOT_FOUND') {
          return [];
        } else {
          console.error('Failed to fetch activities:', error);
          throw error;
        }
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.code === 'UNAUTHORIZED') return false;
      // Retry 3 times for other errors
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Backend Error Handling

```typescript
// functions/common/errorHandler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Usage in functions
export default async function joinActivity(ctx: Context, activityId: string) {
  if (!ctx.user) {
    throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const activity = await ctx.entities.Activity.get(activityId);
  
  if (!activity) {
    throw new AppError('Activity not found', 'NOT_FOUND', 404);
  }

  if (activity.participants.includes(ctx.user.id)) {
    throw new AppError('Already joined', 'ALREADY_JOINED', 400);
  }

  // Continue with logic...
}
```

---

## Best Practices

### 1. Use Service Layer

Create service files to encapsulate Base44 calls:

```javascript
// src/services/activityService.js
import { base44 } from '@/lib/base44Client';

export const activityService = {
  async getActivities(filters = {}) {
    return await base44.entities.Activity.filter(filters);
  },

  async joinActivity(activityId) {
    return await base44.functions.call('joinActivity', activityId);
  },

  async createActivity(data) {
    return await base44.entities.Activity.create(data);
  },
};
```

### 2. Use TanStack Query for Caching

```javascript
// src/hooks/useActivities.js
import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activityService';

export const useActivities = (filters) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activityService.getActivities(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};
```

### 3. Validate Data

```javascript
// Use Zod for validation
import { z } from 'zod';

const activitySchema = z.object({
  title: z.string().min(3).max(100),
  points: z.number().int().positive(),
  startDate: z.date().min(new Date()),
  maxParticipants: z.number().int().positive().optional(),
});

// Validate before API call
const validated = activitySchema.parse(formData);
await activityService.createActivity(validated);
```

### 4. Handle Loading States

```javascript
const { data, isLoading, isError, error } = useActivities();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;

return <ActivityList activities={data} />;
```

### 5. Implement Optimistic Updates

```javascript
const mutation = useMutation({
  mutationFn: activityService.joinActivity,
  onMutate: async (activityId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['activities'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['activities']);

    // Optimistically update
    queryClient.setQueryData(['activities'], (old) =>
      old.map((activity) =>
        activity.id === activityId
          ? { ...activity, participants: [...activity.participants, userId] }
          : activity
      )
    );

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['activities'], context.previous);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['activities'] });
  },
});
```

---

## Common Patterns

### Pattern 1: Modular Service

```javascript
// src/modules/activities/services/activityService.js
class ActivityService {
  static API_VERSION = 'v1';

  async fetchActivities(filters = {}) {
    try {
      return await base44.entities.Activity.filter(filters);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      throw error;
    }
  }

  async joinActivity(activityId) {
    try {
      return await base44.functions.call('joinActivity', activityId);
    } catch (error) {
      console.error('Failed to join activity:', error);
      throw error;
    }
  }
}

export const activityService = new ActivityService();
```

### Pattern 2: Custom Hook with Service

```javascript
// src/modules/activities/hooks/useActivityData.js
import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services/activityService';

export const useActivityData = (filters = {}) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activityService.fetchActivities(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
```

### Pattern 3: Component with Base44 Sync

```javascript
// src/modules/activities/components/ActivityWidget.jsx
export const ActivityWidget = ({ activityId }) => {
  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => base44.entities.Activity.get(activityId),
  });

  if (isLoading) return <Skeleton />;

  return (
    <div
      data-b44-sync="true"
      data-feature="activities"
      data-version="1.0.0"
      data-entity-id={activity.id}
    >
      <h3>{activity.title}</h3>
      <p>{activity.description}</p>
    </div>
  );
};
```

---

## Resources

### Official Documentation
- [Base44 Documentation](https://base44.io/docs)
- [Base44 API Reference](https://base44.io/api)

### Related Documentation
- [.github/base44-updates.md](./.github/base44-updates.md) - Base44 visual canvas integration
- [ARCHITECTURE.md](./components/docs/ARCHITECTURE.md) - System architecture
- [DATABASE_SCHEMA_TECHNICAL_SPEC.md](./components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md) - Database schemas

---

## Troubleshooting

### Common Issues

**Issue: "Unauthorized" errors**
```javascript
// Solution: Check if auth token is valid
const token = localStorage.getItem('auth_token');
if (!token) {
  window.location.href = '/login';
}
```

**Issue: Stale data after mutations**
```javascript
// Solution: Invalidate queries after mutations
queryClient.invalidateQueries({ queryKey: ['activities'] });
```

**Issue: CORS errors**
```javascript
// Solution: Ensure Base44 config allows your domain
// Check base44.config.json for cors settings
```

---

**Document Owner:** Engineering Team  
**Last Updated:** January 12, 2026  
**Next Review:** March 2026

---

**End of API Integration Guide**
