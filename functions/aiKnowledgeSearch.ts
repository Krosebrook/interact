import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, categories, tags } = await req.json();

    // Get all knowledge base articles
    const allArticles = await base44.entities.KnowledgeBase.list();
    
    // Filter by categories and tags if specified
    let filtered = allArticles.filter(article => article.status === 'published');
    
    if (categories && categories.length > 0) {
      filtered = filtered.filter(a => categories.includes(a.category));
    }
    
    if (tags && tags.length > 0) {
      filtered = filtered.filter(a => 
        a.tags?.some(tag => tags.includes(tag))
      );
    }

    if (!query || query.trim().length === 0) {
      return Response.json({ results: filtered.slice(0, 20) });
    }

    // Limit articles for AI context window
    const articlesForAI = filtered.slice(0, 50);
    
    // AI-powered semantic search
    const articlesContext = articlesForAI.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary || '',
      content: a.content?.substring(0, 400) || '',
      category: a.category,
      tags: a.tags || []
    }));

    const prompt = `You are a knowledge base search assistant for an employee engagement platform. Given this search query and available articles, identify and rank the most relevant articles.

Search Query: "${query}"

Available Articles (${articlesContext.length}):
${articlesContext.map((a, idx) => `
${idx + 1}. "${a.title}"
   Category: ${a.category}
   Tags: ${a.tags.join(', ') || 'none'}
   Summary: ${a.summary}
   Preview: ${a.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
`).join('\n')}

Instructions:
- Rank by semantic relevance to the query
- Consider title, summary, content, and tags
- Return up to 10 most relevant article IDs
- Only include articles truly relevant to the query
- Provide brief reasoning for your selections

Respond with JSON: { "article_ids": ["id1", "id2", ...], "reasoning": "brief explanation of why these articles match" }`;

    let aiResponse;
    try {
      aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            article_ids: {
              type: "array",
              items: { type: "string" }
            },
            reasoning: { type: "string" }
          }
        }
      });
    } catch (error) {
      console.error('AI search failed, falling back to simple search:', error);
      // Fallback: simple title/summary matching
      const lowerQuery = query.toLowerCase();
      const matched = filtered.filter(a => 
        a.title.toLowerCase().includes(lowerQuery) ||
        a.summary?.toLowerCase().includes(lowerQuery) ||
        a.tags?.some(t => t.toLowerCase().includes(lowerQuery))
      );
      return Response.json({
        results: matched.slice(0, 10),
        total: matched.length,
        query,
        reasoning: 'AI search unavailable, showing keyword matches'
      });
    }

    // Return ranked results
    const rankedResults = aiResponse.article_ids
      .map(id => filtered.find(a => a.id === id))
      .filter(a => a !== undefined);

    return Response.json({
      results: rankedResults,
      total: rankedResults.length,
      query,
      reasoning: aiResponse.reasoning
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});