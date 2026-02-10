# CLI Reference

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

Command-line interface reference for the Interact platform.

---

## NPM Scripts

### Development
```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- --port 3000

# Clear cache and start
npm run dev -- --force
```

### Building
```bash
# Build for production
npm run build

# Build with analysis
npm run build -- --report

# Preview production build
npm run preview
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.js

# Run with coverage
npm run test:coverage

# Run UI mode
npm run test:ui
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check (TypeScript)
npm run typecheck
```

---

## Base44 CLI

### Installation
```bash
npm install -g @base44/cli
```

### Authentication
```bash
# Login to Base44
base44 login

# View current user
base44 whoami

# Logout
base44 logout
```

### Project Management
```bash
# List projects
base44 projects list

# Switch project
base44 projects use <project-id>

# View project info
base44 projects info
```

### Function Deployment
```bash
# Deploy all functions
base44 deploy

# Deploy specific function
base44 deploy functions/my-function.ts

# Deploy with environment
base44 deploy --env production
```

### Development
```bash
# Run functions locally
base44 dev

# Run with specific port
base44 dev --port 3001

# View logs
base44 logs

# Tail logs in real-time
base44 logs --tail

# Filter logs by function
base44 logs --function my-function
```

### Database
```bash
# View database schema
base44 db schema

# Run migrations
base44 db migrate

# Seed database
base44 db seed

# Backup database
base44 db backup

# Restore database
base44 db restore <backup-id>
```

### Secrets Management
```bash
# List secrets
base44 secrets list

# Set secret
base44 secrets set KEY=value

# Get secret
base44 secrets get KEY

# Delete secret
base44 secrets delete KEY
```

---

## Git Commands

### Branch Management
```bash
# Create branch
git checkout -b feature/my-feature

# Switch branch
git checkout main

# List branches
git branch -a

# Delete branch
git branch -d feature/my-feature
```

### Commits
```bash
# Stage changes
git add .

# Commit
git commit -m "feat: add feature"

# Amend last commit
git commit --amend

# View history
git log --oneline
```

### Sync
```bash
# Pull latest
git pull origin main

# Push changes
git push origin feature/my-feature

# Fetch without merge
git fetch origin
```

---

## Utility Scripts

### Database
```bash
# scripts/seed-db.sh
./scripts/seed-db.sh

# scripts/reset-db.sh
./scripts/reset-db.sh
```

### Testing
```bash
# scripts/test-e2e.sh
./scripts/test-e2e.sh

# scripts/test-integration.sh
./scripts/test-integration.sh
```

---

## Related Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [ENV-VARS.md](./ENV-VARS.md)
- [TOOLS.md](./TOOLS.md)

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
