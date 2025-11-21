/**
 * Utility functions for filtering and categorizing events
 */

export function filterUpcomingEvents(events) {
  return events.filter(e => 
    e.status === 'scheduled' && new Date(e.scheduled_date) > new Date()
  );
}

export function filterPastEvents(events) {
  return events.filter(e => 
    e.status === 'completed' || (e.status === 'scheduled' && new Date(e.scheduled_date) <= new Date())
  );
}

export function filterTodayEvents(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return events.filter(e => {
    const eventDate = new Date(e.scheduled_date);
    return eventDate >= today && eventDate < tomorrow;
  });
}

export function filterEventsByParticipation(events, participations, userEmail) {
  return events.filter(event => 
    participations.some(p => p.event_id === event.id && p.participant_email === userEmail)
  );
}

export function getParticipationStats(eventId, participations) {
  const eventParticipations = participations.filter(p => p.event_id === eventId);
  const attended = eventParticipations.filter(p => p.attended).length;
  const avgEngagement = eventParticipations.length > 0
    ? eventParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / eventParticipations.length
    : 0;

  return {
    total: eventParticipations.length,
    attended,
    avgEngagement: Math.round(avgEngagement * 10) / 10
  };
}

export function getActivityForEvent(event, activities) {
  return activities.find(a => a.id === event.activity_id);
}