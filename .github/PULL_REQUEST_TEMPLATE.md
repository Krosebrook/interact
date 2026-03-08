## Summary

<!-- A clear and concise description of what the pull request does. -->

## Motivation / Context

<!-- Why is this change needed? Link to a related GitHub issue if applicable. -->

Closes #<!-- issue number -->

## Type of Change

<!-- Check all that apply -->

- [ ] `feat` — New feature (non-breaking change adding functionality)
- [ ] `fix` — Bug fix (non-breaking change that resolves an issue)
- [ ] `docs` — Documentation only
- [ ] `refactor` — Code change (no new feature, no bug fix)
- [ ] `test` — Adding or fixing tests
- [ ] `chore` — Dependency update, build, or tooling change
- [ ] `perf` — Performance improvement
- [ ] `ci` — CI configuration change
- [ ] `style` — Formatting, no logic change
- [ ] **BREAKING CHANGE** — Existing functionality is changed in a breaking way

## Changes Made

<!-- List the key changes in this PR (bullet points). -->

-
-
-

## Testing

<!-- Describe the tests you ran and how to reproduce them. -->

- [ ] `npm run test:run` — All existing tests pass
- [ ] New tests added for the changed code (or explain why tests are not applicable below)
- [ ] Manually tested in the browser (describe what you tested)

**Manual test steps:**
1.
2.
3.

## Screenshots / Recordings

<!-- For UI changes, include before/after screenshots or a short screen recording. -->

| Before | After |
|---|---|
| _(screenshot)_ | _(screenshot)_ |

## Checklist

<!-- Complete before requesting a review. -->

**Code Quality**
- [ ] Follows naming conventions (`docs/development/CODING_STANDARDS.md`)
- [ ] No unused imports or variables
- [ ] No `console.log` in production paths
- [ ] Complex logic has explanatory comments

**React / Frontend**
- [ ] All hooks called at top level (before any `return`)
- [ ] Loading and error states handled for async operations
- [ ] Accessible: interactive elements have clear labels

**Security**
- [ ] No credentials, keys, or PII in code or test data
- [ ] User input sanitized where rendered as HTML
- [ ] `npm audit` — no new critical or high vulnerabilities introduced

**Documentation**
- [ ] `CHANGELOG.md` updated (if user-facing change)
- [ ] Relevant docs updated (API contracts, env vars, architecture, etc.)

**Operations**
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No hard-coded environment-specific values

## Additional Notes

<!-- Anything reviewers should be aware of (design trade-offs, known limitations, follow-up work). -->
