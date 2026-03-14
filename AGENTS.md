# Custom Coding Agents — Interact Platform

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** March 14, 2026  
**Total Agents:** 21  
**Status:** Active Reference Document

---

## Overview

This document consolidates all 21 specialized coding agents for the Interact platform into a single reference. Each agent contains deep knowledge of Interact's architecture, patterns, and conventions. Use this document as a comprehensive guide when implementing features, fixing bugs, or working on any area of the codebase.

**Tech Stack Reference:**
- **Frontend:** React 18.2.0 · Vite 6.1.0 · TailwindCSS 3.4.17 · Radix UI
- **State:** React Context API · TanStack Query 5.84.1
- **Forms:** React Hook Form 7.54.2 · Zod 3.24.2
- **Backend:** Base44 SDK 0.8.3 (serverless TypeScript functions in `functions/`)
- **Testing:** Vitest 4.0.17 · React Testing Library
- **AI:** OpenAI GPT-4 · Anthropic Claude 3 · Google Gemini Pro

---

## Table of Contents

### 🎨 Frontend Development
1. [React Component Builder](#1-react-component-builder)
2. [React Hooks Fixer](#2-react-hooks-fixer)
3. [Form & Validation Expert](#3-form--validation-expert)
4. [TanStack Query Expert](#4-tanstack-query-expert)

### 🔧 Backend Development
5. [Base44 Function Builder](#5-base44-function-builder)
6. [AI Integration Specialist](#6-ai-integration-specialist)

### 🎮 Domain-Specific
7. [Gamification System Expert](#7-gamification-system-expert)

### 🧪 Quality Assurance
8. [Unit Test Writer](#8-unit-test-writer)
9. [Code Quality & Linter](#9-code-quality--linter)
10. [Security Auditor](#10-security-auditor)

### 📚 Documentation & DevOps
11. [Documentation Writer](#11-documentation-writer)
12. [CI/CD Pipeline Manager](#12-cicd-pipeline-manager)

### 🚀 Performance & Optimization
13. [Performance Optimizer](#13-performance-optimizer)
14. [State Management Expert](#14-state-management-expert)

### 🔗 Integration & APIs
15. [API Integration Specialist](#15-api-integration-specialist)

### 🧭 Navigation & Routing
16. [Route & Navigation Manager](#16-route--navigation-manager)

### 🛡️ Error Handling & Logging
17. [Error Handling & Logging Expert](#17-error-handling--logging-expert)

### ♿ Accessibility
18. [Accessibility Auditor](#18-accessibility-auditor)

### 📊 Analytics & Visualization
19. [Analytics Implementation Specialist](#19-analytics-implementation-specialist)
20. [Data Visualization Expert](#20-data-visualization-expert)

### 📱 Mobile & PWA
21. [PWA Implementation Specialist](#21-pwa-implementation-specialist)

---

## Agent Selection Guide

### By Task Type

| Task | Recommended Agent(s) |
|------|---------------------|
| Build new UI component | React Component Builder |
| Fix hooks violations | React Hooks Fixer |
| Create forms with validation | Form & Validation Expert |
| Fetch / cache API data | TanStack Query Expert |
| Create backend function | Base44 Function Builder |
| Add AI features | AI Integration Specialist |
| Add gamification | Gamification System Expert |
| Write tests | Unit Test Writer |
| Fix linting errors | Code Quality & Linter |
| Security review | Security Auditor |
| Write documentation | Documentation Writer |
| Fix CI/CD failures | CI/CD Pipeline Manager |
| Reduce bundle size | Performance Optimizer |
| Manage global state | State Management Expert |
| Add 3rd-party integration | API Integration Specialist |
| Add/manage routes | Route & Navigation Manager |
| Improve error handling | Error Handling & Logging Expert |
| Fix accessibility | Accessibility Auditor |
| Add analytics tracking | Analytics Implementation Specialist |
| Create charts/dashboards | Data Visualization Expert |
| Implement PWA features | PWA Implementation Specialist |

### By Experience Level

**Junior Developers:** React Component Builder · Unit Test Writer · Form & Validation Expert  
**Mid-Level Developers:** Base44 Function Builder · TanStack Query Expert · Gamification System Expert  
**Senior Developers:** AI Integration Specialist · Security Auditor · CI/CD Pipeline Manager

---

---

## 1. React Component Builder

> **Purpose:** Creates new React components following Interact's exact patterns: Radix UI primitives, TailwindCSS styling, React Hook Form validation, and functional component structure.

### Component Architecture Patterns

Components must be placed in the appropriate directory under `src/components/`:

- **UI Primitives**: `src/components/ui/` — Radix UI-based reusable components
- **Feature Components**:
  - `src/components/activities/` — Activity-related components
  - `src/components/gamification/` — Gamification UI (badges, leaderboards, points)
  - `src/components/auth/` — Authentication components
  - `src/components/dashboard/` — Dashboard widgets
  - `src/components/events/` — Event management components
  - `src/components/analytics/` — Analytics and charts
  - `src/components/common/` — Shared utility components

**Naming:** Files & components use PascalCase (`ActivityCard.jsx`). Event handlers prefix with `handle` (`handleSubmit`).

### Component Template

```javascript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ComponentName({ prop1, prop2, className }) {
  const [localState, setLocalState] = useState(null);
  
  useEffect(() => {
    // Side effects here
  }, [dependencies]);
  
  const handleAction = async () => {
    try {
      toast.success('Action completed');
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Something went wrong');
    }
  };
  
  return (
    <Card className={cn('p-4', className)}>
      {/* Component JSX */}
    </Card>
  );
}
```

### Styling Rules

- **ALWAYS** use TailwindCSS utility classes; **NEVER** inline styles or CSS files
- Use `cn()` from `@/lib/utils` for conditional classes
- Mobile-first responsive design (`md:`, `lg:` breakpoints)
- Import Radix UI components from `src/components/ui/`

### Data Fetching with TanStack Query

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DataComponent() {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => await base44.entities.Activity.list(),
    staleTime: 5 * 60 * 1000,
  });
  
  const createMutation = useMutation({
    mutationFn: async (newData) => await base44.entities.Activity.create(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity created');
    },
    onError: (error) => {
      console.error('Creation failed:', error);
      toast.error('Failed to create activity');
    }
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* Render data */}</div>;
}
```

### Forms — React Hook Form + Zod

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  points: z.number().int().positive(),
});

export default function MyForm({ onSubmit }) {
  const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { name: '', email: '', points: 0 } });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="Enter name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Icons, Animations & Assets

```javascript
// Icons — lucide-react
import { Check, X, ChevronRight, Star, Trophy } from 'lucide-react';

// Animations — Framer Motion
import { motion } from 'framer-motion';
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
  {content}
</motion.div>
```

### Anti-Patterns to AVOID

❌ Call hooks conditionally or in loops  
❌ Use `moment.js` — use `date-fns` instead  
❌ Use inline styles — use Tailwind classes  
❌ Skip error handling on async operations  
❌ Forget loading states  

### Final Checklist

- [ ] Functional component with hooks at top level
- [ ] Correct directory under `src/components/`
- [ ] TailwindCSS styling only (no inline styles)
- [ ] UI components from `@/components/ui/`
- [ ] Error handling with toast notifications
- [ ] TanStack Query for data fetching
- [ ] React Hook Form + Zod for forms
- [ ] Loading states included
- [ ] No React Hooks violations
- [ ] Passes `npm run lint`

---

## 2. React Hooks Fixer

> **Purpose:** Identifies and fixes React Hooks violations (Rules of Hooks), ensuring hooks are called at top level and dependency arrays are correct.

### The Rules of Hooks

1. **Only call hooks at the top level** — never inside conditions, loops, nested functions, or after early returns.
2. **Only call hooks from React functions** — functional components or custom hooks (prefixed with `use`).

### Common Violations and Fixes

**❌ Conditional hook:**
```javascript
if (isLoggedIn) { const [user, setUser] = useState(null); } // WRONG
```
**✅ Fix:** Move hook above the condition.

**❌ Hook in loop:**
```javascript
items.map(item => { const [expanded, setExpanded] = useState(false); ... }); // WRONG
```
**✅ Fix:** Extract into a separate component (e.g., `ItemCard`) with the hook at its top level.

**❌ Hook after early return:**
```javascript
if (!data) return <div>Loading...</div>;
const [value, setValue] = useState(0); // WRONG — after return
```
**✅ Fix:** Move all hook calls before any return statements.

**❌ Hook in event handler:**
```javascript
const handleClick = () => { const [count, setCount] = useState(0); }; // WRONG
```
**✅ Fix:** Declare the state at the component's top level; use the setter inside the handler.

**❌ Hook in nested function:**
```javascript
const fetchData = () => { const [data, setData] = useState(null); }; // WRONG
```
**✅ Fix:** Extract into a custom hook (name starts with `use`).

### Dependency Array Issues

```javascript
// ❌ Missing dependency
useEffect(() => { fetchUser(userId).then(setUser); }, []); // userId missing

// ✅ Correct
useEffect(() => { fetchUser(userId).then(setUser); }, [userId]);

// ✅ Stale closure fix — use functional update
useEffect(() => {
  const interval = setInterval(() => { setCount(prev => prev + 1); }, 1000);
  return () => clearInterval(interval);
}, []);
```

### Custom Hook Rules

- Must start with `use` (e.g., `useAuth`, `useActivityData`)
- Return values, not JSX

### ESLint Rule

```
"react-hooks/rules-of-hooks": "error"
```
Run `npm run lint` to detect violations.

### Final Checklist

- [ ] All hooks at top level (before any conditional or return)
- [ ] No hooks in conditions, loops, or nested functions
- [ ] All `useEffect` dependencies listed correctly
- [ ] Custom hooks start with `use`
- [ ] `npm run lint` passes with no hooks errors
- [ ] No React warnings in the browser console

---

## 3. Form & Validation Expert

> **Purpose:** Creates forms using React Hook Form + Zod validation following Interact's form patterns and UI component library.

### Basic Form Pattern

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  age: z.number().int().min(18, 'Must be 18 or older'),
});

function MyForm({ onSubmit }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', age: 18 },
  });
  
  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
      form.reset();
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Submission failed');
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="Enter your name" {...field} /></FormControl>
            <FormDescription>Your full name.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}
```

### Zod Schema Reference

```javascript
// Strings
name: z.string().min(1, 'Required').max(100)
email: z.string().email()
url: z.string().url()
phone: z.string().regex(/^\d{10}$/, 'Invalid phone')
type: z.enum(['icebreaker', 'creative', 'competitive'])
optional: z.string().optional()

// Numbers
age: z.number().int().positive()
points: z.number().min(0).max(1000)
duration: z.coerce.number().min(5).max(480)   // coerce from string

// Dates
startDate: z.date()
eventDate: z.date().refine(d => d > new Date(), 'Must be in the future')

// Arrays
tags: z.array(z.string()).min(1, 'At least one tag required')

// Cross-field validation
z.object({ password: z.string().min(8), confirmPassword: z.string() })
 .refine(d => d.password === d.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] })
```

### Special Field Types

```javascript
// Select
<Select onValueChange={field.onChange} defaultValue={field.value}>
  <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="icebreaker">Icebreaker</SelectItem>
    <SelectItem value="wellness">Wellness</SelectItem>
  </SelectContent>
</Select>

// Checkbox
<Checkbox checked={field.value} onCheckedChange={field.onChange} />

// Date Picker (with Popover + Calendar from Radix)
// See full example in .github/agents/form-validation-expert.agent.md
```

### Form State Utilities

```javascript
const { formState: { isDirty, errors, isSubmitting } } = form;
const activityType = form.watch('type');  // Watch for conditional fields
form.setValue('name', 'New Name');        // Set programmatically
await form.trigger(['name', 'email']);    // Validate specific fields
```

### Integration with TanStack Query

```javascript
const createMutation = useMutation({
  mutationFn: async (data) => base44.entities.Activity.create(data),
  onSuccess: () => { form.reset(); toast.success('Activity created!'); },
  onError: (error) => toast.error(error.message),
});

<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
  <Button type="submit" disabled={createMutation.isPending}>Create</Button>
</form>
```

### Anti-Patterns

❌ Forget to spread `{...field}` on input  
❌ Use uncontrolled `<input name="name" />`  
❌ Call submit handler without `form.handleSubmit()`  

### Final Checklist

- [ ] Zod schema defines all validation rules
- [ ] `zodResolver` passed to `useForm`
- [ ] All fields use `<FormField>` with `<FormMessage>`
- [ ] Submit button shows loading state
- [ ] Form resets on success
- [ ] Toast notifications for success/error
- [ ] Tested with valid and invalid data

---

## 4. TanStack Query Expert

> **Purpose:** Implements data fetching, caching, mutations, and state management using TanStack Query (React Query) following Interact's patterns.

**Version:** TanStack Query 5.84.1 — configured in `src/main.jsx` and `src/lib/query-client.js`.

### Query Configuration (defaults)

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Patterns

```javascript
// Basic query
const { data, isLoading, error } = useQuery({
  queryKey: ['activities'],
  queryFn: async () => await base44.entities.Activity.list(),
});

// Parameterised query
const { data } = useQuery({
  queryKey: ['activities', 'user', userId],
  queryFn: async () => await base44.entities.Activity.filter({ created_by: userId }),
  enabled: !!userId,
});

// Filtered query
const { data } = useQuery({
  queryKey: ['activities', { type, status }],
  queryFn: async () => await base44.entities.Activity.filter({ type, status }),
  staleTime: 2 * 60 * 1000,
});
```

### Query Key Conventions

```javascript
['activities']                          // All activities
['activities', { type, status }]        // Filtered
['activity', activityId]                // Single item
['user', userId]                        // Single user
['user', userId, 'points']              // Nested resource
['leaderboard']                         // Global leaderboard
['leaderboard', { period: 'week' }]     // Filtered leaderboard
```

### Mutation Patterns

```javascript
const createMutation = useMutation({
  mutationFn: async (newActivity) => base44.entities.Activity.create(newActivity),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['activities'] });
    toast.success('Activity created!');
  },
  onError: (error) => toast.error(`Failed: ${error.message}`),
});

createMutation.mutate({ name: 'Team Lunch', type: 'social' });
```

### Optimistic Update Pattern

```javascript
const updateMutation = useMutation({
  mutationFn: ({ id, updates }) => base44.entities.Activity.update(id, updates),
  onMutate: async ({ id, updates }) => {
    await queryClient.cancelQueries({ queryKey: ['activity', id] });
    const previous = queryClient.getQueryData(['activity', id]);
    queryClient.setQueryData(['activity', id], old => ({ ...old, ...updates }));
    return { previous };
  },
  onError: (err, { id }, context) => {
    queryClient.setQueryData(['activity', id], context.previous);
    toast.error('Update failed');
  },
  onSettled: (_, __, { id }) => queryClient.invalidateQueries({ queryKey: ['activity', id] }),
});
```

### Infinite / Paginated Query

```javascript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['activities', 'infinite'],
  queryFn: ({ pageParam = 1 }) => fetchActivities({ page: pageParam, limit: 20 }),
  initialPageParam: 1,
  getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
});
```

### Prefetching

```javascript
// Prefetch on hover
const prefetch = () => queryClient.prefetchQuery({
  queryKey: ['activity', activity.id],
  queryFn: () => base44.entities.Activity.get(activity.id),
});

<Link to={`/activities/${activity.id}`} onMouseEnter={prefetch}>...</Link>
```

### Query Selectors (reduce re-renders)

```javascript
const { data: name } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
  select: (user) => user.name,  // Only re-renders when name changes
});
```

### Invalidation Strategies

```javascript
queryClient.invalidateQueries({ queryKey: ['activities'] });              // All activities
queryClient.invalidateQueries({ queryKey: ['user', userId, 'points'] }); // Specific resource
```

### Final Checklist

- [ ] `queryKey` is hierarchical and includes all filter parameters
- [ ] `enabled` guard used when query depends on other data
- [ ] Mutations invalidate related queries on success
- [ ] Optimistic updates use `onMutate`/rollback pattern
- [ ] `staleTime` configured appropriately per resource type
- [ ] Loading and error states handled in UI

---

## 5. Base44 Function Builder

> **Purpose:** Creates new serverless functions in the `functions/` directory using Base44 SDK patterns, including proper auth, entity operations, and AI service integrations.

### File Location & Naming

All backend functions go in `functions/`. File names are camelCase and action-oriented:
`generateTeamReport.ts`, `awardBadgeForActivity.ts`, `syncEventToGoogleCalendar.ts`

### Base Function Template

```typescript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Function description
 * Inputs: { param1: string, param2: number }
 * Outputs: { success: boolean, data: any }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { param1, param2 } = await req.json();
    
    if (!param1) return Response.json({ error: 'Missing required parameter: param1' }, { status: 400 });
    
    // Business logic
    const result = await base44.entities.SomeEntity.create({ /* ... */ });
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
});
```

### Authentication Patterns

```typescript
// Standard user auth
const user = await base44.auth.me();
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

// Service role (admin access — bypasses user permissions)
const allUsers = await base44.asServiceRole.entities.User.list();
```

### Entity CRUD Operations

```typescript
// List / filter
const all = await base44.entities.Activity.list();
const filtered = await base44.entities.Activity.filter({ created_by: user.email, status: 'active' });
const single = await base44.entities.Activity.get('activity-id');

// Create
const created = await base44.entities.Activity.create({ name: 'Team Lunch', type: 'social', created_by: user.email });

// Update / delete
await base44.entities.Activity.update('activity-id', { status: 'completed' });
await base44.entities.Activity.delete('activity-id');
```

### Common Entity Types

`Activity` · `Event` · `Participation` · `UserPoints` · `Badge` · `UserBadge` · `Reward` · `Notification` · `Team` · `Challenge` · `LearningPath`

### AI Integration in Functions

```typescript
// OpenAI
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const r = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 1000 }),
});
const aiText = (await r.json()).choices[0].message.content;

// Claude
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
// Gemini
const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
```

### Common Patterns

```typescript
// Award points
const [record] = await base44.asServiceRole.entities.UserPoints.filter({ user_email });
const updated = await base44.asServiceRole.entities.UserPoints.update(record.id, { total_points: record.total_points + points });
await base44.asServiceRole.entities.PointsTransaction.create({ user_email, points, reason, created_at: new Date().toISOString() });

// Create notification
await base44.entities.Notification.create({ user_email, title: 'Badge Earned!', message: '...', type: 'badge_earned', is_read: false, created_at: new Date().toISOString() });
```

### Response Patterns

```typescript
// Success
return Response.json({ success: true, data: result });

// Error
return Response.json({ error: 'Error Type', message: 'Detailed message' }, { status: 400 });

// Pagination
return Response.json({ success: true, data: items, pagination: { total, page, pageSize, totalPages } });
```

### Anti-Patterns

❌ Skip authentication check  
❌ Expose sensitive data (API keys, passwords) in responses  
❌ Return 200 for errors  
❌ Trust user input without validation  

### Final Checklist

- [ ] Function in `functions/` directory with camelCase name
- [ ] Uses `npm:@base44/sdk@0.8.4`
- [ ] Authentication check at the top
- [ ] All inputs validated
- [ ] Comprehensive error handling
- [ ] Appropriate HTTP status codes
- [ ] JSDoc comment explaining purpose
- [ ] No sensitive data in responses

---

## 6. AI Integration Specialist

> **Purpose:** Implements AI features using OpenAI GPT-4, Claude, and Gemini for content generation, recommendations, and intelligent assistance.

### AI Services Available

| Service | Use Case | Model |
|---------|----------|-------|
| OpenAI GPT-4 | General AI, content generation, structured output | `gpt-4` |
| Anthropic Claude 3 | Long context, analysis, thoughtful responses | `claude-3-sonnet-20240229` / `opus` |
| Google Gemini Pro | Fast responses, multimodal | `gemini-pro` |
| Perplexity | Research, fact-checking | — |
| ElevenLabs | Text-to-speech | — |

### Environment Variables (backend only)

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
ELEVENLABS_API_KEY=...
```

Access via: `const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');`

### OpenAI Integration

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert at creating engaging team activity descriptions.' },
      { role: 'user', content: `Create a description for "${activityName}" for ${teamSize} people.` }
    ],
    temperature: 0.7,
    max_tokens: 500,
  }),
});
const description = (await response.json()).choices[0].message.content;
```

**Streaming:** Add `stream: true` to body and return `new Response(response.body, { headers: { 'Content-Type': 'text/event-stream' } })`.

**Structured Output / Function Calling:** Use `functions` + `function_call` parameters for JSON output.

### Claude Integration

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'claude-3-sonnet-20240229', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
});
const analysis = (await response.json()).content[0].text;
```

### Gemini Integration

```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
  { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
);
const text = (await response.json()).candidates[0].content.parts[0].text;
```

### Common Use Cases

1. **Activity description generation** — feed name, type, duration, team size to GPT-4
2. **Team analysis & coaching** — provide engagement stats, get structured recommendations
3. **Learning path generation** — role + skills + goals → 90-day plan
4. **Content moderation** — check user content against policy, return JSON flags
5. **Personalized recommendations** — see `functions/generatePersonalizedRecommendations.ts`

### Frontend Invocation Pattern

```javascript
const generateMutation = useMutation({
  mutationFn: async () => base44.functions.invoke('generateActivityDescription', { activityName, activityType, teamSize }),
  onSuccess: (response) => toast.success('Description generated!'),
  onError: () => toast.error('AI generation failed'),
});
```

### Best Practices

**Prompt engineering:** Be specific and structured. Provide context, constraints, output format.

**Error handling with fallback:**
```typescript
try {
  const aiResponse = await callOpenAI(prompt);
  return Response.json({ success: true, data: aiResponse });
} catch (error) {
  const fallback = generateFallback();
  return Response.json({ success: true, data: fallback, ai_unavailable: true });
}
```

**Caching AI responses:** Store in `AICache` entity with `expires_at` (24 h), check cache before calling API.

**Cost tracking:** Log `tokens_used` to `AIUsageLog` entity.

### Anti-Patterns

❌ Expose API keys in frontend code  
❌ Send sensitive user data to AI without consent  
❌ Trust AI responses without validation  
❌ Skip error handling or rate-limit handling  

### Existing AI Functions (reference)

`functions/generatePersonalizedRecommendations.ts` · `functions/openaiIntegration.ts` · `functions/claudeIntegration.ts` · `functions/geminiIntegration.ts` · `functions/aiContentGenerator.ts` · `functions/aiEventPlanningAssistant.ts` · `functions/aiCoachingRecommendations.ts`

---

## 7. Gamification System Expert

> **Purpose:** Implements gamification features including points, badges, leaderboards, and challenges following Interact's gamification patterns and Base44 entity relationships.

### Core Entities

| Category | Entity | Purpose |
|----------|--------|---------|
| Points | `UserPoints` | Total points, level, streak |
| Points | `PointsTransaction` | Audit trail of all awards |
| Points | `PointsRule` | Automatic award rules |
| Badges | `Badge` | Badge definitions |
| Badges | `UserBadge` | Earned badges |
| Leaderboard | `LeaderboardEntry` | User positions |
| Challenges | `Challenge` | Challenge definitions |
| Challenges | `ChallengeParticipant` | Participation tracking |
| Rewards | `Reward` | Reward catalog |
| Rewards | `UserReward` | Claimed rewards |

### Points System

**Award points (backend):**
```typescript
// functions/awardPoints.ts
const [record] = await base44.asServiceRole.entities.UserPoints.filter({ user_email });
const newTotal = record.total_points + points;
const newLevel = Math.floor(newTotal / 1000) + 1;
await base44.asServiceRole.entities.UserPoints.update(record.id, { total_points: newTotal, level: newLevel });
await base44.asServiceRole.entities.PointsTransaction.create({ user_email, points, reason, activity_id, created_at: new Date().toISOString(), transaction_type: 'award' });
return Response.json({ success: true, new_total: newTotal, new_level: newLevel, leveled_up: newLevel > record.level });
```

**Display points (frontend):**
```javascript
const { data: userPoints } = useQuery({
  queryKey: ['userPoints', userEmail],
  queryFn: async () => (await base44.entities.UserPoints.filter({ user_email: userEmail }))[0],
});
```

### Badge System

```typescript
// Check / award badge (backend)
const existing = await base44.asServiceRole.entities.UserBadge.filter({ user_email, badge_id });
if (existing.length > 0) return Response.json({ success: false, message: 'Already earned' });
await base44.asServiceRole.entities.UserBadge.create({ user_email, badge_id, earned_at: new Date().toISOString() });
await base44.asServiceRole.entities.Notification.create({ user_email, title: 'Badge Unlocked! 🏆', message: `You earned "${badge.name}"!`, type: 'badge_earned', is_read: false, created_at: new Date().toISOString() });
```

### Leaderboard

```javascript
const { data: leaderboard } = useQuery({
  queryKey: ['leaderboard', type, teamId],
  queryFn: async () => {
    const all = await base44.entities.UserPoints.list();
    return all.sort((a, b) => b.total_points - a.total_points).slice(0, 10);
  },
});
```

### Animations

```javascript
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

// Badge unlocked animation
useEffect(() => { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); }, []);

<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', duration: 0.8 }}>
  {/* Badge content */}
</motion.div>
```

### Key Pages

`src/pages/Gamification.jsx` · `src/pages/GamificationDashboard.jsx` · `src/pages/Leaderboards.jsx` · `src/pages/PointStore.jsx` · `src/pages/TeamChallenges.jsx`

### Component Directories

`src/components/gamification/badges/` · `src/components/gamification/points/` · `src/components/gamification/leaderboard/` · `src/components/gamification/challenges/` · `src/components/gamification/rewards/`

### Final Checklist

- [ ] Points correctly awarded and stored in `UserPoints`
- [ ] `PointsTransaction` records created for audit trail
- [ ] Badges unlock based on correct criteria (no duplicate awards)
- [ ] Leaderboard updates after points changes
- [ ] Challenge progress tracked accurately
- [ ] Notifications sent for achievements
- [ ] Animations enhance UX without blocking interaction

---

## 8. Unit Test Writer

> **Purpose:** Writes comprehensive unit tests using Vitest + React Testing Library matching Interact's test patterns, focusing on user behavior and achieving 30%+ coverage target.

**Test framework:** Vitest 4.0.17 + React Testing Library  
**Config:** `vitest.config.js`  
**Run:** `npm test` (watch) or `npm run test:run` (single pass)

### Component Test Pattern

```javascript
// src/components/activities/ActivityCard.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ActivityCard from './ActivityCard';
import * as base44Client from '@/api/base44Client';

const mockActivity = { id: '1', name: 'Team Lunch', type: 'social', description: 'Monthly team lunch', duration: 60 };

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('ActivityCard', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  
  it('renders activity name and type', () => {
    render(<ActivityCard activity={mockActivity} />, { wrapper: createWrapper() });
    expect(screen.getByText('Team Lunch')).toBeInTheDocument();
    expect(screen.getByText(/social/i)).toBeInTheDocument();
  });
  
  it('calls onDelete when delete button is clicked', async () => {
    const mockDelete = vi.fn().mockResolvedValue({});
    vi.spyOn(base44Client.base44.entities.Activity, 'delete').mockImplementation(mockDelete);
    const onDelete = vi.fn();
    render(<ActivityCard activity={mockActivity} onDelete={onDelete} />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(mockActivity.id));
  });
});
```

### Hook Test Pattern

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useActivities } from '@/hooks/useActivities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useActivities', () => {
  it('returns activities on success', async () => {
    const mockActivities = [{ id: '1', name: 'Test Activity' }];
    vi.spyOn(base44Client.base44.entities.Activity, 'list').mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useActivities(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockActivities);
  });
});
```

### Utility Test Pattern

```javascript
// src/test/utils/formatDate.test.js
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/formatDate';

describe('formatDate', () => {
  it('formats ISO date string to human-readable format', () => {
    expect(formatDate('2026-01-15T10:00:00Z')).toBe('January 15, 2026');
  });
  it('returns empty string for null input', () => {
    expect(formatDate(null)).toBe('');
  });
});
```

### Mock Data Patterns

```javascript
// src/test/mock-data.js
export const mockActivity = (overrides = {}) => ({
  id: 'activity-123', name: 'Team Lunch', type: 'social',
  description: 'Monthly team lunch', duration: 60, team_size: { min: 4, max: 20 }, ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 'user-123', email: 'test@example.com', name: 'Test User', role: 'participant', ...overrides,
});
```

### Coverage Targets

- New utilities and hooks: **80%+ coverage**
- New components: test all user interactions
- Global target: **30%+ coverage by Q1 2026** (currently 0.09%)

### What to Test

✅ User interactions (clicks, form submissions, navigation)  
✅ Data loading states (loading, error, empty, populated)  
✅ Business logic in hooks and utilities  
✅ Error boundaries and error states  

❌ Don't test implementation details  
❌ Don't test third-party library internals  

### Final Checklist

- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Test file in same directory as component (`Component.test.jsx`)
- [ ] Mock all external API calls
- [ ] Wrap components with `QueryClientProvider` when needed
- [ ] Test both success and error scenarios
- [ ] Coverage improves from baseline

---

## 9. Code Quality & Linter

> **Purpose:** Fixes ESLint violations, removes unused imports, enforces coding standards, and improves code quality following Interact's ESLint configuration.

**ESLint version:** 9.19.0  
**Config file:** `eslint.config.js`  
**Plugins:** `@eslint/js` · `eslint-plugin-react` · `eslint-plugin-react-hooks` · `eslint-plugin-unused-imports`

### Commands

```bash
npm run lint        # Check for errors
npm run lint:fix    # Auto-fix fixable issues
```

### Key Rules

```javascript
"unused-imports/no-unused-imports": "error"          // Auto-fixable
"unused-imports/no-unused-vars": ["warn", { varsIgnorePattern: "^_" }]
"react/prop-types": "off"                             // No PropTypes required
"react/react-in-jsx-scope": "off"                     // React 18 — no import needed
"react-hooks/rules-of-hooks": "error"                 // CRITICAL — fails build
"react/no-unknown-property": ["error", { ignore: ["cmdk-input-wrapper", "toast-close"] }]
```

### Common Fixes

**Unused imports** — Remove the import or add to usage. Auto-fixed by `npm run lint:fix`.

**Unused variables** — Remove or prefix with `_` if intentionally unused:
```javascript
function Component({ onClick, _onHover }) { return <button onClick={onClick} />; }
```

**React Hooks violations** — See Section 2 (React Hooks Fixer).

**Missing `useEffect` dependencies** — Add all referenced variables to the dependency array.

### Import Organization Order

```javascript
// 1. React core
import { useState, useEffect } from 'react';
// 2. Third-party
import { useQuery } from '@tanstack/react-query';
// 3. UI components
import { Button } from '@/components/ui/button';
// 4. Custom components
import ActivityCard from '@/components/activities/ActivityCard';
// 5. Utilities
import { cn } from '@/lib/utils';
// 6. Icons
import { Check, X } from 'lucide-react';
```

### Anti-Patterns

❌ Add `/* eslint-disable */` without a documented reason  
❌ Leave unused imports or variables  
❌ Ignore React Hooks warnings  

### Pre-Commit Checklist

- [ ] `npm run lint` — zero errors
- [ ] `npm run lint:fix` — applied
- [ ] `npm run typecheck` — passes
- [ ] No `eslint-disable` comments added

---

## 10. Security Auditor

> **Purpose:** Reviews code for security vulnerabilities including XSS, injection attacks, authentication bypasses, and secret exposure following OWASP guidelines.

**Current security score: 100/100** ✅ — Goal: maintain zero vulnerabilities.

### 1. Authentication & Authorization

```typescript
// ✅ ALWAYS check auth in every Base44 function
const user = await base44.auth.me();
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
if (action === 'delete' && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
```

### 2. Input Validation

```typescript
import * as z from 'zod';
const schema = z.object({ email: z.string().email(), points: z.number().int().positive() });
try {
  const validated = schema.parse(await req.json());
} catch (e) {
  return Response.json({ error: 'Validation failed', details: e.errors }, { status: 400 });
}
```

### 3. XSS Prevention

React escapes content by default. For HTML rendering, use DOMPurify:
```javascript
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userHtml);
<div dangerouslySetInnerHTML={{ __html: clean }} />
// ❌ NEVER: <div dangerouslySetInnerHTML={{ __html: untrustedInput }} />
```

### 4. Secret Management

```typescript
// ✅ Backend only — via Deno.env
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// ✅ Frontend — only public keys via VITE_ prefix
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ❌ NEVER hardcode secrets
const API_KEY = 'sk-1234567890'; // DO NOT DO THIS
```

### 5. Data Exposure Prevention

```typescript
// Filter sensitive fields before returning
const sanitizeUser = ({ password, api_key, ...safeData }) => safeData;
return Response.json({ users: users.map(sanitizeUser) });

// Generic error messages for users (log details internally)
} catch (error) {
  console.error('Detailed error:', error);
  return Response.json({ error: 'Operation failed' }, { status: 500 });
}
```

### 6. Other Checks

- **Rate limiting:** Track request counts per user/function; return 429 with `retry_after`
- **File uploads:** Validate MIME type and file size; sanitize filenames
- **Prototype pollution:** Use `{ ...spread }` instead of `Object.assign(target, userInput)`
- **JWT:** Use strong keys, `httpOnly` cookies, validate signature every request

### npm Audit

```bash
npm audit                 # Review vulnerabilities
npm audit fix             # Auto-fix
npm audit fix --force     # Force fix (may have breaking changes — review carefully)
```

### Security Testing Pattern

```javascript
// Test unauthenticated access
const r = await fetch('/api/sensitiveFunction', { method: 'POST', body: '{}' });
expect(r.status).toBe(401);

// Test malicious input
const r2 = await fetch('/api/createUser', { method: 'POST',
  body: JSON.stringify({ email: '<script>alert("xss")</script>' }) });
expect(r2.status).toBe(400);
```

### OWASP Top 10 Awareness

1. Broken Access Control · 2. Cryptographic Failures · 3. Injection · 4. Insecure Design · 5. Security Misconfiguration · 6. Vulnerable Components · 7. Authentication Failures · 8. Software Integrity Failures · 9. Logging Failures · 10. SSRF

### Security Review Checklist

- [ ] All functions check authentication
- [ ] All inputs validated
- [ ] No hardcoded secrets
- [ ] Error messages are generic (log details internally)
- [ ] Sensitive data filtered from API responses
- [ ] User content sanitized before rendering
- [ ] File uploads validated
- [ ] Rate limiting on expensive operations
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] No console.log with sensitive data

---

## 11. Documentation Writer

> **Purpose:** Creates and updates documentation following Interact's documentation standards, including API docs, component docs, and technical guides.

**Current documentation score: 98/100** ✅

### Documentation Structure

```
/
├── README.md                     # Main project readme
├── CONTRIBUTING.md               # Contribution guidelines
├── SECURITY.md                   # Security guidelines
├── docs/
│   ├── planning/PRD.md           # Product requirements
│   ├── planning/FEATURE_ROADMAP.md
│   ├── guides/TESTING.md
│   ├── audits/CODEBASE_AUDIT.md
│   └── integrations/AGENTS.md
└── components/docs/              # Component-specific docs
    ├── ARCHITECTURE.md
    └── [feature-docs].md
```

### Document Template

```markdown
# Document Title
**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** [Date: January 14, 2026]  
**Status:** [Active Documentation / In Progress / Deprecated]  

---

## Overview
Brief 1-2 paragraph introduction.

---

## Table of Contents
1. [Section 1](#section-1)

---

## Section 1
Content...

---

## Related Documentation
- [Related Doc](./RELATED.md) - Brief description

---

**Document Owner:** [Team]  
**Last Updated:** [Date]  
**Next Review:** [Date]
```

### Documentation Types

**API Documentation** — Document function name, location, description, auth requirement, request/response schemas, error responses, usage example.

**Component Documentation** — Document component name, location, description, props table (name/type/required/default/description), shape of complex prop objects, usage example.

**Technical Guide** — Step-by-step instructions with numbered steps, code examples, troubleshooting section.

**Architecture Documentation** — ASCII diagrams, entity descriptions, data flow narrative.

### Code Example Standards

- Always use syntax highlighting (` ```javascript `)
- Include complete, working examples with imports
- Use realistic (not "foo/bar") example data
- Add comments for clarity

### Writing Style

- Simple, direct language; avoid jargon
- Consistent terminology across the doc
- Cover all parameters and error cases
- Include practical, working examples

### Documentation Checklist

- [ ] Follows template structure
- [ ] Date and status included
- [ ] Table of contents for docs with 3+ sections
- [ ] All code examples are complete and working
- [ ] All parameters documented
- [ ] Links to related documentation
- [ ] No spelling or grammar errors
- [ ] `Last Updated` date set

---

## 12. CI/CD Pipeline Manager

> **Purpose:** Manages GitHub Actions workflows, fixes pipeline failures, and optimizes build/test/deploy processes.

**Workflows location:** `.github/workflows/`  
**Active workflows:** `ci.yml` · `safe-merge-checks.yml` · `docs-authority.yml`

### Current CI Workflow (ci.yml)

```yaml
name: CI - Pull Request Checks
on:
  pull_request:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
        continue-on-error: true   # Remove once all linting issues fixed
      - run: npm run test:run
      - run: npm audit --audit-level=high
        continue-on-error: true   # Remove when stable
```

### Fixing Common CI Failures

**Linting failure:** `npm run lint` locally → `npm run lint:fix` → manually fix remaining → push.

**Test failure:** `npm test` locally → fix failing test → `npm run test:run` → push.

**Security audit failure:**
```bash
npm audit            # Review
npm audit fix        # Auto-fix
npm install pkg@latest  # Update specific package
```

**Dependency install failure:** Delete `package-lock.json` + `node_modules` → `npm install` → commit new lockfile.

### Adding Coverage Upload

```yaml
- name: Run tests with coverage
  run: npm run test:coverage
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with: { files: ./coverage/lcov.info, flags: unittests }
```

### Caching

```yaml
# Automatic npm cache (already configured)
- uses: actions/setup-node@v4
  with: { node-version: '20', cache: 'npm' }
```

### Environment Secrets

```yaml
- name: Build with secrets
  env:
    VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
  run: npm run build
```

### CI Migration Plan (remove `continue-on-error`)

1. Fix all linting errors → remove `continue-on-error` from lint step
2. Fix all security audit issues → remove from audit step
3. Add type checking step: `run: npm run typecheck`
4. Add coverage threshold: `run: npm run test:coverage -- --coverage.lines=30`

### Performance Targets

- Total CI run: < 5 minutes
- With npm cache hit: ~60 seconds

### Troubleshooting Checklist

- [ ] Error message read in GitHub Actions logs
- [ ] Failed command run locally
- [ ] Dependencies installed (`npm ci`)
- [ ] Environment variables / secrets configured
- [ ] `package-lock.json` committed
- [ ] Node version matches (20.x)
- [ ] No TypeScript/ESLint errors in changed files

---

## 13. Performance Optimizer

> **Purpose:** Identifies and fixes performance bottlenecks specific to React 18 + Vite 6, including code splitting, lazy loading, bundle analysis, and runtime optimization.

**Estimated impact:** 40–60% bundle size reduction, 2–3× faster initial load.

### Bundle Analysis

```bash
npm run build
du -sh dist/
du -h dist/assets/* | sort -hr | head -20
```

Target: Total `dist/` < 3 MB uncompressed; initial JS < 500 KB gzipped; each page chunk < 100 KB gzipped.

### 1. Lazy Loading Pages

The repo uses `src/pages.config.js` with `React.lazy` — **do not revert to eager imports**. When adding new pages:

```javascript
// src/pages.config.js
import { lazy } from 'react';
export const pagesConfig = {
  Dashboard: lazy(() => import('./pages/Dashboard')),
  Activities: lazy(() => import('./pages/Activities')),
  // add new pages here
};
```

**Lazy load heavy components:** rich text editor (Quill), charts (Recharts), 3D graphics (Three.js), heavy modals.

```javascript
const EngagementChart = lazy(() => import('@/components/analytics/EngagementChart'));
{showChart && <Suspense fallback={<ChartSkeleton />}><EngagementChart /></Suspense>}
```

### 2. React Performance Hooks

```javascript
// React.memo for pure list-item components
export default memo(function ActivityCard({ activity }) { ... });

// useMemo for expensive calculations
const sorted = useMemo(() => [...users].sort((a, b) => b.points - a.points), [users]);

// useCallback for stable handler references
const handleDelete = useCallback((id) => deleteActivity(id), []);
```

### 3. Image Optimization

```javascript
import { optimizeImageUrl } from '@/lib/imageUtils';

<img
  src={optimizeImageUrl(activity.imageUrl, { width: 400, quality: 80 })}
  alt={activity.name}
  loading="lazy"
  width={400}
  height={300}
/>
```

Always add `loading="lazy"`, `width`, `height`.

### 4. TanStack Query Cache

```javascript
useQuery({ queryKey, queryFn, staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 });

// Prefetch on hover
queryClient.prefetchQuery({ queryKey: ['activity', id], queryFn: () => fetchActivityDetails(id) });
```

### 5. Vite Build Optimization

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-radix': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'vendor-charts': ['recharts'],
        'vendor-framer': ['framer-motion'],
        'vendor-query': ['@tanstack/react-query'],
      },
    },
  },
  chunkSizeWarningLimit: 600,
},
```

### 6. Remove Deprecated Dependencies

```bash
# Remove moment.js (large, deprecated)
npm uninstall moment

# Replace with date-fns (already installed)
import { format } from 'date-fns';
const formatted = format(date, 'yyyy-MM-dd');

# Use lodash-es or import specific functions
import { debounce } from 'lodash-es';
```

### 7. Virtual Scrolling (for 100+ item lists)

Consider `@tanstack/react-virtual` for leaderboards and activity feeds.

### Runtime Performance Targets

- Lighthouse Performance: 90+
- LCP: < 2.5 s · FID: < 100 ms · CLS: < 0.1 · TTI: < 3.5 s

### Anti-Patterns

❌ Import entire libraries (`import _ from 'lodash'` — use tree-shaking imports)  
❌ Inline functions in JSX without `useCallback`  
❌ Render long lists without virtualization  
❌ Omit `loading="lazy"` on below-fold images  
❌ Skip TanStack Query cache configuration  

### Optimization Checklist

- [ ] All 117 pages lazy-loaded in `pages.config.js`
- [ ] Heavy components (charts, editor) lazy-loaded
- [ ] `React.memo` on list-item components
- [ ] `moment.js` removed; `date-fns` used throughout
- [ ] Images optimized via `imageUtils.js`
- [ ] TanStack Query `staleTime`/`gcTime` configured
- [ ] Vendor chunks split in `vite.config.js`
- [ ] Bundle size measured before and after

---

## 14. State Management Expert

> **Purpose:** Implements state management using React Context API + TanStack Query patterns specific to Interact's architecture, avoiding prop drilling and managing global app state.

### Two-Tier State Model

| State Type | Tool | Examples |
|------------|------|---------|
| UI / App state | React Context API | Auth, theme, notifications, UI toggles |
| Server state | TanStack Query | Activities, users, gamification data |

### Creating a Context Provider

```javascript
// src/contexts/NotificationContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const addNotification = useCallback((n) => {
    setNotifications(prev => [n, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);
  
  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    notifications, unreadCount, addNotification,
    markAsRead: (id) => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); setUnreadCount(prev => Math.max(0, prev - 1)); },
    clearAll: () => { setNotifications([]); setUnreadCount(0); },
  }), [notifications, unreadCount, addNotification]);
  
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (ctx === undefined) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
```

### Provider Composition

```javascript
// src/App.jsx or src/main.jsx
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
```

### Existing Context: AuthContext

```javascript
import { useAuth } from '@/lib/AuthContext';
const { user, isAuthenticated, login, logout, loading } = useAuth();
```

### Query Key Conventions

```javascript
['activities']                 // All activities
['activity', activityId]       // Single activity
['user', userId]               // Single user
['user', userId, 'points']     // Nested resource
['leaderboard', { period }]    // Parameterised
```

### Common Pitfalls

**Over-using context (causes re-renders):** Split large contexts by concern (auth, theme, notifications) instead of one mega-context.

**Derived state in state:** Compute it instead:
```javascript
// ❌ BAD
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${user.firstName} ${user.lastName}`), [user]);

// ✅ GOOD
const fullName = `${user.firstName} ${user.lastName}`;
```

**Prop drilling > 2–3 levels:** Lift to context or use URL search params for shareable filter state.

**Stale closures in `useCallback`:** Use functional updates:
```javascript
// ❌ count is stale
const increment = useCallback(() => setCount(count + 1), []);

// ✅ Always fresh
const increment = useCallback(() => setCount(prev => prev + 1), []);
```

### URL State for Filters

```javascript
const [searchParams, setSearchParams] = useSearchParams();
const category = searchParams.get('category') || 'all';
const updateFilters = (newFilters) => setSearchParams({ ...Object.fromEntries(searchParams), ...newFilters });
```

### Final Checklist

- [ ] UI state in Context, server state in TanStack Query
- [ ] Context providers split by concern
- [ ] Context values memoized with `useMemo`
- [ ] `useCallback` used for stable function references
- [ ] No prop drilling deeper than 2–3 levels
- [ ] URL params used for shareable filter/sort state

---

## 15. API Integration Specialist

> **Purpose:** Implements third-party API integrations for Google Calendar, Slack, Teams, Notion, HubSpot, and other external services following Interact's integration patterns.

### Integration Registry

All integrations are registered in `src/lib/integrationsRegistry.js`. Always add new integrations here first.

### Current Integrations (15+)

**Productivity:** Google Calendar · Microsoft Teams · Slack · Notion  
**Business:** HubSpot · Zapier  
**Infrastructure:** Vercel · Cloudflare · Cloudinary  
**AI:** OpenAI · Anthropic · Gemini · Perplexity · ElevenLabs  
**Maps:** Google Maps

### Base44 Integration Function Template

```typescript
// functions/newIntegration.ts
import { Context } from "@base44/sdk";

export default async function newIntegration(ctx: Context) {
  try {
    const userId = ctx.auth?.userId;
    if (!userId) return { success: false, error: 'Authentication required' };
    
    const { action, payload } = await ctx.body();
    
    // Get credentials from environment
    const apiKey = Deno.env.get("INTEGRATION_API_KEY");
    if (!apiKey) throw new Error('Integration not configured');
    
    // Get user's stored OAuth tokens
    const userIntegration = await ctx.entities.UserIntegration.findOne({ where: { userId, provider: 'new-integration' } });
    if (!userIntegration) return { success: false, error: 'Integration not connected' };
    
    // Make API request
    const response = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userIntegration.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    
    await ctx.entities.IntegrationLog.create({ userId, provider: 'new-integration', action, status: 'success', timestamp: new Date() });
    return { success: true, data: await response.json() };
    
  } catch (error) {
    console.error('Integration error:', error);
    return { success: false, error: error.message };
  }
}
```

### OAuth Flow

```javascript
// Initiate OAuth
const params = new URLSearchParams({ client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirect_uri: `${window.location.origin}/integrations/callback`,
  response_type: 'code', scope: 'calendar.readonly calendar.events',
  state: crypto.randomUUID(), access_type: 'offline', prompt: 'consent' });
window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

// Callback — exchange code for token via backend
const response = await base44.functions.invoke('oauthCallback', { code, provider: 'google',
  redirectUri: `${window.location.origin}/integrations/callback` });
```

### Error Handling Utilities

```javascript
// Retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); }
    catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
    }
  }
}

// Rate limit handling
if (error.status === 429) {
  const retryAfter = parseInt(error.headers?.['Retry-After'] || '60');
  await new Promise(r => setTimeout(r, retryAfter * 1000));
  return await apiCall();
}
```

### Existing Integration Functions

`functions/syncEventToGoogleCalendar.ts` · `functions/sendSlackNotification.ts` · `functions/sendTeamsNotification.ts` · `functions/openaiIntegration.ts` · `functions/claudeIntegration.ts` · `functions/geminiIntegration.ts`

### Environment Variables

**Frontend (public keys only):**
```bash
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_MAPS_API_KEY=...
```

**Backend (secret keys — never expose to frontend):**
```bash
OPENAI_API_KEY=sk-...
SLACK_BOT_TOKEN=xoxb-...
GOOGLE_SERVICE_ACCOUNT_JSON=...
HUBSPOT_API_KEY=...
```

### Security Rules

❌ NEVER store API keys in frontend code  
❌ NEVER trust OAuth state parameters without CSRF verification  
✅ Refresh expired tokens before every API call  
✅ Validate integration permissions before every operation  

---

## 16. Route & Navigation Manager

> **Purpose:** Implements React Router DOM 6.26.0 patterns, manages routing configuration, navigation guards, and page organization for Interact's 117 pages.

### Router Setup

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
// ... lazy load all 117 pages

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NavigationTracker />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* ... more routes */}
            </Route>
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Protected Routes

```javascript
// ProtectedRoute — redirects unauthenticated users to /login
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// Role-based guard
export default function RoleProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
```

### Navigation Patterns

```javascript
// Programmatic navigation
const navigate = useNavigate();
navigate(`/activities/${result.id}`);
navigate(-1);  // go back

// Link with active styling
<NavLink to="/activities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
  Activities
</NavLink>

// Search params for filters
const [searchParams, setSearchParams] = useSearchParams();
const category = searchParams.get('category') || 'all';
setSearchParams({ category: 'wellness' });
```

### Nested Routes

```javascript
// AdminHub.jsx
<Routes>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview" element={<AdminOverview />} />
  <Route path="users" element={<UserManagement />} />
</Routes>

// Main router
<Route path="/admin/*" element={<AdminHub />} />
```

### Route Constants

```javascript
// src/routes/routes.js
export const ROUTES = {
  DASHBOARD: '/dashboard',
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',
  LEADERBOARD: '/leaderboard',
  ADMIN: '/admin',
};
// Usage:
navigate(ROUTES.ACTIVITY_DETAIL.replace(':id', activityId));
```

### Utility Components

```javascript
// ScrollToTop — scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

// Dynamic page title
function usePageTitle(customTitle) {
  const location = useLocation();
  useEffect(() => { document.title = `${customTitle || 'Interact'} | Interact Platform`; }, [location, customTitle]);
}

// Breadcrumbs — src/components/common/Breadcrumbs.jsx
```

### Testing Routes

```javascript
render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <Routes><Route path="/dashboard" element={<Dashboard />} /></Routes>
  </MemoryRouter>
);
expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
```

### Security Note

Always use React Router v6.26.0+ — earlier versions had an XSS/open-redirect vulnerability fixed in January 2026.

---

## 17. Error Handling & Logging Expert

> **Purpose:** Implements comprehensive error handling, error boundaries, logging strategies, and user-facing error messages following Interact's patterns.

### Three-Tier Error Handling

1. **Component Level** — `try/catch` in async functions + TanStack Query error states
2. **Error Boundaries** — Catch React render errors in component tree
3. **Global Handlers** — `window.error` and `unhandledrejection` events

### Error Boundary

```javascript
// src/components/common/ErrorBoundary.jsx
export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) { return { hasError: true }; }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to Sentry or Base44 logging endpoint
  }
  
  render() {
    if (this.state.hasError) return (
      <Card className="p-8 max-w-2xl mx-auto mt-20">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">The error has been logged. Please try again.</p>
        {process.env.NODE_ENV === 'development' && (
          <details><summary>Error Details</summary><pre>{this.state.error?.toString()}</pre></details>
        )}
        <div className="flex gap-4">
          <Button onClick={() => this.setState({ hasError: false })}>Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>Dashboard</Button>
        </div>
      </Card>
    );
    return this.props.children;
  }
}
```

Wrap the entire app and individual page routes with `<ErrorBoundary>`.

### API Error Handling

```javascript
function parseApiError(error) {
  if (!navigator.onLine) return 'No internet connection.';
  if (error.status === 401) return 'Session expired. Please log in again.';
  if (error.status === 403) return 'You do not have permission for this action.';
  if (error.status === 404) return 'The requested resource was not found.';
  if (error.status === 422) return error.data?.message || 'Invalid data.';
  if (error.status >= 500) return 'Server error. Please try again later.';
  return error.message || 'Something went wrong.';
}
```

### TanStack Query Error Handling

```javascript
useQuery({
  queryKey: ['activities'],
  queryFn: fetchActivities,
  onError: (error) => { console.error('Fetch failed:', error); toast.error('Failed to load activities.'); },
  retry: (failureCount, error) => error.status >= 400 && error.status < 500 ? false : failureCount < 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### Component Error Pattern

```javascript
function ActivityCard({ activityId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleDelete = async () => {
    setLoading(true); setError(null);
    try {
      await base44Client.entities.Activity.delete(activityId);
      toast.success('Activity deleted');
    } catch (err) {
      setError('Failed to delete activity');
      toast.error('Failed to delete activity');
    } finally { setLoading(false); }
  };
  
  return (
    <Card>
      {error && <div className="bg-destructive/10 text-destructive p-3 rounded mb-4">{error}</div>}
      <Button onClick={handleDelete} disabled={loading} variant="destructive">
        {loading ? 'Deleting...' : 'Delete'}
      </Button>
    </Card>
  );
}
```

### Global Error Handlers

```javascript
// src/utils/errorHandlers.js
export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    window.Sentry?.captureException(event.error);
    event.preventDefault();
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    toast.error('An unexpected error occurred');
    event.preventDefault();
  });
}
// Call in src/main.jsx
```

### Logger Service

```javascript
// src/services/logger.js
class Logger {
  error(message, error, data = {}) {
    console.error(`[ERROR] ${message}`, { error: error?.toString(), stack: error?.stack, ...data });
    window.Sentry?.captureException(error);
  }
  info(message, data) { console.info(`[INFO] ${message}`, data); }
}
export const logger = new Logger();
```

### User-Facing Error Component

```javascript
function ErrorMessage({ error, onRetry }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error?.message || 'Something went wrong'}
        {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try Again</Button>}
      </AlertDescription>
    </Alert>
  );
}
```

### Best Practices

✅ Wrap all async operations in `try/catch`  
✅ Provide actionable error messages  
✅ Log detailed info internally; show generic message to users  
✅ Implement retry logic with exponential backoff  
❌ Never silently swallow errors  
❌ Never expose stack traces or internal paths to users  
❌ Never log sensitive data (passwords, tokens, PII)  

---

## 18. Accessibility Auditor

> **Purpose:** Reviews and implements WCAG 2.1 AA compliance, ARIA labels, keyboard navigation, screen reader support, and semantic HTML for Interact's Radix UI components.

**Target:** WCAG 2.1 Level AA · Radix UI provides a solid accessibility baseline

### WCAG 2.1 Principles (POUR)

#### 1. Perceivable

**Color contrast:** Text ≥ 4.5:1 ratio (normal text), ≥ 3:1 (large text).

**Alt text for images:**
```javascript
<img src={activity.imageUrl} alt={`${activity.name} activity`} />      // ✅ Descriptive
<img src="/decorative.svg" alt="" role="presentation" />                // ✅ Decorative
// ❌ <img src={...} />  or  <img src={...} alt="image" />
```

**Form labels:**
```javascript
<Label htmlFor="activity-name">Activity Name</Label>
<input id="activity-name" type="text" />
```

#### 2. Operable

**Keyboard navigation:**
```javascript
// ✅ Native buttons are keyboard-accessible by default
<button onClick={handleClick}>Submit</button>

