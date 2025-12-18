/**
 * DYNAMIC ROLE-BASED PERMISSIONS HOOK
 * Loads roles and permissions from database for granular access control
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from './useUserData';

export function useRolePermissions() {
  const { user, isAdmin } = useUserData(false);

  // Fetch user's role assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['role-assignments', user?.email],
    queryFn: () => base44.entities.UserRoleAssignment.filter({ 
      user_email: user?.email,
      is_active: true 
    }),
    enabled: !!user?.email,
    staleTime: 60000
  });

  // Fetch all roles
  const { data: allRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list(),
    staleTime: 300000
  });

  // Get user's roles
  const userRoles = useMemo(() => {
    if (!user) return [];
    return assignments
      .map(a => allRoles.find(r => r.id === a.role_id))
      .filter(Boolean);
  }, [assignments, allRoles, user]);

  // Aggregate permissions from all assigned roles
  const permissions = useMemo(() => {
    if (!user) return {};
    
    // Admins get all permissions
    if (isAdmin) {
      return {
        events: { create: true, view_all: true, view_own: true, edit_all: true, edit_own: true, delete: true, cancel: true },
        activities: { create: true, view: true, edit: true, delete: true },
        analytics: { view_basic: true, view_detailed: true, view_facilitator_metrics: true, export: true },
        teams: { create: true, manage_all: true, manage_own: true, invite_members: true },
        users: { view_all: true, manage_roles: true, invite: true },
        gamification: { manage_badges: true, manage_rewards: true, award_points: true }
      };
    }

    // Merge permissions from all roles
    const merged = {};
    userRoles.forEach(role => {
      if (!role?.permissions) return;
      Object.entries(role.permissions).forEach(([category, perms]) => {
        if (!merged[category]) merged[category] = {};
        Object.entries(perms).forEach(([perm, value]) => {
          merged[category][perm] = merged[category][perm] || value;
        });
      });
    });

    return merged;
  }, [userRoles, user, isAdmin]);

  // Permission checker functions
  const can = (category, action) => {
    return permissions[category]?.[action] === true;
  };

  const canAny = (checks) => {
    return checks.some(([category, action]) => can(category, action));
  };

  const canAll = (checks) => {
    return checks.every(([category, action]) => can(category, action));
  };

  // Resource ownership check
  const isOwner = (resourceEmail) => {
    return user?.email === resourceEmail;
  };

  // Can edit resource (owner or has permission)
  const canEdit = (category, resourceEmail) => {
    if (isOwner(resourceEmail) && can(category, 'edit_own')) return true;
    return can(category, 'edit_all');
  };

  // Can view resource
  const canView = (category, resourceEmail) => {
    if (isOwner(resourceEmail) && can(category, 'view_own')) return true;
    return can(category, 'view_all');
  };

  // Get highest hierarchy level
  const hierarchyLevel = useMemo(() => {
    if (isAdmin) return 999;
    return Math.max(0, ...userRoles.map(r => r.hierarchy_level || 0));
  }, [userRoles, isAdmin]);

  return {
    permissions,
    userRoles,
    hierarchyLevel,
    can,
    canAny,
    canAll,
    isOwner,
    canEdit,
    canView,
    
    // Convenience shortcuts
    canCreateEvents: can('events', 'create'),
    canEditAllEvents: can('events', 'edit_all'),
    canDeleteEvents: can('events', 'delete'),
    canCreateActivities: can('activities', 'create'),
    canEditActivities: can('activities', 'edit'),
    canDeleteActivities: can('activities', 'delete'),
    canViewAnalytics: can('analytics', 'view_basic'),
    canManageUsers: can('users', 'manage_roles'),
    canManageGamification: can('gamification', 'manage_badges'),
  };
}