# Scripts Directory

This directory contains automation scripts for repository management, branch merging, and maintenance tasks.

## Available Scripts

### Branch Management

#### `safe-merge-branch.sh`
Safely merges a feature branch into the main branch with comprehensive checks.

**Usage:**
```bash
./scripts/safe-merge-branch.sh <branch-name>
```

**Features:**
- Pre-merge validation and checks
- Automatic backup creation
- Conflict detection
- Test execution
- Linting verification
- Interactive merge process

**Example:**
```bash
./scripts/safe-merge-branch.sh feature-new-dashboard
```

---

#### `multi-branch-merge.sh`
Coordinates sequential merging of multiple branches with dependency analysis.

**Usage:**
```bash
# Merge multiple branches
./scripts/multi-branch-merge.sh <branch1> <branch2> <branch3>

# Merge from file
./scripts/multi-branch-merge.sh --file branches.txt
```

**Features:**
- Branch validation
- File overlap detection
- Dependency analysis
- Sequential merge execution
- Comprehensive error handling
- Detailed progress reporting

**Example:**
```bash
./scripts/multi-branch-merge.sh feature-auth feature-ui feature-api
```

---

#### `cleanup-merged-branches.sh`
Cleans up local and remote branches that have been merged into main.

**Usage:**
```bash
./scripts/cleanup-merged-branches.sh
```

**Features:**
- Identifies merged branches
- Interactive cleanup process
- Local and remote branch removal
- Safe confirmation prompts
- Detailed summary report

**Example:**
```bash
./scripts/cleanup-merged-branches.sh
```

---

### Verification & Quality

#### `post-merge-verify.sh`
Comprehensive post-merge verification with automated checks.

**Usage:**
```bash
./scripts/post-merge-verify.sh
```

**Checks Performed:**
1. **Build Check** - Ensures project builds successfully
2. **Test Suite** - Runs all tests
3. **Lint Check** - Verifies code quality
4. **Security Audit** - Checks for vulnerabilities
5. **Bundle Size** - Analyzes build output
6. **Git Status** - Verifies repository state
7. **Recent Commits** - Reviews commit history

**Example:**
```bash
# Run after merging branches
./scripts/post-merge-verify.sh
```

---

### Build & Documentation

#### `build-llms-docs.py`
Python script for building LLM documentation.

**Usage:**
```bash
python scripts/build-llms-docs.py
```

**Note:** Requires Python 3.x

---

## Script Permissions

All scripts should be executable. If you encounter permission issues, run:

```bash
chmod +x scripts/*.sh
```

## Best Practices

### Before Using Scripts
1. Ensure you're in the repository root directory
2. Have a clean working tree (commit or stash changes)
3. Update your local repository: `git fetch origin`
4. Review the script's help: `./scripts/<script-name>.sh --help`

### After Using Scripts
1. Run post-merge verification
2. Monitor application behavior
3. Check CI/CD pipeline status
4. Review logs for any issues

### Troubleshooting

#### Script Won't Execute
```bash
chmod +x scripts/<script-name>.sh
```

#### Permission Denied
```bash
# Run with explicit bash
bash scripts/<script-name>.sh [arguments]
```

#### Script Not Found
```bash
# Ensure you're in repository root
pwd  # Should show .../interact

# Or use full path
./scripts/<script-name>.sh
```

## Documentation

For comprehensive guidance on branch merging strategies and workflows, refer to:

- **[Branch Merging Plan](../docs/BRANCH_MERGING_PLAN.md)** - Strategic framework for safe merging
- **[Safe Branch Merging Guide](../docs/SAFE_BRANCH_MERGING.md)** - Detailed merge instructions
- **[Pre-Merge Checklist](../docs/PRE_MERGE_CHECKLIST.md)** - Quality checklist
- **[Contributing Guidelines](../CONTRIBUTING.md)** - Code standards and workflow
- **[CI/CD Documentation](../CI-CD.md)** - Pipeline details

## Support

For issues or questions about these scripts:

1. Review the documentation linked above
2. Check script help: `./scripts/<script-name>.sh --help`
3. Review error logs in `/tmp/` directory
4. Consult the [Branch Merging Plan](../docs/BRANCH_MERGING_PLAN.md)

---

**Last Updated:** January 16, 2026  
**Maintainer:** Engineering Team @ Krosebrook
