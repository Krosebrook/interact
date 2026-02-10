# Environment Variables

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

This document lists all environment variables used in the Interact platform.

---

## Frontend Environment Variables

Create `.env.local` file in project root (never commit):

```bash
# Base44 Configuration
VITE_BASE44_PROJECT_ID=your_project_id
VITE_BASE44_API_KEY=your_api_key

# API Endpoints
VITE_API_URL=https://api.interact.app
VITE_CDN_URL=https://cdn.interact.app

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# Third-Party Services
VITE_GOOGLE_MAPS_API_KEY=your_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Environment
VITE_ENV=development  # development, staging, production
```

---

## Backend Environment Variables

Configured in Base44 dashboard:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Email
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@interact.app

# Storage
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Integrations
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TEAMS_CLIENT_ID=...
TEAMS_CLIENT_SECRET=...

# Security
JWT_SECRET=your_secret_here
ENCRYPTION_KEY=your_encryption_key

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info  # debug, info, warn, error
```

---

## Environment-Specific Values

### Development
```bash
VITE_API_URL=http://localhost:3000
VITE_ENV=development
LOG_LEVEL=debug
```

### Staging
```bash
VITE_API_URL=https://staging-api.interact.app
VITE_ENV=staging
LOG_LEVEL=info
```

### Production
```bash
VITE_API_URL=https://api.interact.app
VITE_ENV=production
LOG_LEVEL=warn
```

---

## Security Best Practices

1. **Never commit:** .env files to version control
2. **Use secrets manager:** For production secrets
3. **Rotate regularly:** API keys and secrets
4. **Minimal access:** Least privilege principle
5. **Audit:** Log secret access

---

## Setup Instructions

### Local Development
```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Restart dev server
npm run dev
```

### Production Deployment
```bash
# Set via hosting platform dashboard
# Or use CLI:
base44 secrets set OPENAI_API_KEY=sk-...
```

---

## Validation

Required variables are validated at startup. Missing required variables will cause startup failure with helpful error message.

---

## Related Documentation

- [DEVELOPMENT.md](../getting-started/DEVELOPMENT.md)
- [CI-CD.md](../operations/CI-CD.md)
- [INFRASTRUCTURE.md](../operations/INFRASTRUCTURE.md)

---

**Document Owner:** DevOps Team  
**Last Updated:** January 14, 2026
