import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMemo } from 'react';

/**
 * Hook to check custom role permissions for the current user
 * Falls back to legacy role system (admin/facilitator/participant)
 */
export function useCustomPermissions(user) {
  // Fetch user's role assignments
  const { data: roleAssignments, isLoading } = useQuery({
    queryKey: ['user-role-assignments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const assignments = await base44.entities.UserRoleAssignment.filter({
        user_email: user.email
      });
      return assignments;
    },
    enabled: !!user?.email,
    staleTime: 300000 // 5 minutes
  });

  // Fetch custom roles for these assignments
  const { data: customRoles } = useQuery({
    queryKey: ['custom-roles-for-user', roleAssignments],
    queryFn: async () => {
      if (!roleAssignments || roleAssignments.length === 0) return [];
      const roleIds = roleAssignments.map(a => a.custom_role_id);
      const roles = await base44.entities.CustomRole.filter({
        id: { $in: roleIds },
        is_active: true
      });
      return roles;
    },
    enabled: !!roleAssignments && roleAssignments.length > 0,
    staleTime: 300000
  });

  // Merge permissions from all assigned roles
  const mergedPermissions = useMemo(() => {
    // Legacy admin check
    if (user?.role === 'admin') {
      return getAllPermissions(); // Admin gets everything
    }

    // If no custom roles, use legacy system
    if (!customRoles || customRoles.length === 0) {
      return getLegacyPermissions(user);
    }

    // Merge permissions from all roles (OR logic - if any role grants permission, user has it)
    const merged = {};
    customRoles.forEach(role => {
      if (role.permissions) {
        Object.keys(role.permissions).forEach(module => {
          if (!merged[module]) merged[module] = {};
          Object.keys(role.permissions[module]).forEach(action => {
            if (role.permissions[module][action]) {
              merged[module][action] = true;
            }
          });
        });
      }
    });

    return merged;
  }, [customRoles, user]);

  // Helper function to check specific permission
  const hasPermission = (module, action) => {
    if (user?.role === 'admin') return true;
    return mergedPermissions?.[module]?.[action] === true;
  };

  // Helper to check multiple permissions (AND logic)
  const hasAllPermissions = (checks) => {
    return checks.every(({ module, action }) => hasPermission(module, action));
  };

  // Helper to check if user has any of the permissions (OR logic)
  const hasAnyPermission = (checks) => {
    return checks.some(({ module, action }) => hasPermission(module, action));
  };

  return {
    permissions: mergedPermissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin: user?.role === 'admin',
    roleAssignments,
    customRoles,
    isLoading
  };
}

// Get all permissions (for admin)
function getAllPermissions() {
  return {
    activities: { view: true, create: true, edit: true, delete: true },
    events: { view: true, create: true, edit: true, delete: true, facilitate: true },
    channels: { view: true, create: true, edit: true, delete: true, moderate: true },
    recognition: { view: true, give: true, moderate: true },
    surveys: { view: true, create: true, view_results: true },
    teams: { view: true, create: true, manage_members: true, view_analytics: true },
    gamification: { view: true, manage_points: true, manage_badges: true, manage_rules: true },
    analytics: { view_personal: true, view_team: true, view_company: true, export_reports: true },
    users: { view: true, invite: true, edit: true, assign_roles: true, view_sensitive_data: true },
    settings: { view: true, edit_general: true, edit_integrations: true, edit_security: true }
  };
}

// Legacy permission mapping for backward compatibility
function getLegacyPermissions(user) {
  const userType = user?.user_type;

  if (userType === 'facilitator') {
    return {
      activities: { view: true, create: true, edit: true, delete: false },
      events: { view: true, create: true, edit: true, delete: false, facilitate: true },
      channels: { view: true, create: true, edit: true, delete: false, moderate: false },
      recognition: { view: true, give: true, moderate: false },
      surveys: { view: true, create: false, view_results: false },
      teams: { view: true, create: true, manage_members: true, view_analytics: true },
      gamification: { view: true, manage_points: false, manage_badges: false, manage_rules: false },
      analytics: { view_personal: true, view_team: true, view_company: false, export_reports: false },
      users: { view: true, invite: false, edit: false, assign_roles: false, view_sensitive_data: false },
      settings: { view: false, edit_general: false, edit_integrations: false, edit_security: false }
    };
  }

  // Default participant permissions
  return {
    activities: { view: true, create: false, edit: false, delete: false },
    events: { view: true, create: false, edit: false, delete: false, facilitate: false },
    channels: { view: true, create: false, edit: false, delete: false, moderate: false },
    recognition: { view: true, give: true, moderate: false },
    surveys: { view: true, create: false, view_results: false },
    teams: { view: true, create: false, manage_members: false, view_analytics: false },
    gamification: { view: true, manage_points: false, manage_badges: false, manage_rules: false },
    analytics: { view_personal: true, view_team: false, view_company: false, export_reports: false },
    users: { view: true, invite: false, edit: false, assign_roles: false, view_sensitive_data: false },
    settings: { view: false, edit_general: false, edit_integrations: false, edit_security: false }
  };
}