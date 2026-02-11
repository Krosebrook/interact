# Custom Coding Agents for Interact Platform

This directory contains specialized coding agents that understand the Interact platform's architecture, patterns, and conventions.

**Last Updated:** February 11, 2026  
**Total Agents:** 21

---

## Overview

These agents are designed specifically for the Interact employee engagement platform. Each agent references actual file paths, coding patterns, and conventions found in this repository.

## How to Use These Agents

1. **Read the agent file** to understand its capabilities
2. **Provide context** from the agent instructions when asking for help
3. **Reference specific sections** when you need targeted assistance

Example:
> "Using the react-component-builder agent guidelines, create a new BadgeDisplay component that shows earned badges with animations."

---

## Available Agents

### 🎨 Frontend Development

#### 1. React Component Builder
**File:** `react-component-builder.agent.md`  
**Purpose:** Creates React components following Interact's exact patterns

**Specializations:**
- Functional components with hooks
- Radix UI primitives integration
- TailwindCSS styling patterns
- TanStack Query for data fetching
- React Hook Form + Zod for forms
- Framer Motion animations
- Error handling & loading states

**When to Use:**
- Building new UI components
- Creating page layouts
- Implementing feature components

---

#### 2. React Hooks Fixer
**File:** `react-hooks-fixer.agent.md`  
**Purpose:** Identifies and fixes React Hooks violations

**Specializations:**
- Rules of Hooks enforcement
- Dependency array corrections
- Hook ordering fixes
- Custom hooks creation
- Stale closure prevention

**When to Use:**
- Fixing the 2 critical hooks violations in codebase
- Preventing hooks-related runtime errors
- Refactoring components with hook issues

---

#### 3. Form & Validation Expert
**File:** `form-validation-expert.agent.md`  
**Purpose:** Creates forms using React Hook Form + Zod validation

**Specializations:**
- Zod schema definitions
- Form field components
- Multi-step forms
- Custom validation rules
- Integration with UI components

**When to Use:**
- Building data entry forms
- Implementing user input validation
- Creating multi-step wizards

---

#### 4. TanStack Query Expert
**File:** `tanstack-query-expert.agent.md`  
**Purpose:** Implements data fetching, caching, and mutations

**Specializations:**
- Query patterns and keys
- Mutation with optimistic updates
- Cache invalidation strategies
- Prefetching and pagination
- Error handling and retries

**When to Use:**
- Fetching data from Base44 backend
- Implementing CRUD operations
- Optimizing data loading performance

---

### 🔧 Backend Development

#### 5. Base44 Function Builder
**File:** `base44-function-builder.agent.md`  
**Purpose:** Creates serverless functions using Base44 SDK

**Specializations:**
- Base44 SDK patterns (0.8.3)
- Authentication & authorization
- Entity CRUD operations
- AI service integrations
- Third-party API integrations

**When to Use:**
- Creating new API endpoints
- Implementing business logic
- Integrating external services

---

#### 6. AI Integration Specialist
**File:** `ai-integration-specialist.agent.md`  
**Purpose:** Implements AI features using OpenAI, Claude, and Gemini

**Specializations:**
- OpenAI GPT-4 integration
- Anthropic Claude integration
- Google Gemini integration
- Prompt engineering
- Streaming responses
- Cost management

**When to Use:**
- Building AI-powered features
- Generating content with AI
- Creating intelligent recommendations

---

### 🎮 Domain-Specific

#### 7. Gamification Expert
**File:** `gamification-expert.agent.md`  
**Purpose:** Implements gamification features (points, badges, leaderboards)

**Specializations:**
- Points system implementation
- Badge creation and awarding
- Leaderboard calculations
- Challenge tracking
- Reward system
- Gamification animations

**When to Use:**
- Building engagement features
- Implementing achievement systems
- Creating competitive elements

---

### 🧪 Quality Assurance

#### 8. Unit Test Writer
**File:** `test-writer.agent.md`  
**Purpose:** Writes comprehensive unit tests using Vitest + RTL

**Specializations:**
- Vitest test patterns
- React Testing Library
- Component testing
- Hook testing
- Mock data creation
- Coverage optimization

**When to Use:**
- Writing tests for new code
- Improving test coverage (target: 30%+)
- Testing React components and hooks

---

#### 9. Code Quality & Linter
**File:** `code-quality-linter.agent.md`  
**Purpose:** Fixes ESLint violations and enforces coding standards

**Specializations:**
- ESLint error fixes
- Unused import removal
- Code style enforcement
- Import organization
- React-specific linting rules

