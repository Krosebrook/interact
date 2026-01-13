import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting goal reminders...');
    const now = new Date();

    // Get all active goals that need reminders
    const goals = await base44.asServiceRole.entities.TeamGoal.filter({
      status: { $in: ['not_started', 'in_progress', 'at_risk'] },
      reminder_frequency: { $ne: 'none' }
    });

    console.log(`Found ${goals.length} goals to check for reminders`);
    const results = [];

    for (const goal of goals) {
      // Check if reminder is due
      const lastReminder = goal.last_reminder_sent ? new Date(goal.last_reminder_sent) : null;
      let shouldSend = false;

      if (!lastReminder) {
        shouldSend = true;
      } else {
        const daysSinceLastReminder = (now - lastReminder) / (1000 * 60 * 60 * 24);
        
        switch (goal.reminder_frequency) {
          case 'daily':
            shouldSend = daysSinceLastReminder >= 1;
            break;
          case 'weekly':
            shouldSend = daysSinceLastReminder >= 7;
            break;
          case 'biweekly':
            shouldSend = daysSinceLastReminder >= 14;
            break;
          case 'monthly':
            shouldSend = daysSinceLastReminder >= 30;
            break;
        }
      }

      if (!shouldSend) continue;

      // Get team
      const teams = await base44.asServiceRole.entities.Team.filter({ id: goal.team_id });
      const team = teams[0];
      if (!team) continue;

      // Calculate days until target
      const daysUntilTarget = Math.ceil((new Date(goal.target_date) - now) / (1000 * 60 * 60 * 24));
      const isUrgent = daysUntilTarget <= 7 && daysUntilTarget > 0;
      const isOverdue = daysUntilTarget < 0;

      console.log(`Sending reminder for goal: ${goal.goal_title} (${daysUntilTarget} days until target)`);

      // Send to assigned members or creator
      const recipients = goal.assigned_to?.length > 0 ? goal.assigned_to : [goal.created_by];

      for (const email of recipients) {
        try {
          const priority = isOverdue ? 'high' : (isUrgent ? 'medium' : 'low');
          
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            type: 'goal_reminder',
            title: `Goal Reminder: ${goal.goal_title}`,
            message: isOverdue 
              ? `This goal is ${Math.abs(daysUntilTarget)} days overdue. Current progress: ${goal.progress_percentage}%`
              : `Goal due in ${daysUntilTarget} days. Current progress: ${goal.progress_percentage}%`,
            link: `/teams/${team.id}?tab=goals`,
            priority,
            is_read: false
          });

          // Send email
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `${isOverdue ? '⚠️ ' : ''}Goal Reminder: ${goal.goal_title}`,
            body: `
              <h2>Team Goal Progress Update</h2>
              <p><strong>Team:</strong> ${team.name}</p>
              <p><strong>Goal:</strong> ${goal.goal_title}</p>
              <p><strong>Progress:</strong> ${goal.progress_percentage}% complete</p>
              <p><strong>Status:</strong> ${goal.status}</p>
              <p><strong>Target Date:</strong> ${new Date(goal.target_date).toLocaleDateString()}</p>
              
              ${isOverdue 
                ? `<p style="color: red; font-weight: bold;">⚠️ This goal is ${Math.abs(daysUntilTarget)} days overdue</p>`
                : `<p>⏰ ${daysUntilTarget} days remaining</p>`
              }
              
              ${goal.milestones?.length > 0 ? `
                <h3>Milestones:</h3>
                <ul>
                  ${goal.milestones.map(m => `
                    <li>${m.completed ? '✅' : '⭕'} ${m.title}</li>
                  `).join('')}
                </ul>
              ` : ''}
              
              <p><a href="${Deno.env.get('APP_URL')}/teams/${team.id}?tab=goals">Update Goal Progress</a></p>
            `
          });

          results.push({ goal: goal.goal_title, email, status: 'sent' });
        } catch (err) {
          console.error(`Failed to send reminder to ${email}:`, err.message);
          results.push({ goal: goal.goal_title, email, status: 'failed', error: err.message });
        }
      }

      // Update last reminder time
      await base44.asServiceRole.entities.TeamGoal.update(goal.id, {
        last_reminder_sent: now.toISOString()
      });
    }

    console.log(`Reminders complete: ${results.filter(r => r.status === 'sent').length} sent, ${results.filter(r => r.status === 'failed').length} failed`);

    return Response.json({
      success: true,
      goals_processed: goals.length,
      reminders_sent: results.filter(r => r.status === 'sent').length,
      results
    });

  } catch (error) {
    console.error('Error in sendGoalReminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});