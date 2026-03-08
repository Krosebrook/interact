# Versioning Policy

**Project:** Interact — Employee Engagement & Gamification Platform
**Last Updated:** March 8, 2026
**Version:** 1.0.0
**Audience:** All team members

---

## Table of Contents

1. [Version Scheme](#1-version-scheme)
2. [Branch Strategy](#2-branch-strategy)
3. [Release Process](#3-release-process)
4. [Hotfix Process](#4-hotfix-process)
5. [Changelog Requirements](#5-changelog-requirements)
6. [Tag Naming Convention](#6-tag-naming-convention)
7. [Pre-release Labels](#7-pre-release-labels)
8. [Deprecation Policy](#8-deprecation-policy)

---

## 1. Version Scheme

Interact follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH[-prerelease][+build]
```

| Segment | Increment when… | Example |
|---|---|---|
| `MAJOR` | A breaking change is introduced (API, auth flow, data schema) | `1.0.0` → `2.0.0` |
| `MINOR` | A new backward-compatible feature is added | `1.0.0` → `1.1.0` |
| `PATCH` | A backward-compatible bug fix is shipped | `1.0.0` → `1.0.1` |

### Decision guide

```
Is any existing integration / API broken?
  YES → bump MAJOR, reset MINOR and PATCH to 0

Is a new feature added (no breaking change)?
  YES → bump MINOR, reset PATCH to 0

Is only a bug fixed or a dependency patched?
  YES → bump PATCH only
```

### Current version

The authoritative version lives in `package.json` → `"version"` field. This is the single source of truth.

---

## 2. Branch Strategy

| Branch | Purpose | Protected | Merge target |
|---|---|---|---|
| `main` | Production-deployed code | ✅ Yes | _(deploy target)_ |
| `develop` | Active integration branch; staging deploys | ✅ Yes | `main` at release |
| `feature/<name>` | New feature development | No | `develop` |
| `fix/<name>` | Non-urgent bug fixes | No | `develop` |
| `hotfix/<name>` | Urgent production fixes | No | `main` AND `develop` |
| `release/<version>` | Release stabilization (if needed) | No | `main` AND `develop` |
| `docs/<name>` | Documentation-only changes | No | `develop` or `main` |
| `chore/<name>` | Dependencies, tooling, CI | No | `develop` |

### Rules

- Branch from `develop` for everything except hotfixes.
- Hotfixes branch from `main` and must be merged back into **both** `main` and `develop`.
- Delete branches after merging (configured in GitHub repository settings).
- Branch names must be lowercase, hyphen-separated, and descriptive (< 50 characters).

---

## 3. Release Process

### 3.1 Planned release

1. **Feature freeze** — Stop merging new features into `develop`; only bug fixes allowed.
2. **Create release branch** (optional for large releases):
   ```bash
   git checkout develop
   git checkout -b release/v1.2.0
   ```
3. **Bump version** — Update `package.json`:
   ```bash
   npm version minor   # or major / patch
   ```
4. **Update CHANGELOG.md** — Move items from `[Unreleased]` to the new version section.
5. **Open release PR** — PR from `release/v1.2.0` (or `develop`) → `main`.
6. **CI must pass** — All tests, lint, and build checks green.
7. **At least one approving review** from Tech Lead or Product Owner.
8. **Merge to `main`** using squash merge.
9. **Tag the release**:
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin v1.2.0
   ```
10. **Create GitHub Release** — Paste the CHANGELOG section for this version as the release body.
11. **Merge back to `develop`** — Keep branches in sync:
    ```bash
    git checkout develop
    git merge main
    git push origin develop
    ```
12. **Verify Vercel deployment** — Confirm production URL loads the new version.

### 3.2 Small patch release

For patches (bug fixes only), a release branch is optional. You may PR directly from `fix/<name>` → `main`, then tag.

---

## 4. Hotfix Process

A hotfix is a **critical** fix that cannot wait for the next scheduled release.

1. Branch from `main`:
   ```bash
   git checkout main
   git checkout -b hotfix/v1.0.1-auth-crash
   ```
2. Apply the minimal fix.
3. Bump patch version: `npm version patch`
4. Update CHANGELOG.md (add a dated entry under `[Unreleased]` or new version).
5. PR to `main` — get one approval, all CI must pass.
6. Merge and tag:
   ```bash
   git tag -a v1.0.1 -m "Hotfix v1.0.1: fix auth crash on token expiry"
   git push origin v1.0.1
   ```
7. **Immediately** merge `main` back into `develop`:
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```
8. Create GitHub Release and notify stakeholders.

---

## 5. Changelog Requirements

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Structure

```markdown
## [Unreleased]

### Added
- Description of new feature (PR #123)

### Changed
- Description of behavioral change

### Fixed
- Description of bug fix

### Removed
- Description of removed functionality

### Security
- Description of security fix (CVE-#### if applicable)

---

## [1.2.0] – 2026-06-15
...
```

### Rules

| Rule | Detail |
|---|---|
| Every user-facing PR must update CHANGELOG | Add under `[Unreleased]` in the appropriate category |
| Use plain language | Describe impact to the user, not the internal code change |
| Include PR/issue references | `(#123)` at end of each entry |
| Security fixes get their own section | List all security fixes separately for audit purposes |
| No changelog for docs-only or chore PRs | Unless the change affects user behavior |

---

## 6. Tag Naming Convention

| Tag format | Used for | Example |
|---|---|---|
| `v{MAJOR}.{MINOR}.{PATCH}` | Production releases | `v1.2.0` |
| `v{MAJOR}.{MINOR}.{PATCH}-alpha.{N}` | Alpha pre-releases | `v1.0.0-alpha.1` |
| `v{MAJOR}.{MINOR}.{PATCH}-beta.{N}` | Beta pre-releases | `v1.0.0-beta.3` |
| `v{MAJOR}.{MINOR}.{PATCH}-rc.{N}` | Release candidates | `v1.0.0-rc.1` |

Tags must always be annotated (use `git tag -a`), not lightweight, so they appear in GitHub Releases.

---

## 7. Pre-release Labels

| Label | Meaning | Stability |
|---|---|---|
| `alpha` | Feature-incomplete; for internal testing only | Unstable — breaking changes expected |
| `beta` | Feature-complete; for early adopter testing | Mostly stable — some breaking changes possible |
| `rc` (release candidate) | Intended for final testing before production | Stable — only critical fixes allowed |
| _(none)_ | General availability | Stable — no breaking changes without MAJOR bump |

**Current status:** `v0.1.0-alpha` — active development, pre-public release.

---

## 8. Deprecation Policy

When a feature, API endpoint, or configuration option is planned for removal:

1. Mark it as deprecated in the code with a comment: `// @deprecated since v1.2.0 — use X instead`
2. Add a deprecation notice to the relevant documentation.
3. Keep the deprecated item functional for at least **one MINOR version** before removal.
4. Removal is a **MAJOR** version bump if the deprecated item was part of the public API.
5. Add a `### Deprecated` section to CHANGELOG.md under the version it was deprecated.
