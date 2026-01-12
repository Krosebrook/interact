# Contributing to Interact

Thank you for your interest in contributing to the Interact Employee Engagement Platform! This document provides guidelines and instructions for contributing to the project.

**Last Updated:** January 12, 2026

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)
9. [Security](#security)
10. [Getting Help](#getting-help)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. We expect all contributors to:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Be patient and understanding
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Personal attacks or insults
- Publishing others' private information
- Unprofessional conduct

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Git** for version control
- **Code editor** (VS Code recommended)
- **GitHub account** for pull requests

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/interact.git
   cd interact
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/Krosebrook/interact.git
   ```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Adding tests
- `chore/description` - Maintenance tasks

### 2. Make Your Changes

- Follow the [Coding Standards](#coding-standards)
- Write/update tests for your changes
- Update documentation as needed
- Test your changes thoroughly

### 3. Commit Your Changes

Follow [Commit Guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add user profile customization"
```

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Fill out the PR template
4. Request review from maintainers

---

## Coding Standards

### JavaScript/React Standards

**Component Structure:**
```javascript
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ActivityCard displays information about a team activity
 * @param {Object} props - Component props
 * @param {string} props.title - Activity title
 * @param {number} props.points - Points reward
 */
export const ActivityCard = ({ title, points }) => {
  // State declarations
  const [isJoined, setIsJoined] = useState(false);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Event handlers
  const handleJoin = () => {
    setIsJoined(true);
  };
  
  // Render
  return (
    <div className="activity-card">
      <h3>{title}</h3>
      <p>{points} points</p>
      <button onClick={handleJoin}>
        {isJoined ? 'Joined' : 'Join'}
      </button>
    </div>
  );
};

ActivityCard.propTypes = {
  title: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
};
```

### File Organization

```
src/
├── pages/              # Route components
├── components/
│   ├── ui/            # Reusable UI components
│   ├── common/        # Shared components
│   └── feature/       # Feature-specific components
├── modules/           # New modular features (Base44-compatible)
├── hooks/             # Custom React hooks
├── lib/               # Utilities and libraries
├── api/               # API client configuration
├── contexts/          # React Context providers
└── assets/            # Static assets
```

### Naming Conventions

- **Components:** PascalCase (e.g., `ActivityCard.jsx`)
- **Hooks:** camelCase with "use" prefix (e.g., `useActivityData.js`)
- **Utilities:** camelCase (e.g., `formatDate.js`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Classes:** kebab-case (e.g., `activity-card`)

### React Hooks Rules (CRITICAL)

✅ **ALWAYS:**
- Call hooks at the top level of your component
- Call hooks in the same order every time
- Only call hooks from React functions

❌ **NEVER:**
- Call hooks inside loops, conditions, or nested functions
- Call hooks from regular JavaScript functions

**Example - WRONG:**
```javascript
// ❌ BAD: Conditional hook call
if (isLoggedIn) {
  const user = useUser(); // This will break!
}
```

**Example - CORRECT:**
```javascript
// ✅ GOOD: Hook called at top level
const user = useUser();

if (isLoggedIn && user) {
  // Use the user data here
}
```

### Styling Guidelines

- Use **TailwindCSS** utility classes
- Leverage **Radix UI** for accessible components
- Use `cn()` helper for conditional classes
- Mobile-first responsive design

**Example:**
```javascript
import { cn } from '@/lib/utils';

<button 
  className={cn(
    "px-4 py-2 rounded-lg",
    isActive && "bg-blue-500 text-white",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>
```

### TypeScript Migration (Q2 2026+)

When TypeScript migration begins:
- All new files should use TypeScript (`.tsx`, `.ts`)
- Add type definitions for props and return values
- Avoid `any` type (use `unknown` if needed)
- Export types alongside components

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, missing semicolons, etc.)
- **refactor:** Code refactoring without changing behavior
- **test:** Adding or updating tests
- **chore:** Maintenance tasks (dependencies, build config, etc.)
- **perf:** Performance improvements
- **ci:** CI/CD configuration changes

### Examples

```bash
# Simple feature
git commit -m "feat: add user profile customization"

# Bug fix with scope
git commit -m "fix(auth): resolve session timeout issue"

# Breaking change
git commit -m "feat!: redesign gamification point system

BREAKING CHANGE: point calculations now use new formula"

# Multiple changes
git commit -m "chore: update dependencies and fix linting errors"
```

### Commit Best Practices

✅ **DO:**
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Commit working code (it should build)
- Reference issue numbers when applicable

❌ **DON'T:**
- Commit broken code
- Mix unrelated changes in one commit
- Write vague messages ("fixed stuff", "updates")
- Commit sensitive data (API keys, passwords)

---

## Pull Request Process

### Before Submitting

1. **Update your branch:**
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature
   git rebase main
   ```

2. **Run linter:**
   ```bash
   npm run lint
   npm run lint:fix  # Auto-fix issues
   ```

3. **Run tests** (when available):
   ```bash
   npm test
   ```

4. **Test manually:**
   - Run the app locally
   - Test your changes in the browser
   - Check for console errors
   - Verify responsive design

### PR Title Format

Use Conventional Commits format:
```
feat: add activity recommendation engine
fix: resolve calendar sync issue
docs: update API integration guide
```

### PR Description Template

```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested locally
- [ ] All existing tests pass
- [ ] Added new tests for changes

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project coding standards
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated
- [ ] Linter passes
```

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **At least one approving review** from maintainers
3. **All review comments** addressed
4. **No merge conflicts** with main branch

### After PR is Merged

1. **Delete your feature branch:**
   ```bash
   git branch -d feature/your-feature
   git push origin --delete feature/your-feature
   ```

2. **Update your local main:**
   ```bash
   git checkout main
   git pull upstream main
   ```

---

## Testing Requirements

### When to Write Tests

- **New features:** Add tests for all new functionality
- **Bug fixes:** Add tests to prevent regression
- **Refactoring:** Ensure existing tests pass

### Test Coverage Expectations

- **Utilities/Hooks:** 80%+ coverage
- **Components:** 70%+ coverage
- **E2E flows:** All critical paths

### Running Tests

```bash
# Run all tests (when infrastructure ready)
npm test

# Run specific test
npm test -- path/to/test.js

# Run with coverage
npm test -- --coverage
```

**See [TESTING.md](./TESTING.md) for detailed testing guidelines.**

---

## Documentation

### When to Update Documentation

- **New features:** Document usage and API
- **Breaking changes:** Update affected docs
- **Bug fixes:** Update if behavior changes
- **Architecture changes:** Update technical docs

### Documentation Files to Consider

- **README.md** - Main project overview
- **FEATURE_ROADMAP.md** - Feature planning
- **TESTING.md** - Testing guidelines
- **API_INTEGRATION_GUIDE.md** - Base44 SDK usage
- **Component docs** - JSDoc for complex components
- **Security docs** - Security-related changes

### Writing Good Documentation

✅ **DO:**
- Use clear, simple language
- Provide code examples
- Include screenshots for UI changes
- Keep it up-to-date

❌ **DON'T:**
- Assume prior knowledge
- Use jargon without explanation
- Leave outdated information
- Skip obvious steps

---

## Security

### Reporting Security Vulnerabilities

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead:
1. Email security concerns to [security contact - TBD]
2. Include detailed description and reproduction steps
3. Wait for acknowledgment before public disclosure

**See [docs/security/VULNERABILITY_DISCLOSURE.md](./docs/security/VULNERABILITY_DISCLOSURE.md) for details.**

### Security Best Practices

✅ **DO:**
- Validate all user inputs
- Use parameterized queries
- Sanitize data before rendering
- Keep dependencies updated
- Follow principle of least privilege

❌ **DON'T:**
- Commit API keys or secrets
- Store sensitive data in localStorage
- Trust user input
- Use `eval()` or `dangerouslySetInnerHTML` without sanitization
- Expose internal errors to users

### Pre-commit Security Checks

```bash
# Check for secrets in code
git diff --cached | grep -E 'API_KEY|SECRET|PASSWORD'

# Run security audit
npm audit
```

---

## Getting Help

### Resources

- **Documentation:** Start with [README.md](./README.md) and [DOCUMENTATION_SUMMARY.md](./DOCUMENTATION_SUMMARY.md)
- **Codebase Audit:** See [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) for architecture
- **Feature Roadmap:** Check [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) for planned features
- **Testing Guide:** Read [TESTING.md](./TESTING.md) for testing standards

### Communication Channels

- **GitHub Issues:** For bug reports and feature requests
- **Pull Requests:** For code discussions
- **GitHub Discussions:** For general questions (if enabled)

### Common Questions

**Q: How do I set up Base44 SDK?**
A: See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for setup instructions.

**Q: What's the testing strategy?**
A: See [TESTING.md](./TESTING.md) for comprehensive testing guidelines.

**Q: How do I run the linter?**
A: Run `npm run lint` to check, `npm run lint:fix` to auto-fix.

**Q: My PR has merge conflicts, what do I do?**
A: See [docs/SAFE_BRANCH_MERGING.md](./docs/SAFE_BRANCH_MERGING.md) for safe merging practices.

---

## Development Tips

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag
- GitLens

### Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests (when available)
npm test

# Generate coverage report
npm test -- --coverage
```

### Debugging

**Browser DevTools:**
- Use React DevTools extension
- Check Console for errors
- Use Network tab for API calls
- Use Lighthouse for performance

**VS Code Debugging:**
- Set breakpoints in code
- Use Debug panel (F5)
- Inspect variables and call stack

---

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- Project documentation

Thank you for contributing to Interact! 🎉

---

**Document Owner:** Engineering Team  
**Last Updated:** January 12, 2026  
**Next Review:** March 2026

---

**Related Documentation:**
- [README.md](./README.md) - Project overview
- [TESTING.md](./TESTING.md) - Testing guidelines
- [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) - Code quality standards
- [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) - Feature planning

---

**End of Contributing Guide**
