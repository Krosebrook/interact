import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await req.json();

    if (!itemId) {
      return Response.json({ error: 'Item ID required' }, { status: 400 });
    }

    // Get item
    const items = await base44.entities.StoreItem.filter({ id: itemId });
    const item = items[0];

    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    if (!item.is_available) {
      return Response.json({ error: 'Item not available' }, { status: 400 });
    }

    if (item.is_premium && !item.points_cost) {
      return Response.json({ error: 'This item requires payment' }, { status: 400 });
    }

    // Check stock
    if (item.stock_quantity !== null && item.stock_quantity < quantity) {
      return Response.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const totalCost = item.points_cost * quantity;

    // Get user points
    const userPointsList = await base44.entities.UserPoints.filter({ user_email: user.email });
    let userPoints = userPointsList[0];

    if (!userPoints) {
      return Response.json({ error: 'No points balance found' }, { status: 400 });
    }

    if (userPoints.available_points < totalCost) {
      return Response.json({ 
        error: 'Insufficient points',
        required: totalCost,
        available: userPoints.available_points
      }, { status: 400 });
    }

    // Check if user already owns this item (for non-consumables)
    if (item.category !== 'power_up' && item.category !== 'badge_boost') {
      const existing = await base44.entities.UserInventory.filter({
        user_email: user.email,
        item_id: itemId
      });
      if (existing.length > 0) {
        return Response.json({ error: 'You already own this item' }, { status: 400 });
      }
    }

    // Create transaction
    const transaction = await base44.asServiceRole.entities.StoreTransaction.create({
      user_email: user.email,
      item_id: itemId,
      item_name: item.name,
      transaction_type: 'points',
      points_spent: totalCost,
      quantity,
      status: 'completed'
    });

    // Deduct points
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
      available_points: userPoints.available_points - totalCost,
      points_history: [
        ...(userPoints.points_history || []),
        {
          amount: -totalCost,
          reason: `Purchased ${item.name}`,
          source: 'store_purchase',
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Calculate expiration for power-ups
    let expiresAt = null;
    if (item.effect_config?.duration_hours) {
      expiresAt = new Date(Date.now() + item.effect_config.duration_hours * 60 * 60 * 1000).toISOString();
    }

    // Add to inventory
    const inventoryItem = await base44.asServiceRole.entities.UserInventory.create({
      user_email: user.email,
      item_id: itemId,
      item_name: item.name,
      item_category: item.category,
      item_rarity: item.rarity,
      acquisition_type: 'points',
      transaction_id: transaction.id,
      acquired_at: new Date().toISOString(),
      expires_at: expiresAt,
      is_active: true
    });

    // Update purchase count
    await base44.asServiceRole.entities.StoreItem.update(itemId, {
      purchase_count: (item.purchase_count || 0) + quantity,
      stock_quantity: item.stock_quantity !== null ? item.stock_quantity - quantity : null
    });

    // If power-up, activate it on user avatar
    if (item.category === 'power_up' && item.effect_config) {
      const avatars = await base44.entities.UserAvatar.filter({ user_email: user.email });
      let avatar = avatars[0];

      const powerUp = {
        item_id: itemId,
        effect_type: item.effect_config.type,
        multiplier: item.effect_config.multiplier || 1,
        expires_at: expiresAt
      };

      if (avatar) {
        await base44.asServiceRole.entities.UserAvatar.update(avatar.id, {
          active_power_ups: [...(avatar.active_power_ups || []), powerUp],
          last_updated: new Date().toISOString()
        });
      } else {
        await base44.asServiceRole.entities.UserAvatar.create({
          user_email: user.email,
          active_power_ups: [powerUp],
          last_updated: new Date().toISOString()
        });
      }
    }

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: user.email,
      title: 'Purchase Complete!',
      message: `${item.name} has been added to your inventory.`,
      type: 'success',
      icon: '🛍️'
    });

    return Response.json({
      success: true,
      item: {
        id: inventoryItem.id,
        name: item.name,
        category: item.category
      },
      points_spent: totalCost,
      remaining_points: userPoints.available_points - totalCost,
      expires_at: expiresAt
    });

  } catch (error) {
    console.error('Purchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});