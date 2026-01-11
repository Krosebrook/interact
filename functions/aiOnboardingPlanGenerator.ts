import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { user_email, role, department, job_title } = await req.json();

    // Get available knowledge base documents
    const knowledgeDocs = await base44.asServiceRole.entities.KnowledgeBase.filter({
      is_published: true
    });

    // Get available learning paths
    const learningPaths = await base44.asServiceRole.entities.LearningPath.filter({
      is_template: true
    });

    // Get company activities for reference
    const activities = await base44.asServiceRole.entities.Activity.list();

    // Use AI to create personalized onboarding plan
    const plan = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive onboarding plan for a new employee:

NEW HIRE INFO:
Email: ${user_email}
Role: ${role}
Department: ${department}
Job Title: ${job_title}

AVAILABLE RESOURCES:
Knowledge Base Documents (${knowledgeDocs.length} available):
${knowledgeDocs.slice(0, 15).map(d => `- ${d.title} (${d.category})`).join('\n')}

Learning Paths (${learningPaths.length} available):
${learningPaths.slice(0, 10).map(l => `- ${l.title} (${l.difficulty_level})`).join('\n')}

Company Activities: ${activities.length} available

Create a 30-day onboarding plan with:
1. week_1 (array of onboarding tasks for week 1)
2. week_2 (array of tasks for week 2)
3. week_3 (array of tasks for week 3)
4. week_4 (array of tasks for week 4)
5. recommended_documents (array of document IDs to read)
6. recommended_learning_paths (array of learning path IDs)
7. suggested_meetings (array of people/teams to meet)
8. key_milestones (array of 30-day goals)

Each task should have: title, description, day_number`,
      response_json_schema: {
        type: "object",
        properties: {
          week_1: { type: "array", items: { 
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              day_number: { type: "number" }
            }
          }},
          week_2: { type: "array", items: { 
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              day_number: { type: "number" }
            }
          }},
          week_3: { type: "array", items: { 
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              day_number: { type: "number" }
            }
          }},
          week_4: { type: "array", items: { 
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              day_number: { type: "number" }
            }
          }},
          recommended_documents: { type: "array", items: { type: "string" } },
          recommended_learning_paths: { type: "array", items: { type: "string" } },
          suggested_meetings: { type: "array", items: { type: "string" } },
          key_milestones: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create onboarding record
    const onboarding = await base44.asServiceRole.entities.UserOnboarding.create({
      user_email,
      status: 'not_started',
      plan_created_date: new Date().toISOString(),
      custom_plan: plan,
      milestones_completed: []
    });

    return Response.json({
      success: true,
      onboarding_id: onboarding.id,
      plan
    });

  } catch (error) {
    console.error('Onboarding plan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});