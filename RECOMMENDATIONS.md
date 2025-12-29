# Interact Platform Recommendations
**Date:** December 29, 2024  
**Purpose:** Strategic recommendations based on codebase audit, documentation review, and current industry best practices

---

## Executive Summary

This document provides comprehensive recommendations for the Interact employee engagement platform based on:
1. Detailed analysis of existing codebase (CODEBASE_AUDIT.md)
2. Review of Product Requirements Document (PRD.md)
3. Research of 2024-2025 industry best practices
4. Evaluation of relevant open-source repositories
5. GitHub Copilot and AI agent optimization strategies

The recommendations include 6 key repositories to integrate/reference, 5 context-engineered prompts for GitHub Agents, and 1 comprehensive GitHub Copilot prompt for accelerated development.

---

## Part 1: Recommended GitHub Repositories

Based on research of current best practices and the specific needs of the Interact platform, here are 6 repositories that should be integrated or referenced:

### 1. **React 18 Design Patterns and Best Practices (Fourth Edition)**
- **Repository:** https://github.com/PacktPublishing/React-18-Design-Patterns-and-Best-Practices-Fourth-Edition
- **Purpose:** Enterprise-grade React patterns and architecture
- **Integration Priority:** HIGH
- **Why:**
  - Demonstrates modern React 18 concurrent features
  - Shows proper component organization and separation of concerns
  - Includes TypeScript examples (critical for migration)
  - Covers performance optimization patterns
  - Aligns with Interact's need for scalable architecture
- **Recommended Actions:**
  - Study container/presentational component patterns for refactoring
  - Adopt concurrent rendering patterns for analytics dashboards
  - Implement code splitting examples for 47 pages
  - Use error boundary patterns from examples

### 2. **TypeScript React Cheatsheet**
- **Repository:** https://github.com/typescript-cheatsheets/react
- **Purpose:** TypeScript migration guide and best practices
- **Integration Priority:** CRITICAL
- **Why:**
  - Essential reference for Q2-Q3 2025 TypeScript migration
  - Provides type definitions for hooks, context, forms
  - Shows proper prop typing for all 42+ component categories
  - Includes testing with TypeScript guidance
  - Covers advanced patterns (generics, utility types)
- **Recommended Actions:**
  - Create internal wiki based on this cheatsheet
  - Use as reference during gradual TypeScript conversion
  - Train team on patterns before migration begins
  - Establish TypeScript code standards based on recommendations

### 3. **Community Platform (Next.js + Prisma)**
- **Repository:** https://github.com/dir-zip/community
- **Purpose:** Reference for social features and gamification
- **Integration Priority:** MEDIUM-HIGH
- **Why:**
  - Built with Next.js, TypeScript, Prisma - modern stack
  - Includes forum-style interaction patterns
  - Shows social engagement mechanics
  - Demonstrates community building features
  - Aligns with Interact's recognition and social features
- **Recommended Actions:**
  - Study social engagement patterns for peer recognition feature
  - Reference authentication/authorization implementation
  - Learn from community interaction patterns
  - Evaluate forum mechanics for team channels feature

### 4. **HabitTrove - Gamified Habit Tracker**
- **Repository:** https://github.com/dohsimpson/HabitTrove
- **Purpose:** Gamification mechanics reference
- **Integration Priority:** MEDIUM
- **Why:**
  - Implements points, rewards, and progression systems
  - Built with Next.js and TypeScript
  - Shows habit tracking with gamification
  - Provides UI/UX patterns for engagement
  - Relevant to Interact's activity participation tracking
- **Recommended Actions:**
  - Analyze reward system implementation
  - Study progression mechanics for badge system
  - Reference UI components for gamification features
  - Evaluate motivation mechanics for employee engagement

### 5. **Vitest + React Testing Library Examples**
- **Repository:** https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib
- **Purpose:** Testing infrastructure setup
- **Integration Priority:** CRITICAL
- **Why:**
  - Vitest is Vite-native (already using Vite 6)
  - Provides React Testing Library integration examples
  - Shows modern testing patterns
  - Demonstrates component, hook, and integration tests
  - Addresses Interact's 0% test coverage issue
- **Recommended Actions:**
  - Use as template for Q1 2025 testing infrastructure
  - Adopt test patterns for custom hooks
  - Implement component testing examples
  - Set up CI/CD testing pipeline based on examples

