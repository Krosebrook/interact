# PRD Generator Tool

A comprehensive Python-based tool for generating professional Product Requirements Documents (PRDs) for the Interact Platform.

## Features

- **13 Required Sections**: Generates all standard PRD sections
- **Multiple Input Methods**: CLI arguments, file input, or interactive mode
- **Context Support**: Add project metadata via JSON
- **Colored Output**: Enhanced terminal UX with color-coded feedback
- **Professional Format**: Follows Interact Platform PRD standards
- **Comprehensive Coverage**: Includes technical architecture, API design, testing strategy, and more

## Installation

No installation required! The script uses Python 3 standard library only.

**Requirements:**
- Python 3.6+
- No external dependencies

## Usage

### Basic Usage

```bash
# Generate PRD from command line
./scripts/generate_prd.py --idea "Add dark mode support" --output DARK_MODE_PRD.md

# Generate PRD from file
echo "Real-time notifications with WebSocket" > feature_idea.txt
./scripts/generate_prd.py --file feature_idea.txt --output NOTIFICATIONS_PRD.md

# Interactive mode
./scripts/generate_prd.py --interactive
```

### With Context

```bash
# JSON string context
./scripts/generate_prd.py \
  --idea "User analytics dashboard" \
  --context '{"priority": "P0", "target_quarter": "Q2 2025", "product_owner": "Jane Doe"}' \
  --output ANALYTICS_PRD.md

# JSON file context
cat > context.json << EOF
{
  "priority": "P1",
  "target_quarter": "Q3 2025",
  "product_owner": "John Smith",
  "engineering_lead": "Alice Johnson",
  "feature_name": "Advanced Reporting System"
}
EOF

./scripts/generate_prd.py \
  --idea "Comprehensive analytics and reporting system" \
  --context context.json \
  --output REPORTING_PRD.md
```

### Interactive Mode

```bash
./scripts/generate_prd.py --interactive

# You'll be prompted for:
# 1. Feature idea (multi-line, press Enter twice when done)
# 2. Optional context (JSON format)
```

## Command Line Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--idea` | `-i` | Feature idea as string | Yes* |
| `--file` | `-f` | Path to file with feature idea | Yes* |
| `--interactive` | | Interactive mode | Yes* |
| `--output` | `-o` | Output file path | No |
| `--context` | `-c` | Additional context (JSON string or file) | No |
| `--help` | `-h` | Show help message | No |

*One of `--idea`, `--file`, or `--interactive` is required.

## Context Parameters

The following context parameters can be provided via JSON:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `priority` | string | Feature priority (P0, P1, P2) | P1 |
| `target_quarter` | string | Target quarter (Q1 2025, etc.) | TBD |
| `product_owner` | string | Product owner name | TBD |
| `engineering_lead` | string | Engineering lead name | TBD |
| `feature_name` | string | Feature display name | New Feature |
| `target_users` | string | Target user group | All platform users |

## Generated PRD Sections

The tool generates a comprehensive PRD with the following sections:

1. **Executive Summary**
   - Feature overview
   - Business value
   - Success criteria
   - Key stakeholders

2. **Problem Statement**
   - Current situation
   - Why this matters
   - Why now

3. **Target Audience / User Personas**
   - Admin/Platform Administrator
   - Manager/Team Lead
   - Employee/End User

4. **Functional Requirements**
   - Core functionality (FR-001 to FR-007)
   - Integration requirements
   - Reporting and analytics

5. **Non-Functional Requirements**
   - Performance (response time, throughput)
   - Scalability (horizontal scaling, data growth)
   - Availability (uptime, disaster recovery)
   - Security (authentication, encryption, validation)
   - Localization (i18n, time zones)
   - Accessibility (WCAG 2.1 AA compliance)

6. **User Stories & Acceptance Criteria**
   - Written in Gherkin format
   - Given-When-Then scenarios
   - Multiple epics with user stories

7. **Technical Architecture Overview**
   - Technology stack (React 18, Vite 6, Base44 SDK)
   - Architecture patterns
   - Data flow
   - Component architecture
   - State management strategy

8. **API Design**
   - 5 RESTful endpoints with examples
   - Request/response formats
   - Authentication details
   - Error response format
   - Common error codes

9. **UI/UX Considerations**
   - Design principles
   - User interface components
   - User flows
   - Responsive design
   - Loading and error states

10. **Security & Compliance**
    - Authentication & authorization
    - Data security (encryption, validation)
    - GDPR requirements
    - SOC 2 Type II requirements
    - HIPAA requirements (if applicable)
    - Security best practices
    - Audit & compliance monitoring

11. **Testing Strategy**
    - Testing pyramid (Unit 60%, Integration 30%, E2E 10%)
    - Unit testing (Vitest + React Testing Library)
    - Integration testing
    - End-to-end testing (Playwright)
    - Performance testing (Lighthouse, K6)
    - Accessibility testing
    - Testing workflow

