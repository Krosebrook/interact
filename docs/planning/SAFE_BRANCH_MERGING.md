# Safe Branch Merging Guide

**Version:** 1.0.0  
**Last Updated:** January 12, 2026  
**Status:** Active  

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Pre-Merge Checklist](#pre-merge-checklist)
4. [Using the Safe Merge Script](#using-the-safe-merge-script)
5. [Manual Merge Process](#manual-merge-process)
6. [Handling Merge Conflicts](#handling-merge-conflicts)
7. [Post-Merge Tasks](#post-merge-tasks)
8. [Branch Cleanup](#branch-cleanup)
9. [Common Issues](#common-issues)
10. [Best Practices](#best-practices)

---

## Overview

This guide provides comprehensive instructions for safely merging feature branches into the main branch of the Interact platform. Following these practices ensures code quality, prevents conflicts, and maintains a clean git history.

### Why Safe Merging Matters

- **Prevents Data Loss:** Proper backups ensure code can be recovered
- **Maintains Quality:** Pre-merge checks catch issues early
- **Clean History:** Organized commits make debugging easier
- **Team Coordination:** Clear processes prevent conflicting work

---

## Quick Start

The fastest way to merge a branch safely:

```bash
# Use the automated script
./scripts/safe-merge-branch.sh <branch-name>

# Example
./scripts/safe-merge-branch.sh copilot/new-feature
```

The script handles all safety checks automatically. Continue reading for manual processes and advanced scenarios.

---

## Pre-Merge Checklist

Before merging any branch, verify the following:

### Code Quality
- [ ] All code has been reviewed (via Pull Request or peer review)
- [ ] No commented-out code or debug statements remain
- [ ] Code follows project style guidelines
- [ ] ESLint passes without errors: `npm run lint`
- [ ] No TypeScript errors (when applicable)

### Testing
- [ ] All new features have tests (if test infrastructure exists)
- [ ] All tests pass: `npm test`
- [ ] Manual testing completed for UI changes
- [ ] Edge cases have been tested

### Documentation
- [ ] Code changes are documented in comments (where needed)
- [ ] README updated (if user-facing changes)
- [ ] CHANGELOG.md updated with changes
- [ ] API documentation updated (if applicable)

### Security
- [ ] No secrets or API keys in code
- [ ] npm audit shows no new vulnerabilities
- [ ] User inputs are properly validated
- [ ] XSS and injection vulnerabilities checked

### Git Hygiene
- [ ] All changes are committed
- [ ] Commit messages follow conventional commits format
- [ ] Branch is up to date with main: `git pull origin main`
- [ ] No merge conflicts exist

---

## Using the Safe Merge Script

### Basic Usage

```bash
./scripts/safe-merge-branch.sh <branch-name>
```

### What the Script Does

1. **Validates Environment**
   - Checks git repository status
   - Verifies branch exists
   - Checks for uncommitted changes

2. **Creates Safety Backup**
   - Creates backup branch before any changes
   - Backup name: `backup-before-merge-YYYYMMDD-HHMMSS`

3. **Updates Main Branch**
   - Fetches latest changes from remote
   - Updates local main branch

4. **Checks Merge Status**
   - Detects if branch is already merged
   - Offers to delete already-merged branches

5. **Tests Merge**
   - Performs dry-run merge to detect conflicts
   - Aborts if conflicts are found

6. **Runs Quality Checks**
   - Runs tests if available
   - Runs linter if configured

7. **Performs Merge**
   - Prompts for confirmation
   - Merges with `--no-ff` flag (preserves branch history)
   - Creates merge commit

8. **Pushes Changes**
   - Prompts before pushing to remote
   - Pushes main branch to origin

9. **Provides Cleanup Instructions**
   - Shows commands for deleting feature branch
   - Shows command for deleting backup branch

### Script Output Example

```
[INFO] Starting safe merge process for branch: copilot/new-feature

[INFO] Checking git repository...
[SUCCESS] Git repository confirmed

[INFO] Checking if branch exists...
[SUCCESS] Branch exists

[INFO] Checking for uncommitted changes...
[SUCCESS] No uncommitted changes

[INFO] Fetching latest changes from remote...
[SUCCESS] Fetched latest changes

[INFO] Switching to main branch...
[SUCCESS] On main branch

[INFO] Creating backup branch: backup-before-merge-20260112-143022
[SUCCESS] Backup created at: backup-before-merge-20260112-143022

[INFO] Updating main branch...
[SUCCESS] Main branch updated

[INFO] Checking if branch is already merged...
[INFO] Testing merge (dry run)...
[SUCCESS] Merge test successful - no conflicts detected

[INFO] Running tests...
[SUCCESS] All tests passed

[INFO] Running linter...
[SUCCESS] Linting passed

[INFO] Ready to merge 'copilot/new-feature' into 'main'
Do you want to continue with the merge? (y/n)
```

---

## Manual Merge Process

If you prefer to merge manually or need more control:

### Step 1: Prepare Your Environment

```bash
# Save any uncommitted work
git stash

# Switch to main branch
git checkout main

# Update main branch
git pull origin main

# Create a backup
git branch backup-before-merge-$(date +%Y%m%d)
```

### Step 2: Update Feature Branch

```bash
# Switch to feature branch
git checkout <branch-name>

# Merge latest main into feature branch
git merge main

# Resolve any conflicts
# (see Handling Merge Conflicts section)

# Run tests
npm test

# Run linter
npm run lint
```

### Step 3: Merge into Main

```bash
# Switch back to main
git checkout main

# Merge feature branch (no fast-forward)
git merge --no-ff <branch-name>

# Push to remote
git push origin main
```

### Step 4: Cleanup

```bash
# Delete local feature branch
git branch -d <branch-name>

# Delete remote feature branch
git push origin --delete <branch-name>

# Delete backup (when confident)
git branch -d backup-before-merge-YYYYMMDD
```

---

## Handling Merge Conflicts

### When Conflicts Occur

```bash
# After a failed merge, git will show:
Auto-merging src/components/MyComponent.jsx
CONFLICT (content): Merge conflict in src/components/MyComponent.jsx
Automatic merge failed; fix conflicts and then commit the result.
```

### Resolution Process

1. **View Conflicted Files**
   ```bash
   git status
   ```

2. **Open Each Conflicted File**
   Look for conflict markers:
   ```
   <<<<<<< HEAD
   // Code from main branch
   =======
   // Code from feature branch
   >>>>>>> branch-name
   ```

3. **Resolve the Conflict**
   - Choose which code to keep
   - Or combine both sets of changes
   - Remove conflict markers

4. **Mark as Resolved**
   ```bash
   git add <resolved-file>
   ```

5. **Complete the Merge**
   ```bash
   git commit
   ```

### Conflict Resolution Tools

```bash
# Use built-in merge tool
git mergetool

# Or use VS Code
code .

# Abort merge if needed
git merge --abort
```

---

## Post-Merge Tasks

After a successful merge:

### 1. Verify Merge

```bash
# Check git log
git log --oneline --graph -10

# Verify files
git diff HEAD~1 HEAD
```

### 2. Test in Production-Like Environment

```bash
# Build production bundle
npm run build

# Run production preview
npm run preview
```

### 3. Update Documentation

- Update CHANGELOG.md with merged changes
- Update version numbers if applicable
- Notify team of merge

### 4. Monitor for Issues

- Watch for CI/CD pipeline results
- Check for runtime errors in logs
- Monitor user reports

---

## Branch Cleanup

### Checking Merged Branches

```bash
# List branches merged into main
git branch --merged main

# List branches not yet merged
git branch --no-merged main
```

### Cleanup Script

Create a script to clean up merged branches:

```bash
#!/bin/bash
# cleanup-merged-branches.sh

echo "Branches merged into main:"
git branch --merged main | grep -v "^\*" | grep -v "main"

echo ""
read -p "Delete these local branches? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch --merged main | grep -v "^\*" | grep -v "main" | xargs -n 1 git branch -d
    echo "Local branches deleted"
fi
```

### Safe Deletion

```bash
# Delete local branch (only if merged)
git branch -d <branch-name>

# Force delete local branch (if not merged)
git branch -D <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

---

## Common Issues

### Issue 1: "Branch is already merged"

**Problem:** Script detects branch is already merged but branch still exists.

**Solution:**
```bash
# Delete the branch
git branch -d <branch-name>
git push origin --delete <branch-name>
```

### Issue 2: "You have uncommitted changes"

**Problem:** Git won't merge with uncommitted changes.

**Solution:**
```bash
# Option 1: Commit changes
git add .
git commit -m "Save work in progress"

# Option 2: Stash changes
git stash
# ... perform merge ...
git stash pop
```

### Issue 3: "Merge conflicts detected"

**Problem:** Files have conflicting changes.

**Solution:** See [Handling Merge Conflicts](#handling-merge-conflicts) section.

### Issue 4: "Tests failed during merge"

**Problem:** Tests pass on feature branch but fail after merge.

**Solution:**
```bash
# Abort the merge
git merge --abort

# Update feature branch with latest main
git checkout <branch-name>
git merge main

# Fix tests
# ... make fixes ...

# Try merge again
git checkout main
./scripts/safe-merge-branch.sh <branch-name>
```

### Issue 5: "Push rejected - non-fast-forward"

**Problem:** Remote main has changes you don't have locally.

**Solution:**
```bash
# Pull latest changes
git pull origin main --rebase

# Push again
git push origin main
```

---

## Best Practices

### Branch Naming Conventions

```bash
# Feature branches
feature/user-authentication
feature/dashboard-widgets

# Bug fix branches
fix/login-error
fix/memory-leak

# Copilot branches (existing pattern)
copilot/improve-performance
copilot/add-new-feature
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT authentication
fix(dashboard): resolve memory leak in ActivityCard
docs(readme): update installation instructions
```

### Merge Strategy

**Always use `--no-ff` (no fast-forward):**

```bash
# Good: Creates merge commit, preserves branch history
git merge --no-ff feature-branch

# Avoid: Fast-forward loses branch context
git merge feature-branch
```

### Code Review Process

1. **Create Pull Request** before merging
2. **Request review** from at least one team member
3. **Address feedback** before merging
4. **Squash commits** if needed for clean history
5. **Merge via PR** on GitHub (or use script locally)

### Continuous Integration

- Ensure CI pipeline runs on all branches
- Don't merge if CI fails
- Fix CI issues before attempting merge

### Communication

- Notify team before large merges
- Use PR descriptions to explain changes
- Update project board status
- Document breaking changes

---

## Automation and CI/CD

### GitHub Actions Integration

Create `.github/workflows/safe-merge-check.yml`:

```yaml
name: Safe Merge Checks

on:
  pull_request:
    branches: [ main ]

jobs:
  pre-merge-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Security audit
        run: npm audit --audit-level=moderate
```

### Branch Protection Rules

Configure in GitHub Settings → Branches → Branch protection rules:

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require signed commits (recommended)
- ✅ Include administrators

---

## Emergency Procedures

### Reverting a Bad Merge

If a merge causes issues in production:

```bash
# Option 1: Revert the merge commit
git revert -m 1 <merge-commit-sha>
git push origin main

# Option 2: Reset to before merge (dangerous!)
git reset --hard <commit-before-merge>
git push origin main --force  # Only if absolutely necessary!
```

### Restoring from Backup

If something goes wrong:

```bash
# List backup branches
git branch | grep backup

# Switch to backup
git checkout backup-before-merge-YYYYMMDD

# Create new branch from backup
git checkout -b recovery-branch

# Or reset main to backup
git branch -f main backup-before-merge-YYYYMMDD
git checkout main
```

---

## Additional Resources

### Internal Documentation
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [CODEBASE_AUDIT.md](../CODEBASE_AUDIT.md) - Code quality metrics
- [RECOMMENDATIONS.md](../RECOMMENDATIONS.md) - Best practices

### External Resources
- [Git Branching Guide](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

---

## Support

For questions or issues:
1. Check the [Common Issues](#common-issues) section
2. Review git logs: `git log --oneline --graph -20`
3. Contact the development team
4. Create an issue on GitHub

---

**Remember:** When in doubt, create a backup before merging! 🛟

**Document Status:** ✅ Active  
**Next Review:** Q2 2026  
**Maintained By:** Engineering Team @ Krosebrook