### 6. **Awesome React - Curated Resource Collection**
- **Repository:** https://github.com/enaqx/awesome-react
- **Purpose:** Comprehensive resource and library discovery
- **Integration Priority:** MEDIUM
- **Why:**
  - Curated list of best React libraries and tools
  - Includes enterprise-grade components and utilities
  - Shows state management, routing, styling solutions
  - Provides accessibility and testing resources
  - Helps evaluate alternatives for vulnerable dependencies
- **Recommended Actions:**
  - Reference when seeking react-quill alternatives (security)
  - Evaluate state management improvements
  - Discover accessibility tools and resources
  - Find performance monitoring solutions

---

## Part 2: Context-Engineered Prompts for GitHub Agents

These prompts are designed for GitHub Agents to automate specific high-priority tasks. Each prompt includes comprehensive context to maximize effectiveness.

### Prompt 1: Security Vulnerability Remediation Agent

```
CONTEXT: You are working on the Interact employee engagement platform (React 18 + Vite 6 + Base44 SDK). The project currently has 8 npm security vulnerabilities (2 HIGH, 6 MODERATE) that must be fixed immediately.

CODEBASE INFO:
- Main tech stack: React 18.2.0, Vite 6.1.0, TanStack Query 5.84.1, Tailwind CSS
- 566 source files with ~15,000 lines of code
- 47 application pages using React Router
- Package.json dependencies: 77 production + 16 dev
- Current security issues identified in: glob, DOMPurify (via jspdf), js-yaml, mdast-util-to-hast, quill (via react-quill), Vite

TASK: Fix all security vulnerabilities in package.json following these steps:
1. Run `npm audit` to get current vulnerability report
2. Apply all non-breaking fixes with `npm audit fix`
3. For breaking changes:
   - jspdf: Evaluate upgrade to 3.0.4 and test PDF generation in /src/components/analytics/*
   - react-quill: Research secure alternatives (Slate.js, Lexical, TipTap) or upgrade
   - Document any breaking changes found
4. Verify no regressions in key features:
   - Activity creation (/src/pages/activities/*)
   - Report generation (/src/pages/analytics/*)
   - Event scheduling (/src/pages/calendar/*)
5. Update package-lock.json and test build: `npm run build`
6. Document all changes made and any breaking changes developers should know

CONSTRAINTS:
- Do NOT remove functionality to fix vulnerabilities
- Ensure application still builds and runs after changes
- Prioritize security over minor version constraints
- Test critical user flows after dependency updates

DELIVERABLES:
- Updated package.json and package-lock.json
- Security vulnerability report (before/after)
- Breaking changes documentation
- Test results for critical features
```

### Prompt 2: Testing Infrastructure Setup Agent

```
CONTEXT: You are setting up comprehensive testing infrastructure for the Interact platform, which currently has 0% test coverage. This is a critical P0 priority for Q1 2025.

PROJECT DETAILS:
- Framework: React 18.2.0 with Vite 6.1.0 build system
- State management: React Context API + TanStack Query 5.84.1
- UI libraries: Radix UI components + Tailwind CSS
- Forms: React Hook Form 7.54.2 with Zod 3.24.2 validation
- Current file structure: /src with pages/, components/, hooks/, utils/, lib/

TASK: Implement complete testing infrastructure with these requirements:
1. Install and configure Vitest (Vite-native testing framework):
   - Install vitest, @vitest/ui, @testing-library/react, @testing-library/jest-dom
   - Create vitest.config.js with proper React configuration
   - Set up test environment (jsdom)
   - Configure coverage reporting (minimum 70% target)

2. Create test infrastructure:
   - /src/tests/setup.js with global test utilities
   - /src/tests/mocks/ for API and component mocks
   - Example test files demonstrating patterns:
     * Unit test: /src/utils/date.test.js
     * Hook test: /src/hooks/useAuth.test.js
     * Component test: /src/components/ui/Button.test.jsx
     * Integration test: /src/pages/Dashboard.test.jsx

3. Update package.json scripts:
   - "test": "vitest"
   - "test:ui": "vitest --ui"
   - "test:coverage": "vitest --coverage"
   - "test:watch": "vitest --watch"

4. Create documentation:
   - /docs/TESTING.md with testing guidelines
   - Examples of testing patterns for team
   - Instructions for running and writing tests
   - Coverage requirements and CI integration plan

5. Write initial tests for high-priority areas:
   - Authentication hooks (/src/hooks/useAuth.js)
   - Form validation utilities (/src/utils/validation.js)
   - Core UI components (/src/components/ui/*)
   - Critical page: Dashboard (/src/pages/Dashboard.jsx)

CONSTRAINTS:
- Use Vitest (not Jest) to leverage Vite build system
- Follow React Testing Library best practices (user-centric tests)
- Ensure tests run fast (< 2 seconds for initial suite)
- Use existing Zod schemas for mock data generation

DELIVERABLES:
- Complete testing infrastructure setup
- Minimum 5 example test files with passing tests
- Testing documentation and guidelines
- Coverage report showing baseline metrics
```

