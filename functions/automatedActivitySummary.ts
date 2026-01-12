import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin access
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { team_id, period = 'week' } = await req.json();

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Get team info and members
    const team = await base44.asServiceRole.entities.Team.filter({ id: team_id });
    const memberships = await base44.asServiceRole.entities.TeamMembership.filter({ team_id });

    if (!team[0]) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }

    const memberEmails = memberships.map(m => m.user_email);

    // Gather activity data
    const [events, recognitions, surveyResponses, learningProgress] = await Promise.all([
      base44.asServiceRole.entities.Participation.filter({}),
      base44.asServiceRole.entities.Recognition.filter({}),
      base44.asServiceRole.entities.SurveyResponse.filter({}),
      base44.asServiceRole.entities.LearningPathProgress.filter({})
    ]);

    // Filter by team members and date range
    const teamEvents = events.filter(e => 
      memberEmails.includes(e.user_email) && 
      new Date(e.created_date) >= startDate &&
      e.attendance_status === 'attended'
    );

    const teamRecognitions = recognitions.filter(r => 
      (memberEmails.includes(r.from_user) || memberEmails.includes(r.to_user)) &&
      new Date(r.created_date) >= startDate
    );

    const teamSurveyResponses = surveyResponses.filter(s => 
      memberEmails.includes(s.user_email) &&
      new Date(s.created_date) >= startDate
    );

    const teamLearning = learningProgress.filter(l => 
      memberEmails.includes(l.user_email) &&
      l.status === 'completed' &&
      new Date(l.completed_date) >= startDate
    );

    // Use AI to generate summary
    const summaryPrompt = `Generate a concise team activity summary for ${team[0].name}:

Period: Last ${period}
Team size: ${memberEmails.length} members

Activity Data:
- Events attended: ${teamEvents.length}
- Recognition given: ${teamRecognitions.length}
- Survey responses: ${teamSurveyResponses.length}
- Learning paths completed: ${teamLearning.length}

Create a professional, encouraging summary highlighting:
1. Key achievements
2. Engagement level
3. Notable trends
4. Suggestions for next ${period}

Keep it under 200 words.`;

    const aiSummary = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: summaryPrompt
    });

    // Create announcement
    const announcement = await base44.asServiceRole.entities.Announcement.create({
      title: `${team[0].name} - ${period === 'week' ? 'Weekly' : 'Monthly'} Summary`,
      content: aiSummary,
      type: 'team_update',
      target_audience: 'team',
      team_id,
      priority: 'medium',
      is_active: true
    });

    // Notify team members
    const notifications = memberEmails.map(email => 
      base44.asServiceRole.entities.Notification.create({
        user_email: email,
        title: `📊 Team Activity Summary`,
        message: `Your ${period}ly team summary is ready!`,
        type: 'announcement',
        reference_type: 'Announcement',
        reference_id: announcement.id,
        priority: 'low'
      })
    );

    await Promise.all(notifications);

    return Response.json({
      success: true,
      summary: aiSummary,
      announcement_id: announcement.id,
      stats: {
        events: teamEvents.length,
        recognitions: teamRecognitions.length,
        surveys: teamSurveyResponses.length,
        learning: teamLearning.length
      }
    });

  } catch (error) {
    console.error('Activity summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});