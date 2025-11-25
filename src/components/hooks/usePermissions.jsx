import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMemo } from 'react';

/**
 * Hook for checking user permissions based on role assignments
 */
export function usePermissions(userEmail) {
  const { data: roleAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['role-assignments', userEmail],
    queryFn: () => userEmail 
      ? base44.entities.UserRoleAssignment.filter({ user_email: userEmail, is_active: true })
      : [],
    enabled: !!userEmail,
    staleTime: 60000
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list(),
    staleTime: 300000
  });

  // Merge permissions from all assigned roles
  const permissions = useMemo(() => {
    const defaultPermissions = {
      events: { create: false, view_all: false, view_own: true, edit_all: false, edit_own: false, delete: false, cancel: false },
      activities: { create: false, view: true, edit: false, delete: false },
      analytics: { view_basic: false, view_detailed: false, view_facilitator_metrics: false, export: false },
      teams: { create: false, manage_all: false, manage_own: false, invite_members: false },
      users: { view_all: false, manage_roles: false, invite: false },
      gamification: { manage_badges: false, manage_rewards: false, award_points: false }
    };

    if (!roleAssignments.length || !roles.length) return defaultPermissions;

    const mergedPermissions = { ...defaultPermissions };

    roleAssignments.forEach(assignment => {
      const role = roles.find(r => r.id === assignment.role_id);
      if (!role?.permissions) return;

      // Merge permissions (OR logic - any role granting permission wins)
      Object.keys(role.permissions).forEach(category => {
        if (!mergedPermissions[category]) mergedPermissions[category] = {};
        Object.keys(role.permissions[category]).forEach(permission => {
          if (role.permissions[category][permission]) {
            mergedPermissions[category][permission] = true;
          }
        });
      });
    });

    return mergedPermissions;
  }, [roleAssignments, roles]);

  // Get highest role for display
  const primaryRole = useMemo(() => {
    if (!roleAssignments.length || !roles.length) return null;
    
    let highestRole = null;
    let highestLevel = -1;

    roleAssignments.forEach(assignment => {
      const role = roles.find(r => r.id === assignment.role_id);
      if (role && (role.hierarchy_level || 0) > highestLevel) {
        highestLevel = role.hierarchy_level || 0;
        highestRole = role;
      }
    });

    return highestRole;
  }, [roleAssignments, roles]);

  // Permission check helpers
  const can = (category, action) => {
    return permissions[category]?.[action] || false;
  };

  const canAny = (category, actions) => {
    return actions.some(action => can(category, action));
  };

  const canAll = (category, actions) => {
    return actions.every(action => can(category, action));
  };

  return {
    permissions,
    primaryRole,
    roleAssignments,
    roles,
    isLoading: assignmentsLoading || rolesLoading,
    can,
    canAny,
    canAll,
    // Shorthand checks
    canCreateEvents: can('events', 'create'),
    canViewAllEvents: can('events', 'view_all'),
    canManageActivities: canAny('activities', ['create', 'edit', 'delete']),
    canViewAnalytics: canAny('analytics', ['view_basic', 'view_detailed']),
    canManageTeams: canAny('teams', ['create', 'manage_all']),
    canManageUsers: canAny('users', ['view_all', 'manage_roles']),
    canManageGamification: canAny('gamification', ['manage_badges', 'manage_rewards'])
  };
}