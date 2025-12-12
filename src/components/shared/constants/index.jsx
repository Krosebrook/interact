/**
 * SHARED CONSTANTS
 * Centralized configuration and constants
 */

// Activity Types
export const ACTIVITY_TYPES = {
  ICEBREAKER: 'icebreaker',
  CREATIVE: 'creative',
  COMPETITIVE: 'competitive',
  WELLNESS: 'wellness',
  LEARNING: 'learning',
  SOCIAL: 'social'
};

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.ICEBREAKER]: 'Icebreaker',
  [ACTIVITY_TYPES.CREATIVE]: 'Creative',
  [ACTIVITY_TYPES.COMPETITIVE]: 'Competitive',
  [ACTIVITY_TYPES.WELLNESS]: 'Wellness',
  [ACTIVITY_TYPES.LEARNING]: 'Learning',
  [ACTIVITY_TYPES.SOCIAL]: 'Social'
};

export const ACTIVITY_TYPE_ICONS = {
  [ACTIVITY_TYPES.ICEBREAKER]: '🎯',
  [ACTIVITY_TYPES.CREATIVE]: '🎨',
  [ACTIVITY_TYPES.COMPETITIVE]: '🏆',
  [ACTIVITY_TYPES.WELLNESS]: '🧘',
  [ACTIVITY_TYPES.LEARNING]: '📚',
  [ACTIVITY_TYPES.SOCIAL]: '🎉'
};

export const ACTIVITY_TYPE_COLORS = {
  [ACTIVITY_TYPES.ICEBREAKER]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-cyan-500'
  },
  [ACTIVITY_TYPES.CREATIVE]: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-pink-500'
  },
  [ACTIVITY_TYPES.COMPETITIVE]: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-yellow-500'
  },
  [ACTIVITY_TYPES.WELLNESS]: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    gradient: 'from-emerald-500 to-teal-500'
  },
  [ACTIVITY_TYPES.LEARNING]: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    gradient: 'from-cyan-500 to-blue-500'
  },
  [ACTIVITY_TYPES.SOCIAL]: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
    gradient: 'from-pink-500 to-rose-500'
  }
};

// Event Types
export const EVENT_TYPES = {
  MEETING: 'meeting',
  WORKSHOP: 'workshop',
  TRAINING: 'training',
  SOCIAL: 'social',
  WELLNESS: 'wellness',
  PRESENTATION: 'presentation',
  BRAINSTORM: 'brainstorm',
  OTHER: 'other'
};

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
};

// Event Format
export const EVENT_FORMAT = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HYBRID: 'hybrid'
};

// Duration Options
export const DURATION_OPTIONS = {
  SHORT: '5-15min',
  MEDIUM: '15-30min',
  LONG: '30+min'
};

// Energy Levels
export const ENERGY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FACILITATOR: 'facilitator',
  TEAM_LEAD: 'team_lead',
  PARTICIPANT: 'participant',
  HR: 'hr'
};

// User Types
export const USER_TYPES = {
  FACILITATOR: 'facilitator',
  PARTICIPANT: 'participant'
};

// Badge Rarity
export const BADGE_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

export const BADGE_RARITY_COLORS = {
  [BADGE_RARITY.COMMON]: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    gradient: 'from-slate-400 to-slate-500'
  },
  [BADGE_RARITY.UNCOMMON]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    gradient: 'from-green-400 to-emerald-500'
  },
  [BADGE_RARITY.RARE]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    gradient: 'from-blue-400 to-cyan-500'
  },
  [BADGE_RARITY.EPIC]: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    gradient: 'from-purple-400 to-pink-500'
  },
  [BADGE_RARITY.LEGENDARY]: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    gradient: 'from-amber-400 to-yellow-500'
  }
};

// Challenge Status
export const CHALLENGE_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  ABANDONED: 'abandoned'
};

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  IN_APP: 'in_app',
  TEAMS: 'teams',
  SLACK: 'slack'
};