### Prompt 3: TypeScript Migration Strategy Agent

```
CONTEXT: You are planning and initiating the TypeScript migration for the Interact platform. The project is currently 100% JavaScript (.jsx files) and needs gradual migration to TypeScript for improved maintainability, type safety, and developer experience. This is scheduled for Q2-Q3 2025.

CURRENT CODEBASE:
- 566 JavaScript files (.js, .jsx)
- React 18.2.0 with hooks and context
- Complex state management with Context API + TanStack Query
- 42+ component categories, 47 pages
- Custom hooks in /src/hooks/
- Utilities in /src/utils/ and /src/lib/

TASK: Create comprehensive TypeScript migration strategy and begin initial migration:

1. Setup TypeScript infrastructure:
   - Install TypeScript 5.x and @types/* packages
   - Create tsconfig.json with strict settings (allowJs: true for gradual migration)
   - Configure path aliases matching jsconfig.json
   - Update Vite config for TypeScript
   - Set up ESLint TypeScript rules

2. Create migration plan document (/docs/TYPESCRIPT_MIGRATION.md):
   - Phase 1 (Q2 2025): Utilities and hooks (target: 25% coverage)
   - Phase 2 (Q2-Q3 2025): Core components and contexts (target: 60% coverage)
   - Phase 3 (Q3 2025): Pages and remaining files (target: 100% coverage)
   - Migration checklist and priorities
   - Common patterns and pitfalls
   - Team training recommendations

3. Create TypeScript type definitions:
   - /src/types/index.ts - Core application types
   - /src/types/api.ts - API request/response types
   - /src/types/models.ts - Data model types
   - /src/types/components.ts - Reusable component prop types

4. Begin Phase 1 migration (utilities and hooks):
   - Convert /src/utils/date.js → date.ts
   - Convert /src/utils/validation.js → validation.ts
   - Convert /src/hooks/useAuth.js → useAuth.ts
   - Convert /src/hooks/useApi.js → useApi.ts
   - Update imports across codebase

5. Create migration templates and examples:
   - Example converted hook with proper typing
   - Example converted utility function
   - Example API client with type safety
   - Example React component migration (simple → complex)

MIGRATION PRINCIPLES:
- Incremental: Allow .js and .ts to coexist during migration
- Type-first: Define types before converting implementation
- Test: Ensure converted code has test coverage
- Document: Comment complex types and generic usage
- Team: Migration is a team effort, provide clear examples

CONSTRAINTS:
- Do not break existing functionality
- Maintain backward compatibility during migration
- Use strict TypeScript settings (no "any" abuse)
- Prioritize high-value, frequently-changed files first

DELIVERABLES:
- Complete TypeScript configuration
- Migration strategy document with phases
- Core type definitions (types/*.ts)
- 5+ migrated utility/hook files
- Migration examples and documentation
- Updated package.json and build scripts
```

### Prompt 4: Performance Optimization and Code Splitting Agent

