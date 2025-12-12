/**
 * VALIDATION UTILITIES
 * Client-side validation helpers
 */

import { VALIDATION_RULES } from '../constants';

// Email Validation
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL Validation
export function isValidUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// File Validation
export function isValidFileSize(file, maxSizeMB = VALIDATION_RULES.MAX_FILE_SIZE_MB) {
  if (!file) return false;
  return file.size <= maxSizeMB * 1024 * 1024;
}

export function isValidFileType(file, allowedTypes = VALIDATION_RULES.ALLOWED_FILE_TYPES) {
  if (!file) return false;
  return allowedTypes.includes(file.type);
}

export function isValidImageType(file) {
  return isValidFileType(file, VALIDATION_RULES.ALLOWED_IMAGE_TYPES);
}

export function validateFile(file, options = {}) {
  const {
    maxSize = VALIDATION_RULES.MAX_FILE_SIZE_MB,
    allowedTypes = VALIDATION_RULES.ALLOWED_FILE_TYPES
  } = options;

  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  if (!isValidFileSize(file, maxSize)) {
    errors.push(`File size must be less than ${maxSize}MB`);
  }

  if (!isValidFileType(file, allowedTypes)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// String Validation
export function isEmptyString(str) {
  return !str || str.trim().length === 0;
}

export function hasMinLength(str, minLength) {
  return str && str.length >= minLength;
}

export function hasMaxLength(str, maxLength) {
  return str && str.length <= maxLength;
}

export function isWithinLengthRange(str, min, max) {
  return hasMinLength(str, min) && hasMaxLength(str, max);
}

// Number Validation
export function isPositiveNumber(num) {
  return typeof num === 'number' && num > 0;
}

export function isNonNegativeNumber(num) {
  return typeof num === 'number' && num >= 0;
}

export function isInRange(num, min, max) {
  return typeof num === 'number' && num >= min && num <= max;
}

// Date Validation
export function isValidDate(date) {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
}

export function isFutureDate(date) {
  if (!isValidDate(date)) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj > new Date();
}

export function isPastDate(date) {
  if (!isValidDate(date)) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj < new Date();
}

// Form Validation
export function validateRequired(value, fieldName = 'Field') {
  if (value === null || value === undefined || (typeof value === 'string' && isEmptyString(value))) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: null };
}

export function validateEmail(email) {
  const required = validateRequired(email, 'Email');
  if (!required.isValid) return required;

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: null };
}

export function validateUrl(url, fieldName = 'URL') {
  const required = validateRequired(url, fieldName);
  if (!required.isValid) return required;

  if (!isValidUrl(url)) {
    return { isValid: false, error: `Please enter a valid ${fieldName}` };
  }

  return { isValid: true, error: null };
}

export function validateStringLength(str, min, max, fieldName = 'Field') {
  const required = validateRequired(str, fieldName);
  if (!required.isValid) return required;

  if (!isWithinLengthRange(str, min, max)) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max} characters`
    };
  }

  return { isValid: true, error: null };
}

// Complex Validations
export function validateEventData(data) {
  const errors = {};

  if (isEmptyString(data.title)) {
    errors.title = 'Event title is required';
  }

  if (!data.scheduled_date) {
    errors.scheduled_date = 'Event date is required';
  } else if (!isFutureDate(data.scheduled_date)) {
    errors.scheduled_date = 'Event date must be in the future';
  }

  if (!data.activity_id) {
    errors.activity_id = 'Please select an activity';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateProfileData(data) {
  const errors = {};

  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }

  if (data.display_name && isEmptyString(data.display_name)) {
    errors.display_name = 'Display name cannot be empty';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateTeamData(data) {
  const errors = {};

  if (isEmptyString(data.name)) {
    errors.name = 'Team name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Team name must be less than 100 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Sanitization (XSS Prevention)
export function sanitizeHtml(html) {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html;
  return tempDiv.innerHTML;
}

export function stripHtml(html) {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export default {
  // Basic
  isValidEmail,
  isValidUrl,
  isValidFileSize,
  isValidFileType,
  isValidImageType,
  validateFile,
  
  // String
  isEmptyString,
  hasMinLength,
  hasMaxLength,
  isWithinLengthRange,
  
  // Number
  isPositiveNumber,
  isNonNegativeNumber,
  isInRange,
  
  // Date
  isValidDate,
  isFutureDate,
  isPastDate,
  
  // Form
  validateRequired,
  validateEmail,
  validateUrl,
  validateStringLength,
  
  // Complex
  validateEventData,
  validateProfileData,
  validateTeamData,
  
  // Sanitization
  sanitizeHtml,
  stripHtml
};