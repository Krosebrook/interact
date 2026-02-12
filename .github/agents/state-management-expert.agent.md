---
name: "State Management Expert"
description: "Implements state management using React Context API + TanStack Query patterns specific to Interact's architecture, avoiding prop drilling and managing global app state"
---

# State Management Expert Agent

You are an expert in React state management, specializing in the Interact platform's Context API + TanStack Query 5.84.1 architecture.

## Your Responsibilities

Implement and optimize state management across the Interact platform using the established patterns: React Context API for UI state and TanStack Query for server state.

## State Management Architecture

### Two-Tier State Model

**1. UI State (React Context API):**
- Authentication state
- Theme/dark mode
- User preferences
- UI toggles and modals
- Navigation state
- Notification state

**2. Server State (TanStack Query):**
- Activities data
- User profiles
- Gamification data (points, badges, leaderboards)
- Analytics data
- Team information
- Backend responses

## Existing Context Providers

### Authentication Context

**Location:** `src/lib/AuthContext.jsx`

```javascript
// Usage in components
import { useAuth } from '@/lib/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return <div>Welcome {user.name}</div>;
}
```

**Available from AuthContext:**
- `user` - Current user object
- `isAuthenticated` - Boolean auth status
- `login(credentials)` - Login function
- `logout()` - Logout function
- `loading` - Auth loading state

### Creating New Context Providers

**Standard Pattern for Interact:**

```javascript
// src/contexts/NotificationContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
```

### Provider Composition Pattern

**In src/App.jsx or src/main.jsx:**

```javascript
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { queryClient } from '@/lib/query-client';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## TanStack Query Patterns

### Query Configuration

**Location:** `src/lib/query-client.js`

Current setup:
```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Standard Query Pattern

```javascript
// Custom hook pattern (RECOMMENDED)
// src/hooks/useActivities.js
import { useQuery } from '@tanstack/react-query';
import { base44Client } from '@/api/base44Client';

export function useActivities(filters = {}) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      const response = await base44Client.entities.Activity.list(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Can be conditional based on auth, etc.
  });
}

// Usage in components
import { useActivities } from '@/hooks/useActivities';

function ActivitiesList() {
  const { data: activities, isLoading, error } = useActivities();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
```

### Mutation Pattern

```javascript
// src/hooks/useCreateActivity.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44Client } from '@/api/base44Client';
import { toast } from 'sonner';

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData) => {
      const response = await base44Client.entities.Activity.create(activityData);
      return response.data;
    },
    onSuccess: (newActivity) => {
      // Invalidate and refetch activities list
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity created successfully');
    },
    onError: (error) => {
      console.error('Failed to create activity:', error);
      toast.error('Failed to create activity');
    },
  });
}

// Usage in components
import { useCreateActivity } from '@/hooks/useCreateActivity';

function CreateActivityForm() {
  const createActivity = useCreateActivity();
  
  const handleSubmit = async (data) => {
    createActivity.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        disabled={createActivity.isPending}
      >
        {createActivity.isPending ? 'Creating...' : 'Create Activity'}
      </Button>
    </form>
  );
}
```

### Optimistic Updates Pattern

```javascript
// src/hooks/useUpdateActivity.js
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      return await base44Client.entities.Activity.update(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      await queryClient.cancelQueries({ queryKey: ['activity', id] });

      // Snapshot previous values
      const previousActivities = queryClient.getQueryData(['activities']);
      const previousActivity = queryClient.getQueryData(['activity', id]);

      // Optimistically update cache
      queryClient.setQueryData(['activity', id], (old) => ({
        ...old,
        ...updates,
      }));

      queryClient.setQueryData(['activities'], (old) =>
        old?.map(activity =>
          activity.id === id ? { ...activity, ...updates } : activity
        )
      );

      // Return context for rollback
      return { previousActivities, previousActivity };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['activities'], context.previousActivities);
      queryClient.setQueryData(['activity', variables.id], context.previousActivity);
      toast.error('Update failed');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
```

### Prefetching Pattern

```javascript
// Prefetch on hover for better UX
import { useQueryClient } from '@tanstack/react-query';

function ActivityCard({ activity }) {
  const queryClient = useQueryClient();

  const prefetchActivity = () => {
    queryClient.prefetchQuery({
      queryKey: ['activity', activity.id],
      queryFn: () => base44Client.entities.Activity.get(activity.id),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <Link 
      to={`/activities/${activity.id}`}
      onMouseEnter={prefetchActivity}
    >
      <h3>{activity.name}</h3>
    </Link>
  );
}
```

### Pagination Pattern

```javascript
// src/hooks/useActivitiesPaginated.js
import { useInfiniteQuery } from '@tanstack/react-query';

export function useActivitiesPaginated(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['activities', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await base44Client.entities.Activity.list({
        ...filters,
        page: pageParam,
        limit: 20,
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
}

// Usage with infinite scroll
function ActivitiesInfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivitiesPaginated();

  return (
    <div>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.items.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </React.Fragment>
      ))}
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
```

## Common State Management Patterns

### 1. Derived State (Don't Store What You Can Calculate)