// ✅ Div-as-button (if unavoidable)
<div role="button" tabIndex={0} onClick={handleClick}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}>
  Submit
</div>
```

**Skip link:**
```javascript
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">
  Skip to main content
</a>
```

#### 3. Understandable

**Semantic HTML:**
```javascript
<nav aria-label="Main navigation">...</nav>
<main><h1>Dashboard</h1><section aria-labelledby="recent"><h2 id="recent">Recent</h2></section></main>
```

**Icon buttons need labels:**
```javascript
<button aria-label="Search activities"><Search className="w-4 h-4" /></button>
```

**Form errors:**
```javascript
<input aria-invalid={errors.name ? 'true' : 'false'} aria-describedby={errors.name ? 'name-error' : undefined} />
{errors.name && <span id="name-error" role="alert" className="text-destructive text-sm">{errors.name.message}</span>}
```

#### 4. Robust (Radix UI patterns)

```javascript
// Always include DialogTitle in dialogs
<DialogTitle>Create Activity</DialogTitle>
<DialogDescription>Fill in the details to create a new activity.</DialogDescription>

// ARIA loading state
<div role="status" aria-live="polite" aria-busy="true">Loading activities...</div>
```

### Accessibility Provider (if needed)

Create `src/contexts/AccessibilityContext.jsx` with `announce(message, 'polite'|'assertive')` function for screen reader live region announcements.

### Screen Reader Only Utility

```css
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }
.sr-only:focus-visible { position: static; width: auto; height: auto; }
```

### Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Activate buttons with Enter/Space
- [ ] Close modals with Escape
- [ ] Test with VoiceOver (macOS: Cmd+F5) or NVDA (Windows)
- [ ] Zoom to 200% — no horizontal scroll
- [ ] Lighthouse accessibility score: 100
- [ ] Pass axe DevTools scan

### Per-Component Checklist

- [ ] Semantic HTML elements used
- [ ] Images have alt text
- [ ] Form inputs have associated labels
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Errors announced to screen readers

---

## 19. Analytics Implementation Specialist

> **Purpose:** Implements analytics tracking, event logging, dashboard metrics, and reporting features using Interact's analytics patterns and Recharts visualizations.

### Analytics Categories

1. Engagement analytics (participation frequency)
2. Gamification analytics (points, badges, rankings)
3. Activity analytics (creation, completion rates)
4. Team analytics (performance, collaboration)
5. Learning analytics (course completion, skill gaps)
6. Wellness analytics (wellness participation)

### Analytics Service

```javascript
// src/services/analytics.js
class AnalyticsService {
  sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  async track(eventType, eventData = {}) {
    try {
      await base44Client.functions.trackEvent({
        userId: this.getCurrentUserId(),
        eventType, eventData,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        deviceInfo: { userAgent: navigator.userAgent, screenSize: `${window.screen.width}x${window.screen.height}` },
      });
    } catch (error) { console.error('Analytics tracking failed:', error); /* Never throw */ }
  }
  
