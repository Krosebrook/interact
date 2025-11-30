/**
 * CENTRALIZED UTILITY FUNCTIONS
 * Pure functions for data transformation and calculations
 */

import { ENGAGEMENT_WEIGHTS, LEVEL_THRESHOLDS } from './constants';

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function formatDate(dateString, format = 'short') {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  switch (format) {
    case 'full':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'medium':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'datetime':
      return `${formatDate(dateString, 'medium')} at ${formatDate(dateString, 'time')}`;
    case 'relative':
      return getRelativeTime(date);
    default:
      return date.toLocaleDateString();
  }
}

export function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, 'medium');
}

export function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isUpcoming(dateString) {
  return new Date(dateString) > new Date();
}

export function isPast(dateString) {
  return new Date(dateString) < new Date();
}

// ============================================================================
// GAMIFICATION UTILITIES
// ============================================================================

export function calculateLevel(totalPoints) {
  return Math.floor((totalPoints || 0) / LEVEL_THRESHOLDS.pointsPerLevel) + 1;
}

export function getPointsToNextLevel(totalPoints) {
  const currentLevel = calculateLevel(totalPoints);
  const pointsForNextLevel = currentLevel * LEVEL_THRESHOLDS.pointsPerLevel;
  return pointsForNextLevel - (totalPoints || 0);
}

export function getLevelProgress(totalPoints) {
  const pointsInLevel = (totalPoints || 0) % LEVEL_THRESHOLDS.pointsPerLevel;
  return (pointsInLevel / LEVEL_THRESHOLDS.pointsPerLevel) * 100;
}

export function getLevelTitle(level) {
  const titles = LEVEL_THRESHOLDS.titles;
  const sortedLevels = Object.keys(titles).map(Number).sort((a, b) => b - a);
  
  for (const threshold of sortedLevels) {
    if (level >= threshold) {
      return titles[threshold];
    }
  }
  return titles[1];
}

export function calculateEngagementScore(userPoints) {
  if (!userPoints) return 0;
  
  return (
    (userPoints.events_attended || 0) * ENGAGEMENT_WEIGHTS.events_attended +
    (userPoints.activities_completed || 0) * ENGAGEMENT_WEIGHTS.activities_completed +
    (userPoints.feedback_submitted || 0) * ENGAGEMENT_WEIGHTS.feedback_submitted +
    (userPoints.streak_days || 0) * ENGAGEMENT_WEIGHTS.streak_days +
    (userPoints.badges_earned?.length || 0) * ENGAGEMENT_WEIGHTS.badges_earned
  );
}

export function getPercentile(rank, total) {
  if (!total || !rank) return 0;
  return Math.round(((total - rank + 1) / total) * 100);
}

// ============================================================================
// EVENT UTILITIES
// ============================================================================

export function filterUpcomingEvents(events, limit = 100) {
  if (!events) return [];
  const now = new Date();
  
  return events
    .filter(e => new Date(e.scheduled_date) >= now && e.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
    .slice(0, limit);
}

export function filterPastEvents(events, limit = 100) {
  if (!events) return [];
  const now = new Date();
  
  return events
    .filter(e => new Date(e.scheduled_date) < now || e.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
    .slice(0, limit);
}

export function getActivityForEvent(event, activities) {
  if (!event || !activities) return null;
  return activities.find(a => a.id === event.activity_id);
}

export function getParticipationStats(eventId, participations) {
  const eventParticipations = participations?.filter(p => p.event_id === eventId) || [];
  
  return {
    total: eventParticipations.length,
    confirmed: eventParticipations.filter(p => p.rsvp_status === 'yes').length,
    attended: eventParticipations.filter(p => p.attended).length,
    maybe: eventParticipations.filter(p => p.rsvp_status === 'maybe').length
  };
}

export function calculateDashboardStats(events, activities, participations) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const upcomingEvents = events?.filter(e => 
    new Date(e.scheduled_date) >= now && e.status === 'scheduled'
  ) || [];
  
  const completedThisMonth = events?.filter(e =>
    e.status === 'completed' && new Date(e.scheduled_date) >= thisMonth
  ).length || 0;
  
  const avgParticipation = participations?.length && events?.length
    ? Math.round(participations.length / events.length)
    : 0;
  
  return {
    upcomingCount: upcomingEvents.length,
    activitiesCount: activities?.length || 0,
    completedThisMonth,
    avgParticipation
  };
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatPercentage(value, decimals = 0) {
  return `${(value || 0).toFixed(decimals)}%`;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {});
}

export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
}

export function uniqueBy(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const val = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNotEmpty(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

export function validateRequired(fields, data) {
  const missing = fields.filter(field => !isNotEmpty(data[field]));
  return {
    valid: missing.length === 0,
    missing
  };
}