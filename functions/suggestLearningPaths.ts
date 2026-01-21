import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, target_skills, career_goal } = await req.json();

    // Only allow users to get suggestions for themselves unless admin
    if (user_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch user's current skills
    const [userSkills, allSkills, knowledgeBase] = await Promise.all([
      base44.entities.UserSkill.filter({ user_email: user_email || user.email }),
      base44.entities.Skill.list(),
      base44.entities.KnowledgeBase.filter({ status: 'published' })
    ]);

    const currentSkillIds = userSkills.map(us => us.skill_id);
    const currentSkills = allSkills.filter(s => currentSkillIds.includes(s.id));

    // Get target skills details
    const targetSkillsDetails = target_skills 
      ? allSkills.filter(s => target_skills.includes(s.skill_name))
      : [];

    // AI-powered learning path generation
    const prompt = `You are a career development advisor. Create a personalized learning path for an employee.

Current Skills:
${currentSkills.map(s => `- ${s.skill_name} (${s.category})`).join('\n')}

Target Skills/Goal: ${target_skills?.join(', ') || career_goal || 'General skill development'}

Available Learning Resources:
${knowledgeBase.slice(0, 30).map(kb => `
- "${kb.title}" (Category: ${kb.category})
  Summary: ${kb.summary}
  Tags: ${kb.tags?.join(', ')}
`).join('\n')}

Create a learning path that:
1. Identifies skill gaps between current and target
2. Suggests progression steps (beginner -> intermediate -> advanced)
3. Recommends specific knowledge base articles
4. Estimates time commitment
5. Provides milestones

Respond with JSON: {
  "skill_gaps": [{"skill": "...", "current": "none|beginner|...", "target": "..."}],
  "learning_path": [{
    "step": 1,
    "skill": "...",
    "goal": "...",
    "resources": ["article_id1", "article_id2"],
    "estimated_weeks": 2,
    "prerequisites": []
  }],
  "milestones": [{"week": 4, "achievement": "..."}],
  "total_duration_weeks": 12
}`;

    const aiPath = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          skill_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                current: { type: "string" },
                target: { type: "string" }
              }
            }
          },
          learning_path: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "number" },
                skill: { type: "string" },
                goal: { type: "string" },
                resources: { type: "array", items: { type: "string" } },
                estimated_weeks: { type: "number" },
                prerequisites: { type: "array", items: { type: "string" } }
              }
            }
          },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week: { type: "number" },
                achievement: { type: "string" }
              }
            }
          },
          total_duration_weeks: { type: "number" }
        }
      }
    });

    // Match resource IDs to actual articles
    const enrichedPath = aiPath.learning_path.map(step => {
      const matchedResources = knowledgeBase.filter(kb => 
        step.resources.some(resId => kb.id === resId || kb.title.includes(resId))
      );
      return { ...step, matched_resources: matchedResources };
    });

    return Response.json({
      ...aiPath,
      learning_path: enrichedPath,
      current_skills: currentSkills.map(s => s.skill_name),
      user_email: user_email || user.email
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});