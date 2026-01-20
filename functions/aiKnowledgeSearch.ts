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

    // AI-powered semantic search
    const articlesContext = filtered.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary || '',
      content: a.content?.substring(0, 500) || '',
      category: a.category,
      tags: a.tags
    }));

    const prompt = `You are a knowledge base search assistant. Given this search query and available articles, identify and rank the most relevant articles.

Search Query: "${query}"

Available Articles:
${articlesContext.map((a, idx) => `
${idx + 1}. ${a.title}
Category: ${a.category}
Summary: ${a.summary}
Preview: ${a.content}
`).join('\n')}

Return the IDs of the most relevant articles in order of relevance (most relevant first).
Include only articles that are actually relevant to the query.

Respond with JSON: { "article_ids": ["id1", "id2", ...], "reasoning": "explanation" }`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
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