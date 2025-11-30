/**
 * CENTRALIZED CONSTANTS
 * All configuration, enums, and static data in one place
 */

// ============================================================================
// GAMIFICATION CONSTANTS
// ============================================================================

export const POINTS_CONFIG = {
  attendance: { points: 10, label: 'Event Attendance' },
  activity_completion: { points: 15, label: 'Activity Completed' },
  feedback: { points: 5, label: 'Feedback Submitted' },
  high_engagement: { points: 5, label: 'High Engagement Bonus' },
  recognition_sent: { points: 5, label: 'Recognition Sent' },
  recognition_received: { points: 10, label: 'Recognition Received' }
};

export const LEVEL_THRESHOLDS = {
  pointsPerLevel: 100,
  titles: {
    1: 'Newcomer',
    2: 'Explorer',
    3: 'Contributor',
    4: 'Connector',
    5: 'Champion',
    10: 'Ambassador',
    15: 'Legend',
    20: 'Icon'
  }
};

export const BADGE_RARITIES = {
  common: { color: 'slate', label: 'Common', multiplier: 1 },
  uncommon: { color: 'green', label: 'Uncommon', multiplier: 1.5 },
  rare: { color: 'blue', label: 'Rare', multiplier: 2 },
  epic: { color: 'purple', label: 'Epic', multiplier: 3 },
  legendary: { color: 'amber', label: 'Legendary', multiplier: 5 }
};

export const BADGE_CATEGORIES = {
  engagement: { icon: '🔥', label: 'Engagement' },
  collaboration: { icon: '🤝', label: 'Collaboration' },
  innovation: { icon: '💡', label: 'Innovation' },
  community: { icon: '🌟', label: 'Community' },
  leadership: { icon: '🎯', label: 'Leadership' },
  special: { icon: '✨', label: 'Special' },
  seasonal: { icon: '🎉', label: 'Seasonal' },
  challenge: { icon: '🏆', label: 'Challenge' }
};

// ============================================================================
// LEADERBOARD CONSTANTS
// ============================================================================

export const LEADERBOARD_CATEGORIES = {
  points: { label: 'Points', field: 'total_points', icon: '🏆' },
  events: { label: 'Events Attended', field: 'events_attended', icon: '📅' },
  badges: { label: 'Badges Earned', field: 'badges_count', icon: '🎖️' },
  engagement: { label: 'Engagement Score', field: 'engagement_score', icon: '⚡' }
};

export const TIME_PERIODS = {
  daily: { label: 'Today', days: 1 },
  weekly: { label: 'This Week', days: 7 },
  monthly: { label: 'This Month', days: 30 },
  all_time: { label: 'All Time', days: null }
};

export const ENGAGEMENT_WEIGHTS = {
  events_attended: 10,
  activities_completed: 15,
  feedback_submitted: 5,
  streak_days: 2,
  badges_earned: 20
};

// ============================================================================
// STORE CONSTANTS
// ============================================================================

export const STORE_CATEGORIES = {
  avatar_hat: { label: 'Hats', icon: '🎩' },
  avatar_glasses: { label: 'Glasses', icon: '👓' },
  avatar_background: { label: 'Backgrounds', icon: '🖼️' },
  avatar_frame: { label: 'Frames', icon: '✨' },
  avatar_effect: { label: 'Effects', icon: '🌟' },
  power_up: { label: 'Power-Ups', icon: '⚡' },
  badge_boost: { label: 'Badge Boosts', icon: '🎖️' }
};

export const AVATAR_SLOTS = {
  hat: { label: 'Hat', category: 'avatar_hat', layer: 5 },
  glasses: { label: 'Glasses', category: 'avatar_glasses', layer: 4 },
  background: { label: 'Background', category: 'avatar_background', layer: 1 },
  frame: { label: 'Frame', category: 'avatar_frame', layer: 2 },
  effect: { label: 'Effect', category: 'avatar_effect', layer: 6 }
};

export const POWER_UP_TYPES = {
  points_multiplier: { label: '2X Points', icon: '⚡' },
  visibility_boost: { label: 'Visibility Boost', icon: '👁️' },
  badge_glow: { label: 'Badge Glow', icon: '✨' },
  streak_freeze: { label: 'Streak Freeze', icon: '❄️' }
};

// ============================================================================
// RECOGNITION CONSTANTS
// ============================================================================

export const RECOGNITION_CATEGORIES = {
  teamwork: { label: 'Teamwork', icon: '🤝', description: 'Great collaboration' },
  innovation: { label: 'Innovation', icon: '💡', description: 'Creative solutions' },
  leadership: { label: 'Leadership', icon: '🎯', description: 'Leading by example' },
  going_above: { label: 'Going Above', icon: '🚀', description: 'Extra effort' },
  customer_focus: { label: 'Customer Focus', icon: '❤️', description: 'Client dedication' },
  problem_solving: { label: 'Problem Solving', icon: '🧩', description: 'Solving challenges' },
  mentorship: { label: 'Mentorship', icon: '🌱', description: 'Helping others grow' },
  culture_champion: { label: 'Culture Champion', icon: '🌟', description: 'Living our values' }
};

