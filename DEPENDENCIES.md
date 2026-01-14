# Dependencies

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Production Dependencies (77)

### Core Framework
- `react@18.2.0` - UI library
- `react-dom@18.2.0` - React DOM renderer
- `react-router-dom@6.26.0` - Routing

### Backend & Data
- `@base44/sdk@0.8.3` - Backend framework
- `@tanstack/react-query@5.84.1` - Data fetching

### UI Components
- `@radix-ui/*` - 30+ accessible UI primitives
- `lucide-react@0.475.0` - Icons
- `framer-motion@11.16.4` - Animations

### Styling
- `tailwindcss@3.4.17` - Utility-first CSS
- `tailwind-merge@3.0.2` - Class merging
- `class-variance-authority@0.7.1` - Variants

### Forms & Validation
- `react-hook-form@7.54.2` - Form management
- `zod@3.24.2` - Schema validation
- `@hookform/resolvers@4.1.2` - RHF + Zod integration

### Utilities
- `date-fns@3.6.0` - Date utilities
- `lodash@4.17.21` - Utility functions
- `clsx@2.1.1` - Conditional classes

### Additional Features
- `recharts@2.15.4` - Charts
- `react-markdown@9.0.1` - Markdown rendering
- `html2canvas@1.4.1` - Screenshot generation
- `jspdf@4.0.0` - PDF generation

## Dev Dependencies (16)

### Build Tools
- `vite@6.1.0` - Build tool
- `@vitejs/plugin-react@4.3.4` - React plugin

### Testing
- `vitest@4.0.17` - Test runner
- `@testing-library/react@16.3.1` - Component testing
- `@testing-library/jest-dom@6.9.1` - DOM matchers
- `@vitest/coverage-v8@4.0.17` - Coverage

### Code Quality
- `eslint@9.19.0` - Linting
- `typescript@5.8.2` - Type checking
- `autoprefixer@10.4.20` - CSS prefixes
- `postcss@8.5.3` - CSS processing

---

## Dependency Security

### Vulnerability Status
- **Current:** 0 vulnerabilities ✅
- **Last Audit:** January 9, 2026
- **Last Fix:** React Router XSS (GHSA-2w69-qvjg-hvjx)

### Monitoring
- Run `npm audit` before each release
- Review security advisories weekly
- Update dependencies monthly

---

## Deprecation Notices

### moment.js
- **Status:** Deprecated
- **Replacement:** date-fns
- **Action Required:** Remove from dependencies (not actively used)
- **Timeline:** Q1 2026

---

## Dependency Update Policy

### Major Updates
- Review changelog and breaking changes
- Test thoroughly in development
- Update in dedicated PR
- Requires approval from team lead

### Minor/Patch Updates
- Review release notes
- Update in batch monthly
- Test automated test suite
- Deploy if tests pass

### Security Updates
- Apply immediately
- Test in staging
- Deploy to production ASAP
- Document in CHANGELOG.md

---

## Related Documentation

- [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) - Security audit
- [package.json](./package.json) - Full dependency list

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
