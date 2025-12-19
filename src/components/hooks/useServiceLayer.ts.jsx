/**
 * Service Layer Hook
 * Provides access to all service layer functions with React integration
 * @module hooks/useServiceLayer
 */

import { useMemo } from 'react';
import * as eventService from '../services/eventService';
import { errorService, useErrorHandler } from '../services/errorService';

/**
 * Central hook for accessing service layer
 * Provides memoized service instances to prevent unnecessary re-renders
 */
export function useServiceLayer() {
  const errorHandler = useErrorHandler();

  const services = useMemo(() => ({
    // Event services
    events: {
      filterUpcoming: eventService.filterUpcomingEvents,
      filterPast: eventService.filterPastEvents,
      filterNeedingFeedback: eventService.filterEventsNeedingFeedback,
      getParticipationStats: eventService.getParticipationStats,
      getActivityForEvent: eventService.getActivityForEvent,
      calculateDashboardStats: eventService.calculateDashboardStats,
      applyFilters: eventService.applyEventFilters,
      groupByMonth: eventService.groupEventsByMonth,
      sortByDate: eventService.sortEventsByDate,
    },
    
    // Error handling
    errors: errorHandler,
  }), [errorHandler]);

  return services;
}