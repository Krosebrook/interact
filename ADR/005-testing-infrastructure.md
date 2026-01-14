# ADR 005: Establish Testing Infrastructure

**Status:** Accepted  
**Date:** January 2026  
**Deciders:** Engineering Team  

## Context

The platform has 0% test coverage. This creates risk for:
- Bugs in production
- Difficulty refactoring
- Lack of confidence in changes
- Slow development velocity

## Decision

We will implement comprehensive testing infrastructure:
- Vitest for unit/integration tests
- React Testing Library for component tests
- Playwright for E2E tests
- Storybook for component documentation

### Rationale

**Vitest:**
- Vite-native (fast)
- Jest-compatible API
- Modern and actively developed

**React Testing Library:**
- User-centric testing
- Industry standard
- Prevents implementation testing

**Playwright:**
- Cross-browser support
- Great developer experience
- Fast and reliable

## Goals

- Q1 2026: 30% coverage
- Q2 2026: 70% coverage
- Q3 2026: 80% coverage

## Consequences

**Positive:**
- ✅ Catch bugs before production
- ✅ Confidence in refactoring
- ✅ Better documentation
- ✅ Faster development long-term

**Negative:**
- ⚠️ Initial time investment
- ⚠️ Learning curve for team
- ⚠️ Tests need maintenance