**When to Use:**
- Fixing the 100+ ESLint warnings/errors
- Cleaning up unused imports
- Enforcing code standards

---

#### 10. Security Auditor
**File:** `security-auditor.agent.md`  
**Purpose:** Reviews code for security vulnerabilities

**Specializations:**
- Authentication & authorization checks
- Input validation
- XSS prevention
- Secret management
- OWASP Top 10 awareness
- npm vulnerability fixes

**When to Use:**
- Maintaining 100/100 security score
- Reviewing security-sensitive code
- Fixing vulnerability reports

---

### 📚 Documentation & DevOps

#### 11. Documentation Writer
**File:** `documentation-writer.agent.md`  
**Purpose:** Creates technical documentation matching Interact's standards

**Specializations:**
- API documentation
- Component documentation
- Technical guides
- Architecture documentation
- Maintaining 98/100 doc score

**When to Use:**
- Documenting new features
- Creating API references
- Writing how-to guides

---

#### 12. CI/CD Pipeline Manager
**File:** `cicd-pipeline-manager.agent.md`  
**Purpose:** Manages GitHub Actions workflows

**Specializations:**
- Workflow creation and maintenance
- Pipeline failure debugging
- Caching optimization
- Build performance tuning
- Deployment automation

**When to Use:**
- Fixing CI/CD failures
- Optimizing build times
- Adding new workflow steps

---

### 🚀 Performance & Optimization

#### 13. Performance Optimizer
**File:** `performance-optimizer.agent.md`  
**Purpose:** Identifies and fixes performance bottlenecks in React + Vite

**Specializations:**
- Bundle analysis and code splitting
- Lazy loading (117 pages)
- React.memo, useMemo, useCallback optimization
- Image optimization with Cloudinary
- TanStack Query cache configuration
- Dependency optimization (remove moment.js)

**When to Use:**
- Reducing bundle size
- Improving page load times
- Optimizing render performance
- Lighthouse performance score < 90

---

#### 14. State Management Expert
**File:** `state-management-expert.agent.md`  
**Purpose:** Implements Context API + TanStack Query state patterns

**Specializations:**
- React Context for UI state
- TanStack Query for server state
- Avoiding prop drilling
- Optimistic updates
- Query key conventions
- Cache invalidation strategies

**When to Use:**
- Managing global app state
- Implementing complex data flows
- Optimizing re-renders
- Setting up new contexts

---

### 🔗 Integration & APIs

#### 15. API Integration Specialist
**File:** `api-integration-specialist.agent.md`  
**Purpose:** Implements 15+ third-party API integrations

**Specializations:**
- Google Calendar, Maps
- Microsoft Teams
- Slack
- Notion, HubSpot, Zapier
- OAuth flows
- Webhook handlers
- Rate limiting and retries

**When to Use:**
- Adding new external integrations
- Implementing OAuth authentication
- Setting up webhooks
- Troubleshooting API errors

---

### 🧭 Navigation & Routing

#### 16. Route & Navigation Manager
**File:** `route-navigation-manager.agent.md`  
**Purpose:** Manages React Router 6.26.0 for 117 pages

**Specializations:**
- Route organization and lazy loading
- Protected routes and role guards
- Nested routes
- URL state management
- Breadcrumbs and navigation
- XSS-safe navigation (fixed v6.26.0)

**When to Use:**
- Adding new pages and routes
- Implementing navigation guards
- Refactoring route structure
- Debugging routing issues

---

### 🛡️ Error Handling & Logging

#### 17. Error Handling & Logging Expert
**File:** `error-handling-logging.agent.md`  
**Purpose:** Implements comprehensive error handling and logging

**Specializations:**
- Error boundaries for React errors
- API error handling
- User-friendly error messages
- Global error handlers
- Logging service integration
- Sentry integration

**When to Use:**
- Implementing error boundaries
- Improving error messages
- Setting up error tracking
- Debugging production issues

---

### ♿ Accessibility

#### 18. Accessibility Auditor
**File:** `accessibility-auditor.agent.md`  
**Purpose:** Ensures WCAG 2.1 AA compliance

**Specializations:**
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast checking
- Form accessibility

**When to Use:**
- Auditing components for a11y
- Fixing accessibility violations
- Implementing keyboard navigation
- Lighthouse accessibility score < 100

---

### 📊 Analytics & Visualization

#### 19. Analytics Implementation Specialist
**File:** `analytics-implementation.agent.md`  
**Purpose:** Implements tracking and analytics

