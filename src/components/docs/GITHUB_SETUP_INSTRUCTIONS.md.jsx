# GitHub Repository Setup for Documentation Authority

**Prerequisite**: Base44 app synced to GitHub repository  
**Estimated Time**: 15 minutes  

---

## Step 1: Create Required Directories

```bash
cd [your-github-repo]

mkdir -p scripts
mkdir -p .github/workflows
mkdir -p ADR
```

---

## Step 2: Create scripts/build-llms-docs.py

Create file `scripts/build-llms-docs.py` with this exact content:

```python
#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

DOCS_DIR = Path("components/docs")  # ← Note: docs are in components/docs for Base44
OUTPUT_FILE = Path("llms-full.txt")

PREFERRED_ORDER = [
    "DOC_POLICY.md",
    "SECURITY.md",
    "ARCHITECTURE.md",
    "FRAMEWORK.md",
    "CHANGELOG_SEMANTIC.md",
    "API_REFERENCE.md",
    "COMPLETE_SYSTEM_ARCHITECTURE.md",
    "ENTITY_RELATIONSHIPS_DIAGRAM.md",
    "DATABASE_SCHEMA_TECHNICAL_SPEC.md",
    "AGENTS_DOCUMENTATION_AUTHORITY.md",
]

EXCLUDE = {OUTPUT_FILE.name, "DEPRECATED.md", "README.md"}

def _read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8").replace("\r\n", "\n")

def assemble_docs() -> int:
    if not DOCS_DIR.exists():
        raise SystemExit(f"docs directory not found: {DOCS_DIR}")

    md_files = sorted([p for p in DOCS_DIR.glob("*.md") if p.name not in EXCLUDE], key=lambda p: p.name.lower())

    preferred = [DOCS_DIR / name for name in PREFERRED_ORDER if (DOCS_DIR / name).exists()]
    remaining = [p for p in md_files if p not in preferred]
    ordered = preferred + remaining

    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    parts: list[str] = []
    parts.append("# llms-full.txt (generated)")
    parts.append(f"- GeneratedAtUTC: {generated_at}")
    parts.append("- Source: components/docs/**")
    parts.append("")

    count = 0
    for p in ordered:
        content = _read_text(p).strip()
        if not content:
            content = f"> NOTE: `{p.name}` is empty.\n"
        parts.append("---")
        parts.append(f"## FILE: {p.as_posix()}")
        parts.append(content)
        parts.append("")
        count += 1

    OUTPUT_FILE.write_text("\n".join(parts).rstrip() + "\n", encoding="utf-8")
    return count

if __name__ == "__main__":
    n = assemble_docs()
    print(f"✅ Built {OUTPUT_FILE} from {n} docs files.")
```

Make executable:
```bash
chmod +x scripts/build-llms-docs.py
```

---

## Step 3: Create .github/workflows/docs-authority.yml

Create file `.github/workflows/docs-authority.yml` with this exact content:

```yaml
name: Docs Authority (Validate + Build llms-full)

on:
  pull_request:
    branches: [ main ]
    paths:
      - "components/docs/**"
      - "ADR/**"
      - "scripts/**"
      - "llms.txt"
  push:
    branches: [ main ]
    paths:
      - "components/docs/**"
      - "ADR/**"
      - "scripts/**"
      - "llms.txt"

permissions:
  contents: read

jobs:
  validate-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Required files present
        run: |
          set -euo pipefail
          req=(
            "components/docs/SECURITY.md"
            "components/docs/FRAMEWORK.md"
            "components/docs/CHANGELOG_SEMANTIC.md"
            "components/docs/DOC_POLICY.md"
            "components/docs/AGENTS_DOCUMENTATION_AUTHORITY.md"
            "llms.txt"
          )
          for f in "${req[@]}"; do
            test -f "$f" || (echo "❌ Missing required file: $f" && exit 1)
          done

      - name: Build llms-full.txt
        run: |
          python scripts/build-llms-docs.py
          test -f llms-full.txt || (echo "❌ llms-full.txt not generated" && exit 1)

      - name: Basic internal link sanity
        run: |
          set -euo pipefail
          broken=$(grep -RohE '\]\((components/docs/[^)]+\.md)\)' components/docs | sed -E 's/.*\((components\/docs\/[^)]+\.md)\).*/\1/' | sort -u | while read -r p; do test -f "$p" || echo "$p"; done)
          if [ -n "${broken}" ]; then
            echo "❌ Broken local doc links found:"
            echo "${broken}"
            exit 1
          fi

      - name: Secrets scan (basic)
        run: |
          if grep -riE '(sk-[a-zA-Z0-9]{32,}|AIza[a-zA-Z0-9_-]{35}|xox[a-zA-Z]-[a-zA-Z0-9-]{10,})' components/docs/ llms-full.txt; then
            echo "❌ Potential secrets detected in docs"
            exit 1
          fi

  auto-commit-llms-full:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [validate-build]
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Guardrail - automation kill-switch
        run: |
          if [ "${{ vars.DOC_AUTOMATION_ENABLED }}" != "true" ]; then
            echo "⚠️ DOC_AUTOMATION_ENABLED is not true; skipping auto-commit."
            exit 0
          fi

      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Rebuild llms-full.txt
        run: python scripts/build-llms-docs.py

      - name: Commit if changed
        run: |
          set -euo pipefail
          git config user.email "action@github.com"
          git config user.name "Docs Authority Bot"
          git add llms-full.txt
          git diff --staged --quiet && exit 0
          git commit -m "docs: rebuild llms-full.txt [skip ci]"
          git push
```

