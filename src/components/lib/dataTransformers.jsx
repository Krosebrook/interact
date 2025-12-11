/**
 * DATA TRANSFORMATION LAYERS
 * Input/output transformation and sanitization for API interactions
 * Ensures data security, privacy, and compliance with RBAC rules
 */

import { ValidationError } from './errors';
import { Sanitizers } from './validation';

// ============================================================================
// SENSITIVE FIELD DEFINITIONS
// ============================================================================

const SENSITIVE_FIELDS = {
  // Employee PII (HR-only)
  employee: ['salary', 'ssn', 'date_of_birth', 'home_address', 'emergency_contact'],
  
  // Authentication (never sent to frontend)
  auth: ['password', 'password_hash', 'token', 'api_key', 'secret', 'private_key'],
  
  // Survey responses (anonymized)
  survey: ['respondent_email', 'respondent_id', 'ip_address'],
};

// ============================================================================
// OUTPUT TRANSFORMERS (Backend → Frontend)
// ============================================================================

/**
 * Transform employee data based on user permissions
 */
export function transformEmployeeData(data, userPermissions = {}) {
  const { canViewSalaryData = false, canViewAllEmployees = false } = userPermissions;
  
  if (!data) return data;
  
  const transform = (employee) => {
    const transformed = { ...employee };
    
    // Always remove auth fields
    SENSITIVE_FIELDS.auth.forEach(field => delete transformed[field]);
    
    // Remove PII unless user has HR permissions
    if (!canViewAllEmployees && !canViewSalaryData) {
      SENSITIVE_FIELDS.employee.forEach(field => delete transformed[field]);
    }
    
    return transformed;
  };
  
  return Array.isArray(data) ? data.map(transform) : transform(data);
}

/**
 * Transform survey responses (anonymize if needed)
 */
export function transformSurveyData(data, options = {}) {
  const { 
    anonymize = true, 
    minResponsesForDisplay = 5,
    totalResponses = 0 
  } = options;
  
  if (!data) return data;
  
  const transform = (response) => {
    const transformed = { ...response };
    
    // Remove identifying fields if anonymizing
    if (anonymize) {
      SENSITIVE_FIELDS.survey.forEach(field => delete transformed[field]);
      delete transformed.created_by;
    }
    
    // Add anonymity indicator
    transformed.is_anonymous = anonymize;
    transformed.can_display = totalResponses >= minResponsesForDisplay;
    
    return transformed;
  };
  
  return Array.isArray(data) ? data.map(transform) : transform(data);
}

/**
 * Transform recognition posts based on visibility settings
 */
export function transformRecognitionData(data, currentUserEmail = null) {
  if (!data) return data;
  
  const transform = (recognition) => {
    const transformed = { ...recognition };
    
    // Filter private recognitions
    if (transformed.visibility === 'private') {
      const isAuthor = transformed.created_by === currentUserEmail;
      const isRecipient = transformed.recipient_email === currentUserEmail;
      
      if (!isAuthor && !isRecipient) {
        return null; // Filter out
      }
    }
    
    // Add computed properties
    transformed.can_edit = transformed.created_by === currentUserEmail;
    transformed.can_delete = transformed.created_by === currentUserEmail;
    
    return transformed;
  };
  
  const result = Array.isArray(data) ? data.map(transform).filter(Boolean) : transform(data);
  return result;
}

/**
 * Generic output transformer with field masking
 */
export function transformOutput(data, options = {}) {
  const { 
    removeFields = [], 
    maskFields = [],
    sanitize = true 
  } = options;
  
  if (!data) return data;
  
  const transform = (item) => {
    const transformed = { ...item };
    
    // Remove specified fields
    removeFields.forEach(field => delete transformed[field]);
    
    // Mask specified fields
    maskFields.forEach(field => {
      if (transformed[field]) {
        const value = String(transformed[field]);
        transformed[field] = value.slice(0, 3) + '***' + value.slice(-3);
      }
    });
    
    // Sanitize strings
    if (sanitize) {
      Object.keys(transformed).forEach(key => {
        if (typeof transformed[key] === 'string') {
          transformed[key] = Sanitizers.sanitizeString(transformed[key]);
        }
      });
    }
    
    return transformed;
  };
  
  return Array.isArray(data) ? data.map(transform) : transform(data);
}

