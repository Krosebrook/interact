import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { integration_id, operation, stable_resource_id, payload_json } = await req.json();

    if (!integration_id || !operation || !stable_resource_id || !payload_json) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate idempotency key
    const payload_hash = createHash('sha256').update(JSON.stringify(payload_json)).digest('hex');
    const idempotency_key = createHash('sha256')
      .update(`${integration_id}:${operation}:${stable_resource_id}:${payload_hash}`)
      .digest('hex');

    // Check if already exists
    const existing = await base44.asServiceRole.entities.IntegrationOutbox.filter({
      idempotency_key
    });

    if (existing && existing.length > 0) {
      return Response.json({ 
        message: 'Already enqueued',
        outbox_id: existing[0].id,
        status: existing[0].status
      });
    }

    // Create new outbox entry
    const outbox = await base44.asServiceRole.entities.IntegrationOutbox.create({
      integration_id,
      operation,
      stable_resource_id,
      payload_json: typeof payload_json === 'string' ? payload_json : JSON.stringify(payload_json),
      idempotency_key,
      status: 'queued',
      attempt_count: 0,
      next_attempt_at: new Date().toISOString()
    });

    return Response.json({ 
      message: 'Enqueued successfully',
      outbox_id: outbox.id,
      idempotency_key
    });

  } catch (error) {
    console.error('enqueueOutbox error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});