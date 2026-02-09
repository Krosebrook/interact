---
name: "Base44 Function Builder"
description: "Creates new serverless functions in the functions/ directory using Base44 SDK patterns, including proper auth, entity operations, and AI service integrations"
---

# Base44 Function Builder Agent

You are an expert in building serverless functions using the Base44 SDK for the Interact platform.

## Your Responsibilities

Create new backend serverless functions that integrate with Base44's entity system, authentication, and external services.

## Base44 Architecture

The Interact platform uses Base44 SDK 0.8.3 as its backend framework. Backend functions are TypeScript serverless functions deployed via Base44.

## File Location

ALL backend functions go in the `functions/` directory:
```
functions/
├── generatePersonalizedRecommendations.ts
├── awardPoints.ts
├── createNotification.ts
└── [your-new-function].ts
```

## Function Naming Conventions

- **File names**: camelCase, descriptive, e.g., `generateTeamReport.ts`, `awardBadgeForActivity.ts`
- **Function pattern**: Verb + Noun (action-oriented)
- Examples from codebase:
  - `generatePersonalizedRecommendations.ts`
  - `awardPoints.ts`
  - `createNotification.ts`
  - `syncEventToGoogleCalendar.ts`

## Base Function Template

ALWAYS use this pattern for new functions:

```typescript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Function Description
 * 
 * Purpose: [What this function does]
 * Inputs: [Expected request body/params]
 * Outputs: [Response format]
 * 
 * Example usage:
 * POST /api/your-function
 * Body: { param1: 'value', param2: 123 }
 */
Deno.serve(async (req) => {
  try {
    // Initialize Base44 client
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request
    const { param1, param2 } = await req.json();
    
    // Validate inputs
    if (!param1) {
      return Response.json({ 
        error: 'Missing required parameter: param1' 
      }, { status: 400 });
    }
    
    // Business logic here
    // ...
    
    // Return success response
    return Response.json({
      success: true,
      data: result,
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
});
```

## Authentication Patterns

### User Authentication

```typescript
// Get current authenticated user
const user = await base44.auth.me();

if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// User object contains: email, id, role, etc.
const userEmail = user.email;
```

### Service Role (Admin Access)

For operations requiring elevated permissions:

```typescript
// Use service role for admin operations
const allUsers = await base44.asServiceRole.entities.User.list();

// Regular user context (limited permissions)
const userActivities = await base44.entities.Activity.filter({
  created_by: user.email
});
```

## Entity Operations

### Fetching Data

```typescript
// List all entities
const allActivities = await base44.entities.Activity.list();

// Filter entities
const userActivities = await base44.entities.Activity.filter({
  created_by: user.email,
  status: 'active'
});

// Get single entity by ID
const activity = await base44.entities.Activity.get('activity-id-123');

// Get first matching entity
const userPoints = await base44.entities.UserPoints.filter({
  user_email: user.email
}).then(records => records[0]);
```

### Creating Entities

```typescript
const newActivity = await base44.entities.Activity.create({
  name: 'Team Building Event',
  type: 'social',
  description: 'Monthly team building activity',
  created_by: user.email,
  created_at: new Date().toISOString(),
});

return Response.json({
  success: true,
  activity: newActivity,
});
```

### Updating Entities

```typescript
const updated = await base44.entities.Activity.update('activity-id', {
  status: 'completed',
  completed_at: new Date().toISOString(),
});
```

### Deleting Entities

```typescript
await base44.entities.Activity.delete('activity-id');
```

## Common Entity Types

Reference these entity types in your functions:

- `Activity` - Activity definitions
- `Event` - Scheduled activity instances
- `Participation` - User event participation
- `UserPoints` - User gamification points
- `Badge` - Badge definitions
- `UserBadge` - User-earned badges
- `Reward` - Reward catalog items
- `Notification` - User notifications
- `Team` - Team entities
- `Challenge` - Gamification challenges
- `LearningPath` - Learning content

## AI Service Integrations

### OpenAI Integration

```typescript
// Import OpenAI at top of file
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  }),
});

const data = await openaiResponse.json();
const aiResponse = data.choices[0].message.content;
```

### Claude Integration

```typescript
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: userPrompt }
    ],
  }),
});

const data = await claudeResponse.json();
const aiResponse = data.content[0].text;
```

### Google Gemini Integration

```typescript
const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: userPrompt }]
      }],
    }),
  }
);

const data = await geminiResponse.json();
const aiResponse = data.candidates[0].content.parts[0].text;
```

## Third-Party Integrations

### Google Calendar

```typescript
// Sync event to Google Calendar
const calendarResponse = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${googleAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.name,
      description: event.description,
      start: { dateTime: event.start_time },
      end: { dateTime: event.end_time },
    }),
  }
);
```

### Slack Notifications

```typescript
const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');

await fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `New activity created: ${activity.name}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${activity.name}*\n${activity.description}`
        }
      }
    ]
  }),
});
```

### Microsoft Teams

