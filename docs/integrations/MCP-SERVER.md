# MCP Server Documentation

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  
**Status:** Planned Feature  

---

## Overview

This document describes the Model Context Protocol (MCP) server implementation for Interact. MCP servers enable AI agents and Large Language Models (LLMs) to interact with the Interact platform programmatically, providing context-aware assistance and automation capabilities.

**Current Status:** Not yet implemented. Planned for Q2 2026 as part of AI infrastructure enhancement.

---

## Table of Contents

1. [What is MCP?](#what-is-mcp)
2. [Use Cases](#use-cases)
3. [Architecture](#architecture)
4. [Available Resources](#available-resources)
5. [Available Tools](#available-tools)
6. [Available Prompts](#available-prompts)
7. [Implementation Plan](#implementation-plan)
8. [Configuration](#configuration)
9. [Security](#security)

---

## What is MCP?

The Model Context Protocol (MCP) is an open protocol developed by Anthropic that standardizes how AI applications provide context to Large Language Models. An MCP server exposes:

- **Resources:** Data and content that LLMs can read
- **Tools:** Functions that LLMs can execute
- **Prompts:** Predefined prompt templates for common tasks

### Why MCP for Interact?

1. **Standardization:** Works with any MCP-compatible client (Claude Desktop, IDEs, custom tools)
2. **Context-Aware AI:** LLMs can access platform data without copying/pasting
3. **Automation:** AI agents can perform actions on behalf of users
4. **Enhanced Development:** Developers get intelligent code assistance with platform context

---

## Use Cases

### For Developers

- **Code Generation:** Generate components with platform-specific patterns
- **Testing:** Generate test cases based on existing code
- **Documentation:** Auto-generate docs from code
- **Debugging:** AI assistant can query logs and data
- **Refactoring:** Suggest improvements based on codebase patterns

### For Users

- **Activity Planning:** "Help me plan a team-building activity for next week"
- **Analytics Queries:** "Show me engagement trends for the engineering team"
- **Content Creation:** "Generate quiz questions about our company values"
- **Personalization:** "Recommend learning paths for my skill gaps"

### For Administrators

- **System Monitoring:** "Are there any unusual engagement patterns today?"
- **Reporting:** "Generate a monthly engagement report"
- **Configuration:** "Help me set up gamification rules for the marketing team"
- **User Management:** "Show me users who haven't logged in this month"

---

## Architecture

### MCP Server Stack

```
┌─────────────────────────────────────┐
│  MCP Client (Claude, IDE, etc.)     │
└────────────┬────────────────────────┘
             │ MCP Protocol
             │ (JSON-RPC 2.0 over stdio)
┌────────────▼────────────────────────┐
│  Interact MCP Server                │
│  ┌─────────────────────────────┐   │
│  │  Resource Providers         │   │
│  │  - Activities               │   │
│  │  - Users                    │   │
│  │  - Analytics                │   │
│  │  - Gamification             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Tool Handlers              │   │
│  │  - CRUD Operations          │   │
│  │  - Query Execution          │   │
│  │  - AI Generation            │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Prompt Templates           │   │
│  │  - Common Tasks             │   │
│  │  - User Workflows           │   │
│  └─────────────────────────────┘   │
└────────────┬────────────────────────┘
             │ Base44 SDK
┌────────────▼────────────────────────┐
│  Interact Backend (Base44)          │
│  - Database                         │
│  - Authentication                   │
│  - Business Logic                   │
└─────────────────────────────────────┘
```

### Technology Stack

- **Runtime:** Node.js 18+ or Deno
- **Protocol:** MCP SDK (@anthropic-ai/sdk)
- **Transport:** stdio (standard input/output)
- **Authentication:** OAuth 2.0 with token validation
- **Authorization:** RBAC based on user context

---

## Available Resources

Resources provide read-only access to platform data.

### 1. Activities Resource

**URI:** `interact://activities`

**Description:** Access to platform activities

**Methods:**
- `list()` - List all activities
- `get(id)` - Get specific activity details
- `search(query)` - Search activities by criteria

**Example Response:**
```json
{
  "uri": "interact://activities/123",
  "mimeType": "application/json",
  "text": "{\"id\":123,\"title\":\"Team Lunch\",\"points\":50,...}"
}
```

### 2. Users Resource

**URI:** `interact://users`

**Description:** Access to user profiles and engagement data

**Methods:**
- `list()` - List users (with permission checks)
- `get(id)` - Get user profile
- `getEngagement(id)` - Get engagement metrics

### 3. Analytics Resource

**URI:** `interact://analytics`

**Description:** Access to aggregated analytics and reports

**Methods:**
- `getEngagementTrends(period)` - Engagement over time
- `getActivityMetrics()` - Activity participation stats
- `getLeaderboard(type)` - Current leaderboard data

### 4. Gamification Resource

**URI:** `interact://gamification`

**Description:** Access to gamification configuration and user progress

**Methods:**
- `getBadges()` - Available badges
- `getUserProgress(userId)` - User's achievements
- `getChallenges()` - Active challenges

### 5. Learning Resource

**URI:** `interact://learning`

**Description:** Access to learning paths and content

**Methods:**
- `getPaths()` - Available learning paths
- `getUserProgress(userId)` - User's learning progress
- `getRecommendations(userId)` - Personalized recommendations

---

## Available Tools

Tools allow LLMs to perform actions on the platform.

### 1. Create Activity Tool

**Name:** `create_activity`

**Description:** Create a new activity

**Parameters:**
```typescript
{
  title: string;
  description: string;
  category: 'team_building' | 'wellness' | 'learning' | 'social';
  points: number;
  startDate: string;
  endDate?: string;
  capacity?: number;
  location?: string;
  isVirtual: boolean;
}
```

**Returns:** Activity ID and success status

### 2. Query Analytics Tool

**Name:** `query_analytics`

**Description:** Run custom analytics queries

**Parameters:**
```typescript
{
  metric: 'engagement' | 'participation' | 'points';
  groupBy: 'user' | 'team' | 'department' | 'time';
  period: 'day' | 'week' | 'month';
  filters?: object;
}
```

**Returns:** Query results as JSON

### 3. Generate Content Tool

**Name:** `generate_content`

**Description:** AI-powered content generation

**Parameters:**
```typescript
{
  type: 'activity_idea' | 'quiz_questions' | 'email_template';
  context: object;
  style?: string;
  length?: 'short' | 'medium' | 'long';
}
```

**Returns:** Generated content

### 4. Recommend Activities Tool

**Name:** `recommend_activities`

**Description:** Get personalized activity recommendations

**Parameters:**
```typescript
{
  userId: string;
  count?: number;
  category?: string;
}
```

**Returns:** Array of recommended activities

### 5. Update User Profile Tool

**Name:** `update_user_profile`

**Description:** Update user profile information

**Parameters:**
```typescript
{
  userId: string;
  updates: {
    bio?: string;
    interests?: string[];
    preferences?: object;
  }
}
```

**Returns:** Success status

---

## Available Prompts

Predefined prompt templates for common tasks.

### 1. Plan Activity Prompt

**Name:** `plan_activity`

**Description:** Interactive prompt to help users plan activities

**Arguments:**
- `teamSize` (number) - Number of participants
- `budget` (number) - Budget in USD
- `duration` (number) - Duration in minutes
- `category` (string) - Activity category

**Template:**
```
I'll help you plan a {category} activity for {teamSize} people with a ${budget} budget.

Based on your criteria, here are my recommendations:
{recommendations}

Would you like me to create this activity in Interact?
```

### 2. Analyze Engagement Prompt

**Name:** `analyze_engagement`

**Description:** Analyze engagement trends and provide insights

**Arguments:**
- `period` (string) - Time period to analyze
- `team` (string) - Team or department name

**Template:**
```
Analyzing engagement for {team} over the past {period}:

Key Metrics:
- Average engagement score: {score}
- Trend: {trend}
- Top activities: {activities}

Insights and Recommendations:
{insights}
```

### 3. Generate Report Prompt

**Name:** `generate_report`

**Description:** Generate formatted reports

**Arguments:**
- `reportType` (string) - Type of report
- `period` (string) - Time period

**Template:**
```
# {reportType} Report - {period}

## Executive Summary
{summary}

## Key Findings
{findings}

## Detailed Metrics
{metrics}

## Recommendations
{recommendations}
```

---

## Implementation Plan

### Phase 1: Core MCP Server (Q2 2026, Week 1-2)

**Deliverables:**
- Basic MCP server setup
- Authentication and authorization
- 3 core resources (activities, users, analytics)
- 2 core tools (create_activity, query_analytics)

**Estimated Effort:** 1-2 weeks

### Phase 2: Advanced Features (Q2 2026, Week 3-4)

**Deliverables:**
- Additional resources (gamification, learning)
- Advanced tools (generate_content, recommendations)
- Prompt templates library
- Error handling and logging

**Estimated Effort:** 1-2 weeks

### Phase 3: Integration & Testing (Q2 2026, Week 5-6)

**Deliverables:**
- Client integration examples
- Comprehensive testing
- Documentation and guides
- Performance optimization

**Estimated Effort:** 1-2 weeks

---

## Configuration

### Server Configuration

**File:** `mcp-server.config.json`

```json
{
  "server": {
    "name": "Interact MCP Server",
    "version": "1.0.0",
    "transport": "stdio"
  },
  "authentication": {
    "type": "oauth2",
    "tokenEndpoint": "https://api.interact.app/oauth/token",
    "requiredScopes": ["read:activities", "write:activities", "read:analytics"]
  },
  "resources": {
    "activities": {
      "enabled": true,
      "cacheTime": 300
    },
    "users": {
      "enabled": true,
      "cacheTime": 600,
      "sensitiveFields": ["email", "phone"]
    },
    "analytics": {
      "enabled": true,
      "maxQueryComplexity": 10
    }
  },
  "tools": {
    "create_activity": {
      "enabled": true,
      "requiresApproval": false
    },
    "query_analytics": {
      "enabled": true,
      "maxResultSize": 10000
    }
  },
  "limits": {
    "maxRequestsPerMinute": 60,
    "maxConcurrentRequests": 10
  }
}
```

### Client Configuration

**File:** `claude_desktop_config.json` (for Claude Desktop)

```json
{
  "mcpServers": {
    "interact": {
      "command": "node",
      "args": ["/path/to/interact-mcp-server/index.js"],
      "env": {
        "INTERACT_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

---

## Security

### Authentication

- **Method:** OAuth 2.0 Bearer tokens
- **Token Validation:** Every request validates token with Interact API
- **Token Refresh:** Automatic refresh before expiration
- **Token Revocation:** Support for immediate revocation

### Authorization

- **RBAC:** Actions limited by user role
- **Resource Permissions:** Granular permissions per resource
- **Data Filtering:** Sensitive data filtered based on permissions
- **Audit Logging:** All actions logged with user context

### Data Protection

- **Sensitive Data:** Never expose passwords, API keys, tokens
- **PII Protection:** Mask or exclude PII unless explicitly authorized
- **Rate Limiting:** Prevent abuse with request limits
- **Input Validation:** Validate all tool parameters

### Best Practices

1. **Principle of Least Privilege:** Grant minimum necessary permissions
2. **Token Rotation:** Regularly rotate OAuth tokens
3. **Audit Reviews:** Regularly review access logs
4. **Encryption:** Use TLS for all communications
5. **Secrets Management:** Never hardcode secrets in configuration

---

## Usage Examples

### Example 1: Query Analytics

```typescript
// Client code (pseudocode)
const result = await mcp.callTool('query_analytics', {
  metric: 'engagement',
  groupBy: 'team',
  period: 'month'
});

console.log(result); // Analytics data
```

### Example 2: Create Activity with AI

```typescript
// Using Claude with MCP
User: "Help me create a team lunch activity for next Friday with 20 people"

Claude: (uses MCP tools)
1. Calls recommend_activities to get suggestions
2. Calls create_activity with parameters
3. Returns: "I've created 'Team Lunch' activity for next Friday at 12pm, 
            capacity: 20 people, worth 50 points. Activity ID: 456"
```

### Example 3: Get Engagement Insights

```typescript
// Using prompt template
const insights = await mcp.usePrompt('analyze_engagement', {
  period: 'last_30_days',
  team: 'Engineering'
});

console.log(insights); // Formatted analysis with recommendations
```

---

## Troubleshooting

### Common Issues

**Issue:** MCP server not connecting
- **Solution:** Check that the server process is running and stdio is properly configured

**Issue:** Authentication failures
- **Solution:** Verify OAuth token is valid and has required scopes

**Issue:** Slow responses
- **Solution:** Check cache configuration and adjust cache times

**Issue:** Permission denied errors
- **Solution:** Verify user role has required permissions for the action

---

## Related Documentation

- [AGENTS.md](./AGENTS.md) - AI agents documentation
- [TOOLS.md](./TOOLS.md) - Available tools and utilities
- [PROMPTS.md](./PROMPTS.md) - Prompt engineering guide
- [SCHEMAS.md](./SCHEMAS.md) - Data schemas and types
- [API-CONTRACTS.md](./API-CONTRACTS.md) - API specifications
- [AUTH.md](./AUTH.md) - Authentication and authorization

---

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Anthropic MCP SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [MCP Servers Collection](https://github.com/modelcontextprotocol/servers)

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026  
**Next Review:** Q2 2026 (upon implementation)

---

**End of MCP Server Documentation**
