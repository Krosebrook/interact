# INTeract API Reference

## Base44 SDK Usage

### Authentication

```javascript
import { base44 } from '@/api/base44Client';

// Get current user
const user = await base44.auth.me();
// Returns: { email, full_name, role, user_type, ... }

// Check if authenticated
const isAuth = await base44.auth.isAuthenticated();

// Logout
base44.auth.logout('/custom-redirect');

// Redirect to login
base44.auth.redirectToLogin('/return-url');

// Update current user profile
await base44.auth.updateMe({ 
  full_name: 'New Name',
  user_type: 'facilitator' 
});
```

---

### Entity Operations

#### Read Operations
```javascript
// List all (limit optional, default 50)
const events = await base44.entities.Event.list('-created_date', 20);
// Returns 20 most recent events

// Filter with query
const activeEvents = await base44.entities.Event.filter(
  { status: 'scheduled' },
  '-scheduled_date',
  10
);

// Get single record by ID
const event = await base44.entities.Event.get(eventId);
```

#### Write Operations
```javascript
// Create single record
const newEvent = await base44.entities.Event.create({
  activity_id: 'act_123',
  title: 'Team Trivia',
  scheduled_date: '2025-12-20T14:00:00Z',
  status: 'scheduled'
});

// Create multiple records
const events = await base44.entities.Event.bulkCreate([
  { title: 'Event 1', ... },
  { title: 'Event 2', ... }
]);

// Update record
await base44.entities.Event.update(eventId, {
  status: 'completed'
});

// Delete record
await base44.entities.Event.delete(eventId);
```

#### Schema Access
```javascript
// Get entity schema (useful for dynamic forms)
const schema = await base44.entities.Event.schema();
// Returns JSON schema without built-in fields
```

---

### Backend Functions

#### Invoke Function
```javascript
// V3+ syntax
const response = await base44.functions.invoke('functionName', {
  param1: 'value',
  param2: 123
});

// Response structure
{
  data: {...},      // Function return value
  status: 200,      // HTTP status
  headers: {...}    // Response headers
}
```

#### Common Functions

**Invite Users**
```javascript
const result = await base44.functions.invoke('inviteUser', {
  emails: ['john@intinc.com', 'jane@intinc.com'],
  role: 'participant',
  message: 'Welcome to the team!'
});

// Returns
{
  success: true,
  invitations: [...],
  errors: [...],  // Failed emails
  summary: "2 invitation(s) sent"
}
```

**Manage User Role**
```javascript
const result = await base44.functions.invoke('manageUserRole', {
  action: 'change_role',  // 'suspend' | 'activate'
  targetEmail: 'user@intinc.com',
  newRole: 'admin',
  newUserType: null
});
```

**Record Points Transaction**
```javascript
const result = await base44.functions.invoke('recordPointsTransaction', {
  userEmail: 'user@intinc.com',
  amount: 50,
  transactionType: 'manual_adjustment',
  description: 'Bonus for exceptional work',
  referenceType: 'Event',
  referenceId: 'evt_123'
});

// Returns
{
  success: true,
  ledger_entry: {...},
  new_balance: 550,
  level: 5
}
```

**Export User Data**
```javascript
const result = await base44.functions.invoke('exportUserData', {
  format: 'csv',  // 'json' | 'pdf'
  includeSensitiveData: false  // Owner only
});

// Returns binary data (CSV/PDF) or JSON
```

**Send Teams Notification**
```javascript
await base44.functions.invoke('sendTeamsNotification', {
  eventId: 'evt_123',
  notificationType: 'reminder'  // 'announcement' | 'recap'
});
```

**Generate Calendar File**
```javascript
const response = await base44.functions.invoke('generateCalendarFile', {
  eventId: 'evt_123'
});

// Returns .ics file content
// Download in browser:
const blob = new Blob([response.data], { type: 'text/calendar' });
const url = window.URL.createObjectURL(blob);
// ... download logic
```

---

### Integrations

#### Core Integrations

**Invoke LLM (AI)**
```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "Generate a fun team building activity for remote workers",
  add_context_from_internet: false,
  response_json_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      duration: { type: "string" },
      materials: { type: "array", items: { type: "string" } }
    }
  }
});

// Returns parsed JSON object (not string)
```

