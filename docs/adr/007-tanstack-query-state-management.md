# ADR 007: Use TanStack Query for Server State Management

**Status:** Accepted  
**Date:** December 2024 (Reconstructed from audit)  
**Deciders:** Engineering Team  

## Context

The frontend needed a pattern for fetching, caching, and synchronizing server state across the 117-page React SPA. Options considered:
1. TanStack Query (React Query) v5
2. Redux Toolkit + RTK Query
3. SWR
4. Raw `useEffect` + `useState`

## Decision

Use TanStack Query 5.84.1 for all server state management.

## Rationale

- Automatic background refetching and cache invalidation
- Deduplication of in-flight requests across components
- Optimistic updates for mutations
- Pagination and infinite scroll utilities built in
- Significantly less boilerplate than Redux
- Excellent DevTools integration

## Consequences

**Positive:**
- ✅ Consistent loading/error states across all pages
- ✅ Stale-while-revalidate caching reduces redundant API calls
- ✅ `queryClientInstance` in `src/lib/query-client.js` shared globally

**Negative:**
- ⚠️ Large v5 API surface — breaking changes from v4 require migration attention
- ⚠️ Not suitable for non-async local UI state (still uses `useState`/`useContext`)

## References

- `src/lib/query-client.js`
- `src/App.jsx` (QueryClientProvider wrapper)
- `package.json` → `"@tanstack/react-query": "^5.84.1"`
