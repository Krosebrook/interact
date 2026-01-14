/**
 * Event Ownership Authorization Tests
 * Validates that only event owners and admins can modify events
 */

import { describe, it, expect, beforeEach } from 'npm:vitest@1.0.0';
import { base44 } from '@/api/base44Client';

describe('Event Ownership & Authorization', () => {
  const ownerEmail = 'owner@company.com';
  const participantEmail = 'participant@company.com';
  const adminEmail = 'admin@company.com';
  
  let testEvent = null;

  beforeEach(async () => {
    // Create test event (as owner)
    testEvent = {
      activity_id: 'activity-123',
      title: 'Test Event',
      scheduled_date: new Date(Date.now() + 86400000).toISOString(),
      facilitator_email: ownerEmail,
      facilitator_name: 'Test Owner'
    };
  });

  describe('Sync to Google Calendar', () => {
    it('Owner can sync their own event', async () => {
      // Owner = facilitator_email
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        eventId: testEvent.id,
        userEmail: ownerEmail,
        userRole: 'user'
      });
      
      expect(response.data.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('Non-owner cannot sync event (403)', async () => {
      // Participant tries to sync event they don't own
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        eventId: testEvent.id,
        userEmail: participantEmail,
        userRole: 'user'
      });
      
      expect(response.status).toBe(403);
      expect(response.data.error).toContain('Unauthorized');
    });

    it('Admin can sync any event', async () => {
      // Admin overrides ownership restriction
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        eventId: testEvent.id,
        userEmail: adminEmail,
        userRole: 'admin'
      });
      
      expect(response.data.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('Participant in event cannot sync', async () => {
      // Even if in Participation, can't sync without ownership
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        eventId: testEvent.id,
        userEmail: participantEmail,
        userRole: 'user',
        hasParticipation: true
      });
      
      expect(response.status).toBe(403);
    });
  });

  describe('Event Cancellation Cascade', () => {
    it('Owner can cancel their event', async () => {
      const response = await base44.functions.invoke('handleEventCancellation', {
        event_id: testEvent.id,
        cancellation_reason: 'Owner cancelled',
        userEmail: ownerEmail,
        userRole: 'user'
      });
      
      expect(response.data.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('Non-owner cannot cancel event (403)', async () => {
      const response = await base44.functions.invoke('handleEventCancellation', {
        event_id: testEvent.id,
        cancellation_reason: 'Participant cancelled',
        userEmail: participantEmail,
        userRole: 'user'
      });
      
      expect(response.status).toBe(403);
    });

    it('Cancellation cascades to all participations', async () => {
      // Create 3 participations
      const participation1 = await base44.entities.Participation.create({
        event_id: testEvent.id,
        user_email: 'user1@company.com',
        rsvp_status: 'yes'
      });
      const participation2 = await base44.entities.Participation.create({
        event_id: testEvent.id,
        user_email: 'user2@company.com',
        rsvp_status: 'yes'
      });

      // Cancel event
      const response = await base44.functions.invoke('handleEventCancellation', {
        event_id: testEvent.id,
        cancellation_reason: 'Test cancellation',
        userEmail: ownerEmail,
        userRole: 'user'
      });

      expect(response.data.cascade_results.participations_updated).toBe(2);
      expect(response.data.cascade_results.event_updated).toBe(true);
    });

    it('Cancellation creates notifications for participants', async () => {
      const response = await base44.functions.invoke('handleEventCancellation', {
        event_id: testEvent.id,
        cancellation_reason: 'Event postponed',
        userEmail: ownerEmail,
        userRole: 'user'
      });

      expect(response.data.cascade_results.notifications_created).toBeGreaterThan(0);
    });
  });

  describe('Event Creation & Ownership', () => {
    it('Facilitator can create event', async () => {
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        action: 'create_event',
        eventData: testEvent,
        userEmail: ownerEmail,
        userRole: 'user',
        userType: 'facilitator'
      });

      expect(response.status).toBe(200);
      // Verify facilitator_email is set to creator
      expect(response.data.event.facilitator_email).toBe(ownerEmail);
    });

    it('Regular user cannot create event', async () => {
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        action: 'create_event',
        eventData: testEvent,
        userEmail: participantEmail,
        userRole: 'user',
        userType: 'participant'
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Edge Cases', () => {
    it('Handles non-existent event gracefully', async () => {
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        eventId: 'non-existent-id',
        userEmail: ownerEmail,
        userRole: 'user'
      });

      expect(response.status).toBe(404);
    });

    it('Handles missing authorization header', async () => {
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        eventId: testEvent.id
        // No userEmail or userRole
      });

      expect(response.status).toBe(401);
    });

    it('Prevents race condition on concurrent cancellations', async () => {
      // Simulate 2 concurrent cancellation requests
      const response1 = base44.functions.invoke('handleEventCancellation', {
        event_id: testEvent.id,
        cancellation_reason: 'Request 1'
      });
      const response2 = base44.functions.invoke('handleEventCancellation', {
        event_id: testEvent.id,
        cancellation_reason: 'Request 2'
      });

      const results = await Promise.all([response1, response2]);
      
      // First should succeed, second should fail (already cancelled)
      expect(results[0].data.success).toBe(true);
      expect(results[1].status).toMatch(/400|409/); // Conflict or bad request
    });
  });
});