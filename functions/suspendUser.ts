import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { validateUserStatus } from './lib/validateUserStatus.ts';

/**
 * Suspend User Function
 * Temporarily suspends a user after validating they have no active roles
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can suspend users
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { targetUserEmail, reason, duration_days } = await req.json();

    if (!targetUserEmail) {
      return Response.json({ error: 'targetUserEmail is required' }, { status: 400 });
    }

    // Prevent self-suspension
    if (targetUserEmail === user.email) {
      return Response.json({ error: 'Cannot suspend your own account' }, { status: 400 });
    }

    // Validate user has no active roles
    const validation = await validateUserStatus(base44, targetUserEmail);

    if (!validation.canProceed) {
      return Response.json({
        error: 'User cannot be suspended due to active roles',
        blockers: validation.blockers,
        suggestion: 'Please reassign team leadership and event facilitation before suspending'
      }, { status: 409 });
    }

    // Calculate suspension end date
    const suspensionEndDate = duration_days
      ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Update user profile with suspension status
    const userProfileRecords = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: targetUserEmail
    });

    if (userProfileRecords.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(userProfileRecords[0].id, {
        profile_visibility: 'private'
      });
    }

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action: 'user_suspended',
      target_entity: 'User',
      target_id: targetUserEmail,
      details: {
        suspended_by: user.email,
        reason: reason || 'admin_action',
        suspension_end: suspensionEndDate,
        duration_days
      }
    });

    // Send notification to suspended user
    await base44.asServiceRole.entities.Notification.create({
      user_email: targetUserEmail,
      type: 'account_alert',
      title: 'Account Suspended',
      message: `Your account has been suspended${duration_days ? ` for ${duration_days} days` : ''}. ${reason || 'Please contact your administrator.'}`,
      is_read: false
    });

    return Response.json({
      success: true,
      message: 'User suspended successfully',
      suspended_email: targetUserEmail,
      suspension_end: suspensionEndDate
    });

  } catch (error) {
    console.error('Suspend user error:', error);
    return Response.json({
      error: error.message || 'Failed to suspend user'
    }, { status: 500 });
  }
});