  trackPageView(pageName)         { this.track('page_view', { page: pageName, url: window.location.href }); }
  trackActivityView(activityId)   { this.track('activity_viewed', { activityId }); }
  trackActivityJoin(activityId)   { this.track('activity_joined', { activityId }); }
  trackPointsEarned(points, reason) { this.track('points_earned', { points, reason }); }
  trackBadgeUnlocked(badgeId)     { this.track('badge_unlocked', { badgeId }); }
}
export const analytics = new AnalyticsService();
```

### React Hooks for Tracking

```javascript
// src/hooks/useAnalytics.js
export function usePageTracking() {
  const location = useLocation();
  useEffect(() => analytics.trackPageView(location.pathname), [location]);
}

export function useAnalyticsEvent() {
  const trackEvent = useCallback((eventType, eventData) => analytics.track(eventType, eventData), []);
  return { trackEvent };
}
```

### Analytics Dashboard Pattern

```javascript
// Key metrics cards + Recharts tabs
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <Card className="p-6"><p>Total Users</p><p className="text-3xl font-bold">{data.totalUsers}</p></Card>
  {/* Engagement Rate, Active Users, Activities Completed */}
</div>
<Tabs defaultValue="engagement">
  <TabsTrigger value="engagement">Engagement</TabsTrigger>
  <TabsContent value="engagement"><EngagementChart data={data.engagementData} /></TabsContent>
