/**
 * Session Recovery Handler
 * Recovers form state when session expires during submission
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, formData, formId } = await req.json();

    switch (action) {
      case 'save':
        // Save form state to user profile
        return await saveFormRecoveryData(base44, user.email, formId, formData);

      case 'recover':
        // Retrieve saved form state
        return await getFormRecoveryData(base44, user.email, formId);

      case 'discard':
        // Clear saved form state
        return await discardFormRecoveryData(base44, user.email, formId);

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[SESSION_RECOVERY]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function saveFormRecoveryData(base44, userEmail, formId, formData) {
  try {
    // Get current profile
    const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Initialize recovery data if doesn't exist
    if (!profile.form_recovery) {
      profile.form_recovery = {};
    }

    // Save with timestamp
    profile.form_recovery[formId] = {
      data: formData,
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours
    };

    // Update profile
    await base44.entities.UserProfile.update(profile.id, {
      form_recovery: profile.form_recovery
    });

    return Response.json({
      success: true,
      message: 'Form data saved for recovery',
      expiresAt: profile.form_recovery[formId].expiresAt
    });
  } catch (error) {
    console.error('[SESSION_RECOVERY] Save failed:', error);
    return Response.json({
      success: false,
      warning: 'Could not save form backup (continue anyway)'
    });
  }
}

async function getFormRecoveryData(base44, userEmail, formId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
    const profile = profiles[0];

    if (!profile || !profile.form_recovery || !profile.form_recovery[formId]) {
      return Response.json({ recovered: false });
    }

    const recovery = profile.form_recovery[formId];

    // Check if expired
    if (new Date() > new Date(recovery.expiresAt)) {
      return Response.json({ recovered: false, expired: true });
    }

    return Response.json({
      recovered: true,
      data: recovery.data,
      savedAt: recovery.savedAt
    });
  } catch (error) {
    console.error('[SESSION_RECOVERY] Retrieve failed:', error);
    return Response.json({ recovered: false });
  }
}

async function discardFormRecoveryData(base44, userEmail, formId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
    const profile = profiles[0];

    if (!profile || !profile.form_recovery) {
      return Response.json({ success: true });
    }

    delete profile.form_recovery[formId];

    await base44.entities.UserProfile.update(profile.id, {
      form_recovery: profile.form_recovery
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[SESSION_RECOVERY] Discard failed:', error);
    return Response.json({ success: false });
  }
}