// ============================================================================
// INPUT TRANSFORMERS (Frontend → Backend)
// ============================================================================

/**
 * Transform and validate employee input before submission
 */
export function transformEmployeeInput(data, currentUserRole = 'participant') {
  if (!data) throw new ValidationError('Employee data is required');
  
  const transformed = { ...data };
  
  // Remove client-only fields
  delete transformed.can_edit;
  delete transformed.can_delete;
  delete transformed.is_loading;
  
  // Sanitize text inputs
  if (transformed.bio) {
    transformed.bio = Sanitizers.sanitizeHtml(transformed.bio);
  }
  
  // Only HR can set salary data
  if (currentUserRole !== 'admin' && currentUserRole !== 'hr') {
    SENSITIVE_FIELDS.employee.forEach(field => delete transformed[field]);
  }
  
  // Remove any auth-related fields (defense in depth)
  SENSITIVE_FIELDS.auth.forEach(field => delete transformed[field]);
  
  return transformed;
}

/**
 * Transform recognition input before submission
 */
export function transformRecognitionInput(data) {
  if (!data) throw new ValidationError('Recognition data is required');
  
  const transformed = {
    recipient_email: data.recipient_email,
    message: Sanitizers.sanitizeHtml(data.message || ''),
    recognition_type: data.recognition_type || 'general',
    visibility: data.visibility || 'public',
    tags: Array.isArray(data.tags) ? data.tags.map(t => Sanitizers.sanitizeString(t)) : [],
  };
  
  // Validate required fields
  if (!transformed.recipient_email) {
    throw new ValidationError('Recipient email is required');
  }
  
  if (!transformed.message || transformed.message.length < 10) {
    throw new ValidationError('Message must be at least 10 characters');
  }
  
  return transformed;
}

/**
 * Transform survey response input
 */
export function transformSurveyInput(data, anonymize = true) {
  if (!data) throw new ValidationError('Survey response is required');
  
  const transformed = {
    survey_id: data.survey_id,
    responses: data.responses,
    submitted_at: new Date().toISOString(),
  };
  
  // Include user identifier only if not anonymous
  if (!anonymize) {
    transformed.respondent_email = data.respondent_email;
  }
  
  // Sanitize open-ended responses
  if (transformed.responses) {
    Object.keys(transformed.responses).forEach(key => {
      if (typeof transformed.responses[key] === 'string') {
        transformed.responses[key] = Sanitizers.sanitizeHtml(transformed.responses[key]);
      }
    });
  }
  
  return transformed;
}

/**
 * Generic input transformer with validation
 */
export function transformInput(data, schema = null) {
  if (!data) throw new ValidationError('Data is required');
  
  let transformed = Sanitizers.deepSanitize(data);
  
  // Remove auth fields (defense in depth)
  SENSITIVE_FIELDS.auth.forEach(field => delete transformed[field]);
  
  // Apply schema validation if provided
  if (schema && typeof schema.validate === 'function') {
    const validation = schema.validate(transformed);
    if (!validation.valid) {
      throw new ValidationError(
        'Validation failed',
        { errors: validation.errors }
      );
    }
    transformed = validation.data;
  }
  
  return transformed;
}

// ============================================================================
// BATCH TRANSFORMERS
// ============================================================================

/**
 * Transform multiple items with error handling
 */
export function transformBatch(items, transformer, options = {}) {
  const { stopOnError = false } = options;
  
  if (!Array.isArray(items)) return [];
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      const transformed = transformer(items[i]);
      if (transformed) results.push(transformed);
    } catch (error) {
      errors.push({ index: i, error });
      if (stopOnError) throw error;
    }
  }
  
  return { results, errors };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const DataTransformers = {
  // Output (Backend → Frontend)
  transformEmployeeData,
  transformSurveyData,
  transformRecognitionData,
  transformOutput,
  
  // Input (Frontend → Backend)
  transformEmployeeInput,
  transformRecognitionInput,
  transformSurveyInput,
  transformInput,
  
  // Batch
  transformBatch,
};

export default DataTransformers;