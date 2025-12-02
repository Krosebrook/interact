/**
 * LIB BARREL EXPORT
 * Centralized export for core library modules
 */

// Configuration
export { APP_CONFIG, FEATURE_FLAGS, API_CONFIG, AUTH_CONFIG } from './config';

// Constants
export { 
  POINTS_CONFIG, 
  LEVEL_THRESHOLDS, 
  BADGE_RARITIES,
  EVENT_TYPES,
  EVENT_STATUSES,
  ACTIVITY_TYPES,
  RECOGNITION_CATEGORIES,
  BRAND_COLORS
} from './constants';

// API Layer
export { 
  fetchEntityList, 
  fetchEntityById, 
  createEntity, 
  updateEntity, 
  deleteEntity,
  bulkCreateEntities,
  getEntitySchema,
  invokeFunction,
  backendFunctions,
  integrations
} from './api';

// Query Keys & Cache
export { queryKeys, invalidationGroups } from './queryKeys';
export { cachePresets, getCacheConfig, CACHE_TIMES } from './cacheConfig';

// Utilities
export { 
  formatDate, 
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  calculateEngagementScore,
  getUserLevel
} from './utils';