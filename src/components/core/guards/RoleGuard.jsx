/**
 * ROLE GUARD
 * Protects routes by required role/permission
 */

import React from 'react';
import { useRBAC } from '../../lib/rbac/useRBAC';
import { Navigate } from 'react-router-dom';
import { createPageUrl } from '../../../utils';
import { PageLoading } from '../../shared/ui/LoadingState';
import EmptyState from '../../shared/ui/EmptyState';

export function RoleGuard({ 
  children, 
  permission,
  permissions,
  requireAll = false,
  fallbackPage = 'Dashboard',
  showError = false
}) {
  const rbac = useRBAC();

  // Determine access
  let hasAccess = false;
  
  if (permission) {
    hasAccess = rbac.can(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? rbac.canAll(permissions)
      : rbac.canAny(permissions);
  }

  // Show error message
  if (!hasAccess && showError) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <EmptyState
          icon="alert"
          title="Access Denied"
          description="You don't have permission to view this page."
          actionLabel="Go to Dashboard"
          onAction={() => window.location.href = createPageUrl(fallbackPage)}
        />
      </div>
    );
  }

  // Redirect
  if (!hasAccess) {
    return <Navigate to={createPageUrl(fallbackPage)} replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;