</Tabs>
```

### CSV Export

```javascript
export function exportToCSV(data, filename) {
  const csv = [Object.keys(data[0]).join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  Object.assign(document.createElement('a'), { href: url, download: `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv` }).click();
  URL.revokeObjectURL(url);
}
```

### GDPR Compliance

```javascript
// Anonymize user data before tracking
userId: btoa(rawUserId).substring(0, 16),  // Consistent hash, no PII
// Never track: passwords, credit cards, SSN, emails in event data
```

### Existing Analytics Files

**Backend:** `functions/lifecycleAnalytics.ts` · `functions/generateUserProgressReport.ts` · `functions/analyzeBurnoutRisk.ts`  
**Frontend:** `src/pages/Analytics.jsx` · `src/pages/TeamAnalyticsDashboard.jsx` · `src/pages/AdvancedGamificationAnalytics.jsx`

---

## 20. Data Visualization Expert

> **Purpose:** Creates charts, graphs, and visual dashboards using Recharts 2.15.4, following Interact's visualization patterns for engagement metrics, leaderboards, and analytics.

**Version:** Recharts 2.15.4 (already installed)

### Chart Color Theme

```javascript
// src/lib/chartColors.js
export const chartColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  chart1: 'hsl(var(--chart-1))',  // Blue
  chart2: 'hsl(var(--chart-2))',  // Green
  chart3: 'hsl(var(--chart-3))',  // Orange
  chart4: 'hsl(var(--chart-4))',  // Pink
  chart5: 'hsl(var(--chart-5))',  // Purple
};
```

### Chart Component Templates

**Line Chart — Engagement Trend:**
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
    <Tooltip content={<CustomTooltip />} />
    <Legend />
    <Line type="monotone" dataKey="score" stroke={chartColors.primary} strokeWidth={2} name="Engagement Score" dot={{ r: 4 }} activeDot={{ r: 6 }} />
  </LineChart>
</ResponsiveContainer>
```

