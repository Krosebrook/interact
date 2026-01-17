import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { challenge_id } = await req.json();

    if (!challenge_id) {
      return Response.json({ error: 'challenge_id required' }, { status: 400 });
    }

    // Fetch challenge and progress data
    const [challenge, progressRecords, profiles] = await Promise.all([
      base44.asServiceRole.entities.TeamChallenge.filter({ id: challenge_id }).then(r => r[0]),
      base44.asServiceRole.entities.TeamChallengeProgress.filter({ challenge_id }),
      base44.asServiceRole.entities.UserProfile.list()
    ]);

    if (!challenge) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Sort by current_value descending
    const sortedProgress = progressRecords.sort((a, b) => b.current_value - a.current_value);

    // Assign ranks and calculate completion percentages
    const leaderboard = sortedProgress.map((record, index) => {
      const profile = profiles.find(p => p.user_email === record.user_email);
      const completionPct = challenge.target_metric?.target_value 
        ? Math.min(100, (record.current_value / challenge.target_metric.target_value) * 100)
        : 0;

      return {
        rank: index + 1,
        user_email: record.user_email,
        user_name: profile?.display_name || record.user_email,
        avatar_url: profile?.avatar_url,
        current_value: record.current_value,
        completion_percentage: Math.round(completionPct),
        milestones_achieved: record.milestones_achieved || [],
        badges_earned: record.badges_earned || [],
        points_earned: record.points_earned || 0,
        is_current_user: record.user_email === user.email
      };
    });

    // Calculate challenge statistics
    const stats = {
      total_participants: leaderboard.length,
      average_progress: leaderboard.reduce((sum, r) => sum + r.completion_percentage, 0) / leaderboard.length || 0,
      completed_count: leaderboard.filter(r => r.completion_percentage >= 100).length,
      target_value: challenge.target_metric?.target_value,
      total_progress: leaderboard.reduce((sum, r) => sum + r.current_value, 0)
    };

    return Response.json({
      success: true,
      challenge: {
        id: challenge.id,
        name: challenge.challenge_name,
        description: challenge.description,
        end_date: challenge.end_date,
        status: challenge.status
      },
      leaderboard,
      stats,
      current_user_rank: leaderboard.find(r => r.is_current_user)?.rank || null
    });

  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});