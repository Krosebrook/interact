# ADR 002: Choose React over Vue

**Status:** Accepted  
**Date:** December 2024  
**Deciders:** Engineering Team  

## Context

Needed to select a frontend framework for the Interact platform.

Options:
1. React 18
2. Vue 3
3. Svelte
4. Angular

## Decision

We will use React 18 with functional components and hooks.

### Rationale

**Pros:**
- Largest ecosystem and community
- Team has React experience
- Abundant component libraries (Radix UI, etc.)
- Excellent tooling (React DevTools, etc.)
- Strong hiring pool
- TanStack Query for data fetching
- Next.js option if SSR needed later

**Cons:**
- More boilerplate than Vue/Svelte
- Requires more decisions (state management, routing, etc.)
- Larger bundle size than alternatives

**Why React over Vue:**
- Team expertise
- Larger talent pool for hiring
- More third-party components available
- Better TypeScript support (planned migration)

## Consequences

**Positive:**
- ✅ Fast development with existing knowledge
- ✅ Rich ecosystem of libraries
- ✅ Easy to find solutions to problems

**Negative:**
- ⚠️ Larger bundle size than Vue/Svelte
- ⚠️ More decisions needed
