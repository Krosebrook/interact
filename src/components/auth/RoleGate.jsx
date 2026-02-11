import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { canAccessRoute, requiresAuth, getDefaultRoute, PUBLIC_ROUTES } from './RouteConfig';
import { createPageUrl } from '../../utils';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ROLE GATE - Route-level access control
 * 
 * This component wraps protected routes and enforces RBAC.
 * It prevents redirect loops by:
 * 1. Only redirecting ONCE per route change
 * 2. Never redirecting on public routes during auth check
 * 3. Using deterministic redirect logic (no circular paths)
 */

export default function RoleGate({ children, pageName }) {
  const { authState, roleState, normalizedRole, isAuthenticated, isChecking, auditLog } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If still checking auth, don't redirect yet
    if (isChecking) {
      return;
    }

    // Public routes: allow access immediately (no auth required)
    if (PUBLIC_ROUTES.includes(pageName)) {
      return;
    }

    // Auth required but user is not authenticated
    if (!isAuthenticated) {
      auditLog('unauthorized_route_attempt', {
        route: pageName,
        auth_state: authState,
        attempted_url: location.pathname,
      });
      
      // Redirect to login with return URL
      const currentPath = location.pathname + location.search;
      base44.auth.redirectToLogin(currentPath);
      return;
    }

    // User is authenticated but role not resolved yet
    if (!roleState === 'resolved') {
      // Show loading, don't redirect
      return;
    }

    // Check if user has permission to access this route
    const hasAccess = canAccessRoute(pageName, normalizedRole);

    if (!hasAccess) {
      auditLog('unauthorized_route_attempt', {
        route: pageName,
        normalized_role: normalizedRole,
        auth_state: authState,
        role_state: roleState,
        attempted_url: location.pathname,
      });

      // Redirect to appropriate default route for this role
      const defaultRoute = getDefaultRoute(normalizedRole);
      navigate(createPageUrl(defaultRoute), { replace: true });
    }
  }, [pageName, authState, roleState, normalizedRole, isAuthenticated, isChecking, location, navigate, auditLog]);

  // Show loading spinner while checking auth (only on protected routes)
  if (isChecking && requiresAuth(pageName)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Verifying access..." />
      </div>
    );
  }

  // Show loading spinner while resolving role (only on protected routes)
  if (isAuthenticated && roleState !== 'resolved' && requiresAuth(pageName)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  // Render the protected content
  return children;
}