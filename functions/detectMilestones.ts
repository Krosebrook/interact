/**
 * MILESTONE DETECTION FUNCTION
 * Scheduled job to detect upcoming birthdays and work anniversaries
 * Should run daily via cron job or Base44 scheduler
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This is a scheduled job - no user auth needed, use service role
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-12
    const todayDay = today.getDate();

    // Get all user profiles with birthdates or start dates
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const users = await base44.asServiceRole.entities.User.list();
    
    const milestonesCreated = [];

    for (const profile of profiles) {
      // Skip if user opted out of milestone celebrations
      if (profile.opt_out_milestones === true) continue;

      const user = users.find(u => u.email === profile.user_email);
      if (!user) continue;

      // Check Birthday
      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth);
        if (birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay) {
          // Check if milestone already exists for this year
          const existing = await base44.asServiceRole.entities.Milestone.filter({
            user_email: profile.user_email,
            milestone_type: 'birthday',
            milestone_date: today.toISOString().split('T')[0]
          });

          if (existing.length === 0) {
            const age = today.getFullYear() - birthDate.getFullYear();
            const milestone = await base44.asServiceRole.entities.Milestone.create({
              user_email: profile.user_email,
              milestone_type: 'birthday',
              milestone_date: today.toISOString().split('T')[0],
              title: `🎂 ${user.full_name}'s Birthday!`,
              celebration_message: `Happy Birthday, ${user.full_name}! 🎉 Wishing you a fantastic year ahead!`,
              celebration_status: 'upcoming',
              visibility: 'public'
            });
            milestonesCreated.push(milestone);
          }
        }
      }

      // Check Work Anniversary
      if (user.created_date) {
        const startDate = new Date(user.created_date);
        const yearsOfService = today.getFullYear() - startDate.getFullYear();
        
        if (yearsOfService > 0 && 
            startDate.getMonth() + 1 === todayMonth && 
            startDate.getDate() === todayDay) {
          
          // Check if milestone already exists
          const existing = await base44.asServiceRole.entities.Milestone.filter({
            user_email: profile.user_email,
            milestone_type: 'work_anniversary',
            milestone_date: today.toISOString().split('T')[0]
          });

          if (existing.length === 0) {
            const milestone = await base44.asServiceRole.entities.Milestone.create({
              user_email: profile.user_email,
              milestone_type: 'work_anniversary',
              milestone_date: today.toISOString().split('T')[0],
              milestone_year: yearsOfService,
              title: `🏆 ${user.full_name}'s ${yearsOfService}-Year Anniversary!`,
              celebration_message: `Congratulations on ${yearsOfService} ${yearsOfService === 1 ? 'year' : 'years'} with the team, ${user.full_name}! 🎊 Thank you for your dedication!`,
              celebration_status: 'upcoming',
              visibility: 'public'
            });
            milestonesCreated.push(milestone);
          }
        }
      }
    }

    // Send notifications for new milestones
    if (milestonesCreated.length > 0) {
      // Could integrate with notification service here
      // await base44.functions.invoke('sendMilestoneNotifications', { milestones: milestonesCreated });
    }

    return Response.json({
      success: true,
      milestonesCreated: milestonesCreated.length,
      milestones: milestonesCreated.map(m => ({
        user: m.user_email,
        type: m.milestone_type,
        title: m.title
      }))
    });

  } catch (error) {
    console.error('Milestone detection error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});