**Bar Chart — Activity Participation:**
```javascript
<BarChart data={data}>
  <Bar dataKey="participants" fill={chartColors.chart1} name="Participants" radius={[8, 8, 0, 0]} />
  <Bar dataKey="completions" fill={chartColors.chart2} name="Completions" radius={[8, 8, 0, 0]} />
</BarChart>
```

**Pie Chart — Category Distribution:**
```javascript
const COLORS = Object.values(chartColors).slice(2, 7);
<PieChart>
  <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
  </Pie>
  <Tooltip /><Legend verticalAlign="bottom" />
</PieChart>
```

**Area Chart — Points Growth:**
```javascript
<AreaChart data={data}>
  <defs>
    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area type="monotone" dataKey="totalPoints" stroke={chartColors.primary} fill="url(#colorPoints)" />
</AreaChart>
```

**Radar Chart — Team Comparison:**
```javascript
<RadarChart data={teamData}>
  <PolarGrid /><PolarAngleAxis dataKey="metric" />
  <Radar name="Team A" dataKey="teamA" stroke={chartColors.chart1} fill={chartColors.chart1} fillOpacity={0.3} />
  <Radar name="Team B" dataKey="teamB" stroke={chartColors.chart2} fill={chartColors.chart2} fillOpacity={0.3} />
  <Legend />
</RadarChart>
```