```
CONTEXT: You are optimizing the Interact platform for performance. The app has 47 pages, 566 source files, and no code splitting, resulting in large initial bundle sizes and slow time-to-interactive. This is a P1 priority for Q1 2025 (Week 11-13).

CURRENT PERFORMANCE ISSUES:
- All 47 pages loaded in initial bundle
- No lazy loading for routes or components
- No dynamic imports
- Large bundle size affecting mobile users
- Slow first contentful paint (FCP)

TECH STACK:
- React 18.2.0 with React Router DOM 6.26.0
- Vite 6.1.0 build system
- Component structure: /src/pages/, /src/components/
- Current routing: /src/App.jsx imports all pages directly

TASK: Implement comprehensive performance optimizations:

1. Implement route-based code splitting:
   - Convert all page imports in /src/App.jsx to React.lazy()
   - Wrap router with <Suspense> and proper fallback component
   - Organize lazy imports by feature group for better chunk sizing
   - Example pattern:
     ```javascript
     const Dashboard = lazy(() => import('./pages/Dashboard'));
     ```

2. Create smart loading components:
   - /src/components/common/LoadingFallback.jsx - route loading
   - /src/components/common/ComponentLoader.jsx - component loading
   - Skeleton screens for major pages (Dashboard, Analytics)
   - Loading states consistent with design system

3. Optimize heavy components with lazy loading:
   - Analytics charts (/src/components/analytics/*)
   - Rich text editor (react-quill is heavy)
   - Calendar components
   - 3D visualizations (three.js)
   - Identify components > 50KB for lazy loading

4. Implement React.memo and useMemo optimizations:
   - Audit and optimize expensive renders
   - Add React.memo to pure presentation components
   - Use useMemo for expensive calculations
   - Use useCallback for event handlers in lists
   - Focus on: leaderboards, analytics, large lists

5. Configure Vite bundle optimization:
   - Update vite.config.js with manual chunk splitting
   - Separate vendor chunks (React, Radix UI, etc.)
   - Configure rollup options for optimal chunks
   - Set up bundle analyzer

6. Performance monitoring setup:
   - Add Web Vitals tracking
   - Create performance baseline report
   - Set up Lighthouse CI
   - Document performance metrics (FCP, LCP, TTI, CLS)

7. Create performance documentation:
   - /docs/PERFORMANCE.md with optimization guidelines
   - Bundle size budget guidelines
   - Code splitting patterns and examples
   - Performance testing procedures

PERFORMANCE TARGETS:
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 2.5s
- Total Bundle Size: < 500KB (gzipped)
- Individual page chunks: < 150KB

CONSTRAINTS:
- Maintain all existing functionality
- Ensure smooth user experience (no loading flicker)
- Don't break HMR in development
- Keep good DX (developer experience)

DELIVERABLES:
- Code-split routing configuration
- Lazy-loaded heavy components
- Performance optimization documentation
- Before/after bundle analysis
- Web Vitals baseline report
- Lighthouse performance scores
```

### Prompt 5: Accessibility (a11y) Compliance Agent

```
CONTEXT: You are ensuring WCAG 2.1 AA compliance for the Interact employee engagement platform. The platform uses Radix UI (which provides baseline accessibility) but needs comprehensive accessibility audit and improvements. This is a P1 priority for Q2 2025.

PLATFORM DETAILS:
- Built with React 18.2.0 + Radix UI components
- 47 application pages with complex interactions
- Gamification features (leaderboards, badges, rewards)
- Rich forms and data visualizations
- Target: WCAG 2.1 AA compliance (enterprise requirement)
- Current state: AccessibilityProvider exists but incomplete implementation

TASK: Achieve and validate WCAG 2.1 AA compliance:

1. Setup accessibility testing infrastructure:
   - Install @axe-core/react for automated testing
   - Install eslint-plugin-jsx-a11y for linting
   - Configure axe-core to run in development
   - Setup pa11y or similar for automated CI testing
   - Update ESLint config with a11y rules

2. Audit and fix keyboard navigation:
   - Ensure all interactive elements are keyboard accessible
   - Implement focus management for modals and dialogs
   - Add skip-to-content links
   - Fix focus order on complex pages (Dashboard, Calendar)
   - Test tab navigation on all 47 pages
   - Implement focus traps for modal dialogs

3. ARIA labels and semantic HTML:
   - Audit all interactive components for proper ARIA labels
   - Add aria-describedby for form field hints
   - Ensure heading hierarchy (h1 → h2 → h3)
   - Add role attributes where appropriate
   - Label all form inputs properly
   - Add aria-live regions for dynamic content updates

4. Color contrast and visual accessibility:
   - Audit color contrast ratios (4.5:1 for normal text, 3:1 for large text)
   - Fix Tailwind color usage where contrast fails
   - Ensure focus indicators have 3:1 contrast
   - Add high-contrast theme option
   - Test with browser color blindness simulators

5. Screen reader optimization:
   - Test with NVDA (Windows) and VoiceOver (Mac)
   - Add descriptive alt text for all images
   - Ensure data visualizations have text alternatives
   - Add screen-reader-only text for icon buttons
   - Test complex interactions (gamification, calendar)

6. Form accessibility:
   - Ensure error messages are announced
   - Associate labels with inputs (htmlFor/id)
   - Add field requirements (aria-required)
   - Implement inline validation feedback
   - Group related inputs with fieldset/legend

7. Create accessibility documentation:
   - /docs/ACCESSIBILITY.md with guidelines and patterns
   - Component accessibility checklist
   - Testing procedures and tools
   - Common patterns and examples
   - Screen reader testing guide

8. High-priority pages to fix:
   - Dashboard (/src/pages/Dashboard.jsx)
   - Login/Authentication (/src/pages/auth/*)
   - Activity creation (/src/pages/activities/ActivityWizard.jsx)
   - Calendar (/src/pages/Calendar.jsx)
   - Leaderboards (/src/pages/gamification/Leaderboards.jsx)

WCAG 2.1 AA REQUIREMENTS TO VALIDATE:
- 1.1.1 Non-text Content
- 1.3.1 Info and Relationships
- 1.4.3 Contrast (Minimum)
- 2.1.1 Keyboard
- 2.4.7 Focus Visible
- 3.3.2 Labels or Instructions
- 4.1.2 Name, Role, Value

CONSTRAINTS:
- Do not break existing functionality
- Maintain current design aesthetics where possible
- Use Radix UI primitives (they're already accessible)
- Ensure changes work across browsers
- Balance automation with manual testing

DELIVERABLES:
- Accessibility testing infrastructure
- Fixed WCAG 2.1 AA violations (documented)
- Accessibility documentation and guidelines
- Screen reader testing report
- Lighthouse accessibility score > 95
- Component accessibility audit report
```

