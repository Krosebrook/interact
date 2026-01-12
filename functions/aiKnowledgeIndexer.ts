import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, content, title } = await req.json();

    // Use AI to analyze and categorize the document
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this knowledge base document and extract metadata:

Title: ${title}
Content: ${content}

Provide a JSON response with:
1. summary (2-3 sentence summary)
2. category (one of: onboarding, technical, hr_policy, product, process, best_practice, tutorial, reference)
3. tags (array of 5-8 relevant tags)
4. target_roles (array of roles who would benefit: admin, facilitator, participant, all)
5. difficulty_level (beginner, intermediate, or advanced)
6. search_keywords (array of 10-15 keywords for search)
7. key_topics (array of main topics covered)`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          category: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          target_roles: { type: "array", items: { type: "string" } },
          difficulty_level: { type: "string" },
          search_keywords: { type: "array", items: { type: "string" } },
          key_topics: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Find related documents
    const allDocs = await base44.asServiceRole.entities.KnowledgeBase.filter({ is_published: true });
    const relatedDocs = allDocs
      .filter(doc => doc.id !== document_id)
      .map(doc => {
        const tagOverlap = analysis.tags.filter(tag => 
          doc.tags?.includes(tag) || doc.search_keywords?.includes(tag)
        ).length;
        return { id: doc.id, score: tagOverlap };
      })
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(doc => doc.id);

    // Update the document with AI metadata
    await base44.asServiceRole.entities.KnowledgeBase.update(document_id, {
      summary: analysis.summary,
      category: analysis.category,
      tags: analysis.tags,
      target_roles: analysis.target_roles,
      difficulty_level: analysis.difficulty_level,
      search_keywords: analysis.search_keywords,
      related_docs: relatedDocs,
      last_updated: new Date().toISOString()
    });

    return Response.json({
      success: true,
      metadata: analysis,
      related_count: relatedDocs.length
    });

  } catch (error) {
    console.error('Indexing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});