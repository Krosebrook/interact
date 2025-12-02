/**
 * CENTRALIZED API LAYER
 * All entity operations, backend functions, and integrations
 * Version: 4.0.0
 * Last Updated: 2025-12-02
 */

import { base44 } from '@/api/base44Client';

// ============================================================================
// QUERY CONFIGURATION
// ============================================================================

export const QUERY_CONFIG = {
  realTime: { staleTime: 0, gcTime: 30 * 1000 },
  frequent: { staleTime: 30 * 1000, gcTime: 2 * 60 * 1000 },
  standard: { staleTime: 2 * 60 * 1000, gcTime: 5 * 60 * 1000 },
  stable: { staleTime: 5 * 60 * 1000, gcTime: 15 * 60 * 1000 },
  static: { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000 }
};

// ============================================================================
// GENERIC ENTITY OPERATIONS
// ============================================================================

export const fetchEntityList = async (entityName, options = {}) => {
  const { sort = '-created_date', limit = 100 } = options;
  return base44.entities[entityName].list(sort, limit);
};

export const fetchEntityById = async (entityName, id) => {
  const results = await base44.entities[entityName].filter({ id });
  return results[0] || null;
};

export const fetchEntityFiltered = async (entityName, filter, sort = '-created_date', limit = 100) => {
  return base44.entities[entityName].filter(filter, sort, limit);
};

export const createEntity = async (entityName, data) => {
  return base44.entities[entityName].create(data);
};

export const updateEntity = async (entityName, id, data) => {
  return base44.entities[entityName].update(id, data);
};

export const deleteEntity = async (entityName, id) => {
  return base44.entities[entityName].delete(id);
};

// ============================================================================
// USER SERVICES
// ============================================================================

export const UserService = {
  me: () => base44.auth.me(),
  updateMe: (data) => base44.auth.updateMe(data),
  logout: (redirectUrl) => base44.auth.logout(redirectUrl),
  redirectToLogin: (nextUrl) => base44.auth.redirectToLogin(nextUrl),
  isAuthenticated: () => base44.auth.isAuthenticated(),
  list: (limit = 100) => base44.entities.User.list('-created_date', limit),
  getById: (id) => fetchEntityById('User', id),
  getByEmail: async (email) => {
    const results = await base44.entities.User.filter({ email });
    return results[0] || null;
  }
};

export const UserPointsService = {
  list: (sort = '-total_points', limit = 500) => base44.entities.UserPoints.list(sort, limit),
  getByEmail: async (email) => {
    const results = await base44.entities.UserPoints.filter({ user_email: email });
    return results[0] || null;
  },
  create: (data) => base44.entities.UserPoints.create(data),
  update: (id, data) => base44.entities.UserPoints.update(id, data),
  upsert: async (email, data) => {
    const existing = await UserPointsService.getByEmail(email);
    if (existing) {
      return base44.entities.UserPoints.update(existing.id, data);
    }
    return base44.entities.UserPoints.create({ user_email: email, ...data });
  }
};

export const UserProfileService = {
  list: (limit = 100) => base44.entities.UserProfile.list('-created_date', limit),
  getByEmail: async (email) => {
    const results = await base44.entities.UserProfile.filter({ user_email: email });
    return results[0] || null;
  },
  create: (data) => base44.entities.UserProfile.create(data),
  update: (id, data) => base44.entities.UserProfile.update(id, data),
  upsert: async (email, data) => {
    const existing = await UserProfileService.getByEmail(email);
    if (existing) {
      return base44.entities.UserProfile.update(existing.id, data);
    }
    return base44.entities.UserProfile.create({ user_email: email, ...data });
  }
};

// ============================================================================
// GAMIFICATION SERVICES
// ============================================================================

export const BadgeService = {
  list: () => base44.entities.Badge.list('display_order', 100),
  getById: (id) => fetchEntityById('Badge', id),
  create: (data) => base44.entities.Badge.create(data),
  update: (id, data) => base44.entities.Badge.update(id, data),
  delete: (id) => base44.entities.Badge.delete(id),
  getByCategory: (category) => fetchEntityFiltered('Badge', { category }),
  getByRarity: (rarity) => fetchEntityFiltered('Badge', { rarity })
};

export const BadgeAwardService = {
  list: (limit = 1000) => base44.entities.BadgeAward.list('-created_date', limit),
  getByUser: (email) => fetchEntityFiltered('BadgeAward', { user_email: email }),
  getByBadge: (badgeId) => fetchEntityFiltered('BadgeAward', { badge_id: badgeId }),
  create: (data) => base44.entities.BadgeAward.create(data)
};

