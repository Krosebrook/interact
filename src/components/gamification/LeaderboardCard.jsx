import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const rankColors = {
  Newcomer: "bg-slate-100 text-slate-700",
  Regular: "bg-blue-100 text-blue-700",
  Enthusiast: "bg-purple-100 text-purple-700",
  Champion: "bg-amber-100 text-amber-700",
  Legend: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
};

const positionIcons = {
  1: { icon: Trophy, color: "text-yellow-500" },
  2: { icon: Medal, color: "text-slate-400" },
  3: { icon: Award, color: "text-amber-600" }
};

export default function LeaderboardCard({ userStats, position, isCurrentUser }) {
  const PositionIcon = positionIcons[position]?.icon;
  const iconColor = positionIcons[position]?.color;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: position * 0.05 }}
    >
      <Card className={`p-4 hover:shadow-md transition-all ${
        isCurrentUser ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
      }`}>
        <div className="flex items-center gap-4">
          {/* Position */}
          <div className="flex-shrink-0 w-12 text-center">
            {position <= 3 ? (
              <PositionIcon className={`h-8 w-8 mx-auto ${iconColor}`} />
            ) : (
              <div className="text-2xl font-bold text-slate-400">#{position}</div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 truncate">
                {userStats.user_name}
                {isCurrentUser && (
                  <span className="text-xs text-indigo-600 ml-2">(You)</span>
                )}
              </h4>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={rankColors[userStats.rank] || rankColors.Newcomer}>
                {userStats.rank}
              </Badge>
              {userStats.badges_earned?.length > 0 && (
                <span className="text-xs text-slate-500">
                  🏅 {userStats.badges_earned.length} badges
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-indigo-600">
              {userStats.total_points}
            </div>
            <div className="text-xs text-slate-500">points</div>
            {userStats.current_streak > 0 && (
              <div className="text-xs text-orange-600 mt-1">
                🔥 {userStats.current_streak} streak
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {userStats.events_attended}
            </div>
            <div className="text-xs text-slate-500">Events</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {userStats.feedback_count}
            </div>
            <div className="text-xs text-slate-500">Feedback</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {userStats.best_streak}
            </div>
            <div className="text-xs text-slate-500">Best Streak</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}