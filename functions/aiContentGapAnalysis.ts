import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users and their roles
    const users = await base44.asServiceRole.entities.User.list();
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    
    // Get all knowledge base content
    const allDocs = await base44.asServiceRole.entities.KnowledgeBase.filter({ is_published: true });
    
    // Get search queries (from analytics)
    const searchEvents = await base44.asServiceRole.entities.AnalyticsEvent.filter({
      event_type: 'search_performed'
    }, '-created_date', 100);

    // Get failed searches or low-result searches
    const failedSearches = searchEvents.filter(e => 
      e.event_data?.results_count === 0 || e.event_data?.results_count < 3
    );

    // Analyze with AI
    const gapAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this organization's knowledge base and identify content gaps:

Company Size: ${users.length} users
Role Distribution:
- Admins: ${users.filter(u => u.role === 'admin').length}
- Facilitators: ${profiles.filter(p => p.user_type === 'facilitator').length}
- Participants: ${profiles.filter(p => p.user_type === 'participant').length}

Top Departments: ${[...new Set(profiles.map(p => p.department).filter(Boolean))].slice(0, 5).join(', ')}

Existing Content Coverage:
${Object.entries(allDocs.reduce((acc, doc) => {
  acc[doc.category] = (acc[doc.category] || 0) + 1;
  return acc;
}, {})).map(([cat, count]) => `- ${cat}: ${count} documents`).join('\n')}

Failed/Low-Result Searches (last 100):
${failedSearches.slice(0, 20).map(s => `- "${s.event_data?.search_query}"`).join('\n')}

Identify 5-10 critical content gaps and recommend new articles to create. Consider:
1. Missing categories or under-covered topics
2. Common failed searches
3. Role-specific needs not being met
4. Emerging topics from user activity

For each gap, provide:
- gap_title
- description (why this gap exists)
- priority (critical/high/medium/low)
- suggested_topics (array of specific article titles to create)
- target_audience (array of roles who need this)
- evidence (data supporting this gap)`,
      response_json_schema: {
        type: "object",
        properties: {
          content_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap_title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string" },
                suggested_topics: { type: "array", items: { type: "string" } },
                target_audience: { type: "array", items: { type: "string" } },
                evidence: { type: "string" }
              }
            }
          },
          overall_health_score: { type: "number" },
          recommendations: { type: "string" }
        }
      }
    });

    // Create ContentGap records for tracking
    const createdGaps = [];
    for (const gap of gapAnalysis.content_gaps) {
      const created = await base44.asServiceRole.entities.ContentGap.create({
        gap_title: gap.gap_title,
        description: gap.description,
        priority: gap.priority,
        suggested_topics: gap.suggested_topics,
        target_audience: gap.target_audience,
        evidence: gap.evidence,
        status: 'identified'
      });
      createdGaps.push(created);
    }

    return Response.json({
      success: true,
      analysis: gapAnalysis,
      gaps_created: createdGaps.length,
      gaps: createdGaps
    });

  } catch (error) {
    console.error('Gap analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});