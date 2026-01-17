import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId } = await req.json();

    if (action === 'generate_nudges') {
      // Get user onboarding data
      const onboarding = await base44.entities.OnboardingFlow.filter({
        user_email: userId
      });

      if (!onboarding.length) {
        return Response.json({ nudges: [] });
      }

      const profile = onboarding[0];
      const skippedSteps = profile.skipped_steps || [];
      const nudges = [];

      // Check for incomplete setup
      if (skippedSteps.includes(4)) {
        nudges.push({
          user_email: userId,
          nudge_type: 'setup_incomplete',
          nudge_category: 'portfolio_goals_missing',
          message: '🎯 Set growth goals to get personalized event recommendations',
          suggested_action: 'complete_setup',
          priority: 'medium',
          display_location: 'banner',
          ai_generated: true,
          created_at: new Date().toISOString()
        });
      }

      // Check community engagement
      const userEvents = await base44.entities.Participation.filter({
        user_email: userId
      });

      if (!userEvents || userEvents.length === 0) {
        nudges.push({
          user_email: userId,
          nudge_type: 'feature_suggestion',
          nudge_category: 'no_events_attended',
          message: '📅 Your teammates are gathering next Tuesday—want to join?',
          suggested_action: 'join_event',
          priority: 'high',
          display_location: 'banner',
          ai_generated: true,
          created_at: new Date().toISOString()
        });
      }

      // Check for recognition activity
      const givenRecognition = await base44.entities.Recognition.filter({
        given_by_email: userId
      });

      if (!givenRecognition || givenRecognition.length === 0) {
        nudges.push({
          user_email: userId,
          nudge_type: 'engagement_boost',
          nudge_category: 'no_recognition_given',
          message: '⭐ Recognize a teammate to inspire the culture',
          suggested_action: 'post_recognition',
          priority: 'low',
          display_location: 'sidebar',
          ai_generated: true,
          created_at: new Date().toISOString()
        });
      }

      // Check leaderboard view
      const leaderboardViews = await base44.entities.AnalyticsEvent.filter({
        user_email: userId,
        event_type: 'leaderboard_view'
      });

      if (!leaderboardViews || leaderboardViews.length === 0) {
        nudges.push({
          user_email: userId,
          nudge_type: 'feature_suggestion',
          nudge_category: 'no_leaderboard_view',
          message: '🏆 See where you stand—check out the leaderboards',
          suggested_action: 'view_leaderboard',
          priority: 'low',
          display_location: 'sidebar',
          ai_generated: true,
          created_at: new Date().toISOString()
        });
      }

      // Save nudges
      for (const nudge of nudges) {
        const existing = await base44.entities.OnboardingNudge.filter({
          user_email: userId,
          nudge_category: nudge.nudge_category
        });

        if (!existing.length) {
          await base44.entities.OnboardingNudge.create(nudge);
        }
      }

      return Response.json({ success: true, nudges });
    }

    if (action === 'dismiss_nudge') {
      const { nudgeId } = await req.json();
      await base44.entities.OnboardingNudge.update(nudgeId, {
        is_dismissed: true,
        dismissed_at: new Date().toISOString()
      });

      return Response.json({ success: true });
    }

    if (action === 'get_active_nudges') {
      const nudges = await base44.entities.OnboardingNudge.filter({
        user_email: userId,
        is_dismissed: false
      }, '-priority', 5);

      return Response.json({ success: true, nudges });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Nudge generator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});