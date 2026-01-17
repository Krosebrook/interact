import React from 'react';
import LeaderboardSelector from '../components/leaderboard/LeaderboardSelector';

export default function Leaderboards() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <LeaderboardSelector />
    </div>
  );
}