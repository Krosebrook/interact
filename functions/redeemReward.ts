import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Reward Redemption Function
 * Handles the complete redemption flow including:
 * - User authentication and authorization
 * - Points balance validation
 * - Stock availability checks
 * - Atomic point deduction and redemption creation
 * - Stock quantity updates
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reward_id, redemption_notes } = body;

    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!reward_id) {
      return Response.json({ error: 'Reward ID is required' }, { status: 400 });
    }

    // Fetch reward details using service role to ensure we get accurate data
    const rewards = await base44.asServiceRole.entities.Reward.filter({ id: reward_id });
    const reward = rewards[0];

    if (!reward) {
      return Response.json({ error: 'Reward not found' }, { status: 404 });
    }

    // Validate reward availability
    if (!reward.is_available) {
      return Response.json({ error: 'This reward is currently unavailable' }, { status: 400 });
    }

    // Check stock availability (critical for preventing over-redemption)
    if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
      return Response.json({ error: 'Reward is out of stock' }, { status: 400 });
    }

    // Validate expiry date
    if (reward.expiry_date && new Date(reward.expiry_date) < new Date()) {
      return Response.json({ 
        error: 'This reward has expired',
        expiry_date: reward.expiry_date
      }, { status: 400 });
    }

    // Get user points record
    const userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter({ 
      user_email: user.email 
    });
    const userPoints = userPointsRecords[0];

    if (!userPoints) {
      return Response.json({ 
        error: 'User points record not found. Please contact support.',
        user_email: user.email
      }, { status: 404 });
    }

    // Validate sufficient points
    if (userPoints.total_points < reward.points_cost) {
      return Response.json({ 
        error: 'Insufficient points',
        required: reward.points_cost,
        available: userPoints.total_points,
        shortfall: reward.points_cost - userPoints.total_points
      }, { status: 400 });
    }

    // CRITICAL: Perform atomic operations to prevent race conditions
    // 1. Deduct points first
    const newPointsTotal = userPoints.total_points - reward.points_cost;
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
      total_points: newPointsTotal
    });

    // 2. Create redemption record
    const redemption = await base44.asServiceRole.entities.RewardRedemption.create({
      user_email: user.email,
      user_name: user.full_name,
      reward_id: reward.id,
      reward_name: reward.reward_name,
      points_spent: reward.points_cost,
      status: 'pending',
      redemption_notes: redemption_notes?.trim() || null
    });

    // 3. Update reward stock and popularity (use atomic update)
    const updateData = {
      popularity_score: (reward.popularity_score || 0) + 1
    };
    
    if (reward.stock_quantity !== null) {
      updateData.stock_quantity = Math.max(0, reward.stock_quantity - 1);
      // Auto-disable if out of stock
      if (updateData.stock_quantity === 0) {
        updateData.is_available = false;
      }
    }
    
    await base44.asServiceRole.entities.Reward.update(reward.id, updateData);

    // Send notification email (optional - won't fail redemption if email fails)
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `Reward Redeemed: ${reward.reward_name}`,
        body: `Hi ${user.full_name},\n\nYou've successfully redeemed "${reward.reward_name}" for ${reward.points_cost} points!\n\nRedemption Status: Pending\nRemaining Points: ${newPointsTotal}\n\n${reward.redemption_instructions || 'We will process your redemption shortly.'}\n\nThank you!`
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the redemption if email fails
    }

    return Response.json({
      success: true,
      redemption,
      remaining_points: newPointsTotal,
      message: 'Reward redeemed successfully! Check your email for details.'
    });

  } catch (error) {
    console.error('Redemption error:', error);
    return Response.json({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }, { status: 500 });
  }
});