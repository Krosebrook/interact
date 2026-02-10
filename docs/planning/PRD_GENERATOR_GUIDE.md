# PRD Generator Usage Guide

**Project:** Interact - Employee Engagement Platform  
**Last Updated:** January 16, 2026  
**Status:** Production Ready  

---

## Overview

The PRD Generator is a Python-based CLI tool that creates comprehensive Product Requirements Documents following industry best practices. It generates professional, spec-driven PRDs with all 13 required sections.

## Quick Start

### npm Scripts (Recommended)

```bash
# Generate PRD with idea and context
npm run prd:generate -- --idea "Add dark mode" --output DARK_MODE_PRD.md

# Interactive mode (prompts for input)
npm run prd:interactive
```

### Direct Python Execution

```bash
# Simple usage
python3 scripts/generate_prd.py --idea "Real-time notifications"

# With context
python3 scripts/generate_prd.py \
  --idea "AI chatbot integration" \
  --context '{"timeline":"Q2 2026","priority":"P0"}' \
  --output AI_CHATBOT_PRD.md
```

## Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--idea` | `-i` | Feature idea as string | Required* |
| `--file` | `-f` | Path to file with feature idea | Required* |
| `--interactive` | N/A | Interactive mode | N/A |
| `--output` | `-o` | Output file path | `PRODUCT_REQUIREMENTS_DOCUMENT.md` |
| `--context` | `-c` | Additional context (JSON) | `{}` |

\* Either `--idea`, `--file`, or `--interactive` is required

## Context Parameters

```json
{
  "timeline": "Q2 2026",
  "targetAudience": "Team Managers and HR professionals",
  "businessGoals": "Increase engagement by 40%",
  "technicalConstraints": "Must integrate with existing React stack",
  "budget": "$50,000",
  "existingIntegrations": "Slack, Microsoft Teams, Google Calendar",
  "priority": "P0"
}
```

## Generated PRD Sections

1. **Executive Summary** - Feature overview and business value
2. **Problem Statement** - Current situation and pain points
3. **Target Audience / User Personas** - 3 detailed personas
4. **Functional Requirements** - 7 core features with acceptance criteria
5. **Non-Functional Requirements** - Performance, security, accessibility
6. **User Stories & Acceptance Criteria** - Gherkin format
7. **Technical Architecture Overview** - React 18, Vite, Base44 SDK
8. **API Design** - 5 REST endpoints with schemas
9. **UI/UX Considerations** - Layout, components, responsive design
10. **Security & Compliance** - GDPR, SOC 2, HIPAA
11. **Testing Strategy** - Vitest, Playwright, coverage targets
12. **Deployment & DevOps Plan** - 3 environments, CI/CD pipeline
13. **Assumptions, Risks & Open Questions** - Risk matrix, dependencies

## Usage Examples

### Example 1: Simple Feature

```bash
python3 scripts/generate_prd.py \
  --idea "Add dark mode to dashboard" \
  --output PRD-DARK-MODE.md
```

### Example 2: With Context

```bash
npm run prd:generate -- \
  --idea "Real-time notification system" \
  --context '{"timeline":"Q2 2026","priority":"P0"}' \
  --output PRD-NOTIFICATIONS.md
```

### Example 3: Interactive Mode

```bash
npm run prd:interactive
```

### Example 4: From File

```bash
echo "AI-Powered Activity Recommendations" > feature.txt
python3 scripts/generate_prd.py --file feature.txt
```

## Output

- **Default name:** `PRODUCT_REQUIREMENTS_DOCUMENT.md`
- **Size:** ~45KB (1,650 lines)
- **Format:** Professional Markdown with all 13 sections

## Best Practices

### Writing Feature Ideas

**Good:**
```
AI-Powered Activity Recommendations

Implement ML-based recommendation engine that analyzes user engagement
history to suggest personalized activities. Target 35% increase in
participation within 90 days.
```

### Providing Context

```json
{
  "timeline": "Q2 2026 (April-June)",
  "targetAudience": "Primary: Team Managers (500+ users)",
  "businessGoals": "35% participation increase, 40% time reduction",
  "priority": "P0 (Critical for Q2 OKRs)"
}
```

## Troubleshooting

**Issue:** `FileNotFoundError`  
**Solution:** Use full path or check file exists

**Issue:** `JSONDecodeError`  
**Solution:** Validate JSON with `python3 -m json.tool`

**Issue:** Permission denied  
**Solution:** `chmod +x scripts/generate_prd.py`

## Related Documentation

- [PRD.md](./PRD.md) - Main platform PRD
- [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) - Feature roadmap
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

---

**Document Owner:** Product Team  
**Last Review:** January 16, 2026