export const ChallengeService = {
  personal: {
    list: (limit = 500) => base44.entities.PersonalChallenge.list('-created_date', limit),
    getByUser: (email, status) => {
      const filter = { user_email: email };
      if (status) filter.status = status;
      return fetchEntityFiltered('PersonalChallenge', filter);
    },
    create: (data) => base44.entities.PersonalChallenge.create(data),
    update: (id, data) => base44.entities.PersonalChallenge.update(id, data)
  },
  team: {
    list: (limit = 200) => base44.entities.TeamChallenge.list('-created_date', limit),
    getActive: () => fetchEntityFiltered('TeamChallenge', { status: 'active' }),
    create: (data) => base44.entities.TeamChallenge.create(data),
    update: (id, data) => base44.entities.TeamChallenge.update(id, data)
  }
};

export const TierService = {
  list: () => base44.entities.AchievementTier.list('tier_level', 20),
  getByLevel: async (level) => {
    const results = await base44.entities.AchievementTier.filter({ tier_level: level });
    return results[0] || null;
  },
  getUserTier: async (lifetimePoints) => {
    const tiers = await TierService.list();
    return tiers.filter(t => lifetimePoints >= t.points_required)
      .sort((a, b) => b.tier_level - a.tier_level)[0] || null;
  }
};

export const SocialShareService = {
  list: (limit = 100) => base44.entities.SocialShare.list('-created_date', limit),
  getByUser: (email, limit = 50) => fetchEntityFiltered('SocialShare', { user_email: email }, '-created_date', limit),
  getPublic: (limit = 50) => fetchEntityFiltered('SocialShare', { visibility: 'public' }, '-created_date', limit),
  create: (data) => base44.entities.SocialShare.create(data),
  react: async (shareId, userEmail, reaction) => {
    const share = await fetchEntityById('SocialShare', shareId);
    if (!share) return null;
    
    const reactions = share.reactions || { likes: 0, celebrates: 0, inspired: 0 };
    reactions[reaction] = (reactions[reaction] || 0) + 1;
    
    const reactionUsers = share.reaction_users || [];
    reactionUsers.push({ user_email: userEmail, reaction, timestamp: new Date().toISOString() });
    
    return base44.entities.SocialShare.update(shareId, { reactions, reaction_users: reactionUsers });
  }
};

// ============================================================================
// A/B TESTING SERVICES
// ============================================================================

export const ABTestService = {
  list: (limit = 50) => base44.entities.GamificationABTest.list('-created_date', limit),
  getById: (id) => fetchEntityById('GamificationABTest', id),
  getActive: () => fetchEntityFiltered('GamificationABTest', { status: 'running' }),
  create: (data) => base44.entities.GamificationABTest.create(data),
  update: (id, data) => base44.entities.GamificationABTest.update(id, data),
  assignUser: async (testId, userEmail, variant) => {
    const test = await fetchEntityById('GamificationABTest', testId);
    if (!test) return null;
    
    const assignments = test.user_assignments || [];
    if (assignments.some(a => a.user_email === userEmail)) return test;
    
    assignments.push({ user_email: userEmail, variant, assigned_date: new Date().toISOString() });
    return base44.entities.GamificationABTest.update(testId, { user_assignments: assignments });
  }
};

// ============================================================================
// CONFIGURATION SERVICES
// ============================================================================

export const ConfigService = {
  gamification: {
    get: async () => {
      const configs = await base44.entities.GamificationConfig.filter({ config_key: 'default' });
      return configs[0] || null;
    },
    upsert: async (data) => {
      const existing = await ConfigService.gamification.get();
      if (existing) {
        return base44.entities.GamificationConfig.update(existing.id, data);
      }
      return base44.entities.GamificationConfig.create({ config_key: 'default', ...data });
    }
  }
};

// ============================================================================
// EVENT SERVICES
// ============================================================================

export const EventService = {
  list: (sort = '-scheduled_date', limit = 100) => base44.entities.Event.list(sort, limit),
  getById: (id) => fetchEntityById('Event', id),
  getUpcoming: () => fetchEntityFiltered('Event', { 
    status: 'scheduled',
    scheduled_date: { $gte: new Date().toISOString() }
  }, 'scheduled_date'),
  create: (data) => base44.entities.Event.create(data),
  update: (id, data) => base44.entities.Event.update(id, data),
  delete: (id) => base44.entities.Event.delete(id),
  cancel: (id, reason) => base44.entities.Event.update(id, { 
    status: 'cancelled', 
    reschedule_reason: reason 
  })
};

export const ActivityService = {
  list: (limit = 100) => base44.entities.Activity.list('-popularity_score', limit),
  getById: (id) => fetchEntityById('Activity', id),
  getByType: (type) => fetchEntityFiltered('Activity', { type }),
  create: (data) => base44.entities.Activity.create(data),
  update: (id, data) => base44.entities.Activity.update(id, data),
  delete: (id) => base44.entities.Activity.delete(id)
};

