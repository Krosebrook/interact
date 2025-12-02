/**
 * CENTRALIZED API LAYER
 * Standardized data fetching with caching, error handling, and retry logic
 * 
 * This module provides:
 * - Entity CRUD operations
 * - Backend function invocation
 * - Integration helpers
 * 
 * For query keys, see: ./queryKeys.js
 * For cache config, see: ./cacheConfig.js
 */

import { base44 } from '@/api/base44Client';
import { API_CONFIG } from './config';

// Re-export query keys and cache config for convenience
export { queryKeys, invalidationGroups } from './queryKeys';
export { cachePresets, getCacheConfig, CACHE_TIMES } from './cacheConfig';

// ============================================================================
// ENTITY OPERATIONS
// ============================================================================

/**
 * Fetch entity list with standardized options
 * @param {string} entityName - Name of the entity
 * @param {Object} options - Fetch options
 * @param {string} options.sort - Sort field (prefix with - for descending)
 * @param {number} options.limit - Max results
 * @param {Object} options.filter - Filter criteria
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

/**
 * Bulk create entities
 */
export async function bulkCreateEntities(entityName, dataArray) {
  const entity = base44.entities[entityName];
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found`);
  }
  return entity.bulkCreate(dataArray);
}

/**
 * Get entity schema
 */
export async function getEntitySchema(entityName) {
  const entity = base44.entities[entityName];
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found`);
  }
  return entity.schema();
}

// ============================================================================
// BACKEND FUNCTION CALLS
// ============================================================================

/**
 * Invoke a backend function
 * @param {string} functionName - Name of the function
 * @param {Object} params - Function parameters
 */
export async function invokeFunction(functionName, params = {}) {
  return base44.functions.invoke(functionName, params);
}

/**
 * Pre-configured backend function helpers
 */
export const backendFunctions = {
  // Notifications
  sendTeamsNotification: (eventId, notificationType) => 
    invokeFunction('sendTeamsNotification', { eventId, notificationType }),
  
  sendSlackNotification: (eventId, notificationType) => 
    invokeFunction('slackNotifications', { eventId, notificationType }),
  
  // Calendar
  generateCalendarFile: (eventId) => 
    invokeFunction('generateCalendarFile', { eventId }),
  
  syncToGoogleCalendar: (eventId, userEmail) => 
    invokeFunction('syncToGoogleCalendar', { eventId, userEmail }),
  
  // Gamification
  awardPoints: (userEmail, pointsData) => 
    invokeFunction('awardPoints', { userEmail, ...pointsData }),
  
  updateStreak: (userEmail) => 
    invokeFunction('updateAttendanceStreak', { userEmail }),
  
  // Store
  purchaseWithPoints: (itemId, userEmail) => 
    invokeFunction('purchaseWithPoints', { itemId, userEmail }),
  
  createStoreCheckout: (itemId, userEmail) => 
    invokeFunction('createStoreCheckout', { itemId, userEmail }),
  
  // AI & Recommendations
  generateRecommendations: (context) => 
    invokeFunction('generateRecommendations', context),
  
  generateAIInsights: (data) => 
    invokeFunction('generateAIInsights', data),
  
  generateFacilitatorGuide: (eventId) => 
    invokeFunction('generateFacilitatorGuide', { eventId }),
  
  // Reports
  exportEventReport: (eventId, format) => 
    invokeFunction('exportEventReport', { eventId, format }),
  
  summarizeEvent: (eventId) => 
    invokeFunction('summarizeEvent', { eventId }),
};

// ============================================================================
// INTEGRATION HELPERS
// ============================================================================

/**
 * Core platform integrations
 */
export const integrations = {
  /**
   * Invoke LLM with prompt
   */
  invokeLLM: (prompt, options = {}) => 
    base44.integrations.Core.InvokeLLM({
      prompt,
      ...options
    }),
  
  /**
   * Upload file to storage
   */
  uploadFile: (file) => 
    base44.integrations.Core.UploadFile({ file }),
  
  /**
   * Upload private file
   */
  uploadPrivateFile: (file) => 
    base44.integrations.Core.UploadPrivateFile({ file }),
  
  /**
   * Generate image with AI
   */
  generateImage: (prompt) => 
    base44.integrations.Core.GenerateImage({ prompt }),
  
  /**
   * Send email
   */
  sendEmail: (to, subject, body, fromName = null) => 
    base44.integrations.Core.SendEmail({ to, subject, body, from_name: fromName }),
  
  /**
   * Extract data from uploaded file
   */
  extractDataFromFile: (fileUrl, jsonSchema) => 
    base44.integrations.Core.ExtractDataFromUploadedFile({ file_url: fileUrl, json_schema: jsonSchema }),
};