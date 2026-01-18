import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const reconcileRun = await base44.asServiceRole.entities.ReconcileRun.create({
      integration_id: 'google_sheets',
      started_at: new Date().toISOString(),
      status: 'running'
    });

    let checked = 0, drift_fixed = 0, api_calls = 0, failures = 0;

    try {
      // Re-enqueue stuck items (queued > 6 hours)
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const stuckItems = await base44.asServiceRole.entities.IntegrationOutbox.filter({
        integration_id: 'google_sheets',
        status: 'queued'
      });

      for (const item of stuckItems || []) {
        if (item.created_date < sixHoursAgo) {
          await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
            next_attempt_at: new Date().toISOString()
          });
          drift_fixed++;
        }
        checked++;
      }

      await base44.asServiceRole.entities.ReconcileRun.update(reconcileRun.id, {
        finished_at: new Date().toISOString(),
        status: 'completed',
        checked,
        drift_fixed,
        api_calls,
        failures
      });

      return Response.json({ 
        message: 'Reconciliation completed',
        reconcile_run_id: reconcileRun.id,
        checked,
        drift_fixed
      });

    } catch (error) {
      await base44.asServiceRole.entities.ReconcileRun.update(reconcileRun.id, {
        finished_at: new Date().toISOString(),
        status: 'failed',
        failures: failures + 1,
        notes_json: JSON.stringify({ error: error.message })
      });
      throw error;
    }

  } catch (error) {
    console.error('reconcileGoogleSheets error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});