export const ParticipationService = {
  list: (limit = 1000) => base44.entities.Participation.list('-created_date', limit),
  getByEvent: (eventId) => fetchEntityFiltered('Participation', { event_id: eventId }),
  getByUser: (email) => fetchEntityFiltered('Participation', { participant_email: email }),
  create: (data) => base44.entities.Participation.create(data),
  update: (id, data) => base44.entities.Participation.update(id, data),
  markAttended: (id) => base44.entities.Participation.update(id, { attended: true })
};

// ============================================================================
// RECOGNITION SERVICES
// ============================================================================

export const RecognitionService = {
  list: (limit = 100) => base44.entities.Recognition.list('-created_date', limit),
  getPublic: (limit = 50) => fetchEntityFiltered('Recognition', { visibility: 'public', status: 'approved' }, '-created_date', limit),
  getFeatured: (limit = 10) => fetchEntityFiltered('Recognition', { is_featured: true, status: 'approved' }, '-created_date', limit),
  getByRecipient: (email) => fetchEntityFiltered('Recognition', { recipient_email: email }),
  getBySender: (email) => fetchEntityFiltered('Recognition', { sender_email: email }),
  getPending: () => fetchEntityFiltered('Recognition', { status: 'pending' }),
  create: (data) => base44.entities.Recognition.create(data),
  update: (id, data) => base44.entities.Recognition.update(id, data),
  approve: (id) => base44.entities.Recognition.update(id, { status: 'approved' }),
  reject: (id, reason) => base44.entities.Recognition.update(id, { status: 'rejected', moderation_notes: reason }),
  feature: (id, featured = true) => base44.entities.Recognition.update(id, { is_featured: featured }),
  react: async (id, reaction) => {
    const rec = await fetchEntityById('Recognition', id);
    if (!rec) return null;
    const reactions = rec.reactions || {};
    reactions[reaction] = (reactions[reaction] || 0) + 1;
    return base44.entities.Recognition.update(id, { reactions });
  }
};

// ============================================================================
// TEAM & CHANNEL SERVICES
// ============================================================================

export const TeamService = {
  list: (sort = '-total_points', limit = 50) => base44.entities.Team.list(sort, limit),
  getById: (id) => fetchEntityById('Team', id),
  create: (data) => base44.entities.Team.create(data),
  update: (id, data) => base44.entities.Team.update(id, data),
  delete: (id) => base44.entities.Team.delete(id),
  getMemberships: (teamId) => fetchEntityFiltered('TeamMembership', { team_id: teamId }),
  getUserMemberships: (email) => fetchEntityFiltered('TeamMembership', { user_email: email }),
  addMember: (teamId, userEmail, role = 'member') => base44.entities.TeamMembership.create({
    team_id: teamId,
    user_email: userEmail,
    role
  }),
  removeMember: (membershipId) => base44.entities.TeamMembership.delete(membershipId)
};

export const ChannelService = {
  list: (limit = 50) => base44.entities.Channel.list('-created_date', limit),
  getById: (id) => fetchEntityById('Channel', id),
  create: (data) => base44.entities.Channel.create(data),
  update: (id, data) => base44.entities.Channel.update(id, data),
  delete: (id) => base44.entities.Channel.delete(id),
  getMessages: (channelId, limit = 100) => fetchEntityFiltered('ChannelMessage', { channel_id: channelId }, '-created_date', limit),
  sendMessage: (channelId, data) => base44.entities.ChannelMessage.create({ channel_id: channelId, ...data })
};

// ============================================================================
// STORE SERVICES
// ============================================================================

export const StoreService = {
  items: {
    list: () => base44.entities.StoreItem.list('category', 100),
    getById: (id) => fetchEntityById('StoreItem', id),
    getByCategory: (category) => fetchEntityFiltered('StoreItem', { category, is_available: true }),
    create: (data) => base44.entities.StoreItem.create(data),
    update: (id, data) => base44.entities.StoreItem.update(id, data)
  },
  inventory: {
    getByUser: (email) => fetchEntityFiltered('UserInventory', { user_email: email }),
    create: (data) => base44.entities.UserInventory.create(data)
  },
  avatar: {
    getByUser: async (email) => {
      const results = await base44.entities.UserAvatar.filter({ user_email: email });
      return results[0] || null;
    },
    upsert: async (email, data) => {
      const existing = await StoreService.avatar.getByUser(email);
      if (existing) {
        return base44.entities.UserAvatar.update(existing.id, data);
      }
      return base44.entities.UserAvatar.create({ user_email: email, ...data });
    }
  },
  transactions: {
    create: (data) => base44.entities.StoreTransaction.create(data),
    getByUser: (email) => fetchEntityFiltered('StoreTransaction', { user_email: email })
  }
};

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export const NotificationService = {
  list: (limit = 100) => base44.entities.Notification.list('-created_date', limit),
  getByUser: (email, limit = 50) => fetchEntityFiltered('Notification', { user_email: email }, '-created_date', limit),
  getUnread: (email) => fetchEntityFiltered('Notification', { user_email: email, read: false }),
  create: (data) => base44.entities.Notification.create(data),
  markRead: (id) => base44.entities.Notification.update(id, { read: true }),
  markAllRead: async (email) => {
    const unread = await NotificationService.getUnread(email);
    return Promise.all(unread.map(n => NotificationService.markRead(n.id)));
  }
};

