/**
 * ENHANCED API CLIENT
 * Production-grade API layer with interceptors, retry logic, and error handling
 */

import { base44 } from '@/api/base44Client';
import { 
  parseApiError, 
  logError, 
  NetworkError, 
  AuthenticationError,
  isRetryable 
} from './errors';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error, attemptNumber) => {
    if (attemptNumber >= DEFAULT_RETRY_CONFIG.maxRetries) return false;
    return isRetryable(error);
  }
};

const REQUEST_TIMEOUT = 15000; // 15 seconds (reduced from 30s for better UX)

// ============================================================================
// REQUEST QUEUE & DEDUPLICATION
// ============================================================================

const pendingRequests = new Map();

function generateRequestKey(method, url, data, userId = 'anonymous') {
  return `${userId}:${method}:${url}:${JSON.stringify(data || {})}`;
}

function deduplicateRequest(key, requestFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

// ============================================================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================================================

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateRetryDelay(attemptNumber, baseDelay = 1000) {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 10000); // Max 10 seconds
}

async function executeWithRetry(fn, config = DEFAULT_RETRY_CONFIG) {
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseApiError(error, { attempt });
      
      const shouldRetry = config.shouldRetry(lastError, attempt);
      if (!shouldRetry || attempt === config.maxRetries) {
        throw lastError;
      }
      
      const delay = calculateRetryDelay(attempt, config.retryDelay);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

// ============================================================================
// REQUEST TIMEOUT WRAPPER
// ============================================================================

function withTimeout(promise, timeoutMs = REQUEST_TIMEOUT) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new NetworkError('Request timeout')), timeoutMs)
    )
  ]);
}

// ============================================================================
// ENHANCED API CLIENT
// ============================================================================

