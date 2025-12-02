# Team Engage - Employee Engagement Platform

## Architecture Overview

This codebase follows a modular architecture with clear separation of concerns:

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
│   ├── hooks/            # Shared React hooks
│   ├── integrations/     # External service integrations
│   ├── leaderboard/      # Leaderboard components
│   ├── lib/              # Core utilities and configuration
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
│   └── utils/            # Utility functions
├── entities/             # JSON schemas for data models
├── functions/            # Backend serverless functions
├── pages/                # Page components (flat structure)
└── agents/               # AI agent configurations
```

### Key Patterns

#### 1. Centralized Configuration
All app configuration lives in `components/lib/`:
- `config.js` - App settings, feature flags, API config
- `constants.js` - Enums, static data, color mappings
- `utils.js` - General utility functions
- `api.js` - API layer with query keys and cache config

#### 2. Custom Hooks
Hooks are organized by feature in `components/hooks/`:
- `useUserData` - Authentication and user state
- `useEventData` - Event fetching and caching
- `useEventScheduling` - Event creation logic
- `useFormState` - Generic form state management
- See `components/hooks/index.js` for full exports

#### 3. Component Composition
Large pages are decomposed into smaller components:
- Headers (e.g., `CalendarHeader`, `ActivitiesHeader`)
- Dialogs (e.g., `ScheduleEventDialog`, `CreatePollDialog`)
- Lists (e.g., `EventsList`)
- Filters (e.g., `ActivitiesFilters`)

#### 4. Protected Routes
Use `ProtectedRoute` wrapper for role-based access:
```jsx
<ProtectedRoute requireAdmin>
  <AdminContent />
</ProtectedRoute>
```

#### 5. Data Loading Pattern
Use `DataLoader` component for consistent loading/error/empty states:
```jsx
<DataLoader 
  isLoading={isLoading} 
  data={items}
  emptyTitle="No items found"
>
  {(data) => <ItemList items={data} />}
</DataLoader>
```

### Entity Schema Design

Entities are defined as JSON schemas in `/entities/`:
- Built-in fields: `id`, `created_date`, `updated_date`, `created_by`
- User entity has special security rules (admin-only for list/update)
- Reference other entities by ID (e.g., `event.activity_id`)

### Backend Functions

Serverless functions in `/functions/`:
- Must use `Deno.serve()` pattern
- Use `createClientFromRequest` for Base44 SDK
- Validate user auth before operations
- External dependencies use `npm:` prefix

### Styling

- Tailwind CSS for all styling
- CSS variables defined in `globals.css`
- Brand colors: `int-navy`, `int-orange`, `int-gold`, `int-teal`
- Glassmorphism classes: `glass-panel`, `glass-card`
- Animation classes: `animate-fade-in`, `hover-lift`

### State Management

- React Query for server state (`@tanstack/react-query`)
- Local state with `useState` for UI state
- Custom hooks for complex state logic
- No global state store (prefer composition)

### Best Practices

1. **Small Components**: Keep components < 50 lines when possible
2. **Extract Hooks**: Complex logic goes into custom hooks
3. **Barrel Exports**: Use index.js for clean imports
4. **Consistent Naming**: PascalCase for components, camelCase for hooks
5. **Error Handling**: Let errors bubble up (no silent catches)
6. **Loading States**: Always show loading indicators
7. **Mobile First**: Design for mobile, enhance for desktop