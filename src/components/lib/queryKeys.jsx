/**
 * QUERY KEY FACTORY
 * Centralized query key management for React Query
 * Ensures consistent cache invalidation and data fetching
 */

export const queryKeys = {
  // ============================================================================
  // CORE ENTITIES
  // ============================================================================
  events: {
    all: ['events'],
    list: (filters = {}) => ['events', 'list', filters],
    detail: (id) => ['events', 'detail', id],
    upcoming: () => ['events', 'upcoming'],
    past: () => ['events', 'past'],
    byActivity: (activityId) => ['events', 'activity', activityId],
    byFacilitator: (email) => ['events', 'facilitator', email],
  },
  
  activities: {
    all: ['activities'],
    list: (filters = {}) => ['activities', 'list', filters],
    detail: (id) => ['activities', 'detail', id],
    byType: (type) => ['activities', 'type', type],
    templates: () => ['activities', 'templates'],
  },
  
  participations: {
    all: ['participations'],
    byEvent: (eventId) => ['participations', 'event', eventId],
    byUser: (email) => ['participations', 'user', email],
    byEventAndUser: (eventId, email) => ['participations', 'event', eventId, 'user', email],
  },

  // ============================================================================
  // GAMIFICATION
  // ============================================================================
  userPoints: {
    all: ['user-points'],
    byUser: (email) => ['user-points', email],
    leaderboard: (period) => ['user-points', 'leaderboard', period],
  },
  
  badges: {
    all: ['badges'],
    detail: (id) => ['badges', 'detail', id],
    awards: (email) => ['badges', 'awards', email],
    byCategory: (category) => ['badges', 'category', category],
  },
  
  leaderboard: {
    all: ['leaderboard'],
    byPeriod: (period, category) => ['leaderboard', period, category],
    teams: (period) => ['leaderboard', 'teams', period],
  },

  // ============================================================================
  // TEAMS & SOCIAL
  // ============================================================================
  teams: {
    all: ['teams'],
    detail: (id) => ['teams', 'detail', id],
    members: (teamId) => ['teams', 'members', teamId],
    byUser: (email) => ['teams', 'user', email],
    challenges: (teamId) => ['teams', 'challenges', teamId],
  },
  
  channels: {
    all: ['channels'],
    detail: (id) => ['channels', 'detail', id],
    messages: (channelId, limit) => ['channels', 'messages', channelId, limit],
    byUser: (email) => ['channels', 'user', email],
  },
  
  recognition: {
    all: ['recognition'],
    sent: (email) => ['recognition', 'sent', email],
    received: (email) => ['recognition', 'received', email],
    featured: () => ['recognition', 'featured'],
    pending: () => ['recognition', 'pending'],
  },

  // ============================================================================
  // STORE & INVENTORY
  // ============================================================================
  storeItems: {
    all: ['store-items'],
    available: () => ['store-items', 'available'],
    byCategory: (category) => ['store-items', 'category', category],
    detail: (id) => ['store-items', 'detail', id],
  },
  
  inventory: {
    byUser: (email) => ['inventory', email],
    equipped: (email) => ['inventory', 'equipped', email],
  },
  
  transactions: {
    byUser: (email) => ['transactions', email],
  },

  // ============================================================================
  // USER & PROFILE
  // ============================================================================
  user: {
    current: ['user', 'current'],
    profile: (email) => ['user', 'profile', email],
    preferences: (email) => ['user', 'preferences', email],
    avatar: (email) => ['user', 'avatar', email],
    notifications: (email) => ['user', 'notifications', email],
  },

  // ============================================================================
  // POLLS & SURVEYS
  // ============================================================================
  polls: {
    all: ['time-slot-polls'],
    active: () => ['time-slot-polls', 'active'],
    byEvent: (eventId) => ['time-slot-polls', 'event', eventId],
    byCreator: (email) => ['time-slot-polls', 'creator', email],
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================
  analytics: {
    dashboard: () => ['analytics', 'dashboard'],
    engagement: (period) => ['analytics', 'engagement', period],
    skills: () => ['analytics', 'skills'],
    attendance: (period) => ['analytics', 'attendance', period],
    trends: (metric) => ['analytics', 'trends', metric],
  },

  // ============================================================================
  // SKILLS
  // ============================================================================
  skills: {
    tracking: (email) => ['skills', 'tracking', email],
    trends: () => ['skills', 'trends'],
    byActivity: (activityId) => ['skills', 'activity', activityId],
  },

  // ============================================================================
  // MEDIA & ASSETS
  // ============================================================================
  media: {
    byEvent: (eventId) => ['media', 'event', eventId],
    byUser: (email) => ['media', 'user', email],
    featured: () => ['media', 'featured'],
  },
};

/**
 * Helper to invalidate related queries
 */
export const invalidationGroups = {
  // When an event changes, invalidate these
  eventChange: [
    queryKeys.events.all,
    queryKeys.participations.all,
  ],
  
  // When gamification changes
  gamificationChange: (email) => [
    queryKeys.userPoints.byUser(email),
    queryKeys.badges.awards(email),
    queryKeys.leaderboard.all,
  ],
  
  // When team data changes
  teamChange: (teamId) => [
    queryKeys.teams.detail(teamId),
    queryKeys.teams.members(teamId),
    queryKeys.leaderboard.teams('all'),
  ],
  
  // When user profile changes
  profileChange: (email) => [
    queryKeys.user.profile(email),
    queryKeys.user.avatar(email),
    queryKeys.inventory.byUser(email),
  ],
};