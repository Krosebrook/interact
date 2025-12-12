/**
 * AUTH GUARD
 * Protects routes requiring authentication
 */

import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageLoading } from '../../shared/ui/LoadingState';

export function AuthGuard({ children, redirectTo = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await base44.auth.me();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        if (redirectTo) {
          base44.auth.redirectToLogin(redirectTo);
        } else {
          base44.auth.redirectToLogin();
        }
      }
    };

    checkAuth();
  }, [redirectTo]);

  if (isAuthenticated === null) {
    return <PageLoading message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;