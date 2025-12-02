import React from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { createPageUrl } from '../utils';
import RoleManagementSetup from '../components/admin/RoleManagementSetup';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RoleSetup() {
  const { user, loading, isAdmin } = useUserData(true, true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  const handleComplete = () => {
    window.location.href = createPageUrl('Settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <RoleManagementSetup onComplete={handleComplete} />
    </div>
  );
}