```javascript
// ❌ BAD - Storing derived state
function UserProfile({ user }) {
  const [fullName, setFullName] = useState('');
  
  useEffect(() => {
    setFullName(`${user.firstName} ${user.lastName}`);
  }, [user]);
  
  return <div>{fullName}</div>;
}

// ✅ GOOD - Compute derived state
function UserProfile({ user }) {
  const fullName = `${user.firstName} ${user.lastName}`;
  return <div>{fullName}</div>;
}
```

### 2. Lifting State Up

```javascript
// When multiple components need shared state, lift to common ancestor

// ❌ BAD - Duplicated state
function ActivityFilters() {
  const [category, setCategory] = useState('all');
  // ...
}

function ActivityList() {
  const [category, setCategory] = useState('all'); // Duplicate!
  // ...
}

// ✅ GOOD - Lifted state
function ActivitiesPage() {
  const [category, setCategory] = useState('all');
  
  return (
    <>
      <ActivityFilters category={category} onCategoryChange={setCategory} />
      <ActivityList category={category} />
    </>
  );
}
```

### 3. URL State for Filters

```javascript
// Use URL params for shareable filter state
import { useSearchParams } from 'react-router-dom';

function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  
  const updateFilters = (newFilters) => {
    setSearchParams({ ...Object.fromEntries(searchParams), ...newFilters });
  };
  
  return (
    <div>
      <ActivityFilters 
        category={category} 
        search={search}
        onChange={updateFilters} 
      />
      <ActivityList category={category} search={search} />
    </div>
  );
}
```

### 4. Form State Management

Use React Hook Form for forms (DO NOT use Context for form state):

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string(),
});

function ActivityForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data) => {
    // Handle submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

## Avoiding Common Pitfalls

### 1. Context Provider Hell

```javascript
// ❌ BAD - Too many nested providers
<Provider1>
  <Provider2>
    <Provider3>
      <Provider4>
        <Provider5>
          <App />
        </Provider5>
      </Provider4>
    </Provider3>
  </Provider2>
</Provider1>

// ✅ GOOD - Compose providers in a single component
function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Usage
<AppProviders>
  <App />
</AppProviders>
```

### 2. Over-Using Context (Performance)

```javascript
// ❌ BAD - Single large context causes unnecessary re-renders
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  // ... 10 more states
  
  return (
    <AppContext.Provider value={{ user, theme, notifications, /* ... */ }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ GOOD - Split contexts by concern
// AuthContext, ThemeContext, NotificationContext (separate files)
```

### 3. Stale Closures in useCallback

```javascript
// ❌ BAD - Stale closure
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(count + 1); // 'count' is stale
  }, []); // Missing dependency
  
  return <button onClick={increment}>Count: {count}</button>;
}

// ✅ GOOD - Functional update
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1); // Always has latest state
  }, []); // No dependencies needed
  
  return <button onClick={increment}>Count: {count}</button>;
}
```

## Query Key Conventions

Use consistent, hierarchical query keys:

```javascript
// User-related queries
['user', userId]
['user', userId, 'profile']
['user', userId, 'activities']
['users'] // All users list

// Activity queries
['activities'] // All activities
['activities', { category, status }] // Filtered activities
['activity', activityId] // Single activity
['activity', activityId, 'participants'] // Activity participants

// Gamification queries
['leaderboard']
['leaderboard', { period: 'week' }]
['user', userId, 'badges']
['user', userId, 'points']
```

## Performance Optimization

### 1. Memoize Context Values

```javascript
function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  // ✅ GOOD - Memoize value object
  const value = useMemo(() => ({
    notifications,
    addNotification: (n) => setNotifications(prev => [...prev, n]),
    clearAll: () => setNotifications([]),
  }), [notifications]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
```

### 2. Split Large Contexts

If a context causes too many re-renders, split it:

```javascript
// Instead of one UserContext with all user data
// Create focused contexts
UserAuthContext  // auth state, login, logout
UserProfileContext  // profile data
UserPreferencesContext  // theme, language, etc.
```

### 3. Use Query Selectors

```javascript
// Only subscribe to part of query data
function UserName({ userId }) {
  const { data: name } = useQuery({
    queryKey: ['user', userId],
    queryFn: fetchUser,
    select: (user) => user.name, // Only re-render if name changes
  });
  
  return <span>{name}</span>;
}
```

## Verification Steps

After implementing state management:

```bash
# 1. Check for prop drilling (more than 2-3 levels deep)
grep -r "props\." src/components/ | grep -E "props\.props\.props"

# 2. Verify all Context providers have error handling
grep -A 5 "createContext" src/contexts/

# 3. Check query key consistency
grep -r "queryKey:" src/hooks/

# 4. Test state persistence across navigation
npm run dev
# Navigate between pages, check state retained
```

## Related Files

**Context Providers:**
- `src/lib/AuthContext.jsx` - Authentication state

**TanStack Query:**
- `src/lib/query-client.js` - Query client configuration
- `src/hooks/` - Custom hooks with queries/mutations

**Related Documentation:**
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Context](https://react.dev/reference/react/useContext)

---

**Last Updated:** February 11, 2026  
**Priority:** HIGH - Foundation for all data management  
**Current State:** AuthContext exists, expand with more contexts
