/**
 * RUNTIME VALIDATION UTILITIES
 * Type checking and data validation for production safety
 */

import { ValidationError } from './errors';

// ============================================================================
// TYPE CHECKING
// ============================================================================

export const Types = {
  isString: (value) => typeof value === 'string',
  isNumber: (value) => typeof value === 'number' && !isNaN(value),
  isBoolean: (value) => typeof value === 'boolean',
  isObject: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  isArray: (value) => Array.isArray(value),
  isFunction: (value) => typeof value === 'function',
  isDate: (value) => value instanceof Date && !isNaN(value),
  isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isUrl: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  isEmpty: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export class ValidationSchema {
  constructor(rules) {
    this.rules = rules;
  }

  validate(data, options = {}) {
    const { partial = false, strict = true } = options;
    const errors = [];

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];

      // Check required fields
      if (rule.required && !partial && Types.isEmpty(value)) {
        errors.push({
          field,
          message: rule.message || `${field} is required`,
          code: 'REQUIRED'
        });
        continue;
      }

      // Skip validation if value is empty and not required
      if (Types.isEmpty(value) && !rule.required) continue;

      // Type validation
      if (rule.type && !rule.type(value)) {
        errors.push({
          field,
          message: rule.typeMessage || `${field} has invalid type`,
          code: 'INVALID_TYPE'
        });
        continue;
      }

      // Custom validation function
      if (rule.validate && !rule.validate(value)) {
        errors.push({
          field,
          message: rule.message || `${field} is invalid`,
          code: 'INVALID_VALUE'
        });
      }

      // Min/Max for strings
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.minLength} characters`,
          code: 'MIN_LENGTH'
        });
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field,
          message: `${field} must be at most ${rule.maxLength} characters`,
          code: 'MAX_LENGTH'
        });
      }

      // Min/Max for numbers
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.min}`,
          code: 'MIN_VALUE'
        });
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field,
          message: `${field} must be at most ${rule.max}`,
          code: 'MAX_VALUE'
        });
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rule.enum.join(', ')}`,
          code: 'INVALID_ENUM'
        });
      }

      // Pattern matching
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          field,
          message: rule.patternMessage || `${field} format is invalid`,
          code: 'INVALID_PATTERN'
        });
      }
    }

    // Check for unknown fields in strict mode
    if (strict) {
      const knownFields = Object.keys(this.rules);
      const unknownFields = Object.keys(data).filter(k => !knownFields.includes(k));
      if (unknownFields.length > 0) {
        errors.push({
          field: null,
          message: `Unknown fields: ${unknownFields.join(', ')}`,
          code: 'UNKNOWN_FIELDS'
        });
      }
    }

    if (errors.length > 0) {
      const error = new ValidationError('Validation failed');
      error.errors = errors;
      throw error;
    }

    return true;
  }

  validateField(field, value) {
    const rule = this.rules[field];
    if (!rule) return true;

    try {
      this.validate({ [field]: value }, { partial: true });
      return true;
    } catch (error) {
      return error.errors[0]?.message || 'Invalid value';
    }
  }
}

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

export const CommonSchemas = {
  email: new ValidationSchema({
    email: {
      required: true,
      type: Types.isString,
      validate: Types.isEmail,
      message: 'Valid email is required'
    }
  }),

  eventCreate: new ValidationSchema({
    activity_id: {
      required: true,
      type: Types.isString,
      message: 'Activity is required'
    },
    title: {
      required: true,
      type: Types.isString,
      minLength: 3,
      maxLength: 200,
      message: 'Title must be between 3 and 200 characters'
    },
    scheduled_date: {
      required: true,
      type: Types.isString,
      validate: (v) => !isNaN(Date.parse(v)),
      message: 'Valid date is required'
    },
    duration_minutes: {
      required: true,
      type: Types.isNumber,
      min: 5,
      max: 480,
      message: 'Duration must be between 5 and 480 minutes'
    }
  }),

  userUpdate: new ValidationSchema({
    full_name: {
      type: Types.isString,
      minLength: 2,
      maxLength: 100
    },
    bio: {
      type: Types.isString,
      maxLength: 500
    },
    avatar_url: {
      type: Types.isString,
      validate: Types.isUrl
    }
  }),

  recognitionCreate: new ValidationSchema({
    recipient_email: {
      required: true,
      type: Types.isString,
      validate: Types.isEmail,
      message: 'Valid recipient email is required'
    },
    category: {
      required: true,
      type: Types.isString,
      enum: ['teamwork', 'innovation', 'leadership', 'going_above', 'customer_focus', 'problem_solving', 'mentorship', 'culture_champion']
    },
    message: {
      required: true,
      type: Types.isString,
      minLength: 10,
      maxLength: 500,
      message: 'Message must be between 10 and 500 characters'
    }
  }),

  badgeCreate: new ValidationSchema({
    badge_name: {
      required: true,
      type: Types.isString,
      minLength: 3,
      maxLength: 50
    },
    badge_description: {
      required: true,
      type: Types.isString,
      minLength: 10,
      maxLength: 200
    },
    badge_icon: {
      required: true,
      type: Types.isString
    },
    rarity: {
      type: Types.isString,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary']
    }
  })
};

// ============================================================================
// SANITIZATION
// ============================================================================

export const Sanitizers = {
  /**
   * Sanitize string input (XSS prevention)
   */
  sanitizeString(input) {
    if (!Types.isString(input)) return input;
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim();
  },

  /**
   * Sanitize HTML (allow only safe tags)
   */
  sanitizeHtml(html) {
    if (!Types.isString(html)) return html;
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const elements = doc.body.querySelectorAll('*');
    
    elements.forEach(el => {
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        el.remove();
      }
    });
    
    return doc.body.innerHTML;
  },

  /**
   * Sanitize object (remove undefined/null values)
   */
  sanitizeObject(obj) {
    if (!Types.isObject(obj)) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  /**
   * Deep sanitize object
   */
  deepSanitize(data) {
    if (Types.isArray(data)) {
      return data.map(item => Sanitizers.deepSanitize(item));
    }
    
    if (Types.isObject(data)) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (Types.isString(value)) {
          sanitized[key] = Sanitizers.sanitizeString(value);
        } else if (Types.isObject(value) || Types.isArray(value)) {
          sanitized[key] = Sanitizers.deepSanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return data;
  }
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateOrThrow(schema, data, options) {
  return schema.validate(data, options);
}

export function validateSafe(schema, data, options) {
  try {
    schema.validate(data, options);
    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors || [{ message: error.message }]
    };
  }
}

export function assertType(value, typeFn, fieldName) {
  if (!typeFn(value)) {
    throw new ValidationError(`${fieldName} has invalid type`);
  }
}

export function assertRequired(value, fieldName) {
  if (Types.isEmpty(value)) {
    throw new ValidationError(`${fieldName} is required`);
  }
}