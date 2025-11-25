import { isToday, isTomorrow, addDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

/**
 * Central event utility functions
 * Used across Dashboard, Calendar, FacilitatorDashboard, and Analytics
 */

// Event filtering utilities
export const filterUpcomingEvents = (events = []) => {
  const now = new Date();
  return events
    .filter(e => e.status === 'scheduled' && new Date(e.scheduled_date) > now)
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
};

export const filterPastEvents = (events = []) => {
  return events
    .filter(e => e.status === 'completed' || 
      (e.status === 'scheduled' && new Date(e.scheduled_date) <= new Date()))
    .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));
};

export const filterTodayEvents = (events = []) => {
  return events.filter(e => 
    e.status !== 'cancelled' && isToday(new Date(e.scheduled_date))
  );
};

export const filterTomorrowEvents = (events = []) => {
  return events.filter(e => 
    e.status !== 'cancelled' && isTomorrow(new Date(e.scheduled_date))
  );
};

export const filterThisWeekEvents = (events = []) => {
  const now = new Date();
  return events.filter(e => {
    if (e.status === 'cancelled') return false;
    const eventDate = new Date(e.scheduled_date);
    return eventDate > now && eventDate <= addDays(now, 7) && 
           !isToday(eventDate) && !isTomorrow(eventDate);
  });
};

export const filterThisMonthCompletedEvents = (events = []) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  return events.filter(e => {
    if (e.status !== 'completed') return false;
    const eventDate = new Date(e.scheduled_date);
    return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
  });
};

export const filterLiveEvents = (events = []) => {
  const now = new Date();
  return events.filter(e => {
    if (e.status !== 'in_progress' && e.status !== 'scheduled') return false;
    const eventDate = new Date(e.scheduled_date);
    const endTime = new Date(eventDate.getTime() + (e.duration_minutes || 60) * 60000);
    return now >= eventDate && now <= endTime;
  });
};

export const filterEventsByParticipation = (events = [], participations = [], userEmail) => {
  return events.filter(event => 
    participations.some(p => p.event_id === event.id && p.participant_email === userEmail)
  );
};

// Event statistics utilities
export const getParticipationStats = (eventId, participations = []) => {
  const eventParticipations = participations.filter(p => p.event_id === eventId);
  const attended = eventParticipations.filter(p => p.attended).length;
  
  const engagementScores = eventParticipations
    .map(p => p.engagement_score)
    .filter(s => s && s > 0);
  
  const avgEngagement = engagementScores.length > 0
    ? Math.round((engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length) * 10) / 10
    : 0;

  return {
    total: eventParticipations.length,
    attended,
    avgEngagement
  };
};

export const getActivityForEvent = (event, activities = []) => {
  return activities.find(a => a.id === event?.activity_id);
};

// Dashboard statistics
export const calculateDashboardStats = (events = [], activities = [], participations = []) => {
  const upcomingEvents = filterUpcomingEvents(events);
  const completedThisMonth = filterThisMonthCompletedEvents(events).length;
  
  const eventsWithParticipants = events.filter(e => 
    participations.some(p => p.event_id === e.id)
  ).length;
  
  const avgParticipation = eventsWithParticipants > 0 
    ? Math.round(participations.length / eventsWithParticipants)
    : 0;

  return {
    upcomingCount: upcomingEvents.length,
    activitiesCount: activities.length,
    completedThisMonth,
    avgParticipation
  };
};

// Generate event magic link
export const generateMagicLink = () => {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate series ID
export const generateSeriesId = () => {
  return `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};