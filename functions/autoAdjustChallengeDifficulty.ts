import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function runs as scheduled automation (no user auth needed)
    // Get all active personal challenges
    const activeGoals = await base44.asServiceRole.entities.PersonalGoal.filter({
      status: 'active'
    });
    
    const adjustments = [];
    
    for (const goal of activeGoals) {
      // Check progress rate
      const daysPassed = Math.floor(
        (new Date() - new Date(goal.start_date)) / (1000 * 60 * 60 * 24)
      );
      const totalDays = Math.floor(
        (new Date(goal.end_date) - new Date(goal.start_date)) / (1000 * 60 * 60 * 24)
      );
      
      const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
      const actualProgress = goal.progress_percentage || 0;
      const progressDelta = actualProgress - expectedProgress;
      
      // Adjust if significantly ahead or behind
      if (progressDelta > 30 && goal.difficulty !== 'hard') {
        // User is crushing it - increase difficulty
        const newTargetValue = Math.round(goal.target_value * 1.2);
        
        await base44.asServiceRole.entities.PersonalGoal.update(goal.id, {
          target_value: newTargetValue,
          difficulty: goal.difficulty === 'easy' ? 'medium' : 'hard',
          points_reward: Math.round((goal.points_reward || 0) * 1.3),
          dynamic_adjustments: [
            ...(goal.dynamic_adjustments || []),
            {
              adjusted_at: new Date().toISOString(),
              adjustment_type: 'difficulty_increase',
              reason: `User ${Math.round(progressDelta)}% ahead of schedule`,
              previous_value: goal.target_value,
              new_value: newTargetValue
            }
          ]
        });
        
        // Notify user
        await base44.asServiceRole.entities.Notification.create({
          user_email: goal.user_email,
          type: 'goal_adjustment',
          title: '🎯 Challenge Upgraded!',
          message: `You're crushing "${goal.title}"! We've increased the difficulty and point reward. Keep it up!`,
          read: false
        });
        
        adjustments.push({ goalId: goal.id, type: 'increase' });
      } else if (progressDelta < -30 && daysPassed > totalDays * 0.5) {
        // User is struggling - offer extension or reduce difficulty
        const extension = Math.ceil(totalDays * 0.2);
        const newEndDate = new Date(goal.end_date);
        newEndDate.setDate(newEndDate.getDate() + extension);
        
        await base44.asServiceRole.entities.PersonalGoal.update(goal.id, {
          end_date: newEndDate.toISOString().split('T')[0],
          dynamic_adjustments: [
            ...(goal.dynamic_adjustments || []),
            {
              adjusted_at: new Date().toISOString(),
              adjustment_type: 'time_extension',
              reason: `Extended deadline to maintain motivation`,
              previous_value: totalDays,
              new_value: totalDays + extension
            }
          ]
        });
        
        // Encouraging notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: goal.user_email,
          type: 'goal_adjustment',
          title: '⏰ More Time for Your Goal',
          message: `We extended "${goal.title}" by ${extension} days. You've got this! 💪`,
          read: false
        });
        
        adjustments.push({ goalId: goal.id, type: 'extension' });
      }
    }
    
    return Response.json({
      success: true,
      goalsAnalyzed: activeGoals.length,
      adjustmentsMade: adjustments.length,
      adjustments
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});