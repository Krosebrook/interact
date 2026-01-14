import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Event Cancellation Handler
 * Automatically cascades cancellation to all related records
 * Called when event.status is updated to 'cancelled'
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, cancellation_reason } = await req.json();

    if (!event_id) {
      return Response.json({ error: 'event_id required' }, { status: 400 });
    }

    // Get event details
    const events = await base44.entities.Event.filter({ id: event_id });
    if (events.length === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = events[0];

    // Verify user authorization (organizer or admin)
    if (user.role !== 'admin' && user.email !== event.facilitator_email) {
      return Response.json({ error: 'Unauthorized to cancel this event' }, { status: 403 });
    }

    // TRANSACTION-LIKE OPERATION: All cascade operations must succeed together
    const results = {
      event_updated: false,
      participations_updated: 0,
      notifications_created: 0,
      errors: []
    };

    try {
      // 1. Update event status to cancelled
      await base44.entities.Event.update(event_id, {
        status: 'cancelled',
        cancellation_reason: cancellation_reason || 'Event cancelled by organizer',
        cancelled_at: new Date().toISOString()
      });
      results.event_updated = true;

      // 2. Get all participations for this event
      const participations = await base44.entities.Participation.filter({ 
        event_id: event_id 
      });

      // 3. Update all participations to cancelled status
      for (const participation of participations) {
        try {
          await base44.entities.Participation.update(participation.id, {
            attendance_status: 'cancelled',
            cancellation_timestamp: new Date().toISOString()
          });
          results.participations_updated++;
        } catch (error) {
          results.errors.push(`Failed to update participation ${participation.id}: ${error.message}`);
        }
      }

      // 4. Create notifications for affected participants
      for (const participation of participations) {
        try {
          await base44.entities.Notification.create({
            user_email: participation.user_email,
            type: 'event_cancelled',
            title: '❌ Event Cancelled',
            message: `"${event.title}" has been cancelled. ${cancellation_reason ? `Reason: ${cancellation_reason}` : ''}`,
            event_id: event_id,
            icon: '❌',
            action_url: '/Calendar',
            is_read: false
          });
          results.notifications_created++;
        } catch (error) {
          results.errors.push(`Failed to create notification for ${participation.user_email}: ${error.message}`);
        }
      }

      // 5. If recurring series, optionally mark subsequent sessions as cancelled
      if (event.is_recurring && event.recurring_series_id) {
        try {
          // Get all events in the series
          const seriesEvents = await base44.entities.Event.filter({
            recurring_series_id: event.recurring_series_id,
            status: 'scheduled'
          });

          console.log(`[EVENT CANCELLATION] Cancelling ${seriesEvents.length} subsequent series events`);
          
          for (const seriesEvent of seriesEvents) {
            try {
              await base44.entities.Event.update(seriesEvent.id, {
                status: 'cancelled',
                cancellation_reason: `Series event cancelled (parent cancelled)`
              });
            } catch (error) {
              results.errors.push(`Failed to cancel series event ${seriesEvent.id}: ${error.message}`);
            }
          }
        } catch (error) {
          results.errors.push(`Failed to process series cancellation: ${error.message}`);
        }
      }

      console.log(`[EVENT CANCELLATION] Event ${event_id} cancelled successfully. Cascade results:`, results);

      return Response.json({
        success: true,
        event_id,
        cascade_results: results,
        warnings: results.errors.length > 0 ? results.errors : null
      });

    } catch (error) {
      console.error(`[EVENT CANCELLATION] Cascade operation failed:`, error);
      return Response.json({ 
        success: false,
        error: `Cascade operation failed: ${error.message}`,
        partial_results: results
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[EVENT CANCELLATION] Unhandled error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});