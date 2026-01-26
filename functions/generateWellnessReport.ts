import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { challengeId, format = 'json' } = await req.json();
    
    // Fetch challenge data
    const challenge = await base44.entities.WellnessChallenge.get(challengeId);
    const logs = await base44.entities.WellnessLog.filter({ challenge_id: challengeId });
    const goals = await base44.entities.WellnessGoal.filter({ challenge_id: challengeId });
    
    // Aggregate statistics
    const participants = new Set(logs.map(l => l.user_email)).size;
    const totalLogs = logs.length;
    const averageValue = logs.reduce((sum, l) => sum + l.value, 0) / totalLogs || 0;
    const completionRate = goals.filter(g => g.status === 'completed').length / goals.length || 0;
    
    // Top performers
    const userStats = logs.reduce((acc, log) => {
      if (!acc[log.user_email]) {
        acc[log.user_email] = { total: 0, count: 0 };
      }
      acc[log.user_email].total += log.value;
      acc[log.user_email].count += 1;
      return acc;
    }, {});
    
    const topPerformers = Object.entries(userStats)
      .map(([email, stats]) => ({
        email,
        total: stats.total,
        average: stats.total / stats.count
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    
    const report = {
      challenge: {
        title: challenge.title,
        type: challenge.challenge_type,
        goal: `${challenge.goal_value} ${challenge.goal_unit}`,
        duration: `${challenge.start_date} to ${challenge.end_date}`
      },
      stats: {
        participants,
        totalLogs,
        averageValue: Math.round(averageValue),
        completionRate: Math.round(completionRate * 100),
        activeGoals: goals.filter(g => g.status === 'in_progress').length,
        completedGoals: goals.filter(g => g.status === 'completed').length
      },
      topPerformers,
      generatedAt: new Date().toISOString()
    };
    
    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});