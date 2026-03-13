# ADR 008: Use Radix UI Primitives for Accessible Components

**Status:** Accepted  
**Date:** December 2024 (Reconstructed from audit)  
**Deciders:** Engineering Team  

## Context

The platform required a rich, accessible component library. Options considered:
1. Radix UI headless primitives + TailwindCSS (shadcn/ui pattern)
2. Material UI (MUI)
3. Ant Design
4. Chakra UI
5. Custom components from scratch

## Decision

Use Radix UI headless primitives styled with TailwindCSS, following the shadcn/ui composition pattern.

## Rationale

- Radix UI provides WCAG-compliant keyboard navigation and ARIA attributes out of the box
- Headless design gives full styling control via TailwindCSS
- No runtime CSS-in-JS overhead
- Large set of primitives: accordion, dialog, dropdown, popover, select, tabs, toast, etc.
- `components.json` (shadcn config) present at project root

## Consequences

**Positive:**
- ✅ 24 Radix UI packages installed covering all major UI patterns
- ✅ Accessible by default (focus traps, ARIA roles)
- ✅ Consistent with TailwindCSS-first approach
- ✅ `cn()` utility in `src/lib/utils.js` handles conditional class merging

**Negative:**
- ⚠️ No pre-built themes — design system must be hand-crafted
- ⚠️ More initial setup than opinionated libraries (MUI, Ant Design)

## References

- `components.json` (shadcn/ui config)
- `src/lib/utils.js` (`cn` helper)
- `src/components/ui/` directory (all ui primitives)
- `package.json` → 24 `@radix-ui/*` packages
