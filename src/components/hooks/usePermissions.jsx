/**
 * RBAC PERMISSIONS HOOK
 * Production-grade role-based access control with granular permission enforcement
 * Adheres to: Employee privacy, HR-only data access, feature-level permissions
 */

import { useMemo } from 'react';
import { useUserData } from './useUserData';

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

const PERMISSIONS = {
  // HR-exclusive permissions
  VIEW_SALARY_DATA: 'hr.view_salary',
  VIEW_ALL_EMPLOYEE_DATA: 'hr.view_all_employees',
  MANAGE_SURVEYS: 'hr.manage_surveys',
  VIEW_SURVEY_ANALYTICS: 'hr.view_analytics',
  MANAGE_WELLNESS_CHALLENGES: 'hr.manage_wellness',
  
  // Admin permissions
  MANAGE_USERS: 'admin.manage_users',
  MANAGE_ROLES: 'admin.manage_roles',
  CONFIGURE_SYSTEM: 'admin.configure',
  
  // Team Lead permissions
  VIEW_TEAM_ANALYTICS: 'lead.view_team_analytics',
  MANAGE_TEAM_EVENTS: 'lead.manage_events',
  
  // Employee permissions (all users)
  CREATE_RECOGNITION: 'employee.create_recognition',
  PARTICIPATE_SURVEYS: 'employee.participate_surveys',
  JOIN_WELLNESS: 'employee.join_wellness',
  VIEW_PUBLIC_RECOGNITION: 'employee.view_recognition',
  EDIT_OWN_PROFILE: 'employee.edit_profile',
};

// ============================================================================
// ROLE TO PERMISSIONS MAPPING
// ============================================================================

