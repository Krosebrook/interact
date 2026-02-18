import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automatically adjust challenge points based on difficulty and participation
 * Run as scheduled automation (daily)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch active challenges and participation data
    const challenges = await base44.asServiceRole.entities.Challenge.filter({ status: 'active' });
    
    const adjustments = [];

    for (const challenge of challenges) {
      try {
        // Get participation data
        const participations = await base44.asServiceRole.entities.ChallengeParticipation.filter({
          challenge_id: challenge.id
        });

        const totalParticipants = participations.length;
        const completions = participations.filter(p => p.status === 'completed').length;
        const activeCount = participations.filter(p => p.status === 'active').length;

        // Skip if not enough data
        if (totalParticipants < 3) continue;

        const completionRate = totalParticipants > 0 ? completions / totalParticipants : 0;
        const avgProgress = participations.length > 0
          ? participations.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / participations.length
          : 0;

        // Calculate difficulty score (0-100)
        let difficultyScore = 50; // baseline

        // Too easy: high completion rate
        if (completionRate > 0.7) difficultyScore = 30;
        else if (completionRate > 0.5) difficultyScore = 40;
        // Too hard: low completion rate
        else if (completionRate < 0.15) difficultyScore = 80;
        else if (completionRate < 0.3) difficultyScore = 70;

        // Adjust based on average progress
        if (avgProgress > 80 && completionRate < 0.4) difficultyScore += 10; // People trying but not completing
        if (avgProgress < 20) difficultyScore -= 10; // People giving up early

        // Calculate new points based on difficulty
        const originalPoints = challenge.points_reward || 100;
        let newPoints = originalPoints;

        // Easy challenge (< 40): reduce points by 20%
        if (difficultyScore < 40) {
          newPoints = Math.max(50, Math.floor(originalPoints * 0.8));
        }
        // Hard challenge (> 70): increase points by 30%
        else if (difficultyScore > 70) {
          newPoints = Math.floor(originalPoints * 1.3);
        }
        // Very hard (> 85): increase by 50%
        else if (difficultyScore > 85) {
          newPoints = Math.floor(originalPoints * 1.5);
        }

        // Participation bonus/penalty
        const participationRate = totalParticipants / (await base44.asServiceRole.entities.UserPoints.list()).length;
        
        // Low participation (< 10%): increase points to attract more
        if (participationRate < 0.1 && difficultyScore > 50) {
          newPoints = Math.floor(newPoints * 1.2);
        }

        // Cap at reasonable limits
        newPoints = Math.min(2000, Math.max(50, newPoints));

        // Only update if significant change (> 15%)
        const changePercent = Math.abs((newPoints - originalPoints) / originalPoints * 100);
        
        if (changePercent > 15 && newPoints !== originalPoints) {
          await base44.asServiceRole.entities.Challenge.update(challenge.id, {
            points_reward: newPoints,
            ai_generated: true,
            ai_suggestions: {
              previous_points: originalPoints,
              difficulty_score: difficultyScore,
              completion_rate: (completionRate * 100).toFixed(1),
              avg_progress: avgProgress.toFixed(1),
              adjusted_at: new Date().toISOString(),
              reason: difficultyScore > 70 
                ? 'Increased points due to high difficulty'
                : 'Decreased points due to low difficulty'
            }
          });

          adjustments.push({
            challenge_id: challenge.id,
            challenge_title: challenge.title,
            old_points: originalPoints,
            new_points: newPoints,
            change_percent: changePercent.toFixed(1),
            difficulty_score: difficultyScore,
            completion_rate: (completionRate * 100).toFixed(1) + '%',
            participants: totalParticipants
          });
        }

      } catch (challengeError) {
        console.error(`Error adjusting challenge ${challenge.id}:`, challengeError);
        // Continue with next challenge
      }
    }

    return Response.json({
      success: true,
      adjustments_made: adjustments.length,
      challenges_analyzed: challenges.length,
      adjustments
    });

  } catch (error) {
    console.error('Dynamic points adjuster error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});