import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchQuery, contentType = 'policies' } = await req.json();

    // Search Google Drive for relevant documents
    const searchResponse = await base44.functions.invoke('googleDriveContentSearch', {
      query: searchQuery,
      maxResults: 5,
      fileType: 'document'
    });

    if (!searchResponse.data.success || searchResponse.data.results.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No documents found matching query'
      });
    }

    const documents = searchResponse.data.results;
    const combinedContent = documents
      .map(doc => `[From ${doc.name}]\n${doc.fullContent}`)
      .join('\n\n---\n\n');

    // Use AI to analyze and summarize the documents
    const analysisPrompt = `
    Analyze the following company documents and extract key information for ${contentType}.
    
    DOCUMENTS:
    ${combinedContent}
    
    Extract:
    1. Key policies and guidelines
    2. Core values and principles
    3. Best practices mentioned
    4. Processes and workflows
    5. Important dates or timelines
    
    Format as structured JSON with categories.
    `;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_policies: { type: 'array', items: { type: 'string' } },
          values: { type: 'array', items: { type: 'string' } },
          best_practices: { type: 'array', items: { type: 'string' } },
          processes: { type: 'array', items: { type: 'string' } },
          source_documents: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({
      success: true,
      contentType,
      analysis: aiResponse,
      sourceDocuments: documents.map(d => ({ name: d.name, link: d.link }))
    });

  } catch (error) {
    console.error('Error enriching content from documents:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});