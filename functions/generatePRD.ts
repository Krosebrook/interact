import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `You are an expert technical product manager and senior full-stack developer specializing in creating comprehensive Product Requirements Documents (PRDs).

Your task is to generate a complete, spec-driven PRD that adheres to current best practices in software engineering and technical product management.

You must structure the PRD with the following sections:

1. **Executive Summary**
   - High-level overview of the product/feature
   - Business case and goals

2. **Problem Statement**
   - Clear articulation of the problem being solved
   - Who experiences this problem and why it's critical

3. **Target Audience / User Personas**
   - Define primary user roles
   - Pain points and goals for each persona

4. **Functional Requirements**
   - List of all core features
   - Clearly scoped feature behavior
   - Edge cases where applicable

5. **Non-Functional Requirements**
   - Performance, scalability, uptime targets
   - Localization, accessibility requirements
   - Other quality attributes

6. **User Stories & Acceptance Criteria**
   - Use proper Gherkin-style format: Given / When / Then
   - Cover all personas and use cases
   - Clear, testable acceptance criteria

7. **Technical Architecture Overview**
   - High-level system design
   - Services involved (frontend, backend, APIs, DBs, etc.)
   - Data flow and integration points
   - Consider using React 18, Vite, Base44 SDK context when relevant

8. **API Design** (if relevant)
   - REST or GraphQL endpoint specifications
   - Request/response schemas
   - Authentication/authorization notes
   - Error handling

9. **UI/UX Considerations**
   - Page/component layout descriptions
   - Interaction expectations
   - Mobile responsiveness requirements
   - Accessibility considerations (WCAG AA)

10. **Security & Compliance**
    - Data handling policies
    - Role-based access control
    - Encryption requirements
    - GDPR / SOC2 / HIPAA if relevant

11. **Testing Strategy**
    - Unit, integration, E2E test coverage requirements
    - Tooling and automation plan (Vitest, React Testing Library, Playwright)
    - Performance and security testing

12. **Deployment & DevOps Plan**
    - Environments (dev, staging, prod)
    - CI/CD strategy
    - Rollback plans
    - Monitoring and alerting

13. **Assumptions, Risks & Open Questions**
    - Known unknowns
    - External dependencies
    - Risk mitigation strategies
    - Questions requiring stakeholder input

Generate a comprehensive, production-grade PRD formatted in clear Markdown. Be specific, thorough, and actionable. Include relevant technical details while remaining accessible to both technical and non-technical stakeholders.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      featureIdea,
      context = {},
      model = 'claude-sonnet-4-20250514',
      max_tokens = 8192,
      temperature = 0.8
    } = await req.json();

    if (!featureIdea) {
      return Response.json({ 
        error: 'Missing required field: featureIdea' 
      }, { status: 400 });
    }

    // Build the user prompt
    let userPrompt = `Feature Idea: ${featureIdea}`;
    
    // Add context if provided
    if (context.targetAudience) {
      userPrompt += `\n\nTarget Audience: ${context.targetAudience}`;
    }
    if (context.businessGoals) {
      userPrompt += `\n\nBusiness Goals: ${context.businessGoals}`;
    }
    if (context.technicalConstraints) {
      userPrompt += `\n\nTechnical Constraints: ${context.technicalConstraints}`;
    }
    if (context.timeline) {
      userPrompt += `\n\nTimeline: ${context.timeline}`;
    }
    if (context.budget) {
      userPrompt += `\n\nBudget: ${context.budget}`;
    }
    if (context.existingIntegrations) {
      userPrompt += `\n\nExisting Integrations to Consider: ${context.existingIntegrations}`;
    }

    userPrompt += `\n\nGenerate a complete, production-grade PRD for this feature.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: max_tokens,
      temperature: temperature,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const prdContent = response.content[0].text;

    // Log the generation for analytics
    await base44.createRecord('prd_generations', {
      user_id: user.id,
      feature_idea: featureIdea,
      context: context,
      prd_content: prdContent,
      model_used: model,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      created_at: new Date().toISOString()
    }).catch(err => console.error('Failed to log PRD generation:', err));

    return Response.json({
      success: true,
      prd: prdContent,
      metadata: {
        model: model,
        tokens_used: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating PRD:', error);
    return Response.json({ 
      error: 'Failed to generate PRD',
      details: error.message 
    }, { status: 500 });
  }
});
