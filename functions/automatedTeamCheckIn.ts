import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin access
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { team_id, questions = [] } = await req.json();

    // Get team members
    const memberships = await base44.asServiceRole.entities.TeamMembership.filter({ team_id });
    const team = await base44.asServiceRole.entities.Team.filter({ id: team_id });

    if (!team[0]) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }

    // Create a pulse survey for the team
    const defaultQuestions = questions.length > 0 ? questions : [
      { text: "How are you feeling about your work this week?", type: "rating" },
      { text: "What's one win you'd like to share?", type: "text" },
      { text: "What challenges are you facing?", type: "text" },
      { text: "Do you need any support from the team?", type: "text" }
    ];

    const survey = await base44.asServiceRole.entities.Survey.create({
      title: `Weekly Check-In: ${team[0].name}`,
      description: `Your weekly team check-in to share progress and challenges`,
      questions: defaultQuestions,
      is_anonymous: false,
      is_active: true,
      created_by: 'system',
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      target_audience: 'team',
      team_id
    });

    // Notify team members
    const notifications = memberships.map(member => 
      base44.asServiceRole.entities.Notification.create({
        user_email: member.user_email,
        title: '📋 Weekly Team Check-In',
        message: `Time for your weekly check-in with ${team[0].name}. Share your progress and challenges!`,
        type: 'survey',
        reference_type: 'Survey',
        reference_id: survey.id,
        priority: 'medium'
      })
    );

    await Promise.all(notifications);

    return Response.json({
      success: true,
      survey_id: survey.id,
      members_notified: memberships.length
    });

  } catch (error) {
    console.error('Team check-in error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});