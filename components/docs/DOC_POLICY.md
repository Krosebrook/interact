# Documentation Governance Policy

**Status**: ACTIVE  
**Effective Date**: 2025-12-30  
**Authority**: Senior Engineering + DevSecOps Lead  
**Review Cycle**: Quarterly  

---

## 1. Purpose & Scope

This policy establishes governance for all documentation in the INTeract Employee Engagement Platform repository. Documentation is treated as security-critical infrastructure with the same rigor as production code.

**In Scope**:
- `docs/**` (architecture, security, framework, schemas, APIs)
- `ADR/**` (Architecture Decision Records)
- `llms.txt` and `llms-full.txt` (LLM context files)
- `CHANGELOG.md`
- Agent system prompts and configuration
- README files at root and module level

**Out of Scope**:
- User-facing help documentation (managed separately)
- Marketing content
- Third-party dependency documentation

---

## 2. Authority Model

### Human Authority (PRIMARY)
- **Who**: Repository maintainers, senior engineers, security team
- **Powers**: All documentation changes, policy amendments, emergency overrides
- **Veto**: Can reject any automated or agent-generated changes

### Documentation Authority Agent (SECONDARY)
- **Scope**: Limited write access to `docs/**`, `ADR/**`, `llms.txt`, `llms-full.txt`, `CHANGELOG.md`
- **Constraints**: 
  - Incremental updates only (no full rewrites without `DOC_REWRITE_APPROVED=true`)
  - Must provide provenance for all changes
  - Cannot modify policy files without human review
  - Must stop on uncertainty (fail-closed)
- **System Prompt**: See `docs/AGENTS_DOCUMENTATION_AUTHORITY.md`

---

## 3. Required Documentation

The following files MUST exist and be maintained:

### Core Governance
- ✅ `docs/DOC_POLICY.md` (this file)
- ✅ `docs/AGENTS_DOCUMENTATION_AUTHORITY.md` (agent system prompt)

### Technical Documentation
- ✅ `docs/SECURITY.md` (threat model, attack surface, incident response)
- ✅ `docs/ARCHITECTURE.md` (system design, data flow, modules)
- ✅ `docs/FRAMEWORK.md` (tech stack, dependencies, tooling)
- ✅ `docs/CHANGELOG.md` (semantic versioning, release notes)
- ⚠️ `docs/API_REFERENCE.md` (status: UNKNOWN - see API.md for current state)
- ⚠️ `docs/DATABASE.md` (status: UNKNOWN - see ENTITY_RELATIONSHIPS_DIAGRAM.md)

