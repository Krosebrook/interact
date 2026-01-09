import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can trigger knowledge base rebuilds
    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const startTime = Date.now();
    const docsDirectory = 'components/docs';
    
    console.log('🔄 Starting documentation knowledge base rebuild...');

    // Read all markdown files from the docs directory
    const docFiles = [];
    const errors = [];
    
    try {
      // In a real deployment, you'd read from your file system or storage
      // For now, we'll use the Base44 integration to fetch from your repo
      const response = await fetch(
        `https://api.github.com/repos/${Deno.env.get('GITHUB_REPO')}/contents/components/docs`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('GITHUB_PERSONAL_ACCESS_TOKEN')}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documentation files from GitHub');
      }

      const files = await response.json();
      
      // Fetch content of each markdown file
      for (const file of files) {
        if (file.name.endsWith('.md')) {
          try {
            const contentResponse = await fetch(file.download_url);
            const content = await contentResponse.text();
            
            docFiles.push({
              name: file.name,
              path: file.path,
              content: content,
              size: content.length,
              lastModified: new Date().toISOString()
            });
            
            console.log(`✓ Processed: ${file.name} (${content.length} chars)`);
          } catch (err) {
            errors.push({ file: file.name, error: err.message });
            console.error(`✗ Failed to process ${file.name}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch documentation:', err);
      return Response.json({
        success: false,
        error: 'Failed to access documentation files',
        details: err.message
      }, { status: 500 });
    }

    // Build the aggregated knowledge base
    const sections = [];
    
    sections.push('='.repeat(80));
    sections.push('\nINTERACT EMPLOYEE ENGAGEMENT PLATFORM - AI KNOWLEDGE BASE');
    sections.push('\n' + '='.repeat(80));
    sections.push(`\n\nGenerated: ${new Date().toISOString()}`);
    sections.push(`\nTotal Documents: ${docFiles.length}`);
    sections.push('\nPurpose: Comprehensive documentation context for AI assistants\n');
    sections.push('\n' + '='.repeat(80) + '\n\n');

    // Add each document
    for (const doc of docFiles) {
      sections.push(`\nDOCUMENT: ${doc.name}`);
      sections.push(`\nPath: ${doc.path}`);
      sections.push(`\nSize: ${doc.size} characters`);
      sections.push('\n' + '-'.repeat(80) + '\n\n');
      sections.push(doc.content);
      sections.push('\n\n' + '='.repeat(80) + '\n\n');
    }

    // Add footer statistics
    const totalChars = docFiles.reduce((sum, doc) => sum + doc.size, 0);
    sections.push('\nEND OF KNOWLEDGE BASE');
    sections.push(`\n\nStatistics:`);
    sections.push(`\n- Total Documents: ${docFiles.length}`);
    sections.push(`\n- Total Characters: ${totalChars.toLocaleString()}`);
    sections.push(`\n- Total Size: ${(totalChars / 1024).toFixed(1)} KB`);
    sections.push(`\n- Build Time: ${Date.now() - startTime}ms`);
    sections.push('\n\n' + '='.repeat(80));

    const knowledgeBase = sections.join('');

    // Store the knowledge base metadata in a ProjectDocumentation entity
    const metadata = {
      rebuild_date: new Date().toISOString(),
      document_count: docFiles.length,
      total_characters: totalChars,
      total_size_kb: (totalChars / 1024).toFixed(1),
      build_time_ms: Date.now() - startTime,
      files_processed: docFiles.map(d => d.name),
      errors: errors,
      triggered_by: user.email,
      knowledge_base_preview: knowledgeBase.substring(0, 500) + '...'
    };

    // Try to update or create the documentation record
    try {
      const existingDocs = await base44.asServiceRole.entities.ProjectDocumentation.filter({});
      
      if (existingDocs.length > 0) {
        await base44.asServiceRole.entities.ProjectDocumentation.update(
          existingDocs[0].id,
          metadata
        );
      } else {
        await base44.asServiceRole.entities.ProjectDocumentation.create(metadata);
      }
    } catch (err) {
      console.warn('Could not store metadata (entity may not exist):', err.message);
    }

    console.log('✅ Knowledge base rebuild complete!');
    console.log(`📊 Processed ${docFiles.length} documents (${(totalChars / 1024).toFixed(1)} KB)`);

    return Response.json({
      success: true,
      metadata: {
        document_count: docFiles.length,
        total_size_kb: (totalChars / 1024).toFixed(1),
        build_time_ms: Date.now() - startTime,
        rebuild_date: new Date().toISOString(),
        files_processed: docFiles.map(d => d.name),
        errors: errors.length > 0 ? errors : null
      },
      message: `Successfully rebuilt knowledge base with ${docFiles.length} documents`
    });

  } catch (error) {
    console.error('Error rebuilding knowledge base:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});