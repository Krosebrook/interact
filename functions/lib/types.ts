/**
 * SHARED API TYPES
 * Type definitions for Deno functions and frontend integration
 * 
 * Since Base44 uses JavaScript, we use JSDoc for type annotations
 */

/**
 * @typedef {'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_SERVER_ERROR' | 'SERVICE_UNAVAILABLE'} ApiErrorCode
 */

/**
 * @typedef {Object} ApiError
 * @property {ApiErrorCode} code - Error code
 * @property {string} message - Human-readable error message
 * @property {Object} [details] - Additional error details
 * @property {string} timestamp - ISO timestamp
 * @property {string} [requestId] - Request tracking ID
 */

/**
 * @typedef {Object} ApiErrorResponse
 * @property {ApiError} error - Error object
 */

/**
 * @typedef {Object} ApiSuccessResponse
 * @property {boolean} success - Success flag
 * @property {string} [message] - Optional message
 * @property {*} [data] - Response data
 */

/**
 * @typedef {Object} AuthenticatedUser
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} full_name - User full name
 * @property {'admin' | 'user'} role - User role
 * @property {string} [user_type] - User type (facilitator, participant)
 */

/**
 * @typedef {'announcement' | 'reminder' | 'recap'} NotificationType
 */

/**
 * @typedef {Object} SendTeamsNotificationPayload
 * @property {string} eventId - Event ID
 * @property {NotificationType} notificationType - Type of notification
 * @property {string} [customMessage] - Optional custom message
 */

/**
 * @typedef {Object} SendTeamsNotificationResponse
 * @property {boolean} success - Success flag
 * @property {string} message - Response message
 * @property {string} [messageId] - Teams message ID if available
 */

/**
 * @typedef {Object} AwardPointsPayload
 * @property {string} userEmail - User email to award points
 * @property {number} points - Points to award
 * @property {string} reason - Reason for points
 * @property {string} [eventId] - Related event ID
 */

/**
 * @typedef {Object} ValidationRule
 * @property {boolean} [required] - Field is required
 * @property {'string' | 'number' | 'boolean' | 'array' | 'object'} [type] - Expected type
 * @property {number} [minLength] - Minimum string length
 * @property {number} [maxLength] - Maximum string length
 * @property {number} [min] - Minimum number value
 * @property {number} [max] - Maximum number value
 * @property {RegExp} [pattern] - Regex pattern to match
 * @property {string[]} [enum] - Allowed enum values
 * @property {function(*): boolean} [custom] - Custom validation function
 */

/**
 * @typedef {Object.<string, ValidationRule>} ValidationSchema
 */

export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const NOTIFICATION_TYPES = {
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
  RECAP: 'recap'
};