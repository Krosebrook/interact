/**
 * Error Messages Constants
 * Centralized user-facing error messages
 */

export const ERROR_MESSAGES = {
  // Authentication
  AUTH_FAILED: 'Authentication failed. Please log in again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  
  // Data Loading
  LOAD_FAILED: 'Failed to load data. Please refresh the page.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  
  // Form Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_URL: 'Please enter a valid URL.',
  
  // File Upload
  FILE_TOO_LARGE: 'File size exceeds 10MB limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Only images and PDFs are allowed.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Events
  EVENT_CREATE_FAILED: 'Failed to create event. Please try again.',
  EVENT_UPDATE_FAILED: 'Failed to update event. Please try again.',
  EVENT_DELETE_FAILED: 'Failed to delete event. Please try again.',
  EVENT_NOT_FOUND: 'Event not found.',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
};

export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  EVENT_DELETED: 'Event deleted successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  CHANGES_SAVED: 'Changes saved successfully!',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
};