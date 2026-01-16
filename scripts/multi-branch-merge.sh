#!/bin/bash

# Multi-Branch Merge Script
# Coordinates safe merging of multiple branches sequentially
# Usage: ./scripts/multi-branch-merge.sh <branch1> <branch2> <branch3> ...
#        ./scripts/multi-branch-merge.sh --file branches.txt

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAFE_MERGE_SCRIPT="$SCRIPT_DIR/safe-merge-branch.sh"

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
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo ""
    echo -e "${MAGENTA}▶▶▶${NC} $1"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Usage information
show_usage() {
    cat << EOF
Multi-Branch Merge Script

Usage:
  $0 <branch1> <branch2> <branch3> ...
  $0 --file <branches-file>

Options:
  --file FILE    Read branch names from file (one per line)
  --help         Show this help message

Examples:
  $0 feature-auth feature-ui feature-api
  $0 --file branches-to-merge.txt

Description:
  This script safely merges multiple branches sequentially into main.
  It performs dependency analysis, checks for conflicts, and ensures
  each branch is properly tested before merging.

EOF
    exit 0
}

# Parse arguments
BRANCHES=()
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_usage
fi

if [ "$1" = "--file" ]; then
    if [ -z "$2" ]; then
        print_error "File path required when using --file option"
        show_usage
    fi
    
    if [ ! -f "$2" ]; then
        print_error "File not found: $2"
        exit 1
    fi
    
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -n "$line" ]] && [[ ! "$line" =~ ^[[:space:]]*# ]]; then
            BRANCHES+=("$line")
        fi
    done < "$2"
else
    BRANCHES=("$@")
fi

# Check if any branches provided
if [ ${#BRANCHES[@]} -eq 0 ]; then
    print_error "No branches specified"
    show_usage
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if safe-merge script exists
if [ ! -f "$SAFE_MERGE_SCRIPT" ]; then
    print_error "Safe merge script not found at: $SAFE_MERGE_SCRIPT"
    print_status "Please ensure safe-merge-branch.sh exists in the scripts directory"
    exit 1
fi

# Main process
print_header "Multi-Branch Merge Process"

print_status "Branches to merge: ${#BRANCHES[@]}"
for i in "${!BRANCHES[@]}"; do
    echo "  $((i+1)). ${BRANCHES[$i]}"
done
echo ""

# Step 1: Validate all branches exist
print_step "Step 1: Validating branches"
INVALID_BRANCHES=()

for branch in "${BRANCHES[@]}"; do
    if git rev-parse --verify "$branch" > /dev/null 2>&1; then
        print_success "Branch exists: $branch"
    elif git rev-parse --verify "origin/$branch" > /dev/null 2>&1; then
        print_success "Branch exists on remote: $branch"
    else
        print_error "Branch does not exist: $branch"
        INVALID_BRANCHES+=("$branch")
    fi
done

if [ ${#INVALID_BRANCHES[@]} -gt 0 ]; then
    print_error "Cannot proceed with invalid branches"
    exit 1
fi

# Step 2: Fetch latest changes
print_step "Step 2: Fetching latest changes"
git fetch --all --prune
print_success "Fetched latest changes from remote"

# Step 3: Analyze dependencies (file overlaps)
print_step "Step 3: Analyzing branch dependencies"
echo "Checking for file overlaps between branches..."
echo ""

TEMP_DIR="/tmp/multi-branch-merge-$$"
mkdir -p "$TEMP_DIR"

# Get changed files for each branch
for branch in "${BRANCHES[@]}"; do
    git diff --name-only "$MAIN_BRANCH...$branch" 2>/dev/null | sort > "$TEMP_DIR/$branch.txt" || true
    FILE_COUNT=$(wc -l < "$TEMP_DIR/$branch.txt")
    print_status "Branch '$branch': $FILE_COUNT file(s) changed"
done

echo ""
print_status "Checking for file conflicts..."

# Check for overlaps
CONFLICTS_FOUND=false
for i in "${!BRANCHES[@]}"; do
    for j in "${!BRANCHES[@]}"; do
        if [ $i -lt $j ]; then
            branch1="${BRANCHES[$i]}"
            branch2="${BRANCHES[$j]}"
            
            OVERLAP=$(comm -12 "$TEMP_DIR/$branch1.txt" "$TEMP_DIR/$branch2.txt" | wc -l)
            
            if [ "$OVERLAP" -gt 0 ]; then
                print_warning "File overlap detected between '$branch1' and '$branch2': $OVERLAP file(s)"
                comm -12 "$TEMP_DIR/$branch1.txt" "$TEMP_DIR/$branch2.txt" | head -5 | sed 's/^/    - /'
                if [ "$OVERLAP" -gt 5 ]; then
                    echo "    ... and $((OVERLAP - 5)) more"
                fi
                CONFLICTS_FOUND=true
            fi
        fi
    done
done

if [ "$CONFLICTS_FOUND" = false ]; then
    print_success "No file overlaps detected - branches are independent"
fi

echo ""

# Step 4: Determine merge order
print_step "Step 4: Merge Sequence"

if [ "$CONFLICTS_FOUND" = true ]; then
    print_warning "File overlaps detected. Branches will be merged in the order provided."
    print_warning "This allows the largest/oldest branch to merge first."
    echo ""
    print_status "If conflicts occur, the merge will pause for manual resolution."
else
    print_success "No conflicts expected - safe to merge in any order"
fi

echo ""
print_status "Merge order:"
for i in "${!BRANCHES[@]}"; do
    echo "  $((i+1)). ${BRANCHES[$i]}"
done

echo ""
read -p "Do you want to proceed with the merge? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Multi-branch merge cancelled by user"
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Step 5: Sequential merge
print_step "Step 5: Sequential Merge Execution"

MERGED_COUNT=0
FAILED_BRANCHES=()

for branch in "${BRANCHES[@]}"; do
    BRANCH_NUM=$((MERGED_COUNT + 1))
    
    echo ""
    print_header "Merging Branch $BRANCH_NUM/${#BRANCHES[@]}: $branch"
    
    # Update branch with latest main
    print_status "Syncing '$branch' with latest main..."
    git checkout "$branch" 2>/dev/null || git checkout -b "$branch" "origin/$branch"
    
    if git merge "$MAIN_BRANCH" --no-edit; then
        print_success "Branch synced with main"
    else
        print_error "Failed to sync '$branch' with main - conflicts detected"
        print_status "Please resolve conflicts manually and re-run this script"
        FAILED_BRANCHES+=("$branch")
        break
    fi
    
    # Run tests after sync
    if [ -f "package.json" ] && command_exists npm && grep -q '"test"' package.json; then
        print_status "Running tests on '$branch'..."
        if npm test > /tmp/test-$branch.log 2>&1; then
            print_success "Tests passed on '$branch'"
        else
            print_error "Tests failed on '$branch'"
            tail -20 /tmp/test-$branch.log
            FAILED_BRANCHES+=("$branch")
            break
        fi
    else
        print_warning "No tests found - skipping test validation"
    fi
    
    # Merge to main using safe merge script
    git checkout "$MAIN_BRANCH"
    print_status "Merging '$branch' into main..."
    
    # Call safe merge script directly (it will handle prompts)
    # Note: This assumes safe-merge-branch.sh will handle the merge
    # For fully automated mode, you may need to modify safe-merge-branch.sh
    # or use git merge directly with appropriate flags
    if "$SAFE_MERGE_SCRIPT" "$branch"; then
        print_success "Branch '$branch' merged successfully!"
        MERGED_COUNT=$((MERGED_COUNT + 1))
    else
        print_error "Failed to merge '$branch'"
        FAILED_BRANCHES+=("$branch")
        break
    fi
    
    echo ""
    print_success "=== Branch $BRANCH_NUM/${#BRANCHES[@]} completed ==="
    echo ""
done

# Cleanup
rm -rf "$TEMP_DIR"

# Step 6: Summary
print_header "Multi-Branch Merge Summary"

echo "Total branches: ${#BRANCHES[@]}"
echo "Successfully merged: $MERGED_COUNT"
echo "Failed: ${#FAILED_BRANCHES[@]}"
echo ""

if [ ${#FAILED_BRANCHES[@]} -eq 0 ]; then
    print_success "All branches merged successfully! 🎉"
    echo ""
    print_status "Next steps:"
    echo "  1. Run post-merge verification: ./scripts/post-merge-verify.sh"
    echo "  2. Monitor application for any issues"
    echo "  3. Clean up merged branches: ./scripts/cleanup-merged-branches.sh"
    echo ""
    exit 0
else
    print_error "Merge process stopped due to failures"
    echo ""
    print_status "Failed branches:"
    for branch in "${FAILED_BRANCHES[@]}"; do
        echo "  - $branch"
    done
    echo ""
    # Only show remaining branches if there are any
    if [ $MERGED_COUNT -lt ${#BRANCHES[@]} ]; then
        print_status "Remaining branches were not merged:"
        REMAINING_START=$((MERGED_COUNT))
        for i in $(seq $REMAINING_START $((${#BRANCHES[@]} - 1))); do
            echo "  - ${BRANCHES[$i]}"
        done
        echo ""
    fi
    print_status "Please resolve the issues and re-run the script with remaining branches"
    exit 1
fi
