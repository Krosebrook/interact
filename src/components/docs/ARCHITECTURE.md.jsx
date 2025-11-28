# Architecture Documentation

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Pages     │  │  Components  │  │    Layout    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴─────────────────┘                   │
│                      ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Query                            │  │
│  │           (State Management & Caching)                    │  │
│  └─────────────────────────┬────────────────────────────────┘  │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Base44 Client SDK                        │  │
│  │     (Entities, Functions, Integrations, Auth)             │  │
│  └─────────────────────────┬────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BASE44 PLATFORM                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Entities   │  │  Functions   │  │    Agents    │          │
│  │  (Database)  │  │   (Deno)     │  │     (AI)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Integrations │  │     Auth     │  │   Storage    │          │
│  │  (Core APIs) │  │    (SSO)     │  │   (Files)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Slack   │  │  Teams   │  │  Stripe  │  │  OpenAI  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Google   │  │  Claude  │  │ Perplexity│                     │
│  │ Calendar │  │          │  │          │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow

### 2.1 User Authentication Flow
```
User → Login Page → SSO Provider → Base44 Auth → User Session → App
```

### 2.2 Entity CRUD Flow
```
Component → React Query → Base44 SDK → Entity API → Database → Response
    │                         │
    └── Optimistic Update ────┘
```

### 2.3 Backend Function Flow
```
Frontend → base44.functions.invoke() → Deno Function → External API
                                            │
                                            └── Base44 SDK (Service Role)
```

### 2.4 Real-time Agent Flow
```
User Message → Agent SDK → WebSocket → AI Processing → Streaming Response
      │                                      │
      └── Tool Calls → Entity Operations ───┘
```

---

## 3. Component Architecture

### 3.1 Page Structure
```
Page Component
├── useUserData() / useAuth()      # Authentication
├── useEventData() / useQuery()    # Data fetching
├── useMutation()                  # Data mutations
├── State Management               # Local UI state
└── Render
    ├── Header/PageHeader
    ├── Content
    │   ├── Feature Components
    │   └── Common Components
    └── Dialogs/Modals
```

### 3.2 Hook Hierarchy
```
useAuth (lightweight)
    │
    └── useUserData (full profile)
           │
           ├── UserPoints query
           └── UserProfile query

useEventData (events, activities, participations)
    │
    ├── Events query
    ├── Activities query
    └── Participations query

useTeamData (team-specific)
useGamificationData (points, badges, challenges)
usePermissions (RBAC checks)
```

### 3.3 Component Categories
```
components/
├── common/           # Shared UI primitives
│   ├── LoadingSpinner
│   ├── EmptyState
│   ├── StatsGrid
│   ├── PageHeader
│   └── ErrorBoundary
│
├── hooks/            # Custom React hooks
│   ├── useAuth
│   ├── useUserData
│   ├── useEventData
│   └── usePermissions
│
├── utils/            # Pure functions & constants
│   ├── constants.js
│   ├── formatters.js
│   ├── eventUtils.js
│   └── soundEffects.js
│
├── gamification/     # Points, badges, leaderboards
├── events/           # Event management
├── teams/            # Team features
├── ai/               # AI-powered components
├── analytics/        # Charts & dashboards
├── facilitator/      # Facilitator tools
├── participant/      # Participant views
├── profile/          # User profiles
├── settings/         # Configuration
├── notifications/    # Notification UI
├── templates/        # Template data
└── docs/             # Documentation
```

---

## 4. State Management

### 4.1 Server State (React Query)
```javascript
// Query keys convention
['events']                    // All events
['events', eventId]           // Single event
['events', { status: 'active' }] // Filtered events
['user-points', userEmail]    // User points
['team', teamId]              // Team data
```

