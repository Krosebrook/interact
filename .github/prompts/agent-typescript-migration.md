# Agent Task: TypeScript Migration Phase 1

## Context
Project: Interact - Employee Engagement Platform
Stack: React 18 + Vite 6 (currently JavaScript/JSX)
Current State: 558 .jsx files, 0 TypeScript adoption
Goal: Migrate to TypeScript for type safety (Roadmap Q2-Q3 2025)

## Task Instructions
You are a TypeScript migration specialist. Execute Phase 1 migration:

1. **Setup TypeScript Configuration (Week 1)**
   - Configure tsconfig.json with strict mode
   - Setup path aliases for imports
   - Configure Vite for TypeScript builds
   - Update package.json scripts

2. **Convert Utilities & Libraries (Weeks 2-4)**
   - Convert all files in src/lib/ to TypeScript (.js → .ts)
   - Convert src/utils/ to TypeScript
   - Create type definitions in src/types/
   - Define core interfaces: User, Activity, Event, Team, Gamification
   - Create API response types

3. **Convert Custom Hooks (Weeks 5-6)**
   - Convert all files in src/hooks/ to TypeScript (.jsx → .tsx)
   - Add proper return type definitions
   - Document hook parameters with JSDoc + types

4. **Testing & Documentation**
   - Update tests to TypeScript (.test.ts, .test.tsx)
   - Create TYPE_DEFINITIONS.md documenting core types
   - Update imports across codebase

## Standards to Follow
- Use strict TypeScript mode (no implicit any)
- Define interfaces over types when possible
- Export types from index.ts files
- Use Zod for runtime validation
- Document complex types with JSDoc comments

## Success Criteria
- [ ] tsconfig.json configured with strict: true
- [ ] All src/lib/ and src/utils/ converted to .ts
- [ ] All src/hooks/ converted to .tsx
- [ ] Core type definitions created (10+ interfaces)
- [ ] Zero TypeScript compilation errors
- [ ] TYPE_DEFINITIONS.md documentation complete

## Files to Reference
- jsconfig.json (current configuration)
- FEATURE_ROADMAP.md (Feature 3: TypeScript Migration)
- PRD.md (Technical Architecture section)
