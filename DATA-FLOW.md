# Data Flow

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

This document describes how data flows through the Interact platform, from user interactions to backend processing and back to the UI.

---

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
┌──────▼──────────────────────────┐
│  React SPA (Vite)                │
│  - TanStack Query (cache)        │
│  - React Context (global state)  │
│  - Local Storage (persistence)   │
└──────┬──────────────────────────┘
       │ Base44 SDK
┌──────▼──────────────────────────┐
│  Base44 Backend                  │
│  - Deno Functions (61)           │
│  - Database                      │
│  - Authentication                │
│  - File Storage (Cloudinary)     │
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│  External Services               │
│  - OpenAI, Claude, Gemini        │
│  - Slack, Teams, Calendar        │
│  - Email, SMS                    │
└──────────────────────────────────┘
```

---

## Data Flow Patterns

### 1. User Authentication Flow

```
User Login Request
  ↓
React Login Form
  ↓
Base44 SDK authenticate()
  ↓
Base44 Auth Service (validates credentials)
  ↓
Returns JWT Token
  ↓
Store in localStorage + AuthContext
  ↓
Include in all subsequent requests
```

### 2. Activity Creation Flow

```
User fills activity form
  ↓
React Hook Form (validation with Zod)
  ↓
Submit via useMutation (TanStack Query)
  ↓
Base44 SDK createEntity('activities', data)
  ↓
Base44 Function: validateActivity()
  ↓
Database: INSERT activity
  ↓
Trigger: sendNotifications()
  ↓
Response: {success, activityId}
  ↓
Update TanStack Query cache
  ↓
Invalidate related queries
  ↓
UI updates automatically
```

### 3. Real-Time Data Updates

```
User A joins activity
  ↓
Mutation updates database
  ↓
Database trigger fires
  ↓
Webhook/polling updates User B's client
  ↓
TanStack Query invalidates cache
  ↓
Refetch latest data
  ↓
UI re-renders with new participant
```

### 4. Analytics Data Flow

```
User activity events
  ↓
Event tracking (frontend)
  ↓
Batch send to backend
  ↓
Base44 Function: logEvent()
  ↓
Store in analytics table
  ↓
Aggregation job (scheduled)
  ↓
Pre-compute metrics
  ↓
Store in metrics cache
  ↓
Dashboard queries cached metrics
  ↓
Display in charts (Recharts)
```

---

## State Management

### Global State (React Context)

- **AuthContext:** User authentication state
- **ThemeContext:** Dark/light mode
- **NotificationContext:** Toast notifications

### Server State (TanStack Query)

- **Activities:** useQuery('activities')
- **Users:** useQuery(['user', userId])
- **Gamification:** useQuery('gamification')
- **Analytics:** useQuery(['analytics', params])

### Local State (useState)

- Form inputs
- UI toggles
- Modal visibility
- Temporary calculations

### Persistent State (localStorage)

- Auth tokens
- User preferences
- Theme selection
- Draft content

---

## Caching Strategy

### TanStack Query Cache

```javascript
{
  cacheTime: 5 * 60 * 1000, // 5 minutes
  staleTime: 1 * 60 * 1000,  // 1 minute
  refetchOnWindowFocus: true,
  refetchOnMount: true
}
```

### Cache Invalidation

```javascript
// After mutation
queryClient.invalidateQueries(['activities']);

// Optimistic updates
queryClient.setQueryData(['activity', id], newData);
```

---

## Error Handling

```
Error occurs
  ↓
Catch in error boundary
  ↓
Log to monitoring service
  ↓
Display user-friendly message
  ↓
Offer retry action
  ↓
Fall back to safe state
```

---

## Security Data Flow

```
Request with auth token
  ↓
Base44 validates JWT
  ↓
Extract user ID and role
  ↓
Check permissions (RBAC)
  ↓
Query data with user context
  ↓
Filter by permissions
  ↓
Return authorized data only
```

---

## Related Documentation

- [ARCHITECTURE.md](./components/docs/ARCHITECTURE.md)
- [STATE-MACHINE.md](./STATE-MACHINE.md)
- [CACHING.md](./CACHING.md)

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