---

## Part 3: Comprehensive GitHub Copilot Prompt

This single prompt is designed for GitHub Copilot (in IDE) to guide the overall development process. It provides comprehensive context about the project, goals, and architectural decisions.

### Master GitHub Copilot Context Prompt

```markdown
# Interact Platform - GitHub Copilot Development Context

## Project Overview
You are working on **Interact**, an enterprise-grade employee engagement platform built with:
- **Frontend:** React 18.2.0 + Vite 6.1.0 + Tailwind CSS 3.4.17
- **State:** React Context API + TanStack Query 5.84.1
- **UI:** Radix UI components + Lucide React icons
- **Forms:** React Hook Form 7.54.2 + Zod 3.24.2 validation
- **Backend:** Base44 SDK 0.8.3 (serverless functions in TypeScript)
- **Routing:** React Router DOM 6.26.0

## Project Stats
- 566 source files, ~15,000 lines of code
- 47 application pages
- 42 component categories
- 61 backend serverless functions
- 15+ third-party integrations (Google Calendar, Slack, Teams, AI services)

## Architectural Principles

### Component Structure
- **Feature-based organization**: Group related components, hooks, utils together
- **Container/Presentational pattern**: Separate business logic from presentation
- **Custom hooks**: Encapsulate reusable logic (data fetching, form handling, auth)
- **Atomic design**: Organize components as atoms → molecules → organisms

### File Organization
```
/src
  /components
    /ui             # Base UI components (buttons, inputs, cards)
    /common         # Shared components (layouts, navigation)
    /[feature]      # Feature-specific components (activities, gamification)
  /pages            # Route components (47 pages)
  /hooks            # Custom React hooks
  /utils            # Pure utility functions
  /lib              # Third-party library configurations
  /contexts         # React Context providers
  /api              # API client and functions
```

### Coding Standards
1. **Functional components only** - Use hooks, no class components
2. **PropTypes or TypeScript** - Validate props (migrating to TS in Q2-Q3 2025)
3. **Descriptive names** - Components: PascalCase, functions: camelCase, constants: UPPER_SNAKE_CASE
4. **Error boundaries** - Wrap routes and heavy components
5. **Lazy loading** - Use React.lazy() for routes and heavy components
6. **Memoization** - React.memo for pure components, useMemo/useCallback for optimization

### State Management Rules
- **Local state first**: Use useState for component-specific state
- **Context for global state**: Theme, auth, user settings
- **TanStack Query for server state**: API calls, caching, background updates
- **Avoid prop drilling**: Use Context or composition patterns

### Form Handling
- **Always use React Hook Form** - with Zod schema validation
- **Consistent error display** - Show errors below fields
- **Accessibility** - Proper labels, ARIA attributes, keyboard navigation
- **Loading states** - Disable submit during async operations
Example:
```jsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

