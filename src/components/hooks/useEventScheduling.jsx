/**
 * EVENT SCHEDULING HOOK
 * Centralized logic for creating, scheduling, and managing events
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { queryKeys } from '../lib/queryKeys';
import { BackendFunctions } from '../lib/api';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { toast } from 'sonner';

const DEFAULT_FORM_DATA = {
  activity_id: '',
  title: '',
  event_type: 'other',
  scheduled_date: '',
  duration_minutes: 30,
  max_participants: null,
  custom_instructions: '',
  meeting_link: '',
  facilitator_name: '',
  facilitator_email: '',
  event_format: 'online',
  location: '',
  type_specific_fields: {}
};

const DEFAULT_RECURRENCE = {
  enabled: false,
  frequency: 'weekly',
  occurrences: 4
};

/**
 * Generate unique IDs for events and series
 */
const generateMagicLink = () => 
  `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateSeriesId = () => 
  `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Map of event types to their relevant fields
 */
const EVENT_TYPE_FIELDS = {
  meeting: ['agenda_link', 'required_attendees'],
  workshop: ['materials_needed', 'prerequisites'],
  training: ['prerequisites', 'learning_objectives', 'certification_offered'],
  presentation: ['presentation_slides_url', 'q_and_a_enabled'],
  brainstorm: ['brainstorm_topic', 'brainstorm_tools'],
  wellness: ['wellness_category'],
  social: ['social_theme', 'dress_code'],
  other: []
};

/**
 * Clean type-specific fields to only include relevant ones for the event type
 */
function cleanTypeSpecificFields(eventType, fields) {
  if (!fields || !eventType) return {};
  
  const relevantFields = EVENT_TYPE_FIELDS[eventType] || [];
  const cleaned = {};
  
  for (const field of relevantFields) {
    if (fields[field] !== undefined && fields[field] !== '' && fields[field] !== null) {
      cleaned[field] = fields[field];
    }
  }
  
  return cleaned;
}

/**
 * Calculate next date based on recurrence frequency
 */
function getNextRecurrenceDate(baseDate, frequency, index) {
  switch (frequency) {
    case 'daily':
      return addDays(baseDate, index);
    case 'weekly':
      return addWeeks(baseDate, index);
    case 'biweekly':
      return addWeeks(baseDate, index * 2);
    case 'monthly':
      return addMonths(baseDate, index);
    default:
      return addWeeks(baseDate, index);
  }
}

export function useEventScheduling(options = {}) {
  const { 
    onSuccess,
    onError,
    sendNotifications = true 
  } = options;

  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [recurrence, setRecurrence] = useState(DEFAULT_RECURRENCE);

  // Reset form to defaults
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setRecurrence(DEFAULT_RECURRENCE);
  }, []);

  // Update single form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update multiple form fields
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Pre-fill form with activity data
  const selectActivity = useCallback((activity) => {
    if (!activity) return;
    updateFields({
      activity_id: activity.id,
      title: activity.title
    });
  }, [updateFields]);

  // Create single event
  const createSingleEvent = async (data, recurrenceInfo = null) => {
    const magicLink = generateMagicLink();
    
    // Clean up type_specific_fields - only include relevant fields for the event type
    const cleanedTypeFields = cleanTypeSpecificFields(data.event_type, data.type_specific_fields);
    
    const eventData = {
      ...data,
      magic_link: magicLink,
      status: 'scheduled',
      type_specific_fields: cleanedTypeFields,
      is_recurring: !!recurrenceInfo,
      recurring_series_id: recurrenceInfo?.seriesId || null,
      recurrence_pattern: recurrenceInfo ? {
        frequency: recurrenceInfo.frequency,
        occurrence_number: recurrenceInfo.occurrenceNum,
        total_occurrences: recurrenceInfo.totalOccurrences
      } : null
    };

    const event = await base44.entities.Event.create(eventData);

    // Send Teams notification if enabled
    if (sendNotifications) {
      try {
        await BackendFunctions.sendTeamsNotification({ event_id: event.id, notification_type: 'announcement' });
      } catch (error) {
        console.error('Failed to send Teams notification:', error);
      }
    }

    return event;
  };

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const events = [];
      
      if (recurrence.enabled) {
        const seriesId = generateSeriesId();
        const baseDate = new Date(data.scheduled_date);
        const occurrences = recurrence.occurrences || 4;

        for (let i = 0; i < occurrences; i++) {
          const nextDate = getNextRecurrenceDate(baseDate, recurrence.frequency, i);
          
          const event = await createSingleEvent(
            { ...data, scheduled_date: nextDate.toISOString() },
            {
              seriesId,
              frequency: recurrence.frequency,
              occurrenceNum: i + 1,
              totalOccurrences: occurrences
            }
          );
          events.push(event);
        }
      } else {
        const event = await createSingleEvent(data);
        events.push(event);
      }

      return events;
    },
    onSuccess: (events) => {
      queryClient.invalidateQueries(queryKeys.events.all);
      resetForm();
      
      const message = recurrence.enabled
        ? `${events.length} recurring events created! 🎉`
        : 'Event scheduled successfully! 🎉';
      
      toast.success(message);
      onSuccess?.(events);
    },
    onError: (error) => {
      toast.error('Failed to create event');
      onError?.(error);
    }
  });

  // Submit handler
  const handleSubmit = useCallback((e, activities = []) => {
    e?.preventDefault();
    
    const selectedActivity = activities.find(a => a.id === formData.activity_id);
    const title = formData.title || selectedActivity?.title || 'Untitled Event';
    
    createEventMutation.mutate({ ...formData, title });
  }, [formData, createEventMutation]);

  return {
    // Form state
    formData,
    setFormData,
    updateField,
    updateFields,
    selectActivity,
    resetForm,
    
    // Recurrence state
    recurrence,
    setRecurrence,
    
    // Mutation
    createEvent: createEventMutation.mutate,
    handleSubmit,
    isCreating: createEventMutation.isPending,
    error: createEventMutation.error
  };
}