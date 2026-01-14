/**
 * AI Learning Resource Recommendation
 * Suggest resources based on user skills, goals, and interests
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const profiles = await base44.entities.UserProfile.filter({
      user_email: user.email
    });

    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Fetch all learning resources
    const resources = await base44.asServiceRole.entities.LearningResource.filter({
      is_active: true
    });

    // Match resources to user
    const recommendations = scoreResources(profile, resources);

    // Sort and limit to top 10
    const topResources = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return Response.json({
      success: true,
      recommendations_count: topResources.length,
      resources: topResources.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        url: r.url,
        resource_type: r.resource_type,
        reason: r.reason,
        estimated_duration_minutes: r.estimated_duration_minutes,
        difficulty_level: r.difficulty_level,
        match_score: r.score
      }))
    });
  } catch (error) {
    console.error('[SUGGEST_RESOURCES]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function scoreResources(profile, resources) {
  const userSkills = profile.skills?.map(s => s.skill_name.toLowerCase()) || [];
  const careerGoals = profile.career_goals?.map(g => g.goal.toLowerCase()) || [];
  const interests = profile.interests_tags?.map(t => t.toLowerCase()) || [];

  return resources.map(resource => {
    let score = 0;

    // Tags matching (40%)
    const resourceTags = resource.tags.map(t => t.toLowerCase());
    const tagMatches = resourceTags.filter(tag =>
      userSkills.includes(tag) || interests.includes(tag)
    ).length;
    score += (tagMatches / Math.max(resourceTags.length, 1)) * 40;

    // Career goal alignment (30%)
    if (careerGoals.length > 0) {
      const goalRelevance = careerGoals.some(goal => resource.title.toLowerCase().includes(goal));
      if (goalRelevance) score += 30;
    }

    // Role recommendations (20%)
    if (profile.job_title && resource.recommended_for_roles) {
      const roleMatch = resource.recommended_for_roles.some(role =>
        profile.job_title.toLowerCase().includes(role.toLowerCase())
      );
      if (roleMatch) score += 20;
    }

    // Difficulty progression (10%)
    const avgSkillLevel = averageSkillLevel(profile.skills);
    const difficultyMatch = matchDifficulty(avgSkillLevel, resource.difficulty_level);
    score += difficultyMatch * 10;

    // Adjust for rating/popularity
    if (resource.rating >= 4.5) score += 5;
    if (resource.views > 1000) score += 3;

    return {
      ...resource,
      score: Math.round(Math.min(score, 100)),
      reason: generateReason(resource, tagMatches, careerGoals)
    };
  });
}

function averageSkillLevel(skills) {
  if (!skills || skills.length === 0) return 1; // beginner

  const levelMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  const avgLevel =
    skills.reduce((sum, s) => sum + (levelMap[s.proficiency] || 2), 0) / skills.length;
  return avgLevel;
}

function matchDifficulty(userLevel, resourceLevel) {
  const levelMap = { beginner: 1, intermediate: 2, advanced: 3 };
  const resourceLevelNum = levelMap[resourceLevel] || 2;

  // Best match is current level or one above
  if (resourceLevelNum === Math.ceil(userLevel)) return 1;
  if (Math.abs(resourceLevelNum - userLevel) <= 1) return 0.7;
  return 0.3;
}

function generateReason(resource, tagMatches, careerGoals) {
  if (tagMatches > 0) {
    return `Matches ${tagMatches}+ of your interests`;
  }
  if (careerGoals.length > 0) {
    return `Aligns with your career goals`;
  }
  return `Recommended for your role`;
}