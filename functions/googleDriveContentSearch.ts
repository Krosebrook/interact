import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { query, maxResults = 10, fileType = 'all' } = await req.json();

    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // Search Google Drive
    let mimeTypeFilter = '';
    if (fileType === 'document') {
      mimeTypeFilter = " and (mimeType='application/vnd.google-apps.document' or mimeType='application/pdf')";
    } else if (fileType === 'spreadsheet') {
      mimeTypeFilter = " and mimeType='application/vnd.google-apps.spreadsheet'";
    }

    const searchQuery = `fullText contains "${query}"${mimeTypeFilter} and trashed=false`;

    const searchResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      query: new URLSearchParams({
        q: searchQuery,
        pageSize: maxResults,
        fields: 'files(id,name,mimeType,modifiedTime,webViewLink,description,owners)',
        orderBy: 'modifiedTime desc'
      }).toString()
    });

    if (!searchResponse.ok) {
      throw new Error(`Google Drive API error: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    const files = searchData.files || [];

    // Extract content from each file
    const results = [];
    for (const file of files.slice(0, maxResults)) {
      let content = '';
      
      // For Google Docs
      if (file.mimeType === 'application/vnd.google-apps.document') {
        const exportResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/export`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          query: new URLSearchParams({
            mimeType: 'text/plain'
          }).toString()
        });
        
        if (exportResponse.ok) {
          content = await exportResponse.text();
        }
      }
      // For PDFs - extract text
      else if (file.mimeType === 'application/pdf') {
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (fileResponse.ok) {
          // Note: Full PDF text extraction would require a library
          // For now, return metadata and indicate PDF needs processing
          content = `[PDF File - requires additional processing for full text extraction]`;
        }
      }
      // For Google Sheets
      else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
        const exportResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/export`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          query: new URLSearchParams({
            mimeType: 'text/csv'
          }).toString()
        });
        
        if (exportResponse.ok) {
          content = await exportResponse.text();
        }
      }

      results.push({
        id: file.id,
        name: file.name,
        type: file.mimeType,
        modifiedTime: file.modifiedTime,
        link: file.webViewLink,
        content: content.substring(0, 1000), // First 1000 chars
        fullContent: content,
        owner: file.owners?.[0]?.displayName || 'Unknown'
      });
    }

    return Response.json({ 
      success: true, 
      query, 
      filesFound: results.length,
      results 
    });

  } catch (error) {
    console.error('Error searching Google Drive:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});