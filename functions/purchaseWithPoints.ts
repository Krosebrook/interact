import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * REFACTORED STORE PURCHASE SYSTEM
 * Handles validation, transaction, inventory, and power-up activation
 * 
 * Input: { itemId, quantity? }
 * Output: { success, item, points_spent, remaining_points, expires_at? }
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONSUMABLE_CATEGORIES = ['power_up', 'badge_boost'];

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await req.json();
    
    if (!itemId) {
      return Response.json({ error: 'Item ID required' }, { status: 400 });
    }

    // Parallel fetch for performance
    const [items, userPointsList, existingInventory] = await Promise.all([
      base44.entities.StoreItem.filter({ id: itemId }),
      base44.entities.UserPoints.filter({ user_email: user.email }),
      base44.entities.UserInventory.filter({ user_email: user.email, item_id: itemId })
    ]);

    const item = items[0];
    const userPoints = userPointsList[0];

    // Validations
    const validation = validatePurchase(item, userPoints, quantity, existingInventory);
    if (validation.error) {
      return Response.json(validation, { status: 400 });
    }

    const totalCost = item.points_cost * quantity;

    // Process purchase
    const result = await processPurchase(base44, user, item, userPoints, totalCost, quantity);
    
    return Response.json(result);

  } catch (error) {
    console.error('Purchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ============================================================================
// VALIDATION
// ============================================================================

function validatePurchase(item, userPoints, quantity, existingInventory) {
  if (!item) {
    return { error: 'Item not found' };
  }
  
  if (!item.is_available) {
    return { error: 'Item not available' };
  }
  
  if (item.is_premium && !item.points_cost) {
    return { error: 'This item requires payment' };
  }
  
  if (item.stock_quantity !== null && item.stock_quantity < quantity) {
    return { error: 'Insufficient stock' };
  }
  
  if (!userPoints) {
    return { error: 'No points balance found' };
  }
  
  const totalCost = item.points_cost * quantity;
  if (userPoints.available_points < totalCost) {
    return {
      error: 'Insufficient points',
      required: totalCost,
      available: userPoints.available_points
    };
  }
  
  // Check duplicate ownership for non-consumables
  const isConsumable = CONSUMABLE_CATEGORIES.includes(item.category);
  if (!isConsumable && existingInventory.length > 0) {
    return { error: 'You already own this item' };
  }
  
  return { valid: true };
}

// ============================================================================
// PURCHASE PROCESSING
// ============================================================================

async function processPurchase(base44, user, item, userPoints, totalCost, quantity) {
  // 1. Create transaction
  const transaction = await base44.asServiceRole.entities.StoreTransaction.create({
    user_email: user.email,
    item_id: item.id,
    item_name: item.name,
    transaction_type: 'points',
    points_spent: totalCost,
    quantity,
    status: 'completed'
  });

  // 2. Deduct points
  const newHistory = [...(userPoints.points_history || []).slice(-49), {
    amount: -totalCost,
    reason: `Purchased ${item.name}`,
    source: 'store_purchase',
    timestamp: new Date().toISOString()
  }];

  await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
    available_points: userPoints.available_points - totalCost,
    points_history: newHistory
  });

  // 3. Calculate expiration for power-ups
  const expiresAt = item.effect_config?.duration_hours
    ? new Date(Date.now() + item.effect_config.duration_hours * 3600000).toISOString()
    : null;

  // 4. Add to inventory
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
    is_active: true,
    is_equipped: false
  });

  // 5. Update item stats
  await base44.asServiceRole.entities.StoreItem.update(item.id, {
    purchase_count: (item.purchase_count || 0) + quantity,
    stock_quantity: item.stock_quantity !== null ? item.stock_quantity - quantity : null
  });

  // 6. Activate power-up if applicable
  if (item.category === 'power_up' && item.effect_config) {
    await activatePowerUp(base44, user.email, item, expiresAt);
  }

  // 7. Send notification
  await base44.asServiceRole.entities.Notification.create({
    user_email: user.email,
    title: 'Purchase Complete! 🛍️',
    message: `${item.name} added to your inventory.`,
    type: 'success',
    is_read: false
  });

  return {
    success: true,
    item: {
      id: inventoryItem.id,
      name: item.name,
      category: item.category,
      rarity: item.rarity
    },
    points_spent: totalCost,
    remaining_points: userPoints.available_points - totalCost,
    expires_at: expiresAt
  };
}

// ============================================================================
// POWER-UP ACTIVATION
// ============================================================================

async function activatePowerUp(base44, userEmail, item, expiresAt) {
  try {
    const avatars = await base44.entities.UserAvatar.filter({ user_email: userEmail });
    
    const powerUp = {
      item_id: item.id,
      effect_type: item.effect_config.type,
      multiplier: item.effect_config.multiplier || 1,
      expires_at: expiresAt
    };

    if (avatars[0]) {
      const existingPowerUps = avatars[0].active_power_ups || [];
      await base44.asServiceRole.entities.UserAvatar.update(avatars[0].id, {
        active_power_ups: [...existingPowerUps, powerUp],
        last_updated: new Date().toISOString()
      });
    } else {
      await base44.asServiceRole.entities.UserAvatar.create({
        user_email: userEmail,
        active_power_ups: [powerUp],
        last_updated: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error('Power-up activation failed:', e);
  }
}