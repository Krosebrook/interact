# AI Agent Context Log

**Purpose:** This document serves as a historical log of AI-assisted development activities, architectural decisions, and context for future AI agents working on the Interact codebase.

**Last Updated:** January 12, 2026  
**Format Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architectural Changes](#architectural-changes)
3. [Feature Implementation Log](#feature-implementation-log)
4. [Decision Records](#decision-records)
5. [Integration Patterns](#integration-patterns)
6. [Known Issues & Workarounds](#known-issues--workarounds)
7. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Overview

### Document Purpose

This log provides context for AI agents (like Base44's "Help AI" and GitHub Copilot) to understand:
- Historical architectural decisions
- Module implementation patterns
- Integration approaches
- Common pitfalls and solutions
- Best practices specific to this codebase

### How to Use This Document

**For AI Agents:**
- Read this document when starting a new feature
- Update this document after completing significant work
- Reference decision records when making similar choices
- Check known issues before implementing workarounds

**For Human Developers:**
- Consult when onboarding to understand AI-assisted development history
- Add entries for significant AI-assisted work
- Review periodically to identify patterns and improvements

---

## Architectural Changes

### Change #1: Modular Architecture Introduction

**Date:** January 12, 2026  
**Agent:** GitHub Copilot Lead Repository Agent  
**Change Type:** New Architecture Pattern  
**Status:** ✅ Implemented

#### Context

The Interact platform initially used a flat component structure under `src/components/` with 42+ component categories. While functional, this structure made it difficult to:
1. Identify feature boundaries
2. Manage feature-specific dependencies
3. Support Base44 visual canvas synchronization
4. Scale to 15+ planned features in the roadmap

#### Decision

Introduced a new modular architecture pattern using `src/modules/[feature-name]/` directory structure that:
- Coexists with existing component structure (hybrid approach)
- Provides clear feature boundaries
- Supports Base44 sync attributes for visual editing
- Implements API versioning at the service layer
- Enables independent feature development

#### Implementation

Created the following structure:

```
src/modules/
└── [feature-name]/
    ├── index.js              # Public API exports
    ├── components/           # Feature-specific React components
    │   ├── [Feature]Widget.jsx
    │   └── [Feature]Card.jsx
    ├── hooks/                # Custom React hooks for data fetching
    │   └── use[Feature]Data.js
    ├── services/             # Business logic and Base44 integration
    │   └── [feature]Service.js
    └── utils/                # Helper functions
        └── [feature]Helpers.js
```

#### Rationale

1. **Modularity:** Each feature is self-contained with clear boundaries
2. **Base44 Compatibility:** Standardized structure makes it easier to apply sync attributes
3. **Scalability:** New features can be added without affecting existing code
4. **Maintainability:** Feature-specific code is easier to locate and modify
5. **Testing:** Module boundaries make unit testing more straightforward

#### Migration Strategy

**Phase 1 (Q1 2026):** Use modular architecture for all new features  
**Phase 2 (Q2-Q3 2026):** Gradually migrate high-traffic existing features  
**Phase 3 (Q4 2026):** Full migration complete, deprecate old patterns

#### Impact

- ✅ **Backward Compatibility:** Existing components continue to work
- ✅ **Developer Experience:** Clearer code organization
- ✅ **Base44 Integration:** Better visual canvas support
- ⚠️ **Learning Curve:** Developers need to understand two patterns during transition

#### Related Documents

- `.github/base44-updates.md` - Detailed implementation guide
- `README.md` - Updated project structure section
- `PRD.md` - Architecture section

---

### Change #2: Base44 Sync Attribute Pattern

**Date:** January 12, 2026  
**Agent:** GitHub Copilot Lead Repository Agent  
**Change Type:** UI Pattern Standard  
**Status:** ✅ Implemented

#### Context

Base44 platform provides a visual canvas for editing UI components. For the canvas to identify and synchronize components, they need special data attributes.

#### Decision

Established a standard pattern for Base44 sync attributes:

```jsx
<div 
  data-b44-sync="true"           // Marks component for sync
  data-feature="feature-name"     // Feature identifier
  data-version="1.0.0"            // Component version
  data-component="component-name" // Optional: Component type
>
  {/* Component content */}
</div>
```

#### Implementation Rules

1. **Required Attributes:**
   - `data-b44-sync="true"` - On all user-facing interactive components
   - `data-feature` - Descriptive feature name (kebab-case)
   - `data-version` - Semantic version number

2. **Optional Attributes:**
   - `data-component` - Specific component type within feature
   - Custom data attributes for feature-specific metadata

3. **Best Practices:**
   - Apply to root element of component
   - Use semantic feature names
   - Nest sync regions sparingly (max 3 levels)
   - Don't sync purely presentational components

#### Example Implementation

See `src/modules/example-feature/components/ExampleFeatureWidget.jsx` for complete example.

#### Impact

- ✅ Components discoverable in Base44 canvas
- ✅ Visual editing enabled for synced components
- ✅ Version tracking across deployments
- ⚠️ Slight increase in DOM size (minimal performance impact)

---

### Change #3: API Versioning Strategy

**Date:** January 12, 2026  
**Agent:** GitHub Copilot Lead Repository Agent  
**Change Type:** Service Layer Pattern  
**Status:** ✅ Implemented

#### Context

As features evolve, breaking changes to APIs are inevitable. Without versioning, changes can break existing functionality.

#### Decision

All service classes must implement API versioning:

```javascript
class FeatureService {
  static API_VERSION = 'v1';
  
  async fetchData() {
    // v1 implementation
  }
}
```

#### Version Migration Process

1. **Increment version:** `v1` → `v2`
2. **Maintain old version:** Keep v1 for 6 months
3. **Add deprecation warning:** Log usage of old API
4. **Document migration:** Provide upgrade path
5. **Monitor adoption:** Track version usage metrics

#### Benefits

- Backward compatibility during migrations
- Clear API evolution tracking
- Safer deployments with multiple versions
- Better Base44 function integration

---

## Feature Implementation Log

### Feature: Example Feature Module

**Date:** January 12, 2026  
**Agent:** GitHub Copilot Lead Repository Agent  
**Type:** Example Implementation / Reference Architecture  
**Status:** ✅ Complete

#### Description

Created a complete example feature module demonstrating all architectural patterns and best practices for the Interact platform.

#### Components Implemented

1. **ExampleFeatureWidget.jsx**
   - Primary widget component
   - Base44 sync attributes
   - TanStack Query integration
   - Loading and error states
   - Expandable details section
   - Framer Motion animations

2. **ExampleFeatureCard.jsx**
   - Reusable card component
   - Simpler sync pattern
   - Demonstrates composition

3. **useExampleFeatureData.js**
   - Custom hook for data fetching
   - TanStack Query configuration
   - Error handling
   - Retry logic

4. **exampleFeatureService.js**
   - Service layer implementation
   - API versioning
   - CRUD operations
   - Base44 SDK integration patterns
   - Error handling

5. **exampleFeatureHelpers.js**
   - Utility functions
   - Data formatting
   - Validation
   - Filtering and sorting

#### Technical Decisions

**State Management:** TanStack Query for server state
- **Why:** Already used throughout the app
- **Benefits:** Built-in caching, refetching, error handling
- **Alternative Considered:** Redux (too heavyweight for current needs)

**Styling:** Tailwind CSS + Radix UI components
- **Why:** Matches existing patterns
- **Benefits:** Consistency, accessibility, maintainability
- **Alternative Considered:** Custom CSS modules (not worth the inconsistency)

**Animations:** Framer Motion
- **Why:** Already a project dependency
- **Benefits:** Smooth animations, declarative API
- **Alternative Considered:** CSS animations (less flexible)

#### Code Quality

- ✅ ESLint compliant
- ✅ JSDoc comments on all public APIs
- ✅ Proper error handling
- ✅ TypeScript-ready (can be migrated easily)
- ✅ Follows React hooks rules
- ✅ Proper dependency arrays

#### Usage

```javascript
import { ExampleFeatureWidget } from '@/modules/example-feature';

<ExampleFeatureWidget title="My Feature" showMetrics={true} />
```

#### Files Created

- `/src/modules/example-feature/index.js`
- `/src/modules/example-feature/components/ExampleFeatureWidget.jsx`
- `/src/modules/example-feature/components/ExampleFeatureCard.jsx`
- `/src/modules/example-feature/hooks/useExampleFeatureData.js`
- `/src/modules/example-feature/services/exampleFeatureService.js`
- `/src/modules/example-feature/utils/exampleFeatureHelpers.js`

#### Lessons Learned

1. **Base44 sync attributes are lightweight** - minimal DOM overhead
2. **Module exports should be explicit** - easier to track dependencies
3. **Service layer is valuable** - separates concerns effectively
4. **Mock data helpful for demos** - service can work without backend initially

---

## Decision Records

### DR-001: Hybrid Architecture (Modules + Components)

**Status:** Accepted  
**Date:** January 12, 2026  
**Decision Makers:** GitHub Copilot Agent (following best practices)

#### Problem

Should we migrate all existing components to the new modular architecture immediately, or use a hybrid approach?

#### Options Considered

1. **Big Bang Migration:** Move all components to modules immediately
   - ✅ Consistent structure from day one
   - ❌ High risk of breaking existing functionality
   - ❌ Large time investment upfront

2. **Hybrid Approach:** New features use modules, existing code stays put
   - ✅ Zero risk to existing functionality
   - ✅ Incremental migration possible
   - ❌ Two patterns in codebase (temporary)
   - ⚠️ Need clear guidelines on which to use

3. **No Migration:** Keep existing structure only
   - ✅ Zero migration cost
   - ❌ No Base44 visual canvas benefits
   - ❌ Technical debt continues

#### Decision

**Option 2: Hybrid Approach**

#### Rationale

- Minimizes risk during active development
- Allows Base44 integration for new features immediately
- Provides time to validate architecture before full migration
- Aligns with "make minimal changes" principle
- Supports the 18-month roadmap without disruption

#### Implementation

- New features MUST use modular architecture
- Existing components remain in place
- Migration happens incrementally during Q2-Q3 2026
- Both patterns documented in README and Copilot instructions

---

### DR-002: Service Layer Required for All Modules

**Status:** Accepted  
**Date:** January 12, 2026  
**Decision Makers:** GitHub Copilot Agent

#### Problem

Should every module have a service layer, even for simple features?

#### Options Considered

1. **Always Required:** Every module must have services directory
   - ✅ Consistent structure
   - ✅ Easier to extend later
   - ❌ Overhead for trivial features

2. **Optional:** Add service layer only when needed
   - ✅ Less boilerplate for simple features
   - ❌ Inconsistent structure
   - ❌ Hard to add later without refactoring

#### Decision

**Option 1: Always Required**

#### Rationale

- Base44 integration often requires backend calls
- API versioning is easier with service layer from start
- Component reusability improves when logic is separated
- Minimal overhead (just a simple class)
- Testing is easier with service abstraction

---

### DR-003: TanStack Query for All Data Fetching

**Status:** Accepted  
**Date:** January 12, 2026  
**Decision Makers:** GitHub Copilot Agent (following existing patterns)

#### Problem

How should modules fetch data from Base44?

#### Options Considered

1. **TanStack Query (React Query):** Already used in codebase
   - ✅ Built-in caching and refetching
   - ✅ Excellent developer experience
   - ✅ Handles loading and error states
   - ✅ Already a dependency

2. **Direct useEffect + fetch:** Manual state management
   - ✅ No additional dependencies
   - ❌ Reinventing the wheel
   - ❌ Error-prone
   - ❌ Inconsistent with existing code

3. **Redux Toolkit Query:** Alternative solution
   - ✅ Similar features to TanStack Query
   - ❌ Would require Redux adoption
   - ❌ More complex setup

#### Decision

**Option 1: TanStack Query**

#### Rationale

- Already used throughout the application
- Team familiarity (based on existing code patterns)
- Excellent documentation and community support
- Perfect fit for server-state management
- Integrates well with Base44 SDK

---

## Integration Patterns

### Pattern 1: Base44 Entity CRUD

**When to Use:** Working with Base44 database entities

**Pattern:**

```javascript
// Service
import { base44 } from '@/api/base44Client';

async fetchItems() {
  return await base44.entities.Feature.filter({ status: 'active' });
}

async createItem(data) {
  return await base44.entities.Feature.create(data);
}

async updateItem(id, updates) {
  return await base44.entities.Feature.update(id, updates);
}

async deleteItem(id) {
  return await base44.entities.Feature.delete(id);
}
```

**Why This Works:**
- Clean separation of concerns
- Easy to mock for testing
- Consistent error handling
- Supports API versioning

---

### Pattern 2: Base44 Function Invocation

**When to Use:** Calling serverless functions

**Pattern:**

```javascript
async analyzeData(params) {
  return await base44.functions.DataAnalyzer(params);
}

// With AI integration
async generateInsights(data) {
  return await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze: ${JSON.stringify(data)}`,
    response_json_schema: { /* schema */ }
  });
}
```

**Why This Works:**
- Leverages Base44's serverless architecture
- Supports AI integrations
- No infrastructure management needed

---

### Pattern 3: TanStack Query with Base44

**When to Use:** All data fetching in components

**Pattern:**

```javascript
// Hook
import { useQuery, useMutation } from '@tanstack/react-query';
import { featureService } from '../services/featureService';

export function useFeatureData() {
  return useQuery({
    queryKey: ['feature-data'],
    queryFn: () => featureService.fetchData(),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => featureService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['feature-data']);
    }
  });
}
```

**Why This Works:**
- Automatic caching and refetching
- Optimistic updates possible
- Invalidation triggers re-fetches
- Loading and error states handled

---

## Known Issues & Workarounds

### Issue #1: Base44 Sync Attributes in Production Builds

**Symptom:** Data attributes stripped during Vite production build

**Status:** ⚠️ Potential Issue (Not Confirmed)

**Workaround:**

If attributes are being stripped, add to `vite.config.js`:

```javascript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        keep_fargs: false,
        keep_fnames: false,
      },
      mangle: {
        keep_fnames: false,
      },
      format: {
        comments: false,
      },
    },
  },
});
```

Ensure HTML attributes are preserved.

**Prevention:**
- Test production builds regularly
- Add E2E tests that check for data attributes
- Monitor Base44 canvas integration after deployments

---

### Issue #2: Circular Dependencies Between Modules

**Symptom:** Build errors or runtime errors about missing exports

**Status:** ⚠️ Preventable

**Cause:** Module A imports from Module B, which imports from Module A

**Workaround:**

1. Extract shared code to a common utility module
2. Use dependency injection pattern
3. Restructure modules to have clear hierarchy

**Prevention:**
- Keep modules independent
- Share code through utility libraries, not cross-imports
- Use ESLint plugin to detect circular dependencies

---

### Issue #3: React Hooks Violations

**Symptom:** "Hooks called conditionally" errors

**Status:** ⚠️ Known Codebase Issue (2 violations in existing code)

**Prevention in New Modules:**

✅ **Correct:**
```javascript
function Component({ enabled }) {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    enabled: enabled  // Control with 'enabled' option
  });
  
  return <div>{data}</div>;
}
```

❌ **Incorrect:**
```javascript
function Component({ enabled }) {
  if (enabled) {
    const { data } = useQuery({...});  // Never conditional!
  }
  return <div>{data}</div>;
}
```

---

## AI Assistant Guidelines

### For Future AI Agents

When working on this codebase:

#### 1. Always Check These Documents First

- **README.md** - Project overview and quick start
- **.github/copilot-instructions.md** - Coding standards and patterns
- **.github/base44-updates.md** - Base44 integration guide
- **This file (agents.md)** - Historical context and decisions
- **PRD.md** - Product requirements and architecture
- **FEATURE_ROADMAP.md** - Planned features and priorities

#### 2. Follow the Module Pattern for New Features

```bash
# Create module structure
mkdir -p src/modules/[feature-name]/{components,hooks,services,utils}

