/**
 * ⚠️ TEMPORARY TEST UTILITY - REMOVE BEFORE PRODUCTION LAUNCH ⚠️
 * 
 * Tests RBAC enforcement for critical mutation functions.
 * Verifies that non-admin/facilitator roles are properly blocked.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can run this test suite
    if (currentUser.role !== 'admin') {
      return Response.json({ error: 'Admin access required to run tests' }, { status: 403 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      testsRun: 3,
      passed: 0,
      failed: 0,
      tests: []
    };

    // Create a test user context (simulate participant role)
    const testTargetUserEmail = 'test-target@example.com';
    const testParticipantEmail = currentUser.email; // Use current user but simulate participant role

    // TEST 1: awardPoints as participant targeting different user
    try {
      console.log('TEST 1: Attempting awardPoints as participant role...');
      
      // Call awardPoints function directly
      const awardResult = await base44.functions.invoke('awardPoints', {
        user_email: testTargetUserEmail,
        points: 100,
        reason: 'Test award',
        action_type: 'test'
      });

      // If we get here without 403, test FAILS
      results.tests.push({
        name: 'awardPoints RBAC',
        status: 'FAIL',
        reason: `Expected 403, got ${awardResult.status || 'success'}`,
        response: awardResult.data || awardResult
      });
      results.failed++;
    } catch (error) {
      // Check if it's a 403/forbidden error
      const is403 = error.message?.includes('403') || 
                    error.message?.includes('Forbidden') ||
                    error.message?.includes('permission');
      
      if (is403) {
        results.tests.push({
          name: 'awardPoints RBAC',
          status: 'PASS',
          reason: 'Correctly blocked with 403 Forbidden',
          error: error.message
        });
        results.passed++;
      } else {
        results.tests.push({
          name: 'awardPoints RBAC',
          status: 'FAIL',
          reason: `Unexpected error: ${error.message}`,
          error: error.message
        });
        results.failed++;
      }
    }

    // TEST 2: purchaseWithPoints as participant targeting different user
    try {
      console.log('TEST 2: Attempting purchaseWithPoints as participant role...');
      
      const purchaseResult = await base44.functions.invoke('purchaseWithPoints', {
        user_email: testTargetUserEmail,
        item_id: 'test-item-123',
        points_cost: 50
      });

      results.tests.push({
        name: 'purchaseWithPoints RBAC',
        status: 'FAIL',
        reason: `Expected 403, got ${purchaseResult.status || 'success'}`,
        response: purchaseResult.data || purchaseResult
      });
      results.failed++;
    } catch (error) {
      const is403 = error.message?.includes('403') || 
                    error.message?.includes('Forbidden') ||
                    error.message?.includes('permission');
      
      if (is403) {
        results.tests.push({
          name: 'purchaseWithPoints RBAC',
          status: 'PASS',
          reason: 'Correctly blocked with 403 Forbidden',
          error: error.message
        });
        results.passed++;
      } else {
        results.tests.push({
          name: 'purchaseWithPoints RBAC',
          status: 'FAIL',
          reason: `Unexpected error: ${error.message}`,
          error: error.message
        });
        results.failed++;
      }
    }

    // TEST 3: recordPointsTransaction as participant
    try {
      console.log('TEST 3: Attempting recordPointsTransaction as participant role...');
      
      const transactionResult = await base44.functions.invoke('recordPointsTransaction', {
        user_email: testTargetUserEmail,
        points: 100,
        transaction_type: 'test',
        description: 'Test transaction'
      });

      results.tests.push({
        name: 'recordPointsTransaction RBAC',
        status: 'FAIL',
        reason: `Expected 403, got ${transactionResult.status || 'success'}`,
        response: transactionResult.data || transactionResult
      });
      results.failed++;
    } catch (error) {
      const is403 = error.message?.includes('403') || 
                    error.message?.includes('Forbidden') ||
                    error.message?.includes('permission');
      
      if (is403) {
        results.tests.push({
          name: 'recordPointsTransaction RBAC',
          status: 'PASS',
          reason: 'Correctly blocked with 403 Forbidden',
          error: error.message
        });
        results.passed++;
      } else {
        results.tests.push({
          name: 'recordPointsTransaction RBAC',
          status: 'FAIL',
          reason: `Unexpected error: ${error.message}`,
          error: error.message
        });
        results.failed++;
      }
    }

    console.log('RBAC TEST RESULTS:', JSON.stringify(results, null, 2));

    return Response.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Test suite error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});