// ============================================================================
// REWARD SERVICES
// ============================================================================

export const RewardService = {
  list: () => base44.entities.Reward.list('-created_date', 100),
  getAvailable: () => fetchEntityFiltered('Reward', { is_available: true }),
  getById: (id) => fetchEntityById('Reward', id),
  create: (data) => base44.entities.Reward.create(data),
  update: (id, data) => base44.entities.Reward.update(id, data),
  redemptions: {
    getByUser: (email) => fetchEntityFiltered('RewardRedemption', { user_email: email }),
    create: (data) => base44.entities.RewardRedemption.create(data),
    updateStatus: (id, status, notes) => base44.entities.RewardRedemption.update(id, { status, fulfillment_notes: notes })
  }
};

// ============================================================================
// BACKEND FUNCTIONS
// ============================================================================

export const BackendFunctions = {
  awardPoints: (userEmail, data) => base44.functions.invoke('awardPoints', { user_email: userEmail, ...data }),
  purchaseWithPoints: (userEmail, itemId) => base44.functions.invoke('purchaseWithPoints', { user_email: userEmail, item_id: itemId }),
  sendTeamsNotification: (data) => base44.functions.invoke('sendTeamsNotification', data),
  generateCalendarFile: (eventId) => base44.functions.invoke('generateCalendarFile', { event_id: eventId }),
  createNotification: (data) => base44.functions.invoke('createNotification', data),
  
  // AI Functions
  openai: (action, data) => base44.functions.invoke('openaiIntegration', { action, ...data }),
  claude: (action, data) => base44.functions.invoke('claudeIntegration', { action, ...data }),
  gemini: (action, data) => base44.functions.invoke('geminiIntegration', { action, ...data })
};

// ============================================================================
// CORE INTEGRATIONS
// ============================================================================

export const Integrations = {
  invokeLLM: (params) => base44.integrations.Core.InvokeLLM(params),
  uploadFile: (file) => base44.integrations.Core.UploadFile({ file }),
  sendEmail: (params) => base44.integrations.Core.SendEmail(params),
  generateImage: (prompt) => base44.integrations.Core.GenerateImage({ prompt }),
  extractData: (fileUrl, schema) => base44.integrations.Core.ExtractDataFromUploadedFile({ file_url: fileUrl, json_schema: schema })
};

// ============================================================================
// SOCIAL SERVICES
// ============================================================================

export const SocialService = {
  follow: (followerEmail, followeeEmail) => base44.entities.UserFollow.create({
    follower_email: followerEmail,
    following_email: followeeEmail,
    status: 'active'
  }),
  unfollow: async (followerEmail, followeeEmail) => {
    const follows = await base44.entities.UserFollow.filter({
      follower_email: followerEmail,
      following_email: followeeEmail
    });
    if (follows[0]) {
      return base44.entities.UserFollow.delete(follows[0].id);
    }
  },
  getFollowers: (email) => fetchEntityFiltered('UserFollow', { following_email: email, status: 'active' }),
  getFollowing: (email) => fetchEntityFiltered('UserFollow', { follower_email: email, status: 'active' }),
  isFollowing: async (followerEmail, followeeEmail) => {
    const follows = await base44.entities.UserFollow.filter({
      follower_email: followerEmail,
      following_email: followeeEmail,
      status: 'active'
    });
    return follows.length > 0;
  }
};

// ============================================================================
// LEADERBOARD SERVICES
// ============================================================================

export const LeaderboardService = {
  getSnapshot: async (period = 'all_time') => {
    const snapshots = await fetchEntityFiltered('LeaderboardSnapshot', { period }, '-created_date', 1);
    return snapshots[0] || null;
  },
  createSnapshot: (data) => base44.entities.LeaderboardSnapshot.create(data),
  getRankings: async (options = {}) => {
    const { category = 'points', period = 'all_time', limit = 100 } = options;
    const userPoints = await UserPointsService.list('-total_points', limit);
    
    const sortField = {
      points: 'total_points',
      events: 'events_attended',
      badges: 'badges_earned',
      engagement: 'engagement_score'
    }[category] || 'total_points';
    
    return userPoints
      .sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0))
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        score: user[sortField] || 0
      }));
  }
};