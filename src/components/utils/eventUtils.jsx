import { isToday, isTomorrow, addDays } from 'date-fns';

export const filterUpcomingEvents = (events) => {
  const now = new Date();
  return events.filter(e => 
    e.status === 'scheduled' && new Date(e.scheduled_date) > now
  );
};

export const filterTodayEvents = (events) => {
  return events.filter(e => isToday(new Date(e.scheduled_date)));
};

export const filterTomorrowEvents = (events) => {
  return events.filter(e => isTomorrow(new Date(e.scheduled_date)));
};

export const filterThisWeekEvents = (events) => {
  const now = new Date();
  return events.filter(e => {
    const eventDate = new Date(e.scheduled_date);
    return eventDate <= addDays(now, 7) && !isToday(eventDate) && !isTomorrow(eventDate);
  });
};

export const getParticipationStats = (eventId, participations) => {
  const eventParticipations = participations.filter(p => p.event_id === eventId);
  const attended = eventParticipations.filter(p => p.attended).length;
  
  const engagementScores = eventParticipations
    .map(p => p.engagement_score)
    .filter(s => s && s > 0);
  
  const avgEngagement = engagementScores.length > 0
    ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length
    : 0;

  return {
    total: eventParticipations.length,
    attended,
    avgEngagement
  };
};

export const getActivityForEvent = (event, activities) => {
  return activities.find(a => a.id === event.activity_id);
};