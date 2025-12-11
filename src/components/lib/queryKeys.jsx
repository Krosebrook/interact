/**
 * EXTENDED QUERY KEYS WITH ONBOARDING
 * Comprehensive type-safe query key factory for all entities
 */

export const queryKeys = {
  // Events
  events: {
    all: ['events'],
    list: (params) => ['events', 'list', params],
    detail: (id) => ['events', 'detail', id],
    byActivity: (activityId) => ['events', 'byActivity', activityId],
    upcoming: () => ['events', 'upcoming'],
    completed: () => ['events', 'completed']
  },

  // Activities
  activities: {
    all: ['activities'],
    list: (params) => ['activities', 'list', params],
    detail: (id) => ['activities', 'detail', id],
    byType: (type) => ['activities', 'byType', type]
  },

  // Participations
  participations: {
    all: ['participations'],
    list: (params) => ['participations', 'list', params],
    byEvent: (eventId) => ['participations', 'byEvent', eventId],
    byUser: (userEmail) => ['participations', 'byUser', userEmail]
  },

  // Gamification
  gamification: {
    userPoints: {
      all: ['user-points'],
      list: (params) => ['user-points', 'list', params],
      byEmail: (email) => ['user-points', 'byEmail', email]
    },
    badges: {
      all: ['badges'],
      active: ['badges', 'active'],
      byType: (type) => ['badges', 'byType', type]
    },
    badgeAwards: {
      all: ['badge-awards'],
      list: (params) => ['badge-awards', 'list', params],
      byUser: (userEmail) => ['badge-awards', 'byUser', userEmail]
    },
    rewards: {
      all: ['rewards'],
      available: ['rewards', 'available'],
      detail: (id) => ['rewards', 'detail', id]
    },
    redemptions: {
      all: ['redemptions'],
      list: (params) => ['redemptions', 'list', params],
      byUser: (userEmail) => ['redemptions', 'byUser', userEmail]
    },
    challenges: {
      all: ['challenges'],
      active: ['challenges', 'active'],
      byUser: (userEmail) => ['challenges', 'byUser', userEmail]
    },
    tiers: {
      all: ['achievement-tiers'],
      list: () => ['achievement-tiers', 'list']
    },
    leaderboards: {
      all: ['leaderboards'],
      byCategory: (category, period) => ['leaderboards', category, period]
    }
  },

  // Recognition
  recognition: {
    all: ['recognition'],
    list: (params) => ['recognition', 'list', params],
    sent: (userEmail) => ['recognition', 'sent', userEmail],
    received: (userEmail) => ['recognition', 'received', userEmail],
    public: () => ['recognition', 'public']
  },

  // Teams
  teams: {
    all: ['teams'],
    detail: (id) => ['teams', 'detail', id],
    memberships: {
      all: ['team-memberships'],
      list: (params) => ['team-memberships', 'list', params],
      byUser: (userEmail) => ['team-memberships', 'byUser', userEmail],
      byTeam: (teamId) => ['team-memberships', 'byTeam', teamId]
    },
    invitations: {
      all: ['team-invitations'],
      list: (params) => ['team-invitations', 'list', params],
      byUser: (userEmail) => ['team-invitations', 'byUser', userEmail]
    },
    challenges: {
      all: ['team-challenges'],
      active: ['team-challenges', 'active'],
      byTeam: (teamId) => ['team-challenges', 'byTeam', teamId]
    }
  },

  // Store
  store: {
    items: {
      all: ['store-items'],
      available: ['store-items', 'available'],
      byCategory: (category) => ['store-items', 'category', category]
    },
    inventory: {
      all: ['user-inventory'],
      list: (params) => ['user-inventory', 'list', params],
      byUser: (userEmail) => ['user-inventory', 'byUser', userEmail]
    },
    avatar: {
      all: ['user-avatar'],
      byUser: (userEmail) => ['user-avatar', 'byUser', userEmail]
    },
    transactions: {
      all: ['store-transactions'],
      list: (params) => ['store-transactions', 'list', params],
      byUser: (userEmail) => ['store-transactions', 'byUser', userEmail]
    }
  },

  // Notifications
  notifications: {
    all: ['notifications'],
    list: (params) => ['notifications', 'list', params],
    unread: (userEmail) => ['notifications', 'unread', userEmail]
  },

  // Channels
  channels: {
    all: ['channels'],
    detail: (id) => ['channels', 'detail', id],
    messages: {
      all: ['channel-messages'],
      list: (params) => ['channel-messages', 'list', params],
      byChannel: (channelId) => ['channel-messages', 'byChannel', channelId]
    }
  },

  // Profile
  profile: {
    all: ['user-profile'],
    byEmail: (email) => ['user-profile', 'byEmail', email],
    media: (userEmail) => ['user-media', userEmail],
    participations: (userEmail) => ['user-participations', userEmail],
    skillTracking: (userEmail) => ['skill-tracking', userEmail],
    preferences: (userEmail) => ['activity-preferences', userEmail]
  },

  // Analytics
  analytics: {
    overview: () => ['analytics', 'overview'],
    engagement: (period) => ['analytics', 'engagement', period],
    skills: () => ['analytics', 'skills']
  },

  // Onboarding
  onboarding: {
    all: ['onboarding'],
    byEmail: (email) => ['onboarding', 'byEmail', email]
  }
};