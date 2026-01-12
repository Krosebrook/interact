import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting automated team check-ins...');
    const now = new Date();
    const dayOfWeek = now.toLocaleLowerCase().split('T')[0];

    // Get active check-in automations
    const automations = await base44.asServiceRole.entities.TeamAutomation.filter({
      automation_type: 'check_in',
      is_active: true
    });

    console.log(`Found ${automations.length} active check-in automations`);
    const results = [];

    for (const automation of automations) {
      // Get team details
      const teams = await base44.asServiceRole.entities.Team.filter({ id: automation.team_id });
      const team = teams[0];
      
      if (!team) continue;

      // Get team members
      const memberships = await base44.asServiceRole.entities.TeamMembership.filter({
        team_id: team.id
      });

      const recipients = automation.recipients?.length > 0 
        ? automation.recipients 
        : memberships.map(m => m.user_email);

      console.log(`Sending check-ins to ${recipients.length} members of team ${team.name}`);

      // Send notifications to each team member
      for (const email of recipients) {
        try {
          // Create notification
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            type: 'team_check_in',
            title: `${team.name} Check-In`,
            message: automation.custom_message || `Time for your ${automation.frequency} team check-in! Share your progress, blockers, and goals.`,
            link: `/teams/${team.id}/check-in`,
            priority: 'medium',
            is_read: false
          });

          // Send email if configured
          if (automation.notification_channel === 'email') {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: email,
              subject: `${team.name} - Team Check-In`,
              body: `
                <h2>Time for Your Team Check-In</h2>
                <p>${automation.custom_message || 'Please take a moment to share your progress with the team.'}</p>
                
                ${automation.questions?.length > 0 ? `
                  <h3>Questions to consider:</h3>
                  <ul>
                    ${automation.questions.map(q => `<li>${q}</li>`).join('')}
                  </ul>
                ` : ''}
                
                <p><a href="${Deno.env.get('APP_URL')}/teams/${team.id}/check-in">Submit Check-In</a></p>
              `
            });
          }

          results.push({ team: team.name, email, status: 'sent' });
        } catch (err) {
          console.error(`Failed to send check-in to ${email}:`, err.message);
          results.push({ team: team.name, email, status: 'failed', error: err.message });
        }
      }

      // Update automation
      await base44.asServiceRole.entities.TeamAutomation.update(automation.id, {
        last_run: now.toISOString()
      });
    }

    console.log(`Check-ins complete: ${results.filter(r => r.status === 'sent').length} sent, ${results.filter(r => r.status === 'failed').length} failed`);

    return Response.json({
      success: true,
      processed: automations.length,
      notifications_sent: results.filter(r => r.status === 'sent').length,
      results
    });

  } catch (error) {
    console.error('Error in sendTeamCheckIns:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});