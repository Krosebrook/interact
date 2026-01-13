import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting team activity summaries...');
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Get active summary automations
    const automations = await base44.asServiceRole.entities.TeamAutomation.filter({
      automation_type: 'activity_summary',
      is_active: true
    });

    console.log(`Found ${automations.length} active summary automations`);
    const results = [];

    for (const automation of automations) {
      const teams = await base44.asServiceRole.entities.Team.filter({ id: automation.team_id });
      const team = teams[0];
      if (!team) continue;

      console.log(`Generating summary for team: ${team.name}`);

      // Get team data from the past period
      const [checkIns, goals, events, recognitions, messages] = await Promise.all([
        base44.asServiceRole.entities.TeamCheckIn.filter({
          team_id: team.id,
          check_in_date: { $gte: oneWeekAgo.toISOString() }
        }),
        base44.asServiceRole.entities.TeamGoal.filter({ team_id: team.id }),
        base44.asServiceRole.entities.Event.filter({
          team_id: team.id,
          scheduled_date: { $gte: oneWeekAgo.toISOString() }
        }),
        base44.asServiceRole.entities.Recognition.filter({
          created_date: { $gte: oneWeekAgo.toISOString() }
        }),
        base44.asServiceRole.entities.TeamMessage.filter({
          team_id: team.id,
          created_date: { $gte: oneWeekAgo.toISOString() }
        })
      ]);

      // Calculate metrics
      const totalCheckIns = checkIns.length;
      const avgMoodScore = checkIns.reduce((sum, c) => sum + (c.mood_score || 0), 0) / (totalCheckIns || 1);
      const membersNeedingHelp = checkIns.filter(c => c.needs_help).map(c => c.user_email);
      const blockerCount = checkIns.filter(c => c.blockers).length;
      
      const activeGoals = goals.filter(g => g.status === 'in_progress');
      const completedGoals = goals.filter(g => g.status === 'completed' && 
        new Date(g.updated_date) >= oneWeekAgo);
      const atRiskGoals = goals.filter(g => g.status === 'at_risk');
      
      const upcomingEvents = events.filter(e => new Date(e.scheduled_date) > now);
      const recentRecognitions = recognitions.filter(r => 
        r.recipient_email && team.members?.includes(r.recipient_email)
      );

      // Use AI to generate summary
      const summaryPrompt = `Generate a concise weekly team summary for ${team.name}.

Team Activity Data:
- ${totalCheckIns} team check-ins submitted
- Average mood score: ${avgMoodScore.toFixed(1)}/10
- ${blockerCount} members reported blockers
- ${membersNeedingHelp.length} members need help
- ${activeGoals.length} goals in progress
- ${completedGoals.length} goals completed this week
- ${atRiskGoals.length} goals at risk
- ${upcomingEvents.length} upcoming events
- ${recentRecognitions.length} team recognitions
- ${messages.length} team messages

Generate a summary that:
1. Highlights team morale and engagement
2. Celebrates accomplishments
3. Identifies areas of concern
4. Suggests actionable next steps
Keep it positive, actionable, and under 300 words.`;

      let aiSummary = '';
      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: summaryPrompt
        });
        aiSummary = response;
      } catch (err) {
        console.error('AI summary generation failed:', err);
        aiSummary = 'AI summary unavailable.';
      }

      // Get team members
      const memberships = await base44.asServiceRole.entities.TeamMembership.filter({
        team_id: team.id
      });
      const recipients = automation.recipients?.length > 0 
        ? automation.recipients 
        : memberships.map(m => m.user_email);

      console.log(`Sending summary to ${recipients.length} members`);

      // Send summary to team members
      for (const email of recipients) {
        try {
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            type: 'team_summary',
            title: `${team.name} Weekly Summary`,
            message: `Check out this week's team activity summary and highlights`,
            link: `/teams/${team.id}`,
            priority: 'low',
            is_read: false
          });

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `${team.name} - Weekly Activity Summary`,
            body: `
              <h2>${team.name} Weekly Summary</h2>
              <p><em>${new Date().toLocaleDateString()}</em></p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${aiSummary.replace(/\n/g, '<br>')}
              </div>
              
              <h3>📊 Key Metrics</h3>
              <ul>
                <li><strong>Check-Ins:</strong> ${totalCheckIns} submitted</li>
                <li><strong>Team Morale:</strong> ${avgMoodScore.toFixed(1)}/10</li>
                <li><strong>Active Goals:</strong> ${activeGoals.length}</li>
                <li><strong>Completed Goals:</strong> ${completedGoals.length}</li>
                <li><strong>Upcoming Events:</strong> ${upcomingEvents.length}</li>
                <li><strong>Team Recognitions:</strong> ${recentRecognitions.length}</li>
              </ul>
              
              ${atRiskGoals.length > 0 ? `
                <h3>⚠️ Goals Needing Attention</h3>
                <ul>
                  ${atRiskGoals.map(g => `<li>${g.goal_title} (${g.progress_percentage}% complete)</li>`).join('')}
                </ul>
              ` : ''}
              
              ${membersNeedingHelp.length > 0 ? `
                <h3>🤝 Team Members Needing Support</h3>
                <p>${membersNeedingHelp.length} team members indicated they need help. Consider reaching out.</p>
              ` : ''}
              
              <p><a href="${Deno.env.get('APP_URL')}/teams/${team.id}">View Team Dashboard</a></p>
            `
          });

          results.push({ team: team.name, email, status: 'sent' });
        } catch (err) {
          console.error(`Failed to send summary to ${email}:`, err.message);
          results.push({ team: team.name, email, status: 'failed', error: err.message });
        }
      }

      // Update automation
      await base44.asServiceRole.entities.TeamAutomation.update(automation.id, {
        last_run: now.toISOString()
      });
    }

    console.log(`Summaries complete: ${results.filter(r => r.status === 'sent').length} sent`);

    return Response.json({
      success: true,
      teams_processed: automations.length,
      summaries_sent: results.filter(r => r.status === 'sent').length,
      results
    });

  } catch (error) {
    console.error('Error in generateTeamSummary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});