### Custom Tooltip

```javascript
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Card className="p-3 shadow-lg">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm">{entry.name}: <strong>{entry.value}</strong></span>
        </div>
      ))}
    </Card>
  );
};
```

### Loading & Empty States

```javascript
// Loading
if (isLoading) return <Card className="p-6"><Skeleton className="h-6 w-48 mb-4" /><Skeleton className="h-[300px] w-full" /></Card>;

// Empty
if (!data?.length) return (
  <Card className="p-6">
    <div className="flex flex-col items-center justify-center h-[300px]">
      <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold">No Data Available</h3>
    </div>
  </Card>
);
```

### Performance

```javascript
// Lazy load chart components
const EngagementChart = lazy(() => import('@/components/charts/EngagementChart'));

// Memoize chart data
const chartData = useMemo(() => processDataForChart(rawData), [rawData]);
```

### Accessibility

```javascript
<ResponsiveContainer aria-label="Engagement trend line chart" width="100%" height={300}>
  <LineChart data={data}>...</LineChart>
</ResponsiveContainer>
// Also provide a sr-only text summary for screen readers
```

---

## 21. PWA Implementation Specialist

> **Purpose:** Implements Progressive Web App features including service workers, offline support, installability, and push notifications for Interact's mobile-first design.

**Status:** Not yet implemented — roadmap Q2 2026.

