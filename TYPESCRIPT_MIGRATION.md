# TypeScript Migration Guide

**Project:** Interact Platform  
**Date:** February 9, 2026  
**Status:** Active Migration  
**Timeline:** 12 weeks (Q1-Q2 2026)  

---

## Overview

This guide provides step-by-step instructions for migrating the Interact codebase from JavaScript to TypeScript. The migration follows an incremental, bottom-up approach to minimize risk and maintain production stability.

**Migration Philosophy:**
- ✅ Incremental (file-by-file, not big-bang)
- ✅ Bottom-up (utilities → hooks → components → pages)
- ✅ Type-first (define types before converting)
- ✅ Safe (dual JS/TS support during transition)
- ✅ Tested (verify each conversion)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Configuration](#configuration)
3. [Migration Phases](#migration-phases)
4. [Conversion Patterns](#conversion-patterns)
5. [Common Pitfalls](#common-pitfalls)
6. [Best Practices](#best-practices)
7. [Testing Strategy](#testing-strategy)
8. [Progress Tracking](#progress-tracking)

---

## Prerequisites

### Tools Required

```bash
# Verify Node.js version
node --version  # Should be v20+

# Verify TypeScript installation
npx tsc --version  # Should be v5.8+

# Install project dependencies
npm install
```

### Knowledge Requirements

- Understanding of TypeScript basics (types, interfaces, generics)
- Familiarity with React and hooks
- Experience with the Interact codebase

### Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## Configuration

### TypeScript Configuration Files

Three configuration files support our migration strategy:

#### 1. tsconfig.json (Current - Relaxed Mode)

Used during migration phase. Allows both JS and TS files.

```json
{
  "compilerOptions": {
    "strict": false,  // Relaxed for migration
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx"
  ]
}
```

#### 2. tsconfig.strict.json (Future - Strict Mode)

Will be renamed to `tsconfig.json` after migration complete.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

#### 3. tsconfig.node.json (Build Tools)

For Vite, ESLint, and other build tools.

---

## Migration Phases

### Phase 0: Setup (Week 1) ✅ COMPLETE

**Duration:** 1 week  
**Files:** Configuration files only  

**Tasks:**
- [x] Create TypeScript configuration files
- [x] Update package.json scripts
- [x] Add TypeScript to CI/CD pipeline
- [x] Document migration strategy

**Verification:**
```bash
npm run typecheck  # Should run without crashing
```

---

### Phase 1: Type Definitions (Weeks 1-2)

**Duration:** 2 weeks  
**Target:** 0 files → Type definitions  
**Priority:** HIGH  

**Objective:** Create comprehensive type definitions for all data structures.

**Tasks:**
1. Create `src/types/index.ts` for central type exports
2. Define core entity types (User, Activity, Team, etc.)
3. Define API response types
4. Define component prop types
5. Document type patterns

**Example:**

```typescript
// src/types/index.ts

/* ============================================
 * USER TYPES
 * ============================================ */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'facilitator' | 'team_leader' | 'participant';

export interface UserProfile extends User {
  bio?: string;
  department?: string;
  location?: string;
  points: number;
  badges: Badge[];
}

/* ============================================
 * ACTIVITY TYPES
 * ============================================ */

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  points: number;
  status: ActivityStatus;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ActivityCategory =
  | 'team_building'
  | 'wellness'
  | 'learning'
  | 'social'
  | 'volunteer'
  | 'other';

export type ActivityStatus = 'draft' | 'published' | 'completed' | 'archived';

/* ============================================
 * API TYPES
 * ============================================ */

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

/* ============================================
 * COMPONENT TYPES
 * ============================================ */

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
```

**Verification:**
```bash
# Types file compiles without errors
npx tsc src/types/index.ts --noEmit
```

**Deliverable:** `src/types/index.ts` with all core types defined

---

### Phase 2: Utilities & Hooks (Weeks 3-4)

**Duration:** 2 weeks  
**Target:** 25% conversion (~140 files)  
**Priority:** HIGH  

**Objective:** Convert small, isolated utility functions and custom hooks.

**Files to Convert:**

1. **Utilities (src/lib/, src/utils/)**
   - Date formatting functions
   - String manipulation
   - Number formatting
   - Validation helpers
   - Constants files

2. **Custom Hooks (src/hooks/)**
   - useAuth
   - useActivity
   - useLocalStorage
   - useDebounce
   - useIntersectionObserver

**Conversion Process:**

#### Step 1: Rename File

```bash
# Rename .js to .ts or .jsx to .tsx
mv src/lib/formatDate.js src/lib/formatDate.ts
```

#### Step 2: Add Types

```typescript
// Before: src/lib/formatDate.js
export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

// After: src/lib/formatDate.ts
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Add JSDoc for additional context
/**
 * Formats a date into a human-readable string
 * @param date - ISO date string or Date object
 * @returns Formatted date string (e.g., "February 9, 2026")
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
```

#### Step 3: Add Tests

```typescript
// src/lib/__tests__/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('should format ISO date string', () => {
    const result = formatDate('2026-02-09');
    expect(result).toBe('February 9, 2026');
  });

  it('should format Date object', () => {
    const date = new Date('2026-02-09');
    const result = formatDate(date);
    expect(result).toBe('February 9, 2026');
  });
});
```

#### Step 4: Run Type Check

```bash
npm run typecheck
```

#### Step 5: Run Tests

```bash
npm test src/lib/formatDate.test.ts
```

#### Step 6: Update Imports (if needed)

```typescript
// Other files importing this function work automatically
// TypeScript can import from .ts files even if import path uses .js
import { formatDate } from '@/lib/formatDate';  // Still works!
```

**Custom Hook Example:**

```typescript
// Before: src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { base44 } from '@base44/sdk';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { user, loading };
}

// After: src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { base44 } from '@base44/sdk';
import type { User } from '@/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        const currentUser = await base44.auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  return { user, loading };
}
```

**Progress Tracking:**

```bash
# Count TypeScript files in utilities
find src/lib src/utils -name "*.ts" | wc -l

# Count remaining JavaScript files
find src/lib src/utils -name "*.js" | wc -l

# Calculate percentage
echo "scale=2; (TS / (TS + JS)) * 100" | bc
```

**Deliverable:** 25% of codebase converted to TypeScript

---

### Phase 3: Components (Weeks 5-8)

**Duration:** 4 weeks  
**Target:** 50% conversion (~280 files)  
**Priority:** HIGH  

**Objective:** Convert React components to TypeScript.

**Component Conversion Pattern:**

```typescript
// Before: src/components/ActivityCard.jsx
import { useState } from 'react';

export const ActivityCard = ({ activity, onJoin }) => {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      await onJoin(activity.id);
    } catch (error) {
      console.error('Failed to join activity', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="activity-card">
      <h3>{activity.title}</h3>
      <p>{activity.description}</p>
      <button onClick={handleJoin} disabled={loading}>
        {loading ? 'Joining...' : 'Join Activity'}
      </button>
    </div>
  );
};

// After: src/components/ActivityCard.tsx
import { useState } from 'react';
import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  onJoin: (activityId: string) => Promise<void>;
  className?: string;
}

export const ActivityCard = ({
  activity,
  onJoin,
  className
}: ActivityCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleJoin = async (): Promise<void> => {
    setLoading(true);
    try {
      await onJoin(activity.id);
    } catch (error) {
      console.error('Failed to join activity', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`activity-card ${className || ''}`}>
      <h3>{activity.title}</h3>
      <p>{activity.description}</p>
      <button onClick={handleJoin} disabled={loading}>
        {loading ? 'Joining...' : 'Join Activity'}
      </button>
    </div>
  );
};
```

**Component with Children:**

```typescript
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export const Card = ({ children, title, className }: CardProps) => {
  return (
    <div className={`card ${className || ''}`}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};
```

**Component with Refs:**

```typescript
import { forwardRef } from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange, placeholder }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }
);

Input.displayName = 'Input';
```

**Deliverable:** 50% of codebase converted to TypeScript

---

### Phase 4: Pages & Routes (Weeks 9-10)

**Duration:** 2 weeks  
**Target:** 75% conversion (~420 files)  
**Priority:** MEDIUM  

**Objective:** Convert page components and route handling.

**Page Component Pattern:**

```typescript
// src/pages/ActivityDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Activity } from '@/types';

interface ActivityDetailParams {
  id: string;
}

export const ActivityDetail = () => {
  const { id } = useParams<ActivityDetailParams>();
  const navigate = useNavigate();

  const { data: activity, isLoading, error } = useQuery<Activity>({
    queryKey: ['activity', id],
    queryFn: () => fetchActivity(id!),
    enabled: !!id
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading activity</div>;
  if (!activity) return <div>Activity not found</div>;

  return (
    <div>
      <h1>{activity.title}</h1>
      <p>{activity.description}</p>
      <button onClick={() => navigate('/activities')}>
        Back to Activities
      </button>
    </div>
  );
};
```

**Deliverable:** 75% of codebase converted to TypeScript

---

### Phase 5: Complete Migration (Weeks 11-12)

**Duration:** 2 weeks  
**Target:** 100% conversion  
**Priority:** HIGH  

**Objective:** Complete TypeScript migration.

**Tasks:**
1. Convert remaining files
2. Remove jsconfig.json
3. Switch to strict mode (tsconfig.strict.json → tsconfig.json)
4. Fix all type errors
5. Remove any `@ts-ignore` comments
6. Final audit

**Verification:**

```bash
# No JavaScript files in src/
find src -name "*.js" -o -name "*.jsx" | wc -l
# Expected: 0

# Type checking passes
npm run typecheck
# Expected: 0 errors

# Build succeeds
npm run build
# Expected: Success

# All tests pass
npm test
# Expected: All pass
```

**Final Checklist:**
- [ ] All files converted to TypeScript
- [ ] jsconfig.json removed
- [ ] Strict mode enabled
- [ ] All type errors fixed
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Team trained on TypeScript

**Deliverable:** 100% TypeScript codebase

---

## Conversion Patterns

### Pattern 1: Event Handlers

```typescript
// Correct
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget.value);
};

// Common event types
React.MouseEvent<HTMLElement>
React.ChangeEvent<HTMLInputElement>
React.FormEvent<HTMLFormElement>
React.KeyboardEvent<HTMLInputElement>
React.FocusEvent<HTMLInputElement>
```

### Pattern 2: State with Complex Types

```typescript
import type { Activity } from '@/types';

// Array state
const [activities, setActivities] = useState<Activity[]>([]);

// Object state
const [user, setUser] = useState<User | null>(null);

// Union type state
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<LoadingState>('idle');
```

### Pattern 3: Async Functions

```typescript
// API function
async function fetchActivities(): Promise<Activity[]> {
  const response = await fetch('/api/activities');
  const data = await response.json();
  return data;
}

// Event handler that's async
const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  event.preventDefault();
  await saveData();
};
```

### Pattern 4: Utility Functions

```typescript
// Generic utility
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

// Usage
const user = { id: '1', name: 'John', email: 'john@example.com' };
const partial = pick(user, ['id', 'name']);
// Type: { id: string; name: string }
```

---

## Common Pitfalls

### Pitfall 1: Using `any`

```typescript
// ❌ Bad - Loses all type safety
const data: any = await fetchData();

// ✅ Good - Define proper type
interface ApiData {
  id: string;
  name: string;
}
const data: ApiData = await fetchData();

// ✅ Good - Use unknown if type is truly unknown
const data: unknown = await fetchData();
if (isApiData(data)) {
  // Type guard narrows to ApiData
  console.log(data.name);
}
```

### Pitfall 2: Ignoring Null/Undefined

```typescript
// ❌ Bad - Assumes user is always defined
function greet(user: User) {
  return `Hello, ${user.name}`;
}

// ✅ Good - Handle null case
function greet(user: User | null) {
  if (!user) return 'Hello, guest';
  return `Hello, ${user.name}`;
}

// ✅ Good - Use optional chaining
function greet(user?: User) {
  return `Hello, ${user?.name || 'guest'}`;
}
```

### Pitfall 3: Incorrect Event Types

```typescript
// ❌ Bad - Generic event type
const handleChange = (event: any) => {
  setValue(event.target.value);
};

// ✅ Good - Specific event type
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

### Pitfall 4: Not Exporting Types

```typescript
// ❌ Bad - Type not exported
interface UserProps {
  user: User;
}

export const UserCard = (props: UserProps) => { /* ... */ };

// ✅ Good - Export type for reuse
export interface UserCardProps {
  user: User;
}

export const UserCard = (props: UserCardProps) => { /* ... */ };
```

---

## Best Practices

### 1. Use Type Inference

```typescript
// TypeScript can infer many types
const name = 'John';  // inferred as string
const age = 30;  // inferred as number

// But be explicit for function returns
function getUser(): User {  // ✅ Explicit return type
  return { id: '1', name: 'John', email: 'john@example.com' };
}
```

### 2. Prefer Interfaces for Objects

```typescript
// Use interface for object shapes
interface User {
  id: string;
  name: string;
}

// Use type for unions, intersections, primitives
type UserRole = 'admin' | 'user';
type UserId = string;
type UserOrNull = User | null;
```

### 3. Use Readonly Where Appropriate

```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// Cannot modify after creation
const config: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

// Error: Cannot assign to 'apiUrl' because it is a read-only property
config.apiUrl = 'https://other.com';
```

### 4. Leverage Type Guards

```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}

// Usage
const data: unknown = await fetchData();
if (isUser(data)) {
  // TypeScript knows data is User here
  console.log(data.name);
}
```

### 5. Document Complex Types

```typescript
/**
 * Represents a user in the system
 * @property id - Unique identifier (UUID v4)
 * @property email - User's email address (validated)
 * @property role - User's role (determines permissions)
 */
interface User {
  id: string;
  email: string;
  role: UserRole;
}
```

---

## Testing Strategy

### Unit Tests for Type Utilities

```typescript
// src/lib/__tests__/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('accepts string', () => {
    const result = formatDate('2026-02-09');
    expect(typeof result).toBe('string');
  });

  it('accepts Date object', () => {
    const result = formatDate(new Date('2026-02-09'));
    expect(typeof result).toBe('string');
  });
});
```

### Component Tests with TypeScript

```typescript
// src/components/__tests__/ActivityCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivityCard } from '../ActivityCard';
import type { Activity } from '@/types';

describe('ActivityCard', () => {
  const mockActivity: Activity = {
    id: '1',
    title: 'Team Lunch',
    description: 'Weekly team lunch',
    category: 'social',
    points: 50,
    status: 'published',
    start_date: '2026-02-10',
    end_date: '2026-02-10',
    created_by: 'user1',
    created_at: '2026-02-01',
    updated_at: '2026-02-01'
  };

  it('renders activity title', () => {
    const onJoin = vi.fn();
    render(<ActivityCard activity={mockActivity} onJoin={onJoin} />);
    
    expect(screen.getByText('Team Lunch')).toBeInTheDocument();
  });

  it('calls onJoin when button clicked', async () => {
    const onJoin = vi.fn().mockResolvedValue(undefined);
    render(<ActivityCard activity={mockActivity} onJoin={onJoin} />);
    
    const button = screen.getByText('Join Activity');
    fireEvent.click(button);
    
    expect(onJoin).toHaveBeenCalledWith('1');
  });
});
```

---

## Progress Tracking

### Automated Tracking Script

```bash
#!/bin/bash
# scripts/typescript-progress.sh

echo "TypeScript Migration Progress"
echo "=============================="
echo ""

# Count TypeScript files
TS_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
echo "TypeScript files: $TS_COUNT"

# Count JavaScript files
JS_COUNT=$(find src -name "*.js" -o -name "*.jsx" | wc -l)
echo "JavaScript files: $JS_COUNT"

# Calculate total and percentage
TOTAL=$((TS_COUNT + JS_COUNT))
PERCENTAGE=$(echo "scale=2; ($TS_COUNT / $TOTAL) * 100" | bc)

echo "Total files: $TOTAL"
echo "Progress: $PERCENTAGE%"
echo ""

# Show breakdown by directory
echo "Breakdown by directory:"
for dir in src/lib src/hooks src/components src/pages; do
  if [ -d "$dir" ]; then
    TS=$(find "$dir" -name "*.ts" -o -name "*.tsx" | wc -l)
    JS=$(find "$dir" -name "*.js" -o -name "*.jsx" | wc -l)
    TOTAL_DIR=$((TS + JS))
    if [ $TOTAL_DIR -gt 0 ]; then
      PERC=$(echo "scale=2; ($TS / $TOTAL_DIR) * 100" | bc)
      echo "  $dir: $PERC% ($TS/$TOTAL_DIR)"
    fi
  fi
done
```

### Run Progress Tracker

```bash
chmod +x scripts/typescript-progress.sh
./scripts/typescript-progress.sh
```

**Expected Output:**
```
TypeScript Migration Progress
==============================

TypeScript files: 140
JavaScript files: 426
Total files: 566
Progress: 24.73%

Breakdown by directory:
  src/lib: 80.00% (40/50)
  src/hooks: 75.00% (15/20)
  src/components: 15.00% (60/400)
  src/pages: 10.64% (5/47)
```

---

## Conclusion

This migration guide provides a structured approach to converting the Interact codebase to TypeScript. Following these patterns and best practices will result in a type-safe codebase that's easier to maintain and refactor.

**Key Takeaways:**
- Migrate incrementally, not all at once
- Define types before converting files
- Test each conversion
- Document complex types
- Use strict mode after migration complete

---

## Related Documents

- [MIGRATION_STRATEGY.md](./MIGRATION_STRATEGY.md) - Overall migration strategy
- [ADR-004: TypeScript Migration](./ADR/004-typescript-migration.md) - Architecture decision record
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Official documentation

---

**Document Owner:** Platform Architecture Team  
**Last Updated:** February 9, 2026  
**Next Review:** Weekly during migration (every Monday)
