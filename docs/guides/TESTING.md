# Testing Guide
**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 12, 2026  
**Status:** Testing Infrastructure - Planned for Q1 2026

---

## Overview

This document outlines the testing strategy, standards, and guidelines for the Interact platform. As part of Feature 2 in our roadmap, we are establishing comprehensive testing infrastructure to achieve 80% code coverage and ensure reliability.

**Current Status:** 0% test coverage - Infrastructure implementation in progress (Q1 2026)

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Stack](#testing-stack)
3. [Testing Strategy](#testing-strategy)
4. [Test Types](#test-types)
5. [Writing Tests](#writing-tests)
6. [Running Tests](#running-tests)
7. [Code Coverage](#code-coverage)
8. [Best Practices](#best-practices)
9. [Testing Patterns](#testing-patterns)
10. [Continuous Integration](#continuous-integration)

---

## Testing Philosophy

Our testing approach follows these principles:

- **Test behavior, not implementation** - Focus on what the code does, not how it does it
- **User-centric testing** - Test from the user's perspective
- **Fast feedback** - Tests should run quickly to encourage frequent execution
- **Maintainable tests** - Write clear, simple tests that are easy to understand and update
- **Confidence over coverage** - 80% coverage with meaningful tests is better than 100% with weak tests

---

## Testing Stack

### Current Testing Tools (Q1 2026 - IMPLEMENTED ✅)

**Unit & Integration Testing:**
- **Vitest 4.0.17** ✅ - Vite-native test runner (fast, modern)
- **React Testing Library 16.1.0** ✅ - User-centric component testing
- **@testing-library/jest-dom 6.6.3** ✅ - Custom matchers for assertions
- **@testing-library/user-event 14.6.0** ✅ - User interaction simulation
- **@vitest/coverage-v8 4.0.17** ✅ - Code coverage reporting

**Test Infrastructure:**
- **vitest.config.js** ✅ - Configured with coverage reporting
- **src/test/setup.js** ✅ - Global test setup and mocks
- **src/test/test-utils.jsx** ✅ - Custom render utilities with providers
- **src/test/mock-data.js** ✅ - Mock data generators

**End-to-End Testing (Planned):**
- **Playwright** - Cross-browser E2E testing (Q1 2026 Week 6)
- **@playwright/test** - Test runner with built-in fixtures

**Component Documentation (Planned):**
- **Storybook 7.x** - Component playground and documentation (Q1 2026 Week 4)
- **@storybook/addon-a11y** - Accessibility testing
- **@storybook/addon-interactions** - Interaction testing

**Mocking:**
- **vitest.mock()** ✅ - Module mocking
- **MSW (Mock Service Worker)** - API mocking (Planned)

---

## Testing Strategy

### Current Status (January 12, 2026)

**Test Files:** 4 test files with 36 passing tests ✅
- `src/lib/utils.test.js` - 9 tests for className utilities
- `src/lib/imageUtils.test.js` - 11 tests for image utilities  
- `src/utils/index.test.js` - 10 tests for URL utilities
- `src/hooks/use-mobile.test.js` - 6 tests for mobile detection hook

**Coverage:** 0.09% baseline (started from 0%)
- Target Phase 1 (Q1 2026): 30% coverage
- Target Phase 2 (Q2 2026): 70% coverage
- Target Phase 3 (Q3 2026): 80% coverage

### Coverage Targets

| Phase | Timeline | Coverage Target | Focus Areas | Status |
|-------|----------|----------------|-------------|---------|
| Phase 1 | Q1 2026 | 30% | Utilities, hooks, helpers | 🔄 In Progress (0.09%) |
| Phase 2 | Q2 2026 | 70% | Components, services | ⏳ Planned |
| Phase 3 | Q3 2026 | 80% | E2E flows, edge cases | ⏳ Planned |

### Implementation Timeline

**✅ Week 1 (Jan 12, 2026) - COMPLETED:**
- Setup Vitest + React Testing Library
- Configure coverage reporting
- Create testing utilities and mock data generators
- Write first 36 unit tests
- All tests passing

**⏳ Week 2-3 (Planned):**
- Write 30+ additional unit tests
- Setup Storybook
- Document 20+ core components
- Add interaction tests

**⏳ Week 4-6 (Planned):**
- Setup Playwright
- Write critical E2E tests
- Integrate tests into CI/CD
- Achieve 30% coverage target

### Priority Testing Areas

**Critical Path (Must have 100% coverage):**
1. Authentication & authorization
2. Payment/reward transactions
3. Points calculation & gamification rules
4. Data privacy & GDPR compliance
5. Activity scheduling & management

**High Priority (Target 90%+ coverage):**
1. User profile management
2. Admin panel functionality
3. Analytics calculations
4. Integration with third-party services
5. Role-based access control

**Medium Priority (Target 70%+ coverage):**
1. UI components
2. Form validation
3. Navigation & routing
4. Notification systems
5. Social features

**Low Priority (Target 50%+ coverage):**
1. Styling & animations
2. Static content pages
3. Error pages
4. Documentation components

---

## Test Types

### 1. Unit Tests

**Purpose:** Test individual functions, utilities, and hooks in isolation

**When to Write:**
- For all utility functions
- For all custom hooks
- For complex business logic
- For data transformations

**Example Structure:**
```javascript
// src/utils/__tests__/formatDate.test.js
import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('formats date in MM/DD/YYYY format', () => {
    const result = formatDate(new Date('2026-01-12'));
    expect(result).toBe('01/12/2026');
  });

  it('handles invalid dates gracefully', () => {
    const result = formatDate('invalid');
    expect(result).toBe('Invalid Date');
  });
});
```

### 2. Component Tests

**Purpose:** Test React components with user interactions

**When to Write:**
- For all reusable components
- For complex UI logic
- For form components
- For components with state management

**Example Structure:**
```javascript
// src/components/__tests__/ActivityCard.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityCard } from '../ActivityCard';

describe('ActivityCard', () => {
  it('displays activity information', () => {
    render(<ActivityCard title="Team Lunch" points={50} />);
    
    expect(screen.getByText('Team Lunch')).toBeInTheDocument();
    expect(screen.getByText('50 points')).toBeInTheDocument();
  });

  it('calls onJoin when join button clicked', async () => {
    const handleJoin = vi.fn();
    const user = userEvent.setup();
    
    render(<ActivityCard title="Team Lunch" onJoin={handleJoin} />);
    await user.click(screen.getByRole('button', { name: /join/i }));
    
    expect(handleJoin).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Integration Tests

**Purpose:** Test how multiple components/modules work together

**When to Write:**
- For API integration flows
- For state management across components
- For complex user workflows
- For third-party service integration

**Example Structure:**
```javascript
// src/__tests__/integration/authentication.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';

describe('Authentication Flow', () => {
  it('logs in user and redirects to dashboard', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

### 4. End-to-End Tests

**Purpose:** Test complete user journeys from start to finish

**When to Write:**
- For critical user flows
- For multi-page workflows
- For user onboarding
- For purchase/transaction flows

**Example Structure:**
```javascript
// tests/e2e/activity-participation.spec.js
import { test, expect } from '@playwright/test';

test('user can schedule and join an activity', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Navigate to activities
  await page.waitForURL('/dashboard');
  await page.click('a[href="/activities"]');
  
  // Join activity
  await page.click('text=Team Lunch >> .. >> button:has-text("Join")');
  await expect(page.locator('text=Successfully joined')).toBeVisible();
  
  // Verify on calendar
  await page.click('a[href="/calendar"]');
  await expect(page.locator('text=Team Lunch')).toBeVisible();
});
```

---

## Writing Tests

### Test File Naming

- Unit tests: `[filename].test.js` or `__tests__/[filename].test.js`
- Component tests: `[ComponentName].test.jsx`
- E2E tests: `[feature-name].spec.js`

### Test Structure (AAA Pattern)

```javascript
describe('Feature or Component Name', () => {
  it('describes what the test does', () => {
    // Arrange - Set up test data and conditions
    const input = 'test data';
    const expected = 'expected result';
    
    // Act - Execute the code being tested
    const result = functionUnderTest(input);
    
    // Assert - Verify the result
    expect(result).toBe(expected);
  });
});
```

### Best Practices for Test Writing

**DO:**
- ✅ Write descriptive test names that explain the behavior
- ✅ Test one thing per test
- ✅ Use meaningful variable names
- ✅ Clean up after tests (restore mocks, clear storage)
- ✅ Test error states and edge cases
- ✅ Use data-testid sparingly (prefer semantic queries)

**DON'T:**
- ❌ Test implementation details
- ❌ Write brittle tests that break with refactoring
- ❌ Share state between tests
- ❌ Test third-party libraries
- ❌ Use snapshots as primary testing method
- ❌ Skip tests (fix or remove them instead)

---

## Running Tests

### Commands (When Infrastructure is Ready)

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm test -- --watch

# Run specific test file
npm test -- src/utils/formatDate.test.js

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (with browser UI)
npm run test:e2e -- --headed

# Run Storybook
npm run storybook
```

### Test Organization

```
interact/
├── src/
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── __tests__/
│   │       └── formatDate.test.js
│   ├── components/
│   │   ├── ActivityCard.jsx
│   │   └── __tests__/
│   │       └── ActivityCard.test.jsx
│   └── hooks/
│       ├── useActivityData.js
│       └── __tests__/
│           └── useActivityData.test.js
└── tests/
    ├── e2e/
    │   ├── authentication.spec.js
    │   └── activity-flow.spec.js
    └── integration/
        └── gamification.test.js
```

---

## Code Coverage

### Coverage Reports

Coverage reports will be generated automatically and stored in `coverage/` directory:

- **HTML Report:** `coverage/index.html` (open in browser)
- **Text Summary:** Displayed in terminal
- **LCOV:** `coverage/lcov.info` (for CI/CD integration)

### Coverage Thresholds

Once testing infrastructure is implemented, we'll enforce minimum coverage:

```javascript
// vitest.config.js
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```

### Interpreting Coverage

- **Statements:** % of code statements executed
- **Branches:** % of conditional branches tested
- **Functions:** % of functions called
- **Lines:** % of lines of code executed

**Goal:** Achieve 80% coverage with meaningful tests, not just to hit numbers.

---

## Best Practices

### Testing React Components

**Query Priority (React Testing Library):**
1. `getByRole` - Accessible to screen readers
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Non-interactive elements
5. `getByDisplayValue` - Form inputs with values
6. `getByAltText` - Images
7. `getByTitle` - SVG or title elements
8. `getByTestId` - Last resort only

**Example:**
```javascript
// ✅ Good - Accessible and semantic
const button = screen.getByRole('button', { name: /submit/i });

// ❌ Bad - Relies on implementation
const button = screen.getByTestId('submit-button');
```

### Mocking

**Mock External Dependencies:**
```javascript
import { vi } from 'vitest';
import { apiClient } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
```

**Mock Service Worker for API Calls:**
```javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/activities', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, title: 'Team Lunch' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Testing Async Code

```javascript
import { waitFor } from '@testing-library/react';

it('loads data asynchronously', async () => {
  render(<ActivityList />);
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
  
  // Now check for data
  expect(screen.getByText('Team Lunch')).toBeInTheDocument();
});
```

### Testing Custom Hooks

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useActivityData } from '../useActivityData';

it('fetches activity data', async () => {
  const { result } = renderHook(() => useActivityData());
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  
  expect(result.current.data).toHaveLength(3);
});
```

---

## Testing Patterns

### Testing Forms

```javascript
it('validates email format', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'invalid-email');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});
```

### Testing Error States

```javascript
it('displays error when API fails', async () => {
  apiClient.get.mockRejectedValueOnce(new Error('Network error'));
  
  render(<ActivityList />);
  
  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

### Testing Loading States

```javascript
it('shows loading spinner while fetching', () => {
  render(<ActivityList />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

### Testing Conditional Rendering

```javascript
it('shows admin controls for admin users', () => {
  render(<Dashboard role="admin" />);
  expect(screen.getByText(/manage users/i)).toBeInTheDocument();
});

it('hides admin controls for regular users', () => {
  render(<Dashboard role="participant" />);
  expect(screen.queryByText(/manage users/i)).not.toBeInTheDocument();
});
```

---

## Continuous Integration

### GitHub Actions Workflow (Planned)

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks (Planned)

Using Husky to run tests before commits:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test -- --run",
      "pre-push": "npm test -- --run --coverage"
    }
  }
}
```

---

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module" errors:**
- Check import paths use `@/` alias consistently
- Verify `jsconfig.json` or `tsconfig.json` has correct paths
- Ensure test setup file imports necessary polyfills

**Tests timeout:**
- Increase timeout: `it('test', async () => {...}, 10000)`
- Check for unhandled promises
- Verify all async operations complete

**Flaky tests:**
- Avoid testing implementation details
- Use `waitFor` for async operations
- Don't rely on timing (setTimeout in tests)
- Reset mocks between tests

**React Testing Library errors:**
- Use `screen.debug()` to see current DOM
- Check query order (prefer accessible queries)
- Verify elements are in the document before interaction

---

## Resources

### Official Documentation
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Storybook](https://storybook.js.org/)

### Recommended Reading
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Effective Snapshot Testing](https://kentcdodds.com/blog/effective-snapshot-testing)

### Related Documentation
- [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) - Feature 2: Comprehensive Testing Infrastructure
- [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) - Section 4: Testing Infrastructure
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute tests

---

## Next Steps

1. **Q1 2026 Week 3:** Setup Vitest + React Testing Library
2. **Q1 2026 Week 4:** Setup Storybook for component documentation
3. **Q1 2026 Week 5:** Write first 50 unit tests (utilities, hooks)
4. **Q1 2026 Week 6:** Setup Playwright and write E2E tests
5. **Q2 2026:** Achieve 70% coverage milestone
6. **Q3 2026:** Achieve 80% coverage milestone

---

**Document Owner:** Engineering Team  
**Last Updated:** January 12, 2026  
**Next Review:** March 2026 (after testing infrastructure is implemented)

---

**End of Testing Guide**