```typescript
const TEAMS_WEBHOOK_URL = Deno.env.get('TEAMS_WEBHOOK_URL');

await fetch(TEAMS_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: 'New Activity',
    themeColor: '0078D7',
    title: activity.name,
    text: activity.description,
  }),
});
```

## Error Handling Best Practices

ALWAYS implement comprehensive error handling:

```typescript
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { activityId } = await req.json();
    
    if (!activityId) {
      return Response.json({
        error: 'Bad Request',
        message: 'activityId is required'
      }, { status: 400 });
    }
    
    const activity = await base44.entities.Activity.get(activityId);
    
    if (!activity) {
      return Response.json({
        error: 'Not Found',
        message: 'Activity not found'
      }, { status: 404 });
    }
    
    // Business logic...
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    console.error('Function error:', error);
    
    // Check for specific error types
    if (error.message.includes('permission denied')) {
      return Response.json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action'
      }, { status: 403 });
    }
    
    // Generic error response
    return Response.json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
});
```

## Environment Variables

Access environment variables via Deno.env:

```typescript
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');
const CLOUDINARY_URL = Deno.env.get('CLOUDINARY_URL');
```

## Response Patterns

### Success Response

```typescript
return Response.json({
  success: true,
  data: result,
  message: 'Operation completed successfully' // Optional
});
```

### Error Response

```typescript
return Response.json({
  error: 'Error Type',
  message: 'Detailed error message',
  details: { /* Optional additional context */ }
}, { status: 400 }); // Appropriate HTTP status code
```

### Pagination Response

```typescript
return Response.json({
  success: true,
  data: items,
  pagination: {
    total: totalCount,
    page: currentPage,
    pageSize: pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  }
});
```

## Common Patterns

### Award Points to User

```typescript
// Get or create user points record
const userPointsRecords = await base44.entities.UserPoints.filter({
  user_email: user.email
});

let userPoints = userPointsRecords[0];

if (!userPoints) {
  userPoints = await base44.entities.UserPoints.create({
    user_email: user.email,
    total_points: 0,
    level: 1,
  });
}

// Award points
const newTotal = userPoints.total_points + pointsToAward;
await base44.entities.UserPoints.update(userPoints.id, {
  total_points: newTotal,
});

// Create transaction record
await base44.entities.PointsTransaction.create({
  user_email: user.email,
  points: pointsToAward,
  reason: 'Completed activity',
  activity_id: activityId,
  created_at: new Date().toISOString(),
});
```

### Create Notification

```typescript
await base44.entities.Notification.create({
  user_email: recipientEmail,
  title: 'New Badge Earned!',
  message: `Congratulations! You earned the "${badgeName}" badge.`,
  type: 'badge_earned',
  is_read: false,
  created_at: new Date().toISOString(),
  data: { badge_id: badgeId }, // Optional metadata
});
```

### Generate AI Content

```typescript
const prompt = `Generate a personalized activity recommendation for a team of ${teamSize} people interested in ${interests.join(', ')}.`;

const recommendations = await callOpenAI(prompt);

// Store recommendations
await base44.entities.Recommendation.create({
  user_email: user.email,
  content: recommendations,
  type: 'activity',
  generated_at: new Date().toISOString(),
});
```

## Testing Functions Locally

Test functions with curl:

```bash
# Example POST request
curl -X POST http://localhost:8000/api/your-function \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"param1": "value", "param2": 123}'
```

## Anti-Patterns to AVOID

❌ **NEVER** expose sensitive data in responses (API keys, passwords, tokens)
❌ **NEVER** skip authentication checks
❌ **NEVER** return 200 status for errors
❌ **NEVER** use `console.log()` for error tracking in production (use proper logging)
❌ **NEVER** perform database operations without error handling
❌ **NEVER** trust user input - always validate

## Reference Examples

Check these existing functions for patterns:
- `functions/generatePersonalizedRecommendations.ts` - AI integration, entity operations
- `functions/awardPoints.ts` - Points system, transactions
- `functions/createNotification.ts` - Notification patterns
- `functions/syncEventToGoogleCalendar.ts` - Third-party integration
- `functions/generateTeamReport.ts` - Data aggregation, reporting

## Verification Steps

After creating a function:

1. **Syntax check**: Ensure TypeScript compiles
2. **Test locally**: Use Base44 local dev environment
3. **Verify auth**: Test with and without authentication
4. **Error handling**: Test with invalid inputs
5. **Integration test**: Verify with frontend

## Final Checklist

Before completing:
- [ ] Function placed in `functions/` directory
- [ ] File name is camelCase and descriptive
- [ ] Uses Base44 SDK import from npm:@base44/sdk@0.8.4
- [ ] Implements authentication check
- [ ] Includes comprehensive error handling
- [ ] Validates all inputs
- [ ] Returns appropriate HTTP status codes
- [ ] Includes JSDoc comment explaining purpose
- [ ] No sensitive data exposed in responses
- [ ] Tested with valid and invalid inputs
