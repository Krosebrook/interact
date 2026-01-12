import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react';

/**
 * Rank badge component with special styling for top 3
 */
function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg" data-b44-sync="true" data-feature="leaderboard" data-component="leaderboardrow">
        <Trophy className="h-5 w-5 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg">
        <Medal className="h-5 w-5 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg">
        <Award className="h-5 w-5 text-white" />
      </div>
    );
  }
  
  return (
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
      {rank}
    </div>
  );
}

/**
 * Individual leaderboard row component
 */
export default function LeaderboardRow({ 
  user, 
  isCurrentUser, 
  showDetails = true,
  onViewProfile 
}) {
  const rowStyle = isCurrentUser 
    ? 'bg-int-orange/10 border-int-orange/30 ring-2 ring-int-orange/20' 
    : 'bg-white hover:bg-slate-50';

  return (
    <div 
      className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${rowStyle}`}
      onClick={() => onViewProfile?.(user.user_email)}
    >
      {/* Rank */}
      <RankBadge rank={user.rank} />

      {/* Avatar */}
      <div className="relative">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.user_name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-int-navy to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
            {user.user_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        
        {/* Level badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-int-orange text-white text-xs font-bold flex items-center justify-center border-2 border-white">
          {user.level}
        </div>
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold truncate ${isCurrentUser ? 'text-int-orange' : 'text-slate-900'}`}>
            {user.user_name}
            {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
          </span>
        </div>
        
        {showDetails && (
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
            {user.streak > 0 && (
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                {user.streak} day streak
              </span>
            )}
            {user.badges_count > 0 && (
              <span>🎖️ {user.badges_count} badges</span>
            )}
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="text-xl font-bold text-int-navy">
          {user.score.toLocaleString()}
        </div>
        {user.change !== undefined && user.change !== 0 && (
          <div className={`text-xs flex items-center justify-end gap-1 ${
            user.change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 ${user.change < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(user.change)}
          </div>
        )}
      </div>
    </div>
  );
}