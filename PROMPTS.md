# Prompts

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  
**Status:** Active Reference  

---

## Overview

This document contains prompt engineering guidelines, templates, and best practices for working with AI features in the Interact platform. It covers prompts for content generation, user interactions, and developer assistance.

---

## Table of Contents

1. [Prompt Engineering Principles](#prompt-engineering-principles)
2. [Content Generation Prompts](#content-generation-prompts)
3. [User Assistance Prompts](#user-assistance-prompts)
4. [Development Prompts](#development-prompts)
5. [Analytics Prompts](#analytics-prompts)
6. [Prompt Templates](#prompt-templates)

---

## Prompt Engineering Principles

### Best Practices

1. **Be Specific:** Provide clear, detailed instructions
2. **Give Context:** Include relevant background information
3. **Define Format:** Specify desired output format
4. **Use Examples:** Show examples of desired output
5. **Iterate:** Refine prompts based on results
6. **Test Variations:** Try different phrasings

### Prompt Structure

```
[ROLE] You are a [specific role]
[CONTEXT] Given [context information]
[TASK] Your task is to [specific task]
[FORMAT] Provide output as [format specification]
[CONSTRAINTS] Ensure [constraints and requirements]
[EXAMPLES] For example: [examples]
```

---

## Content Generation Prompts

### Activity Ideas

**Purpose:** Generate engaging activity ideas for teams

**Prompt Template:**
```
You are an expert employee engagement facilitator. Generate 5 creative team-building activity ideas with the following criteria:

Team Size: {teamSize} people
Budget: ${budget}
Duration: {duration} minutes
Category: {category}
Work Setting: {workSetting} (remote/hybrid/in-office)

For each activity, provide:
1. Title (catchy and engaging)
2. Description (2-3 sentences)
3. Materials needed
4. Estimated cost
5. Engagement level (Low/Medium/High)
6. Why it works (1-2 sentences)

Format as JSON array.
```

### Quiz Questions

**Purpose:** Generate learning assessment questions

**Prompt Template:**
```
Create {count} multiple-choice quiz questions about {topic}.

Requirements:
- Difficulty: {difficulty} (beginner/intermediate/advanced)
- Question style: {style} (factual/scenario-based/application)
- Include 4 options per question
- Mark the correct answer
- Provide brief explanation for correct answer

Format as JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "..."
    }
  ]
}
```

### Email Templates

**Purpose:** Generate communication templates

**Prompt Template:**
```
Write a professional email template for {purpose}.

Context:
- Sender: {senderRole}
- Recipients: {recipientRole}
- Tone: {tone} (formal/friendly/casual)
- Length: {length} (brief/moderate/detailed)

Include:
- Subject line
- Greeting
- Body paragraphs
- Call to action
- Closing

Use placeholders like {{activityName}} for customization.
```

---

## User Assistance Prompts

### Activity Planning Assistant

**Purpose:** Help users plan activities interactively

**Prompt:**
```
You are Interact's Activity Planning Assistant. Help the user plan an engaging team activity.

User Input: {userInput}
Team Context: {teamInfo}

Guide the user through:
1. Activity type preference
2. Budget and resources
3. Timing and duration
4. Expected outcomes

Ask clarifying questions one at a time.
Be friendly, encouraging, and specific.
Suggest relevant activities from our catalog when appropriate.
```

### Engagement Coach

**Purpose:** Provide personalized engagement advice

**Prompt:**
```
You are an Engagement Coach analyzing a user's engagement data.

User Data:
- Engagement Score: {score}/100
- Recent Activities: {recentActivities}
- Streak: {streak} days
- Team: {team}
- Role: {role}

Provide:
1. Assessment of current engagement (2-3 sentences)
2. Specific recommendations (3-5 actionable items)
3. Suggested next activities (3 personalized suggestions)
4. Motivational message

Be supportive, specific, and action-oriented.
```

### Skill Gap Advisor

**Purpose:** Advise on skill development

**Prompt:**
```
You are a Career Development Advisor analyzing skill gaps.

Current Profile:
- Role: {currentRole}
- Skills: {currentSkills}
- Experience: {experienceYears} years

Target:
- Desired Role: {targetRole}
- Required Skills: {requiredSkills}

Analyze:
1. Skill gaps (specific skills needed)
2. Priority order (most important first)
3. Learning path (recommended courses/activities)
4. Timeline (realistic timeframe)
5. Quick wins (skills easiest to develop)

Format as structured recommendation.
```

---

## Development Prompts

### Code Generation

**Purpose:** Generate React components

**Prompt:**
```
Generate a React functional component for {componentName}.

Requirements:
- Use React 18 with hooks
- TypeScript (if available) or JSX with JSDoc
- TailwindCSS for styling
- Props: {props}
- Behavior: {behavior}
- Accessibility: WCAG AA compliant

Include:
- Component implementation
- PropTypes validation
- JSDoc documentation
- Usage example

Follow patterns from src/components/
```

### Test Generation

**Purpose:** Generate test cases

**Prompt:**
```
Generate unit tests for {componentOrFunction}.

Code to test:
{code}

Requirements:
- Use Vitest and React Testing Library
- Test user interactions, not implementation
- Cover happy path and edge cases
- Include accessibility tests
- Achieve 80%+ coverage

Generate:
1. Setup and mocks
2. Test cases with descriptions
3. Assertions
4. Cleanup

Follow AAA pattern (Arrange, Act, Assert).
```

### Documentation

**Purpose:** Generate component documentation

**Prompt:**
```
Generate documentation for {componentName}.

Component:
{componentCode}

Include:
- Description and purpose
- Props table with types and descriptions
- Usage examples (3+ scenarios)
- Accessibility features
- Related components
- Notes and warnings

Format as Markdown.
Follow style from existing docs.
```

---

## Analytics Prompts

### Trend Analysis

**Purpose:** Analyze engagement trends

**Prompt:**
```
Analyze the following engagement data and provide insights.

Data:
{timeSeriesData}

Analyze:
1. Overall trend (increasing/decreasing/stable)
2. Notable patterns or anomalies
3. Comparison to previous period
4. Potential causes
5. Recommendations for improvement

Provide:
- Executive summary (2-3 sentences)
- Key findings (3-5 bullet points)
- Detailed analysis (2-3 paragraphs)
- Actionable recommendations (3-5 items)

Be data-driven and specific.
```

### Report Generation

**Purpose:** Generate formatted reports

**Prompt:**
```
Generate a {reportType} report for {period}.

Data:
{reportData}

Structure:
1. Executive Summary
2. Key Metrics (with visualizations)
3. Trends and Patterns
4. Department/Team Breakdown
5. Top Performers
6. Areas for Improvement
7. Recommendations

Format as professional business report.
Include data visualizations descriptions.
Use clear headings and bullet points.
```

---

## Prompt Templates

### Template 1: Activity Recommendation

```python
def activity_recommendation_prompt(user_profile, constraints):
    return f"""
    Recommend 5 activities for this user:
    
    Profile:
    - Interests: {user_profile['interests']}
    - Past Activities: {user_profile['past_activities']}
    - Engagement Score: {user_profile['engagement_score']}
    - Team: {user_profile['team']}
    
    Constraints:
    - Available Time: {constraints['time']}
    - Budget: ${constraints['budget']}
    - Category: {constraints['category'] or 'any'}
    
    Provide recommendations with:
    1. Title
    2. Match Score (0-100)
    3. Reason for recommendation
    4. Expected engagement boost
    
    Prioritize activities the user hasn't tried.
    """
```

### Template 2: Content Enrichment

```python
def content_enrichment_prompt(content, enhancement_type):
    return f"""
    Enhance this {content['type']} content:
    
    Original:
    {content['text']}
    
    Enhancement Type: {enhancement_type}
    (options: expand, summarize, simplify, formalize, add_examples)
    
    Requirements:
    - Maintain original meaning
    - Preserve key information
    - Match target audience: {content['audience']}
    - Tone: {content['tone']}
    
    Provide enhanced version only, no explanations.
    """
```

### Template 3: Personalized Message

```python
def personalized_message_prompt(user, message_type, context):
    return f"""
    Compose a personalized {message_type} message:
    
    Recipient:
    - Name: {user['name']}
    - Role: {user['role']}
    - Recent Achievement: {user['recent_achievement']}
    - Engagement Level: {user['engagement_level']}
    
    Context:
    {context}
    
    Message should:
    - Be genuine and specific
    - Reference their recent activity
    - Encourage continued engagement
    - Include relevant next steps
    - Be 2-3 sentences
    
    Use friendly, professional tone.
    """
```

---

## Advanced Techniques

### Chain-of-Thought Prompting

**When to Use:** Complex reasoning tasks

**Pattern:**
```
Let's solve this step by step:

Step 1: Understand the user's current state
{analysis}

Step 2: Identify gaps or opportunities
{identification}

Step 3: Generate potential solutions
{solutions}

Step 4: Evaluate and rank solutions
{evaluation}

Step 5: Select best recommendation
{recommendation}

Final Answer: {final_answer}
```

### Few-Shot Learning

**When to Use:** Specific format or style needed

**Pattern:**
```
Generate content following these examples:

Example 1:
Input: {input1}
Output: {output1}

Example 2:
Input: {input2}
Output: {output2}

Now generate for:
Input: {new_input}
Output: [AI generates here]
```

### Role-Playing

**When to Use:** Domain expertise needed

**Pattern:**
```
You are a {expert_role} with {years} years of experience in {domain}.

You have expertise in:
- {skill1}
- {skill2}
- {skill3}

Given this background, {task_description}

Think like an expert would and provide detailed, professional advice.
```

---

## Prompt Optimization Tips

### Improve Response Quality

1. **Add Constraints:** Specify format, length, style
2. **Provide Examples:** Show desired output style
3. **Use Delimiters:** Separate sections clearly
4. **Specify Audience:** Define who will use the output
5. **Include Context:** Provide relevant background

### Reduce Hallucinations

1. **Request Citations:** Ask for source references
2. **Limit Scope:** Narrow the topic
3. **Specify Uncertainty:** Allow "I don't know" responses
4. **Verify Facts:** Cross-check generated content
5. **Use Temperature:** Lower temperature for factual content

### Handle Edge Cases

1. **Define Boundaries:** Specify what NOT to do
2. **Graceful Degradation:** Handle missing data
3. **Validation:** Check output format and content
4. **Fallbacks:** Have default responses ready
5. **Error Messages:** Provide helpful feedback

---

## Testing Prompts

### Evaluation Criteria

1. **Accuracy:** Is the output correct?
2. **Relevance:** Does it address the request?
3. **Completeness:** Is all required information included?
4. **Format:** Is the format correct?
5. **Tone:** Is the tone appropriate?
6. **Creativity:** Is it engaging and novel?

### A/B Testing

```javascript
// Test two prompt variations
const promptA = "Generate 5 activity ideas...";
const promptB = "As an expert facilitator, create 5 innovative activity ideas...";

// Run with sample data
const resultsA = await runPrompt(promptA, testData);
const resultsB = await runPrompt(promptB, testData);

// Compare metrics
compareResults(resultsA, resultsB, [
  'relevance_score',
  'creativity_score',
  'completeness_score'
]);
```

---

## Integration Examples

### Frontend Integration

```javascript
// Example: Activity Idea Generator
import { generateContent } from '@/lib/ai';

async function generateActivityIdeas(criteria) {
  const prompt = `
    Generate 3 activity ideas for:
    Team Size: ${criteria.teamSize}
    Budget: $${criteria.budget}
    Category: ${criteria.category}
    
    Return as JSON array with title, description, cost, and points.
  `;
  
  const response = await generateContent(prompt);
  return JSON.parse(response);
}
```

### Backend Integration

```typescript
// Example: Base44 Function
export async function aiAssistant(request: Request): Promise<Response> {
  const { userId, query } = await request.json();
  
  const userContext = await getUserContext(userId);
  const prompt = buildPrompt(query, userContext);
  
  const response = await callAI(prompt);
  
  return new Response(JSON.stringify({ answer: response }));
}
```

---

## Related Documentation

- [MCP-SERVER.md](./MCP-SERVER.md) - MCP server integration
- [AGENTS.md](./AGENTS.md) - AI agents documentation
- [TOOLS.md](./TOOLS.md) - Available tools
- [SCHEMAS.md](./SCHEMAS.md) - Data schemas
- [ALGORITHMS.md](./ALGORITHMS.md) - AI algorithms

---

**Document Owner:** AI/ML Team  
**Last Updated:** January 14, 2026  
**Next Review:** April 2026

---

**End of Prompts Documentation**