**Send Email**
```javascript
await base44.integrations.Core.SendEmail({
  to: 'user@intinc.com',
  from_name: 'INTeract Team',
  subject: 'Event Reminder',
  body: 'Your event is tomorrow at 2pm...'
});
```

**Upload File**
```javascript
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject  // File from <input type="file">
});

// Returns public URL
```

**Generate Image (AI)**
```javascript
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "Corporate team building event poster, modern design",
  existing_image_urls: ['reference.jpg']  // Optional
});

// Takes 5-10 seconds
```

**Extract Data from File**
```javascript
const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
  file_url: uploadedFileUrl,
  json_schema: {
    type: "object",
    properties: {
      users: {
        type: "array",
        items: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" }
          }
        }
      }
    }
  }
});

// Returns
{
  status: "success" | "error",
  details: "Error message if failed",
  output: { users: [...] }
}
```

---

## React Query Patterns

### Standard Query
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['events', userId],
  queryFn: () => base44.entities.Event.filter({ created_by: userId }),
  staleTime: 30000,  // 30 seconds
  enabled: !!userId  // Conditional fetch
});
```

### Mutation with Cache Update
```javascript
const mutation = useMutation({
  mutationFn: (eventData) => base44.entities.Event.create(eventData),
  onSuccess: (newEvent) => {
    // Optimistic update
    queryClient.setQueryData(['events'], (old) => [...old, newEvent]);
    
    // Or invalidate
    queryClient.invalidateQueries(['events']);
    
    toast.success('Event created!');
  }
});
```

### Infinite Scroll
```javascript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['events-infinite'],
  queryFn: ({ pageParam = 0 }) => 
    base44.entities.Event.list('-created_date', 20, pageParam),
  getNextPageParam: (lastPage, pages) => 
    lastPage.length === 20 ? pages.length * 20 : undefined
});
```

---

## Error Codes

### Common HTTP Status Codes
```
200 - Success
400 - Bad Request (validation error)
401 - Unauthorized (not logged in)
403 - Forbidden (insufficient permissions)
404 - Not Found (entity doesn't exist)
500 - Internal Server Error (backend issue)
```

### Custom Error Handling
```javascript
try {
  await base44.entities.Event.create(data);
} catch (error) {
  if (error.status === 403) {
    toast.error('You don\'t have permission to create events');
  } else if (error.status === 400) {
    toast.error('Invalid event data: ' + error.message);
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

---

## Rate Limits

### Function Limits
- **inviteUser:** 100 emails/minute per user
- **recordPointsTransaction:** 20 transactions/minute per user
- **InvokeLLM:** 10 requests/minute per user

### Entity Limits
- **List:** Max 100 records per request
- **BulkCreate:** Max 100 records per request
- **Filter:** Complex queries may timeout after 30s

---

## Webhooks (Future)

### Stripe Webhooks
```javascript
// functions/stripeWebhook.js
Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = stripe.webhooks.constructEventAsync(
    body,
    sig,
    webhookSecret
  );
  
  if (event.type === 'checkout.session.completed') {
    // Handle successful payment
  }
});
```

### Teams Webhooks (Incoming)
```javascript
// Receive @mentions from Teams
// Auto-create tasks or events from Teams messages
```

---

## Security Best Practices

### Input Validation
```javascript
// Always validate user input
import { validateEmail, sanitizeInput } from '../lib/validation';

const email = sanitizeInput(userInput);
if (!validateEmail(email)) {
  throw new Error('Invalid email format');
}
```

### RBAC Enforcement
```javascript
// Backend functions MUST check permissions
import { requirePermission } from './lib/rbacMiddleware';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await requirePermission(base44, 'INVITE_USERS');
  // ... proceed with function
});
```

### Audit Logging
```javascript
// Log all sensitive actions
await base44.asServiceRole.entities.AuditLog.create({
  action: 'data_exported',
  actor_email: currentUser.email,
  severity: 'critical',
  metadata: { record_count: 100 }
});
```

---

This API reference covers all major integration points for developers working on INTeract.