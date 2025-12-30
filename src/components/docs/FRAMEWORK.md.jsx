# Framework & Technology Stack

**Status**: HIGH - Verified against package.json and codebase  
**Last Updated**: 2025-12-30  

---

## 1. Technology Stack

### 1.1 Frontend Framework
- **React**: 18.2.0
- **Build Tool**: Vite (Base44 managed)
- **Routing**: react-router-dom 6.26.0
- **State Management**: 
  - @tanstack/react-query 5.84.1 (server state)
  - React hooks (local state)
  - Context API (minimal global state)

### 1.2 UI & Styling
- **CSS Framework**: TailwindCSS (via Base44 platform)
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react 0.475.0
- **Animations**: framer-motion 11.16.4
- **Charts**: recharts 2.15.4

### 1.3 Backend
- **Platform**: Base44 BaaS (Backend-as-a-Service)
- **Functions Runtime**: Deno Deploy
- **SDK**: @base44/sdk 0.8.3
- **Database**: Base44 managed (entity-based)

### 1.4 AI/LLM Providers
- **OpenAI**: GPT models (content generation, recommendations)
- **Anthropic**: Claude models (analysis, personalization)
- **Integration**: Via Base44 Core.InvokeLLM integration

### 1.5 Third-Party Services
- **Payments**: Stripe (subscription management, rewards)
- **Email**: Base44 Core.SendEmail
- **Image Storage**: Cloudinary
- **Notifications**: Slack, Microsoft Teams (webhooks)
- **Calendar**: Google Calendar API

---

## 2. LLM Models & Roles

### 2.1 Model Assignments

**Status**: PARTIAL - Exact models not specified in code  
**Action Required**: Document which GPT/Claude versions are used per function

#### Known LLM Functions
- `functions/aiGamificationRuleOptimizer.js`: Analyzes engagement trends, suggests rule changes
- `functions/aiBuddyMatcher.js`: AI-powered buddy/mentor matching
- `functions/aiContentGenerator.js`: Learning paths, quiz questions, video scripts
- `functions/learningPathAI.js`: Personalized learning recommendations
- `functions/gamificationAI.js`: Challenge difficulty balancing, badge suggestions
- `functions/buddyMatchingAI.js`: Compatibility scoring, activity suggestions
- `functions/newEmployeeOnboardingAI.js`: 30-day onboarding plan generation

### 2.2 LLM Safety Guardrails

**Status**: UNKNOWN - Comprehensive safety review not completed  
**Action Required**:
- Document prompt injection mitigations
- Define PII filtering strategy for LLM inputs
- Establish output validation rules

---

## 3. Development Tooling

### 3.1 Package Manager
- **Tool**: npm (version: UNKNOWN - not specified in repo)
- **Lock File**: package-lock.json (status: not verified)

### 3.2 Code Quality
- **Linting**: 
  - Status: UNKNOWN - ESLint config not found in codebase scan
  - Action Required: Verify linting setup

- **Formatting**: 
  - Status: UNKNOWN - Prettier config not found
  - Action Required: Establish code formatting standards

- **Type Checking**: 
  - Status: PARTIAL - TypeScript present (`.tsx` files) but no `tsconfig.json` verified
  - Action Required: Document TypeScript strictness level

### 3.3 Testing
- **Framework**: 
  - Status: UNKNOWN - No test files found in codebase scan
  - Action Required: Document testing strategy (unit, integration, E2E)

---

## 4. CI/CD Pipeline

### 4.1 Build Process
- **Platform**: Base44 Dashboard (manual deploys)
- **Environments**: Development (local) → Staging → Production
- **Automation**: 
  - Status: PARTIAL - GitHub Actions present for docs validation
  - Action Required: Document full deployment pipeline

### 4.2 GitHub Actions
- **Workflow**: `.github/workflows/docs-authority.yml` (validation + llms-full.txt build)
- **Permissions**: Least privilege (contents: read default, write only for auto-commit job)
- **Kill-Switch**: `DOC_AUTOMATION_ENABLED=false` disables auto-commits

---

## 5. Tool Boundaries

### 5.1 Frontend Capabilities
- ✅ React components can call backend functions via `base44.functions.invoke()`
- ✅ Entity CRUD via `base44.entities.EntityName.*`
- ✅ File uploads via `base44.integrations.Core.UploadFile()`
- ❌ NO direct database access
- ❌ NO secret access (backend only)

### 5.2 Backend Capabilities
- ✅ Full entity access via `base44.asServiceRole.entities.*`
- ✅ Secret access via `Deno.env.get()`
- ✅ Third-party API calls (Stripe, OpenAI, etc.)
- ❌ NO file system writes (except `/tmp`)
- ❌ NO arbitrary code execution

---

## 6. Security Tooling

### 6.1 Static Analysis
- **Status**: UNKNOWN - No SAST tools configured
- **Action Required**: Integrate Snyk, Semgrep, or equivalent

### 6.2 Secrets Scanning
- **Status**: UNKNOWN - Git history not scanned for secrets
- **Action Required**: Run git-secrets or TruffleHog on full history

### 6.3 Dependency Scanning
- **Status**: UNKNOWN - Dependabot alerts not verified
- **Action Required**: Enable GitHub Dependabot and set up notifications

---

## 7. Performance Monitoring

### 7.1 Frontend
- **React Query**: Cache management (staleTime, cacheTime)
- **Lazy Loading**: React.lazy() for code splitting
- **Bundle Size**: 
  - Status: UNKNOWN - No documented size budget
  - Action Required: Establish max bundle size (e.g., <500KB initial)

### 7.2 Backend
- **Function Metrics**: Base44 platform tracks execution time, memory
- **Cold Start**: ~200ms (Deno Deploy)
- **Monitoring**: 
  - Status: PARTIAL - Base44 dashboard provides logs
  - Action Required: Set up alerting for error rate >5%

---

## 8. Known Limitations

### 8.1 Platform Constraints (Base44)
- **File System**: Backend functions can only write to `/tmp`
- **Function Timeout**: 30 seconds max execution time
- **Bundle Restrictions**: Only allowed npm packages (see docs)
- **Database**: Entity-based (no raw SQL access)

### 8.2 Scale Limits
- **Current**: Designed for 50-200 users
- **Breaking Point**: 
  - Status: UNKNOWN - Load testing not performed
  - Action Required: Establish performance benchmarks

---

**Provenance**:
- Source: code + config
- Locator: `package.json` (installed_packages in context), `functions/**`, `components/**`
- Confidence: MEDIUM (package.json not directly scanned, relying on context snapshot)
- Last Verified: 2025-12-30
- Verified By: DAA + Human Review Required for UNKNOWN sections