export const RECOGNITION_VISIBILITY = {
  public: { label: 'Public', description: 'Visible to everyone' },
  private: { label: 'Private', description: 'Only sender and recipient' },
  team_only: { label: 'Team Only', description: 'Visible to team members' }
};

export const MODERATION_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  approved: { label: 'Approved', color: 'green' },
  flagged: { label: 'Flagged', color: 'red' },
  rejected: { label: 'Rejected', color: 'slate' }
};

export const FLAG_REASONS = {
  inappropriate: { label: 'Inappropriate Content', severity: 'high', color: 'red' },
  spam: { label: 'Spam/Promotional', severity: 'medium', color: 'orange' },
  bias: { label: 'Potential Bias', severity: 'medium', color: 'yellow' },
  low_quality: { label: 'Low Quality', severity: 'low', color: 'slate' },
  needs_review: { label: 'Needs Human Review', severity: 'medium', color: 'blue' }
};

// ============================================================================
// EVENT CONSTANTS
// ============================================================================

export const EVENT_TYPES = {
  icebreaker: { label: 'Icebreaker', icon: '🎭', color: 'blue' },
  creative: { label: 'Creative', icon: '🎨', color: 'purple' },
  competitive: { label: 'Competitive', icon: '🏆', color: 'amber' },
  wellness: { label: 'Wellness', icon: '🧘', color: 'green' },
  learning: { label: 'Learning', icon: '📚', color: 'cyan' },
  social: { label: 'Social', icon: '🎉', color: 'pink' }
};

export const EVENT_STATUS = {
  draft: { label: 'Draft', color: 'slate' },
  scheduled: { label: 'Scheduled', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'green' },
  completed: { label: 'Completed', color: 'slate' },
  cancelled: { label: 'Cancelled', color: 'red' },
  rescheduled: { label: 'Rescheduled', color: 'yellow' }
};

export const EVENT_FORMATS = {
  online: { label: 'Online', icon: '💻' },
  offline: { label: 'In-Person', icon: '🏢' },
  hybrid: { label: 'Hybrid', icon: '🔄' }
};

export const DURATION_OPTIONS = {
  '5-15min': { label: '5-15 minutes', value: 10 },
  '15-30min': { label: '15-30 minutes', value: 22 },
  '30+min': { label: '30+ minutes', value: 45 }
};

// ============================================================================
// CHANNEL CONSTANTS
// ============================================================================

export const CHANNEL_TYPES = {
  team: { label: 'Team', icon: '👥', description: 'Department communication' },
  project: { label: 'Project', icon: '📁', description: 'Project-specific' },
  interest: { label: 'Interest', icon: '💡', description: 'Hobbies and social' },
  announcement: { label: 'Announcement', icon: '📢', description: 'Company-wide updates' }
};

export const CHANNEL_VISIBILITY = {
  public: { label: 'Public', description: 'Anyone can see and join' },
  private: { label: 'Private', description: 'Members only' },
  invite_only: { label: 'Invite Only', description: 'Admin invite required' }
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const BRAND_COLORS = {
  navy: '#14294D',
  orange: '#D97230',
  gold: '#F5C16A',
  teal: '#2DD4BF'
};

export const GRADIENT_CLASSES = {
  orange: 'bg-gradient-to-r from-[#D97230] to-[#C46322]',
  navy: 'bg-gradient-to-r from-[#14294D] to-[#1e3a6d]',
  purple: 'bg-gradient-to-r from-purple-600 to-purple-400',
  green: 'bg-gradient-to-r from-emerald-600 to-teal-400'
};

export const NOTIFICATION_TYPES = {
  badge_alerts: { icon: '🎖️', label: 'Badge Earned' },
  level_up_alerts: { icon: '⬆️', label: 'Level Up' },
  recognition_alerts: { icon: '🎉', label: 'Recognition' },
  event_reminders: { icon: '📅', label: 'Event Reminder' },
  success: { icon: '✅', label: 'Success' }
};

// ============================================================================
// INTEGRATION CONSTANTS
// ============================================================================

export const AI_MODELS = {
  openai: {
    chat: 'gpt-4o',
    reasoning: 'o1',
    mini: 'gpt-4o-mini',
    embedding: 'text-embedding-3-large',
    image: 'dall-e-3'
  },
  claude: {
    sonnet: 'claude-sonnet-4-20250514',
    haiku: 'claude-3-5-haiku-20241022'
  },
  gemini: {
    pro: 'gemini-2.0-flash',
    thinking: 'gemini-2.0-flash-thinking-exp-01-21'
  }
};

export const INTEGRATION_KEYS = {
  openai: 'OPENAI_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
  gemini: 'GOOGLE_API_KEY',
  stripe: 'STRIPE_SECRET_KEY'
};