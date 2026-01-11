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

    // Get all tasks for this project
    const tasks = await base44.entities.Task.filter({ project_id });

    // Get team communication (channel messages, event attendance)
    const channels = await base44.entities.Channel.list();
    const recentMessages = await base44.entities.ChannelMessage.filter({}, '-created_date', 50);

    // Calculate project metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < new Date();
    }).length;

    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate days until due date
    const daysUntilDue = proj.due_date ? 
      Math.ceil((new Date(proj.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    // Use AI to analyze risks
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze project risks and predict potential delays:

Project: ${proj.project_name}
Status: ${proj.status}
Priority: ${proj.priority}
Days Until Due: ${daysUntilDue || 'No deadline'}
Progress: ${Math.round(progressPercentage)}%

Task Statistics:
- Total Tasks: ${totalTasks}
- Completed: ${completedTasks}
- Blocked: ${blockedTasks}
- Overdue: ${overdueTasks}
- In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
- Unassigned: ${tasks.filter(t => !t.assigned_to).length}

Team Size: ${proj.team_members?.length || 0} members

Recent Activity:
- Recent messages: ${recentMessages.length} in last 50
- Active channels: ${channels.length}

Analyze and provide:
1. risk_score (0-100, where 100 is highest risk)
2. risk_level (low/medium/high/critical)
3. predicted_delay_days (estimated delay in days, can be 0)
4. key_risks (array of specific risk factors)
5. recommendations (array of actionable recommendations)
6. confidence (0-100)`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_score: { type: "number" },
          risk_level: { type: "string" },
          predicted_delay_days: { type: "number" },
          key_risks: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          confidence: { type: "number" }
        }
      }
    });

    // Update project with risk analysis
    await base44.entities.Project.update(project_id, {
      risk_score: analysis.risk_score,
      predicted_delay_days: analysis.predicted_delay_days,
      last_risk_analysis: new Date().toISOString()
    });

    return Response.json({
      success: true,
      analysis,
      metrics: {
        totalTasks,
        completedTasks,
        blockedTasks,
        overdueTasks,
        progressPercentage: Math.round(progressPercentage),
        daysUntilDue
      }
    });

  } catch (error) {
    console.error('Risk analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});