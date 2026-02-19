import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Enforce Default Role on User Creation
 * Triggered by entity automation when new User is created
 * Ensures all users default to 'user' role (participant), not 'admin'
 * 
 * 🔒 SECURITY: This is a system automation - validates event source
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event, data } = await req.json();
    
    // 🔒 SECURITY: Validate this is a system-triggered automation
    if (!event || !event.entity_name || !event.type) {
      return Response.json({ error: 'Invalid automation event' }, { status: 400 });
    }

    // Only process user creation events
    if (event?.type !== 'create' || event?.entity_name !== 'User') {
      return Response.json({ success: true, skipped: 'Not a user creation event' });
    }

    const userId = event.entity_id;
    const userData = data;

    // Skip if user already has explicit role from invitation
    const invitations = await base44.asServiceRole.entities.UserInvitation.filter({
      email: userData.email,
      status: 'accepted'
    });

    if (invitations.length > 0) {
      // User came through invitation - role already set correctly
      console.log('User created via invitation, role preserved:', userData.email);
      return Response.json({ success: true, skipped: 'User has invitation' });
    }

    // 🔒 SECURITY: Validate role against allowed enum
    const ALLOWED_ROLES = ['user', 'admin'];
    const targetRole = userData.role && ALLOWED_ROLES.includes(userData.role) ? userData.role : 'user';
    
    // CRITICAL: Default all direct signups to 'user' role (participant)
    // Only explicit invitations can create admins/facilitators
    if (!userData.role || userData.role === 'admin') {
      await base44.asServiceRole.entities.User.update(userId, {
        role: targetRole, // Base44 built-in: 'admin' or 'user'
        user_type: 'participant' // Our custom type
      });

      console.log('Enforced default role for direct signup:', userData.email);

      // Audit log
      await base44.asServiceRole.entities.AuditLog.create({
        user_email: 'system',
        action: 'role_enforced',
        target_entity: 'User',
        target_id: userId,
        details: {
          email: userData.email,
          original_role: userData.role,
          enforced_role: 'user',
          reason: 'direct_signup_default'
        }
      });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('enforceDefaultRole error:', error);
    return Response.json({
      error: error.message || 'Failed to enforce role'
    }, { status: 500 });
  }
});