/**
 * RBAC HOOK (REFACTORED)
 * Simplified RBAC implementation using permission system
 */

import { useMemo } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  filterSensitiveFields,
  canViewProfile
} from './permissions';

export function useRBAC() {
  const { user, isAdmin, isFacilitator, userType } = usePermissions();

  const rbac = useMemo(() => ({
    // Core permission checks
    can: (permission) => hasPermission(user?.role, userType, permission),
    canAny: (permissions) => hasAnyPermission(user?.role, userType, permissions),
    canAll: (permissions) => hasAllPermissions(user?.role, userType, permissions),
    
    // Data filtering
    filterSensitive: (data, entityName) => 
      filterSensitiveFields(data, entityName, user?.role, userType),
    
    // Profile visibility
    canViewProfile: (profileVisibility, isSelf = false) =>
      canViewProfile(user?.role, userType, profileVisibility, isSelf),
    
    // Convenience checks
    isAdmin,
    isFacilitator,
    isHR: user?.role === 'hr',
    isTeamLead: user?.role === 'team_lead' || userType === 'team_lead',
    isParticipant: userType === 'participant'
  }), [user, userType, isAdmin, isFacilitator]);

  return rbac;
}

export default useRBAC;