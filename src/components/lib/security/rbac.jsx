/**
 * Role-Based Access Control (RBAC) Utilities
 * Security: Enforce permission boundaries
 */

/**
 * User roles hierarchy (higher = more permissions)
 */
export const ROLES = {
  PARTICIPANT: 'participant',
  FACILITATOR: 'facilitator',
  ADMIN: 'admin'
};

/**
 * Role hierarchy levels
 */
const ROLE_LEVELS = {
  [ROLES.PARTICIPANT]: 1,
  [ROLES.FACILITATOR]: 2,
  [ROLES.ADMIN]: 3
};

/**
 * Check if user has required role or higher
 * @param {Object} user - User object with role property
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean} Has permission
 */
export function hasRole(user, requiredRole) {
  if (!user || !user.role) return false;
  
  const userLevel = ROLE_LEVELS[user.role] || ROLE_LEVELS[user.user_type] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Check if user can access resource
 * @param {Object} user - Current user
 * @param {Object} resource - Resource with created_by or owner fields
 * @returns {boolean} Can access
 */
export function canAccessResource(user, resource) {
  if (!user || !resource) return false;
  
  // Admins can access everything
  if (hasRole(user, ROLES.ADMIN)) return true;
  
  // Check ownership
  return resource.created_by === user.email || 
         resource.owner_email === user.email ||
         resource.user_email === user.email;
}

/**
 * Check if user can modify resource
 * @param {Object} user - Current user
 * @param {Object} resource - Resource to modify
 * @returns {boolean} Can modify
 */
export function canModifyResource(user, resource) {
  if (!user || !resource) return false;
  
  // Admins and facilitators can modify
  if (hasRole(user, ROLES.FACILITATOR)) return true;
  
  // Participants can only modify their own resources
  return canAccessResource(user, resource);
}

/**
 * Filter sensitive fields based on user role
 * @param {Object} data - Data object
 * @param {Object} user - Current user
 * @returns {Object} Filtered data
 */
export function filterSensitiveData(data, user) {
  if (!data) return null;
  
  const isAdmin = hasRole(user, ROLES.ADMIN);
  
  // Clone to avoid mutation
  const filtered = { ...data };
  
  // Remove sensitive fields for non-admins
  if (!isAdmin) {
    delete filtered.salary;
    delete filtered.ssn;
    delete filtered.phone_number;
    delete filtered.address;
  }
  
  return filtered;
}

/**
 * Check if user can view analytics
 * @param {Object} user - Current user
 * @returns {boolean} Can view analytics
 */
export function canViewAnalytics(user) {
  return hasRole(user, ROLES.FACILITATOR);
}

/**
 * Check if user can manage users
 * @param {Object} user - Current user
 * @returns {boolean} Can manage users
 */
export function canManageUsers(user) {
  return hasRole(user, ROLES.ADMIN);
}