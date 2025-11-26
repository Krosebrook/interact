/**
 * Formatting Utilities
 * Consistent formatting functions for dates, numbers, and text
 */

import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow, parseISO } from 'date-fns';

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - date-fns format string
 * @returns {string} Formatted date
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date with relative labels (Today, Tomorrow, Yesterday)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with relative label
 */
export function formatDateRelative(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  
  return format(d, 'EEE, MMM d • h:mm a');
}

/**
 * Format a date as time ago (e.g., "5 minutes ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Time ago string
 */
export function formatTimeAgo(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}

/**
 * Format a number as compact (e.g., 1.2K, 3.4M)
 * @param {number} num - Number to format
 * @returns {string} Compact number
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format a percentage
 * @param {number} value - Value (0-100 or 0-1)
 * @param {boolean} isDecimal - Whether value is 0-1
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, isDecimal = false) {
  if (value === null || value === undefined) return '0%';
  const percent = isDecimal ? value * 100 : value;
  return `${Math.round(percent)}%`;
}

/**
 * Format duration in minutes to human readable
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export function formatDuration(minutes) {
  if (!minutes) return '';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Format user name from email
 * @param {string} email - Email address
 * @param {string} fullName - Optional full name
 * @returns {string} Display name
 */
export function formatUserName(email, fullName) {
  if (fullName) return fullName;
  if (!email) return 'Unknown User';
  
  const username = email.split('@')[0];
  return username
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Format points with label
 * @param {number} points - Points value
 * @returns {string} Formatted points
 */
export function formatPoints(points) {
  return `${formatNumber(points)} pts`;
}

/**
 * Format level display
 * @param {number} level - Level number
 * @returns {string} Formatted level
 */
export function formatLevel(level) {
  return `Level ${level || 1}`;
}

/**
 * Format streak display
 * @param {number} days - Streak days
 * @returns {string} Formatted streak
 */
export function formatStreak(days) {
  if (!days || days === 0) return 'No streak';
  if (days === 1) return '1 day streak';
  return `${days} day streak`;
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}