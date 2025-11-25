import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { v2 as cloudinary } from 'npm:cloudinary';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY");
    const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET");

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return Response.json({ error: 'Cloudinary credentials not configured' }, { status: 500 });
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET
    });

    const { action, public_id, file_url, folder, transformation } = await req.json();

    let result;

    switch (action) {
      case 'upload':
        result = await cloudinary.uploader.upload(file_url, {
          folder: folder || 'uploads',
          resource_type: 'auto'
        });
        break;

      case 'transform':
        result = {
          url: cloudinary.url(public_id, {
            transformation: transformation || [
              { width: 500, height: 500, crop: 'fill' }
            ]
          })
        };
        break;

      case 'delete':
        result = await cloudinary.uploader.destroy(public_id);
        break;

      case 'get_info':
        result = await cloudinary.api.resource(public_id);
        break;

      case 'list_resources':
        result = await cloudinary.api.resources({
          type: 'upload',
          prefix: folder || '',
          max_results: 100
        });
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'cloudinary' });
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