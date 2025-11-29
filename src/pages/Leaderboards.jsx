import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Leaderboard from '../components/leaderboard/Leaderboard';
import { Trophy } from 'lucide-react';

/**
 * Leaderboards page showing user rankings across different categories
 */
export default function Leaderboards() {
  const navigate = useNavigate();
  const { user, loading } = useUserData(true);

  const handleViewProfile = (email) => {
    navigate(`${createPageUrl('PublicProfile')}?email=${encodeURIComponent(email)}`);
  };

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading leaderboards..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-int-navy font-display">Leaderboards</h1>
            <p className="text-slate-600">See how you stack up against your colleagues</p>
          </div>
        </div>
      </div>

      {/* Leaderboard component */}
      <Leaderboard 
        currentUserEmail={user?.email}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
}