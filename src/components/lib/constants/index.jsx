/**
 * GLOBAL CONSTANTS
 * Centralized configuration values
 */

// Level thresholds for gamification
export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: 'Newcomer' },
  { level: 2, points: 100, title: 'Contributor' },
  { level: 3, points: 300, title: 'Active Member' },
  { level: 4, points: 600, title: 'Engaged Player' },
  { level: 5, points: 1000, title: 'Team Champion' },
  { level: 6, points: 1500, title: 'Rising Star' },
  { level: 7, points: 2100, title: 'Elite Performer' },
  { level: 8, points: 2800, title: 'Legend' },
  { level: 9, points: 3600, title: 'Master' },
  { level: 10, points: 5000, title: 'Hall of Fame' }
];

// Helper function to calculate level from points
export function calculateLevelFromPoints(points) {
  if (!points || points < 0) return 1;
  
  const levelData = [...LEVEL_THRESHOLDS]
    .reverse()
    .find(threshold => points >= threshold.points);
  
  return levelData ? levelData.level : 1;
}

// Helper function to get level info
export function getLevelInfo(level) {
  return LEVEL_THRESHOLDS.find(t => t.level === level) || LEVEL_THRESHOLDS[0];
}

// Company domain for email validation
export const ALLOWED_EMAIL_DOMAIN = 'intinc.com';

// Session timeout (8 hours in milliseconds)
export const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;

// File upload constraints
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Cache durations (milliseconds)
export const CACHE_DURATIONS = {
  SHORT: 30000, // 30 seconds
  MEDIUM: 300000, // 5 minutes
  LONG: 3600000 // 1 hour
};

// Point values for actions
export const POINT_VALUES = {
  EVENT_ATTENDANCE: 10,
  ACTIVITY_COMPLETION: 15,
  FEEDBACK_SUBMITTED: 5,
  RECOGNITION_GIVEN: 3,
  RECOGNITION_RECEIVED: 5,
  CHALLENGE_COMPLETED: 25,
  STREAK_BONUS_PER_DAY: 2,
  BADGE_EARNED: 10
};

// Notification types
export const NOTIFICATION_TYPES = {
  EVENT_REMINDER: 'event_reminder',
  EVENT_CANCELLED: 'event_cancelled',
  RECOGNITION_RECEIVED: 'recognition_received',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  CHALLENGE_COMPLETED: 'challenge_completed'
};