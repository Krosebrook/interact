/**
 * Utility functions for example feature module
 * 
 * These helper functions provide common operations and transformations
 * needed by the example feature components.
 */

/**
 * Format feature data for display
 * 
 * @param {Object} data - Raw feature data
 * @returns {Object} Formatted data
 */
export function formatFeatureData(data) {
  if (!data) return null;

  return {
    ...data,
    formattedDate: data.lastUpdated 
      ? new Date(data.lastUpdated).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'N/A'
  };
}

/**
 * Validate feature configuration
 * 
 * @param {Object} config - Feature configuration
 * @returns {Object} Validation result with isValid and errors
 */
export function validateFeatureConfig(config) {
  const errors = [];

  if (!config) {
    return { isValid: false, errors: ['Configuration is required'] };
  }

  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }

  if (config.title && config.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate unique identifier
 * 
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique identifier
 */
export function generateFeatureId(prefix = 'feat') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Calculate feature metrics
 * 
 * @param {Array} items - Array of feature items
 * @returns {Object} Calculated metrics
 */
export function calculateFeatureMetrics(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      averageScore: 0
    };
  }

  const active = items.filter(item => item.status === 'active').length;
  const completed = items.filter(item => item.status === 'completed').length;
  const scores = items.map(item => item.score || 0).filter(score => score > 0);
  const averageScore = scores.length > 0
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;

  return {
    total: items.length,
    active,
    completed,
    averageScore: parseFloat(averageScore.toFixed(2))
  };
}

/**
 * Filter items by criteria
 * 
 * @param {Array} items - Array of items to filter
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered items
 */
export function filterFeatureItems(items = [], criteria = {}) {
  if (!Array.isArray(items)) return [];
  if (Object.keys(criteria).length === 0) return items;

  return items.filter(item => {
    return Object.entries(criteria).every(([key, value]) => {
      if (value === null || value === undefined) return true;
      
      // Handle array values (OR logic)
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      
      // Handle string comparison (case-insensitive)
      if (typeof value === 'string' && typeof item[key] === 'string') {
        return item[key].toLowerCase().includes(value.toLowerCase());
      }
      
      // Handle exact match
      return item[key] === value;
    });
  });
}

/**
 * Sort items by field
 * 
 * @param {Array} items - Array of items to sort
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted items
 */
export function sortFeatureItems(items = [], field = 'createdAt', direction = 'desc') {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? -1 : 1;
    if (bVal == null) return direction === 'asc' ? 1 : -1;

    // Handle dates
    if (field.includes('Date') || field.includes('At')) {
      const aDate = new Date(aVal).getTime();
      const bDate = new Date(bVal).getTime();
      
      // Validate dates before comparison
      if (isNaN(aDate) && isNaN(bDate)) return 0;
      if (isNaN(aDate)) return direction === 'asc' ? -1 : 1;
      if (isNaN(bDate)) return direction === 'asc' ? 1 : -1;
      
      return direction === 'asc' ? aDate - bDate : bDate - aDate;
    }

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle strings
    const comparison = String(aVal).localeCompare(String(bVal));
    return direction === 'asc' ? comparison : -comparison;
  });
}
