/**
 * CENTRALIZED ERROR HANDLING SYSTEM
 * Custom error classes and error handling utilities
 * Production-grade error management with logging and recovery
 */

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

export class AppError extends Error {
  constructor(message, code, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', 0, true);
    this.retryable = true;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401, true);
    this.requiresLogin = true;
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', 400, true);
    this.field = field;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 'CONFLICT', 409, true);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests. Please try again later.', 'RATE_LIMIT', 429, true);
    this.retryAfter = retryAfter;
    this.retryable = true;
  }
}

export class ServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 'SERVER_ERROR', 500, false);
  }
}

// ============================================================================
// ERROR DETECTION UTILITIES
// ============================================================================

export function isNetworkError(error) {
  return error instanceof NetworkError ||
         error?.message?.toLowerCase().includes('network') ||
         error?.message?.toLowerCase().includes('fetch') ||
         !navigator.onLine;
}

export function isAuthError(error) {
  return error instanceof AuthenticationError ||
         error?.statusCode === 401 ||
         error?.code === 'AUTH_ERROR';
}

export function isAuthorizationError(error) {
  return error instanceof AuthorizationError ||
         error?.statusCode === 403;
}

export function isRetryable(error) {
  return error?.retryable === true ||
         error instanceof NetworkError ||
         error instanceof RateLimitError ||
         [408, 429, 500, 502, 503, 504].includes(error?.statusCode);
}

// ============================================================================
// ERROR PARSING FROM API RESPONSES
// ============================================================================

export function parseApiError(error, context = {}) {
  // Network errors
  if (!navigator.onLine) {
    return new NetworkError('No internet connection');
  }

  if (error?.message?.includes('Failed to fetch')) {
    return new NetworkError('Unable to reach server');
  }

  // HTTP status errors
  const status = error?.response?.status || error?.statusCode;
  const message = error?.response?.data?.message || 
                  error?.message || 
                  'An unexpected error occurred';

  switch (status) {
    case 400:
      return new ValidationError(message, error?.response?.data?.field);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(context.resource);
    case 409:
      return new ConflictError(message);
    case 429:
      const retryAfter = error?.response?.headers?.['retry-after'] || 60;
      return new RateLimitError(parseInt(retryAfter));
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new AppError(message, 'UNKNOWN_ERROR', status || 500);
  }
}

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES = {
  NETWORK_ERROR: {
    title: 'Connection Issue',
    message: 'Please check your internet connection and try again.',
    action: 'Retry'
  },
  AUTH_ERROR: {
    title: 'Authentication Required',
    message: 'Please sign in to continue.',
    action: 'Sign In'
  },
  AUTHORIZATION_ERROR: {
    title: 'Access Denied',
    message: "You don't have permission to access this resource.",
    action: 'Go Back'
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    message: 'Please check your information and try again.',
    action: 'Fix Issues'
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    action: 'Go Home'
  },
  CONFLICT: {
    title: 'Already Exists',
    message: 'This resource already exists.',
    action: 'Try Again'
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message: 'Please wait a moment before trying again.',
    action: 'Wait'
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    action: 'Retry'
  },
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry'
  }
};

export function getErrorDisplay(error) {
  const code = error?.code || 'UNKNOWN_ERROR';
  const defaultDisplay = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  return {
    ...defaultDisplay,
    message: error?.message || defaultDisplay.message,
    details: error?.details || null,
    timestamp: error?.timestamp || new Date().toISOString()
  };
}

// ============================================================================
// ERROR LOGGING (with privacy protection)
// ============================================================================

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'api_key', 'authorization'];

function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = Array.isArray(data) ? [] : {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export function logError(error, context = {}) {
  const errorData = {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    statusCode: error?.statusCode,
    timestamp: new Date().toISOString(),
    context: sanitizeData(context),
    stack: error?.stack,
    userAgent: navigator?.userAgent,
    url: window?.location?.href
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', errorData);
  }

  // In production, send to error tracking service (e.g., Sentry)
  // Implement when error tracking is set up
  
  return errorData;
}

// ============================================================================
// ERROR RECOVERY STRATEGIES
// ============================================================================

export const RECOVERY_STRATEGIES = {
  RETRY: 'retry',
  REDIRECT_LOGIN: 'redirect_login',
  REDIRECT_HOME: 'redirect_home',
  SHOW_MESSAGE: 'show_message',
  IGNORE: 'ignore'
};

export function getRecoveryStrategy(error) {
  if (error instanceof NetworkError) {
    return RECOVERY_STRATEGIES.RETRY;
  }
  
  if (error instanceof AuthenticationError) {
    return RECOVERY_STRATEGIES.REDIRECT_LOGIN;
  }
  
  if (error instanceof AuthorizationError) {
    return RECOVERY_STRATEGIES.REDIRECT_HOME;
  }
  
  if (isRetryable(error)) {
    return RECOVERY_STRATEGIES.RETRY;
  }
  
  return RECOVERY_STRATEGIES.SHOW_MESSAGE;
}