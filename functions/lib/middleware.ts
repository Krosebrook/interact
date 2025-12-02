/**
 * DENO FUNCTION MIDDLEWARE
 * Shared utilities for authentication, validation, and error handling
 * 
 * Usage:
 * import { withAuth, requireRole, validatePayload, handleError } from './lib/middleware.js';
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { API_ERROR_CODES } from './types.js';

// ============================================================================
// API EXCEPTION CLASS
// ============================================================================

/**
 * Custom API Exception for structured error handling
 */
export class ApiException extends Error {
  /**
   * @param {string} code - Error code from API_ERROR_CODES
   * @param {string} message - Human-readable message
   * @param {number} [status=500] - HTTP status code
   * @param {Object} [details] - Additional error details
   */
  constructor(code, message, status = 500, details = null) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Authenticate request and return user
 * @param {Request} req - Incoming request
 * @returns {Promise<Object>} Authenticated user
 * @throws {ApiException} If authentication fails
 */
export async function withAuth(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      throw new ApiException(
        API_ERROR_CODES.UNAUTHORIZED,
        'Authentication required',
        401
      );
    }
    
    return { user, base44 };
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException(
      API_ERROR_CODES.UNAUTHORIZED,
      'Invalid or expired authentication token',
      401
    );
  }
}

/**
 * Create role checker middleware
 * @param {...string} allowedRoles - Roles that are allowed
 * @returns {function(Object): void} Role checker function
 * @throws {ApiException} If user doesn't have required role
 */
export function requireRole(...allowedRoles) {
  return (user) => {
    if (!allowedRoles.includes(user.role)) {
      throw new ApiException(
        API_ERROR_CODES.FORBIDDEN,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${user.role}`,
        403
      );
    }
  };
}

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if admin
 */
export function isAdmin(user) {
  return user?.role === 'admin';
}

/**
 * Check if user is facilitator or admin
 * @param {Object} user - User object
 * @returns {boolean} True if facilitator or admin
 */
export function isFacilitatorOrAdmin(user) {
  return user?.role === 'admin' || user?.user_type === 'facilitator';
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate payload against schema
 * @param {Object} payload - Request payload
 * @param {Object} schema - Validation schema
 * @returns {Object} Validated payload
 * @throws {ApiException} If validation fails
 */
export function validatePayload(payload, schema) {
  const errors = {};
  const validated = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = payload[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip optional empty fields
    if (value === undefined || value === null) {
      if (rules.default !== undefined) {
        validated[field] = rules.default;
      }
      continue;
    }

    // Type check
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}, got ${actualType}`;
        continue;
      }
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
        continue;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`;
        continue;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `${field} has invalid format`;
        continue;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
        continue;
      }
      if (rules.max !== undefined && value > rules.max) {
        errors[field] = `${field} must be at most ${rules.max}`;
        continue;
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
      continue;
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      errors[field] = rules.customMessage || `${field} failed custom validation`;
      continue;
    }

    validated[field] = value;
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiException(
      API_ERROR_CODES.VALIDATION_ERROR,
      'Validation failed',
      400,
      errors
    );
  }

  return validated;
}

/**
 * Common validation patterns
 */
export const validators = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Create standardized error response
 * @param {Error|ApiException} error - Error object
 * @param {number} [startTime] - Request start time for logging
 * @returns {Response} JSON error response
 */
export function handleError(error, startTime = null) {
  const timestamp = new Date().toISOString();
  const duration = startTime ? `${Date.now() - startTime}ms` : null;

  // Handle known API exceptions
  if (error instanceof ApiException) {
    const body = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
        timestamp
      }
    };

    if (duration) {
      console.error(`[ERROR] ${error.code}: ${error.message} (${duration})`);
    }

    return new Response(JSON.stringify(body), {
      status: error.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle unexpected errors
  console.error(`[FATAL] Unexpected error:`, error);
  
  const body = {
    error: {
      code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      timestamp
    }
  };

  return new Response(JSON.stringify(body), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create success response
 * @param {Object} data - Response data
 * @param {number} [status=200] - HTTP status code
 * @returns {Response} JSON success response
 */
export function successResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create not found response
 * @param {string} resource - Resource name
 * @param {string} [id] - Resource ID
 * @returns {Response} JSON 404 response
 */
export function notFoundResponse(resource, id = null) {
  const message = id 
    ? `${resource} with ID '${id}' not found`
    : `${resource} not found`;
  
  throw new ApiException(API_ERROR_CODES.NOT_FOUND, message, 404);
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Log request details
 * @param {string} method - HTTP method
 * @param {string} functionName - Function name
 * @param {Object} [user] - Authenticated user
 * @param {Object} [details] - Additional details
 */
export function logRequest(method, functionName, user = null, details = null) {
  const logData = {
    timestamp: new Date().toISOString(),
    method,
    function: functionName,
    user: user ? { email: user.email, role: user.role } : null,
    ...(details && { details })
  };
  console.log(`[REQUEST]`, JSON.stringify(logData));
}

/**
 * Log error details
 * @param {string} functionName - Function name
 * @param {Error} error - Error object
 * @param {Object} [user] - Authenticated user
 */
export function logError(functionName, error, user = null) {
  const logData = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    user: user ? { email: user.email, role: user.role } : null
  };
  console.error(`[ERROR]`, JSON.stringify(logData));
}

// ============================================================================
// REQUEST HELPERS
// ============================================================================

/**
 * Parse JSON body from request
 * @param {Request} req - Incoming request
 * @returns {Promise<Object>} Parsed JSON body
 * @throws {ApiException} If body is invalid JSON
 */
export async function parseJsonBody(req) {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    throw new ApiException(
      API_ERROR_CODES.VALIDATION_ERROR,
      'Invalid JSON in request body',
      400
    );
  }
}

/**
 * Check HTTP method
 * @param {Request} req - Incoming request
 * @param {string|string[]} allowed - Allowed method(s)
 * @throws {ApiException} If method not allowed
 */
export function requireMethod(req, allowed) {
  const methods = Array.isArray(allowed) ? allowed : [allowed];
  if (!methods.includes(req.method)) {
    throw new ApiException(
      'METHOD_NOT_ALLOWED',
      `Method ${req.method} not allowed. Allowed: ${methods.join(', ')}`,
      405
    );
  }
}

// ============================================================================
// HANDLER WRAPPER
// ============================================================================

/**
 * Wrap handler with standard error handling and logging
 * @param {string} functionName - Name of the function for logging
 * @param {function(Request, Object): Promise<Response>} handler - Handler function
 * @param {Object} [options] - Options
 * @param {boolean} [options.requireAuth=true] - Require authentication
 * @param {string[]} [options.roles] - Required roles
 * @param {string} [options.method='POST'] - Required HTTP method
 * @returns {function(Request): Promise<Response>} Wrapped handler
 */
export function createHandler(functionName, handler, options = {}) {
  const {
    requireAuth = true,
    roles = null,
    method = 'POST'
  } = options;

  return async (req) => {
    const startTime = Date.now();
    let user = null;

    try {
      // Method check
      requireMethod(req, method);

      // Authentication
      let base44 = null;
      if (requireAuth) {
        const auth = await withAuth(req);
        user = auth.user;
        base44 = auth.base44;

        // Role check
        if (roles && roles.length > 0) {
          requireRole(...roles)(user);
        }
      }

      // Log request
      logRequest(req.method, functionName, user);

      // Execute handler
      const response = await handler(req, { user, base44, startTime });
      
      return response;
    } catch (error) {
      logError(functionName, error, user);
      return handleError(error, startTime);
    }
  };
}