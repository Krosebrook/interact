#!/bin/bash

# Branch Cleanup Script
# This script helps clean up merged branches safely
# Usage: ./scripts/cleanup-merged-branches.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

MAIN_BRANCH="main"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        Branch Cleanup - Merged Branches Removal           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Update remote tracking branches
print_status "Fetching latest changes from remote..."
git fetch --all --prune
print_success "Updated remote tracking branches"
echo ""

# Switch to main if not already there
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    print_status "Switching to $MAIN_BRANCH branch..."
    git checkout "$MAIN_BRANCH"
fi

# Update main branch
print_status "Updating $MAIN_BRANCH branch..."
git pull origin "$MAIN_BRANCH"
print_success "$MAIN_BRANCH branch updated"
echo ""

# List merged branches (excluding main and current branch)
MERGED_BRANCHES=$(git branch --merged "$MAIN_BRANCH" | grep -v "^\*" | grep -v "$MAIN_BRANCH" | grep -v "^[[:space:]]*$" || true)

if [ -z "$MERGED_BRANCHES" ]; then
    print_success "No merged branches to clean up! 🎉"
    exit 0
fi

echo "╔════════════════════════════════════════════════════════════╗"
printf "║           Local Branches Merged into %-18s║\n" "$MAIN_BRANCH"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "$MERGED_BRANCHES"
echo ""

# Count branches
BRANCH_COUNT=0
if [ -n "$MERGED_BRANCHES" ]; then
    BRANCH_COUNT=$(echo "$MERGED_BRANCHES" | grep -v '^[[:space:]]*$' | wc -l)
fi
print_status "Found $BRANCH_COUNT merged branch(es)"
echo ""

# Ask for confirmation
read -p "Do you want to delete these local branches? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cleanup cancelled by user"
    exit 0
fi

# Delete local merged branches
print_status "Deleting local merged branches..."
DELETED_COUNT=0
while IFS= read -r branch; do
    branch_name=$(echo "$branch" | xargs)  # Trim whitespace
    if [ -n "$branch_name" ]; then
        if git branch -d "$branch_name" 2>/dev/null; then
            print_success "Deleted: $branch_name"
            DELETED_COUNT=$((DELETED_COUNT + 1))
        else
            print_error "Failed to delete: $branch_name"
        fi
    fi
done <<< "$MERGED_BRANCHES"

print_success "Deleted $DELETED_COUNT local branch(es)"
echo ""

# Check for remote merged branches
print_status "Checking for merged remote branches..."
REMOTE_MERGED=$(git branch -r --merged "$MAIN_BRANCH" | grep "origin/" | grep -v "origin/$MAIN_BRANCH" | grep -v "origin/HEAD" | sed 's/origin\///' || true)

if [ -z "$REMOTE_MERGED" ]; then
    print_success "No merged remote branches to clean up!"
    echo ""
    print_success "Cleanup complete! ✨"
    exit 0
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
printf "║          Remote Branches Merged into %-17s║\n" "$MAIN_BRANCH"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "$REMOTE_MERGED"
echo ""

# Count remote branches
REMOTE_COUNT=0
if [ -n "$REMOTE_MERGED" ]; then
    REMOTE_COUNT=$(echo "$REMOTE_MERGED" | grep -v '^[[:space:]]*$' | wc -l)
fi
print_status "Found $REMOTE_COUNT merged remote branch(es)"
echo ""

print_warning "Deleting remote branches is permanent and affects all team members!"
read -p "Do you want to delete these remote branches? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Remote cleanup cancelled by user"
    echo ""
    print_success "Local cleanup complete! ✨"
    exit 0
fi

# Delete remote merged branches
print_status "Deleting remote merged branches..."
REMOTE_DELETED_COUNT=0
while IFS= read -r branch; do
    branch_name=$(echo "$branch" | xargs)  # Trim whitespace
    if [ -n "$branch_name" ]; then
        if git push origin --delete "$branch_name" 2>/dev/null; then
            print_success "Deleted remote: $branch_name"
            REMOTE_DELETED_COUNT=$((REMOTE_DELETED_COUNT + 1))
        else
            print_error "Failed to delete remote: $branch_name"
        fi
    fi
done <<< "$REMOTE_MERGED"

print_success "Deleted $REMOTE_DELETED_COUNT remote branch(es)"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      Cleanup Summary                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Local branches deleted:  $DELETED_COUNT"
echo "Remote branches deleted: $REMOTE_DELETED_COUNT"
echo ""
print_success "Cleanup complete! ✨"
echo ""
print_status "Run 'git branch -a' to see remaining branches"
