/**
 * PERMISSION GATE COMPONENT
 * Conditional rendering based on permissions
 */

import React from 'react';
import { useRBAC } from './useRBAC';

export function PermissionGate({ 
  children, 
  permission,
  permissions,
  requireAll = false,
  fallback = null 
}) {
  const rbac = useRBAC();

  let hasAccess = false;

  if (permission) {
    hasAccess = rbac.can(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? rbac.canAll(permissions)
      : rbac.canAny(permissions);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

export default PermissionGate;