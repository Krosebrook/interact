/**
 * RBAC GUARD HOOK
 * Production-grade permission checking with redirect
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { hasPermission, getEffectiveRole } from '../lib/rbac/roles';
import { toast } from 'sonner';

/**
 * Hook to enforce RBAC permissions on a page
 * Redirects if user lacks permission
 */
export function useRBACGuard(user, requiredPermission, redirectTo = 'Dashboard') {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      toast.error('Access denied: Insufficient permissions');
      navigate(createPageUrl(redirectTo));
    }
  }, [user, requiredPermission, redirectTo, navigate]);

  return {
    hasAccess: hasPermission(user, requiredPermission),
    effectiveRole: getEffectiveRole(user)
  };
}

/**
 * Hook to get all user permissions
 */
export function useUserPermissions(user) {
  if (!user) return {};

  return {
    canInviteUsers: hasPermission(user, 'INVITE_USERS'),
    canManageRoles: hasPermission(user, 'MANAGE_ROLES'),
    canSuspendUsers: hasPermission(user, 'SUSPEND_USERS'),
    canViewAllUsers: hasPermission(user, 'VIEW_ALL_USERS'),
    canCreateEvents: hasPermission(user, 'CREATE_EVENTS'),
    canEditAnyEvent: hasPermission(user, 'EDIT_ANY_EVENT'),
    canDeleteEvents: hasPermission(user, 'DELETE_EVENTS'),
    canViewAnalytics: hasPermission(user, 'VIEW_ANALYTICS'),
    canExportData: hasPermission(user, 'EXPORT_DATA'),
    canExportSensitiveData: hasPermission(user, 'EXPORT_SENSITIVE_DATA'),
    canManageBadges: hasPermission(user, 'MANAGE_BADGES'),
    canManageRewards: hasPermission(user, 'MANAGE_REWARDS'),
    canAdjustPoints: hasPermission(user, 'ADJUST_POINTS'),
    canConfigureSystem: hasPermission(user, 'CONFIGURE_SYSTEM'),
    canViewAuditLog: hasPermission(user, 'VIEW_AUDIT_LOG'),
    effectiveRole: getEffectiveRole(user)
  };
}