### PWA Core Requirements

- [ ] HTTPS
- [ ] Web App Manifest (`public/manifest.json`)
- [ ] Service Worker
- [ ] Responsive design ✅ (already done)
- [ ] Offline fallback page

### Web App Manifest

```json
// public/manifest.json
{
  "name": "Interact - Employee Engagement Platform",
  "short_name": "Interact",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    { "name": "Dashboard", "url": "/dashboard" },
    { "name": "Activities", "url": "/activities" }
  ],
  "categories": ["productivity", "social"]
}
```

Link in `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Interact">
<meta name="theme-color" content="#3b82f6">
```

### Vite PWA Plugin (Recommended)

```bash
npm install -D vite-plugin-pwa
```

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    runtimeCaching: [
      { urlPattern: /\.cloudinary\.com\//, handler: 'CacheFirst', options: { cacheName: 'images', expiration: { maxAgeSeconds: 60*60*24*30 } } },
      { urlPattern: /base44\.app\/api\//, handler: 'NetworkFirst', options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 } },
    ],
    navigateFallback: '/index.html',
  },
})
```

### Online/Offline Hook

```javascript
// src/hooks/useOnlineStatus.js
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);
  return isOnline;
}
```

### Install Prompt Component

```javascript
// src/components/pwa/InstallPrompt.jsx
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
  }, []);
  
  if (!deferredPrompt) return null;
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 p-4 shadow-lg z-50">
      <h3 className="font-semibold mb-2">Install Interact</h3>
      <p className="text-sm text-muted-foreground mb-4">Install for offline access and quick launch.</p>
      <div className="flex gap-2">
        <Button onClick={async () => { deferredPrompt.prompt(); setDeferredPrompt(null); }} size="sm" className="flex-1">Install</Button>
        <Button onClick={() => setDeferredPrompt(null)} variant="outline" size="sm">Not Now</Button>
      </div>
    </Card>
  );
}
```

### Push Notifications

```javascript
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted' || (await Notification.requestPermission()) === 'granted';
}

