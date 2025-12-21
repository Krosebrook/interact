import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Automated Onboarding Milestone Reminders
 * Run this function daily via cron job or scheduled task
 * Checks for upcoming onboarding milestones and sends reminders
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role for batch operations
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all active onboarding records
    const onboardingRecords = await base44.asServiceRole.entities.UserOnboarding.filter({
      status: 'in_progress'
    });

    const reminders = [];
    const now = new Date();

    for (const record of onboardingRecords) {
      const startDate = new Date(record.start_date);
      const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

      // Define milestone reminders (day-based)
      const milestones = [
        { day: 1, title: 'Day 1: Welcome!', message: 'Complete your profile and meet your team' },
        { day: 3, title: 'Day 3 Check-in', message: 'How are you settling in? Join your first team event' },
        { day: 7, title: 'Week 1 Complete', message: 'Great first week! Time for your first project' },
        { day: 14, title: '2-Week Milestone', message: 'You\'re halfway through onboarding. Share your feedback' },
        { day: 21, title: '3-Week Check-in', message: 'Almost there! Review your progress and goals' },
        { day: 28, title: 'Final Week', message: 'Prepare for your 30-day review and celebration' },
        { day: 30, title: 'Onboarding Complete!', message: 'Congratulations! Time to mark onboarding as done' }
      ];

      for (const milestone of milestones) {
        // Check if we're on a milestone day
        if (daysSinceStart === milestone.day) {
          // Create notification
          await base44.asServiceRole.entities.Notification.create({
            user_email: record.user_email,
            notification_type: 'onboarding_milestone',
            title: milestone.title,
            message: milestone.message,
            priority: milestone.day === 30 ? 'high' : 'medium',
            action_url: '/NewEmployeeOnboarding',
            is_read: false,
            metadata: {
              milestone_day: milestone.day,
              onboarding_id: record.id
            }
          });

          // Send email
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: record.user_email,
            subject: `INTeract Onboarding: ${milestone.title}`,
            body: `
              <h2>${milestone.title}</h2>
              <p>${milestone.message}</p>
              <p>Visit your <a href="${Deno.env.get('APP_URL') || 'https://your-app.base44.com'}/NewEmployeeOnboarding">onboarding dashboard</a> to continue your journey.</p>
              <p>Need help? Chat with our AI assistant anytime!</p>
            `
          });

          reminders.push({
            user: record.user_email,
            milestone: milestone.title,
            day: daysSinceStart
          });
        }
      }

      // Auto-complete onboarding after 35 days
      if (daysSinceStart >= 35 && record.status === 'in_progress') {
        await base44.asServiceRole.entities.UserOnboarding.update(record.id, {
          status: 'completed',
          completion_date: now.toISOString()
        });

        // Update profile
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({
          user_email: record.user_email
        });
        if (profiles[0]) {
          await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
            onboarding_completed: true
          });
        }
      }
    }

    return Response.json({
      success: true,
      reminders_sent: reminders.length,
      reminders
    });

  } catch (error) {
    console.error('Onboarding Reminders Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process reminders' 
    }, { status: 500 });
  }
});