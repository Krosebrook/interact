# GitHub Integration Files - Complete Reference

**Status:** Manual Setup Required  
**Last Updated:** 2026-01-08  
**Purpose:** Documentation Authority CI/CD Implementation

## Overview

These files enable automated documentation building and validation through GitHub Actions. They must be manually created in your external GitHub repository as they cannot be directly managed within the Base44 platform.

---

## File 1: `scripts/build-llms-docs.py`

**Location:** `scripts/build-llms-docs.py` (repository root)

**Purpose:** Aggregates all markdown documentation from `components/docs/` into a single `llms-full.txt` file for comprehensive LLM context.

**Full Content:**

```python
#!/usr/bin/env python3
"""
Documentation Authority Build Script
Aggregates all project documentation into llms-full.txt for LLM context.
"""

import os
import re
from datetime import datetime
from pathlib import Path

# Configuration
DOCS_DIR = 'components/docs'
OUTPUT_FILE = 'llms-full.txt'
SECTION_SEPARATOR = "\n\n" + "="*80 + "\n\n"

def sanitize_content(content):
    """
    Removes code blocks and other elements that might confuse LLMs.
    Preserves markdown structure and key information.
    """
    # Remove fenced code blocks (```...```)
    content = re.sub(r'```[\s\S]*?```', '[CODE BLOCK REMOVED]', content)
    
    # Remove inline code but keep the text visible
    content = re.sub(r'`([^`]+)`', r'\1', content)
    
    # Remove HTML comments
    content = re.sub(r'<!--[\s\S]*?-->', '', content)
    
    # Remove HTML tags but keep content
    content = re.sub(r'<([^>]+)>', '', content)
    
    # Normalize whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    return content.strip()

def extract_title(content):
    """Extract the first H1 heading as document title."""
    match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    return match.group(1) if match else "Untitled Document"

def build_llms_full_txt():
    """
    Collects all markdown documentation and compiles it into a single text file
    for LLM context with proper structure and metadata.
    """
    print(f"📚 Building LLM documentation from: {DOCS_DIR}")
    
    if not os.path.exists(DOCS_DIR):
        print(f"❌ Error: Documentation directory '{DOCS_DIR}' not found")
        return False
    
    full_docs_content = []
    processed_files = []
    
    # Header for the aggregated document
    full_docs_content.append("="*80)
    full_docs_content.append("\nINTERACT EMPLOYEE ENGAGEMENT PLATFORM - COMPLETE DOCUMENTATION")
    full_docs_content.append("\n" + "="*80 + "\n")
    full_docs_content.append(f"\nGenerated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    full_docs_content.append(f"\nSource Directory: {DOCS_DIR}")
    full_docs_content.append(f"\nPurpose: Comprehensive documentation context for AI/LLM operations")
    full_docs_content.append("\n\nThis document contains all available project documentation to provide")
    full_docs_content.append("\ncomplete context for AI assistants, code generation, and knowledge retrieval.")
    full_docs_content.append(SECTION_SEPARATOR)

    # Walk through docs directory
    for root, _, files in sorted(os.walk(DOCS_DIR)):
        markdown_files = sorted([f for f in files if f.endswith('.md')])
        
        for file in markdown_files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, DOCS_DIR)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if not content.strip():
                    print(f"⚠️  Skipping empty file: {relative_path}")
                    continue
                
                title = extract_title(content)
                sanitized_text = sanitize_content(content)
                
                if sanitized_text:
                    full_docs_content.append(f"DOCUMENT: {relative_path}")
                    full_docs_content.append(f"\nTitle: {title}")
                    full_docs_content.append(f"\nFile Size: {len(content)} characters")
                    full_docs_content.append("\n" + "-"*80 + "\n")
                    full_docs_content.append(sanitized_text)
                    full_docs_content.append(SECTION_SEPARATOR)
                    
                    processed_files.append(relative_path)
                    print(f"✓ Processed: {relative_path} ({len(content)} chars)")
                    
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")

    # Footer with statistics
    full_docs_content.append("="*80)
    full_docs_content.append(f"\n\nEND OF DOCUMENTATION")
    full_docs_content.append(f"\n\nTotal Documents Processed: {len(processed_files)}")
    full_docs_content.append(f"\nTotal Output Size: {sum(len(s) for s in full_docs_content)} characters")
    full_docs_content.append("\n\n" + "="*80)

    # Write the aggregated content
    try:
        output_path = Path(OUTPUT_FILE)
        with open(output_path, 'w', encoding='utf-8') as outfile:
            outfile.write("".join(full_docs_content))
        
        file_size = output_path.stat().st_size
        print(f"\n✅ Successfully built {OUTPUT_FILE}")
        print(f"📊 Output size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
        print(f"📄 Documents included: {len(processed_files)}")
        return True
        
    except Exception as e:
        print(f"❌ Error writing to {OUTPUT_FILE}: {e}")
        return False

if __name__ == "__main__":
    success = build_llms_full_txt()
    exit(0 if success else 1)
```

**Setup Instructions:**

1. Create the `scripts` directory in your repository root
2. Create `scripts/build-llms-docs.py` with the above content
3. Make it executable: `chmod +x scripts/build-llms-docs.py`
4. Test locally: `python scripts/build-llms-docs.py`

---

## File 2: `.github/workflows/docs-authority.yml`

**Location:** `.github/workflows/docs-authority.yml`

**Purpose:** GitHub Actions workflow for automated documentation building, validation, and CI/CD integration.

**Full Content:**

```yaml
name: Documentation Authority CI

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop
  workflow_dispatch: # Manual trigger
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday at midnight UTC

jobs:
  build_and_validate_docs:
    name: Build & Validate Documentation
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0 # Full history for accurate change detection

    - name: 🐍 Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
        cache: 'pip'

    - name: 📦 Install dependencies
      run: |
        python -m pip install --upgrade pip
        # Add any Python dependencies here if needed
        # pip install -r requirements.txt

    - name: 🔨 Run documentation build script
      run: |
        python scripts/build-llms-docs.py
      continue-on-error: false

    - name: ✅ Validate llms-full.txt generation
      run: |
        if [ ! -f llms-full.txt ]; then
          echo "❌ Error: llms-full.txt was not generated"
          exit 1
        fi
        
        FILE_SIZE=$(wc -c < llms-full.txt)
        LINE_COUNT=$(wc -l < llms-full.txt)
        
        echo "✓ llms-full.txt generated successfully"
        echo "📊 File size: $FILE_SIZE bytes"
        echo "📄 Line count: $LINE_COUNT lines"
        
        # Validate minimum content
        if [ $LINE_COUNT -lt 100 ]; then
          echo "⚠️  Warning: llms-full.txt has fewer than 100 lines"
          echo "This might indicate missing documentation or build errors"
          exit 1
        fi

    - name: 🔍 Check for required documentation files
      run: |
        REQUIRED_DOCS=(
          "components/docs/DOC_POLICY.md"
          "components/docs/SECURITY.md"
          "components/docs/FRAMEWORK.md"
          "components/docs/API_REFERENCE.md"
          "components/docs/ARCHITECTURE.md"
        )
        
        MISSING=0
        for doc in "${REQUIRED_DOCS[@]}"; do
          if [ ! -f "$doc" ]; then
            echo "❌ Missing required documentation: $doc"
            MISSING=$((MISSING + 1))
          else
            echo "✓ Found: $doc"
          fi
        done
        
        if [ $MISSING -gt 0 ]; then
          echo "⚠️  $MISSING required documentation file(s) missing"
          exit 1
        fi

    - name: 📊 Generate documentation statistics
      run: |
        echo "## Documentation Statistics" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "- **Total Markdown Files:** $(find components/docs -name '*.md' | wc -l)" >> $GITHUB_STEP_SUMMARY
        echo "- **llms-full.txt Size:** $(wc -c < llms-full.txt) bytes" >> $GITHUB_STEP_SUMMARY
        echo "- **Total Lines:** $(wc -l < llms-full.txt) lines" >> $GITHUB_STEP_SUMMARY
        echo "- **Build Date:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> $GITHUB_STEP_SUMMARY

    - name: 📤 Upload llms-full.txt as artifact
      uses: actions/upload-artifact@v4
      with:
        name: llms-full-documentation-${{ github.sha }}
        path: llms-full.txt
        retention-days: 30
        if-no-files-found: error

    - name: 🎯 Comment on PR (if applicable)
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const fileSize = fs.statSync('llms-full.txt').size;
          const lineCount = fs.readFileSync('llms-full.txt', 'utf8').split('\n').length;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## 📚 Documentation Build Results\n\n` +
                  `✅ Documentation successfully built and validated!\n\n` +
                  `- **Output Size:** ${(fileSize / 1024).toFixed(1)} KB\n` +
                  `- **Total Lines:** ${lineCount.toLocaleString()}\n` +
                  `- **Build Time:** ${new Date().toISOString()}\n\n` +
                  `The \`llms-full.txt\` artifact is available in the workflow run.`
          });

    - name: 🚀 Commit updated llms-full.txt (optional)
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        
        if [ -n "$(git status --porcelain llms-full.txt)" ]; then
          git add llms-full.txt
          git commit -m "docs: auto-update llms-full.txt [skip ci]"
          git push
        else
          echo "No changes to llms-full.txt"
        fi
```

**Setup Instructions:**

1. Create the `.github/workflows` directory structure
2. Create `.github/workflows/docs-authority.yml` with the above content
3. Commit and push to your repository
4. The workflow will run automatically on push/PR events

---

## File 3: `llms.txt`

**Location:** `llms.txt` (repository root)

**Purpose:** Human-curated index providing a high-level overview of documentation structure for LLM navigation.

**Full Content:**

```
================================================================================
INTERACT EMPLOYEE ENGAGEMENT PLATFORM - DOCUMENTATION INDEX
================================================================================

This index provides a curated overview of the project's documentation structure.
The complete, machine-readable documentation is available in llms-full.txt.

Last Updated: 2026-01-08
Platform: Base44 + React + TypeScript
Target: Remote-first employee engagement (50-200 employees)

================================================================================
GOVERNANCE & POLICIES
================================================================================

DOC_POLICY.md
  → Documentation governance, versioning, approval workflows
  → Single source of truth for documentation standards
  → Human review requirements and provenance tracking

SECURITY.md
  → Application security architecture and practices
  → Data privacy, RBAC implementation, compliance (GDPR, SOC 2)
  → Authentication, encryption, audit logging

ENTITY_ACCESS_RULES.md
  → Role-based access control (RBAC) for all database entities
  → Permission rules for admin, facilitator, participant roles
  → Security rules for sensitive data (HR, PII, salary info)

================================================================================
ARCHITECTURE & TECHNICAL SPECIFICATIONS
================================================================================

ARCHITECTURE.md
  → High-level system architecture overview
  → Frontend: React + Tailwind CSS + TypeScript
  → Backend: Base44 BaaS with Deno functions

FRAMEWORK.md
  → Core technologies, libraries, design patterns
  → Component architecture and state management
  → Code organization and best practices

API_REFERENCE.md
  → Complete API endpoint reference
  → Entity operations, authentication, integrations
  → Request/response formats and examples

DATABASE_SCHEMA_TECHNICAL_SPEC.md
  → Comprehensive entity relationship documentation
  → Field definitions, data types, constraints
  → Permissions and access patterns

COMPONENT_LIBRARY.md
  → Reusable UI component documentation
  → Props, usage examples, accessibility guidelines

================================================================================
FEATURES & FUNCTIONALITY
================================================================================

PRD_MASTER.md
  → Master Product Requirements Document
  → Feature specifications and user stories
  → Success metrics and acceptance criteria

FEATURE_SPECS.md
  → Detailed specifications for major features
  → Recognition system, gamification, learning paths
  → Pulse surveys, milestone celebrations, team challenges

ONBOARDING_SPEC.md
  → 30-day employee onboarding system
  → Role-based onboarding flows (admin, facilitator, participant)
  → AI-powered buddy matching and milestone tracking

GAMIFICATION_ADMIN_GUIDE.md
  → Administrator guide for gamification system
  → Points, badges, challenges, leaderboards
  → AI-driven rule optimization and content generation

================================================================================
AI & INTELLIGENT FEATURES
================================================================================

AI_FEATURES_DOCUMENTATION.md
  → Comprehensive overview of all AI capabilities
  → Event planning, skill gap analysis, buddy matching
  → Content generation, personalization engines

AI_CONTENT_GENERATOR_API.md
  → API for AI-powered learning content generation
  → Learning paths, quiz questions, video scripts
  → Integration patterns and usage examples

AGENTS_DOCUMENTATION_AUTHORITY.md
  → Documentation Authority AI agent architecture
  → Automated documentation building and validation
  → Provenance tracking and governance enforcement

================================================================================
DEVELOPMENT & OPERATIONS
================================================================================

CHANGELOG.md / CHANGELOG_SEMANTIC.md
  → Semantic versioning and release history
  → Breaking changes, new features, bug fixes
  → Migration guides for major updates

GITHUB_SETUP_INSTRUCTIONS.md
  → Manual setup for GitHub integration and CI/CD
  → Instructions for this file system and workflows
  → Required for implementing Documentation Authority

DEPLOYMENT_GUIDE.md
  → Production deployment procedures
  → Environment configuration, secrets management
  → Monitoring and troubleshooting

PRODUCTION_READINESS_CHECKLIST.md
  → Pre-launch validation checklist
  → Security, performance, accessibility audits
  → Integration testing and rollback procedures

================================================================================
AUDIT REPORTS & COMPLIANCE
================================================================================

MASTER_AUDIT_REPORT.md
  → Comprehensive audit findings across all systems
  → Security, accessibility, performance reviews
  → Recommended improvements and action items

WCAG_AUDIT.md
  → Web Content Accessibility Guidelines compliance
  → WCAG 2.1 AA standard adherence
  → Accessibility features and testing procedures

SECURITY.md (Security Audit Section)
  → Penetration testing results
  → Vulnerability assessments and mitigations
  → Third-party security reviews

================================================================================
USER GUIDES & TRAINING
================================================================================

QUICK_START_GUIDE.md
  → Getting started for new administrators
  → Initial setup, user invitations, basic configuration
  → First event creation and recognition posting

USER_FLOWS.md
  → Common user journey documentation
  → Step-by-step workflows for key features
  → Role-specific interaction patterns

INTEGRATION_GUIDE.md
  → Third-party integration setup (Slack, Teams, Calendar)
  → OAuth configuration and webhook handling
  → Troubleshooting common integration issues

================================================================================
USAGE NOTES
================================================================================

1. This index is maintained manually by the development team
2. The complete documentation is auto-generated in llms-full.txt
3. For the most current information, always refer to individual .md files
4. CI/CD validation ensures documentation completeness and accuracy
5. All documentation follows the governance rules in DOC_POLICY.md

================================================================================
END OF INDEX
================================================================================
```

**Setup Instructions:**

1. Create `llms.txt` in your repository root
2. Update the content as your documentation evolves
3. Keep it synchronized with major documentation changes
4. Reference in PR templates and onboarding guides

---

## Implementation Steps

### 1. Create Directory Structure
```bash
mkdir -p scripts
mkdir -p .github/workflows
```

### 2. Add Files
Copy the content above into:
- `scripts/build-llms-docs.py`
- `.github/workflows/docs-authority.yml`
- `llms.txt`

### 3. Test Locally
```bash
python scripts/build-llms-docs.py
# Verify llms-full.txt was created
ls -lh llms-full.txt
```

### 4. Commit and Push
```bash
git add scripts/ .github/ llms.txt
git commit -m "docs: add Documentation Authority build system"
git push origin main
```

### 5. Verify GitHub Actions
1. Go to your repository's Actions tab
2. Verify the "Documentation Authority CI" workflow ran successfully
3. Check the workflow artifacts for `llms-full.txt`

---

## Maintenance

- **Update llms.txt** when adding major new documentation files
- **Review build logs** in GitHub Actions for warnings or errors
- **Monitor artifact sizes** to ensure documentation is growing appropriately
- **Update Python script** if documentation structure changes

---

## Integration with Base44

Once set up in GitHub:
1. Base44 syncs with your repository automatically
2. The generated `llms-full.txt` becomes available for LLM context
3. CI validation ensures documentation quality on every commit
4. Developers can reference the complete documentation during development

**Note:** These files operate in your GitHub repository and cannot be directly managed within Base44. They enhance the development workflow by ensuring documentation is always up-to-date and comprehensive.