### API Integration
- **Use TanStack Query** - For all data fetching
- **Base44 SDK** - For backend function calls
- **Error handling** - Display user-friendly messages
- **Loading states** - Show skeletons or spinners
- **Optimistic updates** - For mutations when appropriate
Example:
```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['activities'],
  queryFn: () => fetchActivities()
});
```

### Styling Guidelines
- **Tailwind CSS utility classes** - Primary styling method
- **Radix UI primitives** - For complex interactive components
- **CSS modules** - For complex component-specific styles (rare)
- **Responsive design** - Mobile-first approach (sm: md: lg: xl:)
- **Consistent spacing** - Use Tailwind spacing scale (p-4, m-2, gap-6)
- **Color palette** - Use Tailwind theme colors, avoid arbitrary values
- **Dark mode** - Use next-themes, support dark mode variants

### Security Practices
- **Input validation** - Always validate with Zod schemas
- **XSS prevention** - Never use dangerouslySetInnerHTML without DOMPurify
- **Authentication checks** - Verify auth state before rendering protected content
- **API authorization** - Role-based access control in backend functions
- **Secrets management** - Never commit API keys, use environment variables

### Performance Optimization
- **Code splitting** - React.lazy() for routes and heavy components
- **Virtualization** - Use react-virtual for long lists (leaderboards, directories)
- **Image optimization** - Use proper formats, lazy loading, srcset
- **Bundle size** - Monitor with Vite's rollup-plugin-visualizer
- **Memoization** - Use React.memo, useMemo, useCallback strategically
- **Debouncing** - For search inputs and real-time updates

### Testing Standards (Q1 2025)
- **Vitest + React Testing Library** - Testing framework
- **Unit tests** - For utilities, hooks, and pure functions
- **Component tests** - For UI components with user interactions
- **Integration tests** - For complete user flows
- **80% coverage target** - By Q3 2025
- **Test file location** - Co-located with component (.test.jsx)

### Accessibility Requirements (WCAG 2.1 AA)
- **Semantic HTML** - Use proper elements (button, nav, main, etc.)
- **Keyboard navigation** - All interactive elements accessible via keyboard
- **ARIA labels** - For icon buttons and dynamic content
- **Focus management** - Visible focus indicators, focus traps in modals
- **Color contrast** - Minimum 4.5:1 for text, 3:1 for UI components
- **Screen readers** - Test with NVDA/VoiceOver, add sr-only text
- **Form accessibility** - Labels, error announcements, required indicators

### Current Priorities (Q1-Q2 2025)
1. **Security** - Fix 8 npm vulnerabilities (2 HIGH, 6 MODERATE)
2. **Testing** - Implement testing infrastructure (0% → 70% coverage)
3. **Performance** - Code splitting, lazy loading (FCP < 1.5s, TTI < 2.5s)
4. **TypeScript** - Begin gradual migration (utilities and hooks first)
5. **Documentation** - Architecture, API, component docs
6. **Accessibility** - Achieve WCAG 2.1 AA compliance

### Known Issues to Avoid
- ❌ **React Hooks violations** - Never call hooks conditionally
- ❌ **Unused imports** - Clean up imports (use ESLint autofix)
- ❌ **Missing error boundaries** - Wrap all routes
- ❌ **No lazy loading** - Implement for routes and heavy components
- ❌ **Large components** - Refactor components > 300 lines
- ❌ **Props drilling** - Use Context or composition instead

### Integration Points
- **Google Calendar** - Event sync and scheduling
- **Slack/Teams** - Notifications and bot commands
- **AI Services** - OpenAI (recommendations), Claude (content), Gemini, ElevenLabs
- **Cloudinary** - Image and file storage
- **HubSpot** - CRM integration
- **Zapier** - Workflow automation

### Common Patterns

#### Creating a new page component:
```jsx
// src/pages/FeaturePage.jsx
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/common/PageLayout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const FeaturePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['feature'],
    queryFn: fetchFeatureData
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <PageLayout title="Feature">
      {/* Content */}
    </PageLayout>
  );
};
```

