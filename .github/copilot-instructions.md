# GitHub Copilot Instructions - Interact Platform

## Project Overview
Interact is an enterprise-grade employee engagement platform built with React 18, Vite 6, and the Base44 SDK. The platform combines gamification, AI-powered personalization, and team activity management to improve workplace engagement.

**Version:** 0.0.0 (Active Development)  
**Status:** Transitioning from MVP to Production-Ready  

## Technology Stack

### Frontend
- **Framework:** React 18.2.0 (functional components, hooks)
- **Build Tool:** Vite 6.1.0
- **Routing:** React Router DOM 6.26.0
- **State Management:** React Context API + TanStack Query 5.84.1
- **Styling:** TailwindCSS 3.4.17 + Radix UI components
- **Forms:** React Hook Form 7.54.2 + Zod 3.24.2 validation
- **Animations:** Framer Motion 11.16.4
- **Icons:** Lucide React

### Backend
- **Framework:** Base44 SDK 0.8.3 (serverless TypeScript functions)
- **AI Services:** OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Storage:** Cloudinary (media), Base44 managed database

### Development
- **Language:** JavaScript (JSX) - **Migrating to TypeScript Q2-Q3 2025**
- **Testing:** **In Progress** - Vitest + React Testing Library + Playwright
- **Linting:** ESLint 9.19.0 + eslint-plugin-react-hooks
- **Package Manager:** npm

## Current Priorities (Q1 2025)
1. ✅ Fix security vulnerabilities (8 vulnerabilities identified)
2. ✅ Establish testing infrastructure (0% → 30% coverage)
3. ✅ React Hooks violations (2 critical issues)
4. 🔄 TypeScript migration begins Q2 2025
5. 🔄 PWA implementation Q2 2025

## Coding Standards

### File Organization
```
src/
├── pages/           # 47 application pages (route components)
├── components/      # 42+ component categories
│   ├── ui/          # Shadcn/Radix UI components
│   ├── common/      # Shared components
│   ├── activities/  # Activity-related components
│   ├── gamification/# Gamification components
│   └── ...
├── hooks/           # Custom React hooks
├── lib/             # Utilities and libraries
├── api/             # API client configuration
├── contexts/        # React Context providers
└── assets/          # Static assets
```

### Component Patterns
```javascript
// Prefer functional components with hooks
import { useState, useEffect } from 'react';

export const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);
  
  // Effects at the top
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### React Hooks Rules (CRITICAL)
- ✅ **ALWAYS** call hooks at the top level
- ❌ **NEVER** call hooks conditionally or in loops
- ✅ Use custom hooks for shared logic
- ✅ Follow hooks dependency array rules

### Naming Conventions
- **Components:** PascalCase (e.g., `ActivityCard.jsx`)
- **Hooks:** camelCase with "use" prefix (e.g., `useActivityData.js`)
- **Utilities:** camelCase (e.g., `formatDate.js`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Files:** kebab-case for multi-word files (e.g., `user-profile.jsx`)

### Styling Guidelines
- Use TailwindCSS utility classes
- Leverage Radix UI primitives for accessible components
- Use `cn()` helper from `lib/utils.js` for conditional classes
- Prefer composition over deep nesting
- Mobile-first responsive design (smallest breakpoint first)

### State Management
- **Local State:** `useState` for component-specific state
- **Global State:** Context API for app-wide state (auth, theme, etc.)
- **Server State:** TanStack Query for API data fetching and caching
- **Form State:** React Hook Form for complex forms

### API Integration
- Use TanStack Query for data fetching
- Implement proper error handling
- Show loading states
- Cache aggressively where appropriate
- Handle offline scenarios gracefully

### Testing (NEW - Q1 2025)
- Write tests for all new utilities and hooks
- Use AAA pattern (Arrange, Act, Assert)
- Test user interactions, not implementation details
- Aim for 80% coverage on new code
- Run tests before committing: `npm test`

### TypeScript (Starting Q2 2025)
- Use strict mode
- Define interfaces for all props and API responses
- Avoid `any` type (use `unknown` if needed)
- Export types alongside components
- Document complex types with JSDoc

### Security
- Never commit API keys or secrets
- Sanitize all user inputs (use DOMPurify where needed)
- Validate forms with Zod schemas
- Follow OWASP Top 10 guidelines
- Use helmet and security headers

### Accessibility
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA)

### Performance
- Lazy load pages and heavy components
- Optimize images (WebP, lazy loading)
- Use React.memo for expensive re-renders
- Implement code splitting
- Monitor bundle size

## Common Patterns

### API Data Fetching
```javascript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Form with Validation
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### Error Handling
```javascript
try {
  const result = await api.call();
  // Success handling
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('Something went wrong. Please try again.');
  // Report to monitoring service
}
```

## Documentation References
- **CODEBASE_AUDIT.md** - Security vulnerabilities and code quality issues
- **PRD.md** - Product requirements and technical architecture
- **FEATURE_ROADMAP.md** - 18-month roadmap with 15 features
- **DOCUMENTATION_SUMMARY.md** - Overview of all documentation
- **RECOMMENDATIONS.md** - Best practices and repository recommendations

## Git Workflow
- Branch naming: `feature/feature-name` or `fix/bug-name`
- Commit messages: Conventional Commits format
  - `feat: add user authentication`
  - `fix: resolve memory leak in ActivityCard`
  - `test: add tests for useActivityData hook`
  - `docs: update API documentation`
- Keep commits atomic and focused
- Run `npm run lint` before committing

## When Working on Code

### Before Making Changes
1. Check CODEBASE_AUDIT.md for known issues in the area
2. Review PRD.md for requirements and constraints
3. Check FEATURE_ROADMAP.md for related features
4. Ensure tests exist (or create them)

### While Coding
- Follow the patterns used in existing similar components
- Use existing UI components from `src/components/ui/`
- Reuse custom hooks from `src/hooks/`
- Maintain consistent error handling
- Add comments for complex logic only

### After Coding
- Run linter: `npm run lint`
- Run tests: `npm test` (when available)
- Test in browser manually
- Check for React Hooks violations
- Verify accessibility

## Integration Points
- **Base44 Functions:** Backend lives in `functions/` directory
- **AI Services:** OpenAI, Claude, Gemini integrations exist
- **Third-party:** Google Calendar, Slack, Teams, Notion, etc.

## Known Issues to Avoid
- ❌ Do NOT call hooks conditionally (causes runtime errors)
- ❌ Do NOT use moment.js (deprecated, use date-fns)
- ❌ Do NOT create security vulnerabilities (check npm audit)
- ❌ Do NOT skip testing for new features
- ❌ Do NOT commit without running linter

## Questions or Clarifications
For ambiguous requirements, refer to:
1. PRD.md (product requirements)
2. FEATURE_ROADMAP.md (implementation details)
3. Existing similar implementations in codebase
4. Team lead or product owner

## Current Phase
**Q1 2025 Focus:** Security hardening, testing infrastructure, documentation
