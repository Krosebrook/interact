import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Re-engagement Engine: Smart inactivity alerts
 * Value-first messaging, not guilt-based reminders
 */

const RE_ENGAGEMENT_MESSAGES = {
  3_day_inactivity: {
    tone: 'neutral',
    message: (userData) => `We found ${userData.dealsNew} new deals matching your interests since you last visited.`,
    cta: 'View Deals',
    target: 'discovery_loop'
  },
  7_day_inactivity: {
    tone: 'curious',
    message: (userData) => `Your portfolio insights are updated. See how you're trending against benchmarks.`,
    cta: 'Check Progress',
    target: 'insight_loop'
  },
  14_day_inactivity: {
    tone: 'friendly',
    message: (userData) => `The community's been buzzing about ${userData.topicTrending}. Expert perspectives inside.`,
    cta: 'Join Conversation',
    target: 'social_loop'
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userEmail = user.email } = await req.json();

    // CHECK INACTIVITY & TRIGGER RE-ENGAGEMENT
    if (action === 'check_inactivity') {
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (retention.length === 0) {
        return Response.json({ inactivity: false });
      }

      const state = retention[0];
      const lastActivity = state.discovery_loop?.last_triggered || state.created_at;
      const inactivityDays = Math.floor(
        (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24)
      );

      // Check cooldown
      const lastAlert = new Date(state.re_engagement_state?.last_inactivity_alert || 0);
      const daysSinceAlert = Math.floor((new Date() - lastAlert) / (1000 * 60 * 60 * 24));
      const suppressedUntil = state.re_engagement_state?.suppressed_until;

      if (suppressedUntil && new Date() < new Date(suppressedUntil)) {
        return Response.json({ inactivity: false, suppressed: true });
      }

      // Determine if re-engagement needed
      const shouldAlert = inactivityDays >= 3 && daysSinceAlert >= 5;

      if (shouldAlert) {
        const message = generateReEngagementMessage(inactivityDays, state);

        // Update re-engagement state
        const reEngagement = state.re_engagement_state || {};
        reEngagement.last_inactivity_alert = new Date().toISOString();
        reEngagement.inactivity_days = inactivityDays;
        reEngagement.re_engagement_messages_sent = (reEngagement.re_engagement_messages_sent || 0) + 1;
        reEngagement.suppressed_until = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

        await base44.entities.RetentionState.update(retention[0].id, {
          re_engagement_state: reEngagement
        });

        return Response.json({
          success: true,
          inactivity: true,
          inactivityDays,
          message,
          surface: inactivityDays > 7 ? 'modal' : 'email'
        });
      }

      return Response.json({ inactivity: false });
    }

    // GENERATE PERSONALIZED MESSAGE
    if (action === 'generate_reengagement_message') {
      const { inactivityDays } = await req.json();
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (retention.length === 0) {
        return Response.json({ error: 'No state' }, { status: 404 });
      }

      const state = retention[0];
      const message = generateReEngagementMessage(inactivityDays, state);

      return Response.json({
        success: true,
        message,
        loopTarget: message.target
      });
    }

    // TRACK RE-ENGAGEMENT EFFECTIVENESS
    if (action === 'track_reengagement_outcome') {
      const { outcome } = await req.json(); // 'clicked', 'ignored', 'converted'
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (retention.length === 0) return Response.json({ success: true });

      const state = retention[0];
      const reEngagement = state.re_engagement_state || {};

      // Track effectiveness
      if (outcome === 'converted') {
        reEngagement.re_engagement_effectiveness = 100;
      } else if (outcome === 'clicked') {
        reEngagement.re_engagement_effectiveness = 60;
      } else {
        reEngagement.re_engagement_effectiveness = 0;
      }

      await base44.entities.RetentionState.update(retention[0].id, {
        re_engagement_state: reEngagement
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Re-engagement engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateReEngagementMessage(inactivityDays, state) {
  let messageTemplate;

  if (inactivityDays >= 14) {
    messageTemplate = RE_ENGAGEMENT_MESSAGES['14_day_inactivity'];
  } else if (inactivityDays >= 7) {
    messageTemplate = RE_ENGAGEMENT_MESSAGES['7_day_inactivity'];
  } else {
    messageTemplate = RE_ENGAGEMENT_MESSAGES['3_day_inactivity'];
  }

  const userData = {
    dealsNew: Math.floor(Math.random() * 5) + 3,
    topicTrending: ['AI in Investing', 'ESG Portfolios', 'Tech Sector Trends'][Math.floor(Math.random() * 3)],
    userName: state.user_email?.split('@')[0] || 'there'
  };

  return {
    message: messageTemplate.message(userData),
    cta: messageTemplate.cta,
    target: messageTemplate.target,
    tone: messageTemplate.tone
  };
}