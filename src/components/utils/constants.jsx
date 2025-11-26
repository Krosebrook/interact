/**
 * Application Constants
 * Centralized configuration values for consistency across the app
 */

// Activity Types with visual configuration
export const ACTIVITY_TYPES = {
  icebreaker: { 
    emoji: '🧊', 
    label: 'Icebreaker', 
    color: 'bg-blue-100 text-blue-700',
    gradient: 'bg-gradient-icebreaker',
    description: 'Fun activities to help team members get to know each other'
  },
  creative: { 
    emoji: '🎨', 
    label: 'Creative', 
    color: 'bg-purple-100 text-purple-700',
    gradient: 'bg-gradient-creative',
    description: 'Express creativity through art, writing, or design'
  },
  competitive: { 
    emoji: '🏆', 
    label: 'Competitive', 
    color: 'bg-amber-100 text-amber-700',
    gradient: 'bg-gradient-competitive',
    description: 'Friendly competitions to spark engagement'
  },
  wellness: { 
    emoji: '🧘', 
    label: 'Wellness', 
    color: 'bg-emerald-100 text-emerald-700',
    gradient: 'bg-gradient-wellness',
    description: 'Focus on mental and physical well-being'
  },
  learning: { 
    emoji: '📚', 
    label: 'Learning', 
    color: 'bg-cyan-100 text-cyan-700',
    gradient: 'bg-gradient-learning',
    description: 'Skill development and knowledge sharing'
  },
  social: { 
    emoji: '🎉', 
    label: 'Social', 
    color: 'bg-pink-100 text-pink-700',
    gradient: 'bg-gradient-social',
    description: 'Casual social interactions and celebrations'
  }
};

// Duration options for activities
export const DURATION_OPTIONS = [
  { value: '5-15min', label: '5-15 minutes', minutes: 10 },
  { value: '15-30min', label: '15-30 minutes', minutes: 22 },
  { value: '30+min', label: '30+ minutes', minutes: 45 }
];

// Event statuses with visual configuration
export const EVENT_STATUSES = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  rescheduled: { label: 'Rescheduled', color: 'bg-amber-100 text-amber-700' }
};

// Event formats
export const EVENT_FORMATS = {
  online: { label: 'Online', icon: 'Video' },
  offline: { label: 'In-Person', icon: 'MapPin' },
  hybrid: { label: 'Hybrid', icon: 'Users' }
};

// Badge rarities with visual configuration
export const BADGE_RARITIES = {
  common: { 
    label: 'Common', 
    color: 'from-slate-400 to-slate-500',
    border: 'border-slate-300',
    glow: 'shadow-slate-200'
  },
  uncommon: { 
    label: 'Uncommon', 
    color: 'from-emerald-400 to-emerald-600',
    border: 'border-emerald-300',
    glow: 'shadow-emerald-200'
  },
  rare: { 
    label: 'Rare', 
    color: 'from-blue-400 to-blue-600',
    border: 'border-blue-300',
    glow: 'shadow-blue-200'
  },
  epic: { 
    label: 'Epic', 
    color: 'from-purple-400 to-purple-600',
    border: 'border-purple-300',
    glow: 'shadow-purple-200'
  },
  legendary: { 
    label: 'Legendary', 
    color: 'from-amber-400 to-orange-500',
    border: 'border-amber-300',
    glow: 'shadow-amber-200'
  }
};

// Level thresholds for XP progression
export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  1750,  // Level 6
  2750,  // Level 7
  4000,  // Level 8
  5500,  // Level 9
  7500   // Level 10+
];

// Streak milestones
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

// Challenge types
export const CHALLENGE_TYPES = {
  head_to_head: { label: 'Head to Head', icon: 'Swords' },
  league: { label: 'League', icon: 'Trophy' },
  tournament: { label: 'Tournament', icon: 'Trophy' },
  collaborative: { label: 'Collaborative', icon: 'Users' },
  race: { label: 'Race', icon: 'Zap' }
};

// Reward categories
export const REWARD_CATEGORIES = {
  badge: { label: 'Badge', icon: 'Award' },
  swag: { label: 'Swag', icon: 'ShoppingBag' },
  gift_voucher: { label: 'Gift Card', icon: 'Gift' },
  extra_pto: { label: 'Time Off', icon: 'Clock' },
  experience: { label: 'Experience', icon: 'Sparkles' },
  donation: { label: 'Donation', icon: 'Heart' },
  other: { label: 'Other', icon: 'Gift' }
};

// Points configuration defaults
export const DEFAULT_POINTS_CONFIG = {
  event_attendance: 10,
  activity_completion: 15,
  feedback_submission: 5,
  streak_bonus_per_day: 2,
  first_event_bonus: 25,
  perfect_attendance_monthly: 50
};

// Query cache times (in milliseconds)
export const CACHE_TIMES = {
  short: 30 * 1000,      // 30 seconds
  medium: 5 * 60 * 1000, // 5 minutes
  long: 30 * 60 * 1000,  // 30 minutes
  stale: 60 * 1000       // 1 minute
};

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100
};

// File upload limits
export const UPLOAD_LIMITS = {
  maxSizeMB: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
};