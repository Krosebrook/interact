# Developer Onboarding Checklist

**Project:** Interact — Employee Engagement & Gamification Platform
**Last Updated:** March 8, 2026
**Version:** 1.0.0
**Audience:** New developers, contractors, interns

---

## Overview

This checklist guides you from zero to your first merged pull request. Work through each section in order. Most tasks take **1–4 hours** total for an experienced developer; allocate a full first day if you are new to the stack.

---

## Before Day One (Team Lead / Manager)

> Complete these items **before** the new developer's start date.

- [ ] Grant GitHub repository access (`Krosebrook/interact` — minimum: **Write** role for contributors, **Maintain** for tech leads)
- [ ] Add to Slack/Teams channels: `#engineering`, `#deployments`, `#incidents`, `#general`
- [ ] Send Base44 dashboard invitation
- [ ] Send Vercel project invitation (if DevOps access needed)
- [ ] Send `.env.local` template or required secret values via a secure channel (e.g., 1Password, Vault — **not** Slack or email)
- [ ] Schedule a 30-minute onboarding call to walk through architecture

---

## Section 1 — Prerequisites

- [ ] **Node.js v20** installed and active
  ```bash
  node --version   # Should show v20.x.x
  ```
  > Tip: Use [nvm](https://github.com/nvm-sh/nvm) and run `nvm use` at the repo root (`.nvmrc` is set to `20`).

- [ ] **npm** (bundled with Node.js)
  ```bash
  npm --version   # Should show 10.x or later
  ```

- [ ] **Git** configured with your name and email
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  ```

- [ ] **VS Code** (recommended) with extensions:
  - ESLint (`dbaeumer.vscode-eslint`)
  - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
  - Prettier (`esbenp.prettier-vscode`) — optional
  - GitLens (`eamodio.gitlens`) — optional

---

## Section 2 — Repository Access

- [ ] Accept the GitHub repository invitation
- [ ] Clone the repository:
  ```bash
  git clone https://github.com/Krosebrook/interact.git
  cd interact
  ```
- [ ] Verify you can see the repository and push to a test branch:
  ```bash
  git checkout -b test/onboarding-$(whoami)
  git push origin test/onboarding-$(whoami)
  # Then delete it
  git push origin --delete test/onboarding-$(whoami)
  git checkout main
  ```

---

## Section 3 — Local Environment Setup

- [ ] Install dependencies:
  ```bash
  npm install
  ```

- [ ] Create your local environment file:
  ```bash
  cp .env.example .env.local
  ```

- [ ] Populate `.env.local` with values provided by your team lead (see `docs/guides/CONFIGURATION_GUIDE.md` for the full variable list).

- [ ] Start the development server:
  ```bash
  npm run dev
  ```
  Open [http://localhost:5173](http://localhost:5173) — you should see the Interact login/home page.

- [ ] Run the linter to verify your environment is configured correctly:
  ```bash
  npm run lint
  # Expected: 0 errors (warnings are acceptable)
  ```

- [ ] Run the test suite:
  ```bash
  npm run test:run
  # Expected: all tests pass
  ```

- [ ] Run a production build locally:
  ```bash
  npm run build
  # Expected: build completes, dist/ folder created
  ```

---

## Section 4 — Codebase Orientation

Work through these in order. Each item should take 10–20 minutes.

- [ ] **Read the README** — `README.md` — 10 min
  - Understand the platform purpose, feature summary, and quick links.

- [ ] **Read the Architecture Overview** — `docs/architecture/ARCHITECTURE_OVERVIEW.md` — 15 min
  - Understand the system layers (frontend → Base44 functions → third-party services).

- [ ] **Read the Development Guide** — `docs/getting-started/DEVELOPMENT.md` — 15 min
  - Understand the project structure, available npm scripts, and development workflow.

- [ ] **Read the Coding Standards** — `docs/development/CODING_STANDARDS.md` — 20 min
  - Understand naming conventions, component patterns, hooks rules, and the code review checklist.

- [ ] **Read the Contribution Guide** — `CONTRIBUTING.md` — 10 min
  - Understand the PR process, commit message format, and branching strategy.

- [ ] **Explore the `src/` directory** — 20 min
  - Browse `src/pages/` (route components), `src/components/` (UI components), `src/hooks/` (custom hooks).

- [ ] **Explore the `functions/` directory** — 10 min
  - Browse a few `.ts` files to understand the Base44 serverless function pattern.

- [ ] **Read about the ADRs** — `ADR/README.md` + at least two ADR files — 15 min
  - Understand key architectural decisions (why Base44? why React over Vue? why Tailwind?).

---

## Section 5 — Key Documentation

- [ ] Bookmark the **Documentation Hub**: [`docs/README.md`](./../../docs/README.md)
- [ ] Review **Environment Variables**: [`docs/reference/ENV-VARS.md`](./../../docs/reference/ENV-VARS.md)
- [ ] Review **Testing Guide**: [`docs/guides/TESTING.md`](./../../docs/guides/TESTING.md)
- [ ] Review **Security Guide**: [`docs/security/SECURITY.md`](./../../docs/security/SECURITY.md)
- [ ] Bookmark the **Troubleshooting Guide**: [`docs/guides/TROUBLESHOOTING.md`](./../../docs/guides/TROUBLESHOOTING.md)

---

## Section 6 — First Tasks

Complete these by the end of your **first week**.

- [ ] Join and introduce yourself in the `#engineering` channel.
- [ ] Attend your onboarding call with the Tech Lead.
- [ ] Pick up a `good first issue` from GitHub Issues.
- [ ] Create a feature branch, make a small change, and open your first pull request:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b fix/your-first-fix
  # Make changes...
  git add .
  git commit -m "fix(scope): describe what you fixed"
  git push origin fix/your-first-fix
  # Open a PR on GitHub from fix/your-first-fix → develop
  ```
- [ ] Have your PR reviewed and merged.
- [ ] Verify the change is visible in the Preview deployment.

---

## Section 7 — Verification Checklist

Before you consider onboarding complete, verify:

- [ ] `npm run dev` — development server runs without errors
- [ ] `npm run lint` — zero lint errors
- [ ] `npm run test:run` — all tests pass
- [ ] `npm run build` — production build succeeds
- [ ] `npm run typecheck` — no TypeScript errors
- [ ] You can log into the application locally
- [ ] You understand how to create a branch, commit, and open a PR
- [ ] You know who to ask for help (see escalation matrix in `docs/operations/RUNBOOK.md`)

---

## Quick Reference — Common Commands

| Task | Command |
|---|---|
| Start dev server | `npm run dev` |
| Run linter | `npm run lint` |
| Auto-fix lint issues | `npm run lint:fix` |
| Run all tests | `npm run test:run` |
| Run tests with UI | `npm run test:ui` |
| Check coverage | `npm run test:coverage` |
| TypeScript check | `npm run typecheck` |
| Production build | `npm run build` |
| Preview production build | `npm run preview` |

---

## Questions?

- **Slack:** `#engineering` channel
- **GitHub Discussions:** [`github.com/Krosebrook/interact/discussions`](https://github.com/Krosebrook/interact/discussions)
- **FAQ:** [`FAQ.md`](./../../FAQ.md)
- **Troubleshooting:** [`docs/guides/TROUBLESHOOTING.md`](./../../docs/guides/TROUBLESHOOTING.md)
