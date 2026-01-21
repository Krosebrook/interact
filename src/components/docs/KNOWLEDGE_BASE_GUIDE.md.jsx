# Knowledge Base System - User Guide

## Overview
The Knowledge Base is a comprehensive documentation and information management system with AI-powered search, rich content editing, and advanced organization features.

## Features

### 1. AI-Powered Search
Semantic search using LLM to understand intent and context.

**How It Works:**
1. User enters search query
2. System filters by selected categories/tags
3. AI analyzes query and article content
4. Returns ranked results with reasoning
5. Results ordered by relevance

**Search Tips:**
- Use natural language ("How do I submit expenses?")
- Be specific ("onboarding checklist for engineers")
- Combine with category/tag filters for precision

### 2. Article Management

#### Creating Articles
**Permissions:** Admin and Facilitator roles

**Required Fields:**
- Title (unique, descriptive)
- Summary (shown in search results)
- Content (rich text with formatting)
- Category (from predefined list)

**Optional Fields:**
- Tags (for discoverability)
- Status (draft/published)

#### Editing Articles
- Rich text editor with formatting toolbar
- Image embedding support
- Code block support
- Lists and tables

#### Publishing Workflow
1. Create article as draft
2. Add content and metadata
3. Preview article
4. Set status to "published"
5. Article becomes searchable

### 3. Organization System

#### Categories
Predefined categories for consistent organization:
- Getting Started
- Policies
- Benefits
- Tools & Technology
- Team & Culture
- HR Procedures
- Career Development
- Wellness
- Other

#### Tags
Flexible tagging system:
- User-defined tags
- Multiple tags per article
- Tag-based filtering
- Tag cloud for discovery

### 4. Browse & Discovery

**Browse Tab:**
- Category sidebar with article counts
- Tag cloud for quick filtering
- Combined category + tag filters

**Search Tab:**
- AI-powered semantic search
- Filter by category and tags
- Search reasoning displayed

## Technical Architecture

### Backend Functions

#### `aiKnowledgeSearch`
**Endpoint:** `functions/aiKnowledgeSearch.js`
**Auth:** Authenticated users
**Parameters:**
```json
{
  "query": "search query text",
  "categories": ["Getting Started"],
  "tags": ["onboarding", "new-hire"]
}
```

**Process:**
1. Fetch all published articles
2. Apply category/tag filters
3. If query exists, invoke LLM with context
4. LLM returns ranked article IDs + reasoning
5. Return ordered results

**AI Prompt Structure:**
- Search query
- Article summaries and previews
- Request for relevance ranking
- JSON response with IDs and reasoning

### Frontend Components

#### `KnowledgeBase` (Main Page)
**Location:** `pages/KnowledgeBase.jsx`
**Features:**
- Tabbed interface (Search/Browse/Manage)
- Article viewer with full content
- Category sidebar
- Tag filtering
- Create/Edit/Delete actions (admin only)

#### `KnowledgeBaseSearch`
**Location:** `components/knowledge/KnowledgeBaseSearch.jsx`
**Features:**
- Search input with debouncing
- AI-powered results
- Search reasoning display
- Result cards with metadata

#### `ArticleEditor`
**Location:** `components/knowledge/ArticleEditor.jsx`
**Features:**
- Rich text editor (React Quill)
- Metadata fields
- Tag management
- Draft/Published toggle
- Auto-save capabilities

### Entity Schema

#### KnowledgeBase Entity
```json
{
  "title": "string (required)",
  "content": "string (required)",
  "summary": "string",
  "category": "enum",
  "tags": "array of strings",
  "status": "draft | published",
  "author_email": "string",
  "view_count": "number",
  "helpful_count": "number"
}
```

**Permissions:**
- Read: Published articles only
- Write: All authenticated users
- Update: Author or Admin
- Delete: Admin only

## Usage Examples

### Creating an Article
```javascript
await base44.entities.KnowledgeBase.create({
  title: "How to Submit Expenses",
  summary: "Step-by-step guide for expense reimbursement",
  content: "<p>Follow these steps...</p>",
  category: "HR Procedures",
  tags: ["expenses", "finance", "reimbursement"],
  status: "published"
});
```

### Searching Articles
```javascript
const results = await base44.functions.invoke('aiKnowledgeSearch', {
  query: "expense policy",
  categories: ["HR Procedures"],
  tags: ["finance"]
});
// Returns: { results: [...], reasoning: "..." }
```

### Updating Article
```javascript
await base44.entities.KnowledgeBase.update(articleId, {
  content: updatedContent,
  tags: [...existingTags, "new-tag"]
});
```

## Best Practices

### Article Writing
1. **Clear Titles**: Use descriptive, searchable titles
2. **Summaries**: Write concise 1-2 sentence summaries
3. **Structure**: Use headings, lists, and formatting
4. **Keywords**: Include relevant terms naturally
5. **Links**: Reference related articles

### Categorization
- Choose the most specific category
- Use tags for cross-cutting topics
- Limit to 3-5 tags per article
- Use consistent tag naming

### Search Optimization
- Include common search terms in content
- Use synonyms and variations
- Add FAQs at the end of articles
- Keep content up-to-date

## Performance Considerations

- **Search**: 500 article limit per query
- **AI calls**: Rate limited (avoid rapid successive searches)
- **Content**: No character limit, but shorter is better for AI
- **Images**: Embed via URL (not base64)

## Troubleshooting

### Search Returns No Results
- Check article publication status
- Verify category/tag filters aren't too restrictive
- Try broader search terms
- Ensure articles exist in selected categories

### AI Search Fails
- Fallback to keyword search
- Check LLM integration status
- Review function logs
- Verify API keys

### Editor Not Saving
- Check user permissions
- Verify required fields filled
- Review network errors
- Clear browser cache

### Tags Not Appearing
- Ensure tags array is saved
- Check for duplicate tags
- Verify tag string format
- Re-save article

## Security & Privacy

- Only published articles visible to users
- Draft articles visible to author and admins
- No PII in article content
- Audit logs track all changes
- Search queries not logged

## Future Enhancements
- Article version history
- User comments and feedback
- "Helpful" voting system
- Related articles suggestions
- Multilingual support
- Export to PDF
- Analytics (views, searches)