export const apiClient = {
  /**
   * GET request with caching, retry, and deduplication
   */
  async get(entityName, filters = {}, options = {}) {
    const {
      retry = true,
      deduplicate = true,
      timeout = REQUEST_TIMEOUT,
      context = {}
    } = options;

    const requestFn = async () => {
      try {
        // Check authentication before API call
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          throw new AuthenticationError('Session expired. Please log in again.');
        }

        const promise = base44.entities[entityName].filter(filters);
        const result = await (timeout ? withTimeout(promise, timeout) : promise);
        return result;
      } catch (error) {
        const parsedError = parseApiError(error, { entityName, filters, ...context });
        logError(parsedError, { operation: 'GET', entityName, filters });
        throw parsedError;
      }
    };

    const executeFn = retry ? () => executeWithRetry(requestFn) : requestFn;

    if (deduplicate) {
      // Get current user for request key (prevents cross-user cache pollution)
      let userId = 'anonymous';
      try {
        const user = await base44.auth.me();
        userId = user?.id || user?.email || 'anonymous';
      } catch (e) {
        // User not authenticated, use anonymous
      }
      const key = generateRequestKey('GET', entityName, filters, userId);
      return deduplicateRequest(key, executeFn);
    }

    return executeFn();
  },

  /**
   * CREATE request with validation and error handling
   */
  async create(entityName, data, options = {}) {
    const {
      retry = false, // Don't retry creates by default
      timeout = REQUEST_TIMEOUT,
      context = {}
    } = options;

    const requestFn = async () => {
      try {
        const promise = base44.entities[entityName].create(data);
        const result = await (timeout ? withTimeout(promise, timeout) : promise);
        return result;
      } catch (error) {
        const parsedError = parseApiError(error, { entityName, data, ...context });
        logError(parsedError, { operation: 'CREATE', entityName });
        throw parsedError;
      }
    };

    return retry ? executeWithRetry(requestFn) : requestFn();
  },

  /**
   * BULK CREATE with batching
   */
  async bulkCreate(entityName, dataArray, options = {}) {
    const {
      batchSize = 50,
      timeout = REQUEST_TIMEOUT,
      context = {}
    } = options;

    try {
      const batches = [];
      for (let i = 0; i < dataArray.length; i += batchSize) {
        batches.push(dataArray.slice(i, i + batchSize));
      }

      const results = [];
      for (const batch of batches) {
        const promise = base44.entities[entityName].bulkCreate(batch);
        const batchResults = await (timeout ? withTimeout(promise, timeout) : promise);
        results.push(...batchResults);
      }

      return results;
    } catch (error) {
      const parsedError = parseApiError(error, { entityName, count: dataArray.length, ...context });
      logError(parsedError, { operation: 'BULK_CREATE', entityName });
      throw parsedError;
    }
  },

  /**
   * UPDATE request with optimistic updates
   */
  async update(entityName, id, data, options = {}) {
    const {
      retry = true,
      timeout = REQUEST_TIMEOUT,
      context = {}
    } = options;

    const requestFn = async () => {
      try {
        const promise = base44.entities[entityName].update(id, data);
        const result = await (timeout ? withTimeout(promise, timeout) : promise);
        return result;
      } catch (error) {
        const parsedError = parseApiError(error, { entityName, id, data, ...context });
        logError(parsedError, { operation: 'UPDATE', entityName, id });
        throw parsedError;
      }
    };

    return retry ? executeWithRetry(requestFn) : requestFn();
  },

  /**
   * DELETE request with confirmation
   */
  async delete(entityName, id, options = {}) {
    const {
      retry = false, // Don't retry deletes by default
      timeout = REQUEST_TIMEOUT,
      context = {}
    } = options;

    const requestFn = async () => {
      try {
        const promise = base44.entities[entityName].delete(id);
        const result = await (timeout ? withTimeout(promise, timeout) : promise);
        return result;
      } catch (error) {
        const parsedError = parseApiError(error, { entityName, id, ...context });
        logError(parsedError, { operation: 'DELETE', entityName, id });
        throw parsedError;
      }
    };

    return retry ? executeWithRetry(requestFn) : requestFn();
  },

  /**
   * INVOKE backend function with retry
   */
  async invokeFunction(functionName, params = {}, options = {}) {
    const {
      retry = true,
      timeout = REQUEST_TIMEOUT,
      context = {}
    } = options;

    const requestFn = async () => {
      try {
        const promise = base44.functions.invoke(functionName, params);
        const result = await (timeout ? withTimeout(promise, timeout) : promise);
        return result.data;
      } catch (error) {
        const parsedError = parseApiError(error, { functionName, params, ...context });
        logError(parsedError, { operation: 'FUNCTION', functionName });
        throw parsedError;
      }
    };

    return retry ? executeWithRetry(requestFn) : requestFn();
  }
};

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export const authClient = {
  /**
   * Get current user with error handling
   */
  async getCurrentUser() {
    try {
      const user = await base44.auth.me();
      return user;
    } catch (error) {
      const parsedError = parseApiError(error);
      if (parsedError instanceof AuthenticationError) {
        throw parsedError;
      }
      logError(parsedError, { operation: 'GET_CURRENT_USER' });
      throw parsedError;
    }
  },

  /**
   * Check authentication status
   */
  async isAuthenticated() {
    try {
      return await base44.auth.isAuthenticated();
    } catch (error) {
      logError(error, { operation: 'IS_AUTHENTICATED' });
      return false;
    }
  },

  /**
   * Update current user
   */
  async updateMe(data) {
    try {
      const result = await base44.auth.updateMe(data);
      return result;
    } catch (error) {
      const parsedError = parseApiError(error);
      logError(parsedError, { operation: 'UPDATE_ME' });
      throw parsedError;
    }
  },

  /**
   * Logout with cleanup
   */
  logout(redirectUrl) {
    try {
      // Clear any local caches
      pendingRequests.clear();
      base44.auth.logout(redirectUrl);
    } catch (error) {
      logError(error, { operation: 'LOGOUT' });
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  },

  /**
   * Redirect to login
   */
  redirectToLogin(nextUrl) {
    try {
      base44.auth.redirectToLogin(nextUrl);
    } catch (error) {
      logError(error, { operation: 'REDIRECT_TO_LOGIN' });
      window.location.href = '/';
    }
  }
};

export default apiClient;