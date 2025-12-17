/**
 * INVITE USER - Admin/Owner only
 * Send invitation to join platform with assigned role
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

    // RBAC: Admin or owner can invite
    const OWNER_EMAILS = []; // Configure if needed
    const isOwner = OWNER_EMAILS.length > 0 && OWNER_EMAILS.includes(currentUser.email.toLowerCase());
    const isAdmin = currentUser.role === 'admin' || isOwner;
    
    if (!isAdmin) {
      return Response.json({ error: 'Forbidden: Admin permission required' }, { status: 403 });
    }

    const { emails, role = 'participant', message } = await req.json();

    // Validate emails array
    if (!Array.isArray(emails) || emails.length === 0) {
      return Response.json({ error: 'emails must be a non-empty array' }, { status: 400 });
    }

    // Validate domain (restrict to @intinc.com)
    const ALLOWED_DOMAIN = 'intinc.com';
    const invalidEmails = emails.filter(email => !email.endsWith(`@${ALLOWED_DOMAIN}`));
    if (invalidEmails.length > 0) {
      return Response.json({ 
        error: `Only @${ALLOWED_DOMAIN} emails allowed`,
        invalid_emails: invalidEmails 
      }, { status: 400 });
    }

    // Only owner can invite admins
    if (role === 'admin' && !isOwner) {
      return Response.json({ error: 'Only owner can invite admins' }, { status: 403 });
    }

    const invitations = [];
    const errors = [];

    for (const email of emails) {
      try {
        // Check if user already exists
        const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
        if (existingUsers.length > 0) {
          errors.push({ email, reason: 'User already exists' });
          continue;
        }

        // Check for pending invitation
        const pendingInvites = await base44.asServiceRole.entities.UserInvitation.filter({ 
          email, 
          status: 'pending' 
        });
        if (pendingInvites.length > 0) {
          errors.push({ email, reason: 'Pending invitation exists' });
          continue;
        }

        // Generate unique token
        const token = crypto.randomUUID();
        
        // Create invitation (expires in 7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await base44.asServiceRole.entities.UserInvitation.create({
          email,
          invited_by: currentUser.email,
          role: role === 'admin' ? 'admin' : (role === 'facilitator' ? 'facilitator' : 'participant'),
          token,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          message: message || `Join INTeract - ${currentUser.full_name || currentUser.email} has invited you!`
        });

        invitations.push(invitation);

        // Send email notification
        const inviteLink = `${Deno.env.get('BASE44_APP_URL') || 'https://your-app.base44.app'}/accept-invite?token=${token}`;
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: 'INTeract Team',
          subject: `You've been invited to INTeract`,
          body: `
Hi there!

${currentUser.full_name || currentUser.email} has invited you to join INTeract, our employee engagement platform.

${message ? `Message: "${message}"\n\n` : ''}
Role: ${role === 'admin' ? 'Admin' : role === 'facilitator' ? 'Facilitator' : 'Employee'}

Click here to accept your invitation:
${inviteLink}

This invitation expires in 7 days.

Welcome to the team!
          `.trim()
        });

        // Audit log
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'invitation_sent',
          actor_email: currentUser.email,
          actor_role: isOwner ? 'owner' : currentUser.role,
          target_email: email,
          entity_type: 'UserInvitation',
          entity_id: invitation.id,
          severity: 'medium',
          metadata: { role, token }
        });

      } catch (error) {
        errors.push({ email, reason: error.message });
      }
    }

    return Response.json({ 
      success: true,
      invitations,
      errors: errors.length > 0 ? errors : undefined,
      summary: `${invitations.length} invitation(s) sent${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });

  } catch (error) {
    console.error('inviteUser error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});