#### Creating a custom hook:
```jsx
// src/hooks/useFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useFeature = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['feature'],
    queryFn: fetchFeature
  });

  const mutation = useMutation({
    mutationFn: updateFeature,
    onSuccess: () => {
      queryClient.invalidateQueries(['feature']);
    }
  });

  return { ...query, update: mutation.mutate };
};
```

#### Creating a form with validation:
```jsx
// src/components/forms/FeatureForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const FeatureForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input {...register('name')} id="name" />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

## When Generating Code
- Follow all architectural principles and coding standards above
- Use modern React patterns (hooks, functional components)
- Include proper error handling and loading states
- Add accessibility attributes (ARIA labels, semantic HTML)
- Use TypeScript syntax for any new .ts/.tsx files
- Write clean, readable code with descriptive variable names
- Include JSDoc comments for complex functions
- Consider performance (memoization, lazy loading)
- Follow existing code style and conventions
- Test-friendly code (avoid tight coupling)

## Documentation Requirements
- Add JSDoc comments for exported functions and components
- Include usage examples for reusable components
- Document prop types and expected values
- Explain complex logic with inline comments
- Update relevant .md files when changing architecture

## Questions to Ask Before Coding
1. Is this the right component/hook/utility for the feature?
2. Should this be lazy-loaded or code-split?
3. Does this need error handling and loading states?
4. Is this accessible (keyboard nav, ARIA, screen readers)?
5. Should this be memoized for performance?
6. Does this follow existing patterns in the codebase?
7. Will this work with the planned TypeScript migration?
8. Is there an existing component/hook I should reuse?

---

Use this context to inform all code generation, refactoring, and architectural decisions. When in doubt, prioritize code quality, accessibility, performance, and maintainability over rapid implementation.
```

---

## Part 4: Implementation Roadmap

### Immediate Actions (Week 1-2)
1. **Repository Integration**:
   - Clone and study React 18 Design Patterns repository
   - Bookmark TypeScript React Cheatsheet for team reference
   - Review testing examples from Vitest repository
   - Create internal wiki with key patterns from these repos

2. **Agent Deployment**:
   - Deploy Security Vulnerability Remediation Agent (Prompt 1)
   - Validate all security fixes and run regression tests
   - Document any breaking changes

### Short-term Actions (Month 1)
3. **Testing Foundation**:
   - Deploy Testing Infrastructure Setup Agent (Prompt 2)
   - Achieve 30% test coverage baseline
   - Train team on testing patterns

4. **Performance Quick Wins**:
   - Implement basic code splitting for largest pages
   - Add lazy loading for analytics components
   - Measure and document baseline performance

### Medium-term Actions (Q1-Q2 2025)
5. **TypeScript Migration**:
   - Deploy TypeScript Migration Strategy Agent (Prompt 3)
   - Complete Phase 1 (utilities and hooks)
   - Begin Phase 2 (components)

6. **Performance Optimization**:
   - Deploy Performance Optimization Agent (Prompt 4)
   - Achieve all performance targets
   - Implement monitoring

7. **Accessibility Compliance**:
   - Deploy Accessibility Compliance Agent (Prompt 5)
   - Fix all WCAG 2.1 AA violations
   - Validate with screen readers

### Long-term Integration (Q3-Q4 2025)
8. **Repository Learnings**:
   - Refactor social features using Community Platform patterns
   - Enhance gamification using HabitTrove mechanics
   - Continuously reference Awesome React for library updates

9. **Continuous Improvement**:
   - Use GitHub Copilot with master context prompt for all new features
   - Regular code reviews using established patterns
   - Quarterly assessment of progress against PRD goals

---

## Part 5: Success Metrics

### Repository Integration Success
- [ ] All 6 repositories cloned and reviewed by team
- [ ] Key patterns documented in internal wiki
- [ ] At least 3 patterns from each repo implemented
- [ ] Team trained on best practices from repositories

### Agent Effectiveness
- [ ] All 5 agent prompts successfully deployed
- [ ] Zero security vulnerabilities (from 8)
- [ ] 70%+ test coverage (from 0%)
- [ ] Performance targets met (FCP < 1.5s, TTI < 2.5s)
- [ ] WCAG 2.1 AA compliance achieved
- [ ] 50%+ TypeScript migration (Phase 1-2 complete)

### GitHub Copilot Integration
- [ ] Master context prompt adopted by all developers
- [ ] Measured productivity improvement (velocity increase)
- [ ] Code quality improvement (fewer bugs, better reviews)
- [ ] Reduced onboarding time for new developers

