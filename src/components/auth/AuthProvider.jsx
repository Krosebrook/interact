import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { isPublicIntentPage } from '../lib/routeIntent';

/**
 * AUTH STATE MACHINE
 * States: "checking" | "unauthenticated" | "authenticated"
 * Role States: "unknown" | "resolved"
 * 
 * This is the SINGLE SOURCE OF TRUTH for auth state across the app.
 * Prevents redirect loops by centralizing session management.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children, currentPageName }) {
  const [authState, setAuthState] = useState('checking');
  const [roleState, setRoleState] = useState('unknown');
  const [normalizedRole, setNormalizedRole] = useState(null);
  const initRef = useRef(false);

  // Fetch user session - this is the ONLY place we check auth
  const { data: authData, isLoading, isError, error } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      // Skip authentication for public intent pages
      if (isPublicIntentPage(currentPageName)) {
        console.log('[AUTH] Skipping auth check for public page:', currentPageName);
        return { user: null, isAuthenticated: false };
      }
      try {
        console.log('[AUTH] Checking authentication...');
        const user = await base44.auth.me();
        console.log('[AUTH] User authenticated:', user?.email);
        return { user, isAuthenticated: true };
      } catch (err) {
        // Not authenticated - this is normal, not an error
        console.log('[AUTH] Not authenticated:', err.message);
        return { user: null, isAuthenticated: false };
      }
    },
    staleTime: 60000, // Cache for 1 minute
    retry: false, // Don't retry failed auth checks
    refetchOnWindowFocus: true, // Re-check when user returns to tab
    refetchOnMount: 'always', // Always check on mount
  });

  // Update auth state machine based on query results
  useEffect(() => {
    if (isLoading) {
      setAuthState('checking');
      setRoleState('unknown');
      return;
    }

    if (isError) {
      console.error('[AUTH] Query failed:', error);
      setAuthState('unauthenticated');
      setRoleState('unknown');
      setNormalizedRole(null);
      return;
    }

    if (authData?.isAuthenticated) {
      setAuthState('authenticated');
      
      // Resolve normalized role
      const user = authData.user;
      const resolved = resolveRole(user);
      setNormalizedRole(resolved);
      setRoleState('resolved');

      // Audit: Log role resolution for tracking
      auditLog('role_resolved', {
        user_id: user.id,
        user_email: user.email,
        raw_role: user.role,
        user_type: user.user_type,
        resolved_role: resolved,
      });
    } else {
      setAuthState('unauthenticated');
      setRoleState('unknown');
      setNormalizedRole(null);
    }

    initRef.current = true;
  }, [authData, isLoading, isError, error]);

  // Audit logging helper
  const auditLog = (event, data) => {
    const timestamp = new Date().toISOString();
    console.warn(`[AUTH_AUDIT] ${event}`, { timestamp, ...data });
    
    // Future: Send to backend audit endpoint
    // base44.functions.invoke('auditLog', { event, data, timestamp });
  };

  const value = {
    authState,
    roleState,
    user: authData?.user || null,
    normalizedRole,
    isAuthenticated: authState === 'authenticated',
    isChecking: authState === 'checking',
    isRoleResolved: roleState === 'resolved',
    auditLog,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * ROLE RESOLVER
 * Normalizes Base44's user object to our RBAC model
 * Priority: admin > ops > hr > team_lead > employee > facilitator > participant
 */
function resolveRole(user) {
  if (!user) return null;
  
  // Direct role mapping (highest priority)
  if (user.role === 'admin') return 'admin';
  if (user.role === 'ops') return 'ops';
  if (user.role === 'hr') return 'hr';
  if (user.role === 'team_lead') return 'team_lead';
  if (user.role === 'employee') return 'employee';
  
  // Check user_type for backward compatibility
  if (user.user_type === 'facilitator' || user.role === 'facilitator') {
    return 'facilitator';
  }
  
  // Default to participant (safest lowest privilege)
  return 'participant';
}