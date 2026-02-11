import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * AUTH STATE MACHINE
 * States: "checking" | "unauthenticated" | "authenticated"
 * Role States: "unknown" | "resolved"
 * 
 * This is the SINGLE SOURCE OF TRUTH for auth state across the app.
 * Prevents redirect loops by centralizing session management.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState('checking');
  const [roleState, setRoleState] = useState('unknown');
  const [normalizedRole, setNormalizedRole] = useState(null);
  const initRef = useRef(false);

  // Fetch user session - this is the ONLY place we check auth
  const { data: authData, isLoading, isError, error } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch (err) {
        // Not authenticated - this is normal, not an error
        return { user: null, isAuthenticated: false };
      }
    },
    staleTime: 60000, // Cache for 1 minute
    retry: false, // Don't retry failed auth checks
    refetchOnWindowFocus: true, // Re-check when user returns to tab
  });

  // Update auth state machine based on query results
  useEffect(() => {
    if (isLoading) {
      setAuthState('checking');
      setRoleState('unknown');
      return;
    }

    if (authData?.isAuthenticated) {
      setAuthState('authenticated');
      
      // Resolve normalized role
      const user = authData.user;
      const resolved = resolveRole(user);
      setNormalizedRole(resolved);
      setRoleState('resolved');

      // Audit: Log role resolution if role is unknown/fallback
      if (resolved === 'participant' && !user.user_type && user.role !== 'admin') {
        auditLog('role_unknown_fallback', {
          user_id: user.id,
          user_email: user.email,
          fields_present: {
            role: user.role,
            user_type: user.user_type,
          },
          resolved_role: resolved,
        });
      }
    } else {
      setAuthState('unauthenticated');
      setRoleState('unknown');
      setNormalizedRole(null);
    }

    initRef.current = true;
  }, [authData, isLoading]);

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
 * Priority: user.role === "admin" > user.user_type === "facilitator" > participant (default)
 */
function resolveRole(user) {
  if (!user) return null;
  
  // Priority 1: Admin role (highest privilege)
  if (user.role === 'admin') return 'admin';
  
  // Priority 2: Facilitator user_type
  if (user.user_type === 'facilitator') return 'facilitator';
  
  // Priority 3: Participant (default/least privilege)
  return 'participant';
}