const ROLE_PERMISSIONS = {
  admin: [
    ...Object.values(PERMISSIONS), // Admins have all permissions
  ],
  
  hr: [
    PERMISSIONS.VIEW_SALARY_DATA,
    PERMISSIONS.VIEW_ALL_EMPLOYEE_DATA,
    PERMISSIONS.MANAGE_SURVEYS,
    PERMISSIONS.VIEW_SURVEY_ANALYTICS,
    PERMISSIONS.MANAGE_WELLNESS_CHALLENGES,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.CREATE_RECOGNITION,
    PERMISSIONS.PARTICIPATE_SURVEYS,
    PERMISSIONS.JOIN_WELLNESS,
    PERMISSIONS.VIEW_PUBLIC_RECOGNITION,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  team_lead: [
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.MANAGE_TEAM_EVENTS,
    PERMISSIONS.CREATE_RECOGNITION,
    PERMISSIONS.PARTICIPATE_SURVEYS,
    PERMISSIONS.JOIN_WELLNESS,
    PERMISSIONS.VIEW_PUBLIC_RECOGNITION,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  facilitator: [
    PERMISSIONS.MANAGE_TEAM_EVENTS,
    PERMISSIONS.CREATE_RECOGNITION,
    PERMISSIONS.PARTICIPATE_SURVEYS,
    PERMISSIONS.JOIN_WELLNESS,
    PERMISSIONS.VIEW_PUBLIC_RECOGNITION,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  participant: [
    PERMISSIONS.CREATE_RECOGNITION,
    PERMISSIONS.PARTICIPATE_SURVEYS,
    PERMISSIONS.JOIN_WELLNESS,
    PERMISSIONS.VIEW_PUBLIC_RECOGNITION,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
};

// ============================================================================
// PERMISSIONS HOOK
// ============================================================================

/**
 * Hook for checking user permissions
 * CRITICAL: Always calls useUserData with requireAuth=false to prevent redirects
 * @returns {Object} Permission checking utilities
 */
export function usePermissions() {
  // MUST call with requireAuth=false to avoid redirect logic affecting hook order
  const { user, isAdmin, userType } = useUserData(false, false, false, false);
  
  // Memoize user permissions based on role and user_type
  const userPermissions = useMemo(() => {
    if (!user) return [];
    
    // Admin role gets all permissions
    if (isAdmin) {
      return ROLE_PERMISSIONS.admin;
    }
    
    // HR user_type
    if (user.user_type === 'hr' || user.role === 'hr') {
      return ROLE_PERMISSIONS.hr;
    }
    
    // Team lead
    if (user.user_type === 'team_lead') {
      return ROLE_PERMISSIONS.team_lead;
    }
    
    // Facilitator
    if (user.user_type === 'facilitator') {
      return ROLE_PERMISSIONS.facilitator;
    }
    
    // Default to participant permissions
    return ROLE_PERMISSIONS.participant;
  }, [user, isAdmin]);
  
  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };
  
  /**
   * Check if user has ANY of the provided permissions
   */
  const hasAnyPermission = (...permissions) => {
    return permissions.some(p => userPermissions.includes(p));
  };
  
  /**
   * Check if user has ALL of the provided permissions
   */
  const hasAllPermissions = (...permissions) => {
    return permissions.every(p => userPermissions.includes(p));
  };
  
  /**
   * Check if user can view sensitive employee data
   */
  const canViewSalaryData = hasPermission(PERMISSIONS.VIEW_SALARY_DATA);
  const canViewAllEmployees = hasPermission(PERMISSIONS.VIEW_ALL_EMPLOYEE_DATA);
  
  /**
   * Check if user can manage surveys
   */
  const canManageSurveys = hasPermission(PERMISSIONS.MANAGE_SURVEYS);
  const canViewSurveyAnalytics = hasPermission(PERMISSIONS.VIEW_SURVEY_ANALYTICS);
  
  /**
   * Check if user can manage wellness challenges
   */
  const canManageWellness = hasPermission(PERMISSIONS.MANAGE_WELLNESS_CHALLENGES);
  
  /**
   * Check if user can manage system settings
   */
  const canConfigureSystem = hasPermission(PERMISSIONS.CONFIGURE_SYSTEM);
  const canManageRoles = hasPermission(PERMISSIONS.MANAGE_ROLES);
  
  /**
   * Check if user is owner of a resource (e.g., can edit their own recognition post)
   */
  const isOwner = (resourceUserId) => {
    return user && (user.id === resourceUserId || user.email === resourceUserId);
  };
  
  /**
   * Filter sensitive fields from data based on permissions
   */
  const filterSensitiveFields = (data, sensitiveFields = [
    'salary', 
    'ssn', 
    'address', 
    'years_at_company', 
    'previous_event_attendance',
    'engagement_stats',
    'achievements',
    'skill_levels',
    'personality_traits'
  ]) => {
    if (canViewAllEmployees) return data; // HR can see everything
    
    if (Array.isArray(data)) {
      return data.map(item => {
        const filtered = { ...item };
        sensitiveFields.forEach(field => {
          if (field in filtered) {
            delete filtered[field];
          }
        });
        return filtered;
      });
    }
    
    const filtered = { ...data };
    sensitiveFields.forEach(field => {
      if (field in filtered) {
        delete filtered[field];
      }
    });
    return filtered;
  };
  
  return {
    // Permission constants
    PERMISSIONS,
    
    // User context
    user,
    userPermissions,
    isAdmin,
    isFacilitator: user?.user_type === 'facilitator' || user?.role === 'admin',
    userType,
    
    // Permission checkers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    
    // Specific permission checks (for convenience)
    canViewSalaryData,
    canViewAllEmployees,
    canManageSurveys,
    canViewSurveyAnalytics,
    canManageWellness,
    canConfigureSystem,
    canManageRoles,
    
    // Data filtering
    filterSensitiveFields,
  };
}

// ============================================================================
// PERMISSION GUARD COMPONENT
// ============================================================================

/**
 * Component that conditionally renders children based on permissions
 * @example
 * <PermissionGuard requires={PERMISSIONS.VIEW_SALARY_DATA}>
 *   <SalaryChart />
 * </PermissionGuard>
 */
export function PermissionGuard({ 
  requires, 
  requiresAny, 
  requiresAll, 
  fallback = null, 
  children 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let hasAccess = false;
  
  if (requires) {
    hasAccess = hasPermission(requires);
  } else if (requiresAny) {
    hasAccess = hasAnyPermission(...requiresAny);
  } else if (requiresAll) {
    hasAccess = hasAllPermissions(...requiresAll);
  }
  
  return hasAccess ? children : fallback;
}

export default usePermissions;