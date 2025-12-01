import React from 'react';
import { useUserData } from '../hooks/useUserData.jsx';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute wrapper for role-based access control
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
  const { user, loading } = useUserData(
    true, 
    requireAdmin, 
    requireFacilitator, 
    requireParticipant
  );

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading..." />;
  }

  return <>{children}</>;
}