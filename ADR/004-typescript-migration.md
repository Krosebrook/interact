# ADR 004: Migrate to TypeScript

**Status:** Accepted  
**Date:** January 2026  
**Deciders:** Engineering Team  

## Context

The codebase is currently JavaScript with JSDoc hints. As the project grows (566 files), type safety becomes increasingly important to prevent bugs and improve developer experience.

## Decision

We will migrate the entire codebase to TypeScript over Q2-Q3 2026.

### Rationale

**Pros:**
- Type safety catches bugs at compile time
- Better IDE support and autocomplete
- Improved refactoring confidence
- Self-documenting code
- Easier onboarding for new developers
- Industry standard for large React projects
- Base44 backend already uses TypeScript

**Cons:**
- Significant migration effort (566 files)
- Learning curve for team members
- Longer build times
- More verbose code

## Migration Plan

**Phase 1 (Q2 2026):**
- Add TypeScript to build pipeline
- Convert utilities and hooks (small files first)
- Target: 25% conversion

**Phase 2 (Q3 2026):**
- Convert components
- Convert pages
- Target: 75% conversion

**Phase 3 (Q4 2026):**
- Complete remaining files
- Remove JSDoc annotations
- Target: 100% TypeScript

## Consequences

**Positive:**
- ✅ Fewer runtime errors
- ✅ Better developer experience
- ✅ Easier refactoring
- ✅ Better documentation through types

**Negative:**
- ⚠️ Migration takes 2-3 months
- ⚠️ Temporary mixed codebase
- ⚠️ Slightly slower builds