### Overall Platform Health (6 Months)
- [ ] Security Score: 95/100 (from 60/100)
- [ ] Code Quality: 90/100 (from 65/100)
- [ ] Test Coverage: 70%+ (from 0%)
- [ ] Performance: 90/100 (from 75/100)
- [ ] Accessibility: 90/100 (from 70/100)
- [ ] Documentation: 85/100 (maintained)

---

## Part 6: Additional Best Practices from Research

### React 18 Enterprise Best Practices (2024-2025)
Based on research, the following practices should be adopted:

1. **Concurrent Rendering**:
   - Use `useTransition` for non-blocking state updates (search, filtering)
   - Implement `startTransition` for analytics dashboard updates
   - Add `<Suspense>` boundaries for lazy-loaded components

2. **Performance Patterns**:
   - Implement streaming SSR for faster initial loads (consider Next.js)
   - Use selective hydration for progressive enhancement
   - Add service workers for offline capability (PWA)

3. **State Management Evolution**:
   - Consider Zustand for simpler global state (lighter than Redux)
   - Keep TanStack Query for server state (already implemented)
   - Use Jotai for atomic state management if needed

4. **Testing Strategy**:
   - Jest + React Testing Library for unit/integration
   - Playwright for E2E testing (better than Cypress for 2024)
   - Visual regression testing with Percy or Chromatic

### Gamification Architecture Best Practices

1. **Modular Gamification Engine**:
   - Separate gamification logic into independent microservices
   - Support plug-and-play game mechanics
   - Real-time scoring and leaderboard updates

2. **Personalization**:
   - AI-driven challenge recommendations
   - Dynamic difficulty adjustment
   - Personalized reward suggestions

3. **Social Integration**:
   - Team challenges and competitions
   - Peer recognition systems
   - Social feed for achievements

4. **Analytics**:
   - Real-time engagement dashboards
   - Predictive analytics for user engagement
   - A/B testing for gamification features

### TypeScript Best Practices

1. **Strict Configuration**:
   - Enable `strict: true` in tsconfig.json
   - Use `noImplicitAny`, `strictNullChecks`
   - Avoid `any` type, use `unknown` instead

2. **Type Organization**:
   - Centralized type definitions in `/src/types/`
   - Share types between frontend and backend
   - Use utility types (Partial, Required, Pick, Omit)

3. **React + TypeScript**:
   - Proper prop typing with interfaces
   - Generic components for reusability
   - Type-safe context and hooks

### Security Best Practices

1. **Dependency Management**:
   - Automated security scanning in CI/CD
   - Regular dependency updates (weekly)
   - Use `npm audit` in pre-commit hooks

2. **Application Security**:
   - Content Security Policy (CSP) headers
   - Input sanitization with DOMPurify
   - CSRF token validation
   - Rate limiting on API endpoints

3. **Authentication/Authorization**:
   - JWT with short expiration (15 min access, 7 day refresh)
   - Role-based access control (RBAC)
   - MFA for admin accounts
   - Secure session management

---

## Part 7: Conclusion

This recommendations document provides a comprehensive roadmap for improving the Interact platform based on:
- Current industry best practices (2024-2025)
- Analysis of existing codebase and documentation
- Strategic goals outlined in PRD.md and CODEBASE_AUDIT.md

### Key Takeaways
1. **6 GitHub repositories** provide essential patterns and examples for all major improvement areas
2. **5 specialized agent prompts** automate high-priority tasks (security, testing, TypeScript, performance, accessibility)
3. **1 comprehensive Copilot prompt** provides ongoing guidance for all development work
4. **Clear roadmap** with immediate, short-term, and long-term actions
5. **Measurable success metrics** to track progress

### Next Steps
1. Review this document with the team
2. Prioritize agent deployments based on business impact
3. Begin repository integration and pattern adoption
4. Deploy GitHub Copilot context prompt across development team
5. Track progress against success metrics
6. Update quarterly based on results and new best practices

---

**Document Status:** Ready for Implementation  
**Last Updated:** December 29, 2024  
**Next Review:** March 29, 2025  

**Prepared by:** GitHub Copilot Engineering Team  
**Based on:** CODEBASE_AUDIT.md, PRD.md, FEATURE_ROADMAP.md, and industry research