12. **Deployment & DevOps Plan**
    - 3 environments (Development, Staging, Production)
    - Deployment process (6-step pipeline)
    - Database migrations
    - Monitoring & alerting
    - Rollback procedures
    - Disaster recovery (RPO < 1 hour, RTO < 4 hours)

13. **Assumptions, Risks & Open Questions**
    - 5 key assumptions with validation plans
    - Risk matrix with mitigation strategies
    - 7 open questions with owners and deadlines
    - Dependencies (internal, external, team)

## Examples

### Example 1: Simple Feature

```bash
./scripts/generate_prd.py \
  --idea "Add user profile customization" \
  --output PROFILE_CUSTOMIZATION_PRD.md
```

### Example 2: High Priority Feature

```bash
./scripts/generate_prd.py \
  --idea "Implement SSO authentication with SAML 2.0 support" \
  --context '{
    "priority": "P0",
    "target_quarter": "Q1 2025",
    "product_owner": "Krosebrook",
    "engineering_lead": "Security Team",
    "feature_name": "SSO Authentication"
  }' \
  --output SSO_PRD.md
```

### Example 3: Complex Feature with File Input

```bash
# Create detailed feature description
cat > advanced_gamification.txt << EOF
Advanced Gamification System

Implement a comprehensive gamification engine with:
- Dynamic leaderboards with real-time updates
- Achievement system with 50+ unique badges
- Seasonal challenges and competitions
- Team vs. individual scoring
- Reward redemption marketplace
- Integration with third-party rewards (gift cards, swag)
- Customizable point values and rules
- Admin dashboard for gamification management
EOF

# Create context
cat > context.json << EOF
{
  "priority": "P0",
  "target_quarter": "Q2 2025",
  "product_owner": "Krosebrook",
  "engineering_lead": "Platform Team",
  "feature_name": "Advanced Gamification Engine",
  "target_users": "All employees, managers, and admins"
}
EOF

# Generate PRD
./scripts/generate_prd.py \
  --file advanced_gamification.txt \
  --context context.json \
  --output GAMIFICATION_ENGINE_PRD.md
```

## Output

The script generates a comprehensive PRD in Markdown format with:

- **~45KB file size** (~1,650 lines)
- **Professional formatting** with headers, tables, code blocks
- **Complete technical specifications** ready for development
- **Actionable acceptance criteria** in Gherkin format
- **Security and compliance checklists**

Example output:

```
============================================================
✅ PRD Generated Successfully!
============================================================

📁 File: /path/to/FEATURE_PRD.md
📊 Size: 45,837 bytes (44.8 KB)
📝 Lines: 1649

📋 Document Sections:
  ✓ Executive Summary
  ✓ Problem Statement
  ✓ Target Audience / User Personas (3 personas)
  ✓ Functional Requirements
  ✓ Non-Functional Requirements
  ✓ User Stories & Acceptance Criteria (Gherkin)
  ✓ Technical Architecture Overview
  ✓ API Design (5 endpoints)
  ✓ UI/UX Considerations
  ✓ Security & Compliance (GDPR, SOC 2, HIPAA)
  ✓ Testing Strategy (Vitest, Playwright)
  ✓ Deployment & DevOps Plan (3 environments)
  ✓ Assumptions, Risks & Open Questions

🎯 Next Steps:
  1. Review and customize the generated PRD
  2. Add specific technical details
  3. Share with stakeholders for feedback
  4. Update timeline and resource estimates
  5. Get approval before development starts
```

## Best Practices

1. **Be Specific**: Provide detailed feature descriptions for better PRD generation
2. **Use Context**: Add context parameters to customize the PRD
3. **Review Output**: Always review and customize the generated PRD
4. **Update Sections**: Modify sections specific to your feature
5. **Version Control**: Commit PRDs to git for change tracking

## Troubleshooting

### Error: "Feature idea must be at least 10 characters"
**Solution**: Provide a more detailed feature description (minimum 10 characters).

### Error: "Invalid JSON in context file"
**Solution**: Validate your JSON syntax using a JSON validator.

### Error: "Context file not found"
**Solution**: Verify the file path is correct and the file exists.

### Error: "Permission denied"
**Solution**: Make the script executable: `chmod +x scripts/generate_prd.py`

## Related Documentation

- [Main PRD](../PRD.md) - Example comprehensive PRD
- [Feature Roadmap](../FEATURE_ROADMAP.md) - 18-month feature roadmap
- [Documentation Guidelines](../DOCUMENTATION_GUIDELINES.md) - Documentation standards
- [Development Guide](../DEVELOPMENT.md) - Development setup and guidelines

## Support

For questions or issues with the PRD generator:

1. Check this README for examples
2. Review the existing [PRD.md](../PRD.md) for reference
3. Open an issue in the repository
4. Contact the platform team

## License

Part of the Interact Platform - See [LICENSE](../LICENSE) for details.
