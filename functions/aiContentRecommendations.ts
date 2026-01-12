import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();
    const targetEmail = user_email || user.email;

    // Get user context
    const profile = await base44.entities.UserProfile.filter({ user_email: targetEmail });
    const userRole = user.role === 'admin' ? 'admin' : user.user_type || 'participant';
    
    // Get user's recent activity
    const recentEvents = await base44.entities.AnalyticsEvent.filter({ 
      user_email: targetEmail 
    }, '-created_date', 20);

    // Get learning progress
    const learningProgress = await base44.entities.LearningPathProgress.filter({
      user_email: targetEmail,
      status: 'in_progress'
    });

    // Get all published knowledge base docs
    const allDocs = await base44.entities.KnowledgeBase.filter({ is_published: true });

    // Use AI to analyze user context and recommend content
    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this user's profile and recommend relevant knowledge base content:

User Role: ${userRole}
Department: ${profile[0]?.department || 'unknown'}
Job Title: ${profile[0]?.job_title || 'unknown'}
Skill Interests: ${profile[0]?.skill_interests?.join(', ') || 'none specified'}
Recent Activity Types: ${[...new Set(recentEvents.map(e => e.event_type))].join(', ')}
Active Learning Paths: ${learningProgress.length}

Available Documents (${allDocs.length} total):
${allDocs.slice(0, 20).map(doc => `- ${doc.title} (${doc.category}, tags: ${doc.tags?.join(', ')})`).join('\n')}

Recommend 5-8 documents that would be most valuable for this user. For each recommendation, explain WHY it's relevant.

Provide a JSON array with:
- doc_id
- title
- reason (why this is relevant to the user)
- priority (high/medium/low)`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                doc_id: { type: "string" },
                title: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Enrich recommendations with full document data
    const enrichedRecommendations = recommendations.recommendations.map(rec => {
      const doc = allDocs.find(d => d.id === rec.doc_id);
      return {
        ...rec,
        document: doc,
        category: doc?.category,
        tags: doc?.tags
      };
    }).filter(r => r.document);

    return Response.json({
      success: true,
      user_email: targetEmail,
      recommendations: enrichedRecommendations,
      total_recommended: enrichedRecommendations.length
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});