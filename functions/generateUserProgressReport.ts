import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userEmail, startDate, endDate } = await req.json();
    
    // Only allow users to view their own report or admins to view any
    if (userEmail !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch all user data for date range
    const [userPoints] = await base44.entities.UserPoints.filter({ user_email: userEmail });
    const personalGoals = await base44.entities.PersonalGoal.filter({ user_email: userEmail });
    const wellnessGoals = await base44.entities.WellnessGoal.filter({ user_email: userEmail });
    const participations = await base44.entities.Participation.filter({ user_email: userEmail });
    const recognitionsGiven = await base44.entities.Recognition.filter({ sender_email: userEmail });
    const recognitionsReceived = await base44.entities.Recognition.filter({ recipient_email: userEmail });
    const badgeAwards = await base44.entities.BadgeAward.filter({ user_email: userEmail });
    
    // Calculate metrics
    const completedPersonalGoals = personalGoals.filter(g => g.status === 'completed').length;
    const completedWellnessGoals = wellnessGoals.filter(g => g.status === 'completed').length;
    const eventsAttended = participations.filter(p => p.status === 'attended').length;
    
    const report = {
      user_email: userEmail,
      report_period: { start: startDate, end: endDate },
      overview: {
        total_points: userPoints?.total_points || 0,
        current_level: userPoints?.current_level || 1,
        badges_earned: badgeAwards.length,
        current_streak: userPoints?.current_streak || 0,
        longest_streak: userPoints?.longest_streak || 0
      },
      goals_summary: {
        personal_goals: {
          total: personalGoals.length,
          completed: completedPersonalGoals,
          in_progress: personalGoals.filter(g => g.status === 'active').length,
          completion_rate: personalGoals.length > 0 ? (completedPersonalGoals / personalGoals.length) * 100 : 0
        },
        wellness_goals: {
          total: wellnessGoals.length,
          completed: completedWellnessGoals,
          in_progress: wellnessGoals.filter(g => g.status === 'in_progress').length,
          avg_progress: wellnessGoals.length > 0 
            ? wellnessGoals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / wellnessGoals.length 
            : 0
        }
      },
      engagement: {
        events_attended: eventsAttended,
        recognitions_sent: recognitionsGiven.length,
        recognitions_received: recognitionsReceived.length,
        participation_rate: participations.length > 0 
          ? (eventsAttended / participations.length) * 100 
          : 0
      },
      achievements: {
        recent_badges: badgeAwards.slice(-5).map(award => ({
          badge_id: award.badge_id,
          earned_date: award.earned_date
        })),
        completed_goals: personalGoals.filter(g => g.status === 'completed').slice(-5).map(g => ({
          title: g.title,
          completed_at: g.completed_at,
          points_awarded: g.points_reward
        }))
      },
      generated_at: new Date().toISOString()
    };
    
    return Response.json({ success: true, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});