import React from 'react';
import { useUserData } from '../components/hooks/useUserData';
import GamifiedLearningDashboard from '../components/learning/GamifiedLearningDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LearningDashboard() {
  const { user, loading } = useUserData(true);

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Learning & Development</h1>
        <p className="text-slate-600 mt-1">Grow your skills with gamified learning paths</p>
      </div>

      <GamifiedLearningDashboard userEmail={user?.email} />
    </div>
  );
}