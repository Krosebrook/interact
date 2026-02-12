# Context

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  
**Status:** Active Development  

---

## Purpose of This Document

This document provides essential context for developers, AI agents, and stakeholders working with the Interact codebase. It explains the "why" behind key decisions, the current state of the project, and important context that may not be obvious from the code alone.

---

## Table of Contents

1. [Project Context](#project-context)
2. [Technical Context](#technical-context)
3. [Business Context](#business-context)
4. [Development Context](#development-context)
5. [Historical Context](#historical-context)
6. [Current Status](#current-status)
7. [Known Limitations](#known-limitations)
8. [Future Direction](#future-direction)

---

## Project Context

### What is Interact?

Interact is an employee engagement platform designed to solve the challenge of maintaining team cohesion and workplace culture in remote and hybrid work environments. The platform combines:

- **Activity Management:** Schedule and manage team-building activities
- **Gamification:** Points, badges, leaderboards, and challenges
- **Learning Paths:** Structured skill development
- **Social Features:** Recognition, communication, and collaboration
- **Analytics:** Data-driven insights into engagement levels

### Why Does This Exist?

**Problem Statement:**
- Remote/hybrid work has made traditional team-building ineffective
- Employee engagement has dropped 23% post-pandemic (Gallup 2024)
- HR teams struggle to measure engagement objectively
- Existing solutions are either too simple (Slack bots) or too complex (enterprise HCM)

**Solution:**
Interact provides a purpose-built platform that:
- Makes engagement measurable and actionable
- Scales from 50 to 5,000+ employees
- Integrates with existing tools (Slack, Teams, Calendar)
- Uses AI to personalize experiences

### Target Users

**Primary Personas:**
1. **HR/People Operations Teams** (Administrators)
   - Need to plan, schedule, and measure engagement initiatives
   - Want data-driven insights without manual reporting
   - Require compliance and privacy features

2. **Team Leaders/Facilitators**
   - Organize activities for their teams
   - Monitor team engagement levels
   - Recognize and reward team members

3. **Employees** (Participants)
   - Want fun, meaningful activities
   - Appreciate recognition for contributions
   - Need flexible participation options

**Target Company Size:**
- Primary: 100-5,000 employees
- Secondary: 50-100 employees (SMB)
- Future: 5,000+ (Enterprise)

---

## Technical Context

### Why These Technologies?

**React 18.2.0:**
- Modern, well-supported UI library
- Large ecosystem of components and tools
- Team expertise and fast development
- **Note:** Planning TypeScript migration Q2-Q3 2026

**Vite 6.1.0:**
- Fast build times (5-10x faster than Webpack)
- Excellent developer experience
- Native ES modules support
- Better suited for modern React than CRA

**Base44 SDK 0.8.3:**
- Serverless backend-as-a-service
- Reduces backend infrastructure complexity
- Built-in database, authentication, file storage
- TypeScript functions for type safety
- **Trade-off:** Vendor lock-in, but rapid development outweighs risk

**TailwindCSS 3.4.17:**
- Utility-first approach speeds development
- Consistent design system
- Small production bundle with purging
- Better than traditional CSS for component-based architecture

**Radix UI:**
- Accessible by default (WCAG AA)
- Unstyled primitives (flexible styling)
- Better than building from scratch
- Addresses audit finding on accessibility

**TanStack Query 5.84.1:**
- Industry-standard data fetching
- Built-in caching and invalidation
- Better than Redux for server state
- Reduces boilerplate significantly

### Architecture Decisions

**Single Page Application (SPA):**
- Better user experience (no page reloads)
- Easier state management
- Trade-off: Initial load time, SEO challenges
- Mitigated with code splitting and lazy loading

**Component-Based Architecture:**
- Reusable UI components in `src/components/`
- Page components in `src/pages/`
- Shared hooks in `src/hooks/`
- Utilities in `src/lib/` and `src/utils/`

**Why Not TypeScript Yet?**
- Project started before TypeScript was prioritized
- Adding types mid-project is disruptive
- **Planned:** Full TypeScript migration Q2-Q3 2026
- **Current:** Using JSDoc for type hints

**Why Base44 vs. Traditional Backend?**
- Faster time to market (3-4 months saved)
- Built-in auth, database, storage
- Automatic scaling
- **Trade-off:** Less control, potential vendor lock-in
- **Mitigation:** Modular architecture allows backend swap if needed

---

## Business Context

### Market Position

**Competitors:**
- **Slack/Teams:** Basic engagement, no gamification
- **15Five, Culture Amp:** Enterprise-focused, expensive, complex
- **Achievers, Bonusly:** Recognition-focused, less comprehensive
- **Workvivo:** Similar but less AI-powered

**Differentiators:**
1. AI-powered personalization (recommendations, content generation)
2. Comprehensive gamification (beyond simple points)
3. Activity management + learning + social in one platform
4. Mid-market pricing with enterprise features
5. Modern, intuitive UX

### Pricing Strategy

**Target Pricing:**
- $5-8 per user/month for 100-500 users
- $3-5 per user/month for 500+ users
- Enterprise custom pricing

**Competitive Positioning:**
- 30-50% less expensive than Culture Amp
- More features than Slack apps
- More accessible than enterprise HCM

### Go-to-Market Strategy

**Phase 1 (Current):** Build MVP with core features
**Phase 2 (Q2 2026):** Beta with 3-5 pilot companies
**Phase 3 (Q3 2026):** Public launch with paid tier
**Phase 4 (Q4 2026):** Enterprise sales motion

---

## Development Context

### Current Development Phase

**Status:** Transitioning from MVP to Production-Ready

**Completed:**
- ✅ Core UI and navigation (47 pages)
- ✅ Base44 backend integration (61 functions)
- ✅ Gamification mechanics
- ✅ Activity management
- ✅ User authentication and roles
- ✅ Security vulnerability fixes (0 npm vulnerabilities)
- ✅ Comprehensive documentation (60+ files)

**In Progress (Q1 2026):**
- 🔄 Testing infrastructure (Vitest + Playwright)
- 🔄 Security hardening (input validation, CSP)
- 🔄 Performance optimization
- 🔄 Accessibility improvements

**Planned (Q2-Q3 2026):**
- ⏳ TypeScript migration
- ⏳ PWA implementation
- ⏳ Advanced AI features
- ⏳ Mobile optimization

### Development Team

**Current Team:**
- Solo developer + AI assistance (GitHub Copilot)
- No dedicated QA yet (testing being implemented)
- No dedicated DevOps (using Vercel)

**Implications:**
- Emphasis on automation and tooling
- Comprehensive documentation critical
- Testing infrastructure high priority

### Development Workflow

**Version Control:**
- Git + GitHub
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`
- Documentation: `docs/description`

**Code Quality:**
- ESLint for linting (9.19.0)
- Prettier for formatting (via ESLint)
- Manual code review (no PR reviews yet)
- **Planned:** Automated testing in CI/CD

**Deployment:**
- Vercel for frontend (automatic from main branch)
- Base44 for backend (deployed via CLI)
- **Planned:** Staging environment

---

## Historical Context

### Project Timeline

**December 2024:**
- Project initiated
- Technology stack selected
- Initial UI components built

**January 2025:**
- Core features implemented
- Base44 integration completed
- Basic gamification working

**Q4 2025:**
- Security audit conducted
- Major refactoring of components
- Documentation overhaul started

**December 2025:**
- 8 security vulnerabilities fixed
- 60+ documentation files added
- Testing strategy defined

**January 9, 2026:**
- All React Router XSS vulnerabilities fixed
- 0 npm security vulnerabilities achieved
- Testing infrastructure implemented

**Current (January 14, 2026):**
- Documentation completeness initiative
- Preparing for beta launch

### Key Decisions and Why

**Decision: Use Base44 instead of building custom backend**
- **When:** December 2024
- **Why:** Faster time to market, reduce infrastructure complexity
- **Trade-off:** Vendor lock-in
- **Status:** Good decision, saved months of dev time

**Decision: Start with JavaScript, migrate to TypeScript later**
- **When:** December 2024
- **Why:** Faster initial development, team unfamiliar with TS
- **Trade-off:** Type safety issues, refactoring needed
- **Status:** Planning migration Q2 2026

**Decision: Use TailwindCSS instead of CSS-in-JS**
- **When:** December 2024
- **Why:** Faster development, smaller bundle, better DX
- **Trade-off:** Learning curve for utility classes
- **Status:** Excellent decision, very productive

**Decision: Build comprehensive gamification from scratch**
- **When:** January 2025
- **Why:** Existing solutions too rigid, need customization
- **Trade-off:** More development time
- **Status:** Good decision, key differentiator

**Decision: Prioritize documentation before scaling**
- **When:** November 2025
- **Why:** Audit revealed gaps, essential for maintainability
- **Trade-off:** Slowed feature development
- **Status:** Correct decision, paying dividends

---

## Current Status

### What Works Well

**Strengths:**
1. ✅ **UI/UX:** Modern, intuitive interface with 47 pages
2. ✅ **Gamification:** Comprehensive points, badges, leaderboards
3. ✅ **Integration:** Base44 SDK well-integrated
4. ✅ **Components:** 40+ reusable components
5. ✅ **Documentation:** 60+ technical docs
6. ✅ **Security:** 0 npm vulnerabilities

### What Needs Work

**Current Focus Areas:**

1. **Testing (Priority: P0)**
   - Current: 0.09% coverage (36 tests)
   - Target: 30% by end Q1 2026, 80% by Q3 2026
   - Blocking: Beta launch

2. **TypeScript Migration (Priority: P1)**
   - Current: 0% TypeScript
   - Target: 100% by Q3 2026
   - Reason: Type safety, better DX, fewer bugs

3. **Performance (Priority: P1)**
   - Some pages load slowly
   - Bundle size could be smaller
   - Need code splitting and lazy loading

4. **Accessibility (Priority: P1)**
   - Some components lack ARIA labels
   - Keyboard navigation incomplete
   - Need WCAG 2.1 AA compliance

5. **Mobile Experience (Priority: P1)**
   - Desktop-first design
   - Mobile works but not optimized
   - PWA planned for Q2 2026

### Technical Debt

**Known Issues:**

1. **React Hooks Violations:**
   - 2 files with conditional hook calls
   - Must fix before adding more features
   - Location: `src/pages/ChannelMessages.jsx`, `src/pages/InteractionTrendsDashboard.jsx`

2. **Inconsistent Error Handling:**
   - Some components handle errors well
   - Others don't show user-friendly messages
   - Need standardized error boundary

3. **Unused Dependencies:**
   - `moment` library (deprecated, should use date-fns)
   - Several Radix UI components imported but unused

4. **Code Duplication:**
   - Some forms have duplicate validation logic
   - API calls could be more centralized

---

## Known Limitations

### Technical Limitations

**Current Constraints:**

1. **Base44 SDK Limitations:**
   - Cannot use with non-Deno runtimes
   - Limited to Base44's database schema
   - Real-time features limited to their implementation

2. **Browser Support:**
   - Modern browsers only (last 2 versions)
   - No IE11 support (intentional)
   - Safari has some CSS grid quirks

3. **Scalability:**
   - Not tested beyond 1,000 concurrent users
   - Leaderboards may slow with 10,000+ users
   - Need caching strategy for large datasets

4. **Offline Support:**
   - Requires internet connection
   - No offline mode (PWA will help)

### Business Limitations

**Current Scope:**

1. **No Mobile Apps:**
   - Web-only currently
   - PWA planned for Q2 2026
   - Native apps not planned

2. **Limited Integrations:**
   - Slack, Teams, Calendar supported
   - Many enterprise tools not yet integrated
   - Custom SSO not implemented

3. **Single-Tenant:**
   - One company per instance
   - No white-labeling yet
   - Multi-tenancy planned Q4 2026

4. **English Only:**
   - No internationalization yet
   - Planned for 2027

---

## Future Direction

### Roadmap Highlights

**Q1 2026: Foundation**
- Complete testing infrastructure
- Fix all security issues
- Achieve 30% test coverage

**Q2 2026: Enhancement**
- TypeScript migration
- PWA implementation
- Advanced AI features
- Beta launch with pilot customers

**Q3 2026: Scale**
- 80% test coverage
- Advanced analytics
- Customizable gamification
- Public launch

**Q4 2026: Enterprise**
- Multi-tenancy
- White-labeling
- Advanced SSO
- Enterprise features

**2027: Growth**
- International expansion
- Native mobile apps
- Advanced integrations
- Predictive analytics

### Technical Vision

**Long-Term Goals:**

1. **AI-First Platform:**
   - Predictive engagement insights
   - Automated content generation
   - Intelligent scheduling
   - Personalized learning paths

2. **Enterprise-Grade:**
   - SOC 2 Type II compliance
   - 99.9% uptime SLA
   - Advanced security features
   - Dedicated support

3. **Extensible Platform:**
   - Public API for integrations
   - Plugin system for customization
   - Webhook support
   - Custom reporting

4. **Best-in-Class UX:**
   - Sub-second page loads
   - Intuitive workflows
   - Accessible to all users
   - Mobile-first design

---

## Important Context for AI Agents

### What AI Agents Should Know

**Code Patterns:**
- Functional React components (no class components)
- Hooks at top level (NEVER conditional)
- TailwindCSS for styling
- Zod for validation
- React Hook Form for forms

**Testing Expectations:**
- All new code must have tests
- Use Vitest for unit tests
- Use React Testing Library for components
- Use Playwright for E2E tests

**Documentation Standards:**
- JSDoc for complex functions
- README for each major feature
- Update docs with code changes
- Keep docs/security/ current

**Security Requirements:**
- Validate all user inputs
- Sanitize before rendering
- Use parameterized queries
- Never commit secrets
- Follow OWASP Top 10

### Common Pitfalls to Avoid

**Don't:**
- ❌ Call hooks conditionally
- ❌ Use moment.js (use date-fns)
- ❌ Commit API keys or secrets
- ❌ Skip accessibility attributes
- ❌ Ignore ESLint warnings
- ❌ Write tests after the fact
- ❌ Mix different styling approaches

**Do:**
- ✅ Write tests first (TDD)
- ✅ Use existing components
- ✅ Follow naming conventions
- ✅ Keep functions small and focused
- ✅ Document complex logic
- ✅ Handle errors gracefully
- ✅ Think mobile-first

---

## Getting Context

### How to Learn More

**For New Developers:**
1. Read [README.md](./README.md) - Project overview
2. Read [PRD.md](./PRD.md) - Product requirements
3. Read [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) - Technical overview
4. Read [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
5. Explore `src/` - Understand the structure

**For AI Agents:**
1. Read this file (CONTEXT.md) - You're doing it!
2. Read [ALGORITHMS.md](./ALGORITHMS.md) - Key algorithms
3. Read [GLOSSARY.md](./GLOSSARY.md) - Domain terminology
4. Read [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Coding standards

**For Product/Business:**
1. Read [PRD.md](./PRD.md) - Product vision
2. Read [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) - Planned features
3. Read [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) - Best practices

**For Security:**
1. Read [docs/security/SECURITY.md](./docs/security/SECURITY.md) - Security architecture
2. Read [docs/security/THREAT_MODEL.md](./docs/security/THREAT_MODEL.md) - Threats
3. Read [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) - Security findings

---

## Related Documentation

- [README.md](./README.md) - Project overview
- [PRD.md](./PRD.md) - Product requirements
- [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) - Technical audit
- [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) - Planned features
- [GLOSSARY.md](./GLOSSARY.md) - Domain terminology
- [ALGORITHMS.md](./ALGORITHMS.md) - Key algorithms

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026  
**Next Review:** April 2026

---

**End of Context Document**
