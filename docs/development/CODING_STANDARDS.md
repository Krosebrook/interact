# Coding Standards

**Project:** Interact — Employee Engagement & Gamification Platform
**Last Updated:** March 8, 2026
**Version:** 1.0.0
**Audience:** All developers (frontend, backend, full-stack)

---

## Table of Contents

1. [Naming Conventions](#1-naming-conventions)
2. [Folder and File Structure](#2-folder-and-file-structure)
3. [Component Patterns](#3-component-patterns)
4. [React Hooks Rules](#4-react-hooks-rules)
5. [State Management](#5-state-management)
6. [Styling Guidelines](#6-styling-guidelines)
7. [Error Handling](#7-error-handling)
8. [Testing Standards](#8-testing-standards)
9. [Security Rules](#9-security-rules)
10. [Documentation in Code](#10-documentation-in-code)
11. [Code Review Checklist](#11-code-review-checklist)
12. [Branching Strategy](#12-branching-strategy)
13. [Commit Message Format](#13-commit-message-format)

---

## 1. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React components | PascalCase | `ActivityCard.jsx`, `UserProfile.jsx` |
| Component files | PascalCase | `ActivityCard.jsx` |
| Multi-word component files | PascalCase (no separator) | `UserProfileCard.jsx` |
| Custom hooks | camelCase with `use` prefix | `useActivityData.js`, `useMobile.js` |
| Utility/helper functions | camelCase | `formatDate.js`, `imageUtils.js` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| Context files | PascalCase with `Context` suffix | `AuthContext.jsx`, `ThemeContext.jsx` |
| Page components | PascalCase | `Dashboard.jsx`, `ActivityDetail.jsx` |
| CSS class names | Tailwind utilities; custom classes in kebab-case | `user-avatar`, `card-header` |
| Environment variables | UPPER_SNAKE_CASE with `VITE_` prefix (frontend) | `VITE_BASE44_APP_ID` |
| Backend env vars | UPPER_SNAKE_CASE (no prefix) | `OPENAI_API_KEY` |
| TypeScript interfaces | PascalCase with `I` prefix (optional) | `User`, `ActivityItem`, `IAuthConfig` |
| TypeScript types | PascalCase | `ButtonVariant`, `ThemeMode` |
| Boolean variables | camelCase with `is`/`has`/`can`/`should` prefix | `isLoading`, `hasError`, `canEdit` |
| Event handlers | camelCase with `handle` prefix | `handleSubmit`, `handleCardClick` |

---

## 2. Folder and File Structure

```
src/
├── pages/              # Route-level components (one file per route)
├── components/         # Reusable UI components
│   ├── ui/             # Primitive UI components (Shadcn/Radix)
│   ├── common/         # Shared layout and utility components
│   ├── activities/     # Activity domain components
│   ├── gamification/   # Gamification domain components
│   └── <domain>/       # Other domain-specific components
├── hooks/              # Custom React hooks (use*.js)
├── lib/                # Utility functions and libraries (no React)
├── api/                # API client and Base44 SDK config
├── contexts/           # React Context providers
├── assets/             # Static assets (images, fonts)
└── test/               # Test utilities, mocks, setup

functions/              # Base44 serverless backend functions (TypeScript)
docs/                   # Project documentation
ADR/                    # Architecture Decision Records
.github/                # GitHub config (workflows, templates)
```

### File placement rules

- **One component per file.** Do not define multiple exported components in a single file.
- **Co-locate styles** — TailwindCSS classes go directly in the JSX; avoid separate CSS files unless necessary.
- **Co-locate tests** — Test files (`*.test.js` / `*.test.jsx`) may live next to the source file or under `src/test/`.
- **No circular imports** — If A imports B and B imports A, extract shared logic to a third module.

---

## 3. Component Patterns

### Standard functional component structure

```jsx
// 1. Imports — React first, then libraries, then local
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useActivityData } from '@/hooks/useActivityData';

// 2. Component definition — named export preferred
export const ActivityCard = ({ activityId, className, onSelect }) => {
  // 3. Hooks — all at the top, unconditionally
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useActivityData(activityId);

  // 4. Derived state / memos
  const displayTitle = data?.title ?? 'Untitled';

  // 5. Effects
  useEffect(() => {
    // side effects
  }, [activityId]);

  // 6. Event handlers
  const handleSelect = () => {
    onSelect?.(activityId);
  };

  // 7. Early returns (loading / error states) — AFTER all hooks
  if (isLoading) return <div>Loading...</div>;

  // 8. Render
  return (
    <div className={cn('rounded-md border p-4', className)}>
      <h3>{displayTitle}</h3>
      <Button onClick={handleSelect}>Select</Button>
    </div>
  );
};
```

### Key rules

- ✅ All hooks must be called **before** any early `return`.
- ✅ Use named exports; default exports only for page components (required by React Router lazy-loading).
- ✅ Use `cn()` from `@/lib/utils` for conditional class composition.
- ✅ Props destructuring in function signature; use `?` for optional props and `??` for defaults.
- ❌ Do not use class components.
- ❌ Do not use `React.FC` type annotation (it is implicit with JSX/TSX).

---

## 4. React Hooks Rules

These are **non-negotiable**. Violations cause runtime crashes.

| Rule | Correct | Incorrect |
|---|---|---|
| Call hooks at the top level | `const [x, setX] = useState(0)` at component root | `if (condition) { useState(0) }` |
| No hooks inside loops | Move loop logic into a custom hook | `for (let i ...) { useEffect(...) }` |
| No hooks inside conditions | Move conditional logic inside the hook | `if (flag) { useQuery(...) }` |
| No hooks inside nested functions | Move the hook to the component level | `const fn = () => { useState(0) }` |
| No hooks after early returns | Place all hooks before any `return` | Hook called after `if (loading) return <Spinner/>` |

**ESLint enforcement:** `eslint-plugin-react-hooks` is configured and enforces `rules-of-hooks` and `exhaustive-deps`. Fix all violations — do not disable these rules.

---

## 5. State Management

| Use case | Tool | Guidance |
|---|---|---|
| Local UI state (single component) | `useState` | Preferred for simple toggle/form state |
| Complex local state (multiple fields) | `useReducer` | Use when state transitions are logic-heavy |
| Shared state (2–3 nearby components) | Lift state up / prop drilling | Keep it simple |
| Global app state (auth, theme) | React Context API | See `src/contexts/` |
| Server/async state | TanStack Query (`useQuery`, `useMutation`) | Handles caching, loading, errors automatically |
| Form state | React Hook Form + Zod | Use for all forms; see form patterns in `USAGE-EXAMPLES.md` |

**Do not** use TanStack Query as a general state store — it is for server state only. **Do not** use external state libraries (Redux, Zustand, Jotai) unless approved via ADR.

---

## 6. Styling Guidelines

- **Primary approach:** TailwindCSS utility classes directly in JSX.
- **Conditional classes:** Always use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`).
- **Component variants:** Use `class-variance-authority` (CVA) for variant props on reusable components.
- **Responsive design:** Mobile-first — write base classes for small screens, add `sm:`, `md:`, `lg:` for larger.
- **Dark mode:** Use `dark:` variant classes; do not hardcode colors.
- **Custom CSS:** Avoid custom CSS files. If unavoidable, scope to a CSS Module (`.module.css`).
- **Animation:** Use Framer Motion for complex animations. Use Tailwind `transition-*` and `animate-*` for simple ones.

```jsx
// ✅ Correct
<div className={cn(
  'rounded-lg border p-4 transition-shadow hover:shadow-md',
  isActive && 'bg-primary text-primary-foreground',
  className
)}>
```

---

## 7. Error Handling

### Frontend

```jsx
// Async operations — always catch errors
try {
  const result = await someApiCall();
  toast.success('Operation completed');
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('Something went wrong. Please try again.');
}

// TanStack Query — use the onError callback or error boundary
const { data, error } = useQuery({ queryKey: ['key'], queryFn: fetchData });
if (error) return <ErrorMessage error={error} />;
```

### Backend (Base44 functions)

```typescript
// Always return structured error responses
try {
  // operation
  return { success: true, data: result };
} catch (error) {
  console.error('[FunctionName] Error:', error);
  return { success: false, error: error.message, code: 'INTERNAL_ERROR' };
}
```

### Rules

- ✅ Every async operation must have error handling.
- ✅ Use `toast` (sonner or react-hot-toast) for user-facing errors.
- ✅ Log errors with `console.error` and a descriptive prefix.
- ❌ Do not swallow errors silently.
- ❌ Do not expose raw error stack traces to end users.

---

## 8. Testing Standards

| Standard | Target | Notes |
|---|---|---|
| Unit test coverage | ≥ 30% Q1 2026 → ≥ 80% Q3 2026 | See `docs/guides/TESTING.md` |
| Test runner | Vitest 4.x | Configured in `vitest.config.js` |
| Component testing | React Testing Library | Test behavior, not implementation |
| Test file naming | `<filename>.test.js` or `<filename>.test.jsx` | Co-locate or place in `src/test/` |
| Assertion style | `@testing-library/jest-dom` matchers | `toBeInTheDocument()`, `toHaveValue()` |
| AAA pattern | Required | Arrange, Act, Assert — clearly separated |
| Mock data | Use `src/test/mock-data.js` generators | Do not inline large data objects |
| No snapshot tests | Avoided | Snapshots are brittle and mask intent |

```jsx
// Example unit test structure
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityCard } from './ActivityCard';

describe('ActivityCard', () => {
  it('displays the activity title', () => {
    // Arrange
    render(<ActivityCard title="Team Lunch" />);

    // Act (none — testing initial render)

    // Assert
    expect(screen.getByText('Team Lunch')).toBeInTheDocument();
  });

  it('calls onSelect when the select button is clicked', async () => {
    // Arrange
    const handleSelect = vi.fn();
    render(<ActivityCard title="Team Lunch" onSelect={handleSelect} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /select/i }));

    // Assert
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});
```

---

## 9. Security Rules

| Rule | Description |
|---|---|
| No secrets in source code | Never commit API keys, tokens, or credentials. Use environment variables. |
| No secrets in logs | Do not log request headers that may contain auth tokens. |
| Sanitize user input | Use `DOMPurify` for any HTML rendered from user content. |
| Validate all forms | Use Zod schemas for form validation; never trust client-side input on the server. |
| HTTPS only | All API calls must use HTTPS; reject `http://` in production. |
| Content Security Policy | Follow headers defined in `docs/security/SECURITY_HEADERS.md`. |
| Dependency audit | Run `npm audit` before merging. Zero critical/high vulnerabilities. |
| OWASP Top 10 | Review changes for XSS, injection, broken auth risks. |
| Principle of least privilege | Backend functions should request only the permissions they need. |

---

## 10. Documentation in Code

- **JSDoc required for:** exported utility functions, custom hooks, context providers, and complex algorithms.
- **JSDoc optional for:** internal helpers that are short and self-explanatory.
- **Inline comments:** Use for non-obvious logic only. Do not comment what the code literally does.
- **TODO comments:** Format as `// TODO(username): description` and link to a GitHub issue.

```js
/**
 * Formats a duration in seconds into a human-readable "Xh Ym" string.
 * Returns "—" for null/undefined input.
 *
 * @param {number|null} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  if (seconds == null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
```

---

## 11. Code Review Checklist

Every pull request reviewer must verify:

```
Code Quality
- [ ] Code follows naming conventions (section 1)
- [ ] No unused imports or variables (ESLint enforces)
- [ ] No console.log left in production paths
- [ ] Complex logic has explanatory comments

React / Frontend
- [ ] All hooks called at top level, before any return
- [ ] No prop drilling more than 2 levels (use Context or composition)
- [ ] Loading and error states handled for all async operations
- [ ] Accessible: interactive elements have ARIA labels or clear text labels
- [ ] Mobile-responsive: tested at 320px, 768px, 1024px widths

Security
- [ ] No credentials, keys, or PII in code or test data
- [ ] User input sanitized where rendered as HTML
- [ ] `npm audit` clean (no new critical/high vulnerabilities)

Testing
- [ ] New code has tests (or PR explains why tests are not applicable)
- [ ] All existing tests pass (`npm run test:run`)
- [ ] Coverage has not decreased

Documentation
- [ ] CHANGELOG.md updated for user-facing changes
- [ ] Relevant docs updated (API contracts, env vars, architecture, etc.)
- [ ] "Last Updated" date refreshed in any modified doc

Operations
- [ ] No hard-coded environment-specific values
- [ ] Feature flags or env vars used for environment-specific behavior
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
```

---

## 12. Branching Strategy

| Branch | Purpose | Protected? |
|---|---|---|
| `main` | Production-ready code; deployed to Vercel | ✅ Yes |
| `develop` | Integration branch; staging deploys | ✅ Yes |
| `feature/<short-description>` | New features | No |
| `fix/<short-description>` | Bug fixes | No |
| `hotfix/<short-description>` | Urgent production fixes | No |
| `docs/<short-description>` | Documentation-only changes | No |
| `chore/<short-description>` | Dependency updates, tooling | No |

### Rules

- Branch from `develop` for features and fixes; branch from `main` only for hotfixes.
- Hotfix branches must be merged into **both** `main` and `develop`.
- Delete branches after merging.
- Squash-merge feature branches to keep `main`/`develop` history clean.
- PRs to `main` require at least **one** approving review and passing CI.

---

## 13. Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[Optional body — explains WHY, not WHAT]

[Optional footer — references issues: Closes #123]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature for the user |
| `fix` | Bug fix for the user |
| `docs` | Documentation only |
| `style` | Formatting (no logic change) |
| `refactor` | Code change that is neither a feat nor a fix |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency update, tooling |
| `perf` | Performance improvement |
| `ci` | CI configuration changes |
| `revert` | Revert a previous commit |

### Examples

```
feat(gamification): add badge unlock animation
fix(auth): handle token expiry on page refresh
docs(onboarding): add environment setup checklist
chore(deps): bump vite from 6.0.0 to 6.1.0
test(utils): add tests for formatDuration
```
