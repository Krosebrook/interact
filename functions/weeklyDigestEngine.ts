import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Weekly Digest Engine: Personalized weekly summaries
 * Adapts frequency based on engagement level
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userEmail = user.email } = await req.json();

    // GENERATE WEEKLY DIGEST
    if (action === 'generate_digest') {
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (retention.length === 0) {
        return Response.json({ error: 'No retention state' }, { status: 404 });
      }

      const state = retention[0];
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Check if digest already sent this week
      const existing = await base44.entities.WeeklyDigest.filter({
        user_email: userEmail,
        week_starting: weekStartStr
      });

      if (existing.length > 0 && existing[0].status !== 'pending') {
        return Response.json({ exists: true, digest: existing[0] });
      }

      // Gather digest content
      const discoveryHighlights = await getDiscoveryHighlights(base44, state);
      const insightHighlights = await getInsightHighlights(base44, state);
      const socialHighlights = await getSocialHighlights(base44, state);

      const digestContent = {
        greeting: generateGreeting(state),
        engagement_summary: {
          sessions: state.current_week_streak || 0,
          meaningful_actions: countMeaningfulActions(state),
          trending_positive: state.total_visit_streak > 1
        },
        discovery_highlights: discoveryHighlights,
        insight_highlights: insightHighlights,
        social_highlights: socialHighlights,
        motivational_message: generateMotivationalMessage(state),
        streak_badge: generateStreakBadge(state.total_visit_streak)
      };

      // Create or update digest
      if (existing.length > 0) {
        await base44.entities.WeeklyDigest.update(existing[0].id, {
          content: digestContent,
          status: 'pending'
        });
      } else {
        await base44.entities.WeeklyDigest.create({
          user_email: userEmail,
          week_starting: weekStartStr,
          week_ending: new Date(weekStart.setDate(weekStart.getDate() + 6)).toISOString().split('T')[0],
          status: 'pending',
          content: digestContent,
          generated_by_ai: true
        });
      }

      return Response.json({
        success: true,
        digest: digestContent
      });
    }

    // ADAPT DIGEST FREQUENCY
    if (action === 'adapt_digest_frequency') {
      const retention = await base44.entities.RetentionState.filter({
        user_email: userEmail
      });

      if (retention.length === 0) return Response.json({ success: true });

      const state = retention[0];
      const engagement = state.current_week_streak || 0;
      const prefs = state.digest_preferences || {};

      // High engagement = stay with weekly
      // Low engagement = adapt to biweekly
      const frequency = engagement >= 3 ? 'weekly' : engagement >= 1 ? 'biweekly' : 'biweekly';

      await base44.entities.RetentionState.update(retention[0].id, {
        digest_preferences: {
          ...prefs,
          digest_frequency: frequency
        }
      });

      return Response.json({ success: true, frequency });
    }

    // TRACK DIGEST ENGAGEMENT
    if (action === 'track_digest_engagement') {
      const { weekStarting, eventType } = await req.json();
      const digest = await base44.entities.WeeklyDigest.filter({
        user_email: userEmail,
        week_starting: weekStarting
      });

      if (digest.length === 0) return Response.json({ success: true });

      const status = eventType === 'opened' ? 'opened' : eventType === 'clicked' ? 'clicked' : 'ignored';
      const timestamp = eventType === 'opened' ? new Date().toISOString() : digest[0].opened_at;

      await base44.entities.WeeklyDigest.update(digest[0].id, {
        status,
        opened_at: timestamp
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Weekly digest engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateGreeting(state) {
  const streak = state.total_visit_streak || 0;
  if (streak > 10) return `You're on fire! ${streak}-week streak—here's your weekly recap:`;
  if (streak > 5) return `Loving your consistency! Week ${streak} summary:`;
  if (streak > 1) return `Great to see you back! Here's what you missed:`;
  return `Welcome back! Your weekly digest:`;
}

function countMeaningfulActions(state) {
  let count = 0;
  if (state.discovery_loop?.deals_saved_from_loop) count += state.discovery_loop.deals_saved_from_loop;
  if (state.insight_loop?.portfolio_adjustments) count += state.insight_loop.portfolio_adjustments;
  if (state.social_loop?.social_interactions) count += state.social_loop.social_interactions;
  return count;
}

function generateMotivationalMessage(state) {
  const risk = state.retention_risk_score || 50;
  if (risk < 30) return '🚀 You're crushing it. Keep this momentum going!';
  if (risk < 60) return '📈 You're making progress. Keep exploring!';
  return '💡 Even small actions compound—what interests you most?';
}

function generateStreakBadge(streak) {
  if (!streak || streak === 0) return null;
  if (streak >= 10) return '🔥 10+ week streak';
  if (streak >= 5) return '⭐ 5-week streak';
  if (streak >= 2) return '✨ 2-week streak';
  return null;
}

async function getDiscoveryHighlights(base44, state) {
  // Mock implementation—would fetch actual deals in production
  return [
    {
      deal_id: 'deal_123',
      title: 'Series B Tech Startup',
      relevance_reason: 'Matches your interest in early-stage tech',
      status: 'trending'
    }
  ];
}

async function getInsightHighlights(base44, state) {
  return [
    {
      insight_type: 'portfolio_performance',
      message: 'Your portfolio is outperforming benchmark by 2.3%',
      action: 'View Details'
    }
  ];
}

async function getSocialHighlights(base44, state) {
  return [
    {
      expert_name: 'Jane Chen',
      discussion_topic: 'AI in Investment Tech',
      relevance: 'Matches your follow list'
    }
  ];
}