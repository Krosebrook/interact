# ADR 003: Use TailwindCSS for Styling

**Status:** Accepted  
**Date:** December 2024  
**Deciders:** Engineering Team  

## Context

Needed to choose a styling approach for consistent UI development.

Options:
1. TailwindCSS utility classes
2. CSS Modules
3. Styled Components (CSS-in-JS)
4. Traditional SCSS

## Decision

We will use TailwindCSS with utility-first approach.

### Rationale

**Pros:**
- Rapid development with utility classes
- Consistent design system out of the box
- Small production bundle with purging
- Excellent responsive design utilities
- Active development and community
- Great documentation
- Works well with component libraries (Radix UI)

**Cons:**
- Learning curve for utility-first approach
- Verbose className strings
- Harder to enforce design consistency without discipline

## Consequences

**Positive:**
- ✅ Faster UI development
- ✅ Consistent spacing and colors
- ✅ Easy responsive design
- ✅ Small production CSS bundle

**Negative:**
- ⚠️ Long className strings in JSX
- ⚠️ Need discipline to avoid inline styles