### 4.2 Query Configuration
```javascript
// Default stale times
const CACHE_TIMES = {
  short: 30 * 1000,      // 30 seconds (real-time data)
  medium: 5 * 60 * 1000, // 5 minutes (semi-static)
  long: 30 * 60 * 1000,  // 30 minutes (static data)
};

// Usage pattern
const { data, isLoading, refetch } = useQuery({
  queryKey: ['events'],
  queryFn: () => base44.entities.Event.list(),
  staleTime: CACHE_TIMES.medium,
  refetchInterval: 30000, // Optional polling
});
```

### 4.3 Mutation Pattern
```javascript
const mutation = useMutation({
  mutationFn: (data) => base44.entities.Event.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['events']);
    toast.success('Event created!');
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

---

## 5. Backend Functions

### 5.1 Function Structure
```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // 1. Initialize client
    const base44 = createClientFromRequest(req);
    
    // 2. Authenticate (if needed)
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 3. Parse request
    const body = await req.json();
    
    // 4. Business logic
    const result = await processRequest(base44, body);
    
    // 5. Return response
    return Response.json(result);
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### 5.2 Service Role Operations
```javascript
// User-scoped (respects permissions)
const myEvents = await base44.entities.Event.list();

// Service role (admin privileges)
const allEvents = await base44.asServiceRole.entities.Event.list();
```

---

## 6. Agent Architecture

### 6.1 Agent Configuration
```json
{
  "description": "Agent purpose",
  "instructions": "Detailed behavior instructions",
  "tool_configs": [
    {
      "entity_name": "Event",
      "allowed_operations": ["create", "read", "update", "delete"]
    }
  ],
  "whatsapp_greeting": "Welcome message for WhatsApp"
}
```

### 6.2 Agent Conversation Flow
```
User Input → Agent Processing → Tool Calls → Entity Operations
     │              │                              │
     │              └── LLM Reasoning ─────────────┘
     │                       │
     └── Streaming Response ◄┘
```

---

## 7. Security Architecture

### 7.1 Authentication
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User       │────▶│  SSO/OAuth   │────▶│   Base44     │
│   Login      │     │   Provider   │     │   Session    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 7.2 Authorization (RBAC)
```javascript
// Role hierarchy
const ROLE_LEVELS = {
  super_admin: 100,
  admin: 80,
  organizer: 60,
  team_lead: 50,
  facilitator: 40,
  participant: 10
};

// Permission check
const canManageEvents = user.role === 'admin' || user.role === 'organizer';
```

### 7.3 Data Access Rules
| Data Type | Admin | Organizer | Team Lead | Participant |
|-----------|-------|-----------|-----------|-------------|
| All Events | ✅ | ✅ | Team Only | Invited Only |
| User PII | ✅ | ❌ | ❌ | Own Only |
| Analytics | ✅ | ✅ | Team Only | ❌ |
| Survey Results | ✅ | ✅ | Team Only | ❌ |

---

## 8. Performance Optimization

### 8.1 Query Optimization
- Use `staleTime` to reduce unnecessary refetches
- Implement pagination for large lists
- Use `select` to transform/filter data client-side

### 8.2 Bundle Optimization
- Lazy load pages with React.lazy()
- Code-split large components
- Use dynamic imports for heavy libraries

### 8.3 Rendering Optimization
- Use React.memo for expensive components
- Implement virtualization for long lists
- Debounce search/filter inputs

---

## 9. Error Handling

### 9.1 Client-Side
```javascript
// Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  onError: (error) => toast.error(error.message),
  retry: 3,
});

// Global error boundary
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### 9.2 Server-Side
```javascript
try {
  // Operation
} catch (error) {
  console.error('Function error:', error);
  return Response.json(
    { error: error.message, code: 'OPERATION_FAILED' },
    { status: 500 }
  );
}
```

---

## 10. Deployment

### 10.1 Environment
- Frontend: Base44 hosted (CDN)
- Backend Functions: Deno Deploy
- Database: Base44 managed
- Storage: Base44 managed

### 10.2 Secrets Management
- Set via Base44 Dashboard
- Environment-specific values
- Encrypted at rest

### 10.3 Monitoring
- Function logs in Dashboard
- Entity operation logs
- Integration call logs