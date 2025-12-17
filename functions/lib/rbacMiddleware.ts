/**
 * RBAC MIDDLEWARE FOR BACKEND FUNCTIONS
 * Centralized permission checking for server-side operations
 */

const OWNER_EMAILS = []; // Configure with actual owner emails - leave empty if none

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  FACILITATOR: 'facilitator',
  PARTICIPANT: 'participant'
};

export const PERMISSIONS = {
  INVITE_USERS: [ROLES.OWNER, ROLES.ADMIN],
  MANAGE_ROLES: [ROLES.OWNER],
  SUSPEND_USERS: [ROLES.OWNER, ROLES.ADMIN],
  VIEW_ALL_USERS: [ROLES.OWNER, ROLES.ADMIN],
  CREATE_EVENTS: [ROLES.OWNER, ROLES.ADMIN, ROLES.FACILITATOR],
  EDIT_ANY_EVENT: [ROLES.OWNER, ROLES.ADMIN],
  DELETE_EVENTS: [ROLES.OWNER, ROLES.ADMIN],
  VIEW_ANALYTICS: [ROLES.OWNER, ROLES.ADMIN, ROLES.FACILITATOR],
  EXPORT_DATA: [ROLES.OWNER, ROLES.ADMIN],
  EXPORT_SENSITIVE_DATA: [ROLES.OWNER],
  MANAGE_BADGES: [ROLES.OWNER, ROLES.ADMIN],
  MANAGE_REWARDS: [ROLES.OWNER, ROLES.ADMIN],
  ADJUST_POINTS: [ROLES.OWNER, ROLES.ADMIN],
  CONFIGURE_SYSTEM: [ROLES.OWNER],
  VIEW_AUDIT_LOG: [ROLES.OWNER, ROLES.ADMIN]
};

/**
 * Determine if user is owner
 */
export function isOwner(user) {
  if (!user?.email) return false;
  return OWNER_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Get effective role
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
 * Middleware: Require authentication
 */
export async function requireAuth(base44) {
  const user = await base44.auth.me();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Middleware: Require specific permission
 */
export async function requirePermission(base44, permission) {
  const user = await requireAuth(base44);
  
  if (!hasPermission(user, permission)) {
    throw new Error(`Forbidden: ${permission} permission required`);
  }
  
  return user;
}

/**
 * Middleware: Require owner role
 */
export async function requireOwner(base44) {
  const user = await requireAuth(base44);
  
  if (!isOwner(user)) {
    throw new Error('Forbidden: Owner permission required');
  }
  
  return user;
}

/**
 * Check if user can access another user's data
 */
export function canAccessUserData(currentUser, targetUserEmail) {
  if (!currentUser || !targetUserEmail) return false;
  
  // User can access own data
  if (currentUser.email === targetUserEmail) return true;
  
  // Owners and admins can access any user data
  return hasPermission(currentUser, 'VIEW_ALL_USERS');
}

/**
 * Validate domain restriction (@intinc.com only)
 */
export function validateEmailDomain(email) {
  const ALLOWED_DOMAIN = 'intinc.com';
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Rate limiting helper (simple in-memory)
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];
  
  // Clean old requests
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);
  
  return true;
}