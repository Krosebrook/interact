import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reward_id, redemption_notes } = await req.json();

    if (!reward_id) {
      return Response.json({ error: 'Reward ID is required' }, { status: 400 });
    }

    // Fetch reward details
    const rewards = await base44.entities.Reward.filter({ id: reward_id });
    const reward = rewards[0];

    if (!reward) {
      return Response.json({ error: 'Reward not found' }, { status: 404 });
    }

    if (!reward.is_available) {
      return Response.json({ error: 'Reward is not available' }, { status: 400 });
    }

    // Check stock
    if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
      return Response.json({ error: 'Reward is out of stock' }, { status: 400 });
    }

    // Check expiry
    if (reward.expiry_date && new Date(reward.expiry_date) < new Date()) {
      return Response.json({ error: 'Reward has expired' }, { status: 400 });
    }

    // Get user points
    const userPointsRecords = await base44.entities.UserPoints.filter({ user_email: user.email });
    const userPoints = userPointsRecords[0];

    if (!userPoints) {
      return Response.json({ error: 'User points record not found' }, { status: 404 });
    }

    // Check if user has enough points
    if (userPoints.total_points < reward.points_cost) {
      return Response.json({ 
        error: 'Insufficient points',
        required: reward.points_cost,
        available: userPoints.total_points
      }, { status: 400 });
    }

    // Deduct points
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
      total_points: userPoints.total_points - reward.points_cost
    });

    // Create redemption record
    const redemption = await base44.asServiceRole.entities.RewardRedemption.create({
      user_email: user.email,
      user_name: user.full_name,
      reward_id: reward.id,
      reward_name: reward.reward_name,
      points_spent: reward.points_cost,
      status: 'pending',
      redemption_notes: redemption_notes || null
    });

    // Update reward stock if applicable
    if (reward.stock_quantity !== null) {
      await base44.asServiceRole.entities.Reward.update(reward.id, {
        stock_quantity: reward.stock_quantity - 1,
        popularity_score: (reward.popularity_score || 0) + 1
      });
    } else {
      await base44.asServiceRole.entities.Reward.update(reward.id, {
        popularity_score: (reward.popularity_score || 0) + 1
      });
    }

    return Response.json({
      success: true,
      redemption,
      remaining_points: userPoints.total_points - reward.points_cost
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});