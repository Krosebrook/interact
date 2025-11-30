/**
 * CENTRALIZED API LAYER
 * All entity operations and backend function calls go through here
 * Provides type safety, caching config, and error handling
 */

import { base44 } from '@/api/base44Client';

// ============================================================================
// QUERY CONFIGURATION
// ============================================================================

export const QUERY_CONFIG = {
  // Static data - rarely changes
  static: { staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 },
  // User-specific - changes moderately
  user: { staleTime: 30 * 1000, cacheTime: 5 * 60 * 1000 },
  // Real-time - needs fresh data
  realtime: { staleTime: 0, refetchInterval: 5000 },
  // Leaderboard - moderate refresh
  leaderboard: { staleTime: 60 * 1000, refetchInterval: 5 * 60 * 1000 }
};

// ============================================================================
// ENTITY SERVICES
// ============================================================================

export const UserService = {
  async getCurrentUser() {
    return base44.auth.me();
  },
  
  async isAuthenticated() {
    return base44.auth.isAuthenticated();
  },
  
  async updateCurrentUser(data) {
    return base44.auth.updateMe(data);
  },
  
  logout(redirectUrl) {
    base44.auth.logout(redirectUrl);
  },
  
  redirectToLogin(nextUrl) {
    base44.auth.redirectToLogin(nextUrl);
  }
};

export const UserPointsService = {
  async getByEmail(email) {
    const records = await base44.entities.UserPoints.filter({ user_email: email });
    return records[0] || null;
  },
  
  async getLeaderboard(limit = 100) {
    return base44.entities.UserPoints.list('-total_points', limit);
  },
  
  async update(id, data) {
    return base44.entities.UserPoints.update(id, data);
  }
};

export const UserProfileService = {
  async getByEmail(email) {
    const records = await base44.entities.UserProfile.filter({ user_email: email });
    return records[0] || null;
  },
  
  async getAll() {
    return base44.entities.UserProfile.list();
  },
  
  async update(id, data) {
    return base44.entities.UserProfile.update(id, data);
  },
  
  async create(data) {
    return base44.entities.UserProfile.create(data);
  }
};

export const RecognitionService = {
  async getByStatus(status, limit = 50) {
    return base44.entities.Recognition.filter({ status }, '-created_date', limit);
  },
  
  async getPublic(limit = 50) {
    return base44.entities.Recognition.filter(
      { status: 'approved', visibility: 'public' },
      '-created_date',
      limit
    );
  },
  
  async getFeatured(limit = 10) {
    return base44.entities.Recognition.filter(
      { is_featured: true, status: 'approved' },
      '-featured_at',
      limit
    );
  },
  
  async create(data) {
    return base44.entities.Recognition.create(data);
  },
  
  async update(id, data) {
    return base44.entities.Recognition.update(id, data);
  },
  
  async delete(id) {
    return base44.entities.Recognition.delete(id);
  }
};

export const EventService = {
  async getAll(limit = 100) {
    return base44.entities.Event.list('-scheduled_date', limit);
  },
  
  async getUpcoming(limit = 20) {
    const now = new Date().toISOString();
    const events = await base44.entities.Event.filter(
      { status: 'scheduled' },
      'scheduled_date',
      limit
    );
    return events.filter(e => e.scheduled_date >= now);
  },
  
  async create(data) {
    return base44.entities.Event.create(data);
  },
  
  async update(id, data) {
    return base44.entities.Event.update(id, data);
  },
  
  async delete(id) {
    return base44.entities.Event.delete(id);
  }
};

export const ActivityService = {
  async getAll() {
    return base44.entities.Activity.list();
  },
  
  async getById(id) {
    const records = await base44.entities.Activity.filter({ id });
    return records[0] || null;
  },
  
  async create(data) {
    return base44.entities.Activity.create(data);
  }
};

export const ParticipationService = {
  async getAll(limit = 500) {
    return base44.entities.Participation.list('-created_date', limit);
  },
  
  async getByEvent(eventId) {
    return base44.entities.Participation.filter({ event_id: eventId });
  },
  
  async getByUser(userEmail) {
    return base44.entities.Participation.filter({ participant_email: userEmail });
  },
  
  async create(data) {
    return base44.entities.Participation.create(data);
  },
  
  async update(id, data) {
    return base44.entities.Participation.update(id, data);
  }
};

export const StoreService = {
  async getItems(availableOnly = true) {
    if (availableOnly) {
      return base44.entities.StoreItem.filter({ is_available: true }, 'display_order');
    }
    return base44.entities.StoreItem.list('display_order');
  },
  
  async getInventory(userEmail) {
    return base44.entities.UserInventory.filter({ user_email: userEmail });
  },
  
  async getAvatar(userEmail) {
    const records = await base44.entities.UserAvatar.filter({ user_email: userEmail });
    return records[0] || null;
  },
  
  async updateAvatar(id, data) {
    return base44.entities.UserAvatar.update(id, data);
  },
  
  async createAvatar(data) {
    return base44.entities.UserAvatar.create(data);
  }
};

