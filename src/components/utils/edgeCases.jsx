/**
 * Edge case handlers for common scenarios
 */

/**
 * Handle timezone conversion for events
 * Prevents time mismatch for remote teams
 */
export function normalizeEventTime(eventDate, userTimezone = 'UTC') {
  const date = new Date(eventDate);
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: userTimezone
  });
  return formatter.format(date);
}

/**
 * Validate email domains for SSO
 * Prevents unauthorized signups
 */
export function validateCompanyEmail(email, allowedDomains = ['intinc.com']) {
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
}

/**
 * Handle network retries with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const backoffMs = Math.pow(2, i) * 100 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw lastError;
}

/**
 * Safe navigation for nested objects
 * Prevents "cannot read property of undefined" errors
 */
export function safeGet(obj, path, defaultValue = null) {
  return path
    .split('.')
    .reduce((current, key) => current?.[key] ?? defaultValue, obj);
}

/**
 * Debounce function for search/input
 * Reduces API calls during typing
 */
export function debounce(fn, delay = 500) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Validate file uploads
 * Prevents oversized files
 */
export function validateFileUpload(file, maxSizeMb = 10, allowedTypes = ['image', 'pdf']) {
  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`File exceeds ${maxSizeMb}MB limit`);
  }

  const [type] = file.type.split('/');
  if (!allowedTypes.includes(type)) {
    throw new Error(`File type ${type} not allowed`);
  }

  return true;
}

/**
 * Handle empty states gracefully
 */
export function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

/**
 * Format relative time for display
 * "2 hours ago", "in 3 days"
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  
  return new Date(date).toLocaleDateString();
}

/**
 * Safe JSON parsing
 * Prevents crashes from invalid JSON
 */
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * Handle batch operations with rate limiting
 */
export async function batchProcess(items, processFn, batchSize = 10, delayMs = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Validate permission level
 */
export function hasPermission(userRole, userType, requiredPermission) {
  const permissions = {
    admin: ['create_event', 'edit_event', 'delete_event', 'moderate_content', 'manage_users'],
    facilitator: ['create_event', 'edit_event'],
    participant: ['rsvp_event', 'give_recognition']
  };

  const rolePermissions = permissions[userRole] || [];
  const typePermissions = permissions[userType] || [];
  
  return rolePermissions.includes(requiredPermission) || 
         typePermissions.includes(requiredPermission);
}

/**
 * Circular reference prevention
 */
export function sanitizeObject(obj, seen = new Set()) {
  if (seen.has(obj)) return '[Circular]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, seen));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key], seen);
    }
  }

  return sanitized;
}