// Privacy Settings
export const PROFILE_VISIBILITY = {
  PUBLIC: 'public',
  TEAM_ONLY: 'team_only',
  PRIVATE: 'private'
};

// Recognition Categories
export const RECOGNITION_CATEGORIES = {
  TEAMWORK: 'teamwork',
  INNOVATION: 'innovation',
  LEADERSHIP: 'leadership',
  EXCELLENCE: 'excellence',
  MENTORSHIP: 'mentorship',
  CUSTOMER_FOCUS: 'customer_focus'
};

// Points Configuration
export const POINTS_CONFIG = {
  EVENT_ATTENDANCE: 10,
  FEEDBACK_SUBMITTED: 5,
  RECOGNITION_GIVEN: 3,
  RECOGNITION_RECEIVED: 5,
  CHALLENGE_COMPLETED: 25,
  STREAK_BONUS_PER_DAY: 2,
  BADGE_EARNED: 50
};

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE_MB: 10,
  MAX_UPLOAD_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MIN_TEAM_MEMBERS: 2,
  MAX_TEAM_MEMBERS: 50,
  MIN_SURVEY_RESPONSES: 5,
  SESSION_TIMEOUT_HOURS: 8
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: 0.8
};

// Cache Times (milliseconds)
export const CACHE_TIMES = {
  STATIC_DATA: 60 * 60 * 1000, // 1 hour
  DYNAMIC_DATA: 5 * 60 * 1000, // 5 minutes
  REAL_TIME_DATA: 30 * 1000, // 30 seconds
  USER_SESSION: 24 * 60 * 60 * 1000 // 24 hours
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  TIME_ONLY: 'h:mm a',
  RELATIVE: 'relative' // Use date-fns formatDistance
};

// Breakpoints (match Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Animation Durations (milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000
};

// Z-Index Layers
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 10,
  STICKY: 20,
  FIXED: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  POPOVER: 60,
  TOOLTIP: 70,
  NOTIFICATION: 80,
  SPOTLIGHT: 100,
  MAX: 9999
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  SENT: 'Sent successfully!'
};

// Feature Flags (for gradual rollout)
export const FEATURE_FLAGS = {
  ENABLE_PWA: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_REAL_TIME_UPDATES: false,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_AI_RECOMMENDATIONS: true,
  ENABLE_VIDEO_CALLS: false,
  ENABLE_FILE_SHARING: true,
  ENABLE_DARK_MODE: false
};

// API Configuration
export const API_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
  DEDUPLICATION_WINDOW: 100
};

// Image Optimization
export const IMAGE_CONFIG = {
  CLOUDINARY_CLOUD_NAME: 'intinc',
  THUMBNAIL_SIZE: 150,
  AVATAR_SIZE: 200,
  PREVIEW_SIZE: 600,
  FULL_SIZE: 1200,
  QUALITY: 80
};

// Accessibility
export const A11Y = {
  MIN_TOUCH_TARGET: 44, // pixels
  MIN_COLOR_CONTRAST: 4.5, // WCAG AA
  FOCUS_RING_WIDTH: 2 // pixels
};

export default {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_ICONS,
  ACTIVITY_TYPE_COLORS,
  EVENT_TYPES,
  EVENT_STATUS,
  EVENT_FORMAT,
  DURATION_OPTIONS,
  ENERGY_LEVELS,
  USER_ROLES,
  USER_TYPES,
  BADGE_RARITY,
  BADGE_RARITY_COLORS,
  CHALLENGE_STATUS,
  NOTIFICATION_CHANNELS,
  PROFILE_VISIBILITY,
  RECOGNITION_CATEGORIES,
  POINTS_CONFIG,
  VALIDATION_RULES,
  PAGINATION,
  CACHE_TIMES,
  DATE_FORMATS,
  BREAKPOINTS,
  ANIMATION_DURATION,
  Z_INDEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  API_CONFIG,
  IMAGE_CONFIG,
  A11Y
};