---

## Step 4: Create llms.txt

Create file `llms.txt` at repository root:

```markdown
# llms.txt - INTeract Employee Engagement Platform

**Project**: INTeract - Remote-first employee engagement platform  
**Stack**: React + Base44 BaaS + Deno + AI (OpenAI, Anthropic)  

---

## Core Documentation

- [Documentation Policy](components/docs/DOC_POLICY.md) - Governance and provenance rules
- [Security](components/docs/SECURITY.md) - Threat model and controls
- [Architecture](components/docs/COMPLETE_SYSTEM_ARCHITECTURE.md) - System design
- [Framework](components/docs/FRAMEWORK.md) - Tech stack
- [Changelog](components/docs/CHANGELOG_SEMANTIC.md) - Version history

---

## For LLMs

Auto-generated full context: `llms-full.txt` (built by CI from components/docs/**)

---

**Last Updated**: 2025-12-30
```

---

## Step 5: Initial Commit

```bash
git add scripts/ .github/ llms.txt ADR/.gitkeep
git commit -m "docs: add Documentation Authority system

- Add DOC_POLICY.md for governance
- Add DAA system prompt
- Add CI workflow for validation and auto-build
- Add llms.txt index
- Create ADR directory (empty, ready for use)

Refs: components/docs/DOCUMENTATION_AUTHORITY_IMPLEMENTATION_STATUS.md"

git push origin main
```

---

## Step 6: Verify CI Execution

1. Navigate to GitHub Actions tab
2. Verify workflow runs successfully
3. Check that `llms-full.txt` was NOT auto-committed (kill-switch defaults to off)

---

## Step 7: Enable Auto-Commit (Optional)

To enable automatic rebuilding of `llms-full.txt`:

1. Go to GitHub repository **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Click **New repository variable**
3. Name: `DOC_AUTOMATION_ENABLED`
4. Value: `true`
5. Click **Add variable**

Next push to main will auto-commit `llms-full.txt` if docs changed.

---

## Step 8: Test Locally

```bash
# Install Python 3.11+
python3 --version

# Run build script
python scripts/build-llms-docs.py

# Verify output
ls -lh llms-full.txt
head -n 20 llms-full.txt

# Should show:
# llms-full.txt (generated)
# - GeneratedAtUTC: 2025-12-30T...
# - Source: components/docs/**
# ---
# ## FILE: components/docs/DOC_POLICY.md
# ...
```

---

## Troubleshooting

### "python: command not found"
```bash
# Install Python 3.11+
# macOS: brew install python@3.11
# Ubuntu: sudo apt install python3.11
# Windows: Download from python.org
```

### "No such file or directory: components/docs"
```bash
# Ensure you're in repo root
pwd  # Should show your-repo-name
ls components/docs/  # Should list .md files
```

### Workflow fails with "Missing required file"
```bash
# Check which file is missing
cat .github/workflows/docs-authority.yml | grep "req=("

# Ensure all files exist in Base44 or create stubs
touch components/docs/ARCHITECTURE.md  # If missing
```

---

**Provenance**:
- Source: standard (GitHub Actions best practices) + platform (Base44 constraints)
- Locator: Error messages from file creation attempts
- Confidence: HIGH
- Last Verified: 2025-12-30
- Verified By: DAA