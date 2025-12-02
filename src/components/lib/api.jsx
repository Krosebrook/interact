/**
 * CENTRALIZED API LAYER
 * Standardized data fetching with caching, error handling, and retry logic
 */

import { base44 } from '@/api/base44Client';
import { API_CONFIG } from './config';

// ============================================================================
// ENTITY OPERATIONS
// ============================================================================

/**
 * Fetch entity list with standardized options
 */
export async function fetchEntityList(entityName, options = {}) {
  const { 
    sort = '-created_date', 
    limit = API_CONFIG.defaultPageSize,
    filter = null 
  } = options;

  const entity = base44.entities[entityName];
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found`);
  }

  if (filter) {
    return entity.filter(filter, sort, limit);
  }
  return entity.list(sort, limit);
}

/**
 * Fetch single entity by ID
 */
export async function fetchEntityById(entityName, id) {
  const entity = base44.entities[entityName];
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found`);
  }
  
  const results = await entity.filter({ id });
  return results[0] || null;
}

/**
 * Create entity with validation
 */
export async function createEntity(entityName, data) {
  const entity = base44.entities[entityName];
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found`);
  }
  return entity.create(data);
}

/**
 * Update entity
 */
export async function updateEntity(entityName, id, data) {
  const entity = base44.entities[entityName];
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found`);
  }
  return entity.update(id, data);
}

/**
 * Delete entity
 */
export async function deleteEntity(entityName, id) {
  const entity = base44.entities[entityName];
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found`);
  }
  return entity.delete(id);
}

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

export const queryKeys = {
  // Core entities
  events: {
    all: ['events'],
    list: (filters) => ['events', 'list', filters],
    detail: (id) => ['events', 'detail', id],
  },
  activities: {
    all: ['activities'],
    list: (filters) => ['activities', 'list', filters],
    detail: (id) => ['activities', 'detail', id],
  },
  participations: {
    all: ['participations'],
    byEvent: (eventId) => ['participations', 'event', eventId],
    byUser: (email) => ['participations', 'user', email],
  },
  
  // Gamification
  userPoints: {
    all: ['user-points'],
    byUser: (email) => ['user-points', email],
  },
  badges: {
    all: ['badges'],
    byUser: (email) => ['badges', 'user', email],
  },
  leaderboard: {
    all: ['leaderboard'],
    byPeriod: (period, category) => ['leaderboard', period, category],
  },
  
  // Teams & Social
  teams: {
    all: ['teams'],
    detail: (id) => ['teams', 'detail', id],
    members: (teamId) => ['teams', 'members', teamId],
  },
  channels: {
    all: ['channels'],
    messages: (channelId) => ['channels', 'messages', channelId],
  },
  recognition: {
    all: ['recognition'],
    byUser: (email) => ['recognition', 'user', email],
  },
  
  // Store
  storeItems: {
    all: ['store-items'],
    byCategory: (category) => ['store-items', 'category', category],
  },
  inventory: {
    byUser: (email) => ['inventory', email],
  },
  
  // User
  user: {
    current: ['user', 'current'],
    profile: (email) => ['user', 'profile', email],
    preferences: (email) => ['user', 'preferences', email],
  },
  
  // Polls
  polls: {
    all: ['time-slot-polls'],
    active: ['time-slot-polls', 'active'],
  },
  
  // Analytics
  analytics: {
    dashboard: ['analytics', 'dashboard'],
    engagement: (period) => ['analytics', 'engagement', period],
    skills: ['analytics', 'skills'],
  }
};

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const cacheConfig = {
  events: {
    staleTime: API_CONFIG.cacheTime.medium,
    cacheTime: API_CONFIG.cacheTime.long,
  },
  activities: {
    staleTime: API_CONFIG.cacheTime.long,
    cacheTime: API_CONFIG.cacheTime.static,
  },
  user: {
    staleTime: API_CONFIG.cacheTime.short,
    cacheTime: API_CONFIG.cacheTime.medium,
  },
  leaderboard: {
    staleTime: API_CONFIG.cacheTime.medium,
    cacheTime: API_CONFIG.cacheTime.long,
  },
  static: {
    staleTime: API_CONFIG.cacheTime.static,
    cacheTime: API_CONFIG.cacheTime.static,
  }
};

// ============================================================================
// BACKEND FUNCTION CALLS
// ============================================================================

export async function invokeFunction(functionName, params = {}) {
  return base44.functions.invoke(functionName, params);
}

// Common function helpers
export const backendFunctions = {
  sendTeamsNotification: (eventId, notificationType) => 
    invokeFunction('sendTeamsNotification', { eventId, notificationType }),
  
  generateCalendarFile: (eventId) => 
    invokeFunction('generateCalendarFile', { eventId }),
  
  awardPoints: (userEmail, pointsData) => 
    invokeFunction('awardPoints', { userEmail, ...pointsData }),
  
  generateRecommendations: (context) => 
    invokeFunction('generateRecommendations', context),
  
  purchaseWithPoints: (itemId, userEmail) => 
    invokeFunction('purchaseWithPoints', { itemId, userEmail }),
};

// ============================================================================
// INTEGRATION HELPERS
// ============================================================================

export const integrations = {
  invokeLLM: (prompt, options = {}) => 
    base44.integrations.Core.InvokeLLM({
      prompt,
      ...options
    }),
  
  uploadFile: (file) => 
    base44.integrations.Core.UploadFile({ file }),
  
  generateImage: (prompt) => 
    base44.integrations.Core.GenerateImage({ prompt }),
  
  sendEmail: (to, subject, body, fromName = null) => 
    base44.integrations.Core.SendEmail({ to, subject, body, from_name: fromName }),
};