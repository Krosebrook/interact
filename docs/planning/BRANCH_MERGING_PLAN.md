# Branch Merging Plan

**Version:** 1.0.0
**Created:** January 16, 2026
**Status:** Active
**Purpose:** Strategic planning document for safe, coordinated branch merging

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Merge Strategy Decision Matrix](#merge-strategy-decision-matrix)
3. [Risk Assessment Framework](#risk-assessment-framework)
4. [Single Branch Merge Process](#single-branch-merge-process)
5. [Multi-Branch Coordination](#multi-branch-coordination)
6. [Rollback & Recovery Procedures](#rollback--recovery-procedures)
7. [Merge Conflict Resolution Strategy](#merge-conflict-resolution-strategy)
8. [Post-Merge Verification](#post-merge-verification)
9. [Emergency Procedures](#emergency-procedures)
10. [Automation & Tooling Reference](#automation--tooling-reference)

---

## Executive Summary

This document provides a strategic framework for safely merging branches in the Interact platform. It complements existing documentation by adding:

- **Decision matrices** for choosing merge strategies
- **Risk assessment** frameworks for evaluating merge complexity
- **Multi-branch coordination** guidelines
- **Rollback procedures** with step-by-step recovery

### Quick Reference

| Scenario | Recommended Action |
|----------|-------------------|
| Simple feature (1-5 files) | Standard merge via PR |
| Complex feature (6+ files) | Use safe-merge script + peer review |
| Multiple dependent branches | Sequential merge with coordination |
| Hotfix to production | Fast-track with mandatory rollback plan |
| Breaking changes | Staged rollout with feature flags |

---

## Merge Strategy Decision Matrix

### Decision Flowchart

```
                    START
                      |
                      v
            +------------------+
            | How many files   |
            | are changed?     |
            +------------------+
                   |
          +--------+--------+
          |                 |
       1-5 files         6+ files
          |                 |
          v                 v
    +-----------+    +---------------+
    | Standard  |    | Risk Level?   |
    | PR Merge  |    +---------------+
    +-----------+           |
                    +-------+-------+
                    |               |
                  LOW           MEDIUM/HIGH
                    |               |
                    v               v
            +-----------+    +----------------+
            | Safe      |    | Staged Merge   |
            | Merge     |    | with Review    |
            | Script    |    +----------------+
            +-----------+

```

### Merge Type Selection

| Condition | Merge Type | Command |
|-----------|------------|---------|
| Small, atomic changes | Squash & Merge | GitHub PR UI |
| Feature with meaningful commits | Merge Commit | `git merge --no-ff` |
| Experimental/WIP | Rebase & Merge | `git rebase main` |
| Critical hotfix | Fast-forward (exception) | `git merge --ff-only` |

### When to Use Each Strategy

#### Standard PR Merge
- Routine feature additions
- Documentation updates
- Bug fixes with clear scope
- Dependency updates

#### Safe Merge Script
- Larger features (6+ files changed)
- Changes touching critical paths
- First merge after extended development
- Team members unfamiliar with codebase

#### Staged Merge with Review
- Breaking API changes
- Database schema modifications
- Security-related changes
- Performance-critical updates

---

## Risk Assessment Framework

### Risk Scoring Matrix

Rate each factor 1-3 (Low/Medium/High):

| Factor | Weight | Score | Weighted |
|--------|--------|-------|----------|
| Files Changed | 2x | ___ | ___ |
| Lines Modified | 1x | ___ | ___ |
| Critical Path Touched | 3x | ___ | ___ |
| External Dependencies | 2x | ___ | ___ |
| Test Coverage | 2x | ___ | ___ |
| Time Since Last Main Sync | 1x | ___ | ___ |

**Risk Levels:**
- **Low (11-18):** Standard PR merge
- **Medium (19-26):** Safe merge script required
- **High (27-33):** Staged merge with multiple reviewers

### Critical Paths (Require Extra Caution)

```
src/
├── api/              # API client - affects all data fetching
├── contexts/         # React contexts - global state
├── lib/auth/         # Authentication - security critical
├── lib/utils/        # Shared utilities - wide impact
└── modules/core/     # Core business logic
```

### Pre-Merge Risk Checklist

```bash
# Run before any merge to assess risk
git diff --stat main..HEAD | tail -1          # Files/lines changed
git log --oneline main..HEAD | wc -l          # Commit count
git diff --name-only main..HEAD | grep -E '(api|contexts|lib|modules/core)' # Critical paths
```

---

## Single Branch Merge Process

### Standard Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE BRANCH MERGE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PRE-FLIGHT CHECKS                                        │
│     ├── Branch is up to date with main                       │
│     ├── All CI checks pass                                   │
│     ├── Code review approved                                 │
│     └── Risk assessment completed                            │
│                                                              │
│  2. BACKUP CREATION                                          │
│     └── git branch backup-before-merge-$(date +%Y%m%d)       │
│                                                              │
│  3. MERGE EXECUTION                                          │
│     ├── Option A: GitHub PR (recommended for most)           │
│     └── Option B: ./scripts/safe-merge-branch.sh <branch>    │
│                                                              │
│  4. VERIFICATION                                             │
│     ├── Build succeeds                                       │
│     ├── Tests pass                                           │
│     └── Manual smoke test                                    │
│                                                              │
│  5. CLEANUP                                                  │
│     ├── Delete feature branch                                │
│     └── Archive backup after 48 hours                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Commands Reference

```bash
# Step 1: Pre-flight
git fetch origin
git checkout <branch-name>
git merge main                    # Sync with main
npm run lint && npm test          # Verify quality

# Step 2: Create backup
git checkout main
git branch backup-$(date +%Y%m%d-%H%M%S)

# Step 3: Merge (using script)
./scripts/safe-merge-branch.sh <branch-name>

# Step 4: Verify
npm run build
npm run preview                   # Manual testing

# Step 5: Cleanup
git branch -d <branch-name>
git push origin --delete <branch-name>
```

---

## Multi-Branch Coordination

### Scenario: Multiple Features Ready for Merge

When multiple branches are ready to merge, coordinate to prevent conflicts:

```
                    main
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    feature-A     feature-B     feature-C
    (Ready)       (Ready)       (Ready)
        │             │             │
        │   MERGE ORDER DECISION    │
        │             │             │
        ▼             ▼             ▼
    ┌─────────────────────────────────┐
    │ 1. Identify dependencies        │
    │ 2. Check for file overlaps      │
    │ 3. Determine merge sequence     │
    │ 4. Execute sequentially         │
    └─────────────────────────────────┘
```

### Dependency Analysis

```bash
# Check for file overlaps between branches
git diff --name-only main..feature-A > /tmp/files-A.txt
git diff --name-only main..feature-B > /tmp/files-B.txt
git diff --name-only main..feature-C > /tmp/files-C.txt

# Find common files
comm -12 <(sort /tmp/files-A.txt) <(sort /tmp/files-B.txt)
```

### Merge Sequence Rules

1. **Independent branches** (no file overlap): Merge in any order
2. **Overlapping branches**: Merge largest/oldest first
3. **Dependent branches**: Merge dependency first
4. **Conflicting branches**: Coordinate with authors

### Sequential Merge Protocol

```bash
#!/bin/bash
# multi-branch-merge.sh

BRANCHES=("feature-A" "feature-B" "feature-C")

for branch in "${BRANCHES[@]}"; do
    echo "=== Merging $branch ==="

    # Update branch with latest main
    git checkout "$branch"
    git merge main

    # Run tests after sync
    npm test || { echo "Tests failed on $branch"; exit 1; }

    # Merge to main
    git checkout main
    ./scripts/safe-merge-branch.sh "$branch"

    echo "=== $branch merged successfully ==="
    echo ""
done
```

### Conflict Prevention Matrix

| Branch A Changes | Branch B Changes | Risk | Action |
|-----------------|------------------|------|--------|
| Component X | Component Y | Low | Parallel OK |
| Component X | Component X | High | Sequential + Review |
| Shared utility | Uses utility | Medium | Utility first |
| API endpoints | API consumers | High | Endpoints first |

---

## Rollback & Recovery Procedures

### Immediate Rollback (< 1 hour after merge)

```bash
# Option 1: Revert merge commit
git log --oneline -5              # Find merge commit SHA
git revert -m 1 <merge-sha>       # Revert, keeping main as parent
git push origin main

# Option 2: Reset to backup (if not pushed)
git reset --hard backup-before-merge-YYYYMMDD
```

### Delayed Rollback (> 1 hour, changes pushed)

```bash
# Step 1: Create rollback branch
git checkout main
git checkout -b rollback-<feature-name>

# Step 2: Identify commits to revert
git log --oneline --since="2 hours ago"

# Step 3: Revert specific commits
git revert <commit-sha-1> <commit-sha-2> ...

# Step 4: Create PR for rollback
git push origin rollback-<feature-name>
# Create PR via GitHub UI

# Step 5: Fast-track merge (requires approval)
```

### Recovery Decision Tree

```
PROBLEM DETECTED
      │
      ▼
┌─────────────────┐
│ Is production   │
│ affected?       │
└─────────────────┘
      │
   Yes │ No
      │  └──► Monitor, fix in next release
      ▼
┌─────────────────┐
│ Can issue be    │
│ fixed quickly?  │
│ (< 30 min)      │
└─────────────────┘
      │
   Yes │ No
      │  │
      │  └──► ROLLBACK IMMEDIATELY
      ▼
┌─────────────────┐
│ Apply hotfix    │
│ & deploy        │
└─────────────────┘
```

### Backup Retention Policy

| Backup Type | Retention | Auto-Delete |
|-------------|-----------|-------------|
| Pre-merge backup | 7 days | Yes |
| Release backup | 30 days | No |
| Emergency backup | 90 days | No |

---

## Merge Conflict Resolution Strategy

### Prevention First

```bash
# Daily sync with main (for long-running branches)
git fetch origin
git merge origin/main

# Or rebase for cleaner history
git rebase origin/main
```

### Resolution Protocol

```
CONFLICT DETECTED
       │
       ▼
┌──────────────────────────────────────┐
│ 1. ASSESS                            │
│    - How many files?                 │
│    - Critical paths affected?        │
│    - Original author available?      │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 2. COMMUNICATE                       │
│    - Notify affected developers      │
│    - Schedule resolution session     │
│    - Document conflict scope         │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 3. RESOLVE                           │
│    - Use visual merge tool           │
│    - Review each conflict carefully  │
│    - Test after resolution           │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 4. VERIFY                            │
│    - Run full test suite             │
│    - Manual testing of affected area │
│    - Code review of resolution       │
└──────────────────────────────────────┘
```

### Conflict Resolution Commands

```bash
# View conflicted files
git status | grep "both modified"

# Use VS Code to resolve
code .

# Or use built-in merge tool
git mergetool

# After resolution
git add <resolved-files>
git commit -m "Resolve merge conflicts in <area>"

# If resolution is wrong, start over
git merge --abort
```

---

## Post-Merge Verification

### Automated Verification Checklist

```bash
#!/bin/bash
# post-merge-verify.sh

echo "=== Post-Merge Verification ==="

# 1. Build check
echo "Building project..."
npm run build || { echo "BUILD FAILED"; exit 1; }
echo "✓ Build successful"

# 2. Test suite
echo "Running tests..."
npm test || { echo "TESTS FAILED"; exit 1; }
echo "✓ Tests passed"

# 3. Lint check
echo "Running linter..."
npm run lint || echo "⚠ Linting warnings (non-blocking)"
echo "✓ Lint complete"

# 4. Security audit
echo "Running security audit..."
npm audit --audit-level=high || echo "⚠ Security warnings"
echo "✓ Audit complete"

# 5. Bundle size check
echo "Checking bundle size..."
npm run build 2>&1 | grep -E "chunk|bundle" || true

echo ""
echo "=== Verification Complete ==="
```

### Manual Verification Points

| Area | What to Check | Priority |
|------|---------------|----------|
| Authentication | Login/logout flows | Critical |
| Navigation | All routes accessible | High |
| Forms | Submission and validation | High |
| API calls | Data loading correctly | Critical |
| UI rendering | No visual regressions | Medium |

### Monitoring Checklist (First 24 Hours)

- [ ] Check error logging dashboard
- [ ] Monitor API response times
- [ ] Review user feedback channels
- [ ] Verify analytics tracking
- [ ] Check CI/CD pipeline status

---

## Emergency Procedures

### Severity Levels

| Level | Description | Response |
|-------|-------------|----------|
| P0 | Production down | Immediate rollback |
| P1 | Major feature broken | Rollback within 1 hour |
| P2 | Minor feature affected | Fix forward if possible |
| P3 | Cosmetic issues | Fix in next release |

### P0/P1 Emergency Protocol

```
┌────────────────────────────────────────────────────────────┐
│                    EMERGENCY RESPONSE                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  MINUTE 0-5: ASSESS                                         │
│  ├── Confirm production impact                              │
│  ├── Identify recent deployments                            │
│  └── Alert on-call team                                     │
│                                                             │
│  MINUTE 5-15: DECIDE                                        │
│  ├── Rollback? Fix forward?                                 │
│  ├── Assign incident commander                              │
│  └── Begin communication to stakeholders                    │
│                                                             │
│  MINUTE 15-30: EXECUTE                                      │
│  ├── Perform rollback or deploy fix                         │
│  ├── Verify resolution                                      │
│  └── Monitor for recurrence                                 │
│                                                             │
│  HOUR 1-24: FOLLOW-UP                                       │
│  ├── Document incident                                      │
│  ├── Root cause analysis                                    │
│  └── Implement preventive measures                          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Emergency Rollback Commands

```bash
# Quick rollback (last merge)
git log --oneline -5              # Identify merge commit
git revert -m 1 HEAD              # Revert last merge
git push origin main              # Deploy rollback

# Rollback to specific point
git log --oneline --since="4 hours ago"
git revert -m 1 <merge-sha>
git push origin main

# Nuclear option (force reset) - USE WITH EXTREME CAUTION
git reset --hard <known-good-sha>
git push origin main --force      # Requires admin privileges
```

---

## Automation & Tooling Reference

### Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `safe-merge-branch.sh` | Automated safe merge | `./scripts/safe-merge-branch.sh <branch>` |
| `cleanup-merged-branches.sh` | Remove merged branches | `./scripts/cleanup-merged-branches.sh` |
| `post-merge-verify.sh` | Post-merge verification | `./scripts/post-merge-verify.sh` |
| `multi-branch-merge.sh` | Multi-branch coordination | `./scripts/multi-branch-merge.sh <branch1> <branch2> ...` |

### CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR to main | Basic CI checks |
| `safe-merge-checks.yml` | PR to main | Comprehensive merge safety |
| `docs-authority.yml` | Push to main | Documentation updates |

### Recommended Tooling Setup

```bash
# Install helpful git aliases
git config --global alias.lg "log --oneline --graph --decorate"
git config --global alias.st "status --short"
git config --global alias.co "checkout"
git config --global alias.br "branch"

# Set up merge tool (VS Code)
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

### Branch Protection Rules (Recommended)

Configure in GitHub Settings > Branches > Branch protection rules for `main`:

```yaml
# Recommended settings
require_pull_request_reviews: true
required_approving_review_count: 1
dismiss_stale_reviews: true
require_code_owner_reviews: false
require_status_checks: true
required_status_checks:
  - "Pre-Merge Quality Checks"
  - "CI / Build and Test"
require_branches_up_to_date: true
require_conversation_resolution: true
require_signed_commits: false  # Optional
enforce_admins: false
allow_force_pushes: false
allow_deletions: false
```

---

## Document References

| Document | Purpose | Location |
|----------|---------|----------|
| Safe Branch Merging Guide | Detailed merge instructions | `docs/SAFE_BRANCH_MERGING.md` |
| Pre-Merge Checklist | Quality checklist | `docs/PRE_MERGE_CHECKLIST.md` |
| Contributing Guidelines | Code standards | `CONTRIBUTING.md` |
| CI/CD Documentation | Pipeline details | `docs/CI-CD.md` |

---

## Appendix: Quick Commands

### Most Common Operations

```bash
# Check branch status before merge
git fetch origin && git status

# Sync branch with main
git checkout <branch> && git merge origin/main

# Safe merge (recommended)
./scripts/safe-merge-branch.sh <branch-name>

# Post-merge cleanup
git branch -d <branch-name>
git push origin --delete <branch-name>

# Emergency rollback
git revert -m 1 <merge-sha>
```

### Useful Diagnostics

```bash
# See what will be merged
git log --oneline main..<branch>

# See file changes
git diff --stat main..<branch>

# Check for conflicts before merge
git merge --no-commit --no-ff <branch> && git merge --abort

# Find merge commits
git log --merges --oneline -10
```

---

**Document Status:** Active
**Next Review:** Q2 2026
**Owner:** Engineering Team @ Krosebrook

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-16 | Initial creation |
