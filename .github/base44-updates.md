# Base44 Visual Canvas Synchronization Guide

**Document Version:** 1.0.0  
**Last Updated:** January 12, 2026  
**Base44 Compatibility:** ✅ Full Support  
**API Version:** v1

---

## TL;DR

This document outlines the new modular architecture for the Interact platform, designed to support Base44's visual canvas synchronization. The architecture introduces a standardized module pattern that enables the Base44 Assistant to parse and synchronize UI components seamlessly.

**Key Changes:**
- ✅ New modular architecture in `src/modules/`
- ✅ Base44 sync attributes (`data-b44-sync="true"`) on all new components
- ✅ Standardized service layer with API versioning
- ✅ Backward compatible with existing codebase
- ✅ Complete example implementation provided

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Migration Path](#2-migration-path)
3. [Module Structure](#3-module-structure)
4. [Base44 Sync Attributes](#4-base44-sync-attributes)
5. [API Versioning Strategy](#5-api-versioning-strategy)
6. [Component Patterns](#6-component-patterns)
7. [Service Layer](#7-service-layer)
8. [Data Flow](#8-data-flow)
9. [Validation Checklist](#9-validation-checklist-2-way-sync)
10. [Example Implementation](#10-example-implementation)
11. [Integration Guidelines](#11-integration-guidelines)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Architecture Overview

### 1.1 New Modular Structure

The Interact platform now supports a modular architecture that coexists with the existing component structure. This hybrid approach ensures backward compatibility while enabling new features to benefit from enhanced Base44 integration.

```
interact/
├── src/
│   ├── modules/              # NEW: Modular feature architecture
│   │   └── [feature-name]/
│   │       ├── index.js      # Module exports
│   │       ├── components/   # Feature-specific components
│   │       ├── hooks/        # Custom React hooks
│   │       ├── services/     # Business logic and API calls
│   │       └── utils/        # Helper functions
│   ├── components/           # EXISTING: Shared components
│   ├── pages/                # EXISTING: Route components
│   └── ...
```

### 1.2 Design Principles

1. **Modularity:** Each feature is self-contained with clear boundaries
2. **Base44 Compatibility:** All new components use `data-b44-sync` attributes
3. **API Versioning:** Services implement versioned APIs (v1, v2, etc.)
4. **Backward Compatibility:** Existing code remains functional
5. **Progressive Enhancement:** Migrate features incrementally

### 1.3 Base44 Visual Canvas Benefits

- **Real-time Sync:** UI changes reflect immediately in Base44 canvas
- **Component Discovery:** Base44 Assistant can identify all synced components
- **Visual Editing:** Drag-and-drop editing in Base44 interface
- **State Management:** Bi-directional state synchronization
- **Version Control:** Track component versions across deployments

---

## 2. Migration Path

### Phase 1: Foundation (Completed)
- ✅ Create `src/modules/` directory structure
- ✅ Implement example feature module
- ✅ Document Base44 sync patterns
- ✅ Update build configuration (if needed)

### Phase 2: New Features (Current)
- 🔄 Use modular architecture for all new features
- 🔄 Apply `data-b44-sync` attributes to new components
- 🔄 Implement versioned service APIs
- 🔄 Test Base44 canvas synchronization

### Phase 3: Legacy Migration (Q2-Q3 2026)
- ⏳ Gradually migrate high-traffic components
- ⏳ Add Base44 sync to existing features
- ⏳ Consolidate similar functionality
- ⏳ Deprecate old patterns (with notice)

### Phase 4: Optimization (Q4 2026)
- ⏳ Performance tuning for large-scale deployments
- ⏳ Advanced Base44 integration features
- ⏳ Custom canvas widgets
- ⏳ Analytics and monitoring

---

## 3. Module Structure

### 3.1 Directory Organization

Each module follows this structure:

```
src/modules/[feature-name]/
├── index.js                  # Public API exports
├── components/               # React components
│   ├── [Feature]Widget.jsx
│   ├── [Feature]Card.jsx
│   └── [Feature]List.jsx
├── hooks/                    # Custom hooks
│   ├── use[Feature]Data.js
│   └── use[Feature]Mutations.js
├── services/                 # Business logic
│   └── [feature]Service.js
└── utils/                    # Helpers
    └── [feature]Helpers.js
```

### 3.2 Module Index (index.js)

```javascript
/**
 * [Feature Name] Module
 * @module [feature-name]
 * @version 1.0.0
 * @base44-compatible true
 */

export { default as FeatureWidget } from './components/FeatureWidget';
export { default as FeatureCard } from './components/FeatureCard';
export { useFeatureData } from './hooks/useFeatureData';
export { featureService } from './services/featureService';
export * from './utils/featureHelpers';
```

### 3.3 Naming Conventions

- **Module directories:** kebab-case (e.g., `example-feature`)
- **Components:** PascalCase (e.g., `ExampleFeatureWidget.jsx`)
- **Hooks:** camelCase with "use" prefix (e.g., `useExampleFeatureData.js`)
- **Services:** camelCase with "Service" suffix (e.g., `exampleFeatureService.js`)
- **Utilities:** camelCase (e.g., `exampleFeatureHelpers.js`)

---

## 4. Base44 Sync Attributes

### 4.1 Core Attributes

All Base44-compatible components MUST include these attributes on their root element:

```jsx
<div 
  data-b44-sync="true"           // REQUIRED: Marks component for sync
  data-feature="feature-name"     // REQUIRED: Feature identifier
  data-version="1.0.0"            // REQUIRED: Component version
  data-component="component-name" // OPTIONAL: Component type
>
  {/* Component content */}
</div>
```

### 4.2 Nested Sync Regions

For complex components with multiple dynamic regions:

```jsx
<div data-b44-sync="true" data-feature="dashboard">
  <header data-b44-sync="true">
    {/* Synced header content */}
  </header>
  
  <main data-b44-sync="true">
    {/* Synced main content */}
  </main>
  
  <aside>
    {/* Non-synced sidebar - static content */}
  </aside>
</div>
```

### 4.3 Conditional Sync

Some components may need conditional synchronization:

```jsx
const syncEnabled = userSettings.base44SyncEnabled;

<div 
  {...(syncEnabled && { 
    'data-b44-sync': 'true',
    'data-feature': 'feature-name' 
  })}
>
  {/* Content */}
</div>
```

### 4.4 Sync Best Practices

✅ **DO:**
- Add sync attributes to all user-facing interactive components
- Use semantic feature names (e.g., `user-dashboard`, `activity-planner`)
- Version components following semantic versioning
- Document component APIs in JSDoc comments

❌ **DON'T:**
- Add sync to purely presentational/static components
- Use generic names (e.g., `component-1`, `widget-2`)
- Change versions without updating API
- Nest too many sync regions (max 3 levels)

---

## 5. API Versioning Strategy

### 5.1 Service Versioning

All service classes MUST implement API versioning:

```javascript
class FeatureService {
  // API version constant
  static API_VERSION = 'v1';
  
  // Version-specific methods
  async fetchData() {
    // v1 implementation
  }
  
  // When introducing breaking changes, add:
  // static API_VERSION_V2 = 'v2';
  // async fetchDataV2() { ... }
}
```

### 5.2 Version Migration

When introducing breaking changes:

1. **Increment version:** `v1` → `v2`
2. **Keep old version:** Maintain `v1` for 6 months
3. **Add deprecation notice:** Log warnings for old API usage
4. **Update documentation:** Specify migration path
5. **Monitor usage:** Track v1 vs v2 adoption

### 5.3 Backward Compatibility

```javascript
// Example: Supporting multiple API versions
async fetchData(version = 'v1') {
  switch(version) {
    case 'v2':
      return this.fetchDataV2();
    case 'v1':
    default:
      return this.fetchDataV1();
  }
}
```

### 5.4 Version Headers

For Base44 function calls:

```javascript
const result = await base44.functions.MyFunction({
  ...params,
  apiVersion: 'v1'  // Explicit version
});
```

---

## 6. Component Patterns

### 6.1 Standard Widget Pattern

```jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FeatureWidget({ title, data }) {
  return (
    <div data-b44-sync="true" data-feature="feature-widget" data-version="1.0.0">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle data-b44-sync="true">{title}</CardTitle>
        </CardHeader>
        <CardContent data-b44-sync="true">
          {/* Synced content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.2 Data-Driven Component

```jsx
import { useFeatureData } from '../hooks/useFeatureData';

export default function DataDrivenComponent() {
  const { data, isLoading, error } = useFeatureData();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div data-b44-sync="true" data-feature="data-component">
      {data.map(item => (
        <div key={item.id} data-b44-sync="true">
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

### 6.3 Interactive Component

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function InteractiveComponent() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div data-b44-sync="true" data-feature="interactive-component">
      <Button onClick={() => setExpanded(!expanded)}>
        Toggle
      </Button>
      
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-b44-sync="true"
        >
          {/* Animated content */}
        </motion.div>
      )}
    </div>
  );
}
```

---

## 7. Service Layer

### 7.1 Service Class Template

```javascript
import { base44 } from '@/api/base44Client';

class FeatureService {
  static API_VERSION = 'v1';
  
  async fetchData() {
    try {
      const result = await base44.entities.Feature.filter({});
      return result;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Failed to fetch data');
    }
  }
  
  async createItem(data) {
    try {
      return await base44.entities.Feature.create(data);
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }
}

export const featureService = new FeatureService();
```

### 7.2 Error Handling

```javascript
try {
  const result = await featureService.fetchData();
  // Success handling
} catch (error) {
  if (error.code === 'ENTITY_NOT_FOUND') {
    // Handle not found
  } else if (error.code === 'PERMISSION_DENIED') {
    // Handle permission error
  } else {
    // Generic error handling
    toast.error('An error occurred');
  }
}
```

---

## 8. Data Flow

### 8.1 Component → Hook → Service → Base44

```
┌─────────────┐
│  Component  │ ← Renders UI with data-b44-sync
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│    Hook     │ ← TanStack Query for caching
└──────┬──────┘
       │ calls
       ▼
┌─────────────┐
│   Service   │ ← Business logic & API version
└──────┬──────┘
       │ invokes
       ▼
┌─────────────┐
│   Base44    │ ← SDK entities/functions
└─────────────┘
```

### 8.2 Base44 → Component Updates

```
Base44 Event → Service Listener → Query Invalidation → Component Re-render
```

---

## 9. Validation Checklist (2-Way Sync)

### 9.1 Pre-Deployment Checklist

- [ ] **Module Structure**
  - [ ] Module directory created in `src/modules/[feature-name]`
  - [ ] All required subdirectories present (components, hooks, services, utils)
  - [ ] `index.js` exports all public APIs
  - [ ] README.md added to module (optional but recommended)

- [ ] **Components**
  - [ ] All components have `data-b44-sync="true"` on root elements
  - [ ] Feature identifier added (`data-feature="feature-name"`)
  - [ ] Version number specified (`data-version="1.0.0"`)
  - [ ] Components use existing UI components from `@/components/ui/`
  - [ ] Proper error boundaries implemented
  - [ ] Loading states handled gracefully

- [ ] **Hooks**
  - [ ] Custom hooks follow `use[Feature]` naming convention
  - [ ] TanStack Query used for data fetching
  - [ ] Proper cache configuration (staleTime, refetch, etc.)
  - [ ] Error handling implemented
  - [ ] JSDoc documentation added

- [ ] **Services**
  - [ ] Service class implements `API_VERSION` constant
  - [ ] All methods have try-catch error handling
  - [ ] Base44 SDK properly integrated
  - [ ] Service exported as singleton instance
  - [ ] Version migration path documented (if applicable)

- [ ] **Utilities**
  - [ ] Helper functions are pure (no side effects)
  - [ ] Input validation implemented
  - [ ] JSDoc documentation for all functions
  - [ ] Unit tests added (if test infrastructure exists)

### 9.2 Base44 Canvas Validation

Test the following in Base44 visual canvas:

- [ ] **Component Discovery**
  - [ ] All synced components appear in Base44 component tree
  - [ ] Component names match `data-feature` attributes
  - [ ] Version numbers display correctly

- [ ] **Visual Editing**
  - [ ] Components can be selected in canvas
  - [ ] Properties panel shows component metadata
  - [ ] Layout changes reflect in real-time
  - [ ] Styles can be modified via canvas

- [ ] **State Synchronization**
  - [ ] Component state updates propagate to canvas
  - [ ] Canvas edits update component state
  - [ ] No conflicts or race conditions
  - [ ] Undo/redo functionality works

- [ ] **Data Binding**
  - [ ] Data sources properly connected
  - [ ] Dynamic content updates in real-time
  - [ ] Form submissions work correctly
  - [ ] API calls trigger expected behaviors

### 9.3 Integration Testing

- [ ] **Backward Compatibility**
  - [ ] Existing features still function correctly
  - [ ] No breaking changes to existing APIs
  - [ ] Old components coexist with new modules
  - [ ] Routes and navigation work as expected

- [ ] **Performance**
  - [ ] Page load times within acceptable range (<3s)
  - [ ] No memory leaks detected
  - [ ] Large datasets render efficiently
  - [ ] Animations are smooth (60fps)

- [ ] **Cross-Browser**
  - [ ] Chrome/Edge (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### 9.4 Documentation

- [ ] **Code Documentation**
  - [ ] JSDoc comments on all public APIs
  - [ ] Component props documented
  - [ ] Hook parameters explained
  - [ ] Service methods described

- [ ] **User Documentation**
  - [ ] Feature description added to README.md
  - [ ] Usage examples provided
  - [ ] Screenshots/GIFs of UI (if applicable)
  - [ ] Known limitations documented

- [ ] **Technical Documentation**
  - [ ] Architecture decisions recorded
  - [ ] API versioning strategy documented
  - [ ] Migration path outlined (if needed)
  - [ ] Troubleshooting guide updated

---

## 10. Example Implementation

### 10.1 Complete Module Example

See `src/modules/example-feature/` for a complete implementation including:

- ✅ **ExampleFeatureWidget.jsx** - Primary widget component with Base44 sync
- ✅ **ExampleFeatureCard.jsx** - Reusable card component
- ✅ **useExampleFeatureData.js** - TanStack Query hook for data fetching
- ✅ **exampleFeatureService.js** - Service layer with API versioning
- ✅ **exampleFeatureHelpers.js** - Utility functions for data manipulation

### 10.2 Integration Example

To use the example module in your application:

```javascript
// In a page component (e.g., src/pages/Dashboard.jsx)
import { ExampleFeatureWidget } from '@/modules/example-feature';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <ExampleFeatureWidget 
        title="My Feature" 
        showMetrics={true}
      />
      {/* Other dashboard content */}
    </div>
  );
}
```

### 10.3 Custom Hook Usage

```javascript
import { useExampleFeatureData } from '@/modules/example-feature';

function MyComponent() {
  const { data, isLoading, error, refetch } = useExampleFeatureData({
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true
  });
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

---

## 11. Integration Guidelines

### 11.1 Adding a New Feature Module

**Step 1:** Create the module structure

```bash
mkdir -p src/modules/[feature-name]/{components,hooks,services,utils}
```

**Step 2:** Create index.js

```javascript
export { default as FeatureWidget } from './components/FeatureWidget';
export { useFeatureData } from './hooks/useFeatureData';
export { featureService } from './services/featureService';
export * from './utils/featureHelpers';
```

**Step 3:** Implement components with Base44 sync

```jsx
export default function FeatureWidget() {
  return (
    <div data-b44-sync="true" data-feature="feature-name" data-version="1.0.0">
      {/* Component content */}
    </div>
  );
}
```

**Step 4:** Create service layer

```javascript
import { base44 } from '@/api/base44Client';

class FeatureService {
  static API_VERSION = 'v1';
  
  async fetchData() {
    return await base44.entities.Feature.filter({});
  }
}

export const featureService = new FeatureService();
```

**Step 5:** Add to routing (if needed)

```javascript
// In src/pages.config.js or App.jsx
import { FeaturePage } from '@/pages/Feature';

// Add to routes
{ path: '/feature', component: FeaturePage }
```

### 11.2 Migrating Existing Components

**Step 1:** Identify component for migration

**Step 2:** Add Base44 sync attributes

```jsx
// Before
<div className="card">
  {/* content */}
</div>

// After
<div 
  className="card"
  data-b44-sync="true"
  data-feature="existing-feature"
  data-version="1.0.0"
>
  {/* content */}
</div>
```

**Step 3:** Extract service logic

Move API calls and business logic from component to service class.

**Step 4:** Test synchronization

Verify component appears and functions in Base44 canvas.

---

## 12. Troubleshooting

### 12.1 Component Not Appearing in Base44 Canvas

**Symptom:** Component doesn't show up in Base44 component tree

**Solutions:**
1. Verify `data-b44-sync="true"` attribute is present
2. Check that `data-feature` has a unique, descriptive value
3. Ensure component is actually rendered (not conditionally hidden)
4. Clear Base44 cache and refresh canvas
5. Check browser console for JavaScript errors

### 12.2 Sync Attributes Not Working

**Symptom:** Changes in canvas don't reflect in application

**Solutions:**
1. Verify Base44 SDK version is up to date
2. Check that component state is properly managed (not hardcoded)
3. Ensure no aggressive caching is preventing updates
4. Verify WebSocket connection to Base44 is active
5. Check network tab for failed API requests

### 12.3 Version Conflicts

**Symptom:** API returns unexpected data or errors

**Solutions:**
1. Check `API_VERSION` constant in service
2. Verify Base44 functions support the specified version
3. Review migration documentation for version changes
4. Update client-side version to match backend
5. Clear application cache and localStorage

### 12.4 Performance Issues

**Symptom:** Application is slow or unresponsive

**Solutions:**
1. Reduce number of synced regions (remove unnecessary `data-b44-sync`)
2. Implement pagination for large datasets
3. Use React.memo for expensive components
4. Optimize TanStack Query cache settings
5. Enable code splitting with React.lazy

### 12.5 Build Errors

**Symptom:** Application fails to build

**Solutions:**
1. Run `npm install` to ensure all dependencies are installed
2. Check for circular imports between modules
3. Verify all import paths are correct (use `@/` alias)
4. Clear Vite cache: `rm -rf node_modules/.vite`
5. Check ESLint errors: `npm run lint`

---

## Support & Resources

### Base44 Resources
- **Base44 Documentation:** [https://base44.io/docs](https://base44.io/docs)
- **SDK Reference:** [https://base44.io/sdk](https://base44.io/sdk)
- **Visual Canvas Guide:** [https://base44.io/canvas](https://base44.io/canvas)
- **API Versioning:** [https://base44.io/versioning](https://base44.io/versioning)

### Interact Documentation
- **README.md** - Quick start and overview
- **PRD.md** - Product requirements and architecture
- **FEATURE_ROADMAP.md** - 18-month feature roadmap
- **CODEBASE_AUDIT.md** - Security and quality metrics
- **.github/agents.md** - AI agent context log (for future reference)

### Getting Help
1. Check this document first
2. Review example implementation in `src/modules/example-feature/`
3. Search existing issues on GitHub
4. Contact Base44 support for platform-specific issues
5. Create detailed bug reports with reproduction steps

---

**Document Status:** ✅ Complete  
**Next Review:** Q2 2026  
**Maintained By:** Engineering Team @ Krosebrook
