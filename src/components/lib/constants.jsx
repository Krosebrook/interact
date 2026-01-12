
/**
 * CENTRALIZED CONSTANTS
 * All configuration, enums, and static data in one place
 * Version: 4.0.0
 * Last Updated: 2025-12-02
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

// Level thresholds for gamification system
export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: 'Newcomer' },
  { level: 2, points: 100, title: 'Explorer' },
  { level: 3, points: 250, title: 'Contributor' },
  { level: 4, points: 500, title: 'Enthusiast' },
  { level: 5, points: 1000, title: 'Champion' },
  { level: 6, points: 1500, title: 'Expert' },
  { level: 7, points: 2500, title: 'Master' },
  { level: 8, points: 4000, title: 'Legend' },
  { level: 9, points: 6000, title: 'Hero' },
  { level: 10, points: 10000, title: 'Elite' }
];

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
  stripe: 'STRIPE_SECRET_KEY',
  perplexity: 'PERPLEXITY_API_KEY'
};

// ============================================================================
// ACHIEVEMENT TIER CONSTANTS (v4.0)
// ============================================================================

export const ACHIEVEMENT_TIERS = {
  bronze: { level: 1, points: 0, color: '#CD7F32', icon: '🥉', multiplier: 1 },
  silver: { level: 2, points: 500, color: '#C0C0C0', icon: '🥈', multiplier: 1.1 },
  gold: { level: 3, points: 1500, color: '#FFD700', icon: '🥇', multiplier: 1.25 },
  platinum: { level: 4, points: 3500, color: '#00CED1', icon: '💎', multiplier: 1.4 },
  diamond: { level: 5, points: 7500, color: '#4169E1', icon: '💠', multiplier: 1.5 },
  master: { level: 6, points: 15000, color: '#9400D3', icon: '👑', multiplier: 1.75 },
  grandmaster: { level: 7, points: 30000, color: '#FF4500', icon: '🌟', multiplier: 2 },
  legend: { level: 8, points: 50000, color: '#FFD700', icon: '✨', multiplier: 2.5 }
};

// ============================================================================
// CHALLENGE CONSTANTS (v4.0)
// ============================================================================

export const CHALLENGE_TYPES = {
  daily: { label: 'Daily', icon: '📅', duration: 1 },
  weekly: { label: 'Weekly', icon: '📆', duration: 7 },
  milestone: { label: 'Milestone', icon: '🎯', duration: null },
  streak: { label: 'Streak', icon: '🔥', duration: null },
  social: { label: 'Social', icon: '🤝', duration: 7 },
  skill: { label: 'Skill', icon: '📚', duration: 14 },
  exploration: { label: 'Exploration', icon: '🗺️', duration: 30 }
};

export const CHALLENGE_DIFFICULTIES = {
  easy: { label: 'Easy', color: 'green', multiplier: 1 },
  medium: { label: 'Medium', color: 'amber', multiplier: 1.5 },
  hard: { label: 'Hard', color: 'red', multiplier: 2 },
  epic: { label: 'Epic', color: 'purple', multiplier: 3 }
};

export const CHALLENGE_METRICS = {
  events_attended: { label: 'Events Attended', unit: 'events' },
  feedback_submitted: { label: 'Feedback Submitted', unit: 'submissions' },
  recognitions_given: { label: 'Recognitions Given', unit: 'recognitions' },
  recognitions_received: { label: 'Recognitions Received', unit: 'recognitions' },
  streak_days: { label: 'Streak Days', unit: 'days' },
  activities_completed: { label: 'Activities Completed', unit: 'activities' },
  team_events: { label: 'Team Events', unit: 'events' },
  points_earned: { label: 'Points Earned', unit: 'points' },
  badges_earned: { label: 'Badges Earned', unit: 'badges' },
  connections_made: { label: 'Connections Made', unit: 'connections' }
};

// ============================================================================
// SOCIAL SHARING CONSTANTS (v4.0)
// ============================================================================

export const SHARE_TYPES = {
  badge_earned: { label: 'Badge Earned', icon: '🎖️' },
  level_up: { label: 'Level Up', icon: '⬆️' },
  tier_achieved: { label: 'Tier Achieved', icon: '🏆' },
  challenge_completed: { label: 'Challenge Completed', icon: '✅' },
  leaderboard_rank: { label: 'Leaderboard Rank', icon: '🏅' },
  streak_milestone: { label: 'Streak Milestone', icon: '🔥' },
  recognition_received: { label: 'Recognition Received', icon: '🎉' }
};

export const SHARE_PLATFORMS = {
  internal: { label: 'Internal Feed', icon: '🏠' },
  linkedin: { label: 'LinkedIn', icon: '💼' },
  twitter: { label: 'Twitter/X', icon: '🐦' },
  slack: { label: 'Slack', icon: '💬' },
  teams: { label: 'Teams', icon: '👥' },
  email: { label: 'Email', icon: '📧' }
};

export const SHARE_REACTIONS = {
  likes: { label: 'Like', emoji: '👍' },
  celebrates: { label: 'Celebrate', emoji: '🎉' },
  inspired: { label: 'Inspired', emoji: '💡' }
};

// ============================================================================
// A/B TESTING CONSTANTS (v4.0)
// ============================================================================

export const AB_TEST_ELEMENT_TYPES = {
  badge: { label: 'Badge', icon: '🎖️' },
  challenge: { label: 'Challenge', icon: '🎯' },
  points_multiplier: { label: 'Points Multiplier', icon: '⚡' },
  reward: { label: 'Reward', icon: '🎁' },
  leaderboard: { label: 'Leaderboard', icon: '🏆' },
  notification: { label: 'Notification', icon: '🔔' },
  ui_element: { label: 'UI Element', icon: '🎨' }
};

export const AB_TEST_METRICS = {
  engagement_rate: { label: 'Engagement Rate', unit: '%' },
  completion_rate: { label: 'Completion Rate', unit: '%' },
  points_earned: { label: 'Points Earned', unit: 'points' },
  retention: { label: 'Retention', unit: '%' },
  badge_claims: { label: 'Badge Claims', unit: 'claims' },
  challenge_participation: { label: 'Challenge Participation', unit: '%' }
};

export const AB_TEST_STATUS = {
  draft: { label: 'Draft', color: 'slate' },
  running: { label: 'Running', color: 'green' },
  paused: { label: 'Paused', color: 'amber' },
  completed: { label: 'Completed', color: 'blue' },
  archived: { label: 'Archived', color: 'slate' }
};

// ============================================================================
// LEADERBOARD SEGMENT CONSTANTS (v4.0)
// ============================================================================

export const LEADERBOARD_SEGMENTS = {
  new_users: { 
    label: 'Newcomer League', 
    icon: '🌱', 
    description: 'Users with less than 30 days',
    metric: 'weekly_points'
  },
  power_users: { 
    label: 'Champions Arena', 
    icon: '⚡', 
    description: 'Top performers',
    metric: 'total_points'
  },
  streak_masters: { 
    label: 'Streak Warriors', 
    icon: '🔥', 
    description: 'Longest active streaks',
    metric: 'streak_days'
  },
  social_stars: { 
    label: 'Recognition Stars', 
    icon: '💫', 
    description: 'Most recognitions',
    metric: 'recognitions'
  },
  event_enthusiasts: { 
    label: 'Event Champions', 
    icon: '🎯', 
    description: 'Most active in events',
    metric: 'events_attended'
  }
};

export const LEADERBOARD_DISPLAY_STYLES = {
  podium: { label: 'Podium', description: 'Top 3 showcase' },
  list: { label: 'List', description: 'Traditional ranking list' },
  cards: { label: 'Cards', description: 'Card-based grid' }
};
