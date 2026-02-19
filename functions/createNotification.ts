import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { requirePermission } from './lib/rbacMiddleware.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 🔒 SECURITY: Require admin/ops permission for bulk notification creation
    await requirePermission(base44, 'CREATE_EVENTS');

    const { notifications } = await req.json();

    if (!notifications || !Array.isArray(notifications)) {
      return Response.json({ error: 'Invalid request - notifications array required' }, { status: 400 });
    }

    // Create notifications using service role
    const createdNotifications = await Promise.all(
      notifications.map(notification => 
        base44.asServiceRole.entities.Notification.create(notification)
      )
    );

    return Response.json({ 
      success: true, 
      count: createdNotifications.length,
      notifications: createdNotifications
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});