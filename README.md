# Interact - Employee Engagement & Gamification Platform

[![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue.svg)](https://github.com/Krosebrook/interact)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Security](https://img.shields.io/badge/security-100%2F100-success.svg)](./docs/audits/CODEBASE_AUDIT.md)
[![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0-success.svg)](./CHANGELOG.md#security)
[![Documentation](https://img.shields.io/badge/docs-98%2F100-success.svg)](./docs/index.md)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)](https://vitejs.dev)

**Framework:** React 18 + Vite 6 + Base44 SDK
**Status:** Active Development

## Overview

Interact is an enterprise-grade employee engagement platform that transforms workplace culture through gamification, AI-powered personalization, and seamless team activity management. The platform enables organizations to plan activities, implement sophisticated gamification mechanics, track engagement metrics, and foster meaningful team connections.

### Why Interact?

✨ **Key Features:**
- 🎮 **Gamification Engine** - Points, badges, leaderboards, and customizable challenges
- 🤖 **AI-Powered Recommendations** - Personalized activity suggestions using machine learning
- 📊 **Advanced Analytics** - Real-time engagement metrics and team insights
- 🔗 **15+ Integrations** - Google Calendar, Slack, Teams, OpenAI, and more
- 🔒 **Enterprise Security** - GDPR compliant, SOC 2 ready, zero vulnerabilities
- 📱 **Mobile-First Design** - Responsive UI with PWA capabilities (roadmap)

## 📋 Table of Contents

- [Overview](#overview)
- [Documentation](#-documentation)
- [Deploying to Vercel](#-deploying-to-vercel)
- [Quick Start](#-quick-start)
- [Deploy to Vercel](#-deploy-to-vercel)
- [Project Structure](#️-project-structure)
- [Current Features](#-current-features)
- [Roadmap Highlights](#-roadmap-highlights)
- [Contributing](#-contributing)
- [Quality Metrics](#-quality-metrics)
- [License](#-license)
- [Resources](#-resources)

## 📚 Documentation

**[📖 Complete Documentation Hub](./docs/README.md)** - Central navigation for all documentation

### Quick Links

**Getting Started:**
- **[Quick Start Guide](#-quick-start)** - Get up and running in 5 minutes
- **[Development Guide](./docs/getting-started/DEVELOPMENT.md)** - Local development setup
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute

**Essential Documentation:**
- **[Product Requirements (PRD)](./docs/planning/PRD.md)** - Product vision and requirements
- **[Feature Roadmap](./docs/planning/FEATURE_ROADMAP.md)** - 18-month roadmap with 15 features
- **[API Integration Guide](./docs/guides/API_INTEGRATION_GUIDE.md)** - Base44 SDK integration
- **[Testing Guide](./docs/guides/TESTING.md)** - Testing strategy and best practices

**For Developers:**
- **[Usage Examples](./docs/guides/USAGE-EXAMPLES.md)** - Code examples and patterns
- **[Documentation Guidelines](./docs/guides/DOCUMENTATION_GUIDELINES.md)** - How to write docs
- **[Codebase Audit](./docs/audits/CODEBASE_AUDIT.md)** - Technical audit and quality metrics
- **[FAQ](./FAQ.md)** - Frequently asked questions

**Operations:**
- **[Deployment Checklist](./docs/operations/DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Security Documentation](./docs/security/)** - Security and compliance
- **[Integrations](./docs/integrations/INTEGRATIONS.md)** - Third-party integrations

**By Audience:**
- **Developers:** Start with [Quick Start](#-quick-start) → [Development Guide](./docs/getting-started/DEVELOPMENT.md) → [Usage Examples](./docs/guides/USAGE-EXAMPLES.md)
- **Product Managers:** Read [PRD](./docs/planning/PRD.md) → [Feature Roadmap](./docs/planning/FEATURE_ROADMAP.md)
- **DevOps:** Review [Deployment Checklist](./docs/operations/DEPLOYMENT_CHECKLIST.md) → [CI/CD](./docs/operations/CI-CD.md)
- **Security:** Check [Security Docs](./docs/security/SECURITY.md) → [Codebase Audit](./docs/audits/CODEBASE_AUDIT.md)

> **📊 70+ organized documentation files** in 11 categories covering architecture, APIs, security, deployment, and more.

### Base44 Integration
- **[.github/base44-updates.md](./.github/base44-updates.md)** - Base44 visual canvas integration guide and module architecture
- **[.github/agents.md](./.github/agents.md)** - AI agent context log and historical development decisions

## 🚀 Deploying to Vercel

**Project type:** Vercel Web App — React SPA (single-page application) built with Vite.

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Krosebrook/interact)

### Manual deploy

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Vercel auto-detects the Vite framework. Confirm the settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
   - **Node.js Version:** 20
3. Add the required environment variables (see below), then click **Deploy**.

### Environment variables

Copy `.env.example` to understand all available variables. The following are **required** for the app to function:

| Variable | Description |
|---|---|
| `VITE_BASE44_APP_ID` | Your Base44 application ID |
| `VITE_BASE44_BACKEND_URL` | Base44 backend server URL (e.g. `https://your-backend.base44.app`) |

The following are **optional** but enable specific features:

| Variable | Description |
|---|---|
| `VITE_BASE44_API_URL` | Base44 API URL (if different from backend URL) |
| `VITE_COMPANY_ID` | Company identifier |
| `VITE_ENABLE_ANALYTICS` | Enable analytics (`true`/`false`) |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (payments feature) |

Set these in the Vercel dashboard under **Settings → Environment Variables**, or via the Vercel CLI:

```bash
vercel env add VITE_BASE44_APP_ID
vercel env add VITE_BASE44_BACKEND_URL
```

> **Note:** All `VITE_` prefixed variables are bundled into the client-side build. Never put secrets in `VITE_` variables. Backend/serverless function secrets (OpenAI keys, Stripe secret keys, etc.) should be set separately in your Base44 dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 20 (use `.nvmrc` — run `nvm use` if you have nvm)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm test` - Run unit tests
- `npm run test:coverage` - Generate test coverage report

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKrosebrook%2Finteract)

**Required environment variables** (set in Vercel dashboard under Project → Settings → Environment Variables):

| Variable | Description |
|---|---|
| `VITE_BASE44_APP_ID` | Base44 application identifier |
| `VITE_BASE44_BACKEND_URL` | Base44 backend service URL |

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
# Fill in VITE_BASE44_APP_ID and VITE_BASE44_BACKEND_URL
```

See **[docs/operations/VERCEL_AUDIT.md](./docs/operations/VERCEL_AUDIT.md)** for the full deployment guide and multi-repo Vercel readiness assessment.

### Tools & Utilities

#### PRD Generator
Generate comprehensive Product Requirements Documents from feature ideas using AI:

```bash
# Simple usage
node scripts/generate-prd.js --idea "Add dark mode to dashboard"

# Interactive mode (recommended)
node scripts/generate-prd.js --interactive

# With full context
node scripts/generate-prd.js \
  --idea "Add AI-powered chatbot for customer support" \
  --context '{"targetAudience":"All users","businessGoals":"Reduce support costs","timeline":"Q2 2026"}' \
  --output PRD-chatbot.md

# From file
node scripts/generate-prd.js --file ideas/feature.txt
```

**PRD Generator Features:**
- ✅ 13-section comprehensive PRD structure
- ✅ AI-powered content generation (Claude 4 Sonnet)
- ✅ Gherkin-style user stories
- ✅ Technical architecture templates
- ✅ Security & compliance sections
- ✅ CLI and web UI interfaces

**Web Interface:** Navigate to `/prd-generator` in the application for a user-friendly form interface.

### Git & Branch Management

- `./scripts/safe-merge-branch.sh <branch-name>` - Safely merge a branch into main with automated checks
- `./scripts/cleanup-merged-branches.sh` - Clean up branches that have been merged into main

**Documentation:**
- **[docs/SAFE_BRANCH_MERGING.md](./docs/SAFE_BRANCH_MERGING.md)** - Complete guide for safe branch merging
- **[docs/PRE_MERGE_CHECKLIST.md](./docs/PRE_MERGE_CHECKLIST.md)** - Checklist template before merging

## ☁️ Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Krosebrook/interact)

### Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |
| **Node.js Version** | 20.x |

### Required Environment Variables

Configure these in your Vercel project's **Settings → Environment Variables**:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BASE44_APP_ID` | Your Base44 application ID | ✅ Yes |
| `VITE_BASE44_BACKEND_URL` | Base44 backend URL (e.g. `https://api.base44.app`) | ✅ Yes |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (payments) |
| `VITE_ENABLE_ANALYTICS` | Feature flag: enable analytics (`true`/`false`) |
| `VITE_ENABLE_PWA` | Feature flag: enable PWA (`true`/`false`) |
| `VITE_COMPANY_ID` | Company identifier for multi-tenant setups |

> **Tip:** Copy `.env.example` to `.env.local` for local development.  
> Backend serverless function secrets (OpenAI keys, Cloudinary, etc.) are managed separately in your Base44 dashboard.

### SPA Routing

The included `vercel.json` configures a catch-all rewrite so React Router handles all client-side navigation correctly without 404s on page refresh.



```
interact/
├── src/
│   ├── pages/           # 47 application pages
│   ├── components/      # 42 component categories
│   ├── modules/         # NEW: Modular feature architecture (Base44-compatible)
│   │   └── [feature-name]/
│   │       ├── components/   # Feature-specific components
│   │       ├── hooks/        # Feature-specific hooks
│   │       ├── services/     # Business logic & API integration
│   │       └── utils/        # Helper functions
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and libraries
│   ├── api/             # API client configuration
│   └── assets/          # Static assets
├── functions/           # 61 Backend serverless functions
├── public/              # Public static files
└── docs/                # Documentation (audit, PRD, roadmap)
```

### Module Architecture

**New Feature Pattern (Q1 2026+):** All new features should use the modular architecture in `src/modules/[feature-name]/`. This pattern provides:

- ✅ **Base44 Visual Canvas Compatibility** - Components with `data-b44-sync` attributes
- ✅ **API Versioning** - Service layer with version management
- ✅ **Clear Feature Boundaries** - Self-contained modules
- ✅ **Backward Compatible** - Coexists with existing component structure

**Example:** See `src/modules/example-feature/` for a complete reference implementation.

**Documentation:** Comprehensive guide available in [`.github/base44-updates.md`](./.github/base44-updates.md)

## ✅ Recent Updates & Action Items

**Q1 2026 - Security & Compliance Framework (Feature 1) - COMPLETED (Security Fixes):**
- ✅ All npm security vulnerabilities resolved (0 vulnerabilities as of January 12, 2026)
- ✅ 3 HIGH severity React Router XSS vulnerabilities fixed (January 9, 2026)
- ✅ Previous 8 security vulnerabilities resolved (December 2025)
- ✅ Comprehensive security documentation created (`docs/security/`)
- ✅ 60+ technical documentation files in `components/docs/`
- ✅ GDPR compliance framework established
- ✅ Incident response procedures documented

**Remaining High Priority (P1):**
- 2 React Hooks violations requiring fixes
- 0% test coverage - testing infrastructure needed (Feature 2, Q1 2026)
- 100+ ESLint warnings and errors
- No TypeScript adoption (Feature 3, Q2-Q3 2026)

**See [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) for complete analysis and [CHANGELOG.md](./CHANGELOG.md) for recent changes.**

## 🎯 Current Features

- **47 Application Pages** covering all aspects of employee engagement
- **Activity Management** with AI-powered recommendations
- **Gamification System** with points, badges, and leaderboards
- **Analytics & Reporting** for engagement insights
- **Multi-Role Support** (Admin, Facilitator, Team Leader, Participant)
- **15+ Integrations** (Google Calendar, Slack, Teams, AI services, etc.)
- **Responsive Design** with Tailwind CSS and Radix UI
- **Base44 Backend** with 61 serverless functions

## 🔮 Roadmap Highlights

**Q1 2026:** Security hardening, testing infrastructure, enterprise SSO  
**Q2 2026:** TypeScript migration, AI recommendations, mobile PWA  
**Q3 2026:** Advanced analytics, customizable gamification, wellness integration  
**Q4 2026:** Multi-tenancy, AI content generation, advanced LMS  

**See [FEATURE_ROADMAP.md](./docs/planning/FEATURE_ROADMAP.md) for complete 18-month roadmap with 15 features.**

## 🤝 Contributing

**For GitHub Copilot Agents and Developers:**
- Use the **[Feature-to-PR Template](./.github/FEATURE_TO_PR_TEMPLATE.md)** for structured feature development
- Follow **[Copilot Instructions](./.github/copilot-instructions.md)** for coding standards and patterns
- Review agent prompts in **[.github/prompts](./.github/prompts/)** for specialized tasks

Please refer to the [PRD.md](./docs/planning/PRD.md) for:
- Technical architecture details
- Development standards
- Integration requirements
- Security guidelines

## 📊 Quality Metrics

| Metric | Current | Target (6 months) |
|--------|---------|-------------------|
| Test Coverage | 0% | 80% |
| Security Score | **100/100** ✅ | 95/100 |
| Security Vulnerabilities | **0** ✅ | 0 |
| Code Quality | 65/100 | 90/100 |
| Documentation | **98/100** ⬆️ | 98/100 |
| Performance | 75/100 | 90/100 |

**Recent Improvements (Q4 2025 - Q1 2026):**
- Security: All vulnerabilities fixed (January 9, 2026) - Score: 100/100
- Documentation: 85/100 → 98/100 (60+ technical docs added)

**See [CODEBASE_AUDIT.md](./docs/audits/CODEBASE_AUDIT.md) Section 14 for scoring methodology.**

## 📝 License

Copyright © 2024 Krosebrook. All rights reserved.

## 🔗 Resources

- **Base44 SDK:** [Documentation](https://base44.io)
- **React:** [react.dev](https://react.dev)
- **Vite:** [vitejs.dev](https://vitejs.dev)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)

---

**Last Updated:** January 21, 2026
**Maintained by:** Krosebrook
