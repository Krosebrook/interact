/**
 * AI-Driven Challenge Generation for Admins
 * Auto-generates and schedules challenges based on engagement trends
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { team_id, auto_schedule } = await req.json();

    // Fetch engagement data
    const events = await base44.asServiceRole.entities.Event.list();
    const recognitions = await base44.asServiceRole.entities.Recognition.filter({
      status: 'approved'
    });
    const userPoints = await base44.asServiceRole.entities.UserPoints.list();

    // Analyze trends
    const trends = {
      low_event_attendance: events.filter(e => e.status === 'completed').length < 5,
      recognition_dip: recognitions.length < 20,
      low_avg_points: (userPoints.reduce((sum, up) => sum + (up.total_points || 0), 0) / userPoints.length) < 500
    };

    // Generate challenge suggestions
    const suggestions = [];

    if (trends.low_event_attendance) {
      suggestions.push({
        name: '🎉 Event Attendee',
        description: 'Attend 3 events this month',
        points: 150,
        reasoning: 'Low event attendance detected - encourage participation'
      });
    }

    if (trends.recognition_dip) {
      suggestions.push({
        name: '❤️ Recognition Champion',
        description: 'Give 5 recognitions this week',
        points: 100,
        reasoning: 'Recognition activity below target'
      });
    }

    if (trends.low_avg_points) {
      suggestions.push({
        name: '⭐ Points Accumulator',
        description: 'Earn 500 points this month',
        points: 0, // Meta-challenge
        reasoning: 'Overall engagement lower than usual'
      });
    }

    // Add seasonal/regular challenges
    const today = new Date();
    const seasonalChallenges = getSeasonalChallenges(today);
    suggestions.push(...seasonalChallenges);

    // If auto_schedule, create them
    if (auto_schedule) {
      for (const suggestion of suggestions) {
        await base44.asServiceRole.entities.TeamChallenge.create({
          team_id: team_id || 'all',
          challenge_name: suggestion.name,
          description: suggestion.description,
          points_reward: suggestion.points,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: user.email,
          auto_generated: true
        });
      }
    }

    // Send summary to admin
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `🤖 AI Generated ${suggestions.length} Challenge Suggestions`,
      body: `Based on engagement trends, we suggest:\n\n${suggestions.map(s => `- ${s.name}: ${s.reasoning}`).join('\n')}`
    });

    return Response.json({
      success: true,
      suggestions_count: suggestions.length,
      suggestions,
      scheduled: auto_schedule
    });
  } catch (error) {
    console.error('[GENERATE_CHALLENGES]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getSeasonalChallenges(date) {
  const month = date.getMonth();
  const challenges = [];

  // Q1
  if (month === 0) {
    challenges.push({
      name: '🎯 New Year, New Skills',
      description: 'Complete a learning module',
      points: 100,
      reasoning: 'New year motivation'
    });
  }

  // Summer
  if (month === 5 || month === 6) {
    challenges.push({
      name: '☀️ Summer Social',
      description: 'Attend a social event',
      points: 75,
      reasoning: 'Seasonal team building'
    });
  }

  // Q4
  if (month >= 9) {
    challenges.push({
      name: '🎄 Year-End Recognition',
      description: 'Give 3 recognitions',
      points: 125,
      reasoning: 'End-of-year gratitude'
    });
  }

  return challenges;
}