# Implement required files
- index.js (exports)
- components/ (with Base44 sync attributes)
- hooks/ (TanStack Query)
- services/ (with API versioning)
- utils/ (helper functions)
```

#### 3. Base44 Sync Attribute Checklist

- [ ] Root element has `data-b44-sync="true"`
- [ ] Feature identifier added (`data-feature`)
- [ ] Version number specified (`data-version`)
- [ ] Meaningful, descriptive names (no generic "feature-1")

#### 4. Service Layer Checklist

- [ ] Class has `API_VERSION` constant
- [ ] All methods have try-catch blocks
- [ ] Errors are logged and re-thrown with context
- [ ] Service exported as singleton instance
- [ ] JSDoc comments on all public methods

#### 5. Testing Requirements

- [ ] Test module in isolation before integration
- [ ] Run `npm run lint` before committing
- [ ] Test in Base44 canvas (if applicable)
- [ ] Verify backward compatibility with existing features
- [ ] Check for React Hooks violations

#### 6. Documentation Requirements

- [ ] Update this file (agents.md) with significant changes
- [ ] Add JSDoc comments to all public APIs
- [ ] Update README.md if adding user-facing features
- [ ] Document any architectural decisions (Decision Records section)

#### 7. Common Pitfalls to Avoid

❌ Don't call React hooks conditionally  
❌ Don't create circular dependencies between modules  
❌ Don't skip Base44 sync attributes on new components  
❌ Don't hardcode API endpoints (use Base44 SDK)  
❌ Don't forget to handle loading and error states  
❌ Don't nest sync regions too deeply (max 3 levels)  
❌ Don't commit without running linter  

#### 8. When to Ask for Human Help

- When architectural decisions conflict with existing patterns
- When Base44 integration behaves unexpectedly
- When security vulnerabilities are detected
- When breaking changes are necessary
- When unsure about product requirements

---

## Version History

### v1.0.0 - January 12, 2026

**Initial Release**

- ✅ Documented modular architecture introduction
- ✅ Recorded Base44 sync attribute pattern
- ✅ Established API versioning strategy
- ✅ Logged example feature implementation
- ✅ Created decision records (DR-001 to DR-003)
- ✅ Defined integration patterns
- ✅ Listed known issues and workarounds
- ✅ Provided AI assistant guidelines

**Created By:** GitHub Copilot Lead Repository Agent  
**Purpose:** Enable future AI agents and Base44 Help AI to understand codebase context

---

## Future Entries Template

When adding new entries to this log, use this template:

### Feature: [Feature Name]

**Date:** YYYY-MM-DD  
**Agent:** [AI Agent Name]  
**Type:** [Feature/Architecture/Bug Fix]  
**Status:** [In Progress/Complete/Deprecated]

#### Description

[What was implemented and why]

#### Technical Decisions

[Key technical choices made]

#### Files Changed/Created

- [List of files]

#### Lessons Learned

[What worked well, what didn't]

---

**Document Maintained By:** AI Agents & Engineering Team  
**Last Review:** January 12, 2026  
**Next Review:** As needed (after significant changes)
