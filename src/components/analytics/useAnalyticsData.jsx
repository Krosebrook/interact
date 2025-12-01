import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Centralized analytics data hook with optimized queries
 * Fixes N+1 query pattern by pre-computing lookups
 */
export function useAnalyticsData() {
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
    staleTime: 30000
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
    staleTime: 60000
  });

  const { data: participations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list(),
    staleTime: 30000
  });

  const { data: userProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 60000
  });

  // Pre-compute lookup maps to avoid N+1 queries
  const lookups = useMemo(() => {
    // Event lookup by ID
    const eventMap = new Map(events.map(e => [e.id, e]));
    
    // Activity lookup by ID
    const activityMap = new Map(activities.map(a => [a.id, a]));
    
    // Events by activity ID
    const eventsByActivity = activities.reduce((acc, activity) => {
      acc[activity.id] = events.filter(e => e.activity_id === activity.id);
      return acc;
    }, {});
    
    // Participations by event ID
    const participationsByEvent = events.reduce((acc, event) => {
      acc[event.id] = participations.filter(p => p.event_id === event.id);
      return acc;
    }, {});

    return { eventMap, activityMap, eventsByActivity, participationsByEvent };
  }, [events, activities, participations]);

  // Pre-computed metrics
  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const totalParticipations = participations.filter(p => p.attended).length;
    const avgParticipation = completedEvents > 0 
      ? Math.round(totalParticipations / completedEvents) 
      : 0;

    // Engagement score
    const engagementScores = participations.filter(p => p.engagement_score);
    const avgEngagement = engagementScores.length > 0
      ? (engagementScores.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / engagementScores.length).toFixed(1)
      : 0;

    const completionRate = totalEvents > 0 
      ? Math.round((completedEvents / totalEvents) * 100) 
      : 0;

    return {
      totalEvents,
      completedEvents,
      totalParticipations,
      avgParticipation,
      avgEngagement,
      completionRate
    };
  }, [events, participations]);

  // Activity type distribution
  const typeDistribution = useMemo(() => {
    const distribution = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [activities]);

  // Monthly event trend
  const monthlyData = useMemo(() => {
    return events.reduce((acc, event) => {
      const month = new Date(event.scheduled_date).toLocaleDateString('en', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.events += 1;
      } else {
        acc.push({ month, events: 1 });
      }
      return acc;
    }, []);
  }, [events]);

  // Top activities by participation - OPTIMIZED (no N+1)
  const activityParticipation = useMemo(() => {
    return activities.map(activity => {
      const activityEvents = lookups.eventsByActivity[activity.id] || [];
      const participantCount = activityEvents.reduce((sum, event) => {
        const eventParticipations = lookups.participationsByEvent[event.id] || [];
        return sum + eventParticipations.filter(p => p.attended).length;
      }, 0);
      return {
        name: activity.title.substring(0, 20),
        participants: participantCount,
        events: activityEvents.length
      };
    })
    .filter(a => a.participants > 0)
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 5);
  }, [activities, lookups]);

  // Recent feedback
  const recentFeedback = useMemo(() => {
    return participations
      .filter(p => p.feedback)
      .slice(0, 5)
      .map(p => ({
        ...p,
        event: lookups.eventMap.get(p.event_id)
      }));
  }, [participations, lookups]);

  const isLoading = eventsLoading || activitiesLoading || participationsLoading || profilesLoading;

  return {
    events,
    activities,
    participations,
    userProfiles,
    lookups,
    metrics,
    typeDistribution,
    monthlyData,
    activityParticipation,
    recentFeedback,
    isLoading
  };
}