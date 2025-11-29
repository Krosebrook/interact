import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Purchase store items with points
 * Handles validation, inventory management, and power-up activation
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await req.json();
    
    // Validate input
    if (!itemId) {
      return Response.json({ error: 'Item ID required' }, { status: 400 });
    }

    // Fetch item and user points in parallel
    const [items, userPointsList] = await Promise.all([
      base44.entities.StoreItem.filter({ id: itemId }),
      base44.entities.UserPoints.filter({ user_email: user.email })
    ]);

    const item = items[0];
    const userPoints = userPointsList[0];

    // Validate item
    const itemValidation = validateItem(item, quantity);
    if (itemValidation.error) {
      return Response.json({ error: itemValidation.error }, { status: 400 });
    }

    // Validate user points
    const totalCost = item.points_cost * quantity;
    const pointsValidation = validateUserPoints(userPoints, totalCost);
    if (pointsValidation.error) {
      return Response.json(pointsValidation, { status: 400 });
    }

    // Check for duplicate ownership (non-consumables)
    if (!isConsumable(item)) {
      const existing = await base44.entities.UserInventory.filter({
        user_email: user.email,
        item_id: itemId
      });
      if (existing.length > 0) {
        return Response.json({ error: 'You already own this item' }, { status: 400 });
      }
    }

    // Process purchase
    const result = await processPurchase(base44, user, item, userPoints, totalCost, quantity);
    
    return Response.json(result);

  } catch (error) {
    console.error('Purchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Validation helpers
function validateItem(item, quantity) {
  if (!item) return { error: 'Item not found' };
  if (!item.is_available) return { error: 'Item not available' };
  if (item.is_premium && !item.points_cost) return { error: 'This item requires payment' };
  if (item.stock_quantity !== null && item.stock_quantity < quantity) {
    return { error: 'Insufficient stock' };
  }
  return { valid: true };
}

function validateUserPoints(userPoints, totalCost) {
  if (!userPoints) return { error: 'No points balance found' };
  if (userPoints.available_points < totalCost) {
    return {
      error: 'Insufficient points',
      required: totalCost,
      available: userPoints.available_points
    };
  }
  return { valid: true };
}

function isConsumable(item) {
  return ['power_up', 'badge_boost'].includes(item.category);
}

// Process the purchase transaction
async function processPurchase(base44, user, item, userPoints, totalCost, quantity) {
  // Create transaction record
  const transaction = await base44.asServiceRole.entities.StoreTransaction.create({
    user_email: user.email,
    item_id: item.id,
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
      ...(userPoints.points_history || []).slice(-49),
      {
        amount: -totalCost,
        reason: `Purchased ${item.name}`,
        source: 'store_purchase',
        timestamp: new Date().toISOString()
      }
    ]
  });

  // Calculate expiration for power-ups
  const expiresAt = item.effect_config?.duration_hours
    ? new Date(Date.now() + item.effect_config.duration_hours * 60 * 60 * 1000).toISOString()
    : null;

  // Add to inventory
  const inventoryItem = await base44.asServiceRole.entities.UserInventory.create({
    user_email: user.email,
    item_id: item.id,
    item_name: item.name,
    item_category: item.category,
    item_rarity: item.rarity,
    acquisition_type: 'points',
    transaction_id: transaction.id,
    acquired_at: new Date().toISOString(),
    expires_at: expiresAt,
    is_active: true
  });

  // Update item stock and purchase count
  await base44.asServiceRole.entities.StoreItem.update(item.id, {
    purchase_count: (item.purchase_count || 0) + quantity,
    stock_quantity: item.stock_quantity !== null ? item.stock_quantity - quantity : null
  });

  // Activate power-up if applicable
  if (item.category === 'power_up' && item.effect_config) {
    await activatePowerUp(base44, user.email, item, expiresAt);
  }

  // Create notification
  await base44.asServiceRole.entities.Notification.create({
    user_email: user.email,
    title: 'Purchase Complete!',
    message: `${item.name} has been added to your inventory.`,
    type: 'success',
    icon: '🛍️'
  });

  return {
    success: true,
    item: {
      id: inventoryItem.id,
      name: item.name,
      category: item.category
    },
    points_spent: totalCost,
    remaining_points: userPoints.available_points - totalCost,
    expires_at: expiresAt
  };
}

// Activate power-up on user avatar
async function activatePowerUp(base44, userEmail, item, expiresAt) {
  const avatars = await base44.entities.UserAvatar.filter({ user_email: userEmail });
  
  const powerUp = {
    item_id: item.id,
    effect_type: item.effect_config.type,
    multiplier: item.effect_config.multiplier || 1,
    expires_at: expiresAt
  };

  if (avatars[0]) {
    await base44.asServiceRole.entities.UserAvatar.update(avatars[0].id, {
      active_power_ups: [...(avatars[0].active_power_ups || []), powerUp],
      last_updated: new Date().toISOString()
    });
  } else {
    await base44.asServiceRole.entities.UserAvatar.create({
      user_email: userEmail,
      active_power_ups: [powerUp],
      last_updated: new Date().toISOString()
    });
  }
}