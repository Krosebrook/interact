import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { new_hire_email, role, department, start_date, duration_weeks } = await req.json();

    // Fetch relevant data
    const [skills, knowledgeBase, teamMembers] = await Promise.all([
      base44.entities.Skill.list(),
      base44.entities.KnowledgeBase.filter({ status: 'published' }),
      base44.entities.UserProfile.filter({ department })
    ]);

    // AI-powered onboarding plan generation
    const prompt = `You are an HR onboarding specialist. Create a comprehensive ${duration_weeks || 12}-week onboarding plan for a new hire.

Role: ${role}
Department: ${department}
Company: Remote-first tech company (50-200 employees)

Available Resources:
- Knowledge Base Articles: ${knowledgeBase.slice(0, 20).map(kb => `"${kb.title}" (${kb.category})`).join(', ')}
- Team Members: ${teamMembers.slice(0, 10).map(tm => tm.user_email).join(', ')}
- Company Skills Focus: ${skills.slice(0, 15).map(s => s.skill_name).join(', ')}

Create a structured onboarding plan with:
1. Week-by-week tasks and milestones
2. Mix of administrative, technical, social, and learning activities
3. Team introductions schedule
4. Knowledge base articles to read
5. Key milestones at weeks 1, 4, 8, and 12

Respond with JSON: {
  "key_milestones": [{"week": 1, "milestone": "...", "completed": false}],
  "tasks": [{
    "title": "...",
    "description": "...",
    "category": "administrative|technical|social|learning|milestone",
    "priority": "low|medium|high",
    "week_number": 1,
    "assignee": "new_hire|manager|hr|buddy",
    "knowledge_base_articles": ["article_title1"]
  }],
  "team_introductions": ["email1@company.com"],
  "recommended_skills": ["skill1", "skill2"],
  "success_metrics": ["metric1", "metric2"]
}`;

    const aiPlan = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          key_milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week: { type: "number" },
                milestone: { type: "string" },
                completed: { type: "boolean" }
              }
            }
          },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                priority: { type: "string" },
                week_number: { type: "number" },
                assignee: { type: "string" },
                knowledge_base_articles: { type: "array", items: { type: "string" } }
              }
            }
          },
          team_introductions: { type: "array", items: { type: "string" } },
          recommended_skills: { type: "array", items: { type: "string" } },
          success_metrics: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Match KB articles by title
    const tasksWithArticleIds = aiPlan.tasks.map(task => ({
      ...task,
      knowledge_base_articles: knowledgeBase
        .filter(kb => task.knowledge_base_articles.some(title => kb.title.includes(title) || title.includes(kb.title)))
        .map(kb => kb.id)
    }));

    return Response.json({
      ...aiPlan,
      tasks: tasksWithArticleIds,
      plan_data: {
        new_hire_email,
        role,
        department,
        start_date,
        duration_weeks: duration_weeks || 12
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});