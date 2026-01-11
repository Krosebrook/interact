import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_id, project_id } = await req.json();

    // Get task details
    const task = await base44.entities.Task.filter({ id: task_id });
    if (!task[0]) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get project and team members
    const project = await base44.entities.Project.filter({ id: project_id });
    const teamEmails = project[0]?.team_members || [];

    // Get profiles for team members
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: { $in: teamEmails }
    });

    // Get current workload for each member (count their active tasks)
    const allTasks = await base44.entities.Task.filter({
      project_id,
      status: { $in: ['todo', 'in_progress'] }
    });

    const workloadMap = allTasks.reduce((acc, t) => {
      if (t.assigned_to) {
        acc[t.assigned_to] = (acc[t.assigned_to] || 0) + 1;
      }
      return acc;
    }, {});

    // Use AI to suggest best assignee
    const suggestion = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest the best team member to assign this task to:

Task: ${task[0].task_name}
Description: ${task[0].description || 'N/A'}
Required Skills: ${task[0].required_skills?.join(', ') || 'None specified'}
Priority: ${task[0].priority}
Estimated Hours: ${task[0].estimated_hours || 'Unknown'}

Available Team Members:
${profiles.map(p => `
- ${p.user_email}
  Skills: ${p.skill_levels?.map(s => `${s.skill} (${s.level})`).join(', ') || 'None listed'}
  Expertise: ${p.expertise_areas?.join(', ') || 'None listed'}
  Current Workload: ${workloadMap[p.user_email] || 0} active tasks
  Department: ${p.department || 'N/A'}
`).join('\n')}

Recommend the best assignee considering:
1. Skill match
2. Current workload (prefer less busy members)
3. Expertise alignment
4. Task priority and complexity

Provide:
- recommended_email (best match)
- confidence_score (0-100)
- reasoning (why this person is the best choice)
- alternative_email (backup option)`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_email: { type: "string" },
          confidence_score: { type: "number" },
          reasoning: { type: "string" },
          alternative_email: { type: "string" }
        }
      }
    });

    // Update task with AI suggestion
    await base44.entities.Task.update(task_id, {
      ai_suggested_assignee: suggestion.recommended_email,
      ai_assignment_reason: suggestion.reasoning
    });

    return Response.json({
      success: true,
      suggestion
    });

  } catch (error) {
    console.error('Task assignment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});