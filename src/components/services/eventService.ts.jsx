/**
 * Event Service Layer
 * Centralizes event-related business logic and calculations
 * @module services/eventService
 */

import { Event, Activity, Participation } from '../types/entities';

export interface EventStats {
  upcomingCount: number;
  activitiesCount: number;
  completedThisMonth: number;
  avgParticipation: number;
}

export interface EventFilters {
  status?: 'scheduled' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  activityType?: string;
}

/**
 * Filters events that are scheduled in the future
 */
export function filterUpcomingEvents(events: Event[]): Event[] {
  const now = new Date();
  return events.filter(event => {
    const eventDate = new Date(event.scheduled_date);
    return eventDate > now && event.status === 'scheduled';
  });
}

/**
 * Filters events that occurred in the past
 */
export function filterPastEvents(events: Event[]): Event[] {
  const now = new Date();
  return events.filter(event => {
    const eventDate = new Date(event.scheduled_date);
    return eventDate <= now || event.status === 'completed';
  });
}

/**
 * Filters events requiring feedback from a specific participant
 */
export function filterEventsNeedingFeedback(
  events: Event[],
  participations: Participation[],
  userEmail: string
): Event[] {
  const now = new Date();
  
  return events.filter(event => {
    const eventDate = new Date(event.scheduled_date);
    if (eventDate > now) return false;
    
    const participation = participations.find(
      p => p.event_id === event.id && p.participant_email === userEmail
    );
    
    return participation && participation.attended && !participation.feedback_submitted;
  });
}

/**
 * Calculates participation statistics for an event
 */
export function getParticipationStats(
  eventId: string,
  participations: Participation[]
): { total: number; attended: number; withFeedback: number } {
  const eventParticipations = participations.filter(p => p.event_id === eventId);
  
  return {
    total: eventParticipations.length,
    attended: eventParticipations.filter(p => p.attended).length,
    withFeedback: eventParticipations.filter(p => p.feedback_submitted).length,
  };
}

/**
 * Finds activity associated with an event
 */
export function getActivityForEvent(
  event: Event,
  activities: Activity[]
): Activity | undefined {
  return activities.find(a => a.id === event.activity_id);
}

/**
 * Calculates comprehensive dashboard statistics
 */
export function calculateDashboardStats(
  events: Event[],
  activities: Activity[],
  participations: Participation[]
): EventStats {
  const upcomingEvents = filterUpcomingEvents(events);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const completedThisMonth = events.filter(event => {
    const eventDate = new Date(event.scheduled_date);
    return eventDate >= startOfMonth && 
           eventDate <= now && 
           event.status === 'completed';
  }).length;
  
  // Calculate average participation across all events
  const totalParticipations = participations.filter(p => p.attended).length;
  const eventsWithParticipation = new Set(
    participations.filter(p => p.attended).map(p => p.event_id)
  ).size;
  
  const avgParticipation = eventsWithParticipation > 0
    ? Math.round(totalParticipations / eventsWithParticipation)
    : 0;
  
  return {
    upcomingCount: upcomingEvents.length,
    activitiesCount: activities.length,
    completedThisMonth,
    avgParticipation,
  };
}

/**
 * Applies filters to event list
 */
export function applyEventFilters(
  events: Event[],
  filters: EventFilters
): Event[] {
  return events.filter(event => {
    if (filters.status && event.status !== filters.status) return false;
    
    if (filters.startDate) {
      const eventDate = new Date(event.scheduled_date);
      if (eventDate < filters.startDate) return false;
    }
    
    if (filters.endDate) {
      const eventDate = new Date(event.scheduled_date);
      if (eventDate > filters.endDate) return false;
    }
    
    if (filters.activityType) {
      // Requires activity data to be joined
      return true; // Placeholder: implement when activities are available
    }
    
    return true;
  });
}

/**
 * Groups events by month for calendar views
 */
export function groupEventsByMonth(events: Event[]): Map<string, Event[]> {
  const grouped = new Map<string, Event[]>();
  
  events.forEach(event => {
    const date = new Date(event.scheduled_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(event);
  });
  
  return grouped;
}

/**
 * Sorts events by date (ascending or descending)
 */
export function sortEventsByDate(events: Event[], order: 'asc' | 'desc' = 'asc'): Event[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.scheduled_date).getTime();
    const dateB = new Date(b.scheduled_date).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}