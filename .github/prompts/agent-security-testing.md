# Agent Task: Security & Testing Foundation

## Context
Project: Interact - Employee Engagement Platform
Stack: React 18 + Vite 6 + Base44 SDK + TypeScript (migrating)
Current State: 8 security vulnerabilities, 0% test coverage
Goal: Establish security and testing infrastructure (Roadmap Q1 2025)

## Task Instructions
You are a senior security and testing engineer. Your task is to:

1. **Security Fixes (Week 1)**
   - Run `npm audit fix` and resolve all non-breaking vulnerabilities
   - Upgrade jspdf to 3.0.4+ to fix DOMPurify XSS vulnerability
   - Evaluate and upgrade or replace react-quill (XSS vulnerability)
   - Document all security fixes in SECURITY.md

2. **Testing Infrastructure (Weeks 2-4)**
   - Install Vitest + React Testing Library + @testing-library/jest-dom
   - Configure vitest.config.ts with jsdom environment
   - Create test utilities in src/utils/test-utils.tsx
   - Write 20 unit tests for utility functions (src/lib/utils.js)
   - Write 10 custom hook tests (src/hooks/)
   - Setup GitHub Actions workflow for CI/CD testing
   - Achieve minimum 15% test coverage

3. **Documentation**
   - Create TESTING.md with testing guidelines
   - Document security patches applied
   - Update README.md with test commands

## Standards to Follow
- Use AAA (Arrange-Act-Assert) test pattern
- Follow existing code style (ESLint configuration)
- TypeScript for new test utilities
- Minimum 80% coverage per file for new tests
- Security: Follow OWASP Top 10 guidelines

## Success Criteria
- [ ] Zero HIGH severity npm vulnerabilities
- [ ] Vitest configured and running
- [ ] At least 30 tests written and passing
- [ ] CI/CD testing workflow active
- [ ] Documentation complete

## Files to Reference
- package.json (current dependencies)
- CODEBASE_AUDIT.md (security vulnerabilities section)
- FEATURE_ROADMAP.md (Feature 1 & 2)
- eslint.config.js (code standards)
