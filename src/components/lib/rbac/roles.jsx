/**
 * RBAC ROLES & PERMISSIONS CONFIGURATION
 * Production-grade role definitions and permission checking
 */

// Owner email(s) - Configure with actual owner emails
// Support multiple companies: Intinc, Edgewater, etc.
export const OWNER_EMAILS = [
  // 'owner@intinc.com',
  // 'admin@edgewater.com',
  // Add owner emails here - leave empty if using all admins
];

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  FACILITATOR: 'facilitator',
  PARTICIPANT: 'participant'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [ROLES.OWNER]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.FACILITATOR]: 2,
  [ROLES.PARTICIPANT]: 1
};

// Permission matrix
export const PERMISSIONS = {
  // User management
  INVITE_USERS: [ROLES.OWNER, ROLES.ADMIN],
  MANAGE_ROLES: [ROLES.OWNER], // Only owner can change roles
  SUSPEND_USERS: [ROLES.OWNER, ROLES.ADMIN],
  VIEW_ALL_USERS: [ROLES.OWNER, ROLES.ADMIN],
  
  // Event management
  CREATE_EVENTS: [ROLES.OWNER, ROLES.ADMIN, ROLES.FACILITATOR],
  EDIT_ANY_EVENT: [ROLES.OWNER, ROLES.ADMIN],
  DELETE_EVENTS: [ROLES.OWNER, ROLES.ADMIN],
  FACILITATE_EVENTS: [ROLES.OWNER, ROLES.ADMIN, ROLES.FACILITATOR],
  
  // Analytics & Reports
  VIEW_ANALYTICS: [ROLES.OWNER, ROLES.ADMIN, ROLES.FACILITATOR],
  EXPORT_DATA: [ROLES.OWNER, ROLES.ADMIN],
  EXPORT_SENSITIVE_DATA: [ROLES.OWNER], // PII, salary data, etc
  
  // Gamification
  MANAGE_BADGES: [ROLES.OWNER, ROLES.ADMIN],
  MANAGE_REWARDS: [ROLES.OWNER, ROLES.ADMIN],
  ADJUST_POINTS: [ROLES.OWNER, ROLES.ADMIN],
  
  // Settings
  CONFIGURE_SYSTEM: [ROLES.OWNER],
  CONFIGURE_GAMIFICATION: [ROLES.OWNER, ROLES.ADMIN],
  VIEW_AUDIT_LOG: [ROLES.OWNER, ROLES.ADMIN]
};

/**
 * Check if user is owner (immutable superuser)
 */
export function isOwner(user) {
  if (!user?.email) return false;
  return OWNER_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Get effective role (owner overrides all)
 */
export function getEffectiveRole(user) {
  if (!user) return null;
  if (isOwner(user)) return ROLES.OWNER;
  if (user.role === 'admin') return ROLES.ADMIN;
  if (user.user_type === 'facilitator') return ROLES.FACILITATOR;
  return ROLES.PARTICIPANT;
}

/**
 * Check if user has permission
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  
  const role = getEffectiveRole(user);
  if (!role) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(role);
}

/**
 * Check if user has higher or equal role
 */
export function hasRoleOrHigher(user, requiredRole) {
  const userRole = getEffectiveRole(user);
  if (!userRole) return false;
  
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can access resource owned by another user
 */
export function canAccessUserResource(currentUser, resourceOwnerEmail) {
  if (!currentUser || !resourceOwnerEmail) return false;
  
  // Owners and admins can access any resource
  if (hasPermission(currentUser, 'VIEW_ALL_USERS')) return true;
  
  // Users can access their own resources
  return currentUser.email === resourceOwnerEmail;
}

/**
 * Validate role assignment (prevent privilege escalation)
 */
export function canAssignRole(currentUser, targetRole) {
  if (!currentUser) return false;
  
  const currentRole = getEffectiveRole(currentUser);
  
  // Only owner can assign owner role (though this should never happen in UI)
  if (targetRole === ROLES.OWNER) return false;
  
  // Only owner can assign admin role
  if (targetRole === ROLES.ADMIN) return currentRole === ROLES.OWNER;
  
  // Admins can assign facilitator/participant
  if (targetRole === ROLES.FACILITATOR || targetRole === ROLES.PARTICIPANT) {
    return currentRole === ROLES.OWNER || currentRole === ROLES.ADMIN;
  }
  
  return false;
}

/**
 * Get user display role
 */
export function getDisplayRole(user) {
  const role = getEffectiveRole(user);
  const roleLabels = {
    [ROLES.OWNER]: 'Owner',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.FACILITATOR]: 'Facilitator',
    [ROLES.PARTICIPANT]: 'Employee'
  };
  return roleLabels[role] || 'User';
}