**Specializations:**
- Event tracking system
- User engagement metrics
- Analytics dashboards
- Real-time analytics
- GDPR-compliant tracking
- Analytics export (CSV, PDF)

**When to Use:**
- Implementing analytics tracking
- Creating engagement metrics
- Building analytics dashboards
- Setting up event logging

---

#### 20. Data Visualization Expert
**File:** `data-visualization-expert.agent.md`  
**Purpose:** Creates charts and dashboards with Recharts 2.15.4

**Specializations:**
- Line, bar, pie, area, radar charts
- Custom tooltips and legends
- Responsive chart layouts
- Chart export (image, PDF)
- Recharts + TailwindCSS integration
- Accessible visualizations

**When to Use:**
- Creating analytics dashboards
- Visualizing engagement metrics
- Building leaderboard charts
- Implementing data export

---

### 📱 Mobile & PWA

#### 21. PWA Implementation Specialist
**File:** `pwa-implementation.agent.md`  
**Purpose:** Implements Progressive Web App features

**Specializations:**
- Service workers
- Web app manifest
- Offline support
- Install prompts
- Push notifications
- Background sync
- App store submission (TWA, Capacitor)

**When to Use:**
- Implementing PWA features (Q2 2026)
- Adding offline support
- Creating install prompts
- Setting up push notifications

---

## Agent Selection Guide

### By Task Type

**Creating New Features:**
1. Start with `react-component-builder` for frontend
2. Use `base44-function-builder` for backend
3. Apply `form-validation-expert` if forms needed
4. Add `gamification-expert` for engagement features
5. Finish with `test-writer` for tests

**Fixing Issues:**
1. Use `react-hooks-fixer` for hooks violations
2. Apply `code-quality-linter` for linting errors
3. Use `security-auditor` for security issues
4. Reference `cicd-pipeline-manager` for build failures

**Improving Quality:**
1. `test-writer` - Increase coverage from 0.09% to 30%+
2. `code-quality-linter` - Fix 100+ linting issues
3. `documentation-writer` - Maintain 98/100 doc score
4. `security-auditor` - Keep 100/100 security score

### By Experience Level

**Junior Developers:**
- `react-component-builder` - Learn component patterns
- `test-writer` - Understand testing practices
- `form-validation-expert` - Master form handling

**Mid-Level Developers:**
- `base44-function-builder` - Backend development
- `tanstack-query-expert` - Advanced data fetching
- `gamification-expert` - Domain logic

**Senior Developers:**
- `ai-integration-specialist` - AI features
- `security-auditor` - Security reviews
- `cicd-pipeline-manager` - Infrastructure

---

## Technical Context

### Tech Stack
- **Frontend:** React 18, Vite 6, TailwindCSS, Radix UI
- **State:** React Context + TanStack Query 5.84.1
- **Forms:** React Hook Form 7.54.2 + Zod 3.24.2
- **Backend:** Base44 SDK 0.8.3 (serverless TypeScript)
- **Testing:** Vitest 4.0.17 + React Testing Library
- **AI:** OpenAI GPT-4, Claude 3, Gemini Pro

### Project Stats
- **Pages:** 117 application pages (not 47)
- **Components:** 42+ component categories
- **Backend Functions:** 61 TypeScript functions
- **Custom Agents:** 21 specialized agents
- **Test Coverage:** 0.09% (target: 30%+ by Q1 2026)
- **Security Score:** 100/100 ✅
- **Documentation Score:** 98/100 ✅

### Known Issues
- 100+ ESLint warnings/errors
- 2 critical React Hooks violations
- Low test coverage (0.09%)
- Large bundle size (117 pages not lazy loaded)
- Need TypeScript migration (Q2-Q3 2026)
- PWA features not yet implemented (Q2 2026)

---

## Contributing

When adding new agents:

1. **Follow the template** format in existing agents
2. **Reference actual code** from the repository
3. **Include specific file paths** and patterns
4. **Provide working examples** from the codebase
5. **Update this README** with agent details

---

## Related Documentation

- [Copilot Instructions](../copilot-instructions.md) - Repository-wide guidelines
- [Setup Steps](../copilot-setup-steps.yml) - Environment setup
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
- [TESTING.md](../../TESTING.md) - Testing strategy
- [CODEBASE_AUDIT.md](../../CODEBASE_AUDIT.md) - Technical audit

---

**Maintained by:** Krosebrook  
**Questions?** Create an issue or refer to [AGENTS.md](../../AGENTS.md)
