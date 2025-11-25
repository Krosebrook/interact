import { isToday, isTomorrow, addDays } from 'date-fns';

/**
 * Central event utility functions
 * Used across Dashboard, Calendar, FacilitatorDashboard, and Analytics
 */

export const filterUpcomingEvents = (events = []) => {
  const now = new Date();
  return events.filter(e => 
    e.status === 'scheduled' && new Date(e.scheduled_date) > now
  );
};

export const filterPastEvents = (events = []) => {
  return events.filter(e => 
    e.status === 'completed' || 
    (e.status === 'scheduled' && new Date(e.scheduled_date) <= new Date())
  );
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

export const filterEventsByParticipation = (events = [], participations = [], userEmail) => {
  return events.filter(event => 
    participations.some(p => p.event_id === event.id && p.participant_email === userEmail)
  );
};

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