### LLM Context Files
- ✅ `llms.txt` (human-curated index of key docs)
- 🤖 `llms-full.txt` (auto-generated, CI-built from docs/**)

### Status Legend
- ✅ Exists and maintained
- ⚠️ Partial or needs consolidation
- 🤖 Auto-generated (do not edit manually)

---

## 4. Provenance Requirements

Every documentation change MUST include a provenance footer:

```markdown
---
**Provenance**:
- Source: [code|config|git|standard|human_decision]
- Locator: [file paths, commit SHAs, or "N/A"]
- Confidence: [HIGH|MEDIUM|LOW]
- Last Verified: YYYY-MM-DD
- Verified By: [human name/role or "DAA"]
```

### Confidence Levels
- **HIGH**: Directly traceable to source code, config files, or git history
- **MEDIUM**: Inferred from multiple sources or recent team knowledge
- **LOW**: Unverified, needs validation, or based on assumptions

### Fail-Closed Rule
If >20% of a document is marked LOW confidence, the document MUST be flagged for human review and not published to production context.

---

## 5. Incremental-Only Updates

**Default Mode**: All documentation updates MUST be incremental (diffs, patches, section additions).

**Full Rewrite Allowed Only When**:
- Environment variable `DOC_REWRITE_APPROVED=true` is set by human reviewer
- Accompanied by ADR documenting the rewrite rationale
- Preserves all provenance sections from previous version
- Includes a "Supersedes" reference to prior version (with commit SHA)

**Rationale**: Documentation drift is a security risk. Incremental changes preserve audit trail and prevent accidental deletion of hard-won knowledge.

---

## 6. Architecture Decision Records (ADR)

### Governance
- **Location**: `ADR/` directory at repository root
- **Format**: Markdown, numbered sequentially (e.g., `ADR-001-chosen-tech-stack.md`)
- **Append-Only**: ADRs are immutable once merged
- **Superseding**: New ADR references old ADR ID and states why it's superseded
- **Supremacy**: ADRs are the source of truth for architectural decisions

### Template
```markdown
# ADR-NNN: Title

**Status**: [Proposed|Accepted|Deprecated|Superseded]  
**Date**: YYYY-MM-DD  
**Deciders**: [names/roles]  
**Supersedes**: [ADR-XXX or N/A]  

## Context
[What is the issue or decision we're addressing?]

## Decision
[What did we decide?]

## Consequences
[What becomes easier/harder as a result?]

## Provenance
[Source of data that informed this decision]
```

---

## 7. CI Enforcement

### GitHub Actions Workflow: `docs-authority.yml`

**On PR or Push to Main**:
1. ✅ Validate required files exist
2. ✅ Build `llms-full.txt` deterministically
3. ✅ Check internal doc links (basic sanity)
4. ❌ Fail build if required files missing or links broken

**On Push to Main Only** (with write permissions):
5. 🤖 Auto-commit `llms-full.txt` ONLY if `DOC_AUTOMATION_ENABLED=true`
6. ⚠️ Kill-switch: Set `DOC_AUTOMATION_ENABLED=false` in repo settings to disable auto-commits

**Least Privilege**:
- Workflow has `contents: read` by default
- Auto-commit job requires explicit `contents: write` and is gated by kill-switch

---

## 8. Emergency Kill-Switch

**Activation**: Set repository environment variable `DOC_AUTOMATION_ENABLED=false`

**Effect**:
- CI validation continues (read-only checks)
- Auto-commit of `llms-full.txt` is skipped
- All agent-initiated changes require manual review and merge

**Use Cases**:
- Suspected agent hallucination or malfunction
- Security incident requiring manual audit
- Policy changes pending human review

---

## 9. Security Constraints

Documentation is treated as **attack surface**:

### Prohibited Content
- ❌ API keys, tokens, passwords, or other secrets
- ❌ PII (Personally Identifiable Information) without explicit consent
- ❌ Unverified security claims (SOC2, ISO, HIPAA, etc.)
- ❌ Executable code in documentation without sandboxing
- ❌ External links to untrusted domains without warnings

### Required Practices
- ✅ Secrets scanning in CI (GitHub Advanced Security or equivalent)
- ✅ All external links flagged with `(external, unverified)`
- ✅ Security-sensitive docs (e.g., incident response) stored in access-controlled locations
- ✅ Provenance for all security-related claims

---

## 10. Compliance Claims

**Rule**: Do NOT invent or imply compliance with standards (SOC2, ISO 27001, HIPAA, PCI-DSS, GDPR, etc.) unless:
1. Formal audit has been completed
2. Certification is current and verifiable
3. Documented in `docs/COMPLIANCE.md` with audit date and scope

**If Uncertain**: Mark as `Status: UNKNOWN` and require human review.

---

## 11. Review & Maintenance

### Quarterly Review
- Senior engineer reviews all docs for drift
- Update provenance timestamps
- Archive deprecated documentation to `docs/archive/`
- Update `llms.txt` index

### On Major Release
- Rebuild `llms-full.txt`
- Update `CHANGELOG.md` with ADR references
- Verify all external links

---

## 12. Agent Output Validation

### Required Checks
1. **Provenance Present**: Every change has Source/Locator/Confidence
2. **No Secrets**: Grep/scan for common secret patterns
3. **No Hallucinations**: Cross-reference claims with codebase
4. **Incremental**: Diffs are small and targeted (no full rewrites)
5. **Fail-Closed**: Uncertain sections marked UNKNOWN

### Human Review Triggers
- Any LOW confidence section
- Security-related claims
- Compliance language
- External API or integration documentation

---

## 13. Enforcement

**Violations**:
- Pull requests failing CI checks are automatically blocked
- Agent changes without provenance are rejected
- Manual commits bypassing policy require justification in commit message

**Appeals**:
- Repository maintainers can override policy with explicit `[POLICY-OVERRIDE]` tag and rationale
- Override commits are logged and reviewed in next quarterly audit

---

## 14. Change Log (This Policy)

| Version | Date       | Change                                      | Author          |
|---------|------------|---------------------------------------------|-----------------|
| 1.0     | 2025-12-30 | Initial policy established                  | DevSecOps Lead  |

---

**Provenance**:
- Source: human_decision + standard (documentation best practices)
- Locator: N/A (policy document)
- Confidence: HIGH
- Last Verified: 2025-12-30
- Verified By: Senior Full-Stack Engineer + DevSecOps Lead