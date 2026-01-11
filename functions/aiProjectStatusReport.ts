import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id } = await req.json();

    // Get project details
    const project = await base44.entities.Project.filter({ id: project_id });
    if (!project[0]) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const proj = project[0];

    // Get all tasks
    const tasks = await base44.entities.Task.filter({ project_id });

    // Get team members' profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: { $in: proj.team_members || [] }
    });

    // Calculate comprehensive statistics
    const statusBreakdown = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const priorityBreakdown = tasks.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    const completedThisWeek = tasks.filter(t => {
      if (!t.completed_date) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(t.completed_date) > weekAgo;
    }).length;

    // Generate AI status report
    const report = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive project status report:

PROJECT OVERVIEW:
Name: ${proj.project_name}
Description: ${proj.description || 'N/A'}
Status: ${proj.status}
Priority: ${proj.priority}
Progress: ${proj.progress_percentage}%
Risk Score: ${proj.risk_score || 'Not analyzed'}
Predicted Delay: ${proj.predicted_delay_days || 0} days

TIMELINE:
Start Date: ${proj.start_date || 'N/A'}
Due Date: ${proj.due_date || 'N/A'}
Days Remaining: ${proj.due_date ? Math.ceil((new Date(proj.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : 'N/A'}

TASK BREAKDOWN:
Total Tasks: ${tasks.length}
By Status: ${JSON.stringify(statusBreakdown)}
By Priority: ${JSON.stringify(priorityBreakdown)}
Completed This Week: ${completedThisWeek}

TEAM:
Size: ${proj.team_members?.length || 0} members
Owner: ${proj.owner_email}

TOP TASKS:
${tasks.slice(0, 10).map(t => `- [${t.status}] ${t.task_name} (${t.priority} priority)${t.assigned_to ? ` - ${t.assigned_to}` : ' - Unassigned'}`).join('\n')}

Generate a professional status report with:
1. executive_summary (2-3 sentences overview)
2. progress_highlights (array of key accomplishments)
3. current_challenges (array of issues/blockers)
4. upcoming_milestones (array of next key deliverables)
5. team_performance (brief assessment)
6. recommendations (array of action items)
7. overall_health (excellent/good/fair/at_risk/critical)`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          progress_highlights: { type: "array", items: { type: "string" } },
          current_challenges: { type: "array", items: { type: "string" } },
          upcoming_milestones: { type: "array", items: { type: "string" } },
          team_performance: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          overall_health: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      report,
      generated_at: new Date().toISOString(),
      project_name: proj.project_name,
      statistics: {
        totalTasks: tasks.length,
        statusBreakdown,
        priorityBreakdown,
        completedThisWeek,
        teamSize: proj.team_members?.length || 0
      }
    });

  } catch (error) {
    console.error('Status report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});