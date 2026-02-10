# Pre-Merge Checklist

**Branch Name:** `______________________________`  
**Target Branch:** `main`  
**Date:** `______________________________`  
**Developer:** `______________________________`  

---

## 1. Code Quality ✅

- [ ] **Code Review Completed**
  - [ ] Pull Request created
  - [ ] At least one approval received
  - [ ] All review comments addressed

- [ ] **Code Standards**
  - [ ] No commented-out code
  - [ ] No debug statements (`console.log`, `debugger`, etc.)
  - [ ] Code follows project style guide
  - [ ] Meaningful variable and function names

- [ ] **Linting & Formatting**
  - [ ] ESLint passes: `npm run lint`
  - [ ] No TypeScript errors (if applicable)
  - [ ] Code is properly formatted

---

## 2. Testing ✅

- [ ] **Automated Tests**
  - [ ] All existing tests pass: `npm test`
  - [ ] New tests added for new features
  - [ ] Test coverage maintained or improved
  - [ ] Edge cases covered

- [ ] **Manual Testing**
  - [ ] Feature tested in development environment
  - [ ] UI changes tested in multiple browsers
  - [ ] Mobile responsiveness verified (if applicable)
  - [ ] Accessibility tested (keyboard navigation, screen readers)

- [ ] **Integration Testing**
  - [ ] API integrations tested
  - [ ] Database operations verified
  - [ ] External services tested (if applicable)

---

## 3. Security 🔒

- [ ] **Code Security**
  - [ ] No secrets, API keys, or passwords in code
  - [ ] No hardcoded credentials
  - [ ] Environment variables used for sensitive data

- [ ] **Dependency Security**
  - [ ] `npm audit` shows no HIGH or CRITICAL vulnerabilities
  - [ ] Dependencies updated to secure versions
  - [ ] No known security issues in new packages

- [ ] **Input Validation**
  - [ ] User inputs are validated
  - [ ] SQL injection prevented
  - [ ] XSS vulnerabilities checked
  - [ ] CSRF protection in place (for forms)

---

## 4. Documentation 📝

- [ ] **Code Documentation**
  - [ ] Complex logic has comments
  - [ ] JSDoc comments for functions/components
  - [ ] Props documented (for React components)
  - [ ] API changes documented

- [ ] **Project Documentation**
  - [ ] README.md updated (if needed)
  - [ ] CHANGELOG.md updated with changes
  - [ ] API documentation updated
  - [ ] Migration guide added (for breaking changes)

---

## 5. Git Hygiene 🌿

- [ ] **Commit History**
  - [ ] All changes committed
  - [ ] Commit messages follow conventional commits format
  - [ ] Commits are logical and atomic
  - [ ] No merge commits in feature branch (rebased if needed)

- [ ] **Branch Status**
  - [ ] Branch is up to date with main: `git pull origin main`
  - [ ] No merge conflicts
  - [ ] Branch pushed to remote: `git push origin <branch-name>`

---

## 6. Build & Deployment ⚙️

- [ ] **Build Process**
  - [ ] Production build successful: `npm run build`
  - [ ] No build warnings or errors
  - [ ] Bundle size is acceptable
  - [ ] No unused dependencies

- [ ] **Environment Testing**
  - [ ] Works in development: `npm run dev`
  - [ ] Works in preview: `npm run preview`
  - [ ] Environment variables configured

---

## 7. Performance 🚀

- [ ] **Code Performance**
  - [ ] No obvious performance bottlenecks
  - [ ] Large lists use pagination/virtualization
  - [ ] Images optimized
  - [ ] Lazy loading implemented (where appropriate)

- [ ] **React Performance**
  - [ ] No unnecessary re-renders
  - [ ] React.memo used for expensive components
  - [ ] useMemo/useCallback used appropriately
  - [ ] No React Hooks violations

---

## 8. Backwards Compatibility 🔄

- [ ] **API Compatibility**
  - [ ] No breaking changes to public APIs
  - [ ] Deprecated features properly marked
  - [ ] Migration path provided (if breaking changes exist)

- [ ] **Data Compatibility**
  - [ ] Database migrations tested
  - [ ] Existing data structure preserved
  - [ ] Data migration script provided (if needed)

---

## 9. Team Communication 📢

- [ ] **Notifications**
  - [ ] Team notified of upcoming merge (for large changes)
  - [ ] Breaking changes communicated
  - [ ] Dependencies on other work clarified

- [ ] **Pull Request**
  - [ ] Descriptive PR title
  - [ ] PR description explains changes
  - [ ] Related issues linked
  - [ ] Screenshots added (for UI changes)

---

## 10. Final Checks ✔️

- [ ] **Pre-Merge Actions**
  - [ ] Backup branch created (if manual merge)
  - [ ] CI/CD pipeline passes
  - [ ] All checklists items completed
  - [ ] No last-minute changes needed

- [ ] **Merge Strategy**
  - [ ] Merge method decided (merge commit vs squash)
  - [ ] Merge message prepared
  - [ ] Post-merge monitoring plan in place

---

## Special Considerations

### For UI Changes
- [ ] Design approved
- [ ] Responsive design verified
- [ ] Dark mode tested (if applicable)
- [ ] Print styles verified (if applicable)

### For Database Changes
- [ ] Migration scripts tested
- [ ] Rollback plan prepared
- [ ] Database backup created
- [ ] Performance impact assessed

### For API Changes
- [ ] API versioning considered
- [ ] Postman/API tests updated
- [ ] Client libraries updated
- [ ] API documentation generated

### For Third-Party Integrations
- [ ] Integration credentials secured
- [ ] Error handling for API failures
- [ ] Rate limiting considered
- [ ] Webhook handlers tested

---

## Merge Approval

**Reviewer Name:** `______________________________`  
**Review Date:** `______________________________`  
**Approval:** ✅ Approved / ❌ Needs Changes  

**Comments:**
```
_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

---

## Post-Merge Tasks

- [ ] Monitor CI/CD pipeline after merge
- [ ] Check production logs for errors
- [ ] Verify feature in staging environment
- [ ] Delete feature branch: `git branch -d <branch-name>`
- [ ] Delete remote branch: `git push origin --delete <branch-name>`
- [ ] Update project board/issue tracker
- [ ] Notify stakeholders of completion

---

## Notes

```
_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

---

**Merge Command:**
```bash
# Using safe merge script (recommended)
./scripts/safe-merge-branch.sh <branch-name>

# Or manual merge
git checkout main
git merge --no-ff <branch-name>
git push origin main
```

---

**Checklist Version:** 1.0.0  
**Last Updated:** January 12, 2026  
**Template maintained by:** Engineering Team @ Krosebrook

---

## Quick Reference

### Common Commands
```bash
# Check branch status
git status

# Run all checks
npm run lint && npm test && npm run build

# Update branch with main
git checkout <branch-name>
git merge main

# Safe merge
./scripts/safe-merge-branch.sh <branch-name>

# Cleanup merged branches
./scripts/cleanup-merged-branches.sh
```

### Emergency Contacts
- **Tech Lead:** [Name/Contact]
- **DevOps:** [Name/Contact]
- **Product Owner:** [Name/Contact]
