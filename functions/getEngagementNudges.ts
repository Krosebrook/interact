/**
 * Engagement Nudge Generator
 * Proactive suggestions to boost user engagement
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all users and their activity
    const users = await base44.entities.UserPoints.list();
    const userProfiles = await base44.entities.UserProfile.list();

    const nudges = generateNudges(users, userProfiles);

    return Response.json({ nudges });
  } catch (error) {
    console.error('[ENGAGEMENT_NUDGES]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateNudges(users, profiles) {
  const nudges = [];

  users.forEach(user => {
    const profile = profiles.find(p => p.user_email === user.user_email);
    const daysInactive = (Date.now() - new Date(user.last_activity_date)) / (1000 * 60 * 60 * 24);

    // High-risk: no activity in 14+ days
    if (daysInactive >= 14) {
      nudges.push({
        user_name: profile?.display_name || user.user_email,
        message: `${user.user_email} hasn't engaged in ${Math.round(daysInactive)} days. They're at high risk of churn.`,
        priority: 'high',
        suggested_actions: [
          'Send personalized invite to upcoming event',
          'Suggest easy challenge (50 points)',
          'Check in directly'
        ]
      });
    }

    // Medium-risk: declining trend
    if (user.points_this_month < user.points_last_month * 0.5) {
      nudges.push({
        user_name: profile?.display_name || user.user_email,
        message: `${user.user_email}'s engagement dropped 50% this month. Offer support or personalized challenge.`,
        priority: 'medium',
        suggested_actions: [
          'Feature their profile',
          'Invite to team event',
          'Award recognition'
        ]
      });
    }

    // Low-engagement: below-average points for tenure
    if (user.total_points < 200 && user.total_points > 0) {
      nudges.push({
        user_name: profile?.display_name || user.user_email,
        message: `${user.user_email} has low overall engagement. They might benefit from an easy win.`,
        priority: 'low',
        suggested_actions: [
          'Invite to wellness event',
          'Create beginner challenge',
          'Pair with mentor'
        ]
      });
    }
  });

  return nudges.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
}