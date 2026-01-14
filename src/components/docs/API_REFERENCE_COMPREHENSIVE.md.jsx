# INTeract Platform - Comprehensive API Reference

**Version:** 2.0  
**Last Updated:** January 2026  
**Base URL:** Managed by Base44 SDK

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Entities API](#entities-api)
3. [Backend Functions API](#backend-functions-api)
4. [Integrations API](#integrations-api)
5. [Real-time Subscriptions](#real-time-subscriptions)
6. [Analytics API](#analytics-api)
7. [Gamification API](#gamification-api)
8. [File Uploads](#file-uploads)
9. [Error Handling](#error-handling)
10. [Rate Limits & Performance](#rate-limits--performance)
11. [Security Best Practices](#security-best-practices)

---

## Authentication & Authorization

### SDK Initialization

```javascript
import { base44 } from '@/api/base44Client';

// The SDK is pre-initialized and includes user authentication
```

### Get Current User

```javascript
// Get authenticated user
const user = await base44.auth.me();

// Returns:
{
  id: string,
  email: string,
  full_name: string,
  role: 'admin' | 'user',
  user_type?: 'facilitator' | 'participant',
  created_date: string
}
```

### Check Authentication Status

```javascript
const isAuthenticated = await base44.auth.isAuthenticated();
// Returns: boolean
```

### Update Current User

```javascript
// Update current user's data (non-restricted fields only)
await base44.auth.updateMe({
  display_name: "New Name",
  custom_field: "value"
});
```

### Authentication Actions

```javascript
// Logout
base44.auth.logout(redirectUrl?: string);

// Redirect to login
base44.auth.redirectToLogin(nextUrl?: string);
```

### Role-Based Access Control (RBAC)

**Built-in Roles:**
- `admin`: Full system access
- `user`: Standard user with `user_type` of `facilitator` or `participant`

**User Types:**
- `facilitator`: Team leaders, event facilitators
- `participant`: Standard employees

**Permission Checks:**
```javascript
// In components
const { isAdmin, isFacilitator, isParticipant } = useUserData();

if (isAdmin) {
  // Admin-only functionality
}
```

---

## Entities API

### Base Operations

All entities support CRUD operations through the SDK:

```javascript
import { base44 } from '@/api/base44Client';

// List all records (with optional sorting and limit)
const items = await base44.entities.EntityName.list(sortField?, limit?);

// Filter records
const filtered = await base44.entities.EntityName.filter(
  { field: value, status: 'active' },
  sortField?,
  limit?
);

// Get by ID (internal - use filter instead)
// const item = await base44.entities.EntityName.getById(id);

// Create single record
const newItem = await base44.entities.EntityName.create(data);

// Bulk create
const newItems = await base44.entities.EntityName.bulkCreate([data1, data2]);

// Update record
const updated = await base44.entities.EntityName.update(id, data);

// Delete record
await base44.entities.EntityName.delete(id);

// Get entity schema
const schema = await base44.entities.EntityName.schema();
```

### Built-in Fields

All entities automatically include:
- `id` (string): Unique identifier
- `created_date` (datetime): Creation timestamp
- `updated_date` (datetime): Last update timestamp
- `created_by` (string): Email of creator

### User Entity (Built-in)

**Special Security Rules:**
- Only admins can list all users
- Regular users can only view/update their own record
- Cannot modify: `id`, `email`, `full_name`, `role`

```javascript
// List all users (admin only)
const users = await base44.entities.User.list();

// Get current user (always allowed)
const currentUser = await base44.auth.me();

// Update current user
await base44.auth.updateMe({ custom_field: value });

// Invite user (admin only)
await base44.users.inviteUser(email, role);
```

### Core Entities Reference

#### UserProfile

Extended user information and preferences.

```javascript
const profile = await base44.entities.UserProfile.filter({ 
  user_email: user.email 
});

// Fields:
{
  user_email: string (required),
  status: 'active' | 'suspended' | 'pending',
  display_name?: string,
  bio?: string,
  avatar_url?: string,
  department?: string,
  job_title?: string,
  activity_preferences: {
    preferred_types: string[],
    preferred_duration: string,
    optimal_days: string[],
    // ... more preferences
  },
  notification_preferences: {
    enabled_channels: string[],
    event_reminders: string,
    // ... more settings
  },
  privacy_settings: {
    profile_visibility: 'public' | 'team_only' | 'private',
    show_activity_history: boolean,
    // ... more settings
  }
}
```

**Permissions:**
- Read: Admin or own profile
- Write/Update: Admin or own profile

#### UserPoints

Gamification points tracking.

```javascript
const points = await base44.entities.UserPoints.filter({ 
  user_email: user.email 
});

// Fields:
{
  user_email: string (required),
  total_points: number (default: 0),
  points_this_month: number (default: 0),
  lifetime_points: number (default: 0),
  current_streak: number (default: 0),
  tier: 'bronze' | 'silver' | 'gold' | 'platinum',
  team_id?: string
}
```

**Permissions:**
- Read: Own record or admin
- Write/Update: Admin only

#### Recognition

Peer-to-peer recognition system.

```javascript
const recognition = await base44.entities.Recognition.create({
  from_user: user.email,
  to_user: 'colleague@example.com',
  message: 'Great work on the project!',
  category: 'teamwork',
  visibility: 'public',
  company_values: ['collaboration', 'innovation']
});

// Fields:
{
  from_user: string (required),
  to_user: string (required),
  message: string (required),
  category: 'teamwork' | 'innovation' | 'leadership' | 'helping' | 'excellence',
  visibility: 'public' | 'team_only' | 'private',
  company_values?: string[],
  reactions: object[],
  comments: object[],
  featured: boolean (default: false)
}
```

**Permissions:**
- Read: Public records, or own sent/received, or admin
- Write: Anyone (for giving recognition)
- Update: Admin only (for featuring)

#### StoreItem

Rewards store items.

```javascript
const item = await base44.entities.StoreItem.create({
  item_name: 'Extra PTO Day',
  description: '1 additional day of paid time off',
  points_cost: 5000,
  category: 'time_off',
  requires_approval: true
});

// Fields:
{
  item_name: string (required),
  description: string,
  image_url?: string,
  points_cost: number (required),
  category: 'time_off' | 'swag' | 'gift_card' | 'experience' | 'donation' | 'other',
  stock_quantity?: number,
  is_available: boolean (default: true),
  requires_approval: boolean (default: true),
  max_per_user?: number
}
```

**Permissions:**
- Read: All
- Write/Update/Delete: Admin only

#### RewardRedemption

Track reward redemptions and approvals.

```javascript
const redemption = await base44.entities.RewardRedemption.create({
  user_email: user.email,
  store_item_id: itemId,
  points_spent: 5000,
  user_notes: 'Would like to use next week'
});

// Status flow: pending → approved/rejected → fulfilled
```

**Permissions:**
- Read: Own redemptions or admin
- Write: Anyone (to request)
- Update: Admin only (for approval/fulfillment)

#### Event

Event scheduling and management.

```javascript
const event = await base44.entities.Event.create({
  title: 'Team Building Workshop',
  description: 'Monthly team building activity',
  start_time: '2026-02-01T14:00:00Z',
  duration_minutes: 60,
  event_type: 'team_building',
  max_participants: 50,
  facilitator_email: user.email
});
```

**Permissions:**
- Read: All
- Write/Update: Admin or facilitator
- Delete: Admin only

#### Team

Team structure and management.

```javascript
const team = await base44.entities.Team.create({
  team_name: 'Engineering',
  team_type: 'department',
  team_lead_email: 'lead@example.com'
});
```

**Permissions:**
- Read: All
- Write: Admin or facilitator
- Update: Admin or team lead

#### Channel

Communication channels for teams.

```javascript
const channel = await base44.entities.Channel.create({
  name: 'general',
  description: 'General company updates',
  channel_type: 'public',
  team_id: teamId
});
```

**Permissions:**
- Read: All (public) or team members (team channels)
- Write: Admin or facilitator
- Messages: Team members

#### Survey

Pulse surveys and feedback collection.

```javascript
const survey = await base44.entities.Survey.create({
  title: 'Weekly Pulse Check',
  description: 'How was your week?',
  questions: [
    {
      question: 'How satisfied are you this week?',
      type: 'scale',
      scale_min: 1,
      scale_max: 5
    }
  ],
  is_anonymous: true,
  target_audience: ['all']
});
```

**Permissions:**
- Read: All (active surveys) or admin (all surveys)
- Write/Update: Admin only
- Responses: Anyone (anonymous)

---

## Backend Functions API

### Calling Functions

```javascript
import { base44 } from '@/api/base44Client';

// Call a backend function
const response = await base44.functions.invoke('functionName', {
  param1: 'value1',
  param2: 'value2'
});

// Response structure:
{
  data: any,        // Function return data
  status: number,   // HTTP status code
  headers: object   // Response headers
}
```

### Service Role Functions

From backend functions, access with elevated permissions:

```javascript
// In functions/*.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Get authenticated user
  const user = await base44.auth.me();
  
  // User-scoped operation
  const userItems = await base44.entities.Entity.list();
  
  // Service role (admin privileges) - use carefully!
  const allItems = await base44.asServiceRole.entities.Entity.list();
  
  return Response.json({ data: allItems });
});
```

### Common Backend Functions

#### gamificationAI

AI-powered gamification recommendations.

```javascript
const result = await base44.functions.invoke('gamificationAI', {
  user_email: user.email,
  request_type: 'challenge_suggestion' | 'reward_recommendation',
  context: {
    current_tier: 'silver',
    recent_activities: []
  }
});
```

#### sendTeamsNotification

Send Microsoft Teams notifications.

```javascript
await base44.functions.invoke('sendTeamsNotification', {
  user_email: recipient,
  title: 'New Recognition!',
  message: 'You received recognition from John',
  action_url: 'https://app.com/recognition/123'
});
```

#### processGamificationRules

Process gamification rule triggers.

```javascript
await base44.functions.invoke('processGamificationRules', {
  event_type: 'recognition_given',
  user_email: user.email,
  metadata: {
    points: 50,
    category: 'teamwork'
  }
});
```

---

## Integrations API

### Core Integrations

Available built-in integrations accessible via `base44.integrations.Core`.

#### InvokeLLM

Generate AI responses with optional web context.

```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "Suggest team building activities for remote teams",
  add_context_from_internet: true,
  response_json_schema: {
    type: "object",
    properties: {
      activities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            duration: { type: "string" },
            participants: { type: "number" }
          }
        }
      }
    }
  }
});

// Returns parsed JSON if schema provided, otherwise string
```

#### SendEmail

Send transactional emails.

```javascript
await base44.integrations.Core.SendEmail({
  from_name: 'INTeract Platform',
  to: 'user@example.com',
  subject: 'Welcome to INTeract!',
  body: '<h1>Welcome!</h1><p>Get started here...</p>'
});
```

#### UploadFile

Upload files to public storage.

```javascript
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject // File or Blob
});

// Returns: { file_url: "https://..." }
```

#### GenerateImage

AI image generation.

```javascript
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "Modern office team collaboration illustration",
  existing_image_urls: [] // Optional reference images
});
```

#### ExtractDataFromUploadedFile

Extract structured data from uploaded files (CSV, PDF, images).

```javascript
const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
  file_url: uploadedFileUrl,
  json_schema: {
    type: "object",
    properties: {
      employees: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            department: { type: "string" }
          }
        }
      }
    }
  }
});

// Returns: { status: "success", output: [...] }
```

---

## Real-time Subscriptions

Subscribe to entity changes in real-time.

```javascript
import { base44 } from '@/api/base44Client';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Subscribe to all changes on an entity
    const unsubscribe = base44.entities.Recognition.subscribe((event) => {
      console.log(`Recognition ${event.id} was ${event.type}d`);
      console.log('Data:', event.data);
      
      if (event.type === 'create') {
        // Handle new recognition
      } else if (event.type === 'update') {
        // Handle updated recognition
      } else if (event.type === 'delete') {
        // Handle deleted recognition
      }
    });
    
    // Cleanup subscription
    return unsubscribe;
  }, []);
}

// Event structure:
{
  type: 'create' | 'update' | 'delete',
  id: string,
  data: object // Full entity data
}
```

### React Query Integration

Combine subscriptions with React Query for optimistic updates:

```javascript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

useEffect(() => {
  const unsubscribe = base44.entities.Recognition.subscribe((event) => {
    // Invalidate relevant queries
    queryClient.invalidateQueries(['recognitions']);
    
    // Or update cache directly
    if (event.type === 'create') {
      queryClient.setQueryData(['recognitions'], (old) => 
        [...(old || []), event.data]
      );
    }
  });
  
  return unsubscribe;
}, [queryClient]);
```

---

## Analytics API

### Track Custom Events

```javascript
import { base44 } from '@/api/base44Client';

// Track user interactions
base44.analytics.track({
  eventName: 'recognition_given',
  properties: {
    category: 'teamwork',
    points_awarded: 50,
    recipient_department: 'engineering'
  }
});

// Best practices:
// - Use snake_case for event names
// - Keep properties minimal and relevant
// - Use consistent naming conventions
// - Never include PII in properties
```

### Event Categories

- `engagement`: User interactions with features
- `navigation`: Page views and navigation
- `conversion`: Goal completions (e.g., redemption)
- `ai_interaction`: AI feature usage
- `social`: Recognition, channels, teams
- `learning`: Learning path interactions

---

## Gamification API

### Trigger Points Award

```javascript
import { useGamificationTrigger } from '@/components/hooks/useGamificationTrigger';

const { triggerGamification } = useGamificationTrigger();

// Award points for an action
await triggerGamification('recognition_given', {
  points: 50,
  user_email: user.email,
  metadata: {
    category: 'teamwork'
  }
});
```

### Gamification Events

Common trigger events:
- `recognition_given`: User gives recognition
- `recognition_received`: User receives recognition
- `survey_completed`: User completes a survey
- `event_attended`: User attends an event
- `challenge_completed`: User completes a challenge
- `profile_completed`: User completes their profile
- `daily_login`: User logs in (once per day)
- `referral_success`: User refers another user

---

## File Uploads

### Public File Upload

```javascript
import { base44 } from '@/api/base44Client';

const handleFileUpload = async (file) => {
  // Validate file
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Upload
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  
  return file_url;
};
```

### Private File Upload

```javascript
// Upload to private storage
const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });

// Create signed URL for access (expires in 5 minutes by default)
const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
  file_uri: file_uri,
  expires_in: 300 // seconds
});
```

---

## Error Handling

### Standard Error Structure

```javascript
try {
  const result = await base44.entities.Entity.create(data);
} catch (error) {
  // Error structure:
  {
    message: string,      // Human-readable error message
    status: number,       // HTTP status code
    code?: string,        // Error code (e.g., 'PERMISSION_DENIED')
    details?: object      // Additional error context
  }
}
```

### Common Error Codes

- `401`: Unauthorized - user not authenticated
- `403`: Forbidden - insufficient permissions
- `404`: Not Found - entity doesn't exist
- `422`: Validation Error - invalid data
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

### Error Handling Best Practices

```javascript
import { toast } from 'sonner';

const handleApiCall = async () => {
  try {
    const result = await base44.entities.Entity.create(data);
    toast.success('Created successfully!');
    return result;
  } catch (error) {
    // User-friendly error messages
    if (error.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.status === 422) {
      toast.error('Invalid data: ' + error.message);
    } else {
      toast.error('An error occurred. Please try again.');
      console.error('API Error:', error);
    }
    throw error;
  }
};
```

---

## Rate Limits & Performance

### Rate Limits

- **API Calls**: 100 requests per minute per user
- **File Uploads**: 10 files per minute
- **Real-time Subscriptions**: 50 concurrent subscriptions per user
- **AI Integrations**: 20 calls per minute per user

### Performance Best Practices

#### 1. Use React Query for Caching

```javascript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['recognitions', filters],
  queryFn: () => base44.entities.Recognition.filter(filters),
  staleTime: 30000, // Cache for 30 seconds
  cacheTime: 300000 // Keep in cache for 5 minutes
});
```

#### 2. Batch Operations

```javascript
// Bad: Multiple individual creates
for (const item of items) {
  await base44.entities.Entity.create(item);
}

// Good: Bulk create
await base44.entities.Entity.bulkCreate(items);
```

#### 3. Pagination

```javascript
// List with limit
const recentItems = await base44.entities.Entity.list('-created_date', 20);

// Filter with limit
const filtered = await base44.entities.Entity.filter(
  { status: 'active' },
  '-created_date',
  50
);
```

#### 4. Debounce Search Inputs

```javascript
import { useDebounce } from '@/components/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearch) {
    // Perform search
  }
}, [debouncedSearch]);
```

---

## Security Best Practices

### 1. Never Expose Sensitive Data

```javascript
// Bad: Exposing PII in analytics
base44.analytics.track({
  eventName: 'user_action',
  properties: {
    email: user.email, // ❌ Never include PII
    salary: user.salary // ❌ Never include sensitive data
  }
});

// Good: Use anonymous identifiers
base44.analytics.track({
  eventName: 'user_action',
  properties: {
    user_cohort: '2024-01',
    department: 'engineering'
  }
});
```

### 2. Validate User Permissions

```javascript
// In components
const { isAdmin, isFacilitator } = useUserData();

const handleDelete = async (id) => {
  if (!isAdmin && !isFacilitator) {
    toast.error('Insufficient permissions');
    return;
  }
  
  await base44.entities.Entity.delete(id);
};
```

### 3. Sanitize User Input

```javascript
// Use proper validation
import { z } from 'zod';

const recognitionSchema = z.object({
  to_user: z.string().email(),
  message: z.string().min(10).max(500),
  category: z.enum(['teamwork', 'innovation', 'leadership'])
});

const data = recognitionSchema.parse(formData);
```

### 4. Session Management

```javascript
// 8-hour session timeout is automatic
// Users must re-authenticate after timeout

// Check authentication before sensitive operations
const isAuth = await base44.auth.isAuthenticated();
if (!isAuth) {
  base44.auth.redirectToLogin();
  return;
}
```

### 5. Backend Function Security

```javascript
// Always verify user in backend functions
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Verify authentication
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify admin role for admin-only operations
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with operation
  // ...
});
```

---

## Quick Reference

### Common Patterns

**Fetch user profile with points:**
```javascript
const [profile, points] = await Promise.all([
  base44.entities.UserProfile.filter({ user_email: user.email }),
  base44.entities.UserPoints.filter({ user_email: user.email })
]);
```

**Create recognition with gamification:**
```javascript
const recognition = await base44.entities.Recognition.create(data);
await triggerGamification('recognition_given', {
  user_email: user.email,
  points: 50
});
```

**Subscribe to real-time updates:**
```javascript
useEffect(() => {
  const unsub = base44.entities.Entity.subscribe((event) => {
    queryClient.invalidateQueries(['entity-list']);
  });
  return unsub;
}, []);
```

**Handle file upload:**
```javascript
const { file_url } = await base44.integrations.Core.UploadFile({ file });
await base44.entities.Entity.update(id, { image_url: file_url });
```

---

## Support & Resources

- **Platform Documentation**: `/pages/Documentation`
- **Entity Schemas**: Use `base44.entities.EntityName.schema()`
- **Error Logs**: Check browser console and network tab
- **Backend Function Logs**: Available in Base44 dashboard

For technical support, contact your system administrator.

---

**Document Version:** 2.0  
**Last Updated:** January 14, 2026  
**Maintained By:** INTeract Platform Team