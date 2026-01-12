# Changelog

All notable changes to the Interact platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (January 2026)
- **Safe Branch Merging Infrastructure:**
  - `scripts/safe-merge-branch.sh`: Automated script for safely merging branches with comprehensive checks
  - `scripts/cleanup-merged-branches.sh`: Utility to clean up branches that have been merged
  - `docs/SAFE_BRANCH_MERGING.md`: Complete guide for safe branch merging practices
  - `docs/PRE_MERGE_CHECKLIST.md`: Comprehensive pre-merge checklist template
  - `.github/workflows/safe-merge-checks.yml`: GitHub Actions workflow for automated merge validation
  - Branch management documentation added to README.md
- Comprehensive technical documentation in `/components/docs/` (60+ files):
  - Architecture documentation (ARCHITECTURE.md, COMPLETE_SYSTEM_ARCHITECTURE.md)
  - Database schema and specifications (DATABASE_SCHEMA_TECHNICAL_SPEC.md)
  - API reference and integration guides
  - Component library documentation
  - Deployment and operations guides
  - Entity access rules and security models
  - Edge case handling documentation
  - Testing and quality assurance guides
- Comprehensive security documentation framework in `/docs/security/` (7 files):
  - SECURITY.md: Complete security architecture and measures
  - INCIDENT_RESPONSE.md: Detailed incident response procedures
  - VULNERABILITY_DISCLOSURE.md: Responsible disclosure policy
  - GDPR_CHECKLIST.md: GDPR compliance tracking and requirements
  - DATA_MAPPING.md: Data flow and processing documentation
  - SECURITY_HEADERS.md: Security header configuration guide
  - PRIVACY_POLICY_TEMPLATE.md: Privacy policy template for legal review

### Changed (December 2025)
- **BREAKING:** Replaced `react-quill` (v2.0.0) with `react-quill-new` (v3.7.0)
  - Fixes Cross-Site Scripting (XSS) vulnerability in Quill editor
  - Migration: Update imports from `'react-quill'` to `'react-quill-new'`
  - Updated RichTextEventEditor component to use new package
- Updated `jspdf` from v2.5.2 to v4.0.0
  - Fixes DOMPurify XSS vulnerability
  - Includes updated DOMPurify v3.2.4+ with XSS protections

### Fixed (December 2025)
- Resolved 8 npm security vulnerabilities (2 HIGH, 6 MODERATE severity):
  - Fixed glob CLI command injection vulnerability (CVE-2025-29159) - HIGH
  - Fixed js-yaml prototype pollution vulnerability - MODERATE
  - Fixed mdast-util-to-hast unsanitized class attribute - MODERATE
  - Fixed vite server.fs.deny bypass on Windows - MODERATE
  - Fixed Quill XSS vulnerability via react-quill-new migration - MODERATE
  - Fixed DOMPurify XSS via jspdf upgrade - MODERATE
- Removed unused React and useState imports from RichTextEventEditor

### Security

**Current Status (January 9, 2026):**
- ⚠️ **3 HIGH severity vulnerabilities** detected in React Router (GHSA-2w69-qvjg-hvjx)
  - Affects: react-router-dom 6.26.0, react-router, @remix-run/router <=1.23.1
  - Issue: XSS vulnerability via Open Redirects
  - Fix: `npm audit fix` to upgrade to latest versions
  - Status: **REQUIRES IMMEDIATE ATTENTION**

**Previous Security Improvements (December 2025):**
- Enhanced XSS protection through updated dependencies
- Documented security headers configuration (CSP, HSTS, etc.)
- Established security incident response procedures
- Created vulnerability disclosure program
- Documented GDPR compliance requirements
- Mapped all data flows and processing activities

## [0.0.0] - 2024-12-29

### Initial Release
- Employee engagement platform with gamification
- 47 application pages covering all aspects of engagement
- Activity management with AI-powered recommendations
- Points, badges, and leaderboard system
- Analytics and reporting
- Multi-role support (Admin, Facilitator, Team Leader, Participant)
- 15+ integrations (Google Calendar, Slack, Teams, AI services)
- React 18 + Vite 6 + Base44 SDK architecture
- Responsive design with Tailwind CSS and Radix UI

---

## Version History

### [Unreleased] - In Development
Focus: Security & Compliance Framework (Feature 1, Q1 2026)
Status: Documentation phase complete, security vulnerabilities re-emerged

### [0.0.0] - 2024-12-29
Initial codebase state

---

## Notes for Contributors

When adding to this changelog:
1. Add new entries under `[Unreleased]`
2. Use the following categories as needed:
   - `Added` for new features
   - `Changed` for changes in existing functionality
   - `Deprecated` for soon-to-be removed features
   - `Removed` for now removed features
   - `Fixed` for any bug fixes
   - `Security` for vulnerability fixes
3. Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
4. Be specific and include issue/PR numbers when applicable
5. Note breaking changes with **BREAKING:**
6. Security fixes should be in the `Security` section

## Security Releases

For security-related releases:
1. Always use the `Security` section
2. Include CVE numbers if assigned
3. Describe the impact and severity
4. Credit the reporter (if they agree to attribution)
5. Reference the security advisory (if public)

---

[unreleased]: https://github.com/Krosebrook/interact/compare/v0.0.0...HEAD
[0.0.0]: https://github.com/Krosebrook/interact/releases/tag/v0.0.0
