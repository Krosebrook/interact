#!/usr/bin/env node

/**
 * PRD Generator CLI
 * 
 * This script generates a comprehensive Product Requirements Document (PRD)
 * from a feature idea using AI (Claude/OpenAI/Gemini).
 * 
 * Usage:
 *   node scripts/generate-prd.js --idea "Feature idea description"
 *   node scripts/generate-prd.js --file feature-idea.txt
 *   node scripts/generate-prd.js --interactive
 * 
 * Options:
 *   --idea, -i        Feature idea as a string
 *   --file, -f        Path to file containing feature idea
 *   --interactive, -I Interactive mode (prompts for input)
 *   --output, -o      Output file path (default: PRD-{timestamp}.md)
 *   --context, -c     Additional context (JSON string or file)
 *   --model, -m       AI model to use (claude|gpt4|gemini)
 *   --help, -h        Show help
 * 
 * Examples:
 *   node scripts/generate-prd.js -i "Add dark mode to dashboard"
 *   node scripts/generate-prd.js -f ideas/new-feature.txt -o PRD-dark-mode.md
 *   node scripts/generate-prd.js --interactive
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    idea: null,
    file: null,
    output: null,
    context: {},
    model: 'claude',
    interactive: false,
    help: false,
    projectType: 'web-app'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--idea':
      case '-i':
        options.idea = next;
        i++;
        break;
      case '--file':
      case '-f':
        options.file = next;
        i++;
        break;
      case '--output':
      case '-o':
        options.output = next;
        i++;
        break;
      case '--context':
      case '-c':
        try {
          options.context = JSON.parse(next);
        } catch (e) {
          // Try to read as file
          if (fs.existsSync(next)) {
            options.context = JSON.parse(fs.readFileSync(next, 'utf-8'));
          } else {
            console.error(`${colors.red}Error: Invalid context JSON${colors.reset}`);
            process.exit(1);
          }
        }
        i++;
        break;
      case '--model':
      case '-m':
        options.model = next;
        i++;
        break;
      case '--project-type':
      case '-t':
        options.projectType = next;
        i++;
        break;
      case '--interactive':
      case '-I':
        options.interactive = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}PRD Generator CLI${colors.reset}

Generate comprehensive Product Requirements Documents from feature ideas using AI.

${colors.bright}Usage:${colors.reset}
  node scripts/generate-prd.js --idea "Feature idea description"
  node scripts/generate-prd.js --file feature-idea.txt
  node scripts/generate-prd.js --interactive

${colors.bright}Options:${colors.reset}
  --idea, -i        Feature idea as a string
  --file, -f        Path to file containing feature idea
  --interactive, -I Interactive mode (prompts for input)
  --output, -o      Output file path (default: PRD-{timestamp}.md)
  --context, -c     Additional context (JSON string or file)
  --model, -m       AI model to use (claude|gpt4|gemini, default: claude)
  --project-type, -t Project type: web-app|api|cli (default: web-app)
  --help, -h        Show this help message

${colors.bright}Context JSON Format:${colors.reset}
  {
    "targetAudience": "Enterprise users, 100-5000 employees",
    "businessGoals": "Increase engagement by 40% in 6 months",
    "technicalConstraints": "Must work with React 18 and Vite",
    "timeline": "Q2 2026",
    "budget": "$50,000",
    "existingIntegrations": "Slack, Microsoft Teams, Google Calendar"
  }

${colors.bright}Examples:${colors.reset}
  # Simple usage
  node scripts/generate-prd.js -i "Add dark mode to dashboard"

  # With context and custom output
  node scripts/generate-prd.js -i "Add AI chatbot" -c '{"targetAudience":"All users"}' -o PRD-chatbot.md

  # From file
  node scripts/generate-prd.js -f ideas/new-feature.txt -o PRD-new-feature.md

  # Interactive mode
  node scripts/generate-prd.js --interactive
`);
}

// Interactive mode
async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  console.log(`\n${colors.bright}${colors.cyan}PRD Generator - Interactive Mode${colors.reset}\n`);

  const featureIdea = await question(`${colors.yellow}Enter your feature idea:${colors.reset}\n> `);
  
  console.log(`\n${colors.dim}Optional context (press Enter to skip):${colors.reset}`);
  
  const projectTypeInput = await question(`${colors.yellow}Project type (web-app/api/cli, default: web-app):${colors.reset} `);
  const targetAudience = await question(`${colors.yellow}Target Audience:${colors.reset} `);
  const businessGoals = await question(`${colors.yellow}Business Goals:${colors.reset} `);
  const technicalConstraints = await question(`${colors.yellow}Technical Constraints:${colors.reset} `);
  const timeline = await question(`${colors.yellow}Timeline:${colors.reset} `);
  const budget = await question(`${colors.yellow}Budget:${colors.reset} `);
  
  const outputFile = await question(`\n${colors.yellow}Output file name (default: PRD-{timestamp}.md):${colors.reset} `);

  rl.close();

  const context = {};
  context.projectType = projectTypeInput || 'web-app';
  if (targetAudience) context.targetAudience = targetAudience;
  if (businessGoals) context.businessGoals = businessGoals;
  if (technicalConstraints) context.technicalConstraints = technicalConstraints;
  if (timeline) context.timeline = timeline;
  if (budget) context.budget = budget;

  return {
    idea: featureIdea,
    output: outputFile || null,
    context
  };
}

// Generate Vercel production-readiness section based on project type
function generateVercelSection(projectType) {
  const isNonWebApp = projectType === 'api' || projectType === 'cli';
  if (isNonWebApp) {
    const kind = projectType === 'api' ? 'backend API' : 'CLI';
    return `> **N/A** \u2014 This is a ${kind} project and is not applicable for Vercel web deployment. Vercel hosts web apps (e.g., Next.js, Vite); ${projectType === 'api' ? 'API' : 'CLI'} projects should be deployed to their own appropriate runtime (e.g., Base44 serverless functions, Docker, cloud run).`;
  }
  return [
    '- [ ] `vercel.json` present and configured (framework, buildCommand, outputDirectory)',
    '- [ ] Environment variables defined in Vercel dashboard (not hard-coded)',
    '- [ ] Preview deployments enabled for pull requests',
    '- [ ] Production domain configured with valid SSL certificate',
    '- [ ] Security headers set (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)',
    '- [ ] `rewrites` / `redirects` configured for SPA routing (e.g., `/api/:path*`)',
    '- [ ] Edge network region(s) selected appropriate for target audience',
    '- [ ] Build passes locally with `npm run build` (output to `dist/` or configured `outputDirectory`)',
    '- [ ] No secrets committed to source; all sensitive values use Vercel environment variable references',
  ].join('\n');
}

// Generate PRD using local AI template (fallback without API)
function generatePRDTemplate(featureIdea, context = {}) {
  const timestamp = new Date().toISOString().split('T')[0];
  const vercelSection = generateVercelSection(context.projectType || 'web-app');
  return `# Product Requirements Document (PRD)

**Feature:** ${featureIdea}
**Date:** ${timestamp}
**Version:** 1.0
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Overview
${featureIdea}

${context.businessGoals ? `### 1.2 Business Goals\n${context.businessGoals}\n` : ''}
${context.targetAudience ? `### 1.3 Target Market\n${context.targetAudience}\n` : ''}

---

## 2. Problem Statement

### 2.1 Current Situation
[Describe the current state and challenges]

### 2.2 Problem Description
[Clear articulation of the problem being solved]

### 2.3 Impact
[Who experiences this problem and why it's critical]

---

## 3. Target Audience / User Personas

### Persona 1: [Primary User]
- **Role:** [User role]
- **Goals:** [What they want to achieve]
- **Pain Points:** [Current challenges]
- **Technical Proficiency:** [Beginner/Intermediate/Advanced]

### Persona 2: [Secondary User]
- **Role:** [User role]
- **Goals:** [What they want to achieve]
- **Pain Points:** [Current challenges]
- **Technical Proficiency:** [Beginner/Intermediate/Advanced]

---

## 4. Functional Requirements

### 4.1 Core Features

#### Feature 1: [Feature Name]
**Description:** [Feature description]
**Priority:** High/Medium/Low
**Behavior:**
- [Specific behavior 1]
- [Specific behavior 2]
- [Specific behavior 3]

**Edge Cases:**
- [Edge case 1]
- [Edge case 2]

#### Feature 2: [Feature Name]
**Description:** [Feature description]
**Priority:** High/Medium/Low
**Behavior:**
- [Specific behavior 1]
- [Specific behavior 2]

### 4.2 Feature Requirements Matrix

| Feature | Priority | Complexity | Dependencies |
|---------|----------|------------|--------------|
| [Feature 1] | High | Medium | None |
| [Feature 2] | Medium | High | Feature 1 |

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **Response Time:** [e.g., < 200ms for API calls]
- **Throughput:** [e.g., Handle 1000 concurrent users]
- **Resource Usage:** [e.g., < 100MB memory]

### 5.2 Scalability
- **User Growth:** [e.g., Support up to 10,000 users]
- **Data Volume:** [e.g., Store up to 1TB of data]
- **Geographic Distribution:** [e.g., Multi-region support]

### 5.3 Availability & Reliability
- **Uptime:** [e.g., 99.9% uptime SLA]
- **Recovery Time:** [e.g., RTO < 1 hour, RPO < 15 minutes]
- **Error Rate:** [e.g., < 0.1% error rate]

### 5.4 Security
- **Authentication:** [e.g., OAuth 2.0, SSO]
- **Authorization:** [e.g., Role-based access control]
- **Data Protection:** [e.g., Encryption at rest and in transit]

### 5.5 Localization
- **Languages:** [List supported languages]
- **Regions:** [List supported regions]
- **Currency:** [List supported currencies]

### 5.6 Accessibility
- **Standards:** WCAG 2.1 Level AA compliance
- **Screen Reader Support:** Full support
- **Keyboard Navigation:** Complete keyboard accessibility

---

## 6. User Stories & Acceptance Criteria

### User Story 1: [Story Title]
**As a** [user role]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria:**
\`\`\`gherkin
Given [initial context]
When [action is performed]
Then [expected outcome]
And [additional outcome]
\`\`\`

### User Story 2: [Story Title]
**As a** [user role]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria:**
\`\`\`gherkin
Given [initial context]
When [action is performed]
Then [expected outcome]
\`\`\`

---

## 7. Technical Architecture Overview

### 7.1 System Design
\`\`\`
[High-level architecture diagram description]
Frontend (React 18 + Vite) <-> API Gateway <-> Backend Services <-> Database
\`\`\`

### 7.2 Technology Stack
- **Frontend:** React 18, Vite 6, TailwindCSS, Radix UI
- **State Management:** React Context API, TanStack Query
- **Backend:** Base44 SDK (serverless functions)
- **Database:** [Database technology]
- **Caching:** [Caching solution]
- **Storage:** Cloudinary (media), Base44 managed storage

### 7.3 Data Flow
1. User interaction triggers frontend event
2. Frontend validates input and calls API
3. API authenticates request
4. Business logic processes request
5. Data persisted to database
6. Response returned to frontend
7. UI updates with new data

### 7.4 Integration Points
${context.existingIntegrations ? `- ${context.existingIntegrations.split(',').join('\n- ')}` : '- [List integrations]'}

---

## 8. API Design

### 8.1 Endpoints

#### POST /api/[resource]
**Description:** [Endpoint description]

**Request:**
\`\`\`json
{
  "field1": "value",
  "field2": 123
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "123",
    "field1": "value"
  }
}
\`\`\`

**Errors:**
- \`400\` - Bad Request: Invalid input
- \`401\` - Unauthorized: Missing authentication
- \`403\` - Forbidden: Insufficient permissions
- \`500\` - Internal Server Error

#### GET /api/[resource]/{id}
**Description:** [Endpoint description]

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "123",
    "field1": "value"
  }
}
\`\`\`

### 8.2 Authentication
- **Method:** JWT tokens via Base44 SDK
- **Token Expiry:** 1 hour (with refresh tokens)
- **Permissions:** Role-based access control (RBAC)

---

## 9. UI/UX Considerations

### 9.1 Page Layout
- **Header:** Navigation, user menu, notifications
- **Sidebar:** Primary navigation (collapsible on mobile)
- **Main Content:** Feature-specific content
- **Footer:** Links, copyright, version info

### 9.2 Key Components
1. **[Component 1]**: [Description and purpose]
2. **[Component 2]**: [Description and purpose]
3. **[Component 3]**: [Description and purpose]

### 9.3 Interaction Patterns
- **Loading States:** Skeleton screens, spinners
- **Empty States:** Helpful messages with calls to action
- **Error States:** Clear error messages with recovery options
- **Success States:** Confirmation messages, visual feedback

### 9.4 Responsive Design
- **Mobile:** < 768px - Single column, hamburger menu
- **Tablet:** 768px - 1024px - Adapted layout
- **Desktop:** > 1024px - Full layout with sidebar

### 9.5 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios (4.5:1 minimum)
- Focus indicators
- ARIA labels where needed

---

## 10. Security & Compliance

### 10.1 Data Security
- **Encryption at Rest:** AES-256
- **Encryption in Transit:** TLS 1.3
- **Data Classification:** [PII, sensitive, public]
- **Data Retention:** [Retention policies]

### 10.2 Access Control
- **Authentication:** Multi-factor authentication (MFA) optional
- **Authorization:** Role-based access control (RBAC)
- **Session Management:** Secure session handling, auto-logout

### 10.3 Compliance
- **GDPR:** EU data protection compliance
  - Right to access, rectify, delete
  - Data portability
  - Consent management
- **SOC 2:** Type II compliance (if applicable)
- **HIPAA:** Healthcare data protection (if applicable)

### 10.4 Security Testing
- Regular penetration testing
- Vulnerability scanning
- Dependency auditing (npm audit)
- Code scanning (CodeQL)

---

## 11. Testing Strategy

### 11.1 Testing Levels

#### Unit Testing
- **Coverage Target:** 80% minimum
- **Tools:** Vitest, React Testing Library
- **Focus:** Individual functions, components, hooks
- **Run Frequency:** On every commit

#### Integration Testing
- **Coverage Target:** 70% minimum
- **Tools:** Vitest, MSW (Mock Service Worker)
- **Focus:** API integration, component interaction
- **Run Frequency:** On every PR

#### End-to-End Testing
- **Coverage Target:** Critical user paths
- **Tools:** Playwright
- **Focus:** Complete user workflows
- **Run Frequency:** Before deployment

### 11.2 Testing Requirements
- All new features must have tests
- Critical paths require E2E tests
- API endpoints require integration tests
- Accessibility testing (axe-core)
- Performance testing (Lighthouse)

### 11.3 Test Automation
- Automated test runs in CI/CD pipeline
- Test reports generated automatically
- Coverage reports tracked over time
- Failed tests block deployments

---

## 12. Deployment & DevOps Plan

### 12.1 Environments

#### Development
- **Purpose:** Active development
- **URL:** http://localhost:5173
- **Database:** Local development database
- **Updates:** Continuous (on code changes)

#### Staging
- **Purpose:** Pre-production testing
- **URL:** https://staging.interact.app
- **Database:** Staging database (production-like data)
- **Updates:** On merge to main branch

#### Production
- **Purpose:** Live application
- **URL:** https://interact.app
- **Database:** Production database
- **Updates:** Scheduled releases

### 12.2 CI/CD Pipeline
1. **Commit:** Developer commits code
2. **Lint:** ESLint runs automatically
3. **Test:** Unit and integration tests run
4. **Build:** Application builds
5. **Security Scan:** Dependency and code scanning
6. **Deploy to Staging:** Automatic deployment
7. **E2E Tests:** Run on staging
8. **Deploy to Production:** Manual approval required

### 12.3 Deployment Strategy
- **Method:** Blue-green deployment
- **Rollback:** Instant rollback to previous version
- **Feature Flags:** Gradual rollout capability
- **Monitoring:** Real-time monitoring during deployment

### 12.4 Rollback Plan
1. Detect issue (monitoring alerts)
2. Assess severity
3. Execute rollback (< 5 minutes)
4. Verify system health
5. Investigate root cause
6. Fix and redeploy

### 12.5 Vercel Production-Readiness

${vercelSection}

---

## 13. Assumptions, Risks & Open Questions

### 13.1 Assumptions
- [List key assumptions made in this PRD]
- Users have modern browsers (last 2 versions)
- Stable internet connection required
${context.technicalConstraints ? `- ${context.technicalConstraints}` : ''}

### 13.2 Risks & Mitigation

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |

### 13.3 Open Questions
1. [Question 1 requiring stakeholder input]
2. [Question 2 requiring stakeholder input]
3. [Question 3 requiring stakeholder input]

### 13.4 External Dependencies
- [Dependency 1]: [Description and impact if unavailable]
- [Dependency 2]: [Description and impact if unavailable]

### 13.5 Success Criteria
- [Measurable criterion 1]
- [Measurable criterion 2]
- [Measurable criterion 3]

---

## Appendix A: Glossary
- **[Term 1]:** [Definition]
- **[Term 2]:** [Definition]

## Appendix B: References
- [Reference 1]
- [Reference 2]

## Appendix C: Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | ${timestamp} | AI Generated | Initial draft |

---

${context.timeline ? `**Timeline:** ${context.timeline}\n` : ''}
${context.budget ? `**Budget:** ${context.budget}\n` : ''}

**Document Status:** Draft - Requires Review and Approval

---

**Note:** This PRD was generated automatically. Please review, refine, and customize based on your specific requirements and organizational standards.
`;
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  let featureIdea, context, outputFile;

  // Handle interactive mode
  if (options.interactive) {
    const interactive = await interactiveMode();
    featureIdea = interactive.idea;
    context = interactive.context;
    outputFile = interactive.output;
  } else {
    // Get feature idea from file or argument
    if (options.file) {
      if (!fs.existsSync(options.file)) {
        console.error(`${colors.red}Error: File not found: ${options.file}${colors.reset}`);
        process.exit(1);
      }
      featureIdea = fs.readFileSync(options.file, 'utf-8').trim();
    } else if (options.idea) {
      featureIdea = options.idea;
    } else {
      console.error(`${colors.red}Error: Please provide a feature idea using --idea, --file, or --interactive${colors.reset}`);
      console.log(`Run with --help for usage information`);
      process.exit(1);
    }

    context = options.context;
    if (!context.projectType) {
      context.projectType = options.projectType;
    }
    outputFile = options.output;
  }

  // Generate output filename if not provided
  if (!outputFile) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const sanitizedIdea = featureIdea
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50);
    outputFile = `PRD-${sanitizedIdea}-${timestamp}.md`;
  }

  console.log(`\n${colors.bright}${colors.cyan}Generating PRD...${colors.reset}`);
  console.log(`${colors.dim}Feature:${colors.reset} ${featureIdea}`);
  if (Object.keys(context).length > 0) {
    console.log(`${colors.dim}Context:${colors.reset} ${JSON.stringify(context, null, 2)}`);
  }
  console.log(`${colors.dim}Output:${colors.reset} ${outputFile}\n`);

  try {
    // Generate PRD using template (fallback mode)
    // In production, this would call the Base44 function or API
    const prdContent = generatePRDTemplate(featureIdea, context);

    // Write to file
    const outputPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(outputPath, prdContent, 'utf-8');

    console.log(`${colors.green}✓ PRD generated successfully!${colors.reset}`);
    console.log(`${colors.bright}Output file:${colors.reset} ${outputPath}`);
    console.log(`\n${colors.yellow}Note: This is a template-based PRD. For AI-enhanced PRDs, use the Base44 function integration.${colors.reset}`);
    console.log(`\n${colors.dim}Next steps:${colors.reset}`);
    console.log(`  1. Review and customize the generated PRD`);
    console.log(`  2. Add specific technical details`);
    console.log(`  3. Validate with stakeholders`);
    console.log(`  4. Update version and status as needed\n`);

  } catch (error) {
    console.error(`${colors.red}Error generating PRD:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
