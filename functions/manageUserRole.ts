/**
 * MANAGE USER ROLE - Owner only
 * Change user roles, suspend/activate users
 * Includes full audit logging
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Owner or admin can manage roles
    const OWNER_EMAILS = []; // Configure if specific owner emails needed
    const isOwner = OWNER_EMAILS.length > 0 && OWNER_EMAILS.includes(currentUser.email.toLowerCase());
    
    if (!isOwner && currentUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Owner permission required' }, { status: 403 });
    }

    const { action, targetEmail, newRole, newUserType, newStatus } = await req.json();

    // Validate action
    if (!['change_role', 'suspend', 'activate'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Prevent owner from modifying themselves
    if (isOwner && currentUser.email === targetEmail && action === 'change_role') {
      return Response.json({ error: 'Cannot modify owner role' }, { status: 400 });
    }

    // Get target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({ email: targetEmail });
    if (targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const targetUser = targetUsers[0];

    // Get target user profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: targetEmail });
    const profile = profiles[0];

    let changes = {};

    // Handle actions
    if (action === 'change_role') {
      // Only owner can assign admin role
      if (newRole === 'admin' && !isOwner) {
        return Response.json({ error: 'Only owner can assign admin role' }, { status: 403 });
      }

      changes.before = { role: targetUser.role, user_type: targetUser.user_type };
      changes.after = { role: newRole, user_type: newUserType };

      // Update user
      await base44.asServiceRole.entities.User.update(targetUser.id, {
        role: newRole || targetUser.role,
        user_type: newUserType || targetUser.user_type
      });

      // Create audit log
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'role_changed',
        actor_email: currentUser.email,
        actor_role: isOwner ? 'owner' : currentUser.role,
        target_email: targetEmail,
        entity_type: 'User',
        entity_id: targetUser.id,
        changes,
        severity: 'high',
        metadata: {
          new_role: newRole,
          new_user_type: newUserType
        }
      });
    } else if (action === 'suspend' || action === 'activate') {
      const status = action === 'suspend' ? 'suspended' : 'active';
      
      changes.before = { status: profile?.status || 'active' };
      changes.after = { status };

      // Update profile status
      if (profile) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, { status });
      } else {
        await base44.asServiceRole.entities.UserProfile.create({
          user_email: targetEmail,
          status
        });
      }

      // Create audit log
      await base44.asServiceRole.entities.AuditLog.create({
        action: action === 'suspend' ? 'user_suspended' : 'user_activated',
        actor_email: currentUser.email,
        actor_role: isOwner ? 'owner' : currentUser.role,
        target_email: targetEmail,
        entity_type: 'UserProfile',
        entity_id: profile?.id,
        changes,
        severity: 'high'
      });
    }

    return Response.json({ 
      success: true,
      message: `User ${action === 'change_role' ? 'role updated' : action === 'suspend' ? 'suspended' : 'activated'}` 
    });

  } catch (error) {
    console.error('manageUserRole error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});