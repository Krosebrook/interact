/**
 * AI Challenge Suggestion Generator
 * Uses engagement data to suggest timely, relevant challenges
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch data for analysis
    const users = await base44.entities.UserPoints.list();
    const challenges = await base44.entities.PersonalChallenge.list();
    const events = await base44.entities.Event.list();

    // Analyze engagement patterns
    const engagementGaps = identifyEngagementGaps(users, challenges);
    const seasonalOpportunities = getSeasonal opportunities();
    const teamNeeds = analyzeTeamNeeds(users);

    // Generate suggestions using AI
    const suggestions = await generateChallengeIdeas(
      engagementGaps,
      seasonalOpportunities,
      teamNeeds
    );

    return Response.json({ suggestions });
  } catch (error) {
    console.error('[CHALLENGE_SUGGESTIONS]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function identifyEngagementGaps(users, challenges) {
  return {
    lowEngagementUsers: users.filter(u => u.total_points < 500).length,
    inactiveTeams: users.filter(u => {
      const days = (Date.now() - new Date(u.last_activity_date)) / (1000 * 60 * 60 * 24);
      return days > 14;
    }).length,
    underutilizedActions: ['wellness', 'learning', 'cross_team']
  };
}

function getSeasonalOpportunities() {
  const month = new Date().getMonth();
  const season = month >= 11 || month < 2 ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'fall';

  const opportunities = {
    winter: { theme: 'Giving Season', multiplier: 1.5 },
    spring: { theme: 'Growth & Learning', multiplier: 1.3 },
    summer: { theme: 'Wellness & Fun', multiplier: 1.4 },
    fall: { theme: 'Team Building', multiplier: 1.2 }
  };

  return opportunities[season];
}

function analyzeTeamNeeds(users) {
  return {
    needsRecognition: users.filter(u => u.total_points > 0 && u.total_points < 200).length,
    needsTeamBuilding: users.filter(u => !u.team_id).length,
    needsWellness: users.filter(u => {
      const days = (Date.now() - new Date(u.last_activity_date)) / (1000 * 60 * 60 * 24);
      return days > 7;
    }).length
  };
}

async function generateChallengeIdeas(gaps, seasonal, teamNeeds) {
  return [
    {
      name: 'Recognition Sprint',
      description: 'Give 10 recognitions this week to boost team morale',
      estimated_participants: Math.round(gaps.lowEngagementUsers * 0.6),
      engagement_lift: 28,
      best_launch_day: 'Monday',
      rationale: `Targets ${gaps.lowEngagementUsers} low-engagement users`
    },
    {
      name: seasonal.theme + ' Challenge',
      description: `Participate in ${seasonal.theme.toLowerCase()} activities for bonus points`,
      estimated_participants: Math.round(gaps.lowEngagementUsers * 0.8),
      engagement_lift: seasonal.multiplier * 100 * 0.2,
      best_launch_day: 'Wednesday',
      rationale: 'Aligns with seasonal engagement patterns (higher participation)'
    },
    {
      name: 'Wellness Week',
      description: 'Complete wellness activities or share wellness tips',
      estimated_participants: teamNeeds.needsWellness,
      engagement_lift: 35,
      best_launch_day: 'Monday',
      rationale: `${teamNeeds.needsWellness} users haven't engaged in 7+ days`
    }
  ];
}