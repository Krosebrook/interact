import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Lightweight auth hook - use for simple auth checks
 * For more features (profile, points), use useUserData instead
 */
export function useAuth(requireAdmin = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (requireAdmin && currentUser.role !== 'admin') {
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [requireAdmin]);

  return { 
    user, 
    loading,
    isAdmin: user?.role === 'admin'
  };
}