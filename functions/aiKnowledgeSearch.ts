import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, max_results = 10 } = await req.json();

    // Get user context
    const profile = await base44.entities.UserProfile.filter({ user_email: user.email });
    const userRole = user.role === 'admin' ? 'admin' : user.user_type || 'participant';

    // Use AI to understand the query and extract search intent
    const searchIntent = await base44.integrations.Core.InvokeLLM({
      prompt: `User query: "${query}"
User role: ${userRole}
User department: ${profile[0]?.department || 'unknown'}

Analyze this search query and extract:
1. search_keywords (array of relevant keywords to search for)
2. category_hints (array of likely categories)
3. intent (what the user is trying to accomplish)
4. difficulty_preference (beginner/intermediate/advanced based on query complexity)`,
      response_json_schema: {
        type: "object",
        properties: {
          search_keywords: { type: "array", items: { type: "string" } },
          category_hints: { type: "array", items: { type: "string" } },
          intent: { type: "string" },
          difficulty_preference: { type: "string" }
        }
      }
    });

    // Get all published documents
    const allDocs = await base44.entities.KnowledgeBase.filter({ is_published: true });

    // Score and rank documents
    const scoredDocs = allDocs.map(doc => {
      let score = 0;

      // Keyword matching
      searchIntent.search_keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (doc.title?.toLowerCase().includes(keywordLower)) score += 5;
        if (doc.summary?.toLowerCase().includes(keywordLower)) score += 3;
        if (doc.search_keywords?.some(k => k.toLowerCase().includes(keywordLower))) score += 2;
        if (doc.tags?.some(t => t.toLowerCase().includes(keywordLower))) score += 2;
      });

      // Category matching
      if (searchIntent.category_hints.includes(doc.category)) score += 3;

      // Role relevance
      if (doc.target_roles?.includes(userRole) || doc.target_roles?.includes('all')) score += 2;

      // Difficulty matching
      if (doc.difficulty_level === searchIntent.difficulty_preference) score += 1;

      // Popularity boost
      score += Math.min(doc.view_count * 0.1, 5);
      score += Math.min(doc.helpful_count * 0.2, 5);

      return { ...doc, relevance_score: score };
    });

    // Sort by relevance and return top results
    const results = scoredDocs
      .filter(doc => doc.relevance_score > 0)
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, max_results);

    return Response.json({
      success: true,
      query,
      intent: searchIntent.intent,
      results,
      total_found: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});