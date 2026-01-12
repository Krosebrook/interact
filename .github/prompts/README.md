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

### 6. Cognitive Prompt Loop
**File:** `agent-cognitive-loop.md`  
**Purpose:** Structured reasoning framework for autonomous agents  
**Timeline:** Continuous (meta-framework)  
**Scope:** 6-phase cognitive loop for task analysis, decision-making, and execution  
**Example:** See `COGNITIVE_LOOP_EXAMPLE.md` for a detailed walkthrough

## How to Use

### Using the Feature-to-PR Template

The **[FEATURE_TO_PR_TEMPLATE.md](../FEATURE_TO_PR_TEMPLATE.md)** is a comprehensive workflow template for GitHub Copilot agents. Use it when:
- Starting any new feature or enhancement
- Working on bug fixes that need structured approach
- Coordinating complex changes across multiple files
- Ensuring consistent PR quality and documentation

**Quick Start:**
1. **Review the template** at `.github/FEATURE_TO_PR_TEMPLATE.md`
2. **Fill in the Mission Statement** (Feature, Outcome, Scope Level)
3. **Follow Step 0: Context Scan** to understand existing patterns
4. **Create a plan in Step 1** before coding
5. **Execute Steps 2-5** methodically
6. **Use the PR description template** when ready to submit

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

- **Use Cognitive Loop** (agent-cognitive-loop.md) - For complex, multi-step tasks requiring structured reasoning
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

### The Cognitive Loop Framework

The **Cognitive Prompt Loop** (agent-cognitive-loop.md) is a meta-framework that provides structured reasoning for complex tasks. It uses a 6-phase approach:

1. **ANALYZE** - Understand intent, completion state, missing inputs, and risk level
2. **DECIDE** - Determine the single highest-leverage next action
3. **INSTRUCTION** - Generate precise, executable instructions with acceptance criteria
4. **EXECUTION** - Execute the instruction and produce concrete artifacts
5. **EVALUATION** - Assess results against criteria (PASS/PARTIAL_PASS/FAIL)
6. **LOOP CONTROL** - Decide whether to continue iterating or exit

**When to use:**
- Complex features requiring multiple steps
- Tasks with unclear scope or high risk
- Situations requiring iterative refinement
- When you need structured problem-solving

**When not to use:**
- Simple, well-defined single-file changes
- Routine bug fixes with known solutions
- Quick documentation updates

## Related Documentation

- **[FEATURE_TO_PR_TEMPLATE.md](../FEATURE_TO_PR_TEMPLATE.md)** - Comprehensive workflow template for feature PRs
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

**Last Updated:** December 30, 2024  
**Maintained by:** Krosebrook Development Team
