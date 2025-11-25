import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Client } from 'npm:@notionhq/client';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notion = new Client({ auth: Deno.env.get("NOTION_API_KEY") });
    const { action, database_id, page_id, properties, content } = await req.json();

    let result;

    switch (action) {
      case 'list_databases':
        const searchResponse = await notion.search({
          filter: { property: 'object', value: 'database' }
        });
        result = { databases: searchResponse.results };
        break;

      case 'query_database':
        const queryResponse = await notion.databases.query({
          database_id,
          page_size: 100
        });
        result = { pages: queryResponse.results };
        break;

      case 'create_page':
        const createResponse = await notion.pages.create({
          parent: { database_id },
          properties
        });
        result = { page: createResponse };
        break;

      case 'update_page':
        const updateResponse = await notion.pages.update({
          page_id,
          properties
        });
        result = { page: updateResponse };
        break;

      case 'get_page':
        const pageResponse = await notion.pages.retrieve({ page_id });
        result = { page: pageResponse };
        break;

      case 'append_blocks':
        const appendResponse = await notion.blocks.children.append({
          block_id: page_id,
          children: content
        });
        result = { blocks: appendResponse };
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'notion' });
      if (integrations.length > 0) {
        await base44.asServiceRole.entities.Integration.update(integrations[0].id, {
          last_used: new Date().toISOString(),
          usage_count: (integrations[0].usage_count || 0) + 1,
          status: 'active'
        });
      }
    } catch (e) {
      console.error('Failed to update integration stats:', e);
    }

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});