/**
 * Validation Utilities
 * Common validation functions for form inputs and data
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export function isValidUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required field
 * @param {any} value - Value to check
 * @returns {boolean} Is not empty
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate minimum length
 * @param {string} value - Value to check
 * @param {number} min - Minimum length
 * @returns {boolean} Meets minimum length
 */
export function minLength(value, min) {
  if (!value) return false;
  return value.length >= min;
}

/**
 * Validate maximum length
 * @param {string} value - Value to check
 * @param {number} max - Maximum length
 * @returns {boolean} Within maximum length
 */
export function maxLength(value, max) {
  if (!value) return true;
  return value.length <= max;
}

/**
 * Validate number is within range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Within range
 */
export function isInRange(value, min, max) {
  if (value === null || value === undefined) return false;
  return value >= min && value <= max;
}

/**
 * Validate positive number
 * @param {number} value - Value to check
 * @returns {boolean} Is positive
 */
export function isPositive(value) {
  if (value === null || value === undefined) return false;
  return value > 0;
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {boolean} Is allowed type
 */
export function isAllowedFileType(file, allowedTypes) {
  if (!file || !allowedTypes) return false;
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} Within size limit
 */
export function isWithinFileSize(file, maxSizeMB) {
  if (!file) return false;
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate date is in future
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is future date
 */
export function isFutureDate(date) {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

/**
 * Validate date is in past
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is past date
 */
export function isPastDate(date) {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Validate points value
 * @param {number} points - Points to validate
 * @returns {boolean} Is valid points value
 */
export function isValidPoints(points) {
  return Number.isInteger(points) && points >= 0 && points <= 1000000;
}

/**
 * Validate form data object
 * @param {object} data - Data to validate
 * @param {object} rules - Validation rules
 * @returns {object} { isValid, errors }
 */
export function validateForm(data, rules) {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      if (rule.required && !isRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
        break;
      }
      if (rule.minLength && !minLength(value, rule.minLength)) {
        errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
        break;
      }
      if (rule.maxLength && !maxLength(value, rule.maxLength)) {
        errors[field] = rule.message || `${field} must be at most ${rule.maxLength} characters`;
        break;
      }
      if (rule.email && value && !isValidEmail(value)) {
        errors[field] = rule.message || 'Invalid email format';
        break;
      }
      if (rule.url && value && !isValidUrl(value)) {
        errors[field] = rule.message || 'Invalid URL format';
        break;
      }
      if (rule.custom && !rule.custom(value, data)) {
        errors[field] = rule.message || `${field} is invalid`;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}