import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * UPDATE USER ROLE - Admin only
 * Updates a user's role and user_type
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can update roles
    if (currentUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { targetUserEmail, newRole } = await req.json();

    if (!targetUserEmail || !newRole) {
      return Response.json({ 
        error: 'targetUserEmail and newRole are required' 
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'facilitator', 'participant'];
    if (!validRoles.includes(newRole)) {
      return Response.json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      }, { status: 400 });
    }

    // Prevent changing own role
    if (targetUserEmail === currentUser.email) {
      return Response.json({ 
        error: 'Cannot change your own role' 
      }, { status: 400 });
    }

    // Get target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({ 
      email: targetUserEmail 
    });
    
    if (targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = targetUsers[0];

    // Map role to Base44's built-in User.role and UserProfile.user_type
    const base44Role = newRole === 'admin' ? 'admin' : 'user';
    const userType = newRole === 'facilitator' ? 'facilitator' : 'participant';

    // Update User entity role (if needed - Base44 manages this)
    // Note: Base44 User entity role is read-only in some cases
    // We primarily update via UserProfile.user_type

    // Update UserProfile with new user_type
    const profileRecords = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: targetUserEmail
    });

    if (profileRecords.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(profileRecords[0].id, {
        user_type: userType
      });
    } else {
      // Create profile if it doesn't exist
      await base44.asServiceRole.entities.UserProfile.create({
        user_email: targetUserEmail,
        user_type: userType
      });
    }

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: currentUser.email,
      action: 'user_role_updated',
      target_entity: 'User',
      target_id: targetUserEmail,
      severity: 'high',
      details: {
        updated_by: currentUser.email,
        previous_role: targetUser.role,
        new_role: newRole,
        new_base44_role: base44Role,
        new_user_type: userType
      }
    });

    // Send notification to user
    await base44.asServiceRole.entities.Notification.create({
      user_email: targetUserEmail,
      type: 'account_alert',
      title: 'Role Updated',
      message: `Your role has been updated to ${newRole} by ${currentUser.full_name || 'an administrator'}.`,
      is_read: false
    });

    return Response.json({
      success: true,
      message: 'User role updated successfully',
      user_email: targetUserEmail,
      new_role: newRole,
      new_user_type: userType
    });

  } catch (error) {
    console.error('Update user role error:', error);
    return Response.json({
      error: error.message || 'Failed to update user role'
    }, { status: 500 });
  }
});