export function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') new Notification(title, { icon: '/icons/icon-192x192.png', ...options });
}
```

### Native App Wrapping

- **Android (TWA):** Use `@bubblewrap/cli` to generate a Trusted Web Activity APK
- **iOS:** Use `@capacitor/ios` — `npx cap add ios` then build in Xcode

### PWA Testing

1. Lighthouse PWA audit (target: 100)
2. Test offline mode in Chrome DevTools → Network → Offline
3. Verify manifest at `chrome://flags/#bypass-app-banner-engagement-checks`
4. Test install prompt on mobile Chrome

---

## Quick Reference

### Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build locally
npm run lint         # Check ESLint
npm run lint:fix     # Auto-fix ESLint
npm test             # Run tests (watch)
npm run test:run     # Run tests (single pass)
npm run test:coverage  # Coverage report
npm run typecheck    # TypeScript/JSConfig check
npm audit            # Security vulnerability check
```

### Key File Locations

| File | Purpose |
|------|---------|
| `src/App.jsx` | Router configuration |
| `src/main.jsx` | App entry point, providers |
| `src/Layout.jsx` | App layout wrapper |
| `src/api/base44Client.js` | Base44 API client |
| `src/lib/AuthContext.jsx` | Authentication context |
| `src/lib/query-client.js` | TanStack Query client config |
| `src/lib/utils.js` | Utilities including `cn()` |
| `src/lib/imageUtils.js` | Image optimization helper |
| `src/lib/integrationsRegistry.js` | Integration registry |
| `src/pages.config.js` | Lazy-loaded pages configuration |
| `functions/` | Backend serverless functions |
| `eslint.config.js` | ESLint configuration |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind theme configuration |
| `.github/workflows/ci.yml` | CI/CD pipeline |

### Entity Reference (Base44)

`Activity` · `Event` · `Participation` · `UserPoints` · `PointsTransaction` · `PointsRule` · `Badge` · `UserBadge` · `BadgeCriteria` · `Leaderboard` · `LeaderboardEntry` · `Challenge` · `ChallengeParticipant` · `ChallengeProgress` · `Reward` · `UserReward` · `Team` · `TeamMember` · `Notification` · `LearningPath` · `UserIntegration` · `IntegrationLog` · `AICache` · `AIUsageLog`

### Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_BASE44_APP_ID` | Frontend | Base44 app identifier |
| `VITE_BASE44_BACKEND_URL` | Frontend | Base44 backend URL |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google OAuth |
| `VITE_GOOGLE_MAPS_API_KEY` | Frontend | Google Maps |
| `OPENAI_API_KEY` | Backend only | OpenAI GPT-4 |
| `ANTHROPIC_API_KEY` | Backend only | Claude 3 |
| `GOOGLE_AI_API_KEY` | Backend only | Gemini Pro |
| `SLACK_BOT_TOKEN` | Backend only | Slack integration |
| `CLOUDINARY_URL` | Backend only | Media storage |

---

**Document Owner:** Interact Engineering Team  
**Last Updated:** March 14, 2026  
**Source Files:** `.github/agents/*.agent.md` (21 individual agent definitions)  
**Next Review:** June 2026
