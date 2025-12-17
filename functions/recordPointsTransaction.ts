/**
 * RECORD POINTS TRANSACTION
 * Append-only ledger for point changes with running balance
 * Prevents "who edited the totals?" issues
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      userEmail, 
      amount, 
      transactionType, 
      referenceType, 
      referenceId, 
      description 
    } = await req.json();

    // Validate
    if (!userEmail || amount === undefined || !transactionType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current UserPoints record
    const userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter({ 
      user_email: userEmail 
    });
    
    let userPoints = userPointsRecords[0];
    if (!userPoints) {
      // Create if doesn't exist
      userPoints = await base44.asServiceRole.entities.UserPoints.create({
        user_email: userEmail,
        total_points: 0,
        available_points: 0,
        lifetime_points: 0,
        level: 1,
        events_attended: 0,
        activities_completed: 0,
        feedback_submitted: 0,
        badges_earned: []
      });
    }

    // Calculate new balance
    const currentBalance = userPoints.total_points || 0;
    const newBalance = Math.max(0, currentBalance + amount); // Don't go negative

    // Create ledger entry (append-only)
    const ledgerEntry = await base44.asServiceRole.entities.PointsLedger.create({
      user_email: userEmail,
      amount,
      transaction_type: transactionType,
      reference_type: referenceType,
      reference_id: referenceId,
      description: description || `${transactionType}: ${amount > 0 ? '+' : ''}${amount} points`,
      processed_by: currentUser.email,
      balance_after: newBalance,
      metadata: {
        processed_at: new Date().toISOString()
      }
    });

    // Update UserPoints record (single source of truth for current balance)
    const updateData = {
      total_points: newBalance,
      available_points: newBalance
    };

    // Update lifetime points if positive transaction
    if (amount > 0) {
      updateData.lifetime_points = (userPoints.lifetime_points || 0) + amount;
    }

    // Recalculate level based on lifetime points
    const LEVEL_THRESHOLDS = [
      { level: 1, points: 0 },
      { level: 2, points: 100 },
      { level: 3, points: 300 },
      { level: 4, points: 600 },
      { level: 5, points: 1000 },
      { level: 6, points: 1500 },
      { level: 7, points: 2100 },
      { level: 8, points: 2800 },
      { level: 9, points: 3600 },
      { level: 10, points: 5000 }
    ];

    const lifetimePoints = updateData.lifetime_points || userPoints.lifetime_points || 0;
    const newLevel = LEVEL_THRESHOLDS.reduce((level, threshold) => {
      return lifetimePoints >= threshold.points ? threshold.level : level;
    }, 1);

    updateData.level = newLevel;

    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, updateData);

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'points_adjusted',
      actor_email: currentUser.email,
      actor_role: currentUser.role === 'admin' ? 'admin' : 'system',
      target_email: userEmail,
      entity_type: 'PointsLedger',
      entity_id: ledgerEntry.id,
      changes: {
        before: { balance: currentBalance },
        after: { balance: newBalance }
      },
      severity: 'low',
      metadata: {
        transaction_type: transactionType,
        amount
      }
    });

    return Response.json({ 
      success: true,
      ledger_entry: ledgerEntry,
      new_balance: newBalance,
      level: newLevel
    });

  } catch (error) {
    console.error('recordPointsTransaction error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});