export const SocialService = {
  async getFollowing(userEmail) {
    return base44.entities.UserFollow.filter({
      follower_email: userEmail,
      status: 'active'
    });
  },
  
  async getFollowers(userEmail) {
    return base44.entities.UserFollow.filter({
      following_email: userEmail,
      status: 'active'
    });
  },
  
  async getBlocked(userEmail) {
    return base44.entities.UserFollow.filter({
      follower_email: userEmail,
      status: 'blocked'
    });
  },
  
  async getRelationship(followerEmail, followingEmail) {
    const records = await base44.entities.UserFollow.filter({
      follower_email: followerEmail,
      following_email: followingEmail
    });
    return records[0] || null;
  },
  
  async follow(followerEmail, followingEmail) {
    const existing = await this.getRelationship(followerEmail, followingEmail);
    if (existing) {
      return base44.entities.UserFollow.update(existing.id, { status: 'active' });
    }
    return base44.entities.UserFollow.create({
      follower_email: followerEmail,
      following_email: followingEmail,
      status: 'active'
    });
  },
  
  async unfollow(followerEmail, followingEmail) {
    const existing = await this.getRelationship(followerEmail, followingEmail);
    if (existing) {
      return base44.entities.UserFollow.delete(existing.id);
    }
  },
  
  async block(followerEmail, followingEmail) {
    const existing = await this.getRelationship(followerEmail, followingEmail);
    if (existing) {
      return base44.entities.UserFollow.update(existing.id, { status: 'blocked' });
    }
    return base44.entities.UserFollow.create({
      follower_email: followerEmail,
      following_email: followingEmail,
      status: 'blocked'
    });
  }
};

export const ChannelService = {
  async getAll() {
    return base44.entities.Channel.filter({ is_archived: false }, '-last_activity');
  },
  
  async getMessages(channelId, limit = 100) {
    return base44.entities.ChannelMessage.filter(
      { channel_id: channelId },
      '-created_date',
      limit
    );
  },
  
  async sendMessage(data) {
    return base44.entities.ChannelMessage.create(data);
  }
};

export const TeamService = {
  async getAll() {
    return base44.entities.Team.list('-total_points');
  },
  
  async getById(id) {
    const records = await base44.entities.Team.filter({ id });
    return records[0] || null;
  }
};

export const BadgeService = {
  async getAll() {
    return base44.entities.Badge.filter({ is_active: true });
  },
  
  async getAwards(userEmail) {
    return base44.entities.BadgeAward.filter({ user_email: userEmail });
  }
};

export const NotificationService = {
  async getForUser(userEmail, limit = 20) {
    return base44.entities.Notification.filter(
      { user_email: userEmail },
      '-created_date',
      limit
    );
  },
  
  async markAsRead(id) {
    return base44.entities.Notification.update(id, { is_read: true });
  },
  
  async delete(id) {
    return base44.entities.Notification.delete(id);
  }
};

// ============================================================================
// BACKEND FUNCTION CALLS
// ============================================================================

export const BackendFunctions = {
  async awardPoints(participationId, actionType) {
    const response = await base44.functions.invoke('awardPoints', {
      participationId,
      actionType
    });
    return response.data;
  },
  
  async purchaseWithPoints(itemId, quantity = 1) {
    const response = await base44.functions.invoke('purchaseWithPoints', {
      itemId,
      quantity
    });
    return response.data;
  },
  
  async createStoreCheckout(itemId) {
    const response = await base44.functions.invoke('createStoreCheckout', {
      itemId
    });
    return response.data;
  },
  
  async callOpenAI(action, prompt, options = {}) {
    const response = await base44.functions.invoke('openaiIntegration', {
      action,
      prompt,
      ...options
    });
    return response.data;
  },
  
  async callClaude(action, prompt, options = {}) {
    const response = await base44.functions.invoke('claudeIntegration', {
      action,
      prompt,
      ...options
    });
    return response.data;
  },
  
  async callGemini(action, prompt, options = {}) {
    const response = await base44.functions.invoke('geminiIntegration', {
      action,
      prompt,
      ...options
    });
    return response.data;
  }
};

// ============================================================================
// CORE INTEGRATIONS
// ============================================================================

export const Integrations = {
  async invokeLLM(prompt, options = {}) {
    return base44.integrations.Core.InvokeLLM({
      prompt,
      ...options
    });
  },
  
  async uploadFile(file) {
    return base44.integrations.Core.UploadFile({ file });
  },
  
  async sendEmail(to, subject, body, fromName) {
    return base44.integrations.Core.SendEmail({
      to,
      subject,
      body,
      from_name: fromName
    });
  },
  
  async generateImage(prompt) {
    return base44.integrations.Core.GenerateImage({ prompt });
  }
};