import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { requireAuth } from './lib/rbacMiddleware.ts';

/**
 * Track challenge completion and award points/badges
 * Called when user completes a challenge requirement
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 🔒 SECURITY: Require authentication
    const user = await requireAuth(base44);

    const { challenge_id, progress_value } = await req.json();

    if (!challenge_id) {
      return Response.json({ error: 'Missing challenge_id' }, { status: 400 });
    }

    // Get challenge details
    const challenge = await base44.entities.Challenge.get(challenge_id);
    if (!challenge) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // 🔒 SECURITY: User can ONLY update their own participation
    const participations = await base44.entities.ChallengeParticipation.filter({
      challenge_id,
      user_email: user.email
    });

    let participation = participations[0];
    if (!participation) {
      participation = await base44.entities.ChallengeParticipation.create({
        challenge_id,
        user_email: user.email,
        joined_date: new Date().toISOString(),
        status: 'active',
        progress: 0
      });
    }
    
    // 🔒 Double-check ownership
    if (participation.user_email !== user.email) {
      return Response.json({ error: 'Forbidden: Cannot update other users challenges' }, { status: 403 });
    }

    // Update progress
    const targetValue = challenge.target_metric?.target_value || 100;
    const newProgress = progress_value || (participation.progress || 0) + 1;
    const progressPercentage = Math.min((newProgress / targetValue) * 100, 100);
    const isCompleted = progressPercentage >= 100;

    const updateData = {
      progress: newProgress,
      progress_percentage: progressPercentage,
      status: isCompleted ? 'completed' : 'active'
    };

    if (isCompleted) {
      updateData.completed_date = new Date().toISOString();
      updateData.points_earned = challenge.points_reward || 0;
    }

    await base44.entities.ChallengeParticipation.update(participation.id, updateData);

    // Award points if completed
    if (isCompleted) {
      const userPointsRecords = await base44.entities.UserPoints.filter({ user_email: user.email });
      const userPoints = userPointsRecords[0];

      if (userPoints) {
        await base44.entities.UserPoints.update(userPoints.id, {
          total_points: (userPoints.total_points || 0) + (challenge.points_reward || 0),
          xp: (userPoints.xp || 0) + (challenge.points_reward || 0)
        });
      }

      // Update challenge completion count
      await base44.entities.Challenge.update(challenge_id, {
        completion_count: (challenge.completion_count || 0) + 1
      });

      return Response.json({
        success: true,
        completed: true,
        points_awarded: challenge.points_reward,
        message: 'Challenge completed! Points awarded.'
      });
    }

    return Response.json({
      success: true,
      completed: false,
      progress: newProgress,
      progress_percentage: progressPercentage
    });

  } catch (error) {
    // Structured error logging with full context
    const errorContext = {
      function: 'completeChallengeTracking',
      challenge_id: 'unknown',
      user_email: 'auth_failed',
      error_message: error.message,
      error_stack: error.stack,
      timestamp: new Date().toISOString()
    };

    // Try to extract context from request body if possible
    try {
      const bodyText = await req.text();
      const body = JSON.parse(bodyText);
      if (body.challenge_id) errorContext.challenge_id = body.challenge_id;
    } catch (parseError) {
      // Ignore parse errors for logging
    }

    console.error('Challenge tracking error:', errorContext);
    
    return Response.json({ 
      error: error.message || 'Failed to track challenge progress' 
    }, { status: 500 });
  }
});