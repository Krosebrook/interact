# GitHub Copilot Agent Prompts

This directory contains context-engineered prompts for GitHub Copilot agents to handle specific development tasks autonomously.

## Available Prompts

### 1. Security & Testing Foundation
**File:** `agent-security-testing.md`  
**Purpose:** Fix security vulnerabilities and establish testing infrastructure  
**Timeline:** Q1 2025 (Weeks 1-4)  
**Scope:** Security fixes + Vitest setup + 30+ tests

### 2. TypeScript Migration
**File:** `agent-typescript-migration.md`  
**Purpose:** Migrate from JavaScript to TypeScript  
**Timeline:** Q2-Q3 2025 (16 weeks)  
**Scope:** Phase 1 - Utilities, hooks, and type definitions

### 3. PWA Implementation
**File:** `agent-pwa-implementation.md`  
**Purpose:** Transform into a Progressive Web App  
**Timeline:** Q2 2025 (Weeks 14-18)  
**Scope:** Service worker, offline mode, mobile optimization

### 4. Component Documentation
**File:** `agent-storybook-setup.md`  
**Purpose:** Setup Storybook for component documentation  
**Timeline:** Q1 2025 (Weeks 3-6)  
**Scope:** Storybook config + 30+ component stories

### 5. AI Recommendation Engine
**File:** `agent-ai-recommendations.md`  
**Purpose:** Build AI-powered activity recommendation system  
**Timeline:** Q2 2025 (Weeks 9-13)  
**Scope:** OpenAI/Claude/Gemini integration + personalization

## How to Use

### Using GitHub Copilot Agent Mode

1. **Open the prompt file** you want to use
2. **Copy the entire content**
3. **In VS Code**, open the command palette (Cmd/Ctrl+Shift+P)
4. **Select** "GitHub Copilot: Open Chat"
5. **Switch to Agent Mode** (click the agent icon or use @workspace)
6. **Paste the prompt** and press Enter
7. **Let the agent work** autonomously on the task
8. **Review the changes** and provide feedback if needed

### Tips for Success

- **Start with Security & Testing** (agent-security-testing.md) - Foundation work
- **Verify tests pass** after each agent completes work
- **Review code changes** carefully before committing
- **Iterate on prompts** based on results and feedback
- **Document learnings** to improve future prompts

## Prompt Engineering Principles

These prompts follow the **SSSS** principle:

1. **Single:** One clear task per prompt
2. **Specific:** Detailed instructions and success criteria
3. **Short:** Concise but complete
4. **Surround:** Rich context from documentation

## Related Documentation

- **[RECOMMENDATIONS.md](../../RECOMMENDATIONS.md)** - Full context and best practices
- **[FEATURE_ROADMAP.md](../../FEATURE_ROADMAP.md)** - 18-month feature roadmap
- **[CODEBASE_AUDIT.md](../../CODEBASE_AUDIT.md)** - Technical audit findings
- **[.github/copilot-instructions.md](../copilot-instructions.md)** - Workspace-level instructions

## Customization

Feel free to:
- Modify prompts based on your specific needs
- Add new prompts for additional tasks
- Share successful prompts with the team
- Create a prompt library for common patterns

## Questions?

Refer to the main [RECOMMENDATIONS.md](../../RECOMMENDATIONS.md) document for:
- Detailed repository recommendations
- Best practices research
- Implementation roadmap
- Success metrics

---

**Last Updated:** December 29, 2024  
**Maintained by:** Krosebrook Development Team
