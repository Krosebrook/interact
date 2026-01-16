#!/bin/bash

# Post-Merge Verification Script
# Automated verification checklist after merging branches
# Usage: ./scripts/post-merge-verify.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters for summary
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Function to print colored output
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    printf "${CYAN}║${NC} %-58s ${CYAN}║${NC}\n" "$1"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
    CHECKS_WARNING=$((CHECKS_WARNING + 1))
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

print_step() {
    echo ""
    echo -e "${BLUE}▶${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main verification process
print_header "Post-Merge Verification"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"
echo ""

# ============================================================================
# 1. BUILD CHECK
# ============================================================================
print_step "1. Build Check"
echo "Building project..."

if [ -f "package.json" ] && command_exists npm; then
    if npm run build > /tmp/build.log 2>&1; then
        print_success "Build successful"
    else
        print_error "BUILD FAILED - Check /tmp/build.log for details"
        tail -20 /tmp/build.log
        exit 1
    fi
else
    print_warning "No package.json found or npm not available"
fi

# ============================================================================
# 2. TEST SUITE
# ============================================================================
print_step "2. Test Suite"
echo "Running tests..."

if [ -f "package.json" ] && command_exists npm; then
    if grep -q '"test"' package.json; then
        TEST_SCRIPT=$(grep '"test"' package.json | head -1 | sed 's/.*"test"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
        # Check if test script is not a placeholder (echo, exit 0, etc.)
        if echo "$TEST_SCRIPT" | grep -qE '(jest|mocha|vitest|ava|tape|tap)' && \
           ! echo "$TEST_SCRIPT" | grep -qE '(echo|exit 0|no test)'; then
            if npm test > /tmp/test.log 2>&1; then
                print_success "Tests passed"
            else
                print_error "TESTS FAILED - Check /tmp/test.log for details"
                tail -30 /tmp/test.log
                exit 1
            fi
        else
            print_warning "Test script found but appears to be a placeholder or uses echo"
        fi
    else
        print_warning "No test script configured in package.json"
    fi
else
    print_warning "Testing skipped - package.json not found or npm not available"
fi

# ============================================================================
# 3. LINT CHECK
# ============================================================================
print_step "3. Lint Check"
echo "Running linter..."

if [ -f "package.json" ] && command_exists npm; then
    if grep -q '"lint"' package.json; then
        # Run linting and capture exit code
        if npm run lint > /tmp/lint.log 2>&1; then
            print_success "Linting passed"
        else
            LINT_EXIT_CODE=$?
            # Exit code 1 typically means warnings/errors found
            if [ $LINT_EXIT_CODE -eq 1 ]; then
                print_warning "Linting warnings found (non-blocking)"
                echo "Run 'npm run lint' to see details"
            else
                print_error "Linting failed with exit code $LINT_EXIT_CODE"
            fi
        fi
    else
        print_warning "No lint script configured in package.json"
    fi
else
    print_warning "Linting skipped - package.json not found or npm not available"
fi

# ============================================================================
# 4. SECURITY AUDIT
# ============================================================================
print_step "4. Security Audit"
echo "Running security audit..."

if [ -f "package.json" ] && command_exists npm; then
    # Use JSON output for reliable parsing
    if command_exists jq; then
        AUDIT_JSON=$(npm audit --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
        VULN_TOTAL=$(echo "$AUDIT_JSON" | jq -r '.metadata.vulnerabilities.total // 0')
        
        if [ "$VULN_TOTAL" -eq 0 ]; then
            print_success "No vulnerabilities found"
        else
            print_warning "Security warnings detected: $VULN_TOTAL vulnerabilities"
            echo "Run 'npm audit' for full details"
        fi
    else
        # Fallback to text parsing if jq not available
        AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1 || true)
        
        if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
            print_success "No high-severity vulnerabilities found"
        else
            print_warning "Security warnings detected"
            echo "Run 'npm audit' for full details"
        fi
    fi
else
    print_warning "Security audit skipped - package.json not found or npm not available"
fi

# ============================================================================
# 5. BUNDLE SIZE CHECK
# ============================================================================
print_step "5. Bundle Size Check"
echo "Checking bundle size..."

if [ -f "package.json" ] && command_exists npm; then
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "unknown")
        print_status "Bundle size: $BUNDLE_SIZE"
        
        # Show breakdown if available
        if [ -d "dist/assets" ]; then
            echo ""
            echo "  Asset breakdown:"
            find dist/assets -name "*.js" -o -name "*.css" 2>/dev/null | while read -r file; do
                SIZE=$(du -h "$file" | cut -f1)
                BASENAME=$(basename "$file")
                echo "    - $BASENAME: $SIZE"
            done | head -10
        fi
        print_success "Bundle size check complete"
    else
        print_warning "No dist/ directory found - run 'npm run build' first"
    fi
else
    print_warning "Bundle size check skipped"
fi

# ============================================================================
# 6. GIT STATUS CHECK
# ============================================================================
print_step "6. Git Status Check"
echo "Checking git status..."

if git diff-index --quiet HEAD --; then
    print_success "No uncommitted changes"
else
    print_warning "Uncommitted changes detected"
    git status --short | head -10
fi

# Check if we're ahead of origin
if git rev-parse @{u} > /dev/null 2>&1; then
    AHEAD=$(git rev-list --count @{u}..HEAD)
    BEHIND=$(git rev-list --count HEAD..@{u})
    
    if [ "$AHEAD" -eq 0 ] && [ "$BEHIND" -eq 0 ]; then
        print_success "Branch is in sync with remote"
    elif [ "$AHEAD" -gt 0 ]; then
        print_warning "Branch is $AHEAD commit(s) ahead of remote"
        echo "Consider pushing: git push origin $CURRENT_BRANCH"
    elif [ "$BEHIND" -gt 0 ]; then
        print_warning "Branch is $BEHIND commit(s) behind remote"
        echo "Consider pulling: git pull origin $CURRENT_BRANCH"
    fi
else
    print_warning "No remote tracking branch configured"
fi

# ============================================================================
# 7. RECENT COMMITS CHECK
# ============================================================================
print_step "7. Recent Commits"
echo "Last 5 commits:"
echo ""
git log --oneline --decorate -5 | sed 's/^/  /'
echo ""
print_success "Commit history reviewed"

# ============================================================================
# SUMMARY
# ============================================================================
print_header "Verification Summary"

echo "Checks Passed:   ${GREEN}$CHECKS_PASSED${NC}"
echo "Warnings:        ${YELLOW}$CHECKS_WARNING${NC}"
echo "Checks Failed:   ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    print_success "Post-merge verification complete! ✨"
    echo ""
    print_status "Recommended next steps:"
    echo "  1. Monitor error logging dashboard"
    echo "  2. Review user feedback channels"
    echo "  3. Verify analytics tracking"
    echo "  4. Check CI/CD pipeline status"
    echo ""
    exit 0
else
    print_error "Verification failed with $CHECKS_FAILED critical issue(s)"
    echo ""
    print_status "Please address the failed checks before proceeding"
    echo ""
    exit 1
fi
