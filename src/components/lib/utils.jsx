/**
 * CENTRALIZED UTILITIES
 * Pure utility functions for all domains
 * Version: 4.0.0
 * Last Updated: 2025-12-02
 */

import { format, formatDistanceToNow, isAfter, isBefore, isToday, isTomorrow, addDays, subDays, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

// ============================================================================
// DATE UTILITIES
// ============================================================================

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy h:mm a');

export const formatTime = (date) => formatDate(date, 'h:mm a');

export const getRelativeTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const isUpcoming = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(d, new Date());
};

export const isPast = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(d, new Date());
};

export const isTodayDate = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
};

export const isTomorrowDate = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isTomorrow(d);
};

export const getDateRange = (period) => {
  const now = new Date();
  switch (period) {
    case 'today': return { start: now, end: now };
    case 'week': return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'month': return { start: startOfMonth(now), end: endOfMonth(now) };
    case '7days': return { start: subDays(now, 7), end: now };
    case '30days': return { start: subDays(now, 30), end: now };
    case '90days': return { start: subDays(now, 90), end: now };
    default: return { start: null, end: null };
  }
};

export const getDaysSince = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(new Date(), d);
};

// ============================================================================
// GAMIFICATION UTILITIES
// ============================================================================

export const calculateLevel = (points, pointsPerLevel = 100) => {
  return Math.floor(points / pointsPerLevel) + 1;
};

export const calculateXPProgress = (points, pointsPerLevel = 100) => {
  const currentLevelPoints = points % pointsPerLevel;
  return (currentLevelPoints / pointsPerLevel) * 100;
};

export const getXPToNextLevel = (points, pointsPerLevel = 100) => {
  return pointsPerLevel - (points % pointsPerLevel);
};

export const getLevelTitle = (level) => {
  const titles = {
    1: 'Newcomer', 2: 'Explorer', 3: 'Contributor', 4: 'Connector',
    5: 'Champion', 10: 'Ambassador', 15: 'Legend', 20: 'Icon'
  };
  const keys = Object.keys(titles).map(Number).sort((a, b) => b - a);
  for (const key of keys) {
    if (level >= key) return titles[key];
  }
  return 'Newcomer';
};

export const calculateEngagementScore = (userPoints, weights = {}) => {
  const defaultWeights = {
    events_attended: 10,
    activities_completed: 15,
    feedback_submitted: 5,
    streak_days: 2,
    badges_earned: 20
  };
  const w = { ...defaultWeights, ...weights };
  
  return (
    (userPoints.events_attended || 0) * w.events_attended +
    (userPoints.activities_completed || 0) * w.activities_completed +
    (userPoints.feedback_submitted || 0) * w.feedback_submitted +
    (userPoints.streak_days || 0) * w.streak_days +
    ((userPoints.badges_earned || []).length) * w.badges_earned
  );
};

export const getPercentile = (rank, total) => {
  if (total === 0) return 0;
  return Math.round((1 - (rank - 1) / total) * 100);
};

export const getRankChange = (currentRank, previousRank) => {
  if (!previousRank) return 0;
  return previousRank - currentRank;
};

export const getTierForPoints = (lifetimePoints, tiers) => {
  if (!tiers || tiers.length === 0) return null;
  return tiers
    .filter(t => lifetimePoints >= t.points_required)
    .sort((a, b) => b.tier_level - a.tier_level)[0] || null;
};

export const getNextTier = (lifetimePoints, tiers) => {
  if (!tiers || tiers.length === 0) return null;
  return tiers
    .filter(t => lifetimePoints < t.points_required)
    .sort((a, b) => a.tier_level - b.tier_level)[0] || null;
};

export const getTierProgress = (lifetimePoints, currentTier, nextTier) => {
  if (!nextTier) return 100;
  const currentThreshold = currentTier?.points_required || 0;
  const nextThreshold = nextTier.points_required;
  const progress = ((lifetimePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
};

// ============================================================================
// EVENT UTILITIES
// ============================================================================

export const filterUpcomingEvents = (events) => {
  const now = new Date();
  return events.filter(e => 
    e.status === 'scheduled' && 
    e.scheduled_date && 
    isAfter(parseISO(e.scheduled_date), now)
  ).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
};

export const filterPastEvents = (events) => {
  const now = new Date();
  return events.filter(e => 
    (e.status === 'completed' || (e.scheduled_date && isBefore(parseISO(e.scheduled_date), now)))
  ).sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));
};

export const filterTodayEvents = (events) => {
  return events.filter(e => e.scheduled_date && isTodayDate(e.scheduled_date));
};

export const filterThisWeekEvents = (events) => {
  const { start, end } = getDateRange('week');
  return events.filter(e => {
    if (!e.scheduled_date) return false;
    const d = parseISO(e.scheduled_date);
    return isAfter(d, start) && isBefore(d, end);
  });
};

export const getEventActivity = (event, activities) => {
  if (!event?.activity_id || !activities) return null;
  return activities.find(a => a.id === event.activity_id);
};

export const getParticipationStats = (eventId, participations) => {
  const eventParticipations = participations.filter(p => p.event_id === eventId);
  const attended = eventParticipations.filter(p => p.attended);
  const avgEngagement = attended.length > 0
    ? attended.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / attended.length
    : 0;
  
  return {
    total: eventParticipations.length,
    attended: attended.length,
    attendanceRate: eventParticipations.length > 0 
      ? (attended.length / eventParticipations.length * 100).toFixed(0)
      : 0,
    avgEngagement: avgEngagement.toFixed(1)
  };
};

export const generateMagicLink = () => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSeriesId = () => {
  return `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

export const truncate = (str, length = 100, suffix = '...') => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(capitalize).join(' ');
};

export const getInitials = (name, maxLength = 2) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, maxLength);
};

export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : (plural || `${singular}s`);
};

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export const formatNumber = (num, options = {}) => {
  if (num === null || num === undefined) return '';
  return new Intl.NumberFormat('en-US', options).format(num);
};

export const formatCompact = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatPercent = (value, decimals = 0) => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(decimals)}%`;
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    (groups[value] = groups[value] || []).push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (value, min, max, fieldName = 'Field') => {
  if (!value) return null;
  const len = value.length;
  if (min && len < min) return `${fieldName} must be at least ${min} characters`;
  if (max && len > max) return `${fieldName} must be at most ${max} characters`;
  return null;
};

export const validateRange = (value, min, max, fieldName = 'Value') => {
  if (value === null || value === undefined) return null;
  if (min !== undefined && value < min) return `${fieldName} must be at least ${min}`;
  if (max !== undefined && value > max) return `${fieldName} must be at most ${max}`;
  return null;
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
};

export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// ============================================================================
// MISC UTILITIES
// ============================================================================

export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = (fn, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};