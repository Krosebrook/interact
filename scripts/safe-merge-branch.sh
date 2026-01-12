#!/bin/bash

# Safe Branch Merge Script
# This script safely merges a feature branch into the main branch with proper checks
# Usage: ./scripts/safe-merge-branch.sh <branch-name>

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if branch name is provided
if [ -z "$1" ]; then
    print_error "Branch name is required"
    echo "Usage: $0 <branch-name>"
    exit 1
fi

BRANCH_NAME="$1"
MAIN_BRANCH="main"
BACKUP_BRANCH="backup-before-merge-$(date +%Y%m%d-%H%M%S)"

print_status "Starting safe merge process for branch: $BRANCH_NAME"
echo ""

# Step 1: Check if we're in a git repository
print_status "Checking git repository..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi
print_success "Git repository confirmed"

# Step 2: Check if branch exists
print_status "Checking if branch exists..."
if ! git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
    if git rev-parse --verify "origin/$BRANCH_NAME" > /dev/null 2>&1; then
        print_warning "Branch exists on remote but not locally. Checking out..."
        git checkout -b "$BRANCH_NAME" "origin/$BRANCH_NAME"
    else
        print_error "Branch '$BRANCH_NAME' does not exist locally or on remote"
        exit 1
    fi
fi
print_success "Branch exists"

# Step 3: Check for uncommitted changes
print_status "Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi
print_success "No uncommitted changes"

# Step 4: Fetch latest changes
print_status "Fetching latest changes from remote..."
git fetch origin
print_success "Fetched latest changes"

# Step 5: Switch to main branch
print_status "Switching to main branch..."
git checkout "$MAIN_BRANCH"
print_success "On main branch"

# Step 6: Create backup branch
print_status "Creating backup branch: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
print_success "Backup created at: $BACKUP_BRANCH"

# Step 7: Update main branch
print_status "Updating main branch..."
git pull origin "$MAIN_BRANCH"
print_success "Main branch updated"

# Step 8: Check if branch is already merged
print_status "Checking if branch is already merged..."
if git branch --merged "$MAIN_BRANCH" | grep -q "$BRANCH_NAME"; then
    print_warning "Branch '$BRANCH_NAME' is already merged into main"
    echo ""
    read -p "Do you want to delete the branch? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deleting local branch..."
        git branch -d "$BRANCH_NAME"
        print_status "Deleting remote branch..."
        git push origin --delete "$BRANCH_NAME" || print_warning "Remote branch may not exist"
        print_success "Branch deleted"
    fi
    exit 0
fi

# Step 9: Test merge (dry run)
print_status "Testing merge (dry run)..."
if git merge --no-commit --no-ff "$BRANCH_NAME" > /dev/null 2>&1; then
    print_success "Merge test successful - no conflicts detected"
    git merge --abort
else
    print_error "Merge conflicts detected!"
    git merge --abort
    echo ""
    print_warning "Conflicts need to be resolved before merging."
    print_warning "To resolve conflicts manually:"
    echo "  1. git merge $BRANCH_NAME"
    echo "  2. Resolve conflicts in your editor"
    echo "  3. git add <resolved-files>"
    echo "  4. git commit"
    exit 1
fi

# Step 10: Run tests if available
print_status "Checking for tests..."
if [ -f "package.json" ]; then
    if command_exists npm; then
        # Check if a test script exists and is not a placeholder
        if grep -q '"test"' package.json; then
            TEST_SCRIPT=$(grep '"test"' package.json | head -1)
            if echo "$TEST_SCRIPT" | grep -qE '(jest|mocha|vitest|ava|tape|tap)'; then
                print_status "Running tests..."
                if npm test; then
                    print_success "All tests passed"
                else
                    print_error "Tests failed. Merge aborted."
                    git checkout "$MAIN_BRANCH"
                    exit 1
                fi
            else
                print_warning "Test script found but appears to be a placeholder or non-standard test runner"
            fi
        else
            print_warning "No test script configured in package.json"
        fi
    fi
fi

# Step 11: Run linter if available
print_status "Checking for linter..."
if [ -f "package.json" ] && command_exists npm; then
    if grep -q '"lint"' package.json; then
        print_status "Running linter..."
        if npm run lint; then
            print_success "Linting passed"
        else
            print_warning "Linting issues found, but continuing..."
        fi
    fi
fi

# Step 12: Perform the actual merge
echo ""
print_status "Ready to merge '$BRANCH_NAME' into '$MAIN_BRANCH'"
read -p "Do you want to continue with the merge? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Merge cancelled by user"
    print_status "You can delete the backup branch with: git branch -d $BACKUP_BRANCH"
    exit 0
fi

print_status "Performing merge..."
if git merge --no-ff "$BRANCH_NAME" -m "Merge branch '$BRANCH_NAME' into $MAIN_BRANCH"; then
    print_success "Merge completed successfully!"
else
    print_error "Merge failed. Restoring from backup..."
    git merge --abort
    git reset --hard "$BACKUP_BRANCH"
    print_success "Restored from backup"
    print_error "Merge was unsuccessful"
    exit 1
fi

# Step 13: Push changes
echo ""
read -p "Do you want to push changes to remote? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Pushing to remote..."
    if git push origin "$MAIN_BRANCH"; then
        print_success "Pushed to remote successfully"
    else
        print_error "Push failed. You may need to push manually."
        exit 1
    fi
fi

# Step 14: Cleanup
echo ""
print_status "Merge process completed!"
print_success "Backup branch created at: $BACKUP_BRANCH"
echo ""
print_warning "Remember to:"
echo "  1. Delete the feature branch if no longer needed:"
echo "     git branch -d $BRANCH_NAME"
echo "     git push origin --delete $BRANCH_NAME"
echo "  2. Delete the backup branch when you're confident:"
echo "     git branch -d $BACKUP_BRANCH"
echo ""
print_success "All done! ✨"
