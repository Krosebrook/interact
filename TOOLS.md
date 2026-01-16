# Tools

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

This document catalogs development tools, utilities, and helper functions available in the Interact platform.

---

## Development Tools

### Build Tools
- **Vite 6.1.0** - Build tool and dev server
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### Testing Tools
- **Vitest 4.0.17** - Unit testing
- **React Testing Library 16.3.1** - Component testing
- **@vitest/coverage-v8** - Code coverage
- **Playwright** (planned) - E2E testing

### Code Quality
- **ESLint 9.19.0** - Linting
- **Prettier** - Code formatting
- **TypeScript 5.8.2** - Type checking (planned migration)

---

## Utility Functions

### Date/Time Utilities (`src/utils/`)
- `formatDate(date)` - Format dates consistently
- `getRelativeTime(date)` - Human-readable relative times
- `isToday(date)` - Check if date is today

### String Utilities
- `truncate(str, length)` - Truncate with ellipsis
- `slugify(str)` - Convert to URL-safe slug
- `capitalize(str)` - Capitalize first letter

### Array Utilities
- `groupBy(array, key)` - Group array by property
- `sortBy(array, key, order)` - Sort array
- `unique(array)` - Remove duplicates

### Image Utilities (`src/lib/imageUtils.js`)
- `optimizeImage(url, width, height)` - Cloudinary optimization
- `generatePlaceholder(width, height)` - Placeholder images
- `validateImageFile(file)` - File validation

### Class Name Utilities (`src/lib/utils.js`)
- `cn(...classes)` - Merge TailwindCSS classes
- Based on `clsx` and `tailwind-merge`

---

## Custom Hooks

### Data Fetching
- `useQuery` - TanStack Query wrapper
- `useMutation` - Data mutations
- `useInfiniteQuery` - Infinite scroll

### UI Hooks
- `useToast` - Toast notifications
- `useModal` - Modal management
- `useMediaQuery` - Responsive breakpoints
- `useMobile` - Mobile detection

### Form Hooks
- `useForm` - React Hook Form wrapper
- `useFormValidation` - Zod validation

### Platform Hooks
- `useAuth` - Authentication state
- `useUser` - Current user data
- `useActivities` - Activities data
- `useGamification` - Gamification state

---

## CLI Tools

### Base44 CLI
```bash
# Deploy functions
base44 deploy

# Run locally
base44 dev

# View logs
base44 logs
```

### NPM Scripts
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run linter
npm run lint:fix     # Fix linting issues
npm test             # Run tests
npm run test:coverage # Coverage report
```

### Custom Scripts

#### PRD Generator
Generate comprehensive Product Requirements Documents from feature ideas:

```bash
# Basic usage
node scripts/generate-prd.js --idea "Add dark mode to dashboard"

# With context
node scripts/generate-prd.js --idea "Add AI chatbot" \
  --context '{"targetAudience":"All users","timeline":"Q2 2026"}'

# From file
node scripts/generate-prd.js --file ideas/feature.txt --output PRD-feature.md

# Interactive mode
node scripts/generate-prd.js --interactive
```

**Context Options:**
- `targetAudience` - Target user base
- `businessGoals` - Business objectives
- `technicalConstraints` - Technical limitations
- `timeline` - Development timeline
- `budget` - Budget constraints
- `existingIntegrations` - Integration requirements

---

## AI Tools

### Content Generation
- `generateActivityIdea(criteria)` - AI activity ideas
- `generateQuizQuestions(topic, count)` - Quiz generation
- `summarizeContent(content)` - Text summarization
- `generatePRD(featureIdea, context)` - PRD generation

### Analysis
- `analyzeEngagement(userId)` - Engagement analysis
- `detectSentiment(text)` - Sentiment analysis
- `extractKeywords(text)` - Keyword extraction

---

## Integration Tools

### API Client (`src/api/base44Client.js`)
- Base44 SDK wrapper
- Authentication handling
- Error handling
- Request/response transforms

### Third-Party SDKs
- Google Calendar API
- Slack API
- Microsoft Teams API
- Cloudinary SDK

---

## Related Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [CLI.md](./CLI.md) - CLI reference
- [API-CONTRACTS.md](./API-CONTRACTS.md) - API documentation

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
