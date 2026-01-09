# Build Scripts Documentation

**Status**: LIMITED - Scripts cannot be created in Base44 platform  
**Platform**: Base44 BaaS (restricted file system)  

---

## Limitation Notice

The Base44 platform only allows file creation in the following directories:
- `entities/`
- `pages/`
- `components/`
- `functions/`
- `agents/`
- `layout.js`
- `globals.css`

**External repositories** (GitHub, GitLab, etc.) can include:
- `scripts/` directory for build automation
- `.github/workflows/` for CI/CD
- Root-level files like `llms.txt`

---

## Recommended External Repository Setup

If this project is synced to GitHub or similar, add these files:

### 1. scripts/build-llms-docs.py
```python
#!/usr/bin/env python3
# See components/docs/DOC_POLICY.md for reference implementation
# Deterministically builds llms-full.txt from docs/**
```

**Purpose**: Aggregate all markdown docs into single LLM context file

### 2. .github/workflows/docs-authority.yml
```yaml
# See components/docs/DOC_POLICY.md for full workflow
# Validates required docs, builds llms-full.txt, checks links
```

**Purpose**: CI enforcement of documentation governance

### 3. llms.txt (repo root)
```
# Index of key documentation for LLMs
# See components/docs/DOC_POLICY.md for content
```

**Purpose**: Human-curated entry point for AI assistants

---

## Current Workaround

Since scripts cannot be created within Base44:

1. **Documentation is maintained in** `components/docs/`
2. **Build automation must be** implemented in external Git repository
3. **CI/CD workflows must be** configured in GitHub/GitLab after syncing

---

## Integration Instructions

### If Using GitHub Sync:

1. After syncing Base44 app to GitHub:
```bash
# In your GitHub repo
mkdir -p scripts
mkdir -p .github/workflows

# Copy script content from components/docs/DOC_POLICY.md
cat > scripts/build-llms-docs.py << 'EOF'
[paste script from DOC_POLICY.md]
EOF

chmod +x scripts/build-llms-docs.py

# Copy workflow content from components/docs/DOC_POLICY.md
cat > .github/workflows/docs-authority.yml << 'EOF'
[paste workflow from DOC_POLICY.md]
EOF

# Copy index content
cat > llms.txt << 'EOF'
[paste from DOC_POLICY.md llms.txt section]
EOF
```

2. Commit and push:
```bash
git add scripts/ .github/ llms.txt
git commit -m "docs: add Documentation Authority system"
git push origin main
```

3. Enable GitHub Actions in repository settings

4. Set environment variable (optional):
```
DOC_AUTOMATION_ENABLED=true  # Enable auto-commit of llms-full.txt
```

---

## Manual Build Process (Base44 Only)

Since automated builds require external repository:

1. Manually copy all docs from `components/docs/*.md`
2. Combine in preferred order (see `DOC_POLICY.md`)
3. Add header with timestamp
4. Save as `components/docs/llms-full.txt` (manual maintenance)

**Limitation**: This is error-prone and not recommended for production.

---

**Provenance**:
- Source: platform constraints + standard (CI/CD best practices)
- Locator: Base44 platform file restrictions (observed during file creation attempts)
- Confidence: HIGH
- Last Verified: 2025-12-30
- Verified By: DAA (file creation errors confirm restrictions)