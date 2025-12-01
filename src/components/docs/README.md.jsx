# Team Engage - Employee Engagement Platform

## Overview

Team Engage is an AI-powered employee engagement platform designed for remote-first tech companies. It enables peer-to-peer recognition, pulse surveys, team activities, and gamification to boost employee engagement.

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, shadcn/ui
- **State Management:** TanStack React Query
- **Backend:** Base44 Platform (Entities, Auth, Functions)
- **AI Integration:** OpenAI, Claude, Gemini
- **Payments:** Stripe

## Project Structure

```
├── pages/                    # Page components (flat structure)
│   ├── Dashboard.js          # Admin dashboard
│   ├── FacilitatorDashboard.js
│   ├── ParticipantPortal.js
│   ├── Analytics.js
│   ├── Settings.js
│   └── ...
│
├── components/
│   ├── common/               # Shared UI components
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useUserData.jsx
│   │   ├── useEventData.jsx
│   │   └── ...
│   │
│   ├── lib/                  # Core utilities
│   │   ├── api.js            # Centralized API layer
│   │   ├── constants.js      # App constants
│   │   └── config.js         # Configuration
│   │
│   ├── analytics/            # Analytics feature
│   ├── events/               # Event management
│   ├── gamification/         # Points, badges, leaderboards
│   ├── recognition/          # Peer recognition
│   ├── teams/                # Team management
│   └── ...
│
├── entities/                 # Base44 entity schemas (JSON)
├── functions/                # Backend functions (Deno)
├── agents/                   # AI agent configurations
└── Layout.js                 # App layout wrapper
```

## Key Patterns

### 1. Protected Routes

All pages use `ProtectedRoute` wrapper for declarative access control:

```jsx
import ProtectedRoute from '../components/common/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}
```

### 2. User Data Hook

Use `useUserData` hook for authentication and role-based access:

```jsx
const { user, loading, isAdmin, isFacilitator, isParticipant } = useUserData(
  true,   // requireAuth
  false,  // requireAdmin
  true,   // requireFacilitator
  false   // requireParticipant
);
```

### 3. Centralized API Layer

Use `components/lib/api.js` for all entity operations:

```jsx
import { api } from '../lib/api';

// Fetch events
const events = await api.events.list();

// Create with validation
await api.events.create(eventData);
```

### 4. React Query for Data Fetching

All data fetching uses TanStack Query:

```jsx
const { data: events, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: () => base44.entities.Event.list(),
  staleTime: 30000
});
```

### 5. Component Decomposition

Pages are decomposed into focused components:
- Keep components under 150 lines
- Extract hooks for complex logic
- Use barrel exports for clean imports

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Full access to all features, settings, analytics |
| **Facilitator** | Event management, limited analytics |
| **Participant** | Events, recognition, gamification |

## Environment Variables

Required secrets (set in Base44 dashboard):
- `OPENAI_API_KEY` - AI features
- `STRIPE_SECRET_KEY` - Payments
- `STRIPE_SIGNING_SECRET` - Webhooks

## Development Guidelines

1. **File Size:** Keep files under 150 lines
2. **Naming:** Use PascalCase for components, camelCase for hooks
3. **Imports:** Use absolute imports with `@/` prefix
4. **Icons:** Only use icons from `lucide-react`
5. **Styling:** Tailwind CSS with custom CSS variables

## Testing Checklist

- [ ] Role-based access control works correctly
- [ ] Loading states display properly
- [ ] Error boundaries catch exceptions
- [ ] Forms validate input
- [ ] Mobile responsive design works

## Version History

- **v3.0.0** - Role-based refactoring, ProtectedRoute, API layer
- **v2.0.0** - Gamification, recognition features
- **v1.0.0** - Initial release