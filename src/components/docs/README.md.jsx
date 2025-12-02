# Team Engage - Employee Engagement Platform

## Architecture Overview

This codebase follows a modular architecture with clear separation of concerns, optimized for maintainability, performance, and scalability.

### Directory Structure

```
├── components/
│   ├── activities/       # Activity-related components and hooks
│   ├── ai/               # AI-powered features (generators, planners)
│   ├── analytics/        # Analytics dashboards and charts
│   ├── channels/         # Team communication channels
│   ├── common/           # Shared UI components (LoadingSpinner, EmptyState, etc.)
│   ├── dashboard/        # Dashboard-specific components
│   ├── docs/             # Documentation files
│   ├── events/           # Event scheduling and management
│   ├── facilitator/      # Facilitator tools and assistants
│   ├── gamification/     # Points, badges, leaderboards
│   ├── hooks/            # Shared React hooks (barrel export in index.js)
│   ├── integrations/     # External service integrations
│   ├── leaderboard/      # Leaderboard components
│   ├── lib/              # Core utilities and configuration
│   │   ├── api.js        # Entity operations, backend functions
│   │   ├── config.js     # App settings, feature flags
│   │   ├── constants.js  # Enums, static data
│   │   ├── queryKeys.js  # React Query key factory
│   │   ├── cacheConfig.js# Cache timing configuration
│   │   └── utils.js      # General utility functions
│   ├── moderation/       # Content moderation
│   ├── notifications/    # Notification system
│   ├── participant/      # Participant-specific features
│   ├── profile/          # User profile components
│   ├── pwa/              # Progressive Web App features
│   ├── recognition/      # Peer recognition system
│   ├── settings/         # Settings panels
│   ├── skills/           # Skill tracking and development
│   ├── store/            # Point store and avatar customization
│   ├── teams/            # Team management
│   ├── templates/        # Event and activity templates
│   └── utils/            # Domain-specific utility functions
│       ├── eventUtils.js # Event filtering, stats calculation
│       ├── formatters.js # Date, number formatting
│       └── validators.js # Input validation
├── entities/             # JSON schemas for data models
├── functions/            # Backend serverless functions
├── pages/                # Page components (flat structure)
└── agents/               # AI agent configurations
```

---

## Core Architecture Patterns

### 1. Centralized Query Key Management

All React Query keys are defined in `components/lib/queryKeys.js`:

```javascript
import { queryKeys } from '../lib/queryKeys';

// Usage in hooks
useQuery({
  queryKey: queryKeys.events.list({ limit: 100 }),
  queryFn: () => fetchEvents()
});

// Invalidation
queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
```

### 2. Cache Configuration

Cache timing is centralized in `components/lib/cacheConfig.js`:

```javascript
import { cachePresets } from '../lib/cacheConfig';

useQuery({
  queryKey: queryKeys.activities.all,
  queryFn: fetchActivities,
  ...cachePresets.activities  // staleTime, gcTime configured
});
```

### 3. Custom Hooks (components/hooks/)

All hooks are exported from `components/hooks/index.js`:

```javascript
// Import multiple hooks
import { useUserData, useEventData, useEventScheduling } from '../components/hooks';
```

| Hook | Purpose |
|------|---------|
| `useUserData` | Authentication, user state, role checking |
| `useEventData` | Events, activities, participations |
| `useUserProfile` | User profile, points, avatar |
| `useEventScheduling` | Event creation with recurrence |
| `useFormState` | Generic form state management |
| `usePermissions` | Role-based permission checking |

### 4. API Layer (components/lib/api.js)

Centralized entity operations and backend function calls:

```javascript
import { 
  fetchEntityList, 
  createEntity, 
  backendFunctions,
  integrations 
} from '../lib/api';

// Entity operations
const events = await fetchEntityList('Event', { limit: 50 });

// Backend functions
await backendFunctions.awardPoints(userEmail, { amount: 10 });

// Integrations
const { url } = await integrations.uploadFile(file);
```

### 5. Component Composition

Large pages are decomposed into focused components:

```
pages/Calendar.js
├── components/events/CalendarHeader.jsx
├── components/events/EventsList.jsx
├── components/events/ScheduleEventDialog.jsx
├── components/events/CreatePollDialog.jsx
└── components/events/EventCalendarCard.jsx
```

### 6. Protected Routes

Role-based access control:

```jsx
import { ProtectedRoute } from '../components/common/ProtectedRoute';

<ProtectedRoute requireAdmin>
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requireFacilitator>
  <FacilitatorTools />
</ProtectedRoute>
```

---

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Pages     │────▶│    Hooks     │────▶│  API Layer  │
│  (UI/UX)    │     │ (Data Logic) │     │  (Base44)   │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Components  │     │ Query Keys   │     │  Entities   │
│  (Reusable) │     │ Cache Config │     │  Functions  │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## Entity Schema Design

Entities are defined as JSON schemas in `/entities/`:

- **Built-in fields**: `id`, `created_date`, `updated_date`, `created_by`
- **User entity**: Special security rules (admin-only for list/update)
- **References**: Use IDs (e.g., `event.activity_id`)

Key entities:
- `Event`, `Activity`, `Participation` - Core scheduling
- `UserPoints`, `Badge`, `BadgeAward` - Gamification
- `Team`, `Channel`, `Recognition` - Social features
- `UserProfile`, `UserAvatar` - User customization

---

## Backend Functions

Serverless functions in `/functions/`:

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Business logic here
  return Response.json({ success: true });
});
```

---

## Styling System

- **Framework**: Tailwind CSS
- **Variables**: Defined in `globals.css`
- **Brand Colors**: `int-navy`, `int-orange`, `int-gold`, `int-teal`
- **Glass Effects**: `glass-panel`, `glass-card`, `glass-button`
- **Animations**: `animate-fade-in`, `animate-slide-up`, `hover-lift`

---

## Best Practices

### Code Organization
1. **Small Components**: Keep components < 50 lines when possible
2. **Extract Hooks**: Complex logic goes into custom hooks
3. **Barrel Exports**: Use index.js for clean imports
4. **Consistent Naming**: PascalCase for components, camelCase for hooks

### Performance
5. **Query Keys**: Use centralized queryKeys for consistent caching
6. **Cache Presets**: Apply appropriate cache timing per data type
7. **Lazy Loading**: Use dynamic imports for large components

### Quality
8. **Error Handling**: Let errors bubble up (no silent catches)
9. **Loading States**: Always show loading indicators
10. **Mobile First**: Design for mobile, enhance for desktop
11. **Accessibility**: WCAG 2.1 AA compliance minimum