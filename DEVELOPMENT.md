# Development Guide

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

Comprehensive guide for developers working on the Interact platform.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone repository
git clone https://github.com/Krosebrook/interact.git
cd interact

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

---

## Project Structure

```
interact/
├── src/
│   ├── pages/          # Route components (47 pages)
│   ├── components/     # Reusable components (40+ dirs)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and libraries
│   ├── api/            # API client configuration
│   ├── contexts/       # React Context providers
│   └── assets/         # Static assets
├── functions/          # Base44 backend functions (61)
├── public/             # Public static files
├── tests/              # Test files (when implemented)
└── docs/               # Additional documentation

```

---

## Development Workflow

### 1. Pick a Task
- Check GitHub Issues or project board
- Assign yourself to the task
- Create feature branch

### 2. Create Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 3. Develop
- Write code following style guide
- Test locally
- Run linter: `npm run lint`
- Fix lint errors: `npm run lint:fix`

### 4. Test
```bash
# Run tests (when available)
npm test

# Run specific test
npm test -- path/to/test.js

# Coverage
npm run test:coverage
```

### 5. Commit
```bash
git add .
git commit -m "feat: add activity recommendation feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/)

### 6. Push & PR
```bash
git push origin feature/your-feature-name
```
Create Pull Request on GitHub

---

## Coding Standards

### JavaScript/React
- Functional components with hooks
- No class components
- Hooks at top level (never conditional)
- PropTypes for all components
- JSDoc for complex functions

### Naming Conventions
- Components: PascalCase (`ActivityCard.jsx`)
- Hooks: camelCase with "use" prefix (`useActivityData.js`)
- Utilities: camelCase (`formatDate.js`)
- Constants: UPPER_SNAKE_CASE (`MAX_POINTS`)

### File Organization
- One component per file
- Co-locate tests with code
- Index files for public exports
- Group related files in directories

---

## Common Tasks

### Add New Page
```javascript
// 1. Create page component
// src/pages/NewPage.jsx
export const NewPage = () => {
  return <div>New Page</div>;
};

// 2. Add route
// src/App.jsx
<Route path="/new-page" element={<NewPage />} />
```

### Add New Component
```javascript
// src/components/common/MyComponent.jsx
import PropTypes from 'prop-types';

export const MyComponent = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
```

### Add New Hook
```javascript
// src/hooks/useMyData.js
import { useQuery } from '@tanstack/react-query';

export const useMyData = (id) => {
  return useQuery({
    queryKey: ['myData', id],
    queryFn: () => fetchMyData(id),
  });
};
```

### Add API Endpoint
```javascript
// functions/my-endpoint.ts
export async function myEndpoint(req: Request): Promise<Response> {
  // Validate request
  const { data } = await req.json();
  
  // Process
  const result = await processData(data);
  
  // Return response
  return new Response(JSON.stringify(result));
}
```

---

## Debugging

### Browser DevTools
- React DevTools extension
- Console for errors
- Network tab for API calls
- Performance tab for profiling

### VS Code Debugging
- Set breakpoints
- Press F5 to start debugging
- Inspect variables and call stack

### Common Issues
**Issue:** Component not re-rendering  
**Solution:** Check dependencies in useEffect, useMemo

**Issue:** API call fails  
**Solution:** Check network tab, verify auth token, check CORS

**Issue:** Build fails  
**Solution:** Clear node_modules and reinstall, check for syntax errors

---

## Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [TESTING.md](./TESTING.md) - Testing guide
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - GitHub Copilot guide
- [CLI.md](./CLI.md) - CLI commands

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
