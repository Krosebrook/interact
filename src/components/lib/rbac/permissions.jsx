/**
 * RBAC PERMISSIONS SYSTEM (REFACTORED)
 * Centralized permission definitions and enforcement
 */

import { USER_ROLES } from '../../shared/constants';

// Permission Categories
export const PERMISSION_CATEGORIES = {
  EVENTS: 'events',
  USERS: 'users',
  TEAMS: 'teams',
  GAMIFICATION: 'gamification',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  RECOGNITION: 'recognition'
};

// Granular Permissions
export const PERMISSIONS = {
  // Events
  EVENTS_VIEW_ALL: 'events.view.all',
  EVENTS_VIEW_OWN: 'events.view.own',
  EVENTS_CREATE: 'events.create',
  EVENTS_UPDATE: 'events.update',
  EVENTS_DELETE: 'events.delete',
  EVENTS_SCHEDULE_BULK: 'events.schedule.bulk',
  
  // Users
  USERS_VIEW_ALL: 'users.view.all',
  USERS_VIEW_TEAM: 'users.view.team',
  USERS_VIEW_PII: 'users.view.pii',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_INVITE: 'users.invite',
  
  // Teams
  TEAMS_VIEW_ALL: 'teams.view.all',
  TEAMS_CREATE: 'teams.create',
  TEAMS_UPDATE: 'teams.update',
  TEAMS_DELETE: 'teams.delete',
  TEAMS_MANAGE_MEMBERS: 'teams.manage.members',
  
  // Gamification
  GAMIFICATION_VIEW_ALL: 'gamification.view.all',
  GAMIFICATION_CONFIGURE: 'gamification.configure',
  GAMIFICATION_AWARD_BADGES: 'gamification.award.badges',
  GAMIFICATION_AWARD_POINTS: 'gamification.award.points',
  
  // Analytics
  ANALYTICS_VIEW_COMPANY: 'analytics.view.company',
  ANALYTICS_VIEW_TEAM: 'analytics.view.team',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_INTEGRATIONS: 'settings.integrations',
  
  // Recognition
  RECOGNITION_SEND: 'recognition.send',
  RECOGNITION_VIEW_ALL: 'recognition.view.all',
  RECOGNITION_MODERATE: 'recognition.moderate'
};

// Role-to-Permissions Mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // Full access to everything
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.HR]: [
    PERMISSIONS.USERS_VIEW_ALL,
    PERMISSIONS.USERS_VIEW_PII,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.ANALYTICS_VIEW_COMPANY,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.RECOGNITION_VIEW_ALL,
    PERMISSIONS.RECOGNITION_MODERATE,
    PERMISSIONS.TEAMS_VIEW_ALL,
    PERMISSIONS.GAMIFICATION_VIEW_ALL
  ],
  
  [USER_ROLES.TEAM_LEAD]: [
    PERMISSIONS.EVENTS_VIEW_ALL,
    PERMISSIONS.USERS_VIEW_TEAM,
    PERMISSIONS.TEAMS_VIEW_ALL,
    PERMISSIONS.TEAMS_MANAGE_MEMBERS,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.RECOGNITION_SEND,
    PERMISSIONS.RECOGNITION_VIEW_ALL,
    PERMISSIONS.GAMIFICATION_VIEW_ALL
  ],
  
  [USER_ROLES.FACILITATOR]: [
    PERMISSIONS.EVENTS_VIEW_ALL,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.EVENTS_SCHEDULE_BULK,
    PERMISSIONS.USERS_VIEW_TEAM,
    PERMISSIONS.TEAMS_VIEW_ALL,
    PERMISSIONS.RECOGNITION_SEND,
    PERMISSIONS.RECOGNITION_VIEW_ALL,
    PERMISSIONS.GAMIFICATION_VIEW_ALL,
    PERMISSIONS.GAMIFICATION_AWARD_BADGES,
    PERMISSIONS.GAMIFICATION_AWARD_POINTS
  ],
  
  [USER_ROLES.PARTICIPANT]: [
    PERMISSIONS.EVENTS_VIEW_OWN,
    PERMISSIONS.RECOGNITION_SEND,
    PERMISSIONS.TEAMS_VIEW_ALL,
    PERMISSIONS.GAMIFICATION_VIEW_ALL
  ]
};

// Sensitive Data Fields by Entity
export const SENSITIVE_FIELDS = {
  User: ['salary', 'ssn', 'date_of_birth', 'home_address', 'emergency_contact'],
  UserProfile: ['emergency_contact', 'personal_phone'],
  AnalyticsSnapshot: ['individual_performance_data']
};

// Check Permission Helper
export function hasPermission(userRole, userType, requiredPermission) {
  // Admin always has access
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  // Map userType to role if no explicit role
  const effectiveRole = userRole || userType;
  const rolePermissions = ROLE_PERMISSIONS[effectiveRole] || [];
  
  return rolePermissions.includes(requiredPermission);
}

// Check Multiple Permissions
export function hasAnyPermission(userRole, userType, requiredPermissions = []) {
  return requiredPermissions.some(perm => hasPermission(userRole, userType, perm));
}

export function hasAllPermissions(userRole, userType, requiredPermissions = []) {
  return requiredPermissions.every(perm => hasPermission(userRole, userType, perm));
}

// Filter Sensitive Data
export function filterSensitiveFields(data, entityName, userRole, userType) {
  if (!data) return data;
  
  // Admin and HR can see everything
  if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.HR) {
    return data;
  }

  const sensitiveFields = SENSITIVE_FIELDS[entityName] || [];
  
  if (Array.isArray(data)) {
    return data.map(item => {
      const filtered = { ...item };
      sensitiveFields.forEach(field => delete filtered[field]);
      return filtered;
    });
  }

  const filtered = { ...data };
  sensitiveFields.forEach(field => delete filtered[field]);
  return filtered;
}

// Can View User Profile
export function canViewProfile(viewerRole, viewerType, profileVisibility, isSelf = false) {
  if (isSelf) return true;
  if (viewerRole === USER_ROLES.ADMIN) return true;
  
  if (profileVisibility === 'private') return false;
  if (profileVisibility === 'public') return true;
  
  // team_only - check if same team (requires team context)
  return false;
}

export default {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  ROLE_PERMISSIONS,
  SENSITIVE_FIELDS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  filterSensitiveFields,
  canViewProfile
};