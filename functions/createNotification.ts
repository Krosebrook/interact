import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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