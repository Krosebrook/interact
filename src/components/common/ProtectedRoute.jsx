import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute wrapper with auth check and returnTo support
 * 
 * @param {boolean} requireAdmin - Only admins can access
 * @param {boolean} requireFacilitator - Facilitators and admins can access
 * @param {boolean} requireParticipant - Only participants can access
 */
export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireFacilitator = false,
  requireParticipant = false
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        // Check role requirements
        if (requireAdmin && currentUser.role !== 'admin') {
          window.location.href = '/Dashboard';
          return;
        }
        
        if (requireFacilitator && !['admin', 'facilitator'].includes(currentUser.role) && currentUser.user_type !== 'facilitator') {
          window.location.href = '/ParticipantPortal';
          return;
        }
        
        if (requireParticipant && (currentUser.role === 'admin' || currentUser.user_type === 'facilitator')) {
          window.location.href = '/Dashboard';
          return;
        }
        
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        // Not authenticated - redirect to login with return URL
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        base44.auth.redirectToLogin(`?returnTo=${returnTo}`);
      }
    };

    checkAuth();
  }, [requireAdmin, requireFacilitator, requireParticipant]);

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Authenticating..." />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}