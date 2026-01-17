import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch system-wide skill trend data
    const [userProfiles, teamChallenges, badges, recognitions, teamAnalytics] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.list(),
      base44.asServiceRole.entities.TeamChallenge.list(),
      base44.asServiceRole.entities.Badge.list(),
      base44.asServiceRole.entities.Recognition.list(),
      base44.asServiceRole.entities.TeamAnalytics.list()
    ]);

    // Analyze emerging skill trends
    const skillFrequency = {};
    userProfiles.forEach(p => {
      p.skills?.forEach(s => {
        skillFrequency[s.skill_name] = (skillFrequency[s.skill_name] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    const challengeTypes = {};
    teamChallenges.forEach(c => {
      challengeTypes[c.challenge_type] = (challengeTypes[c.challenge_type] || 0) + 1;
    });

    const recognitionCategories = {};
    recognitions.forEach(r => {
      recognitionCategories[r.category] = (recognitionCategories[r.category] || 0) + 1;
    });

    const prompt = `
    Based on the following system trends and user behavior, suggest new badge criteria that would encourage specific skills and behaviors.
    Focus on emerging skill trends, popular challenge types, and valued recognition categories.

    EMERGING SKILL TRENDS:
    ${topSkills.slice(0, 3).map(skill => `- ${skill} (increasing adoption across team)`).join('\n')}

    POPULAR CHALLENGE TYPES:
    ${Object.entries(challengeTypes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, count]) => `- ${type} (${count} challenges)`).join('\n')}

    RECOGNIZED BEHAVIORS:
    ${Object.entries(recognitionCategories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat, count]) => `- ${cat} (${count} recognitions)`).join('\n')}

    EXISTING BADGES COUNT: ${badges.length}

    Suggest 3-5 new badge criteria based on these trends. Each badge should:
    1. Encourage a specific emerging skill or behavior
    2. Have clear, measurable criteria
    3. Be achievable but challenging (not too common)

    OUTPUT JSON SCHEMA:
    {
      "suggested_badges": [
        {
          "badge_name": "string (unique, catchy name)",
          "badge_description": "string (what this badge represents)",
          "skill_trend": "string (why this skill is emerging)",
          "criteria_json": "string (JSON with conditions, e.g., {\"min_challenge_completions\": 5, \"skill_required\": \"Leadership\"})",
          "expected_rarity": "common|uncommon|rare|legendary",
          "user_behavior_insights": ["string (why users would value this badge)"]
        }
      ],
      "recommendation_notes": "string (overall insights about skill trends)"
    }
    `;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_badges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                badge_name: { type: "string" },
                badge_description: { type: "string" },
                skill_trend: { type: "string" },
                criteria_json: { type: "string" },
                expected_rarity: { type: "string" },
                user_behavior_insights: { type: "array", items: { type: "string" } }
              }
            }
          },
          recommendation_notes: { type: "string" }
        },
        required: ["suggested_badges"]
      }
    });

    // Store suggestions
    const savedSuggestions = [];
    for (const suggestion of aiResponse.suggested_badges) {
      const saved = await base44.asServiceRole.entities.BadgeCriteriaSuggestion.create({
        badge_name: suggestion.badge_name,
        badge_description: suggestion.badge_description,
        skill_trend: suggestion.skill_trend,
        criteria_json: suggestion.criteria_json,
        expected_rarity: suggestion.expected_rarity,
        user_behavior_insights: suggestion.user_behavior_insights,
        status: 'suggested'
      });
      savedSuggestions.push(saved);
    }

    return Response.json({ success: true, suggestions: savedSuggestions, notes: aiResponse.recommendation_notes });

  } catch (error) {
    console.error('Error generating badge suggestions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});