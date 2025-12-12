/**
 * FORMATTING UTILITIES
 * Centralized formatting functions
 */

import { format, formatDistance, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { DATE_FORMATS } from '../constants';

// Date Formatting
export function formatDate(date, formatStr = DATE_FORMATS.DISPLAY) {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    if (formatStr === DATE_FORMATS.RELATIVE) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

export function formatRelativeTime(date) {
  return formatDate(date, DATE_FORMATS.RELATIVE);
}

export function formatDateTime(date) {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
}

export function formatTimeOnly(date) {
  return formatDate(date, DATE_FORMATS.TIME_ONLY);
}

// Number Formatting
export function formatNumber(num, decimals = 0) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatPercentage(value, total, decimals = 0) {
  if (!total || total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${formatNumber(percentage, decimals)}%`;
}

export function formatPoints(points) {
  if (points >= 1000000) {
    return `${formatNumber(points / 1000000, 1)}M`;
  }
  if (points >= 1000) {
    return `${formatNumber(points / 1000, 1)}K`;
  }
  return formatNumber(points);
}

// Text Formatting
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeWords(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

export function truncate(str, maxLength = 100, suffix = '...') {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

export function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Name Formatting
export function getInitials(name) {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(' ');
}

// File Size Formatting
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${formatNumber(bytes / Math.pow(k, i), 1)} ${units[i]}`;
}

// Duration Formatting
export function formatDuration(minutes) {
  if (!minutes || minutes === 0) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${mins} min`;
}

// Phone Number Formatting
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

// Currency Formatting
export function formatCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Activity Type Formatting
export function formatActivityType(type) {
  if (!type) return '';
  return type
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

// Pluralization
export function pluralize(count, singular, plural = null) {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

export function formatCountWithLabel(count, singular, plural = null) {
  return `${formatNumber(count)} ${pluralize(count, singular, plural)}`;
}

// Badge/Status Formatting
export function formatBadgeRarity(rarity) {
  return capitalizeWords(rarity?.replace('_', ' ') || '');
}

export function formatEventStatus(status) {
  return capitalizeWords(status?.replace('_', ' ') || '');
}

// List Formatting
export function formatList(items, conjunction = 'and') {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  
  return `${allButLast}, ${conjunction} ${last}`;
}

// Streak Formatting
export function formatStreak(days) {
  if (!days || days === 0) return 'No streak';
  if (days === 1) return '1 day streak 🔥';
  return `${days} days streak 🔥`;
}

// Score/Rating Formatting
export function formatScore(score, maxScore = 100) {
  return `${formatNumber(score)}/${maxScore}`;
}

export function formatRating(rating, maxRating = 5, decimals = 1) {
  return `${formatNumber(rating, decimals)}/${maxRating} ⭐`;
}

export default {
  // Date
  formatDate,
  formatRelativeTime,
  formatDateTime,
  formatTimeOnly,
  
  // Number
  formatNumber,
  formatPercentage,
  formatPoints,
  
  // Text
  capitalize,
  capitalizeWords,
  truncate,
  slugify,
  
  // Name
  getInitials,
  formatFullName,
  
  // File
  formatFileSize,
  formatDuration,
  
  // Contact
  formatPhoneNumber,
  
  // Currency
  formatCurrency,
  
  // Domain
  formatActivityType,
  formatBadgeRarity,
  formatEventStatus,
  
  // Lists
  formatList,
  pluralize,
  formatCountWithLabel,
  
  // Gamification
  formatStreak,
  formatScore,
  formatRating
};