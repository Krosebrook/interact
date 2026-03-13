# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Interact platform.

ADRs document significant architectural choices, the context in which they were made, and their consequences.

## Index

| # | Title | Status | Date |
|---|-------|--------|------|
| [001](001-use-base44-backend.md) | Use Base44 for Backend | Accepted | Dec 2024 |
| [002](002-react-over-vue.md) | Choose React over Vue | Accepted | Dec 2024 |
| [003](003-tailwind-css.md) | Use TailwindCSS for Styling | Accepted | Dec 2024 |
| [004](004-typescript-migration.md) | Migrate to TypeScript | Accepted | Jan 2026 |
| [005](005-testing-infrastructure.md) | Establish Testing Infrastructure | Accepted | Jan 2026 |
| [006](006-vite-build-tool.md) | Use Vite as Build Tool | Accepted | Dec 2024 |
| [007](007-tanstack-query-state-management.md) | Use TanStack Query for Server State | Accepted | Dec 2024 |
| [008](008-radix-ui-component-library.md) | Use Radix UI Primitives | Accepted | Dec 2024 |
| [009](009-vercel-deployment.md) | Deploy Frontend on Vercel | Accepted | Dec 2024 |

## Format

Each ADR follows this structure:
- **Status**: Accepted / Superseded / Deprecated
- **Date**: When the decision was made (or reconstructed)
- **Context**: Why the decision was needed
- **Decision**: What was decided
- **Rationale**: Why this option was chosen
- **Consequences**: Positive, negative, and neutral impacts
- **References**: File paths and links to relevant code

## Creating a New ADR

1. Copy the next sequential number
2. Create `NNN-short-title.md`
3. Fill in all sections
4. Add to this README index
5. Reference specific file paths as evidence
