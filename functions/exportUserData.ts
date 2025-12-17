/**
 * EXPORT USER DATA
 * Export user profiles and analytics (Admin+)
 * Export sensitive data including PII (Owner only)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const OWNER_EMAILS = ['owner@intinc.com'];
    const isOwner = OWNER_EMAILS.includes(currentUser.email.toLowerCase());
    const isAdmin = currentUser.role === 'admin' || isOwner;

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden: Admin permission required' }, { status: 403 });
    }

    const { format = 'csv', includeSensitiveData = false } = await req.json();

    // Only owner can export sensitive data
    if (includeSensitiveData && !isOwner) {
      return Response.json({ error: 'Forbidden: Owner permission required for sensitive data' }, { status: 403 });
    }

    // Fetch all users
    const users = await base44.asServiceRole.entities.User.list();
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const userPoints = await base44.asServiceRole.entities.UserPoints.list();

    // Merge data
    const exportData = users.map(user => {
      const profile = profiles.find(p => p.user_email === user.email);
      const points = userPoints.find(p => p.user_email === user.email);

      const baseData = {
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        user_type: user.user_type,
        created_date: user.created_date,
        display_name: profile?.display_name,
        job_title: profile?.job_title,
        department: profile?.department,
        location: profile?.location,
        total_points: points?.total_points || 0,
        level: points?.level || 1,
        events_attended: points?.events_attended || 0,
        badges_earned: points?.badges_earned?.length || 0,
        streak_days: points?.streak_days || 0
      };

      // Include sensitive data only if owner
      if (includeSensitiveData) {
        return {
          ...baseData,
          profile_bio: profile?.bio,
          skills: profile?.skill_interests?.join('; '),
          interests: profile?.interests_tags?.join('; '),
          years_at_company: profile?.years_at_company,
          notification_preferences: JSON.stringify(profile?.notification_preferences),
          privacy_settings: JSON.stringify(profile?.privacy_settings)
        };
      }

      return baseData;
    });

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'data_exported',
      actor_email: currentUser.email,
      actor_role: isOwner ? 'owner' : 'admin',
      severity: includeSensitiveData ? 'critical' : 'high',
      metadata: {
        format,
        record_count: exportData.length,
        included_sensitive_data: includeSensitiveData,
        timestamp: new Date().toISOString()
      }
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value || '';
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=user-export-${Date.now()}.csv`
        }
      });
    }

    // JSON format
    return Response.json({
      success: true,
      data: exportData,
      exported_at: new Date().toISOString(),
      exported_by: currentUser.email,
      record_count: exportData.length
    });

  } catch (error) {
    console.error('exportUserData error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});