import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { validateUserStatus } from './lib/validateUserStatus.ts';

/**
 * Delete User Function
 * Soft-deletes a user after validating they have no active roles
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete users
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { targetUserEmail } = await req.json();

    if (!targetUserEmail) {
      return Response.json({ error: 'targetUserEmail is required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (targetUserEmail === user.email) {
      return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Validate user has no active roles
    const validation = await validateUserStatus(base44, targetUserEmail);

    if (!validation.canProceed) {
      return Response.json({
        error: 'User cannot be deleted due to active roles',
        blockers: validation.blockers
      }, { status: 409 });
    }

    // Soft delete: mark user records as inactive
    const userProfileRecords = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: targetUserEmail
    });

    if (userProfileRecords.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(userProfileRecords[0].id, {
        profile_visibility: 'private'
      });
    }

    // Mark user points as archived
    const userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter({
      user_email: targetUserEmail
    });

    if (userPointsRecords.length > 0) {
      await base44.asServiceRole.entities.UserPoints.update(userPointsRecords[0].id, {
        total_points: 0,
        available_points: 0
      });
    }

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action: 'user_deleted',
      target_entity: 'User',
      target_id: targetUserEmail,
      details: { deleted_by: user.email, reason: 'admin_action' }
    });

    return Response.json({
      success: true,
      message: 'User deleted successfully',
      deleted_email: targetUserEmail
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({
      error: error.message || 'Failed to delete user'
    }, { status: 500 });
  }
});